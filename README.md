# Human Code website

Marketing site for Human Code: practical neurodiversity training for organisations.
Astro 7, Tailwind 4, deployed to Vercel.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321, with hot reload
npm run build    # static build into dist/
npm start        # serve dist/ with server.js on http://localhost:8080 (what Azure runs)
npm run check    # type-check .astro and .ts
```

## How it is hosted

The site is a static Astro build served by [server.js](server.js), a dependency-free Node server, on an Azure App Service Web App (Linux, Node 22, North Europe), following the same model as More Money for Schools. The one non-static piece is the booking form: server.js handles `POST /api/book`, validates it, and emails it through Resend's REST API. Nothing runs on Azure that isn't in this repo.

### Deploying by SFTP

Deployments go by SFTP, so the build happens on your machine:

1. Put `SITE_URL` and `PUBLIC_GA_MEASUREMENT_ID` in a local `.env` (copy `.env.example`). They are baked into the build, so set them before building.
2. Run `npm run package`. It builds the site and assembles a `deploy/` folder containing `dist/`, `server/`, `server.js` and `package.json`. Nothing else is needed on the server: server.js has no dependencies, so there is no `node_modules` to upload.
3. Upload the *contents* of `deploy/` to the root of `/home/site/wwwroot` (credentials: Deployment Center, FTPS credentials). Replace the existing `dist/` folder rather than merging into it, so stale hashed assets don't accumulate.
4. First time only: delete Azure's placeholder `hostingstart.html` if it is there.
5. Restart the app in the portal. Uploads don't take effect until the container restarts.

The Kudu console at `https://<app-name>.scm.azurewebsites.net` shows what actually landed on disk, and Log stream shows server.js's output, including booking requests when Resend isn't configured yet.

A GitHub Actions workflow at [.github/workflows/azure.yml](.github/workflows/azure.yml) can do the same build and deploy from CI. It is manual-only and unused unless Azure access is set up for GitHub; the secrets and variables it needs are listed at the top of the file.

### App Service settings

- Configuration, Application settings: `RESEND_API_KEY`, `BOOKING_TO`, `BOOKING_FROM`.
- Configuration, General settings: Startup Command `node /home/site/wwwroot/server.js`, HTTPS Only on, Always On on, minimum TLS 1.2.
- Custom domain and the free managed certificate when the domain is ready.

Until `RESEND_API_KEY` and `BOOKING_TO` are set, booking requests are written to the log stream and the visitor still sees the thank-you page. While the site is served from an `azurewebsites.net` address, server.js adds a noindex header so the staging URL stays out of search results.

## Environment variables

See [.env.example](.env.example). Build-time values go in a local `.env` before packaging; run-time values are App Service application settings.

## Where things live

- `src/data/site.ts`: prices, CTA labels, navigation, cascade stages, contact details. Change commercial facts here.
- `src/content/knowledge/*.mdx`: Knowledge Hub articles. Frontmatter is validated by `src/content.config.ts`.
- `src/content/trainers/*.md`: trainer profiles.
- `server.js` and `server/booking.mjs`: the Node server and the booking form validation and email templates, shared with the Astro booking page.
- `src/styles/global.css`: design tokens (colours, type scale, lift animation), buttons, cards, prose.
- `src/components/`: shared UI. `Band` is the horizontal section wrapper; `SectionHead` the eyebrow + heading pattern.

## Adding a Knowledge Hub article

Create `src/content/knowledge/<slug>.mdx` with the frontmatter used by the existing articles (title, summary, category, principle, author, published, reviewed, sources). Use the question-led headings: What is it? / What might it mean at work? / Possible strengths / Possible difficulties / What can help? / What should you never assume? / What can managers do? Set `draft: true` to keep it out of the build.

## Analytics events

- `briefing_cta_click` fires on any element with `data-cta="briefing"`, with `page_path` and `cta_text`.
- `briefing_requested` fires on `/book/thanks/`. Mark it as a conversion in GA4.

## Placeholders to replace before launch

Search the codebase for `TODO(client)` and `Placeholder`. They cover: writer and trainer names, biographies and qualifications; the founding story on About; photography (Unsplash placeholders, see `Photo.astro`); legal entity, address, company number, email and phone in `site.ts`; privacy policy review; named reviewers on Knowledge Hub articles.
