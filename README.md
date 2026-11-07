# BoekhoudGemak 📊💼
> **Slimme Boekhouding & Administratie voor Kleine Ondernemers, ZZP'ers en MKB**

![BoekhoudGemak Cover Banner](./src/assets/images/boekhoudgemak_cover_1794072894089.jpg)

[![Status](https://img.shields.io/badge/Status-Actief%20%26%20Productie-emerald)]()
[![AVG/GDPR](https://img.shields.io/badge/AVG%2FGDPR-Conform-blue)]()
[![Belastingdienst](https://img.shields.io/badge/Belastingdienst-BTW%20Q1--Q4%20%26%20Digipoort-orange)]()
[![PSD2](https://img.shields.io/badge/Bankkoppeling-ING%20|%20Rabo%20|%20Bunq%20|%20ABN-purple)]()
[![Beveiliging](https://img.shields.io/badge/2FA-TOTP%20%26%20Biometrie-green)]()

---

## 🌟 Over BoekhoudGemak

**BoekhoudGemak** is een moderne, alles-in-één boekhoudkundige web- en mobiele applicatie speciaal ontworpen voor zelfstandige ondernemers (zzp'ers) en het midden- en kleinbedrijf (mkb). Het automatiseert tijdrovende administratieve taken, van het scannen van bonnetjes met Machine Learning tot het realtime berekenen en direct digitaal indienen van de periodieke omzetbelasting bij de Belastingdienst.

---

## 🚀 Kernfunctionaliteiten

### 1. 📷 Automatische Factuur- en Bonnetjesscanner (AI OCR)
- **Mobiele cameraweergave** met realtime richtkader en automatische detectie van documentgrenzen.
- **AI OCR extractie**: Herkent leverancier, datum, factuurnummer, totaalbedrag, btw-tarief (21%, 9%, 0%), aftrekbare voorbelasting en categorie.
- **Fiscale rubriektoewijzing**: Wijst inkopen direct toe aan de juiste Belastingdienst rubriek (o.a. Rubriek 5b Voorbelasting).
- **Directe testbonnen**: 1-klik tests met o.a. Shell brandstofbon, Coolblue hardware factuur, zakelijke lunch (80% IB aftrekbaar) en software abonnementen.

### 2. 📈 Realtime Winst- en Verliesdashboard (P&L)
- **Financiële KPI's**: Realtime overzicht van totale omzet, operationele kosten, netto winst met marge en geschatte belastingreservering.
- **Interactieve grafieken**: Maandelijkse ontwikkeling van inkomsten en uitgaven (2026 en kwartalen).
- **Cashflow prognose (90 dagen)**: Gebaseerd op openstaande facturen en terugkerende vaste lasten.
- **Budgetbewaking**: Automatische alerts bij het bereiken of overschrijden van categoriebudgetten.
- **Dagelijkse ondernemerstaken**: Interactieve productiviteitschecklist voor uw dagelijkse administratie.

### 3. 🏛️ Automatische BTW-Aangifte (Belastingdienst)
- **Officiële structuur**: Rubrieken 1a t/m 1e (binnenland), 2a (verlegd), 3a/b (export), 4a/b (import) en 5a t/m 5e (eindberekening).
- **Direct indienen via Digipoort**: Eén-klik verzendsimulatie met DigiD/eHerkenning validatie, ontvangstbevestiging en transactiekenmerk.
- **Downloadbare Aangifte**: Exporteer de officiële aangifte direct in XML- en JSON-formaat.
- **Inkomstenbelasting Box 1 calculator**: Berekening inclusief zelfstandigenaftrek (€ 3.750) en MKB-winstvrijstelling (12,7%).
- **KOR-indicator**: Automatische signalering of uw omzet onder de € 20.000 drempel van de kleineondernemersregeling blijft.

### 4. 📁 Veilige Export naar Accountant & Boekhouder
- **Auditfile Financieel (XAF 3.2 XML)**: Volgens de officiële Nederlandse SBR-taxonomie (compatibel met Exact Online, Twinfield, SnelStart, SRA en NOAB).
- **UBL 2.1 e-Facturatie**: Direct downloaden van e-facturen conform Peppol standaarden.
- **Excel & CSV Export**: Tabellarische journaalposten met IBANs, grootboekrekeningen en btw-bedragen.
- **Printklaar PDF-jaarrapport**: Professionele winst- en verliesrekening met datum- en verificatiestempel.
- **Boekhouder Uitnodigen**: Verstuur een beveiligde deellink rechtstreeks per e-mail.

### 5. 🏦 PSD2 Bankkoppelingen & Transactieverwerking
- **Ondersteunde banken**: Directe API-koppelingen met **ING Zakelijk, Rabobank, Bunq en ABN AMRO**.
- **Geautomatiseerde reconciliatie**: Automatisch afletteren van inkomende en uitgaande betalingen met openstaande facturen.
- **Machine Learning Categorisering**: Automatische classificatie met betrouwbaarheidsscore.
- **CAMT.053 & MT940 Import**: Ondersteuning voor het inlezen van officiële bankafschriften.
- **Anomalie-detectie**: Automatische waarschuwingen bij ongebruikelijke afschrijvingen of missende bonnen.

### 6. 🔐 Beveiliging, 2FA, Biometrie & AVG/GDPR
- **Tweefactorauthenticatie (2FA)**: Beveiliging met 6-cijferige TOTP-codes (Google Authenticator, Microsoft Authenticator, 1Password).
- **Biometrische toegang**: Ondersteuning voor FaceID, TouchID en vingerafdrukontgrendeling.
- **AVG / GDPR Compliance Hub**:
  - Recht op inzage en dataportabiliteit (1-klik volledige JSON export).
  - Recht op gegevenswissing (fabrieksherstel en veilige cache-wissing).
  - Gedeponeerde Verwerkersovereenkomst (DPA).
- **Versleutelde Cloud Back-up (AES-256)**: Automatische cloud synchronisatie met Google Drive, Dropbox en OneDrive.

### 7. 🌐 Toegankelijkheid, Donkere Modus & Offline Modus
- **Offline Modus**: Blijf ononderbroken werken zonder internet. Gegevens worden veilig in de lokale opslag bewaard en automatisch gesynchroniseerd zodra de verbinding hersteld is.
- **Donkere & Lichte Modus**: Volledig geoptimaliseerd contrast voor optimaal leescomfort.
- **Toegankelijkheid (A11y)**: Instelbare lettergroottes (normaal, groot, extra groot) en Hoog Contrast modus voor visueel beperkten.
- **Tweetalig**: Schakel met één klik tussen Nederlands (NL) en Engels (EN).
- **Google Agenda Koppeling**: Voeg fiscale deadlines direct toe aan uw Google Agenda.

---

## 🛠️ Technische Architectuur

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TSX.
- **AI & OCR Engine**: Google Gemini API (`@google/genai` met `gemini-3.8-flash`) voor factuuranalyse en Machine Learning transactiecategorisering.
- **Offline Opslag**: Browser LocalStorage met snapshot encryptie en synchronisatiewachtrij.
- **SEO & Social**: Volledige OpenGraph tags, Twitter Cards en Schema.org (`WebApplication`) gestructureerde data.

---

## 📦 Installatie & Lokaal Draaien

### Vereisten
- Node.js (v18 of hoger)
- npm of yarn

### Stappen
1. Clone de repository en installeer afhankelijkheden:
   ```bash
   npm install
   ```

2. Configureer uw omgevingsvariabelen in `.env` (zie `.env.example`):
   ```env
   GEMINI_API_KEY="uw_gemini_api_sleutel"
   PORT=3000
   ```

3. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```

4. Open uw browser op: `http://localhost:3000`

---

## 🔒 Privacy & Veiligheid (AVG)

BoekhoudGemak slaat financiële transacties lokaal op met client-side encryptie en verwerkt documenten uitsluitend via beveiligde, versleutelde verbindingen. Uw administratie blijft altijd in uw beheer conform de Europese Algemene Verordening Gegevensbescherming (AVG / GDPR).

---

## 📄 Licentie

Gelicentieerd onder de Apache-2.0 Licentie.
