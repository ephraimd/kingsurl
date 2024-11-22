"use client"

import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { URLForm } from '@/components/url-form';
import { URLList } from '@/components/url-list';
import { Crown, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { URL } from '@prisma/client';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [visitorId, setVisitorId] = useState<string>('');
  const [loadingMutation, setLoadingMutation] = useState<boolean>(false);

  // Initialize visitorId on component mount
  useEffect(() => {
    const storedId = localStorage.getItem('visitorId');
    const newId = storedId || nanoid(10);
    if (!storedId) {
      localStorage.setItem('visitorId', newId);
    }
    setVisitorId(newId);
  }, []);

  // Use SWR to fetch URLs
  const { data: urls = [], error, isLoading, mutate } = useSWR<URL[]>(
    visitorId ? `/api/urls?userId=${visitorId}` : null,
    fetcher
  );

  // Handle URL creation
  const handleSubmit = async (url: string, title: string) => {
    setLoadingMutation(true);
    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, userId: visitorId }),
      });

      if (response.ok) {
        const newUrl = await response.json();
        // Optimistically update SWR cache
        mutate([...urls, newUrl], false);
      } else {
        const err = await response.json();
        toast.error(`Failed to submit. ${err.error}`);
      }
    } catch (err) {
      toast.error(`Failed to create URL. ${err}`);
    } finally {
      setLoadingMutation(false);
    }
  };

  // Handle URL deletion
  const deleteUrl = async (urlId: string) => {
    setLoadingMutation(true);
    toast.info('Delete url');
    try {
      const response = await fetch(`/api/urls?urlId=${urlId}`, { method: 'DELETE' });
      if (response.ok) {
        // Optimistically update SWR cache
        mutate(urls.filter((url: any) => url.id !== urlId), false);
      } else {
        const err = await response.json();
        toast.error(`Failed to delete. ${err.error}`);
      }
    } catch (err) {
      toast.error(`Failed to delete URL. ${err}`);
    } finally {
      setLoadingMutation(false);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${visitorId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <main className="min-h-screen pb-8">
      <div className="bg-primary text-primary-content py-3 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8" />
            <h1 className="text-4xl font-bold">KingsURL</h1>
          </div>
          <p className="text-center text-lg opacity-90">
            Shorten your URLs and share them in style
          </p>
        </div>
        <div className="container mx-auto p-2 flex-col">
          <div className="flex justify-center">
            <div>User: {visitorId} | Links Remaining: {20 - (urls.length || 0)}</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <URLForm onSubmit={handleSubmit} //loading={loadingMutation} 
        />

        <button
          className="btn btn-outline w-full mb-8"
          onClick={copyShareLink}
          disabled={loadingMutation}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Copy Share Link
        </button>

        {isLoading || loadingMutation ? (
          <div className="flex flex-col gap-3">
            <div className="skeleton h-7 w-full border-primary-foreground"></div>
            <div className="skeleton h-7 w-full"></div>
          </div>
        ) : error ? (
          <div className="alert text-error">Failed to load. {error}</div>
        ) : urls.length === 0 ? (
          <div className="card bg-base-100 p-4">
            <div className="space-y-2">
              You haven't created any links yet. Create your first link!
            </div>
          </div>
        ) : (
          <URLList urls={urls} onDelete={deleteUrl} //loading={loadingMutation}
          />
        )}
      </div>
    </main>
  );
}