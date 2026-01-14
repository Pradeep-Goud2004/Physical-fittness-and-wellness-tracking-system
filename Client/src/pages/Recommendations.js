import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get('/api/recommendations');
      setRecommendations(res.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'recommendation-high';
      case 'medium':
        return 'recommendation-medium';
      case 'low':
        return 'recommendation-low';
      default:
        return '';
    }
  };

  return (
    <div className="container">
      <h1>Personalized Recommendations</h1>

      {recommendations.length === 0 ? (
        <div className="card">
          <p>No recommendations at this time. Keep tracking your workouts and nutrition!</p>
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((rec, index) => (
            <div key={index} className={`card recommendation-card ${getPriorityColor(rec.priority)}`}>
              <div className="recommendation-header">
                <h3>{rec.type.replace('_', ' ').toUpperCase()}</h3>
                <span className={`priority-badge priority-${rec.priority}`}>
                  {rec.priority}
                </span>
              </div>
              <p className="recommendation-message">{rec.message}</p>
              {rec.action && (
                <div className="recommendation-action">
                  <strong>Action:</strong> {rec.action}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;

