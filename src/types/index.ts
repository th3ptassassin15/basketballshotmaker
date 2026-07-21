export interface AACButtonData {
  id: string;
  label: string;
  /** Local file:// URI under the app's document directory. */
  imageUri: string;
  createdAt: number;
}

export interface Board {
  id: string;
  name: string;
  columns: number;
  buttonIds: string[];
  /** Other boards linked from this one, shown as tappable folder tiles that navigate instead of speak. */
  linkedBoardIds: string[];
  createdAt: number;
}

export interface FirstThenPair {
  id: string;
  firstButtonId: string;
  thenButtonId: string;
  createdAt: number;
}

export interface AppSettings {
  speechRate: number;
  speechPitch: number;
  /** expo-speech Voice identifier, or null to use the system default. */
  voiceIdentifier: string | null;
  /** When false, button tiles show only the photo, no printed word (for pre-readers). */
  showLabels: boolean;
  hapticsEnabled: boolean;
  /** Board id to feature as a quick-access shortcut on the Boards tab. */
  homeBoardId: string | null;
}
