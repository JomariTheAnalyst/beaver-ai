'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from '@/components/LandingPage';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-card">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span className="inline-block w-3 h-3 bg-accent-blue rounded-full mr-2"></span>
            <span className="inline-block w-3 h-3 bg-accent-purple rounded-full mr-2"></span>
            <span className="inline-block w-3 h-3 bg-accent-glow rounded-full"></span>
          </div>
          <p className="text-dark-muted">Loading Beaver AI...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return null; // Will redirect to dashboard
  }

  return <LandingPage />;
}