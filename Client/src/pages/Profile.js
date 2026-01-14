import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    activityLevel: '',
    dietPreference: '',
    fitnessGoals: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/users/profile');
      setProfile(res.data);
      setFormData({
        height: res.data.profile?.height || '',
        weight: res.data.profile?.weight || '',
        age: res.data.profile?.age || '',
        activityLevel: res.data.profile?.activityLevel || '',
        dietPreference: res.data.profile?.dietPreference || '',
        fitnessGoals: res.data.profile?.fitnessGoals || []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', formData);
      setShowForm(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleGoalChange = (goal) => {
    const goals = formData.fitnessGoals.includes(goal)
      ? formData.fitnessGoals.filter(g => g !== goal)
      : [...formData.fitnessGoals, goal];
    setFormData({ ...formData, fitnessGoals: goals });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Profile & Fitness Goals</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {!showForm && profile && (
        <div className="profile-display">
          <div className="card">
            <h2>Personal Information</h2>
            <div className="profile-info">
              <div className="info-item">
                <strong>Name:</strong> {profile.name}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {profile.email}
              </div>
              <div className="info-item">
                <strong>Role:</strong> {profile.role}
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Fitness Profile</h2>
            <div className="profile-info">
              {profile.profile?.height && (
                <div className="info-item">
                  <strong>Height:</strong> {profile.profile.height} cm
                </div>
              )}
              {profile.profile?.weight && (
                <div className="info-item">
                  <strong>Weight:</strong> {profile.profile.weight} kg
                </div>
              )}
              {profile.profile?.age && (
                <div className="info-item">
                  <strong>Age:</strong> {profile.profile.age} years
                </div>
              )}
              {profile.profile?.activityLevel && (
                <div className="info-item">
                  <strong>Activity Level:</strong>{' '}
                  {profile.profile.activityLevel.replace('_', ' ')}
                </div>
              )}
              {profile.profile?.dietPreference && (
                <div className="info-item">
                  <strong>Diet Preference:</strong>{' '}
                  {profile.profile.dietPreference}
                </div>
              )}
              {profile.profile?.fitnessGoals &&
                profile.profile.fitnessGoals.length > 0 && (
                  <div className="info-item">
                    <strong>Fitness Goals:</strong>
                    <div className="goals-list">
                      {profile.profile.fitnessGoals.map((goal, idx) => (
                        <span key={idx} className="goal-badge">
                          {goal.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                />
              </div>
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
                <label>Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, activityLevel: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly_active">Lightly Active</option>
                  <option value="moderately_active">Moderately Active</option>
                  <option value="very_active">Very Active</option>
                  <option value="extremely_active">Extremely Active</option>
                </select>
              </div>
              <div className="form-group">
                <label>Diet Preference</label>
                <select
                  value={formData.dietPreference}
                  onChange={(e) =>
                    setFormData({ ...formData, dietPreference: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="omnivore">Omnivore</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Fitness Goals</label>
              <div className="goals-checkboxes">
                {['weight_loss', 'muscle_gain', 'endurance', 'general_fitness'].map(
                  (goal) => (
                    <label key={goal} className="goal-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.fitnessGoals.includes(goal)}
                        onChange={() => handleGoalChange(goal)}
                      />
                      {goal.replace('_', ' ')}
                    </label>
                  )
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;

