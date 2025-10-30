'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      await login(credentialResponse.credential);
      toast.success('Login successful!');
      router.push('/');
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-900 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-card backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-200">
          <h1 className="text-3xl font-bold text-gradient mb-2 text-center">Super Tic Tac Toe</h1>
          <p className="text-slate-700 text-center mb-8 font-medium">Sign in to track your progress and compete with others</p>

          <div className="flex justify-center mb-8">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => {
                toast.error('Login failed');
              }}
            />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-30"></div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-gradient-card text-sm text-slate-600 font-semibold">or</span>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-all duration-300 text-center border border-slate-300"
          >
            Play as Guest
          </Link>

          <div className="mt-8 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Why sign in?</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>✓ Save your game progress</li>
              <li>✓ Earn points and climb the leaderboard</li>
              <li>✓ View your game history and stats</li>
              <li>✓ Compete with friends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
