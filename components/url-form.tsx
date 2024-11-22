"use client"

import { useState } from 'react';
import { Link2 } from 'lucide-react';

interface URLFormProps {
  onSubmit: (url: string, title: string) => void;
}

export function URLForm({ onSubmit }: URLFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    onSubmit(url, title);
    setUrl('');
    setTitle('');
  };

  return (
    <div className="card bg-base-100 shadow-xl p-6 mb-8">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter your URL"
          className="input input-bordered w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter a title (optional)"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button 
          className="btn btn-primary w-full"
          onClick={handleSubmit}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Shorten URL
        </button>
      </div>
    </div>
  );
}