import { Copyright, Heart } from "lucide-react";

export const Footer = (): JSX.Element => {
  const d = new Date();
  const year = d.getFullYear();
  return (
    <footer className="w-full flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 smooth-transition mt-8">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
        <div className="flex items-center gap-2 hover:scale-110 smooth-transition">
          <Copyright className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {year} Built with
          </span>
        </div>
        <div className="flex gap-2 items-center hover:scale-110 smooth-transition">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse" />
          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            by Vamsi Krishna
          </span>
        </div>
      </div>
    </footer>
  );
};
