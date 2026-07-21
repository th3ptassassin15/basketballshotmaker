import * as Speech from 'expo-speech';

import { DEFAULT_SETTINGS } from '@/services/settings';
import type { AppSettings } from '@/types';

type SpeechSettings = Pick<AppSettings, 'speechRate' | 'speechPitch' | 'voiceIdentifier'>;

export function speak(text: string, settings: SpeechSettings = DEFAULT_SETTINGS): void {
  Speech.stop();
  Speech.speak(text, {
    rate: settings.speechRate,
    pitch: settings.speechPitch,
    voice: settings.voiceIdentifier ?? undefined,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
