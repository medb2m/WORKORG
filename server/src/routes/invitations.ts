import express, { Request, Response } from 'express';
import crypto from 'crypto';
import Invitation from '../models/Invitation';
import Project from '../models/Project';
import User from '../models/User';
import { sendProjectInvitation } from '../services/emailService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get invitation details by token (public route)
router.get('/token/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token })
      .populate('project', 'name description')
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({ message: 'Invitation already accepted' });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    res.json({
      email: invitation.email,
      project: invitation.project,
      invitedBy: invitation.invitedBy,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept invitation (called during registration)
router.post('/accept/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({ message: 'Invitation already accepted' });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    // Add user to project
    const project = await Project.findById(invitation.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    res.json({
      message: 'Invitation accepted successfully',
      project: {
        id: project._id,
        name: project.name,
      },
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend invitation (authenticated route)
router.post('/resend/:invitationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const invitation = await Invitation.findById(req.params.invitationId)
      .populate('project', 'name')
      .populate('invitedBy', 'name');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if user is project owner
    const project = await Project.findById(invitation.project);
    if (!project || project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only project owner can resend invitations' });
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({ message: 'Invitation already accepted' });
    }

    // Generate new token and extend expiry
    invitation.token = crypto.randomBytes(32).toString('hex');
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    invitation.status = 'pending';
    await invitation.save();

    // Resend email
    await sendProjectInvitation(
      invitation.email,
      (invitation.project as any).name,
      (invitation.invitedBy as any).name,
      invitation.token
    );

    res.json({ message: 'Invitation resent successfully' });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all invitations for a project
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

    const invitations = await Invitation.find({ 
      project: req.params.projectId,
      status: { $ne: 'expired' }
    })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

