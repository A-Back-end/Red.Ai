'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step1UploadProps {
  setMainImage: (file: File | null) => void;
  nextStep: () => void;
}

export default function Step1Upload({ setMainImage, nextStep }: Step1UploadProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
        setImage(file);
        setMainImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };


  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Upload Main Image</h2>
      <p className="text-gray-400 mb-6">Start by uploading the main picture of your interior.</p>

      <div
        className="w-full h-64 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-all duration-300 bg-gray-800/20"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-16 h-16 text-gray-500 mb-4" />
            <p className="text-gray-400">Drag & drop an image here or <span className="text-purple-400 font-semibold">browse</span></p>
          </div>
        )}
      </div>

      <Button
        onClick={nextStep}
        disabled={!image}
        className="mt-8 w-full max-w-xs bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        Next
      </Button>
    </div>
  );
} 