# plan.md — Dark Sci-Fi Extraction Bullet Roguelike (Grid / Roguelike-Turn)

Owner: Cole  
Platforms: iOS + Windows  
Engine assumption (editable): Unity 2D (URP optional). If you choose something else later, keep the data + systems architecture the same.

---

## 0) Product Goal
Build a 2D, grid-based, turn-based roguelike that blends:
- **Manual primary weapon** targeting/aiming (tactical roguelike feel)
- **Passive auto-firing secondary weapons** each turn (bullet heaven feel)
- **Extraction gameplay loop** (risk/reward, loot pressure, exfil as an event)
- **Tarkov-like stash + home base building** with collectible materials and meaningful inventory management
- Strictly **PvE**
- **Planned community mod support** (phased: balance/content first, custom assets later)

---

## 1) Locked Design Decisions (current)

### 1.1 Turn model
Roguelike turns (time advances on player action). Per-turn order:
1) Player action (move / primary attack / ability / item / interact / wait)  
2) Passive weapon auto-fire step  
3) Enemy step  
4) World tick (vents / hazards / status)

### 1.2 Equipment slots
- Primary Weapon (manual)
- Passive Weapon I (auto)
- Passive Weapon II (auto; unlockable per-class via base upgrade)
- Armor (1)
- Accessories (2)
- Belt (1; dedicated slot — see 1.18)
- Class-Unique Equipment (1)

### 1.3 Controls
- iOS: one-hand friendly (virtual d-pad or swipe-to-step; quick action buttons)
- PC: numpad movement (1–9), wait on 5; attack/aim bindings

### 1.4 Run structure
Extraction PvE sessions (10–20 min target). Extraction is an **event** (countdown + escalating pressure).

### 1.5 Meta progression
Home base upgrade web + base modules built with materials. Base upgrades increase player power.

**Station Depth** and **Threat Level** are separate systems:
- **Station Depth** — persistent per-class progression value (see 1.27); player selects run Depth up to their unlocked max
- **Threat Level** — per-run escalation state driven by turn count (T80/T140/T200; see 1.7)

### 1.6 Death-loss difficulty option (player-selectable)
Players choose **Death-Loss Difficulty** at the beginning of their initial run and can change it between runs.

Four modes (ordered hardest → easiest):

- **Hardcore** — Permadeath
  - Death = run ended AND class Station Depth progress is permanently reset to 0
  - Loss on death: everything (no stash protection)
  - Drop rate modifier: **+ larger boost**
  - Station Depth setback on death: full reset to 0
- **Hard**
  - Loss on death: keep only Secure Pouch
  - Drop rate modifier: **+ small boost**
  - Station Depth setback on death: reset to 0 extractions at current Depth level
- **Medium (default)**
  - Loss on death: keep Secure Pouch + **1 chosen carried gear item**
  - Drop rate modifier: **0**
  - Station Depth setback on death: lose half of current Depth-level extraction progress
- **Soft**
  - Loss on death: keep all equipped gear; lose backpack loot (except Secure Pouch)
  - **Recovery Drone** base upgrade recovers a % of backpack items per-item (starts at 0%; upgradeable in tiers via `BASE_Node_RecoveryDrone_<Class>` nodes)
  - Drop rate modifier: **- slight penalty**
  - Station Depth setback on death: **none** (immune)

Difficulty selection must be shown clearly:
- pre-run
- in pause/options (read-only during run)
- post-run summary

### 1.7 Run timer escalation (greed pressure) — LOCKED SCHEDULE (tunable later)
Run timer is measured in **turns elapsed**. Escalation thresholds:
- **T80**: Alert Level 1
- **T140**: Alert Level 2
- **T200**: Alert Level 3 (panic tier)

Alert effects are data-driven and applied via world tick.

### 1.8 Every run has an explicit Goal Package (mission framing)
Every run generates with a **Goal Package** that defines:
- Primary objective(s) required to enable extraction and/or win conditions
- Optional secondary objectives that increase payout multipliers
- Reward bias (materials/currency/gear)
- Threat/time-pressure bias

### 1.9 Mod support strategy (LOCKED): "Compiled defs + JSON overlay"
- **Phase 1 (1.0)**: ScriptableObjects are the authoritative "compiled" game content; registries + DTOs exist.
- **Phase 2 (post-1.0)**: JSON mods can **override/extend** defs by stable ID (PC-first).
- **Phase 3 (later)**: optional support for custom art/audio via Addressables/AssetBundles.

### 1.10 Map model (LOCKED)
- **Single large zone with subareas** (connected wings/sections; no floor transitions).
- The zone layout is **procedurally generated per run** from a **seed** (deterministic).
- Each subarea is assigned a **Biome** (data-driven) and may reference an **Environment Profile** to enable future mechanics (oxygen/vacuum/radiation/etc.).
- Performance rule:
  - Only **active subarea(s)** near the player simulate **AI turns, spawn vents, and hazards**.
  - Outside active subarea(s), entities are "sleeping" (stored state, no turns).
  - Exception: enemies that are **Alerted** (aware of the player) may continue to act/pursue across subareas (until impeded, de-alerted, or killed).
- Procgen begins in M4.3; earlier milestones may use a fixed test map.

### 1.11 Procedural generation + biomes (LOCKED)
- Each run generates a **large procedural map** composed of connected **subareas**.
- Generation must be **seeded and deterministic**:
  - Run save stores `run_seed` and `mapgen_profile_id` (a `MapGenProfileDef` ID) so runs can be reproduced and migrated safely.
- Subareas are assigned a `biome_id`.
  - Biomes provide hooks for **spawn profiles**, **hazards**, **loot bias**, and **objective bias**.
- Biomes may attach an `environment_profile_id`:
  - Enables future "raid conditions" (oxygen supply on surfaces, vacuum corridors, toxic atmospheres, derelicts, infestation, etc.).

### 1.12 Fog of war (LOCKED)
- Fog of war is **on** by default.
- Explored tiles **stay revealed** for the run.
- Enemy positions are **not** retained — you know the map, not where enemies are.
- Intel base upgrades can reveal: loot cache locations, boss/objective room locations, vent locations.
- Intel also unlocks **additional scenario options** on the pre-run draft screen (see 1.13).

### 1.13 Pre-run scenario selection (LOCKED)
- Before each run, the player is presented a **draft of 2–3 randomly generated run previews**.
- Each preview shows: Goal Package type, Biome/zone identity, Reward bias (mats vs gear), Threat level modifier.
- **Intel base upgrades** unlock additional draft options (larger pool to pick from).
- Draft pool size is a tunable data field (not hardcoded).

### 1.14 Passive Slot II unlock (LOCKED)
- Every class starts with 1 passive weapon slot.
- Passive Slot II is unlocked **per-class** via a dedicated home base upgrade node.
  - Node IDs follow pattern: `BASE_Node_PassiveSlotII_<ClassName>`
  - Requires a minimum Station Depth gate (not trivially available on run 2).
- Once unlocked, Passive Slot II is permanently available for all future runs of that class.
- `ClassDef` carries a `passive_slots` field (default: 1) and `passive_slot_ii_node_id`.

### 1.15 Spec system (LOCKED)
Every class has a **slot-keyed spec system** that defines mid-run build identity.

**Branches (per class):**
- 4 branches, one per slot: Class Ability / Primary Weapon / Passive I / Passive II (post-unlock)
- Each branch has 2–3 thematic variants; some variants require base upgrades to unlock
- Branch spec IDs follow pattern: `SPEC_<ClassName>_<SlotTarget>_<BranchName>_<N>`

**Per-run spec flow:**
1. Early run: 2 **generic specs** drop (class-filtered but slot-keyed; drawn from broader class pool)
2. Mid-run: player makes an **explicit branch commitment** (pick from available branches; some gated by base upgrades)
3. Primary branch: 2 additional specs + **1 capstone** (build-defining rule change that may cross slot boundaries)
4. Secondary branch: up to 2 specs available; **capstone locked out**
5. Total per full run: ~8 specs

**Spec presentation:** offered as a draft of 2–3 choices at key moments (loot drop events).

**What specs modify:** active ability, class-unique equipment behavior, or both (defined per spec).

**Capstone examples:** "Your passive weapon now re-targets to your primary weapon's last target tile"; "Bulwark Node detonates on destruction, dealing damage equal to absorbed shield value."

**New defs required:** `SpecDef`, `SpecBranchDef` (see section 5.7).

### 1.16 Class identity model (LOCKED)
- Class is selected at base before the run (committed for the run).
- Subclass identity emerges **mid-run** through class-unique gear drops + spec choices.
- Class-unique gear modifies the base active ability — equipping a piece defines your build direction for that run.
- Three strategic axes all classes engage with differently: **swarm management**, **deployment/setup**, **positioning/board control**.
- Classes are pre-run picks; spec branches deepen the chosen direction mid-run.

### 1.17 Enemy alert system (LOCKED)
**Alert triggers** are data-driven per enemy type via `AlertProfileDef`:
- Line-of-sight (LoS) — default trigger for most enemies
- Ally killed nearby — proximity-based awareness
- Player interacts with an object (terminal, vent seal, etc.)
- Proximity threshold (N tiles, no LoS required)
- Trigger set and thresholds are defined per enemy; equipment affixes can reduce proximity thresholds

**States:**
- **Idle**: default; follows patrol/wander behavior
- **Alerted**: pursues player; active across subareas; never de-alerts
- **Searching**: sub-behavior when player is lost; moves toward last known position

**De-alert rule:** enemies **never de-alert** once triggered (except via class abilities like Nullrunner threat-drop).

`EnemyDef` requires `alert_profile_id`. New def: `AlertProfileDef` (see section 5.1).

### 1.18 Belt slot (LOCKED)
Belt is a **dedicated equipment slot** (not replacing accessories).

- Drops as loot; follows normal rarity tiers (Common → Relic)
- **Tier derived from rarity:** Common/Uncommon=T1, Rare=T2, Epic=T3, Relic=T3+
- **Per tier:** unlocks 1 additional **type-agnostic utility slot** (T1=1, T2=2, T3=3)
- **Currency retention on death:** scales with tier (exact % tunable in `BeltTierDef`; starting values: T1=0%, T2=25%, T3=50%, T3+=75%)
- **Never degrades** on death
- **Mod socket type:** utility/economic affixes only — Belt uses the Chip crafting system but compat tags restrict it to utility and economic affixes only (no offensive or defensive chips)

**Utility slot categories** (type-agnostic; player chooses what to fill each slot with):
- Grenades — throwable AoE (damage/stun/smoke)
- Consumables — single-use actives (medkit, stimpack, shield charge)
- Tools — utility items (grapple hook, scanner pulse, door override)
- Traps — placeables (mine, tripwire, decoy beacon)
- Ammo types — swap between ammo variants for primary weapon

