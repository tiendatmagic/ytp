'use client';

import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import Player from './components/Player';

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('recentVideos');
    if (saved) {
      try {
        setVideos(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const goHome = () => {
    setHasSearched(false);
    const saved = localStorage.getItem('recentVideos');
    if (saved) {
      try {
        setVideos(JSON.parse(saved));
      } catch (e) {}
    } else {
      setVideos([]);
    }
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
        setCurrentTrackIndex(-1); // Reset track when searching anew
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentTrack = currentTrackIndex >= 0 ? videos[currentTrackIndex] : null;

  const handlePlay = (video: any) => {
    const idx = videos.findIndex(v => v.id === video.id);
    setCurrentTrackIndex(idx);

    // Save to history
    try {
      const saved = localStorage.getItem('recentVideos');
      let recent = saved ? JSON.parse(saved) : [];
      let nextVideos = Array.isArray(recent) ? recent : [];
      
      // Remove if exists
      nextVideos = nextVideos.filter((v: any) => v.id !== video.id);
      
      // Add to front
      nextVideos.unshift(video);
      
      // Limit to 40 items
      nextVideos = nextVideos.slice(0, 40);
      
      localStorage.setItem('recentVideos', JSON.stringify(nextVideos));
    } catch (e) {
      console.error('Error saving history', e);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < videos.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else if (repeatMode === 'all' && videos.length > 0) {
      setCurrentTrackIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center min-h-screen bg-zinc-50 dark:bg-black pb-32">
      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={goHome}>
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-pink-600 to-orange-500 shadow-lg shadow-pink-500/30 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-orange-500">
              YM Clone
            </h1>
          </div>
          
          <div className="w-full sm:w-[400px]">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-start pt-6">
        {!hasSearched && videos.length > 0 && (
          <div className="w-full px-4 mb-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-orange-500">
              Recently Watched
            </h2>
          </div>
        )}
        <SongList 
          videos={videos} 
          onPlay={handlePlay} 
          currentVideoId={currentTrack?.id} 
        />
      </main>

      {/* Player */}
      <Player 
        currentTrack={currentTrack} 
        repeatMode={repeatMode}
        onRepeatChange={setRepeatMode}
        onNext={(currentTrackIndex < videos.length - 1 || repeatMode === 'all') ? handleNext : undefined}
        onPrev={currentTrackIndex > 0 ? handlePrev : undefined}
      />
    </div>
  );
}
