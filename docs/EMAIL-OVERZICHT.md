# E-mails bij inschrijvingen — overzicht

Dit document beschrijft welke e-mails de website automatisch verstuurt, naar wie en wanneer. Onderaan staan de keuzes die we nog samen moeten maken.

## Waarom kreeg je bij je testinschrijving niets?

Het versturen van e-mails is nog niet geactiveerd. De website verstuurt mails via **Brevo**. Zolang de Brevo-sleutel niet in de instellingen van de website staat, wordt elke e-mail overgeslagen (er verschijnt dan alleen een regel in het technische logboek). Je inschrijving zelf is wel gelukt.

Wat er nog moet gebeuren om dit te activeren (technisch, door Bram):

1. De Brevo API-sleutel (`BREVO_API_KEY`) toevoegen aan de productie-omgeving.
2. Het afzenderdomein **insightseminars.be** verifiëren in Brevo (DKIM- en DMARC-records in de DNS). Zonder die verificatie weigert Brevo de mails of komen ze in de spam terecht.
3. Controleren dat de koppeling met de Google Sheet actief is (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`). Zonder die koppeling komt een inschrijving niet in de Sheet terecht.
4. Een testinschrijving doen per type hieronder en nakijken dat beide mails (deelnemer + Insight) aankomen.

## Afzender en ontvanger bij Insight

| | Huidige instelling |
|---|---|
| Afzender van alle mails | Insight Seminars België &lt;info@insightseminars.be&gt; |
| Antwoorden van deelnemers gaan naar | info@insightseminars.be (het afzenderadres) |
| Interne melding bij een nieuwe inschrijving | info@insightseminars.be |

Deelnemers krijgen de mail in de taal waarin ze zich inschreven (Nederlands of Engels). De interne melding is altijd in het Nederlands.

## Welke mail gaat wanneer naar wie?

### Bij het inschrijven

| Situatie | Mail naar de deelnemer | Mail naar Insight |
|---|---|---|
| Gratis activiteit | "Je plaats voor … is bevestigd" | "Nieuwe inschrijving: …" |
| Betalen met overschrijving | "Nog één stap voor je inschrijving" — met rekeningnummer, gestructureerde mededeling en uiterste betaaldatum | "Nieuwe inschrijving: …" |
| Activiteit met "later betalen" | "Je inschrijving is ontvangen" — met persoonlijke betaallink (en overschrijvingsgegevens als die toegelaten zijn) | "Nieuwe inschrijving: …" |
| Deelnemer geeft een eerder voorschot of sponsoring op | "We hebben je inschrijving ontvangen" — Insight controleert eerst het bedrag | "Nieuwe inschrijving: …" (status *te controleren*) |
| Activiteit is volzet | "Je staat op de wachtlijst" | "Nieuwe inschrijving: …" (status *wachtlijst*) |
| Online betalen (Mollie) | Nog geen mail: de deelnemer gaat meteen naar de betaalpagina | "Nieuwe inschrijving: …" (status *wacht op betaling*) |
| Gratis infosessie of workshop | "Je bent ingeschreven voor …" — met de link naar de online sessie en een agenda-uitnodiging (.ics) | "Nieuwe inschrijving: …" (infosessie) |

**Tieners:** de mail gaat naar de ouder of voogd die het formulier invulde, niet naar de tiener. Het ondertekende toestemmingsformulier (pdf) zit als bijlage bij de mail aan de ouder en bij de interne melding.

**Nieuwsbrief:** wie bij de infosessie "ja" aanvinkt voor de nieuwsbrief, krijgt daarnaast een aparte bevestigingsmail van Brevo (dubbele opt-in).

### Na het inschrijven

| Moment | Mail naar de deelnemer | Mail naar Insight |
|---|---|---|
| Online betaling (Mollie) volledig betaald | "Je plaats voor … is bevestigd" | "Nieuwe inschrijving: … (betaald)" |
| Online voorschot betaald, rest staat nog open | "Je voorschot is ontvangen" | — |
| Insight vinkt in de Sheet **stuur_betaallink** aan | "Je betaallink voor …" — elke ochtend rond 7–8 u verstuurd | — |

Voorbeelden van elke mail (met verzonnen gegevens) zijn beschikbaar als losse HTML-bestanden; vraag ze aan Bram als je ze wil doorlezen.

## Wat de website (nog) niet automatisch doet

- **Overschrijving ontvangen:** als het geld op de rekening staat, wordt er geen bevestigingsmail verstuurd. Insight past de status in de Sheet aan en laat de deelnemer zelf iets weten.
- **Online betaling afgebroken:** wie de Mollie-betaalpagina sluit zonder te betalen, krijgt geen mail. De inschrijving staat in de Sheet als *wacht op betaling*; Insight kan de betaallink sturen via **stuur_betaallink**.
- **Herinneringen** (bv. een paar dagen voor de start) worden niet verstuurd.
- **Online voorschot:** Insight krijgt hiervan geen aparte melding; het staat wel in de Sheet.

## Keuzes voor Insight

1. **Afzender:** blijft dit *Insight Seminars België &lt;info@insightseminars.be&gt;*, of liever een ander adres (bv. inschrijvingen@…)?
2. **Interne meldingen:** naar info@insightseminars.be, of naar een of meer andere adressen?
3. **Antwoorden:** mogen antwoorden van deelnemers naar hetzelfde adres gaan, of naar iemand specifiek?
4. **Overschrijving ontvangen:** willen jullie hiervoor een automatische bevestigingsmail (bv. door in de Sheet een vakje aan te vinken, zoals bij de betaallink)?
5. **Tieners:** moet de tiener zelf ook een kopie krijgen, of enkel de ouder/voogd?
6. **Herinneringsmail** voor de start van een seminar: gewenst?
7. **Teksten:** lees de voorbeeldmails na en laat weten wat er anders moet (aanspreking, extra praktische info, ondertekening).
