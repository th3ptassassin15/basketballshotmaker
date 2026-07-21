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
  createdAt: number;
}

export interface FirstThenPair {
  id: string;
  firstButtonId: string;
  thenButtonId: string;
  createdAt: number;
}
