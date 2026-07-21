import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AACButtonData, Board, FirstThenPair } from '@/types';
import { generateId } from '@/utils/id';

const BUTTONS_KEY = 'tapvoice:buttons';
const BOARDS_KEY = 'tapvoice:boards';
const FIRST_THEN_KEY = 'tapvoice:firstThen';

/** Every button is always added here on creation, so it always has a home even before being organized. */
export const LIBRARY_BOARD_ID = 'default';

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function saveBoards(boards: Board[]): Promise<void> {
  await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

async function saveButtons(buttons: AACButtonData[]): Promise<void> {
  await AsyncStorage.setItem(BUTTONS_KEY, JSON.stringify(buttons));
}

async function saveFirstThenPairs(pairs: FirstThenPair[]): Promise<void> {
  await AsyncStorage.setItem(FIRST_THEN_KEY, JSON.stringify(pairs));
}

export async function getButtons(): Promise<AACButtonData[]> {
  return readJSON<AACButtonData[]>(BUTTONS_KEY, []);
}

export async function getBoards(): Promise<Board[]> {
  const boards = await readJSON<Board[]>(BOARDS_KEY, []);
  if (boards.length > 0) return boards;

  const libraryBoard: Board = {
    id: LIBRARY_BOARD_ID,
    name: 'All Buttons',
    columns: 3,
    buttonIds: [],
    createdAt: Date.now(),
  };
  await saveBoards([libraryBoard]);
  return [libraryBoard];
}

export async function getBoard(boardId: string): Promise<Board | undefined> {
  const boards = await getBoards();
  return boards.find((board) => board.id === boardId);
}

/** Saves a new button and adds it to the library board so it's immediately visible on Boards. */
export async function saveButton(button: AACButtonData): Promise<void> {
  const buttons = await getButtons();
  await saveButtons([...buttons, button]);

  const boards = await getBoards();
  await saveBoards(
    boards.map((board) =>
      board.id === LIBRARY_BOARD_ID ? { ...board, buttonIds: [...board.buttonIds, button.id] } : board
    )
  );
}

export async function updateButton(
  buttonId: string,
  updates: Partial<Pick<AACButtonData, 'label' | 'imageUri'>>
): Promise<void> {
  const buttons = await getButtons();
  await saveButtons(buttons.map((button) => (button.id === buttonId ? { ...button, ...updates } : button)));
}

/** Deletes a button everywhere: the library, every board it was added to, and any First/Then pair using it. */
export async function deleteButton(buttonId: string): Promise<void> {
  const buttons = await getButtons();
  await saveButtons(buttons.filter((button) => button.id !== buttonId));

  const boards = await getBoards();
  await saveBoards(
    boards.map((board) => ({
      ...board,
      buttonIds: board.buttonIds.filter((id) => id !== buttonId),
    }))
  );

  const pairs = await getFirstThenPairs();
  await saveFirstThenPairs(
    pairs.filter((pair) => pair.firstButtonId !== buttonId && pair.thenButtonId !== buttonId)
  );
}

export async function createBoard(name: string, columns: number): Promise<Board> {
  const boards = await getBoards();
  const board: Board = {
    id: generateId(),
    name,
    columns,
    buttonIds: [],
    createdAt: Date.now(),
  };
  await saveBoards([...boards, board]);
  return board;
}

export async function renameBoard(boardId: string, name: string): Promise<void> {
  const boards = await getBoards();
  await saveBoards(boards.map((board) => (board.id === boardId ? { ...board, name } : board)));
}

export async function updateBoardColumns(boardId: string, columns: number): Promise<void> {
  const boards = await getBoards();
  await saveBoards(boards.map((board) => (board.id === boardId ? { ...board, columns } : board)));
}

/** The library board can't be deleted: every button needs at least one guaranteed home. */
export async function deleteBoard(boardId: string): Promise<void> {
  if (boardId === LIBRARY_BOARD_ID) return;
  const boards = await getBoards();
  await saveBoards(boards.filter((board) => board.id !== boardId));
}

export async function addButtonsToBoard(boardId: string, buttonIds: string[]): Promise<void> {
  const boards = await getBoards();
  await saveBoards(
    boards.map((board) =>
      board.id === boardId
        ? { ...board, buttonIds: Array.from(new Set([...board.buttonIds, ...buttonIds])) }
        : board
    )
  );
}

export async function getFirstThenPairs(): Promise<FirstThenPair[]> {
  return readJSON<FirstThenPair[]>(FIRST_THEN_KEY, []);
}

export async function createFirstThenPair(firstButtonId: string, thenButtonId: string): Promise<FirstThenPair> {
  const pairs = await getFirstThenPairs();
  const pair: FirstThenPair = {
    id: generateId(),
    firstButtonId,
    thenButtonId,
    createdAt: Date.now(),
  };
  await saveFirstThenPairs([...pairs, pair]);
  return pair;
}

export async function deleteFirstThenPair(pairId: string): Promise<void> {
  const pairs = await getFirstThenPairs();
  await saveFirstThenPairs(pairs.filter((pair) => pair.id !== pairId));
}
