// Diagram content. Every label must trace back to docs/CONTENT_BRIEF.md.

export const specs = {
  sentinel: {
    id: 'sentinel-diagram',
    title: 'Sentinel detection pipeline',
    desc:
      'Raspberry Pi taps and host syslog at the client site send logs over a one-way WireGuard tunnel into Redis. ' +
      'An Isolation Forest sweeps every event. Normal events go straight to PostgreSQL. Flagged events go to a ' +
      'per-client Redis queue, where workers run XGBoost and then an autoencoder; anomalies are written to PostgreSQL. ' +
      'PostgreSQL holds all the data, with one schema per client; the client dashboard and the local analyst model ' +
      'read from it. Separately, the Isolation Forest and the autoencoder retrain on each client\u2019s traffic every ' +
      'two weeks and are hot-swapped.',
    caption:
      'Cheap model on everything, expensive models only on what looks suspicious. The red boxes are the detection cascade.',
    steps: [
      {
        row: [
          { title: 'Raspberry Pi tap', sub: 'Zeek + Filebeat' },
          { title: 'Hosts', sub: 'syslog' },
        ],
      },
      { edge: 'WireGuard, one-way', box: { title: 'Redis', sub: 'ingestion' } },
      { box: { title: 'Isolation Forest', sub: 'sweeps every event', kind: 'hot' } },
      {
        split: {
          left: { edge: 'normal events' },
          right: {
            edge: 'flagged',
            boxes: [
              { title: 'Per-client Redis queue' },
              { title: 'XGBoost', sub: 'multiclass, trained on UNSW-NB15', kind: 'hot' },
              { title: 'Autoencoder', sub: 'error > mean + 2\u03c3', kind: 'hot' },
            ],
            out: 'anomalies',
          },
        },
      },
      { box: { title: 'PostgreSQL', sub: 'all data, one schema per client' } },
      {
        row: [
          { title: 'Client dashboard', sub: 'live, remote isolation' },
          { title: 'Analyst model', sub: 'local Llama 3, Ollama' },
        ],
      },
      {
        detached: true,
        box: {
          title: 'Every two weeks (cron)',
          sub: 'Isolation Forest + autoencoder retrain on the client\u2019s traffic, hot-swapped',
          kind: 'note',
        },
      },
    ],
  },

  vigilansee: {
    id: 'vigilansee-diagram',
    title: 'VigilanSee analysis pipeline',
    desc:
      'Raw replay data (CS2 .dem files and match records) goes to a high-frequency parser that reads 128 ticks per ' +
      'second. A neural and algorithmic audit then runs biometric vector analysis of aim and movement, plus ' +
      'physics-based sabotage detection. The output is a forensic verdict: a risk score from 0 to 100 and an ' +
      'evidence-ready report.',
    caption: 'Everything runs on the server side; nothing is installed on the player\u2019s machine.',
    steps: [
      { box: { title: 'Raw replay data', sub: 'CS2 .dem files + match records' } },
      { box: { title: 'High-frequency parser', sub: '128 ticks per second' } },
      {
        box: {
          title: 'Neural and algorithmic audit',
          sub: 'biometric vector analysis of aim and movement + physics-based sabotage detection',
          kind: 'hot',
        },
      },
      { box: { title: 'Forensic verdict', sub: 'risk score 0\u2013100 + evidence-ready report' } },
    ],
  },

  'vigilansee-risk': {
    id: 'vigilansee-risk-diagram',
    title: 'Dynamic risk-factor attribution',
    desc:
      'A suspicion, from player reports or automatic detection, goes to the AI. The AI picks its tools through a ' +
      'light overview analysis, then assigns a risk factor that sets the analysis intensity: nothing, light, medium ' +
      'or heavy. The results feed back to the AI so it improves its choices.',
    caption: 'Heavy analysis only for players who warrant it.',
    steps: [
      { box: { title: 'Suspicion', sub: 'player reports or automatic detection' } },
      { box: { title: 'AI', sub: 'picks tools via a light overview analysis', kind: 'hot' } },
      { edge: 'risk factor', box: { title: 'Analysis intensity', sub: 'nothing \u00b7 light \u00b7 medium \u00b7 heavy' } },
      { box: { title: 'Results' } },
    ],
    loop: { from: 3, to: 1, label: 'improves its choices' },
  },

  'rift-rewind': {
    id: 'rift-rewind-diagram',
    title: 'Rift Rewind coach architecture',
    desc:
      'The web app (Coach and Roast modes, interactive map, shareable player cards) talks to a Python Flask backend ' +
      'on AWS Elastic Beanstalk. A LangChain agent with tool calling uses Claude through Amazon Bedrock and keeps a ' +
      'per-player profile and memory in DynamoDB.',
    steps: [
      { box: { title: 'Web app', sub: 'Coach and Roast modes, map, player cards' } },
      { box: { title: 'Flask backend', sub: 'AWS Elastic Beanstalk' } },
      { box: { title: 'LangChain agent', sub: 'tool calling', kind: 'hot' } },
      {
        row: [
          { title: 'Claude', sub: 'via Amazon Bedrock' },
          { title: 'DynamoDB', sub: 'player profile and memory across sessions' },
        ],
      },
    ],
  },

  glados: {
    id: 'glados-diagram',
    title: 'GLaDOS toolchain',
    desc: 'Source code in a C-like language is compiled by a Haskell compiler into custom bytecode, which a Haskell virtual machine executes.',
    steps: [
      { box: { title: 'Source', sub: 'C-like language' } },
      { box: { title: 'Compiler', sub: 'Haskell', kind: 'hot' } },
      { box: { title: 'Custom bytecode' } },
      { box: { title: 'Virtual machine', sub: 'Haskell', kind: 'hot' } },
    ],
  },
};
