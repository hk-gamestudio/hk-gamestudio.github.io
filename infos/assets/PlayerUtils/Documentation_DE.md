# PlayerUtils Asset - Vollständige Dokumentation

## 1. Einleitung

### Was kann das Asset?

Das **PlayerUtils Asset** ist ein umfassendes Player-Controller-System für Unity, das folgende Funktionen bereitstellt:

- **Bewegungssystem**: Vollständig animierte Third-Person Charaktersteuerung mit Idle, Gehen, Laufen, Angreifen und Sterben mit flüssigen Übergängen
- **Kamera-System**: Intelligente Third-Person Kamera mit Kollisionserkennung, Zoom und freier Rotation
- **Ziel-System (Aiming)**: Präzises Zielsystem mit einschränkbaren Winkeln für realistische Angriffe
- **Angriffssystem**: Drei verschiedene Angriffsarten:
  - Nahkampf-Angriff (Base Attack)
  - Fernkampf-Angriff mit Projektilen (Shot Attack)
  - Schutzschild (Shield)
  - Items (können auch für Angriffe genutzt werden durch code anpassung in der `AttackSpawner.cs`)
- **Stats-System**: Vollständiges Charakterstatistik-System mit:
  - Gesundheit (HP/Vita)
  - Erfahrungspunkte und Level-System
  - Element-Typen und Interaktionen (Feuer, Wasser, Erde, etc.)
  - Rüstung und kritische Treffer
  - Angriffs-Cooldowns
- **UI-System**: Integrierte UI mit:
  - Hauptmenü
  - Todesbildschirm mit Respawn-Funktion
  - Ingame HUD mit HP-Bar, XP-Bar, Level-Anzeige und Cooldown-Anzeigen
- **Menu-System**: Vollständiges Menü-Management mit Fade-Effekten, Audio und Intro-Cutscene
- **Tod und Respawn**: Automatisches Tod-Management mit Animation und Respawn an definierten Punkten

---

## 2. Vorbereitung

### 2.1 Was brauche ich?

Um das PlayerUtils Asset in deinem Projekt zu verwenden, benötigst du:

#### Eigene Assets (selbst bereitzustellen):
1. **Animierter Character** (optional - ein X-Bot Character ist im Asset enthalten)
   - Mit Animator Controller
   - Benötigte Animationen:
     - Idle Animation
     - Walk Animation
     - Run Animation
     - Attack Animation
     - Death Animation
   - Blend Tree für Movement (Idle → Walk → Run)
   - Trigger: "Attack" und "Death"
   - Float Parameter: "Movement" (0 = Idle, 1 = Walk, 2 = Run)

2. **UI-Elemente** (selbst zu gestalten):
   - Hauptmenü mit Buttons (New Game, Load Game, Exit)
   - Todesbildschirm mit Buttons (Respawn, Main Menu)
   - Ingame HUD mit:
     - Gesundheitsanzeige (Image mit Fill Amount)
     - XP-Bar (Image mit Fill Amount)
     - XP-Text (TextMeshPro)
     - Level-Text (TextMeshPro)
     - 6x Cooldown-Anzeigen (Images mit Fill Amount für Angriffe und Items)

3. **Audio-Dateien**:
   - Menü-Musik
   - Button-Hover Sound
   - Button-Click Sound
   - Start-Game Sound
   - Cutscene Audio

4. **Umgebung**:
   - Terrain oder Level-Geometrie
   - Respawn-Punkte (Empty Gameobjects mit Tag `Respawn`)

5. **Presets**:
    - VFX für Projektil-Treffer
    - VFX für Angriffs-Cast
    - Projektil-Prefab
    - Schutzschild-Prefab

### 2.2 Was bringt das Asset mit?

Das Asset beinhaltet:

