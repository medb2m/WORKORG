import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Invitation from '../models/Invitation';
import Project from '../models/Project';
import { sendWelcomeEmail, sendVerificationEmail } from '../services/emailService';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, invitationToken } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false,
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      let projectInfo = null;

      // If registering via invitation, add user to project
      if (invitationToken) {
        try {
          const invitation = await Invitation.findOne({ 
            token: invitationToken,
            email: email.toLowerCase(),
            status: 'pending'
          }).populate('project', 'name');

          if (invitation && invitation.expiresAt > new Date()) {
            const project = await Project.findById(invitation.project);
            if (project) {
              // Add user to project
              if (!project.members.includes(user._id as any)) {
                project.members.push(user._id as any);
                await project.save();
              }

              // Mark invitation as accepted
              invitation.status = 'accepted';
              await invitation.save();

              projectInfo = {
                id: project._id,
                name: project.name,
              };

              // Mark user as verified (invited users are auto-verified)
              user.isEmailVerified = true;
              user.emailVerificationToken = undefined;
              user.emailVerificationExpires = undefined;
              await user.save();

              // Send welcome email with project info
              try {
                await sendWelcomeEmail(user.email, user.name, project.name);
              } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
              }
            }
          }
        } catch (invitationError) {
          console.error('Error processing invitation:', invitationError);
          // Continue with registration even if invitation processing fails
        }
      } else {
        // Send verification email for regular registration
        try {
          await sendVerificationEmail(user.email, user.name, verificationToken);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }
      }

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
        project: projectInfo,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify Email
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email after verification
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.json({ 
      message: 'Email verified successfully! You can now access all features.' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend Verification Email
router.post(
  '/resend-verification',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ 
          message: 'If an account exists with this email, a verification link has been sent.' 
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ 
          message: 'Email is already verified' 
        });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(user.email, user.name, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({ 
          message: 'Failed to send verification email' 
        });
      }

      res.json({ 
        message: 'Verification email has been sent. Please check your inbox.' 
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;

