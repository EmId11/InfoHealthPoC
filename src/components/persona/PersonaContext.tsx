import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  PersonaType,
  PersonaContextValue,
  PERSONA_INFO,
  getPersonaPermissions,
  AppView,
} from '../../types/persona';

const STORAGE_KEY = 'invisible-work-persona';

interface PersonaProviderProps {
  children: React.ReactNode;
  onPersonaSwitch?: (persona: PersonaType, homeView: AppView) => void;
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

const getStoredPersona = (): PersonaType => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['creator', 'viewer', 'admin'].includes(stored)) {
      return stored as PersonaType;
    }
  } catch (e) {
    console.error('Failed to load persona from storage:', e);
  }
  return 'creator'; // Default
};

const savePersona = (persona: PersonaType) => {
  try {
    localStorage.setItem(STORAGE_KEY, persona);
  } catch (e) {
    console.error('Failed to save persona to storage:', e);
  }
};

export const PersonaProvider: React.FC<PersonaProviderProps> = ({
  children,
  onPersonaSwitch,
}) => {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(getStoredPersona);

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = getStoredPersona();
    if (stored !== currentPersona) {
      setCurrentPersona(stored);
    }
  }, []);

  const switchPersona = useCallback(
    (persona: PersonaType) => {
      if (persona === currentPersona) return;

      // Save to storage
      savePersona(persona);

      // Update state
      setCurrentPersona(persona);

      // Notify parent (App.tsx) to handle navigation and state reset
      if (onPersonaSwitch) {
        const homeView = PERSONA_INFO[persona].homeView;
        onPersonaSwitch(persona, homeView);
      }
    },
    [currentPersona, onPersonaSwitch]
  );

  const permissions = getPersonaPermissions(currentPersona);

  const value: PersonaContextValue = {
    currentPersona,
    switchPersona,
    ...permissions,
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = (): PersonaContextValue => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};

export default PersonaContext;