#### Skripte:
- `Stats.cs` - Charakterstatistiken-Verwaltung
- `StatManager.cs` - Globales Stats-System-Management
- `MovementController.cs` - Charakterbewegung
- `CameraController.cs` - Kamerasteuerung
- `AimController.cs` - Zielsystem
- `AttackSpawner.cs` - Angriffsverwaltung
- `BulletHit.cs` - Projektil-Kollision
- `Shield.cs` - Schutzschild-Logik
- `MenuManager.cs` - Menü-Verwaltung
- `StartSequenz.cs` - Intro-Cutscene
- `ElementInteraction.cs` - Element-Interaktionssystem

#### Prefabs & Assets:
- **X Bot** Character Model (animiert) mit Animationen:
  - Idle (Dwarf Idle)
  - Walking
  - Running (Fast Run)
  - Boxing (Attack)
  - Brutal Assassination (Death)
- **Projectile.prefab** - Projektil für Fernkampf
- **Shield.prefab** - Schutzschild
- **Partikel.prefab** - Cast-Effekt
- **XP-Bar.png** - UI Sprite für Erfahrungsleiste
- **Player.controller** - Animator Controller für X Bot
- **vCam1.controller** - Cinemachine Kamera Animation

#### Materialien:
- PartikelMesh.mat - Material für Partikeleffekte

### 2.3 Muss ich Tags oder Layer erstellen?

**Ja, folgende Tags müssen im Unity Tag Manager erstellt werden:**

1. **"Player"** Tag
   - Wird benötigt für das Spieler-GameObject
   - Wird von `BulletHit.cs` verwendet, um Kollisionen mit dem eigenen Charakter zu verhindern

2. **"Respawn"** Tag
   - Wird benötigt für alle Respawn-Punkt GameObjects
   - Wird von `StatManager.cs` verwendet, um den nächsten Respawn-Punkt zu finden

**Wie erstelle ich Tags?**
1. Unity Editor öffnen
2. `Edit` → `Project Settings` → `Tags and Layers`
3. Unter "Tags" auf das `+` Symbol klicken
4. Tag-Name eingeben ("Player" und "Respawn")
5. Speichern

### 2.4 Fordert der Code bestimmte Objektnamen?

**Ja, folgende spezifische Objektnamen werden vom Code erwartet:**

1. **"Background"**
   - Ein Image-GameObject im DeathScreen Canvas
   - Wird für den Fade-Effekt beim Tod benötigt
   - Muss ein `UnityEngine.UI.Image` Component haben

**Alle anderen GameObjects können beliebig benannt werden, solange die Referenzen im Inspector korrekt zugewiesen sind.**

---

## 3. Scene-Aufbau - Schritt für Schritt

Dieser Abschnitt führt dich durch den kompletten Aufbau einer funktionierenden Scene wie der Demo.scene.

### 3.1 Basis Scene Setup

#### Schritt 1: Neue Scene erstellen
1. `File` → `New Scene` → `3D (URP)` oder deine bevorzugte Render Pipeline
2. Scene speichern unter einem Namen deiner Wahl

#### Schritt 2: Tags erstellen
1. Erstelle die Tags "Player" und "Respawn" (siehe Abschnitt 2.3)

#### Schritt 3: Scene Hierarchie aufbauen

Baue die Scene wie folgt auf. Alle Namen müssen genau übereinstimmen!

