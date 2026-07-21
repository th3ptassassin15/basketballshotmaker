# TapVoice Creator

An offline-first AAC (Augmentative and Alternative Communication) app for special
education teachers and parents. Snap a photo of a real-world object, add a text
label, and it becomes a talking button that can be organized into custom Choice
Boards.

Built with Expo (React Native + TypeScript) and Expo Router, targeting iPhone,
iPad, and Android.

## Status

This is being built step by step. Implemented so far:

- **Snap-to-Speech Creator** (`Create` tab) — take a photo (camera or photo
  library), crop it, label it, and save it as an AAC button. Images are copied
  into permanent app storage and metadata is persisted locally with
  AsyncStorage, so everything works fully offline. Every new button is
  automatically added to the built-in "All Buttons" library board.
- **Choice Boards** (`Boards` tab) — a list of boards you've created. Each
  board has its own adjustable grid size (2x2 / 3x3 / 4x4) and its own subset
  of buttons:
  - Create new boards (name + grid size) from the `+` on the Boards tab.
  - Open a board to see its grid; tap a button to hear it spoken aloud with a
    scale + border-highlight animation for visual feedback. Tapped buttons
    also collect in a **sentence-building strip** at the top of the screen —
    tap "speak" to hear the whole phrase read back as one utterance (e.g.
    "I want juice"), tap a chip to remove it, or clear the whole strip.
  - **Link other boards** from a board's header — linked boards show up as
    folder tiles you can tap to jump straight to that board, so a large
    vocabulary can be organized into a Home → Category → Words hierarchy
    instead of one flat list. Long-press a folder tile to unlink it (the
    linked board itself isn't deleted).
  - "Add Buttons" pulls in any existing button from your library (searchable
    once your library grows past a handful of buttons).
  - "Board Settings" renames a board, changes its grid size, or deletes it
    (the library board can't be deleted, so every button always has a home).
  - Long-press any button for **Edit** (change the label, retake the photo,
    or choose a different photo from your library) or **Delete** (removes it
    everywhere it's used).
  - A **Home Board** (set in Settings) is featured as a one-tap shortcut at
    the top of the Boards tab.
- **First/Then builder** — a quick-access tool reached from a header icon on
  the Boards tab. Pick any two existing buttons ("First" and "Then") and save
  them as a pairing; opening one shows a full-screen split view where tapping
  either side speaks it aloud — a simple visual + audio contract like
  "First: WORK, Then: RECESS". Deleting a pairing only removes the pairing,
  not the underlying buttons.
- **Settings** tab — a real accessibility control panel:
  - Choose from every voice installed on the device, with a "Preview Voice"
    button, plus speech rate and pitch steppers (large +/− buttons, not a
    thin slider, for easier motor control).
  - **Icon-only mode** (hide word labels) for pre-readers.
  - **Vibrate on tap** toggle for extra sensory feedback.
  - Pick a **Home Board**.
  - **Backup & Restore** — export every button, photo, board, and setting to
    a single file you can save to Files, Drive, or email, and restore it on
    this device or a new one. This is the answer to "what if the iPad is
    lost or replaced" — a real barrier to classroom adoption otherwise.

All MVP features from the original spec are implemented, plus a set of
competitive/accessibility improvements aimed at closing gaps with apps like
Proloquo2Go, TouchChat, and LAMP Words for Life (see below).

### Deliberately not built (roadmap)

- A built-in core-vocabulary symbol library (PCS/SymbolStix-style) — this is
  a licensing question, not an engineering one; the app is photo-first by
  design instead.
- Premium neural/child-like TTS voices — limited by what's installed on the
  device; `expo-speech` only exposes the system's own voices.
- Switch-scanning / switch-access input for users who can't touch the
  screen directly — a substantial separate input subsystem (scan timing,
  switch pairing, auto-highlight) that would need its own design pass.
- Multi-student profiles per device.

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
  app/                        Expo Router routes (file-based)
    _layout.tsx               Root layout (Stack, safe area, status bar, SettingsProvider)
    (tabs)/
      _layout.tsx              Bottom tab navigator: Boards / Create / Settings
      boards.tsx               List of Choice Boards + Home Board shortcut
      creator.tsx              Camera/library -> label -> save AAC button flow
      settings.tsx             Voice, display, home board, backup & restore
    board/
      _layout.tsx              Modal-friendly Stack for board routes
      new.tsx                  Create board (name + grid size)
      [id]/index.tsx           Board grid + sentence strip + long-press menu
      [id]/settings.tsx         Rename / grid size / delete board
      [id]/add-buttons.tsx      Add existing library buttons to this board (searchable)
      [id]/link-boards.tsx      Link other boards as folder tiles on this board
    button/
      _layout.tsx
      [id]/edit.tsx            Edit label / retake or choose photo / delete button
    first-then/
      _layout.tsx
      index.tsx                List of saved First/Then pairings
      new.tsx                  Pick First + Then buttons and save
      [id].tsx                 Full-screen split viewer, tap each side to speak
  components/
    AACButtonTile.tsx         Photo + label tile with tap animation + haptics
    BoardLinkTile.tsx         Folder-style tile that navigates to another board
    ButtonActionSheet.tsx     Long-press Edit/Delete sheet
    ButtonPickerModal.tsx     Full-screen searchable button picker (First/Then)
    GridSizePicker.tsx        2x2 / 3x3 / 4x4 selector
    Stepper.tsx               Large +/− numeric control (rate, pitch, etc.)
  constants/
    theme.ts                  Fixed, high-contrast, calm color palette + spacing
  context/
    SettingsContext.tsx       App-wide reactive settings (voice, labels, haptics, home board)
  services/
    storage.ts                AsyncStorage-backed persistence for buttons/boards/pairs
    imageStorage.ts            Copies captured photos into permanent app storage
    settings.ts                AsyncStorage-backed persistence for AppSettings
    backup.ts                  Export/import a full backup as a shareable JSON file
    speech.ts                  expo-speech wrapper (rate/pitch/voice aware)
  types/
    index.ts                   AACButtonData, Board, FirstThenPair, AppSettings
  utils/
    id.ts                      Local id generation
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
