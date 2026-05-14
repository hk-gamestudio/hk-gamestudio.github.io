# SymbolCreator Dokumentation

Willkommen bei **SymbolCreator**, einem Werkzeug für Unity, das die Verwaltung von *Scripting Define Symbols* vereinfacht. Ob du Symbole manuell über ein grafisches Interface steuern oder sie automatisiert per Code setzen möchtest – dieses Asset bietet dir eine saubere und effiziente Lösung.

## Einleitung

In Unity werden *Scripting Define Symbols* oft genutzt, um Code-Blöcke abhängig von der Plattform oder bestimmten Bedingungen ein- oder auszuschalten (mittels `#if SYMBOL`). Standardmäßig ist die Verwaltung in den Unity *Player Settings* jedoch unübersichtlich.

**SymbolCreator** löst dieses Problem durch:
- Eine übersichtliche **Editor-Oberfläche** zur schnellen Verwaltung.
- Eine leistungsstarke **SymbolUtility**, um Symbole programmatisch zu steuern.
- **Persistenz**: Symbole bleiben in deiner Liste erhalten, auch wenn sie gerade nicht aktiv sind.

---

## SymbolUtility

Die `SymbolUtility` ist das Herzstück für Entwickler. Sie ermöglicht es dir, Symbole direkt aus deinen eigenen Skripten heraus zu verwalten, ohne die Unity-Einstellungen manuell öffnen zu müssen.

### Nutzung im Code

Um die Utility zu nutzen, musst du den entsprechenden Namespace einbinden:

```csharp
using HK.SymbolCreator.Utils;
```

#### Wichtige Funktionen

Hier sind die drei Hauptfunktionen, die du kennen solltest:

1. **Symbol hinzufügen**
   Fügt ein Symbol zur aktuellen Build-Zielgruppe hinzu, falls es noch nicht existiert.
   ```csharp
   SymbolUtility.AddSymbol("MY_AWESOME_FEATURE");
   ```

2. **Symbol entfernen**
   Entfernt ein Symbol sicher aus der Liste, falls es vorhanden ist.
   ```csharp
   SymbolUtility.RemoveSymbol("MY_AWESOME_FEATURE");
   ```

3. **Symbol prüfen**
   Prüft, ob ein bestimmtes Symbol aktuell aktiv ist.
   ```csharp
   if (SymbolUtility.HasSymbol("MY_AWESOME_FEATURE"))
   {
       Debug.Log("Das Feature ist aktiv!");
   }
   ```

### Warum SymbolUtility nutzen?
Stell dir vor, du möchtest ein Asset schreiben das auf ein anderes Asset aufbaut...
jedoch auch alleine funktionieren soll mit einer alternativen vereinfachteren Lösung.
Dann setzt du einfach dein Symbol von dem Asset und kannst es in anderen Assets abfragen.

---

## Der Editor (Symbol Creator)

Für die visuelle Verwaltung gibt es den **Symbol Creator**. Er ist besonders anfängerfreundlich und bietet eine klare Übersicht über alle bekannten Symbole.

### So öffnest du das Fenster
Gehe im Unity-Menü zu:  
**Tools -> HK-Productions -> SymbolCrator**

### Funktionen der Benutzeroberfläche

1. **Symbol-Liste**: Hier siehst du alle gespeicherten Symbole.
   - **Grün**: Das Symbol ist aktiv.
   - **Rot**: Das Symbol ist inaktiv (gespeichert, aber nicht im Build aktiv).
   - **Grau**: Dieses Symbol ist aktuell ausgewählt.
2. **Hinzufügen (+)**: Über das Plus-Symbol kannst du neue Symbole definieren.
3. **Toggle**: Schalte ausgewählte Symbole mit einem Klick an oder aus.
4. **Entfernen**: Löscht Symbole komplett aus deiner gespeicherten Liste.
5. **Clear Selection**: Hebt alle aktuellen Markierungen in der Liste auf.

### Sprachunterstützung
Der Editor unterstützt mehrere Sprachen (z. B. Deutsch und Englisch), die du bequem über das Dropdown-Menü oben rechts wechseln kannst.

### Tipps für den Workflow
- **Bulk-Aktionen**: Du kannst mehrere Symbole gleichzeitig auswählen und sie mit dem "Toggle"-Button alle auf einmal aktivieren oder deaktivieren.
- **Sauberer Code**: Nutze die Symbole in deinem Code wie folgt:
  ```csharp
  #if MY_AWESOME_FEATURE
      // Dieser Code wird nur kompiliert, wenn das Symbol aktiv ist.
      DoSomething();
  #endif
  ```

---

Dieses Asset ist so konzipiert, dass es sich nahtlos in jeden Workflow einfügt – egal ob für kleine Indie-Projekte oder große Asset-Store-Pakete.