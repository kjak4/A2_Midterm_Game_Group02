# Through the Trees — Group 2A 

## Game Concept and Mechanics

*Through the Trees* is a side-scrolling platformer. A player needs to reach their home located in a remote mountainside village before dark, after getting off a train deep in the forest. The player moves her right using **A / D**, jumps with **Space or W**, and must navigate through trees and past a bear. 

### Core Mechanic — Control Flip (ABI Spatial Disorientation)

At specific world positions, the left and right controls silently swap. Pressing D suddenly moves the player left instead of right. The flip lasts a few seconds, then snaps back. A red border flashes as a warning just before each flip triggers.

This mechanic represents Acquired Brain Injury (ABI) — specifically the spatial disorientation and disrupted motor-direction mapping that can follow a brain injury (ex. reaching with a different limb than you meant to; body is received mismatched brain signals). The disability is embedded in the control system itself: removing the flip mechanic would make the game mechanically different because the entire challenge is built around reacting to and recovering from misdirected movement. 

---

## Design Rationale

Affordances are clear through use of detail. Some examples include: (ie. foreground trees cover full screen and are one colour), clear areas and signposts help indicate the suggested direction, and the sky darkens toward dusk as the player progresses, reinforcing the urgency of reaching home in a timely manner. 

Breaking down Gameflow of the tutorial level:

| 0 — Open path | No obstacles. Player gets used to basic movement. |
| 1 — First direction flip (open air) | Flip triggers in a completely clear space. Player discovers the mechanic with zero punishment. |
| 2 — Obstacle weaving | A few stumps and rocks to dodge. No flips yet. |
| 3 — Flip near obstacles and wildlife | Flip fires mid-dodge. |
| 4 — Rabbit timing | Player learns to wait and time their movement. |
| 5 — Flip near wildlife | Flip fires while passing the rabbit. |
| 6 — Platforms appear | Player begins using space bar in tandem with A / D. |
| 7 — Flip on jumps | Flip fires while navigating jump-required obstacles. Hardest part as player needs to consider flip while mid air jumping, direction wise, and obstacle wise. |
| 8 — Exit | Path clears. Win. |

How ABI affects gameplay
*The flip mechanic:*
- Changes **control** — the player's learned muscle memory is suddenly wrong.
- Changes **decision-making** — during a flip, the player must consciously reverse their input, even mid-air.
- Affects **perception** — the mismatch between intention and outcome mirrors the disorientation ABI can cause.

Without the flip, the game is a straightforward side-scroller. With it, every section demands conscious re-evaluation of which key to press — which is the point.

---

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.
To play via GitHub Pages, visit the link pasted here:

| Key | Action |
|-----|--------|
| A | Move left (or right when flipped) |
| D | Move right (or left when flipped) |
| Space / W | Jump 

Dodge the obstacles (stationary and moving!), and navigate the terrain as platforms appear. Do this without losing all 3 lives and before the sun sets to make it to the next area.

---

## Iteration Changes from Playtesting

*(To be filled in after in-class playtesting session)*

- Observation notes will be added here.
- Any control timing, obstacle spacing, or flip duration adjustments will be documented.

---

## Assets

| File | Source |
|------|--------|
| `assets/sounds/music.mp3` | Taken from Pixabay - Sounds[1] |
| `assets/sounds/jump.mp3` | Taken from Pixabay - Sounds[2] |
| `assets/sounds/damage.mp3` | Taken from Pixabay - Sounds[3] |
| `assets/sounds/walking.mp3` | Taken from Pixabay - Sounds[4] |
| `assets/sounds/win.mp3` | Taken from Pixabay - Sounds[5] |

## References

[1] N2kStudio. 2023. Music for Game - Fun Kid game. Retrieved July 6, 2026 from https://pixabay.com/sound-effects/musical-music-for-game-fun-kid-game-163649/ 

[2] DRAGON-STUDIO. 2026. Cartoon Jump. Retrieved July 6, 2026 from https://pixabay.com/sound-effects/film-special-effects-cartoon-jump-463196/ 

[3] DRAGON-STUDIO. 2026. Hard Punch SFX. Retrieved July 6, 2026 from from https://pixabay.com/sound-effects/film-special-effects-hard-punch-sfx-515251/ 

[4] Kunal_Acharjee. 2024. walking sound. Retrieved July 6, 2026 from from https://pixabay.com/sound-effects/film-special-effects-walking-sound-268136/

[5] Higgs01 (Freesound). 2021. yay. Retrieved June 17, 2026 from https://pixabay.com/sound-effects/people-yay-6120/ 

Note: All illustrations were made by our group members, and that is why they are not referenced/sourced.

---

## File Structure

```
ASSIGNMENT2/
├── index.html          ← entry point
├── style.css           ← page layout and canvas styling
├── game.js             ← game logic, physics, flip mechanic, collision
├── scenes.js           ← all drawing functions
├── sketch.js           ← p5.js setup, draw loop, input handling
├── jsconfig.json       ← VS Code p5 type support
├── libraries/
│   ├── p5.min.js
│   └── p5.sound.min.js
└── assets/
    └── images/
        ├── banf.png    ← character sprite sheet
        └── bear.jpg    ← bear image
```