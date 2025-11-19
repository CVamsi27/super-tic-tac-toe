'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Trophy } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative top-0 z-50 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-3">
      <Link
        href="/"
        className="font-bold text-2xl sm:text-3xl text-gradient hover:scale-105 smooth-transition animate-slideInDown"
      >
        🎮 Super Tic-Tac-Toe
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors duration-300 text-sm sm:text-base font-medium"
        >
          <Trophy size={18} />
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>

        {user ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-300 text-sm sm:text-base font-medium"
            >
              <User size={18} />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-300 text-sm sm:text-base font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transition-all duration-300 text-sm sm:text-base font-medium"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
