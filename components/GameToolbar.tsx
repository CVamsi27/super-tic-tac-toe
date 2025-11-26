"use client";

import React from "react";
import { Home, RotateCcw, Settings, Trophy, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface GameToolbarProps {
  onReset?: () => void;
  onHelp?: () => void;
  showReset?: boolean;
  className?: string;
}

export function GameToolbar({ 
  onReset, 
  onHelp, 
  showReset = true,
  className = "" 
}: GameToolbarProps) {
  const { playClick } = useSoundEffects();

  const handleClick = (callback?: () => void) => {
    playClick();
    callback?.();
  };

  const tools = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      href: "/",
      onClick: undefined,
    },
    ...(showReset && onReset ? [{
      icon: <RotateCcw className="w-5 h-5" />,
      label: "Reset",
      href: undefined,
      onClick: onReset,
    }] : []),
    {
      icon: <Trophy className="w-5 h-5" />,
      label: "Leaderboard",
      href: "/leaderboard",
      onClick: undefined,
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      href: "/settings",
      onClick: undefined,
    },
    ...(onHelp ? [{
      icon: <HelpCircle className="w-5 h-5" />,
      label: "Help",
      href: undefined,
      onClick: onHelp,
    }] : []),
  ];

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 ${className}`}>
      <div className="flex items-center gap-1 p-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700/80">
        {tools.map((tool, index) => (
          tool.href ? (
            <Link
              key={index}
              href={tool.href}
              onClick={() => handleClick()}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <span className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.icon}
              </span>
              <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 hidden sm:block">
                {tool.label}
              </span>
            </Link>
          ) : (
            <button
              key={index}
              onClick={() => handleClick(tool.onClick)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <span className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.icon}
              </span>
              <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 hidden sm:block">
                {tool.label}
              </span>
            </button>
          )
        ))}
      </div>
    </div>
  );
}
