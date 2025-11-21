import { Copyright, Heart } from "lucide-react";

export const Footer = (): JSX.Element => {
  const d = new Date();
  const year = d.getFullYear();
  return (
    <footer className="w-full flex flex-row justify-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 smooth-transition flex-shrink-0">
      <div className="flex flex-row gap-1 sm:gap-2 items-center justify-center text-center">
        <div className="flex items-center gap-1 sm:gap-2 hover:scale-110 smooth-transition">
          <Copyright className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400" />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            {year}
          </span>
        </div>
        <div className="flex gap-1 sm:gap-2 items-center hover:scale-110 smooth-transition">
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            Vamsi Krishna
          </span>
        </div>
      </div>
    </footer>
  );
};
