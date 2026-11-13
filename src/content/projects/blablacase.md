---
title: BlaBlaCase
slug: blablacase
status: built
order: 3
role: Solo
team: 1
period: Apr 2026
stack: [Flutter, Python, Firebase, Docker]
links:
  repo: https://github.com/CrackedOnTiti/BlaBlaCase
logo: ../../assets/projects/blablacase/blablacase-logo.png
tag: "Personal"
tagline: "Shared trips to Andorra, with up-to-date legal allowance figures."
intro: "Helps travellers coordinate shared trips to Andorra with up-to-date legal allowance figures: each traveller's allowance for alcohol, tobacco and other goods, and the car's total. Unfinished; on hiatus, rewrite planned."
highlights:
  - "Customs rules scraped nightly from the official customs administration (DGDDI) site"
  - "Flutter Android app with a Python API and Firebase phone auth with SMS verification"
  - "Allowance calculator with group totals; allowance sharing in car chats partly built"
state: "On hiatus, rewrite planned"
writeup: true
media:
  - image: ../../assets/projects/blablacase/blablacase-website.png
    alt: "BlaBlaCase website at desktop size, in French: hero reading \"Covoiturez vers Pas de la Case. Calculez vos droits de douane.\", a Google Play badge and three feature cards."
    caption: "Project website, desktop."
  - image: ../../assets/projects/blablacase/blablacase-website-phone.png
    alt: "The same website on a phone-sized screen: hero, Google Play badge and the first feature card."
    caption: "Project website, phone size."
summary: Android app that helps travellers coordinate shared trips to Andorra with up-to-date legal allowance figures. Unfinished and on hiatus, rewrite planned.
---

## What it is

BlaBlaCase helps travellers coordinate shared trips to Pas de la Case (Andorra) with up-to-date
legal allowance figures. It doesn't help anyone get around customs law: users are responsible for
what they bring back.

## Current state

**Works, in the repository:** Firebase phone auth with SMS verification; the Python API and its
tooling; a scraper that reads the official customs administration (DGDDI) page every night; the
allowance calculator with group totals; a carpool board where drivers post trips, passengers
request a seat and the driver accepts or rejects them.

**Built, but not in the repository: allowance sharing** (20–21 April 2026). Members of a car
declare what they plan to bring back, ask each other to carry part of a share, and the group's
total is checked against the legal limits. The API side is deployed and live. The app side
(participants screen, cargo selectors, a cargo reminder in the car's chat, trade requests accepted
or declined in notifications and in chat) was built and tested on two of my accounts, but its
source was never committed and hasn't been found, and one bug was still open.

**Incomplete:** carpooling as a whole. Chat works by polling, and the app has no notifications, no
trip completion or cancel button and no ratings screen. The website's calculator is broken by a
wrong API domain.

On hiatus since April 2026: once the core worked, I judged that the codebase needed a full rewrite
rather than more patches.

## How it's built

A FastAPI API that verifies Firebase tokens, a Flutter Android app and a small website, with
PostgreSQL on Supabase. Docker Compose runs the API and the scheduler as separate containers, so
the nightly scrape never fires once per API worker. The API serves 14 allowance categories. The
repository holds about 1,360 lines of Python, 3,280 of Dart and 450 of HTML/CSS/JS.

## Hard problems

### Getting the customs figures right

The first scraper read the DGDDI page for returning from *any* non-EU country, which has the wrong
limits for Andorra (1 L of spirits, 200 cigarettes and 4 L of wine, instead of 1.5 L, 300 and
5 L). The rewrite targets the Andorra page, parses both its table and inline formats, normalises
units, and uses an ordered rule table so "extraits de café" doesn't become "café". A scraper that
ran without errors was still giving users the wrong legal limits.

### Modelling allowance sharing

Each member of a car declares what they plan to bring back and can ask a specific person to carry
part of a share; accepted requests change who carries what. The tricky part was the display: the
person carrying for someone else sees their total split ("1 L" for themselves, "0.5 L for X"), the
person receiving sees no extra line, and the group's total is checked against the limits. This
code isn't in the public repository, so this is the design, not something you can read there.

### Seats and membership in one transaction

Accepting or removing a passenger updates the seat count, switches the trip between open and full,
and posts the automatic chat message in a single transaction.

### Passwordless sign-in with minimal data

Firebase SMS sign-in, a token interceptor in the app, server-side verification, and a user row
created on the first API call. The app collects nothing beyond a phone number, a display name and
an age bracket.

## Lessons

- The allowance-sharing app code was never pushed, and the working copy is gone. The deployed API
  is the only surviving copy of the server side.
- Schema changes made by hand, without migrations, let the repository and production drift apart.
- No automated tests, and the app isn't on Google Play.

## What's next

1. Bring the deployed API source and its schema changes back into the repository.
2. Rebuild the allowance-sharing screens and fix the open bug.
3. Finish carpooling: trip completion, cancelling, ratings, real-time updates, notifications.
4. Fix the documented bugs, including the website's API domain.
