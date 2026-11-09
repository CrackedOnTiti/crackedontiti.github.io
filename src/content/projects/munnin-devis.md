---
title: Munnin Devis
slug: munnin-devis
status: building
order: 1
role: Solo
team: 1
period: In progress
stack: [Rust, Tauri v2, SQLite, Typst, Svelte 5, TypeScript]
hideRepoUntil: beta 0.8 is public (then add links.repo https://github.com/CrackedOnTiti/Munnin-devis)
summary: Free, open-source (AGPL-3.0), offline-first quote and invoice manager for French freelancers and small businesses. No account, no cloud, no telemetry; the data stays on your computer.
---

Quotes, invoices, deposits and credit notes with sequential legal numbering, plus a dashboard of
revenue, unpaid and late invoices. Linux and Windows installers. The core logic lives in a separate
crate, with test suites, CI on every pull request, a tagged release pipeline and documented legal
research. Next: an Overleaf-style template editor with live preview that checks the legal mentions
stay present.

Why: invoicing is a legal obligation, not a premium feature, and existing tools charge monthly and
lock the look of your documents.

PDF invoices only; not an e-invoicing platform under the 2027 reform.
