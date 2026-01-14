import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, recommendationsRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/recommendations')
      ]);
      setAnalytics(analyticsRes.data);
      setRecommendations(recommendationsRes.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>

      {recommendations.length > 0 && (
        <div className="card recommendations-card">
          <h2>💡 Recommendations</h2>
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`recommendation recommendation-${rec.priority}`}
            >
              <strong>{rec.type.replace('_', ' ').toUpperCase()}</strong>
              <p>{rec.message}</p>
            </div>
          ))}
        </div>
      )}

      {analytics && (
        <div className="dashboard-grid">
          <div className="card stat-card">
            <h3>Workouts</h3>
            <div className="stat-value">{analytics.workouts.total}</div>
            <div className="stat-label">Total (30 days)</div>
            <div className="stat-sub">
              {analytics.workouts.avgPerWeek} per week
            </div>
          </div>

          <div className="card stat-card">
            <h3>Calories Burned</h3>
            <div className="stat-value">
              {analytics.workouts.totalCaloriesBurned.toLocaleString()}
            </div>
            <div className="stat-label">Total (30 days)</div>
          </div>

          <div className="card stat-card">
            <h3>Current Streak</h3>
            <div className="stat-value">{analytics.workouts.currentStreak}</div>
            <div className="stat-label">Days</div>
          </div>

          <div className="card stat-card">
            <h3>Consistency Score</h3>
            <div className="stat-value">{analytics.metrics.consistencyScore}%</div>
            <div className="stat-label">Last 30 days</div>
          </div>

          <div className="card stat-card">
            <h3>Avg Sleep</h3>
            <div className="stat-value">{analytics.wellness.avgSleepHours}h</div>
            <div className="stat-label">Per night</div>
          </div>

          <div className="card stat-card">
            <h3>Weight Change</h3>
            <div className={`stat-value ${analytics.progress.weightChange >= 0 ? 'positive' : 'negative'}`}>
              {analytics.progress.weightChange > 0 ? '+' : ''}
              {analytics.progress.weightChange} kg
            </div>
            <div className="stat-label">Last 30 days</div>
          </div>
        </div>
      )}

      <div className="card quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/workouts" className="btn btn-primary">
            Log Workout
          </Link>
          <Link to="/nutrition" className="btn btn-primary">
            Log Meal
          </Link>
          <Link to="/wellness" className="btn btn-primary">
            Wellness Check-in
          </Link>
          <Link to="/progress" className="btn btn-primary">
            Update Progress
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

