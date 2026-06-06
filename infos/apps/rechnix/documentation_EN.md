# Rechnix – Documentation

**Rechnix** is an Android app for sole proprietors, freelancers and small businesses in Germany who
determine their profit via the **cash-basis income statement (EÜR – Einnahmenüberschussrechnung)**.
It automates the two most time-consuming tasks: **capturing receipts** (by photo or PDF, with
on-device OCR and automatic field extraction) and **creating invoices** (including e-invoices). From
this, Rechnix derives the EÜR, the VAT advance return and exports for the tax advisor.

**Privacy by design:** Rechnix works entirely **offline**. All data stays **encrypted on the
device** – no cloud, no tracking, no ads.

> **Note:** Rechnix assists with capture and preparation and is **not a substitute for tax advice**.
> Tax responsibility remains with the user or their tax advisor.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features at a Glance](#2-features-at-a-glance)
3. [System Requirements](#3-system-requirements)
4. [Getting Started](#4-getting-started)
5. [Navigation and Layout](#5-navigation-and-layout)
6. [Home (Dashboard)](#6-home-dashboard)
7. [Receipts](#7-receipts)
8. [Invoices](#8-invoices)
9. [Customers and Items](#9-customers-and-items)
10. [Open Items and Dunning](#10-open-items-and-dunning)
11. [EÜR Report and Export](#11-eür-report-and-export)
12. [VAT Advance Return](#12-vat-advance-return)
13. [Fixed Assets and Low-Value Assets](#13-fixed-assets-and-low-value-assets)
14. [Mileage Log](#14-mileage-log)
15. [Tax Deadlines](#15-tax-deadlines)
16. [Business Profile and Settings](#16-business-profile-and-settings)
17. [Backup and Restore](#17-backup-and-restore)
18. [Privacy and Security](#18-privacy-and-security)
19. [GoBD and Legal Basis](#19-gobd-and-legal-basis)
20. [Technical Architecture](#20-technical-architecture)
21. [Build and Release](#21-build-and-release)
22. [Data Model](#22-data-model)
23. [Glossary](#23-glossary)
24. [FAQ](#24-faq)
25. [Disclaimer](#25-disclaimer)

---

## 1. Overview

Rechnix targets self-employed people subject to the **EÜR** (§4 (3) German Income Tax Act) – i.e.
where no double-entry bookkeeping/balance sheet is required (permitted up to ~€800,000 turnover or
€80,000 profit, among other criteria).

The app follows three core principles:

- **Automation:** receipts are photographed/imported and analyzed via on-device OCR (“where, when,
  what, how much”). Invoices are generated from a pre-designed layout.
- **Compliance:** original receipts are stored immutably (hash + audit log, GoBD-oriented). Invoices
  meet the mandatory fields under §14 of the German VAT Act.
- **Data ownership:** everything stays local and encrypted; there are no Rechnix servers.

## 2. Features at a Glance

| Area | Function |
|---|---|
| Receipts | Photo scan, PDF/image import, e-invoice ingestion, OCR, auto-classification, GoBD locking |
| Invoices | Layout builder, editor with §14 validation, PDF, e-invoice (ZUGFeRD/XRechnung) |
| Reporting | EÜR profit calculation, period filter, export CSV/PDF/DATEV |
| VAT | VAT advance return (key figures), small-business rule (§19) |
| Receivables | Open items, overdue detection, dunning levels/letters as PDF |
| Master data | Customers, items/services, business profile |
| Fixed assets | Low-value asset (GWG) and depreciation (AfA) register |
| Mobility | Mileage log with flat per-km rate |
| Organization | Tax deadline reminders, encrypted backup |
| Security | Encrypted DB, app lock (biometrics), light/dark mode |

## 3. System Requirements

- **Android 8.0 (API 26)** or newer
- For photo scanning: Google Play services (provide the document scanner)
- Storage for the app plus the local encrypted database and original receipts
- No internet connection required for operation (fully offline)

## 4. Getting Started

1. **Launch the app.** On first start you’ll see the splash screen, then the dashboard.
2. **Create your business profile:** Menu → **Betrieb (Business)**. Enter name, address,
   **tax number (Steuernummer)** and optionally the **VAT ID (USt-IdNr.)**. Set whether you are a
   **small business (§19)**, the **taxation method** (cash/accrual) and the **VAT return cadence**.
   Optionally add bank details (for invoices).
3. **Set up the invoice template:** Menu → **Rechnungs-Vorlage** (layout builder): logo, accent
   color, header/footer text, payment term.
4. **Capture your first receipt:** Menu → **Belege (Receipts)** → **+** → scan or import.
5. **Enable the app lock** (optional): Business → app lock (biometrics).

## 5. Navigation and Layout

Navigation uses an **animated side menu (hamburger/drawer)** with a branded header (app icon +
business name), organized into three groups:

- **Main:** Dashboard, Receipts, Invoices, Report
- **Tools:** Open items, Customers, Items & services, Fixed assets & GWG, Mileage log, Tax deadlines,
  VAT advance return
- **System:** Business, Invoice template, Backup

A consistent **period switcher** (Month · Quarter · Year · All) is available, along with a
**balance traffic light**: positive balance **green**, zero **black**, negative **red**.

## 6. Home (Dashboard)

The dashboard is the command center:

- **Balance card** with a colored traffic light for the selected period
- **Income** (green) and **expenses** (red) overview
- **Quick actions:** scan receipt, create invoice, open EÜR
- **Key figures:** open items (count/sum), next tax deadline
- **Recent receipts** for quick access
- **Period switcher** (Month/Quarter/Year/All) with previous/next

## 7. Receipts

### 7.1 Capture Methods
- **Photo scan:** ML Kit document scanner with edge detection, perspective correction, multi-page.
- **PDF/image import:** via the system file picker (SAF). Scanned PDFs are converted page by page to
  images and read via OCR.
- **E-invoice ingestion:** ZUGFeRD PDFs or XRechnung XML are detected; the embedded structured XML is
  **parsed directly** (no OCR needed) and imported as a receipt.

### 7.2 OCR and Automatic Field Extraction
**On-device text recognition** (ML Kit) produces the receipt text. The **BelegExtractor** derives,
rule-based:
- **Merchant** (“where”) – top lines, lookup against the merchant database, VAT-ID detection
- **Date** (“when”) – patterns `DD.MM.YYYY`/`DD.MM.YY`, the most plausible receipt date
- **Amount** (“how much”) – total detection, derivation of net/VAT
- **Confidence** per field

### 7.3 Classification and Learning Merchant Mapping
Rechnix suggests a **category** (“what”) from the learned **merchant→category memory** and keyword
heuristics. If you correct the category, Rechnix remembers it for future receipts from the same merchant.

### 7.4 Review, Edit, Lock (GoBD)
- **Review before saving:** you verify and correct the extracted fields (required for GoBD).
- **Original storage:** the original image/PDF is stored immutably, including a **SHA-256 hash**.
- **Audit log:** every relevant change is recorded (append-only).
- **Locking (Festschreiben):** locked receipts are **no longer editable** (audit-proof).

### 7.5 Filter, Search, Totals
- **Period** (Month/Quarter/Year/All), **direction** (All/Income/Expenses), **merchant search**
- **Totals card:** income, expenses, balance (EÜR) with traffic-light colors
- Each list entry shows a colored icon (green = income, red = expense)

## 8. Invoices

### 8.1 Invoice Layout Builder
Under **Invoice template** you design the layout once:
- Upload a **logo**, choose an **accent color**
- **Header text** (letterhead line) and **footer text**
- Toggles: **show bank details**, **show footer text**, **accent bar top/bottom**, **accent border**
  (full frame; disables the bars)
- **Payment term** and default texts
- **Live preview** of the PDF with **zoom** (pinch/double-tap)

### 8.2 Creating an Invoice
In the **editor**:
- Select a **customer** (or create one), add **line items** (also from the item catalog)
- **Live totals** per VAT rate, net/VAT/gross
- **Sequential invoice number** automatically
- **§14 mandatory-field validation** before export

### 8.3 PDF and Mandatory Fields (§14 VAT Act)
The generated PDF contains all mandatory fields. The **footer** carries – as is customary for
business invoices – the **tax number/VAT ID and bank details**. For small businesses, the **§19 note**
is printed and no VAT is charged.

### 8.4 E-Invoice (ZUGFeRD/XRechnung)
- **Generate:** EN 16931-compliant **CII XML**, either as **XRechnung XML** or embedded into a
  **ZUGFeRD PDF** (a PDF carrying structured data).
- **Ingest:** see 7.1 – incoming e-invoices are imported as receipts.

### 8.5 Status and “paid → income”
Invoices have a **status** (Draft/Issued/Paid/Cancelled). When an outgoing invoice is marked **paid**,
Rechnix automatically creates a linked **income receipt** for the EÜR.

## 9. Customers and Items

- **Customers:** master data including address and an optional **VAT ID** (kept optional, since
  private customers are possible too). Selectable via a picker in the editor.
- **Items/services:** recurring line items with price/VAT rate; insertable as a line in the editor.

## 10. Open Items and Dunning

- **Open items:** all issued, not-yet-paid invoices with a total and **overdue detection** (payment
  term exceeded).
- **Dunning:** generation of **payment reminders** and **dunning letters** (with dunning level) as PDF.

## 11. EÜR Report and Export

- **Profit calculation:** income − expenses, optionally net/gross method; **VAT liability** and the
  **small-business logic** are taken into account.
- **Breakdown** by categories (EÜR form lines) and **period**.
- **Balance traffic light** for the profit (green/black/red).
- **Export:** **CSV** (receipt journal), **PDF** (EÜR report), **DATEV CSV** (simplified) – via the
  system file picker to a location you choose.

## 12. VAT Advance Return

- **Aggregation** of output and input VAT per **month/quarter**.
- **Key figures** (e.g., 81/86/66/83), **liability** or **refund**.
- **Small business (§19):** no VAT calculation.
- **CSV export**; also reachable from the report.

## 13. Fixed Assets and Low-Value Assets

- **GWG (low-value assets):** immediate write-off up to €800 net; separate register (cost, date,
  useful life).
- **AfA (depreciation):** straight-line depreciation **pro rata temporis** over the useful life;
  residual book value.
- Computed via the `AfaRechner`.

## 14. Mileage Log

- Record trips (date, from/to, km, purpose).
- Calculate the **flat per-km rate** (€0.30/km) as a business expense.

## 15. Tax Deadlines

- Calculation of typical deadlines (e.g., **VAT advance return**, **income tax**) from your
  profile/cadence.
- Overview of upcoming dates (also shown on the dashboard as “next deadline”).

## 16. Business Profile and Settings

In the **Business** tab you maintain master data and app settings.

**Tax number vs. VAT ID – what to include?**
- The **tax number (Steuernummer)** is assigned by the tax office; it must appear on invoices (§14)
  unless a VAT ID is used.
- The **VAT ID (USt-IdNr.)** is mainly relevant for intra-EU/B2B transactions.
- **Small business without waiving §19:** usually state the **tax number**; a VAT ID is **optional**
  (can be requested but is not mandatory). The invoice shows the **§19 note** instead of itemized VAT.
- **Standard taxation / §19 waiver:** tax number **or** VAT ID (often the VAT ID in B2B).

**Other settings**
- **Taxation:** cash or accrual basis.
- **VAT return cadence:** none/monthly/quarterly.
- **Bank details:** appear in the invoice footer.
- **Appearance:** **System / Light / Dark** (applied instantly, persisted).
- **App lock:** optional via **fingerprint/face**.

## 17. Backup and Restore

- **Encrypted backup:** a ZIP of the database + original receipts, protected by a **password** you
  choose (AES/GCM, key derivation via PBKDF2). You pick the destination (SAF).
- **Restore:** select the backup file + password; the app restarts afterwards to load the data.

> Keep the backup file **and** the password safe – without the password the backup cannot be read.

## 18. Privacy and Security

- **Local-only:** no servers, no transmission of receipts/data to Rechnix or third parties.
- **Encrypted database:** SQLCipher/AES-256; the key resides in the **Android Keystore**.
- **No tracking/no ads/no location.**
- **Minimal permissions:** only **biometrics** (app lock). The camera is handled by Google’s document
  scanner in a sandboxed way; file access is limited to files you select (SAF).
- **System auto-backup disabled** (`allowBackup=false`) so the encrypted DB is not copied uncontrolled.

## 19. GoBD and Legal Basis

These (development-time researched) conditions shape the app:

| Topic | Rule (short form) |
|---|---|
| **EÜR instead of balance sheet** | permitted up to ~€800,000 turnover / €80,000 profit |
| **Small business §19** | thresholds €25,000 (prior year) / €100,000 (current year) |
| **Retention** | receipts/invoices for several years, archived digitally per GoBD |
| **GoBD** | immutability, traceability (hash + audit log), original preservation |
| **§14 VAT Act** | mandatory invoice fields (parties, tax no./VAT ID, number, date, service, net/VAT …) |
| **B2B e-invoice** | receiving structured invoices is mandatory; sending obligations phased in |
| **GWG** | immediate write-off up to €800 net; separate register |

> Provided without warranty and not a substitute for tax advice; thresholds/rules may change.

## 20. Technical Architecture

- **Language/UI:** Kotlin, **Jetpack Compose** (Material 3), Navigation Compose
- **Architecture:** MVVM + clean layers (`ui`/`domain`/`data`), unidirectional state via StateFlow
- **DI:** Hilt · **Async:** Coroutines + Flow
- **Database:** **Room** + **SQLCipher** (encrypted), KSP for code generation
- **Scan/OCR:** ML Kit Document Scanner + ML Kit Text Recognition (on-device)
- **PDF:** Android `PdfDocument`/Canvas for generation; `PdfRenderer` for import; **PdfBox-Android**
  for ZUGFeRD embedding/extraction
- **Images:** Coil · **Settings:** DataStore
- **Money:** stored as **long cents** (`Money`), central VAT rounding logic (BigDecimal, HALF_UP)
- **Package structure:** `core/{common,database,security,ui,data}` and `feature/{capture,ocr,belege,
  euer,ustva,rechnung,stammdaten,mahnwesen,anlagen,steuertermine,backup,home}`

## 21. Build and Release

- **Build:** `./gradlew assembleDebug` (test), `./gradlew assembleRelease` (signed APK),
  `./gradlew bundleRelease` (AAB for Play).
- **Signing:** via `keystore.properties` (not in Git). The release is minified with **R8**, resource
  shrinking is enabled, ProGuard keep rules live in `app/proguard-rules.pro`.
- **Publishing:** see `playstore/RELEASE-ANLEITUNG.md` (Play App Signing, internal test, store
  listing, privacy URL, data safety/content rating, production).
- **Store templates:** `playstore/STORE-LISTING.md`, `playstore/DATENSCHUTZERKLAERUNG.md`,
  `playstore/DATA-SAFETY.md`, icon `playstore/icon-512.png`.

## 22. Data Model

Most important entities (excerpt):

- **Business profile** – name, address, tax no., VAT ID, small-business flag, taxation, VAT cadence,
  bank details, logo
- **Receipt** – direction (income/expense), date, merchant, gross/net/VAT, category, original path,
  OCR text, confidence, status, hash, source
- **Category** – name, EÜR line, type, DATEV account (SKR03/04)
- **Merchant** – name, VAT ID, default category (learning)
- **Customer / Item** – invoice master data
- **Invoice / InvoiceLine** – number, customer, dates, status, totals, PDF/ZUGFeRD path
- **InvoiceLayout** – logo, colors, header/footer text, toggles
- **Payment** – reference, date, amount (open items)
- **Fixed asset / Trip** – depreciation and mileage log
- **AuditLog** – append-only record (GoBD)

## 23. Glossary

- **EÜR** – cash-basis income statement (§4 (3) Income Tax Act)
- **OCR** – optical character recognition
- **GoBD** – German principles for proper, audit-proof electronic bookkeeping/archiving
- **GWG** – low-value asset (geringwertiges Wirtschaftsgut)
- **AfA** – depreciation (Absetzung für Abnutzung)
- **UStVA** – VAT advance return (Umsatzsteuer-Voranmeldung)
- **ZUGFeRD/XRechnung** – German/EU e-invoice formats (EN 16931)
- **§19 VAT Act** – small-business rule
- **SAF** – Storage Access Framework (system file picker)
- **Balance traffic light** – balance color coding: green (+), black (0), red (−)

## 24. FAQ

**Do I need internet?** No, operation is offline. The photo scanner uses Google Play services.

**Where is my data?** Encrypted on your device only.

**My receipt doesn’t show in the list.** Check the **period filter** (Month/Quarter/Year/All) and the
**direction filter** – the receipt date must fall within the selected period.

**Can I edit a locked receipt?** No – this is intentionally blocked for audit-proofing (GoBD).

**Will I lose data on an app update?** During development, schema changes may reset the DB – therefore
use **Backup**. (Real migrations are planned as later hardening.)

**How do I back up my data?** Via **Backup** (encrypted, password-protected ZIP) to a location you choose.

## 25. Disclaimer

Rechnix is a tool for capture and preparation. It does **not provide tax advice** and makes no legally
binding statements. The user (or their tax advisor) is solely responsible for the correctness of data,
bookings, reports and the timely submission of returns. Statutory values/thresholds mentioned may
change; provided without warranty.

---

*Publisher: HK Productions · App ID: `de.hk_productions.rechnix`*