```
Demo (Scene)
├── Main Camera
│   └── Components: Transform, Camera, AudioListener, UniversalAdditionalCameraData, CinemachineBrain
│
├── Directional Light
│   └── Components: Transform, Light, UniversalAdditionalLightData
│
├── Global Volume
│   └── Components: Transform, Volume
│
├── StatManager (Empty GameObject)
│   └── Components: Transform, StatManager.cs
│
├── Menus (Empty GameObject)
│   ├── Components: Transform, MenuManager.cs
│   │
│   ├── SoundMaker (Empty GameObject)
│   │   └── Components: Transform, AudioSource (für Musik), AudioSource (für Button SFX)
│   │
│   ├── StartSequenz (GameObject - NICHT Canvas! - initial inaktiv)
│   │   ├── Components: Transform, AudioSource, StartSequenz.cs
│   │   ├── vCam1 (Cinemachine Camera)
│   │   │   └── Components: Transform, CinemachineCamera
│   │   └── Spline (GameObject)
│   │       └── Components: Transform, SplineContainer
│   │
│   ├── MainMenu (Canvas - initial inaktiv)
│   │   ├── Components: RectTransform, Canvas, CanvasScaler, GraphicRaycaster
│   │   ├── NewGame (Button)
│   │   │   ├── Components: RectTransform, CanvasRenderer, Image, Button
│   │   │   └── Text (Legacy) oder TextMeshPro als Child
│   │   ├── LoadGame (Button)
│   │   │   ├── Components: RectTransform, CanvasRenderer, Image, Button
│   │   │   └── Text (Legacy) oder TextMeshPro als Child
│   │   ├── Exit (Button)
│   │   │   ├── Components: RectTransform, CanvasRenderer, Image, Button
│   │   │   └── Text (Legacy) oder TextMeshPro als Child
│   │   └── CutSceneBackground (Image - initial inaktiv)
│   │       ├── Components: RectTransform, CanvasRenderer, Image
│   │       └── Text (TextMeshPro) als Child (für CutsceneText von StartSequenz)
│   │
│   ├── DeathScreen (Canvas - initial inaktiv)
│   │   ├── Components: RectTransform, Canvas, CanvasScaler, GraphicRaycaster
│   │   ├── Background (Image) ⚠️ WICHTIG: Name MUSS exakt "Background" sein!
│   │   │   └── Components: RectTransform, CanvasRenderer, Image
│   │   ├── Image (Image mit Text als Child für "You Died" Titel)
│   │   │   ├── Components: RectTransform, CanvasRenderer, Image
│   │   │   └── Text (Legacy) oder TextMeshPro als Child
│   │   ├── Respawn (Button)
│   │   │   ├── Components: RectTransform, CanvasRenderer, Image, Button
│   │   │   └── Text (Legacy) oder TextMeshPro als Child
│   │   └── MainMenu (Button)
│   │       ├── Components: RectTransform, CanvasRenderer, Image, Button
│   │       └── Text (Legacy) oder TextMeshPro als Child
│   │
│   └── InGame (Canvas - initial aktiv)
│       ├── Components: RectTransform, Canvas, CanvasScaler, GraphicRaycaster
│       │
│       ├── XP Bar (Container)
│       │   ├── Components: RectTransform
│       │   ├── XP Background (Image)
│       │   │   └── Components: RectTransform, CanvasRenderer, Image
│       │   ├── XP Filler (Image mit Fill Amount = Horizontal, 0-1)
│       │   │   └── Components: RectTransform, CanvasRenderer, Image
│       │   ├── XP Text (TextMeshPro für "50/100")
│       │   │   └── Components: RectTransform, CanvasRenderer, TextMeshProUGUI
│       │   └── PlayerImage (Image - optional für Avatar/Icon)
│       │       ├── Components: RectTransform, CanvasRenderer, Image
│       │       └── Level Text (TextMeshPro) als Child für Level-Anzeige
│       │
│       ├── Health Bar (Container)
│       │   ├── Components: RectTransform
│       │   ├── Health Background (Image)
│       │   │   └── Components: RectTransform, CanvasRenderer, Image
│       │   └── Health Filler (Image mit Fill Amount = Horizontal, 0-1)
│       │       └── Components: RectTransform, CanvasRenderer, Image
│       │
│       ├── Items (Container)
│       │   ├── Components: RectTransform
│       │   ├── Item 1 (Image mit Fill Amount = Radial360)
│       │   │   └── Components: RectTransform, CanvasRenderer, Image
│       │   ├── Item 2 (Image mit Fill Amount = Radial360)
│       │   │   └── Components: RectTransform, CanvasRenderer, Image
│       │   └── Item 3 (Image mit Fill Amount = Radial360)
│       │       └── Components: RectTransform, CanvasRenderer, Image
│       │
│       └── Actions (Container)
│           ├── Components: RectTransform
│           ├── Action 1 (Image mit Fill Amount = Radial360)
│           │   └── Components: RectTransform, CanvasRenderer, Image
│           ├── Action 2 (Image mit Fill Amount = Radial360)
│           │   └── Components: RectTransform, CanvasRenderer, Image
│           └── Action 3 (Image mit Fill Amount = Radial360)
│               └── Components: RectTransform, CanvasRenderer, Image
│
├── EventSystem
│   └── Components: Transform, EventSystem, InputSystemUIInputModule
│
├── Terrain
│   ├── Components: Transform, Terrain, TerrainCollider
│   ├── Respawn 1 (GameObject mit MeshFilter + MeshRenderer für Visualisierung)
│   │   ├── Tag: "Respawn" ⚠️
│   │   └── Components: Transform, MeshFilter, MeshRenderer
│   ├── Respawn 2
│   │   ├── Tag: "Respawn" ⚠️
│   │   └── Components: Transform, MeshFilter, MeshRenderer
│   ├── Respawn 3
│   │   ├── Tag: "Respawn" ⚠️
│   │   └── Components: Transform, MeshFilter, MeshRenderer
│   └── Respawn 4
│       ├── Tag: "Respawn" ⚠️
│       └── Components: Transform, MeshFilter, MeshRenderer
│
└── Player (Empty GameObject)
    ├── Tag: "Player" ⚠️
    ├── Components: Transform
    │
    └── Player/X Bot (Character Model - z.B. X Bot Prefab)
        ├── Components:
        │   - Transform
        │   - Animator (mit Player.controller)
        │   - CharacterController
        │   - CameraController.cs
        │   - AimController.cs
        │   - MovementController.cs
        │   - Stats.cs
        │   - AttackSpawner.cs
        │
        ├── Beta_Joints (SkinnedMeshRenderer)
        │   └── Components: Transform, SkinnedMeshRenderer
        │
        ├── Beta_Surface (SkinnedMeshRenderer)
        │   └── Components: Transform, SkinnedMeshRenderer
        │
        ├── mixamorig:Hips (Root Bone)
        │   ├── mixamorig:LeftUpLeg
        │   │   └── mixamorig:LeftLeg
        │   │       └── mixamorig:LeftFoot
        │   │           └── mixamorig:LeftToeBase
        │   │               └── mixamorig:LeftToe_End
        │   ├── mixamorig:RightUpLeg
        │   │   └── mixamorig:RightLeg
        │   │       └── mixamorig:RightFoot
        │   │           └── mixamorig:RightToeBase
        │   │               └── mixamorig:RightToe_End
        │   └── mixamorig:Spine
        │       └── mixamorig:Spine1
        │           └── mixamorig:Spine2
        │               ├── mixamorig:LeftShoulder
        │               │   └── mixamorig:LeftArm
        │               │       └── mixamorig:LeftForeArm
        │               │           └── mixamorig:LeftHand
        │               │               ├── mixamorig:LeftHandThumb1 → ... → Thumb4_End
        │               │               ├── mixamorig:LeftHandIndex1 → ... → Index4_End
        │               │               └── mixamorig:LeftHandMiddle1 → ... → Middle4_End
        │               ├── mixamorig:RightShoulder
        │               │   └── mixamorig:RightArm
        │               │       └── mixamorig:RightForeArm
        │               │           └── mixamorig:RightHand
        │               │               ├── mixamorig:RightHandThumb1 → ... → Thumb4_End
        │               │               ├── mixamorig:RightHandIndex1 → ... → Index4_End
        │               │               └── mixamorig:RightHandMiddle1 → ... → Middle4_End
        │               └── mixamorig:Neck
        │                   └── mixamorig:Head ⚠️ WICHTIG: AimConstraint Component hinzufügen!
        │                       ├── Components: Transform, AimConstraint
        │                       └── mixamorig:HeadTop_End
        │
        ├── HeadAnglePoint (Empty GameObject)
        │   └── Components: Transform
        │
        ├── LookAt (Empty GameObject)
        │   └── Components: Transform
        │
        ├── AimPoint (Empty GameObject)
        │   └── Components: Transform
        │
        └── PlayerCam (Cinemachine Virtual Camera)
            └── Components: Transform, CinemachineCamera
```

