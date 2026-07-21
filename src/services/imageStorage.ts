import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

// Constructed lazily (not at module scope) since Paths.document throws on platforms
// without a native file system, e.g. during a web export/static render.
function getImagesDirectory(): Directory {
  const directory = new Directory(Paths.document, 'tapvoice-images');
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }
  return directory;
}

/**
 * Copies a temporary picker/camera URI into permanent app storage and returns the new local URI.
 * On web there's no native file system, so `webBase64` (requested from the picker) is stored
 * directly as a data URI instead — AsyncStorage's web backend persists it fine.
 */
export function persistImage(tempUri: string, buttonId: string, webBase64?: string | null): string {
  if (Platform.OS === 'web') {
    return webBase64 ? `data:image/jpeg;base64,${webBase64}` : tempUri;
  }

  const sourceFile = new File(tempUri);
  const extension = sourceFile.extension || '.jpg';
  const destination = new File(getImagesDirectory(), `${buttonId}${extension}`);
  sourceFile.copySync(destination);
  return destination.uri;
}

export function deleteImage(uri: string): void {
  if (Platform.OS === 'web') return;
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

/** Writes a base64-encoded image (e.g. from a restored backup) into permanent app storage. */
export function writeImageFromBase64(base64: string, buttonId: string, extension: string): string {
  if (Platform.OS === 'web') {
    return `data:image/jpeg;base64,${base64}`;
  }
  const destination = new File(getImagesDirectory(), `${buttonId}${extension}`);
  destination.write(base64, { encoding: 'base64' });
  return destination.uri;
}
