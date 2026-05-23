# HK AssetGraph - Documentation

Welcome to **AssetGraph**! This tool lets you build complete game **Characters** and **Items** in Unity without writing a single line of code. Instead of maintaining values across countless inspector fields, you snap together small building blocks in a visual **node graph**: stats, attacks, buffs, classes, models, evolution steps. The result is a finished asset that you simply drop onto one of two runtime components - and movement, camera, combat, inventory and item usage all work out of the box.

This documentation covers every node, every runtime component and the full public API with code examples. Basic Unity and C# knowledge is assumed.

---

## Table of Contents

1. [What is AssetGraph?](#what-is-assetgraph)
2. [How the Graphs Work](#how-the-graphs-work)
3. [Installation & Requirements](#installation--requirements)
4. [5-Minute Quickstart](#5-minute-quickstart)
5. [The Graph Editor in Detail](#the-graph-editor-in-detail)
6. [Tutorial: Your First Character](#tutorial-your-first-character)
7. [The Character Nodes in Detail](#the-character-nodes-in-detail)
8. [Tutorial: Your First Item](#tutorial-your-first-item)
9. [The Item Nodes in Detail](#the-item-nodes-in-detail)
10. [Stats & Roles](#stats--roles)
11. [Combat System](#combat-system)
12. [Buffs, Debuffs, Conditions & Stacking](#buffs-debuffs-conditions--stacking)
13. [Evolution](#evolution)
14. [Setting Up a Player (AssetGraphPlayer)](#setting-up-a-player-assetgraphplayer)
15. [Setting Up an Enemy (AssetGraphNPC)](#setting-up-an-enemy-assetgraphnpc)
16. [Inventory & Items at Runtime](#inventory--items-at-runtime)
17. [Controls & Input](#controls--input)
18. [Animation](#animation)
19. [API Reference with Examples](#api-reference-with-examples)
20. [Common Recipes](#common-recipes)
21. [Troubleshooting (FAQ)](#troubleshooting-faq)
22. [Glossary](#glossary)

---

## What is AssetGraph?

AssetGraph is a **data-driven** system. That means: you define *what* a character or item is (its values, abilities, effect) as pure data - separate from the program logic that runs that data at runtime. The benefit: you can create any number of characters and items without ever touching code, and everything stays organized in one place.

There are two kinds of graphs:

- **Character Graph** - describes a character (hero, enemy, NPC). Holds stats, attacks, classes, models and evolution steps.
- **Item Graph** - describes an item (potion, weapon, armor, material) and its effect.

At runtime there are two components you attach the finished asset to:

- **AssetGraphPlayer** - turns the character into a playable hero: movement, camera, targeting, attacks, inventory.
- **AssetGraphNPC** - turns the character into an AI enemy: NavMesh movement, auto-combat, loot on death.

---

## How the Graphs Work

AssetGraph has two graph types. Both lead to an **output node** that represents the finished asset; every other node provides the building blocks for it. On save, the connections are written into the ScriptableObjects - at runtime the system only reads that finished data, the graph itself is no longer needed. Which nodes you can create depends on the graph type.

### Character Graph
Describes everything that makes up a character:

- The **Stat** node defines the properties (Health, Damage, Armor, Speed, Mana, ...). **Roles** link freely named properties to game logic.
- **Attack** nodes use those stats, carry damage/element/cooldown and can trigger buff/debuff chains through conditions.
- The **Class** node bundles the attacks into a pool.
- **Model** nodes provide prefab and animations.
- **Evolution Step** nodes are the character's tiers (own stats, own model, own attacks), chained together.
- The **Character** output connects class and evolution steps into the finished character.

### Item Graph
Describes everything that makes up an item:

- The **Item** output holds the item data (name, icon, prices, stack size, type, rarity, drop settings, cooldown).
- An attached **effect node** (Armory / Self / Splash) defines how the item works and which stat roles it changes. Effects can be chained.

> Note: the term **Role** is central - it links a freely named stat property to fixed logic (e.g. "this property is the health"). Items and effects work via roles, not via concrete stat names, and so stay character-independent.

---

## Installation & Requirements

- Unity with the **new Input System** (AssetGraph is built on it).
- For AI enemies: the **AI Navigation** package (NavMesh) so you can bake surfaces.
- AssetGraph ships as a package (`com.hkproductions.AssetGraph`). The demo scene is available via the package samples.

---

## 5-Minute Quickstart

1. **Create a graph**: right-click in the Project window -> `Create -> AssetGraph -> Character Graph`. Name the file (e.g. "Hero").
2. **Open**: double-click the file. The AssetGraph window opens with the `Character` output node already present.
3. **Add nodes**: right-click the empty canvas -> pick from the menu (e.g. Stat, Class, Attack, Model, Evolution Step).
4. **Connect**: drag from an output port to the matching input. For buff/debuff chains and item effects use the `+` buttons on the node.
5. **Save**: press save. Only then is the data in the asset up to date.
6. **Into the scene**: create an empty GameObject, add `AssetGraphPlayer`, drag your character into the "Character" field, press Play.

> **Rule of thumb**: save after *every* graph change. Otherwise you play with stale values.

---

## The Graph Editor in Detail

- **Add a node**: right-click -> search menu. Only nodes valid for *this* graph appear (character vs. item nodes). Some nodes are **singletons** (e.g. Stat, Class, the output) and can exist only once.
- **Connect via ports**: drag from an output to an input. Only matching ports connect (color-coded). A single-capacity input replaces an existing connection when you reconnect.
- **Chains & groups (parent-child)**: some building blocks hang *below* another node, stacked and joined by a `+` connector. Examples:
  - Attack -> Condition -> Buff/Debuff -> (another Condition -> Buff/Debuff ...)
  - Item -> effect node (Armory/Self/Splash) -> (effect node ...)
  - Character -> Evolution Step -> Evolution Step ...
  You create these chains **not** by dragging but via the `+` buttons on the node.
- **Collapse/expand**: via the arrow in the node header.
- **Save**: writes all connections into the ScriptableObjects and renumbers the sub-assets cleanly. On save you get hints if something is unconnected (e.g. a buff without an attack) or a humanoid model has no avatar.

---

## Tutorial: Your First Character

Let's build a simple hero with health, damage, armor and speed, one melee attack and a model.

1. **Create and open a Character Graph** (see Quickstart).
2. Add a **Stat node**. Create properties, e.g.:
   - `Vita` with role **Health**
   - `Damage` with role **Damage**
   - `Armor` with role **Armor**
   - `Speed` with role **MoveSpeed**
3. Add a **Class node**. It collects the attacks (attack pool).
4. Add an **Attack node**, e.g. "Slash": Type Melee, Damage 3, Range 2, Cooldown 1. Connect the attack's **Affected Stats** input to the Stat node's `Vita` property (so damage hits health). Connect the attack to the class's **Attack Pool**.
5. Add a **Model node**: assign a prefab, choose the rig (Generic or Humanoid), set a Spawn Offset if needed, tag the animations (Idle/Walk/Run/...).
6. Add an **Evolution Step** off the character output (`+ Add Evolution Step`). Set Total Stat Points, press **Generate Stats** (distributes the points across your properties), pick the "Slash" attack under **Ideal Attacks**. Connect the model to the step.
7. **Connect the class to the character output.**
8. **Save.**

Done - you have a playable character. Continue at [Setting Up a Player](#setting-up-a-player-assetgraphplayer).

---

## The Character Nodes in Detail

### Stat node (singleton)
The central property list. Each **property** has:
- **Name** - free (e.g. "Vita", "Stamina").
- **Type** - the data type (e.g. Float).
- **Role** - links the property to game logic. See [Stats & Roles](#stats--roles). Without a role it is just a display/helper value.

### Attack node
A single attack.
- **Name, Description, Type** (Melee/Ranged/...).
- **Damage** - the attack's base damage.
- **Range** - reach (measured horizontally).
- **Cooldown** - seconds until the next use.
- **Element** - for element matchups.
- **Icon / VFX / Attack Clip** - optional, for UI and animation.
- **Affected Stats** (input) - which stat property the damage hits (usually Health).
- **+ Add Buff / + Add Debuff** - attaches effects through a Condition node.

### Condition node
Defines **when** an attached buff/debuff fires:
- `OnApply` - immediately on apply.
- `OnExpire` - when the previous effect in the chain expires.
- `OnDamageTaken` / `OnDamageTakenAtLeast` - on (at least X) damage taken.
- `OnCriticalHit` / `OnCriticalHitAtLeast` - on a critical hit.
- `StatExact` / `StatBelow` / `StatAbove` - when a stat reaches/drops below/rises above a value.
- **Chance** (0..1) - probability the effect fires.

### Buff / Debuff node
The actual effect.
- **Buff types**: Heal (instant), HealOverTime (HoT), AffectByElement.
- **Debuff types**: Damage (instant), DamageOverTime (DoT), AffectByElement.
- **Amount** - strength. For DoT/HoT this is the value **per second**.
- **Duration** - seconds (0 = instant only).
- **Target Stat** - which stat is affected.
- **Stacking** - see [its own section](#buffs-debuffs-conditions--stacking).
- **+ Chain Buff/Debuff** - follow-up effects (e.g. a DoT, then a HoT via OnExpire).

### Class node (singleton)
Bundles the **attack pool** evolution steps choose from. Connected to the character output.

### Model node
- **Prefab** - the 3D model.
- **Rig** - Generic or Humanoid. Humanoid needs a valid avatar.
- **Spawn Offset** - local offset if the model origin is not at the feet (often: raise Y a little).
- **Animations** - list of clip + role (Idle/Walk/Run/Jump/Death). The role tells the system when the clip plays.

### Evolution Step node
A character tier.
- **Total Stat Points** + **Generate Stats** - distributes points across this tier's stat properties.
- **Generated Stats** - the result (the concrete values).
- **Model** (input) - this tier's model.
- **Ideal Attacks** - fixed attacks from the class pool.
- **Rarity Attacks** + **Rarity Pick Count** - optional random attacks.
- **+ Add Next Evolution Step** - attach the next tier.

### Character Output node (singleton)
The finished asset.
- **Name, Description, Element.**
- **Class** (input) and the **evolution step chain**.

---

## Tutorial: Your First Item

Let's build a simple healing potion.

1. **Create an Item Graph** (`Create -> AssetGraph -> Item Graph`) and open it. The `Item` output node is already there.
2. Fill in the item node: Name "Health Potion", Type **Consumable**, Stack Size e.g. 20, optionally an Icon and Prefab (the prefab shows when dropped/thrown - without one the system uses a small placeholder sphere).
3. **Attach an effect**: click **`+ Self`** on the item node. An "Item Self" node appears below.
4. In the Self node add an entry under **Effects**: Role **Health**, Amount **20**, Duration **0** (instant). For a HoT use Amount **5**, Duration **4** instead (5 per second for 4 seconds).
5. **Save.**

At runtime the player can pick up the potion, place it on a quickslot and use it (see [Inventory & Items at Runtime](#inventory--items-at-runtime)).

**Weapon example (Armory)**: pick `+ Armory`, Equip Slot **Weapon**, Effects e.g. Role **Damage**, Amount **+5**. While equipped, damage increases by 5.

**Damage potion example (Splash)**: pick `+ Splash`, Splash Radius e.g. 3, Effects Role **Health**, Amount **-15**. When thrown it hits the target and everyone in range.

---

## The Item Nodes in Detail

### Item node (output)
- **Id, Name, Description.**
- **Prefab** - world representation when dropped/thrown.
- **Icon** - for your inventory UI.
- **Buy Price / Sell Price** - for trading.
- **Stack Size** - how many fit in one slot.
- **Type** - Consumable, Equipment, QuestItem, Material, Misc.
- **Rarity** - Common, Uncommon, Rare, Epic, Legendary.
- **Dropable / Drop Chance / Min Drop Count / Max Drop Count** - control whether and how much drops on NPC death.
- **Cooldown** - seconds between two uses (consumables).

### Item effect nodes
The node type sets the **mode**:
- **Item Armory** - equippable. Has an **Equip Slot**. Effects raise the stat **maximum** while equipped.
- **Item Self** - affects the user.
- **Item Splash** - thrown at a target. Has a **Splash Radius** (0 = target only, >0 = target + everyone in range).

Each effect node has an **Effects** list with columns:
- **Role** - affected stat role (Health/Damage/...). This keeps the item independent of concrete stat names.
- **Amount** - signed (+ raises, - lowers). With Duration > 0: per second.
- **Duration** - 0 instant, >0 over time (Self/Splash; ignored for Armory).

**Chains** (same type only) via **`+ Chain`**. Each chain link has a **Chain Start**:
- **WithPrevious** - starts together with the previous one.
- **AfterPrevious** - starts only after the previous one expires.

This lets you build, for example, a potion that heals and briefly raises armor at the same time, or that heals first and then lowers speed for a while.

---

## Stats & Roles

Stats are freely named but get their meaning from **roles**:

| Role | Meaning |
|------|---------|
| Health | Hit points. The instance dies at <= 0. |
| Damage | Added to the attack's base damage. |
| Armor | Mitigates incoming damage. |
| MoveSpeed | General movement speed. |
| WalkSpeed | Walk speed. |
| RunSpeed | Run speed (while holding the run key). |
| Mana | A free resource. |

**Maximum and current value** - important to understand:
- **Health and Mana are resources**: the current value is clamped to `[0, Maximum]`. Healing therefore cannot exceed the maximum (no "overhealing"). The maximum is the generated base value.
- **Equipped items (Armory)** raise the maximum - so better armor/weapons actually matter.
- **Attributes (Damage/Armor/Speed)** are not capped: a buff or item may raise them above the base.

---

## Combat System

When an attack hits, damage is computed like this:

```
baseDamage = Attack.Damage + attacker's Damage-role stat
baseDamage *= 1 + attacker's element modifier
finalDamage = max(0, baseDamage * element matchup * crit - target's Armor)
```

- **Additive**: the stat damage is *added*, not multiplied. An attack with Damage 3 and an attacker with a Damage stat of 15 gives a base of 18.
- **Crit**: global via `CritChance` (0..1) and `CritMultiplier` (set on the AssetGraphPlayer). On a crit the multiplier applies.
- **Element matchup**: the relationship between the attack's element and the target's element (e.g. fire vs. ice).
- **Armor**: subtracted at the end.
- **Range**: measured **horizontally** (XZ plane) so height differences or uneven ground don't swallow hits.

---

## Buffs, Debuffs, Conditions & Stacking

**Conditions** are the triggers. **Buffs/Debuffs** are the effects. You chain them together: `Attack -> Condition -> Buff/Debuff`.

**Stacking** defines what happens when the same effect lands on the same target again:
- **Stackable = false**: re-applying is ignored while an instance is running.
- **Stackable = true, Stack Amount = true**: multiple independent stacks up to **Max Stack Size** (0 = unlimited). Each stack ticks on its own.
- **Stackable = true, Stack Amount = false**: a single stack; on re-cast the duration is refreshed and the amount is multiplied by **Stack Multiply**.

**Chains via OnExpire**: a buff/debuff with condition `OnExpire` fires when the *parent* effect has expired. Classic example: a DoT runs for 3 seconds, then a HoT automatically starts over 5 seconds.

---

## Evolution

A character can have multiple tiers. Each tier has its own stats, model and attacks.

- On spawn you choose the starting tier via **EvolutionStep** (index).
- At runtime you switch tiers with `EvolveTo(index)` - stats and model are rebuilt completely.

This lets you build, for example, a monster that transforms into a stronger form after a while.

---

## Setting Up a Player (AssetGraphPlayer)

Create an empty GameObject and add `AssetGraphPlayer`. The key sections:

- **Character / Pool**: your character. With spawn mode "RandomFromPool" you drag several characters into the pool.
- **Spawn**: *Mode* (ThisTransform = at this position; FixedPosition; RandomRadius; RandomFromPool), *Radius*, *Count*, *EvolutionStep*. Spawn always happens on start and as a child of this object.
- **Combat**: *CritChance*, *CritMultiplier* (apply globally to the combat system).
- **Team & Auto-Combat**: *Team* (same teams don't attack each other), *PlayerControlled*, *AutoCombat*, *On Death* (Stay/Despawn/Respawn) + *Death Delay*.
- **Targeting & Attacks**: *Targeting Mode* (Button = manual only, Auto = automatically the weakest target, Both = automatic with manual override), *Targeting Range*, *Attack 1* / *Attack 2*, *Item Use Slots* (1-4 for Self/Splash items).
- **Input - Keyboard/Mouse** and **Input - Controller**: all keys rebindable.
- **Inventory**: *Inventory Size* (slots), *Pickup Radius*, *Auto Pickup*, *Starting Currency*.
- **Events**: OnSpawned, OnDeath, OnDamageTaken, OnEvolved, OnItemPickedUp - hook up your own reactions.
- **Debug (Play Mode)**: shows live stats, active buffs, inventory, quickslots and equipped items. Even without your own UI you can place items in slots, use them, equip them and spawn an enemy here.

---

## Setting Up an Enemy (AssetGraphNPC)

Create an empty GameObject, add `AssetGraphNPC` and assign the character. **Important**: the NPC only moves if the scene has a baked **NavMesh**.

- **Character / Evolution Step**: the character.
- **Team & Combat**: *Team*, *Targeting Range*.
- **Movement (NavMesh)**: *Agent Type* (from the Navigation settings, incl. "Open Agent Settings..."), *Patrol Radius* (roaming area around the spawn), *Detection Range* (when chasing starts), *Attack Stop Distance* (stop distance, should roughly equal the attack range), *Move Speed* (0 = derive from stats), *Flee When Low* + *Flee Health Percent* (flee at low health).
- **Death**: *On Death* + *Death Delay*.
- **Drops**: a plain list of possible items. Whether and how much drops comes from the item itself (Dropable, Drop Chance, Min/Max Drop Count). Drops appear in the world with a small animation.
- **Events**: OnSpawned, OnDeath, OnDamageTaken, OnItemDropped.

The AI uses a simple state machine: **Patrol** (wander), **Chase** (pursue the target up to attack range), **Flee** (run at low health). Attacking itself is handled by the built-in AutoCombatant - it automatically uses the character's available attacks on cooldown.

---

## Inventory & Items at Runtime

The inventory is **purely logical** - it ships **no** ready-made UI. You build your own inventory UI and read the data through the API. Reach the inventory via `assetGraphPlayer.Inventory`.

**Pickup**: items lie in the world as `WorldItemPickup` objects (e.g. after an NPC death). With *Auto Pickup* on, the player collects everything within *Pickup Radius* automatically.

**Usage modes** (set by the item's effect node):
- **Armory**: equip - only via the inventory (`Equip` / `Use`). Raises stats while equipped.
- **Self**: via the inventory (instant effect) **or** via an ItemUse key (with a drop-on-head animation).
- **Splash**: **only** via an ItemUse key (thrown at the current target, optionally with an area radius). Splash is deliberately rejected from the inventory because there is no target there.

**Quickslots (keys 1-4)**: place up to 4 items on the ItemUse keys. The slot only **references** the item - it stays in the inventory, and using it consumes from the inventory. When the last copy is gone, the slot clears automatically.

**Currency & trading**: the inventory holds a `Currency`. `TryBuy`/`TrySell` settle it automatically; `AddBalance`/`RemoveBalance` change the balance directly (e.g. for quest rewards).

**Quest items** (Type = QuestItem): cannot be manually removed, dropped or sold. For a quest turn-in via script there is `RemoveForced`.

---

## Controls & Input

Built on the new Input System, fully rebindable on the AssetGraphPlayer - separately for keyboard/mouse and controller.

- **Movement**: WASD or arrow keys (keyboard), left stick (controller).
- **Look**: mouse or right stick. Sensitivity is set separately (Look Sensitivity mouse / controller).
- **Zoom**: mouse wheel (keyboard) or a stepped toggle (controller; Zoom Step adjustable).
- **Attack 1/2, Jump, Run, Targeting (Next/Prev/Toggle)**: rebindable.
- **Item Use 1-4**: keys 1-4 by default (keyboard) or free controller buttons.

---

## Animation

Animation runs through the `CharacterAnimancer` - **without** an AnimatorController. It blends automatically between Idle, Walk and Run by movement speed and has an action layer for Attack, Jump and Death. Clips come from the Model node (tagged by role) or from an attack's attack clip.

- Missing clips are skipped - so you can test entirely without animations.
- **Humanoid** models need a valid avatar. If it is missing, a safeguard aborts Play Mode with a message (Import Settings -> Rig -> Humanoid + create an avatar).

---

## API Reference with Examples

All examples below are C#. This is how you drive your own inventory UI or game logic.

**Accessing player and inventory:**
```csharp
var player = FindObjectOfType<AssetGraphPlayer>();
var inv = player.Inventory;            // the runtime inventory
var hero = player.Primary;             // the spawned CharacterInstance
```

**Reacting to changes (for UI):**
```csharp
inv.OnChanged          += RefreshInventoryUI;
inv.OnCurrencyChanged  += gold => goldLabel.text = gold.ToString();
inv.OnItemPickedUp     // (on the player) fires on pickup
```

**Showing contents:**
```csharp
foreach (var stack in inv.Slots)
    Debug.Log($"{stack.Item.Name} x{stack.Count}");

int potions = inv.CountOf(healthPotion);
bool hasKey = inv.Contains(questKey);
```

**Using items:**
```csharp
if (inv.CanUse(healthPotion))
    inv.Use(healthPotion);             // Armory -> equip, Self -> apply now

// Assign to a quickslot, then key "1" is enough
player.AssignItemSlot(0, healthPotion);
player.ItemUse.TriggerSlot(0);         // optionally trigger via script
```

**Equipping:**
```csharp
inv.Equip(sword);                      // Armory item
inv.Unequip(EquipSlot.Weapon);
Item weapon = inv.GetEquipped(EquipSlot.Weapon);
```

**Trading & currency:**
```csharp
inv.AddBalance(100);                   // add 100
inv.TryBuy(sword);                     // costs sword.BuyPrice, adds it to the inventory
inv.TrySell(oldItem);                  // removes it, credits SellPrice
```

**Dropping (with world animation):**
```csharp
inv.Drop(stone, 1);                    // quest items are rejected here
```

**Character instance (combat/state):**
```csharp
hero.UseAttack(attack, target);
hero.EvolveTo(hero.CurrentStep + 1);
float hp = hero.Health;
bool dead = hero.IsDead;
```

### AssetGraphPlayer
```csharp
// Properties
Inventory inv = player.Inventory;
CharacterInstance hero = player.Primary;              // first spawned instance
IReadOnlyList<CharacterInstance> all = player.Spawned;
PlayerItemUse itemUse = player.ItemUse;

// Quickslots (Self/Splash)
bool ok = player.AssignItemSlot(0, healthPotion);     // false if invalid / not in inventory
player.ClearItemSlot(0);
Item slot1 = player.GetItemSlot(0);
int slots = player.ItemSlotCount;                     // 4

// Spawn control (e.g. for debug)
player.SpawnAll();
player.SpawnEnemy();                                  // enemy on the opposing team
```

### AssetGraphNPC
```csharp
CharacterInstance inst = npc.Instance;                // spawned instance
AutoCombatant combat   = npc.Combat;                  // combat AI
NPCMovement movement   = npc.Movement;                // FSM
NPCMovement.State state = movement.Current;           // Patrol / Chase / Flee

combat.CombatEnabled = false;                         // temporarily stop attacking
combat.ForcedTarget  = someInstance;                  // override the target externally
var target = combat.CurrentTarget;
```

### Inventory (complete)
```csharp
// Stock
int added   = inv.Add(item, 3);                       // amount actually taken
int removed = inv.Remove(item, 1);                    // quest items are rejected here
inv.RemoveForced(questItem, 1);                       // without the quest lock (e.g. quest turn-in)
inv.Clear();
int n = inv.CountOf(item);
bool has = inv.Contains(item, 2);
IReadOnlyList<ItemStack> stacks = inv.Slots;
int used = inv.UsedSlots; int cap = inv.Capacity; bool full = inv.IsFull;

// Use
if (inv.CanUse(item)) inv.Use(item);                  // Armory -> equip, Self -> instant, Splash -> rejected
inv.BeginUse(item);                                   // consumes + cooldown, without applying the effect
inv.ApplyItemEffects(item, recipient);                // apply the effect separately (for animation/splash)

// Equip
inv.Equip(armoryItem);
inv.Unequip(EquipSlot.Weapon);
Item w = inv.GetEquipped(EquipSlot.Weapon);
IReadOnlyDictionary<EquipSlot, Item> eq = inv.Equipped;

// Drop, cooldown
inv.Drop(item, 1);
bool cd = inv.IsOnCooldown(item);
float rest = inv.GetCooldownRemaining(item);

// Currency & trading
int gold = inv.Currency;
inv.AddBalance(100);
bool paid = inv.RemoveBalance(50);                    // false if not enough
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
// State
float hp = hero.Health; bool dead = hero.IsDead; int step = hero.CurrentStep;
var attacks = hero.AvailableAttacks;
var effects = hero.ActiveEffects;                     // active buffs/debuffs

// Combat
hero.UseAttack(attack, target);
bool onCd = hero.IsOnCooldown(attack);
hero.TakeDamage(amount, source, attack.AffectedStats, isCrit);
hero.ApplyEffect(buffOrDebuff, source);

// Stats by role
hero.ModifyRole(StatRole.Health, +10);                // clamped to [0, Max] (Self/Splash logic)
hero.ModifyRoleMax(StatRole.Health, +20);             // raises the maximum (equip logic)
hero.ApplyRoleOverTime(StatRole.Health, 5, 4);        // 5 per second over 4 seconds
// Stats by name
float dmg = hero.GetStat("Damage");
hero.ModifyStat("Damage", +2);

// Evolution / revive
hero.EvolveTo(1);
hero.Revive();
```

### RuntimeStats (via `hero.Stats`)
```csharp
var stats = hero.Stats;
float byRole = stats.GetByRole(StatRole.Health);
bool hasRole = stats.HasRole(StatRole.Mana);
float raw    = stats.Get("Vita");
stats.Modify("Vita", -5);                             // unclamped
stats.AddClamped("Vita", +10);                        // clamped to [0, Max] (Health/Mana)
float max    = stats.GetMax("Vita");
foreach (var kv in stats.Values) Debug.Log($"{kv.Key} = {kv.Value}");
stats.OnChanged += (name, oldV, newV) => { /* refresh UI */ };
```

### CharacterSpawner (static, without a component)
```csharp
var inst  = CharacterSpawner.Spawn(character, position, step: 0);
var inst2 = CharacterSpawner.SpawnRandom(pool, center, radius);
CharacterSpawner.MakeTargetable(inst, team: 1);       // makes the instance targetable
// 2D variants: Spawn2D, SpawnAtWorldPoint2D, SpawnRandom2D
```

### Targetable (targeting)
```csharp
foreach (var t in Targetable.All)
    if (t.IsAlive && t.Team != myTeam)
        Debug.Log($"{t.Character.name} has {t.Health} health");
```

> Editor/graph APIs (node views, serializer) are internal building blocks and not intended for game runtime.

---

## Common Recipes

**Healing potion**: Item (Consumable) -> `+ Self` -> Health, Amount +20, Duration 0.

**Regeneration potion (HoT)**: Item -> `+ Self` -> Health, Amount +5, Duration 4 (= 20 over 4 seconds, capped at the maximum).

**Throwable poison (Splash, area)**: Item -> `+ Splash`, Splash Radius 3 -> Health, Amount -8, Duration 5.

**Sword (Armory)**: Item (Equipment) -> `+ Armory`, Equip Slot Weapon -> Damage, Amount +5.

**Armor with more health (Armory)**: Item -> `+ Armory`, Equip Slot Chest -> Health, Amount +30 (raises max health).

**Burning attack (DoT)**: Attack -> `+ Add Debuff` -> Condition OnApply -> Debuff DamageOverTime, Amount 4, Duration 3 (target Health).

**DoT, then heal (chain)**: as above, then on the debuff `+ Chain Buff` -> Condition OnExpire -> Buff HealOverTime (heals once the DoT is done).

**Transform after X seconds**: build two evolution steps; call `hero.EvolveTo(1)` from script after a timer.

---

## Troubleshooting (FAQ)

- **No damage / no stats visible.** Press "Generate Stats" in the evolution step and connect the attack's **Affected Stats** to the right property, then **save the graph**. The player's Play Mode debug shows whether stats exist.
- **The NPC doesn't move.** A baked NavMesh is missing. Without one the AI does nothing (no error).
- **The model is half in the ground.** Raise the **Spawn Offset** (Y) in the Model node - the model origin is probably at the center instead of the feet.
- **Attacks don't land.** Check the attack's **Range**. It is measured horizontally and must match the actual distance.
- **An item can't be used.** Self/Splash need an effect node; Splash needs a target; the item must be in the inventory and not on cooldown. Armory is used only via the inventory (Equip), not via the ItemUse keys.
- **Healing won't go past X.** Correct - Health is capped at the maximum. More maximum comes from Armory items.
- **Play Mode aborts immediately (avatar message).** A humanoid model has no valid avatar. Set the rig to Humanoid in the Import Settings and create an avatar.

---

## Glossary

- **Asset** - the finished character or item (a graph file).
- **Node** - a building block in the graph.
- **Port / Edge** - connection point / connection line.
- **Role** - tag that links a stat to game logic.
- **Singleton node** - can exist only once per graph.
- **Output node** - the endpoint of a graph (Character/Item).
- **CharacterInstance** - the runtime-spawned instance of a character.
- **AutoCombatant** - the built-in combat AI (picks a target, fires attacks).
- **NavMesh** - walkable surface for AI movement.
- **HoT / DoT** - Heal/Damage over Time (effect per second over a duration).
- **Quickslot** - one of the 4 ItemUse-key assignments.
