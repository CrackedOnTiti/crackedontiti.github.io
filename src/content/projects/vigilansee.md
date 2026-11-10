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
tag: "End-of-studies · in progress"
monogram: "VS"
logo: ../../assets/projects/vigilansee/vigilansee-logo.png
tagline: "Anti-cheat that reads behaviour, not your hard drive."
intro: "No kernel driver, nothing installed on the player's machine. Each player gets a behavioural fingerprint that survives team changes, so aim-locking, pre-aiming through walls and deliberate team-griefing all stand out."
flow:
  - title: "Raw replay data"
    detail: "CS2 .dem files + match records"
  - title: "High-frequency parser"
    detail: "128 ticks per second"
  - title: "Neural and algorithmic audit"
    detail: "biometric vector analysis of aim and movement + physics-based sabotage detection"
  - title: "Forensic verdict"
    detail: "risk score 0–100 + evidence-ready report"
flowNote: "A developer API for sending match data directly is planned."
highlights:
  - "Modelling maths (shrinkage-based optimisation)"
  - "CI, Docker build checks and Dependabot"
  - "Architecture decision records and weekly devlogs"
state: "In development · CS2 first"
media:
  - image: ../../assets/projects/vigilansee/vigilansee-risk-factor.webp
    alt: "Diagram of dynamic risk-factor attribution: (1) a suspicion from player reports or automatic detection goes to the AI; (2, 3) the AI selects its tools through a light overview analysis; (4) it attributes a risk factor that sets the analysis intensity: nothing, light, medium or heavy; (5) the results feed back to the AI."
    caption: "Dynamic risk-factor attribution."
mediaHeading: "Design"
summary: Server-side behavioural anti-cheat and community moderation, CS2 first, designed to be game-agnostic. Nothing is installed on the player's machine.
---

## Problem

Detect cheating without a kernel-level, client-side anti-cheat. Everything runs on the server side,
and nothing is installed on the player's machine.

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

### Dynamic risk-factor attribution

<div data-diagram="vigilansee-risk"></div>

Not every player gets the same scrutiny. A suspicion, from player reports or automatic detection,
goes to the AI, which picks its tools through a light overview analysis and assigns a risk factor.
That factor sets how hard the analysis looks: nothing, light, medium or heavy. The results feed
back to the AI so its choices improve over time.

## Results

In progress. The weekly devlogs track where the project stands.
