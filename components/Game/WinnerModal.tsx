import { PlayerType } from "@/types";
import { Circle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WinnerModal({ winner }: { winner: PlayerType }) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm sm:max-w-md text-center transform scale-100 animate-scaleIn">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              🎉 Congratulations! 🎉
            </h2>
          </div>
          <div className="mb-6 sm:mb-8">
            {winner === "T" ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 font-semibold">
                  It&apos;s a Tie!
                </p>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Great strategy on both sides!
                </p>
              </div>
            ) : winner === "X" ? (
              <div className="flex flex-col items-center gap-3">
                <X className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400 animate-bounce" />
                <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 font-semibold">
                  Player X wins!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Circle className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 dark:text-red-400 animate-bounce" />
                <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 font-semibold">
                  Player O wins!
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              onClick={() => router.push("/")}
            >
              🎮 Play Again
            </button>
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:from-slate-400 hover:to-slate-500 dark:hover:from-slate-600 dark:hover:to-slate-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );
}
