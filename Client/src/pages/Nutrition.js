import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Nutrition.css';

const Nutrition = () => {
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    meals: [{
      mealType: 'breakfast',
      mealName: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    }]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNutrition();
  }, []);

  const fetchNutrition = async () => {
    try {
      const res = await axios.get('/api/nutrition');
      setNutritionLogs(res.data);
    } catch (error) {
      console.error('Error fetching nutrition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string numbers to actual numbers
      const nutritionData = {
        ...formData,
        meals: formData.meals.map(meal => ({
          ...meal,
          calories: Number(meal.calories) || 0,
          protein: Number(meal.protein) || 0,
          carbs: Number(meal.carbs) || 0,
          fats: Number(meal.fats) || 0
        }))
      };

      await axios.post('/api/nutrition', nutritionData);
      setShowForm(false);
      resetForm();
      fetchNutrition();
    } catch (error) {
      console.error('Error saving nutrition:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving meal';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      meals: [{
        mealType: 'breakfast',
        mealName: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: ''
      }]
    });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Nutrition Tracking</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
        >
          {showForm ? 'Cancel' : 'Log Meal'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Log Meal</h2>
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
            {formData.meals.map((meal, index) => (
              <div key={index} className="meal-form">
                <h3>Meal {index + 1}</h3>
                <div className="form-group">
                  <label>Meal Type</label>
                  <select
                    value={meal.mealType}
                    onChange={(e) => {
                      const newMeals = [...formData.meals];
                      newMeals[index].mealType = e.target.value;
                      setFormData({ ...formData, meals: newMeals });
                    }}
                    required
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="pre_workout">Pre-Workout</option>
                    <option value="post_workout">Post-Workout</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Meal Name</label>
                  <input
                    type="text"
                    value={meal.mealName}
                    onChange={(e) => {
                      const newMeals = [...formData.meals];
                      newMeals[index].mealName = e.target.value;
                      setFormData({ ...formData, meals: newMeals });
                    }}
                    required
                  />
                </div>
                <div className="nutrition-grid">
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      value={meal.calories}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index].calories = e.target.value;
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      value={meal.protein}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index].protein = e.target.value;
                        setFormData({ ...formData, meals: newMeals });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      value={meal.carbs}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index].carbs = e.target.value;
                        setFormData({ ...formData, meals: newMeals });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fats (g)</label>
                    <input
                      type="number"
                      value={meal.fats}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index].fats = e.target.value;
                        setFormData({ ...formData, meals: newMeals });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary">
              Save Meal
            </button>
          </form>
        </div>
      )}

      <div className="nutrition-logs">
        {nutritionLogs.length === 0 ? (
          <div className="card">
            <p>No nutrition logs yet. Start tracking your meals!</p>
          </div>
        ) : (
          nutritionLogs.map((log) => (
            <div key={log._id} className="card nutrition-card">
              <div className="nutrition-header">
                <h3>{new Date(log.date).toLocaleDateString()}</h3>
                <div className="nutrition-totals">
                  <span>Calories: {log.totalCalories}</span>
                  <span>Protein: {log.totalProtein}g</span>
                  <span>Carbs: {log.totalCarbs}g</span>
                  <span>Fats: {log.totalFats}g</span>
                </div>
              </div>
              <div className="meals-list">
                {log.meals.map((meal, idx) => (
                  <div key={idx} className="meal-item">
                    <strong>{meal.mealType.replace('_', ' ').toUpperCase()}:</strong>{' '}
                    {meal.mealName} - {meal.calories} cal
                    {meal.protein && ` (P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fats}g)`}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Nutrition;

