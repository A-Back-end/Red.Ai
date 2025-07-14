'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';

interface Step2ElementsProps {
  setElements: (files: File[]) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export default function Step2Elements({ setElements, nextStep, prevStep }: Step2ElementsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setElements(files);
  }, [files, setElements]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const firstError = rejectedFiles[0].errors[0];
      if (firstError.code === 'file-too-large') {
        setError(`One or more files are too large. Max size is ${MAX_SIZE / 1024 / 1024}MB.`);
      } else if (firstError.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload JPG, PNG, or WEBP images.');
      } else {
        setError(firstError.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setFiles(currentFiles => [...currentFiles, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_SIZE,
  });

  const removeFile = (index: number) => {
    setFiles(currentFiles => currentFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Add 2D Elements (Optional)</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">Upload additional 2D images like furniture or decorations.</p>

      <div
        {...getRootProps()}
        className={`w-full min-h-[16rem] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 bg-slate-50 dark:bg-slate-800/20
        ${isDragActive ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600'}
        ${error ? 'border-red-500' : 'hover:border-purple-400'}`}
      >
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Drag & drop files here or <span className="text-purple-500 dark:text-purple-400 font-semibold">browse</span></p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">JPG, PNG, WEBP up to 10MB each</p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group bg-slate-100 dark:bg-slate-700/50 p-1 rounded-md">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }} 
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove file"
                >
                  <X size={14} className="text-white" />
                </button>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate px-1">{file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}

      <div className="flex w-full justify-between mt-8 max-w-xs mx-auto">
        <Button
          onClick={prevStep}
          variant="outline"
          className="bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-lg"
        >
          Back
        </Button>
        <Button
          onClick={nextStep}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
} 