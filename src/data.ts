// Everything on the site lives in this file.

export const profile = {
  name: 'Aarav Daga',
  email: 'aaravdaga@gmail.com',
  github: 'https://github.com/ADaga460',
  linkedin: 'https://linkedin.com/in/aarav-daga-4325b5237',
  // Put a photo at public/headshot.jpg and set this to '/headshot.jpg'.
  headshot: '/headshot.jpg' as string | null,
  resume: '/resume.pdf',
  home: { name: 'Cupertino, CA', lat: 37.323, lon: -122.0322 },
  intro:
    "I'm Aarav, a CS student at Penn State from Cupertino, California. I've interned twice at Lockheed Martin, first on multi-GPU CUDA training and then on a Go/React ML platform, and outside of work I write kernels, storage engines, and firmware.",
  status: 'Looking for summer 2027 internships and research.',
  // Links use [text](href). Keep them to anchors on this page or full URLs.
  about: [
    "The work I've liked most has had the hardware in the middle of it: fitting audio into a 200 ms budget on an ESP32, tracking down NCCL deadlocks across two GPUs, getting a kernel to set up its own page tables before anything else can run. I'd rather work on that than wire together a billion APIs that keep me away from the physical world.",
  ],
  focus: [
    {
      title: 'Systems programming',
      text: "A C++20 key-value store with an async ASIO server, a length-prefixed binary protocol, and a deadlock-free transfer layer covered by 46 tests. At Lockheed I shipped 9 merged MRs to a Go/React platform with 7,500 users, cut API latency 60% across four pipelines, and stopped latency spikes at high pod counts by capping per-pod GPU requests at 5 concurrent.",
    },
    {
      title: 'Computer vision',
      text: "Through Nittany AI I worked on a sonar Gaussian-splatting framework that turns multi-view video into synthetic underwater imagery. I fixed 11 bugs to get it training across two GPUs, including parameter sharding, a missing gradient all_reduce, and NCCL process-group deadlocks, and debugged tensor shape errors in its custom CUDA rasterization kernels. It reached 35.7 dB PSNR and 0.98 SSIM.",
    },
    {
      title: 'Computer architecture',
      text: "My x86_64 kernel boots on real hardware into long mode with 4-level paging, 32 exception handlers, and ring-3 syscall gates, in about 1,200 lines of C and assembly. On the splatting project I benchmarked one GPU against two and traced the bottleneck to per-pixel rasterization. I'm minoring in computer engineering, with digital design done and computer organization this semester.",
    },
  ],
  aboutMore: [
    "I'm also an environmentalist. I've been to most of the major biomes in North America, a lot of them in California ([the map is further down](#outside)). That's a big part of why this work appeals to me. The things that make a phone or a data center better, like more compute per watt and perception that runs at the edge, are the same things that let a robot survey a reef or a satellite track a glacier. MBARI and NASA are the obvious places for that, but a lot of it gets built into the chips and software at bigger companies first, and I'd be glad to work on it there.",
    "Away from a computer I'm usually drawing or playing guitar. I draw mostly in charcoal, both compressed and vine, and do line art with art pens. On guitar it's doom and stoner metal, plus classic rock like Led Zeppelin and Pink Floyd.",
    "Longer term I want to go to grad school, either full time or online alongside a job.",
  ],
};

export type Job = {
  org: string;
  via?: string;
  role: string;
  dates: string;
  place: string;
  summary: string;
  details: string[];
  stack: string;
};

