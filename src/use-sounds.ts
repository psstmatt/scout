"use client";
import { useEffect, useRef, useState } from "react";

export function useSounds() {
  const [enabled, setEnabled] = useState(false);
  const context = useRef<AudioContext | null>(null);
  useEffect(() => {
    try { queueMicrotask(() => setEnabled(localStorage.getItem("scout-sound") === "on")); } catch { /* Device preferences are optional. */ }
    return () => { void context.current?.close(); };
  }, []);
  function play(kind: "select" | "filter" | "close" = "select", force = false) {
    if (!enabled && !force) return;
    try {
      const audio = context.current ?? new AudioContext();
      context.current = audio;
      void audio.resume().catch(() => {});
      const start = audio.currentTime;
      const tones = kind === "select" ? [520, 780] : kind === "filter" ? [620] : [390];
      tones.forEach((frequency, index) => {
        const oscillator = audio.createOscillator(); const gain = audio.createGain();
        oscillator.type = "sine"; oscillator.frequency.value = frequency;
        const at = start + index * .045;
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.035, at + .006);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .11);
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(at); oscillator.stop(at + .12);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Sound must never block navigation. */ }
  }
  function toggle() {
    const next = !enabled; setEnabled(next);
    try { localStorage.setItem("scout-sound", next ? "on" : "off"); } catch { /* Optional preference. */ }
    if (next) play("select", true);
  }
  return { enabled, toggle, play };
}