**⚠️ KRITISCHE DETAILS - MÜSSEN EXAKT ÜBEREINSTIMMEN:**

1. **Tags (müssen erstellt werden):**
   - "Player" → auf "Player" GameObject
   - "Respawn" → auf alle 4 Respawn GameObjects

2. **Exakte Namen (Hardcoded im Code):**
   - "Background" → Image im DeathScreen Canvas
   - "vCam1" → CinemachineCamera im StartSequenz

3. **Initial Active States:**
   - StartSequenz: **inaktiv** (true)
   - MainMenu: **inaktiv** (true)
   - DeathScreen: **inaktiv** (false)
   - InGame: **aktiv** (false)
   - SoundMaker: **aktiv** (true)
   - Player: **aktiv** (false)

4. **Canvas Render Modes:**
   - MainMenu: Screen Space - Overlay
   - DeathScreen: Screen Space - Overlay
   - InGame: Screen Space - Overlay (oder Camera)

5. **Image Fill Types:**
   - Health Filler: Fill 
   - XP Filler: Fill 
   - Action 1, 2, 3: Fill 
   - Item 1, 2, 3: Fill 

6. **AimConstraint Setup:**
   - Auf Head Bone
   - Weight: 1
   - Source: `AimPoint` GameObject

7. **Attack Spawn**:
   - Füge dem Bone wo die Attacke spawnen soll ein Empty GameObject `AttackSpawner` zu

