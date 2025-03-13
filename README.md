# JARVIS - Assistant Personnel Vocal

JARVIS est un assistant personnel vocal basé sur l'IA Claude d'Anthropic. Il vous permet de gérer vos tâches, rappels, et agenda via une interface conversationnelle naturelle.

## Fonctionnalités

- 🎙️ Interface vocale pour interagir naturellement
- 📝 Gestion de tâches et listes
- 🔔 Système de rappels
- 📅 Intégration avec calendrier
- 🧠 IA conversationnelle via Claude

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/romainripoll/jarvis.git
cd jarvis

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos clés API

# Lancer l'application
python app.py
```

## Structure du projet

```
├── app.py              # Point d'entrée de l'application
├── server/             # Backend de l'application
│   ├── api/            # Routes API
│   ├── services/       # Services (Claude, reconnaissance vocale, etc.)
│   ├── models/         # Modèles de données
│   └── utils/          # Fonctions utilitaires
├── client/             # Frontend de l'application
│   ├── public/         # Fichiers statiques
│   └── src/            # Code source React
└── tests/              # Tests unitaires et d'intégration
```

## Technologies

- **Backend**: Python (Flask)
- **Frontend**: React.js
- **IA**: API Claude d'Anthropic
- **Reconnaissance vocale**: Web Speech API
- **Base de données**: SQLite (développement), PostgreSQL (production)

## Licence

MIT
