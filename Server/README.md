# Fitness Tracker Application

A comprehensive fitness tracking application with role-based access for Gym Freaks (Users) and Trainers/Admins.

## Features

### 🔐 Authentication & Role Module
- User & Admin login/registration
- JWT authentication
- Role-based route protection
- Password hashing with bcrypt

### 👤 User Profile & Fitness Goals
- Create and update fitness profile
- Set fitness goals (Weight loss, Muscle gain, Endurance)
- Track height, weight, age, activity level, diet preference

### 💪 Workout Tracking Module
- Add/Edit/Delete workouts
- Track workout type (Chest, Legs, Cardio, etc.)
- Log exercises with sets, reps, weight, duration
- Track calories burned
- Daily workout log and weekly summary

### 🍎 Nutrition & Diet Tracking
- Log meals with calories, protein, carbs, fats
- Track meal timing
- Daily nutrition summaries

### 🏥 Wellness & Health Tracking
- Track sleep hours
- Monitor water intake
- Log stress levels
- Mark rest days
- Daily wellness check-ins

### 📊 Progress Tracking
- Weight progress graphs
- Body measurements tracking
- Strength improvement charts
- Visual analytics with charts

### 📈 Real-Time Analytics
- Workout streaks
- Fatigue detection
- Overtraining alerts
- Consistency scores
- Workout heatmaps

### 💡 Personalized Recommendations
- Workout suggestions
- Rest day reminders
- Hydration alerts
- Nutrition tips based on goals

### 👨‍💼 Admin Dashboard
- View all users
- Monitor user performance
- Identify inactive users
- Create workout plan templates
- Assign workout plans to users

### 💬 Feedback & Coaching
- Submit questions/feedback
- Rate workout plans
- Admin responses and guidance

### 🎮 Gamification
- Workout streaks
- Badges & levels
- Experience points
- Leaderboards
- Achievement rewards

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React
- React Router
- Axios for API calls
- Recharts for visualizations
- CSS3 for styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

3. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Register/Login
1. Register a new account (choose User or Admin role)
2. Login with your credentials

### As a User (Gym Freak)
- Complete your profile with fitness goals
- Log daily workouts
- Track nutrition and meals
- Monitor wellness metrics
- View progress charts
- Get personalized recommendations
- Earn badges and compete on leaderboards

### As an Admin (Trainer/Gym Owner)
- View all users and their performance
- Identify inactive users
- Create workout plan templates
- Assign plans to users
- Respond to user feedback
- View aggregated analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workouts
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/summary/weekly` - Weekly summary

### Nutrition
- `GET /api/nutrition` - Get nutrition logs
- `POST /api/nutrition` - Log meal
- `PUT /api/nutrition/:id` - Update nutrition entry
- `DELETE /api/nutrition/:id` - Delete nutrition entry

### Wellness
- `GET /api/wellness` - Get wellness logs
- `POST /api/wellness` - Create wellness check-in
- `GET /api/wellness/today` - Get today's wellness

### Progress
- `GET /api/progress` - Get progress data
- `POST /api/progress` - Log progress
- `GET /api/progress/weight` - Weight chart data

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/workout-heatmap` - Workout heatmap
- `GET /api/analytics/overtraining-alert` - Overtraining alerts

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Aggregated analytics
- `GET /api/admin/inactive-users` - Inactive users
- `POST /api/admin/workout-plans` - Create workout plan

## Project Structure

```
fitness-tracker/
├── server.js
├── models/
│   ├── User.js
│   ├── Workout.js
│   ├── Nutrition.js
│   ├── Wellness.js
│   ├── Progress.js
│   ├── Gamification.js
│   ├── Feedback.js
│   └── WorkoutPlan.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── workouts.js
│   ├── nutrition.js
│   ├── wellness.js
│   ├── progress.js
│   ├── analytics.js
│   ├── recommendations.js
│   ├── admin.js
│   ├── feedback.js
│   └── gamification.js
├── middleware/
│   └── auth.js
└── client/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── App.js
    └── public/
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation
- Secure API endpoints

## Future Enhancements

- Mobile app (React Native)
- Social features (follow friends, share workouts)
- Advanced AI recommendations
- Integration with fitness wearables
- Video workout tutorials
- Meal planning and recipes

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

