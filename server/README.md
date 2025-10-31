# WORKORG Backend

Express.js backend API for WORKORG project management system.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Server runs on [http://localhost:5000](http://localhost:5000)

## 📦 Environment Variables

Create `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workorg
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

## 🏗️ Build

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all user projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member

### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 📚 Technologies

- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

