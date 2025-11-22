'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  onClose?: () => void;
}

export function VideoPlayer({ url, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;
    let hls: any = null;

    const loadVideo = async () => {
      try {
        if (!isMounted) return;
        
        setIsLoading(true);
        setError(null);

        // Check if HLS.js is supported
        if (typeof window !== 'undefined' && 'Hls' in window) {
          const Hls = (window as any).Hls;
          
          if (Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            
            hls.loadSource(url);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
              if (isMounted) {
                setIsLoading(false);
                // Auto-play when ready (muted for browser autoplay policy)
                try {
                  video.muted = true; // Ensure muted for autoplay
                  await video.play();
                  setIsPlaying(true);
                } catch (err: any) {
                  // Autoplay failed, user will need to click play
                  console.log('Autoplay prevented:', err);
                }
              }
            });
            
            hls.on(Hls.Events.ERROR, (_: any, data: any) => {
              if (data.fatal && isMounted) {
                setError(`HLS Error: ${data.type} - ${data.details}`);
                setIsLoading(false);
              }
            });
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = url;
          video.muted = true; // Ensure muted for autoplay
          const handleLoad = async () => {
            if (isMounted) {
              setIsLoading(false);
              // Auto-play when ready (muted for browser autoplay policy)
              try {
                await video.play();
                setIsPlaying(true);
              } catch (err: any) {
                // Autoplay failed, user will need to click play
                console.log('Autoplay prevented:', err);
              }
            }
          };
          video.addEventListener('loadedmetadata', handleLoad);
          
          return () => {
            video.removeEventListener('loadedmetadata', handleLoad);
          };
        } else {
          if (isMounted) {
            setError('HLS is not supported in this browser');
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load video');
          setIsLoading(false);
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
      if (hls) {
        hls.destroy();
      }
      // Pause video to prevent play interruption errors
      if (video) {
        video.pause();
      }
    };
  }, [url]);

  // Sync muted state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  // Set up event listeners (runs once)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (error: any) {
      // Ignore AbortError which happens when play is interrupted
      if (error.name !== 'AbortError') {
        console.error('Playback error:', error);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg sm:rounded-xl border bg-background/80 overflow-hidden shadow-md max-w-2xl mx-auto">
      {/* Video Container */}
      <div className="relative bg-black aspect-video max-h-[280px] sm:max-h-[360px] w-full">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          autoPlay
          muted={isMuted}
          playsInline
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-2" />
              <p className="text-[10px] sm:text-xs">Loading video...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs font-semibold mb-1">⚠️ Playback Error</p>
              <p className="text-[9px] sm:text-[10px] text-gray-300">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 bg-muted/30">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="relative w-full h-1 sm:h-1.5 bg-muted/50 rounded-full overflow-hidden cursor-pointer group">
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Thumb indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${(currentTime / duration) * 100}% - ${window.innerWidth < 640 ? '4px' : '6px'})` }}
            />
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={isLoading || !!error}
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted transition-colors"
              disabled={isLoading || !!error}
            >
              {isMuted ? (
                <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted transition-colors"
            disabled={isLoading || !!error}
          >
            <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

