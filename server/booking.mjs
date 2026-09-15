// Booking form definition shared by the Astro page (build time) and server.js
// (run time). Plain JavaScript with no dependencies so server.js stays
// dependency-free on Azure App Service.

export const sectors = [
  'Schools and education',
  'Multi-academy trust',
  'Health and social care',
  'Charity and not-for-profit',
  'Professional services',
  'Technology',
  'Manufacturing, logistics and engineering',
  'Retail and hospitality',
  'Public sector',
  'Other',
];

export const staffBands = ['1–50', '51–100', '101–250', '251–500', '501–1,000', 'More than 1,000'];
export const siteBands = ['1', '2–5', '6–10', '11–25', 'More than 25'];

/**
 * @typedef {Object} Booking
 * @property {string} name
 * @property {string} jobTitle
 * @property {string} organisation
 * @property {string} email
 * @property {string} phone
 * @property {string} staff
 * @property {string} sites
 * @property {string} sector
 * @property {string} discuss
 * @property {string} source
 * @property {string} page
 */

/** @param {string | null | undefined} v */
const s = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * Validate a submitted form. `form` is anything with a `get(name)` method:
 * FormData or URLSearchParams.
 * @param {{ get(name: string): string | null | undefined | File }} form
 * @returns {{ ok: true, data: Booking } | { ok: false, errors: Record<string, string> }}
 */
export function parseBooking(form) {
  /** @type {Booking} */
  const data = {
    name: s(/** @type {string} */ (form.get('name'))),
    jobTitle: s(/** @type {string} */ (form.get('jobTitle'))),
    organisation: s(/** @type {string} */ (form.get('organisation'))),
    email: s(/** @type {string} */ (form.get('email'))),
    phone: s(/** @type {string} */ (form.get('phone'))),
    staff: s(/** @type {string} */ (form.get('staff'))),
    sites: s(/** @type {string} */ (form.get('sites'))),
    sector: s(/** @type {string} */ (form.get('sector'))),
    discuss: s(/** @type {string} */ (form.get('discuss'))).slice(0, 2000),
    source: s(/** @type {string} */ (form.get('source'))).slice(0, 200),
    page: s(/** @type {string} */ (form.get('page'))).slice(0, 200),
  };
  /** @type {Record<string, string>} */
  const errors = {};
  if (data.name.length < 2) errors.name = 'Please enter your name.';
  if (!data.jobTitle) errors.jobTitle = 'Please enter your job title.';
  if (!data.organisation) errors.organisation = 'Please enter your organisation.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a phone number.';
  if (!staffBands.includes(data.staff)) errors.staff = 'Please choose a number of employees.';
  if (!siteBands.includes(data.sites)) errors.sites = 'Please choose a number of sites.';
  if (!sectors.includes(data.sector)) errors.sector = 'Please choose a sector.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

/** @param {string} v */
const esc = (v) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

/** Build the notification email. @param {Booking} b */
export function renderNotification(b) {
  /** @type {[string, string][]} */
  const rows = [
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
  return { subject: `CEO briefing request: ${b.organisation} (${b.name})`, text, html };
}

/** Build the confirmation email to the requester. @param {Booking} b @param {string} origin */
export function renderConfirmation(b, origin) {
  return {
    subject: 'Your free 60-minute CEO briefing request',
    text: `Hello ${b.name},

Thank you for requesting a free 60-minute CEO briefing for ${b.organisation}. We will be in touch within one working day to arrange a time.

In the meantime you might like to read how Human Code works: ${origin}/how-it-works/

Human Code
Better management for different brains.`,
  };
}
