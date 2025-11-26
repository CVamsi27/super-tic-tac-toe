import PlayWith from "@/components/PlayWith/PlayWith";
import { TipsCarousel } from "@/components/TipsCarousel";
import { Sparkles, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="w-full max-w-lg flex flex-col items-center justify-center gap-4 sm:gap-6">
        {/* Hero Section */}
        <div className="text-center space-y-2 sm:space-y-3 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full border border-blue-200/50 dark:border-blue-700/50 text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Strategic Board Game
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient leading-tight tracking-tight">
            Super Tic-Tac-Toe
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Master the 9-board challenge. Think strategically, play brilliantly.
          </p>
        </div>

        {/* Main Game Card */}
        <div className="w-full bg-white dark:bg-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200/80 dark:border-slate-700/80 animate-scaleIn backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:gap-5">
            <PlayWith />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          <div className="group p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-800/40 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Share & Play
                </p>
                <p className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Invite friends with a link
                </p>
              </div>
            </div>
          </div>
          
          <div className="group p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-800/40 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Track Progress
                </p>
                <p className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Login to save your stats
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Carousel */}
        <div className="w-full animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
          <TipsCarousel />
        </div>
      </div>
    </div>
  );
}
