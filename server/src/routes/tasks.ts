import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task';
import Project from '../models/Project';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const hasAccess =
      project.owner.toString() === req.userId ||
      project.members.some((member) => member.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post(
  '/',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, project, assignedTo, status, priority, dueDate, estimatedHours, tags } = req.body;

      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if user has access
      const hasAccess =
        projectDoc.owner.toString() === req.userId ||
        projectDoc.members.some((member) => member.toString() === req.userId);

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const task = new Task({
        title,
        description,
        project,
        assignedTo,
        createdBy: req.userId,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate,
        estimatedHours,
        tags: tags || [],
      });

      await task.save();
      await task.populate('assignedTo', 'name email');
      await task.populate('createdBy', 'name email');

      res.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update task
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const hasAccess =
      project.owner.toString() === req.userId ||
      project.members.some((member) => member.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, assignedTo, status, priority, dueDate, completedAt, estimatedHours, actualHours, tags } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status) {
      task.status = status;
      if (status === 'done' && !task.completedAt) {
        task.completedAt = new Date();
      }
    }
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completedAt !== undefined) task.completedAt = completedAt;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (tags) task.tags = tags;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner or task creator can delete
    const canDelete =
      project.owner.toString() === req.userId ||
      task.createdBy.toString() === req.userId;

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

