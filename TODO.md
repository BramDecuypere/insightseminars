# TODO

- [ ] Create a dedicated email address for this organisation
- [ ] Ensure Mollie and Brevo are functional
- [ ] Go through the payment flow together
- [ ] Link it to the Google Drive process

## To confirm with the client

### Legal & company details
- [ ] Provide the legal company details for the footer (Studio → Instellingen): legal name, legal form, registered office, enterprise number (KBO) and RPR court. All are still empty.
- [ ] Supply the text for the **Privacy policy**, **Terms & conditions** and **Safeguarding / code of conduct** pages. All three are empty and the site shows "This text will be published soon".
- [ ] Review the parental consent text (Instellingen) against the final terms and safeguarding policy

### Programme content (Sanity)
- [ ] Official (international) names for Tiener Insight I, II and III
- [ ] Typical group size for each seminar (draft: "Meestal 20 tot 40 deelnemers"). It's empty on every programme.
- [ ] Confirm the duration and location of Insight III. It's currently "5 dagen", but the brief marked it [TE BEVESTIGEN].
- [ ] Addresses for the venues Stayokay Arnhem and 't Werkhuys
- [ ] Link to the international calendar: confirm whether `https://insightseminars.org` is the correct URL

### Accounts & access needed for go-live
- [ ] Mollie: account under the organisation, live API key and website profile approved
- [ ] Brevo: account, verified sender domain for `info@insightseminars.be`, NL/EN newsletter lists and double opt-in templates (IDs for `BREVO_LIST_ID_*` / `BREVO_DOI_TEMPLATE_ID_*`)
- [ ] Google: service account with access to the registrations sheet (`GOOGLE_SHEET_ID`)
- [ ] Confirm the addresses for sending, notifications and invoices (`EMAIL_FROM`, `NOTIFY_EMAIL`, `INVOICE_EMAIL`). They currently all default to `info@insightseminars.be`.
- [ ] Choose a payment mode for launch: `mollie` or `bank_transfer` (`PAYMENT_MODE`). Also confirm the IBAN and account holder, and the 7-day payment deadline for bank transfers.
- [ ] Sanity plan: decide whether to upgrade so "Vertaal velden" (AI Assist) works, or have the client translate by hand

## Pre-launch checklist

### Code fixes
- [ ] Fail loudly in production when Sheets, Mollie or Brevo keys are missing. Today a registration is silently dropped (the visitor still sees success) and the full row, including personal data, is written to the server log (`lib/integrations/sheets.ts`).
- [ ] Surface Brevo send failures (`lib/integrations/brevo.ts:59`). They are only logged now, so:
  - the Mollie webhook stamps `bevestiging_verstuurd_op` before the confirmation is actually sent
  - the pay-link cron clears `stuur_betaallink` even when the email failed
- [ ] Pay-link cron: one failing row aborts the whole run; continue with the remaining rows and report the failures
- [ ] (Low) Mollie webhook: guard against two concurrent "paid" callbacks sending the confirmation twice
- [ ] Cleanup: remove stale "Prompt N" comments (e.g. `components/register/steps.tsx:193`) and the `[v0]` log prefixes

### Vercel / Sanity setup
- [ ] Set all integration env vars in Vercel production (`MOLLIE_API_KEY`, `PAYMENT_LINK_SECRET`, `GOOGLE_*`, `BREVO_*`, `PAYMENT_MODE`, `NEXT_PUBLIC_SITE_URL`)
- [ ] Set `CRON_SECRET` in Vercel, otherwise the daily pay-link cron is always rejected
- [ ] Set `SANITY_REVALIDATE_SECRET` in Vercel and add the matching webhook in Sanity (→ `/api/revalidate`), so Studio changes show instantly instead of after up to 60 s
- [ ] Register the Mollie webhook URL for production (`/api/mollie/webhook`) and run one live test payment end to end
- [ ] Check that the registrations sheet has the expected header row (columns are mapped by header name)
