#!/usr/bin/env python3
"""
JARVIS - Assistant Personnel Vocal
Point d'entrée principal de l'application
"""

import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# Initialisation de l'application Flask
app = Flask(__name__, 
            static_folder='client/build/static', 
            template_folder='client/build')
CORS(app)

# Importation des routes API
from server.api.routes import api_blueprint

# Enregistrement des blueprints
app.register_blueprint(api_blueprint, url_prefix='/api')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Route principale pour servir l'application React"""
    return render_template('index.html')

@app.errorhandler(404)
def not_found(e):
    """Gestion des erreurs 404"""
    return jsonify(error=str(e)), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
