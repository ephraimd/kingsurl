"use client"

import { Copy, Delete, Trash } from 'lucide-react';
import { URL } from '@prisma/client';
import { useState } from 'react';

interface URLListProps {
  urls: URL[];
  onDelete: (urlId: string) => Promise<void>
}

export function URLList({ urls, onDelete }: URLListProps) {

  const copyToClipboard = (shortId: string) => {
    const shortUrl = `${window.location.origin}/${shortId}`;
    navigator.clipboard.writeText(shortUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      {urls.map((item) => (
        <div key={item.id} className="card bg-base-100 shadow-xl p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate flex-1">
                {item.title}
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(item.shortId)}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash className="w-4 h-4 text-error" />
              </button>
            </div>
            <p className="text-sm opacity-70 truncate">
              {item.originalUrl}
            </p>
            <p className="text-sm font-medium text-primary">
              {window.location.origin}/{item.shortId}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}