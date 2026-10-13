import { useEffect, useState } from "react";
import { audio } from "../utils/sound";
import type { AudioPreferences } from "../utils/sound";
export function useAudio(preferences: AudioPreferences) {
  const [status, setStatus] = useState(audio.status);
  useEffect(() => audio.subscribe(() => setStatus(audio.status())), []);
  useEffect(() => {
    audio.configure(preferences);
  }, [preferences.music, preferences.sound, preferences.volume]);
  useEffect(() => {
    const unlock = () => {
      void audio.unlock();
    };
    const visibility = () =>
      audio.setVisible(document.visibilityState !== "hidden");
    const buttons = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest("button");
      // Main actions have their own sounds; window controls and other buttons get a quiet click.
      if (button && !button.matches(".bottle-button")) audio.effect("click");
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("click", buttons);
    visibility();
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("click", buttons);
    };
  }, []);
  return { status, effect: audio.effect.bind(audio) };
}
