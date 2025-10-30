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

  if (isLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {user.profile_picture && (
                <Image
                  src={user.profile_picture}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="rounded-full border-3 border-blue-600"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                <p className="text-slate-600 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-slate-600 font-semibold">Total Points</p>
              <p className="text-4xl font-bold text-blue-700 mt-1">{user.points}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-slate-600 font-semibold">Wins</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{user.wins}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-slate-600 font-semibold">Losses</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{user.losses}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-slate-600 font-semibold">Draws</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">{user.draws}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-slate-600 font-semibold">Win Rate</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">{winRate}%</p>
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-600 text-lg font-semibold mb-4">No games played yet</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Play Your First Game
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
          )}
        </div>
      </div>
    </div>
  );
}