**Utility item rules:**
- Consumed on use; restocked at base, vendors, or found as loot drops during runs
- Multiple acquisition methods: loot drops, crafted at base modules, purchased from vendors

New defs: `BeltDef`, `BeltTierDef`, `UtilityItemDef` (see section 5.8).

### 1.19 Gear durability (LOCKED)
- **Weapons and armor** degrade; accessories and Belt **do not**.
- Degradation occurs **on death only** (not mid-run).
- Stage count is **variable by rarity** (exact mapping TBD via playtesting; suggested start: Common=1, Relic=3).
- **Broken** = gear is non-functional until repaired.
- **Repair locations:**
  - Base (Gunsmith module): materials only
  - Mid-run vendor (field repair): currency + materials (premium cost)
- **Scrapping:** gear can be scrapped instead of repaired
  - At vendors mid-run or always at base
  - Yields **type-specific parts** (weapon scraps / armor scraps)
  - Condition affects yield: Broken = fewer parts than Fine
- `GearDef` needs: `durability_stage` (int), `max_durability_stages` (int, rarity-derived), `scrap_yield_profile_id`

New def: `ScrapYieldDef` (see section 5.10).

### 1.20 Status effects (LOCKED)
All 6 status effects are **bidirectional** (apply to both enemies and the player).

| Effect | Stack rule | Core behavior |
|--------|-----------|---------------|
| Poison | Stack | DoT; intensity scales with stacks |
| Burn   | Refresh + spread | DoT; spreads to adjacent tiles/entities on application |
| Shock  | Refresh | Reduces enemy action (skip turn or speed penalty) |
| Freeze | Refresh | Full immobilize for N turns; shatters for bonus damage |
| EMP    | Refresh | Disables mechanical enemies / destroys shields |
| Bleed  | Stack | DoT that scales with movement (more damage if entity moves) |

**Application:** guaranteed on weapon type; proc-chance on mods (defined per `StatusEffectDef`).
**Player resistances:** on `ArmorDef` and `ItemDef` via `status_resistances[]`.
**Environment application:** `EnvironmentProfileDef` can passively apply statuses per turn (biome hazard hooks).

New def: `StatusEffectDef` (see section 5.6).

### 1.21 Exfil system (LOCKED)
- All exfil points are **hidden** until revealed by proximity or Intel upgrades.
- **5 exfil types** in v1:
  - **Quiet** — no countdown, no alarm; Intel-gated or rare
  - **Hot** — standard countdown (default 12 turns) with escalating pressure
  - **Conditional** — only opens after a specific trigger (boss dead, uplink complete, bribe paid)
  - **Emergency** — always available; significant cost (exact cost TBD; see Open Decisions)
  - **Timed** — open for a window of turns, then closes permanently
- **Exfil type dynamics:**
  - Types can shift based on **alert level** (e.g. Quiet becomes Hot at T80) — independent of player actions
  - Types can be **player-influenced** (e.g. bribing a terminal converts Hot → Quiet) — independent of alert-level shifting
  - Both mechanisms can exist in the same run but are not required simultaneously
- Goal packages and biomes bias which exfil types appear.

New def: `ExfilDef` (see section 5.11).

### 1.22 Biomes v1 (LOCKED)
Five biomes for v1, each with distinct spawn profiles, hazards, and environmental flavor:

| ID | Name | Unique hazards | Environment | Enemy bias |
|----|------|---------------|-------------|-----------|
| `BIOME_ResearchLab` | Research Lab | Chemical spills, toxic gas vents | Breathable/thin | Disruptor, Spitter |
| `BIOME_ServerCore` | Server Core | EMP pulses, overload tiles | Breathable | Swarmer heavy |
| `BIOME_BioContainment` | Bio-Containment | Toxic atmosphere, organic growth tiles | Toxic | Infestation spawns, Leaper |
| `BIOME_ArmoryFoundry` | Armory/Foundry | Fire tiles, explosion hazards | Breathable | Anchor, Buffer, military enemies |
| `BIOME_ReactorLevel` | Reactor Level | Radiation, heat tiles; escalation amplified | Thin/toxic | High-elite density |

- Hazard exclusivity: some hazards are biome-exclusive; universal hazards are biome-tuned in intensity.
- Each biome has a `BiomeDef` with `environment_profile_id`, `spawn_profile_id`, and hazard tags.

### 1.23 Subarea scale and connectivity (LOCKED)
- **Subarea count** scales with Station Depth (early runs smaller, later runs larger); exact ranges stored as tuning values in `MapGenProfileDef`.
- **Layout topology** is **goal-driven** — the goal package shapes the map (boss rooms terminal, uplinks distributed, vault rooms mid-map, etc.).
- **Subarea size** variable per biome, defined as min/max bounds in `MapGenProfileDef`.
- **Connector types** (all in v1):
  - Open doorway — no interaction needed
  - Locked door — requires key item or terminal hack
  - Airlock — variable traversal turns (1+); optional spawn trigger fires when player commits to crossing (dramatic tension mechanic)
  - Collapsed passage — one-way only, no backtracking
  - Vent shaft — alternate route; small entities only or requires tool

New def: `ConnectorDef` (see section 5.4).

### 1.24 Currency model (LOCKED)
- **Currency follows death-loss rules** — amount retained on death is determined by Belt tier's `currency_retention_pct`.
- Currency retained via Belt applies on top of the death-loss difficulty rules.
- **Currency sinks (v1):** repairs at mid-run vendor, weapon mod rerolls, exfil bribes, Intel scans mid-run, vendor gear/item purchases, crafting catalysts, Emergency exfil cost, base module upgrade components, Chip replacement material fee.

### 1.25 Player stats (LOCKED)

**Damage calculation model:** Flat + percentage layers
1. Base weapon damage
2. + flat damage bonus (from gear/base nodes)
3. × damage% multiplier (from gear/base nodes)
4. × crit multiplier if crit (100% base + `crit_damage` stat)

**Runtime:** Stats are **cached on equip/unequip** and recalculated only on gear change or base node purchase. No per-turn recalculation.

**Defensive stats:**

| Stat | Mechanic |
|------|----------|
| Max HP | Total hit points |
| Armor | Diminishing returns: `armor / (armor + K)` = % reduction; K is tunable in `CombatConstantsDef` |
| Evasion | % chance to avoid a hit entirely |
| Shield | Separate absorb pool; slow passive regen per turn |
| Status Resistance | % reduction to status proc chance and/or duration |
| Move Speed | Bonus tiles per turn |

**Offensive stats:**

| Stat | Mechanic |
|------|----------|
| Damage (flat) | Added before % multipliers |
| Damage% | Multiplier applied after flat bonuses |
| Crit Chance | % to deal a critical hit |
| Crit Damage | Bonus multiplier on crits (e.g. +50% = 150% total) |
| Range | Bonus tiles added to weapon range |
| CDR | % reduction to cooldown_turns; tracked fractionally per weapon; fires when accumulated value reaches a whole number |
| Status Potency | Multiplier on DoT damage and status duration |
| AoE Size | Bonus radius/width on blast/cone effects |

**Utility stats:**

| Stat | Mechanic |
|------|----------|
| HP Regen | Small HP recovery per turn or per room (tunable) |
| Vendor Prices | Buy cheaper / sell higher (% modifier) |

**Explicitly excluded:** Loot find, currency find, utility item charges (charges are per-item), carry weight (pack is an expanding grid, not a weight limit).

**Class base stat matrix:**

| Stat | Warden | Revenant | Technoseer | Nullrunner |
|------|--------|----------|------------|------------|
| Max HP | High | Medium | Low | Low |
| Armor base | High | Low | Low | Low |
| Evasion base | None | Low | None | High |
| Shield base | Medium | None | Medium | None |
| Move speed | Slow | Medium | Medium | Fast |
| Crit chance base | None | Medium | None | Medium |

Class base stats create distinct defensive/offensive identities; gear and specs can shift them but classes start meaningfully different.

New def: `CombatConstantsDef` — tunable formula constants (armor K value, crit base multiplier, CDR cap, etc.).  
New def: `PlayerStatsDef` — per-class base stat values (see section 5.12).

### 1.26 Affix and Chip crafting system (LOCKED)

**Affix assignment — hybrid slot model:**
- **Slot-locked affixes:** only roll on compatible slot types
  - Defensive affixes (HP, armor, evasion, shield, status resist, move speed) → armor-locked
  - Offensive affixes (damage, crit, range, CDR, AoE, status potency) → weapon-locked
  - Economic affixes (vendor prices, HP regen, currency retention) → belt-locked
- **Shared pool affixes:** cross-slot conditional rules (e.g. "+damage when shield is full", "kills restore HP") → can appear on any compatible slot
- **Class-synergy affixes:** class-filtered (e.g. "Bulwark Node gains +1 pulse per kill") → shared pool, class-gated

**Affix values:**
- Tiered (T1/T2/T3) with rolled values within each tier's range
- Roll strength (tier availability) scales with **Station Depth**, not rarity
- This means base progression directly inflates gear power

**Rarity = affix count (derived label):**

| Rarity | Affix count | Notes |
|--------|-------------|-------|
| Common | 0 | Blank canvas for crafting |
| Uncommon | 1 | 1 Chip applied |
| Rare | 2 | 2 Chips applied |
| Epic | 3 | 3 Chips applied |
| Relic | 3 + Legendary power | Legendary power is permanent and pre-applied on drop |

Rarity is a **derived display label** recalculated from chip count. Applying a Chip upgrades rarity automatically.

