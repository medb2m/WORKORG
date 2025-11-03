import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import SharedVideo from '../models/SharedVideo';
import Project from '../models/Project';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Get shared video for a project
router.get('/project/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    // Check if user has access to project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess =
      project.owner.toString() === req.userId ||
      project.members.some((member: any) => member.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const video = await SharedVideo.findOne({ project: projectId })
      .populate('addedBy', 'name email');

    if (!video) {
      return res.json(null);
    }

    res.json(video);
  } catch (error) {
    console.error('Get shared video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add or update shared video for a project
router.post(
  '/project/:projectId',
  authenticateToken,
  [
    body('videoUrl').notEmpty().withMessage('Video URL is required'),
    body('title').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { projectId } = req.params;
      const { videoUrl, title } = req.body;

      // Check if user has access to project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const hasAccess =
        project.owner.toString() === req.userId ||
        project.members.some((member: any) => member.toString() === req.userId);

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Extract YouTube video ID
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ 
          message: 'Invalid YouTube URL. Please provide a valid YouTube video link.' 
        });
      }

      // Create or update shared video
      let video = await SharedVideo.findOne({ project: projectId });

      if (video) {
        video.videoUrl = videoUrl;
        video.videoId = videoId;
        video.title = title;
        video.isPlaying = false;
        video.currentTime = 0;
        video.addedBy = req.userId as any;
        await video.save();
      } else {
        video = new SharedVideo({
          project: projectId,
          videoUrl,
          videoId,
          title,
          isPlaying: false,
          currentTime: 0,
          isMinimized: false,
          addedBy: req.userId,
        });
        await video.save();
      }

      await video.populate('addedBy', 'name email');

      res.json(video);
    } catch (error) {
      console.error('Add shared video error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update video state (play/pause/seek)
router.put('/project/:projectId/state', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { isPlaying, currentTime, isMinimized } = req.body;

    const video = await SharedVideo.findOne({ project: projectId });
    if (!video) {
      return res.status(404).json({ message: 'No shared video found' });
    }

    if (isPlaying !== undefined) video.isPlaying = isPlaying;
    if (currentTime !== undefined) video.currentTime = currentTime;
    if (isMinimized !== undefined) video.isMinimized = isMinimized;

    await video.save();

    res.json(video);
  } catch (error) {
    console.error('Update video state error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove shared video from project
router.delete('/project/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    // Check if user has access to project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess =
      project.owner.toString() === req.userId ||
      project.members.some((member: any) => member.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await SharedVideo.deleteOne({ project: projectId });

    res.json({ message: 'Shared video removed successfully' });
  } catch (error) {
    console.error('Remove shared video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

