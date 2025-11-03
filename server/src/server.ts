import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import invitationRoutes from './routes/invitations';
import videoRoutes from './routes/videos';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (for logo and assets)
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/videos', videoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WORKORG API is running' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workorg';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Socket.io for real-time video sync
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join project room
  socket.on('join-project', (projectId: string) => {
    socket.join(`project-${projectId}`);
    console.log(`📺 User joined project room: ${projectId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project-${projectId}`);
    console.log(`👋 User left project room: ${projectId}`);
  });

  // Video control events
  socket.on('video-play', (data: { projectId: string; currentTime: number }) => {
    socket.to(`project-${data.projectId}`).emit('video-play', { currentTime: data.currentTime });
  });

  socket.on('video-pause', (data: { projectId: string; currentTime: number }) => {
    socket.to(`project-${data.projectId}`).emit('video-pause', { currentTime: data.currentTime });
  });

  socket.on('video-seek', (data: { projectId: string; currentTime: number }) => {
    socket.to(`project-${data.projectId}`).emit('video-seek', { currentTime: data.currentTime });
  });

  socket.on('video-added', (data: { projectId: string }) => {
    socket.to(`project-${data.projectId}`).emit('video-added');
  });

  socket.on('video-removed', (data: { projectId: string }) => {
    socket.to(`project-${data.projectId}`).emit('video-removed');
  });

  socket.on('video-minimized', (data: { projectId: string; isMinimized: boolean }) => {
    socket.to(`project-${data.projectId}`).emit('video-minimized', { isMinimized: data.isMinimized });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io ready for real-time sync`);
  });
};

startServer();

export { io };
export default app;

