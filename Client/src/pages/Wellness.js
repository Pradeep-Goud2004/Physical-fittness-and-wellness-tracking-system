import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Wellness.css';

const Wellness = () => {
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sleepHours: '',
    waterIntake: '',
    stressLevel: 5,
    isRestDay: false,
    mood: 'good',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWellness();
  }, []);

  const fetchWellness = async () => {
    try {
      const res = await axios.get('/api/wellness');
      setWellnessLogs(res.data);
    } catch (error) {
      console.error('Error fetching wellness:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string numbers to actual numbers
      const wellnessData = {
        ...formData,
        sleepHours: formData.sleepHours ? Number(formData.sleepHours) : undefined,
        waterIntake: formData.waterIntake ? Number(formData.waterIntake) : undefined,
        stressLevel: Number(formData.stressLevel) || 5
      };

      await axios.post('/api/wellness', wellnessData);
      setShowForm(false);
      resetForm();
      fetchWellness();
    } catch (error) {
      console.error('Error saving wellness:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving wellness check-in';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      sleepHours: '',
      waterIntake: '',
      stressLevel: 5,
      isRestDay: false,
      mood: 'good',
      notes: ''
    });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Wellness Tracking</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
        >
          {showForm ? 'Cancel' : 'Wellness Check-in'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Daily Wellness Check-in</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="wellness-grid">
              <div className="form-group">
                <label>Sleep Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) =>
                    setFormData({ ...formData, sleepHours: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Water Intake (liters)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.waterIntake}
                  onChange={(e) =>
                    setFormData({ ...formData, waterIntake: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Stress Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stressLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, stressLevel: e.target.value })
                  }
                />
                <span>{formData.stressLevel}</span>
              </div>
              <div className="form-group">
                <label>Mood</label>
                <select
                  value={formData.mood}
                  onChange={(e) =>
                    setFormData({ ...formData, mood: e.target.value })
                  }
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="okay">Okay</option>
                  <option value="poor">Poor</option>
                  <option value="terrible">Terrible</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isRestDay}
                  onChange={(e) =>
                    setFormData({ ...formData, isRestDay: e.target.checked })
                  }
                />
                Rest Day
              </label>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Check-in
            </button>
          </form>
        </div>
      )}

      <div className="wellness-logs">
        {wellnessLogs.length === 0 ? (
          <div className="card">
            <p>No wellness logs yet. Start tracking your wellness!</p>
          </div>
        ) : (
          wellnessLogs.map((log) => (
            <div key={log._id} className="card wellness-card">
              <div className="wellness-header">
                <h3>{new Date(log.date).toLocaleDateString()}</h3>
                {log.isRestDay && <span className="rest-day-badge">Rest Day</span>}
              </div>
              <div className="wellness-details">
                {log.sleepHours && (
                  <div className="detail-item">
                    <strong>Sleep:</strong> {log.sleepHours} hours
                  </div>
                )}
                {log.waterIntake && (
                  <div className="detail-item">
                    <strong>Water:</strong> {log.waterIntake}L
                  </div>
                )}
                <div className="detail-item">
                  <strong>Stress Level:</strong> {log.stressLevel}/10
                </div>
                {log.mood && (
                  <div className="detail-item">
                    <strong>Mood:</strong> {log.mood}
                  </div>
                )}
                {log.notes && (
                  <div className="wellness-notes">
                    <strong>Notes:</strong> {log.notes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Wellness;

