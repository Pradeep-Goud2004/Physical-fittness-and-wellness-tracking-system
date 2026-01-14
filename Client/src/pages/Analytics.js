import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState({});
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchHeatmap();
    fetchAlerts();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/analytics/dashboard');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const res = await axios.get('/api/analytics/workout-heatmap?days=90');
      setHeatmapData(res.data);
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/analytics/overtraining-alert');
      setAlerts(res.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  const workoutTypeData = analytics?.workouts?.workoutsByType
    ? Object.entries(analytics.workouts.workoutsByType).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container">
      <h1>Analytics Dashboard</h1>

      {alerts && alerts.hasAlerts && (
        <div className="card alerts-card">
          <h2>⚠️ Alerts</h2>
          {alerts.alerts.map((alert, idx) => (
            <div key={idx} className={`alert alert-${alert.severity}`}>
              <strong>{alert.type.replace('_', ' ').toUpperCase()}:</strong> {alert.message}
            </div>
          ))}
        </div>
      )}

      {analytics && (
        <>
          <div className="analytics-grid">
            <div className="card">
              <h2>Workout Statistics</h2>
              <div className="stat-item">
                <strong>Total Workouts:</strong> {analytics.workouts.total}
              </div>
              <div className="stat-item">
                <strong>Total Calories:</strong> {analytics.workouts.totalCaloriesBurned.toLocaleString()}
              </div>
              <div className="stat-item">
                <strong>Total Duration:</strong> {analytics.workouts.totalDuration} minutes
              </div>
              <div className="stat-item">
                <strong>Avg per Week:</strong> {analytics.workouts.avgPerWeek}
              </div>
              <div className="stat-item">
                <strong>Current Streak:</strong> {analytics.workouts.currentStreak} days
              </div>
            </div>

            <div className="card">
              <h2>Wellness Metrics</h2>
              <div className="stat-item">
                <strong>Avg Sleep:</strong> {analytics.wellness.avgSleepHours} hours
              </div>
              <div className="stat-item">
                <strong>Avg Water:</strong> {analytics.wellness.avgWaterIntake}L
              </div>
            </div>

            <div className="card">
              <h2>Performance Metrics</h2>
              <div className="stat-item">
                <strong>Consistency Score:</strong> {analytics.metrics.consistencyScore}%
              </div>
              <div className="stat-item">
                <strong>Fatigue Level:</strong> {analytics.metrics.fatigueLevel}
              </div>
              <div className="stat-item">
                <strong>Weight Change:</strong> {analytics.progress.weightChange > 0 ? '+' : ''}
                {analytics.progress.weightChange} kg
              </div>
            </div>
          </div>

          {workoutTypeData.length > 0 && (
            <div className="card">
              <h2>Workout Types Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workoutTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {workoutTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card">
            <h2>Workout Consistency Heatmap (Last 90 Days)</h2>
            <div className="heatmap-container">
              {Object.keys(heatmapData).length > 0 ? (
                <div className="heatmap">
                  {Object.entries(heatmapData).map(([date, count]) => (
                    <div
                      key={date}
                      className={`heatmap-cell intensity-${Math.min(count, 4)}`}
                      title={`${date}: ${count} workout(s)`}
                    >
                      {count > 0 && count}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No workout data available for the last 90 days.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;

