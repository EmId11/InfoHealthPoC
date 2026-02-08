import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  allowInteraction?: boolean;
  tip?: string;
  wizardStep?: number;
  sectionId?: string; // For admin sections
}

interface TourPreferences {
  // Which pages have had their guidance dismissed
  dismissedPages: number[];
  // User opted out of all guidance
  dontShowGuidance: boolean;
}

interface AdminTourPreferences {
  // Which admin sections have had their guidance dismissed
  dismissedSections: string[];
  // User opted out of all admin guidance
  dontShowGuidance: boolean;
}

interface TourContextValue {
  // Current guidance state
  currentGuidance: TourStep | null;
  isShowingGuidance: boolean;

  // Multi-step tour state
  currentStepIndex: number;
  totalSteps: number;

  // Wizard actions
  showPageGuidance: (wizardStep: number) => void;
  dismissGuidance: () => void;
  dismissGuidancePermanently: () => void;
  resetGuidance: () => void;

  // Multi-step tour actions
  startTour: (pageId: number | string) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Admin actions
  showAdminGuidance: (sectionId: string) => void;
  resetAdminGuidance: () => void;

  // Check if guidance should show for a page
  shouldShowGuidanceForPage: (wizardStep: number) => boolean;
  shouldShowGuidanceForSection: (sectionId: string) => boolean;
}

const STORAGE_KEY = 'jira-health-tour-preferences';
const ADMIN_STORAGE_KEY = 'jira-health-admin-tour-preferences';

const defaultPreferences: TourPreferences = {
  dismissedPages: [],
  dontShowGuidance: false,
};

const defaultAdminPreferences: AdminTourPreferences = {
  dismissedSections: [],
  dontShowGuidance: false,
};

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGuidance, setCurrentGuidance] = useState<TourStep | null>(null);
  const [isShowingGuidance, setIsShowingGuidance] = useState(false);

  // Multi-step tour state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentTourSteps, setCurrentTourSteps] = useState<TourStep[]>([]);

  const getPreferences = useCallback((): TourPreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure dismissedPages array exists (migration from old format)
        return {
          ...defaultPreferences,
          ...parsed,
          dismissedPages: parsed.dismissedPages || [],
        };
      }
    } catch (e) {
      console.error('Failed to load tour preferences:', e);
    }
    return defaultPreferences;
  }, []);

  const savePreferences = useCallback((prefs: Partial<TourPreferences>) => {
    try {
      const current = getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save tour preferences:', e);
    }
  }, [getPreferences]);

  // Admin preferences
  const getAdminPreferences = useCallback((): AdminTourPreferences => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultAdminPreferences,
          ...parsed,
          dismissedSections: parsed.dismissedSections || [],
        };
      }
    } catch (e) {
      console.error('Failed to load admin tour preferences:', e);
    }
    return defaultAdminPreferences;
  }, []);

  const saveAdminPreferences = useCallback((prefs: Partial<AdminTourPreferences>) => {
    try {
      const current = getAdminPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save admin tour preferences:', e);
    }
  }, [getAdminPreferences]);

  const shouldShowGuidanceForPage = useCallback((wizardStep: number): boolean => {
    const prefs = getPreferences();
    if (prefs.dontShowGuidance) return false;
    return !prefs.dismissedPages.includes(wizardStep);
  }, [getPreferences]);

  const shouldShowGuidanceForSection = useCallback((sectionId: string): boolean => {
    const prefs = getAdminPreferences();
    if (prefs.dontShowGuidance) return false;
    return !prefs.dismissedSections.includes(sectionId);
  }, [getAdminPreferences]);

  const showPageGuidance = useCallback((wizardStep: number) => {
    // Import dynamically to avoid circular dependency
    import('../../constants/tourSteps').then(({ getPageGuidance }) => {
      const guidance = getPageGuidance(wizardStep);
      if (guidance && shouldShowGuidanceForPage(wizardStep)) {
        setCurrentGuidance(guidance);
        setIsShowingGuidance(true);
      }
    });
  }, [shouldShowGuidanceForPage]);

  const showAdminGuidance = useCallback((_sectionId: string) => {
    // Admin guidance removed - this is now a no-op
  }, []);

  const dismissGuidance = useCallback(() => {
    if (currentGuidance?.wizardStep) {
      // Wizard guidance
      const prefs = getPreferences();
      const newDismissed = [...prefs.dismissedPages, currentGuidance.wizardStep];
      savePreferences({ dismissedPages: newDismissed });
    } else if (currentGuidance?.sectionId) {
      // Admin guidance
      const prefs = getAdminPreferences();
      const newDismissed = [...prefs.dismissedSections, currentGuidance.sectionId];
      saveAdminPreferences({ dismissedSections: newDismissed });
    }
    setIsShowingGuidance(false);
    setCurrentGuidance(null);
  }, [currentGuidance, getPreferences, savePreferences, getAdminPreferences, saveAdminPreferences]);

  const dismissGuidancePermanently = useCallback(() => {
    if (currentGuidance?.sectionId) {
      // Admin guidance - save to admin preferences
      saveAdminPreferences({ dontShowGuidance: true });
    } else {
      // Wizard guidance - save to wizard preferences
      savePreferences({ dontShowGuidance: true });
    }
    setIsShowingGuidance(false);
    setCurrentGuidance(null);
  }, [currentGuidance, savePreferences, saveAdminPreferences]);

  const resetGuidance = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset guidance preferences:', e);
    }
  }, []);

  const resetAdminGuidance = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset admin guidance preferences:', e);
    }
  }, []);

  // Multi-step tour: Start a tour for a page/section
  const startTour = useCallback((pageId: number | string) => {
    import('../../constants/tourSteps').then(({ wizardTours, adminTours }) => {
      let steps: TourStep[] = [];

      if (typeof pageId === 'number') {
        // Wizard page tour
        steps = wizardTours?.[pageId] || [];
      } else {
        // Admin section tour
        steps = adminTours?.[pageId] || [];
      }

      if (steps.length > 0) {
        setCurrentTourSteps(steps);
        setTotalSteps(steps.length);
        setCurrentStepIndex(0);
        setCurrentGuidance(steps[0]);
        setIsShowingGuidance(true);
      }
    });
  }, []);

  // Multi-step tour: Go to next step
  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      setCurrentGuidance(currentTourSteps[newIndex]);
    } else {
      // Tour complete - dismiss
      setIsShowingGuidance(false);
      setCurrentGuidance(null);
      setCurrentTourSteps([]);
      setCurrentStepIndex(0);
      setTotalSteps(0);
    }
  }, [currentStepIndex, totalSteps, currentTourSteps]);

  // Multi-step tour: Go to previous step
  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      setCurrentGuidance(currentTourSteps[newIndex]);
    }
  }, [currentStepIndex, currentTourSteps]);

  return (
    <TourContext.Provider
      value={{
        currentGuidance,
        isShowingGuidance,
        currentStepIndex,
        totalSteps,
        showPageGuidance,
        dismissGuidance,
        dismissGuidancePermanently,
        resetGuidance,
        startTour,
        nextStep,
        previousStep,
        showAdminGuidance,
        resetAdminGuidance,
        shouldShowGuidanceForPage,
        shouldShowGuidanceForSection,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextValue => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export default TourContext;
