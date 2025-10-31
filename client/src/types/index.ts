// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Project Types
export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  owner: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

// Task Types
export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignedTo?: User;
  createdBy: User;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: any[];
}

