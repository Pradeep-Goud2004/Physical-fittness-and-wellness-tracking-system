import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Workouts.css';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    workoutType: 'Chest',
    exercises: [{ exerciseName: '', sets: [{ reps: '', weight: '', duration: '' }] }],
    totalDuration: '',
    caloriesBurned: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get('/api/workouts');
      setWorkouts(res.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data: convert strings to numbers and filter empty exercises
      const workoutData = {
        ...formData,
        totalDuration: Number(formData.totalDuration),
        caloriesBurned: formData.caloriesBurned ? Number(formData.caloriesBurned) : 0,
        exercises: formData.exercises.filter(ex => ex.exerciseName && ex.exerciseName.trim() !== '')
      };

      if (editingWorkout) {
        await axios.put(`/api/workouts/${editingWorkout._id}`, workoutData);
      } else {
        await axios.post('/api/workouts', workoutData);
      }
      setShowForm(false);
      setEditingWorkout(null);
      resetForm();
      fetchWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving workout';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await axios.delete(`/api/workouts/${id}`);
        fetchWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
      }
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      date: new Date(workout.date).toISOString().split('T')[0],
      workoutType: workout.workoutType,
      exercises: workout.exercises,
      totalDuration: workout.totalDuration,
      caloriesBurned: workout.caloriesBurned,
      notes: workout.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      workoutType: 'Chest',
      exercises: [{ exerciseName: '', sets: [{ reps: '', weight: '', duration: '' }] }],
      totalDuration: '',
      caloriesBurned: '',
      notes: ''
    });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Workouts</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingWorkout(null);
            resetForm();
          }}
        >
          {showForm ? 'Cancel' : 'Add Workout'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingWorkout ? 'Edit Workout' : 'New Workout'}</h2>
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
            <div className="form-group">
              <label>Workout Type</label>
              <select
                value={formData.workoutType}
                onChange={(e) =>
                  setFormData({ ...formData, workoutType: e.target.value })
                }
                required
              >
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Cardio">Cardio</option>
                <option value="Full Body">Full Body</option>
                <option value="Core">Core</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Total Duration (minutes)</label>
              <input
                type="number"
                value={formData.totalDuration}
                onChange={(e) =>
                  setFormData({ ...formData, totalDuration: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Calories Burned</label>
              <input
                type="number"
                value={formData.caloriesBurned}
                onChange={(e) =>
                  setFormData({ ...formData, caloriesBurned: e.target.value })
                }
              />
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
              {editingWorkout ? 'Update' : 'Save'} Workout
            </button>
          </form>
        </div>
      )}

      <div className="workouts-list">
        {workouts.length === 0 ? (
          <div className="card">
            <p>No workouts logged yet. Start by adding your first workout!</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <div key={workout._id} className="card workout-card">
              <div className="workout-header">
                <div>
                  <h3>{workout.workoutType}</h3>
                  <p className="workout-date">
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="workout-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(workout)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(workout._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="workout-details">
                <div className="detail-item">
                  <strong>Duration:</strong> {workout.totalDuration} minutes
                </div>
                <div className="detail-item">
                  <strong>Calories:</strong> {workout.caloriesBurned || 0}
                </div>
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="exercises-list">
                    <strong>Exercises:</strong>
                    {workout.exercises.map((exercise, idx) => (
                      <div key={idx} className="exercise-item">
                        {exercise.exerciseName}
                      </div>
                    ))}
                  </div>
                )}
                {workout.notes && (
                  <div className="workout-notes">
                    <strong>Notes:</strong> {workout.notes}
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

export default Workouts;

