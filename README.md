# TapVoice Creator

An offline-first AAC (Augmentative and Alternative Communication) app for special
education teachers and parents. Snap a photo of a real-world object, add a text
label, and it becomes a talking button that can be organized into custom Choice
Boards.

Built with Expo (React Native + TypeScript) and Expo Router, targeting iPhone,
iPad, and Android.

## Status

This is being built step by step. Implemented so far:

- **Snap-to-Speech Creator** (`Create` tab) — take a photo, crop it, label it,
  and save it as an AAC button. Images are copied into permanent app storage
  and button metadata is persisted locally with AsyncStorage, so everything
  works fully offline. Every new button is automatically added to the
  built-in "All Buttons" library board.
- **Choice Boards** (`Boards` tab) — a list of boards you've created. Each
  board has its own adjustable grid size (2x2 / 3x3 / 4x4) and its own subset
  of buttons:
  - Create new boards (name + grid size) from the `+` on the Boards tab.
  - Open a board to see its grid; tap a button to hear it spoken aloud with a
    scale + border-highlight animation for visual feedback.
  - "Add Buttons" on a board pulls in any existing button from your library.
  - "Board Settings" renames a board, changes its grid size, or deletes it
    (the library board can't be deleted, so every button always has a home).
  - Long-press any button for **Edit** (change the label and/or retake the
    photo) or **Delete** (removes it everywhere it's used).
- **Settings** tab — placeholder for now.

Not yet built: the First/Then board builder.

## Get started

```bash
npm install
npx expo start
```

Then open the project in a development build, the iOS Simulator, an Android
emulator, or Expo Go.

Camera capture requires a real device or a simulator/emulator with camera
support configured — `expo-image-picker`'s camera launcher will prompt for
camera permission the first time it's used.

## Project structure

```
src/
  app/                       Expo Router routes (file-based)
    _layout.tsx              Root layout (Stack, safe area, status bar)
    (tabs)/
      _layout.tsx             Bottom tab navigator: Boards / Create / Settings
      boards.tsx              List of Choice Boards
      creator.tsx             Camera -> label -> save AAC button flow
      settings.tsx
    board/
      _layout.tsx             Modal-friendly Stack for board routes
      new.tsx                 Create board (name + grid size)
      [id]/index.tsx          Board grid + tap-to-speak + long-press menu
      [id]/settings.tsx        Rename / grid size / delete board
      [id]/add-buttons.tsx     Add existing library buttons to this board
    button/
      _layout.tsx
      [id]/edit.tsx           Edit label / retake photo / delete button
  components/
    AACButtonTile.tsx        Photo + label tile with tap animation
    ButtonActionSheet.tsx    Long-press Edit/Delete sheet
    GridSizePicker.tsx       2x2 / 3x3 / 4x4 selector
  constants/
    theme.ts                 Fixed, high-contrast, calm color palette + spacing
  services/
    storage.ts               AsyncStorage-backed persistence for buttons/boards
    imageStorage.ts           Copies captured photos into permanent app storage
    speech.ts                 expo-speech wrapper
  types/
    index.ts                  AACButtonData, Board, FirstThenPair
  utils/
    id.ts                     Local id generation
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
