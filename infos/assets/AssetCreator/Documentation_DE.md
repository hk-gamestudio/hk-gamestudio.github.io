# Asset Creator Dokumentation

Der Asset Creator ist ein maßgeschneidertes Editor-Tool für Unity, entwickelt, um den Prozess der Erstellung und Verwaltung von Spiel-Assets wie Stats, Buffs, Attacks, Classes, Characters und Items zu zentralisieren und zu vereinfachen.

> **ACHTUNG**
> Dieses Asset bietet keine Gamelogik. Es dient nur als Hilfsmittel zur Erstellung und Verwaltung von ScriptableObjects.
>
> Einige der Tabs wurden grundlegend überarbeitet um einen System-Workflow zu ermöglichen.

## Öffnen des Asset Creators

Um das Tool zu starten, navigieren Sie im Unity-Editor-Menü zu `Tools/HK-Productions/Asset-Creator`. Das Fenster öffnet sich in einer festen Größe und kann nicht angedockt werden, um eine konsistente Benutzererfahrung zu gewährleisten.

## Benutzeroberfläche

Das Fenster ist in zwei Hauptbereiche aufgeteilt:
1.  **Navigationsleiste**: Am oberen Rand befinden sich sechs Tabs (Stats, Buffs, Attacks, Class, Character, Items), um zwischen den verschiedenen Asset-Typen zu wechseln.
2.  **Inhaltsbereich**: Dieser Bereich ändert sich dynamisch, je nachdem, welcher Tab ausgewählt ist, und zeigt die entsprechenden Werkzeuge und Listen für den jeweiligen Asset-Typ an.

Zusätzlich befindet sich im Header ein **Sprach-Dropdown** (`Language`), mit dem die Anzeigesprache des gesamten Tools zwischen den verfügbaren Sprachen gewechselt werden kann.

---

## Tabs im Detail

Jeder Tab ist für die Verwaltung eines bestimmten `ScriptableObject`-Typs zuständig.

### 1. Stats-Tab

Hier definieren Sie die grundlegenden Attributvorlagen, die im Spiel verwendet werden.

-   **Zweck**: Erstellen und Verwalten von `Stat`-Assets. Diese dienen als Vorlagen für alle Statistiken (z. B. Lebenspunkte, Angriffskraft, Geschwindigkeit).
-   **Felder**:
    -   `Id`: Eine eindeutige Kennung – wird automatisch generiert (schreibgeschützt).
    -   `Name`: Der Anzeigename der Statistik.
    -   `Description`: Eine kurze Beschreibung.
-   **System-Toggles**: Aktivieren oder deaktivieren Sie vordefinierte Spielsysteme. Die zugehörigen Default-Properties werden automatisch generiert:
    -   `Element System` → `element` (String)
    -   `Level System` → `level` (Int), `currentXP` (Int), `maxXP` (Int)
    -   `Movement System` → `runSpeed` (Float), `walkSpeed` (Float)
    -   `Health System` → `isAlive` (Bool), `currentVita` (Float), `maxVita` (Float), `damage` (Int), `armor` (Int), `baseAttackCooldown` (Float), `specialAttack1Cooldown` (Float), `specialAttack2Cooldown` (Float)
    -   `Crit System` → `critChance` (Float), `critDamage` (Float) *(nur verfügbar wenn Health System aktiv)*
    -   `Item System` → `item1Cooldown` (Float), `item2Cooldown` (Float), `item3Cooldown` (Float)
-   **Default Stats (Foldout)**: Zeigt die automatisch generierten Properties basierend auf den aktiven Systemen an (schreibgeschützt).
-   **Additional Stats (Foldout)**: Hier können eigene, benutzerdefinierte Properties hinzugefügt werden. Jede Property hat einen `Namen` und einen `Typ` (`String`, `Int`, `Float` oder `Bool`).

### 2. Buffs-Tab

In diesem Bereich können Sie positive (Buffs) und negative (Debuffs) Effekte erstellen.

