'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { History, Trophy, Target, Handshake, TrendingUp, User, ArrowLeft, Clock, Gamepad2 } from 'lucide-react';

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
      <div className="flex-1 bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg font-semibold">Loading profile...</p>
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
    <div className="flex-1 bg-gradient-main">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-5 sm:mb-6 animate-fadeInUp">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {user.profile_picture ? (
                <Image
                  src={user.profile_picture}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="rounded-full ring-4 ring-blue-500/20 dark:ring-blue-400/20 w-14 h-14 sm:w-16 sm:h-16"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-blue-500/20">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 truncate">{user.name}</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 w-full sm:w-auto shadow-lg shadow-blue-500/20">
              <p className="text-xs sm:text-sm text-blue-100 font-medium text-center sm:text-left">Total Points</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1 text-center sm:text-left">{user.points}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Wins</p>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400">{user.wins}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-800/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Target className="w-4 h-4 text-red-500 dark:text-red-400" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Losses</p>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-500 dark:text-red-400">{user.losses}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Handshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Draws</p>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{user.draws}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Win Rate</p>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">{winRate}%</p>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Recent Games
          </h2>

          {gameHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
              <Gamepad2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg font-semibold mb-4">No games played yet</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
              >
                <Gamepad2 className="w-4 h-4" />
                Play Your First Game
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-2.5">
                {gameHistory.map((game) => {
                  const resultConfig = {
                    WIN: { icon: Trophy, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
                    LOSS: { icon: Target, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
                    DRAW: { icon: Handshake, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
                  }[game.result];
                  const ResultIcon = resultConfig.icon;

                  return (
                    <div
                      key={game.id}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${resultConfig.bg} ${resultConfig.text}`}>
                          <ResultIcon className="w-3.5 h-3.5" />
                          {game.result}
                        </span>
                        <span className={`text-base font-bold ${
                          game.points_earned > 0 ? 'text-green-600 dark:text-green-400' 
                          : game.points_earned < 0 ? 'text-red-500 dark:text-red-400' 
                          : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {game.points_earned > 0 ? '+' : ''}{game.points_earned} pts
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Opponent</span>
                          <p className="text-slate-900 dark:text-slate-100 font-semibold truncate">{game.opponent_name || 'Anonymous'}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-slate-500 dark:text-slate-400">Duration</span>
                          <p className="text-slate-900 dark:text-slate-100 font-semibold flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {game.game_duration}s
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 dark:text-slate-400">Date</span>
                          <p className="text-slate-900 dark:text-slate-100 font-semibold">
                            {new Date(game.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-600">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Result</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Opponent</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Points</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Duration</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {gameHistory.map((game, index) => {
                        const resultConfig = {
                          WIN: { icon: Trophy, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
                          LOSS: { icon: Target, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
                          DRAW: { icon: Handshake, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
                        }[game.result];
                        const ResultIcon = resultConfig.icon;

                        return (
                          <tr 
                            key={game.id} 
                            className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'} hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors`}
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${resultConfig.bg} ${resultConfig.text}`}>
                                <ResultIcon className="w-3.5 h-3.5" />
                                {game.result}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-700 dark:text-slate-300 font-medium">{game.opponent_name || 'Anonymous'}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                              <span className={`font-bold text-base sm:text-lg ${
                                game.points_earned > 0 ? 'text-green-600 dark:text-green-400' 
                                : game.points_earned < 0 ? 'text-red-500 dark:text-red-400' 
                                : 'text-slate-600 dark:text-slate-400'
                              }`}>
                                {game.points_earned > 0 ? '+' : ''}{game.points_earned}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {game.game_duration}s
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                              {new Date(game.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        );
                      })}
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
