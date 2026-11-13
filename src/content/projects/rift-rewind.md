---
title: Rift Rewind
slug: rift-rewind
status: featured
order: 3
role: Backend and cloud lead
team: 3
period: Oct – Nov 2025
stack: [Python, Flask, AWS Elastic Beanstalk, DynamoDB, SQLite, Amazon Bedrock, Claude, LangChain]
links:
  devpost: https://devpost.com/software/jinx-s-workshop/
  video: https://www.youtube.com/watch?v=93rt1HThGxk
  repo: https://github.com/CrackedOnTiti/rift-rewind
tag: "Hackathon · $1,000 prize"
monogram: "RR"
# The team's own artwork: the hanging sign from the landing page.
logo: ../../assets/projects/rift-rewind/rift-rewind-sign.png
tagline: "An AI League of Legends coach that remembers you."
intro: "Won the Roast prize at the AWS × Riot Games hackathon. A coach you can argue with: it remembers your recent conversations and can pull up your recent matches."
flow:
  - "Riot API"
  - "Flask backend"
  - "Claude on Bedrock"
  - "Tool calls"
  - "DynamoDB memory"
highlights:
  - "Led backend and cloud: Elastic Beanstalk, DynamoDB, Bedrock"
  - "Built the AI layer: tool calling and per-player memory"
  - "Database architecture and CLI testing tools"
state: "Shipped · prize winner · demo offline (video available)"
cover:
  image: ../../assets/projects/rift-rewind/rift-rewind-banner.webp
  alt: "Rift Rewind banner: the team's graffiti-style title, \"Jinx's Magical Rewind Machine\", sprayed over an overhead view of Summoner's Rift."
media:
  - image: ../../assets/projects/rift-rewind/rift-rewind-map-zones.webp
    alt: "Interactive map for the player \"sad and bad#2093\": Summoner's Rift with a glowing marker on each zone, a \"0 / 8 zones discovered\" counter and a monkey-bomb counter."
    caption: "Interactive map: each glowing marker opens that zone's story."
  - image: ../../assets/projects/rift-rewind/rift-rewind-coach-dragon.webp
    alt: "Zone story titled \"Dragon Soul\": the AI notes 7 dragons secured but 3 deaths in dragon fights and a 22% control rate, and advises warding the pit 90 seconds before spawn and tracking the enemy jungler."
    caption: "AI-written zone story for the dragon pit."
  - image: ../../assets/projects/rift-rewind/rift-rewind-coach-overview.webp
    alt: "Zone story titled \"Overview\": the AI notes a 50% win rate and a 3.08 KDA in the mid lane on Akali and Ahri, and suggests roaming to the side lanes after shoving waves."
    caption: "AI-written overview of the player's games."
  - image: ../../assets/projects/rift-rewind/rift-rewind-player-card.webp
    alt: "\"All zones discovered!\" screen unlocking the player card: level 21, a rank badge, Akali splash art, the name \"sad and bad\", the AI-written title \"Rising Shadow\" and a short AI-written line."
    caption: "Player card, unlocked once every zone is discovered."
  - image: ../../assets/projects/rift-rewind/rift-rewind-landing-live.webp
    alt: "Landing page: the team's hanging sign, a Riot ID form (summoner name, tag, region), Coach Mode and Roast Mode cards, an \"Ignite the Rewind\" button and a \"Vi's direct coaching\" shortcut."
    caption: "Landing page."
mediaNote: "I don't own or work for Riot Games. Any Riot artwork shown here appears because this project was built for the Rift Rewind hackathon they hosted."
summary: AI League of Legends coach that remembers each player across sessions. Won the Roast Master 3000 Prize ($1,000) at the AWS × Riot Games Rift Rewind hackathon.
---

## Problem

Stat sites show KDA, CS and damage, but they don't talk you through your games or remember what
you discussed last time. The goal was a coach you can argue with: it remembers your recent
conversations and can pull up your recent matches.

## What it does

- **Interactive map.** Click a zone of Summoner's Rift, such as top lane, the jungle or the dragon
  pit, and get feedback on that area in Coach or Roast mode.
- **Conversational coach.** Chat with Claude Sonnet 4.5, which remembers your recent conversations
  and can query your match history on demand.
- **Player cards** with an AI-written title, such as "Rising Shadow", unlocked once every zone is
  discovered.

## What I built

I was the backend and cloud lead in a team of three:

- the Flask auth and AI-coach endpoints, plus backend integration, deployed on AWS Elastic
  Beanstalk;
- the data layer: DynamoDB for players, matches, sessions and conversations, SQLite for static
  League reference data (champions, items, runes);
- the AI layer: Claude Sonnet 4.5 on Amazon Bedrock through LangChain, with tool calling over
  champion, item and rune data (SQLite, synced from Data Dragon) and the player's stored match
  history (DynamoDB);
- per-player conversation memory in DynamoDB;
- CLI testing tools.

## How it works

<div data-diagram="rift-rewind"></div>

The coach chat runs 8 tools behind a tool-calling loop capped at 10 rounds, with exponential
backoff on Bedrock throttling.

## Design notes

### DynamoDB tables

Per-entity tables keyed by PUUID, with a `RiotIdIndex` GSI on Players and a `TimestampIndex` LSI
on MatchHistory, on on-demand billing.

### Bounded memory

Every exchange is stored in DynamoDB. Each request only carries short excerpts from the player's
3 most recent conversations, so the prompt size stays bounded.

### Zone stories on demand

Zone stories are generated on demand when the player clicks a zone.

## Results

Won the **Roast Master 3000 Prize ($1,000)** at the AWS × Riot Games Rift Rewind hackathon.
