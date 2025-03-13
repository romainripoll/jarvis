import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaListUl, FaCalendarAlt, FaBell } from 'react-icons/fa';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les tâches
        const tasksResponse = await axios.get('/api/tasks');
        
        // Récupérer les événements du calendrier pour la semaine
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 7);
        
        const eventsResponse = await axios.get('/api/calendar/events', {
          params: {
            start_date: today.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          }
        });
        
        setTasks(tasksResponse.data.tasks || []);
        setEvents(eventsResponse.data.events || []);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtenir les tâches à faire
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Obtenir les événements à venir (triés par date)
  const upcomingEvents = events
    .sort((a, b) => {
      const dateA = new Date(a.start.dateTime || a.start.date);
      const dateB = new Date(b.start.dateTime || b.start.date);
      return dateA - dateB;
    })
    .slice(0, 5); // Limiter aux 5 prochains événements

  // Formatage des dates pour les événements
  const formatEventDate = (eventStart) => {
    const date = new Date(eventStart.dateTime || eventStart.date);
    
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      hour: eventStart.dateTime ? 'numeric' : undefined,
      minute: eventStart.dateTime ? 'numeric' : undefined
    };
    
    return date.toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="dashboard">
      <h1>Tableau de bord</h1>
      
      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : (
        <div className="dashboard-content">
          <div className="card">
            <h2>
              <FaListUl className="card-icon" />
              Tâches à faire
            </h2>
            {incompleteTasks.length === 0 ? (
              <p>Aucune tâche en attente</p>
            ) : (
              <ul className="task-list">
                {incompleteTasks.slice(0, 5).map(task => (
                  <li key={task.id} className={`task-item priority-${task.priority}`}>
                    <div className="task-title">{task.title}</div>
                    {task.due_date && (
                      <div className="task-due-date">
                        {new Date(task.due_date).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="card">
            <h2>
              <FaCalendarAlt className="card-icon" />
              Événements à venir
            </h2>
            {upcomingEvents.length === 0 ? (
              <p>Aucun événement planifié</p>
            ) : (
              <ul className="event-list">
                {upcomingEvents.map(event => (
                  <li key={event.id} className="event-item">
                    <div className="event-title">{event.summary}</div>
                    <div className="event-date">{formatEventDate(event.start)}</div>
                    {event.location && (
                      <div className="event-location">{event.location}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="card">
            <h2>
              <FaBell className="card-icon" />
              Rappels
            </h2>
            <p>Aucun rappel actif</p>
            <div className="card-actions">
              <button className="btn btn-primary">Créer un rappel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
