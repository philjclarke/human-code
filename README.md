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

### Deploying

Pushes to `main` run [.github/workflows/azure.yml](.github/workflows/azure.yml), which type-checks, builds, smoke-tests the server and deploys `dist/`, `server/`, `server.js` and `package.json` to the web app. The workflow needs, in the GitHub repo settings:

| Where | Name | Value |
| --- | --- | --- |
| Secret | `AZURE_WEBAPP_PUBLISH_PROFILE` | From the portal: web app Overview, Download publish profile |
| Variable | `AZURE_WEBAPP_NAME` | The web app's name |
| Variable | `SITE_URL` | Canonical URL once the domain exists |
| Variable | `PUBLIC_GA_MEASUREMENT_ID` | GA4 ID; leave unset to keep analytics off |

The GA4 ID is baked in at build time, which is why it lives in GitHub rather than Azure.

### App Service settings

- Configuration, Application settings: `RESEND_API_KEY`, `BOOKING_TO`, `BOOKING_FROM`, and `SCM_DO_BUILD_DURING_DEPLOYMENT=false`.
- Configuration, General settings: Startup Command `node /home/site/wwwroot/server.js`, HTTPS Only on, Always On on, minimum TLS 1.2.
- Custom domain and the free managed certificate when the domain is ready.

Until `RESEND_API_KEY` and `BOOKING_TO` are set, booking requests are written to the log stream and the visitor still sees the thank-you page. While the site is served from an `azurewebsites.net` address, server.js adds a noindex header so the staging URL stays out of search results.

### Deploying by SFTP instead

Because server.js has no dependencies, the SFTP route also works: run `npm run build` locally and upload `dist/`, `server/`, `server.js` and `package.json` to the root of `/home/site/wwwroot`, then restart the app.

## Environment variables

See [.env.example](.env.example). Build-time values are GitHub Actions variables; run-time values are App Service application settings.

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
