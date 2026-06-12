# Hive Memories — Documentation

**Hive Memories** is an Android app for beekeepers to manage colonies, inspections, honey harvests and fillings. Inspections are captured by voice recording and automatically converted to text via on-device speech-to-text (Sherpa-ONNX); before recognition the recording is denoised (GTCRN) so that background noise such as bee buzzing does not corrupt the transcript. From the text, 10 status attributes (colony strength, queen, brood, temperament, etc.) are extracted via keyword matching. Harvests and fillings receive readable, freely configurable codes (default `E2026-001`, `F2026-001`) for end-to-end traceability from the colony to the filled jar. Via an integrated local HTTP server all data can be viewed in a browser on a laptop and exported/imported as SQLite/JSON/Excel. The interface is available in 25 languages with a light and dark design.

Current version: **1.9.0+1** · Platform: **Android** (Flutter-based)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Data Model](#4-data-model)
   - [4.1 Database Schema](#41-database-schema)
   - [4.2 Migrations](#42-migrations)
   - [4.3 Code Generation for Harvests & Fillings](#43-code-generation-for-harvests--fillings)
5. [Features](#5-features)
   - [5.1 Colonies, Splits and Dead Hives](#51-colonies-splits-and-dead-hives)
   - [5.2 Inspections (Voice Recording + STT)](#52-inspections-voice-recording--stt)
   - [5.3 Honey Harvests](#53-honey-harvests)
   - [5.4 Honey Fillings](#54-honey-fillings)
   - [5.5 Import/Export (local web server)](#55-importexport-local-web-server)
   - [5.6 Updates Feed](#56-updates-feed)
   - [5.7 Settings](#57-settings)
6. [Navigation](#6-navigation)
7. [Internationalization](#7-internationalization)
8. [Permissions](#8-permissions)
9. [Build & Run](#9-build--run)
10. [Extension Cheat Sheet](#10-extension-cheat-sheet)

---

## 1. Overview

Hive Memories accompanies a typical beekeeping workflow from colony management to filling:

```
Create colony
  └── Document inspections (audio → text → status chips)
       └── Harvest honey (extractor/drip/pressing/comb)
            └── Fill honey (into 250 g / 500 g / 1000 g jars)
                 └── Traceability via filling ID
                      └── Backup / transfer via Import/Export (local Wi-Fi server)
```

All data is stored locally in a SQLite database — no cloud, no login, no outgoing network requests. Speech recognition also runs entirely on-device. The import/export server binds exclusively to the local Wi-Fi.

---

## 2. Tech Stack

| Area | Used |
|---|---|
| Framework | Flutter (Dart SDK ≥ 3.6) |
| Persistence | `sqflite` 2.4.2+ (local SQLite database) |
| Audio recording | `record` 5.0+ |
| Audio playback | `just_audio` 0.10+ |
| Speech-to-text | `sherpa_onnx` (model: `sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06`) |
| Audio denoising | `sherpa_onnx` GTCRN denoiser (model: `gtcrn_simple.onnx`) |
| Localization (Material/date picker) | `flutter_localizations` (SDK) |
| LLM (optional) | `fllama` |
| State management | `provider` (LanguageProvider, SettingsProvider) |
| Persistent settings | `shared_preferences` (language, dark mode, code prefixes) |
| Display wake | `wakelock_plus` |
| Asset paths | `path`, `path_provider` |
| HTTP server | `shelf` 1.4+, `shelf_router` 1.1+ |
| Excel I/O | `excel` 4.0+ (pure Dart, read & write .xlsx) |
| Multipart parser | `mime` 1.0+ |

Target platform: **Android only**. iOS/desktop directories exist as Flutter defaults but are not maintained.

---

## 3. Project Structure

```
hive_memories/
├── android/                     # Android-specific manifest, Gradle
├── assets/
│   ├── images/Logo.png
│   ├── keywords/                # Keyword lists for InspectionStateExtractor
│   ├── models/sherpa-onnx-…/    # On-device STT model (encoder/decoder/joiner/tokens)
│   ├── models/gtcrn_simple.onnx # GTCRN denoiser (runs before STT recognition)
│   └── updates/updates.json     # Feed shown on the "Updates" page (with status tags)
├── lib/
│   ├── database/
│   │   └── database_helper.dart # Singleton, all SQL CRUD and migrations
│   ├── l10n/
│   │   └── app_strings.dart     # 25-language map + getters (custom i18n)
│   ├── models/
│   │   ├── hive_model.dart            # Colony/Split/Dead
│   │   ├── durchsicht_model.dart      # Inspection + 10 status enums
│   │   ├── honigernte_model.dart      # Harvest + harvest-type enum
│   │   ├── honigabfuellung_model.dart # Filling + variety and processing enums
│   │   └── app_language.dart          # List of all available languages
│   ├── pages/
│   │   ├── splash/
│   │   ├── hives/                     # List with 3 tabs (Colonies/Splits/Dead)
│   │   ├── hive_detail/               # Detail view of a colony + inspections
│   │   ├── neue_durchsicht/           # Recording + STT review
│   │   ├── honig_ernten/              # List + new-harvest form
│   │   ├── honig_abfuellen/           # List + new-filling form
│   │   ├── import_export/             # Server start/stop page with URL display
│   │   ├── updates/
│   │   ├── settings/                  # Language, dark mode, code labels
│   │   └── about/
│   ├── providers/
│   │   ├── language_provider.dart     # Current language (SharedPreferences-persisted)
│   │   └── settings_provider.dart     # Dark mode + code prefixes (SharedPreferences-persisted)
│   ├── services/
│   │   ├── sherpa_service.dart        # STT wrapper + GTCRN denoising (background isolate)
│   │   ├── inspection_state_extractor.dart  # Keyword matching
│   │   ├── llm_service.dart
│   │   ├── export_service.dart        # DB/JSON/Excel byte generation
│   │   ├── import_service.dart        # Parser, preview, transactional full-replace apply
│   │   └── http_server_service.dart   # Shelf server, web UI, upload/download routes
│   └── widgets/
│       └── app_scaffold.dart          # Hamburger drawer + IndexedStack of top pages
├── pubspec.yaml
├── documentation_DE.md          # Dokumentation (Deutsch)
└── documentation_EN.md          # Documentation (English) — this file
```

---

## 4. Data Model

### 4.1 Database Schema

File: `lib/database/database_helper.dart` · singleton pattern · current version: **7**.

#### Table `hives`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `name` | TEXT NOT NULL | |
| `standort` | TEXT NOT NULL DEFAULT '' | location |
| `status` | TEXT NOT NULL | Enum: `volk`/`ableger`/`tot` |
| `created_at` | TEXT NOT NULL | ISO-8601 |
| `tot_am` | TEXT | ISO-8601, nullable; set as soon as the status changes to `tot` (for "Declared dead on") |

#### Table `durchsichten`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `hive_id` | INTEGER NOT NULL | FK → `hives.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `audio_path` | TEXT | Local WAV path |
| `text` | TEXT NOT NULL | Transcribed inspection text |
| `volksstaerke` | TEXT | Enum |
| `koenigin` | TEXT | Enum |
| `brut` | TEXT | Enum |
| `sanftmut` | TEXT | Enum |
| `schwarmzellen` | INTEGER | Boolean (0/1) |
| `nachschaffungszellen` | INTEGER | Boolean (0/1) |
| `schwarm_abgegangen` | INTEGER | Boolean (0/1) |
| `varroa` | INTEGER | Boolean (0/1) |
| `futtervorrat` | TEXT | Enum (voll/ok/leer) |
| `honigraum` | TEXT | Enum (voll/ok/leer) |

#### Table `honigernten`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `code` | TEXT NOT NULL UNIQUE | Format from a configurable prefix, default `E{YEAR}-{NNN}` (see [§ 4.3](#43-code-generation-for-harvests--fillings)) |
| `hive_id` | INTEGER NOT NULL | FK → `hives.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `menge` | REAL NOT NULL | kg |
| `feuchtigkeit` | REAL NOT NULL | % |
| `art` | TEXT NOT NULL | Enum: `schleuder`/`tropf`/`pressen`/`wabe` |

#### Table `honigabfuellungen`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `code` | TEXT NOT NULL UNIQUE | Format from a configurable prefix, default `F{YEAR}-{NNN}` (see [§ 4.3](#43-code-generation-for-harvests--fillings)) |
| `ernte_id` | INTEGER NOT NULL | FK → `honigernten.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `jars_250g`, `jars_500g`, `jars_1000g` | INTEGER NOT NULL DEFAULT 0 | Number of jars per size |
| `sorte` | TEXT NOT NULL | Enum of 18 honey varieties |
| `verarbeitung` | TEXT NOT NULL | Enum: `geruehrt`/`fluessig` |
| `mhd` | TEXT NOT NULL | ISO-8601, derived from `datum + 1y` or `+ 2y` |

Via the two cascade relationships `hives → honigernten → honigabfuellungen`, deleting a colony automatically removes all its associated harvests and their fillings.

### 4.2 Migrations

`DatabaseHelper._initDB` opens the database with `version: 7`. The `onUpgrade` handler contains idempotent blocks `if (oldVersion < N)`:

- **v3**: restructure `hives` (status to lowercase, populate `created_at`), create `durchsichten` initially
- **v4**: added `hives.standort`
- **v5**: 10 inspection-state columns in `durchsichten`
- **v6**: created tables `honigernten` and `honigabfuellungen`
- **v7**: added `hives.tot_am` (timestamp of the dead declaration)

Fresh installs jump straight to the current version via `onCreate`.

### 4.3 Code Generation for Harvests & Fillings

Readable IDs are formed from a **configurable prefix template** plus a running number. The templates are managed in the settings (`SettingsProvider`, default `E{year}` for harvests and `F{year}` for fillings, see [§ 5.7](#57-settings)) and passed to the generators on save:

- `nextErnteCode(template)` and `nextFuellCode(template)` delegate to the shared helper `_nextCode(table, template)`.
- `_nextCode` replaces every `{year}` in the template with the current year (`E{year}` → `E2026`), looks up the highest existing `code` with that resolved prefix (`LIKE '<prefix>-%'`) and increments the last `-`-separated number by 1.

The running number is zero-padded to 3 digits and is **always** appended as `-{NNN}` — it is preserved regardless of the chosen prefix and thus secures traceability. The counter runs per resolved prefix (so for `{year}` templates, per year starting at `001`). Changing a prefix only affects **new** codes; existing entries keep their code, and the `UNIQUE` constraint on `code` still guarantees uniqueness.

---

## 5. Features

### 5.1 Colonies, Splits and Dead Hives

Three tabs on the hives page (`lib/pages/hives/hives_page.dart`):

- **Colonies** — productive production colonies
- **Splits** — young colonies / brood collectors
- **Dead** — perished colonies remain documented

When creating, the user picks name, location and status; long-press opens an edit/delete modal. Tap opens the detail view with all inspections.

Each card shows a date below the location: for colonies and splits **"Last inspection on: {date}"** (from the most recent inspection), for dead colonies **"Declared dead on: {date}"** (from `hives.tot_am`). `tot_am` is set the moment the status changes to `tot`. Cards without an available date (a colony with no inspection yet, or a legacy record without `tot_am`) hide the line. Both texts are localized in all 25 languages.

### 5.2 Inspections (Voice Recording + STT)

Recording an inspection (`lib/pages/neue_durchsicht/neue_durchsicht_page.dart`) goes through 5 states:

1. **idle** — ready screen with two options: **Start recording** (microphone) or **Enter directly** — the latter skips recording and jumps straight to text entry. A hint recommends a quiet environment.
2. **recording** — recording in progress (red stop icon)
3. **transcribing** — the recording is denoised and transcribed (see pipeline below)
4. **review** — the user edits the text before saving; above the text box there is a **date field** (default: today) that lets inspections be freely back-dated (retroactive entries). The date picker appears in the configured language (see [§ 7](#7-internationalization))
5. **saving** — insert with the chosen date + keyword extraction

Before recording starts, `AudioRecorder.hasPermission()` checks the system microphone permission (see [§ 8](#8-permissions)). During recording `wakelock_plus` keeps the screen awake; on leaving the recording state the wake lock is released again. Recording uses the microphone's speech mode (`AndroidAudioSource.voiceRecognition`) with noise suppression and echo cancellation enabled, so background noise is already attenuated at the source.

#### Audio Pipeline (in the background isolate)

`SherpaService` loads the recognizer and denoiser once into a background isolate (`sherpa_service.dart`) and processes each WAV file as follows:

1. **WAV parsing** — robust against truncated files (the data size is clamped to what is actually present) and against stereo (down-mix to mono); byte-alignment-safe.
2. **Empty/short guard** — clips under 0.25 s yield an empty transcript string instead of crashing the native recognizer with a near-empty buffer.
3. **GTCRN denoising** — `OfflineSpeechDenoiser` (`gtcrn_simple.onnx`) removes music/bee buzzing from the audio before it reaches the recognizer. Optional and fail-safe: if the model is missing, transcription proceeds without denoising.
4. **Block-wise recognition** — the audio is decoded in 30-second blocks so memory usage stays constant for long recordings (prevents OOM crashes).

> **Note:** Voice activity detection (Silero VAD) was evaluated but removed again — splitting into speech segments noticeably degraded recognition accuracy for unclear pronunciation. Noise robustness here comes from denoising, not from segmenting.

**State extraction**: `InspectionStateExtractor.extract(text)` analyzes the transcript text against the phrase lists in `assets/keywords/<locale>.json` and determines 10 structured states (colony strength, queen, brood, temperament, swarm cells, emergency cells, swarm issued, varroa, food stores, honey super). These are stored with the inspection and shown as colored chips in the detail view.

Matching properties (as of 1.6.0):

- **Phrase-based and case-insensitive** — the lists contain phrases that are unambiguous on their own (e.g. `"volk stark"` instead of just `"stark"`). There is no single-token heuristic anymore.
- **Negation via dedicated negative lists** (`varroa_negativ`, `koenigin_nicht_gesehen`, `brut_keine_brut`) instead of rule-based searching for "kein"/"nicht" around a keyword.
- **Brood components context-bound** — the generic keywords `brut_stifte_komponente`, `brut_maden_komponente` and `brut_verdeckelt_komponente` are only evaluated when the text additionally contains an entry from `brut_kontext`. This prevents wax-moth larvae, or pins mentioned in a comb-building context, from being wrongly interpreted as brood.

### 5.3 Honey Harvests

Top-level page (`lib/pages/honig_ernten/`).

**List** shows all harvests (DESC by date), fields per card: code, colony, date, amount, moisture, harvest type. **Long-press** opens a confirmation dialog to delete.

**New harvest** (form):
- **Colony** — dropdown over all hives with `status == volk`
- **Date** — picker, default today
- **Amount** (kg) — decimal field, comma or dot
- **Moisture** (%) — decimal field, validated to [0, 100]
- **Harvest type** — dropdown: extractor, drip, pressing, comb

Save → `nextErnteCode(template)` + `insertHonigernte(...)`, where `template` is the harvest prefix stored in the settings (default `E{year}`).

### 5.4 Honey Fillings

Top-level page (`lib/pages/honig_abfuellen/`).

**List**: shows all fillings with code, date, variety, total jars and best-before date. Top left a magnifier icon that reveals a search field on tap. Input filters live via `searchHonigabfuellungenByCode(LIKE %pattern%)` — suitable for partial inputs like `2026-04` or `F2026-042`. **Long-press** on an entry opens the delete dialog.

**New filling** (form):
- **Harvest** — dropdown over all honey harvests (shows code + kg)
- **Date** — picker, default today
- **Jar counts** — three integer fields for 250 g, 500 g, 1000 g (at least one > 0)
- **Variety** — dropdown over 18 varieties:
  - Frühtracht, Sommertracht, Waldhonig, Rapshonig, Robinienhonig (Akazienhonig), Lindenhonig, Wabenhonig, Tropfhonig, Sonnenblumenhonig, Kastanienhonig, Heidehonig, Tannenhonig, Phaceliahonig, Lavendelhonig, Thymianhonig, Kleehonig, Mischhonig, Sonstiges
- **Processing** — segmented button: Stirred / Liquid
- **Best-before** — segmented button +1 year / +2 years; the computed date is shown live (`DateTime(year + n, month, day)` — leap-year safe)

Save → `nextFuellCode(template)` + `insertHonigabfuellung(...)`, where `template` is the filling prefix stored in the settings (default `F{year}`).

### 5.5 Import/Export (local web server)

Top-level page (`lib/pages/import_export/import_export_page.dart`) + three services (`export_service.dart`, `import_service.dart`, `http_server_service.dart`).

In the app UI there is only one large **Start/Stop button** and a copyable URL. Once the server is running, you open the URL (e.g. `http://192.168.1.42:8080`) in the browser of any device on the **same Wi-Fi** — there you find the full dashboard with data tables, download buttons and an upload form. In the dashboard you can click a colony to filter the inspections/harvests/fillings below to that colony, and toggle a colony directly between *Volk* (colony) and *Ableger* (split) (`POST /api/hives/<id>/status`).

#### Server lifecycle

Singleton `HttpServerService.instance`:
- `start()` determines the Wi-Fi IP via `NetworkInterface.list()` (prefers `192.168.x.x`, `10.x.x.x`, `172.x.x.x`), tries ports **8080, 8081, 8082, 8088, 8090** in that order and returns the first free one.
- `stop()` closes the `HttpServer` handle (force) and clears the preview cache.
- `isRunning` / `url` for the UI.

When the app is closed the process is killed, and with it the server.

#### HTTP routes

```
GET  /                       → Dashboard with all data + export/import links
GET  /export/db              → Download hive_memories_YYYY-MM-DD.db (raw SQLite)
GET  /export/json            → Download hive_memories_YYYY-MM-DD.json (pretty-print)
GET  /export/excel           → Download hive_memories_YYYY-MM-DD.xlsx (4 sheets)
GET  /import                 → Upload form: format dropdown + file picker
POST /import                 → Parse + preview analysis → preview HTML
POST /import/apply           → Full replace via token → result page
POST /api/hives/<id>/status  → Change a colony's status (dashboard button, volk↔ableger)
```

#### Export formats

- **`.db`** — 1:1 byte copy of the running SQLite file. Fastest backup path and at the same time restorable via import.
- **`.json`** — hierarchical JSON with `version`, `exportedAt`, `app` and four arrays (`hives`, `durchsichten`, `honigernten`, `honigabfuellungen`). Pretty-printed, UTF-8.
- **`.xlsx`** — workbook with **four sheets** (`hives`, `durchsichten`, `honigernten`, `honigabfuellungen`), first row = column names, then data rows. Excel data types are preserved (integer, double, bool, text).

#### Import workflow

Import is **always a full replace** — there is no merge and no conflict strategies.

1. **Upload form** (`GET /import`): the user selects format (DB / JSON / Excel) and file; button "Analyze →".
2. **Parsing** (`POST /import`, `_handleImportUpload`): a format-specific parser builds a normalized `ImportData` structure (4 × `List<Map<String, dynamic>>`). On validation errors → HTTP 400 with error text.
3. **Preview analysis** (`ImportService.analyze`): builds a side-by-side of **Current** (row count in the running DB) vs **After import** (count of *valid* rows in the file) per entity. Invalid or orphaned rows are not counted and are collected as **warnings**: a colony without a name; an inspection/harvest/filling with a missing parent (`hive_id` / `ernte_id` not in the import set) or a missing `code`. There is **no** conflict detection against existing data.
4. **Preview page** (`_renderPreviewPage`): shows a **"⚠ Full replace" warning** (import deletes all current data and replaces it with the file; a safety backup is saved automatically beforehand), the *Current / After import* table, the warnings and **exactly one** button "Replace & import ✓" (plus Cancel). The parsed data is held under a token (16-byte hex) for up to 10 minutes in `_pending` (`_gcPending` evicts older entries).
5. **Apply** (`POST /import/apply`, `ImportService.apply`): fetches the data by token (otherwise "Session expired"), first writes a **JSON safety backup** of the current DB (`hive_memories.pre-import-backup.json` in the app documents folder, best effort), then performs the full replace in **one SQLite transaction**:
   - All four tables are cleared (children first: `honigabfuellungen` → `honigernten` → `durchsichten` → `hives`).
   - Then the file rows are inserted — **preserving the original IDs** (no id remapping). Rows with a missing required field (colony name, harvest/filling `code`) or an orphaned reference are skipped and counted in `skipped`.
   - For inspections, state columns **missing** in the file are extracted from the free text afterwards (`_resolveStates`); values present in the file are kept unchanged.
   - On exception → rollback of the entire transaction (existing data stays untouched).
6. **Result page** (`_renderResultPage`): a table **Entity | Imported** per category; if `skipped > 0`, a note about the number of skipped rows.

#### Security aspects

- The server binds to `InternetAddress.anyIPv4` → reachable for all devices on the same LAN/Wi-Fi. **No authentication** — assumption: trusted home network.
- No outgoing connections, no NAT traversal, no cloud.
- Schema validation on import: missing tables / columns are treated as empty lists; required fields (colony name, harvest code, FKs) are checked and problematic entries skipped, with warnings in the report.
- Database imports are opened **read-only** (separate temp file in `getTemporaryDirectory()`), deleted immediately after reading.

### 5.6 Updates Feed

`lib/pages/updates/updates_page.dart` loads `assets/updates/updates.json` via `rootBundle` and renders a vertical list of update cards. Each card contains title, date, optional **status chips**, description and a feature bullet list. The optional `tags` field (array) controls the chips, rendered in `widgets/update_card.dart`: `"update"` (blue), `"tlc"` (orange) and `"userwish"` (green); an entry can carry multiple tags. To add a new release, just add a JSON block (`title`, `date`, optional `tags`, `description`, `features`) — no code change needed.

### 5.7 Settings

`lib/pages/settings/settings_page.dart` is the central settings page. It bundles:

- **Dark mode** — `SwitchListTile`, toggles between light and dark design. Persisted via `SettingsProvider`; `MaterialApp` uses `theme`/`darkTheme` (both from the seed `0xFFF5A623` via `ColorScheme.fromSeed`, light + dark) and `themeMode`.
- **Code labels** — two fields for the code prefixes of harvests and fillings (default `E{year}` / `F{year}`). The `{year}` placeholder is replaced with the current year; a live preview ("→ E2026-001") shows the result. The running number is preserved (see [§ 4.3](#43-code-generation-for-harvests--fillings)).
- **Language** — the language selection moved here (previously in the drawer). Each language is a `ListTile`, the active entry with a check mark.

All settings are applied immediately via `SettingsProvider` / `LanguageProvider` and persisted in `SharedPreferences` — there is no save button.

---

## 6. Navigation

`lib/widgets/app_scaffold.dart` holds the hamburger drawer and an `IndexedStack` with seven top pages:

| Index | Page | Icon |
|---|---|---|
| 0 | HivesPage | `Icons.hive_outlined` |
| 1 | HonigErntenPage | `Icons.local_florist_outlined` |
| 2 | HonigAbfuellenPage | `Icons.inventory_2_outlined` |
| 3 | ImportExportPage | `Icons.import_export` |
| 4 | UpdatesPage | `Icons.article_outlined` |
| 5 | SettingsPage | `Icons.settings_outlined` |
| 6 | AboutPage | `Icons.info_outline` |

After the function pages (0–4) the drawer has a divider, below it **Settings** and **About**. The language selection moved to the settings page — the drawer no longer contains it directly.

Secondary navigation (detail pages, creation forms) is done throughout via `Navigator.push(MaterialPageRoute(...))` — **no** named routes, no GoRouter.

---

## 7. Internationalization

**Custom map system** in `lib/l10n/app_strings.dart` — deliberately without an `intl`/`easy_localization` dependency.

Structure:
- `class AppStrings` contains one getter per key: `String get xy => _t('xy')`.
- `static const Map<String, Map<String, String>> _strings` maps language code → key → translation.
- `_t(key)` falls back to English first on a missing translation, then to the key itself.

Access from widgets:

```dart
final s = AppStrings.of(context);
Text(s.honigErnten)
```

The selected language is held in `LanguageProvider` (based on `ChangeNotifier`) and persisted in `SharedPreferences`. `AppStrings.of(context)` calls `context.watch<LanguageProvider>()`, so the entire widget tree rebuilds automatically on a language change.

**Material widgets & date picker**: In addition to the custom system, `MaterialApp` (in `main.dart`) sets `locale`, `supportedLocales` and the `GlobalMaterialLocalizations`/`GlobalWidgetsLocalizations`/`GlobalCupertinoLocalizations` delegates from `flutter_localizations` based on the active language. This makes built-in widgets such as the date picker (new inspection) appear in the chosen language and the matching date format. For languages without bundled Material translations (currently **Maltese**), only the localization of the built-in widgets falls back to English via `localeResolutionCallback` — the app's own UI via `AppStrings` stays fully translated.

**Supported languages (25)**:
Deutsch, English, Français, Italiano, Español, Nederlands, Polski, Português, Svenska, Čeština, Русский, Українська, Hrvatski, Dansk, Suomi, Ελληνικά, Magyar, Eesti, Latviešu, Lietuvių, Malti, Română, Slovenčina, Slovenščina, Български.

**Note**: The app UI is fully localized. The web UI of the import/export server deliberately uses English — it is a power-user tool and is typically accessed from a laptop.

When adding new strings: **add a getter + an entry in all 25 language maps** — otherwise the string silently falls back to English.

---

## 8. Permissions

`AndroidManifest.xml` declares:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

- **`INTERNET`** is granted automatically on Android and is needed so the Shelf HTTP server can listen on a local port. **No** outgoing connections are made.
- **`RECORD_AUDIO`** must be requested at runtime since Android 6. This happens directly in the inspection flow: `AudioRecorder.hasPermission()` from the `record` package triggers the system permission dialog if the permission has not yet been granted. On denial a snackbar appears (`micPermissionDenied`) and recording does not start. No additional dependency (`permission_handler` etc.) is needed.

---

## 9. Build & Run

**Prerequisites**:
- Flutter SDK ≥ 3.6
- Android SDK + a device or emulator
- On the first build: `assets/models/sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06/` (≈ model weights) must be fully present, otherwise the STT service fails. Additionally the denoiser `assets/models/gtcrn_simple.onnx` is bundled (if missing, the app transcribes without denoising)

**Develop locally**:

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
1. Install the app on an Android device, on the same Wi-Fi as a laptop
2. In the app: drawer → Import/Export → "Start server"
3. Open the shown URL in the laptop browser
4. Perform any action (download, upload + preview + apply)

---

## 10. Extension Cheat Sheet

### Add a new top-level page
1. Create the page widget under `lib/pages/<feature>/` (Scaffold without an AppBar — `AppScaffold` provides it).
2. In `lib/widgets/app_scaffold.dart`: wire it into `_pages`, `pageTitles` and a new `ListTile`, adjust the indices.
3. Add an i18n key for the drawer title to all 25 languages.

### Add a new table / new model
1. Model under `lib/models/<name>_model.dart` (define enums inline).
2. `database_helper.dart`: increment the DB version, add the CREATE SQL in `onCreate` AND as a new `if (oldVersion < N)` block in `onUpgrade`.
3. Append CRUD methods and, if needed, a code generator (`next<X>Code()`) at the end of the class.
4. When adding import/export support: extend the column list in the `ExportService._fillSheet` calls and add a corresponding block in `ImportService.analyze` + `ImportService.apply` (conflict detection + FK remapping).

### Add a new i18n key
1. Add a getter in `AppStrings`.
2. Set an entry in **all 25** language maps in `_strings` — otherwise fallback to English (or the key name).

### Add a new persistent setting
1. Add a field, getter and `setX()` in `lib/providers/settings_provider.dart` (read the value from `SharedPreferences` in `load()`, write it in `setX()` + `notifyListeners()`).
2. Hook up a control in `lib/pages/settings/settings_page.dart`, bind it via `context.watch<SettingsProvider>()`.
3. Consumers read the value via `context.read/watch<SettingsProvider>()`.

### Make a new update visible in the feed
Just add a new block at the top of `assets/updates/updates.json` (`title`, `date`, optional `tags`, `description`, `features`). With `tags` (e.g. `["tlc","userwish"]`) colored status chips appear. No rebuild needed — the asset is reloaded on app start.

### Extend the status chips (inspection evaluation)
Add keyword lists in `assets/keywords/<locale>.json` and adjust `InspectionStateExtractor` in `lib/services/inspection_state_extractor.dart`. New phrases must be unambiguous on their own (no single tokens that match in foreign contexts). Generic components that can also occur outside the brood (e.g. larvae, pins) belong in a `*_komponente` list and are only evaluated together with an entry from `brut_kontext`.

### Add an HTTP route
1. Register a route in `HttpServerService._buildRouter()` (e.g. `r.get('/api/...', _handleXyz)`).
2. Implement the handler, returning `Response.ok(jsonEncode(data), headers: {'content-type': 'application/json'})` for JSON responses.
3. For file uploads use `_readMultipart(req)` — returns `Map<String, _MultipartField>`.
