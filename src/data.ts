// All site content lives here so it can be edited without touching components.

export const profile = {
  name: 'Aarav Daga',
  location: 'State College, PA',
  email: 'aaravdaga@gmail.com',
  github: 'https://github.com/ADaga460',
  linkedin: 'https://linkedin.com/in/aarav-daga-4325b5237',
  // Drop a photo at public/headshot.jpg and set this to '/headshot.jpg'.
  headshot: null as string | null,
  intro:
    'CS student at Penn State. I write systems and computer vision software, and I want to point it at ocean and space science.',
  bio: [
    "I'm studying computer science at Penn State with a minor in Computer Engineering, graduating in December 2027. Most of my work is in C, C++, Go, and CUDA: a hobby kernel, a key-value store, GPU training pipelines, and ESP32 firmware.",
    "I like systems and computer vision because that's where software has to meet the hardware. Sensors, memory, bandwidth, and timing each add constraints, and working inside those limits is more interesting to me than stacking another abstraction layer between my code and the physical world.",
    "I also care a lot about the environment. I've spent time in most of North America's major biomes, especially across California, and that's why I want my work to end up in marine and space science, on the kind of instruments, vehicles, and imaging pipelines built at places like MBARI and NASA.",
  ],
  plans:
    "I'm planning to go to grad school as a way into that research. I'm also open to full-time engineering roles in the same space, either with part-time grad study or on their own.",
};

export const interests = {
  building: [
    {
      title: 'Systems programming',
      text: 'Kernels, storage engines, networking, and concurrency. Code where memory layout, latency, and failure modes matter.',
    },
    {
      title: 'Computer vision',
      text: 'Reconstruction and imaging on GPUs, especially from unusual sensors like sonar, and making those pipelines fast enough to be useful.',
    },
  ],
  applying: [
    {
      title: 'Ocean science',
      text: 'Underwater perception, autonomous vehicles, and the software researchers use to observe environments that are hard to reach.',
    },
    {
      title: 'Space & Earth observation',
      text: 'Flight and instrument software, onboard data processing, and imaging pipelines for planetary and Earth science.',
    },
  ],
};

export type Experience = {
  org: string;
  via?: string;
  role: string;
  dates: string;
  location: string;
  stack: string[];
  stats: { value: string; label: string }[];
  summary: string;
  bullets: string[];
};

export const experience: Experience[] = [
  {
    org: 'Lockheed Martin',
    role: 'Platform Engineering Intern',
    dates: 'May 2026 – Aug 2026',
    location: 'Remote',
    stack: ['Go', 'React', 'Kubernetes', 'Jest'],
    stats: [
      { value: '9', label: 'merged MRs' },
      { value: '60%', label: 'API latency cut' },
      { value: '7,500', label: 'enterprise users' },
    ],
    summary: 'Backend and frontend performance work on Panel, a full-stack Go/React MLOps platform.',
    bullets: [
      'Shipped 9 merged MRs to Panel, a full-stack Go/React MLOps platform serving 7,500 enterprise users.',
      'Cut API latency 60% across 4 pipelines spanning backend API services and frontend workflows.',
      'Built a full-stack job-rerun feature on a new Go endpoint that generates create-ready job templates, handling GPU type normalization, command-wrapper deduplication, and ConfigMap file restoration. Tested with Go and Jest.',
      'Eliminated latency spikes under high pod counts by batching per-pod GPU requests behind a 5-concurrent cap.',
      'Reworked utilization-page loading to separate cold start from background refresh, with per-group caching.',
      'Fixed a fail-open regression in Go job-log handling while preserving response-shape contracts on provider errors.',
    ],
  },
  {
    org: 'Lockheed Martin',
    via: 'Nittany AI Alliance',
    role: 'Software Engineering Intern',
    dates: 'Jan 2026 – Apr 2026',
    location: 'State College, PA',
    stack: ['CUDA', 'PyTorch', 'NCCL', 'HPC'],
    stats: [
      { value: '35.7 dB', label: 'PSNR' },
      { value: '0.98', label: 'SSIM' },
      { value: '11', label: 'distributed bugs fixed' },
    ],
    summary:
      'Multi-GPU training for a new sonar Gaussian-splatting framework that generates synthetic underwater imagery from multi-view video.',
    bullets: [
      'Debugged tensor shape errors in custom CUDA rasterization kernels for a novel sonar Gaussian-splatting framework, reaching 35.7 dB PSNR and 0.98 SSIM.',
      'Enabled multi-GPU distributed training on 2 NVIDIA GPUs by resolving 11 bugs across parameter sharding, missing all_reduce gradient sync, NCCL process-group deadlocks, and cross-rank densification.',
      'Eliminated cross-rank parameter divergence with rank-0 stochastic sampling via dist.broadcast.',
      'Configured the HPC training pipeline with PyTorch 2.6, CUDA 12.4, and custom-built CUDA extensions.',
      'Identified per-pixel rasterization as the compute bottleneck by benchmarking single- vs. multi-GPU training.',
    ],
  },
  {
    org: 'ASME: Assistive Tech',
    role: 'Lead Software Developer',
    dates: 'Sep 2025 – Mar 2026',
    location: 'State College, PA',
    stack: ['C++', 'Python', 'ESP32', 'Bluetooth'],
    stats: [
      { value: '<200 ms', label: 'audio latency' },
      { value: '5', label: 'person team' },
    ],
    summary: 'Real-time speech-translation glasses built on an ESP32.',
    bullets: [
      'Led a 5-person team building real-time speech-translation glasses on ESP32, achieving <200 ms audio latency.',
      'Built the low-latency audio ingestion, processing, and Bluetooth display path in custom C++/Python firmware.',
      'Integrated microphone, OLED, and Bluetooth modules with custom drivers and debounced I/O.',
    ],
  },
];

