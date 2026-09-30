/**
 * Centralized Projects Data (Section 3)
 * Easily add or edit projects by modifying or appending objects here.
 */
export const projectsData = [
  {
    id: 'pocketlog',
    title: 'PocketLog',
    category: 'Software Development',
    featured: true,
    shortDescription: 'A personal finance application with alarm to support user.',
    image: '/images/projects/pocketlog.webp',
    technologies: ['Flutter', 'Node.js', 'Express.js', 'MySQL', 'Docker'],
    github: {
      frontend: 'http://github.com/Pteraaaa/SoftEng_Kel10',
      backend: 'https://github.com/MarcelinuZz/PocketLogBackend'
    },
    source: null, 
    liveDemo: null,
    overview:
      'PocketLog is a modern personal finance and expense tracking ecosystem engineered around microservices. It handles high-frequency expense logging, automated categorization, and alarm to remind user',
    myContribution:
      'Engineered the full-stack architecture by building the complete backend infrastructure (Express.js/Node.js, MySQL, Docker) and the primary Flutter budgeting interface, ensuring seamless end-to-end integration.',
    keyLearning:
      'Containerized microservices communication, JWT-based security between distributed services, and handling state synchronization across mobile clients.'
  },
  {
    id: 'stepwise',
    title: 'STEPWISE',
    category: 'IoT / Hardware',
    featured: true,
    shortDescription:
      'A smart insole with hybrid energy harvesting concept to prevent injuries.',
    image: '/images/projects/stepwise.webp',
    technologies: ['ESP32-C3', 'FSR', 'MPU6050', 'PVDF', 'IoT'],
    source: 'https://drive.google.com/file/d/1zno_TM-J13Jd2EDPtDvvfhYWMmT5GrxE/view?usp=sharing', 
    liveDemo: null,
    overview:
      'STEPWISE is a smart insole concept designed to help beginner runners improve theiir running form through personalized gait analysis. The system combines IoT, AI, and hybrid energy harvesting with kinetic and solar energy to provide practical insights while minimizing charging frequency',
    myContribution:
      'i designed the IoT system flow and device connectivity. explored suitable sensors and components for the prototype, and turned the idea into a feasible product concept',
    keyLearning:
      'microcontrollers, PCB design, Embedded system, Energy harvestng, Sleep and Burst technique for IoT'
  },
  {
    id: 'cinewave',
    title: 'CineWave',
    category: 'Software Development',
    featured: true,
    shortDescription: 'An online movie reservation website developed during the IT Division Training program.',
    image: '/images/projects/CineWave.webp',
    technologies: ['Express.js', 'React', 'TypeScript', 'SQL Server'],
    github: {
      frontend: 'https://github.com/MarcelinuZz/CineWave_FrontEnd',
      backend: 'https://github.com/MarcelinuZz/CineWave_BackEnd'
    },
    source: null, 
    liveDemo: null,
    overview:
      'CineWave is a comprehensive web application for online movie ticket reservations that allows users to browse movies, select seats, and process transaction securely',
    myContribution:
      'Implemented a full-stack system featuring semi-stateless authentication (PassportJS & JWT with a refresh token mechanism stored in the database), RESTful CRUD APIs, Midtrans payment integration, React frontend components, and database optimization.',
    keyLearning:
      'semi-stateless authentication with jwt, express.js, react, midtrans configuration'
  },
  {
    id: 'BerkatAbadi',
    title: 'BerkatAbadi',
    category: 'Software Development',
    featured: true,
    shortDescription: 'A photocopier rental website I built for my friend',
    image: '/images/projects/BerkatAbadi.webp',
    technologies: ['html', 'css', 'javascript'],
    source: null,
    liveDemo: 'https://www.berkatabadi.net/', 
    overview:
      'Berkat Abadi is a photocopier rental website I built for a friend using only HTML, CSS, and JavaScript. By keeping the project frontend-only and avoiding a backend, we were able to minimize production costs and deploy the website using Vercel with only a domain as an additional expense.',
    myContribution:
      'Collaborated with my partner to design and refine the UI, Conducted direct consultation with client to gather feedback for the ui, improving website performance and SEO',
    keyLearning:
      'Hosting Website, Website Performance, SEO'
  },
    {
    id: 'wutheringwares',
    title: 'WutheringWares',
    category: 'Software Development',
    featured: true,
    shortDescription: 'In-game item marketplace app',
    image: '/images/projects/Wuthering.webp',
    technologies: ['html', 'css', 'javascript'],
    github: {
      frontend: 'https://github.com/MarcelinuZz/WutheringWaresFE',
      backend: 'https://github.com/MarcelinuZz/WutheringWaresBE'
    },
    source: null,
    liveDemo: null, 
    overview:
      'A full-stack marketplace application built to handle in-game item transactions. Designed with strict role management, providing administrators with a dedicated dashboard to add and manage item. For the user-facing side, the app delivers a smooth browsing and purchasing experience, backed by reliable sandbox transaction simulations (via Midtrans) to ensure checkout stability.',
    myContribution:
      'Building entire backend and frontend for aplication',
    keyLearning:
      'Static File Serving, Oauth2 with google and discord'
  },
  {
    id: 'ai-health-assistant',
    title: 'PastiBisa',
    category: 'Artificial Intelligence',
    featured: true,
    shortDescription:
      'An AI-based project for disease prediction from user symptoms and recommending an appropriate type of healthcare facility.',
    image: '/images/projects/pastibisa.webp',
    technologies: [
      'Python',
      'Scikit-learn',
      'Random Forest',
      'Machine Learning',
      'Pandas',
      'FastAPI'
    ],
    source: ['https://colab.research.google.com/drive/1R6fvfXzTLlC-UGelhbR864e-POOe9SJ-?usp=sharing', 'https://github.com/MarcelinuZz/AOL_AI'], 
    liveDemo: null,
    overview:
      'An intelligent clinical symptom triage engine that evaluates user-reported symptoms using machine learning classifiers and directs individuals to the appropriate tier of care (teleconsultation, general practitioner, or urgent emergency care).',
    myContribution:
      'Conducted data preprocessing, one-hot vectorization, hyperparameter tuning using Scikit-learn, and implemented a RESTful model serving API using FastAPI with JSON validation.',
    keyLearning:
      'Supervised classification metrics, feature importance interpretation, and deploying machine learning inference endpoints.'
  }
];

