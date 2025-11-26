'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Trophy, Home, Gamepad2, Settings } from "lucide-react";
import { StreakBadge } from "@/components/DailyStreak";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="flex items-center justify-between glass border-b border-slate-200/50 dark:border-slate-700/50 px-3 sm:px-6 py-2.5 sm:py-3">
        <Link
          href="/"
          className="group font-bold text-xl sm:text-2xl text-gradient hover:scale-105 smooth-transition flex items-center gap-1.5 sm:gap-2"
        >
          <div className="relative">
            <Gamepad2 size={24} className="text-blue-600 dark:text-blue-400 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="hidden xs:inline">Super T3</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Daily Streak Badge */}
          <StreakBadge className="hidden sm:flex" />

          <Link
            href="/leaderboard"
            className="group relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 text-sm font-medium"
          >
            <Trophy size={18} className="group-hover:animate-bounce-subtle" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>

          <Link
            href="/settings"
            className="group flex items-center gap-1.5 px-2 sm:px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            title="Settings"
          >
            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </Link>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/profile"
                className="group flex items-center gap-2 px-1.5 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-300 text-sm font-medium border border-blue-200/50 dark:border-blue-700/50"
                title={user.name}
              >
                {user.profile_picture ? (
                  <Image 
                    src={user.profile_picture} 
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-blue-400/50 ring-offset-1 ring-offset-white dark:ring-offset-slate-800 group-hover:ring-blue-500 transition-all duration-300"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-400/50 ring-offset-1 ring-offset-white dark:ring-offset-slate-800">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <span className="hidden sm:inline max-w-24 truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/40 dark:hover:to-rose-900/40 transition-all duration-300 text-sm font-medium border border-red-200/50 dark:border-red-700/50 hover:shadow-md"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="relative overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 text-sm font-semibold group"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-gradient-shine animate-shimmer" />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
