'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import Link from 'next/link';
import { Gamepad2, Trophy, BarChart3, Users, ArrowRight } from 'lucide-react';

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
      toast.success('Welcome back!');
      router.push('/');
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex-1 bg-gradient-main flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 animate-scaleIn">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl mb-3 sm:mb-4">
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gradient mb-1.5 sm:mb-2">Super Tic-Tac-Toe</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium">Sign in to track your progress</p>
          </div>

          {/* Google Login */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => {
                toast.error('Login failed');
              }}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-5 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">or</span>
            </div>
          </div>

          {/* Guest Play */}
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 px-4 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base border border-slate-200 dark:border-slate-600"
          >
            Play as Guest
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          {/* Benefits */}
          <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Why sign in?</h3>
            <div className="space-y-2.5">
              {[
                { icon: <Trophy className="w-4 h-4" />, text: "Climb the global leaderboard" },
                { icon: <BarChart3 className="w-4 h-4" />, text: "Track your wins and stats" },
                { icon: <Users className="w-4 h-4" />, text: "Compete with friends" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="p-1 bg-blue-100 dark:bg-blue-800/40 rounded-lg text-blue-600 dark:text-blue-400">
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