export const work: Job[] = [
  {
    org: 'Lockheed Martin',
    role: 'Platform engineering intern',
    dates: 'May–Aug 2026',
    place: 'Remote',
    summary:
      'Worked on Panel, a Go/React MLOps platform with 7,500 enterprise users. Nine merged MRs, mostly performance: API latency across four pipelines dropped about 60%.',
    details: [
      'Built job rerun end to end. A new Go endpoint turns an old job into a create-ready template, which meant normalizing GPU types, deduplicating command wrappers, and restoring ConfigMap files. Tested with Go tests and Jest.',
      'Pages with a lot of pods were spiking latency because every pod made its own GPU request. I batched them behind a cap of 5 concurrent requests.',
      'Split the utilization page into a cold-start load and a background refresh, with caching per group.',
      'Fixed a fail-open regression in job-log handling without changing the response shape callers depended on.',
    ],
    stack: 'Go, React, Kubernetes, Jest',
  },
  {
    org: 'Lockheed Martin',
    via: 'Nittany AI Alliance',
    role: 'Software engineering intern',
    dates: 'Jan–Apr 2026',
    place: 'State College, PA',
    summary:
      'Got a sonar Gaussian-splatting framework, which makes synthetic underwater imagery from multi-view video, training across two GPUs. It reached 35.7 dB PSNR and 0.98 SSIM.',
    details: [
      'Fixed 11 bugs to get distributed training working: parameter sharding, a missing all_reduce on gradients, NCCL process groups deadlocking, and densification going wrong across ranks.',
      'Ranks were drifting apart, so rank 0 now does the stochastic sampling and broadcasts it with dist.broadcast.',
      'Debugged tensor shape errors in the custom CUDA rasterization kernels.',
      'Set up the HPC pipeline (PyTorch 2.6, CUDA 12.4, custom-built CUDA extensions) and benchmarked one GPU against two. Per-pixel rasterization turned out to be the bottleneck.',
    ],
    stack: 'CUDA, PyTorch, NCCL',
  },
  {
    org: 'ASME Assistive Tech',
    role: 'Lead software developer',
    dates: 'Sep 2025–Mar 2026',
    place: 'State College, PA',
    summary:
      'Led a team of five building glasses that show translated speech in real time, on an ESP32, with under 200 ms of audio latency.',
    details: [
      'Wrote the audio ingestion and processing path and the Bluetooth link to the display, in C++ and Python.',
      'Wrote drivers for the microphone, OLED, and Bluetooth modules, with debounced I/O.',
    ],
    stack: 'C++, Python, ESP32, Bluetooth',
  },
];

export type DemoId = 'protocol' | 'paging';

// A real screenshot of the project running. Files live in public/shots.
export type Shot = { src: string; alt: string; caption: string };

export type Project = {
  id: string;
  name: string;
  dates: string;
  stack: string;
  text: string;
  repo?: string;
  demo?: DemoId;
  demoLabel?: string;
  shot?: Shot;
};

export const projects: Project[] = [
  {
    id: 'kv',
    name: 'Distributed key-value store',
    dates: '2026',
    stack: 'C++20, ASIO, GTest',
    text: "A key-value store I'm building from scratch. It has an async ASIO server, my own length-prefixed binary protocol, and a transaction layer for bank-style transfers that can't deadlock, with 46 tests so far. The storage engine sits behind an interface so persistence and Raft replication can go in later.",
    repo: 'https://github.com/ADaga460/dist-kv-store',
    demo: 'protocol',
    demoLabel: 'Encode a request',
    shot: {
      src: '/shots/kv.png',
      alt: 'Terminal session with the key-value store client and test run',
      caption: 'A transfer between two accounts, an overdraft getting rejected, and the test suite.',
    },
  },
  {
    id: 'kernel',
    name: 'x86_64 kernel',
    dates: '2025–26',
    stack: 'C, x86 assembly, NASM, QEMU',
    text: 'About 1,200 lines of C and assembly that boot on real hardware. It gets into long mode, identity-maps memory with 4-level paging, has handlers for all 32 CPU exceptions, and has syscall gates into ring 3.',
    repo: 'https://github.com/ADaga460/microkernel',
    demo: 'paging',
    demoLabel: 'Walk the page tables',
    shot: {
      src: '/shots/kernel.png',
      alt: 'The kernel booting in QEMU',
      caption: 'Booting in QEMU: memory manager and heap come up, the timer ticks, and it jumps to ring 3.',
    },
  },
  {
    id: 'gitcontext',
    name: 'GitContext',
    dates: '2025',
    stack: 'C, SQLite, JSONL',
    text: "A CLI for attaching notes and TODOs to Git commits. It writes straight into .git/, keeps notes in JSONL and TODOs in SQLite, and runs on commit, merge, and pull hooks. There's also a merge driver so notes don't conflict, and a daemon mode.",
    repo: 'https://github.com/ADaga460/gitnotes',
  },
  {
    id: 'blackhole',
    name: 'Black hole sim',
    dates: '2025',
    stack: 'C++, OpenGL',
    text: 'A black hole simulator. I wrote it to learn C++ properly.',
    shot: {
      src: '/shots/blackhole.png',
      alt: 'Light rays bending around a black hole',
      caption: 'Light rays bending around the event horizon. The closest ones fall in.',
    },
    repo: 'https://github.com/ADaga460/blackhole-sim',
  },
  {
    id: 'emulator',
    name: 'CPU emulator',
    dates: '2025',
    stack: 'C',
    text: 'An instruction-level CPU emulator.',
    repo: 'https://github.com/ADaga460/emulator',
  },
  {
    id: 'newstexter',
    name: 'NewsTexter',
    dates: '2026',
    stack: 'Python, FastAPI, Docker',
    text: "Texts a few people international news that doesn't get much coverage. An LLM picks and summarizes the stories, and you can text back to ask about them.",
    repo: 'https://github.com/ADaga460/newstexter',
  },
];

