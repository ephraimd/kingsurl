"use client"

import { Crown, ExternalLink } from 'lucide-react';
import useSWR from 'swr';
import { URL } from '@prisma/client';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SharePage({ params }: { params: { id: string } }) {
  const { data: urls = [], error, isLoading } = useSWR<URL[]>(
    `/api/urls?userId=${params.id}`,
    fetcher
  );

  return (
    <main className="min-h-screen pb-8">
      <div className="bg-primary text-primary-content py-3 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8" />
            <h1 className="text-4xl font-bold">KingsURL</h1>
          </div>
          <p className="text-center text-lg opacity-90">
            Shared Links Collection
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="space-y-4">
          {isLoading && (
            // Skeleton loaders while data is loading
            <>
              <div className="skeleton h-16 w-full bg-gray-200 rounded-lg"></div>
              <div className="skeleton h-16 w-full bg-gray-200 rounded-lg"></div>
              <div className="skeleton h-16 w-full bg-gray-200 rounded-lg"></div>
            </>
          )}

          {error && (
            // Error message when fetching fails
            <div className="text-error text-center py-4">
              Failed to load shared links. Please try again later.
            </div>
          )}

          {!isLoading && !error && urls.length === 0 && (
            // No links available
            <div className="card bg-base-100 p-8 text-center opacity-70">
              No links found in this collection
            </div>
          )}

          {!isLoading &&
            !error &&
            urls.map((item) => (
              <a
                key={item.id}
                href={item.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm opacity-70">
                        {window.location.origin}/{item.shortId}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 opacity-50" />
                  </div>
                </div>
              </a>
            ))}
        </div>
      </div>
    </main>
  );
}
