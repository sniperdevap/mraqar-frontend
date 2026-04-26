'use client';
import React from 'react';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-center mb-6 relative">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-3 left-1/2 h-3 z-0 ${currentStep > step.id ? 'bg-[linear-gradient(var(--color-primary-yellow-gradient-start),var(--color-primary-yellow-gradient-end))]' : ''}`}
                  style={{
                    width: 'calc(100% - 1rem)',
                    transform: 'translateX(0.5rem)',
                    backgroundColor: currentStep > step.id ? '' : 'var(--color-primary-gray)',
                    boxShadow: currentStep > step.id ? '' : 'inset 0 0 2.6px 0 rgba(0,0,0,0.15)',
                  }}
                />
              )}

              <div
                className={`w-10 h-10 rounded-full border-7 shadow-xl shadow-gray-300 border-(--color-white) flex items-center justify-center mb-2 text-sm font-medium relative z-10 ${
                  isCompleted
                    ? 'bg-[linear-gradient(var(--color-primary-yellow-gradient-start),var(--color-primary-yellow-gradient-end))] text-(--color-white)'
                    : isActive
                      ? 'bg-[linear-gradient(var(--color-primary-yellow-gradient-start),var(--color-primary-yellow-gradient-end))] text-(--color-white)'
                      : 'bg-(--color-primary-gray) text-(--color-gray-text)'
                }`}
              >
                {step.id}
              </div>

              <div
                className={`w-0 h-0 mb-1 ${
                  isActive || isCompleted
                    ? 'border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-[var(--color-primary-yellow-gradient-start)]'
                    : 'border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-[var(--color-primary-gray)]'
                }`}
              />

              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${isActive || isCompleted ? 'bg-[linear-gradient(var(--color-primary-yellow-gradient-start),var(--color-primary-yellow-gradient-end))] text-[var(--color-white)]' : 'bg-[var(--color-primary-gray)] text-[var(--color-gray-text)]'}`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
