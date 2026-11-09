---
title: MunninVault
slug: munninvault
status: building
order: 2
role: Solo
team: 1
period: Since Jun 2026, rewrite in progress
stack: [Rust]
screenshot: ../../assets/projects/munninvault-graph.png
screenshotAlt: MunninVault graph view with demo data. Notes appear as linked nodes; the open note, Rainwater tanks, shows its fields, its text and four backlinks.
screenshotCaption: The alpha's graph view, cropped, with demo data.
summary: Voice-first private knowledge base. Speak or type on the go; the important parts (ideas, people, decisions, tasks) are extracted and merged into a graph of Markdown notes you can browse, edit and query.
---

Answers link back to the source notes, and the notes stay in open Markdown, with no lock-in. There
are personal and team versions; the team graph is split into sections per group.

The alpha validated the idea. A full rewrite is in progress, replacing AI calls with deterministic
maths where that is the better tool, and with proper documentation. Privacy is the design goal: the
target is AI running on Munnin's own servers or the client's, never a third-party provider. (The
prototype used cloud APIs.)
