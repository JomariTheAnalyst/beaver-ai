'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import EnhancedLandingPage from '@/components/EnhancedLandingPage';

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span className="inline-block w-3 h-3 bg-primary-500 rounded-full mr-2 animate-bounce"></span>
            <span className="inline-block w-3 h-3 bg-primary-500 rounded-full mr-2 animate-bounce [animation-delay:0.1s]"></span>
            <span className="inline-block w-3 h-3 bg-secondary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          </div>
          <p className="text-secondary-400">Loading Beaver AI...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return null; // Will redirect to dashboard
  }

  return <EnhancedLandingPage />;
}