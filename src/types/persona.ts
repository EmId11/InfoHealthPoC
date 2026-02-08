export type PersonaType = 'creator' | 'viewer' | 'admin';

// AppView type matching App.tsx
export type AppView =
  | 'creator-home'
  | 'viewer-home'
  | 'admin-home'
  | 'wizard'
  | 'assessment-pending'
  | 'assessment-results'
  | 'survey-dashboard'
  | 'survey-create'
  | 'survey-results'
  | 'survey-take'
  | 'edit-settings';

export interface PersonaInfo {
  type: PersonaType;
  displayName: string;
  description: string;
  homeView: AppView;
}

export interface PersonaContextValue {
  // Current state
  currentPersona: PersonaType;

  // Actions
  switchPersona: (persona: PersonaType) => void;

  // Derived permissions
  canCreateAssessment: boolean;
  canViewResults: boolean;
  canTakeSurveys: boolean;
  canAccessAdmin: boolean;
  canCreateSurvey: boolean;
}

export const PERSONA_INFO: Record<PersonaType, PersonaInfo> = {
  creator: {
    type: 'creator',
    displayName: 'Creator',
    description: 'Create assessments and run wizard',
    homeView: 'creator-home',
  },
  viewer: {
    type: 'viewer',
    displayName: 'Viewer',
    description: 'View shared assessments and take surveys',
    homeView: 'viewer-home',
  },
  admin: {
    type: 'admin',
    displayName: 'Admin',
    description: 'System configuration and user management',
    homeView: 'admin-home',
  },
};

// Helper to derive permissions from persona
export const getPersonaPermissions = (persona: PersonaType) => ({
  canCreateAssessment: persona === 'creator' || persona === 'admin',
  canViewResults: true, // All personas can view results
  canTakeSurveys: true, // All personas can take surveys
  canAccessAdmin: persona === 'admin',
  canCreateSurvey: persona === 'creator' || persona === 'admin',
});