export const projectCategories = [
  'All',
  'Software Development',
  'IoT / Hardware',
  'Artificial Intelligence'
];

/**
 * Normalizes github repository links from project data.
 * Supports:
 * - Object: { frontend: 'url', backend: 'url' }
 * - Flat keys: project.githubFrontend, project.githubBackend
 * - Single string: project.github: 'url'
 */
export function getProjectGithubLinks(project) {
  if (!project) return [];

  if (project.github && typeof project.github === 'object') {
    const links = [];
    if (project.github.frontend) links.push({ label: 'Frontend', url: project.github.frontend });
    if (project.github.backend) links.push({ label: 'Backend', url: project.github.backend });
    Object.entries(project.github).forEach(([key, val]) => {
      if (key !== 'frontend' && key !== 'backend' && typeof val === 'string' && val) {
        links.push({ label: key.charAt(0).toUpperCase() + key.slice(1), url: val });
      }
    });
    if (links.length > 0) return links;
  }

  const flatLinks = [];
  if (project.githubFrontend) flatLinks.push({ label: 'Frontend', url: project.githubFrontend });
  if (project.githubBackend) flatLinks.push({ label: 'Backend', url: project.githubBackend });
  if (flatLinks.length > 0) return flatLinks;

  if (typeof project.github === 'string' && project.github.trim()) {
    return [{ label: 'GitHub', url: project.github }];
  }

  return [];
}

/**
 * Normalizes non-GitHub source code links (e.g. Google Drive, GitLab, zip archives, etc.)
 * Supports:
 * - Single string: project.source: 'url' or project.otherSource: 'url'
 * - Array: project.source: ['url1', 'url2']
 * - Object: project.source: { label: 'url' }
 */
export function getProjectOtherSourceLinks(project) {
  if (!project) return [];

  const sourceVal = project.source || project.otherSource;
  if (!sourceVal) return [];

  if (typeof sourceVal === 'string' && sourceVal.trim()) {
    return [{ label: 'Source', url: sourceVal }];
  }

  if (Array.isArray(sourceVal)) {
    return sourceVal.map((url, i) => ({
      label: i === 0 ? 'Source' : `Source ${i + 1}`,
      url
    }));
  }

  if (typeof sourceVal === 'object') {
    return Object.entries(sourceVal)
      .filter(([, val]) => typeof val === 'string' && val.trim())
      .map(([key, val]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        url: val
      }));
  }

  return [];
}
