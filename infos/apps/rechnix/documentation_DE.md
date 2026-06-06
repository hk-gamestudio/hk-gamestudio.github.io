# Rechnix – Dokumentation

**Rechnix** ist eine Android-App für Einzelunternehmer, Freiberufler und Kleingewerbe, die ihren
Gewinn per **Einnahmenüberschussrechnung (EÜR)** ermitteln. Sie automatisiert die beiden
zeitaufwändigsten Aufgaben: das **Erfassen von Belegen** (per Foto oder PDF, mit On-Device-OCR und
automatischer Felderkennung) und das **Erstellen von Rechnungen** (inkl. E-Rechnung). Daraus leitet
Rechnix EÜR, Umsatzsteuer-Voranmeldung und Exporte für den Steuerberater ab.

**Datenschutz by Design:** Rechnix arbeitet vollständig **offline**. Alle Daten bleiben
**verschlüsselt auf dem Gerät** – keine Cloud, kein Tracking, keine Werbung.

> **Hinweis:** Rechnix unterstützt bei Erfassung und Vorbereitung und ersetzt **keine
> Steuerberatung**. Die steuerliche Verantwortung verbleibt beim Nutzer bzw. Steuerberater.

---

## Inhaltsverzeichnis

1. [Überblick](#1-überblick)
2. [Funktionen auf einen Blick](#2-funktionen-auf-einen-blick)
3. [Systemvoraussetzungen](#3-systemvoraussetzungen)
4. [Erste Schritte](#4-erste-schritte)
5. [Navigation und Aufbau](#5-navigation-und-aufbau)
6. [Übersicht (Dashboard)](#6-übersicht-dashboard)
7. [Belege](#7-belege)
8. [Rechnungen](#8-rechnungen)
9. [Kunden und Artikel](#9-kunden-und-artikel)
10. [Offene Posten und Mahnwesen](#10-offene-posten-und-mahnwesen)
11. [Auswertung EÜR und Export](#11-auswertung-eür-und-export)
12. [USt-Voranmeldung](#12-ust-voranmeldung)
13. [Anlagen und GWG](#13-anlagen-und-gwg)
14. [Fahrtenbuch](#14-fahrtenbuch)
15. [Steuertermine](#15-steuertermine)
16. [Betrieb und Einstellungen](#16-betrieb-und-einstellungen)
17. [Backup und Wiederherstellung](#17-backup-und-wiederherstellung)
18. [Datenschutz und Sicherheit](#18-datenschutz-und-sicherheit)
19. [GoBD und rechtliche Grundlagen](#19-gobd-und-rechtliche-grundlagen)
20. [Technische Architektur](#20-technische-architektur)
21. [Build und Veröffentlichung](#21-build-und-veröffentlichung)
22. [Datenmodell](#22-datenmodell)
23. [Glossar](#23-glossar)
24. [FAQ](#24-faq)
25. [Haftungsausschluss](#25-haftungsausschluss)

---

## 1. Überblick

Rechnix richtet sich an Selbstständige mit **EÜR-Pflicht** (§4 Abs. 3 EStG) – also dort, wo keine
doppelte Buchführung/Bilanz nötig ist (zulässig u. a. bis 800.000 € Umsatz bzw. 80.000 € Gewinn).

Die App verfolgt drei Grundprinzipien:

- **Automatisierung:** Belege werden fotografiert/importiert und per On-Device-OCR ausgewertet
  („wo, wann, was, wie viel"). Rechnungen entstehen aus einem vorab gestalteten Layout.
- **Rechtssicherheit:** Originalbelege werden unveränderbar abgelegt (Hash + Audit-Log,
  GoBD-orientiert). Rechnungen erfüllen die Pflichtangaben nach §14 UStG.
- **Datenhoheit:** Alles bleibt lokal und verschlüsselt; es gibt keine Server von Rechnix.

## 2. Funktionen auf einen Blick

| Bereich | Funktion |
|---|---|
| Belege | Foto-Scan, PDF/Bild-Import, E-Rechnung einlesen, OCR, Auto-Klassifikation, GoBD-Festschreiben |
| Rechnungen | Baukasten-Layout, Editor mit §14-Prüfung, PDF, E-Rechnung (ZUGFeRD/XRechnung) |
| Auswertung | EÜR-Gewinnermittlung, Zeitraumfilter, Export CSV/PDF/DATEV |
| Umsatzsteuer | USt-Voranmeldung (Kennzahlen), Kleinunternehmer §19 |
| Forderungen | Offene Posten, Überfälligkeit, Mahnstufen/Mahnungen als PDF |
| Stammdaten | Kunden, Artikel/Leistungen, Unternehmensprofil |
| Anlagevermögen | GWG- und AfA-Verzeichnis |
| Mobilität | Fahrtenbuch mit km-Pauschale |
| Organisation | Steuertermin-Erinnerungen, verschlüsseltes Backup |
| Sicherheit | Verschlüsselte DB, App-Sperre (Biometrie), Hell/Dunkel-Modus |

## 3. Systemvoraussetzungen

- **Android 8.0 (API 26)** oder neuer
- Für Foto-Scan: Google Play-Dienste (stellen den Dokumentenscanner bereit)
- Speicherplatz für App + lokale, verschlüsselte Datenbank und Originalbelege
- Keine Internetverbindung für den Betrieb nötig (reiner Offline-Betrieb)

## 4. Erste Schritte

1. **App starten.** Beim ersten Start erscheint der Splashscreen, danach die Übersicht.
2. **Betrieb anlegen:** Menü → **Betrieb**. Trage Name, Anschrift, **Steuernummer** und ggf.
   **USt-IdNr.** ein. Lege fest, ob du **Kleinunternehmer (§19)** bist, die **Besteuerungsart**
   (Ist-/Soll-Versteuerung) und den **UStVA-Rhythmus**. Optional Bankverbindung (für Rechnungen).
3. **Rechnungs-Vorlage einrichten:** Menü → **Rechnungs-Vorlage** (Baukasten): Logo, Akzentfarbe,
   Kopf-/Fußtext, Zahlungsziel.
4. **Ersten Beleg erfassen:** Menü → **Belege** → **+** → scannen oder importieren.
5. **App-Sperre aktivieren** (optional): Betrieb → App-Sperre (Biometrie).

## 5. Navigation und Aufbau

Die Navigation erfolgt über ein **animiertes Seitenmenü (Hamburger/Drawer)** mit Markenkopf
(App-Icon + Betriebsname). Es ist in drei Gruppen gegliedert:

- **Haupt:** Übersicht, Belege, Rechnungen, Auswertung
- **Werkzeuge:** Offene Posten, Kunden, Artikel & Leistungen, Anlagen & GWG, Fahrtenbuch,
  Steuertermine, USt-Voranmeldung
- **System:** Betrieb, Rechnungs-Vorlage, Backup

Durchgängig gibt es einen **Zeitraum-Umschalter** (Monat · Quartal · Jahr · Alle) und eine
**Saldo-Ampel**: positiver Saldo **grün**, null **schwarz**, negativer Saldo **rot**.

## 6. Übersicht (Dashboard)

Das Dashboard ist die Kommandozentrale:

- **Saldo-Karte** mit farbiger Ampel für den gewählten Zeitraum
- **Einnahmen** (grün) und **Ausgaben** (rot) im Überblick
- **Schnellaktionen:** Beleg scannen, Rechnung erstellen, EÜR öffnen
- **Kennzahlen:** offene Posten (Anzahl/Summe), nächste Steuerfrist
- **Letzte Belege** als Schnellzugriff
- **Zeitraum-Umschalter** (Monat/Quartal/Jahr/Alle) mit Vor/Zurück

## 7. Belege

### 7.1 Erfassungswege
- **Foto-Scan:** ML-Kit-Dokumentenscanner mit Kantenerkennung, Perspektivkorrektur, Mehrseiten.
- **PDF-/Bild-Import:** über die System-Dateiauswahl (SAF). Gescannte PDFs werden seitenweise in
  Bilder gewandelt und per OCR gelesen.
- **E-Rechnung einlesen:** ZUGFeRD-PDFs oder XRechnung-XML werden erkannt; das eingebettete
  strukturierte XML wird **direkt geparst** (kein OCR nötig) und als Beleg übernommen.

### 7.2 OCR und automatische Felderkennung
Die **On-Device-Texterkennung** (ML Kit) liefert den Belegtext. Der **BelegExtractor** ermittelt
daraus regelbasiert:
- **Händler** („wo") – obere Belegzeilen, Abgleich mit der Händler-Datenbank, USt-IdNr.-Erkennung
- **Datum** („wann") – Muster `TT.MM.JJJJ`/`TT.MM.JJ`, plausibelstes Belegdatum
- **Betrag** („wie viel") – Summen-/Gesamt-Erkennung, Ableitung von Netto/USt
- **Confidence** (Erkennungssicherheit) je Feld

### 7.3 Klassifikation und lernendes Händler-Mapping
Rechnix schlägt eine **Kategorie** („was") vor – aus dem gelernten **Händler→Kategorie-Gedächtnis**
und Schlüsselwort-Heuristiken. Korrigierst du die Kategorie, merkt sich Rechnix das für künftige
Belege desselben Händlers.

### 7.4 Prüfen, Bearbeiten, Festschreiben (GoBD)
- **Review vor dem Speichern:** Du prüfst und korrigierst die erkannten Felder (Pflicht für GoBD).
- **Originalablage:** Das Originalbild/-PDF wird unveränderbar gespeichert, inkl. **SHA-256-Hash**.
- **Audit-Log:** Jede relevante Änderung wird protokolliert (append-only).
- **Festschreiben:** Festgeschriebene Belege sind **nicht mehr veränderbar** (Revisionssicherheit).

### 7.5 Filter, Suche, Summen
- **Zeitraum** (Monat/Quartal/Jahr/Alle), **Richtung** (Alle/Einnahmen/Ausgaben), **Händler-Suche**
- **Summenkarte:** Einnahmen, Ausgaben, Saldo (EÜR) mit Ampelfarben
- Jeder Listeneintrag zeigt ein farbiges Symbol (grün = Einnahme, rot = Ausgabe)

## 8. Rechnungen

### 8.1 Rechnungs-Baukasten (Layout)
Unter **Rechnungs-Vorlage** gestaltest du das Layout einmalig:
- **Logo** hochladen, **Akzentfarbe** wählen
- **Kopftext** (Briefkopf-Zeile) und **Fußtext**
- Schalter: **Bankverbindung anzeigen**, **Fußtext anzeigen**, **Akzentbalken oben/unten**,
  **Akzentrand** (Vollrahmen; deaktiviert dann die Balken)
- **Zahlungsziel** und Standardtexte
- **Live-Vorschau** des PDFs mit **Zoom** (Pinch/Doppeltipp)

### 8.2 Rechnung erstellen
Im **Editor**:
- **Kunde** auswählen (oder neu anlegen), **Positionen** erfassen (auch aus dem Artikelstamm)
- **Live-Summen** je USt-Satz, Netto/USt/Brutto
- **Fortlaufende Rechnungsnummer** automatisch
- **§14-Pflichtprüfung** vor dem Export

### 8.3 PDF und Pflichtangaben (§14 UStG)
Das erzeugte PDF enthält alle Pflichtangaben. Die **Fußzeile** trägt – wie bei Geschäftsrechnungen
üblich – **Steuernummer/USt-IdNr. und Bankverbindung**. Bei Kleinunternehmern wird der
**§19-Hinweis** ausgegeben und keine USt berechnet.

### 8.4 E-Rechnung (ZUGFeRD/XRechnung)
- **Erzeugen:** EN-16931-konformes **CII-XML**, wahlweise als **XRechnung-XML** oder eingebettet in
  ein **ZUGFeRD-PDF** (PDF mit strukturierten Daten).
- **Einlesen:** siehe 7.1 – eingehende E-Rechnungen werden als Beleg übernommen.

### 8.5 Status und „bezahlt → Einnahme"
Rechnungen haben einen **Status** (Entwurf/Gestellt/Bezahlt/Storniert). Wird eine Ausgangsrechnung
auf **bezahlt** gesetzt, erzeugt Rechnix automatisch einen verknüpften **Einnahme-Beleg** für die EÜR.

## 9. Kunden und Artikel

- **Kunden:** Stammdaten inkl. Anschrift und optionaler **USt-IdNr.** (bleibt optional, da auch
  Privatkunden möglich sind). Im Editor per Picker übernehmbar.
- **Artikel/Leistungen:** wiederkehrende Positionen mit Preis/USt-Satz; im Editor als Position einfügbar.

## 10. Offene Posten und Mahnwesen

- **Offene Posten:** alle gestellten, noch nicht bezahlten Rechnungen mit Summe und
  **Überfälligkeits-Erkennung** (Zahlungsziel überschritten).
- **Mahnwesen:** Erzeugung von **Zahlungserinnerung** und **Mahnungen** (mit Mahnstufe) als PDF.

## 11. Auswertung EÜR und Export

- **Gewinnermittlung:** Einnahmen − Ausgaben, wahlweise Netto-/Brutto-Methode; **USt-Zahllast**
  und **Kleinunternehmer-Logik** berücksichtigt.
- **Gliederung** nach Kategorien (Anlage-EÜR-Zeilen) und **Zeitraum**.
- **Saldo-Ampel** für den Gewinn (grün/schwarz/rot).
- **Export:** **CSV** (Belegjournal), **PDF** (EÜR-Bericht), **DATEV-CSV** (vereinfacht) – über die
  System-Dateiauswahl an den von dir gewählten Ort.

## 12. USt-Voranmeldung

- **Aggregation** der Umsatzsteuer und Vorsteuer je **Monat/Quartal**.
- **Kennzahlen** (z. B. 81/86/66/83), **Zahllast** oder **Erstattung**.
- **Kleinunternehmer (§19):** keine USt-Berechnung.
- **CSV-Export**; erreichbar auch aus der Auswertung.

## 13. Anlagen und GWG

- **GWG:** Sofortabschreibung bis 800 € netto; gesondertes Verzeichnis (Kosten, Datum, Nutzungsdauer).
- **AfA:** lineare Abschreibung **pro rata temporis** über die Nutzungsdauer; Restbuchwert.
- Berechnung über den `AfaRechner`.

## 14. Fahrtenbuch

- Erfassung von Fahrten (Datum, von/nach, km, Zweck).
- Berechnung der **km-Pauschale** (0,30 €/km) als Betriebsausgabe.

## 15. Steuertermine

- Berechnung typischer Fristen (z. B. **UStVA**, **Einkommensteuer**) aus deinem Profil/Rhythmus.
- Übersicht der nächsten Termine (auch im Dashboard als „nächste Frist").

## 16. Betrieb und Einstellungen

Im Tab **Betrieb** pflegst du Stammdaten und App-Einstellungen.

**Steuernummer vs. USt-IdNr. – was muss rein?**
- Die **Steuernummer** vergibt das Finanzamt; sie ist auf Rechnungen anzugeben (§14), sofern keine
  USt-IdNr. verwendet wird.
- Die **USt-IdNr.** ist v. a. für innergemeinschaftliche/B2B-Umsätze relevant.
- **Kleinunternehmer ohne §19-Verzicht:** i. d. R. **Steuernummer** angeben; eine USt-IdNr. ist
  **optional** (kann beantragt werden, ist aber nicht zwingend). Auf der Rechnung erscheint der
  **§19-Hinweis** statt ausgewiesener USt.
- **Regelbesteuerung/§19-Verzicht:** Steuernummer **oder** USt-IdNr. (häufig USt-IdNr. im B2B).

**Weitere Einstellungen**
- **Besteuerung:** Ist- oder Soll-Versteuerung.
- **UStVA-Rhythmus:** keine/monatlich/vierteljährlich.
- **Bankverbindung:** erscheint in der Rechnungs-Fußzeile.
- **Darstellung:** **Systemstandard / Hell / Dunkel** (sofort wirksam, wird gespeichert).
- **App-Sperre:** optional per **Fingerabdruck/Gesicht**.

## 17. Backup und Wiederherstellung

- **Verschlüsseltes Backup:** ein ZIP aus Datenbank + Originalbelegen, geschützt mit einem von dir
  vergebenen **Passwort** (AES/GCM, Schlüsselableitung via PBKDF2). Ziel wählst du selbst (SAF).
- **Wiederherstellung:** Auswahl der Backup-Datei + Passwort; die App startet danach neu, um den
  Datenbestand zu übernehmen.

> Bewahre Backup-Datei **und** Passwort sicher auf – ohne Passwort ist das Backup nicht lesbar.

## 18. Datenschutz und Sicherheit

- **Lokal-only:** keine Server, keine Übertragung von Belegen/Daten an Rechnix oder Dritte.
- **Verschlüsselte Datenbank:** SQLCipher/AES-256; der Schlüssel liegt im **Android-Keystore**.
- **Kein Tracking/keine Werbung/kein Standort.**
- **Minimale Berechtigungen:** nur **Biometrie** (App-Sperre). Kamera nutzt der
  Google-Dokumentenscanner gekapselt; Dateizugriff nur auf von dir gewählte Dateien (SAF).
- **Auto-Backup des Systems deaktiviert** (`allowBackup=false`), damit die verschlüsselte DB nicht
  unkontrolliert kopiert wird.

## 19. GoBD und rechtliche Grundlagen

Diese (zum Entwicklungsstand recherchierten) Rahmenbedingungen prägen die App:

| Thema | Regel (Kurzfassung) |
|---|---|
| **EÜR statt Bilanz** | zulässig u. a. bis 800.000 € Umsatz / 80.000 € Gewinn |
| **Kleinunternehmer §19** | Grenzen 25.000 € (Vorjahr) / 100.000 € (lfd. Jahr) |
| **Aufbewahrung** | Belege/Rechnungen mehrjährig, GoBD-konform digital archivieren |
| **GoBD** | Unveränderbarkeit, Nachvollziehbarkeit (Hash + Audit-Log), Originalerhalt |
| **§14 UStG** | Rechnungs-Pflichtangaben (Parteien, Steuernr./USt-IdNr., Nummer, Datum, Leistung, Netto/USt …) |
| **E-Rechnung B2B** | Empfang strukturierter Rechnungen Pflicht; Versandpflichten in Übergangsstufen |
| **GWG** | Sofortabschreibung bis 800 € netto; gesondertes Verzeichnis |

> Angaben ohne Gewähr und kein Ersatz für steuerliche Beratung; Grenzen/Regeln können sich ändern.

## 20. Technische Architektur

- **Sprache/UI:** Kotlin, **Jetpack Compose** (Material 3), Navigation Compose
- **Architektur:** MVVM + Clean-Layer (`ui`/`domain`/`data`), unidirektionaler State via StateFlow
- **DI:** Hilt · **Async:** Coroutines + Flow
- **Datenbank:** **Room** + **SQLCipher** (verschlüsselt), KSP für Codegenerierung
- **Scan/OCR:** ML Kit Document Scanner + ML Kit Text Recognition (on-device)
- **PDF:** Android `PdfDocument`/Canvas für Erzeugung; `PdfRenderer` für Import;
  **PdfBox-Android** für ZUGFeRD-Einbettung/Extraktion
- **Bilder:** Coil · **Einstellungen:** DataStore
- **Geldbeträge:** als **Long-Cent** (`Money`), zentrale USt-Rundungslogik (BigDecimal, HALF_UP)
- **Paketstruktur:** `core/{common,database,security,ui,data}` und `feature/{capture,ocr,belege,
  euer,ustva,rechnung,stammdaten,mahnwesen,anlagen,steuertermine,backup,home}`

## 21. Build und Veröffentlichung

- **Build:** `./gradlew assembleDebug` (Test), `./gradlew assembleRelease` (signiertes APK),
  `./gradlew bundleRelease` (AAB für Play).
- **Signatur:** über `keystore.properties` (nicht im Git). Release ist mit **R8** verkleinert,
  Ressourcen-Shrinking aktiv, ProGuard-Keep-Regeln in `app/proguard-rules.pro`.
- **Veröffentlichung:** siehe `playstore/RELEASE-ANLEITUNG.md` (Play App Signing, interner Test,
  Store-Eintrag, Datenschutz-URL, Datensicherheit/Inhaltsbewertung, Produktion).
- **Store-Vorlagen:** `playstore/STORE-LISTING.md`, `playstore/DATENSCHUTZERKLAERUNG.md`,
  `playstore/DATA-SAFETY.md`, Icon `playstore/icon-512.png`.

## 22. Datenmodell

Wichtigste Entitäten (Auszug):

- **Unternehmensprofil** – Name, Anschrift, Steuernr., USt-IdNr., Kleinunternehmer, Besteuerung,
  UStVA-Rhythmus, Bankverbindung, Logo
- **Beleg** – Richtung (Einnahme/Ausgabe), Belegdatum, Händler, Brutto/Netto/USt, Kategorie,
  Originalpfad, OCR-Text, Confidence, Status, Hash, Quelle
- **Kategorie** – Name, EÜR-Zeile, Typ, DATEV-Konto (SKR03/04)
- **Haendler** – Name, USt-IdNr., Standard-Kategorie (lernend)
- **Kunde / Artikel** – Rechnungs-Stammdaten
- **Rechnung / RechnungPosition** – Nummer, Kunde, Daten, Status, Summen, PDF-/ZUGFeRD-Pfad
- **RechnungsLayout** – Logo, Farben, Kopf-/Fußtext, Schalter
- **Zahlung** – Bezug, Datum, Betrag (offene Posten)
- **Anlagegut / Fahrt** – AfA bzw. Fahrtenbuch
- **AuditLog** – append-only Protokoll (GoBD)

## 23. Glossar

- **EÜR** – Einnahmenüberschussrechnung (§4 Abs. 3 EStG)
- **OCR** – optische Texterkennung
- **GoBD** – Grundsätze zur ordnungsmäßigen Führung/Aufbewahrung von Büchern … in elektronischer Form
- **GWG** – geringwertiges Wirtschaftsgut
- **AfA** – Absetzung für Abnutzung (Abschreibung)
- **UStVA** – Umsatzsteuer-Voranmeldung
- **ZUGFeRD/XRechnung** – Formate für elektronische Rechnungen (EN 16931)
- **§19 UStG** – Kleinunternehmerregelung
- **SAF** – Storage Access Framework (System-Dateiauswahl)
- **Saldo-Ampel** – Farbcodierung des Saldos: grün (+), schwarz (0), rot (−)

## 24. FAQ

**Brauche ich Internet?** Nein, der Betrieb ist offline. Der Foto-Scanner nutzt Google Play-Dienste.

**Wo liegen meine Daten?** Ausschließlich verschlüsselt auf deinem Gerät.

**Mein Beleg taucht nicht in der Liste auf.** Prüfe den **Zeitraum-Filter** (Monat/Quartal/Jahr/Alle)
und den **Richtungsfilter** – das Belegdatum muss im gewählten Zeitraum liegen.

**Kann ich einen festgeschriebenen Beleg ändern?** Nein – das ist für die Revisionssicherheit (GoBD)
bewusst gesperrt.

**Verliere ich Daten bei einem App-Update?** Bei Schema-Änderungen kann die DB im Entwicklungsstand
zurückgesetzt werden – nutze daher das **Backup**. (Echte Migrationen sind als spätere Härtung vorgesehen.)

**Wie sichere ich meine Daten?** Über **Backup** (verschlüsseltes, passwortgeschütztes ZIP) an einen
selbst gewählten Ort.

## 25. Haftungsausschluss

Rechnix ist ein Hilfsmittel zur Erfassung und Vorbereitung. Es leistet **keine Steuerberatung** und
trifft keine rechtsverbindlichen Aussagen. Für die Richtigkeit der Daten, Buchungen, Auswertungen
und der fristgerechten Abgabe von Erklärungen ist allein der Nutzer (bzw. sein Steuerberater)
verantwortlich. Genannte gesetzliche Werte/Grenzen können sich ändern; ohne Gewähr.

---

*Hersteller: HK Productions · App-ID: `de.hk_productions.rechnix`*