// Older or smaller things. Listed plainly under the main projects.
export type SmallProject = { name: string; text: string; stack: string; repo: string; live?: string; shot?: Shot };

export const smallProjects: SmallProject[] = [
  {
    name: 'Paleozooa',
    text: 'A daily guessing game for Mesozoic animals. Wrong guesses reveal the branches you share with the answer on a growing family tree.',
    shot: {
      src: '/shots/paleozooa.jpg',
      alt: 'Paleozooa after three guesses, showing the family tree',
      caption: 'Three guesses in: the tree shows how each one is related to the answer.',
    },
    stack: 'Next.js, TypeScript, d3-hierarchy',
    repo: 'https://github.com/ADaga460/paleozooa',
    live: 'https://paleozooa.vercel.app',
  },
  {
    name: 'StudySphere',
    text: 'HackPSU project. Give it a topic and it builds a mind map, then writes a lesson and a quiz for each node.',
    stack: 'React, FastAPI, LLMs',
    repo: 'https://github.com/ADaga460/hackpsu',
    live: 'https://hackpsu-five.vercel.app',
  },
  {
    name: 'AI Study Assistant',
    text: 'Chrome extension that teaches whatever page you are on, with quizzes along the way and a final exam.',
    stack: 'JavaScript, Python',
    repo: 'https://github.com/ADaga460/ai-tutor',
  },
  {
    name: 'News analyzer',
    text: 'Pulls the article text out of a news URL and has an LLM analyze it. FastAPI backend, Expo frontend.',
    stack: 'Python, FastAPI, TypeScript',
    repo: 'https://github.com/ADaga460/news-analyzer-backend',
    live: 'https://news-analyzer-frontend-plat.vercel.app',
  },
  {
    name: 'Boot sector',
    text: 'A 512-byte boot sector in x86 assembly. This is where the kernel started.',
    stack: 'x86 assembly',
    repo: 'https://github.com/ADaga460/os-test',
  },
  {
    name: 'Wallet API',
    text: 'Transactions backend for an expense tracker, with Postgres and rate limiting.',
    stack: 'Node, Express',
    repo: 'https://github.com/ADaga460/wallet-app',
  },
];

export const school = {
  name: 'Penn State',
  degree: 'B.S. Computer Science, minor in Computer Engineering',
  dates: 'Graduating December 2027',
  honors: "Dean's List, spring and fall 2025",
  courses: [
    'Systems Programming',
    'Computer Organization & Design',
    'Communication Networks',
    'Digital Design',
    'Data Structures & Algorithms',
    'Theory of Computation',
    'Programming Language Concepts',
    'Probability',
    'Mathematical Statistics',
    'Linear Algebra',
  ],
  tools:
    'C, C++, Go, Python, CUDA, x86 assembly, TypeScript. Linux, Kubernetes, Docker, gdb, QEMU, PyTorch, NCCL, ESP32.',
};

// ---- Outside ---------------------------------------------------------------

export type Park = { name: string; state: string; lat: number; lon: number };

