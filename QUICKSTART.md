# WORKORG Quick Start Guide

Get up and running with WORKORG in 5 minutes! 🚀

## Prerequisites

Make sure you have installed:
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Git](https://git-scm.com/)

## Quick Setup

### 1. Start MongoDB

**Windows:**
```bash
# MongoDB should be running as a service
# Or start manually:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2. Setup Backend

Open a terminal:

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workorg
JWT_SECRET=my-super-secret-key-change-in-production
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### 3. Setup Frontend

Open a NEW terminal:

```bash
cd client
npm install
```

Create `.env.local` file in `client/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### 4. Open Your Browser

Go to: **http://localhost:3000**

## First Steps

1. **Register an account**
   - Click "Get Started"
   - Fill in your name, email, and password
   - You'll be redirected to the dashboard

2. **Create your first project**
   - Click "New Project" button
   - Name: "My First Project"
   - Description: "Testing WORKORG"
   - Set start date: Today
   - Set end date: One month from today
   - Click "Create Project"

3. **Add your first task**
   - Click on your project
   - Click the "+" button in the "Todo" column
   - Title: "Setup development environment"
   - Set priority to "High"
   - Click "Create Task"

4. **Move tasks through stages**
   - Click the "→" button on your task to move it
   - Watch it move from Todo → In Progress → Review → Done

## Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB connection error
```
**Solution:** Make sure MongoDB is running
- Windows: Check Services (Win + R → services.msc)
- Mac/Linux: `sudo systemctl status mongod`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** 
- Close other applications using port 5000
- Or change PORT in `.env` file

### Cannot Find Module
```
Error: Cannot find module 'express'
```
**Solution:** 
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
**Solution:**
- Make sure `.env` is in the `server/` folder
- Make sure `.env.local` is in the `client/` folder
- Restart both servers after creating env files

## Development Tips

### Backend Changes
The backend will auto-reload when you make changes to files in `server/src/`

### Frontend Changes
Next.js has Fast Refresh - your changes appear instantly in the browser

### View API Docs
Test the API health endpoint:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","message":"WORKORG API is running"}
```

## What's Next?

- Invite team members to your project
- Create multiple tasks with different priorities
- Organize a full sprint timeline
- Check out the [full README](README.md) for more features
- Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to your VPS

## Need Help?

- Check the [main README](README.md)
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Open an issue on GitHub

---

Happy organizing! 🎉