**Chip system:**
- Extracting an affix from gear is called making a **Chip**
- Scrapping gear at the Workshop (base only) destroys the item and yields **1 random Chip** (exact copy of one of the item's affixes)
- Chips also drop directly as loot in runs (containers, enemy drops)
- Chips carry: affix stat type, tier, rolled value, compat tags (which slot types they can apply to)
- Chips take **grid space** in the player's stash (same as other inventory items)
- Chips are applied at the **Workshop (base only)** — crafting is a between-runs activity
- Applying a Chip upgrades item rarity by 1 tier automatically

**Chip replacement:**
- Chips can be replaced on any gear item
- Replacing destroys the existing Chip (it is not recovered)
- Replacement costs a **material fee that scales with the item's current rarity tier** (higher rarity = more costly to modify)
- This creates commitment pressure: experimenting on Common gear is cheap; modifying an Epic is a real decision

**Relic items:**
- Drop fully pre-chipped (Legendary power + all 3 normal affix slots filled)
- Legendary powers are **permanently bound** to the Relic they dropped on — cannot be transferred
- Legendary powers are **passive only** (always-on rule or stat modification — no active triggers)
- Legendary power assignment is **hybrid**: some Relics are named/unique (hand-authored), others draw from a slot-compatible Legendary power pool
- Chip slots on Relics can still be replaced (at high material cost per the rarity-scaling rule)

New defs: `AffixDef`, `AffixTierDef`, `ChipDef`, `LegendaryPowerDef` (see section 5.13).

### 1.27 Station Depth system (LOCKED)

**What it is:** Per-class persistent progression value representing how deep into the facility the player has pushed. Hard cap: **Depth 12** per class.

**Player-selected per run:** Before each run the player selects a Depth value up to their unlocked maximum for that class. This determines enemy difficulty, loot/affix quality, and biome availability for that run. Running at lower Depth than max is allowed with no penalty — rewards match the chosen Depth.

**How it advances:**
- Requires accumulating a threshold number of successful extractions at the current Depth level
- Thresholds are **data-authored per Depth level** in `StationDepthProfileDef` (no fixed formula)
- "Successful extraction" = completing the primary objective AND extracting alive

**Death setback (by difficulty mode):**
- **Hardcore** — full Station Depth reset to 0 (permadeath)
- **Hard** — reset to 0 extractions at current Depth level
- **Medium** — lose half of current Depth-level extraction progress
- **Soft** — immune, no setback

**Biome availability:**
- Each biome lists a `depth_min` and `depth_max` in its `BiomeDef`
- Biomes only appear in runs at Depths within their range
- Authored as a data table — no hardcoded Depth-to-biome mapping

**What Station Depth scales:**
- Enemy base stats and spawn rates (harder enemies at higher Depth)
- Loot quality: affix tier availability scales with Depth (higher Depth = higher tier rolls possible)
- Base node availability: some nodes require minimum Depth before purchasable
- Subarea count and map scale (larger maps at higher Depth)

**Presentation:**
- Visible to player at all times on base screen and pre-run
- Framed narratively (e.g. "Depth 4 — Reactor Level Access Unlocked")
- Each Depth threshold has a named unlock or narrative beat authored in `StationDepthProfileDef`

New def: `StationDepthProfileDef` (see section 5.14).

### 1.28 FIR rules (LOCKED)

**Found-In-Raid (FIR)** is a tag applied to items picked up during a run.

- All items picked up in a run are FIR-tagged on pickup
- FIR tag is **lost if the player dies** before extracting (items are lost or retained per death-loss rules, but FIR status does not survive death)
- Items brought into a run from stash are **never FIR**
- On successful extraction, FIR tags are cleared — items in stash are never FIR

**What FIR gates:**
- FIR determines what is lost or retained on death (items in backpack vs. Secure Pouch)
- FIR does **not** gate vendor sell value or base upgrade crafting directly
- **Run-exclusive materials** (see below) can only be found in runs — FIR is irrelevant to this distinction

**FIR and crafting:**
- FIR is consumed when an item is destroyed (e.g. scrapping for a Chip)
- FIR does not transfer through crafting — a Chip extracted from a FIR item is not itself FIR
- Applying a Chip to gear does not grant FIR to the gear

**Run-exclusive materials:**
- A named category of materials that can **only** be found in runs (enemies, containers, objective rewards)
- Cannot be purchased from vendors or base
- Required for specific base upgrade recipes
- Flagged as `material_category: RunExclusive` in `MaterialDef`

### 1.29 Post-run flow (LOCKED)

**Successful extraction flow:**
1. **Debrief screen** — shows: objectives completed/failed, items extracted, currency/materials earned, Station Depth progress, kill count and turns elapsed
2. **Item review screen** — player sorts/organizes recovered items into stash before returning to base
3. **Base screen**

**Death flow:**
1. **Death summary screen** — shows: what was lost, what was retained (per death-loss rules), Recovery Drone results (Soft mode only), Station Depth setback
2. **Base screen**

**Reward delivery:**
- Currency and materials are added automatically to stash on extraction (shown in debrief, no manual claim)
- Gear and items require placement via the item review screen

New def: `RunSummaryDef` is not needed — post-run data is derived from run save state at resolution time.

---

## 2) Open Decisions (must finalize soon)

1. **Emergency exfil cost** — exact cost type: gear sacrifice vs. currency vs. HP tax vs. mixed
2. **Soft death recovery drone %** — starting tier values for `BASE_Node_RecoveryDrone` (e.g. T1=25%, T2=50%, T3=75%)
3. **Durability stages by rarity** — exact mapping needs playtesting; suggested start: Common=1, Uncommon=1, Rare=2, Epic=3, Relic=3
4. **Exfil abort cost** — what is spent when a player cancels an in-progress extraction (currency, item, alert spike, durability hit)
5. **Passive Slot II Station Depth gate** — minimum Station Depth required before the unlock node becomes purchasable
6. **CDR rounding** — recommended: track fractional turns internally per weapon, fire when accumulated value hits a whole number; needs confirmation before M3 implementation
7. **Chip replacement material costs** — exact material type and qty per rarity tier (scales with rarity; exact values need tuning)
8. **Armor K constant** — starting value for `CombatConstantsDef.armor_k_value` (suggested: 100; needs playtesting)

Defaults if not decided: Emergency=currency+HP mix, RecoveryDrone=25/50/75%, DurabilityStages=1/1/2/3/3, ExfilAbort=alert spike, PassiveSlotII gate=Station Depth 3.

9. **Weapon families** — groupings for parts compatibility; deferred to M5.5 weapon tree design milestone
10. **Station Depth extraction thresholds** — exact number of extractions required per Depth level per class (authored in StationDepthProfileDef; TBD via playtesting)

---

## 3) Content Targets (v1)

### 3.1 Classes (4)
All classes engage the same three strategic axes (swarm management / deployment+setup / positioning+board control) but through different tools. Each class has:
- A base active ability
- 3 class-unique gear variants that modify the active ability (found as loot; equipping defines build direction)
- 4 spec branches (Class Ability / Primary / Passive I / Passive II)
- 2–3 thematic spec branches per slot-branch

**Warden** (control/tank)
- Base active: Deploy a Bulwark Node on a target tile
- Unique gear variants modify node behavior (cover+pulse / damage+turret / taunt+aggro redirect)
- Identity: creates positioning through deployable structures

**Revenant** (kill-chain)
- Base active: Spend Blood-Engine stack for an AoE nova (damage scales with stack size)
- Blood-Engine charges on kills; decays if player stalls
- Unique gear variants modify charge rate and nova behavior
- Identity: wants to be surrounded; rewards aggression and momentum

**Technoseer** (deployables)
- Base active: Activate Command Halo (buffs/retargets drones and turrets in range)
- Unique gear variants modify halo behavior (buff radius / mark+priority / loadout management)
- Identity: sets up a deployable loadout before engaging; manages a board state

**Nullrunner** (mobility)
- Base active: Trigger Phase Rig (blink to target tile, leaving decoy)
- Unique gear variants modify blink behavior (decoy duration / threat-drop / mine-on-blink)
- Identity: exploits positioning through mobility; de-alerts enemies; sets traps

### 3.2 Weapons (12 baseline; goal 10–15)
Primary (manual):
1) Coil Pistol
2) Shard Rail (range + pierce upgrade paths)
3) Pulse Beam (Prism/splitting identity; NOT chain lightning)
4) Flak Cannon (cone)
5) Rift Blade (3-tile cleave)
6) Hex Launcher (tile AoE)

Passive (auto):
7) Arc Thrower (chain lightning)
8) Swarm Drones
9) Grav Mines
10) Sentinel Turret
11) Cryo Sprayer
12) Bio-Needler

### 3.3 Mod system
Sockets per weapon:
- Rune x2 (behavior)
- Gem x2 (numbers)
- Enchant x1 (synergy)

Rarity: Common / Uncommon / Rare / Epic / Relic

### 3.4 Loot categories
- Gear (weapons / armor / accessories / belt / class-unique equipment)
- Materials (base building/crafting; also used for Chip replacement fees)
- Currency (vendors/rerolls/repairs; retention on death determined by Belt tier)
- **Weapon Parts** (used for weapon upgrade trees; type-specific)
- **Armor Scraps** (from scrapping armor; used for repairs/crafting)
- **Utility Items** (grenades/consumables/tools/traps/ammo types; slotted into Belt utility slots)
- **Chips** (extracted affixes; take grid space; applied at Workshop to craft/upgrade gear)

### 3.5 Enemies
Roles: Swarmer, Spitter, Leaper, Anchor, Buffer, Disruptor  
Elites are modifiers layered on base enemies (shielded, split, explode, aura, etc.)  
Each enemy type has a `alert_profile_id` defining its trigger set and thresholds.

### 3.6 Core map mechanics
- **Single large zone with subareas** (connected wings/sections)
- Each subarea: rooms/corridors + occasional arena
- The zone layout is **procedurally generated per run** from a **seed** (deterministic)
- Layout topology is **goal-driven** (boss rooms terminal, uplinks distributed, etc.)
- Each subarea has a `biome_id`. Biomes reference `environment_profile_id` for hazard/atmosphere mechanics.
- **Subarea activation:**
  - enemies outside the active subarea are sleeping (no turns), **except Alerted enemies** which may pursue across subareas
  - only the player's current subarea simulates AI/spawns/hazards
- Spawn Vents: spawn pressure source; destroy/seal as objective (**vents operate only in active subareas**)
- **Connectors** between subareas: Open / Locked / Airlock / Collapsed / Vent Shaft (see 1.23)

---

## 4) Data-Driven Architecture (critical)

### 4.1 Data format standard
**Authoring (Phase 1):**
- Content defs authored as **ScriptableObjects** in Unity.

**Runtime (Phase 1):**
- All gameplay systems access content through registries keyed by stable **string IDs**.
- Saves store **IDs**, never Unity object references.
- When procedural generation is introduced, run saves must include `run_seed` and `mapgen_profile_id` (a `MapGenProfileDef` ID), plus enough generated-map state to resume safely.

**Mods (Phase 2, post-1.0):**
- Mods provide JSON that maps to DTOs (`WeaponDto`, `EnemyDto`, etc.).
- Game loads:
  1) ScriptableObjects → DTO → Registry
  2) Mod JSON → DTO → Registry **merge/override**

**Saves/Settings (all phases):**
- JSON for saves + settings (versioned).

### 4.2 Hard rules for mod-friendliness
- Every def must have an immutable `id` (string) and `version` (int).
- Gameplay logic may not depend on direct Unity object references; use IDs and catalogs.
- Asset refs in defs must be via **Asset IDs** (e.g., `sprite_id`, `sfx_id`) resolved by an `AssetCatalog`.
- Map generation and biome/environment systems must be **data-driven defs** addressed by stable IDs.
- No "switch on specific weapon class" logic; use tags + data fields.
- Registries must support: add new IDs / override existing IDs / deterministic conflict resolution.
- **UI display strings must never be hardcoded** — all display names and UI labels must live in defs or a localization table (see AGENTS.md localization rule).