// All 63 US national parks. Mark the ones you've been to in `visitedParks` below.
export const parks: Park[] = [
  { name: 'Acadia', state: 'ME', lat: 44.35, lon: -68.21 },
  { name: 'American Samoa', state: 'AS', lat: -14.25, lon: -170.68 },
  { name: 'Arches', state: 'UT', lat: 38.68, lon: -109.57 },
  { name: 'Badlands', state: 'SD', lat: 43.75, lon: -102.5 },
  { name: 'Big Bend', state: 'TX', lat: 29.25, lon: -103.25 },
  { name: 'Biscayne', state: 'FL', lat: 25.65, lon: -80.08 },
  { name: 'Black Canyon of the Gunnison', state: 'CO', lat: 38.57, lon: -107.72 },
  { name: 'Bryce Canyon', state: 'UT', lat: 37.57, lon: -112.18 },
  { name: 'Canyonlands', state: 'UT', lat: 38.2, lon: -109.93 },
  { name: 'Capitol Reef', state: 'UT', lat: 38.2, lon: -111.17 },
  { name: 'Carlsbad Caverns', state: 'NM', lat: 32.17, lon: -104.44 },
  { name: 'Channel Islands', state: 'CA', lat: 34.01, lon: -119.42 },
  { name: 'Congaree', state: 'SC', lat: 33.78, lon: -80.78 },
  { name: 'Crater Lake', state: 'OR', lat: 42.94, lon: -122.1 },
  { name: 'Cuyahoga Valley', state: 'OH', lat: 41.24, lon: -81.55 },
  { name: 'Death Valley', state: 'CA', lat: 36.24, lon: -116.82 },
  { name: 'Denali', state: 'AK', lat: 63.33, lon: -150.5 },
  { name: 'Dry Tortugas', state: 'FL', lat: 24.63, lon: -82.87 },
  { name: 'Everglades', state: 'FL', lat: 25.32, lon: -80.93 },
  { name: 'Gates of the Arctic', state: 'AK', lat: 67.78, lon: -153.3 },
  { name: 'Gateway Arch', state: 'MO', lat: 38.63, lon: -90.19 },
  { name: 'Glacier', state: 'MT', lat: 48.8, lon: -114.0 },
  { name: 'Glacier Bay', state: 'AK', lat: 58.5, lon: -137.0 },
  { name: 'Grand Canyon', state: 'AZ', lat: 36.06, lon: -112.14 },
  { name: 'Grand Teton', state: 'WY', lat: 43.73, lon: -110.8 },
  { name: 'Great Basin', state: 'NV', lat: 38.98, lon: -114.3 },
  { name: 'Great Sand Dunes', state: 'CO', lat: 37.73, lon: -105.51 },
  { name: 'Great Smoky Mountains', state: 'TN', lat: 35.68, lon: -83.53 },
  { name: 'Guadalupe Mountains', state: 'TX', lat: 31.92, lon: -104.87 },
  { name: 'Haleakalā', state: 'HI', lat: 20.72, lon: -156.17 },
  { name: 'Hawaiʻi Volcanoes', state: 'HI', lat: 19.38, lon: -155.2 },
  { name: 'Hot Springs', state: 'AR', lat: 34.51, lon: -93.05 },
  { name: 'Indiana Dunes', state: 'IN', lat: 41.65, lon: -87.05 },
  { name: 'Isle Royale', state: 'MI', lat: 48.1, lon: -88.55 },
  { name: 'Joshua Tree', state: 'CA', lat: 33.79, lon: -115.9 },
  { name: 'Katmai', state: 'AK', lat: 58.5, lon: -155.0 },
  { name: 'Kenai Fjords', state: 'AK', lat: 59.92, lon: -149.65 },
  { name: 'Kings Canyon', state: 'CA', lat: 36.8, lon: -118.55 },
  { name: 'Kobuk Valley', state: 'AK', lat: 67.55, lon: -159.28 },
  { name: 'Lake Clark', state: 'AK', lat: 60.97, lon: -153.42 },
  { name: 'Lassen Volcanic', state: 'CA', lat: 40.49, lon: -121.51 },
  { name: 'Mammoth Cave', state: 'KY', lat: 37.18, lon: -86.1 },
  { name: 'Mesa Verde', state: 'CO', lat: 37.18, lon: -108.49 },
  { name: 'Mount Rainier', state: 'WA', lat: 46.85, lon: -121.75 },
  { name: 'New River Gorge', state: 'WV', lat: 38.07, lon: -81.08 },
  { name: 'North Cascades', state: 'WA', lat: 48.7, lon: -121.2 },
  { name: 'Olympic', state: 'WA', lat: 47.97, lon: -123.5 },
  { name: 'Petrified Forest', state: 'AZ', lat: 35.07, lon: -109.78 },
  { name: 'Pinnacles', state: 'CA', lat: 36.48, lon: -121.16 },
  { name: 'Redwood', state: 'CA', lat: 41.3, lon: -124.0 },
  { name: 'Rocky Mountain', state: 'CO', lat: 40.4, lon: -105.58 },
  { name: 'Saguaro', state: 'AZ', lat: 32.25, lon: -110.5 },
  { name: 'Sequoia', state: 'CA', lat: 36.43, lon: -118.68 },
  { name: 'Shenandoah', state: 'VA', lat: 38.53, lon: -78.35 },
  { name: 'Theodore Roosevelt', state: 'ND', lat: 46.97, lon: -103.45 },
  { name: 'Virgin Islands', state: 'VI', lat: 18.33, lon: -64.73 },
  { name: 'Voyageurs', state: 'MN', lat: 48.5, lon: -92.88 },
  { name: 'White Sands', state: 'NM', lat: 32.78, lon: -106.17 },
  { name: 'Wind Cave', state: 'SD', lat: 43.57, lon: -103.48 },
  { name: 'Wrangell–St. Elias', state: 'AK', lat: 61.0, lon: -142.0 },
  { name: 'Yellowstone', state: 'WY', lat: 44.6, lon: -110.5 },
  { name: 'Yosemite', state: 'CA', lat: 37.83, lon: -119.5 },
  { name: 'Zion', state: 'UT', lat: 37.3, lon: -113.05 },
];

