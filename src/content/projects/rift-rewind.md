---
title: Rift Rewind
slug: rift-rewind
status: featured
order: 3
role: Backend and cloud lead
team: 3
period: Oct – Nov 2025
stack: [Python, Flask, AWS Elastic Beanstalk, DynamoDB, Amazon Bedrock, Claude, LangChain]
links:
  devpost: https://devpost.com/software/jinx-s-workshop
  repo: https://github.com/CrackedOnTiti/rift-rewind
tag: "Hackathon · $1,000 prize"
monogram: "RR"
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
media:
  - image: ../../assets/projects/rift-rewind/rift-rewind-coaching.png
    alt: "Vi's coaching session page: the recent matches column (empty) and the AI coach chat panel with its opening greeting."
    caption: "Coaching session page, run locally without API keys; the greeting is static text."
  - image: ../../assets/projects/rift-rewind/rift-rewind-card-demo-no-art.png
    alt: "Player card rendered by the project's own card generator with demo inputs: golden border, level and rank circles, and an info panel for \"DemoPlayer\"; no champion artwork."
    caption: "Player card from the project's renderer, with demo inputs and no artwork."
summary: AI League of Legends coach that remembers each player across sessions. Won the Roast Master 3000 Prize ($1,000) at the AWS × Riot Games Rift Rewind hackathon.
---

## Problem

Stat dumps don't coach anyone. The goal was a coach that holds a conversation, remembers what a
player struggled with, and checks whether the advice was applied.

## What I built

I was the backend and cloud lead in a team of three:

- the Python/Flask backend and its AWS deployment (Elastic Beanstalk, DynamoDB, Bedrock);
- the AI layer: Claude via Bedrock, LangChain tool calling and per-player memory;
- the database architecture;
- CLI testing tools.

## How it works

<div data-diagram="rift-rewind"></div>

The coach builds a profile of each player across sessions, remembers past issues and checks
whether advice was applied, as a conversation rather than a stat dump. It has a Coach mode and a
Roast mode, an interactive Summoner's Rift map and shareable player cards.

## Results

Won the **Roast Master 3000 Prize ($1,000)** at the AWS × Riot Games Rift Rewind hackathon. Most
entries competed on statistics; this one won on personality and coaching quality.
