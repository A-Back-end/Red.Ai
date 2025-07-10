import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
}

const steps = ['Upload Image', 'Add 2D Elements', 'Generation Settings'];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-purple-400 bg-purple-400/20 text-purple-300'
                    : isCompleted
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-gray-600 text-gray-500'
                }`}
              >
                {isCompleted ? <Check size={20} /> : stepNumber}
              </div>
              <p
                className={`mt-2 text-xs font-medium transition-all duration-300 ${
                  isActive || isCompleted ? 'text-white' : 'text-gray-500'
                }`}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
} 