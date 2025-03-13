import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaListUl, FaCalendarAlt, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1>JARVIS</h1>
        <p>Assistant personnel</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              end
            >
              <FaHome className="nav-icon" />
              <span>Tableau de bord</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/tasks" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <FaListUl className="nav-icon" />
              <span>Tâches</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/calendar" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <FaCalendarAlt className="nav-icon" />
              <span>Calendrier</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <FaCog className="nav-icon" />
              <span>Paramètres</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p>Version 0.1.0</p>
        <p>© 2025 JARVIS</p>
      </div>
    </div>
  );
};

export default Sidebar;
