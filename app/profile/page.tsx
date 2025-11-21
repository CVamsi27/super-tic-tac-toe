'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { RotateCcw } from 'lucide-react';

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
  const { user, token, logout, refreshUser, isLoading } = useAuth();
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
      // Refresh user profile to ensure we have the latest data
      refreshUser();
      fetchGameHistory();
    }
  }, [token, user, fetchGameHistory, refreshUser]);

  if (isLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-900 text-lg font-semibold">Loading...</p>
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
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {user.profile_picture && (
                <Image
                  src={user.profile_picture}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="rounded-full border-3 border-blue-600 sm:w-16 sm:h-16"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">{user.name}</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1 truncate">{user.email}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-slate-600 font-semibold text-center sm:text-left">Total Points</p>
              <p className="text-3xl sm:text-4xl font-bold text-blue-700 mt-1 text-center sm:text-left">{user.points}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 sm:mt-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">Wins</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-1 sm:mt-2">{user.wins}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 sm:p-4 border border-red-200">
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">Losses</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-1 sm:mt-2">{user.losses}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">Draws</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-700 mt-1 sm:mt-2">{user.draws}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-200">
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">Win Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-700 mt-1 sm:mt-2">{winRate}%</p>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <RotateCcw size={24} className="text-blue-600" />
            Recent Games
          </h2>

          {gameHistory.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
              <p className="text-slate-600 text-base sm:text-lg font-semibold mb-4">No games played yet</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Play Your First Game
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {gameHistory.map((game) => (
                  <div
                    key={game.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                            game.result === 'WIN'
                              ? 'bg-green-100 text-green-700'
                              : game.result === 'LOSS'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {game.result === 'WIN' ? '🏆' : game.result === 'LOSS' ? '❌' : '🤝'} {game.result}
                        </span>
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          game.points_earned > 0
                            ? 'text-green-700'
                            : game.points_earned < 0
                            ? 'text-red-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {game.points_earned > 0 ? '+' : ''}
                        {game.points_earned} pts
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Opponent:</span>
                        <span className="text-slate-900 font-semibold">{game.opponent_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Duration:</span>
                        <span className="text-slate-900 font-semibold">{game.game_duration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Date:</span>
                        <span className="text-slate-900 font-semibold text-xs">
                          {new Date(game.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}</div>

              {/* Desktop Table View */}
              <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Result</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Opponent</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Points</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {gameHistory.map((game, index) => (
                        <tr 
                          key={game.id} 
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                game.result === 'WIN'
                                  ? 'bg-green-100 text-green-700'
                                  : game.result === 'LOSS'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {game.result === 'WIN' ? '🏆' : game.result === 'LOSS' ? '❌' : '🤝'} {game.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium truncate">{game.opponent_name || 'Anonymous'}</td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`font-bold text-lg ${
                                game.points_earned > 0
                                  ? 'text-green-700'
                                  : game.points_earned < 0
                                  ? 'text-red-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              {game.points_earned > 0 ? '+' : ''}
                              {game.points_earned}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600 font-medium">{game.game_duration}s</td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
