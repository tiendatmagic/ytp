'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Video, Music, Loader2, Repeat, Repeat1 } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
}

interface Props {
  currentTrack: Track | null;
  repeatMode: 'off' | 'all' | 'one';
  onRepeatChange: (mode: 'off' | 'all' | 'one') => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Player({ currentTrack, repeatMode, onRepeatChange, onNext, onPrev }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamData, setStreamData] = useState<{ audioUrl: string | null; videoUrl: string | null } | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!currentTrack) return;

    setLoading(true);
    setStreamData(null);
    setIsPlaying(false);

    // Fetch stream URLs
    fetch(`/api/stream?id=${currentTrack.id}`)
      .then(res => res.json())
      .then(data => {
        setStreamData(data);
        setLoading(false);
        setIsPlaying(true);
        setProgress(0);
        setDuration(0);
        setupMediaSession(currentTrack);
      })
      .catch(err => {
        console.error('Failed to load stream', err);
        setLoading(false);
      });
  }, [currentTrack]);

  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const media = isVideoMode ? videoRef.current : audioRef.current;
    if (!media) return;

    const updateTime = () => setProgress(media.currentTime);
    const updateDuration = () => setDuration(media.duration);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [isVideoMode, streamData]);

  useEffect(() => {
    const media = isVideoMode ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying) {
        const p = media.play();
        if (p !== undefined) {
          playPromiseRef.current = p;
          p.catch(console.error);
        }
      } else {
        if (playPromiseRef.current !== null) {
          playPromiseRef.current.then(() => {
            media.pause();
          }).catch(() => {
            // Ignored, handled in play
          });
        } else {
          media.pause();
        }
      }
    }
  }, [isPlaying, isVideoMode, streamData]);

  const setupMediaSession = (track: Track) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.author,
        artwork: [
          { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', onPrev ? () => onPrev() : null);
      navigator.mediaSession.setActionHandler('nexttrack', onNext ? () => onNext() : null);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  if (!currentTrack) return null;

  const currentMediaUrl = isVideoMode ? streamData?.videoUrl : streamData?.audioUrl;

  const handleEnded = () => {
    if (repeatMode === 'one') {
      const media = isVideoMode ? videoRef.current : audioRef.current;
      if (media) {
        media.currentTime = 0;
        const p = media.play();
        if (p !== undefined) {
          playPromiseRef.current = p;
          p.catch(console.error);
        }
      }
    } else {
      if (onNext) onNext();
    }
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') onRepeatChange('all');
    else if (repeatMode === 'all') onRepeatChange('one');
    else onRepeatChange('off');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    const media = isVideoMode ? videoRef.current : audioRef.current;
    if (media) {
      media.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 transition-all">
      {/* Video Container (hidden if audio mode) */}
      <div className={`w-full max-w-4xl mx-auto ${isVideoMode && streamData?.videoUrl ? 'block' : 'hidden'} transition-all`}>
        <video 
          ref={videoRef}
          src={isVideoMode ? (streamData?.videoUrl || undefined) : undefined}
          className="w-full h-auto max-h-[40vh] bg-black aspect-video object-contain"
          controls={false}
          onEnded={handleEnded}
          playsInline
        />
      </div>

      {/* Audio Element (hidden) */}
      <audio 
        ref={audioRef}
        src={!isVideoMode ? (streamData?.audioUrl || undefined) : undefined}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* Timeline */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-2 -mb-2 flex items-center gap-3">
        <span className="text-[10px] text-zinc-500 w-8 text-right font-medium">{formatTime(progress)}</span>
        <input 
          type="range" 
          min={0} 
          max={duration || 0} 
          value={progress} 
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
        />
        <span className="text-[10px] text-zinc-500 w-8 font-medium">{formatTime(duration)}</span>
      </div>

      {/* Control Bar */}
      <div className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentTrack.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">{currentTrack.title}</h4>
            <p className="text-xs text-zinc-500 truncate">{currentTrack.author}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 flex-1">
          <button onClick={toggleRepeat} className={`p-2 transition hidden sm:block ${repeatMode !== 'off' ? 'text-pink-500' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}>
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className={`w-5 h-5 ${repeatMode === 'all' ? 'opacity-100' : 'opacity-50'}`} />}
          </button>
          
          <button onClick={onPrev} disabled={!onPrev} className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition disabled:opacity-50">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button 
            onClick={togglePlay} 
            disabled={loading || !currentMediaUrl}
            className="p-3 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white rounded-full transition disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <button onClick={onNext} disabled={!onNext && repeatMode !== 'all'} className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition disabled:opacity-50">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-end flex-1 gap-2">
          <button 
            onClick={() => {
              if (isVideoMode) videoRef.current?.pause();
              setIsVideoMode(false);
            }}
            className={`p-2 rounded-lg transition ${!isVideoMode ? 'bg-zinc-200 dark:bg-zinc-800 text-pink-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            title="Audio Only Mode"
          >
            <Music className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              if (!isVideoMode) audioRef.current?.pause();
              setIsVideoMode(true);
            }}
            className={`p-2 rounded-lg transition ${isVideoMode ? 'bg-zinc-200 dark:bg-zinc-800 text-pink-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            title="Video Mode"
            disabled={!streamData?.videoUrl && !loading}
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
