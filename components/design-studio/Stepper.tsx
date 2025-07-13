import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface StepperProps {
  currentStep: number;
}

export default function Stepper({ currentStep }: StepperProps) {
  const { t } = useTranslation();
  const steps = [
    { key: 'upload_main_image', label: t('upload_main_image') },
    { key: 'add_2d_elements', label: t('add_2d_elements') },
    { key: 'generation_settings', label: t('generation_settings') },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-purple-500 bg-purple-100 dark:border-purple-400 dark:bg-purple-400/20 text-purple-600 dark:text-purple-300'
                    : isCompleted
                    ? 'border-green-500 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isCompleted ? <Check size={20} /> : stepNumber}
              </div>
              <p
                className={`mt-2 text-xs font-medium transition-all duration-300 ${
                  isActive || isCompleted
                    ? 'text-gray-800 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
} 