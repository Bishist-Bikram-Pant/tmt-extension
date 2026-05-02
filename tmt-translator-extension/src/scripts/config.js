/**
 * Configuration file for TMT Translator Extension
 * Keep your API key private and do not commit to public repositories
 */

// Define CONFIG globally (not as ES6 export for service worker compatibility)
const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'https://tmt.ilprl.ku.edu.np/lang-translate',
    // TODO: Replace with your actual API key from hackathon registration
    API_KEY: 'team_38272f40488364f6',
    REQUEST_TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 1000 // milliseconds
  },

  // Language Codes and Mappings
  LANGUAGES: {
    ENGLISH: { code: 'en', name: 'English', native: 'English' },
    NEPALI: { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    TAMANG: { code: 'tmg', name: 'Tamang', native: 'तामाङ' }
  },

  // API Language Code Mappings (some APIs use different codes)
  API_LANGUAGE_CODES: {
    'en': 'en',      // English
    'ne': 'ne',      // Nepali (confirmed working)
    'tmg': 'tmg',    // Tamang - use primary code first
    'tam': 'tam',    // Tamang alternative
    'tag': 'tag',    // Tamang alternative
    'tg': 'tg'       // Tamang alternative
  },

  // Supported Translation Pairs
  TRANSLATION_PAIRS: [
    { from: 'en', to: 'ne', label: 'English → Nepali' },
    { from: 'ne', to: 'en', label: 'Nepali → English' },
    { from: 'en', to: 'tmg', label: 'English → Tamang' },
    { from: 'tmg', to: 'en', label: 'Tamang → English' },
    { from: 'ne', to: 'tmg', label: 'Nepali → Tamang' },
    { from: 'tmg', to: 'ne', label: 'Tamang → Nepali' }
  ],

  // Translation options
  TRANSLATION: {
    // Maximum characters to send per API call (to respect API limits)
    MAX_CHARS_PER_REQUEST: 500,
    // Delay between API calls in milliseconds (increased to respect rate limits)
    DELAY_BETWEEN_CALLS: 1000,
    // Store translation cache to avoid redundant API calls
    ENABLE_CACHE: true,
    // Cache expiry time in minutes
    CACHE_EXPIRY: 60
  },

  // UI/UX Configuration
  UI: {
    // Maximum number of elements to translate at once
    MAX_ELEMENTS_PER_BATCH: 50,
    // Show loading indicator
    SHOW_LOADING: true,
    // Enable notifications
    ENABLE_NOTIFICATIONS: true
  },

  // Selectors to translate (customize as needed)
  SELECTORS_TO_TRANSLATE: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'span', 'div', 'li', 'td', 'th',
    'a', 'button', 'label', 'title'
  ],

  // Selectors to SKIP (do not translate)
  SELECTORS_TO_SKIP: [
    'script', 'style', 'code', 'pre',
    '.no-translate', '[data-no-translate]',
    '.notification', '.alert'
  ]
};

// CONFIG is now globally available for all scripts
// Service workers access it via importScripts('./config.js')
// Popup accesses it as a global variable
