import React from 'react';
import { setupSteps } from './constants';

interface StepIndicatorProps {
    currentStep: number;
    onStepClick: (index: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
    return (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mt-6">
            {setupSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCurrent = index === currentStep;

                return (
                    <button
                        key={step.id}
                        onClick={() => onStepClick(index)}
                        className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer focus:outline-none ${isCurrent ? 'bg-primary/10' : 'hover:bg-muted'
                            }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-slate-100 text-slate-400'
                                }`}
                        >
                            <StepIcon className="w-5 h-5" />
                        </div>
                        <span
                            className={`text-xs text-center ${isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            {step.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