### 4.3 Deterministic merge policy
Default mod merge behavior:
- Registry is keyed by `id`.
- If mod defines an existing `id`, it **overrides the entire def** (simple rule).
- Later enhancement (optional): field-level deep-merge for QoL.

Mod conflict rule:
- Mods load in deterministic order:
  1) base content
  2) mods sorted by `loadOrder` then name
  3) later mods override earlier mods ("last wins")

### 4.4 Naming conventions
- IDs are uppercase snake or prefixed tokens:
  - Weapons: `WPN_CoilPistol`
  - Mods: `MOD_Rune_Pierce`
  - Enemies: `ENM_Swarmer_A`
  - Goals: `GOAL_BossHunt_01`
  - Objectives: `OBJ_SealVents`
  - Base nodes: `BASE_Node_SynthesisArray_T1`
  - Passive Slot II nodes: `BASE_Node_PassiveSlotII_Warden`
  - Recovery Drone nodes: `BASE_Node_RecoveryDrone_T1`
  - Subareas: `AREA_WingA_01`
  - Weapon trees: `TREE_WPN_CoilPistol`
  - Weapon tree nodes: `NODE_WPN_CoilPistol_Pierce1`
  - Specs: `SPEC_Warden_ClassAbility_Fortress_1`
  - Spec branches: `SPECBRANCH_Warden_ClassAbility_Fortress`
  - Biomes: `BIOME_ResearchLab`
  - Status effects: `STATUS_Poison`
  - Exfil defs: `EXFIL_Hot_Standard`
  - Connectors: `CONN_Airlock_Standard`
  - Affixes: `AFFIX_Damage_Flat`, `AFFIX_Armor`, `AFFIX_CritChance`
  - Affix tiers: `AFFIXTIER_Damage_Flat_T1`, `AFFIXTIER_Armor_T2`
  - Legendary powers: `LEGENDARY_BulwarkPulseOnKill`, `LEGENDARY_WhenShieldFullDamageBonus`
  - Hazards (tile): `HAZ_FireTile`, `HAZ_ToxicPool`, `HAZ_EMPPulse`
  - Hazard entities: `HAZE_ToxicGasVent`, `HAZE_EMPEmitter`
  - Vendors: `VENDOR_Market_Standard`, `VENDOR_Gunsmith_Field`, `VENDOR_BlackMarket`
  - Materials: `MAT_SteelScrap`, `MAT_BioSample_RunExclusive`, `MAT_ReactorCore_RunExclusive`
  - Chips: generated instance IDs at runtime (not stable def IDs — each chip is a unique instance)
  - Station Depth profiles: `STATIONDEPTH_Warden`, `STATIONDEPTH_Nullrunner`
  - Loot drop profiles: `LOOT_ENM_Swarmer_Standard`, `LOOT_CONTAINER_ArmoryLocker`
  - Abilities: `ABILITY_Warden_BulwarkNode`, `ABILITY_Revenant_BloodNova`
  - Subarea templates: `SUB_ArenaOpen_Objective_A`, `SUB_Chokepoint_Support_01`
  - Subarea skeletons: `SKEL_SurfaceDataCenter_Base`, `SKEL_SurfaceDataCenter_MirrorX`
  - Alert profiles: `ALERTPROFILE_Swarmer_Standard`, `ALERTPROFILE_BlindGrub_A`
- Files follow ID names.

---

## 5) Required Definitions (core)
All content must be data-defined. Author as ScriptableObjects; runtime uses DTOs + registries.

### 5.1 Core defs

- **WeaponDef / WeaponDto**
  - id, version, name, type (Primary/Passive)
  - base stats: damage, range, aoe, pierce, cooldown_turns, burst
  - targeting_mode (manual/nearest/densest/marked/random)
  - requires_los
  - socket_layout (rune, gems, enchant)
  - upgrade_curve
  - tags: [string]
  - asset_ids: sprite_id, sfx_id, vfx_id (optional)
  - default_status_application_id (nullable; for guaranteed status on hit)

- **ModDef / ModDto**
  - id, version, category (Rune/Gem/Enchant), rarity
  - effects (stat deltas + rule modifiers)
  - status_proc_id (nullable), status_proc_chance (float; 0–1)
  - compat tags (weapon tags)

- **EnemyDef / EnemyDto**
  - id, version, role, hp, speed, attack, range
  - behavior_id (so AI logic is data-selected)
  - alert_profile_id (required; see AlertProfileDef)
  - drop_profile_id
  - tags + asset_ids
  - status_resistances: [{ status_id, resistance_pct }]

- **AlertProfileDef / AlertProfileDto**
  - id, version
  - triggers: [enum — LoS / AllyKilled / ObjectInteract / Proximity]
  - proximity_radius (int tiles; used if Proximity trigger enabled)
  - proximity_radius_affix_tag (optional; equipment affix tag that can reduce this radius)
  - note: enemies never de-alert once triggered (except class ability override)

- **EliteModifierDef / EliteModifierDto**
  - id, version, rules, tags

- **SpawnProfileDef / SpawnProfileDto**
  - id, version, tables by threat/alert
  - vent spawn rates

- **ClassDef / ClassDto**
  - id, version, starting stats, starting weapon id
  - active_ability_id
  - passive_slots (int; default 1)
  - passive_slot_ii_node_id (base node ID that unlocks slot II for this class)
  - class_unique_gear_ids: [item_id] (list of unique gear variants for this class)
  - spec_branch_ids: [spec_branch_id] (4 branches: ClassAbility / Primary / PassiveI / PassiveII)
  - generic_spec_pool_id (pool of class-filtered generic specs)

- **BaseNodeDef / BaseNodeDto**
  - id, version, prereqs, benefit, world_cost, material_costs
  - min_station_depth (int; gate for unlock availability)

- **BaseModuleDef / BaseModuleDto**
  - id, version, tiered costs, unlocks

- **ItemDef / ItemDto**
  - id, version, type, size (w,h), bulk, tags
  - status_resistances: [{ status_id, resistance_pct }] (for armor/belt types)
  - durability_stage (int; 0 = Fine, max = Broken; weapons/armor only)
  - max_durability_stages (int; rarity-derived; 0 for non-degrading items)
  - scrap_yield_profile_id (nullable; for weapons/armor)

### 5.2 Run difficulty & escalation

- **RunDifficultyDef / RunDifficultyDto**
  - id, version, label
  - death_loss_rules
  - drop_rate_mult

- **RunTimerEscalationDef / RunTimerEscalationDto**
  - id, version
  - tier1_turn: int (default 80; edit directly in Inspector for playtesting)
  - tier1: EscalationTierData
  - tier2_turn: int (default 140)
  - tier2: EscalationTierData
  - tier3_turn: int (default 200)
  - tier3: EscalationTierData
  - scenario_overrides: [{ goal_type_tag (string), field (EscalationField enum), multiplier (float) }]

  **EscalationTierData** (struct — used for tier1/tier2/tier3):
  - spawn_rate_mult: float (multiplier on vent spawn frequency; 1.0 = no change)
  - elite_chance_add: float (flat % added to elite spawn chance)
  - vent_activity_mult: float (multiplier on simultaneous active vent count)
  - enemy_speed_add: int (flat bonus tiles/turn added to all enemies)
  - alert_radius_add: int (flat bonus tiles added to all proximity alert radii)
  - spawn_cap_add: int (raises max simultaneous enemy count)
  - is_lockdown: bool (true only on tier3 in v1)
  - lockdown_spawn_profile_id: string (nullable; required if is_lockdown=true; replaces normal spawn profile)
  - lockdown_exfil_conversion: bool (if true, forces all remaining exfil points to Hot type)
  - lockdown_display_name_key: string (localization key for UI state label e.g. "UI_ESCALATION_LOCKDOWN"; nullable)

  **EscalationField** (enum — used in scenario_overrides):
  - SpawnRateMult, EliteChanceAdd, VentActivityMult, EnemySpeedAdd, AlertRadiusAdd, SpawnCapAdd

  **Stacking rule:** cumulative — tier2 effects add on top of tier1; tier3 adds on top of tier2.
  **Scenario overrides:** at runtime, multiply the named field's accumulated value by the override multiplier if the current run's goal package carries a matching goal_type_tag.
  **Tuning note:** tier turn values (tier1_turn, tier2_turn, tier3_turn) are top-level Inspector fields for fast playtesting iteration — no array indexing required.

- **BeltTierDef / BeltTierDto**
  - id, version
  - tier (int: 1–3+)
  - utility_slots (int)
  - currency_retention_pct (float; tunable)
  - rarity_min, rarity_max (enum range that maps to this tier)

### 5.3 Goals / missions

- **GoalPackageDef / GoalPackageDto**
  - id, version, primary_objective_ids[], secondary_objective_ids[]
  - reward_bias, threat_bias
  - exfil_type_weights: [{ exfil_type, weight }]
  - map_topology_hints (tags that drive goal-driven subarea layout)
  - preview_fields: (goal_type, biome_bias, reward_bias, threat_level — shown on draft screen)

- **ObjectiveDef / ObjectiveDto**

- **ExfilDef / ExfilDto** (see section 5.11)

### 5.4 Subareas and connectors

- **SubareaDef / SubareaDto**
  - id, version
  - bounds (rect or polygon on grid; v1 uses rect)
  - connector_ids (adjacent subareas / airlocks)
  - biome_id (stable ID; required)
  - environment_profile_id (optional)
  - tags (hazard_bias, objective_bias, loot_bias)
  - activation_rules (optional; default: active if player inside bounds)

- **ConnectorDef / ConnectorDto**
  - id, version
  - type (enum: Open / Locked / Airlock / Collapsed / VentShaft)
  - traversal_turns (int; default 1; Airlock may be 1+)
  - spawn_trigger_id (nullable; fires when player commits to crossing — Airlock tension mechanic)
  - one_way (bool; Collapsed passages)
  - unlock_condition_id (nullable; Locked doors)
  - size_constraint (nullable; VentShaft — small entities or tool required)

### 5.4.1 Biomes

- **BiomeDef / BiomeDto**
  - id, version
  - display_name, tags
  - environment_profile_id (optional)
  - spawn_profile_id
  - hazard_ids: [exclusive hazard IDs]
  - universal_hazard_intensity_mults: [{ hazard_tag, mult }]
  - spawn/hazard/loot/objective bias hooks (IDs/tags)

### 5.4.2 Environment Profiles

- **EnvironmentProfileDef / EnvironmentProfileDto**
  - id, version
  - atmosphere category (breathable/thin/toxic/none)
  - resource drain hooks (e.g., oxygen drain per turn; optional)
  - risk/hazard tags (radiation/corrosion/freezing; optional)
  - passive_status_applications: [{ status_id, proc_chance, interval_turns }]

