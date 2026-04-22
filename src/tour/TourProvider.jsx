import { createContext, useContext, useState } from "react";
import { TOUR_STEPS } from "./tourSteps";

const TourContext = createContext();

export const TourProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    const startTour = () => {
        setIsActive(true);
        setStepIndex(0);
    };

    const nextStep = () => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            endTour();
        }
    };

    const endTour = () => {
        setIsActive(false);
        setStepIndex(0);
    };

    return (
        <TourContext.Provider
            value={{
                isActive,
                stepIndex,
                step: TOUR_STEPS[stepIndex],
                startTour,
                nextStep,
                endTour,
            }}
        >
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => useContext(TourContext);