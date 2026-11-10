// Home page copy that is not a project or a role. Source: docs/CONTENT_BRIEF.md and the approved
// design (design-ref/portfolio-design-A.html). Projects and roles live in src/content/.

export const hero = {
  kicker: 'Cybersecurity · Systems · Applied ML',
  intro:
    'Epitech student specialising in security, on exchange at Beijing Institute of Technology until June 2027. I build detection systems, low-level tools and things that ship.',
  proof: ['ML threat detection in production', '$1,000 AWS × Riot hackathon prize', 'Real incident response'],
  caption: 'Toulouse → Beijing · open to internships from mid-2027',
};

export const about = {
  headline:
    'I like taking systems apart to see where they break, then building the thing that would have caught it.',
  body:
    'Fourth-year Epitech student, French and British, currently spending a year at BIT in Beijing. Native in French and English, learning Mandarin. My internship put me on a real ML detection platform and in front of a real incident, and that settled it: security is the job.',
  next: 'A 5th-year internship in security, part-time then full-time, from mid-2027. Pentest or detection.',
  later: 'Offensive security first, then leading security engagements and the people who run them.',
};

export const interests = [
  { title: 'Boxing', body: 'Retired, planning a comeback: amateur first, then pro.' },
  { title: 'Martial arts and philosophy', body: 'Same discipline, different arena.' },
  { title: 'Gym', body: 'Training regularly.' },
  { title: 'Gaming', body: 'Always. Probably why I build anti-cheat.' },
];

export const munnin = {
  kicker: 'Munnin · since Aug 2026',
  title: 'Auto-entrepreneur IT services',
  offers: [
    { title: 'Freelance work', body: 'Custom apps, hosting, infrastructure and repair for small businesses.' },
    {
      title: 'Open and closed-source SaaS',
      body: 'Local-first tools like Munnin Devis and MunninVault, built so your data stays yours.',
    },
  ],
  /** Plain text until the site is live; then set `live: true` to link it. */
  site: { label: 'munnin.fr', href: 'https://munnin.fr', live: false },
};

/**
 * `icon`: export name in the simple-icons package. Without one, a monogram tile is drawn.
 * `bg`/`fg`: tile colours from the design (brand-ish, picked to read on the dark ground).
 */
export interface StackItem { name: string; icon?: string; mono?: string; bg: string; fg?: string }
export const stack: { group: string; items: StackItem[] }[] = [
  {
    group: 'Languages',
    items: [
      { name: 'C', icon: 'siC', bg: '#A8B9CC' },
      { name: 'C++', icon: 'siCplusplus', bg: '#659AD2' },
      { name: 'Python', icon: 'siPython', bg: '#FFD43B' },
      { name: 'Rust', icon: 'siRust', bg: '#DEA584' },
      { name: 'Haskell', icon: 'siHaskell', bg: '#9E86C8' },
      { name: 'TypeScript', icon: 'siTypescript', bg: '#3178C6', fg: '#FFFFFF' },
      { name: 'Dart', icon: 'siDart', bg: '#40C4FF' },
    ],
  },
  {
    group: 'Security + network',
    items: [
      { name: 'Zeek', mono: 'Zk', bg: '#EDEAE4' },
      { name: 'WireGuard', icon: 'siWireguard', bg: '#E11D2E', fg: '#FFFFFF' },
      { name: 'ASan · Valgrind', mono: 'As', bg: '#EDEAE4' },
      { name: 'Cloudflare', icon: 'siCloudflare', bg: '#F38020' },
    ],
  },
  {
    group: 'ML',
    items: [
      { name: 'scikit-learn', icon: 'siScikitlearn', bg: '#F7931E' },
      { name: 'XGBoost', mono: 'XG', bg: '#3A9AD9' },
      { name: 'TensorFlow', icon: 'siTensorflow', bg: '#FF6F00' },
      { name: 'LangChain', icon: 'siLangchain', bg: '#EDEAE4' },
      { name: 'AWS Bedrock', mono: 'AW', bg: '#FF9900' },
    ],
  },
  {
    group: 'Infra + data',
    items: [
      { name: 'Docker', icon: 'siDocker', bg: '#2496ED', fg: '#FFFFFF' },
      { name: 'Linux', icon: 'siLinux', bg: '#FCC624' },
      { name: 'Proxmox', icon: 'siProxmox', bg: '#E57000' },
      { name: 'PostgreSQL', icon: 'siPostgresql', bg: '#4169E1', fg: '#FFFFFF' },
      { name: 'Redis', icon: 'siRedis', bg: '#DC382D', fg: '#FFFFFF' },
      { name: 'Flask', icon: 'siFlask', bg: '#EDEAE4' },
      { name: 'Flutter', icon: 'siFlutter', bg: '#02569B', fg: '#FFFFFF' },
    ],
  },
];

