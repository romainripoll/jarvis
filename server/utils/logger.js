/**
 * Utilitaire de journalisation pour l'application JARVIS
 * Fournit des fonctions pour enregistrer les événements et les erreurs
 */

const fs = require('fs');
const path = require('path');
const { format } = require('util');

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    
    // Créer le répertoire des logs s'il n'existe pas
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Chemins des fichiers de logs
    this.appLogPath = path.join(this.logDir, 'app.log');
    this.errorLogPath = path.join(this.logDir, 'error.log');
  }
  
  /**
   * Ajoute une entrée dans le journal d'application
   * @param {string} message - Message à journaliser
   * @param {Object} data - Données supplémentaires (optionnel)
   */
  info(message, data = null) {
    const logEntry = this._formatLogEntry('INFO', message, data);
    this._writeToLog(this.appLogPath, logEntry);
    
    // Afficher également dans la console en développement
    if (process.env.NODE_ENV !== 'production') {
      console.log('\x1b[36m%s\x1b[0m', `[INFO] ${message}`);
      if (data) console.log(data);
    }
  }
  
  /**
   * Ajoute une entrée dans le journal d'erreurs
   * @param {string} message - Message d'erreur
   * @param {Error|Object} error - Objet d'erreur ou données supplémentaires
   */
  error(message, error = null) {
    const logEntry = this._formatLogEntry('ERROR', message, error);
    this._writeToLog(this.errorLogPath, logEntry);
    this._writeToLog(this.appLogPath, logEntry);
    
    // Toujours afficher les erreurs dans la console
    console.error('\x1b[31m%s\x1b[0m', `[ERROR] ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(error.stack || error.message);
      } else {
        console.error(error);
      }
    }
  }
  
  /**
   * Ajoute une entrée de débogage (uniquement en développement)
   * @param {string} message - Message de débogage
   * @param {Object} data - Données supplémentaires (optionnel)
   */
  debug(message, data = null) {
    if (process.env.NODE_ENV !== 'production') {
      const logEntry = this._formatLogEntry('DEBUG', message, data);
      this._writeToLog(this.appLogPath, logEntry);
      
      console.log('\x1b[33m%s\x1b[0m', `[DEBUG] ${message}`);
      if (data) console.log(data);
    }
  }
  
  /**
   * Formate une entrée de journal
   * @private
   */
  _formatLogEntry(level, message, data) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        logEntry += `\n${data.stack || data.message}`;
      } else {
        try {
          const dataString = JSON.stringify(data);
          logEntry += `\n${dataString}`;
        } catch (e) {
          logEntry += `\n${format(data)}`;
        }
      }
    }
    
    return logEntry + '\n';
  }
  
  /**
   * Écrit une entrée dans un fichier de journal
   * @private
   */
  _writeToLog(filePath, entry) {
    try {
      fs.appendFileSync(filePath, entry);
    } catch (err) {
      console.error(`Erreur lors de l'écriture dans le journal: ${err.message}`);
    }
  }
}

module.exports = new Logger();
