import React from 'react';

// Reusable icons for each setup step, extracted from tutorial slides
// Default size is 48px for page headers, but can be customised

export const StepIcons = {
  // Step 1: Team Selection
  team: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="20" r="12" stroke="#0052CC" strokeWidth="3" fill="#DEEBFF"/>
      <path d="M12 52c0-11.046 8.954-20 20-20s20 8.954 20 20" stroke="#0052CC" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="48" cy="24" r="8" stroke="#0052CC" strokeWidth="2" fill="#DEEBFF"/>
      <path d="M40 52c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#0052CC" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Step 2: Comparisons
  comparison: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="28" width="16" height="28" rx="2" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <rect x="24" y="16" width="16" height="40" rx="2" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <rect x="40" y="8" width="16" height="48" rx="2" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M12 20l8-8 8 4 8-8 8 4 8-4" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Step 3: Issue Types
  issueTypes: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="8" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <rect x="36" y="8" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <rect x="8" y="36" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <rect x="36" y="36" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M14 18l4 4 6-6" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M42 18l4 4 6-6" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 46l4 4 6-6" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Step 4: Sprint Cadence
  sprint: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="24" stroke="#0052CC" strokeWidth="3" fill="#DEEBFF"/>
      <path d="M32 16v16l12 8" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="3" fill="#0052CC"/>
    </svg>
  ),

  // Step 5: Stale Thresholds
  stale: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="20" width="48" height="32" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M20 32h24M20 40h16" stroke="#0052CC" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="48" cy="16" r="10" fill="#FFEBE6" stroke="#DE350B" strokeWidth="2"/>
      <path d="M48 12v5M48 20v1" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Step 6: Calibration
  calibration: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M16 32h12v20H16z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M36 32h12v20H36z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M22 12l-6 12h12z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M42 12l-6 12h12z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M22 24v8M42 24v8" stroke="#0052CC" strokeWidth="2"/>
    </svg>
  ),

  // Step 7: Report Options
  report: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="12" y="8" width="40" height="48" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
      <path d="M20 20h24M20 28h24M20 36h16" stroke="#0052CC" strokeWidth="2" strokeLinecap="round"/>
      <rect x="20" y="44" width="8" height="6" rx="1" fill="#0052CC"/>
      <rect x="32" y="44" width="8" height="6" rx="1" fill="#0052CC" opacity="0.5"/>
    </svg>
  ),

  // Step 8: Review
  review: (size = 48) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="24" fill="#E3FCEF" stroke="#36B37E" strokeWidth="3"/>
      <path d="M20 32l8 8 16-16" stroke="#36B37E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Step metadata for headers - can be used with StepHeader component
export const stepMetadata = {
  1: {
    icon: 'team',
    title: 'Basic Details',
    description: 'Select your team and analysis period.',
  },
  2: {
    icon: 'comparison',
    title: 'Team Comparisons',
    description: 'Choose benchmarks to compare your results against.',
  },
  3: {
    icon: 'issueTypes',
    title: 'Issue Types',
    description: 'Select which Jira issue types to include in the analysis.',
  },
  4: {
    icon: 'sprint',
    title: 'Sprint Cadence',
    description: 'Define your sprint rhythm and any recent changes.',
  },
  5: {
    icon: 'stale',
    title: 'Stale Thresholds',
    description: 'Set how many days before issues are considered stuck.',
  },
  6: {
    icon: 'calibration',
    title: 'Calibration',
    description: 'Choose how to calibrate your assessment results.',
  },
  7: {
    icon: 'report',
    title: 'Report Options',
    description: 'Customise what appears in your assessment report.',
  },
  8: {
    icon: 'review',
    title: 'Review & Run',
    description: 'Review your settings and run the assessment.',
  },
} as const;

export type StepIconKey = keyof typeof StepIcons;
