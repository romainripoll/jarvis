import React, { useState } from 'react';
import { FaSave, FaMicrophone, FaVolumeUp, FaGoogle, FaKey, FaLanguage } from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    language: 'fr',
    speechVolume: 80,
    speechRate: 1.0,
    voiceType: 'female',
    calendarSync: true,
    apiKey: '****************************************',
    darkMode: false,
    notificationsEnabled: true
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setSettings({
      ...settings,
      [name]: value
    });

    // Réinitialiser le message de sauvegarde si l'utilisateur modifie quelque chose
    if (saved) {
      setSaved(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simuler une sauvegarde (dans une vraie application, cela serait envoyé au serveur)
    console.log('Saving settings:', settings);
    
    // Afficher un message de confirmation
    setSaved(true);
    
    // Masquer le message après quelques secondes
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleResetSettings = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      setSettings({
        language: 'fr',
        speechVolume: 80,
        speechRate: 1.0,
        voiceType: 'female',
        calendarSync: true,
        apiKey: '****************************************',
        darkMode: false,
        notificationsEnabled: true
      });
      setSaved(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Paramètres</h1>
      
      {saved && (
        <div className="success-message">
          Paramètres sauvegardés avec succès!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h2>
            <FaLanguage className="section-icon" />
            Langues et régionalisation
          </h2>
          <div className="form-group">
            <label htmlFor="language">Langue de l'interface</label>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleInputChange}
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="es">Espagnol</option>
              <option value="de">Allemand</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>
            <FaVolumeUp className="section-icon" />
            Voix et Parole
          </h2>
          <div className="form-group">
            <label htmlFor="speechVolume">Volume de la voix</label>
            <div className="range-container">
              <input
                type="range"
                id="speechVolume"
                name="speechVolume"
                min="0"
                max="100"
                value={settings.speechVolume}
                onChange={handleInputChange}
              />
              <span>{settings.speechVolume}%</span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="speechRate">Vitesse de parole</label>
            <div className="range-container">
              <input
                type="range"
                id="speechRate"
                name="speechRate"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speechRate}
                onChange={handleInputChange}
              />
              <span>{settings.speechRate}x</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Type de voix</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="voiceType"
                  value="male"
                  checked={settings.voiceType === 'male'}
                  onChange={handleInputChange}
                />
                Masculine
              </label>
              <label>
                <input
                  type="radio"
                  name="voiceType"
                  value="female"
                  checked={settings.voiceType === 'female'}
                  onChange={handleInputChange}
                />
                Féminine
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>
            <FaMicrophone className="section-icon" />
            Reconnaissance vocale
          </h2>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="continuousListening"
                checked={settings.continuousListening}
                onChange={handleInputChange}
              />
              Écoute continue (mode mains libres)
            </label>
            <p className="help-text">
              Permet à JARVIS d'écouter en permanence pour le mot d'activation
            </p>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>
            <FaGoogle className="section-icon" />
            Intégrations
          </h2>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="calendarSync"
                checked={settings.calendarSync}
                onChange={handleInputChange}
              />
              Synchronisation avec Google Calendar
            </label>
          </div>
          <button type="button" className="btn btn-secondary">
            Configurer les intégrations
          </button>
        </div>
        
        <div className="settings-section">
          <h2>
            <FaKey className="section-icon" />
            API et sécurité
          </h2>
          <div className="form-group">
            <label htmlFor="apiKey">Clé API Claude (Anthropic)</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={settings.apiKey}
              onChange={handleInputChange}
            />
            <p className="help-text">
              Nécessaire pour le fonctionnement de l'assistant IA
            </p>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Interface</h2>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleInputChange}
              />
              Mode sombre
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={handleInputChange}
              />
              Activer les notifications
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleResetSettings}
          >
            Réinitialiser
          </button>
          <button type="submit" className="btn btn-primary">
            <FaSave /> Sauvegarder
          </button>
        </div>
      </form>
      
      <div className="settings-info">
        <h3>À propos de JARVIS</h3>
        <p>Version: 0.1.0</p>
        <p>© 2025 - Créé par Romain Ripoll</p>
      </div>
    </div>
  );
};

export default Settings;
