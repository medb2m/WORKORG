'use client';

import { useEffect, useState, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { 
  Minimize2, 
  Maximize2, 
  X, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:5000/api');
// Connect to same origin in production (works through Nginx)
const SOCKET_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? window.location.origin 
  : 'http://localhost:5000';

interface SharedVideoPlayerProps {
  projectId: string;
  onClose: () => void;
}

interface VideoData {
  _id: string;
  videoId: string;
  videoUrl: string;
  title?: string;
  isPlaying: boolean;
  currentTime: number;
  isMinimized: boolean;
  addedBy: {
    name: string;
    email: string;
  };
}

export default function SharedVideoPlayer({ projectId, onClose }: SharedVideoPlayerProps) {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const isSyncingRef = useRef(false);

  // Load video data
  useEffect(() => {
    loadVideoData();
  }, [projectId]);

  // Socket.io connection
  useEffect(() => {
    console.log('🔌 Connecting to Socket.io at:', SOCKET_URL);
    
    const socket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.io, ID:', socket.id);
      socket.emit('join-project', projectId);
      console.log('📺 Joining project room:', projectId);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    // Listen for video control events
    socket.on('video-play', ({ currentTime }: { currentTime: number }) => {
      console.log('📡 Received video-play event, time:', currentTime);
      if (playerRef.current && !isSyncingRef.current) {
        isSyncingRef.current = true;
        playerRef.current.seekTo(currentTime, true);
        playerRef.current.playVideo();
        console.log('▶️ Playing video at:', currentTime);
        setTimeout(() => { isSyncingRef.current = false; }, 500);
      }
    });

    socket.on('video-pause', ({ currentTime }: { currentTime: number }) => {
      console.log('📡 Received video-pause event, time:', currentTime);
      if (playerRef.current && !isSyncingRef.current) {
        isSyncingRef.current = true;
        playerRef.current.seekTo(currentTime, true);
        playerRef.current.pauseVideo();
        console.log('⏸️ Pausing video at:', currentTime);
        setTimeout(() => { isSyncingRef.current = false; }, 500);
      }
    });

    socket.on('video-seek', ({ currentTime }: { currentTime: number }) => {
      console.log('📡 Received video-seek event, time:', currentTime);
      if (playerRef.current && !isSyncingRef.current) {
        isSyncingRef.current = true;
        playerRef.current.seekTo(currentTime, true);
        console.log('⏩ Seeking to:', currentTime);
        setTimeout(() => { isSyncingRef.current = false; }, 500);
      }
    });

    socket.on('video-added', () => {
      loadVideoData();
    });

    socket.on('video-removed', () => {
      onClose();
    });

    socket.on('video-minimized', ({ isMinimized }: { isMinimized: boolean }) => {
      setIsMinimized(isMinimized);
    });

    return () => {
      socket.emit('leave-project', projectId);
      socket.disconnect();
    };
  }, [projectId]);

  const loadVideoData = async () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) return;

      const { state } = JSON.parse(authStorage);
      const token = state?.token;

      const response = await fetch(`${API_URL}/videos/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVideoData(data);
      }
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (videoData?.currentTime) {
      event.target.seekTo(videoData.currentTime, true);
    }
    if (videoData?.isPlaying) {
      event.target.playVideo();
    }
  };

  const handlePlay = () => {
    if (!isSyncingRef.current && playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      console.log('🎬 Broadcasting video-play event, time:', currentTime);
      socketRef.current?.emit('video-play', { projectId, currentTime });
    }
  };

  const handlePause = () => {
    if (!isSyncingRef.current && playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      console.log('🎬 Broadcasting video-pause event, time:', currentTime);
      socketRef.current?.emit('video-pause', { projectId, currentTime });
    }
  };

  const handleSeek = () => {
    if (!isSyncingRef.current && playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      console.log('🎬 Broadcasting video-seek event, time:', currentTime);
      socketRef.current?.emit('video-seek', { projectId, currentTime });
    }
  };

  const toggleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    socketRef.current?.emit('video-minimized', { projectId, isMinimized: newState });
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleRemoveVideo = async () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) return;

      const { state } = JSON.parse(authStorage);
      const token = state?.token;

      await fetch(`${API_URL}/videos/project/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      socketRef.current?.emit('video-removed', { projectId });
      onClose();
    } catch (error) {
      console.error('Failed to remove video:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-4 z-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm text-gray-600">Loading video...</span>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return null;
  }

  const opts: YouTubeProps['opts'] = {
    height: isMinimized ? '0' : '315',
    width: isMinimized ? '0' : '560',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div
      className={`fixed z-50 bg-white rounded-xl shadow-2xl transition-all duration-300 ${
        isMinimized
          ? 'bottom-4 right-4 w-80'
          : 'bottom-4 right-4 w-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {videoData.title || 'Shared Video'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              Added by {videoData.addedBy?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={toggleMinimize}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleRemoveVideo}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove video"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Video Player */}
      {!isMinimized && (
        <div className="p-4">
          <div className="rounded-lg overflow-hidden">
            <YouTube
              videoId={videoData.videoId}
              opts={opts}
              onReady={handlePlayerReady}
              onPlay={handlePlay}
              onPause={handlePause}
              onStateChange={(event: any) => {
                // Handle seeking
                const currentTime = event.target.getCurrentTime();
                const expectedTime = videoData.currentTime;
                if (Math.abs(currentTime - expectedTime) > 2) {
                  handleSeek();
                }
              }}
            />
          </div>
          <div className="mt-3 px-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>🔗 Synced with team</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Video minimized
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

