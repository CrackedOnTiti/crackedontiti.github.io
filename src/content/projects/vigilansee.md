---
title: VigilanSee
slug: vigilansee
status: featured
order: 2
role: Modelling maths and project engineering
team: 4
period: In progress
stack: [Rust, PostgreSQL, Docker, REST API]
links:
  devlogs: https://github.com/CrackedOnTiti/VigilanSee/discussions
hideRepoUntil: README rewrite at the next merge (then add links.repo https://github.com/CrackedOnTiti/VigilanSee)
summary: Server-side behavioural anti-cheat and community moderation, CS2 first, designed to be game-agnostic. Nothing is installed on the player's machine.
---

## Problem

No kernel-level, client-side anti-cheat. Everything runs on the server side, and nothing is
installed on the player's machine.

## What I built

VigilanSee is our Epitech end-of-studies project (EIP), built by a team of four and planned to
continue as a business. My parts:

- the modelling maths, based on shrinkage-based optimisation;
- project engineering: CI, Docker build checks, Dependabot, architecture decision records (ADRs)
  and weekly devlogs.

## How it works

<div data-diagram="vigilansee"></div>

The idea is to build a behavioural fingerprint for each player that survives team changes, and to
detect cheating from behaviour rather than from the cheat binary. A player who aim-locks all game
and then empties a magazine into a wall stands out; so does one who pre-aims through walls and
skips the corner checks everyone else makes.

The same signals catch griefing, such as deliberately flashing or molotoving teammates, and
coordinated trolling.

## Results

In progress. The weekly devlogs track where the project stands.