#### Schritt 4: Scripte zuweisen und konfigurieren

Jetzt müssen die Scripte den richtigen GameObjects zugewiesen werden:

**4.1 StatManager GameObject:**
- Füge `StatManager.cs` hinzu
- Keine Inspector-Einstellungen nötig (findet Player automatisch mit Tag)

**4.2 Menus GameObject:**
- Füge `MenuManager.cs` hinzu
- Felder werden in Schritt 5 zugewiesen

**4.3 StartSequenz GameObject:**
- Füge `AudioSource` Component hinzu
- Füge `StartSequenz.cs` hinzu
- Felder werden in Schritt 5 zugewiesen

**4.4 Player/X Bot GameObject:**

**Animator Setup:**
- Füge `Animator` Component hinzu
- Controller: `Player.controller` (Trigger `Attack`, Trigger `Death`, BlendTree `Movement` Idle=0, Walk=1, Run=2)
- Avatar: Auto-generiertes Avatar vom Character Prefab
- Apply Root Motion: **false**
- Update Mode: **Normal**
- Culling Mode: Always Animate

**CharacterController Setup:**
- Füge `CharacterController` Component hinzu
- Center: **(0, 1, 0)** (Y-Offset = halbe Höhe des Characters)
- Radius: **0.5** (anpassen an dein Character Model)
- Height: **2** (anpassen an dein Character Model)
- Slope Limit: **45**
- Step Offset: **0.3**
- Skin Width: **0.08**
- Min Move Distance: **0.001**

**Scripts hinzufügen:**
- Füge `MovementController.cs` hinzu
- Füge `CameraController.cs` hinzu
- Füge `AimController.cs` hinzu
- Füge `Stats.cs` hinzu
- Füge `AttackSpawner.cs` hinzu

**Alle Felder dieser Scripts werden in Schritt 5 zugewiesen!**

**4.5 mixamorig:Head Bone:**
- Füge `AimConstraint` Component hinzu
- **Locked**: false
- **Is Active**: true
- **Weight**: 1
- **Source Objects**: `AimPoint`

**4.6 PlayerCam GameObject:**
- **Componenten**: CinemachineCamera
- Lass alle Einstellungen auf Default (wird von CameraController.cs gesteuert)

