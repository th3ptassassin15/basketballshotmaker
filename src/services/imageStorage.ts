import { Directory, File, Paths } from 'expo-file-system';

const imagesDirectory = new Directory(Paths.document, 'tapvoice-images');

function ensureDirExists(): void {
  if (!imagesDirectory.exists) {
    imagesDirectory.create({ intermediates: true });
  }
}

/** Copies a temporary picker/camera URI into permanent app storage and returns the new local URI. */
export function persistImage(tempUri: string, buttonId: string): string {
  ensureDirExists();
  const sourceFile = new File(tempUri);
  const extension = sourceFile.extension || '.jpg';
  const destination = new File(imagesDirectory, `${buttonId}${extension}`);
  sourceFile.copySync(destination);
  return destination.uri;
}

export function deleteImage(uri: string): void {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}