-   **Zweck**: Erstellen und Verwalten von `Buff`-Assets.
-   **Felder**:
    -   **Identity**: `Id`, `Name`, `Description`.
    -   **Classification**: `Type` – mögliche Werte: `Damage`, `DamageOverTime`, `Heal`, `HealOverTime`, `Debuff`, `Buff`.
    -   **Visuals**: `Sprite` für UI-Anzeigen und `VFX` für visuelle Effekte im Spiel.
    -   **Stats**: `Amount` (Stärke des Effekts), `Duration` (Dauer in Sekunden).
    -   **Targeting**:
        -   `StatSource`: Welches `Stat`-Asset wird von diesem Buff beeinflusst?
        -   `AffectedStatProperties`: Welche spezifischen Eigenschaften der `StatSource` werden modifiziert?
    -   **Catalyst (Kettenreaktion)**:
        -   `CatalystTrigger`: Ein anderer `Buff`, der diesen Buff auslösen kann.
        -   `CatalystConditionLogic`: Legt fest, ob `Alle` (`All`) oder `Einer` (`Any`) der untenstehenden Bedingungen erfüllt sein müssen.
        -   `CatalystChance`: Die prozentuale Wahrscheinlichkeit, dass der Katalysator-Effekt ausgelöst wird.
    -   **Conditions**: Eine Liste von Bedingungen, die erfüllt sein müssen, damit der Katalysator ausgelöst wird. Unterstützte Bedingungstypen: `OnBuffExpire`, `OnDamageTaken`, `BuffApplied`, `TargetHealth`, `IsSpecialAttackUser`, `IsCritHitter`, `SelfHealth`, `IsInvisibleAttack`, `OnMultiHit`, `OnFullHealthHeal`, `OnShieldBroken`, `IsBlockedAttackUser`, `OnKilledAsVampire`, `IsVampireKiller`, `OnLightningHitTargets`.

### 3. Attacks-Tab

Hier definieren Sie die Angriffe und Fähigkeiten der Charaktere.

