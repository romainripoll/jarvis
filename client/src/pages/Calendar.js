import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    summary: '',
    start: '',
    end: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      // Calculer le début et la fin du mois
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      const response = await axios.get('/api/calendar/events', {
        params: { start_date: startDate, end_date: endDate }
      });
      
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
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
      if (selectedEvent) {
        // Mise à jour d'un événement existant
        await axios.put(`/api/calendar/events/${selectedEvent.id}`, formData);
      } else {
        // Création d'un nouvel événement
        await axios.post('/api/calendar/events', formData);
      }

      // Réinitialiser le formulaire et récupérer les événements mis à jour
      setFormData({
        summary: '',
        start: '',
        end: '',
        description: '',
        location: ''
      });
      setShowEventForm(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement:', error);
    }
  };

  const handleEdit = (event) => {
    // Formater les dates pour le formulaire
    const start = formatDatetimeForInput(event.start.dateTime || `${event.start.date}T00:00:00`);
    const end = formatDatetimeForInput(event.end.dateTime || `${event.end.date}T00:00:00`);
    
    setFormData({
      summary: event.summary,
      start,
      end,
      description: event.description || '',
      location: event.location || ''
    });
    
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await axios.delete(`/api/calendar/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
      }
    }
  };

  // Formater une date ISO pour l'input datetime-local
  const formatDatetimeForInput = (isoString) => {
    return isoString.slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
  };

  // Générer les jours du mois courant
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Obtenir le premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Déterminer le décalage pour commencer le mois au jour de la semaine correct
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1; // Ajuster pour commencer la semaine le lundi
    
    const totalDays = lastDayOfMonth.getDate();
    const totalCells = Math.ceil((totalDays + startOffset) / 7) * 7;
    
    const days = [];
    
    // Ajouter les jours du mois précédent (cellules vides)
    for (let i = 0; i < startOffset; i++) {
      days.push({ day: null, events: [] });
    }
    
    // Ajouter les jours du mois courant
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Filtrer les événements pour ce jour
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        return eventDate.toISOString().split('T')[0] === dateString;
      });
      
      days.push({ day, date, events: dayEvents });
    }
    
    // Ajouter les jours du mois suivant (cellules vides)
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: null, events: [] });
    }
    
    return days;
  };

  // Changer de mois
  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // Formater la date d'un événement pour l'affichage
  const formatEventTime = (event) => {
    if (event.start.dateTime) {
      const start = new Date(event.start.dateTime);
      return start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return 'Journée entière';
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Calendrier</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setFormData({
              summary: '',
              start: '',
              end: '',
              description: '',
              location: ''
            });
            setSelectedEvent(null);
            setShowEventForm(true);
          }}
        >
          <FaPlus /> Nouvel événement
        </button>
      </div>

      <div className="calendar-navigation">
        <button 
          className="btn btn-secondary" 
          onClick={() => changeMonth(-1)}
        >
          &lt; Mois précédent
        </button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button 
          className="btn btn-secondary" 
          onClick={() => changeMonth(1)}
        >
          Mois suivant &gt;
        </button>
      </div>

      {loading ? (
        <div className="loading">Chargement du calendrier...</div>
      ) : (
        <div className="calendar-grid">
          {/* Jours de la semaine */}
          {weekdays.map((day, index) => (
            <div key={index} className="calendar-header-cell">
              {day}
            </div>
          ))}
          
          {/* Cellules du calendrier */}
          {calendarDays.map((cell, index) => (
            <div 
              key={index} 
              className={`calendar-cell ${!cell.day ? 'empty-cell' : ''} ${
                cell.day && new Date().toDateString() === cell.date.toDateString() ? 'today' : ''
              }`}
            >
              {cell.day && (
                <>
                  <div className="cell-header">{cell.day}</div>
                  <div className="cell-events">
                    {cell.events.slice(0, 3).map((event, idx) => (
                      <div 
                        key={idx} 
                        className="calendar-event"
                        onClick={() => handleEdit(event)}
                      >
                        <div className="event-time">{formatEventTime(event)}</div>
                        <div className="event-title">{event.summary}</div>
                      </div>
                    ))}
                    {cell.events.length > 3 && (
                      <div className="more-events">
                        +{cell.events.length - 3} plus
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showEventForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="summary">Titre*</label>
                <input
                  type="text"
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="start">Début*</label>
                <input
                  type="datetime-local"
                  id="start"
                  name="start"
                  value={formData.start}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="end">Fin*</label>
                <input
                  type="datetime-local"
                  id="end"
                  name="end"
                  value={formData.end}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Lieu</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
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
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEventForm(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedEvent ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
