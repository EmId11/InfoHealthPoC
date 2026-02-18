// Mock data for Team of Teams assessment
// Generates 8 team scenarios with varied profiles and aggregates them

import { AssessmentScenario, generateScenarioAssessment, TrendBias } from './mockAssessmentData';
import { generateMultiTeamAssessmentResult } from '../utils/portfolioAggregation';
import { MultiTeamAssessmentResult, ScopeSelection } from '../types/multiTeamAssessment';
import { AssessmentResult } from '../types/assessment';
import { initialStep3Data, initialStep4Data, initialStep5Data, initialStep6Data } from '../types/wizard';

// ── 8 Team Definitions ──────────────────────────────────────────────
export const PORTFOLIO_TEAM_LIST = [
  { id: 'tot-platform',  name: 'Platform Core' },
  { id: 'tot-payments',  name: 'Payments Squad' },
  { id: 'tot-mobile',    name: 'Mobile Experience' },
  { id: 'tot-search',    name: 'Search & Discovery' },
  { id: 'tot-checkout',  name: 'Checkout Flow' },
  { id: 'tot-merchant',  name: 'Merchant Portal' },
  { id: 'tot-analytics', name: 'Analytics Pipeline' },
  { id: 'tot-identity',  name: 'Identity & Auth' },
];

// ── Scenario Configs ────────────────────────────────────────────────
// Distribution: 2 high, 3 mid-range, 2 struggling, 1 mixed/polarized
export const TEAM_OF_TEAMS_SCENARIOS: AssessmentScenario[] = [
  // High performers
  { teamId: 'tot-platform',  teamName: 'Platform Core',       targetPercentile: 82, percentileVariance: 8,  trendBias: 'stable' as TrendBias,    assessmentTeams: PORTFOLIO_TEAM_LIST },
  { teamId: 'tot-identity',  teamName: 'Identity & Auth',     targetPercentile: 78, percentileVariance: 10, trendBias: 'improving' as TrendBias, assessmentTeams: PORTFOLIO_TEAM_LIST },
  // Mid-range
  { teamId: 'tot-payments',  teamName: 'Payments Squad',      targetPercentile: 62, percentileVariance: 12, trendBias: 'improving' as TrendBias, assessmentTeams: PORTFOLIO_TEAM_LIST },
  { teamId: 'tot-checkout',  teamName: 'Checkout Flow',       targetPercentile: 55, percentileVariance: 10, trendBias: 'stable' as TrendBias,    assessmentTeams: PORTFOLIO_TEAM_LIST },
  { teamId: 'tot-mobile',    teamName: 'Mobile Experience',   targetPercentile: 48, percentileVariance: 15, trendBias: 'stable' as TrendBias,    assessmentTeams: PORTFOLIO_TEAM_LIST },
  // Struggling
  { teamId: 'tot-merchant',  teamName: 'Merchant Portal',     targetPercentile: 35, percentileVariance: 12, trendBias: 'declining' as TrendBias, assessmentTeams: PORTFOLIO_TEAM_LIST },
  { teamId: 'tot-analytics', teamName: 'Analytics Pipeline',  targetPercentile: 28, percentileVariance: 8,  trendBias: 'improving' as TrendBias, assessmentTeams: PORTFOLIO_TEAM_LIST },
  // Mixed/polarized
  { teamId: 'tot-search',    teamName: 'Search & Discovery',  targetPercentile: 50, percentileVariance: 30, trendBias: 'mixed' as TrendBias,     assessmentTeams: PORTFOLIO_TEAM_LIST },
];

// ── Generator ───────────────────────────────────────────────────────
export function generateTeamOfTeamsAssessment(): MultiTeamAssessmentResult {
  const teamResults: AssessmentResult[] = TEAM_OF_TEAMS_SCENARIOS.map(scenario =>
    generateScenarioAssessment(scenario)
  );

  const scope: ScopeSelection = {
    scopeType: 'team-of-teams',
    teamOfTeamsValueId: 'tot-engineering',
    teamOfTeamsName: 'Engineering',
    resolvedTeamIds: PORTFOLIO_TEAM_LIST.map(t => t.id),
    resolvedTeamCount: PORTFOLIO_TEAM_LIST.length,
  };

  return generateMultiTeamAssessmentResult(
    'tot-assessment-001',
    'Engineering Team of Teams',
    scope,
    teamResults,
    { startDate: '2025-09-01', endDate: '2026-02-01' },
    'uniform',
    {
      step3: initialStep3Data,
      step4: initialStep4Data,
      step5: initialStep5Data,
      step6: initialStep6Data,
    }
  );
}

// Pre-generated result (computed once at import time)
export const MOCK_TEAM_OF_TEAMS_RESULT: MultiTeamAssessmentResult = generateTeamOfTeamsAssessment();
