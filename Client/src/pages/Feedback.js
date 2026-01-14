import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feedback.css';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'question',
    subject: '',
    message: '',
    rating: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/api/feedback');
      setFeedbacks(res.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback', formData);
      setShowForm(false);
      resetForm();
      fetchFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'question',
      subject: '',
      message: '',
      rating: ''
    });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Feedback & Coaching</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
        >
          {showForm ? 'Cancel' : 'Submit Feedback'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Submit Feedback or Question</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <option value="question">Question</option>
                <option value="feedback">Feedback</option>
                <option value="workout_rating">Workout Rating</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                rows="5"
              />
            </div>
            {formData.type === 'workout_rating' && (
              <div className="form-group">
                <label>Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      )}

      <div className="feedbacks-list">
        {feedbacks.length === 0 ? (
          <div className="card">
            <p>No feedback submitted yet.</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback._id} className="card feedback-card">
              <div className="feedback-header">
                <div>
                  <h3>{feedback.subject}</h3>
                  <p className="feedback-meta">
                    {feedback.type.replace('_', ' ').toUpperCase()} •{' '}
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`status-badge status-${feedback.status}`}>
                  {feedback.status}
                </span>
              </div>
              <p className="feedback-message">{feedback.message}</p>
              {feedback.rating && (
                <div className="feedback-rating">
                  <strong>Rating:</strong> {feedback.rating}/5 ⭐
                </div>
              )}
              {feedback.response && (
                <div className="feedback-response">
                  <strong>Response from Trainer:</strong>
                  <p>{feedback.response}</p>
                  <small>
                    {feedback.adminId?.name} •{' '}
                    {new Date(feedback.respondedAt).toLocaleDateString()}
                  </small>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feedback;

