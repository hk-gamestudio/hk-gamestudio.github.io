# PlayerUtils Asset - Complete Documentation

## 1. Introduction

### What can the asset do?

The **PlayerUtils Asset** is a comprehensive player controller system for Unity that provides the following features:

- **Movement System**: Fully animated third-person character controller with idle, walking, running, attacking, and dying with smooth transitions
- **Camera System**: Intelligent third-person camera with collision detection, zoom, and free rotation
- **Aiming System**: Precise aiming system with adjustable angles for realistic attacks
- **Attack System**: Three different attack types:
  - Melee Attack (Base Attack)
  - Ranged Attack with projectiles (Shot Attack)
  - Shield (Shield)
  - Items (can also be used for attacks by modifying the code in `AttackSpawner.cs`)
- **Stats System**: Complete character statistics system including:
  - Health (HP/Vita)
  - Experience points and level system
  - Element types and interactions (Fire, Water, Earth, etc.)
  - Armor and critical hits
  - Attack cooldowns
- **UI System**: Integrated UI including:
  - Main menu
  - Death screen with respawn function
  - In‑game HUD with HP bar, XP bar, level display, and cooldown indicators
- **Menu System**: Full menu management with fade effects, audio, and intro cutscene
- **Death and Respawn**: Automatic death handling with animation and respawn at defined points

---

## 2. Preparation

### 2.1 What do I need?

To use the PlayerUtils Asset in your project, you need:

#### Your own assets (must be provided by you):
1. **Animated Character** (optional – an X‑Bot character is included in the asset)
   - With Animator Controller
   - Required animations:
     - Idle animation
     - Walk animation
     - Run animation
     - Attack animation
     - Death animation
   - Blend Tree for movement (Idle → Walk → Run)
   - Triggers: "Attack" and "Death"
   - Float parameter: "Movement" (0 = Idle, 1 = Walk, 2 = Run)

2. **UI Elements** (must be designed by you):
   - Main menu with buttons (New Game, Load Game, Exit)
   - Death screen with buttons (Respawn, Main Menu)
   - In‑game HUD with:
     - Health bar (Image with Fill Amount)
     - XP bar (Image with Fill Amount)
     - XP text (TextMeshPro)
     - Level text (TextMeshPro)
     - 6x cooldown indicators (Images with Fill Amount for attacks and items)

3. **Audio Files**:
   - Menu music
   - Button hover sound
   - Button click sound
   - Start game sound
   - Cutscene audio

4. **Environment**:
   - Terrain or level geometry
   - Respawn points (empty GameObjects with tag `Respawn`)

5. **Presets**:
   - VFX for projectile hit
   - VFX for attack cast
   - Projectile prefab
   - Shield prefab

### 2.2 What does the asset include?

The asset includes:

#### Scripts:
- `Stats.cs` – Character statistics management
- `StatManager.cs` – Global stats system management
- `MovementController.cs` – Character movement
- `CameraController.cs` – Camera control
- `AimController.cs` – Aiming system
- `AttackSpawner.cs` – Attack management
- `BulletHit.cs` – Projectile collision
- `Shield.cs` – Shield logic
- `MenuManager.cs` – Menu management
- `StartSequenz.cs` – Intro cutscene
- `ElementInteraction.cs` – Element interaction system

#### Prefabs & Assets:
- **X Bot** character model (animated) with animations:
  - Idle (Dwarf Idle)
  - Walking
  - Running (Fast Run)
  - Boxing (Attack)
  - Brutal Assassination (Death)
- **Projectile.prefab** – Projectile for ranged attacks
- **Shield.prefab** – Shield
- **Partikel.prefab** – Cast effect
- **XP-Bar.png** – UI sprite for XP bar
- **Player.controller** – Animator Controller for X Bot
- **vCam1.controller** – Cinemachine camera animation

#### Materials:
- PartikelMesh.mat – Material for particle effects

### 2.3 Do I need to create tags or layers?

**Yes, the following tags must be created in the Unity Tag Manager:**

1. **"Player"** tag  
   - Required for the player GameObject  
   - Used by `BulletHit.cs` to prevent collisions with the player

2. **"Respawn"** tag  
   - Required for all respawn point GameObjects  
   - Used by `StatManager.cs` to find the next respawn point

**How to create tags:**
1. Open Unity Editor  
2. `Edit` → `Project Settings` → `Tags and Layers`  
3. Under "Tags", click the `+` symbol  
4. Enter tag name ("Player" and "Respawn")  
5. Save

### 2.4 Does the code require specific object names?

**Yes, the following specific object names are required by the code:**

1. **"Background"**
   - An Image GameObject in the DeathScreen canvas  
   - Required for the fade effect on death  
   - Must have a `UnityEngine.UI.Image` component

**All other GameObjects can be named freely as long as the references in the Inspector are assigned correctly.**

---

## 3. Scene Setup – Step by Step

This section guides you through the complete setup of a working scene like the Demo.scene.

### 3.1 Basic Scene Setup

