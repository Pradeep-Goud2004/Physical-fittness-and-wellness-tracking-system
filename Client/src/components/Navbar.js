import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          💪 Fitness Tracker
        </Link>
        <div className="navbar-links">
          {user.role === 'user' && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/workouts">Workouts</Link>
              <Link to="/nutrition">Nutrition</Link>
              <Link to="/wellness">Wellness</Link>
              <Link to="/progress">Progress</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/recommendations">Recommendations</Link>
              <Link to="/gamification">Gamification</Link>
              <Link to="/feedback">Feedback</Link>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/admin">Admin Dashboard</Link>
              <Link to="/analytics">Analytics</Link>
            </>
          )}
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

