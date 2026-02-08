import React from 'react';

export interface TutorialSlide {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  tip?: string;
  icon: React.ReactNode;
}

export const tutorialSlides: TutorialSlide[] = [
  {
    id: 'team',
    stepNumber: 1,
    title: 'Select Your Team',
    description: 'Choose which Jira project you want to assess. If your team has been set up before, you can reuse previous settings to save time.',
    tip: 'Teams marked "Configured" can skip most setup steps.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="20" r="12" stroke="#0052CC" strokeWidth="3" fill="#DEEBFF"/>
        <path d="M12 52c0-11.046 8.954-20 20-20s20 8.954 20 20" stroke="#0052CC" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="48" cy="24" r="8" stroke="#0052CC" strokeWidth="2" fill="#DEEBFF"/>
        <path d="M40 52c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#0052CC" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'dates',
    stepNumber: 2,
    title: 'Choose Your Analysis Period',
    description: 'Select the date range to analyse. We recommend at least 3 months of data for accurate pattern detection.',
    tip: 'Longer periods give more reliable results.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="12" width="48" height="44" rx="4" stroke="#0052CC" strokeWidth="3" fill="#DEEBFF"/>
        <path d="M8 24h48" stroke="#0052CC" strokeWidth="3"/>
        <path d="M20 8v8M44 8v8" stroke="#0052CC" strokeWidth="3" strokeLinecap="round"/>
        <rect x="16" y="32" width="8" height="8" rx="1" fill="#0052CC"/>
        <rect x="28" y="32" width="8" height="8" rx="1" fill="#0052CC"/>
        <rect x="40" y="32" width="8" height="8" rx="1" fill="#0052CC" opacity="0.3"/>
        <rect x="16" y="44" width="8" height="8" rx="1" fill="#0052CC"/>
        <rect x="28" y="44" width="8" height="8" rx="1" fill="#0052CC" opacity="0.3"/>
      </svg>
    ),
  },
  {
    id: 'comparison',
    stepNumber: 3,
    title: 'Set Up Comparisons',
    description: 'Choose which teams or benchmarks to compare against. This helps put your results in context.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="28" width="16" height="28" rx="2" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <rect x="24" y="16" width="16" height="40" rx="2" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <rect x="40" y="8" width="16" height="48" rx="2" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <path d="M12 20l8-8 8 4 8-8 8 4 8-4" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'issueTypes',
    stepNumber: 4,
    title: 'Select Issue Types',
    description: 'Pick which Jira issue types to include in the analysis — Stories, Bugs, Tasks, Epics, and more.',
    tip: 'Include all types your team regularly works with.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="8" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <rect x="36" y="8" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <rect x="8" y="36" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <rect x="36" y="36" width="20" height="20" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <path d="M14 18l4 4 6-6" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 18l4 4 6-6" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 46l4 4 6-6" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'sprint',
    stepNumber: 5,
    title: 'Define Your Sprint Rhythm',
    description: 'Tell us about your sprint length and any recent changes to your cadence. This helps us understand your workflow.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="24" stroke="#0052CC" strokeWidth="3" fill="#DEEBFF"/>
        <path d="M32 16v16l12 8" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="32" r="3" fill="#0052CC"/>
      </svg>
    ),
  },
  {
    id: 'stale',
    stepNumber: 6,
    title: 'Set Stale Thresholds',
    description: 'Define how many days before each issue type is considered "stale" or stuck. This varies by team.',
    tip: 'Consider your typical cycle time for each type.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="20" width="48" height="32" rx="4" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <path d="M20 32h24M20 40h16" stroke="#0052CC" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="48" cy="16" r="10" fill="#FFEBE6" stroke="#DE350B" strokeWidth="2"/>
        <path d="M48 12v5M48 20v1" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'calibration',
    stepNumber: 7,
    title: 'Calibration Choice',
    description: 'Choose whether to collect team feedback via survey (more accurate) or generate results immediately using Jira data alone.',
    tip: 'Team surveys improve accuracy by 30-40%.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M16 32h12v20H16z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <path d="M36 32h12v20H36z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <path d="M22 12l-6 12h12z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <path d="M42 12l-6 12h12z" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2"/>
        <path d="M22 24v8M42 24v8" stroke="#0052CC" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'review',
    stepNumber: 8,
    title: 'Review and Launch',
    description: 'Review all your settings, then run the assessment. You can always go back and adjust any step before launching.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="24" fill="#E3FCEF" stroke="#36B37E" strokeWidth="3"/>
        <path d="M20 32l8 8 16-16" stroke="#36B37E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

// Final "You're all set" slide
export const completionSlide = {
  id: 'complete',
  title: "You're All Set!",
  description: 'You now know what to expect. The setup takes about 3-5 minutes, and you can always come back to change your settings later.',
  icon: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" fill="#E3FCEF" stroke="#36B37E" strokeWidth="4"/>
      <path d="M24 40l12 12 20-24" stroke="#36B37E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};
