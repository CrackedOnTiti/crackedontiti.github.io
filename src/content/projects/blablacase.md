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
media:
  - image: ../../assets/projects/blablacase/blablacase-website.png
    alt: "BlaBlaCase website at desktop size, in French: hero reading \"Covoiturez vers Pas de la Case. Calculez vos droits de douane.\", a Google Play badge and three feature cards."
    caption: "Project website, desktop."
  - image: ../../assets/projects/blablacase/blablacase-website-phone.png
    alt: "The same website on a phone-sized screen: hero, Google Play badge and the first feature card."
    caption: "Project website, phone size."
summary: Android app that helps travellers coordinate shared trips to Andorra with up-to-date legal allowance figures. Unfinished and on hiatus, rewrite planned.
---

BlaBlaCase helps travellers coordinate shared trips to Pas de la Case (Andorra) with up-to-date
legal allowance figures. It doesn't help anyone get around customs law: users are responsible for
what they bring back.

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
