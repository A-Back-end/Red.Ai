'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';

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
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upload Main Image</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">Start by uploading the main picture of your interior.</p>

      <div
        {...getRootProps()}
        className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-slate-50 dark:bg-slate-800/20 
        ${isDragActive ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600'}
        ${error ? 'border-red-500' : 'hover:border-purple-400'}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Drag & drop an image here or <span className="text-purple-500 dark:text-purple-400 font-semibold">browse</span></p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">JPG, PNG, WEBP up to 10MB</p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}

      <Button
        onClick={nextStep}
        disabled={!imageFile}
        className="mt-8 w-full max-w-xs bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
      >
        Next
      </Button>
    </div>
  );
} 