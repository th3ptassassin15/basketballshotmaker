import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppSettings } from '@/types';

const SETTINGS_KEY = 'tapvoice:settings';

export const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 0.9,
  speechPitch: 1.0,
  voiceIdentifier: null,
  showLabels: true,
  hapticsEnabled: true,
  homeBoardId: null,
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