### 5.4.3 Map generation profile

- **MapGenProfileDef / MapGenProfileDto**
  - id, version
    - NOTE: this `id` is the `mapgen_profile_id` stored in run saves
  - subarea_count_by_station_depth: [{ depth_min, depth_max, count_min, count_max }]
  - subarea_size_by_biome: [{ biome_id, width_min, width_max, height_min, height_max }]
  - connector_type_weights: [{ connector_type, weight }] (relative frequency of each connector type in generation)
  - biome_sequence: [biome_id] (weighted pool for biome assignment per subarea)
  - goal_topology_rules: [{ goal_type_tag, topology_hint }] (how goal packages shape layout; placeholder until M4.75 GoalPackageDef integration)
  - generation_mode (enum: Graph / Slot; selects which algorithm runs)
  - max_generation_attempts (int; retry budget before fallback)
  - NOTE: implementation may carry additional tuning fields (corridor padding, pocket sizes, etc.) not listed here; those are generator internals, not spec-level fields

### 5.4.4 Subarea templates

`SubareaTemplateDef` is the content unit used by map generation to populate subarea slots. Each template defines the interior layout archetype, size constraints, biome compatibility, and role tags that the generator uses when assigning templates to subarea slots. Templates are authored as ScriptableObjects and selected at generation time via tag matching and size validation.

This def was created during M4.3 implementation and is formalized here retroactively per AGENTS.md open-decision tracking rules.

- **SubareaTemplateDef / SubareaTemplateDto**
  - id, version
  - display_name (localization key)
  - layout_archetype (enum: ArenaOpen / Chokepoint / GridAisles / MazeTunnels / RoomCluster / RingArena / SpineCorridor)
  - role_tags: [string] (e.g. "Start", "Gate", "Objective", "Exfil", "Support" — used by generator slot matching)
  - biome_allowlist: [biome_id] (nullable; if set, template only appears in listed biomes)
  - biome_denylist: [biome_id] (nullable; template never appears in listed biomes)
  - size_min (w, h; minimum tile dimensions this template can fill)
  - size_max (w, h; maximum tile dimensions)
  - connector_port_count_min (int; minimum number of connector attachment points)
  - connector_port_count_max (int; maximum)
  - tags: [string] (general-purpose tags for generator filtering; e.g. "hazard_bias", "loot_bias", "fortified")
  - asset_ids (optional; sprite overrides for tile rendering)

- **SubareaSkeletonDef / SubareaSkeletonDto** *(new — formalizes hardcoded slot skeletons)*
  - id, version
  - display_name
  - grid_width, grid_height (int; total map canvas size this skeleton targets)
  - slots: [{ slot_id, role_tag, bounds_x, bounds_y, bounds_w, bounds_h, required_connections: [slot_id] }]
  - corridor_lanes: [{ lane_id, axis (H/V), fixed_coord, range_min, range_max }]
  - note: replaces hardcoded skeleton coordinate arrays in MapGenerator; authored as data assets so new skeletons can be added without code changes

ID conventions:
- Subarea templates: `SUB_<LayoutArchetype>_<RoleTag>_<Variant>` (e.g. `SUB_ArenaOpen_Objective_A`, `SUB_Chokepoint_Support_01`)
- Subarea skeletons: `SKEL_<MapName>_<Variant>` (e.g. `SKEL_SurfaceDataCenter_Base`, `SKEL_SurfaceDataCenter_MirrorX`)

### 5.5 Weapon upgrade trees

- **WeaponUpgradeTreeDef / WeaponUpgradeTreeDto**
  - id, version, weapon_id
  - starting_nodes: [node_id]
  - rules:
    - max_nodes_purchasable (v1 recommended 6–10)
    - respec_allowed (bool; default false for v1)
    - unlock_conditions (optional; Station Depth / base tier)
  - node_ids: [node_id]

- **WeaponUpgradeNodeDef / WeaponUpgradeNodeDto**
  - id, version, tree_id
  - name, description
  - prerequisites: [node_id]
  - cost:
    - upgrade_points (int)
    - required_parts: [{ item_id, qty }]
    - currency_cost (optional)
  - effects:
    - stat_mods (damage/range/cooldown/burst/etc.)
    - template_mods (pierce/split/cone width/adjacent offsets/etc.)
    - rule_mods (refract-on-kill, status procs, etc.)

### 5.6 Status effects

- **StatusEffectDef / StatusEffectDto**
  - id, version
  - display_name (resolved via localization table; never hardcoded)
  - stack_rule (enum: Stack / Refresh / Unique)
  - dot_per_stack (float; damage per turn per stack)
  - duration_turns (int; base duration)
  - max_stacks (int; nullable — unbounded if null)
  - spread_rule (nullable; e.g. Burn spreads to adjacent entities on application)
  - immobilize (bool; Freeze)
  - shatter_damage_mult (float; nullable; Freeze shatter bonus)
  - action_penalty (nullable; Shock — skip turn or speed reduction)
  - movement_damage_scale (float; nullable; Bleed)
  - mechanical_only (bool; EMP — only affects mechanical enemies/shields)
  - application_tags: [string] (for resistance checks)

### 5.7 Spec system defs

- **SpecDef / SpecDto**
  - id, version
  - class_id
  - branch_id (nullable for generic pool specs)
  - slot_target (enum: ClassAbility / Primary / PassiveI / PassiveII)
  - is_generic (bool; true = drawn from class generic pool)
  - is_capstone (bool; capstone specs are the build-defining rule-change tier)
  - effects: [stat_mods, rule_mods, cross_slot_rules]
  - modifies (enum: Active / UniqueEquip / Both)
  - display_name, description (localized)

- **SpecBranchDef / SpecBranchDto**
  - id, version
  - class_id
  - slot_target (enum: ClassAbility / Primary / PassiveI / PassiveII)
  - branch_name (thematic label, e.g. "Fortress", "Shock Pylon", "Warden Matrix")
  - unlock_node_id (nullable; base node required to unlock this branch option)
  - spec_ids: [spec_id, spec_id] (2 non-capstone specs)
  - capstone_spec_id

- **ClassSpecGenericPoolDef / ClassSpecGenericPoolDto**
  - id, version
  - class_id
  - spec_ids: [spec_id...] (class-filtered generics; slot-keyed but broader pool)

### 5.8 Belt + utility item defs

- **BeltDef / BeltDto** (extends ItemDef)
  - id, version
  - rarity
  - tier (int; derived from rarity via BeltTierDef lookup)
  - utility_slots (int; from BeltTierDef)
  - currency_retention_pct (float; from BeltTierDef)
  - socket_layout: utility_affixes (int count)
  - asset_ids

- **UtilityItemDef / UtilityItemDto**
  - id, version
  - category (enum: Grenade / Consumable / Tool / Trap / AmmoType)
  - charges_per_run (int; default 1)
  - effects: [rule definitions]
  - acquisition_sources: [enum: LootDrop / Crafted / Vendor]
  - restock_currency_cost (int; vendor restock cost mid-run)
  - tags, asset_ids

### 5.9 Boss defs

- **BossDef / BossDto** (extends EnemyDef)
  - id, version
  - phase_thresholds: [{ hp_pct, phase_id }]
  - arena_hazard_ids: [hazard_id]
  - minion_spawn_profile_id
  - map_effect_triggers: [{ trigger_condition, map_effect_id }]
  - vulnerability_conditions: [{ condition, window_turns }]
  - is_goal_required (bool; true = required for a goal package; false = optional boss room)

- **BossMapEffectDef / BossMapEffectDto**
  - id, version
  - effect_type (enum: LockDoors / SurgeVents / ActivateHazards / SpawnElites / etc.)
  - target_scope (enum: Arena / Subarea / Zone)
  - duration_turns (int; nullable = permanent until boss death)
  - hooks into world tick system

- **BossPhraseDef / BossPhaseDto**
  - id, version
  - behavior_id (data-selected AI logic for this phase)
  - stat_mods (damage/speed/range changes for this phase)
  - ability_ids: [ability applied during this phase]

### 5.10 Durability / scrap defs

- **ScrapYieldDef / ScrapYieldDto**
  - id, version
  - gear_type (enum: Weapon / Armor)
  - rarity_yields: [{ rarity, condition_fine_qty, condition_broken_qty, part_item_id }]
  - note: condition_broken_qty < condition_fine_qty (condition affects yield)

### 5.11 Exfil defs

- **ExfilDef / ExfilDto**
  - id, version
  - exfil_type (enum: Quiet / Hot / Conditional / Emergency / Timed)
  - countdown_turns (int; nullable for Quiet/Conditional before triggered)
  - trigger_condition_id (nullable; for Conditional type)
  - open_window_turns (int; nullable; for Timed type — how long before it closes)
  - conversion_rules: [{ trigger_condition_id, converts_to_type }]
  - alert_level_conversion: [{ alert_level, converts_to_type }]
  - emergency_cost: (TBD — see Open Decisions)
  - reveal_radius (int tiles; proximity reveals exfil point)
  - biome_weight_tags: [string]

### 5.12 Player stats defs

- **PlayerStatsDef / PlayerStatsDto**
  - id, version
  - class_id
  - base stats (one field per stat):
    - max_hp, armor_base, evasion_base, shield_base, status_resist_base, move_speed_base
    - damage_flat_base, damage_pct_base, crit_chance_base, crit_damage_base
    - range_base, cdr_base, status_potency_base, aoe_size_base
    - hp_regen_base, vendor_price_mod_base

- **CombatConstantsDef / CombatConstantsDto**
  - id, version
  - armor_k_value (float; used in armor/(armor+K) formula)
  - crit_base_multiplier (float; default 1.0 = 100% base before crit_damage stat)
  - cdr_cap (float; maximum CDR % allowed; e.g. 0.75 = 75% cap)
  - shield_regen_per_turn (float; base regen before gear bonuses)
  - note: only one instance of this def should exist; referenced globally

### 5.13 Affix, Chip, and Legendary power defs

- **AffixDef / AffixDto**
  - id, version
  - display_name (localization key)
  - stat_target (enum: maps to a player stat field)
  - category (enum: Defensive / Offensive / Economic / Shared / ClassSynergy)
  - slot_compat_tags: [string] (which gear slot types can carry this affix)
  - class_filter_id (nullable; for ClassSynergy affixes)
  - tiers: [AffixTierDef id]

- **AffixTierDef / AffixTierDto**
  - id, version
  - affix_id
  - tier (int: 1/2/3)
  - value_min, value_max (float; rolled on chip creation)
  - station_depth_min (int; minimum Station Depth before this tier can appear)

