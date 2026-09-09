import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { parseBooking, type Booking } from '@/lib/booking';

export const prerender = false;

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function renderEmail(b: Booking) {
  const rows: [string, string][] = [
    ['Name', b.name],
    ['Job title', b.jobTitle],
    ['Organisation', b.organisation],
    ['Email', b.email],
    ['Phone', b.phone],
    ['Number of employees', b.staff],
    ['Number of sites', b.sites],
    ['Sector', b.sector],
    ['Wants to discuss', b.discuss || '—'],
    ['How they heard about us', b.source || '—'],
    ['Booked from page', b.page || '—'],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<h2 style="font-family:Georgia,serif">New CEO briefing request</h2>
<table style="font-family:system-ui,sans-serif;font-size:15px;border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:6px 0"><strong>${esc(v).replace(/\n/g, '<br>')}</strong></td></tr>`).join('\n')}
</table>`;
  return { text, html };
}

async function deliver(b: Booking, origin: string) {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = (import.meta.env.BOOKING_TO ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const from = import.meta.env.BOOKING_FROM ?? 'Human Code <onboarding@resend.dev>';
  const { text, html } = renderEmail(b);

  if (!apiKey || to.length === 0) {
    // Not configured yet: log so nothing is silently lost in development.
    console.warn('[book] RESEND_API_KEY / BOOKING_TO not set. Booking request:\n' + text);
    return;
  }
  const resend = new Resend(apiKey);
  const subject = `CEO briefing request: ${b.organisation} (${b.name})`;
  const { error } = await resend.emails.send({ from, to, replyTo: b.email, subject, text, html });
  if (error) throw new Error(error.message);

  // Confirmation to the requester.
  await resend.emails.send({
    from,
    to: b.email,
    subject: 'Your free 60-minute CEO briefing request',
    text: `Hello ${b.name},\n\nThank you for requesting a free 60-minute CEO briefing for ${b.organisation}. We will be in touch within one working day to arrange a time.\n\nIn the meantime you might like to read how Human Code works: ${origin}/how-it-works/\n\nHuman Code\nBetter management for different brains.`,
  });
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');

  // Honeypot: real browsers leave this empty.
  if (typeof form.get('website') === 'string' && (form.get('website') as string).length > 0) {
    return wantsJson ? Response.json({ ok: true }) : redirect('/book/thanks/', 303);
  }

  const parsed = parseBooking(form);
  if (!parsed.ok) {
    return wantsJson
      ? Response.json({ ok: false, errors: parsed.errors }, { status: 422 })
      : redirect('/book/?error=validation', 303);
  }

  try {
    await deliver(parsed.data, new URL(request.url).origin);
  } catch (err) {
    console.error('[book] delivery failed', err);
    return wantsJson
      ? Response.json({ ok: false, message: 'We could not send your request. Please email us directly.' }, { status: 500 })
      : redirect('/book/?error=delivery', 303);
  }

  return wantsJson ? Response.json({ ok: true, redirect: '/book/thanks/' }) : redirect('/book/thanks/', 303);
};
