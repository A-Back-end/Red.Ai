'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from '@/lib/useTranslation';

interface Step1UploadProps {
  setMainImage: (file: File | null) => void;
  nextStep: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export default function Step1Upload({ setMainImage, nextStep }: Step1UploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const firstError = rejectedFiles[0].errors[0];
      if (firstError.code === 'file-too-large') {
        setError(`File is too large. Max size is ${MAX_SIZE / 1024 / 1024}MB.`);
      } else if (firstError.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      } else {
        setError(firstError.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setMainImage(file);
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, [setMainImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('upload_main_image')}</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{t('start_by_uploading')}</p>

      <div
        {...getRootProps()}
        className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 
        bg-slate-100 dark:bg-gray-800/20 
        ${isDragActive ? 'border-purple-500' : 'border-slate-300 dark:border-gray-600'}
        ${error ? 'border-red-500' : 'hover:border-purple-400'}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-16 h-16 text-slate-500 dark:text-gray-500 mb-4" />
            <p className="text-slate-600 dark:text-gray-400">{t('drag_drop_files')} <span className="text-purple-500 dark:text-purple-400 font-semibold">{t('or_browse_files')}</span></p>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">{t('supports_formats')}</p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}

      <Button
        onClick={nextStep}
        disabled={!imageFile}
        className="mt-8 w-full max-w-xs"
      >
        {t('next_step')}
      </Button>
    </div>
  );
} 