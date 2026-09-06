"use client";

import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";
import type { PlatformSettings } from "@/types/database";

interface CelebrationOverlayProps {
  initialSettings?: PlatformSettings | null;
}

export function CelebrationOverlay({ initialSettings }: CelebrationOverlayProps) {
  const [showCelebrationNotice, setShowCelebrationNotice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let stopTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let cleanupListeners: (() => void) | null = null;

    async function evaluateAndTrigger() {
      if (hasTriggeredRef.current) return;

      let settings = initialSettings;
      if (!settings) {
        try {
          const res = await fetch("/api/settings");
          if (res.ok) {
            const data = await res.json();
            settings = {
              id: 1,
              confetti_start_time: data.confetti_start_time,
              confetti_end_time: data.confetti_end_time,
              updated_at: data.updated_at,
            };
          }
        } catch {
          return;
        }
      }

      if (!settings?.confetti_start_time || !settings?.confetti_end_time) return;

      const now = Date.now();
      const startTime = new Date(settings.confetti_start_time).getTime();
      const endTime = new Date(settings.confetti_end_time).getTime();

      // Check if current date/time falls between confetti_start_time and confetti_end_time
      if (now < startTime || now > endTime) return;

      const sessionKey = `ak39_celebration_${startTime}_${endTime}`;
      if (typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey)) {
        return;
      }

      hasTriggeredRef.current = true;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(sessionKey, "1");
      }

      setShowCelebrationNotice(true);

      // Play fireworks sound
      const audio = new Audio("/sounds/fireworks.mp3");
      audio.volume = 0.7;
      audio.preload = "auto";
      audioRef.current = audio;

      const stopSound = () => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      };

      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            const handleFirstInteraction = () => {
              try {
                audio.play().catch(() => {});
                setTimeout(stopSound, 4000);
              } catch {}
              removeListeners();
            };

            const removeListeners = () => {
              window.removeEventListener("click", handleFirstInteraction);
              window.removeEventListener("scroll", handleFirstInteraction);
              window.removeEventListener("touchstart", handleFirstInteraction);
            };

            window.addEventListener("click", handleFirstInteraction, { once: true });
            window.addEventListener("scroll", handleFirstInteraction, { once: true });
            window.addEventListener("touchstart", handleFirstInteraction, { once: true });

            cleanupListeners = removeListeners;
          });
        }
      } catch {}

      // Realistic Confetti Fireworks
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 99999,
        disableForReducedMotion: true,
      };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      const colors = ["#FF6600", "#007A33", "#F59E0B", "#10B981", "#FFFFFF"];

      // Initial explosion
      confetti({ ...defaults, particleCount: 75, origin: { x: 0.5, y: 0.6 }, colors });

      intervalId = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          if (intervalId) clearInterval(intervalId);
          return;
        }

        const particleCount = 40 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.35), y: Math.random() - 0.2 },
          colors,
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.65, 0.9), y: Math.random() - 0.2 },
          colors,
        });
      }, 250);

      // Stop confetti and sound completely after 4000ms
      stopTimeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        stopSound();
        try {
          confetti.reset();
        } catch {}
        setShowCelebrationNotice(false);
      }, 4000);
    }

    evaluateAndTrigger();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (stopTimeoutId) clearTimeout(stopTimeoutId);
      if (cleanupListeners) cleanupListeners();
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }
      try {
        confetti.reset();
      } catch {}
    };
  }, [initialSettings]);

  if (!showCelebrationNotice) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100000] pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-orange-500/50 shadow-2xl shadow-orange-500/20 backdrop-blur-md text-white text-xs sm:text-sm font-bold">
        <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
        <span>Akwa Ibom @ 39 &bull; Celebrating 39 Shades of Gratitude!</span>
      </div>
    </div>
  );
}