**4.7 Main Camera:**
- Füge `CinemachineBrain` Component hinzu
- Default Blend: Ease In Out
- Update Method: Late Update
- Custom Blends: vCam1 → PlayerCam (Time = muss getestet werden wie du es haben willst)

#### Schritt 5: Inspector-Felder zuweisen

Nun müssen alle öffentlichen Felder der Scripte im Inspector **EXAKT** zugewiesen werden. Die Feldnamen entsprechen den exakten Namen aus den C# Scripts!

---

**5.1 MovementController:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `playerCamera` | Ziehe **Main Camera** rein |
| `gravity` | `-10` |
| `blendSmooth` | `8` |
| `walkSpeed` | `1` |
| `runSpeed` | `3` |
| `attackSpawner` | `AttackSpawner` |

---

**5.2 CameraController:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `cam` | `PlayerCam` |
| `target` | `LookAt` |
| `offset` | `1.5` |
| `distance` | `5` |
| `minDistance` | `2` |
| `maxDistance` | `15` |
| `xSpeed` | `120` |
| `ySpeed` | `120` |
| `yMinLimit` | `-20` |
| `yMaxLimit` | `80` |
| `zoomSpeed` | `2` |
| `camRadius` | `0.3` |
| `collisionMask` | `zbs. Everything` |

---

**5.3 AimController:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `aimTarget` | `AimPoint` |
| `playerCamera` | `MainCamera` |
| `headAnglePoint` | `HeadAnglePoint` |
| `maxHorizontalAngle` | `45` |
| `maxVerticalAngle` | `30` |
| `minVerticalAngle` | `-30` |
| `aimTargetOffset` | `(0, 0, 0)` |
| `maxAimDistance` | `30` |
| `aimLayerMask` | `zbs. Everything` |

---

**5.4 Stats (auf Player/X Bot GameObject):**

**Base Character Stats:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `element` | `Normal` |
| `level` | `0` |
| `currentXP` | `0` |
| `maxXP` | `100` |
| `isAlive` | `true` ✓ |
| `currentVita` | `100` |
| `maxVita` | `100` |
| `damage` | `12` |
| `armor` | `6` |
| `runSpeed` | `5` |
| `walkSpeed` | `3` |
| `critChance` | `30` |
| `critDamage` | `120` |
| `baseAttackCooldown` | `10` |
| `specialAttack1Cooldown` | `10` |
| `specialAttack2Cooldown` | `30` |
| `item1Cooldown` | `5` |
| `item2Cooldown` | `8` |
| `item3Cooldown` | `12` |

**Character UI:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `healthBar` | `Health Filler` |
| `xpBar` | `XP Filler` |
| `xpText` | `XP Text` |
| `levelText` | `Level Text` |
| `isLevelingUp` | `false` |
| `baseAttackCooldownIMG` | `Action 1 Cooldown` |
| `specialAttack1CooldownIMG` | `Action 2 Cooldown` |
| `specialAttack2CooldownIMG` | `Action 3 Cooldown` |
| `Item1CooldownIMG` | `Item 1 Cooldown` |
| `Item2CooldownIMG` | `Item 2 Cooldown` |
| `Item3CooldownIMG` | `Item 3 Cooldown` |

**Debug (optional):**
- `tryHeal` → `false`
- `tryHoT` → `false`
- `tryXP` → `false`
- `tryDeath` → `false`

---

**5.5 AttackSpawner:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `AttackSpawnPoint` | `AttackSpawnPoint` |
| `AimTarget` | `AimPoint` |
| `bulletCast` | `BulletCast` Prefab (zbs. Partikel) |
| `bullet` | `Bullet` Prefab (zbs. Partikel) |
| `bulletHit` | `BulletHit` Prefab (zbs. Partikel) |
| `selfCast` | `SelfCast` Prefab (zbs. Partikel) |
| `shield` | `Shield` Prefab (zbs. Partikel) |

---

**5.6 MenuManager (auf Menus GameObject):**

**Main Menu:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `mainMenu` | `MainMenu` Canvas |
| `newGameBtn` | `NewGame` Button |
| `loadGameBtn` | `LoadGame` Button |
| `exitBtn` | `Exit` Button |

