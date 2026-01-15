import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

export interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

/**
 * Options de compression par défaut (optimisé pour le web)
 * - maxSizeMB: 0.2MB (200Ko) maximum pour un chargement rapide
 * - maxWidthOrHeight: 1200px maximum (suffisant pour l'affichage web)
 * - useWebWorker: true pour ne pas bloquer l'UI
 * - quality: 0.75 (75%) - bon compromis qualité/taille
 */
const defaultOptions: CompressionOptions = {
  maxSizeMB: 0.2,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  quality: 0.75,
};

/**
 * Compresse une seule image
 * @param file - Fichier image à compresser
 * @param options - Options de compression (optionnel)
 * @returns Promise<File> - Fichier compressé
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    console.log(`Compression de ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

    const compressedFile = await imageCompression(file, mergedOptions);

    console.log(
      `✓ Compressé: ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`
    );

    return compressedFile;
  } catch (error) {
    console.error('Erreur lors de la compression:', error);
    throw new Error(`Échec de la compression de ${file.name}`);
  }
}

/**
 * Compresse plusieurs images en parallèle
 * @param files - Array de fichiers images à compresser
 * @param options - Options de compression (optionnel)
 * @returns Promise<File[]> - Array de fichiers compressés
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    console.log(`Compression de ${files.length} image(s)...`);

    const compressionPromises = files.map((file) =>
      imageCompression(file, mergedOptions)
    );

    const compressedFiles = await Promise.all(compressionPromises);

    const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalCompressedSize = compressedFiles.reduce((sum, file) => sum + file.size, 0);
    const savedSize = totalOriginalSize - totalCompressedSize;
    const savedPercent = ((savedSize / totalOriginalSize) * 100).toFixed(1);

    console.log(
      `✓ ${files.length} image(s) compressée(s). ` +
      `Économie: ${(savedSize / 1024 / 1024).toFixed(2)} MB (${savedPercent}%)`
    );

    return compressedFiles;
  } catch (error) {
    console.error('Erreur lors de la compression multiple:', error);
    throw new Error('Échec de la compression des images');
  }
}

/**
 * Récupère les informations d'une image (dimensions, taille, etc.)
 * @param file - Fichier image
 * @returns Promise<ImageInfo> - Informations de l'image
 */
export async function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error(`Impossible de charger l'image ${file.name}`));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error(`Impossible de lire le fichier ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Valide si un fichier est une image
 * @param file - Fichier à valider
 * @returns boolean
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Valide la taille d'un fichier
 * @param file - Fichier à valider
 * @param maxSizeMB - Taille maximale en MB (défaut: 5MB)
 * @returns boolean
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
