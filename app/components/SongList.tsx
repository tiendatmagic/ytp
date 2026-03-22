'use client';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
}

interface Props {
  videos: Video[];
  onPlay: (video: Video) => void;
  // Track currently playing for highlight
  currentVideoId?: string;
}

export default function SongList({ videos, onPlay, currentVideoId }: Props) {
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <p>No results found. Try searching for a track!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl px-4 py-6">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">Results</h2>
      <div className="flex flex-col gap-2">
        {videos.map((v) => {
          const isPlaying = v.id === currentVideoId;
          return (
            <div 
              key={v.id} 
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isPlaying ? 'bg-pink-50 dark:bg-pink-900/20 shadow-sm border border-pink-100 dark:border-pink-900/30' : ''}`}
              onClick={() => onPlay(v)}
            >
              <div className="relative w-24 h-16 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnail} alt={v.title} className="object-cover w-full h-full" />
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                  {v.duration}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold truncate ${isPlaying ? 'text-pink-600 dark:text-pink-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {v.title}
                </h3>
                <p className="text-xs text-zinc-500 truncate">{v.author}</p>
              </div>
              
              {isPlaying && (
                <div className="px-2">
                  <div className="flex items-end gap-[2px] h-4">
                    <div className="w-1 bg-pink-500 animate-bounce h-full" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 bg-pink-500 animate-bounce h-2/3" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 bg-pink-500 animate-bounce h-4/5" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
