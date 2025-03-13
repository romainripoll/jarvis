/**
 * Fichier de configuration pour l'application JARVIS
 * Centralise les paramètres et les constantes de l'application
 */

const config = {
  // Version de l'application
  VERSION: '0.1.0',
  
  // Configuration de l'API Claude
  CLAUDE: {
    MODEL: 'claude-3-7-sonnet-20250219',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7
  },
  
  // Configuration de la reconnaissance vocale
  VOICE: {
    DEFAULT_RATE: 1.0,
    DEFAULT_VOLUME: 0.8,
    PREFERRED_LANGUAGE: 'fr-FR'
  },
  
  // Délais et périodes (en millisecondes)
  TIMEOUTS: {
    CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 heures
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    RESPONSE_TIMEOUT: 30 * 1000 // 30 secondes
  },
  
  // Chemins des fichiers et des répertoires
  PATHS: {
    DATA_DIR: 'data',
    TASKS_FILE: 'tasks.json',
    GOOGLE_TOKEN_FILE: 'token.pickle',
    AUDIO_OUTPUT_DIR: 'client/build/static/audio'
  }
};

module.exports = config;
