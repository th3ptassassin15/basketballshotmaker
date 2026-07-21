import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AACButtonData, Board } from '@/types';

const BUTTONS_KEY = 'tapvoice:buttons';
const BOARDS_KEY = 'tapvoice:boards';
const DEFAULT_BOARD_ID = 'default';

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getButtons(): Promise<AACButtonData[]> {
  return readJSON<AACButtonData[]>(BUTTONS_KEY, []);
}

export async function getBoards(): Promise<Board[]> {
  const boards = await readJSON<Board[]>(BOARDS_KEY, []);
  if (boards.length > 0) return boards;

  const defaultBoard: Board = {
    id: DEFAULT_BOARD_ID,
    name: 'My Buttons',
    columns: 3,
    buttonIds: [],
    createdAt: Date.now(),
  };
  await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify([defaultBoard]));
  return [defaultBoard];
}

/** Saves a new button and adds it to the default board so it's immediately visible on Boards. */
export async function saveButton(button: AACButtonData): Promise<void> {
  const buttons = await getButtons();
  await AsyncStorage.setItem(BUTTONS_KEY, JSON.stringify([...buttons, button]));

  const boards = await getBoards();
  const nextBoards = boards.map((board) =>
    board.id === DEFAULT_BOARD_ID ? { ...board, buttonIds: [...board.buttonIds, button.id] } : board
  );
  await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(nextBoards));
}

export async function deleteButton(buttonId: string): Promise<void> {
  const buttons = await getButtons();
  await AsyncStorage.setItem(
    BUTTONS_KEY,
    JSON.stringify(buttons.filter((button) => button.id !== buttonId))
  );

  const boards = await getBoards();
  const nextBoards = boards.map((board) => ({
    ...board,
    buttonIds: board.buttonIds.filter((id) => id !== buttonId),
  }));
  await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(nextBoards));
}

export async function updateButtonLabel(buttonId: string, label: string): Promise<void> {
  const buttons = await getButtons();
  const next = buttons.map((button) => (button.id === buttonId ? { ...button, label } : button));
  await AsyncStorage.setItem(BUTTONS_KEY, JSON.stringify(next));
}
