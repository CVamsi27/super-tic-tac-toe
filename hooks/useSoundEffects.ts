"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { useCallback, useRef } from "react";

// Sound types
type SoundType = "move" | "win" | "lose" | "draw" | "error" | "click" | "notification";

// Create audio context lazily
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Sound frequencies and patterns
const SOUND_CONFIGS: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  move: { frequencies: [440, 550], durations: [50, 50], type: "sine" },
  win: { frequencies: [523, 659, 784, 1047], durations: [100, 100, 100, 200], type: "sine" },
  lose: { frequencies: [400, 350, 300], durations: [150, 150, 200], type: "triangle" },
  draw: { frequencies: [440, 440], durations: [100, 100], type: "sine" },
  error: { frequencies: [200, 150], durations: [100, 150], type: "sawtooth" },
  click: { frequencies: [800], durations: [30], type: "sine" },
  notification: { frequencies: [660, 880], durations: [80, 120], type: "sine" },
};

export function useSoundEffects() {
  const { soundEnabled, soundVolume, hapticFeedback } = useSettingsStore();
  const lastPlayTime = useRef<number>(0);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;
      
      // Throttle sounds (min 50ms between sounds)
      const now = Date.now();
      if (now - lastPlayTime.current < 50) return;
      lastPlayTime.current = now;

      const ctx = getAudioContext();
      if (!ctx) return;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const config = SOUND_CONFIGS[type];
      let startTime = ctx.currentTime;

      config.frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = config.type;
        oscillator.frequency.value = freq;

        const duration = config.durations[index] / 1000;
        
        // Envelope for smoother sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(soundVolume * 0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        startTime += duration;
      });
    },
    [soundEnabled, soundVolume]
  );

  const triggerHaptic = useCallback(
    (pattern: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
      if (!hapticFeedback || typeof navigator === "undefined" || !navigator.vibrate) return;

      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [50, 30, 50],
        error: [100, 50, 100],
      };

      try {
        navigator.vibrate(patterns[pattern]);
      } catch (e) {
        // Vibration API not supported or failed
      }
    },
    [hapticFeedback]
  );

  return {
    playSound,
    triggerHaptic,
    playMove: () => {
      playSound("move");
      triggerHaptic("light");
    },
    playWin: () => {
      playSound("win");
      triggerHaptic("success");
    },
    playLose: () => {
      playSound("lose");
      triggerHaptic("error");
    },
    playDraw: () => {
      playSound("draw");
      triggerHaptic("medium");
    },
    playError: () => {
      playSound("error");
      triggerHaptic("error");
    },
    playClick: () => {
      playSound("click");
      triggerHaptic("light");
    },
  };
}
