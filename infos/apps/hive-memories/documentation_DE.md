# Hive Memories — Dokumentation

**Hive Memories** ist eine Android-App für Imker zur Verwaltung von Bienenvölkern, Durchsichten, Honigernten und Abfüllungen. Durchsichten werden per Sprachaufnahme erfasst und über ein On-Device Speech-to-Text (Sherpa-ONNX) automatisch in Text umgewandelt. Aus dem Text werden 10 Zustandsmerkmale (Volksstärke, Königin, Brut, Sanftmut etc.) per Keyword-Matching extrahiert. Ernten und Abfüllungen erhalten lesbare Codes (`E2026-001`, `F2026-001`) für die lückenlose Rückverfolgbarkeit vom Volk bis zum abgefüllten Glas. Über einen integrierten lokalen HTTP-Server können alle Daten im Browser am Laptop angesehen sowie als SQLite/JSON/Excel exportiert und importiert werden. Die Oberfläche ist in 24 Sprachen verfügbar.

Aktuelle Version: **1.6.0+1** · Plattform: **Android** (Flutter-basiert)

---

## Inhaltsverzeichnis

1. [Überblick](#1-überblick)
2. [Tech-Stack](#2-tech-stack)
3. [Projektstruktur](#3-projektstruktur)
4. [Datenmodell](#4-datenmodell)
   - [4.1 Datenbankschema](#41-datenbankschema)
   - [4.2 Migrationen](#42-migrationen)
   - [4.3 Code-Generierung für Ernten & Abfüllungen](#43-code-generierung-für-ernten--abfüllungen)
5. [Features](#5-features)
   - [5.1 Völker, Ableger und Tote](#51-völker-ableger-und-tote)
   - [5.2 Durchsichten (Sprachaufnahme + STT)](#52-durchsichten-sprachaufnahme--stt)
   - [5.3 Honig Ernten](#53-honig-ernten)
   - [5.4 Honig Abfüllen](#54-honig-abfüllen)
   - [5.5 Import/Export (lokaler Web-Server)](#55-importexport-lokaler-web-server)
   - [5.6 Updates-Feed](#56-updates-feed)
6. [Navigation](#6-navigation)
7. [Internationalisierung](#7-internationalisierung)
8. [Berechtigungen](#8-berechtigungen)
9. [Build & Ausführung](#9-build--ausführung)
10. [Erweiterungs-Cheatsheet](#10-erweiterungs-cheatsheet)

---

## 1. Überblick

Hive Memories begleitet einen typischen Imker-Workflow von der Volkführung bis zur Abfüllung:

```
Volk anlegen
  └── Durchsichten dokumentieren (Audio → Text → Zustandschips)
       └── Honig ernten (Schleuder/Tropf/Pressen/Wabe)
            └── Honig abfüllen (in 250 g / 500 g / 1000 g Gläser)
                 └── Rückverfolgbarkeit per Füll-ID
                      └── Backup / Tausch via Import/Export (lokaler WLAN-Server)
```

Alle Daten liegen lokal in einer SQLite-Datenbank — keine Cloud, keine Anmeldung, keine ausgehenden Netzwerkanfragen. Auch die Spracherkennung läuft vollständig on-device. Der Import/Export-Server bindet sich ausschließlich an das lokale WLAN.

---

## 2. Tech-Stack

| Bereich | Verwendet |
|---|---|
| Framework | Flutter (Dart-SDK ≥ 3.6) |
| Persistenz | `sqflite` 2.4.2+ (lokale SQLite-Datenbank) |
| Audio-Aufnahme | `record` 5.0+ |
| Audio-Wiedergabe | `just_audio` 0.10+ |
| Speech-to-Text | `sherpa_onnx` (Modell: `sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06`) |
| LLM (optional) | `fllama` |
| State Management | `provider` (LanguageProvider) |
| Persistente Settings | `shared_preferences` |
| Display-Wake | `wakelock_plus` |
| Asset-Pfade | `path`, `path_provider` |
| HTTP-Server | `shelf` 1.4+, `shelf_router` 1.1+ |
| Excel I/O | `excel` 4.0+ (pure Dart, .xlsx lesen & schreiben) |
| Multipart-Parser | `mime` 1.0+ |

Zielplattform: **ausschließlich Android**. iOS/Desktop-Verzeichnisse sind als Flutter-Standard vorhanden, werden aber nicht gepflegt.

---

## 3. Projektstruktur

```
hive_memories/
├── android/                     # Android-spezifisches Manifest, Gradle
├── assets/
│   ├── images/Logo.png
│   ├── keywords/                # Keyword-Listen für InspectionStateExtractor
│   ├── models/sherpa-onnx-…/    # On-Device STT-Modell (encoder/decoder/joiner/tokens)
│   └── updates/updates.json     # Anzeige-Feed der "Updates"-Seite
├── lib/
│   ├── database/
│   │   └── database_helper.dart # Singleton, alle SQL-CRUD und Migrationen
│   ├── l10n/
│   │   └── app_strings.dart     # 24-Sprachen-Map + Getter (Custom-i18n)
│   ├── models/
│   │   ├── hive_model.dart            # Volk/Ableger/Tot
│   │   ├── durchsicht_model.dart      # Durchsicht + 10 Zustands-Enums
│   │   ├── honigernte_model.dart      # Ernte + Ernteart-Enum
│   │   ├── honigabfuellung_model.dart # Abfüllung + Sorten- und Verarbeitung-Enums
│   │   └── app_language.dart          # Liste aller verfügbaren Sprachen
│   ├── pages/
│   │   ├── splash/
│   │   ├── hives/                     # Liste mit 3 Tabs (Völker/Ableger/Tot)
│   │   ├── hive_detail/               # Detailansicht eines Volks + Durchsichten
│   │   ├── neue_durchsicht/           # Aufnahme + STT-Review
│   │   ├── honig_ernten/              # Liste + Neue-Ernte-Formular
│   │   ├── honig_abfuellen/           # Liste + Neue-Abfüllung-Formular
│   │   ├── import_export/             # Server-Start/Stop-Page mit URL-Anzeige
│   │   ├── updates/
│   │   └── about/
│   ├── providers/
│   │   └── language_provider.dart     # Aktuelle Sprache (SharedPreferences-persistiert)
│   ├── services/
│   │   ├── sherpa_service.dart        # STT-Wrapper
│   │   ├── inspection_state_extractor.dart  # Keyword-Matching
│   │   ├── llm_service.dart
│   │   ├── export_service.dart        # DB/JSON/Excel-Byte-Generierung
│   │   ├── import_service.dart        # Parser, Konflikt-Analyse, transaktionaler Apply
│   │   └── http_server_service.dart   # Shelf-Server, Web-UI, Upload/Download-Routen
│   └── widgets/
│       └── app_scaffold.dart          # Hamburger-Drawer + IndexedStack der Top-Pages
├── pubspec.yaml
└── documentation.md             # ← diese Datei
```

---

## 4. Datenmodell

### 4.1 Datenbankschema

Datei: `lib/database/database_helper.dart` · Singleton-Pattern · Aktuelle Version: **6**.

#### Tabelle `hives`

| Spalte | Typ | Notizen |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `name` | TEXT NOT NULL | |
| `standort` | TEXT NOT NULL DEFAULT '' | |
| `status` | TEXT NOT NULL | Enum: `volk`/`ableger`/`tot` |
| `created_at` | TEXT NOT NULL | ISO-8601 |

#### Tabelle `durchsichten`

| Spalte | Typ | Notizen |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `hive_id` | INTEGER NOT NULL | FK → `hives.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `audio_path` | TEXT | Lokaler WAV-Pfad |
| `text` | TEXT NOT NULL | Transkribierter Inspektionstext |
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

#### Tabelle `honigernten`

| Spalte | Typ | Notizen |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `code` | TEXT NOT NULL UNIQUE | Format: `E{JAHR}-{NNN}` |
| `hive_id` | INTEGER NOT NULL | FK → `hives.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `menge` | REAL NOT NULL | kg |
| `feuchtigkeit` | REAL NOT NULL | % |
| `art` | TEXT NOT NULL | Enum: `schleuder`/`tropf`/`pressen`/`wabe` |

#### Tabelle `honigabfuellungen`

| Spalte | Typ | Notizen |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `code` | TEXT NOT NULL UNIQUE | Format: `F{JAHR}-{NNN}` |
| `ernte_id` | INTEGER NOT NULL | FK → `honigernten.id` (ON DELETE CASCADE) |
| `datum` | TEXT NOT NULL | ISO-8601 |
| `jars_250g`, `jars_500g`, `jars_1000g` | INTEGER NOT NULL DEFAULT 0 | Gläseranzahl je Größe |
| `sorte` | TEXT NOT NULL | Enum aus 18 Honigsorten |
| `verarbeitung` | TEXT NOT NULL | Enum: `geruehrt`/`fluessig` |
| `mhd` | TEXT NOT NULL | ISO-8601, abgeleitet aus `datum + 1J` oder `+ 2J` |

Durch die zwei Cascade-Beziehungen `hives → honigernten → honigabfuellungen` löscht ein gelöschtes Volk automatisch alle zugehörigen Ernten und deren Abfüllungen.

### 4.2 Migrationen

`DatabaseHelper._initDB` öffnet die Datenbank mit `version: 6`. Der `onUpgrade`-Handler enthält idempotente Blöcke `if (oldVersion < N)`:

- **v3**: Restrukturierung `hives` (Status zu lowercase, `created_at` befüllen), `durchsichten` initial anlegen
- **v4**: `hives.standort` ergänzt
- **v5**: 10 Inspektionszustands-Spalten in `durchsichten`
- **v6**: Tabellen `honigernten` und `honigabfuellungen` angelegt

Neuinstallationen springen direkt zur aktuellen Version via `onCreate`.

### 4.3 Code-Generierung für Ernten & Abfüllungen

Lesbare IDs nach Schema `E{JAHR}-{NNN}` / `F{JAHR}-{NNN}` werden in zwei Helfern erzeugt:

- `nextErnteCode()` — sucht den höchsten `code` mit Präfix `E{JAHR}-` und inkrementiert um 1.
- `nextFuellCode()` — analog mit Präfix `F{JAHR}-`.

Die laufende Nummer ist 3-stellig zero-padded. Pro Jahr beginnt der Zähler bei `001`. Eindeutigkeit garantiert zusätzlich der `UNIQUE`-Constraint auf der Spalte `code`.

---

## 5. Features

### 5.1 Völker, Ableger und Tote

Drei Tabs auf der Hives-Seite (`lib/pages/hives/hives_page.dart`):

- **Völker** — produktive Wirtschaftsvölker
- **Ableger** — Jungvölker / Brutsammler
- **Tot** — eingegangene Völker bleiben dokumentiert

Beim Anlegen wählt der User Name, Standort und Status; Long-Press öffnet ein Edit/Delete-Modal. Tap öffnet die Detailansicht mit allen Durchsichten.

### 5.2 Durchsichten (Sprachaufnahme + STT)

Die Aufnahme einer Durchsicht (`lib/pages/neue_durchsicht/neue_durchsicht_page.dart`) durchläuft 5 States:

1. **idle** — Bereit-Bildschirm mit Mikrofon-Icon
2. **recording** — Aufnahme läuft (rotes Stop-Icon)
3. **transcribing** — Sherpa-ONNX transkribiert die WAV-Datei
4. **review** — User kann den Text vor dem Speichern editieren
5. **saving** — Insert + Keyword-Extraktion

Vor Aufnahmestart wird via `AudioRecorder.hasPermission()` die System-Berechtigung für das Mikrofon geprüft (siehe [§ 8](#8-berechtigungen)). Während der Aufnahme hält `wakelock_plus` den Bildschirm aktiv; beim Verlassen des Recording-States wird der Wake-Lock wieder freigegeben.

**Zustandsextraktion**: `InspectionStateExtractor.extract(text)` analysiert den Transkript-Text gegen die Phrasen-Listen in `assets/keywords/<locale>.json` und ermittelt 10 strukturierte Zustände (Volksstärke, Königin, Brut, Sanftmut, Schwarmzellen, Nachschaffungszellen, Schwarm abgegangen, Varroa, Futtervorrat, Honigraum). Diese werden mit der Durchsicht gespeichert und in der Detailansicht als farbige Chips angezeigt.

Matching-Eigenschaften (Stand 1.6.0):

- **Phrasen-basiert und case-insensitive** — die Listen enthalten Phrasen, die für sich eindeutig sind (z. B. `"volk stark"` statt nur `"stark"`). Es gibt keine Einzeltoken-Heuristik mehr.
- **Negation über dedizierte Negativ-Listen** (`varroa_negativ`, `koenigin_nicht_gesehen`, `brut_keine_brut`) statt regelbasierter Suche nach "kein"/"nicht" rund um ein Schlüsselwort.
- **Brut-Komponenten kontext-gebunden** — die generischen Keywords `brut_stifte_komponente`, `brut_maden_komponente` und `brut_verdeckelt_komponente` werden nur ausgewertet, wenn der Text zusätzlich einen Eintrag aus `brut_kontext` enthält. Dadurch werden Wachsmotten-Maden oder im Bau-Kontext genannte Stifte nicht mehr fälschlich als Brut interpretiert.

### 5.3 Honig Ernten

Top-Level-Seite (`lib/pages/honig_ernten/`).

**Liste** zeigt alle Ernten (DESC nach Datum), Felder pro Karte: Code, Volk, Datum, Menge, Feuchtigkeit, Erntart. **Long-Press** öffnet einen Bestätigungs-Dialog zum Löschen.

**Neue Ernte** (Formular):
- **Volk** — Dropdown über alle Hives mit `status == volk`
- **Datum** — Picker, Default heute
- **Menge** (kg) — Dezimalfeld, Komma oder Punkt
- **Feuchtigkeit** (%) — Dezimalfeld, validiert auf [0, 100]
- **Erntart** — Dropdown: Schleuder, Tropf, Pressen, Wabe

Speichern → `nextErnteCode()` + `insertHonigernte(...)`.

### 5.4 Honig Abfüllen

Top-Level-Seite (`lib/pages/honig_abfuellen/`).

**Liste**: zeigt alle Abfüllungen mit Code, Datum, Sorte, Gläsersumme und MHD. Oben links ein Lupen-Icon, das beim Tap ein Suchfeld einblendet. Die Eingabe filtert live per `searchHonigabfuellungenByCode(LIKE %pattern%)` — geeignet für Teil-Eingaben wie `2026-04` oder `F2026-042`. **Long-Press** auf einen Eintrag öffnet den Lösch-Dialog.

**Neue Abfüllung** (Formular):
- **Ernte** — Dropdown über alle Honigernten (zeigt Code + kg)
- **Datum** — Picker, Default heute
- **Glasmengen** — drei Integer-Felder für 250 g, 500 g, 1000 g (mindestens eines > 0)
- **Sorte** — Dropdown über 18 Sorten:
  - Frühtracht, Sommertracht, Waldhonig, Rapshonig, Robinienhonig (Akazienhonig), Lindenhonig, Wabenhonig, Tropfhonig, Sonnenblumenhonig, Kastanienhonig, Heidehonig, Tannenhonig, Phaceliahonig, Lavendelhonig, Thymianhonig, Kleehonig, Mischhonig, Sonstiges
- **Verarbeitung** — Segmented Button: Gerührt / Flüssig
- **MHD** — Segmented Button +1 Jahr / +2 Jahre; das berechnete Datum wird live angezeigt (`DateTime(year + n, month, day)` — schaltjahrsicher)

Speichern → `nextFuellCode()` + `insertHonigabfuellung(...)`.

### 5.5 Import/Export (lokaler Web-Server)

Top-Level-Seite (`lib/pages/import_export/import_export_page.dart`) + drei Services (`export_service.dart`, `import_service.dart`, `http_server_service.dart`).

In der App-UI gibt es nur einen großen **Start/Stop-Button** und eine kopierbare URL. Sobald der Server läuft, öffnet man die URL (z.B. `http://192.168.1.42:8080`) im Browser eines beliebigen Geräts im **selben WLAN** — dort liegt das volle Dashboard mit Daten-Tabellen, Download-Buttons und Upload-Formular.

#### Server-Lifecycle

Singleton `HttpServerService.instance`:
- `start()` ermittelt die WLAN-IP per `NetworkInterface.list()` (bevorzugt `192.168.x.x`, `10.x.x.x`, `172.x.x.x`), probiert die Ports **8080, 8081, 8082, 8088, 8090** in dieser Reihenfolge und gibt den ersten freien zurück.
- `stop()` schließt das `HttpServer`-Handle (force) und leert den Preview-Cache.
- `isRunning` / `url` für die UI.

Beim Beenden der App wird der Prozess gekillt, der Server damit ebenfalls.

#### HTTP-Routen

```
GET  /                  → Dashboard mit allen Daten + Export-/Import-Links
GET  /export/db         → Download hive_memories_YYYY-MM-DD.db (Roh-SQLite)
GET  /export/json       → Download hive_memories_YYYY-MM-DD.json (Pretty-Print)
GET  /export/excel      → Download hive_memories_YYYY-MM-DD.xlsx (4 Sheets)
GET  /import            → Upload-Formular: Format-Dropdown + File-Picker
POST /import            → Parse + Konflikt-Analyse → Preview-HTML
POST /import/apply      → Transaktionaler Apply mit Strategien → Ergebnis-Seite
```

#### Export-Formate

- **`.db`** — 1:1-Bytekopie der laufenden SQLite-Datei. Schnellster Backup-Pfad und gleichzeitig restorefähig per Import.
- **`.json`** — Hierarchisches JSON mit `version`, `exportedAt`, `app` und vier Arrays (`hives`, `durchsichten`, `honigernten`, `honigabfuellungen`). Pretty-printed, UTF-8.
- **`.xlsx`** — Workbook mit **vier Sheets** (`hives`, `durchsichten`, `honigernten`, `honigabfuellungen`), erste Zeile = Spaltennamen, danach Datenzeilen. Excel-Datentypen werden erhalten (Integer, Double, Bool, Text).

#### Import-Workflow

1. **Upload-Formular** (`GET /import`): User wählt Format (DB / JSON / Excel) und Datei.
2. **Parsing** (`POST /import`): Format-spezifischer Parser baut eine normalisierte `ImportData`-Struktur (4 `List<Map<String, dynamic>>`). Bei Parse-Fehlern → HTTP 400 mit Fehlertext.
3. **Konflikt-Analyse** (`ImportService.analyze`): Zählt pro Entität **Neu**, **Konflikte** (Match auf existierende Daten) und **Verwaiste** (Kind-Records, deren Parent im Import-Set fehlt):
   - **Völker**: Konfliktdetektion via case-insensitive `name`.
   - **Durchsichten**: keine Conflict-Match, nur Orphan-Check (referenzierte `hive_id` muss im Import-Set vorkommen).
   - **Honigernten**: Konflikt via `code`. Orphan-Check für `hive_id`.
   - **Honigabfüllungen**: Konflikt via `code`. Orphan-Check für `ernte_id`.
4. **Preview-Seite**: Tabelle mit den Zahlen + ein Radio-Set pro Kategorie (`skip` / `overwrite`). Overwrite-Radio wird nur eingeblendet, wenn Konflikte existieren. Token (16-Byte Hex) hält die geparsten Daten 10 Minuten in `_pendingImports`.
5. **Apply** (`POST /import/apply`): User submitten Strategie + Token. `ImportService.apply` läuft in einer **SQLite-Transaktion**:
   - Hives: Skip → Source-ID wird auf existierende ID gemappt (Children hängen sich dort an); Overwrite → Felder werden aktualisiert; Neu → Insert mit neuer ID.
   - Durchsichten: Insert mit gemappter `hive_id`. Orphan → skip.
   - Ernten / Abfüllungen analog zu Hives, FK-Remapping über zwei id-Maps (`hiveIdMap`, `ernteIdMap`).
   - Bei Exception → Rollback der gesamten Transaktion.
6. **Ergebnis-Seite**: Tabelle mit Inserted / Updated / Skipped pro Kategorie.

#### Sicherheitsaspekte

- Server bindet auf `InternetAddress.anyIPv4` → erreichbar für alle Geräte im selben LAN/WLAN. **Keine Authentifizierung** — Annahme: vertrauenswürdiges Heimnetzwerk.
- Keine ausgehenden Verbindungen, kein NAT-Traversal, keine Cloud.
- Schema-Validierung beim Import: fehlende Tabellen / Spalten werden als leere Listen behandelt; Pflichtfelder (Volk-Name, Ernte-Code, FKs) werden geprüft und problematische Einträge übersprungen, mit Warnungen im Report.
- Datenbank-Imports werden **read-only** geöffnet (separate Temp-Datei in `getTemporaryDirectory()`), nach dem Auslesen sofort gelöscht.

### 5.6 Updates-Feed

`lib/pages/updates/updates_page.dart` lädt `assets/updates/updates.json` per `rootBundle` und rendert eine vertikale Liste von Update-Karten. Jede Karte enthält Titel, Datum, Beschreibung und eine Feature-Bullet-Liste. Beim Hinzufügen eines neuen Releases einfach einen JSON-Block ergänzen — keine Code-Änderung nötig.

---

## 6. Navigation

`lib/widgets/app_scaffold.dart` hält den Hamburger-Drawer und einen `IndexedStack` mit sechs Top-Pages:

| Index | Page | Icon |
|---|---|---|
| 0 | HivesPage | `Icons.hive_outlined` |
| 1 | HonigErntenPage | `Icons.local_florist_outlined` |
| 2 | HonigAbfuellenPage | `Icons.inventory_2_outlined` |
| 3 | ImportExportPage | `Icons.import_export` |
| 4 | UpdatesPage | `Icons.article_outlined` |
| 5 | AboutPage | `Icons.info_outline` |

Unter den Drawer-Einträgen folgt ein Trennstrich und die Sprachauswahl (RadioListTiles für alle 24 Sprachen).

Sekundäre Navigation (Detailseiten, Neuanlage-Formulare) erfolgt durchgängig per `Navigator.push(MaterialPageRoute(...))` — **keine** Named Routes, kein GoRouter.

---

## 7. Internationalisierung

**Custom-Map-System** in `lib/l10n/app_strings.dart` — bewusst ohne `intl`/`easy_localization`-Dependency.

Aufbau:
- `class AppStrings` enthält pro Key einen Getter `String get xy => _t('xy')`.
- `static const Map<String, Map<String, String>> _strings` mappt Sprach-Code → Key → Übersetzung.
- `_t(key)` fällt bei fehlender Übersetzung erst auf Englisch zurück, dann auf den Key selbst.

Zugriff aus Widgets:

```dart
final s = AppStrings.of(context);
Text(s.honigErnten)
```

Die gewählte Sprache wird in `LanguageProvider` (auf `ChangeNotifier`-Basis) gehalten und in `SharedPreferences` persistiert. `AppStrings.of(context)` ruft `context.watch<LanguageProvider>()`, dadurch baut sich der gesamte Widget-Baum bei Sprachwechsel automatisch neu auf.

**Unterstützte Sprachen (24)**:
Deutsch, English, Français, Italiano, Español, Nederlands, Polski, Português, Svenska, Čeština, Русский, Українська, Hrvatski, Dansk, Suomi, Ελληνικά, Magyar, Eesti, Latviešu, Lietuvių, Malti, Română, Slovenčina, Slovenščina, Български.

**Hinweis**: Die App-UI ist vollständig lokalisiert. Die Web-UI des Import/Export-Servers verwendet bewusst Englisch — sie ist ein Power-User-Werkzeug und wird typischerweise vom Laptop aus aufgerufen.

Beim Hinzufügen neuer Strings: **Getter ergänzen + Eintrag in alle 24 Sprach-Maps** — sonst fällt der String stillschweigend auf Englisch zurück.

---

## 8. Berechtigungen

`AndroidManifest.xml` deklariert:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

- **`INTERNET`** ist auf Android automatisch erteilt und wird benötigt, damit der Shelf-HTTP-Server an einem lokalen Port lauschen kann. Es werden **keine** ausgehenden Verbindungen aufgebaut.
- **`RECORD_AUDIO`** muss ab Android 6 zur Laufzeit angefordert werden. Dies geschieht direkt im Flow der Durchsicht: `AudioRecorder.hasPermission()` aus dem `record`-Package löst den System-Permission-Dialog aus, falls die Berechtigung noch nicht erteilt ist. Bei Verweigerung erscheint ein Snackbar (`micPermissionDenied`), die Aufnahme startet nicht. Keine zusätzliche Dependency (`permission_handler` o.ä.) nötig.

---

## 9. Build & Ausführung

**Voraussetzungen**:
- Flutter SDK ≥ 3.6
- Android SDK + ein Gerät oder Emulator
- Bei erstem Build: `assets/models/sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06/` (≈ Modellgewichte) muss vollständig vorhanden sein, sonst schlägt der STT-Service fehl

**Lokal entwickeln**:

```powershell
flutter pub get
flutter run
```

**APK bauen**:

```powershell
flutter build apk --release
```

**Statische Analyse**:

```powershell
flutter analyze
```

**Import/Export testen**:
1. App auf Android-Gerät installieren, Gerät im selben WLAN wie ein Laptop
2. In der App: Drawer → Import/Export → "Server starten"
3. Angezeigte URL im Laptop-Browser öffnen
4. Beliebige Aktion durchführen (Download, Upload + Preview + Apply)

---

## 10. Erweiterungs-Cheatsheet

### Neue Top-Level-Seite anlegen
1. Page-Widget unter `lib/pages/<feature>/` erstellen (Scaffold ohne AppBar — die liefert `AppScaffold`).
2. In `lib/widgets/app_scaffold.dart`: in `_pages`, `pageTitles` und neuem `ListTile` einbinden, Indices anpassen.
3. i18n-Key für den Drawer-Titel zu allen 24 Sprachen ergänzen.

### Neue Tabelle / neues Modell hinzufügen
1. Model unter `lib/models/<name>_model.dart` (Enums inline definieren).
2. `database_helper.dart`: DB-Version inkrementieren, CREATE-SQL in `onCreate` UND als neuen `if (oldVersion < N)`-Block in `onUpgrade` einfügen.
3. CRUD-Methoden und ggf. Code-Generator (`next<X>Code()`) am Ende der Klasse anhängen.
4. Beim Erweitern um Import/Export-Unterstützung: Spaltenliste in `ExportService._fillSheet`-Aufrufen ergänzen und einen entsprechenden Block in `ImportService.analyze` + `ImportService.apply` ergänzen (Konfliktdetektion + FK-Remapping).

### Neuen i18n-Key hinzufügen
1. Getter in `AppStrings` ergänzen.
2. Eintrag in **allen 24** Sprach-Maps in `_strings` setzen — sonst Fallback auf Englisch (oder den Key-Namen).

### Neues Update im Feed sichtbar machen
Einfach einen neuen Block oben in `assets/updates/updates.json` einfügen (`title`, `date`, `description`, `features`). Kein Rebuild nötig — Asset wird beim App-Start neu geladen.

### Zustandschips erweitern (Durchsicht-Auswertung)
Keyword-Listen in `assets/keywords/<locale>.json` ergänzen und `InspectionStateExtractor` in `lib/services/inspection_state_extractor.dart` anpassen. Neue Phrasen müssen für sich eindeutig sein (keine Einzeltoken, die in fremden Kontexten matchen). Generische Komponenten, die auch außerhalb der Brut vorkommen können (z. B. Maden, Stifte), gehören in eine `*_komponente`-Liste und werden nur in Verbindung mit einem Eintrag aus `brut_kontext` ausgewertet.

### HTTP-Route hinzufügen
1. In `HttpServerService._buildRouter()` eine Route registrieren (z.B. `r.get('/api/...', _handleXyz)`).
2. Handler implementieren, dabei für JSON-Antworten `Response.ok(jsonEncode(data), headers: {'content-type': 'application/json'})` zurückgeben.
3. Bei Datei-Uploads `_readMultipart(req)` nutzen — gibt `Map<String, _MultipartField>` zurück.
