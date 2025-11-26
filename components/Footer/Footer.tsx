import Link from "next/link";
import { Copyright, Heart, Shield, ScrollText } from "lucide-react";

export const Footer = (): JSX.Element => {
  const d = new Date();
  const year = d.getFullYear();
  return (
    <footer className="w-full glass border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Copyright className="w-3.5 h-3.5" />
            <span className="text-xs sm:text-sm font-medium">{year} Super Tic-Tac-Toe</span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/privacy" 
              className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ScrollText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Terms
            </Link>
          </div>
          
          <div className="flex items-center gap-1.5 group">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 group-hover:scale-125 group-hover:animate-pulse transition-transform duration-300" fill="currentColor" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">by Vamsi Krishna</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
