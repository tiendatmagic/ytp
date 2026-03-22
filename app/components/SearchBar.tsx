'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl px-4 py-2 flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full shadow-inner focus-within:ring-2 focus-within:ring-pink-500 transition-all">
      <Search className="w-5 h-5 text-zinc-500 mr-2" />
      <input
        type="text"
        className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
        placeholder="Search for music, videos, artists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      {loading && <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>}
    </form>
  );
}
