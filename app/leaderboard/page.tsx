'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';

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
      <div className="flex-1 bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg font-semibold">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

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

        {/* Header Card */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl shadow-xl shadow-amber-500/20 p-4 sm:p-6 mb-5 sm:mb-6 text-white animate-fadeInUp">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl">
              <Trophy size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold">Global Leaderboard</h1>
              <p className="text-amber-100 mt-0.5 text-xs sm:text-sm">Compete and climb to the top!</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {leaderboard.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center animate-fadeInUp">
            <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg font-semibold">No players yet</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Be the first to join!</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-2.5 sm:space-y-3 animate-fadeInUp">
              {leaderboard.map((user, index) => {
                const rank = index + 1;
                let rankIcon = null;
                let cardBg = "bg-white dark:bg-slate-800";
                let borderColor = "border-slate-200 dark:border-slate-700";

                if (rank === 1) {
                  rankIcon = <Crown className="w-5 h-5 text-yellow-500" />;
                  cardBg = "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20";
                  borderColor = "border-yellow-200 dark:border-yellow-800/50";
                } else if (rank === 2) {
                  rankIcon = <Medal className="w-5 h-5 text-slate-400" />;
                  cardBg = "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800";
                  borderColor = "border-slate-300 dark:border-slate-600";
                } else if (rank === 3) {
                  rankIcon = <Medal className="w-5 h-5 text-orange-400" />;
                  cardBg = "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20";
                  borderColor = "border-orange-200 dark:border-orange-800/50";
                }

                const totalGames = user.wins + user.losses + user.draws;
                const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(0) : '0';

                return (
                  <div
                    key={user.id}
                    className={`${cardBg} rounded-xl sm:rounded-2xl shadow-sm border ${borderColor} p-3 sm:p-4`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                        {rankIcon || `#${rank}`}
                      </div>
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {user.profile_picture ? (
                          <Image
                            src={user.profile_picture}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="rounded-full ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name[0]}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm sm:text-base">{user.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400">{user.points}</div>
                        <div className="text-2xs text-slate-500 dark:text-slate-400">pts</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-green-600 dark:text-green-400">{user.wins}W</span>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="text-red-500 dark:text-red-400">{user.losses}L</span>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="text-amber-600 dark:text-amber-400">{user.draws}D</span>
                      </div>
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                        {winRate}% WR
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-fadeInUp">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200 w-20">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">Player</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 dark:text-slate-200">Points</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-200">W/L/D</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 dark:text-slate-200">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {leaderboard.map((user, index) => {
                      const rank = index + 1;
                      let rowBg = "bg-white dark:bg-slate-800";
                      let rankIcon = null;

                      if (rank === 1) {
                        rowBg = "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10";
                        rankIcon = <Crown className="w-6 h-6 text-yellow-500" />;
                      } else if (rank === 2) {
                        rowBg = "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800";
                        rankIcon = <Medal className="w-6 h-6 text-slate-400" />;
                      } else if (rank === 3) {
                        rowBg = "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10";
                        rankIcon = <Medal className="w-6 h-6 text-orange-400" />;
                      }

                      const totalGames = user.wins + user.losses + user.draws;
                      const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(0) : '0';

                      return (
                        <tr
                          key={user.id}
                          className={`${rowBg} hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700">
                              {rankIcon || <span className="text-sm font-bold text-slate-600 dark:text-slate-300">#{rank}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {user.profile_picture ? (
                                <Image
                                  src={user.profile_picture}
                                  alt={user.name}
                                  width={44}
                                  height={44}
                                  className="rounded-full ring-2 ring-slate-200 dark:ring-slate-600"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                  {user.name[0]}
                                </div>
                              )}
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{user.points}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-3 text-sm font-semibold">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                                {user.wins}W
                              </span>
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                {user.losses}L
                              </span>
                              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">
                                {user.draws}D
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold">
                              {winRate}%
                            </span>
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

        {/* Scoring Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 animate-fadeInUp">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Victory</p>
            <p className="text-xl sm:text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">+10 pts</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Draw</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">+1 pt</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Defeat</p>
            <p className="text-xl sm:text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">-5 pts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