- **ChipDef / ChipDto**
  - id, version (generated on creation — each chip is a unique instance)
  - affix_id
  - affix_tier (int)
  - rolled_value (float; exact value, copied from source item on scrapping or rolled on direct drop)
  - slot_compat_tags: [string] (copied from AffixDef)
  - size (w, h; grid size in stash — chips take inventory space)
  - source (enum: Scrapped / Dropped)

- **LegendaryPowerDef / LegendaryPowerDto**
  - id, version
  - display_name, description (localization keys)
  - is_unique (bool; true = named item, hand-authored; false = pool draw)
  - slot_compat_tags: [string]
  - effects: [rule_mods] (passive only — no active triggers)
  - note: Legendary powers are permanently bound to the Relic they appear on; no transfer

- **ChipReplacementCostDef / ChipReplacementCostDto**
  - id, version
  - costs_by_rarity: [{ rarity, material_id, qty }]
  - note: one instance; referenced by Workshop crafting logic

### 5.14 Station Depth defs

- **StationDepthProfileDef / StationDepthProfileDto**
  - id, version
  - class_id
  - depth_levels: [{ depth, extractions_required, narrative_label, unlock_description, biome_ids_available }]
  - note: one instance per class; `depth_levels` authored per Depth 1–12

### 5.15 Ability defs

- **AbilityDef / AbilityDto**
  - id, version
  - class_id
  - display_name, description (localization keys)
  - targeting_mode (enum: Tile / Self / Auto)
  - activation_type (enum: Instant / ChargeUp)
  - charge_turns (int; nullable; used if activation_type = ChargeUp)
  - gate_type (enum: Cooldown / Resource / Both)
  - cooldown_turns (int; nullable; used if gate_type includes Cooldown)
  - resource_id (nullable; references a resource def e.g. BloodEngine stacks)
  - resource_cost (int; nullable)
  - effects: [AbilityEffectDef id] (list of effect categories — see below)
  - unique_gear_override_ids: [{ item_id, replacement_ability_id }] (gear that replaces ability outright)
  - unique_gear_modifier_ids: [{ item_id, modifier_rules }] (gear that tweaks parameters)

- **AbilityEffectDef / AbilityEffectDto**
  - id, version
  - effect_category (enum: Damage / Deploy / StatusApply / ModifyPlayerState / ModifyEnemyState / CreateZone)
  - target_scope (enum: Single / AoE / Self / Tile)
  - damage (float; nullable)
  - deploy_entity_id (nullable; entity def ID for Deploy effects)
  - status_id (nullable; for StatusApply effects)
  - buff_rules (nullable; for ModifyPlayerState)
  - debuff_rules (nullable; for ModifyEnemyState)
  - zone_profile_id (nullable; for CreateZone effects)
  - duration_turns (int; nullable)

- **AbilityResourceDef / AbilityResourceDto**
  - id, version
  - display_name (localization key)
  - max_stacks (int)
  - decay_rule (nullable; e.g. "loses 1 stack per turn if no kill")
  - gain_triggers: [{ trigger_event, amount }] (e.g. on_kill: +1)

### 5.16 Hazard defs

- **HazardDef / HazardDto** (tile hazards)
  - id, version
  - display_name (localization key)
  - hazard_type: TileState
  - effects: [{ effect_type, value, trigger (OnEnter / PerTurn / OnExit) }]
  - effect_types include: Damage, StatusApply, BlockMovement, ReduceVisibility
  - spread_rule (nullable; { spread_chance, interval_turns, max_tiles })
  - duration_turns (int; nullable — null = permanent)
  - immune_tags: [string] (entity tags that are immune to this hazard)
  - is_biome_exclusive (bool)
  - can_be_disabled (bool)
  - disable_method (nullable; e.g. tool_tag required)

- **HazardEntityDef / HazardEntityDto** (entity hazards)
  - id, version
  - display_name (localization key)
  - hazard_type: Entity
  - hp (int; nullable — null = indestructible)
  - aoe_radius (int; effect radius around entity)
  - effects: [{ effect_type, value, trigger }] (same effect types as HazardDef)
  - spawn_profile_id (nullable; entity may spawn additional hazards on death)
  - immune_tags: [string]
  - is_biome_exclusive (bool)
  - asset_ids: sprite_id, sfx_id

### 5.17 Loot drop profile defs

- **LootDropProfileDef / LootDropProfileDto** (enemy drops)
  - id, version
  - entries: [{ item_category, item_id (nullable), weight, qty_min, qty_max, depth_scale_mult }]
  - item_category (enum: Gear / Currency / Material / WeaponParts / ArmorScraps / UtilityItem / Chip / Nothing)
  - note: each entry rolls independently; weight is relative within the profile
  - depth_scale_mult: runtime multiplier applied based on chosen Station Depth

- **ContainerLootProfileDef / ContainerLootProfileDto** (crates, lockers, caches)
  - id, version
  - container_type (enum: ArmoryLocker / ElectronicsCache / BioCrate / VaultContainer / GenericCrate)
  - guaranteed_slots: [{ item_category, item_id (nullable), qty_min, qty_max }]
  - random_entries: [{ item_category, item_id (nullable), weight, qty_min, qty_max }]
  - roll_count (int; how many random_entries roll per open)
  - depth_scale_mult (float)
  - biome_bias_tags: [string]

- **MaterialDef / MaterialDto**
  - id, version
  - display_name (localization key)
  - material_category (enum: Standard / RunExclusive)
  - stack_size (int)
  - size (w, h; grid size in stash)
  - asset_ids

### 5.18 Vendor defs

- **VendorDef / VendorDto**
  - id, version
  - vendor_type (enum: Market / Gunsmith / BlackMarket)
  - services: [enum: BuyGear / BuyUtility / BuyMaterials / Sell / FieldRepair / ModReroll / IntelScan / ExfilBribe / VendorExclusive]
  - inventory_profile_id (references a LootDropProfileDef for what gear/items this vendor stocks)
  - price_scale_by_depth: [{ depth, price_mult }]
  - spawn_weight (float; relative chance this vendor type spawns in a run)
  - inventory_fixed_on_spawn (bool; true = inventory generated once, does not refresh)
  - vendor_exclusive_item_ids: [item_id] (items only available at this vendor type, not at base)
  - field_repair_cost_mult (float; nullable; premium over base repair cost)

### 5.19 Objective defs

- **ObjectiveDef / ObjectiveDto**
  - id, version
  - display_name, description (localization keys)
  - objective_type (enum: KillCount / SealDestroy / RetrieveCarry / ActivateHold / Escort / Survival)
  - is_failable (bool; true = can permanently fail mid-run e.g. escort target dies)
  - completion_mode (enum: AutoComplete / RequiresInteract)
  - counter_target (int; nullable; for KillCount, SealDestroy, Survival)
  - target_entity_id (nullable; specific enemy or entity ID for targeted kills)
  - hold_turns (int; nullable; for ActivateHold)
  - retrieve_item_id (nullable; for RetrieveCarry)
  - escort_entity_id (nullable; for Escort)
  - steps: [{ step_id, objective_def_id }] (nullable; for multi-step sequences)
  - is_primary (bool)
  - is_hidden_until_discovered (bool; secondaries hidden until discovered)
  - on_complete_effects: [{ effect_type, value }] (e.g. unlock exfil type, grant reward bias)
  - on_fail_effects: [{ effect_type, value }] (e.g. spawn enemies, close exfil)

### 5.20 Weapon parts / upgrade defs (update)

- **WeaponPartsDef / WeaponPartsDto** (extends MaterialDef)
  - id, version
  - weapon_family_id (string; links to a weapon family — families defined at M5.5)
  - note: weapon families TBD at M5.5 weapon tree design milestone

- **WeaponUpgradeTreeDef** (update to existing)
  - add: `weapon_family_id` field
  - add: `respec_part_cost: [{ item_id, qty }]` (parts cost to undo a node)

---

## 6) Run Goals — Initial Catalog (v1 set)
Each run picks 1 Goal Package (plus optional secondaries).

### GP1: Boss Hunt
- Primary: Defeat a boss entity that spawns after prerequisites (e.g., seal vents or activate terminals).
- Exfil: Enabled on boss death (hot exfil default).
- Rewards: higher chance of Cores + Relic mods.
- Threat: higher elites; Alert Level may start at 1.
- Map topology: boss arena at map terminus; fortified approaches.

### GP2: Core Retrieval
- Primary: Collect 1–3 "Important Items" (e.g., Reactor Core, Bio-Sample, Signal Prism) and carry to exfil.
- Exfil: Enabled once all items are carried and player reaches exfil.
- Rewards: high materials bias (specific crafting mats).
- Threat: enemies ambush near item rooms; extraction countdown longer if over-bulk.
- Map topology: item rooms distributed across subareas; exfil at map edge.

### GP3: Purge (Kill Count)
- Primary: Kill N enemies (e.g., 150) OR clear a "Wave Room" event.
- Exfil: Enabled after quota met.
- Rewards: currency + materials bias; good for early progression.
- Threat: higher vent activity, lower boss chance.

### GP4: Vent Seal Operation
- Primary: Seal X vents (e.g., 4).
- Exfil: Enabled when vent quota met.
- Rewards: crafting mats for base power modules.
- Threat: vent rooms are fortified; buffers/disruptors more common.
- Map topology: vents distributed across multiple subareas.

### GP5: Data Uplink
- Primary: Activate Y terminals; hold a tile for Z turns each (mini-defense events).
- Exfil: Enabled after uplink chain complete.
- Rewards: Intel Terminal-related materials; map intel progression hooks.
- Threat: timed waves at each uplink.
- Map topology: terminals distributed; Conditional exfil preferred.

Goal packages are weighted by Station Depth so early runs don't require complex mechanics.

---

## 7) Mod Support Roadmap (implementation timing aligned to post-1.0)
### Phase 1 (1.0): mod-ready architecture (no mod loader shipped)
- Implemented via M4.25 (Registry + DTO Layer) and M4.25.1 (DefDatabase).
Acceptance criteria:
- All defs have IDs + versions.
- Game runs entirely off registries keyed by ID.
- Saves store IDs only.
- DTO layer exists for each def type (even if only used internally).
- Mod merge policy is documented (even if loader not shipped).

### Phase 2 (post-1.0): JSON balance/content mods (PC-first)
What mods can do:
- Override weapon/mod/enemy numbers
- Add new spawn profiles, goal packages, objectives
- Add new items/materials that reference existing sprites/sfx by asset_id
- Add new "behavior_id" references to existing behavior scripts (data-driven selection)

Deliverables (post-1.0):
- `Mods/` folder scanning (PC)
- `ModManifest.json` support
- JSON schema docs + example mods
- Safe failure: invalid mod does not brick game

### Phase 3 (later): custom assets (optional)
- Addressables/AssetBundles pipeline
- Mod packaging format including bundles
- Security + platform considerations (iOS likely limited)

---

## 8) Mod File Format

