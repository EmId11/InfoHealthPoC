// PortfolioImpactDashboard Component
// Uses the ORIGINAL UI components (ImpactHeroSection, TeamProgressComparison, ImpactAnalysisSection)
// Wired to CHS (Composite Health Score) data for before/after visualization

import React, { useState, useMemo } from 'react';
import { ImprovementPlan } from '../../../types/improvementPlan';
import { generateImpactCHSData } from '../../../utils/mockCHSData';
import { convertCHSToImpactSummary } from '../../../utils/chsToImpactAdapter';
import {
  getCHSCategoryLabel,
  getCHSCategoryColor,
  getCHSPresetLabel,
} from '../../../types/progressScore';

// Import the ORIGINAL components
import { ImpactHeroSection } from './ImpactHeroSection';
import { TeamProgressComparison } from './TeamProgressComparison';
import { ImpactAnalysisSection } from './ImpactAnalysisSection';

interface PortfolioImpactDashboardProps {
  plans: ImprovementPlan[];
  onPlanClick?: (planId: string) => void;
}

export const PortfolioImpactDashboard: React.FC<PortfolioImpactDashboardProps> = ({
  plans,
  onPlanClick,
}) => {
  // Date selection state
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString();
  });
  const [toDate, setToDate] = useState<string>(new Date().toISOString());

  // Modal states
  const [showMethodology, setShowMethodology] = useState(false);
  const [showSimilarTeams, setShowSimilarTeams] = useState(false);
  const [showCHSBreakdown, setShowCHSBreakdown] = useState(false);

  // Get CHS results (before and after)
  const { before: chsBefore, after: chsAfter, yourTeamId } = useMemo(
    () => generateImpactCHSData(0),
    []
  );

  // Get your team's data
  const yourTeamBefore = chsBefore.teams.find(t => t.teamId === yourTeamId) || chsBefore.teams[0];
  const yourTeamAfter = chsAfter.teams.find(t => t.teamId === yourTeamId) || chsAfter.teams[0];

  // Convert CHS data to the format expected by existing components
  const impactSummary = useMemo(() => {
    return convertCHSToImpactSummary(chsBefore, chsAfter, yourTeamId);
  }, [chsBefore, chsAfter, yourTeamId]);

  if (chsAfter.teams.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>No Health Data Available</h3>
          <p style={styles.emptyText}>
            Start tracking team health to see impact measurements here.
          </p>
        </div>
      </div>
    );
  }

  // Category info for the CHS badge
  const categoryColors = getCHSCategoryColor(yourTeamAfter.category);
  const change = yourTeamAfter.chs - yourTeamBefore.chs;

  return (
    <div style={styles.container}>
      {/* CHS Context Banner - Shows health score framework info */}
      <div style={styles.chsBanner}>
        <div style={styles.chsBannerLeft}>
          <span style={styles.chsLabel}>Composite Health Score</span>
          <span style={{
            ...styles.chsCategoryBadge,
            backgroundColor: categoryColors.bg,
            color: categoryColors.text,
            borderColor: categoryColors.border,
          }}>
            {getCHSCategoryLabel(yourTeamAfter.category)}
          </span>
        </div>
        <div style={styles.chsBannerRight}>
          <span style={styles.chsCI}>
            95% CI: {yourTeamAfter.confidenceInterval.lower.toFixed(1)} – {yourTeamAfter.confidenceInterval.upper.toFixed(1)}
          </span>
          <button onClick={() => setShowCHSBreakdown(true)} style={styles.chsDetailsButton}>
            View CHS Details
          </button>
        </div>
      </div>

      {/* ORIGINAL Hero Section - Before/After gauges with date pickers */}
      <ImpactHeroSection
        summary={impactSummary}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={(date) => setFromDate(new Date(date).toISOString())}
        onToDateChange={(date) => setToDate(new Date(date).toISOString())}
        onSimilarTeamsClick={() => setShowSimilarTeams(true)}
        onPercentileInfoClick={() => setShowMethodology(true)}
        onFromDateInfoClick={() => {}}
        onToDateInfoClick={() => {}}
        onConfidenceClick={() => setShowMethodology(true)}
      />

      {/* ORIGINAL Team Progress Comparison - Slope chart with spectrum */}
      <TeamProgressComparison
        context={impactSummary.teamProgressContext}
        baselineDate={fromDate}
        measurementDate={toDate}
        onSimilarTeamsClick={() => setShowSimilarTeams(true)}
      />

      {/* ORIGINAL Impact Analysis Section - Flow diagram with dimensions/outcomes */}
      <ImpactAnalysisSection
        dimensions={impactSummary.impactByDimension}
        outcomes={impactSummary.impactByOutcome}
        flow={impactSummary.impactFlow}
      />

      {/* CHS Component Breakdown Section */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>HEALTH SCORE COMPONENTS</h3>
        <p style={styles.sectionSubtitle}>
          How the three components contribute to your Composite Health Score
        </p>
        <div style={styles.componentsRow}>
          <ComponentCard
            name="CSS"
            fullName="Current State Score"
            beforeValue={yourTeamBefore.css.scaled}
            afterValue={yourTeamAfter.css.scaled}
            weight={yourTeamAfter.weights.css}
            color="#0052CC"
            description="Z-score standardized position against baseline population norms"
          />
          <ComponentCard
            name="TRS"
            fullName="Trajectory Score"
            beforeValue={yourTeamBefore.trs.scaled}
            afterValue={yourTeamAfter.trs.scaled}
            weight={yourTeamAfter.weights.trs}
            color="#5243AA"
            description="Effect size of change within the assessment period"
          />
          {yourTeamAfter.pgs && (
            <ComponentCard
              name="PGS"
              fullName="Peer Growth Score"
              beforeValue={yourTeamBefore.pgs?.shrunk || 50}
              afterValue={yourTeamAfter.pgs.shrunk}
              weight={yourTeamAfter.weights.pgs}
              color="#FF8B00"
              description="Growth ranking relative to teams with similar baseline"
            />
          )}
        </div>
        <div style={styles.weightPreset}>
          <span style={styles.weightPresetLabel}>Weight Profile:</span>
          <span style={styles.weightPresetValue}>
            {getCHSPresetLabel(yourTeamAfter.weightPreset)}
          </span>
        </div>
      </div>

      {/* Statistical Summary */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>STATISTICAL SUMMARY</h3>
        <div style={styles.statsGrid}>
          <StatBox
            label="Before CHS"
            value={yourTeamBefore.chs.toFixed(1)}
            subtext="3 months ago"
          />
          <StatBox
            label="After CHS"
            value={yourTeamAfter.chs.toFixed(1)}
            subtext="Current"
            highlight={true}
          />
          <StatBox
            label="Change"
            value={`${change >= 0 ? '+' : ''}${change.toFixed(1)}`}
            subtext="points"
            isPositive={change > 0}
            isNegative={change < 0}
          />
          <StatBox
            label="Standard Error"
            value={`±${yourTeamAfter.standardError.toFixed(1)}`}
            subtext="90% CI"
          />
        </div>
      </div>

      {/* CHS Breakdown Modal */}
      {showCHSBreakdown && (
        <div style={styles.modalOverlay} onClick={() => setShowCHSBreakdown(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{yourTeamAfter.teamName} - CHS Breakdown</h3>
              <button onClick={() => setShowCHSBreakdown(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <CHSBreakdownDetail team={yourTeamAfter} teamBefore={yourTeamBefore} />
            </div>
          </div>
        </div>
      )}

      {/* Methodology Modal */}
      {showMethodology && (
        <div style={styles.modalOverlay} onClick={() => setShowMethodology(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>How CHS Works</h3>
              <button onClick={() => setShowMethodology(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.methodologyContent}>
                <h4 style={styles.methodologyHeading}>Composite Health Score (CHS)</h4>
                <p style={styles.methodologyText}>
                  CHS measures your team's health using three complementary components:
                </p>
                <ul style={styles.methodologyList}>
                  <li><strong>CSS (Current State Score):</strong> Where your team is NOW relative to baseline population norms. Uses z-score standardization.</li>
                  <li><strong>TRS (Trajectory Score):</strong> How your team is TRENDING within the assessment period. Uses effect size (Cohen's d).</li>
                  <li><strong>PGS (Peer Growth Score):</strong> How your growth compares to teams that started at a similar level. Uses ranking with Empirical Bayes shrinkage.</li>
                </ul>
                <p style={styles.methodologyText}>
                  CHS captures real improvement even when all teams improve together.
                </p>
                <h4 style={styles.methodologyHeading}>Default Weights</h4>
                <ul style={styles.methodologyList}>
                  <li>CSS: 50% (current state matters most)</li>
                  <li>TRS: 35% (trajectory is meaningful)</li>
                  <li>PGS: 15% (peer context adds value)</li>
                </ul>
                <h4 style={styles.methodologyHeading}>Score Categories</h4>
                <ul style={styles.methodologyList}>
                  <li><strong>Excellent (70+):</strong> Strong performance across indicators</li>
                  <li><strong>Good Health (55-70):</strong> Positive position with healthy trajectory</li>
                  <li><strong>Average Health (45-55):</strong> At baseline norms</li>
                  <li><strong>Below Average (30-45):</strong> Some areas need attention</li>
                  <li><strong>Needs Attention (&lt;30):</strong> Significant gaps to address</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similar Teams Modal */}
      {showSimilarTeams && (
        <div style={styles.modalOverlay} onClick={() => setShowSimilarTeams(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>All Teams ({chsAfter.teams.length})</h3>
              <button onClick={() => setShowSimilarTeams(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.teamsList}>
                {[...chsAfter.teams].sort((a, b) => b.chs - a.chs).map((team, idx) => {
                  const colors = getCHSCategoryColor(team.category);
                  const isYou = team.teamId === yourTeamId;
                  const beforeTeam = chsBefore.teams.find(t => t.teamId === team.teamId);
                  const teamChange = team.chs - (beforeTeam?.chs || 50);
                  return (
                    <div
                      key={team.teamId}
                      style={{
                        ...styles.teamRow,
                        backgroundColor: isYou ? '#DEEBFF' : undefined,
                      }}
                    >
                      <span style={styles.teamRank}>#{idx + 1}</span>
                      <span style={styles.teamName}>
                        {team.teamName}
                        {isYou && <span style={styles.youBadge}>YOU</span>}
                      </span>
                      <span style={{
                        ...styles.teamChange,
                        color: teamChange > 0 ? '#006644' : teamChange < 0 ? '#DE350B' : '#6B778C',
                      }}>
                        {teamChange >= 0 ? '+' : ''}{teamChange.toFixed(1)}
                      </span>
                      <span style={{
                        ...styles.teamCHS,
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}>
                        {team.chs.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component Card for CHS breakdown (with before/after)
interface ComponentCardProps {
  name: string;
  fullName: string;
  beforeValue: number;
  afterValue: number;
  weight: number;
  color: string;
  description: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  name,
  fullName,
  beforeValue,
  afterValue,
  weight,
  color,
  description,
}) => {
  const change = afterValue - beforeValue;
  return (
    <div style={styles.componentCard}>
      <div style={styles.componentHeader}>
        <span style={{ ...styles.componentName, color }}>{name}</span>
        <span style={styles.componentWeight}>{Math.round(weight * 100)}%</span>
      </div>
      <span style={styles.componentFullName}>{fullName}</span>
      <div style={styles.componentValues}>
        <div style={styles.componentBeforeAfter}>
          <span style={styles.componentBefore}>{beforeValue.toFixed(1)}</span>
          <span style={styles.componentArrow}>→</span>
          <span style={{ ...styles.componentAfter, color }}>{afterValue.toFixed(1)}</span>
        </div>
        <span style={{
          ...styles.componentChange,
          color: change > 0 ? '#006644' : change < 0 ? '#DE350B' : '#6B778C',
        }}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}
        </span>
      </div>
      <div style={styles.componentGaugeContainer}>
        <div style={styles.componentGauge}>
          <div style={{
            ...styles.componentGaugeFill,
            width: `${afterValue}%`,
            backgroundColor: color,
          }} />
        </div>
      </div>
      <p style={styles.componentDescription}>{description}</p>
    </div>
  );
};

// Stat Box for statistical summary
interface StatBoxProps {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
}

const StatBox: React.FC<StatBoxProps> = ({
  label,
  value,
  subtext,
  highlight,
  isPositive,
  isNegative,
}) => (
  <div style={{
    ...styles.statBox,
    backgroundColor: highlight ? '#DEEBFF' : '#FAFBFC',
    borderColor: highlight ? '#4C9AFF' : '#EBECF0',
  }}>
    <span style={styles.statLabel}>{label}</span>
    <span style={{
      ...styles.statValue,
      color: isPositive ? '#006644' : isNegative ? '#DE350B' : '#172B4D',
    }}>
      {value}
    </span>
    <span style={styles.statSubtext}>{subtext}</span>
  </div>
);

// CHS Breakdown Detail for modal
interface CHSBreakdownDetailProps {
  team: ReturnType<typeof generateImpactCHSData>['after']['teams'][0];
  teamBefore: ReturnType<typeof generateImpactCHSData>['before']['teams'][0];
}

const CHSBreakdownDetail: React.FC<CHSBreakdownDetailProps> = ({ team, teamBefore }) => {
  const change = team.chs - teamBefore.chs;
  const categoryColors = getCHSCategoryColor(team.category);

  return (
    <div style={styles.breakdownDetail}>
      {/* Summary */}
      <div style={styles.breakdownSummary}>
        <div style={styles.breakdownScore}>
          <span style={styles.breakdownScoreLabel}>Current Health Score</span>
          <span style={{
            ...styles.breakdownScoreValue,
            color: categoryColors.text,
          }}>
            {team.chs.toFixed(1)}
          </span>
          <span style={{
            ...styles.breakdownCategory,
            backgroundColor: categoryColors.bg,
            color: categoryColors.text,
            borderColor: categoryColors.border,
          }}>
            {getCHSCategoryLabel(team.category)}
          </span>
        </div>
        <div style={styles.breakdownChange}>
          <span style={styles.breakdownChangeLabel}>Change</span>
          <span style={{
            ...styles.breakdownChangeValue,
            color: change > 0 ? '#006644' : change < 0 ? '#DE350B' : '#6B778C',
          }}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Components */}
      <h4 style={styles.breakdownHeading}>Component Scores</h4>
      <div style={styles.breakdownComponents}>
        <div style={styles.breakdownComponent}>
          <span style={styles.breakdownComponentName}>CSS (Current State)</span>
          <span style={styles.breakdownComponentScore}>{team.css.scaled.toFixed(1)}</span>
        </div>
        <div style={styles.breakdownComponent}>
          <span style={styles.breakdownComponentName}>TRS (Trajectory)</span>
          <span style={styles.breakdownComponentScore}>{team.trs.scaled.toFixed(1)}</span>
        </div>
        {team.pgs && (
          <div style={styles.breakdownComponent}>
            <span style={styles.breakdownComponentName}>PGS (Peer Growth)</span>
            <span style={styles.breakdownComponentScore}>{team.pgs.shrunk.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Confidence */}
      <h4 style={styles.breakdownHeading}>Confidence</h4>
      <div style={styles.breakdownConfidence}>
        <span>Standard Error: ±{team.standardError.toFixed(1)}</span>
        <span>90% CI: [{team.confidenceInterval.lower.toFixed(1)}, {team.confidenceInterval.upper.toFixed(1)}]</span>
      </div>

      {/* Top indicators */}
      <h4 style={styles.breakdownHeading}>Top Indicator Contributions</h4>
      <div style={styles.breakdownIndicators}>
        {team.css.indicatorZScores
          .sort((a, b) => Math.abs(b.weightedContribution) - Math.abs(a.weightedContribution))
          .slice(0, 5)
          .map(ind => (
            <div key={ind.indicatorId} style={styles.breakdownIndicator}>
              <span style={styles.breakdownIndicatorName}>{ind.indicatorName}</span>
              <span style={{
                ...styles.breakdownIndicatorValue,
                color: ind.zScore > 0 ? '#006644' : ind.zScore < 0 ? '#DE350B' : '#6B778C',
              }}>
                z = {ind.zScore >= 0 ? '+' : ''}{ind.zScore.toFixed(2)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  chsBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    border: '1px solid #DFE1E6',
    flexWrap: 'wrap',
    gap: 12,
  },
  chsBannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  chsLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#172B4D',
  },
  chsCategoryBadge: {
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid',
  },
  chsBannerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  chsCI: {
    fontSize: 12,
    color: '#6B778C',
  },
  chsDetailsButton: {
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 4px 0',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B778C',
    margin: '0 0 20px 0',
  },
  componentsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  componentCard: {
    padding: 16,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    border: '1px solid #EBECF0',
  },
  componentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  componentName: {
    fontSize: 18,
    fontWeight: 700,
  },
  componentWeight: {
    fontSize: 11,
    fontWeight: 500,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 8px',
    borderRadius: 10,
  },
  componentFullName: {
    fontSize: 11,
    color: '#6B778C',
    display: 'block',
    marginBottom: 12,
  },
  componentValues: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentBeforeAfter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  componentBefore: {
    fontSize: 14,
    color: '#6B778C',
  },
  componentArrow: {
    fontSize: 14,
    color: '#97A0AF',
  },
  componentAfter: {
    fontSize: 18,
    fontWeight: 700,
  },
  componentChange: {
    fontSize: 13,
    fontWeight: 600,
  },
  componentGaugeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  componentGauge: {
    flex: 1,
    height: 8,
    backgroundColor: '#DFE1E6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  componentGaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  componentDescription: {
    fontSize: 12,
    color: '#6B778C',
    margin: 0,
    lineHeight: 1.4,
  },
  weightPreset: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  weightPresetLabel: {
    fontSize: 12,
    color: '#6B778C',
  },
  weightPresetValue: {
    fontSize: 12,
    fontWeight: 600,
    color: '#172B4D',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  statBox: {
    padding: 16,
    borderRadius: 8,
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
  },
  statSubtext: {
    fontSize: 11,
    color: '#97A0AF',
  },
  emptyState: {
    textAlign: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #DFE1E6',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B778C',
    margin: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxWidth: 600,
    width: '90%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#6B778C',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  modalBody: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
  },
  methodologyContent: {
    lineHeight: 1.6,
  },
  methodologyHeading: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  methodologyText: {
    fontSize: 13,
    color: '#5E6C84',
    margin: '0 0 16px 0',
  },
  methodologyList: {
    margin: '0 0 16px 0',
    paddingLeft: 20,
    fontSize: 13,
    color: '#5E6C84',
  },
  teamsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  teamRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #EBECF0',
  },
  teamRank: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6B778C',
    width: 35,
  },
  teamName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  youBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '2px 6px',
    borderRadius: 4,
  },
  teamChange: {
    fontSize: 12,
    fontWeight: 600,
    minWidth: 45,
    textAlign: 'right',
  },
  teamCHS: {
    fontSize: 13,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 12,
  },
  // Breakdown detail styles
  breakdownDetail: {
    lineHeight: 1.6,
  },
  breakdownSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    marginBottom: 20,
  },
  breakdownScore: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  breakdownScoreLabel: {
    fontSize: 12,
    color: '#6B778C',
  },
  breakdownScoreValue: {
    fontSize: 36,
    fontWeight: 700,
  },
  breakdownCategory: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid',
    marginTop: 4,
  },
  breakdownChange: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  breakdownChangeLabel: {
    fontSize: 12,
    color: '#6B778C',
  },
  breakdownChangeValue: {
    fontSize: 24,
    fontWeight: 700,
  },
  breakdownHeading: {
    fontSize: 13,
    fontWeight: 600,
    color: '#172B4D',
    margin: '16px 0 8px 0',
  },
  breakdownComponents: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  breakdownComponent: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: 6,
  },
  breakdownComponentName: {
    fontSize: 13,
    color: '#5E6C84',
  },
  breakdownComponentScore: {
    fontSize: 13,
    fontWeight: 600,
    color: '#172B4D',
  },
  breakdownConfidence: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 13,
    color: '#5E6C84',
    padding: '8px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: 6,
  },
  breakdownIndicators: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  breakdownIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: 4,
  },
  breakdownIndicatorName: {
    fontSize: 12,
    color: '#5E6C84',
  },
  breakdownIndicatorValue: {
    fontSize: 12,
    fontWeight: 600,
  },
};

export default PortfolioImpactDashboard;
