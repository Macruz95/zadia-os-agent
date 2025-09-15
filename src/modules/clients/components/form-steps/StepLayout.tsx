'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StepLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepTitles: string[];
}

export function StepLayout({
  children,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  isFirstStep,
  isLastStep,
  stepTitles
}: StepLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}
                `}
              >
                {stepNumber}
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`
                    w-12 h-0.5 mx-2
                    ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current Step Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Paso {currentStep} de {totalSteps}: {stepTitles[currentStep - 1]}
        </h2>
      </div>
      
      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? 'Creando...' : 'Crear Cliente'}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            className="gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}