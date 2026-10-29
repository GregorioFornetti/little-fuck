/**
 * Tiny synthesized sound effects (Web Audio, no audio files).
 * The context is created lazily and resumed on user gestures, as browsers
 * block audio before the first interaction with the page.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/** Call from any user gesture so later game sounds are allowed to play. */
export function unlockAudio(): void {
  getAudioContext();
}

function playTone(
  frequency: number,
  delaySeconds: number,
  durationSeconds: number,
  type: OscillatorType = 'sine',
  volume = 0.06
): void {
  const context = getAudioContext();
  if (!context) return;

  try {
    const start = context.currentTime + delaySeconds;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSeconds);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + durationSeconds + 0.05);
  } catch {
    // Sounds are decorative; never let them break the game.
  }
}

/** Short papery thock when a card lands on the table. */
export function playCardSound(): void {
  playTone(340, 0, 0.07, 'triangle', 0.07);
  playTone(520, 0.025, 0.05, 'triangle', 0.04);
}

/** Pleasant rising notes when the current player wins a round. */
export function playRoundWinSound(): void {
  playTone(523.25, 0, 0.12, 'sine', 0.06);
  playTone(659.25, 0.09, 0.12, 'sine', 0.06);
  playTone(783.99, 0.18, 0.18, 'sine', 0.06);
}

/** Soft falling notes when someone else wins a round. */
export function playRoundLoseSound(): void {
  playTone(329.63, 0, 0.14, 'sine', 0.045);
  playTone(261.63, 0.11, 0.2, 'sine', 0.045);
}
