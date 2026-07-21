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

/** Copies a temporary picker/camera URI into permanent app storage and returns the new local URI. */
export function persistImage(tempUri: string, buttonId: string): string {
  const sourceFile = new File(tempUri);
  const extension = sourceFile.extension || '.jpg';
  const destination = new File(getImagesDirectory(), `${buttonId}${extension}`);
  sourceFile.copySync(destination);
  return destination.uri;
}

export function deleteImage(uri: string): void {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

/** Writes a base64-encoded image (e.g. from a restored backup) into permanent app storage. */
export function writeImageFromBase64(base64: string, buttonId: string, extension: string): string {
  const destination = new File(getImagesDirectory(), `${buttonId}${extension}`);
  destination.write(base64, { encoding: 'base64' });
  return destination.uri;
}
