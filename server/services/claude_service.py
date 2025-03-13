"""
Service d'intégration avec l'API Claude d'Anthropic
"""

import os
import json
from anthropic import Anthropic

class ClaudeService:
    """Service pour interagir avec l'API Claude d'Anthropic"""
    
    def __init__(self):
        """Initialisation du service Claude"""
        self.client = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))
        self.model = "claude-3-7-sonnet-20250219"  # Utilisation du modèle le plus récent
        self.conversation_history = []
        
        # Système prompt pour définir le comportement de l'assistant
        self.system_prompt = """
        Tu es JARVIS, un assistant personnel vocal intelligent. Tu peux aider avec:
        1. La gestion de tâches et de listes
        2. Les rappels et notifications
        3. La planification d'événements dans un calendrier
        4. La prise de notes et le stockage d'informations

        Réponds de manière concise, naturelle et utile, comme un assistant personnel efficace.
        Si l'utilisateur te demande de créer une tâche, un rappel ou un événement, tu dois extraire
        les informations pertinentes (titre, date, description, etc.) et les formater correctement.
        
        Pour les dates et heures, utilise le format ISO 8601 (YYYY-MM-DDTHH:MM:SS).
        """
    
    def process_input(self, user_input):
        """
        Traite l'entrée utilisateur et génère une réponse avec Claude
        
        Args:
            user_input (str): Le texte d'entrée de l'utilisateur
            
        Returns:
            dict: Un dictionnaire contenant la réponse et les actions à effectuer
        """
        # Ajout de l'entrée utilisateur à l'historique de conversation
        self.conversation_history.append({"role": "user", "content": user_input})
        
        # Création de la liste de messages pour l'API Claude
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # Ajout des derniers messages de l'historique (limitons à 10 pour garder le contexte gérable)
        messages.extend(self.conversation_history[-10:])
        
        # Appel à l'API Claude
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0.7,
            messages=messages
        )
        
        # Extraction du texte de réponse
        assistant_response = response.content[0].text
        
        # Ajout de la réponse à l'historique
        self.conversation_history.append({"role": "assistant", "content": assistant_response})
        
        # Extraction des actions éventuelles (tâches, rappels, événements)
        actions = self._extract_actions(assistant_response)
        
        return {
            "message": assistant_response,
            "actions": actions
        }
    
    def _extract_actions(self, text):
        """
        Analyse le texte de réponse pour extraire les actions à effectuer
        
        Args:
            text (str): Le texte de réponse de Claude
            
        Returns:
            list: Liste des actions à effectuer
        """
        actions = []
        
        # Recherche de patterns indiquant des actions
        if "J'ai créé une tâche" in text or "J'ai ajouté une tâche" in text:
            # Extraction de la tâche
            # Ceci est simplifié, une implémentation réelle utiliserait
            # des expressions régulières ou du NLP plus avancé
            actions.append({
                "type": "task",
                "operation": "create"
            })
        
        if "J'ai programmé un rappel" in text or "Je te rappellerai" in text:
            actions.append({
                "type": "reminder",
                "operation": "create"
            })
        
        if "J'ai ajouté un événement" in text or "J'ai créé un rendez-vous" in text:
            actions.append({
                "type": "calendar_event",
                "operation": "create"
            })
        
        return actions
    
    def clear_history(self):
        """Efface l'historique de la conversation"""
        self.conversation_history = []
