# Insight Seminars België

Bilingual (Dutch/English) marketing and registration site for Insight Seminars
in Flanders. Public content pages, a full seminar registration flow with
payments, a newsletter, and an embedded Sanity Studio for the editors.

This README is for developers. The content editors' guide (in Dutch) lives in
[`docs/STUDIO-HANDLEIDING.md`](docs/STUDIO-HANDLEIDING.md).

## Stack

- **Next.js 16** (App Router, React 19, Turbopack) — TypeScript throughout.
- **Tailwind CSS v4** (theme tokens in `app/globals.css`, no `tailwind.config`).
- **next-intl** for `nl` (default) and `en`, with localized pathnames.
- **Sanity** headless CMS, embedded at `/studio`.
- **Google Sheets** as the registration datastore (no customer DB).
- **Brevo** for transactional email and the double opt-in newsletter.
- **Mollie** for payments, with a bank-transfer fallback mode.
- **Vercel** for hosting, Web Analytics, and Cron.
- **Vitest** for unit tests, **ESLint** (flat config) + **tsc** for static checks.

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000  (redirects to /nl)
```

The app runs without any integration keys: every integration degrades to
logging instead of a live call (see `lib/env.ts`), and the content layer falls
back to built-in mock content when Sanity is not configured. Add the keys from
[Environment variables](#environment-variables) to enable the real services.

## Project structure

```
app/
  [locale]/            Localized pages (home, about, seminars, teens, agenda,
                       faq, contact, links, legal, register, pay, newsletter)
  api/
    mollie/webhook     Mollie payment status webhook
    revalidate         Sanity publish -> cache revalidation webhook
    cron/send-pay-links Scheduled pay-link reminder job
    event/[slug]/ics   Calendar (.ics) download per event
  actions/             Cross-page server actions (newsletter)
components/            UI, split by area (site, register, layout, home, ui)
i18n/                  next-intl routing + localized pathnames
lib/
  content/             Content layer: Sanity queries + mock fallback
  registration/        Registration schemas + submit/side-effects
  forms/               Contact + newsletter schemas
  integrations/        Brevo, Google Sheets, Mollie clients
  domain/              Pricing, dates, OGM, business rules
  legacy-redirects.ts  Old insightseminars.nl -> .be path map
  env.ts               Zod-validated environment
sanity/                Schema types, client, Studio structure
scripts/               seed.ts (CMS seeding), check-i18n.ts (parity gate)
messages/              nl.json / en.json translation catalogs
docs/                  Dutch Studio handleiding for editors
emails/ + lib/emails/  React Email templates
```

## Environment variables

Validated in `lib/env.ts`. Integration keys are optional in development;
production should set all that apply. See brief §8.6.

### Site

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (canonicals, JSON-LD, absolute links) | `https://insightseminars.be` |

### Sanity (CMS)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project id (enables live content; without it the mock is used) |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset, e.g. `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | API date, e.g. `2024-10-01` |
| `SANITY_API_READ_TOKEN` | Read token (needed once the dataset is private) |
| `SANITY_REVALIDATE_SECRET` | Shared secret for the `/api/revalidate` webhook |

### Google Sheets (registration store)

| Variable | Purpose |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-account email with edit access to the sheet |
| `GOOGLE_PRIVATE_KEY` | Service-account private key (escaped newlines) |
| `GOOGLE_SHEET_ID` | Target spreadsheet id |

### Brevo (email + newsletter)

| Variable | Purpose | Example |
|---|---|---|
| `BREVO_API_KEY` | Brevo API key | |
| `EMAIL_FROM` | Sender | `Insight Seminars België <info@insightseminars.be>` |
| `NOTIFY_EMAIL` | Internal notifications (contact form, registrations) | `info@insightseminars.be` |
| `BREVO_LIST_ID_NL` / `BREVO_LIST_ID_EN` | Newsletter lists | `3` / `4` |
| `BREVO_DOI_TEMPLATE_ID_NL` / `_EN` | Double opt-in templates | `5` / `6` |

### Payments (Mollie)

| Variable | Purpose | Example |
|---|---|---|
| `PAYMENT_MODE` | `mollie` or `bank_transfer` | `bank_transfer` until Mollie is approved |
| `MOLLIE_API_KEY` | Mollie key | `test_…` then `live_…` |
| `PAYMENT_LINK_SECRET` | HMAC secret for signed pay links | 32+ random chars |
| `CRON_SECRET` | Protects the send-pay-links cron | 32+ random chars |
| `INVOICE_EMAIL` | Fallback for invoice requests (if not set in CMS) | `info@insightseminars.be` |

