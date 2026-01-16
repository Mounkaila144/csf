'use client';

import React, { useRef, useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { compressMultipleImages, isValidImageFile, isValidFileSize } from '@/lib/image-compression';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[], files?: File[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  onFilesReady?: (files: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  images,
  onImagesChange,
  onUpload,
  onFilesReady,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Vérifier le nombre total d'images
    if (images.length + fileArray.length > maxImages) {
      alert(`Vous ne pouvez ajouter que ${maxImages} images maximum. Actuellement: ${images.length}`);
      return;
    }

    // Validation des fichiers (limite avant compression)
    const invalidFiles = fileArray.filter(
      (file) => !isValidImageFile(file) || !isValidFileSize(file, 10)
    );

    if (invalidFiles.length > 0) {
      alert(
        `Fichiers invalides détectés:\n` +
        invalidFiles.map(f => `- ${f.name} (${f.type || 'type invalide'})`).join('\n') +
        `\n\nFormats acceptés: JPEG, PNG, WebP, GIF\nTaille max: 10MB par image (avant compression)`
      );
      return;
    }

    try {
      setIsUploading(true);

      // Compresser les images
      const compressedFiles = await compressMultipleImages(fileArray);

      if (onUpload) {
        // Mode avec upload API (édition)
        const uploadedUrls = await onUpload(compressedFiles);
        onImagesChange([...images, ...uploadedUrls]);
      } else {
        // Mode preview local (création)
        const blobUrls = compressedFiles.map((file) => URL.createObjectURL(file));
        onImagesChange([...images, ...blobUrls], compressedFiles);

        // Notifier le parent des fichiers compressés
        if (onFilesReady) {
          onFilesReady(compressedFiles);
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement des images:', error);
      alert('Erreur lors du traitement des images. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    handleFiles(e.target.files);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;

    const imageToRemove = images[index];

    // Libérer l'URL blob si c'est une URL locale
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
    }

    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled || isUploading ? undefined : handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 bg-blue-50 rounded-full">
            {isUploading ? (
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-blue-500" />
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              {isUploading ? 'Compression et upload en cours...' : 'Glissez vos images ici'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou cliquez pour sélectionner ({images.length}/{maxImages} images)
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Formats: JPEG, PNG, WebP, GIF
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ✨ Les images seront automatiquement compressées à ~200KB
            </p>
          </div>
        </div>
      </div>

      {/* Grille de prévisualisation */}
      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Images sélectionnées ({images.length})
            {images.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                (La première image sera l&apos;image principale)
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
                  <div
                      key={`${image}-${index}`}
                className="relative aspect-square group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
              >
                {/* Badge première image */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    Principale
                  </div>
                )}

                {/* Image */}
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay avec bouton supprimer */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    disabled={disabled}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Numéro de l'image */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}

            {/* Bouton ajouter plus */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={handleButtonClick}
                disabled={disabled || isUploading}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info compression */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Optimisation des images en cours
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Compression à 200KB maximum • Redimensionnement à 1200px • Qualité optimisée
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
