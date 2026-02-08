// PortfolioCPSSection Component
// Portfolio-level view of Composite Progress Scores across all teams

import React, { useState } from 'react';
import {
  PortfolioCPSSummary,
  CPSResult,
  CPSCategory,
  getCPSCategoryLabel,
  getCPSCategoryColor,
  formatCPS,
} from '../../../types/progressScore';
import { getCategoryConfig, CPS_CATEGORIES } from '../../../constants/progressScoreConfig';
import { CPSBreakdown } from './CPSBreakdown';
import { CPSSensitivityChart } from './CPSSensitivityChart';

interface PortfolioCPSSectionProps {
  summary: PortfolioCPSSummary;
  onTeamClick?: (teamId: string) => void;
  onMethodologyClick?: () => void;
}

export const PortfolioCPSSection: React.FC<PortfolioCPSSectionProps> = ({
  summary,
  onTeamClick,
  onMethodologyClick,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<CPSResult | null>(null);
  const [viewMode, setViewMode] = useState<'distribution' | 'ranking' | 'sensitivity'>('distribution');

  // Sort teams by CPS for ranking
  const sortedTeams = [...summary.teams].sort((a, b) => b.cps - a.cps);

  // Get top and bottom performers
  const topPerformers = sortedTeams.slice(0, 5);
  const bottomPerformers = sortedTeams.slice(-5).reverse();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>COMPOSITE PROGRESS SCORE</h2>
          <p style={styles.subtitle}>
            Measuring progress across {summary.includedTeams} teams using the CPS methodology
          </p>
        </div>
        <button onClick={onMethodologyClick} style={styles.methodologyButton}>
          <InfoIcon size={14} />
          Methodology
        </button>
      </div>

      {/* Summary Stats */}
      <div style={styles.summaryStats}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{formatCPS(summary.averageCPS)}</span>
          <span style={styles.statLabel}>Average CPS</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{formatCPS(summary.medianCPS)}</span>
          <span style={styles.statLabel}>Median CPS</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>\u00B1{summary.stdDevCPS.toFixed(1)}</span>
          <span style={styles.statLabel}>Std Deviation</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {summary.modelType === '3-component' ? '3-C' : '2-C'}
          </span>
          <span style={styles.statLabel}>Model Type</span>
        </div>
      </div>

      {/* Category Distribution */}
      <div style={styles.distributionSection}>
        <h3 style={styles.sectionTitle}>Category Distribution</h3>
        <div style={styles.distributionBars}>
          {summary.categoryDistribution.map(dist => {
            const config = getCategoryConfig(dist.category);
            const colors = getCPSCategoryColor(dist.category);
            return (
              <div key={dist.category} style={styles.distributionRow}>
                <div style={styles.distributionLabel}>
                  <span
                    style={{
                      ...styles.categoryDot,
                      backgroundColor: colors.text,
                    }}
                  />
                  <span style={styles.categoryName}>{config.shortLabel}</span>
                </div>
                <div style={styles.distributionBarTrack}>
                  <div
                    style={{
                      ...styles.distributionBar,
                      width: `${dist.percentage}%`,
                      backgroundColor: colors.text,
                    }}
                  />
                </div>
                <div style={styles.distributionCount}>
                  <span style={styles.countValue}>{dist.count}</span>
                  <span style={styles.countPercent}>({dist.percentage.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Mode Tabs */}
      <div style={styles.viewTabs}>
        <button
          style={{
            ...styles.viewTab,
            ...(viewMode === 'distribution' ? styles.viewTabActive : {}),
          }}
          onClick={() => setViewMode('distribution')}
        >
          Score Distribution
        </button>
        <button
          style={{
            ...styles.viewTab,
            ...(viewMode === 'ranking' ? styles.viewTabActive : {}),
          }}
          onClick={() => setViewMode('ranking')}
        >
          Team Rankings
        </button>
        <button
          style={{
            ...styles.viewTab,
            ...(viewMode === 'sensitivity' ? styles.viewTabActive : {}),
          }}
          onClick={() => setViewMode('sensitivity')}
        >
          Sensitivity
        </button>
      </div>

      {/* View Content */}
      <div style={styles.viewContent}>
        {viewMode === 'distribution' && (
          <CPSHistogram teams={summary.teams} />
        )}

        {viewMode === 'ranking' && (
          <div style={styles.rankingContent}>
            <div style={styles.rankingColumn}>
              <h4 style={styles.rankingTitle}>
                <span style={styles.trophyIcon}>🏆</span> Top Performers
              </h4>
              <div style={styles.rankingList}>
                {topPerformers.map((team, idx) => (
                  <TeamRankRow
                    key={team.teamId}
                    team={team}
                    rank={idx + 1}
                    onClick={() => setSelectedTeam(team)}
                  />
                ))}
              </div>
            </div>
            <div style={styles.rankingColumn}>
              <h4 style={styles.rankingTitle}>
                <span style={styles.warningIcon}>⚠️</span> Needs Attention
              </h4>
              <div style={styles.rankingList}>
                {bottomPerformers.map((team, idx) => (
                  <TeamRankRow
                    key={team.teamId}
                    team={team}
                    rank={sortedTeams.length - 4 + idx}
                    onClick={() => setSelectedTeam(team)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'sensitivity' && (
          <div style={styles.sensitivityContent}>
            <CPSSensitivityChart
              configurations={summary.sensitivityAnalysis.configurations}
              defaultCPS={summary.averageCPS}
              defaultCategory={summary.sensitivityAnalysis.defaultCategory}
              showLegend={true}
            />
            <div style={styles.sensitivityNote}>
              <p style={styles.noteText}>
                {summary.sensitivityAnalysis.isSensitive
                  ? `${summary.sensitivityAnalysis.teamsWithCategoryChange} of ${summary.sensitivityAnalysis.totalTeams} teams (${Math.round((summary.sensitivityAnalysis.teamsWithCategoryChange / summary.sensitivityAnalysis.totalTeams) * 100)}%) would change category under alternative weight configurations. Consider reviewing methodology alignment.`
                  : 'Results are robust across different weight configurations. Category assignments are stable.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <TeamCPSModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onTeamClick={onTeamClick}
        />
      )}
    </div>
  );
};

// CPS Histogram Sub-component
const CPSHistogram: React.FC<{ teams: CPSResult[] }> = ({ teams }) => {
  // Create histogram bins
  const bins = [
    { min: 0, max: 30, label: '0-30' },
    { min: 30, max: 45, label: '30-45' },
    { min: 45, max: 55, label: '45-55' },
    { min: 55, max: 70, label: '55-70' },
    { min: 70, max: 100, label: '70-100' },
  ];

  const binCounts = bins.map(bin => ({
    ...bin,
    count: teams.filter(t => t.cps >= bin.min && t.cps < bin.max).length,
  }));

  const maxCount = Math.max(...binCounts.map(b => b.count));

  return (
    <div style={styles.histogram}>
      <div style={styles.histogramBars}>
        {binCounts.map((bin, idx) => {
          const config = CPS_CATEGORIES.find(c => bin.min >= c.min && bin.min < c.max)
            || CPS_CATEGORIES[2];
          return (
            <div key={bin.label} style={styles.histogramBin}>
              <div
                style={{
                  ...styles.histogramBar,
                  height: `${(bin.count / maxCount) * 100}%`,
                  backgroundColor: config.color,
                }}
              />
              <span style={styles.histogramLabel}>{bin.label}</span>
              <span style={styles.histogramCount}>{bin.count}</span>
            </div>
          );
        })}
      </div>
      <div style={styles.histogramAxis}>
        <span>CPS Score Range</span>
      </div>
    </div>
  );
};

// Team Rank Row Sub-component
interface TeamRankRowProps {
  team: CPSResult;
  rank: number;
  onClick: () => void;
}

const TeamRankRow: React.FC<TeamRankRowProps> = ({ team, rank, onClick }) => {
  const colors = getCPSCategoryColor(team.category);
  return (
    <button onClick={onClick} style={styles.rankRow}>
      <span style={styles.rankNumber}>#{rank}</span>
      <span style={styles.rankTeamName}>{team.teamName}</span>
      <span
        style={{
          ...styles.rankScore,
          color: colors.text,
          backgroundColor: colors.bg,
        }}
      >
        {formatCPS(team.cps)}
      </span>
    </button>
  );
};

// Team CPS Modal
interface TeamCPSModalProps {
  team: CPSResult;
  onClose: () => void;
  onTeamClick?: (teamId: string) => void;
}

const TeamCPSModal: React.FC<TeamCPSModalProps> = ({ team, onClose, onTeamClick }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>{team.teamName}</h3>
            <p style={styles.modalSubtitle}>Composite Progress Score Breakdown</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>

        <div style={styles.modalBody}>
          <CPSBreakdown result={team} showDetails={true} />

          {team.sensitivityResults.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <CPSSensitivityChart
                configurations={team.sensitivityResults}
                defaultCPS={team.cps}
                defaultCategory={team.category}
                showLegend={false}
                compact={true}
              />
            </div>
          )}
        </div>

        {onTeamClick && (
          <div style={styles.modalFooter}>
            <button
              onClick={() => onTeamClick(team.teamId)}
              style={styles.viewTeamButton}
            >
              View Full Team Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Icon component
const InfoIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor">i</text>
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {},
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B778C',
    margin: 0,
  },
  methodologyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
  },
  summaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    border: '1px solid #EBECF0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#172B4D',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B778C',
    marginTop: 4,
  },
  distributionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 12px 0',
  },
  distributionBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  distributionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  distributionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: 500,
    color: '#172B4D',
  },
  distributionBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    borderRadius: 8,
    transition: 'width 0.3s ease',
  },
  distributionCount: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    width: 70,
    justifyContent: 'flex-end',
  },
  countValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
  },
  countPercent: {
    fontSize: 11,
    color: '#6B778C',
  },
  viewTabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
    backgroundColor: '#F4F5F7',
    padding: 4,
    borderRadius: 8,
  },
  viewTab: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewTabActive: {
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  viewContent: {
    minHeight: 300,
  },
  histogram: {
    padding: 16,
  },
  histogramBars: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
    paddingBottom: 8,
    borderBottom: '1px solid #EBECF0',
  },
  histogramBin: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  histogramBar: {
    width: 40,
    borderRadius: '4px 4px 0 0',
    minHeight: 4,
    transition: 'height 0.3s ease',
  },
  histogramLabel: {
    fontSize: 10,
    color: '#6B778C',
  },
  histogramCount: {
    fontSize: 12,
    fontWeight: 600,
    color: '#172B4D',
  },
  histogramAxis: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 11,
    color: '#6B778C',
  },
  rankingContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
  },
  rankingColumn: {},
  rankingTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 12px 0',
  },
  trophyIcon: {
    fontSize: 16,
  },
  warningIcon: {
    fontSize: 16,
  },
  rankingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  rankRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    backgroundColor: '#FAFBFC',
    border: '1px solid #EBECF0',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6B778C',
    width: 30,
  },
  rankTeamName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    color: '#172B4D',
  },
  rankScore: {
    fontSize: 13,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 12,
  },
  sensitivityContent: {},
  sensitivityNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#6B778C',
    margin: 0,
    lineHeight: 1.5,
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
    alignItems: 'flex-start',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#172B4D',
  },
  modalSubtitle: {
    margin: '4px 0 0 0',
    fontSize: 12,
    color: '#6B778C',
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
    padding: 24,
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  viewTeamButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default PortfolioCPSSection;
