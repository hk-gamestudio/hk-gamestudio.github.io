# Asset Creator Documentation

The Asset Creator is a custom editor tool for Unity, designed to centralize and simplify the process of creating and managing game assets such as Stats, Buffs, Attacks, Classes, Characters, and Items.

> **ATTENTION**
> This asset does not provide any game logic. It only serves as a tool for creating and managing scriptable objects.
>
> Some Tabs has been fundamentally overhauled and now offers a System-based Workflow.

## Opening the Asset Creator

To start the tool, navigate to `Tools/HK-Productions/Asset-Creator` in the Unity editor menu. The window opens in a fixed size and cannot be docked to ensure a consistent user experience.

## User Interface

The window is divided into two main areas:
1.  **Navigation Bar**: At the top, there are six tabs (Stats, Buffs, Attacks, Class, Character, Items) to switch between the different asset types.
2.  **Content Area**: This area changes dynamically depending on which tab is selected, showing the corresponding tools and lists for the respective asset type.

Additionally, the header contains a **Language Dropdown** (`Language`) that allows switching the display language of the entire tool between the available languages.

---

## Tabs in Detail

Each tab is responsible for managing a specific `ScriptableObject` type.

### 1. Stats Tab

Here you define the basic attribute templates used in the game.

-   **Purpose**: Create and manage `Stat` assets. These serve as templates for all statistics (e.g., health points, attack power, speed).
-   **Fields**:
    -   `Id`: A unique identifier – auto-generated (read-only).
    -   `Name`: The display name of the statistic.
    -   `Description`: A short description.
-   **System Toggles**: Enable or disable predefined game systems. The associated default properties are generated automatically:
    -   `Element System` → `element` (String)
    -   `Level System` → `level` (Int), `currentXP` (Int), `maxXP` (Int)
    -   `Movement System` → `runSpeed` (Float), `walkSpeed` (Float)
    -   `Health System` → `isAlive` (Bool), `currentVita` (Float), `maxVita` (Float), `damage` (Int), `armor` (Int), `baseAttackCooldown` (Float), `specialAttack1Cooldown` (Float), `specialAttack2Cooldown` (Float)
    -   `Crit System` → `critChance` (Float), `critDamage` (Float) *(only available when Health System is active)*
    -   `Item System` → `item1Cooldown` (Float), `item2Cooldown` (Float), `item3Cooldown` (Float)
-   **Default Stats (Foldout)**: Displays the auto-generated properties based on the active systems (read-only).
-   **Additional Stats (Foldout)**: Custom properties can be added here. Each property has a `Name` and a `Type` (`String`, `Int`, `Float`, or `Bool`).

### 2. Buffs Tab

In this area, you can create positive (Buffs) and negative (Debuffs) effects.

-   **Purpose**: Create and manage `Buff` assets.
-   **Fields**:
    -   **Identity**: `Id`, `Name`, `Description`.
    -   **Classification**: `Type` – possible values: `Damage`, `DamageOverTime`, `Heal`, `HealOverTime`, `Debuff`, `Buff`.
    -   **Visuals**: `Sprite` for UI displays and `VFX` for visual effects in the game.
    -   **Stats**: `Amount` (strength of the effect), `Duration` (duration in seconds).
    -   **Targeting**:
        -   `StatSource`: Which `Stat` asset is affected by this buff?
        -   `AffectedStatProperties`: Which specific properties of the `StatSource` are modified?
    -   **Catalyst (Chain Reaction)**:
        -   `CatalystTrigger`: Another `Buff` that can trigger this buff.
        -   `CatalystConditionLogic`: Determines whether `All` or `Any` of the conditions below must be met.
        -   `CatalystChance`: The percentage probability that the catalyst effect will be triggered.
    -   **Conditions**: A list of conditions that must be met for the catalyst to be triggered. Supported condition types: `OnBuffExpire`, `OnDamageTaken`, `BuffApplied`, `TargetHealth`, `IsSpecialAttackUser`, `IsCritHitter`, `SelfHealth`, `IsInvisibleAttack`, `OnMultiHit`, `OnFullHealthHeal`, `OnShieldBroken`, `IsBlockedAttackUser`, `OnKilledAsVampire`, `IsVampireKiller`, `OnLightningHitTargets`.

### 3. Attacks Tab

Here you define the attacks and abilities of the characters.