// US national parks I've been to. Names must match `parks` exactly.
export const visitedParks: string[] = [
  'Yosemite', 'Death Valley', 'Joshua Tree', 'Redwood', 'Sequoia', 'Kings Canyon', 'Pinnacles',
  'Zion', 'Bryce Canyon', 'Arches', 'Canyonlands', 'Capitol Reef',
  'Grand Canyon', 'Saguaro',
  'Mount Rainier', 'North Cascades',
  'Yellowstone', 'Grand Teton', 'Glacier',
  'Great Sand Dunes', 'Carlsbad Caverns', 'Great Basin',
  'Hawaiʻi Volcanoes', 'Haleakalā', 'Denali', 'Glacier Bay',
];

// Short notes shown next to a national park.
export const parkNotes: Record<string, string> = {
  Yosemite: 'Half Dome',
  Zion: 'Angels Landing',
  'Grand Canyon': 'rim to rim',
};

export type Region =
  | 'California'
  | 'Southwest'
  | 'Northwest & Rockies'
  | 'Hawaii'
  | 'Alaska'
  | 'East'
  | 'Canada'
  | 'Mexico'
  | 'Central America';

export const regionOfState = (st: string): Region =>
  st === 'CA'
    ? 'California'
    : ['UT', 'AZ', 'NV', 'CO', 'NM'].includes(st)
      ? 'Southwest'
      : ['WA', 'OR', 'ID', 'MT', 'WY'].includes(st)
        ? 'Northwest & Rockies'
        : st === 'HI'
          ? 'Hawaii'
          : st === 'AK'
            ? 'Alaska'
            : 'East';

export type Place = {
  name: string;
  kind: 'park' | 'hike' | 'ruins' | 'other';
  region: Region;
  lat: number;
  lon: number;
  feet?: number; // summit elevation, for hikes that top out
  short?: string; // label for the summits chart
  range?: string; // mountain range, for summits
  note?: string;
};

