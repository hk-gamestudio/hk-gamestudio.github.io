# Hive Memories — Documentation

**Hive Memories** is an Android app for beekeepers to manage colonies, inspections, honey harvests and bottlings. Inspections are recorded via voice and automatically transcribed to text using on-device Speech-to-Text (Sherpa-ONNX). From the transcribed text, 10 condition attributes (colony strength, queen, brood, temperament, etc.) are extracted via keyword matching. Harvests and bottlings receive human-readable codes (`E2026-001`, `F2026-001`) for full traceability from colony to bottled jar. Via an integrated local HTTP server, all data can be viewed in a browser on a laptop and exported/imported as SQLite/JSON/Excel. The interface is available in 24 languages.

Current version: **1.6.0+1** · Platform: **Android** (Flutter-based)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Data Model](#4-data-model)
   - [4.1 Database Schema](#41-database-schema)
   - [4.2 Migrations](#42-migrations)
   - [4.3 Code Generation for Harvests & Bottlings](#43-code-generation-for-harvests--bottlings)
5. [Features](#5-features)
   - [5.1 Colonies, Splits and Dead](#51-colonies-splits-and-dead)
   - [5.2 Inspections (Voice Recording + STT)](#52-inspections-voice-recording--stt)
   - [5.3 Honey Harvests](#53-honey-harvests)
   - [5.4 Honey Bottling](#54-honey-bottling)
   - [5.5 Import/Export (Local Web Server)](#55-importexport-local-web-server)
   - [5.6 Updates Feed](#56-updates-feed)
6. [Navigation](#6-navigation)
7. [Internationalization](#7-internationalization)
8. [Permissions](#8-permissions)
9. [Build & Run](#9-build--run)
10. [Extension Cheatsheet](#10-extension-cheatsheet)

---

## 1. Overview

Hive Memories supports a typical beekeeper workflow from colony management to bottling:

```
Create colony
  └── Document inspections (Audio → Text → Condition chips)
       └── Harvest honey (Centrifuge/Drip/Press/Comb)
            └── Bottle honey (250 g / 500 g / 1000 g jars)
                 └── Traceability via bottling ID
                      └── Backup / transfer via Import/Export (local Wi-Fi server)
```

All data is stored locally in a SQLite database — no cloud, no sign-in, no outgoing network requests. Speech recognition also runs entirely on-device. The import/export server binds exclusively to the local Wi-Fi network.

---

## 2. Tech Stack

| Area | Used |
|---|---|
| Framework | Flutter (Dart SDK ≥ 3.6) |
| Persistence | `sqflite` 2.4.2+ (local SQLite database) |
| Audio Recording | `record` 5.0+ |
| Audio Playback | `just_audio` 0.10+ |
| Speech-to-Text | `sherpa_onnx` (model: `sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06`) |
| LLM (optional) | `fllama` |
| State Management | `provider` (LanguageProvider) |
| Persistent Settings | `shared_preferences` |
| Display Wake | `wakelock_plus` |
| Asset Paths | `path`, `path_provider` |
| HTTP Server | `shelf` 1.4+, `shelf_router` 1.1+ |
| Excel I/O | `excel` 4.0+ (pure Dart, .xlsx read & write) |
| Multipart Parser | `mime` 1.0+ |

Target platform: **Android only**. iOS/Desktop directories are present as Flutter defaults but are not maintained.

---

## 3. Project Structure

```
hive_memories/
├── android/                     # Android-specific manifest, Gradle
├── assets/
│   ├── images/Logo.png
│   ├── keywords/                # Keyword lists for InspectionStateExtractor
│   ├── models/sherpa-onnx-…/    # On-device STT model (encoder/decoder/joiner/tokens)
│   └── updates/updates.json     # Display feed for the "Updates" page
├── lib/
│   ├── database/
│   │   └── database_helper.dart # Singleton, all SQL CRUD and migrations
│   ├── l10n/
│   │   └── app_strings.dart     # 24-language map + getters (custom i18n)
│   ├── models/
│   │   ├── hive_model.dart            # Colony/Split/Dead
│   │   ├── durchsicht_model.dart      # Inspection + 10 condition enums
│   │   ├── honigernte_model.dart      # Harvest + harvest-type enum
│   │   ├── honigabfuellung_model.dart # Bottling + variety and processing enums
│   │   └── app_language.dart          # List of all available languages
│   ├── pages/
│   │   ├── splash/
│   │   ├── hives/                     # List with 3 tabs (Colonies/Splits/Dead)
│   │   ├── hive_detail/               # Detail view of a colony + inspections
│   │   ├── neue_durchsicht/           # Recording + STT review
│   │   ├── honig_ernten/              # List + new harvest form
│   │   ├── honig_abfuellen/           # List + new bottling form
│   │   ├── import_export/             # Server start/stop page with URL display
│   │   ├── updates/
│   │   └── about/
│   ├── providers/
│   │   └── language_provider.dart     # Current language (SharedPreferences-persisted)
│   ├── services/
│   │   ├── sherpa_service.dart        # STT wrapper
│   │   ├── inspection_state_extractor.dart  # Keyword matching
│   │   ├── llm_service.dart
│   │   ├── export_service.dart        # DB/JSON/Excel byte generation
│   │   ├── import_service.dart        # Parser, conflict analysis, transactional apply
│   │   └── http_server_service.dart   # Shelf server, web UI, upload/download routes
│   └── widgets/
│       └── app_scaffold.dart          # Hamburger drawer + IndexedStack of top pages
├── pubspec.yaml
└── documentation.md             # ← this file
```

---

## 4. Data Model

### 4.1 Database Schema

File: `lib/database/database_helper.dart` · Singleton pattern · Current version: **6**.

#### Table `hives`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `name` | TEXT NOT NULL | |
| `standort` | TEXT NOT NULL DEFAULT '' | Location |
| `status` | TEXT NOT NULL | Enum: `volk`/`ableger`/`tot` (colony/split/dead) |
| `created_at` | TEXT NOT NULL | ISO-8601 |

#### Table `durchsichten`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `hive_id` | INTEGER NOT NULL | FK → `hives.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601, date of inspection |
| `audio_path` | TEXT | Local WAV path |
| `text` | TEXT NOT NULL | Transcribed inspection text |
| `volksstaerke` | TEXT | Enum, colony strength |
| `koenigin` | TEXT | Enum, queen status |
| `brut` | TEXT | Enum, brood status |
| `sanftmut` | TEXT | Enum, temperament |
| `schwarmzellen` | INTEGER | Boolean (0/1), swarm cells |
| `nachschaffungszellen` | INTEGER | Boolean (0/1), emergency queen cells |
| `schwarm_abgegangen` | INTEGER | Boolean (0/1), swarm departed |
| `varroa` | INTEGER | Boolean (0/1) |
| `futtervorrat` | TEXT | Enum (voll/ok/leer = full/ok/empty) |
| `honigraum` | TEXT | Enum (voll/ok/leer = full/ok/empty) |

#### Table `honigernten`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `code` | TEXT NOT NULL UNIQUE | Format: `E{YEAR}-{NNN}` |
| `hive_id` | INTEGER NOT NULL | FK → `hives.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `menge` | REAL NOT NULL | kg |
| `feuchtigkeit` | REAL NOT NULL | % moisture |
| `art` | TEXT NOT NULL | Enum: `schleuder`/`tropf`/`pressen`/`wabe` (centrifuge/drip/press/comb) |

#### Table `honigabfuellungen`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `code` | TEXT NOT NULL UNIQUE | Format: `F{YEAR}-{NNN}` |
| `ernte_id` | INTEGER NOT NULL | FK → `honigernten.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `jars_250g`, `jars_500g`, `jars_1000g` | INTEGER NOT NULL DEFAULT 0 | Jar count per size |
| `sorte` | TEXT NOT NULL | Enum of 18 honey varieties |
| `verarbeitung` | TEXT NOT NULL | Enum: `geruehrt`/`fluessig` (creamed/liquid) |
| `mhd` | TEXT NOT NULL | ISO-8601, derived from `date + 1y` or `+ 2y` |

The two cascade relationships `hives → honigernten → honigabfuellungen` mean that deleting a colony automatically deletes all associated harvests and their bottlings.

### 4.2 Migrations

`DatabaseHelper._initDB` opens the database with `version: 6`. The `onUpgrade` handler contains idempotent blocks `if (oldVersion < N)`:

- **v3**: Restructure `hives` (status to lowercase, populate `created_at`), create `durchsichten` initially
- **v4**: Add `hives.standort`
- **v5**: Add 10 inspection condition columns to `durchsichten`
- **v6**: Create `honigernten` and `honigabfuellungen` tables

Fresh installs jump directly to the current version via `onCreate`.

### 4.3 Code Generation for Harvests & Bottlings

Human-readable IDs in the scheme `E{YEAR}-{NNN}` / `F{YEAR}-{NNN}` are generated by two helpers:

- `nextErnteCode()` — finds the highest `code` with prefix `E{YEAR}-` and increments by 1.
- `nextFuellCode()` — analogous with prefix `F{YEAR}-`.

The running number is 3-digit zero-padded. Per year the counter starts at `001`. Uniqueness is additionally guaranteed by the `UNIQUE` constraint on the `code` column.

---

## 5. Features

### 5.1 Colonies, Splits and Dead

Three tabs on the Hives page (`lib/pages/hives/hives_page.dart`):

- **Colonies** — productive production colonies
- **Splits** — nucleus colonies / brood collectors
- **Dead** — deceased colonies remain documented

When creating, the user selects name, location and status; long-press opens an edit/delete modal. Tap opens the detail view with all inspections.

### 5.2 Inspections (Voice Recording + STT)

Recording an inspection (`lib/pages/neue_durchsicht/neue_durchsicht_page.dart`) goes through 5 states:

1. **idle** — ready screen with microphone icon
2. **recording** — recording in progress (red stop icon)
3. **transcribing** — Sherpa-ONNX transcribes the WAV file
4. **review** — user can edit the text before saving
5. **saving** — insert + keyword extraction

Before recording starts, `AudioRecorder.hasPermission()` checks the system microphone permission (see [§ 8](#8-permissions)). During recording, `wakelock_plus` keeps the screen active; when leaving the recording state the wake lock is released.

**Condition extraction**: `InspectionStateExtractor.extract(text)` analyses the transcript text against the phrase lists in `assets/keywords/<locale>.json` and determines 10 structured conditions (colony strength, queen, brood, temperament, swarm cells, emergency queen cells, swarm departed, varroa, food stores, honey super). These are saved with the inspection and displayed as coloured chips in the detail view.

Matching properties (as of 1.6.0):

- **Phrase-based and case-insensitive** — lists contain phrases that are unambiguous on their own (e.g. `"colony strong"` rather than just `"strong"`). No single-token heuristics.
- **Negation via dedicated negative lists** (`varroa_negativ`, `koenigin_nicht_gesehen`, `brut_keine_brut`) rather than rule-based search for "no"/"not" around a keyword.
- **Brood components context-bound** — the generic keywords `brut_stifte_komponente`, `brut_maden_komponente` and `brut_verdeckelt_komponente` are only evaluated when the text also contains an entry from `brut_kontext`. This prevents wax moth larvae or pins mentioned in a construction context from being falsely interpreted as brood.

### 5.3 Honey Harvests

Top-level page (`lib/pages/honig_ernten/`).

**List** shows all harvests (DESC by date), fields per card: code, colony, date, quantity, moisture, harvest type. **Long-press** opens a confirmation dialog for deletion.

**New harvest** (form):
- **Colony** — dropdown of all hives with `status == volk`
- **Date** — picker, default today
- **Quantity** (kg) — decimal field, comma or dot accepted
- **Moisture** (%) — decimal field, validated to [0, 100]
- **Harvest type** — dropdown: Centrifuge, Drip, Press, Comb

Save → `nextErnteCode()` + `insertHonigernte(...)`.

### 5.4 Honey Bottling

Top-level page (`lib/pages/honig_abfuellen/`).

**List**: shows all bottlings with code, date, variety, total jar count and best-before date. Top-left a magnifier icon reveals a search field on tap. Input filters live via `searchHonigabfuellungenByCode(LIKE %pattern%)` — suitable for partial input like `2026-04` or `F2026-042`. **Long-press** on an entry opens the delete dialog.

**New bottling** (form):
- **Harvest** — dropdown of all honey harvests (shows code + kg)
- **Date** — picker, default today
- **Jar quantities** — three integer fields for 250 g, 500 g, 1000 g (at least one > 0)
- **Variety** — dropdown of 18 varieties:
  - Spring honey, Summer honey, Forest honey, Rapeseed honey, Acacia honey, Linden honey, Comb honey, Drip honey, Sunflower honey, Chestnut honey, Heather honey, Fir honey, Phacelia honey, Lavender honey, Thyme honey, Clover honey, Mixed honey, Other
- **Processing** — segmented button: Creamed / Liquid
- **Best-before** — segmented button +1 year / +2 years; the calculated date is shown live (`DateTime(year + n, month, day)` — leap-year safe)

Save → `nextFuellCode()` + `insertHonigabfuellung(...)`.

### 5.5 Import/Export (Local Web Server)

Top-level page (`lib/pages/import_export/import_export_page.dart`) + three services (`export_service.dart`, `import_service.dart`, `http_server_service.dart`).

In the app UI there is only one large **Start/Stop button** and a copyable URL. Once the server is running, open the URL (e.g. `http://192.168.1.42:8080`) in a browser on any device on the **same Wi-Fi** — the full dashboard with data tables, download buttons and upload form is available there.

#### Server Lifecycle

Singleton `HttpServerService.instance`:
- `start()` determines the Wi-Fi IP via `NetworkInterface.list()` (prefers `192.168.x.x`, `10.x.x.x`, `172.x.x.x`), tries ports **8080, 8081, 8082, 8088, 8090** in that order and returns the first free one.
- `stop()` closes the `HttpServer` handle (force) and clears the preview cache.
- `isRunning` / `url` for the UI.

When the app is terminated, the process is killed and the server along with it.

#### HTTP Routes

```
GET  /                  → Dashboard with all data + export/import links
GET  /export/db         → Download hive_memories_YYYY-MM-DD.db (raw SQLite)
GET  /export/json       → Download hive_memories_YYYY-MM-DD.json (pretty-printed)
GET  /export/excel      → Download hive_memories_YYYY-MM-DD.xlsx (4 sheets)
GET  /import            → Upload form: format dropdown + file picker
POST /import            → Parse + conflict analysis → preview HTML
POST /import/apply      → Transactional apply with strategies → result page
```

#### Export Formats

- **`.db`** — 1:1 byte copy of the running SQLite file. Fastest backup path and simultaneously restorable via import.
- **`.json`** — hierarchical JSON with `version`, `exportedAt`, `app` and four arrays (`hives`, `durchsichten`, `honigernten`, `honigabfuellungen`). Pretty-printed, UTF-8.
- **`.xlsx`** — workbook with **four sheets** (`hives`, `durchsichten`, `honigernten`, `honigabfuellungen`), first row = column names, then data rows. Excel data types are preserved (integer, double, bool, text).

#### Import Workflow

1. **Upload form** (`GET /import`): user selects format (DB / JSON / Excel) and file.
2. **Parsing** (`POST /import`): format-specific parser builds a normalised `ImportData` structure (4 `List<Map<String, dynamic>>`). On parse error → HTTP 400 with error text.
3. **Conflict analysis** (`ImportService.analyze`): counts per entity **New**, **Conflicts** (match against existing data) and **Orphans** (child records whose parent is missing from the import set):
   - **Colonies**: conflict detection via case-insensitive `name`.
   - **Inspections**: no conflict match, orphan check only (referenced `hive_id` must appear in the import set).
   - **Honey harvests**: conflict via `code`. Orphan check for `hive_id`.
   - **Bottlings**: conflict via `code`. Orphan check for `ernte_id`.
4. **Preview page**: table with the counts + a radio set per category (`skip` / `overwrite`). Overwrite radio is only shown when conflicts exist. Token (16-byte hex) holds the parsed data for 10 minutes in `_pendingImports`.
5. **Apply** (`POST /import/apply`): user submits strategy + token. `ImportService.apply` runs in a **SQLite transaction**:
   - Colonies: Skip → source ID is mapped to existing ID (children attach there); Overwrite → fields are updated; New → insert with new ID.
   - Inspections: insert with mapped `hive_id`. Orphan → skip.
   - Harvests / bottlings analogous to colonies, FK remapping via two ID maps (`hiveIdMap`, `ernteIdMap`).
   - On exception → rollback of the entire transaction.
6. **Result page**: table with Inserted / Updated / Skipped per category.

#### Security Notes

- Server binds to `InternetAddress.anyIPv4` → reachable by all devices on the same LAN/Wi-Fi. **No authentication** — assumption: trusted home network.
- No outgoing connections, no NAT traversal, no cloud.
- Schema validation on import: missing tables / columns are treated as empty lists; required fields (colony name, harvest code, FKs) are validated and problematic entries skipped with warnings in the report.
- Database imports are opened **read-only** (separate temp file in `getTemporaryDirectory()`), deleted immediately after reading.

### 5.6 Updates Feed

`lib/pages/updates/updates_page.dart` loads `assets/updates/updates.json` via `rootBundle` and renders a vertical list of update cards. Each card contains title, date, description and a feature bullet list. To add a new release, simply prepend a JSON block — no code change required.

---

## 6. Navigation

`lib/widgets/app_scaffold.dart` holds the hamburger drawer and an `IndexedStack` with six top-level pages:

| Index | Page | Icon |
|---|---|---|
| 0 | HivesPage | `Icons.hive_outlined` |
| 1 | HonigErntenPage | `Icons.local_florist_outlined` |
| 2 | HonigAbfuellenPage | `Icons.inventory_2_outlined` |
| 3 | ImportExportPage | `Icons.import_export` |
| 4 | UpdatesPage | `Icons.article_outlined` |
| 5 | AboutPage | `Icons.info_outline` |

Below the drawer entries is a divider and the language selector (RadioListTiles for all 24 languages).

Secondary navigation (detail pages, creation forms) is done throughout via `Navigator.push(MaterialPageRoute(...))` — **no** named routes, no GoRouter.

---

## 7. Internationalization

**Custom map system** in `lib/l10n/app_strings.dart` — deliberately without `intl`/`easy_localization` dependency.

Structure:
- `class AppStrings` contains per key a getter `String get xy => _t('xy')`.
- `static const Map<String, Map<String, String>> _strings` maps language code → key → translation.
- `_t(key)` falls back to English first on missing translation, then to the key itself.

Access from widgets:

```dart
final s = AppStrings.of(context);
Text(s.honigErnten)
```

The selected language is held in `LanguageProvider` (based on `ChangeNotifier`) and persisted in `SharedPreferences`. `AppStrings.of(context)` calls `context.watch<LanguageProvider>()`, so the entire widget tree rebuilds automatically on language change.

**Supported languages (24)**:
German, English, French, Italian, Spanish, Dutch, Polish, Portuguese, Swedish, Czech, Russian, Ukrainian, Croatian, Danish, Finnish, Greek, Hungarian, Estonian, Latvian, Lithuanian, Maltese, Romanian, Slovak, Slovenian, Bulgarian.

**Note**: The app UI is fully localised. The web UI of the import/export server deliberately uses English — it is a power-user tool typically accessed from a laptop.

When adding new strings: **add getter + entry in all 24 language maps** — otherwise the string silently falls back to English.

---

## 8. Permissions

`AndroidManifest.xml` declares:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

- **`INTERNET`** is granted automatically on Android and is needed so the Shelf HTTP server can listen on a local port. **No** outgoing connections are made.
- **`RECORD_AUDIO`** must be requested at runtime from Android 6+. This happens directly in the inspection flow: `AudioRecorder.hasPermission()` from the `record` package triggers the system permission dialog if permission has not yet been granted. If denied, a snackbar (`micPermissionDenied`) appears and recording does not start. No additional dependency (`permission_handler` etc.) required.

---

## 9. Build & Run

**Prerequisites**:
- Flutter SDK ≥ 3.6
- Android SDK + a device or emulator
- On first build: `assets/models/sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06/` (≈ model weights) must be fully present, otherwise the STT service will fail

**Local development**:

```powershell
flutter pub get
flutter run
```

**Build APK**:

```powershell
flutter build apk --release
```

**Static analysis**:

```powershell
flutter analyze
```

**Test import/export**:
1. Install app on Android device, device on same Wi-Fi as a laptop
2. In the app: Drawer → Import/Export → "Start server"
3. Open the displayed URL in the laptop browser
4. Perform any action (download, upload + preview + apply)

---

## 10. Extension Cheatsheet

### Add a new top-level page
1. Create page widget under `lib/pages/<feature>/` (Scaffold without AppBar — that is provided by `AppScaffold`).
2. In `lib/widgets/app_scaffold.dart`: add to `_pages`, `pageTitles` and a new `ListTile`, adjust indices.
3. Add i18n key for the drawer title in all 24 languages.

### Add a new table / model
1. Model under `lib/models/<name>_model.dart` (define enums inline).
2. `database_helper.dart`: increment DB version, add CREATE SQL in `onCreate` AND as a new `if (oldVersion < N)` block in `onUpgrade`.
3. Append CRUD methods and optionally a code generator (`next<X>Code()`) at the end of the class.
4. When extending with import/export support: add column list to `ExportService._fillSheet` calls and a corresponding block in `ImportService.analyze` + `ImportService.apply` (conflict detection + FK remapping).

### Add a new i18n key
1. Add getter in `AppStrings`.
2. Set entry in **all 24** language maps in `_strings` — otherwise fallback to English (or the key name).

### Make a new update visible in the feed
Simply prepend a new block at the top of `assets/updates/updates.json` (`title`, `date`, `description`, `features`). No rebuild needed — the asset is reloaded on app start.

### Extend condition chips (inspection analysis)
Add keyword phrases to `assets/keywords/<locale>.json` and adjust `InspectionStateExtractor` in `lib/services/inspection_state_extractor.dart`. New phrases must be unambiguous on their own (no single tokens that match in unrelated contexts). Generic components that can appear outside the brood context (e.g. larvae, pins) belong in a `*_komponente` list and are only evaluated in combination with an entry from `brut_kontext`.

### Add an HTTP route
1. Register a route in `HttpServerService._buildRouter()` (e.g. `r.get('/api/...', _handleXyz)`).
2. Implement handler; for JSON responses return `Response.ok(jsonEncode(data), headers: {'content-type': 'application/json'})`.
3. For file uploads use `_readMultipart(req)` — returns `Map<String, _MultipartField>`.
