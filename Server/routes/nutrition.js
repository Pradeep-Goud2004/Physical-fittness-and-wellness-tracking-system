const express = require('express');
const Nutrition = require('../models/Nutrition');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/nutrition
// @desc    Log a meal
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, meals } = req.body;

    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ message: 'At least one meal is required' });
    }

    // Ensure meals have required fields and convert to numbers
    const validMeals = meals.map(meal => ({
      mealType: meal.mealType,
      mealName: meal.mealName || '',
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fats: Number(meal.fats) || 0,
      timing: meal.timing || new Date(),
      notes: meal.notes || ''
    }));

    // Calculate totals
    const totalCalories = validMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = validMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = validMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFats = validMeals.reduce((sum, meal) => sum + meal.fats, 0);

    // Check if nutrition entry exists for this date
    const existingNutrition = await Nutrition.findOne({
      userId: req.user._id,
      date: new Date(date).setHours(0, 0, 0, 0)
    });

    let nutrition;
    if (existingNutrition) {
      // Add meals to existing entry
      existingNutrition.meals.push(...validMeals);
      existingNutrition.totalCalories += totalCalories;
      existingNutrition.totalProtein += totalProtein;
      existingNutrition.totalCarbs += totalCarbs;
      existingNutrition.totalFats += totalFats;
      nutrition = await existingNutrition.save();
    } else {
      // Create new entry
      nutrition = new Nutrition({
        userId: req.user._id,
        date: date || new Date(),
        meals: validMeals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats
      });
      await nutrition.save();
    }

    res.status(201).json(nutrition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/nutrition
// @desc    Get nutrition logs
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const nutritionLogs = await Nutrition.find(query).sort({ date: -1 });
    res.json(nutritionLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/nutrition/:id
// @desc    Get single nutrition entry
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }

    res.json(nutrition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/nutrition/:id
// @desc    Update nutrition entry
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const nutrition = await Nutrition.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }

    // Recalculate totals
    nutrition.totalCalories = nutrition.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    nutrition.totalProtein = nutrition.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    nutrition.totalCarbs = nutrition.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    nutrition.totalFats = nutrition.meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
    await nutrition.save();

    res.json(nutrition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/nutrition/:id
// @desc    Delete nutrition entry
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const nutrition = await Nutrition.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }

    res.json({ message: 'Nutrition entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

