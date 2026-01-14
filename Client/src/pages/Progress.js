import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Progress.css';

const Progress = () => {
  const [progressData, setProgressData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyMeasurements: {
      chest: '',
      waist: '',
      hips: '',
      biceps: '',
      thighs: ''
    },
    bodyFatPercentage: '',
    muscleMass: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    fetchWeightData();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/progress');
      setProgressData(res.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightData = async () => {
    try {
      const res = await axios.get('/api/progress/weight');
      setWeightData(res.data.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        weight: item.weight
      })));
    } catch (error) {
      console.error('Error fetching weight data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string numbers to actual numbers
      const progressData = {
        ...formData,
        weight: formData.weight ? Number(formData.weight) : undefined,
        bodyFatPercentage: formData.bodyFatPercentage ? Number(formData.bodyFatPercentage) : undefined,
        muscleMass: formData.muscleMass ? Number(formData.muscleMass) : undefined,
        bodyMeasurements: {
          chest: formData.bodyMeasurements.chest ? Number(formData.bodyMeasurements.chest) : undefined,
          waist: formData.bodyMeasurements.waist ? Number(formData.bodyMeasurements.waist) : undefined,
          hips: formData.bodyMeasurements.hips ? Number(formData.bodyMeasurements.hips) : undefined,
          biceps: formData.bodyMeasurements.biceps ? Number(formData.bodyMeasurements.biceps) : undefined,
          thighs: formData.bodyMeasurements.thighs ? Number(formData.bodyMeasurements.thighs) : undefined
        }
      };

      await axios.post('/api/progress', progressData);
      setShowForm(false);
      resetForm();
      fetchProgress();
      fetchWeightData();
    } catch (error) {
      console.error('Error saving progress:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving progress';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyMeasurements: {
        chest: '',
        waist: '',
        hips: '',
        biceps: '',
        thighs: ''
      },
      bodyFatPercentage: '',
      muscleMass: '',
      notes: ''
    });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Progress Tracking</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
        >
          {showForm ? 'Cancel' : 'Log Progress'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Log Progress</h2>
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
            <div className="progress-grid">
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFatPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, bodyFatPercentage: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Muscle Mass (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.muscleMass}
                  onChange={(e) =>
                    setFormData({ ...formData, muscleMass: e.target.value })
                  }
                />
              </div>
            </div>
            <h3>Body Measurements (cm)</h3>
            <div className="measurements-grid">
              <div className="form-group">
                <label>Chest</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyMeasurements.chest}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyMeasurements: {
                        ...formData.bodyMeasurements,
                        chest: e.target.value
                      }
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Waist</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyMeasurements.waist}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyMeasurements: {
                        ...formData.bodyMeasurements,
                        waist: e.target.value
                      }
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Hips</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyMeasurements.hips}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyMeasurements: {
                        ...formData.bodyMeasurements,
                        hips: e.target.value
                      }
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Biceps</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyMeasurements.biceps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyMeasurements: {
                        ...formData.bodyMeasurements,
                        biceps: e.target.value
                      }
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thighs</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyMeasurements.thighs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyMeasurements: {
                        ...formData.bodyMeasurements,
                        thighs: e.target.value
                      }
                    })
                  }
                />
              </div>
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
              Save Progress
            </button>
          </form>
        </div>
      )}

      {weightData.length > 0 && (
        <div className="card">
          <h2>Weight Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="progress-logs">
        {progressData.length === 0 ? (
          <div className="card">
            <p>No progress data yet. Start tracking your progress!</p>
          </div>
        ) : (
          progressData.map((log) => (
            <div key={log._id} className="card progress-card">
              <div className="progress-header">
                <h3>{new Date(log.date).toLocaleDateString()}</h3>
              </div>
              <div className="progress-details">
                {log.weight && (
                  <div className="detail-item">
                    <strong>Weight:</strong> {log.weight} kg
                  </div>
                )}
                {log.bodyFatPercentage && (
                  <div className="detail-item">
                    <strong>Body Fat:</strong> {log.bodyFatPercentage}%
                  </div>
                )}
                {log.muscleMass && (
                  <div className="detail-item">
                    <strong>Muscle Mass:</strong> {log.muscleMass} kg
                  </div>
                )}
                {log.bodyMeasurements && (
                  <div className="measurements-display">
                    <strong>Measurements:</strong>
                    {Object.entries(log.bodyMeasurements)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => (
                        <span key={key}>
                          {key}: {value}cm
                        </span>
                      ))}
                  </div>
                )}
                {log.notes && (
                  <div className="progress-notes">
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

export default Progress;

