import { useState, useCallback } from 'react';
import { OnboardingState } from '../types/admin';

const STORAGE_KEY = 'jira-health-admin-onboarding';

const defaultState: OnboardingState = {
  isDismissed: false,
  isCollapsed: false,
};

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load onboarding state:', e);
    }
    return defaultState;
  });

  const saveState = useCallback((newState: Partial<OnboardingState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save onboarding state:', e);
      }
      return updated;
    });
  }, []);

  const dismiss = useCallback(() => {
    saveState({ isDismissed: true });
  }, [saveState]);

  const toggleCollapsed = useCallback(() => {
    setState(prev => {
      const updated = { ...prev, isCollapsed: !prev.isCollapsed };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save onboarding state:', e);
      }
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
    } catch (e) {
      console.error('Failed to reset onboarding state:', e);
    }
  }, []);

  return {
    isDismissed: state.isDismissed,
    isCollapsed: state.isCollapsed,
    dismiss,
    toggleCollapsed,
    reset,
  };
}
