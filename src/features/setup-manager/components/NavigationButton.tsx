import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { setupSteps } from './constants';

interface NavigationButtonsProps {
    currentStep: number;
    onBack: () => void;
    onNext: () => void;
    onComplete: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
    currentStep,
    onBack,
    onNext,
    onComplete,
}) => {
    return (
        <div className="flex justify-between items-center">
            <Button
                variant="outline"
                onClick={onBack}
                disabled={currentStep === 0}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="text-sm text-muted-foreground">
                {setupSteps[currentStep].label}
            </div>

            {currentStep < setupSteps.length - 1 ? (
                <Button onClick={onNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            ) : (
                <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Complete Setup
                </Button>
            )}
        </div>
    );
};