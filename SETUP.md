# Setup Guide

## Quick Start

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running on your system. If using local MongoDB:
```bash
# On Windows (if installed as service, it should start automatically)
# On Mac/Linux
mongod
```

Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env

### 5. Start the Application

**Option 1: Run separately**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

**Option 2: Run both together (if concurrently is installed)**
```bash
npm run dev:all
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First Steps

1. **Register an Account**
   - Go to http://localhost:3000/register
   - Choose "User" role for gym member or "Admin" for trainer
   - Complete registration

2. **Complete Your Profile**
   - Navigate to Profile page
   - Add height, weight, age, activity level, diet preference
   - Set your fitness goals

3. **Start Tracking**
   - Log your first workout
   - Track your meals
   - Complete wellness check-ins
   - Monitor your progress

## Default Test Accounts

You can create test accounts through the registration page:
- User account: Register with role "User"
- Admin account: Register with role "Admin"

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port

### CORS Errors
- Ensure backend is running on port 5000
- Check proxy setting in client/package.json

### Module Not Found
- Run `npm install` in both root and client directories
- Delete node_modules and reinstall if issues persist