export type DemoId = 'protocol' | 'paging';

export type Project = {
  id: string;
  name: string;
  dates: string;
  stack: string[];
  short: string;
  bullets: string[];
  repo?: string;
  demo?: DemoId;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: 'kv',
    name: 'Distributed Key-Value Store',
    dates: 'Jan & Sep 2026',
    stack: ['C++20', 'ASIO', 'GTest', 'TCP'],
    short:
      'A key-value store in C++20 with an async ASIO server, a custom binary wire protocol, and a transactional layer for account transfers.',
    bullets: [
      'Async ASIO server driven by a thread pool, so no thread is pinned to a connection.',
      'Custom length-prefixed binary protocol. The decoder rejects malformed frames instead of misreading them.',
      'Storage-engine interface (ordered map with prefix scans) built so persistence and Raft replication can be added later.',
      'Concurrency-safe transaction layer with deadlock-free money transfers, covered by 46 tests.',
    ],
    repo: 'https://github.com/ADaga460/dist-kv-store',
    demo: 'protocol',
    featured: true,
  },
  {
    id: 'kernel',
    name: 'x86_64 Microkernel',
    dates: 'Dec – Jan 2025',
    stack: ['C', 'x86 Assembly', 'NASM', 'QEMU'],
    short:
      'A 1,200-line microkernel that boots on real hardware into long mode with 4-level paging, a full IDT, and ring-3 syscall gates.',
    bullets: [
      'Boots on real hardware into long mode with 4-level identity-mapped paging.',
      'IDT with 32 exception handlers, including error-code handling and stack-frame management.',
      'Syscall infrastructure with dedicated ring-3 gates for kernel/userspace communication.',
    ],
    repo: 'https://github.com/ADaga460/microkernel',
    demo: 'paging',
    featured: true,
  },
  {
    id: 'gitcontext',
    name: 'GitContext',
    dates: 'Nov – Dec 2025',
    stack: ['C', 'SQLite', 'JSONL', 'GitHub Actions'],
    short:
      'A Unix CLI in C that attaches notes and TODOs to Git commits by reading and writing directly inside .git/.',
    bullets: [
      'Custom file I/O inside the .git/ directory to attach metadata to commits.',
      'JSONL note storage, a SQLite TODO manager, and post-commit/merge/pull hook automation.',
      'Diff-safe merge-driver behavior, repository-scoped daemon mode, and CI/CD with GitHub Actions.',
    ],
    repo: 'https://github.com/ADaga460/gitnotes',
    featured: true,
  },
  {
    id: 'sonar-splat',
    name: 'Sonar Gaussian Splatting (multi-GPU)',
    dates: 'Jan – Apr 2026',
    stack: ['CUDA', 'PyTorch', 'NCCL'],
    short:
      'Took a CUDA Gaussian-splatting framework for synthetic sonar imagery from single-GPU to distributed training, with Lockheed Martin.',
    bullets: [
      'Fixed 11 distributed-training bugs: sharding, gradient all_reduce, NCCL deadlocks, cross-rank densification.',
      'Reached 35.7 dB PSNR / 0.98 SSIM on synthetic underwater imagery.',
      'Benchmarked and profiled to identify per-pixel rasterization as the bottleneck.',
    ],
  },
  {
    id: 'glasses',
    name: 'Speech-Translation Glasses',
    dates: 'Sep 2025 – Mar 2026',
    stack: ['C++', 'ESP32', 'Bluetooth', 'OLED'],
    short: 'ESP32 glasses that caption translated speech in real time, with under 200 ms of audio latency.',
    bullets: [
      'Custom firmware for audio ingestion, processing, and a Bluetooth display path.',
      'Drivers for the microphone, OLED, and Bluetooth modules, with debounced I/O.',
    ],
  },
  {
    id: 'emulator',
    name: 'CPU Emulator',
    dates: '2025',
    stack: ['C'],
    short: 'An instruction-level CPU emulator in C.',
    bullets: [],
    repo: 'https://github.com/ADaga460/emulator',
  },
  {
    id: 'blackhole',
    name: 'Black Hole Simulator',
    dates: '2025',
    stack: ['C++', 'OpenGL'],
    short: 'A black-hole physics and rendering simulation in C++ and OpenGL, written to learn modern C++.',
    bullets: [],
    repo: 'https://github.com/ADaga460/blackhole-sim',
  },
  {
    id: 'newstexter',
    name: 'NewsTexter',
    dates: '2026',
    stack: ['Python', 'FastAPI', 'Docker', 'LLMs'],
    short:
      'Collects under-covered international news, uses an LLM to rank and summarize it, and sends the results by text. It also answers questions sent back by SMS.',
    bullets: [],
    repo: 'https://github.com/ADaga460/newstexter',
  },
];

