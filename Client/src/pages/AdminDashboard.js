import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerformance, setUserPerformance] = useState(null);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, inactiveRes] = await Promise.all([
        axios.get('/api/admin/analytics'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/inactive-users?days=7')
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setInactiveUsers(inactiveRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPerformance = async (userId) => {
    try {
      const res = await axios.get(`/api/admin/users/${userId}/performance`);
      setUserPerformance(res.data);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Error fetching user performance:', error);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {analytics && (
        <div className="admin-stats-grid">
          <div className="card stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{analytics.totalUsers}</div>
          </div>
          <div className="card stat-card">
            <h3>Active Users</h3>
            <div className="stat-value">{analytics.activeUsers}</div>
            <div className="stat-label">Last 30 days</div>
          </div>
          <div className="card stat-card">
            <h3>Inactive Users</h3>
            <div className="stat-value">{analytics.inactiveUsers}</div>
            <div className="stat-label">Last 7 days</div>
          </div>
          <div className="card stat-card">
            <h3>Total Workouts</h3>
            <div className="stat-value">{analytics.totalWorkouts}</div>
            <div className="stat-label">Last 30 days</div>
          </div>
          <div className="card stat-card">
            <h3>Total Calories</h3>
            <div className="stat-value">
              {analytics.totalCaloriesBurned.toLocaleString()}
            </div>
          </div>
          <div className="card stat-card">
            <h3>Avg Workouts/User</h3>
            <div className="stat-value">{analytics.avgWorkoutsPerUser}</div>
          </div>
        </div>
      )}

      {inactiveUsers.length > 0 && (
        <div className="card">
          <h2>⚠️ Inactive Users (Last 7 Days)</h2>
          <div className="users-list">
            {inactiveUsers.map((user) => (
              <div key={user._id} className="user-item">
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => fetchUserPerformance(user._id)}
                >
                  View Performance
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>All Users</h2>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => fetchUserPerformance(user._id)}
                    >
                      View Performance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userPerformance && selectedUser && (
        <div className="card">
          <h2>User Performance</h2>
          <div className="performance-stats">
            <div className="stat-item">
              <strong>Workouts:</strong> {userPerformance.workouts}
            </div>
            <div className="stat-item">
              <strong>Total Calories Burned:</strong>{' '}
              {userPerformance.totalCaloriesBurned.toLocaleString()}
            </div>
            <div className="stat-item">
              <strong>Avg Daily Calories:</strong>{' '}
              {Math.round(userPerformance.avgDailyCalories)}
            </div>
            {userPerformance.weightProgress && (
              <div className="stat-item">
                <strong>Weight Progress:</strong>
                <div className="weight-progress">
                  {userPerformance.weightProgress.map((wp, idx) => (
                    <span key={idx}>
                      {new Date(wp.date).toLocaleDateString()}: {wp.weight}kg
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

