import * as Speech from 'expo-speech';

export function speak(text: string): void {
  Speech.stop();
  Speech.speak(text, {
    rate: 0.9,
    pitch: 1.0,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
