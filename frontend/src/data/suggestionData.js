/**
 * Suggestion datasets for autocomplete in profile and explore preferences.
 * Includes all predefined common options plus expanded industry-standard technologies.
 */

export const SUGGESTED_LANGUAGES = [
  // Predefined Common Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C',
  'C#',
  'PHP',
  'Ruby',
  'Kotlin',
  'Swift',

  // Expanded Common Languages
  'SQL',
  'Dart',
  'R',
  'Shell',
  'Bash',
  'Scala',
  'Lua',
  'Perl',
  'Haskell',
  'Elixir',
  'Clojure',
  'Julia',
  'Objective-C',
  'Assembly',
  'Zig',
  'Solidity',
  'Erlang',
  'F#',
  'Groovy',
  'Fortran',
  'V',
  'Nim',
  'OCaml',
  'PowerShell',
  'HTML/CSS'
];

export const SUGGESTED_SKILLS = [
  // Predefined Common Skills
  'React',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Spring Boot',
  'REST API',
  'SQL',
  'Docker',
  'Git',
  'HTML',
  'CSS',
  'GraphQL',
  'Tailwind CSS',

  // Expanded Frameworks & Technologies
  'SQLite',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Next.js',
  'Vue.js',
  'Angular',
  'Svelte',
  'Django',
  'Flask',
  'FastAPI',
  'Ruby on Rails',
  'ASP.NET Core',
  'Kubernetes',
  'AWS',
  'Azure',
  'Google Cloud',
  'Linux',
  'Nginx',
  'Apache',
  'Kafka',
  'RabbitMQ',
  'Prisma',
  'Mongoose',
  'Redux',
  'Zustand',
  'Vite',
  'Webpack',
  'Jest',
  'Cypress',
  'Playwright',
  'React Native',
  'Flutter',
  'Electron',
  'TensorFlow',
  'PyTorch',
  'Scikit-Learn',
  'Pandas',
  'NumPy',
  'Bootstrap',
  'Sass',
  'Firebase',
  'Supabase',
  'Elasticsearch',
  'CI/CD',
  'GitHub Actions'
];

export const SUGGESTED_INTERESTS = [
  // Predefined Common Interests
  'Web Development',
  'Backend Development',
  'Frontend Development',
  'Mobile Development',
  'AI/ML',
  'DevOps',
  'Data Science',
  'Cybersecurity',
  'Open Source',
  'Documentation',
  'Testing',

  // Expanded Domain Interests
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Cloud Computing',
  'Blockchain & Web3',
  'Distributed Systems',
  'Database Systems',
  'Operating Systems',
  'Compilers & Interpreters',
  'Internet of Things (IoT)',
  'Robotics',
  'Game Development',
  'AR/VR',
  'UI/UX Design',
  'Developer Tools',
  'Big Data',
  'Cryptography',
  'Network Security',
  'Bioinformatics',
  'Embedded Systems',
  'Site Reliability Engineering',
  'Microservices',
  'Accessibility (a11y)',
  'API Design'
];

/**
 * Filter suggestions case-insensitively using partial string and acronym matching.
 * Excludes any item that is already active (case-insensitively).
 *
 * @param {string} query - The typed search string
 * @param {Array<string>} pool - The array of potential suggestions
 * @param {Array<string>} activeItems - Items already selected by the user
 * @param {number} maxResults - Maximum suggestions to return (default 8)
 * @returns {Array<string>} Filtered matching suggestions
 */
export const getMatchingSuggestions = (query, pool = [], activeItems = [], maxResults = 8) => {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const lowerActive = new Set(
    (activeItems || []).map((item) => String(item).toLowerCase().trim())
  );

  const matched = pool.filter((item) => {
    if (!item) return false;
    const lowerItem = String(item).toLowerCase().trim();

    // Prevent duplicate: do not suggest if already active
    if (lowerActive.has(lowerItem)) {
      return false;
    }

    // 1. Direct partial string match
    if (lowerItem.includes(q)) {
      return true;
    }

    // 2. Acronym / Initials match (e.g. 'ai' -> 'Artificial Intelligence')
    const words = lowerItem.split(/[\s/_-]+/).filter(Boolean);
    if (words.length > 1) {
      const initials = words.map((w) => w[0]).join('');
      if (initials === q || initials.startsWith(q)) {
        return true;
      }
    }

    return false;
  });

  // Sort matched suggestions by relevance
  matched.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    // Exact match first
    if (aLower === q) return -1;
    if (bLower === q) return 1;

    // Starts with query first
    const aStarts = aLower.startsWith(q);
    const bStarts = bLower.startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Word in phrase starts with query
    const aWordStarts = aLower.split(/[\s/_-]+/).some((w) => w.startsWith(q));
    const bWordStarts = bLower.split(/[\s/_-]+/).some((w) => w.startsWith(q));
    if (aWordStarts && !bWordStarts) return -1;
    if (!aWordStarts && bWordStarts) return 1;

    return a.localeCompare(b);
  });

  return matched.slice(0, maxResults);
};
