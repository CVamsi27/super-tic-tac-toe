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
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-main dark:bg-slate-950">
      {/* Navigation */}
      <nav className="bg-gradient-card dark:bg-slate-900 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-full px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            🎮 Super Tic Tac Toe
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" className="text-sm font-semibold px-3 py-1 rounded-lg text-white bg-blue-600 dark:bg-blue-500">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
              Profile
            </Link>
            <Link href="/login" className="text-sm font-semibold px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header - Compact */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={24} className="text-yellow-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Global Leaderboard</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Top players ranked by points</p>
        </div>

        {/* Leaderboard Table - Full Width */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Loading leaderboard...</p>
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400">No players yet. Be the first!</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold w-12">Rank</th>
                  <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Player</th>
                  <th className="px-3 py-2 text-center text-slate-700 dark:text-slate-300 font-semibold">Points</th>
                  <th className="px-3 py-2 text-center text-slate-700 dark:text-slate-300 font-semibold">W/L/D</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => {
                  const rank = index + 1;
                  let rankBg = "";
                  let rankText = "";

                  if (rank === 1) {
                    rankBg = "bg-yellow-100 dark:bg-yellow-900/40";
                    rankText = "🥇";
                  } else if (rank === 2) {
                    rankBg = "bg-slate-200 dark:bg-slate-700/50";
                    rankText = "🥈";
                  } else if (rank === 3) {
                    rankBg = "bg-orange-100 dark:bg-orange-900/40";
                    rankText = "🥉";
                  } else {
                    rankBg = "";
                    rankText = `#${rank}`;
                  }

                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors ${rankBg}`}
                    >
                      <td className="px-3 py-2 font-bold text-lg text-slate-900 dark:text-white">
                        {rankText}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {user.profile_picture && (
                            <Image
                              src={user.profile_picture}
                              alt={user.name}
                              width={32}
                              height={32}
                              className="rounded-full border border-slate-300 dark:border-slate-600"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-slate-900 dark:text-white font-semibold text-sm truncate">{user.name}</div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="font-bold text-blue-700 dark:text-blue-300">{user.points}</div>
                      </td>
                      <td className="px-3 py-2 text-center text-xs">
                        <span className="text-green-700 dark:text-green-400 font-semibold">{user.wins}</span>
                        <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                        <span className="text-red-700 dark:text-red-400 font-semibold">{user.losses}</span>
                        <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                        <span className="text-yellow-700 dark:text-yellow-400 font-semibold">{user.draws}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer Info - Horizontal */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold">Win +10</span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 dark:text-yellow-400 font-bold">Draw +1</span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400 font-bold">Loss -5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
