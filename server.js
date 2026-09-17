// Minimal server for Azure App Service (Node 22), no dependencies.
// Serves the built Astro site from ./dist and handles the booking form,
// which is emailed via Resend's REST API using Node's built-in fetch.
//
// Environment:
//   PORT              set by App Service (defaults to 8080 locally)
//   RESEND_API_KEY    Resend API key
//   FORM_TO        comma-separated recipients for booking requests
//   FORM_FROM      sender on the verified Resend domain, e.g. "Human Code <bookings@humancode.org.uk>"
//   SITE_ROOT         optional override for the static root (defaults to ./dist)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBooking, renderNotification, renderConfirmation } from './server/booking.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.env.SITE_ROOT || path.join(__dirname, 'dist'));
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY = 64 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
};

// Astro fingerprints everything under /_astro/, so those files can be cached
// forever. HTML is always revalidated; everything else for a day.
function cacheControl(urlPath, ext) {
  if (urlPath.startsWith('/_astro/')) return 'public, max-age=31536000, immutable';
  return ext === '.html' ? 'no-cache' : 'public, max-age=86400';
}

function baseHeaders(req) {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
  // Keep the azurewebsites.net staging address out of search results.
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  if (host.endsWith('.azurewebsites.net')) headers['X-Robots-Tag'] = 'noindex, nofollow';
  return headers;
}

function sendFile(req, res, status, filePath, urlPath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(status, {
    ...baseHeaders(req),
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl(urlPath, ext),
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(req, res, status, body) {
  res.writeHead(status, { ...baseHeaders(req), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function redirect(req, res, status, location) {
  res.writeHead(status, { ...baseHeaders(req), Location: location, 'Cache-Control': 'no-store' });
  res.end();
}

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function requestOrigin(req) {
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  return `${proto}://${host}`;
}

// ---------------------------------------------------------------------------
// Booking form
// ---------------------------------------------------------------------------

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('Payload too large'), { status: 413 })); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function sendViaResend(apiKey, message) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function deliver(booking, origin) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.FORM_TO || '').split(',').map((v) => v.trim()).filter(Boolean);
  const from = process.env.FORM_FROM || 'Human Code <onboarding@resend.dev>';
  const notification = renderNotification(booking);

  if (!apiKey || to.length === 0) {
    // Not configured: log so nothing is silently lost.
    console.warn('[book] RESEND_API_KEY / FORM_TO not set. Booking request:\n' + notification.text);
    return;
  }
  await sendViaResend(apiKey, { from, to, reply_to: booking.email, ...notification });

  // The confirmation to the requester is best-effort: the request has reached
  // the team, so a failure here (e.g. Resend's test sender, which only delivers
  // to the account owner) must not show the visitor an error.
  try {
    await sendViaResend(apiKey, { from, to: booking.email, reply_to: to[0], ...renderConfirmation(booking, origin) });
  } catch (err) {
    console.warn('[book] confirmation email not sent:', err.message);
  }
}

async function handleBooking(req, res) {
  const wantsJson = String(req.headers.accept || '').includes('application/json');
  const fail = (status, body, fallback) => (wantsJson ? sendJson(req, res, status, body) : redirect(req, res, 303, fallback));

  // Same-origin only. Browsers always send Origin on POST; a mismatch is not a real visitor.
  const origin = req.headers.origin;
  if (origin && origin !== requestOrigin(req)) return fail(403, { ok: false, message: 'Forbidden' }, '/book/?error=validation');

  let form;
  try {
    const raw = await readBody(req);
    const type = String(req.headers['content-type'] || '');
    form = type.includes('application/json') ? new Map(Object.entries(JSON.parse(raw))) : new URLSearchParams(raw);
  } catch (err) {
    const status = err && err.status === 413 ? 413 : 400;
    return fail(status, { ok: false, message: status === 413 ? 'Request too large' : 'Bad request' }, '/book/?error=validation');
  }

  // Honeypot: real browsers leave it empty.
  if (form.get('website')) return wantsJson ? sendJson(req, res, 200, { ok: true }) : redirect(req, res, 303, '/book/thanks/');

  const parsed = parseBooking(form);
  if (!parsed.ok) return fail(422, { ok: false, errors: parsed.errors }, '/book/?error=validation');

  try {
    await deliver(parsed.data, requestOrigin(req));
  } catch (err) {
    console.error('[book] delivery failed', err);
    return fail(500, { ok: false, message: 'We could not send your request. Please email us directly.' }, '/book/?error=delivery');
  }
  return wantsJson ? sendJson(req, res, 200, { ok: true, redirect: '/book/thanks/' }) : redirect(req, res, 303, '/book/thanks/');
}

// ---------------------------------------------------------------------------
// Static site
// ---------------------------------------------------------------------------

function handleStatic(req, res) {
  let url;
  try {
    url = new URL(req.url, 'http://x');
  } catch {
    res.writeHead(400, baseHeaders(req)).end('Bad request');
    return;
  }
  let urlPath;
  try { urlPath = decodeURIComponent(url.pathname); } catch { urlPath = url.pathname; }

  const resolved = path.normalize(path.join(ROOT, urlPath));
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
    res.writeHead(403, baseHeaders(req)).end('Forbidden');
    return;
  }

  if (isFile(resolved)) return sendFile(req, res, 200, resolved, urlPath);

  // Directory routes: /pricing/ -> dist/pricing/index.html. Astro's canonical
  // URLs carry the trailing slash, so send /pricing there permanently.
  const index = path.join(resolved, 'index.html');
  if (isFile(index)) {
    if (!urlPath.endsWith('/')) return redirect(req, res, 301, `${urlPath}/${url.search}`);
    return sendFile(req, res, 200, index, urlPath);
  }

  const notFound = path.join(ROOT, '404.html');
  if (isFile(notFound)) return sendFile(req, res, 404, notFound, urlPath);
  res.writeHead(404, { ...baseHeaders(req), 'Content-Type': 'text/plain' }).end('Not found');
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url.split('?')[0] === '/api/book') {
    handleBooking(req, res).catch((err) => {
      console.error('[book] unhandled', err);
      sendJson(req, res, 500, { ok: false, message: 'Something went wrong.' });
    });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...baseHeaders(req), Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  handleStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Human Code serving ${ROOT} on http://${HOST}:${PORT}`);
});
