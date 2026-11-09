// Diagram content. Every label must trace back to docs/CONTENT_BRIEF.md.

export const specs = {
  sentinel: {
    id: 'sentinel-diagram',
    title: 'Sentinel detection pipeline',
    desc:
      'Raspberry Pi taps and host syslog at the client site send traffic logs over a one-way WireGuard tunnel ' +
      'into Redis. A core process parses and routes events; an Isolation Forest sweeps all of them. Flagged events ' +
      'go to a per-client Redis queue, where workers run XGBoost and then an autoencoder. Results land in ' +
      'PostgreSQL with one schema per client, feeding the client dashboard and a local analyst model served with Ollama. ' +
      'The Isolation Forest and autoencoder retrain on each client’s traffic every two weeks and are hot-swapped.',
    caption:
      'Cheap model on everything, expensive models only on what looks suspicious. The red boxes are the detection cascade.',
    steps: [
      {
        row: [
          { title: 'Raspberry Pi tap', sub: 'client site, Zeek + Filebeat' },
          { title: 'Host monitoring', sub: 'syslog' },
        ],
      },
      { edge: 'WireGuard, one-way mirror', box: { title: 'Redis ingestion' } },
      { box: { title: 'Core process', sub: 'parses and routes Zeek / syslog events' } },
      { box: { title: 'Isolation Forest', sub: 'sweeps every event', kind: 'hot' } },
      { edge: 'flagged events only', box: { title: 'Per-client Redis queue' } },
      { box: { title: 'XGBoost', sub: 'multiclass, pre-trained on UNSW-NB15', kind: 'hot' } },
      { box: { title: 'Autoencoder', sub: '7-16-8-4-8-16-7, flag if error > mean + 2σ', kind: 'hot' } },
      { box: { title: 'PostgreSQL', sub: 'one schema per client (tenant isolation)' } },
      {
        row: [
          { title: 'Client dashboard', sub: 'live, remote machine isolation' },
          { title: 'Analyst model', sub: 'local Llama 3 via Ollama, plain-language reports' },
        ],
      },
      {
        edge: 'every two weeks (cron)',
        box: {
          title: 'Retrain on the client’s own traffic',
          sub: 'Isolation Forest + autoencoder, hot-swapped without restarting',
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
