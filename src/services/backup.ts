import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { writeImageFromBase64 } from '@/services/imageStorage';
import { getSettings, saveSettings } from '@/services/settings';
import { getBoards, getButtons, getFirstThenPairs, restoreAll } from '@/services/storage';
import type { AACButtonData, AppSettings, Board, FirstThenPair } from '@/types';

const BACKUP_VERSION = 1;

interface BackupButton {
  id: string;
  label: string;
  createdAt: number;
  imageExtension: string;
  imageBase64: string;
}

interface BackupPayload {
  version: number;
  exportedAt: number;
  buttons: BackupButton[];
  boards: Board[];
  firstThenPairs: FirstThenPair[];
  settings: AppSettings;
}

/** Bundles every button's photo (as base64), plus boards/pairs/settings, into one shareable JSON file. */
export async function exportBackup(): Promise<void> {
  const [buttons, boards, firstThenPairs, settings] = await Promise.all([
    getButtons(),
    getBoards(),
    getFirstThenPairs(),
    getSettings(),
  ]);

  const backupButtons: BackupButton[] = await Promise.all(
    buttons.map(async (button) => {
      const file = new File(button.imageUri);
      return {
        id: button.id,
        label: button.label,
        createdAt: button.createdAt,
        imageExtension: file.extension || '.jpg',
        imageBase64: await file.base64(),
      };
    })
  );

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    buttons: backupButtons,
    boards,
    firstThenPairs,
    settings,
  };

  const fileName = `tapvoice-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const destination = new File(Paths.cache, fileName);
  if (destination.exists) {
    destination.delete();
  }
  destination.write(JSON.stringify(payload));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(destination.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Save TapVoice Backup',
    });
  }
}

export interface RestoreSummary {
  buttonCount: number;
  boardCount: number;
}

/** Picks a backup JSON file and replaces all current buttons/boards/pairs/settings with its contents. */
export async function importBackup(): Promise<RestoreSummary | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (result.canceled || !result.assets?.[0]?.uri) return null;

  const pickedFile = new File(result.assets[0].uri);
  const payload = JSON.parse(await pickedFile.text()) as BackupPayload;

  const restoredButtons: AACButtonData[] = payload.buttons.map((button) => ({
    id: button.id,
    label: button.label,
    createdAt: button.createdAt,
    imageUri: writeImageFromBase64(button.imageBase64, button.id, button.imageExtension),
  }));

  await restoreAll(restoredButtons, payload.boards, payload.firstThenPairs);
  if (payload.settings) {
    await saveSettings(payload.settings);
  }

  return { buttonCount: restoredButtons.length, boardCount: payload.boards.length };
}
