import React from 'react';
import { setupSteps } from './constants';

interface StepIndicatorProps {
    currentStep: number;
    onStepClick: (index: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
    return (
        <div className="mt-6 overflow-x-auto">
            <div className="flex min-w-[1120px] gap-2 lg:min-w-0">
            {setupSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCurrent = index === currentStep;

                return (
                    <button
                        key={step.id}
                        onClick={() => onStepClick(index)}
                        className={`min-w-[104px] flex-1 flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer focus:outline-none ${isCurrent ? 'bg-primary/10' : 'hover:bg-muted'
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
                            className={`min-h-8 w-full text-xs text-center leading-tight whitespace-normal break-words ${isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            {step.label}
                        </span>
                    </button>
                );
            })}
            </div>
        </div>
    );
};
