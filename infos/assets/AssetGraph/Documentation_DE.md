# HK AssetGraph - Dokumentation

Willkommen bei **AssetGraph**! Mit diesem Werkzeug baust du komplette Spiel-**Charaktere** und **Items** in Unity zusammen, ohne eine Zeile Code zu schreiben. Statt Werte in unzähligen Inspector-Feldern zu pflegen, steckst du in einem visuellen **Node-Graph** kleine Bausteine zusammen: Stats, Attacken, Buffs, Klassen, Modelle, Evolutionsstufen. Heraus kommt ein fertiges Asset, das du zur Laufzeit nur noch an eine von zwei Komponenten hängst - fertig sind Bewegung, Kamera, Kampf, Inventar und Item-Nutzung.

Diese Dokumentation erklärt jeden Node, jede Laufzeit-Komponente und die komplette public API mit Code-Beispielen. Grundkenntnisse in Unity und C# setzen wir voraus.

---

## Inhaltsverzeichnis

1. [Was ist AssetGraph?](#was-ist-assetgraph)
2. [Wie die Graphen funktionieren](#wie-die-graphen-funktionieren)
3. [Installation & Voraussetzungen](#installation--voraussetzungen)
4. [Schnellstart in 5 Minuten](#schnellstart-in-5-minuten)
5. [Der Graph-Editor im Detail](#der-graph-editor-im-detail)
6. [Tutorial: Dein erster Charakter](#tutorial-dein-erster-charakter)
7. [Die Character-Nodes im Detail](#die-character-nodes-im-detail)
8. [Tutorial: Dein erstes Item](#tutorial-dein-erstes-item)
9. [Die Item-Nodes im Detail](#die-item-nodes-im-detail)
10. [Stats & Rollen](#stats--rollen)
11. [Kampfsystem](#kampfsystem)
12. [Buffs, Debuffs, Conditions & Stacking](#buffs-debuffs-conditions--stacking)
13. [Evolution](#evolution)
14. [Spieler einrichten (AssetGraphPlayer)](#spieler-einrichten-assetgraphplayer)
15. [Gegner einrichten (AssetGraphNPC)](#gegner-einrichten-assetgraphnpc)
16. [Inventar & Items zur Laufzeit](#inventar--items-zur-laufzeit)
17. [Steuerung & Input](#steuerung--input)
18. [Animation](#animation)
19. [API-Referenz mit Beispielen](#api-referenz-mit-beispielen)
20. [Häufige Rezepte](#häufige-rezepte)
21. [Fehlerbehebung (FAQ)](#fehlerbehebung-faq)
22. [Glossar](#glossar)

---

## Was ist AssetGraph?

AssetGraph ist ein **datengetriebenes** System. Das bedeutet: Du definierst *was* ein Charakter oder Item ist (seine Werte, Fähigkeiten, Wirkung) als reine Daten - getrennt von der Programmlogik, die diese Daten zur Laufzeit ausführt. Der Vorteil: Du kannst beliebig viele Charaktere und Items erstellen, ohne jemals Code anzufassen, und alles bleibt übersichtlich an einer Stelle.

Es gibt zwei Arten von Graphen:

- **Character-Graph** - beschreibt einen Charakter (Held, Gegner, NPC). Enthält Stats, Attacken, Klassen, Modelle und Evolutionsstufen.
- **Item-Graph** - beschreibt ein Item (Trank, Waffe, Rüstung, Material) samt seiner Wirkung.

Zur Laufzeit gibt es zwei Komponenten, an die du das fertige Asset hängst:

- **AssetGraphPlayer** - macht aus dem Charakter einen spielbaren Helden: Bewegung, Kamera, Zielerfassung, Angriffe, Inventar.
- **AssetGraphNPC** - macht aus dem Charakter einen KI-Gegner: NavMesh-Bewegung, Auto-Kampf, Loot beim Tod.

---

## Wie die Graphen funktionieren

AssetGraph kennt zwei Graph-Typen. Beide laufen auf einen **Output-Node** zu, der das fertige Asset darstellt; alle anderen Nodes liefern die Bausteine dafür. Beim Speichern werden die Verbindungen in die ScriptableObjects geschrieben - zur Laufzeit liest das System nur diese fertigen Daten, der Graph selbst wird dann nicht mehr gebraucht. Welche Nodes du anlegen kannst, hängt vom Graph-Typ ab.

### Character-Graph
Beschreibt alles, was einen Charakter ausmacht:

- Der **Stat**-Node definiert die Eigenschaften (Health, Damage, Armor, Speed, Mana, ...). Über **Rollen** werden frei benannte Properties mit der Spiel-Logik verknüpft.
- **Attack**-Nodes nutzen diese Stats, tragen Schaden/Element/Cooldown und können über Conditions Buff/Debuff-Ketten auslösen.
- Der **Class**-Node bündelt die Attacken zu einem Pool.
- **Model**-Nodes liefern Prefab und Animationen.
- **Evolution-Step**-Nodes sind die Stufen des Charakters (eigene Stats, eigenes Model, eigene Attacken) und werden in Kette gehängt.
- Der **Character**-Output verbindet Class und Evolutionsstufen zum fertigen Charakter.

### Item-Graph
Beschreibt alles, was ein Item ausmacht:

- Der **Item**-Output trägt die Item-Daten (Name, Icon, Preise, Stack-Größe, Typ, Rarity, Drop-Einstellungen, Cooldown).
- Ein angehängter **Effekt-Node** (Armory / Self / Splash) legt fest, wie das Item wirkt und welche Stat-Rollen es verändert. Effekte lassen sich verketten.

> Hinweis: Der Begriff **Rolle (Role)** ist zentral - er verbindet eine frei benannte Stat-Property mit fester Logik (z.B. "diese Property ist die Gesundheit"). Items und Effekte arbeiten über Rollen, nicht über konkrete Stat-Namen, und bleiben so charakter-unabhängig.

---

## Installation & Voraussetzungen

- Unity mit dem **neuen Input System** (AssetGraph baut darauf auf).
- Für KI-Gegner: das **AI Navigation**-Paket (NavMesh), damit du Flächen backen kannst.
- AssetGraph liegt als Package vor (`com.hkproductions.AssetGraph`). Die Demo-Szene findest du unter den Package-Samples.

---

## Schnellstart in 5 Minuten

1. **Graph anlegen**: Rechtsklick im Project-Fenster -> `Create -> AssetGraph -> Character Graph`. Gib der Datei einen Namen (z.B. "Hero").
2. **Öffnen**: Doppelklick auf die Datei. Das AssetGraph-Fenster geht auf, der `Character`-Output-Node ist bereits da.
3. **Nodes hinzufügen**: Rechtsklick in die leere Fläche -> wähle aus dem Menü (z.B. Stat, Class, Attack, Model, Evolution Step).
4. **Verbinden**: Ziehe von einem Ausgangs-Port zum passenden Eingang. Für Buff/Debuff-Ketten und Item-Effekte nutzt du die `+`-Buttons direkt am Node.
5. **Speichern**: Drücke Speichern. Erst dann sind die Daten im Asset aktuell.
6. **In die Szene**: Erstelle ein leeres GameObject, füge `AssetGraphPlayer` hinzu, ziehe deinen Character ins Feld "Character", drücke Play.

> **Merksatz**: Nach *jeder* Änderung im Graph speichern. Sonst spielst du mit veralteten Werten.

---

## Der Graph-Editor im Detail

- **Node hinzufügen**: Rechtsklick -> Suchmenü. Es erscheinen nur Nodes, die in *diesen* Graph passen (Character- bzw. Item-Nodes). Einige Nodes sind **Singletons** (z.B. Stat, Class, der Output) und können nur einmal vorkommen.
- **Verbinden über Ports**: Ziehe von einem Ausgang zu einem Eingang. Nur gleichartige Ports passen zusammen (farblich gekennzeichnet). Ein Eingang mit Einzel-Kapazität ersetzt eine bestehende Verbindung, wenn du neu verbindest.
- **Ketten & Gruppen (Parent-Child)**: Manche Bausteine hängen *unter* einem anderen Node, gestapelt und mit einem `+`-Connector verbunden. Beispiele:
  - Attack -> Condition -> Buff/Debuff -> (weitere Condition -> Buff/Debuff ...)
  - Item -> Effekt-Node (Armory/Self/Splash) -> (Effekt-Node ...)
  - Character -> Evolution Step -> Evolution Step ...
  Solche Ketten erzeugst du **nicht** per Drag, sondern über die `+`-Buttons am jeweiligen Node.
- **Ein-/Ausklappen**: Per Pfeil im Node-Header.
- **Speichern**: Schreibt alle Verbindungen in die ScriptableObjects und nummeriert die Sub-Assets sauber durch. Beim Speichern bekommst du Hinweise, falls etwas nicht verbunden ist (z.B. ein Buff ohne Attack) oder ein Humanoid-Modell keinen Avatar hat.

---

## Tutorial: Dein erster Charakter

Wir bauen einen einfachen Helden mit Gesundheit, Schaden, Rüstung und Tempo, einer Nahkampf-Attacke und einem Modell.

1. **Character Graph anlegen und öffnen** (siehe Schnellstart).
2. **Stat-Node** hinzufügen. Lege Properties an, z.B.:
   - `Vita` mit Rolle **Health**
   - `Damage` mit Rolle **Damage**
   - `Armor` mit Rolle **Armor**
   - `Speed` mit Rolle **MoveSpeed**
3. **Class-Node** hinzufügen. Sie sammelt die Attacken (Attack-Pool).
4. **Attack-Node** hinzufügen, z.B. "Slash": Type Melee, Damage 3, Range 2, Cooldown 1. Verbinde den **Affected-Stats**-Eingang der Attacke mit der `Vita`-Property des Stat-Nodes (so trifft der Schaden die Gesundheit). Verbinde die Attacke mit dem **Attack-Pool** der Class.
5. **Model-Node** hinzufügen: Prefab zuweisen, Rig wählen (Generic oder Humanoid), bei Bedarf Spawn Offset setzen, Animationen taggen (Idle/Walk/Run/...).
6. **Evolution Step** über den Character-Output anlegen (`+ Add Evolution Step`). Setze Total Stat Points, drücke **Generate Stats** (verteilt die Punkte auf deine Properties), wähle unter **Ideal Attacks** die "Slash"-Attacke. Verbinde das Model mit dem Step.
7. **Class mit dem Character-Output verbinden.**
8. **Speichern.**

Fertig - du hast einen spielbaren Charakter. Weiter geht es bei [Spieler einrichten](#spieler-einrichten-assetgraphplayer).

---

## Die Character-Nodes im Detail

### Stat-Node (Singleton)
Die zentrale Eigenschaften-Liste. Jede **Property** hat:
- **Name** - frei wählbar (z.B. "Vita", "Stamina").
- **Typ** - der Datentyp (z.B. Float).
- **Rolle** - verbindet die Property mit Spiel-Logik. Siehe [Stats & Rollen](#stats--rollen). Ohne Rolle ist es ein reiner Anzeige-/Hilfswert.

### Attack-Node
Eine Attacke.
- **Name, Beschreibung, Typ** (Melee/Ranged/...).
- **Damage** - Basisschaden der Attacke.
- **Range** - Reichweite (horizontal gemessen).
- **Cooldown** - Sekunden bis zur nächsten Nutzung.
- **Element** - für Element-Matchups.
- **Icon / VFX / Attack Clip** - optional für UI und Animation.
- **Affected Stats** (Eingang) - welche Stat-Property der Schaden trifft (meist Health).
- **+ Add Buff / + Add Debuff** - hängt Effekte über einen Condition-Node an.

### Condition-Node
Bestimmt, **wann** ein angehängter Buff/Debuff zündet:
- `OnApply` - sofort beim Anwenden.
- `OnExpire` - wenn der vorige Effekt der Kette ausläuft.
- `OnDamageTaken` / `OnDamageTakenAtLeast` - bei (mindestens X) erlittenem Schaden.
- `OnCriticalHit` / `OnCriticalHitAtLeast` - bei kritischem Treffer.
- `StatExact` / `StatBelow` / `StatAbove` - wenn ein Stat einen Wert erreicht/unterschreitet/überschreitet.
- **Chance** (0..1) - Wahrscheinlichkeit, dass der Effekt zündet.

### Buff / Debuff-Node
Der eigentliche Effekt.
- **Buff-Typen**: Heal (sofort), HealOverTime (HoT), AffectByElement.
- **Debuff-Typen**: Damage (sofort), DamageOverTime (DoT), AffectByElement.
- **Amount** - Stärke. Bei DoT/HoT der Wert **pro Sekunde**.
- **Duration** - Dauer in Sekunden (0 = nur sofort).
- **Target Stat** - welcher Stat betroffen ist.
- **Stacking** - siehe [eigener Abschnitt](#buffs-debuffs-conditions--stacking).
- **+ Chain Buff/Debuff** - Folge-Effekte (z.B. erst DoT, danach per OnExpire ein HoT).

### Class-Node (Singleton)
Bündelt den **Attack-Pool**, aus dem Evolutionsstufen ihre Attacken wählen. Wird mit dem Character-Output verbunden.

### Model-Node
- **Prefab** - das 3D-Modell.
- **Rig** - Generic oder Humanoid. Humanoid braucht einen gültigen Avatar.
- **Spawn Offset** - lokaler Versatz, falls der Modell-Ursprung nicht an den Füßen liegt (häufig: Y leicht anheben).
- **Animations** - Liste aus Clip + Rolle (Idle/Walk/Run/Jump/Death). Die Rolle sagt dem System, wann der Clip läuft.

### Evolution-Step-Node
Eine Stufe des Charakters.
- **Total Stat Points** + **Generate Stats** - verteilt die Punkte auf die Stat-Properties dieser Stufe.
- **Generated Stats** - das Ergebnis (die konkreten Werte).
- **Model** (Eingang) - das Modell dieser Stufe.
- **Ideal Attacks** - feste Attacken aus dem Class-Pool.
- **Rarity Attacks** + **Rarity Pick Count** - optionale Zufalls-Attacken.
- **+ Add Next Evolution Step** - nächste Stufe anhängen.

### Character-Output-Node (Singleton)
Das fertige Asset.
- **Name, Beschreibung, Element.**
- **Class** (Eingang) und die **Evolution-Step-Kette**.

---

## Tutorial: Dein erstes Item

Wir bauen einen einfachen Heiltrank.

1. **Item Graph anlegen** (`Create -> AssetGraph -> Item Graph`) und öffnen. Der `Item`-Output-Node ist schon da.
2. Im Item-Node ausfüllen: Name "Health Potion", Type **Consumable**, Stack Size z.B. 20, optional Icon und Prefab (das Prefab wird beim Fallenlassen/Werfen angezeigt - ohne Prefab nimmt das System eine kleine Platzhalter-Kugel).
3. **Effekt anhängen**: Im Item-Node auf **`+ Self`** klicken. Darunter erscheint ein "Item Self"-Node.
4. Im Self-Node unter **Effects** einen Eintrag hinzufügen: Role **Health**, Amount **20**, Duration **0** (sofort). Für einen HoT stattdessen Amount **5**, Duration **4** (5 pro Sekunde, 4 Sekunden lang).
5. **Speichern.**

Zur Laufzeit kann der Spieler den Trank aufsammeln, auf einen Quickslot legen und benutzen (siehe [Inventar & Items zur Laufzeit](#inventar--items-zur-laufzeit)).

**Beispiel Waffe (Armory)**: `+ Armory` wählen, Equip Slot **Weapon**, Effects z.B. Role **Damage**, Amount **+5**. Solange ausgerüstet, erhöht sich der Schaden um 5.

**Beispiel Schadenstrank (Splash)**: `+ Splash` wählen, Splash Radius z.B. 3, Effects Role **Health**, Amount **-15**. Beim Wurf trifft es das Ziel und alle im Umkreis.

---

## Die Item-Nodes im Detail

### Item-Node (Output)
- **Id, Name, Beschreibung.**
- **Prefab** - Welt-Darstellung beim Droppen/Werfen.
- **Icon** - für dein Inventar-UI.
- **Buy Price / Sell Price** - für Handel.
- **Stack Size** - wie viele in einen Slot passen.
- **Type** - Consumable, Equipment, QuestItem, Material, Misc.
- **Rarity** - Common, Uncommon, Rare, Epic, Legendary.
- **Dropable / Drop Chance / Min Drop Count / Max Drop Count** - steuern, ob und wie viel beim NPC-Tod fällt.
- **Cooldown** - Sekunden zwischen zwei Nutzungen (Consumables).

### Item-Effekt-Nodes
Der Node-Typ bestimmt den **Modus**:
- **Item Armory** - ausrüstbar. Hat einen **Equip Slot**. Effekte heben das Stat-**Maximum** an, solange ausgerüstet.
- **Item Self** - wirkt auf den Benutzer.
- **Item Splash** - wird auf ein Ziel geworfen. Hat einen **Splash Radius** (0 = nur Ziel, >0 = Ziel + Umkreis).

Jeder Effekt-Node hat eine **Effects**-Liste mit Spalten:
- **Role** - betroffene Stat-Rolle (Health/Damage/...). So bleibt das Item von konkreten Stat-Namen unabhängig.
- **Amount** - signiert (+ erhöht, - senkt). Bei Duration > 0: pro Sekunde.
- **Duration** - 0 sofort, >0 über Zeit (Self/Splash; bei Armory ohne Bedeutung).

**Ketten** (nur gleicher Typ) über **`+ Chain`**. Jedes Kettenglied hat **Chain Start**:
- **WithPrevious** - startet gleichzeitig mit dem Vorgänger.
- **AfterPrevious** - startet erst, wenn der Vorgänger abgelaufen ist.

So baust du z.B. einen Trank, der gleichzeitig heilt und kurz die Rüstung erhöht, oder erst heilt und dann für eine Weile das Tempo senkt.

---

## Stats & Rollen

Stats heißen frei, bekommen ihre Bedeutung aber über **Rollen**:

| Rolle | Bedeutung |
|-------|-----------|
| Health | Lebenspunkte. Bei <= 0 stirbt die Instanz. |
| Damage | Wird zum Basisschaden der Attacke addiert. |
| Armor | Mindert eingehenden Schaden. |
| MoveSpeed | Allgemeine Bewegungsgeschwindigkeit. |
| WalkSpeed | Gehgeschwindigkeit. |
| RunSpeed | Renngeschwindigkeit (bei gehaltener Run-Taste). |
| Mana | Frei nutzbare Ressource. |

**Maximum und aktueller Wert** - wichtig zu verstehen:
- **Health und Mana sind Ressourcen**: Der aktuelle Wert ist auf `[0, Maximum]` begrenzt. Heilung kann also nicht über das Maximum hinaus (kein "Überheilen"). Das Maximum ist der generierte Basiswert.
- **Ausgerüstete Items (Armory)** heben das Maximum an - so wirken bessere Rüstungen/Waffen wirklich.
- **Attribute (Damage/Armor/Speed)** sind nicht gedeckelt: ein Buff oder Item darf sie über den Basiswert heben.

---

## Kampfsystem

Wenn eine Attacke trifft, wird der Schaden so berechnet:

```
Basisschaden = Attack.Damage + Damage-Rollen-Stat des Angreifers
Basisschaden *= 1 + Element-Modifier des Angreifers
Endschaden   = max(0, Basisschaden * Element-Matchup * Crit - Armor des Ziels)
```

- **Additiv**: Der Stat-Schaden wird *addiert*, nicht multipliziert. Eine Attacke mit Damage 3 und ein Angreifer mit Damage-Stat 15 ergibt Basis 18.
- **Crit**: Global über `CritChance` (0..1) und `CritMultiplier` (am AssetGraphPlayer einstellbar). Bei einem Crit greift der Multiplikator.
- **Element-Matchup**: Verhältnis zwischen dem Element der Attacke und dem Element des Ziels (z.B. Feuer gegen Eis).
- **Armor**: Wird am Ende abgezogen.
- **Reichweite**: Wird **horizontal** (XZ-Ebene) gemessen, damit Höhenunterschiede oder unebener Boden keine Treffer verschlucken.

---

## Buffs, Debuffs, Conditions & Stacking

**Conditions** sind die Auslöser. **Buffs/Debuffs** sind die Wirkung. Zusammen kettest du sie: `Attack -> Condition -> Buff/Debuff`.

**Stacking** legt fest, was passiert, wenn derselbe Effekt erneut auf dasselbe Ziel kommt:
- **Stackable = false**: erneutes Wirken wird ignoriert, solange noch eine Instanz läuft.
- **Stackable = true, Stack Amount = true**: mehrere unabhängige Stacks bis **Max Stack Size** (0 = unbegrenzt). Jeder Stack tickt für sich.
- **Stackable = true, Stack Amount = false**: ein Stack; bei Re-Cast wird die Duration aufgefrischt und der Amount mit **Stack Multiply** multipliziert.

**Ketten über OnExpire**: Ein Buff/Debuff mit Condition `OnExpire` zündet, wenn der *Eltern*-Effekt ausgelaufen ist. Klassisches Beispiel: Ein DoT läuft 3 Sekunden, danach startet automatisch ein HoT über 5 Sekunden.

---

## Evolution

Ein Charakter kann mehrere Stufen haben. Jede Stufe hat eigene Stats, ein eigenes Modell und eigene Attacken.

- Beim Spawn wählst du über **EvolutionStep** (Index), in welcher Stufe der Charakter startet.
- Zur Laufzeit wechselst du mit `EvolveTo(index)` die Stufe - Stats und Modell werden komplett neu aufgebaut.

So baust du z.B. ein Monster, das sich nach einiger Zeit in eine stärkere Form verwandelt.

---

## Spieler einrichten (AssetGraphPlayer)

Lege ein leeres GameObject an und füge `AssetGraphPlayer` hinzu. Die wichtigsten Bereiche:

- **Character / Pool**: Dein Charakter. Bei Spawn-Mode "RandomFromPool" ziehst du mehrere Charaktere in den Pool.
- **Spawn**: *Mode* (ThisTransform = an dieser Position; FixedPosition; RandomRadius; RandomFromPool), *Radius*, *Count*, *EvolutionStep*. Der Spawn passiert immer beim Start und als Child dieses Objekts.
- **Combat**: *CritChance*, *CritMultiplier* (gelten global fürs Kampfsystem).
- **Team & Auto-Combat**: *Team* (gleiche Teams greifen sich nicht an), *PlayerControlled*, *AutoCombat*, *On Death* (Stay/Despawn/Respawn) + *Death Delay*.
- **Targeting & Attacks**: *Targeting Mode* (Button = nur manuell, Auto = automatisch das schwächste Ziel, Both = automatisch mit manueller Übersteuerung), *Targeting Range*, *Attack 1* / *Attack 2*, *Item Use Slots* (1-4 für Self/Splash-Items).
- **Input - Keyboard/Mouse** und **Input - Controller**: Alle Tasten frei belegbar.
- **Inventory**: *Inventory Size* (Slots), *Pickup Radius*, *Auto Pickup*, *Starting Currency*.
- **Events**: OnSpawned, OnDeath, OnDamageTaken, OnEvolved, OnItemPickedUp - hänge eigene Reaktionen an.
- **Debug (Play Mode)**: Zeigt live Stats, aktive Buffs, Inventar, Quickslots und ausgerüstete Items. Hier kannst du auch ohne eigenes UI Items in Slots legen, benutzen, ausrüsten und einen Gegner spawnen.

---

## Gegner einrichten (AssetGraphNPC)

Lege ein leeres GameObject an, füge `AssetGraphNPC` hinzu und weise den Charakter zu. **Wichtig**: Der NPC bewegt sich nur, wenn die Szene ein gebackenes **NavMesh** hat.

- **Character / Evolution Step**: der Charakter.
- **Team & Combat**: *Team*, *Targeting Range*.
- **Movement (NavMesh)**: *Agent Type* (aus den Navigation-Settings; inkl. "Open Agent Settings..."), *Patrol Radius* (Streifgebiet um den Spawn), *Detection Range* (ab wann verfolgt wird), *Attack Stop Distance* (Stoppabstand, sollte etwa der Attack-Range entsprechen), *Move Speed* (0 = aus den Stats ableiten), *Flee When Low* + *Flee Health Percent* (Flucht bei niedrigem Leben).
- **Death**: *On Death* + *Death Delay*.
- **Drops**: Eine reine Liste möglicher Items. Ob und wie viel fällt, kommt aus dem Item selbst (Dropable, Drop Chance, Min/Max Drop Count). Drops erscheinen mit einer kleinen Animation in der Welt.
- **Events**: OnSpawned, OnDeath, OnDamageTaken, OnItemDropped.

Die KI nutzt eine einfache Zustandsmaschine: **Patrol** (umherwandern), **Chase** (Ziel verfolgen bis Angriffsreichweite), **Flee** (fliehen bei niedrigem Leben). Das Angreifen selbst macht der eingebaute AutoCombatant - er nutzt automatisch die verfügbaren Attacken des Charakters auf Cooldown.

---

## Inventar & Items zur Laufzeit

Das Inventar ist **rein logisch** - es bringt **kein** fertiges UI mit. Du baust dein eigenes Inventar-UI und greifst die Daten über die API ab. Das Inventar erreichst du über `assetGraphPlayer.Inventory`.

**Aufsammeln**: Items liegen als `WorldItemPickup`-Objekte in der Welt (z.B. nach einem NPC-Tod). Ist *Auto Pickup* aktiv, sammelt der Spieler alles im *Pickup Radius* automatisch ein.

**Nutzungs-Modi** (durch den Effekt-Node des Items festgelegt):
- **Armory**: Ausrüsten - nur über das Inventar (`Equip` / `Use`). Hebt Stats, solange ausgerüstet.
- **Self**: Über das Inventar (sofortige Wirkung) **oder** über eine ItemUse-Taste (mit Drop-auf-Kopf-Animation).
- **Splash**: **Nur** über eine ItemUse-Taste (Wurf aufs aktuelle Ziel, optional mit Flächen-Radius). Aus dem Inventar heraus wird Splash bewusst abgelehnt, weil dort kein Ziel feststeht.

**Quickslots (Tasten 1-4)**: Lege bis zu 4 Items auf die ItemUse-Tasten. Der Slot **referenziert** das Item nur - es bleibt im Inventar, und beim Benutzen wird aus dem Inventar verbraucht. Ist das letzte Exemplar weg, leert sich der Slot automatisch.

**Währung & Handel**: Das Inventar hält eine `Currency`. `TryBuy`/`TrySell` verrechnen automatisch; `AddBalance`/`RemoveBalance` ändern das Guthaben direkt (z.B. für Quest-Belohnungen).

**Quest-Items** (Type = QuestItem): können nicht manuell entfernt, fallengelassen oder verkauft werden. Für die Quest-Abgabe per Skript gibt es `RemoveForced`.

---

## Steuerung & Input

Aufgebaut auf dem neuen Input System, komplett am AssetGraphPlayer belegbar - getrennt für Keyboard/Maus und Controller.

- **Bewegung**: WASD oder Pfeiltasten (Keyboard), linker Stick (Controller).
- **Umsehen (Look)**: Maus bzw. rechter Stick. Die Empfindlichkeit stellst du getrennt ein (Look Sensitivity Maus / Controller).
- **Zoom**: Mausrad (Keyboard) bzw. ein Toggle in Schritten (Controller; Zoom Step einstellbar).
- **Attack 1/2, Jump, Run, Targeting (Next/Prev/Toggle)**: frei belegbar.
- **Item Use 1-4**: Standardmäßig Tasten 1-4 (Keyboard) bzw. freie Controller-Buttons.

---

## Animation

Animationen laufen über den `CharacterAnimancer` - **ohne** AnimatorController. Er blendet automatisch zwischen Idle, Walk und Run je nach Bewegungstempo und hat einen Action-Layer für Attack, Jump und Death. Die Clips kommen aus dem Model-Node (per Rolle getaggt) bzw. aus dem Attack-Clip einer Attacke.

- Fehlende Clips werden übersprungen - du kannst also auch komplett ohne Animationen testen.
- Bei **Humanoid**-Modellen muss ein gültiger Avatar vorhanden sein. Fehlt er, bricht ein Schutzmechanismus den Play-Mode mit einer Meldung ab (Import Settings -> Rig -> Humanoid + Avatar erstellen).

---

## API-Referenz mit Beispielen

Alle folgenden Beispiele sind C#. So sprichst du dein eigenes Inventar-UI oder eigene Spiel-Logik an.

**Zugriff auf Player und Inventar:**
```csharp
var player = FindObjectOfType<AssetGraphPlayer>();
var inv = player.Inventory;            // das Laufzeit-Inventar
var hero = player.Primary;             // die gespawnte CharacterInstance
```

**Auf Änderungen reagieren (für UI):**
```csharp
inv.OnChanged          += RefreshInventoryUI;
inv.OnCurrencyChanged  += gold => goldLabel.text = gold.ToString();
inv.OnItemPickedUp     // (am Player) feuert beim Aufsammeln
```

**Inhalt anzeigen:**
```csharp
foreach (var stack in inv.Slots)
    Debug.Log($"{stack.Item.Name} x{stack.Count}");

int potions = inv.CountOf(healthPotion);
bool hasKey = inv.Contains(questKey);
```

**Items benutzen:**
```csharp
if (inv.CanUse(healthPotion))
    inv.Use(healthPotion);             // Armory -> ausrüsten, Self -> sofort wirken

// Quickslot belegen, danach reicht die Taste "1"
player.AssignItemSlot(0, healthPotion);
player.ItemUse.TriggerSlot(0);         // optional per Skript auslösen
```

**Ausrüsten:**
```csharp
inv.Equip(sword);                      // Armory-Item
inv.Unequip(EquipSlot.Weapon);
Item weapon = inv.GetEquipped(EquipSlot.Weapon);
```

**Handel & Währung:**
```csharp
inv.AddBalance(100);                   // 100 dazu
inv.TryBuy(sword);                     // kostet sword.BuyPrice, legt es ins Inventar
inv.TrySell(oldItem);                  // entfernt es, schreibt SellPrice gut
```

**Fallenlassen (mit Welt-Animation):**
```csharp
inv.Drop(stone, 1);                    // Quest-Items werden hier abgelehnt
```

**Charakter-Instanz (Kampf/Zustand):**
```csharp
hero.UseAttack(attack, target);
hero.EvolveTo(hero.CurrentStep + 1);
float hp = hero.Health;
bool dead = hero.IsDead;
```

### AssetGraphPlayer
```csharp
// Eigenschaften
Inventory inv = player.Inventory;
CharacterInstance hero = player.Primary;              // erste gespawnte Instanz
IReadOnlyList<CharacterInstance> all = player.Spawned;
PlayerItemUse itemUse = player.ItemUse;

// Quickslots (Self/Splash)
bool ok = player.AssignItemSlot(0, healthPotion);     // false, wenn ungültig/nicht im Inventar
player.ClearItemSlot(0);
Item slot1 = player.GetItemSlot(0);
int slots = player.ItemSlotCount;                     // 4

// Spawn-Steuerung (z.B. für Debug)
player.SpawnAll();
player.SpawnEnemy();                                  // Gegner im gegnerischen Team
```

### AssetGraphNPC
```csharp
CharacterInstance inst = npc.Instance;                // gespawnte Instanz
AutoCombatant combat   = npc.Combat;                  // Kampf-KI
NPCMovement movement   = npc.Movement;                // FSM
NPCMovement.State state = movement.Current;           // Patrol / Chase / Flee

combat.CombatEnabled = false;                         // Angriffe vorübergehend aus
combat.ForcedTarget  = someInstance;                  // Ziel von außen vorgeben
var target = combat.CurrentTarget;
```

### Inventory (vollständig)
```csharp
// Bestand
int added   = inv.Add(item, 3);                       // tatsächlich aufgenommen
int removed = inv.Remove(item, 1);                    // Quest-Items werden hier abgelehnt
inv.RemoveForced(questItem, 1);                       // ohne Quest-Sperre (z.B. Quest-Abgabe)
inv.Clear();
int n = inv.CountOf(item);
bool has = inv.Contains(item, 2);
IReadOnlyList<ItemStack> stacks = inv.Slots;
int used = inv.UsedSlots; int cap = inv.Capacity; bool full = inv.IsFull;

// Benutzen
if (inv.CanUse(item)) inv.Use(item);                  // Armory -> equip, Self -> sofort, Splash -> abgelehnt
inv.BeginUse(item);                                   // verbraucht + Cooldown, ohne Wirkung
inv.ApplyItemEffects(item, recipient);                // Wirkung separat anwenden (für Animation/Splash)

// Ausrüsten
inv.Equip(armoryItem);
inv.Unequip(EquipSlot.Weapon);
Item w = inv.GetEquipped(EquipSlot.Weapon);
IReadOnlyDictionary<EquipSlot, Item> eq = inv.Equipped;

// Fallenlassen, Cooldown
inv.Drop(item, 1);
bool cd = inv.IsOnCooldown(item);
float rest = inv.GetCooldownRemaining(item);

// Währung & Handel
int gold = inv.Currency;
inv.AddBalance(100);
bool paid = inv.RemoveBalance(50);                    // false bei zu wenig
inv.TryBuy(item, 1);
inv.TrySell(item, 1);

// Events
inv.OnItemAdded     += (it, amount) => { };
inv.OnItemRemoved   += (it, amount) => { };
inv.OnChanged       += () => { };
inv.OnItemUsed      += (it, amount) => { };
inv.OnEquipped      += (it, slot) => { };
inv.OnUnequipped    += (it, slot) => { };
inv.OnItemDropped   += (it, amount) => { };
inv.OnBought        += (it, amount) => { };
inv.OnSold          += (it, amount) => { };
inv.OnCurrencyChanged += gold => { };
```

### CharacterInstance
```csharp
// Zustand
float hp = hero.Health; bool dead = hero.IsDead; int step = hero.CurrentStep;
var attacks = hero.AvailableAttacks;
var effects = hero.ActiveEffects;                     // aktive Buffs/Debuffs

// Kampf
hero.UseAttack(attack, target);
bool onCd = hero.IsOnCooldown(attack);
hero.TakeDamage(amount, source, attack.AffectedStats, isCrit);
hero.ApplyEffect(buffOrDebuff, source);

// Stats per Rolle
hero.ModifyRole(StatRole.Health, +10);                // geklemmt auf [0, Max] (Self/Splash-Logik)
hero.ModifyRoleMax(StatRole.Health, +20);             // hebt das Maximum (Equip-Logik)
hero.ApplyRoleOverTime(StatRole.Health, 5, 4);        // 5 pro Sekunde über 4 Sekunden
// Stats per Name
float dmg = hero.GetStat("Damage");
hero.ModifyStat("Damage", +2);

// Evolution / Wiederbeleben
hero.EvolveTo(1);
hero.Revive();
```

### RuntimeStats (über `hero.Stats`)
```csharp
var stats = hero.Stats;
float byRole = stats.GetByRole(StatRole.Health);
bool hasRole = stats.HasRole(StatRole.Mana);
float raw    = stats.Get("Vita");
stats.Modify("Vita", -5);                             // ungeklemmt
stats.AddClamped("Vita", +10);                        // auf [0, Max] (Health/Mana)
float max    = stats.GetMax("Vita");
foreach (var kv in stats.Values) Debug.Log($"{kv.Key} = {kv.Value}");
stats.OnChanged += (name, oldV, newV) => { /* UI aktualisieren */ };
```

### CharacterSpawner (statisch, ohne Komponente)
```csharp
var inst  = CharacterSpawner.Spawn(character, position, step: 0);
var inst2 = CharacterSpawner.SpawnRandom(pool, center, radius);
CharacterSpawner.MakeTargetable(inst, team: 1);       // macht die Instanz anvisierbar
// 2D-Varianten: Spawn2D, SpawnAtWorldPoint2D, SpawnRandom2D
```

### Targetable (Zielerfassung)
```csharp
foreach (var t in Targetable.All)
    if (t.IsAlive && t.Team != myTeam)
        Debug.Log($"{t.Character.name} hat {t.Health} Leben");
```

> Editor-/Graph-APIs (Node-Views, Serializer) sind interne Bausteine und nicht für die Spiel-Laufzeit gedacht.

---

## Häufige Rezepte

**Heiltrank**: Item (Consumable) -> `+ Self` -> Health, Amount +20, Duration 0.

**Regenerationstrank (HoT)**: Item -> `+ Self` -> Health, Amount +5, Duration 4 (= 20 über 4 Sekunden, gedeckelt aufs Maximum).

**Gifttrank zum Werfen (Splash, Fläche)**: Item -> `+ Splash`, Splash Radius 3 -> Health, Amount -8, Duration 5.

**Schwert (Armory)**: Item (Equipment) -> `+ Armory`, Equip Slot Weapon -> Damage, Amount +5.

**Rüstung mit mehr Leben (Armory)**: Item -> `+ Armory`, Equip Slot Chest -> Health, Amount +30 (hebt das Max-Leben).

**Brennende Attacke (DoT)**: Attack -> `+ Add Debuff` -> Condition OnApply -> Debuff DamageOverTime, Amount 4, Duration 3 (Ziel Health).

**DoT, dann Heilung (Chain)**: Wie oben, dann am Debuff `+ Chain Buff` -> Condition OnExpire -> Buff HealOverTime (heilt, sobald der DoT durch ist).

**Verwandlung nach X Sekunden**: Zwei Evolution Steps bauen; per Skript `hero.EvolveTo(1)` nach Ablauf eines Timers.

---

## Fehlerbehebung (FAQ)

- **Es passiert kein Schaden / keine Stats sichtbar.** Im Evolution Step "Generate Stats" drücken und die **Affected Stats** der Attacke mit der richtigen Property verbinden, dann **Graph speichern**. Im Play-Mode-Debug des Players siehst du, ob Stats vorhanden sind.
- **Der NPC bewegt sich nicht.** Es fehlt ein gebackenes NavMesh. Ohne NavMesh läuft die KI ohne Fehler ins Leere.
- **Das Modell steckt halb im Boden.** Im Model-Node den **Spawn Offset** (Y) anheben - der Modell-Ursprung liegt vermutlich in der Mitte statt an den Füßen.
- **Angriffe treffen nicht.** Die **Range** der Attacke prüfen. Sie wird horizontal gemessen und muss zur tatsächlichen Distanz passen.
- **Ein Item lässt sich nicht benutzen.** Self/Splash brauchen einen Effekt-Node; Splash braucht ein Ziel; das Item muss im Inventar liegen und darf nicht auf Cooldown sein. Armory wird nur über das Inventar (Equip) genutzt, nicht über die ItemUse-Tasten.
- **Heilung geht nicht über X hinaus.** Korrekt - Health ist auf das Maximum gedeckelt. Mehr Maximum gibt es über Armory-Items.
- **Play-Mode bricht sofort ab (Avatar-Meldung).** Ein Humanoid-Modell hat keinen gültigen Avatar. In den Import Settings den Rig auf Humanoid stellen und einen Avatar erstellen.

---

## Glossar

- **Asset** - der fertige Character oder das fertige Item (eine Graph-Datei).
- **Node** - ein Baustein im Graph.
- **Port / Edge** - Verbindungspunkt / Verbindungslinie.
- **Rolle (Role)** - Markierung, die einen Stat mit Spiel-Logik verbindet.
- **Singleton-Node** - kann pro Graph nur einmal vorkommen.
- **Output-Node** - der Endpunkt eines Graphen (Character/Item).
- **CharacterInstance** - die zur Laufzeit gespawnte Instanz eines Charakters.
- **AutoCombatant** - die eingebaute Kampf-KI (wählt Ziel, feuert Attacken).
- **NavMesh** - begehbare Fläche für KI-Bewegung.
- **HoT / DoT** - Heal/Damage over Time (Wirkung pro Sekunde über eine Dauer).
- **Quickslot** - eine der 4 ItemUse-Tasten-Belegungen.