#### Step 1: Create a new scene
1. `File` → `New Scene` → `3D (URP)` or your preferred render pipeline  
2. Save the scene under a name of your choice

#### Step 2: Create tags
1. Create the tags "Player" and "Respawn" (see section 2.3)

#### Step 3: Build the scene hierarchy

Build the scene as follows. All names must match exactly!

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


**⚠️ CRITICAL DETAILS – MUST MATCH EXACTLY:**

1. **Tags (must be created):**
   - "Player" → on "Player" GameObject
   - "Respawn" → on all 4 Respawn GameObjects

2. **Exact names (hardcoded in code):**
   - "Background" → Image in DeathScreen canvas
   - "vCam1" → CinemachineCamera in StartSequenz

3. **Initial active states:**
   - StartSequenz: **inactive**
   - MainMenu: **inactive**
   - DeathScreen: **inactive**
   - InGame: **active**
   - SoundMaker: **active**
   - Player: **active**

4. **Canvas Render Modes:**
   - MainMenu: Screen Space – Overlay
   - DeathScreen: Screen Space – Overlay
   - InGame: Screen Space – Overlay (or Camera)

5. **Image Fill Types:**
   - Health Filler: Fill
   - XP Filler: Fill
   - Action 1, 2, 3: Fill
   - Item 1, 2, 3: Fill

6. **AimConstraint Setup:**
   - On head bone
   - Weight: 1
   - Source: `AimPoint` GameObject

7. **Attack Spawn:**
   - Add an empty GameObject `AttackSpawner` to the bone where the attack should spawn

#### Step 4: Assign and configure scripts

Now the scripts must be assigned to the correct GameObjects:

**4.1 StatManager GameObject:**
- Add `StatManager.cs`
- No Inspector settings required (automatically finds player by tag)

**4.2 Menus GameObject:**
- Add `MenuManager.cs`
- Fields will be assigned in Step 5

**4.3 StartSequenz GameObject:**
- Add `AudioSource` component
- Add `StartSequenz.cs`
- Fields will be assigned in Step 5

**4.4 Player/X Bot GameObject:**

**Animator Setup:**
- Add `Animator` component
- Controller: `Player.controller` (Trigger `Attack`, Trigger `Death`, BlendTree `Movement` Idle=0, Walk=1, Run=2)
- Avatar: Auto-generated avatar from character prefab
- Apply Root Motion: **false**
- Update Mode: **Normal**
- Culling Mode: Always Animate

**CharacterController Setup:**
- Add `CharacterController` component
- Center: **(0, 1, 0)** (Y offset = half the character height)
- Radius: **0.5** (adjust to your character model)
- Height: **2** (adjust to your character model)
- Slope Limit: **45**
- Step Offset: **0.3**
- Skin Width: **0.08**
- Min Move Distance: **0.001**

**Add scripts:**
- Add `MovementController.cs`
- Add `CameraController.cs`
- Add `AimController.cs`
- Add `Stats.cs`
- Add `AttackSpawner.cs`

**All fields of these scripts will be assigned in Step 5!**

**4.5 mixamorig:Head bone:**
- Add `AimConstraint` component
- **Locked**: false
- **Is Active**: true
- **Weight**: 1
- **Source Objects**: `AimPoint`

**4.6 PlayerCam GameObject:**
- **Components**: CinemachineCamera
- Leave all settings at default (controlled by CameraController.cs)

**4.7 Main Camera:**
- Add `CinemachineBrain` component
- Default Blend: Ease In Out
- Update Method: Late Update
- Custom Blends: vCam1 → PlayerCam (Time = must be tested to your liking)

#### Step 5: Assign Inspector fields

Now all public fields of the scripts must be assigned in the Inspector.

---

**5.1 MovementController:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `playerCamera` | Drag **Main Camera** here |
| `gravity` | `-10` |
| `blendSmooth` | `8` |
| `walkSpeed` | `1` |
| `runSpeed` | `3` |
| `attackSpawner` | `AttackSpawner` |

---

**5.2 CameraController:**

| Field (exact name) | Assignment |
|--------------------|-----------|
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
| `collisionMask` | e.g. `Everything` |

---

**5.3 AimController:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `aimTarget` | `AimPoint` |
| `playerCamera` | `Main Camera` |
| `headAnglePoint` | `HeadAnglePoint` |
| `maxHorizontalAngle` | `45` |
| `maxVerticalAngle` | `30` |
| `minVerticalAngle` | `-30` |
| `aimTargetOffset` | `(0, 0, 0)` |
| `maxAimDistance` | `30` |
| `aimLayerMask` | e.g. `Everything` |

---

**5.4 Stats (on Player/X Bot GameObject):**

**Base Character Stats:**

| Field (exact name) | Assignment |
|--------------------|-----------|
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

