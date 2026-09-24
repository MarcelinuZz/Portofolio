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
    image: '/images/projects/pocketlog.svg',
    technologies: ['Flutter', 'Node.js', 'Express.js', 'MySQL', 'Docker'],
    github: {
      frontend: 'https://github.com/yourusername/pocketlog-frontend',
      backend: 'https://github.com/yourusername/pocketlog-backend'
    },
    overview:
      'PocketLog is a modern personal finance and expense tracking ecosystem engineered around microservices. It handles high-frequency expense logging, automated categorization, and alarm to remind user',
    problem:
      'Many budgeting apps are either locked behind predatory subscriptions or built on slow monolithic backends that fail to sync across multiple devices in real time. Users lacked a clean, distraction-free interface to gain actionable insights into their burn rate.',
    solution:
      'Designed an event-driven microservices architecture where transactions, user authentication, and analytics operate as independent services containerized with Docker, coupled with a cross-platform Flutter application for smooth 60fps mobile interaction.',
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
      'A smart insole concept designed to provide biomechanical feedback and help reduce running-related injuries.',
    image: '/images/projects/stepwise.svg',
    technologies: ['ESP32-C3', 'FSR', 'MPU6050', 'PVDF', 'IoT', 'C++'],
    github: {
      frontend: 'https://github.com/yourusername/stepwise-app',
      backend: 'https://github.com/yourusername/stepwise-firmware'
    },
    liveDemo: null,
    overview:
      'STEPWISE is an embedded wearable technology prototype featuring pressure-sensitive smart insoles. It samples foot-strike dynamics, supination/pronation tendencies, and cadence to alert athletes to poor biomechanics before injuries occur.',
    problem:
      'Repetitive strain and running injuries (such as plantar fasciitis and stress fractures) stem from undetectable gait asymmetries that standard fitness trackers cannot monitor.',
    solution:
      'Integrated an ultra-compact ESP32-C3 micro-controller with an array of Force-Sensing Resistors (FSR), PVDF piezoelectric impact transducers, and a 6-axis MPU6050 inertial measurement unit to capture millisecond-level pressure distributions.',
    myContribution:
      'Wrote low-level C++ firmware for analog sensor polling and I2C telemetry, designed digital low-pass filtering routines to remove footstep noise, and developed an initial Bluetooth Low Energy (BLE) packet protocol.',
    keyLearning:
      'Low-power microcontroller programming, hardware debugging, sensor calibration techniques, and real-time serial telemetry processing.'
  },
  {
    id: 'ai-health-assistant',
    title: 'AI Health Assistant',
    category: 'Artificial Intelligence',
    featured: true,
    shortDescription:
      'An AI-based project exploring disease prediction from user symptoms and recommending an appropriate type of healthcare facility.',
    image: '/images/projects/ai-health.svg',
    technologies: [
      'Python',
      'Scikit-learn',
      'Random Forest',
      'Machine Learning',
      'Pandas',
      'FastAPI'
    ],
    github: {
      frontend: 'https://github.com/yourusername/ai-health-frontend',
      backend: 'https://github.com/yourusername/ai-health-backend'
    },
    liveDemo: 'https://ai-health-assistant.demo.app',
    overview:
      'An intelligent clinical symptom triage engine that evaluates user-reported symptoms using machine learning classifiers and directs individuals to the appropriate tier of care (teleconsultation, general practitioner, or urgent emergency care).',
    problem:
      'Patients experiencing unfamiliar symptoms often face severe anxiety and either delay necessary clinical visits or overcrowd emergency rooms for mild self-limiting conditions.',
    solution:
      'Trained an ensemble Random Forest classifier on multidimensional symptom-disease matrices, combining probability outputs with medical urgency scoring algorithms and a lightweight REST API for instant evaluation.',
    myContribution:
      'Conducted data preprocessing, one-hot vectorization, hyperparameter tuning using Scikit-learn, and implemented a RESTful model serving API using FastAPI with JSON validation.',
    keyLearning:
      'Supervised classification metrics (precision vs. recall in healthcare scenarios), feature importance interpretation, and deploying machine learning inference endpoints.'
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
    return [{ label: 'Source', url: project.github }];
  }

  return [];
}
