# ADHD Plan A — Dokumentation

Stand: `1.0.0-alpha01`

---

## Kurzfassung

ADHD Plan A ist eine Android-App, die Termine und Aufgaben mit einem **vierstufigen, eskalierenden Reminder-System** ausstattet. Statt einer einmaligen Benachrichtigung gibt es vier Stufen, die immer dringlicher werden — von einer dezenten Vorerinnerung bis zu einem Wecker-artigen Vollbild, das sich über andere Apps und den Lockscreen legt.

Die App **lernt dabei mit**: bleibt eine Stufe ohne Reaktion, kommt sie beim nächsten gleichartigen Item früher. Diese Lernkurve läuft pro Kombination aus Kategorie, Item-Typ und Tageszeit unabhängig.

Konzipiert für Menschen mit ADHS, Autismus, Time-Blindness und anderen Formen von Neurodivergenz. Komplett lokal, kein Cloud-Sync, kein Account, kein Tracking.

---

## Inhaltsverzeichnis

1. [Wer wird damit was anfangen können](#wer-wird-damit-was-anfangen-können)
2. [Die zentralen Konzepte](#die-zentralen-konzepte)
3. [Die vier Stages im Detail](#die-vier-stages-im-detail)
4. [Wie die App lernt](#wie-die-app-lernt)
5. [Aufgabe vs. Termin — der entscheidende Unterschied](#aufgabe-vs-termin--der-entscheidende-unterschied)
6. [Bedienung](#bedienung)
7. [Berechtigungen](#berechtigungen)
8. [Datenschutz und lokale Speicherung](#datenschutz-und-lokale-speicherung)
9. [FAQ](#faq)
10. [Was die App (noch) nicht kann](#was-die-app-noch-nicht-kann)
11. [Roadmap](#roadmap)

---

## Wer wird damit was anfangen können

Die App ist bewusst für Menschen gebaut, bei denen klassische Reminder-Apps versagen. Insbesondere:

- **ADHS-Erwachsene** mit Time-Blindness — Sekunden, Minuten und Stunden fühlen sich gleich an, eine einzelne Erinnerung 30 Minuten vorher reicht selten
- **Autismus-Spektrum** mit Schwierigkeiten bei Übergängen zwischen Tätigkeiten
- **Allgemein neurodivergente Menschen**, die einen externen Strukturgeber brauchen
- **Eltern und Angehörige** von Personen aus den obigen Gruppen, die ihrem Kind, Partner oder Familienmitglied einen verlässlichen externen Anstoß geben wollen
- **Alle anderen**, die mit „Ich vergesse einfach Zeiten" oder „Ich überschätze chronisch wie viel ich noch schaffe" kämpfen

Die App geht nicht davon aus, dass du diszipliniert bist. Sie geht davon aus, dass du es gerne wärst, aber dein Gehirn dir reingrätscht — und dass du jemanden brauchst, der dich so lange anstupst, bis du wirklich losgehst.

---

## Die zentralen Konzepte

### Items: Aufgaben und Termine

Alles was die App erinnert, ist entweder eine **Aufgabe** oder ein **Termin**. Der Unterschied ist konzeptionell und technisch wichtig — siehe weiter unten.

### Kategorien

Items werden Kategorien zugeordnet. Beim ersten Start sind sechs vorbereitet:

- Kinder
- Tiere
- Haushalt
- Arbeit
- Hof
- Selfcare

Du kannst beliebig eigene anlegen, mit eigener Farbe, eigenem Default-Puffer und eigenem Symbol.

### Stages

Jedes Item hat **vier Reminder-Stages** (Stufen), die zeitlich gestaffelt vor dem Item-Trigger feuern:

| Stage | Bedeutung | Anzeigedauer | Re-Fire-Intervall |
|-------|-----------|--------------|-------------------|
| 1 (SOON) | „Hey, bald ist es soweit" | 30 Sek | — |
| 2 (GET_READY) | „Bereite dich langsam vor" | 2 Min | 5 Min |
| 3 (REALLY_NOW) | „Bist du bereit?" / „Du musst gleich los!" | 3 Min | 3 Min |
| 4 (MUST_GO) | „Beginne jetzt!" / „Du musst jetzt los!" | 5 Min | 2 Min |

Die Anzeigedauer ist die Zeit, die der Vollbild-Reminder sichtbar bleibt, bevor das System ihn als „nicht reagiert" wertet.

Das Re-Fire-Intervall greift, wenn du auf eine Stage nicht reagierst: nach Ablauf der Anzeigedauer wird die gleiche Stage nach diesem Intervall noch einmal aufgerufen, mit einem aggressiveren Text. Stage 1 hat kein Re-Fire, weil ohnehin Stage 2 in Kürze folgt.

### Trigger-Zeit

Stage 4 feuert genau zur **Trigger-Zeit** des Items. Bei einer Aufgabe ist das die Fälligkeit (`dueAt`), bei einem Termin ist es der Abfahrtszeitpunkt (`startAt − travelTime`).

---

## Die vier Stages im Detail

Wenn du eine Aufgabe für 13:30 anlegst, in einer Kategorie mit Default-Puffer (Aufgabe-Profil 60/30/10/0):

| Uhrzeit | Stage | Was passiert |
|---------|-------|--------------|
| 12:30 | Stage 1 | Vollbild-Reminder, Wecker-Ton, leichte Vibration. Text: _„Hey, bald ist es soweit"_. Dauer: 30 Sek. |
| 13:00 | Stage 2 | Vollbild, Wecker-Ton, mittlere Vibration. Text: _„Hey, bereite dich langsam vor"_. Dauer: 2 Min. |
| 13:20 | Stage 3 | Vollbild, Wecker-Ton, starke Vibration. Text: _„Bist du bereit?"_. Dauer: 3 Min. |
| 13:30 | Stage 4 | Vollbild, Wecker-Ton, sehr starke Vibration. Text: _„Beginne nun mit der Aufgabe — Du hast X Minuten Zeit"_. Dauer: 5 Min. |

Bei jeder Stage musst du auf den Knopf tippen („OK, hab's gesehen" / „Bin dabei!" / „Ich mach mich gerade fertig!" / „Lege los!"), sonst gilt's als nicht reagiert. Der Backbutton ist deaktiviert. Der Reminder lässt sich nicht wegswipen — du musst aktiv reagieren oder den Timer auslaufen lassen.

### Was beim Vollbild-Reminder passiert

- Display geht an, falls aus
- Activity legt sich über alles, auch über andere Apps
- Auch über den Lockscreen — du musst nicht entsperren um zu reagieren
- Wecker-Ton spielt im Loop, Vibration läuft
- Großer Knopf in der Mitte
- Kleinerer Fortschrittsbalken zeigt verbleibende Zeit bis Timeout

---

## Wie die App lernt

Im Hintergrund führt die App pro **Kombination aus Kategorie, Item-Typ und Tageszeit-Bucket** ein eigenes Pufferzeit-Profil mit den vier Stage-Offsets.

### Wann lernt die App?

- **Nach Reaktion (Knopfdruck):** der Puffer für diese Stage in dieser Kombination bleibt **stabil**. Du hast offenbar genug Vorlauf gehabt.
- **Nach Timeout (kein Knopfdruck):** der Puffer wird **um einen stage-spezifischen Wert erhöht** — bei der nächsten gleichartigen Erinnerung kommt diese Stage entsprechend **früher**.

### Wieviel wird pro Timeout dazu gerechnet?

| Stage | Bumb pro Timeout |
|-------|------------------|
| 1 (SOON) | +2 Min |
| 2 (GET_READY) | +3 Min |
| 3 (REALLY_NOW) | +4 Min |
| 4 (MUST_GO) | +5 Min |

Die letzte Stage hat den größten Bump-Wert, weil sie den größten Effekt auf rechtzeitiges Loskommen hat.

### Tageszeit-Buckets

Die App teilt den Tag in sechs Buckets:

- Früher Morgen (4–7 Uhr)
- Morgen (8–10 Uhr)
- Mittag (11–13 Uhr)
- Nachmittag (14–17 Uhr)
- Abend (18–21 Uhr)
- Nacht (22–3 Uhr)

Das ist absichtlich so. Wenn du morgens schwer aus dem Bett kommst, lernt das Profil für „Arbeit + Aufgabe + Morgen" größere Stage-3- und Stage-4-Puffer als das Profil für „Arbeit + Aufgabe + Nachmittag", wo du vermutlich schneller in den Modus kommst.

### Trennung Aufgabe vs. Termin im Lernen

Aufgaben und Termine haben **separate Profile**, selbst in derselben Kategorie und Tageszeit. So beeinflusst eine zu spät erkannte „Wäsche aufhängen"-Aufgabe nicht die Pufferzeit für deinen 14-Uhr-Arzttermin.

### Wo siehst du das Gelernte?

Aktuell: nur in den DB-Daten. Eine Insights-Ansicht („was hat die App gelernt") ist auf der Roadmap.

---

## Aufgabe vs. Termin — der entscheidende Unterschied

Der konzeptionelle Unterschied zwischen den beiden Item-Typen prägt, wann der Reminder feuert und mit welchen Texten.

### Aufgabe

- Du erledigst sie dort, wo du **eh schon bist**
- Hat ein **Zeitlimit** (`durationMinutes`) — wie lange sie dauern darf
- Stage 4 feuert **genau zum Fälligkeitszeitpunkt** (z.B. 13:30 fertig, dann sagt die App um 13:30: _„Beginne jetzt — du hast 15 Minuten Zeit"_)
- Beispiele: Wäsche aufhängen, E-Mails beantworten, Tabletten nehmen, Kind zum Schulbus bringen

### Termin

- Du musst **woanders hin**
- Hat eine **Wegzeit** (`travelTimeMinutes`) — wie lange du brauchst um hinzukommen
- Stage 4 feuert zur **Abfahrtszeit** = `startAt − travelTime` (z.B. Termin 14:00, Wegzeit 30 Min → Stage 4 um 13:30 mit _„Du musst jetzt los — sonst kommst du zu spät"_)
- Beispiele: Arzttermin, Schule, Treffen, Sport

### Wann nutze ich was?

- Muss ich los? → **Termin**
- Bin ich schon vor Ort? → **Aufgabe**

Wenn du beim Plus-Button im Aufgaben-Tab bist, fragt die App dich, was du anlegen willst.

---

## Bedienung

### Hauptansicht: Aufgaben

Der Aufgaben-Tab ist die zentrale Ansicht. Er zeigt **alle anstehenden Items** (Aufgaben + Termine) chronologisch sortiert. Mit dem großen Plus-Button rechts unten legst du neue Items an.

### Heute

Der Heute-Tab zeigt nur die Items, die heute oder im nächsten Tag dran sind. Schnellüberblick.

### Kategorien

Hier verwaltest du Kategorien. Pro Kategorie kannst du:

- Namen, Farbe und Default-Pufferzeit setzen
- Eigene anlegen oder System-Defaults bearbeiten

### Einstellungen

- **Berechtigungen**: führt durch alle vier nötigen System-Einstellungen
- **Export / Import**: JSON-Backup deiner kompletten Daten
- **Ton / Vibration**: globale Toggles

### Item anlegen

Bei einer neuen Aufgabe gibst du an:

- Titel
- (optional) Beschreibung
- Fälligkeitsdatum und -zeit
- Zeitlimit in Minuten
- Kategorie
- Wiederholung (einmalig, täglich, wöchentlich + Wochentage, monatlich)

Bei einem neuen Termin:

- Titel
- (optional) Beschreibung
- Startdatum und -zeit
- Wegzeit in Minuten (0 = vor Ort)
- Kategorie
- Wiederholung

### Wiederholung

Vier Optionen:

- **Einmalig** — der Default
- **Täglich** — jeden Tag zur gleichen Zeit
- **Wöchentlich** — du wählst die Wochentage (Mo, Di, Mi…)
- **Monatlich** — am gleichen Tag des Monats

Wiederholungen werden für die nächsten zwei Monate vorausgeplant.

---

## Berechtigungen

Die App braucht vier Berechtigungen, die du beim Erststart durchklickst (`Einstellungen → Berechtigungen`):

| Berechtigung | Wozu | Was passiert ohne sie |
|--------------|------|------------------------|
| Benachrichtigungen | Damit der Reminder als Notification erscheint | Reminder kommt gar nicht |
| Exakte Wecker | Damit Reminder pünktlich auslösen, auch im Doze-Modus | Reminder können sich um Minuten verzögern |
| Vollbild-Benachrichtigungen | Damit der Vollbild-Reminder auf dem Lockscreen direkt poppt | Reminder degradiert auf Heads-up-Notification |
| Über anderen Apps anzeigen | Damit der Vollbild-Reminder auch dann poppt, wenn du in einer anderen App bist | Vollbild kommt erst nach Tap auf die Notification |

**Empfehlung:** alle vier erlauben. Dann funktioniert das gestaffelte Reminder-System wie gedacht.

Auf manchen Geräten (Xiaomi, Huawei, Samsung mit aggressiver Akku-Optimierung) musst du die App zusätzlich von der Akku-Optimierung ausnehmen, sonst werden Hintergrund-Wecker getötet. Pfad ist je nach Hersteller anders, typischerweise: `Einstellungen → Apps → ADHD Plan A → Akku → Nicht eingeschränkt`.

---

## Datenschutz und lokale Speicherung

- **Alle Daten bleiben auf deinem Gerät**, in einer Room/SQLite-Datenbank
- **Kein Account, kein Login**
- **Kein Server-Backend** — die App spricht mit niemandem
- **Kein Tracking, keine Analytik, keine Werbung**

### Wenn du das Gerät wechselst

Über `Einstellungen → Export / Import` exportierst du eine JSON-Datei mit allen Kategorien, Aufgaben, Terminen und gelernten Pufferzeiten. Auf dem neuen Gerät importierst du diese Datei und hast deine Daten zurück.

### Wenn du die App löschst

Alle Daten gehen mit. Es gibt keine Cloud-Wiederherstellung. Plane einen JSON-Export, bevor du sie deinstallierst, falls du die Daten behalten willst.

---

## FAQ

### Warum kommt der Vollbild-Reminder nur als Notification, wenn ich in einer anderen App bin?

Standardmäßig erlaubt Android keiner App, eine Activity über einer anderen App zu öffnen — Sicherheitsmaßnahme gegen aggressive Werbung. ADHD Plan A nutzt die Berechtigung „Über anderen Apps anzeigen" (`SYSTEM_ALERT_WINDOW`), um diesen Schutz für seine eigenen Reminder aufzuheben. Wenn du diese Berechtigung nicht erteilt hast, fällt die App auf eine normale Notification zurück.

### Warum kommt der Reminder beim Lockscreen direkt, aber in der App nicht?

Auf dem Lockscreen aktiviert Android automatisch den `setFullScreenIntent`-Mechanismus — der ist Standard für Wecker und Anruf-Apps. Innerhalb einer aktiven App muss man explizit über andere Apps zeichnen dürfen, was die zusätzliche Berechtigung verlangt.

### Lernt die App auch, wenn ich nicht reagiere?

Ja, das ist sogar das primäre Lernsignal. Wenn du auf Stage 3 nicht reagierst (Timer läuft ab), weiß die App: für genau diese Kombination aus Kategorie und Tageszeit war dein Vorlauf in dieser Stage zu knapp. Beim nächsten Mal kommt Stage 3 früher.

### Wie kann ich der App zeigen, dass mein Vorlauf gerade gut war?

Indem du den Knopf auf der Stage drückst. Das ist das positive Lernsignal — der Wert für diese Stage bleibt stabil, wird also nicht weiter erhöht.

### Kann ich Pufferzeiten manuell justieren?

Aktuell nicht direkt. Du kannst die Default-Pufferzeit pro Kategorie ändern, das beeinflusst aber nur Items, deren Profil noch nicht durch Lernen abweicht.

### Werden meine Termine mit dem Google-Kalender synchronisiert?

Nein, die App ist komplett standalone und liest keinen externen Kalender.

### Vibriert mein Handy stundenlang weiter wenn ich die App ignoriere?

Nein. Pro Stage gibt es ein Anzeigezeitfenster (30 Sek bis 5 Min), danach hört der Reminder von selbst auf. Bei Aufgaben gibt es maximal drei Re-Fires pro Stage, danach gilt das Item als verpasst. Bei Terminen reift die letzte Stage bis zur Termin-Startzeit, dann ist Schluss.

### Was passiert wenn ich das Handy in der Stage-Zeit auf lautlos schalte?

Der Vollbild-Reminder bleibt sichtbar (Vibration läuft je nach System-Einstellungen weiter), aber der Wecker-Ton wird nicht abgespielt. Der Reaktion-Mechanismus funktioniert weiter — der Knopf zählt, der Timeout zählt.

### Verbraucht die App viel Akku?

Nein. Sie nutzt das System-AlarmManager (geringer Verbrauch), läuft sonst nicht im Hintergrund. Nur wenn ein Reminder feuert, wird kurz Aktivität sichtbar.

---

## Was die App (noch) nicht kann

In dieser Alpha-Version absichtlich nicht enthalten:

- **Cloud-Sync / Multi-Device** — ein Termin den du auf dem Tablet anlegst erscheint nicht auf dem Handy
- **Geteilte Listen / Familien-Modus** — keine Möglichkeit, mit anderen Personen Reminder zu teilen
- **Maps-/GPS-Integration** — Wegzeit ist immer manuell
- **Geofencing** — die App erkennt nicht automatisch, wenn du am Termin-Ort angekommen bist
- **Wearable / Smartwatch** — keine Wear-OS-Companion-App
- **Widgets** — kein Heute-Widget für den Home-Screen
- **iCalendar / Google Calendar** — kein Import oder Export in Kalender-Standardformaten
- **Erweiterte Wiederholungsregeln** — kein „jeden zweiten Mittwoch im Monat" oder „alle 3 Tage"
- **Automatische Erkennung verpasster Aufgaben** — wenn du eine Aufgabe nicht als „erledigt" markierst, weiß die App nicht, ob du sie wirklich gemacht hast
- **Insights-/Statistik-Ansicht** — du kannst aktuell nicht sehen, wie viel die App pro Profil gelernt hat
- **Eigene Sounds pro Kategorie** — alle Reminder nutzen den System-Wecker-Ton

Einige davon stehen auf der Roadmap, andere bewusst nicht.

---

## Roadmap

Stand der Planung, ohne Zeitzusagen:

### Vermutlich nächste Iteration

- **Insights-Ansicht** mit „was hat die App gelernt" — sichtbare Pufferzeiten pro Kategorie, Item-Typ, Tageszeit
- **Aufgabe als erledigt markieren** — explizite Aktion, damit die App auch positive Erledigungs-Signale lernen kann
- **Snooze-Funktion** — auf Stage X reagieren mit „in 5 Minuten nochmal"

### Mittelfristig

- **Heute-Widget** für den Home-Screen
- **Wear-OS-Companion** für Reminder am Handgelenk
- **Erweiterte Wiederholungsregeln** (RRULE-Format)
- **Eigene Reminder-Sounds** pro Kategorie

### Langfristig / unsicher

- **Cloud-Sync** zwischen Geräten — würde Account-Anlegung bedeuten, was den Privacy-by-Default-Ansatz aufweicht
- **Geteilte Familien-Listen**
- **Maps-Integration für automatische Wegzeit-Schätzung**

### Bewusst nicht geplant

- **Werbung, In-App-Käufe, Abo-Modell** — die App soll funktional komplett sein
- **Tracking, Analytik, Telemetrie** — keinerlei Datenrückkanal an Entwickler
- **Social-Features** — keine Likes, kein Sharing, kein Profil

---

## Feedback

Diese Alpha lebt von eurem Input. Wenn etwas nicht so funktioniert wie ihr es erwartet hättet, oder wenn euch ein zentrales Feature fehlt: bitte melden. Detaillierte Bug-Reports mit Schritten zum Reproduzieren sind besonders hilfreich.

Bei Reminder-Problemen ist die Logcat-Ausgabe Gold wert:

```
adb logcat -s AdhdAlarm AndroidRuntime
```

Diese Zeilen zeigen, was geplant und was gefeuert wurde, plus alle App-Crashes.