-   **Zweck**: Erstellen und Verwalten von `Attack`-Assets.
-   **Felder**:
    -   **Identity**: `Id`, `Name`, `Description`, `Cooldown`.
    -   **Classification**: `Type` – mögliche Werte: `Melee`, `Projectile`, `Self`.
    -   **Visuals**: `Sprite` und `VFX`.
    -   **Stats**: `Damage`, `Range` und `Element` (Elementtyp des Angriffs, siehe [Element-System](#element-system)).
    -   **Catalyst**: Eine Liste von `AttackCondition`. Jede Bedingung verknüpft einen `Buff` mit einer prozentualen `Chance`, bei einem erfolgreichen Angriff angewendet zu werden.

### 4. Class-Tab

In diesem Tab werden die Charakterklassen erstellt und konfiguriert.

-   **Zweck**: Erstellen und Verwalten von `Classes`-Assets.
-   **Felder**:
    -   `Id`, `Name`, `Description`.
    -   `StatSource`: Das `Stat`-Asset, das die Basisstatistiken für diese Klasse definiert.
    -   `Balance`: Eine Liste von `Stat`-Werten zur Feinabstimmung der Klassenbalance.
    -   `Attacks`: Eine Liste von `Attack`-Assets, die dieser Klasse zur Verfügung stehen.

### 5. Character-Tab

Hier werden die spielbaren Charaktere oder NPCs (Nicht-Spieler-Charaktere) erstellt.

-   **Zweck**: Erstellen und Verwalten von `Character`-Assets.
-   **Felder**:
    -   `Id`, `Name`, `Description`.
    -   `ClassSource`: Die `Classes`-Asset, die diesem Charakter zugewiesen ist.
    -   `Element`: Der Elementtyp des Charakters (siehe [Element-System](#element-system)).
    -   `evolutionSteps`: Anzahl der Evolutionsstufen.
    -   `modelPrefab`: Eine Liste von `GameObjects` für die visuellen Modelle der einzelnen Evolutionsstufen.
    -   `evolutionPoints`: Max Punkte für die Verteilung der `EvolutionStats`.
    -   `EvolutionStats`: Generierte `Stat`-Werte für jede Evolutionsstufe.
    -   `Attacks`: Eine Liste von Angriffen, die speziell diesem Charakter zur Verfügung stehen.

### 6. Items-Tab

In diesem Tab werden Spielgegenstände (Items) erstellt und verwaltet.

-   **Zweck**: Erstellen und Verwalten von `Item`-Assets.
-   **Felder**:
    -   **Identity**: `Id` (auto-generiert), `Name`, `Description`.
    -   **Visuals**: `prefab` (das GameObject des Items in der Welt), `icon` (Sprite für die UI-Anzeige).
    -   **Economy**: `buyPrice` (Kaufpreis), `sellPrice` (Verkaufspreis).
    -   **Properties**:
        -   `Type` – Typ des Items: `Consumable`, `Equipment`, `QuestItem`, `LevelUpItem`.
        -   `Seltenheit` – Seltenheitsstufe: `Common`, `Uncommon`, `Rare`, `Epic`, `Legendary`, `Mythical`.
        -   `Dropable` – Kann dieses Item als Drop fallen?
        -   `Drop Chance` – Wird automatisch basierend auf der Seltenheitsstufe berechnet (nur sichtbar wenn `Dropable` aktiv).
        -   `Stack Size` – Maximale Stapelgröße des Items.
-   **Intelligente UI**:
    -   Bei `QuestItem` werden die Felder `Seltenheit` und `Dropable` automatisch ausgeblendet und deaktiviert.
    -   Die `Drop Chance` wird automatisch zufällig innerhalb des Seltenheits-Bereichs berechnet:

| Seltenheit | Drop Chance Bereich |
|---|---|
| Common | 70 % – 90 % |
| Uncommon | 50 % – 70 % |
| Rare | 30 % – 50 % |
| Epic | 15 % – 30 % |
| Legendary | 5 % – 15 % |
| Mythical | 1 % – 5 % |

---

## Element-System

Das Element-System ermöglicht die Zuweisung von Elementen an Angriffe und Charaktere sowie die automatische Berechnung von Effektivitätsmultiplikatoren.

-   **Verfügbare Elemente**: `Normal`, `Fire`, `Water`, `Earth`, `Air`, `Pflanze`, `Gift`, `Elektro`.
-   **Effektivitätsstufen**:
    -   `Wirkungslos` – Immun (0×)
    -   `Schwach` – Schwache Wirkung (0,5×)
    -   `Neutral` – Normale Wirkung (1×)
    -   `Stark` – Starke Wirkung (2×)

Die Interaktionen zwischen Elementen werden über eine interne Matrix (`ElementInteraction`) verwaltet und können zur Laufzeit per `GetElementMultiplier(attacker, defender)` abgefragt werden.

---

## Custom Inspector

Alle erstellten ScriptableObjects erhalten im Unity-Inspector einen eigenen, übersichtlichen **Custom Editor** – identisch strukturiert wie die Creator UI. Jeder Editor zeigt einen zentrierten Titel (*„[Typ] Editor by HK Productions"* mit Unterstrich) und gliedert die Felder in dieselben logischen Abschnitte.

### Stat Inspector

-   `Id` – schreibgeschützt.
-   `Name`, `Description` – editierbar.
-   **Systems** *(Foldout)*: Alle 6 System-Toggles (Element, Level, Movement, Health, Crit, Item). Änderungen aktualisieren die Default-Stats sofort reaktiv.
-   **Default Stats** *(Foldout)*: Zeigt alle automatisch generierten Properties als Name + Typ-Anzeige – schreibgeschützt.
-   **Ignore Defaults (Auto-generated)** *(Foldout)*: Automatisch verwaltete Liste der Properties, die von der Laufzeit-Logik ignoriert werden.
-   **Additional Stats** *(Foldout)*: Editierbare Liste benutzerdefinierter Properties (Name + Typ-Dropdown + Remove-Button). **"Add Property"** fügt neue Einträge hinzu.
-   **Ignore Additional** *(Foldout)*: Manuell verwaltbare Liste von Property-Namen, die ignoriert werden sollen. Einträge können hinzugefügt und einzeln entfernt werden.

### Buff Inspector

-   `Id` – schreibgeschützt.
-   `Name`, `Description`, `Type`, `Sprite`, `VFX`, `Amount`, `Duration` – direkt editierbar.
-   **Targeting** (StatSource + Affected Stat Properties):
    -   Kein `StatSource` gewählt → leerer Bereich.
    -   `StatSource.hasHealthSystem == false` → **Fehlermeldung** (Health System deaktiviert).
    -   `Type` ≠ `Debuff` / `Buff` → **Hinweismeldung**: Buff wird automatisch auf `currentVita` angewendet, keine manuelle Auswahl nötig.
    -   `Type == Debuff` oder `Buff` → **Toggle-Buttons** für jede wählbare Property der StatSource (grün = ausgewählt). `runSpeed` + `walkSpeed` werden zu einem gemeinsamen **"speed"-Button** zusammengefasst.
-   `CatalystTrigger`, `CatalystConditionLogic`, `CatalystChance` – direkt editierbar.
-   **Conditions**: Buttons **"Add Condition"** / **"Clear Conditions"**. Jede Bedingung zeigt Typ-Dropdown + **"-"-Button**. Wenn ein `CatalystTrigger` gesetzt, aber keine Condition vorhanden → **Fehlermeldung**.

### Attack Inspector

-   `Id` – schreibgeschützt.
-   `Name`, `Description`, `Cooldown`, `Type`, `Sprite`, `VFX`, `Damage`, `Element` – direkt editierbar.
-   `Range` – wird **nur angezeigt** wenn `Type == Projectile`.
-   **Catalyst**: Buttons **"Add Condition"** / **"Clear Conditions"**. Jede Bedingung zeigt `Buff`-Objektfeld + `Chance %`-Feld (0–100) + **"X"-Button** zum Entfernen.

### Class Inspector

-   `Id` – schreibgeschützt.
-   `Name`, `Description`, `StatSource`, `Balance`, `Attacks` – standardmäßig angezeigt.

### Character Inspector

-   `Id` – schreibgeschützt.
-   `Name`, `Description`, `ClassSource`, `Element`, `evolutionSteps`, `Attacks` – direkt editierbar.
-   `modelPrefab`, `evolutionPoints` und `EvolutionStats` werden **automatisch auf die Anzahl der `evolutionSteps` synchronisiert** (keine manuelle Listenverwaltung nötig).
-   **"Generate Stats"-Button**: Generiert Evolutionswerte für alle Stufen auf einmal basierend auf den jeweiligen `evolutionPoints` und dem `Balance`-Profil der Klasse:
    -   Balance-Stats erhalten 60 % der zufällig verteilten Punkte, Standard-Stats 40 %.
    -   `critChance` wird auf max. 100 begrenzt.
    -   `walkSpeed` bleibt immer ≤ `runSpeed`.
    -   Werte der vorherigen Evolutionsstufe werden als Basis übernommen.
-   **Pro Evolution-Stufe** *(einklappbares Foldout „Evolution N")*:
    -   `Points For Evolution Step` – editierbarer Int-Wert.
    -   `Model` – GameObject-Feld mit **180 × 180 px Vorschau-Thumbnail**.
    -   **Stats-Anzeige** – schreibgeschützte Übersicht aller Evolutionswerte; `critChance` wird mit `%` dargestellt.

### Item Inspector

-   `Id` – schreibgeschützt.
-   `Name`, `Description`, `prefab`, `icon`, `buyPrice`, `sellPrice`, `stackSize`, `type` – direkt editierbar.
-   Wenn `type == QuestItem`: `seltenheit`, `dropable` und `dropChance` werden automatisch zurückgesetzt und ausgeblendet.
-   Andernfalls: `seltenheit` und `dropable` editierbar. Wenn `dropable == true`:
    -   `Drop Chance (%)` wird **automatisch neu berechnet** sobald `type`, `seltenheit` oder `dropable` geändert wird (schreibgeschütztes Anzeigefeld).
    -   **"Re-roll"-Button**: Würfelt die Drop Chance innerhalb des Seltenheitsbereichs neu.

---

## Schritt-für-Schritt-Anleitung: Ein typischer Workflow

1.  **Stats erstellen**: Beginnen Sie im **Stats-Tab** und definieren Sie alle grundlegenden Attributvorlagen, die Ihr Spiel benötigt (z.B. "Health", "Mana", "Strength"). Aktivieren Sie die benötigten Systeme.
2.  **Buffs erstellen**: Wechseln Sie zum **Buffs-Tab**, um Effekte wie "Verbrennung" (Schaden über Zeit) oder "Heilung" zu erstellen. Verknüpfen Sie diese mit den zuvor erstellten Stats.
3.  **Angriffe erstellen**: Gehen Sie zum **Attacks-Tab** und erstellen Sie Fähigkeiten. Weisen Sie Schaden, Reichweite, Element und eventuell Buffs zu, die durch den Angriff ausgelöst werden können.
4.  **Klasse erstellen**: Im **Class-Tab** fassen Sie nun alles zusammen. Erstellen Sie eine Klasse wie "Magier", weisen Sie ihr Basisstatistiken (`StatSource`) und die zuvor erstellten Angriffe zu.
5.  **Charakter erstellen**: Erstellen Sie abschließend im **Character-Tab** einen Charakter wie "Gandalf", weisen Sie ihm die Klasse "Magier" und ein Element zu und konfigurieren Sie seine Evolutionsstufen, Modelle und spezifischen Werte.
6.  **Items erstellen**: Erstellen Sie im **Items-Tab** Gegenstände wie Heiltränke oder Ausrüstung. Legen Sie Preis, Seltenheit und Drop-Verhalten fest.
