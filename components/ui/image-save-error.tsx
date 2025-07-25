'use client';

import React, { useState } from 'react';
import { AlertCircle, Download, RefreshCw, X } from 'lucide-react';

interface ImageSaveErrorProps {
  error: string;
  details?: string;
  imageUrl?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ImageSaveError: React.FC<ImageSaveErrorProps> = ({
  error,
  details,
  imageUrl,
  onRetry,
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleManualDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-800">
              Ошибка сохранения изображения
            </h3>
            
            <div className="flex items-center space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Повторить
                </button>
              )}
              
              {imageUrl && (
                <button
                  onClick={handleManualDownload}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Скачать
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center p-1 text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>
          
          {details && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                {isExpanded ? 'Скрыть детали' : 'Показать детали'}
              </button>
              
              {isExpanded && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 font-mono break-all">
                  {details}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-3 text-xs text-red-600">
            <p>Возможные решения:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Проверьте подключение к интернету</li>
              <li>Попробуйте повторить сохранение</li>
              <li>Скачайте изображение вручную</li>
              <li>Обратитесь к администратору, если проблема повторяется</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSaveError; 