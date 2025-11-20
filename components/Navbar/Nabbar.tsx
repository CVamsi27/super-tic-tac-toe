'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Trophy, Home } from "lucide-react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative top-0 z-50 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-3">
      <Link
        href="/"
        className="font-bold text-2xl sm:text-3xl text-gradient hover:scale-105 smooth-transition animate-slideInDown flex items-center gap-2"
      >
        {isHomePage ? (
          <>🎮 Super Tic-Tac-Toe</>
        ) : (
          <>
            <Home size={28} className="text-blue-600" />
            <span>Home</span>
          </>
        )}
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors duration-300 text-sm sm:text-base font-medium"
        >
          <Trophy size={18} />
        </Link>

        {user ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-300 text-sm sm:text-base font-medium"
              title={user.name}
            >
              {user.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-blue-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-blue-300 bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
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
