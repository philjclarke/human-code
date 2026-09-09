# Human Code website

Marketing site for Human Code: practical neurodiversity training for organisations.
Astro 7, Tailwind 4, deployed to Vercel.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build (Vercel adapter)
npm run check    # type-check .astro and .ts
```

`astro preview` does not work with the Vercel adapter; use `npm run dev` or a Vercel preview deployment.

## Environment variables

Copy `.env.example` to `.env` locally and set the same keys in the Vercel project.

| Key | Purpose |
| --- | --- |
| `SITE_URL` | Canonical site URL. Falls back to Vercel's production URL. |
| `PUBLIC_GA_MEASUREMENT_ID` | GA4 ID. Analytics and the consent banner only render when set. |
| `RESEND_API_KEY` | Resend API key for booking emails. |
| `BOOKING_TO` | Comma-separated recipients for booking requests. |
| `BOOKING_FROM` | From address. The domain must be verified in Resend. |

Until `RESEND_API_KEY` and `BOOKING_TO` are set, booking requests are logged to the server console and the visitor still sees the thank-you page.

## Where things live

- `src/data/site.ts`: prices, CTA labels, navigation, cascade stages, contact details. Change commercial facts here.
- `src/content/knowledge/*.mdx`: Knowledge Hub articles. Frontmatter is validated by `src/content.config.ts`.
- `src/content/trainers/*.md`: trainer profiles.
- `src/pages/api/book.ts`: the one server endpoint. Validates, honeypots, emails via Resend.
- `src/styles/global.css`: design tokens (colours, type scale, lift animation), buttons, cards, prose.
- `src/components/`: shared UI. `Band` is the horizontal section wrapper; `SectionHead` the eyebrow + heading pattern.

## Adding a Knowledge Hub article

Create `src/content/knowledge/<slug>.mdx` with the frontmatter used by the existing articles (title, summary, category, principle, author, published, reviewed, sources). Use the question-led headings: What is it? / What might it mean at work? / Possible strengths / Possible difficulties / What can help? / What should you never assume? / What can managers do? Set `draft: true` to keep it out of the build.

## Analytics events

- `briefing_cta_click` fires on any element with `data-cta="briefing"`, with `page_path` and `cta_text`.
- `briefing_requested` fires on `/book/thanks/`. Mark it as a conversion in GA4.

## Placeholders to replace before launch

Search the codebase for `TODO(client)` and `Placeholder`. They cover: writer and trainer names, biographies and qualifications; the founding story on About; photography (Unsplash placeholders, see `Photo.astro`); legal entity, address, company number, email and phone in `site.ts`; privacy policy review; named reviewers on Knowledge Hub articles.
