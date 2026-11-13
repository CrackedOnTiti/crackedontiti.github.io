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
writeup: true
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

## What it is

Every player gets their own synced interface, with private messaging between players and with the
GM, and the GM can silently control dice outcomes. The campaign's rules (not the app) are built
around interrupting other players' turns, trading risk for reward. The real lesson was shipping to
real users: continuous feedback, bug reports and feature requests during play.

## What it does

- **Live sync.** One WebSocket per client, reconnecting every 3 seconds if it drops. The GM edits
  each character's HP and stamina live (−1, −5, −15, −30, set, deduct, max), and new characters and
  players' online status reach the GM's dashboard without a reload.
- **Messaging.** GM-to-player chat in three modes (RP, HRP and a "???" lore mode), private
  player-to-player messages that the GM doesn't receive, and group messages from the GM to any set
  of players.
- **Dice.** d6, d10, d20 and d100. The GM sees every roll live and can set a hidden constraint on
  any player's dice or their own: force a die type, map the result into a range, fix it, or keep
  it in the upper half. It's applied on the server, and players are never told.
- **Character state.** Money with player-to-player transfers and a balance check, an inventory both
  sides can edit, notepads, abilities with an HP or stamina cost the GM applies in one click,
  special counters, and change requests the GM approves, rejects or edits with a note.

## How I built it

It started as Python/Flask with Flask-SocketIO and PostgreSQL, then gained a Flutter Web frontend
in a third container. On 30 April 2026 I rewrote it as a single Rust binary (Axum, Tokio, sqlx with
SQLite) and a vanilla HTML/CSS/JS frontend with no build step. Two days later every old feature was
back. One app container instead of three.

Today it's about 5,000 lines of hand-written code (2,432 Rust, 1,587 JavaScript, 647 HTML, 344
CSS): 19 HTTP routes, 21 inbound WebSocket event handlers and 11 SQLite tables. Accounts use
bcrypt-hashed PINs and session tokens in an `HttpOnly`, `SameSite=Lax` cookie, with Axum extractors
separating player and host routes.

## Hard problems

### Live fan-out that respects roles

One in-memory hub maps each user to their socket and sends to a user, a character, the host, all
players or everyone. Every inbound event is dispatched on its type *and* the sender's role, so a
player client can't trigger host actions even with crafted messages. Private messages go only to
the sender and receiver.

### Hidden dice control that still looks random

The first version let the GM overwrite a roll in plain sight. Now the raw roll stays random and a
constraint *maps* it into the allowed range instead of pinning it to one value, so constrained
rolls still vary. The player and the GM only ever see the final number.

### Changing a live campaign's database without a migration tool

Tables are created if missing, and new columns are added with `ALTER TABLE … ADD COLUMN`, ignoring
the error when the column already exists. The campaign's data survived every upgrade.

### Credentials that wouldn't change

Changing the host PIN in the environment had no effect, because account seeding only inserted
missing accounts. Seeding became an upsert, so credentials are reset from the environment on every
start.

## Feedback from real players

I logged my players' feedback and critiques as GitHub issues and worked through them between
sessions:

- [#1 Money](https://github.com/CrackedOnTiti/Dnd_TIH/issues/1): the feedback became a spec
  (currency conversion, balance display, transfers between players, host-only grants) and shipped
  in four commits on 6 March 2026.
- [#2 Clean up code](https://github.com/CrackedOnTiti/Dnd_TIH/issues/2): closed by a cleanup on 21
  March 2026.
- [#3 Action menu](https://github.com/CrackedOnTiti/Dnd_TIH/issues/3) and
  [#4 Layout redesign](https://github.com/CrackedOnTiti/Dnd_TIH/issues/4): still open, the backlog
  the campaign ended with.

## What I'd do differently

- Add automated tests, starting with the dice constraints and money transfers.
- Run a money transfer as one transaction instead of two separate updates.
- The UI is French-only; the code and comments are in English.
