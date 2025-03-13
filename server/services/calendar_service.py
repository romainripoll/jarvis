"""
Service d'intégration avec Google Calendar
"""

import os
import datetime
import pickle
from pathlib import Path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

class CalendarService:
    """Service pour interagir avec Google Calendar"""
    
    def __init__(self):
        """Initialisation du service de calendrier"""
        self.SCOPES = ['https://www.googleapis.com/auth/calendar']
        self.data_dir = Path('data')
        self.data_dir.mkdir(exist_ok=True)
        
        self.credentials_path = self.data_dir / 'token.pickle'
        self.service = self._authenticate()
        
    def _authenticate(self):
        """
        Authentifie l'application avec l'API Google
        
        Returns:
            googleapiclient.discovery.Resource: Service Google Calendar
        """
        creds = None
        
        # Charge les credentials existants si disponibles
        if self.credentials_path.exists():
            with open(self.credentials_path, 'rb') as token:
                creds = pickle.load(token)
        
        # Si pas de credentials valides, faire la procédure d'authentification
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # Ce bloc sera exécuté lors de la première utilisation ou si les tokens sont invalidés
                client_config = {
                    "installed": {
                        "client_id": os.environ.get('GOOGLE_CLIENT_ID'),
                        "client_secret": os.environ.get('GOOGLE_CLIENT_SECRET'),
                        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token"
                    }
                }
                
                flow = InstalledAppFlow.from_client_config(client_config, self.SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Sauvegarde des credentials pour la prochaine fois
            with open(self.credentials_path, 'wb') as token:
                pickle.dump(creds, token)
        
        try:
            # Construction du service Google Calendar
            return build('calendar', 'v3', credentials=creds)
        except Exception as e:
            print(f"Erreur lors de l'initialisation du service Calendar: {e}")
            return None
    
    def get_events(self, start_date=None, end_date=None, max_results=10):
        """
        Récupère les événements du calendrier entre deux dates
        
        Args:
            start_date (str, optional): Date de début au format YYYY-MM-DD
            end_date (str, optional): Date de fin au format YYYY-MM-DD
            max_results (int, optional): Nombre maximum d'événements à récupérer
            
        Returns:
            list: Liste des événements
        """
        if not self.service:
            return []
        
        # Configuration des paramètres de recherche
        now = datetime.datetime.utcnow()
        
        if start_date:
            start_datetime = datetime.datetime.fromisoformat(f"{start_date}T00:00:00")
        else:
            start_datetime = now
        
        if end_date:
            end_datetime = datetime.datetime.fromisoformat(f"{end_date}T23:59:59")
        else:
            end_datetime = start_datetime + datetime.timedelta(days=7)
        
        # Conversion au format ISO pour l'API
        time_min = start_datetime.isoformat() + 'Z'
        time_max = end_datetime.isoformat() + 'Z'
        
        # Appel à l'API
        try:
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            return events
        except Exception as e:
            print(f"Erreur lors de la récupération des événements: {e}")
            return []
    
    def create_event(self, summary, start, end=None, description="", location=""):
        """
        Crée un nouvel événement dans le calendrier
        
        Args:
            summary (str): Titre de l'événement
            start (str): Date et heure de début au format ISO
            end (str, optional): Date et heure de fin au format ISO
            description (str, optional): Description détaillée
            location (str, optional): Lieu de l'événement
            
        Returns:
            dict: L'événement créé ou None en cas d'erreur
        """
        if not self.service:
            return None
        
        # Si end n'est pas spécifié, créer un événement d'une heure
        if not end:
            start_dt = datetime.datetime.fromisoformat(start)
            end_dt = start_dt + datetime.timedelta(hours=1)
            end = end_dt.isoformat()
        
        # Formater les dates pour l'API
        start_formatted = self._format_datetime_for_api(start)
        end_formatted = self._format_datetime_for_api(end)
        
        # Création de l'événement
        event = {
            'summary': summary,
            'location': location,
            'description': description,
            'start': start_formatted,
            'end': end_formatted
        }
        
        try:
            created_event = self.service.events().insert(
                calendarId='primary',
                body=event
            ).execute()
            
            return created_event
        except Exception as e:
            print(f"Erreur lors de la création de l'événement: {e}")
            return None
    
    def _format_datetime_for_api(self, datetime_str):
        """
        Formate une date/heure pour l'API Google Calendar
        
        Args:
            datetime_str (str): Date et heure au format ISO
            
        Returns:
            dict: Format compatible avec l'API Google
        """
        dt = datetime.datetime.fromisoformat(datetime_str)
        
        # Détermine si la date contient une heure
        if dt.hour == 0 and dt.minute == 0 and dt.second == 0:
            # Date seulement
            return {
                'date': dt.date().isoformat()
            }
        else:
            # Date et heure
            return {
                'dateTime': dt.isoformat(),
                'timeZone': 'Europe/Paris'  # Vous pouvez adapter selon votre fuseau horaire
            }
    
    def update_event(self, event_id, summary=None, start=None, end=None, 
                    description=None, location=None):
        """
        Met à jour un événement existant
        
        Args:
            event_id (str): ID de l'événement à modifier
            summary (str, optional): Nouveau titre
            start (str, optional): Nouvelle date/heure de début
            end (str, optional): Nouvelle date/heure de fin
            description (str, optional): Nouvelle description
            location (str, optional): Nouveau lieu
            
        Returns:
            dict: L'événement mis à jour ou None en cas d'erreur
        """
        if not self.service:
            return None
        
        try:
            # Récupère l'événement actuel
            event = self.service.events().get(
                calendarId='primary',
                eventId=event_id
            ).execute()
            
            # Met à jour les champs nécessaires
            if summary:
                event['summary'] = summary
                
            if description:
                event['description'] = description
                
            if location:
                event['location'] = location
                
            if start:
                event['start'] = self._format_datetime_for_api(start)
                
            if end:
                event['end'] = self._format_datetime_for_api(end)
            
            # Envoie la mise à jour
            updated_event = self.service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event
            ).execute()
            
            return updated_event
        except Exception as e:
            print(f"Erreur lors de la mise à jour de l'événement: {e}")
            return None
    
    def delete_event(self, event_id):
        """
        Supprime un événement du calendrier
        
        Args:
            event_id (str): ID de l'événement à supprimer
            
        Returns:
            bool: True si supprimé avec succès, False sinon
        """
        if not self.service:
            return False
        
        try:
            self.service.events().delete(
                calendarId='primary',
                eventId=event_id
            ).execute()
            
            return True
        except Exception as e:
            print(f"Erreur lors de la suppression de l'événement: {e}")
            return False
