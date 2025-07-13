'use client';

import { useTranslation } from '@/lib/useTranslation';
import { UploadCloud } from 'lucide-react';
import React from 'react';

interface Step1UploadProps {
  setMainImage: (file: File | null) => void;
  nextStep: () => void;
}

export default function Step1Upload({ setMainImage, nextStep }: Step1UploadProps) {
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMainImage(e.target.files[0]);
      nextStep();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setMainImage(e.dataTransfer.files[0]);
      nextStep();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="text-center">
      <div className="flex justify-center items-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
          <UploadCloud className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {t('upload_main_image')}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        {t('start_by_uploading')}
      </p>
      <div
        className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 cursor-pointer
                   bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
          <UploadCloud className="w-10 h-10 mb-4" />
          <p className="font-semibold">
            {t('drag_drop_files')}{' '}
            <span className="text-blue-500 hover:underline">{t('or_browse_files')}</span>
          </p>
          <p className="text-xs mt-2">{t('supports_formats')}</p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
} 