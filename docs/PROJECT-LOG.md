# Human Code website: project log

A dated record of decisions, client feedback and operational changes, kept alongside the code so the reasoning survives beyond chat history and git messages. Newest entries at the bottom. Add an entry whenever something is decided or changed that the code alone wouldn't explain.

People: Phil Clarke (Loop, design and build), Ben (Human Code, client contact, ben@humancode.org.uk).

---

## 9 September 2026: brief, decisions, first build

**Inputs.** Client specification "HUMAN CODE WEBSITE SPECIFICATION" (v1, September 2026) and brand references in the Loop job folder "JN XXX Human Code". Two logo options supplied.

**Decisions agreed with Phil before building**

- Logo: the serif wordmark (hc-logo-2) over the geometric sans mark.
- Type: Adobe Fonts kit `https://use.typekit.net/slg7jgv.css`. Gelica for display, Figtree for body.
- Colour: off-white, near-black, and the logo peach `#f5a26c` as the single accent.
- Photography: placeholders for now. Large images black and white with raised contrast; small card images in colour.
- Booking: a form that emails a group. No calendar integration for launch.
- Analytics: GA4, behind a consent banner using Consent Mode.
- Prices shown as "+ VAT" everywhere.
- Writers, trainers, contact details, founding story and privacy policy: placeholders marked `TODO(client)`.
- Customer materials access stays off the website; delivered by shared link.
- Knowledge Hub seeded with AI-drafted articles from public sources, flagged for client review.
- Commit straight to main while only Phil and Claude are looking.

**Built.** Astro + Tailwind 4. Ten pages from the spec's minimum list plus thank-you, privacy and 404. Eight Knowledge Hub articles. Booking form with honeypot and validation. Sitemap, structured data, Open Graph. Deployed to Vercel initially. Header wordmark later enlarged by about 40% with no hover lift, at Phil's request.

## 10 September 2026: client feedback round 1

From "Changes to Human Code Website.docx". All nine points implemented:

1. A standard line separating the free 60-minute briefing from the paid five-hour programme, shown wherever the cascade is explained.
2. New For Leaders subheading (client copy, verbatim).
3. For Leaders cards reordered: working relationships before difficult situations.
4. Knowledge Hub headline changed to "Understand the facts. Know what to do."
5. Standard evidence block on every article (author, reviewer, published, last reviewed, category, sources). Search and category filter added to the hub.
6. "+ VAT" pricing format made consistent on every page.
7. Live online positioned as the standard delivery; new delivery card copy.
8. Body type up from 17px to 18px; card copy cut by roughly a fifth.
9. Pre-footer CTA replaced with "Ready to manage different brains better?"

Judgement calls flagged: "pre-footer CTA" read as the footer's top section; the client's em dash kept in their copy.

## 15 September 2026: hosting moved to Azure App Service

- Phil's hosting note (Azure App Service Web App, Linux, Node 22, North Europe; same model as More Money for Schools) reviewed. Vercel adapter removed.
- The site is now a purely static Astro build served by a zero-dependency `server.js`, copied in spirit from the MMFS reference. The booking form posts to `/api/book` on that server, which validates and emails via Resend's REST API with Node's built-in fetch. Resend is Loop's standard for form email.
- No CI access to Azure, so deployment is by SFTP. `npm run package` builds and assembles `deploy/` for upload. A GitHub Actions workflow exists but is manual-only and unused.
- Build-time settings (`SITE_URL`, `PUBLIC_GA_MEASUREMENT_ID`) come from a local `.env`. Run-time settings (`RESEND_API_KEY`, `FORM_FROM`, `FORM_TO`) are App Service application settings. Names match the School Improvement Solutions site.
- Staging URL: `humancode-live-akhhaahwhudcbte4.northeurope-01.azurewebsites.net`. server.js sends a noindex header on any azurewebsites.net host.
- Incident: live Resend values were typed into `.env.example` and swept into a local commit. GitHub push protection blocked the push, so the key never left Phil's machine. Template restored, commit rebuilt, history checked clean. Lesson: edit `.env`, never `.env.example`.
- Visitor confirmation email made best-effort, because Resend's test sender only delivers to the account owner and was failing the whole request.

## 17 September 2026: Resend domain

- `humancode.org.uk` added and verified in Resend. Advice given: set `FORM_FROM` on the domain, check API key scope, add a DMARC record, test from staging.
- Repo placeholders moved from `.co.uk` to `.org.uk`. Reply-to added to the confirmation email, pointing at the first `FORM_TO` address.

## 12 October 2026: company details

- Company number 15054013.
- Registered address: Denne Court Oad Street, Hengist Field, Borden, Sittingbourne, Kent, England, ME9 8LT.
- Phone 07590 692595.

## 14 October 2026: contact email

- All visitor-facing email addresses now ben@humancode.org.uk. `FORM_TO` on Azure to be changed to the same by Phil. Sender example remains bookings@humancode.org.uk.

## 25 November 2026: this log created

Created at Phil's request so the project's conversations are recorded. Future sessions should append here.

---

## Current state and open items

**Live on staging.** Full site, booking form emailing via Resend from the verified domain (once `FORM_FROM` and `FORM_TO` are set on Azure).

**Still placeholder, for the client**

- Legal name in the footer (currently "Human Code Training Ltd").
- Writers: names, photographs, biographies, qualifications (About page).
- Trainers: three placeholder profiles in `src/content/trainers/`.
- Founding story paragraph on About.
- Named reviewers on each Knowledge Hub article (Ben said he would write these).
- All photography (Unsplash placeholders; see `Photo.astro`).
- Privacy policy review by the client.
- `public/og.png` social sharing image: referenced but not yet created.

**Launch checklist**

- Custom domain and managed certificate on App Service; set `SITE_URL` in `.env` to the real domain and re-package.
- GA4 measurement ID into `.env`; mark `briefing_requested` as a conversion in GA4.
- `FORM_TO` to the client's address; DMARC record on the domain.
- Remove the Vercel project if still present.