```json
{
  "id": "ExampleMod",
  "version": 1,
  "loadOrder": 100,
  "defs": [
    {
      "type": "WeaponDef",
      "id": "WPN_CoilPistol",
      "version": 2,
      "damage": 12
    }
  ]
}
```

---

## 9) Milestones

### M0 — Project Setup (1–3 days)
Acceptance:
- Project builds on Windows
- iOS target compiles (no gameplay needed yet)
- Basic scene loads, input system wired

Tasks:
- Create Unity project, set 2D pipeline
- Create folder structure (Section 10)
- Add build instructions
- Establish save-data stub

### M1 — Grid + Turn Engine (playable loop) (3–6 days)
Acceptance:
- Player can move on grid (8-way), wait, bump into walls
- Enemies exist and take turns
- Turn order is deterministic and visible (debug UI ok)

Tasks:
- Grid map representation + tile occupancy
- Turn scheduler (player -> passive step hook -> enemies -> world)
- Basic enemy AI: "move toward player" + "attack if adjacent"

### M2 — Primary Weapon Manual Combat (3–6 days)
Acceptance:
- Player can aim/target and fire a primary weapon
- Damage, death, simple drops (currency) exist
- Numpad + iOS control prototype works

Tasks:
- PrimaryWeapon system (manual targeting)
- Hit resolution (LoS optional, start simple)
- Health + death + return to menu
- iOS UI: virtual d-pad + attack + target select

### M3 — Passive Weapon Auto-Fire Step (bullet heaven feel) (3–6 days)
Acceptance:
- Passive weapon fires automatically after player action
- Targeting modes work (nearest / random at minimum)
- Swarm density feels meaningfully different

Tasks:
- PassiveWeapon system with cooldown_turns + burst
- Auto-fire step executed between player action and enemy step

### M4 — Swarms + Spawn Vents + Objectives + Subarea Scaffolding (5–10 days)
Acceptance:
- Vents spawn enemies on world tick (active subareas only)
- Player can destroy/seal vents
- At least 2 objective types exist to enable extraction
- Enemies outside the active subarea do not take turns

Tasks:
- SpawnVent entity + spawn rules (**vents operate only in active subareas**)
- **Subarea scaffolding (v1)**
  - represent subareas (rect bounds ok)
  - track current active subarea (player position → subarea)
  - ensure only active subarea enemies take turns
- Objective framework foundation (ObjectiveDef)
- Implement 2 objectives (SealVents, KillCount)

### M4.25 — Registry + DTO Layer (mod-ready foundation) (3–7 days)
Acceptance:
- ScriptableObjects load into registries keyed by ID
- DTOs exist and can be serialized/deserialized to JSON
- Game runtime uses registries (not direct SO references)

Tasks:
- DefRegistry<T> pattern
- DTO mapping (SO <-> DTO)
- JSON serializer utility + version field
- Save system uses IDs only

### M4.25.1 — DefDatabase (explicit base defs) (1–3 days)
Acceptance:
- Base defs are authored as `.asset` ScriptableObjects (not runtime-created instances)
- A `DefDatabase` ScriptableObject explicitly lists base defs used to populate registries
- Bootstrap loads registries deterministically from `DefDatabase` (no runtime disk scanning)
- Missing/duplicate IDs produce clear logs and do not cause nullref crashes

Tasks:
- `DefDatabase` ScriptableObject (+ CreateAssetMenu)
- `DefBootstrap` MonoBehaviour referencing `DefDatabase`
- Basic validation: empty IDs, duplicates, missing referenced IDs

### M4.3 — Procedural MapGen v1 + Biomes (seeded) (5–12 days)
Acceptance:
- Each run generates a large procedural zone from a saved `run_seed` and `mapgen_id`
- Map is composed of connected subareas, each assigned a `biome_id`
- Layout is goal-driven (goal package shapes topology)
- Biomes provide hooks for future mechanics via optional `environment_profile_id`
- Player spawn, vents, and objectives are placed into generated subareas deterministically
- Active-subarea simulation rule remains (sleeping outside active subarea; Alerted enemies may pursue)
- All 5 connector types are represented in generation (Open, Locked, Airlock, Collapsed, VentShaft)

Tasks:
- Implement `MapGenProfileDef` (subarea count by Station Depth, size by biome, topology rules)
- Implement `BiomeDef` + `EnvironmentProfileDef` + `ConnectorDef`
- Map generator outputs: tile grid layout, subarea bounds/IDs, biome assignments, connector placements
- Deterministic placement: player start, vents, objective targets
- Save additions: persist `run_seed`, `mapgen_id`, generated subareas + biome assignments
- **Surface Data Center slot generator (M4.3.2 sub-scope):**
  - `MAPGEN_SURFACE_DATA_CENTER_96` uses slot-based skeletons
  - template assignment constrained by slot tags + size
  - corridor lanes for tube/open connections
  - HUD reports generator mode/skeleton/attempt salt

### M4.35 — Enemy Pathfinding v1 + Alert System (3–6 days)
Acceptance:
- Enemies can navigate maze-like subareas to reach the player
- Pathing respects walls and blocking tiles; fallback behavior exists when no path
- Deterministic path results given the same seed/state
- Alert system: Idle → Alerted → Searching states work correctly
- Alert triggers (LoS, ally kill, object interact, proximity) fire per `AlertProfileDef`
- Alerted enemies pursue across subarea boundaries

Tasks:
- Implement grid pathfinding (A* or BFS) for enemy movement
- Cache/refresh paths with reasonable invalidation rules
- Add basic failover: if no path, enemy waits or reverts to greedy step
- Implement `AlertProfileDef` + alert state machine
- Implement Searching behavior (last known position pursuit)

### M4.5 — Run Timer Escalation (2–5 days)
Acceptance:
- Run timer tracked (turn count)
- Escalation thresholds at T80/T140/T200 trigger
- UI shows current Alert Level and next threshold

Tasks:
- Turn counter + escalation table
- Apply escalation modifiers during world tick
- Minimal UI indicator

### M4.75 — Goal Package System + Pre-Run Draft (3–7 days)
Acceptance:
- Pre-run draft screen shows 2–3 randomly generated run previews
- Each preview shows: goal type, biome, reward bias, threat level
- Run starts with a selected Goal Package (at least 2 packages: Purge + Vent Seal)
- UI shows current goals + progress tracker
- Goal completion enables extraction per package rules

Tasks:
- GoalPackageDef data model
- Pre-run draft generation logic (pool size tunable)
- Goal selection logic (weighted by Station Depth)
- Objective tracking UI
- Reward/threat bias hooks (minimal at first)

### M5 — Extraction as an Event (countdown + pressure) (5–10 days)
Acceptance:
- All exfil points hidden until proximity reveal
- Initiating exfil starts a countdown (e.g., 12 turns)
- Enemy pressure increases during countdown
- Player successfully extracts → end screen + loot summary
- Abort extraction is possible with a cost
- All 5 exfil types exist in data (at minimum Hot + Conditional functional)
- Alert-level exfil type conversion works (Quiet → Hot at T80)

Tasks:
- Exfil points (all 5 types stubbed; Hot + Conditional functional)
- Proximity reveal + Intel reveal hooks
- Extraction countdown + alarm state
- Alert-level conversion rule
- Post-run summary and rewards calculation

### M5.5 — Weapon Upgrade Trees + Parts Economy (Design Lock) (3–7 days)
Acceptance:
- Weapon upgrade tree system is specified and locked for v1 implementation.
- Parts/material economy spec exists.
- At least 3 weapons have complete trees (6–10 nodes each):
  - Coil Pistol, Shard Rail, Pulse Beam
- Each node specifies: upgrade point cost, required parts (item IDs + quantities), concrete effects.
- Pacing targets defined per Station Depth band.

Tasks:
- Finalize `WeaponUpgradeTreeDef` + `WeaponUpgradeNodeDef` schema.
- Define small parts taxonomy (v1 target: ~12–20 total parts).
- Define upgrade point acquisition rules.
- Define and document 3 full trees.
- Document loot/drop plan for parts.

### M6 — Inventory Grid + Loot Tetris + FIR Tagging + Death-Loss + Belt (7–14 days)
Acceptance:
- In-run backpack grid with item sizes
- Loot pickup requires space; player must choose what to keep
- Items tagged Found-In-Raid (FIR) only become "secured" on extraction
- Secure Pouch exists and persists on death per rules
- Player can choose Hardcore/Medium/Soft between runs; drop rate multiplier applies
- Belt slot exists; utility slots function; currency retention on death works
- Weapon parts + armor scraps supported as inventory items
- Gear durability stages tracked; broken gear is non-functional

Tasks:
- Backpack + stash UI
- FIR state transitions
- Secure Pouch logic
- Run difficulty selection UI + persistence
- Apply drop_rate_mult to loot tables
- Belt slot + BeltDef + BeltTierDef
- Utility item slot UI + UtilityItemDef
- Durability system: death-flagging, broken state, `ScrapYieldDef`
- Scrapping UI (at base and vendor)

### M7 — Home Base: Stash + Modules + Upgrade Web (10–20 days)
Acceptance:
- Base screen with stash + modules + upgrade web
- Materials consumed for upgrades
- Upgrades increase player power and Station Depth unlock potential
- Passive Slot II unlock nodes exist per class
- Recovery Drone upgrade node exists (Soft mode only)
- Gunsmith module: repair weapons/armor for materials
- Workshop: Chip application, scrapping gear → Chip, item review screen functional
- Station Depth profile visible on base screen with narrative labels

Tasks:
- Base save data model
- Implement base modules v1
- Upgrade web UI + node prerequisites + world_cost hooks
- Per-class Passive Slot II nodes
- Recovery Drone nodes (T1–T3)
- Gunsmith repair UI
- Workshop chip application UI + scrapping UI
- StationDepthProfileDef + per-class depth tracking
- Item review/stash sorting screen (post-run flow)

### M8 — Shops/Vendors + Economy Tuning (5–10 days)
Acceptance:
- In-run shop terminals exist
- Post-run selling exists
- Prices/rerolls scale with Threat Level and run progress
- Field repair available at vendors (currency + materials)
- Utility item restock available at vendors
- Intel scan purchase available at vendors

Tasks:
- Vendor inventory generation
- Sell/buy UI
- Field repair + utility restock UI
- Economy logging

### M8.5 — Boss Framework (5–10 days)
Acceptance:
- `BossDef` data model fully implemented with all 5 pillars:
  - Phase transitions fire at correct HP thresholds
  - Arena hazards activate on boss entry
  - Minion spawning works per spawn profile
  - Map-wide effects trigger correctly (door locks, vent surges, hazard pulses)
  - Vulnerability windows require correct condition before damage lands
