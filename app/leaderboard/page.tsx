'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, TrendingUp } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  email: string;
  name: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  profile_picture?: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/py/leaderboard');

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.users);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-900 text-lg font-semibold">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient">
              🎮 Super Tic Tac Toe
            </Link>
            <Link href="/profile" className="text-sm text-slate-700 hover:text-blue-600 font-semibold">
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Trophy size={40} className="text-yellow-300" />
            <div>
              <h1 className="text-4xl font-bold">Global Leaderboard</h1>
              <p className="text-blue-100 mt-2">Compete with players worldwide and earn your place at the top</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg font-semibold">No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 w-16">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Player</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Points</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">W/L/D</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Win%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaderboard.map((user, index) => {
                    const rank = index + 1;
                    let rankBg = "";
                    let rankBadge = "";

                    if (rank === 1) {
                      rankBg = "bg-yellow-50";
                      rankBadge = "🥇";
                    } else if (rank === 2) {
                      rankBg = "bg-slate-50";
                      rankBadge = "🥈";
                    } else if (rank === 3) {
                      rankBg = "bg-orange-50";
                      rankBadge = "🥉";
                    } else {
                      rankBg = "";
                      rankBadge = `#${rank}`;
                    }

                    const totalGames = user.wins + user.losses + user.draws;
                    const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(0) : '0';

                    return (
                      <tr
                        key={user.id}
                        className={`${rankBg} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold text-slate-900">{rankBadge}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profile_picture && (
                              <Image
                                src={user.profile_picture}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="rounded-full border-2 border-slate-300"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-slate-900">{user.name}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-2xl font-bold text-blue-700">{user.points}</div>
                          <div className="text-xs text-slate-500">pts</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3 text-sm font-semibold">
                            <span className="text-green-700">
                              {user.wins} <span className="text-xs text-slate-500">W</span>
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-red-700">
                              {user.losses} <span className="text-xs text-slate-500">L</span>
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-yellow-700">
                              {user.draws} <span className="text-xs text-slate-500">D</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-purple-700 text-lg">{winRate}%</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scoring Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-slate-600 font-semibold">Victory</p>
            <p className="text-2xl font-bold text-green-700 mt-1">+10 pts</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-slate-600 font-semibold">Draw</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">+1 pt</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-slate-600 font-semibold">Defeat</p>
            <p className="text-2xl font-bold text-red-700 mt-1">-5 pts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
