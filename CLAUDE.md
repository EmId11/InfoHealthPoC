# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

**IMPORTANT**: Only commit and push to GitHub when explicitly instructed by the user. Do not automatically commit after completing tasks.

## Build Commands

```bash
npm start      # Start development server
npm run build  # Create production build
npm test       # Run tests
```

## Docker Deployment

```bash
docker-compose up --build  # Build and run on localhost:3000
```

## Architecture

React + TypeScript multi-step wizard for configuring Jira health assessments. Three personas (Creator, Viewer, Admin) with distinct home views and permissions.

### App Views

The app has six distinct views managed via `appView` state in `App.tsx`:
- `creator-home` / `viewer-home` / `admin-home` - Persona landing pages
- `wizard` - 8-step configuration wizard (0=welcome, 1-7=config steps)
- `assessment-results` - Display dimension results after wizard completion
- `edit-settings` - Modify assessment settings post-creation

### State Management

- Centralized in `App.tsx` using React `useState`
- `WizardState` contains step data (`step1` through `step6`)
- Each step component receives its slice + `onUpdate` callback
- `AdminState` manages admin dashboard state (users, defaults, team attributes)

### Key Type Definitions

- `/src/types/wizard.ts` - WizardState, Step[1-6]Data interfaces, helper functions
- `/src/types/assessment.ts` - DimensionResult, IndicatorResult, RiskLevel types
- `/src/types/admin.ts` - AdminState, TeamAttributeConfig, OrganizationDefaults
- `/src/types/persona.ts` - PersonaType, permissions helpers

### Component Structure

```
App.tsx                           # Root state, view orchestration
├── WizardLayout.tsx              # Wizard chrome (header, sidebar, footer)
├── components/pages/Step*.tsx    # Wizard steps (Step0-Step8)
├── components/home/              # CreatorHome, ViewerHome, AssessmentCard
├── components/admin/             # AdminHome, sections/*
└── components/assessment/        # Results layout, dimension cards, modals
```

### UI Framework

Uses Atlaskit (Jira Design System) via `@atlaskit/*` packages. Custom styling uses inline `React.CSSProperties` objects defined at bottom of each component file.

### Data Flow

1. User interacts with form in step component
2. Step calls `onUpdate` with partial data
3. App.tsx merges update into `wizardState.step[N]`
4. Updated state flows back to step via props
5. On wizard completion, `generateMockAssessmentResultWithDim3()` creates results

### Wizard Helper Functions (wizard.ts)

- `getEffectiveDateRange()` - Resolves date range preset to actual dates
- `getSelectedIssueTypes()` - Returns enabled issue types from step3
- `hasComparisonEnabled()` - Checks if any comparison criteria are enabled

### Admin Filter System (admin.ts)

Team attributes use a filter-based auto-assignment system:
- `evaluateFilterRule()` - Matches teams against FilterRule conditions
- `getMatchingTeams()` - Returns teams matching filter OR manual assignment
- `getInheritedAttributeValues()` - Walks hierarchy for inherited values