-   **Purpose**: Create and manage `Attack` assets.
-   **Fields**:
    -   **Identity**: `Id`, `Name`, `Description`, `Cooldown`.
    -   **Classification**: `Type` – possible values: `Melee`, `Projectile`, `Self`.
    -   **Visuals**: `Sprite` and `VFX`.
    -   **Stats**: `Damage`, `Range`, and `Element` (element type of the attack, see [Element System](#element-system)).
    -   **Catalyst**: A list of `AttackCondition`. Each condition links a `Buff` with a percentage `Chance` to be applied on a successful attack.

### 4. Class Tab

In this tab, the character classes are created and configured.

-   **Purpose**: Create and manage `Classes` assets.
-   **Fields**:
    -   `Id`, `Name`, `Description`.
    -   `StatSource`: The `Stat` asset that defines the base statistics for this class.
    -   `Balance`: A list of `Stat` values for fine-tuning the class balance.
    -   `Attacks`: A list of `Attack` assets available to this class.

### 5. Character Tab

Here the playable characters or NPCs (Non-Player Characters) are created.

-   **Purpose**: Create and manage `Character` assets.
-   **Fields**:
    -   `Id`, `Name`, `Description`.
    -   `ClassSource`: The `Classes` asset assigned to this character.
    -   `Element`: The element type of the character (see [Element System](#element-system)).
    -   `evolutionSteps`: Number of evolution steps.
    -   `modelPrefab`: A list of `GameObjects` for the visual models of the individual evolution steps.
    -   `evolutionPoints`: Max points for the distribution of `EvolutionStats`.
    -   `EvolutionStats`: Generated `Stat` values for each evolution stage.
    -   `Attacks`: A list of attacks specifically available to this character.

### 6. Items Tab

In this tab, game items are created and managed.

-   **Purpose**: Create and manage `Item` assets.
-   **Fields**:
    -   **Identity**: `Id` (auto-generated), `Name`, `Description`.
    -   **Visuals**: `prefab` (the GameObject of the item in the world), `icon` (Sprite for UI display).
    -   **Economy**: `buyPrice` (purchase price), `sellPrice` (sell price).
    -   **Properties**:
        -   `Type` – Item type: `Consumable`, `Equipment`, `QuestItem`, `LevelUpItem`.
        -   `Seltenheit` – Rarity tier: `Common`, `Uncommon`, `Rare`, `Epic`, `Legendary`, `Mythical`.
        -   `Dropable` – Can this item be dropped by enemies?
        -   `Drop Chance` – Auto-calculated based on the rarity tier (only visible when `Dropable` is active).
        -   `Stack Size` – Maximum stack size of the item.
-   **Smart UI**:
    -   For `QuestItem`, the `Seltenheit` and `Dropable` fields are automatically hidden and disabled.
    -   The `Drop Chance` is automatically calculated randomly within the rarity range:

| Rarity | Drop Chance Range |
|---|---|
| Common | 70 % – 90 % |
| Uncommon | 50 % – 70 % |
| Rare | 30 % – 50 % |
| Epic | 15 % – 30 % |
| Legendary | 5 % – 15 % |
| Mythical | 1 % – 5 % |

---

## Element System

The element system allows assigning elements to attacks and characters, as well as automatically calculating effectiveness multipliers.

-   **Available Elements**: `Normal`, `Fire`, `Water`, `Earth`, `Air`, `Pflanze`, `Gift`, `Elektro`.
-   **Effectiveness Tiers**:
    -   `Wirkungslos` – Immune (0×)
    -   `Schwach` – Weak (0.5×)
    -   `Neutral` – Neutral (1×)
    -   `Stark` – Strong (2×)

Element interactions are managed via an internal matrix (`ElementInteraction`) and can be queried at runtime using `GetElementMultiplier(attacker, defender)`.

---

## Custom Inspector

Every created ScriptableObject receives its own clean **Custom Editor** in the Unity Inspector – structured identically to the Creator UI. Each editor displays a centered title (*"[Type] Editor by HK Productions"* with underline) and organizes fields into the same logical sections.

### Stat Inspector

-   `Id` – read-only.
-   `Name`, `Description` – editable.
-   **Systems** *(Foldout)*: All 6 system toggles (Element, Level, Movement, Health, Crit, Item). Changes update the default stats immediately and reactively.
-   **Default Stats** *(Foldout)*: Displays all auto-generated properties as Name + Type labels – read-only.
-   **Ignore Defaults (Auto-generated)** *(Foldout)*: Automatically managed list of properties that should be ignored by runtime logic.
-   **Additional Stats** *(Foldout)*: Editable list of custom properties (Name + Type dropdown + Remove button). **"Add Property"** adds new entries.
-   **Ignore Additional** *(Foldout)*: Manually managed list of additional property names to ignore. Entries can be added and removed individually.

### Buff Inspector

-   `Id` – read-only.
-   `Name`, `Description`, `Type`, `Sprite`, `VFX`, `Amount`, `Duration` – directly editable.
-   **Targeting** (StatSource + Affected Stat Properties):
    -   No `StatSource` selected → empty area.
    -   `StatSource.hasHealthSystem == false` → **Error message** (Health System disabled).
    -   `Type` ≠ `Debuff` / `Buff` → **Info message**: buff is automatically applied to `currentVita`, no manual selection needed.
    -   `Type == Debuff` or `Buff` → **Toggle buttons** for each selectable property of the StatSource (green = selected). `runSpeed` + `walkSpeed` are combined into a single **"speed" button**.
-   `CatalystTrigger`, `CatalystConditionLogic`, `CatalystChance` – directly editable.
-   **Conditions**: **"Add Condition"** / **"Clear Conditions"** buttons. Each condition shows a type dropdown + **"-" button**. If a `CatalystTrigger` is set but no condition exists → **error message**.

### Attack Inspector

-   `Id` – read-only.
-   `Name`, `Description`, `Cooldown`, `Type`, `Sprite`, `VFX`, `Damage`, `Element` – directly editable.
-   `Range` – **only shown** when `Type == Projectile`.
-   **Catalyst**: **"Add Condition"** / **"Clear Conditions"** buttons. Each condition shows a `Buff` object field + `Chance %` field (0–100) + **"X" button** to remove.

### Class Inspector

-   `Id` – read-only.
-   `Name`, `Description`, `StatSource`, `Balance`, `Attacks` – displayed by default.

### Character Inspector

-   `Id` – read-only.
-   `Name`, `Description`, `ClassSource`, `Element`, `evolutionSteps`, `Attacks` – directly editable.
-   `modelPrefab`, `evolutionPoints`, and `EvolutionStats` are **automatically synchronized to the number of `evolutionSteps`** (no manual list management needed).
-   **"Generate Stats" button**: Generates evolution values for all steps at once, based on each step's `evolutionPoints` and the class `Balance` profile:
    -   Balance stats receive 60 % of randomly distributed points, standard stats 40 %.
    -   `critChance` is capped at 100.
    -   `walkSpeed` is always kept ≤ `runSpeed`.
    -   Values from the previous evolution step are used as a base.
-   **Per evolution step** *(collapsible foldout "Evolution N")*:
    -   `Points For Evolution Step` – editable int value.
    -   `Model` – GameObject field with a **180 × 180 px preview thumbnail**.
    -   **Stats display** – read-only overview of all evolution values; `critChance` is shown with `%`.

### Item Inspector

-   `Id` – read-only.
-   `Name`, `Description`, `prefab`, `icon`, `buyPrice`, `sellPrice`, `stackSize`, `type` – directly editable.
-   If `type == QuestItem`: `seltenheit`, `dropable`, and `dropChance` are automatically reset and hidden.
-   Otherwise: `seltenheit` and `dropable` are editable. If `dropable == true`:
    -   `Drop Chance (%)` is **automatically recalculated** whenever `type`, `seltenheit`, or `dropable` changes (read-only display field).
    -   **"Re-roll" button**: Re-randomizes the drop chance within the rarity range.

---

## Step-by-Step Guide: A Typical Workflow

1.  **Create Stats**: Start in the **Stats Tab** and define all the basic attribute templates your game needs (e.g., "Health", "Mana", "Strength"). Enable the required systems.
2.  **Create Buffs**: Switch to the **Buffs Tab** to create effects like "Burn" (damage over time) or "Heal". Link them to the previously created stats.
3.  **Create Attacks**: Go to the **Attacks Tab** and create abilities. Assign damage, range, an element, and possibly buffs that can be triggered by the attack.
4.  **Create Class**: In the **Class Tab**, bring everything together. Create a class like "Mage", assign it base statistics (`StatSource`) and the previously created attacks.
5.  **Create Character**: Finally, in the **Character Tab**, create a character like "Gandalf", assign him the "Mage" class and an element, and configure his evolution steps, models, and specific values.
6.  **Create Items**: In the **Items Tab**, create items like healing potions or equipment. Set price, rarity, and drop behavior.