export const skills: Record<string, string[]> = {
  Languages: ['C', 'C++', 'Go', 'Python', 'Java', 'TypeScript', 'JavaScript', 'Bash', 'x86 Assembly'],
  Systems: ['Linux', 'Kubernetes', 'Docker', 'TCP/IP', 'Multithreading', 'Concurrency', 'Memory Management'],
  'GPU & ML': ['CUDA', 'NCCL', 'PyTorch', 'Distributed Training', 'Profiling'],
  Embedded: ['ESP32', 'Raspberry Pi', 'Firmware', 'Device Drivers', 'SPI/I2C', 'Bluetooth/BLE'],
  Tools: ['Git', 'gdb', 'QEMU', 'NASM', 'GTest', 'Jest', 'SQLite'],
};

export const education = {
  school: 'The Pennsylvania State University',
  degree: 'B.S. Computer Science · Minor in Computer Engineering',
  dates: 'Expected December 2027',
  location: 'University Park, PA',
  honors: ["Dean's List: Spring 2025", "Dean's List: Fall 2025"],
  coursework: {
    'Systems & Hardware': [
      { code: 'CMPSC 311', name: 'Systems Programming' },
      { code: 'CMPEN 331', name: 'Computer Organization & Design' },
      { code: 'CMPEN 362', name: 'Communication Networks' },
      { code: 'CMPEN 270', name: 'Digital Design' },
    ],
    'CS Theory': [
      { code: 'CMPSC 465', name: 'Data Structures & Algorithms' },
      { code: 'CMPSC 464', name: 'Theory of Computation' },
      { code: 'CMPSC 461', name: 'Programming Language Concepts' },
      { code: 'CMPSC 360', name: 'Discrete Math for CS' },
    ],
    'Math & Stats': [
      { code: 'MATH 220', name: 'Matrices / Linear Algebra' },
      { code: 'MATH 231', name: 'Multivariable Calculus' },
      { code: 'STAT 318', name: 'Probability' },
      { code: 'STAT 319', name: 'Mathematical Statistics' },
    ],
  } as Record<string, { code: string; name: string }[]>,
};
