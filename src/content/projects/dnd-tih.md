---
title: DnD_TIH
slug: dnd-tih
status: built
order: 2
role: Solo
team: 1
period: Nov 2025 – May 2026
stack: [Rust, Axum, SQLite, JavaScript, HTML/CSS, Docker]
links:
  repo: https://github.com/CrackedOnTiti/Dnd_TIH
tag: "Personal"
tagline: "A real-time companion app for a homebrew tabletop campaign."
intro: "Built for my own campaign set in my Tempered in Hate universe, where the tabletop rules reward interrupting other players' turns. The app gives every player a synced interface and keeps the game master in control."
highlights:
  - "Private messaging between players, and with the game master"
  - "Game master sees every roll live and can silently constrain any player's dice server-side (forced die, range, fixed result, upper-half only)"
  - "Used through a full campaign, with player feedback tracked as GitHub issues and worked through between sessions"
state: "Finished · campaign completed"
media:
  - image: ../../assets/projects/dnd-tih/dnd-tih-host-player-detail.png
    alt: "Game master's view of one player, in French: HP and stamina controls (−1, −5, −15, −30, set, deduct, max), capacities, inventory and money, with the player's chat message in the side panel."
    caption: "Game master's view of a player. Demo accounts, invented characters."
  - image: ../../assets/projects/dnd-tih/dnd-tih-host-live-rolls.png
    alt: "Game master dashboard: player list with HP, stamina and money, the live rolls bar showing each player's d20, and the game master's own roll."
    caption: "Players' dice rolls reach the game master live."
  - image: ../../assets/projects/dnd-tih/dnd-tih-player-inventory.png
    alt: "Player screen, inventory tab, with two items added; the HP bar reads 85/100 after the game master applied −15."
    caption: "Player inventory; the game master's −15 HP arrived without a reload."
  - image: ../../assets/projects/dnd-tih/dnd-tih-player-roll.png
    alt: "Player screen after rolling a d20 (\"Votre jet\": 3): character sheet, HP and stamina bars, dice panel and money."
    caption: "Player sheet after a d20 roll."
summary: Real-time companion app for a homebrew tabletop campaign set in my own universe, Tempered in Hate. My group used it through a full campaign.
---

Every player gets their own synced interface, with private messaging between players and with the
GM, and the GM can silently control dice outcomes. The campaign's rules (not the app) are built
around interrupting other players' turns, trading risk for reward. The real lesson was shipping to
real users: continuous feedback, bug reports and feature requests during play.
