import { CustomLink } from "@/components/ui/custom-link";
import { Clock, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 bg-gradient-main flex flex-col items-center justify-center p-4">
      <div className="text-center animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 sm:mb-6 shadow-xl shadow-purple-500/25">
          <Clock className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
          Coming Soon
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
          We&apos;re working on something exciting! Check back soon for new features.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Stay tuned for updates
        </div>
        <div className="block">
          <CustomLink href="/" size="lg" variant="default">
            Back to Home
          </CustomLink>
        </div>
      </div>
    </div>
  );
}
