/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Synthesizer for 8-bit Retro Chess Game Sound Effects using Web Audio API
class AudioSynth {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy loaded context to bypass browser autoplay policy
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore - Support older safari
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume if suspended
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playSelect() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.05);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playMove() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      // Crisp retro upward slide
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.setValueAtTime(330, t + 0.03);
      osc.frequency.setValueAtTime(440, t + 0.06);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playCapture() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const duration = 0.2;

      // 1. Noise Generator for Crunch/Explosion Sound
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1000, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, t + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, t);
      noiseGain.gain.linearRampToValueAtTime(0.01, t + duration);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      // 2. Heavy low square bass hit
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + duration);

      oscGain.gain.setValueAtTime(0.15, t);
      oscGain.gain.linearRampToValueAtTime(0.01, t + duration);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      whiteNoise.start(t);
      whiteNoise.stop(t + duration);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playCheck() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      
      // Intense double warning beep
      [0, 0.12].forEach((delay) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(660, t + delay);
        osc.frequency.setValueAtTime(550, t + delay + 0.04);

        gain.gain.setValueAtTime(0.15, t + delay);
        gain.gain.linearRampToValueAtTime(0.01, t + delay + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 0.1);
      });
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playUndo() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      // Downward swoosh
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25]; // C E G C G C E arpeggio
      const noteDuration = 0.08;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t + idx * noteDuration);

        gain.gain.setValueAtTime(0.12, t + idx * noteDuration);
        gain.gain.linearRampToValueAtTime(0.01, t + idx * noteDuration + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * noteDuration);
        osc.stop(t + idx * noteDuration + 0.15);
      });
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playDefeat() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const notes = [311.13, 293.66, 277.18, 233.08, 196.00, 155.56]; // Descending minor-feeling run
      const noteDuration = 0.12;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, t + idx * noteDuration);

        gain.gain.setValueAtTime(0.15, t + idx * noteDuration);
        gain.gain.linearRampToValueAtTime(0.01, t + idx * noteDuration + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * noteDuration);
        osc.stop(t + idx * noteDuration + 0.2);
      });
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }
}

export const sfx = new AudioSynth();
