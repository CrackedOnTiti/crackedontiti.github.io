---
title: Sentinel
slug: sentinel
status: featured
order: 1
role: Lead developer (chose the stack, built most of the platform)
team: 2
period: Mar – Jul 2026
stack: [Python, Redis, PostgreSQL, scikit-learn, XGBoost, TensorFlow/Keras, Zeek, Filebeat, FastAPI, Docker, WireGuard, Raspberry Pi, Ollama]
closedSource: proprietary
tag: "Internship · 2026"
monogram: "SN"
tagline: "ML network threat detection for small businesses."
intro: "Commercial detection tools cost six figures a year or ship your traffic abroad. Sentinel watches client networks from a small on-site tap and only spends heavy compute on what actually looks wrong."
flow:
  - "Pi tap · WireGuard"
  - "Zeek + syslog"
  - "Redis"
  - "Isolation Forest"
  - "XGBoost"
  - "Autoencoder"
  - "PostgreSQL"
  - "Dashboard + local analyst"
flowNote: "Only events the Isolation Forest flags go on to XGBoost and the autoencoder. Normal events go straight to PostgreSQL."
highlights:
  - "Chose the stack and drove the technical decisions"
  - "Built the cascade and per-client workers on Redis"
  - "Set up biweekly retraining with live model hot-swap"
  - "Designed the database: one PostgreSQL schema per client"
  - "Built the client dashboard"
state: "In use at Interface Numérique"
media:
  - image: ../../assets/projects/sentinel/sentinel-dashboard.webp
    alt: "Sentinel dashboard, in French, for the invented client \"Demo SME\": four tiles (184,237 packets processed, 41 anomalies detected, 2 alerts in 24 hours, average threat score 3.12), a 7-day chart of traffic and anomalies, and a live feed of connections."
    caption: "Dashboard, 7 days, with invented demo data (Demo SME)."
  - image: ../../assets/projects/sentinel/sentinel-dashboard-24h.webp
    alt: "The same dashboard switched to the 24-hour view: hourly traffic with a spike of anomalies late in the period, above the live connection feed. All data invented (Demo SME)."
    caption: "Dashboard, 24 hours, with invented demo data (Demo SME)."
  - image: ../../assets/projects/sentinel/sentinel-anomalies.webp
    alt: "Anomalies page for the invented client \"Demo SME - Annexe\" (318 anomalies): cards such as periodic HTTP beaconing, port scan, SSH brute force and RDP attempts, each with a severity colour and score, source and destination, protocol, the model that flagged it (XGBoost, Isolation Forest or autoencoder), a status and a \"Generate AI advice\" button."
    caption: "Anomaly cards with invented demo data (Demo SME - Annexe)."
  - image: ../../assets/projects/sentinel/sentinel-anomalies-conseil.webp
    alt: "The \"Conseil Sentinel-IA\" advice popup for an invented alert on host demo-pc-07: what the alert means, four recommended actions and a priority, ending with a note that it is demonstration text and no AI model was called."
    caption: "AI-advice popup with invented demo text (Demo SME); no model was called."
summary: ML network threat detection for SMEs, built during my internship at Interface Numérique. Raspberry Pi sensors, a three-model detection cascade, and plain-language reports from a local model.
---

## Problem

Commercial network detection and response tools cost six figures a year, or send data abroad. SMEs
need detection that is affordable, sovereign and GDPR-friendly.

## What I built

I was hired to assist the developer on Sentinel and ended up driving the technical decisions and
most of the development. In a team of two developers, I built:

- the capture pipeline on the sensors (the tap hardware and casing were the other intern's work);
- the continuous-learning loop: retraining on each client's own traffic and hot-swapping models
  without restarting the service;
- the database design: PostgreSQL with one schema per client, for tenant isolation;
- the live client dashboard;
- the product positioning.

## How it works

<div data-diagram="sentinel"></div>

**Sensors.** Raspberry Pi network taps at client sites mirror traffic one way over a WireGuard
tunnel. Zeek and Filebeat produce the network logs; syslog covers host monitoring.

**Detection cascade.** Events arrive in Redis. A core process parses and routes Zeek and syslog
events, and an Isolation Forest sweeps all of them. Only flagged events go on to a per-client Redis
queue, where worker processes run XGBoost (multiclass, pre-trained on UNSW-NB15) and then an
autoencoder (7→16→8→4→8→16→7, flagging reconstruction error above mean + 2σ). Normal events go
straight to PostgreSQL, and the anomalies the autoencoder confirms are written there too. The cheap
model sees everything; the expensive models only see what looks suspicious, which means fewer false
positives.

**Storage.** PostgreSQL is where all the data ends up, with one schema per client for tenant
isolation. The dashboard and the analyst model both read from it.

**Continuous learning.** The Isolation Forest and the autoencoder retrain on each client's own
traffic every two weeks (cron), and the new models are hot-swapped without restarting the service.

**Analyst.** A local Llama 3–based model, fine-tuned on Zeek reports and served with Ollama, writes
plain-language reports for non-technical clients. A priority queue serves reports first and chat
second; chat is rate-limited. No third-party AI API is involved.

**Dashboard.** Clients get a live web interface, with the option to isolate a suspicious machine
remotely.

## Results

Sentinel is in use. Deployment details and results are confidential to Interface Numérique.

Sentinel is proprietary. This architecture write-up and the dashboard screenshots are published
with Interface Numérique's approval. The screenshots use invented demo data; there is no code and no
client data here.
