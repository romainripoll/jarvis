"""
Routes API pour l'assistant JARVIS
"""

from flask import Blueprint, request, jsonify
from server.services.claude_service import ClaudeService
from server.services.voice_service import VoiceService
from server.services.task_service import TaskService
from server.services.calendar_service import CalendarService

# Initialisation du blueprint
api_blueprint = Blueprint('api', __name__)

# Initialisation des services
claude_service = ClaudeService()
voice_service = VoiceService()
task_service = TaskService()
calendar_service = CalendarService()

@api_blueprint.route('/ping', methods=['GET'])
def ping():
    """Vérification que l'API fonctionne"""
    return jsonify({"status": "success", "message": "Jarvis API is running"}), 200

@api_blueprint.route('/process_voice', methods=['POST'])
def process_voice():
    """Traite une entrée vocale et renvoie une réponse"""
    audio_data = request.files.get('audio')
    
    if not audio_data:
        return jsonify({"status": "error", "message": "No audio data provided"}), 400
    
    # Reconnaissance vocale
    try:
        text = voice_service.speech_to_text(audio_data)
        
        # Traitement par Claude
        response = claude_service.process_input(text)
        
        # Synthèse vocale de la réponse
        audio_response = voice_service.text_to_speech(response['message'])
        
        return jsonify({
            "status": "success",
            "text": text,
            "response": response,
            "audio_url": audio_response
        }), 200
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@api_blueprint.route('/process_text', methods=['POST'])
def process_text():
    """Traite une entrée textuelle et renvoie une réponse"""
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({"status": "error", "message": "No text provided"}), 400
    
    # Traitement par Claude
    try:
        response = claude_service.process_input(data['text'])
        
        # Synthèse vocale si demandé
        audio_url = None
        if data.get('voice_response', False):
            audio_url = voice_service.text_to_speech(response['message'])
        
        return jsonify({
            "status": "success",
            "response": response,
            "audio_url": audio_url
        }), 200
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@api_blueprint.route('/tasks', methods=['GET', 'POST', 'PUT', 'DELETE'])
def tasks():
    """Gestion des tâches"""
    if request.method == 'GET':
        return jsonify({"status": "success", "tasks": task_service.get_all_tasks()}), 200
    
    elif request.method == 'POST':
        data = request.json
        if not data or 'title' not in data:
            return jsonify({"status": "error", "message": "Task title is required"}), 400
        
        new_task = task_service.create_task(
            title=data['title'],
            description=data.get('description', ''),
            due_date=data.get('due_date'),
            priority=data.get('priority', 'medium')
        )
        
        return jsonify({"status": "success", "task": new_task}), 201
    
    elif request.method == 'PUT':
        data = request.json
        if not data or 'id' not in data:
            return jsonify({"status": "error", "message": "Task ID is required"}), 400
        
        updated_task = task_service.update_task(
            task_id=data['id'],
            title=data.get('title'),
            description=data.get('description'),
            due_date=data.get('due_date'),
            priority=data.get('priority'),
            completed=data.get('completed')
        )
        
        return jsonify({"status": "success", "task": updated_task}), 200
    
    elif request.method == 'DELETE':
        data = request.json
        if not data or 'id' not in data:
            return jsonify({"status": "error", "message": "Task ID is required"}), 400
        
        task_service.delete_task(task_id=data['id'])
        
        return jsonify({"status": "success", "message": "Task deleted"}), 200

@api_blueprint.route('/calendar/events', methods=['GET', 'POST'])
def calendar_events():
    """Gestion des événements du calendrier"""
    if request.method == 'GET':
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        events = calendar_service.get_events(start_date, end_date)
        
        return jsonify({"status": "success", "events": events}), 200
    
    elif request.method == 'POST':
        data = request.json
        
        if not data or 'summary' not in data or 'start' not in data:
            return jsonify({"status": "error", "message": "Event summary and start time are required"}), 400
        
        new_event = calendar_service.create_event(
            summary=data['summary'],
            start=data['start'],
            end=data.get('end'),
            description=data.get('description', ''),
            location=data.get('location', '')
        )
        
        return jsonify({"status": "success", "event": new_event}), 201
