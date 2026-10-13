export type SoundEffect = "select" | "swap" | "positive" | "success" | "click";
export type AudioPreferences = {
  music: boolean;
  sound: boolean;
  volume: number;
};
export type MusicStatus =
  "waiting" | "playing" | "paused" | "off" | "unavailable";
export const MUSIC_BPM = 84;
export const MUSIC_SECONDS = (32 * 60) / MUSIC_BPM;
/** An original eight-bar loop: soft keys, warm chords, bass and tiny offbeat ticks. */
export function composeMusic(sampleRate = 22050): Float32Array<ArrayBuffer> {
  const data = new Float32Array(Math.round(MUSIC_SECONDS * sampleRate));
  const beat = 60 / MUSIC_BPM;
  const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
  function note(
    start: number,
    midi: number,
    duration: number,
    gain: number,
    kind: "pad" | "key" | "bass" | "tick",
  ) {
    const samples = Math.floor(duration * sampleRate),
      offset = Math.floor(start * sampleRate),
      f = freq(midi);
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate,
        attack = Math.min(1, t / (kind === "pad" ? 0.12 : 0.009)),
        release = Math.min(1, (duration - t) / 0.045);
      const envelope =
        attack *
        release *
        Math.exp(
          -t *
            (kind === "pad"
              ? 0.5
              : kind === "key"
                ? 5
                : kind === "tick"
                  ? 40
                  : 2),
        );
      const wave =
        Math.sin(2 * Math.PI * f * t) +
        (kind === "key" ? 0.18 : kind === "pad" ? 0.1 : 0) *
          Math.sin(2 * Math.PI * f * 2 * t);
      data[(offset + i) % data.length] += wave * envelope * gain;
    }
  }
  const chords = [
    [60, 64, 67, 71],
    [57, 60, 64, 67],
    [53, 57, 60, 64],
    [55, 59, 62, 69],
  ];
  const melody = [
    76, 79, 74, 0, 72, 76, 71, 74, 69, 72, 76, 0, 74, 71, 67, 0, 76, 79, 81, 79,
    76, 72, 74, 0, 69, 72, 71, 67, 74, 71, 69, 0,
  ];
  for (let bar = 0; bar < 8; bar++) {
    const chord = chords[bar % 4];
    for (const m of chord) note(bar * 4 * beat, m, 4.2 * beat, 0.017, "pad");
    note(bar * 4 * beat, chord[0] - 24, 1.8 * beat, 0.038, "bass");
    note((bar * 4 + 2) * beat, chord[0] - 12, 1.3 * beat, 0.026, "bass");
  }
  melody.forEach((m, i) => {
    if (m) note(i * beat, m, 0.85 * beat, 0.08, "key");
    if (i % 2 === 1) note((i + 0.5) * beat, 91, 0.08, 0.008, "tick");
  });
  return data;
}
class CozyAudio {
  private context?: AudioContext;
  private musicGain?: GainNode;
  private source?: AudioBufferSourceNode;
  private prefs: AudioPreferences = { music: true, sound: true, volume: 0.35 };
  private unlocked = false;
  private visible = true;
  private failed = false;
  private listeners = new Set<() => void>();
  subscribe = (callback: () => void) => {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  };
  private notify() {
    this.listeners.forEach((fn) => fn());
  }
  status = (): MusicStatus =>
    this.failed
      ? "unavailable"
      : !this.prefs.music
        ? "off"
        : !this.unlocked
          ? "waiting"
          : !this.visible || this.context?.state !== "running"
            ? "paused"
            : "playing";
  configure(prefs: AudioPreferences) {
    this.prefs = prefs;
    this.sync();
  }
  async unlock() {
    if (!this.visible) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.musicGain = this.context.createGain();
        this.musicGain.gain.value = 0;
        this.musicGain.connect(this.context.destination);
        this.context.onstatechange = () => this.notify();
      }
      this.unlocked = true;
      await this.context.resume();
      this.failed = false;
      this.sync();
    } catch {
      this.failed = true;
      this.notify();
    }
  }
  setVisible(visible: boolean) {
    this.visible = visible;
    if (!visible) void this.context?.suspend().catch(() => {});
    else if (this.unlocked) void this.unlock();
    this.notify();
  }
  private sync() {
    const context = this.context;
    if (context && this.musicGain) {
      if (this.unlocked && this.prefs.music && !this.source) {
        const samples = composeMusic();
        const buffer = context.createBuffer(1, samples.length, 22050);
        buffer.copyToChannel(samples, 0);
        this.source = context.createBufferSource();
        this.source.buffer = buffer;
        this.source.loop = true;
        this.source.connect(this.musicGain);
        this.source.start();
      }
      this.musicGain.gain.setTargetAtTime(
        this.prefs.music ? this.prefs.volume * 0.65 : 0,
        context.currentTime,
        0.06,
      );
    }
    this.notify();
  }
  effect(type: SoundEffect) {
    const context = this.context;
    if (
      !context ||
      !this.unlocked ||
      !this.visible ||
      !this.prefs.sound ||
      context.state !== "running"
    )
      return;
    const notes =
      type === "success"
        ? [523.25, 659.25, 783.99, 1046.5]
        : type === "positive"
          ? [783.99, 1046.5]
          : type === "swap"
            ? [520]
            : type === "select"
              ? [740]
              : [600];
    notes.forEach((frequency, i) => {
      const oscillator = context.createOscillator(),
        gain = context.createGain(),
        start = context.currentTime + i * 0.095;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      if (type === "swap")
        oscillator.frequency.exponentialRampToValueAtTime(180, start + 0.14);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(
        type === "click" ? 0.016 : 0.035,
        start + 0.008,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.2);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  }
}
export const audio = new CozyAudio();
