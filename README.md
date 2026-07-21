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
  works fully offline.
- **Boards** (`Boards` tab) — a grid of your saved buttons. Tapping a button
  speaks its label aloud (via `expo-speech`) with a scale + border-highlight
  animation for visual feedback.
- **Settings** tab — placeholder for now.

Not yet built: multiple custom boards, adjustable grid sizes, long-press
edit/delete, and the First/Then board builder.

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
  app/                  Expo Router routes (file-based)
    _layout.tsx         Root layout (Stack, safe area, status bar)
    (tabs)/
      _layout.tsx        Bottom tab navigator: Boards / Create / Settings
      boards.tsx         Choice board grid + tap-to-speak
      creator.tsx        Camera -> label -> save AAC button flow
      settings.tsx
  components/
    AACButtonTile.tsx    Photo + label tile with tap animation
  constants/
    theme.ts             Fixed, high-contrast, calm color palette + spacing
  services/
    storage.ts           AsyncStorage-backed persistence for buttons/boards
    imageStorage.ts       Copies captured photos into permanent app storage
    speech.ts             expo-speech wrapper
  types/
    index.ts              AACButtonData, Board, FirstThenPair
  utils/
    id.ts                 Local id generation
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
