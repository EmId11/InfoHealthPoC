import React, { useState } from 'react';
import { DimensionResult } from '../../types/assessment';
import { Step6Data } from '../../types/wizard';
import RiskBadge from './common/RiskBadge';
import TrendIndicator from './common/TrendIndicator';
import Dimension1Results from './dimension1/Dimension1Results';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import { getDimensionIcon } from '../../constants/dimensionIcons';

interface DimensionCardProps {
  dimension: DimensionResult;
  reportOptions: Step6Data;
  teamId: string;
  dateRange: { startDate: string; endDate: string };
  defaultExpanded?: boolean;
  similarTeamsCount: number;
  onViewSimilarTeams: () => void;
}

const DimensionCard: React.FC<DimensionCardProps> = ({
  dimension,
  reportOptions,
  teamId,
  dateRange,
  defaultExpanded = false,
  similarTeamsCount,
  onViewSimilarTeams,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div style={styles.card}>
      <button
        style={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div style={styles.headerLeft}>
          <span style={styles.chevron}>
            {isExpanded ? (
              <ChevronDownIcon label="" size="large" />
            ) : (
              <ChevronRightIcon label="" size="large" />
            )}
          </span>
          <div style={styles.headerContent}>
            <div style={styles.titleRow}>
              <span style={styles.dimensionIcon}>
                {getDimensionIcon(dimension.dimensionKey, 'medium', '#0052CC')}
              </span>
              <span style={styles.dimensionTitle}>{dimension.dimensionTitle}</span>
            </div>
            <span style={styles.dimensionQuestion}>{dimension.questionForm}</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.scoreSection}>
            <span style={styles.scoreLabel}>Health Score</span>
            <span style={styles.scoreValue}>{dimension.healthScore ?? Math.round(dimension.overallPercentile)}</span>
          </div>
          <RiskBadge level={dimension.riskLevel} size="medium" />
          <TrendIndicator direction={dimension.trend} size="medium" />
          {reportOptions.includeComparisonOnCards && (
            <span style={styles.benchmarkText}>{dimension.benchmarkComparison}</span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div style={styles.content}>
          <Dimension1Results
            dimension={dimension}
            reportOptions={reportOptions}
            teamId={teamId}
            dateRange={dateRange}
            similarTeamsCount={similarTeamsCount}
            onViewSimilarTeams={onViewSimilarTeams}
          />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '20px 24px',
    backgroundColor: '#FAFBFC',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s ease',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  chevron: {
    color: '#172B4D',
    flexShrink: 0,
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  dimensionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dimensionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionQuestion: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#5E6C84',
    fontStyle: 'italic',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  scoreLabel: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  scoreValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
  },
  benchmarkText: {
    fontSize: '11px',
    color: '#5E6C84',
    fontStyle: 'italic',
    maxWidth: '150px',
    textAlign: 'right',
  },
  content: {
    padding: '24px',
    borderTop: '1px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
  },
};

export default DimensionCard;
