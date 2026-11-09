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
autoencoder (7→16→8→4→8→16→7, flagging reconstruction error above mean + 2σ). The cheap model sees
everything; the expensive models only see what looks suspicious, which means fewer false positives.

**Continuous learning.** The Isolation Forest and the autoencoder retrain on each client's own
traffic every two weeks (cron), and the new models are hot-swapped without restarting the service.

**Analyst.** A local Llama 3–based model, fine-tuned on Zeek reports and served with Ollama, writes
plain-language reports for non-technical clients. A priority queue serves reports first and chat
second; chat is rate-limited. No third-party AI API is involved.

**Dashboard.** Clients get a live web interface, with the option to isolate a suspicious machine
remotely.

## Results

Sentinel is in use. Deployment details and results are confidential to Interface Numérique.

Sentinel is proprietary. This architecture write-up is published with Interface Numérique's
approval; there is no code and no client data here.
