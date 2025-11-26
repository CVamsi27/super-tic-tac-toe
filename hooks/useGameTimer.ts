"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseGameTimerOptions {
  autoStart?: boolean;
  onTick?: (seconds: number) => void;
}

export function useGameTimer(options: UseGameTimerOptions = {}) {
  const { autoStart = false, onTick } = options;
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - seconds * 1000;
      setIsRunning(true);
    }
  }, [isRunning, seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setSeconds(0);
    setIsRunning(false);
    startTimeRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const newSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setSeconds(newSeconds);
          onTick?.(newSeconds);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTick]);

  const formatTime = useCallback((totalSeconds: number = seconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [seconds]);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    toggle,
    formatTime,
    formattedTime: formatTime(),
  };
}
