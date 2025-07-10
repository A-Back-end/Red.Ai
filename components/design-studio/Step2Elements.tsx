'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step2ElementsProps {
  setElements: (files: File[]) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step2Elements({ setElements, nextStep, prevStep }: Step2ElementsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      setElements(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setElements(updatedFiles);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      setElements(updatedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Add 2D Elements</h2>
      <p className="text-gray-400 mb-6">Upload additional 2D images like furniture or plants.</p>

      <div
        className="w-full min-h-[16rem] border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-purple-400 transition-all duration-300 bg-gray-800/20"
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
          multiple
        />
        {files.length === 0 ? (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-16 h-16 text-gray-500 mb-4" />
            <p className="text-gray-400">Drag & drop files here or <span className="text-purple-400 font-semibold">browse</span></p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }} 
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} className="text-white" />
                </button>
                <p className="text-xs text-gray-300 mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full justify-between mt-8 max-w-xs mx-auto">
        <Button
          onClick={prevStep}
          variant="outline"
          className="bg-transparent border-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-lg"
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