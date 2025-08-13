import React from 'react';
import { Check, Upload, Plus, Settings } from 'lucide-react';

interface StepperProps {
  currentStep: number;
}

// Define steps with names and icons
const steps = [
  { name: 'Upload Main Image', icon: Upload },
  { name: 'Add 2D Elements', icon: Plus },
  { name: 'Generation Settings', icon: Settings },
];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map(({ name, icon: Icon }, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <React.Fragment key={name}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-400 shadow-lg shadow-blue-500/20'
                    : isCompleted
                    ? 'border-green-500 bg-green-500/10 text-green-500 dark:border-green-400 dark:bg-green-400/10 dark:text-green-400'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`
                }
              >
                {isCompleted ? <Check size={20} /> : <Icon size={18} />}
              </div>
              <p
                className={`mt-2 text-xs font-medium transition-all duration-300 w-24
                  ${isActive || isCompleted
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-500 dark:text-slate-400'
                  }`
                }
              >
                {name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`
                }
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
} 