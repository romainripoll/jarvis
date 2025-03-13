import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.tasks || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTaskId) {
        // Mise à jour d'une tâche existante
        await axios.put('/api/tasks', {
          id: editingTaskId,
          ...formData
        });
      } else {
        // Création d'une nouvelle tâche
        await axios.post('/api/tasks', formData);
      }
      
      // Réinitialiser le formulaire et récupérer les tâches mises à jour
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium'
      });
      setShowTaskForm(false);
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tâche:', error);
    }
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium'
    });
    setEditingTaskId(task.id);
    setShowTaskForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await axios.delete('/api/tasks', { data: { id: taskId } });
        fetchTasks();
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
      }
    }
  };

  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      await axios.put('/api/tasks', {
        id: taskId,
        completed: !completed
      });
      fetchTasks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
  };

  // Filtrer les tâches selon le filtre actif
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>Mes Tâches</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              due_date: '',
              priority: 'medium'
            });
            setEditingTaskId(null);
            setShowTaskForm(true);
          }}
        >
          <FaPlus /> Nouvelle tâche
        </button>
      </div>

      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Toutes
        </button>
        <button 
          className={filter === 'active' ? 'active' : ''} 
          onClick={() => setFilter('active')}
        >
          À faire
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''} 
          onClick={() => setFilter('completed')}
        >
          Terminées
        </button>
      </div>

      {loading ? (
        <div className="loading">Chargement des tâches...</div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>Aucune tâche trouvée</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`task-card priority-${task.priority}`}>
                <div className="task-header">
                  <button 
                    className={`completion-button ${task.completed ? 'completed' : ''}`}
                    onClick={() => toggleTaskCompletion(task.id, task.completed)}
                  >
                    <FaCheckCircle />
                  </button>
                  <h3 className={task.completed ? 'completed-text' : ''}>
                    {task.title}
                  </h3>
                </div>
                
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
                
                <div className="task-footer">
                  {task.due_date && (
                    <div className="task-due-date">
                      Échéance: {new Date(task.due_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  
                  <div className="task-actions">
                    <button 
                      className="btn btn-icon" 
                      onClick={() => handleEdit(task)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-icon delete" 
                      onClick={() => handleDelete(task.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showTaskForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingTaskId ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Titre*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="due_date">Date d'échéance</label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priorité</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTaskForm(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTaskId ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