- At least 1 functional boss (any biome)
- Optional boss rooms can appear independent of goal package
- Boss required by GP1 (Boss Hunt) works end-to-end

Tasks:
- BossDef + BossPhraseDef + BossMapEffectDef data model
- Phase transition system
- Arena hazard activation
- Minion spawn integration
- Map-wide effect hooks into world tick
- Vulnerability condition system
- Optional boss room placement in procgen

### M9 — Content Expansion to v1 Targets (ongoing)
Acceptance:
- 4 classes with spec systems functional
- 12 weapons, 5 biomes, full enemy roster + elites
- All 5 goal packages functional
- All 5 exfil types functional
- Status effects system complete (all 6 effects, bidirectional)
- Balance pass for meaningful extraction choices

### M10 — Polish + Shipping Readiness (ongoing)
Acceptance:
- iOS one-hand UX polished
- Performance supports high enemy counts
- Save/load robust
- Tutorial/onboarding

---

## 9.1 Post-1.0 Milestones (mod support release track)

### P1 — Mods v1 (JSON overlay, PC-first) (7–14 days)
Acceptance:
- Game loads mods from `Mods/` directory (PC)
- ModManifest controls load order
- Overrides apply (last wins)
- Safe failure: invalid mod does not brick game

Tasks:
- Mod scanner + manifest loader
- JSON DTO loader and registry overlay
- Validation + error reporting UI/log
- Ship ExampleMod and schema docs

### P2 — Mod tooling + docs (optional)
- Add a "Dump DTOs to JSON" command for vanilla defs
- Add a "Validate mod" tool
- Documentation and examples

### P3 — Custom asset mods (optional, later)
- Addressables/AssetBundles pipeline
- Mod packaging format including bundles
- Security + platform considerations (iOS likely limited)

---

## 10) Proposed Unity Folder Structure
```
Assets/
  _Project/
    Scripts/
      Core/
      Combat/
      AI/
      World/          (map gen, subareas, connectors, vents, hazards, objectives, escalation, goal packages)
      UI/
      Data/           (registries, DTO mapping, catalogs)
      Save/
      Mods/           (mod loader; post-1.0)
    Data/
      Weapons/
      Mods/
      Enemies/
      AlertProfiles/
      EliteModifiers/
      Classes/
      Specs/
      SpecBranches/
      Biomes/
      BaseNodes/
      BaseModules/
      Items/
      Belt/
      UtilityItems/
      RunDifficulties/
      EscalationProfiles/
      GoalPackages/
      Objectives/
      Exfil/
      Bosses/
      StatusEffects/
      Catalogs/       (AssetCatalog, string->asset maps)
      Subareas/
      SubareaTemplates/
      SubareaSkeletons/
      Connectors/
      Affixes/
      Chips/
      LegendaryPowers/
      PlayerStats/
      CombatConstants/
      Abilities/
      Hazards/
      HazardEntities/
      LootDropProfiles/
      Vendors/
      Materials/
      StationDepth/
    Prefabs/
    Scenes/
      Boot.unity
      Run.unity
      Base.unity

Mods/                (PC runtime folder, outside Assets; post-1.0)
  ExampleMod/
```

---

## 11) Testing & Acceptance Criteria (minimum viable)
- Turn order correctness
- Auto-fire triggers only during passive step
- Goal progress increments correctly and enables exfil
- Escalation thresholds trigger at exact turn counts (80/140/200)
- FIR rules: only extracted items become secured
- Difficulty selection: drop rate modifier applies; death-loss rules apply
- **Belt currency retention:** correct % kept on death per belt tier
- **Durability:** gear flagged damaged on death; broken = non-functional
- **Alert system:**
  - enemies alert on correct triggers per AlertProfileDef
  - alerted enemies never de-alert
  - searching behavior fires on player lost
  - alerted enemies pursue across subarea boundaries
- **Subarea activation:**
  - enemies outside the active subarea do not take turns or pathfind
  - vents outside the active subarea do not spawn
  - alerted enemies are exceptions to sleeping rule
- **Connector types:** Airlock traversal turn cost applies; spawn trigger fires correctly; Collapsed is one-way
- **Exfil system:** all 5 types function; alert-level conversion fires; player-influence conversion fires
- **Status effects:** all 6 apply bidirectionally; stack rules respected; resistances apply
- **Boss framework:** all 5 pillars tested per boss
- **Station Depth:**
  - per-class depth tracked and persisted correctly
  - extraction increments depth progress; death applies correct setback per difficulty mode
  - biome availability respects depth_min/depth_max per BiomeDef
  - narrative labels display correctly at each depth threshold
- **FIR rules:**
  - items picked up in-run are FIR-tagged
  - FIR tag lost on death; cleared on extraction
  - items in stash are never FIR
  - run-exclusive materials cannot be purchased from vendors
- **Post-run flow:**
  - debrief screen shows correct objectives, items, rewards, depth progress, stats
  - item review screen correctly places items into stash
  - death summary shows correct loss/retain breakdown per difficulty mode
- **Objectives:**
  - all 6 objective types complete correctly
  - failable objectives (escort, survival) fail permanently on condition broken
  - auto-complete and requires-interact modes both work
  - secondary objectives hidden until discovered
  - on_complete_effects and on_fail_effects fire correctly
- **Vendors:**
  - vendor inventory fixed on spawn; does not refresh
  - prices scale correctly with Station Depth
  - vendor-exclusive items not available at base
  - field repair available at Gunsmith vendors only
  - all defs load by ID
  - missing ID fails gracefully with clear error
- Post-1.0 mod overlay (Phase 2):
  - override applied correctly
  - invalid JSON is rejected without crashing

---

## 12) First Sprint (get fun fast)
Goal: a playable prototype where extraction is tense and goals feel like missions.

Sprint tasks:
1) M1 Turn engine + grid movement
2) M2 Primary weapon (Coil Pistol)
3) M3 Passive weapon (Arc Thrower)
4) M4 Spawn vents + SealVents objective + subarea scaffolding
5) M4.5 Run timer escalation (T80/T140/T200)
6) M4.75 Goal package UI + tracking (Vent Seal + Purge) + pre-run draft screen
7) M5 Hot exfil countdown (12 turns) with alarm spawns
8) Minimal post-run summary (currency + materials)
9) iOS control prototype + PC numpad movement

Definition of Done:
- A run that lasts 5–10 minutes, includes a clear mission goal, ramps difficulty over time, and ends in a tense extraction event with meaningful loot output into a basic stash.

---

## 13) Brainstorm Backlog (living list)

### 13.1 Extraction + Economy
- Exfil types distribution per biome: Quiet vs Hot vs Conditional weighting
- Emergency exfil exact cost (open decision)
- Exfil abort cost: what is spent (currency, item, alert spike, durability)
- Bulk/encumbrance thresholds and exact penalties (move cadence, exfil timer, alert gain)
- FIR nuances:
  - which items require FIR for base upgrades
  - whether crafting consumes FIR or converts it
- Insurance-lite system (PvE-friendly): recovery drone contracts, time-delayed returns
- Loot container taxonomy (electronics cache, armory locker, bio crate) + spawn weights
- Vendor design:
  - fixed vendors vs rotating "black market" terminal
  - sell value curves, buyback rules, anti-hoarding mechanics
- Economy sinks beyond v1: cosmetic unlocks, map-wide intel packages, contraband items

### 13.2 Run Timer Escalation (T80/T140/T200)
- Baseline modifier values per alert tier:
  - spawn_rate_mult, elite_chance_add, hazard_intensity_add, vent_activation_add
- Escalation stacking model:
  - additive vs multiplicative with Station Depth
- Late-tier "panic events":
  - lockdown doors, vent surge, elite wave, hazard pulse

### 13.3 Goals / Mission System
- Expand Goal Package catalog beyond v1:
  - Escort payload, Holdout, Capture points, "Retrieve and defend"
- Secondary objectives and reward multipliers:
  - "Extract with X FIR items", "No damage taken after Alert 2", "Seal vents within 120 turns"
- Goal weighting rules by Station Depth + player progression
- Mission-specific map generation hooks:
  - guaranteed boss arena room, guaranteed vault room, guaranteed uplink rooms
- Mission modifiers:
  - "Low power" (lights out, reduced vision), "Toxic leak" (hazard bias), "Security sweep" (elite patrols)

### 13.4 Base Building (modules + upgrade web)
- Define Base Module tiers (T1–T3) and what each tier unlocks
- Standardize material taxonomy: raw junk → refined components (Fabricator)
- Crafting recipe library (Workshop, Med Bay, Gunsmith)
- Stash expansion pacing + special containers (mod case, material crate)
- Station Depth effects list + caps
- "Mastery-on-extract" track:
  - which upgrades require successful extracts (not just materials)
- Recovery Drone tier % values (open decision)

### 13.5 Combat Systems
- Weapon targeting rules:
  - weapon decides which input it uses (direction vs target lock vs tile)
  - Pulse Beam is Prism/splitting (not chain); Arc Thrower owns chain lightning
- Projectile/beam abstraction and LoS rules (what ignores walls)
- Enemy AI scalability strategy:
  - pathing cache rules, fallback behaviors in crowds
- Weapon upgrade trees:
  - node caps (6–10 v1), parts economy sizing (12–20 parts), respec policy
- Status effect interaction matrix:
  - freeze + shatter combo damage values
  - EMP + mechanical enemy behavior rules
  - bleed + shock simultaneous application

### 13.6 Spec System Design
- Full spec lists for all 4 classes × 4 branches × 3 specs + capstone
- Generic spec pool contents per class
- Spec draft trigger conditions (what key moments offer specs)
- Capstone interaction testing (cross-slot rules need careful review)
- Branch unlock node list in base upgrade web

### 13.7 Utility Items
- Full utility item catalog for v1
- Ammo type variants per weapon family
- Trap placement rules (friendly fire? entity size restrictions?)
- Tool interaction rules (door override: one-use or charges? grapple: diagonal movement?)

### 13.8 Content & Presentation
- Boss designs (1 per biome): unique phases, arena layouts, map effects
- Boss Hunt GP1 boss placement rules
- Art style targets and readability rules (low-HP swarm clarity)
- Tutorial/onboarding plan (teach extraction + inventory pressure fast)
- Biome visual identity rules

### 13.9 Technical / Production
- Save versioning + migration plan
- Performance profiling targets (max enemies, max vents)
- Telemetry hooks:
  - average extract time, deaths by alert tier, loot retained by difficulty mode
- Automated tests for:
  - turn determinism, FIR correctness, goal completion, escalation thresholds, alert state transitions
- Localization table format and tooling
- Durability stage values by rarity (open decision — needs playtesting)
- Passive Slot II Station Depth gate values (open decision)
- Station Depth extraction thresholds per class per level (open decision — needs playtesting)
- Weapon family definitions (open decision — needed before M5.5)
