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
    title: 'VigilanSee concept',
    desc:
      'Everything runs on the server side; nothing is installed on the player’s machine. Player behaviour on the ' +
      'game server builds a behavioural fingerprint per player that survives team changes. The same signals flag ' +
      'cheating, griefing and coordinated trolling, which feed community moderation.',
    caption: 'Concept view of a project in progress. Stack: Rust, PostgreSQL, Docker, REST API.',
    steps: [
      { box: { title: 'Game server (CS2 first)', sub: 'nothing installed on the player’s machine' } },
      { edge: 'player behaviour', box: { title: 'Behavioural fingerprint per player', sub: 'survives team changes', kind: 'hot' } },
      {
        row: [
          { title: 'Cheating', sub: 'aim-lock, pre-aiming through walls' },
          { title: 'Griefing', sub: 'team flashes, molotovs' },
          { title: 'Trolling', sub: 'coordinated' },
        ],
      },
      { box: { title: 'Community moderation' } },
    ],
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
