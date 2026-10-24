/**
 * Web Audio API Sound Engine for অপূর্ব (Apurba).
 * Synthesizes hypnotic bass, drone frequencies, and rhythmic pulses in real-time,
 * driving live Web Audio frequency analysers for the interactive visualizers.
 */

class ApurbaSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Active oscillators and nodes
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private pulseTimer: number | null = null;

  private isPlaying = false;
  private currentTrackId: string | null = null;
  private playbackStartTime = 0;
  private pauseOffset = 0;
  private volume = 0.75;
  private cutoffFreq = 1800;

  // Listeners for UI state updates
  private stateChangeListeners: ((isPlaying: boolean, trackId: string | null) => void)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output pipeline: Master Gain -> Analyser -> Destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(this.cutoffFreq, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(3.5, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.85;

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  public subscribe(listener: (isPlaying: boolean, trackId: string | null) => void) {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.stateChangeListeners.forEach((l) => l(this.isPlaying, this.currentTrackId));
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setFilterCutoff(hz: number) {
    this.cutoffFreq = Math.max(100, Math.min(16000, hz));
    if (this.filterNode && this.ctx) {
      this.filterNode.frequency.setTargetAtTime(this.cutoffFreq, this.ctx.currentTime, 0.05);
    }
  }

  public playTrack(trackId: string, trackData?: { bpm?: number; key?: string; category?: string }) {
    this.initContext();
    if (!this.ctx || !this.filterNode) return;

    // If already playing this track, don't restart
    if (this.isPlaying && this.currentTrackId === trackId) {
      return;
    }

    // Stop currently running voices
    this.stopVoices();

    const bpm = trackData?.bpm || 124;
    const category = trackData?.category || 'psychedelic';

    const now = this.ctx.currentTime;
    this.playbackStartTime = now - this.pauseOffset;
    this.currentTrackId = trackId;
    this.isPlaying = true;

    // Configure distinct sonic profiles based on track character
    let fundamental = 55; // A1
    let subFreq = 43.65; // F1
    let droneFreq1 = 110;
    let droneFreq2 = 164.81; // E3 (fifth)
    let wave1: OscillatorType = 'sawtooth';
    let wave2: OscillatorType = 'triangle';

    if (trackId === 'root' || category === 'psychedelic') {
      // "Root" profile: Earthy 432-tuned fundamental, deep subterranean F0/C1, psychedelic hypnotic filter modulation
      fundamental = 54; // C#1
      subFreq = 40.5; // low G#0
      droneFreq1 = 108; // 432 / 4
      droneFreq2 = 162; // Perfect fifth
      wave1 = 'sawtooth';
      wave2 = 'triangle';
    } else if (category === 'techno') {
      // Melodic techno: Punchy driving low end, dark resonant pulse
      fundamental = 65.4; // C2
      subFreq = 32.7; // C1
      droneFreq1 = 130.8;
      droneFreq2 = 196.0;
      wave1 = 'triangle';
      wave2 = 'sine';
    } else if (category === 'ambient') {
      // Frequency Matters / Ambient: Pure 432 Hz / 528 Hz harmonic meditation
      fundamental = 108;
      subFreq = 54;
      droneFreq1 = 432;
      droneFreq2 = 528;
      wave1 = 'sine';
      wave2 = 'sine';
    } else if (category === 'bass') {
      // Bass house / club: Deep modulated square and sine subs
      fundamental = 48.99; // G1
      subFreq = 36.7;
      droneFreq1 = 97.99;
      droneFreq2 = 146.83;
      wave1 = 'square';
      wave2 = 'sawtooth';
    }

    // 1. Sub Bass Voice
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(subFreq, now);

    this.subGain = this.ctx.createGain();
    this.subGain.gain.setValueAtTime(0.001, now);
    this.subGain.gain.exponentialRampToValueAtTime(0.45, now + 1.2);

    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.filterNode);
    this.subOsc.start(now);

    // 2. Harmonic Atmospheric Drone 1
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = wave1;
    this.droneOsc1.frequency.setValueAtTime(droneFreq1, now);

    // 3. Harmonic Atmospheric Drone 2 (Detuned slightly for rich acoustic beating)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = wave2;
    this.droneOsc2.frequency.setValueAtTime(droneFreq2 + 0.4, now);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, now);
    this.droneGain.gain.exponentialRampToValueAtTime(0.25, now + 1.8);

    // Stereo Panning for Drone
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(-0.2, now);
      this.droneOsc1.connect(panner);
      panner.connect(this.droneGain);
    } else {
      this.droneOsc1.connect(this.droneGain);
    }

    this.droneOsc2.connect(this.droneGain);
    this.droneGain.connect(this.filterNode);

    this.droneOsc1.start(now);
    this.droneOsc2.start(now);

    // 4. LFO filter frequency movement (giving the living organic mycelial pulse)
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(bpm / 240, now); // Slow undulating pulse
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(320, now); // Sweep range

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);
    this.lfo.start(now);

    // 5. Rhythmic subterranean kick & pulse loop
    this.startRhythmicPulse(bpm, fundamental);

    this.notify();
  }

  private startRhythmicPulse(bpm: number, rootPitch: number) {
    if (!this.ctx || !this.filterNode) return;
    const intervalMs = (60000 / bpm);

    let step = 0;
    this.pulseTimer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.filterNode) return;
      const t = this.ctx.currentTime;

      // Create a punchy organic analog sub pulse on quarter notes
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch envelope: drops fast for punchy electronic club transient
      const isDownbeat = step % 4 === 0;
      const startFreq = isDownbeat ? rootPitch * 2.5 : rootPitch * 1.8;
      const endFreq = rootPitch;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);

      gain.gain.setValueAtTime(isDownbeat ? 0.35 : 0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.filterNode);

      osc.start(t);
      osc.stop(t + 0.24);

      step = (step + 1) % 16;
    }, intervalMs);
  }

  private stopVoices() {
    if (this.pulseTimer !== null) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }

    const t = this.ctx ? this.ctx.currentTime : 0;
    const releaseTime = 0.4;

    if (this.subGain && this.ctx) {
      this.subGain.gain.setTargetAtTime(0.0001, t, 0.1);
    }
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0.0001, t, 0.1);
    }

    setTimeout(() => {
      try {
        this.subOsc?.stop();
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.lfo?.stop();
        this.subOsc?.disconnect();
        this.droneOsc1?.disconnect();
        this.droneOsc2?.disconnect();
        this.lfo?.disconnect();
      } catch {
        // already stopped
      }
      this.subOsc = null;
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.lfo = null;
    }, releaseTime * 1000);
  }

  public pause() {
    if (this.isPlaying && this.ctx) {
      this.pauseOffset = this.ctx.currentTime - this.playbackStartTime;
      this.stopVoices();
      this.isPlaying = false;
      this.notify();
    }
  }

  public resume() {
    if (!this.isPlaying && this.currentTrackId) {
      this.playTrack(this.currentTrackId);
    }
  }

  public togglePlay(trackId: string, trackData?: { bpm?: number; key?: string; category?: string }) {
    if (this.isPlaying && this.currentTrackId === trackId) {
      this.pause();
    } else {
      this.playTrack(trackId, trackData);
    }
  }

  public stop() {
    this.stopVoices();
    this.isPlaying = false;
    this.currentTrackId = null;
    this.pauseOffset = 0;
    this.notify();
  }
}

export const soundEngine = new ApurbaSoundEngine();