### Optional

| Variable | Purpose |
|---|---|
| `DEEPL_API_KEY` | Optional NL→EN translation fallback (brief Prompt 4b) |

## Content layer

`lib/content` exposes typed getters (`getSettings`, program/event/etc.) used by
the pages. It reads from Sanity when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set and
otherwise serves the mock content, so pages render identically in both modes.

- **Editing:** `/studio` (embedded Sanity Studio, Dutch locale).
- **Type generation:** `pnpm typegen` (extracts the schema and regenerates
  `sanity.types.ts`). Run after schema changes.
- **Seeding:** `pnpm seed` migrates the mock content into a fresh Sanity
  dataset. Requires the Sanity env vars and a write token.

## Webhooks and scheduled jobs

| Endpoint | Trigger | Auth |
|---|---|---|
| `POST /api/mollie/webhook` | Mollie payment status change | Mollie payment id is re-fetched server-side; handler is idempotent |
| `POST /api/revalidate` | Sanity document publish | `SANITY_REVALIDATE_SECRET` signature |
| `GET /api/cron/send-pay-links` | Vercel Cron | `CRON_SECRET` (Bearer) |

Configure the Sanity webhook to point at `https://<host>/api/revalidate` with
the shared secret. Configure the Vercel Cron schedule for the pay-links job in
the Vercel project settings.

## Payments: switching PAYMENT_MODE

- `PAYMENT_MODE=bank_transfer` (default): registrations that require payment
  show a structured bank transfer with a valid Belgian OGM/communication; no
  Mollie call is made. Use this until the Mollie account is approved.
- `PAYMENT_MODE=mollie`: paid registrations create a Mollie payment and redirect
  to the hosted checkout; the webhook settles status and the confirmation page
  polls until it resolves. Set `MOLLIE_API_KEY` (`test_…` first) and
  `PAYMENT_LINK_SECRET`.

Test all four Mollie outcomes (paid, failed, cancelled, expired) in test mode
and confirm the webhook is idempotent before going live.

## Legacy redirects

`lib/legacy-redirects.ts` holds the typed map from old `insightseminars.nl`
paths to the new `.be` URLs. `next.config.ts` emits host-based 301s for
`insightseminars.nl` and `www.insightseminars.nl` (trailing-slash tolerant,
appending `?from=nl`, with a catch-all to `/nl`). The map is covered by
`lib/legacy-redirects.test.ts`. Add new mappings there.

## Internationalization

- Locales `nl` (default) and `en`; routing and the localized path table live in
  `i18n/`. `/` redirects to `/nl` and no locale cookie is set.
- Copy lives in `messages/nl.json` and `messages/en.json`. The two files must
  have identical keys — `pnpm check:i18n` enforces this and runs automatically
  before every `build` (`prebuild`), failing the build on any divergence.

## Security headers

Baseline response headers are set in `next.config.ts`: `X-Content-Type-Options`,
`Referrer-Policy`, `Strict-Transport-Security`, `X-Frame-Options` (omitted on
`/studio` so the Studio can frame itself), a `Permissions-Policy`, and a
`Content-Security-Policy-Report-Only`. Tighten and switch the CSP to enforcing
once report data confirms no legitimate resource is blocked.

## Scripts and quality gates

```bash
pnpm dev            # dev server
pnpm build          # runs check:i18n (prebuild) then next build
pnpm start          # serve the production build
pnpm lint           # ESLint (flat config, next/core-web-vitals + typescript)
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
pnpm check:i18n     # nl/en key parity (also part of prebuild)
pnpm seed           # seed Sanity from mock content
pnpm typegen        # regenerate Sanity types
```

Before deploying, all of `pnpm check:i18n`, `pnpm typecheck`, `pnpm lint`,
`pnpm test`, and `pnpm build` should pass.

## Deploying (Vercel)

1. Import the repo into Vercel; the framework preset is Next.js.
2. Add the environment variables above for Preview and Production.
3. Set the Cron schedule for `GET /api/cron/send-pay-links` and its
   `CRON_SECRET`.
4. In Sanity, add the deploy webhook to `POST /api/revalidate` with
   `SANITY_REVALIDATE_SECRET`.
5. In Brevo, authenticate the sender domain (SPF, DKIM, DMARC) and verify the
   double opt-in flow in both languages.
6. Point production DNS for `insightseminars.be`; keep `insightseminars.nl`
   pointed at the app so the legacy 301s fire.
