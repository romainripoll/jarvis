"""
Service de gestion des tâches pour l'assistant JARVIS
"""

import os
import json
import datetime
from pathlib import Path
import uuid

class TaskService:
    """Service pour gérer les tâches de l'utilisateur"""
    
    def __init__(self):
        """Initialisation du service de tâches"""
        self.data_dir = Path('data')
        self.data_dir.mkdir(exist_ok=True)
        
        self.tasks_file = self.data_dir / 'tasks.json'
        self.tasks = self._load_tasks()
    
    def _load_tasks(self):
        """
        Charge les tâches depuis le fichier JSON
        
        Returns:
            list: Liste des tâches
        """
        if not self.tasks_file.exists():
            return []
        
        try:
            with open(self.tasks_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def _save_tasks(self):
        """Sauvegarde les tâches dans le fichier JSON"""
        with open(self.tasks_file, 'w', encoding='utf-8') as f:
            json.dump(self.tasks, f, ensure_ascii=False, indent=2)
    
    def get_all_tasks(self):
        """
        Récupère toutes les tâches
        
        Returns:
            list: Liste de toutes les tâches
        """
        return self.tasks
    
    def get_task(self, task_id):
        """
        Récupère une tâche par son ID
        
        Args:
            task_id (str): ID de la tâche à récupérer
            
        Returns:
            dict: La tâche trouvée ou None si introuvable
        """
        for task in self.tasks:
            if task['id'] == task_id:
                return task
        return None
    
    def create_task(self, title, description="", due_date=None, priority="medium"):
        """
        Crée une nouvelle tâche
        
        Args:
            title (str): Titre de la tâche
            description (str, optional): Description détaillée
            due_date (str, optional): Date d'échéance au format ISO
            priority (str, optional): Priorité (low, medium, high)
            
        Returns:
            dict: La tâche créée
        """
        task = {
            'id': str(uuid.uuid4()),
            'title': title,
            'description': description,
            'created_at': datetime.datetime.now().isoformat(),
            'due_date': due_date,
            'priority': priority,
            'completed': False
        }
        
        self.tasks.append(task)
        self._save_tasks()
        
        return task
    
    def update_task(self, task_id, title=None, description=None, due_date=None, 
                    priority=None, completed=None):
        """
        Met à jour une tâche existante
        
        Args:
            task_id (str): ID de la tâche à mettre à jour
            title (str, optional): Nouveau titre
            description (str, optional): Nouvelle description
            due_date (str, optional): Nouvelle date d'échéance
            priority (str, optional): Nouvelle priorité
            completed (bool, optional): Statut de complétion
            
        Returns:
            dict: La tâche mise à jour ou None si introuvable
        """
        task = self.get_task(task_id)
        
        if not task:
            return None
        
        if title is not None:
            task['title'] = title
        
        if description is not None:
            task['description'] = description
        
        if due_date is not None:
            task['due_date'] = due_date
        
        if priority is not None:
            task['priority'] = priority
        
        if completed is not None:
            task['completed'] = completed
            if completed:
                task['completed_at'] = datetime.datetime.now().isoformat()
            else:
                task.pop('completed_at', None)
        
        task['updated_at'] = datetime.datetime.now().isoformat()
        
        self._save_tasks()
        
        return task
    
    def delete_task(self, task_id):
        """
        Supprime une tâche
        
        Args:
            task_id (str): ID de la tâche à supprimer
            
        Returns:
            bool: True si supprimée, False sinon
        """
        initial_count = len(self.tasks)
        
        self.tasks = [task for task in self.tasks if task['id'] != task_id]
        
        if len(self.tasks) < initial_count:
            self._save_tasks()
            return True
        
        return False
    
    def get_tasks_by_status(self, completed=False):
        """
        Récupère les tâches selon leur statut
        
        Args:
            completed (bool): Statut de complétion
            
        Returns:
            list: Liste des tâches correspondantes
        """
        return [task for task in self.tasks if task['completed'] == completed]
    
    def get_tasks_by_priority(self, priority):
        """
        Récupère les tâches par priorité
        
        Args:
            priority (str): Priorité à filtrer (low, medium, high)
            
        Returns:
            list: Liste des tâches correspondantes
        """
        return [task for task in self.tasks if task['priority'] == priority]
    
    def get_tasks_by_due_date(self, date):
        """
        Récupère les tâches ayant une date d'échéance spécifique
        
        Args:
            date (str): Date au format ISO YYYY-MM-DD
            
        Returns:
            list: Liste des tâches correspondantes
        """
        return [task for task in self.tasks if task.get('due_date', '').startswith(date)]
    
    def get_overdue_tasks(self):
        """
        Récupère les tâches en retard (non complétées avec date d'échéance passée)
        
        Returns:
            list: Liste des tâches en retard
        """
        today = datetime.datetime.now().date()
        
        overdue_tasks = []
        for task in self.tasks:
            if not task['completed'] and task.get('due_date'):
                due_date = datetime.datetime.fromisoformat(task['due_date']).date()
                if due_date < today:
                    overdue_tasks.append(task)
        
        return overdue_tasks
