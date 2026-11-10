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
intro: "Most entries competed on statistics. Ours won the Roast prize at the AWS × Riot Games hackathon by being a coach you can actually argue with: it remembers your past games and checks whether you applied its advice."
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
state: "Shipped · prize winner"
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

Stat dumps don't coach anyone. Sites like op.gg show KDA, CS and damage, but not the story of a
game, and they don't remember that three games ago you struggled with early jungle invades. The
goal was a coach that holds a conversation, remembers what a player struggled with, and checks
whether the advice was applied.

## What it does

- **Interactive map.** Click a zone of Summoner's Rift, such as top lane, the dragon pit or the
  enemy jungle, and get feedback on that area in Coach or Roast mode.
- **Conversational coach.** Chat with Claude Sonnet 4.5, which remembers previous sessions and can
  query the player's match history in real time.
- **Shareable player cards** with AI-written titles such as "The Scaling Menace" or "The 0/10
  Powerspike Enthusiast".

## What I built

I was the backend and cloud lead in a team of three:

- the Python/Flask backend, deployed on AWS Elastic Beanstalk;
- the data layer: DynamoDB for player conversations and dynamic data, SQLite for static League
  reference data (champions, items, runes);
- the AI layer: Claude Sonnet 4.5 on Amazon Bedrock, with a custom LangChain tool-calling system
  that gives it champion counters and matchups, build and item statistics, the player's match
  history and per-zone performance;
- per-player conversation memory in DynamoDB;
- CLI testing tools.

## How it works

<div data-diagram="rift-rewind"></div>

The coach builds a profile of each player across sessions, remembers past issues and checks
whether advice was applied, as a conversation rather than a stat dump.

## What we learned

### Fewer, better tools

The first version gave Claude too many tools: it called ten or more functions per response,
burning tokens and money. We consolidated related queries into single tools, pre-fetched common
data into the context, and used the tool descriptions to guide its choices.

### One DynamoDB table

Moving to a single-table design, with conversations and matches stored under each player's key,
cut the number of tables from five to one and query latency by 60%.

### Memory that stays affordable

Storing every message got expensive. A sliding window keeps the last 10 messages in DynamoDB and
has Claude summarise older ones into compact metadata: an 80% cost reduction, with the context
kept.

### Concurrent conversations

Two chats at the same time could overwrite each other's history. DynamoDB conditional writes with
version numbers fixed it.

### Roast mode, tuned

Early testers found the roasts too savage. The system prompt now asks for humour that stays
constructive, and zone stories are generated on demand when the player clicks a zone.

## Results

Won the **Roast Master 3000 Prize ($1,000)** at the AWS × Riot Games Rift Rewind hackathon. Most
entries competed on statistics; this one won on personality and coaching quality.
