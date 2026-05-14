# Dokumentation der Bewegungssysteme

Willkommen zu den **HK Productions Movement Systems**! Dieses Paket bietet vier verschiedene, anfängerfreundliche Bewegungssysteme für Unity, die sowohl **Tastatur** als auch **Gamepad** über das neue Unity Input System unterstützen.

## Inhaltsverzeichnis
1. [Allgemeine Funktionen](#allgemeine-funktionen)
2. [First Person Movement](#1-first-person-movement)
3. [2D Movement](#2-2d-movement)
4. [Third Person Movement](#3-third-person-movement)
5. [Top-Down Movement](#4-top-down-movement)
6. [Einrichtungsanleitung](#einrichtungsanleitung)
7. [Variablen-Referenz](#variablen-referenz)

---

## Allgemeine Funktionen
Alle Systeme teilen einige Kernfunktionen:
- **Dualer Input-Support**: Volle Unterstützung für Tastatur/Maus und Gamepad.
- **Auto-Setup**: Viele Komponenten (wie Kameras) werden automatisch beim Start (`Awake`) erkannt oder eingerichtet.
- **Sprinting (Sprinten)**: Wechsel zwischen Geh- und Sprintgeschwindigkeit (mit einer `defaultRun` Option).
- **Jumping (Springen)**: Anpassbare Sprunghöhe und optionaler **Double Jump** (Doppelsprung).
- **Kamera-Kollision**: 3D-Systeme enthalten eine Kamera-Kollisionsprüfung (Sphere-Cast), um das Durchschneiden von Wänden zu verhindern.

---

## 1. First Person Movement
Ein klassischer First-Person-Controller, der den `CharacterController` nutzt.
- **Look-System**: Weiche Kamerarotation mit konfigurierbaren Winkellimits.
- **Kamera-Setup**: Findet automatisch die `Main Camera` oder ein untergeordnetes Objekt mit dem Namen `PlayerCam`.
- **Movement**: Seitwärtsbewegungen sowie Vorwärts-/Rückwärtsbewegungen relativ zur Blickrichtung.

## 2. Site Scroller Movement
Ein physikbasiertes Bewegungssystem für Side-Scroller unter Verwendung von `Rigidbody2D`.
- **Erweitertes Springen**: Beinhaltet **Coyote Time** (kurz nach dem Verlassen einer Plattform noch springen) und **Jump Buffer** (Speichern von Sprungeingaben kurz vor der Landung).
- **Smooth Follow Camera**: Verfügt über einen eigenen Kamera-Follower, der sich von der Rotation des Spielers entkoppelt.
- **Automatisches Flippen**: Der Charakter spiegelt automatisch seine Skalierung (`local scale`) basierend auf der Bewegungsrichtung.

## 3. Third Person Movement
Ein Orbit-Bewegungssystem, bei dem sich die Kamera um den Spieler dreht.
- **Orbit-Kamera**: Die Kamera mit der Maus oder dem rechten Stick um den Spieler drehen.
- **Zoom-System**: Verwenden Sie das Mausrad zum Ein- und Auszoomen.
- **Movement**: Der Spieler rotiert weich in die Bewegungsrichtung relativ zur Kameraansicht.

## 4. Top-Down Movement
Ideal für ARPGs oder Twin-Stick Shooter. (Funktioniert sowohl im 2D als auch im 3D Modus)
- **Duale Rotation**: Rotieren in Richtung des Mauszeigers oder des rechten Gamepad-Sticks.
- **Fester Kamerawinkel**: Eine Top-Down-Kamera mit einstellbarer Höhe und Winkel.
- **Zoom-System**: Mausrad zum Anpassen des Kameraabstands.

---

## Einrichtungsanleitung
Befolgen Sie diese Schritte, um eines der Systeme zu nutzen:

1. **Komponente hinzufügen**: Fügen Sie eines der Bewegungsskripte (z. B. `FirstPersonMovement`) Ihrem Spieler-GameObject hinzu.
2. **Komponenten-Anforderungen**:
    - **3D-Systeme**: Fügen automatisch einen `CharacterController` hinzu.
    - **2D-System**: Fügt automatisch einen `Rigidbody2D` hinzu.
3. **Kamera-Setup**: 
    - Erstellen Sie ein untergeordnetes Transform-Objekt namens `LookAt` (für 3D-Systeme), um den Fokuspunkt der Kamera zu definieren.
    - Erstellen Sie ein untergeordnetes Transform-Objekt namens `PlayerCam`, wenn Sie ein spezielles Kameraobjekt verwenden möchten(zbs. Cinemachine); andernfalls wird `Camera.main` genutzt.

---

## Variablen-Referenz

### Bewegungseinstellungen (Movement Settings)
- **Walk Speed / Sprint Speed**: Wie schnell sich der Charakter bewegt.
- **Default Run**: Wenn aktiv, rennt der Spieler standardmäßig und geht nur, wenn die Sprint-Taste gehalten wird.
- **Double Jump Available**: Aktiviert/deaktiviert die Fähigkeit, ein zweites Mal in der Luft zu springen.
- **Jump Height / Force**: Steuert, wie hoch der Charakter springen kann.
- **Gravity**: Eigene Schwerkraft-Skalierung für das Bewegungssystem.

### Kameraeinstellungen (Camera Settings)
- **Look Speed / Sensitivity**: Wie schnell sich die Kamera dreht.
- **Camera Offset**: Der Abstand und die Position der Kamera zum Spieler.
- **Camera Obstruction Layers**: Welche Layer die Kamera blockieren sollen (verhindert Clipping).
- **Smooth Time (2D)**: Wie schnell die Kamera dem Spieler folgt.

### 2D Spezifisch
- **Coyote Time**: Zeitfenster für einen Sprung nach dem Herunterfallen von einer Kante.
- **Jump Buffer Time**: Zeitfenster, in dem eine Sprungeingabe vor dem Aufprall auf den Boden gespeichert wird.
- **Ground Layer**: Welche Layer das Skript als "begehbar" betrachtet.