// Everywhere else: hikes, state parks, other countries' parks, ruins.
export const places: Place[] = [
  // California
  { name: 'Mount Whitney', range: 'Sierra Nevada', short: 'Whitney', kind: 'hike', region: 'California', lat: 36.5786, lon: -118.2923, feet: 14505 },
  { name: 'Mount Williamson', range: 'Sierra Nevada', short: 'Williamson', kind: 'hike', region: 'California', lat: 36.6561, lon: -118.3109, feet: 14379 },
  { name: 'North Palisade', range: 'Sierra Nevada', short: 'N. Palisade', kind: 'hike', region: 'California', lat: 37.0942, lon: -118.5147, feet: 14248 },
  { name: 'Shastarama Point', range: 'Cascades', short: 'Shastarama Pt.', kind: 'hike', region: 'California', lat: 41.385, lon: -122.19, feet: 11135, note: 'Sargents Ridge, Mount Shasta' },
  { name: 'Mount Eddy', range: 'Klamath Mountains', short: 'Eddy', kind: 'hike', region: 'California', lat: 41.3199, lon: -122.4789, feet: 9025 },
  { name: 'Half Dome', range: 'Sierra Nevada', kind: 'hike', region: 'California', lat: 37.7459, lon: -119.5332, feet: 8839, note: 'Yosemite' },
  { name: 'Mount Diablo', range: 'Diablo Range', short: 'Diablo', kind: 'hike', region: 'California', lat: 37.8816, lon: -121.9142, feet: 3849 },
  { name: 'Black Mountain', range: 'Santa Cruz Mountains', short: 'Black Mtn.', kind: 'hike', region: 'California', lat: 37.3194, lon: -122.1453, feet: 2812 },
  { name: 'Rancho San Antonio Preserve', kind: 'hike', region: 'California', lat: 37.33, lon: -122.09 },
  { name: 'Castle Rock', kind: 'hike', region: 'California', lat: 37.23, lon: -122.1 },
  { name: 'Point Lobos', kind: 'hike', region: 'California', lat: 36.52, lon: -121.95 },
  { name: 'Big Sur', kind: 'other', region: 'California', lat: 36.27, lon: -121.81 },
  { name: 'Julia Pfeiffer Burns State Park', kind: 'park', region: 'California', lat: 36.16, lon: -121.67 },
  { name: 'Montaña de Oro State Park', kind: 'park', region: 'California', lat: 35.27, lon: -120.88 },
  { name: 'Anza-Borrego Desert State Park', kind: 'park', region: 'California', lat: 33.26, lon: -116.4 },
  { name: 'Humboldt Redwoods State Park', kind: 'park', region: 'California', lat: 40.31, lon: -123.97 },
  { name: 'John Muir Trail', kind: 'hike', region: 'California', lat: 37.112, lon: -118.671, note: 'Yosemite to Whitney' },
  { name: 'Lake Tahoe', kind: 'hike', region: 'California', lat: 39.09, lon: -120.04 },

  // Southwest
  { name: 'Angels Landing', range: 'Zion Canyon', kind: 'hike', region: 'Southwest', lat: 37.2692, lon: -112.9481, feet: 5790, note: 'Zion' },
  { name: 'Dead Horse Point State Park', kind: 'park', region: 'Southwest', lat: 38.47, lon: -109.74 },
  { name: 'Kodachrome Basin State Park', kind: 'park', region: 'Southwest', lat: 37.5, lon: -111.99 },
  { name: 'Great Salt Lake', kind: 'other', region: 'Southwest', lat: 41.1, lon: -112.5 },
  { name: 'Colorado Rockies', kind: 'other', region: 'Southwest', lat: 39.6, lon: -106.0, note: 'drove through' },

  // Hawaii
  { name: 'Diamond Head', range: 'Oʻahu', kind: 'hike', region: 'Hawaii', lat: 21.2619, lon: -157.8061, feet: 761 },
  { name: 'Waiʻānapanapa State Park', kind: 'park', region: 'Hawaii', lat: 20.786, lon: -156.003 },
  { name: 'Waimea Canyon', kind: 'hike', region: 'Hawaii', lat: 22.07, lon: -159.66 },

  // East
  { name: 'Delaware Water Gap', kind: 'park', region: 'East', lat: 41.0, lon: -75.13 },

  // Canada
  { name: 'Banff National Park', kind: 'park', region: 'Canada', lat: 51.18, lon: -115.57 },
  { name: 'Yoho National Park', kind: 'park', region: 'Canada', lat: 51.4, lon: -116.5 },
  { name: 'Glacier National Park (Canada)', kind: 'park', region: 'Canada', lat: 51.3, lon: -117.5 },
  { name: 'Jasper National Park', kind: 'park', region: 'Canada', lat: 52.87, lon: -118.08 },
  { name: 'Mount Columbia', range: 'Canadian Rockies', short: 'Columbia', kind: 'hike', region: 'Canada', lat: 52.147, lon: -117.44, feet: 12294 },
  { name: 'Mount Forbes', range: 'Canadian Rockies', short: 'Forbes', kind: 'hike', region: 'Canada', lat: 51.86, lon: -116.93, feet: 11852 },

  // Mexico
  { name: 'Chichén Itzá', kind: 'ruins', region: 'Mexico', lat: 20.683, lon: -88.568 },
  { name: 'Teotihuacan', kind: 'ruins', region: 'Mexico', lat: 19.692, lon: -98.844 },
  { name: 'Palenque', kind: 'ruins', region: 'Mexico', lat: 17.484, lon: -92.046 },
  { name: 'Monte Albán', kind: 'ruins', region: 'Mexico', lat: 17.044, lon: -96.768 },
  { name: 'Calakmul', kind: 'ruins', region: 'Mexico', lat: 18.105, lon: -89.81 },
  { name: 'Lagunas de Montebello', kind: 'park', region: 'Mexico', lat: 16.11, lon: -91.67 },
  { name: 'Hierve el Agua', kind: 'other', region: 'Mexico', lat: 16.866, lon: -96.276 },
  { name: 'Yucatán', kind: 'other', region: 'Mexico', lat: 20.97, lon: -89.62 },
  { name: 'Jalisco', kind: 'other', region: 'Mexico', lat: 20.66, lon: -103.35 },
  { name: 'Tenochtitlan (Templo Mayor)', kind: 'ruins', region: 'Mexico', lat: 19.4346, lon: -99.1313 },
  { name: 'Uxmal', kind: 'ruins', region: 'Mexico', lat: 20.3594, lon: -89.7714 },
  { name: 'Mayapán', kind: 'ruins', region: 'Mexico', lat: 20.6297, lon: -89.4606 },
  { name: 'Xochicalco', kind: 'ruins', region: 'Mexico', lat: 18.8036, lon: -99.2956 },

  // Central America
  { name: 'Tikal', kind: 'ruins', region: 'Central America', lat: 17.222, lon: -89.6237, note: 'Guatemala' },
  { name: 'El Mirador', kind: 'ruins', region: 'Central America', lat: 17.7547, lon: -89.9203, note: 'Guatemala' },
  { name: 'Piedras Negras', kind: 'ruins', region: 'Central America', lat: 17.1767, lon: -91.2628, note: 'Guatemala' },
  { name: 'Caracol', kind: 'ruins', region: 'Central America', lat: 16.7633, lon: -89.1172, note: 'Belize' },
  { name: 'Chiquibul National Park', kind: 'park', region: 'Central America', lat: 16.62, lon: -88.95, note: 'Belize' },
  { name: 'Copán', kind: 'ruins', region: 'Central America', lat: 14.8378, lon: -89.1419, note: 'Honduras' },

  { name: 'Manuel Antonio National Park', kind: 'park', region: 'Central America', note: 'Costa Rica', lat: 9.39, lon: -84.14 },
  { name: 'Tapantí–Macizo de la Muerte National Park', kind: 'park', region: 'Central America', note: 'Costa Rica', lat: 9.72, lon: -83.78 },
  { name: 'Barbilla National Park', kind: 'park', region: 'Central America', note: 'Costa Rica', lat: 9.97, lon: -83.45 },
  { name: 'Irazú Volcano National Park', kind: 'park', region: 'Central America', note: 'Costa Rica', lat: 9.979, lon: -83.852 },
];

// John Muir Trail, Happy Isles to Whitney, through the main passes. [lon, lat]
export const jmt: [number, number][] = [
  [-119.558, 37.732], [-119.36, 37.873], [-119.074, 37.617], [-118.87, 37.37],
  [-118.671, 37.112], [-118.46, 37.03], [-118.372, 36.694], [-118.2923, 36.5786],
];

// Shaded on the map. State names as in us-atlas, country names as in src/geo/neighbors.json.
export const visitedStates = [
  'California', 'Nevada', 'Utah', 'Arizona', 'New Mexico', 'Colorado', 'Wyoming', 'Montana',
  'Washington', 'Hawaii', 'Alaska', 'Pennsylvania', 'New Jersey',
];
export const visitedCountries = ['Canada', 'Mexico', 'Guatemala', 'Belize', 'Honduras', 'Costa Rica'];
