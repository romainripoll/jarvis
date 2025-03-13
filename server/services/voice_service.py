"""
Service de reconnaissance et synthèse vocale
"""

import os
import tempfile
import uuid
import speech_recognition as sr
import pyttsx3
from pathlib import Path

class VoiceService:
    """Service pour la conversion parole-texte et texte-parole"""
    
    def __init__(self):
        """Initialisation du service vocal"""
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        
        # Configuration de la voix
        voices = self.engine.getProperty('voices')
        # Utiliser une voix française si disponible
        french_voice = next((voice for voice in voices if 'fr' in voice.id.lower()), None)
        if french_voice:
            self.engine.setProperty('voice', french_voice.id)
        
        # Paramètres de la voix
        self.engine.setProperty('rate', 175)  # Vitesse de parole
        self.engine.setProperty('volume', 0.8)  # Volume (0-1)
        
        # Répertoire de stockage pour les fichiers audio
        self.output_dir = Path('client/build/static/audio')
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def speech_to_text(self, audio_file):
        """
        Convertit un fichier audio en texte
        
        Args:
            audio_file: Fichier audio à convertir (objet FileStorage de Flask)
            
        Returns:
            str: Texte reconnu
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            audio_file.save(temp_audio.name)
            
            with sr.AudioFile(temp_audio.name) as source:
                audio_data = self.recognizer.record(source)
                
                try:
                    # Utilisation de Google pour la reconnaissance (nécessite une connexion internet)
                    # Spécifier "fr-FR" pour le français
                    text = self.recognizer.recognize_google(audio_data, language="fr-FR")
                    return text
                except sr.UnknownValueError:
                    return "Désolé, je n'ai pas compris ce que vous avez dit."
                except sr.RequestError:
                    return "Désolé, je ne peux pas accéder au service de reconnaissance vocale."
                finally:
                    # Nettoyage du fichier temporaire
                    os.unlink(temp_audio.name)
    
    def text_to_speech(self, text):
        """
        Convertit du texte en parole et enregistre dans un fichier
        
        Args:
            text (str): Texte à convertir en parole
            
        Returns:
            str: URL du fichier audio généré
        """
        # Génération d'un nom de fichier unique
        filename = f"{uuid.uuid4()}.mp3"
        filepath = self.output_dir / filename
        
        # Conversion et enregistrement
        self.engine.save_to_file(text, str(filepath))
        self.engine.runAndWait()
        
        # Retourne l'URL relative pour accès depuis le frontend
        return f"/static/audio/{filename}"

    def cleanup_old_files(self, max_age_hours=24):
        """
        Supprime les fichiers audio plus anciens que max_age_hours
        
        Args:
            max_age_hours (int): Age maximum des fichiers en heures
        """
        import time
        
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for file_path in self.output_dir.glob('*.mp3'):
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > max_age_seconds:
                os.remove(file_path)