| Field (exact name) | Assignment |
|--------------------|-----------|
| `healthBar` | `Health Filler` |
| `xpBar` | `XP Filler` |
| `xpText` | `XP Text` |
| `levelText` | `Level Text` |
| `isLevelingUp` | `false` |
| `baseAttackCooldownIMG` | `Action 1` cooldown image |
| `specialAttack1CooldownIMG` | `Action 2` cooldown image |
| `specialAttack2CooldownIMG` | `Action 3` cooldown image |
| `Item1CooldownIMG` | `Item 1` cooldown image |
| `Item2CooldownIMG` | `Item 2` cooldown image |
| `Item3CooldownIMG` | `Item 3` cooldown image |

**Debug (optional):**
- `tryHeal` → `false`
- `tryHoT` → `false`
- `tryXP` → `false`
- `tryDeath` → `false`

---

**5.5 AttackSpawner:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `AttackSpawnPoint` | `AttackSpawnPoint` |
| `AimTarget` | `AimPoint` |
| `bulletCast` | `BulletCast` prefab (e.g. particle) |
| `bullet` | `Bullet` prefab (e.g. particle) |
| `bulletHit` | `BulletHit` prefab (e.g. particle) |
| `selfCast` | `SelfCast` prefab (e.g. particle) |
| `shield` | `Shield` prefab (e.g. particle) |

---

**5.6 MenuManager (on Menus GameObject):**

**Main Menu:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `mainMenu` | `MainMenu` canvas |
| `newGameBtn` | `NewGame` button |
| `loadGameBtn` | `LoadGame` button |
| `exitBtn` | `Exit` button |

**Start Sequence:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `startSequenz` | `StartSequenz` |
| `vCam` | `vCam1` |
| `intro` | `false` |

**Death Screen:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `deathScreen` | `DeathScreen` canvas |
| `respawnBtn` | `Respawn` button |
| `mainMenuBtn` | `MainMenu` button |

**Sounds:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `soundMaker` | `SoundMaker` |
| `menuMusic` | `Menu Music` AudioClip |
| `buttonHover` | `Button Hover` AudioClip |
| `buttonClick` | `Button Click` AudioClip |
| `startGame` | `Start Game` AudioClip |

**Player:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `player` | `Player` (root with tag "Player") |
| `inGame` | `InGame` canvas |

---

**5.7 StartSequenz:**

| Field (exact name) | Assignment |
|--------------------|-----------|
| `cutSceneBackground` | `CutSceneBackground` |
| `cutSceneText` | `CutSceneText` |
| `cutSceneAudio` | `Cutscene` AudioClip |
| `splineContainer` | `Spline` |
| `movementDuration` | `0.5` |
| `textToWrite` | Adjust the text as you need it |

---

**5.8 AimConstraint:**

1. Click on the **"+"** to add a source  
2. Select **AimPoint** GameObject as source  
3. **Source Weight**: `1`  
4. **Constraint Weight**: `1`  
5. **Is Active**: ✓

---

**5.9 Configure UI Button Events:**

The button events are automatically assigned by `MenuManager.cs` in `Start()` via code:
- `newGameBtn.onClick` → starts New Game
- `loadGameBtn.onClick` → starts Load Game (placeholder)
- `exitBtn.onClick` → quits the game
- `respawnBtn.onClick` → respawns player
- `mainMenuBtn.onClick` → returns to MainMenu

**No manual button event assignment in the Inspector is required!**

---

### 3.2 Input System Setup

The asset uses the **Unity Input System**. You must configure Input Actions:

1. Create an Input Actions asset: `Right Click → Create → Input Actions`
2. Name it "PlayerControls" or similar
3. Add the following actions:

**Movement Action Map:**
- **Move**: WASD (PC), Left Stick (Gamepad)
- **Walk**: Left Shift (PC), Left Trigger (Gamepad)
- **Aim**: Mouse drag (PC), Left Stick (Gamepad)

**Combat Action Map:**
- **Attack1**: Left Mouse Button (PC), Button South (Gamepad)
- **Attack2**: Right Mouse Button (PC), Button East (Gamepad)
- **Shield**: 1 (PC), Button West (Gamepad)
- **Item1**: 2 (PC), D‑Pad Up (Gamepad)
- **Item2**: 3 (PC), D‑Pad Right (Gamepad)
- **Item3**: 4 (PC), D‑Pad Down (Gamepad)

---

### 3.3 Animation Setup

If you use your own character:

1. **Create Animator Controller**:
   - Create a new Animator Controller
   - Add a **Blend Tree** for movement (Idle → Walk → Run)
   - Parameter: Float "Movement" (0 = Idle, 1 = Walk, 2 = Run)

2. **Add triggers**:
   - "Attack" trigger
   - "Death" trigger

3. **Transitions**:
   - Any State → Attack (condition: Attack trigger)
   - Any State → Death (condition: Death trigger)
   - Attack → Idle (Has Exit Time enabled)

4. **Bone Setup**:
   - Make sure your character has a head bone
   - Add `AimConstraint` to the head bone
   - Assign the "LookAt" GameObject as constraint source

---

## 4. Testing and pressing Play