**Start Sequenz:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `startSequenz` | `StartSequenz` |
| `vCam` | `vCam1` |
| `intro` | `false` |

**Death Screen:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `deathScreen` | `DeathScreen` Canvas |
| `respawnBtn` | `Respawn` Button |
| `mainMenuBtn` | `MainMenu` Button |

**Sounds:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `soundMaker` | `SoundMaker` |
| `menuMusic` | `Menu Music` AudioClip |
| `buttonHover` | `Button Hover` AudioClip |
| `buttonClick` | `Button Click` AudioClip |
| `startGame` | `Start Game` AudioClip |

**Player:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `player` | `Player` (Root mit Tag "Player") |
| `inGame` | `InGame` Canvas |

---

**5.7 StartSequenz:**

| Feld (exakter Name) | Zuweisung |
|---------------------|-----------|
| `cutSceneBackground` | `CutSceneBackground` |
| `cutSceneText` | `CutSceneText` |
| `cutSceneAudio` | `Cutscene` AudioClip |
| `splineContainer` | `Spline` |
| `movementDuration` | `0.5` |
| `textToWrite` | Passe den Text an wie du ihn brauchst |

---

**5.8 AimConstraint:**

1. Klicke auf das **"+"** für Add source
2. Wähle **AimPoint** GameObject als Source
3. **Source Weight**: `1`
4. **Constraint Weight**: `1`
5. **Is Active**: ✓

---

**5.9 UI Button Events konfigurieren:**

Die Button-Events werden automatisch von `MenuManager.cs` im Start() per Code zugewiesen:
- `newGameBtn.onClick` → startet New Game
- `loadGameBtn.onClick` → startet Load Game (Placeholder)
- `exitBtn.onClick` → beendet Spiel
- `respawnBtn.onClick` → respawned Player
- `mainMenuBtn.onClick` → zurück zum MainMenu

**Keine manuelle Button-Event-Zuweisung im Inspector nötig!**

---

### 3.2 Input System Setup

Das Asset verwendet das **Unity Input System**. Du musst Input Actions konfigurieren:

1. Erstelle ein Input Actions Asset: `Right Click → Create → Input Actions`
2. Benenne es "PlayerControls" oder ähnlich
3. Füge folgende Actions hinzu:

**Movement Action Map:**
- **Move**: WASD (PC), Left Stick (Gamepad)
- **Walk**: Left Shift (PC), Left Trigger (Gamepad)
- **Aim**: Mouse Drag (PC), Left Stick (Gamepad)

**Combat Action Map:**
- **Attack1**: Left Mouse Button (PC), Button South (Gamepad)
- **Attack2**: Right Mouse Button (PC), Button East (Gamepad)
- **Shield**: 1 (PC), Button West (Gamepad)
- **Item1**: 2 (PC), D-Pad Up (Gamepad)
- **Item2**: 3 (PC), D-Pad Right (Gamepad)
- **Item3**: 4 (PC), D-Pad Down (Gamepad)

---

### 3.3 Animation Setup

Falls du deinen eigenen Character verwendest:

1. **Animator Controller erstellen**:
   - Erstelle einen neuen Animator Controller
   - Füge einen **Blend Tree** für Movement hinzu (Idle → Walk → Run)
   - Parameter: Float "Movement" (0 = Idle, 1 = Walk, 2 = Run)
   
2. **Trigger hinzufügen**:
   - "Attack" Trigger
   - "Death" Trigger

3. **Transitionen**:
   - Any State → Attack (Bedingung: Attack Trigger)
   - Any State → Death (Bedingung: Death Trigger)
   - Attack → Idle (Has Exit Time aktiviert)

4. **Bone Setup**:
   - Stelle sicher, dass dein Character ein Head Bone hat
   - Füge `AimConstraint` zum Head Bone hinzu
   - Weise das "LookAt" GameObject als Constraint Source zu

---

## 4. Testen und Play drücken