export const security = {
  cases: [
    {
      kind: 'Incident response',
      title: 'A five-figure remote-access scam',
      situation:
        'A business owner was pressured on the phone while an attacker controlled his screen, and transferred a five-figure sum.',
      action:
        'Investigated how the attacker got in, closed the access, and rebuilt his account and password security from scratch.',
      result:
        'Access shut down and his accounts locked back down. A textbook case of social engineering beating technology.',
    },
    {
      kind: 'Awareness',
      title: "Briefing a client's engineering team",
      situation: "A client's engineers needed to understand which security practices actually matter and why.",
      action: 'Wrote and presented the briefing myself, explaining the reasoning instead of handing out rules.',
      result: 'A team that understood the why behind each practice.',
    },
    {
      kind: 'Maintenance · Munnin',
      title: 'A backup system about to fail',
      situation:
        'During routine maintenance for a Munnin client, I found his backups running regularly to a USB drive never built for that much I/O, showing signs it was about to corrupt.',
      action: 'Diagnosed the failing setup and fixed it before the backups were lost.',
      result: 'Backups he can actually rely on, caught before he needed them.',
    },
    {
      kind: 'Detection',
      title: 'Sentinel, in the field',
      situation: 'Small businesses with no SOC and no budget for enterprise tooling.',
      action:
        "Led development of an ML detection cascade fed by on-site taps over WireGuard, with each client's data isolated.",
      result: 'A detection platform now in use at Interface Numérique.',
      href: '/projects/sentinel/',
    },
  ],
  strip: [
    { big: '2024–26', small: 'Founder and co-lead, Epitech Toulouse Cybersecurity Club' },
    { big: 'CTF', small: 'Write-ups published on GitHub', href: 'https://github.com/CrackedOnTiti/WriteUps' },
    { big: 'Homelab', small: 'Proxmox, WireGuard, Docker, Cloudflare tunnels' },
  ],
  /**
   * Tiles link to each platform's official site (`profile`, once Thierry sends it, takes over).
   * Logos are the official artwork, unmodified, self-hosted: simple-icons glyphs in public/brands/,
   * Blue Team Labs Online's own logo (from blueteamlabs.online) in src/assets/brands/.
   */
  platforms: [
    { name: 'Hack The Box', focus: 'Offensive labs', site: 'https://www.hackthebox.com/', logo: '/brands/hackthebox.svg', profile: undefined as string | undefined },
    { name: 'TryHackMe', focus: 'Guided rooms', site: 'https://tryhackme.com/', logo: '/brands/tryhackme.svg', profile: undefined as string | undefined },
    { name: 'Root Me', focus: 'Challenges', site: 'https://www.root-me.org/', logo: '/brands/rootme.svg', profile: undefined as string | undefined },
    { name: 'Blue Team Labs Online', focus: 'Defensive investigations', site: 'https://blueteamlabs.online/', logo: 'btlo', profile: undefined as string | undefined },
  ],
};

export const education = [
  { when: 'Sep 2026 – Jun 2027', what: 'Beijing Institute of Technology', detail: 'Exchange year · security and low-level coursework' },
  { when: 'Class of 2028', what: 'Epitech Toulouse', detail: "Master's programme in IT · cybersecurity track" },
  { when: 'High school · 1 year', what: '8e RPIMa, Castres', detail: 'Formation Militaire Terre Avancée' },
];

export const contact = {
  title: "Let's talk.",
  body: 'Internship offers, security roles or questions about a project. Everything that comes through here reaches me.',
};
