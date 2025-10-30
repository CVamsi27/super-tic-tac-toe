'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, RotateCcw } from 'lucide-react';

interface GameHistory {
  id: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  opponent_name?: string;
  points_earned: number;
  game_duration: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout, isLoading } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchGameHistory = useCallback(async () => {
    if (!token || !user) return;
    
    try {
      const response = await fetch('/api/py/auth/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch game history');
      }

      const data = await response.json();
      setGameHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load game history');
    } finally {
      setHistoryLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token && user) {
      fetchGameHistory();
    }
  }, [token, user, fetchGameHistory]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (isLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : '0.0';

  return (
    <div className="h-screen flex flex-col bg-gradient-main dark:bg-slate-950">
      {/* Navigation */}
      <nav className="bg-gradient-card dark:bg-slate-900 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-full px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            🎮 Super Tic Tac Toe
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
              Leaderboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 text-sm font-semibold"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Profile Header - Compact */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-full px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user.profile_picture && (
                  <Image
                    src={user.profile_picture}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-slate-300 dark:border-slate-600"
                  />
                )}
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.name}</h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{user.points}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Total Points</p>
              </div>
            </div>

            {/* Stats Bar - Horizontal */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                <div className="font-bold text-green-700 dark:text-green-400">{user.wins}</div>
                <div className="text-slate-600 dark:text-slate-400">Wins</div>
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                <div className="font-bold text-red-700 dark:text-red-400">{user.losses}</div>
                <div className="text-slate-600 dark:text-slate-400">Losses</div>
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                <div className="font-bold text-yellow-700 dark:text-yellow-400">{user.draws}</div>
                <div className="text-slate-600 dark:text-slate-400">Draws</div>
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                <div className="font-bold text-blue-700 dark:text-blue-400">{winRate}%</div>
                <div className="text-slate-600 dark:text-slate-400">Win Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="px-4 py-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <RotateCcw size={20} className="text-blue-600 dark:text-blue-400" />
            Recent Games
          </h2>

          {gameHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">No games played yet</p>
              <Link
                href="/game"
                className="inline-block px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Play Now
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Result</th>
                    <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Opponent</th>
                    <th className="px-3 py-2 text-center text-slate-700 dark:text-slate-300 font-semibold">Points</th>
                    <th className="px-3 py-2 text-center text-slate-700 dark:text-slate-300 font-semibold">Duration</th>
                    <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.map((game) => (
                    <tr key={game.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            game.result === 'WIN'
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                              : game.result === 'LOSS'
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          {game.result}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 truncate">{game.opponent_name || 'Anonymous'}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`font-semibold ${
                            game.points_earned > 0
                              ? 'text-green-700 dark:text-green-400'
                              : game.points_earned < 0
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {game.points_earned > 0 ? '+' : ''}
                          {game.points_earned}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-400">{game.game_duration}s</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                        {new Date(game.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
