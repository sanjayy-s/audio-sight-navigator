// Different audio frequencies for different object types and distances
const AUDIO_FREQUENCIES = {
  near: {
    default: 880, // A5
    person: 660,  // E5
    door: 587,    // D5
    chair: 523,   // C5
  },
  medium: {
    default: 440, // A4
    person: 330,  // E4
    door: 293,    // D4
    chair: 261,   // C4
  },
  far: {
    default: 220, // A3
    person: 165,  // E3
    door: 146,    // D3
    chair: 130,   // C3
  }
};

// Enhanced emergency warning configuration for nearby objects (within 2m)
const PROXIMITY_ALERT = {
  frequency: 1500,  // Higher frequency for more urgent sound
  duration: 200,    // Slightly longer duration
  pattern: 3,       // Increased number of beeps for urgency
  interval: 150,    // Shorter interval between beeps
  volume: 0.8       // Louder volume for emergency warning
};

interface AudioFeedbackOptions {
  volume?: number;
  duration?: number;
}

let audioContext: AudioContext | null = null;

export const initializeAudio = (): boolean => {
  try {
    // Create audio context when the user interacts with the page
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return true;
  } catch (error) {
    console.error('Web Audio API is not supported in this browser', error);
    return false;
  }
};

export const playDetectionSound = (
  objectType: string = 'default',
  distance: 'near' | 'medium' | 'far' = 'medium',
  options: AudioFeedbackOptions = {}
): void => {
  if (!audioContext) {
    const initialized = initializeAudio();
    if (!initialized) return;
  }

  const { volume = 0.5, duration = 200 } = options;
  
  try {
    // Create oscillator
    const oscillator = audioContext!.createOscillator();
    const gainNode = audioContext!.createGain();
    
    // Set frequency based on object type and distance
    const typeFrequencies = AUDIO_FREQUENCIES[distance];
    const frequency = typeFrequencies[objectType as keyof typeof typeFrequencies] || typeFrequencies.default;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext!.currentTime);
    
    // Set volume
    gainNode.gain.setValueAtTime(volume, audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + duration / 1000);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext!.destination);
    
    // Start and stop the sound
    oscillator.start(audioContext!.currentTime);
    oscillator.stop(audioContext!.currentTime + duration / 1000);
    
    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  } catch (error) {
    console.error('Error playing audio feedback:', error);
  }
};

/**
 * Play an emergency warning sound for nearby objects (within 2m)
 * This creates an urgent alert sound to warn users of close proximity objects
 */
export const playProximityAlert = (): void => {
  if (!audioContext) {
    const initialized = initializeAudio();
    if (!initialized) return;
  }
  
  let beepCount = 0;
  
  const playBeep = () => {
    try {
      const oscillator = audioContext!.createOscillator();
      const gainNode = audioContext!.createGain();
      
      // Use a sawtooth wave for a more alarming sound
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(PROXIMITY_ALERT.frequency, audioContext!.currentTime);
      
      // Set higher volume for emergency warning
      gainNode.gain.setValueAtTime(PROXIMITY_ALERT.volume, audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + PROXIMITY_ALERT.duration / 1000);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext!.destination);
      
      oscillator.start(audioContext!.currentTime);
      oscillator.stop(audioContext!.currentTime + PROXIMITY_ALERT.duration / 1000);
      
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.error('Error playing emergency proximity alert:', error);
    }
  };
  
  // Play first beep immediately
  playBeep();
  beepCount++;
  
  // Schedule remaining beeps
  const alertInterval = setInterval(() => {
    playBeep();
    beepCount++;
    
    if (beepCount >= PROXIMITY_ALERT.pattern) {
      clearInterval(alertInterval);
    }
  }, PROXIMITY_ALERT.interval);
};

export const playFeedbackPattern = (
  objectType: string,
  distance: 'near' | 'medium' | 'far',
  count: number = 1,
  interval: number = 500
): void => {
  let played = 0;
  
  // Play the first sound immediately
  playDetectionSound(objectType, distance);
  played++;
  
  // Schedule remaining sounds if needed
  if (count > 1) {
    const patternInterval = setInterval(() => {
      playDetectionSound(objectType, distance);
      played++;
      
      if (played >= count) {
        clearInterval(patternInterval);
      }
    }, interval);
  }
};

// Adjust volume globally for all future sounds
export const setGlobalVolume = (volume: number): void => {
  if (audioContext) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    gainNode.connect(audioContext.destination);
  }
};

// Speak text aloud using speech synthesis
export const speakText = (text: string, rate: number = 1, pitch: number = 1): void => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Speech synthesis not supported in this browser');
  }
};
