"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
      {!isOnline ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You&apos;re offline</span>
        </div>
      ) : showReconnected ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/30 animate-fadeIn">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back online!</span>
        </div>
      ) : null}
    </div>
  );
}
