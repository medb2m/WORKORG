import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import Project from '../models/Project';
import User from '../models/User';
import Invitation from '../models/Invitation';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sendProjectInvitation } from '../services/emailService';

const router = express.Router();

// Get all projects for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.userId }, { members: req.userId }],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const hasAccess =
      project.owner._id.toString() === req.userId ||
      project.members.some((member: any) => member._id.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post(
  '/',
  authenticateToken,
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, startDate, endDate, status } = req.body;

      const project = new Project({
        name,
        description,
        startDate,
        endDate,
        owner: req.userId,
        members: [req.userId],
        status: status || 'active',
      });

      await project.save();
      await project.populate('owner', 'name email');
      await project.populate('members', 'name email');

      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update project
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only project owner can update' });
    }

    const { name, description, startDate, endDate, status } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project or send invitation
router.post('/:id/members', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only project owner can add members' });
    }

    // Check if user exists
    const user = await User.findOne({ email: userEmail.toLowerCase() });
    
    if (user) {
      // User exists - add directly to project
      if (project.members.some((member) => member.toString() === (user._id as any).toString())) {
        return res.status(400).json({ message: 'User already a member' });
      }

      project.members.push(user._id as any);
      await project.save();
      await project.populate('members', 'name email');

      return res.json({ 
        message: 'Member added successfully',
        project 
      });
    } else {
      // User doesn't exist - send invitation
      // Check if invitation already exists
      const existingInvitation = await Invitation.findOne({
        email: userEmail.toLowerCase(),
        project: project._id,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (existingInvitation) {
        return res.status(400).json({ 
          message: 'An invitation has already been sent to this email',
          invitation: true 
        });
      }

      // Create invitation
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const invitation = new Invitation({
        email: userEmail.toLowerCase(),
        project: project._id,
        invitedBy: req.userId,
        token: invitationToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      await invitation.save();

      // Get inviter info
      const inviter = await User.findById(req.userId);
      
      // Send invitation email
      try {
        await sendProjectInvitation(
          userEmail,
          project.name,
          inviter?.name || 'A team member',
          invitationToken
        );

        return res.json({
          message: 'Invitation sent successfully',
          invitation: true,
          email: userEmail,
        });
      } catch (emailError) {
        // Delete invitation if email fails
        await Invitation.findByIdAndDelete(invitation._id);
        console.error('Failed to send invitation email:', emailError);
        return res.status(500).json({ 
          message: 'Failed to send invitation email. Please check email configuration.' 
        });
      }
    }
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only project owner can delete' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

