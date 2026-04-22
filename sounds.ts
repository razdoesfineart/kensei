// Sound effects using Web Audio API - no external files needed
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  if (!audioCtx) return;
  try {
    audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {}
}

function playSequence(notes: [number, number][], type: OscillatorType = 'sine', volume = 0.3) {
  if (!audioCtx) return;
  try {
    audioCtx.resume();
    let time = audioCtx.currentTime;
    notes.forEach(([freq, dur]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + dur);
      time += dur * 0.8;
    });
  } catch {}
}

// Achievement unlocked - triumphant ascending melody
export function playAchievementSound() {
  playSequence([[523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.4]], 'triangle', 0.25);
}

// Trade detected - alert ping
export function playTradeDetectedSound() {
  playSequence([[880, 0.1], [1100, 0.1], [880, 0.15]], 'sine', 0.2);
}

// Trade logged successfully - positive confirmation
export function playTradeLoggedSound() {
  playSequence([[440, 0.1], [554, 0.1], [659, 0.2]], 'triangle', 0.2);
}

// Cooldown activated - low warning tone
export function playCooldownSound() {
  playSequence([[330, 0.3], [220, 0.4]], 'sawtooth', 0.15);
}

// Cooldown ended - release chime
export function playCooldownEndSound() {
  playSequence([[440, 0.1], [554, 0.1], [659, 0.1], [880, 0.3]], 'sine', 0.2);
}

// Button click - subtle tap
export function playClickSound() {
  playTone(600, 0.05, 'sine', 0.1);
}

// Error / missed log - descending tone
export function playErrorSound() {
  playSequence([[440, 0.15], [330, 0.15], [220, 0.3]], 'square', 0.1);
}

// Login / sword slash - dramatic whoosh
export function playSwordSlashSound() {
  if (!audioCtx) return;
  try {
    audioCtx.resume();
    // White noise burst for "whoosh"
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2000, audioCtx.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
    // Follow with a metallic ring
    setTimeout(() => playTone(1200, 0.5, 'triangle', 0.15), 150);
  } catch {}
}
