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
