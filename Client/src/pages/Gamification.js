import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Gamification.css';

const Gamification = () => {
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamification();
    fetchLeaderboard();
  }, []);

  const fetchGamification = async () => {
    try {
      const res = await axios.get('/api/gamification');
      setGamification(res.data);
    } catch (error) {
      console.error('Error fetching gamification:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/gamification/leaderboard');
      setLeaderboard(res.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  const getLevelColor = (level) => {
    if (level >= 20) return '#9b59b6';
    if (level >= 15) return '#3498db';
    if (level >= 10) return '#2ecc71';
    if (level >= 5) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="container">
      <h1>Gamification & Achievements</h1>

      {gamification && (
        <div className="gamification-stats">
          <div className="card stat-card-large">
            <div className="level-display" style={{ borderColor: getLevelColor(gamification.level) }}>
              <div className="level-number">Level {gamification.level}</div>
              <div className="xp-progress">
                <div className="xp-bar">
                  <div
                    className="xp-fill"
                    style={{
                      width: `${((gamification.experiencePoints % 1000) / 1000) * 100}%`,
                      backgroundColor: getLevelColor(gamification.level)
                    }}
                  />
                </div>
                <div className="xp-text">
                  {gamification.experiencePoints % 1000} / 1000 XP
                </div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="card">
              <h3>Current Streak</h3>
              <div className="stat-value-large">{gamification.currentStreak}</div>
              <div className="stat-label">Days</div>
            </div>

            <div className="card">
              <h3>Longest Streak</h3>
              <div className="stat-value-large">{gamification.longestStreak}</div>
              <div className="stat-label">Days</div>
            </div>

            <div className="card">
              <h3>Total Workouts</h3>
              <div className="stat-value-large">{gamification.totalWorkouts}</div>
            </div>

            <div className="card">
              <h3>Total Calories</h3>
              <div className="stat-value-large">
                {gamification.totalCaloriesBurned.toLocaleString()}
              </div>
            </div>
          </div>

          {gamification.badges && gamification.badges.length > 0 && (
            <div className="card">
              <h2>🏆 Badges</h2>
              <div className="badges-list">
                {gamification.badges.map((badge, idx) => (
                  <div key={idx} className="badge-item">
                    <div className="badge-icon">🏅</div>
                    <div className="badge-info">
                      <strong>{badge.badgeName}</strong>
                      <small>{badge.description}</small>
                      <small className="badge-date">
                        Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gamification.achievements && gamification.achievements.length > 0 && (
            <div className="card">
              <h2>🎯 Achievements</h2>
              <div className="achievements-list">
                {gamification.achievements.map((achievement, idx) => (
                  <div key={idx} className="achievement-item">
                    <div className="achievement-icon">⭐</div>
                    <div className="achievement-info">
                      <strong>{achievement.achievementName}</strong>
                      <small>{achievement.description}</small>
                      <small className="achievement-date">
                        {new Date(achievement.earnedDate).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>🏆 Leaderboard</h2>
        <div className="leaderboard">
          {leaderboard.length === 0 ? (
            <p>No leaderboard data available.</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Streak</th>
                  <th>Workouts</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry._id}>
                    <td>#{index + 1}</td>
                    <td>{entry.userId?.name || 'Unknown'}</td>
                    <td>{entry.level}</td>
                    <td>{entry.experiencePoints}</td>
                    <td>{entry.currentStreak}</td>
                    <td>{entry.totalWorkouts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gamification;

