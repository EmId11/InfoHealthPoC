import React, { useMemo } from 'react';
import {
  OutcomeConfidenceResult,
  getConfidenceLevelConfig,
} from '../../../types/outcomeConfidence';
import { DimensionResult } from '../../../types/assessment';
import PriorityBeacon from './PriorityBeacon';
import OutcomeDimensionTable from './OutcomeDimensionTable';

interface ExpandedOutcomePanelProps {
  outcome: OutcomeConfidenceResult;
  dimensions: DimensionResult[];
  onDimensionClick: (dimensionKey: string) => void;
}

/**
 * ExpandedOutcomePanel - Expanded view for a selected outcome area
 *
 * Shows:
 * 1. Header with outcome question and description
 * 2. PriorityBeacon filtered to dimensions contributing to this outcome
 * 3. OutcomeDimensionTable showing all contributing dimensions in table format
 * 4. Score breakdown (weighted score, gap cap, confidence level)
 */
const ExpandedOutcomePanel: React.FC<ExpandedOutcomePanelProps> = ({
  outcome,
  dimensions,
  onDimensionClick,
}) => {
  const config = getConfidenceLevelConfig(outcome.finalScore);

  // Filter dimensions to only those that contribute to this outcome
  const outcomeDimensions = useMemo(() => {
    const contributingKeys = new Set<string>(
      outcome.contributions
        .filter(c => !c.isMissing)
        .map(c => c.dimensionKey as string)
    );
    return dimensions.filter(d => contributingKeys.has(d.dimensionKey));
  }, [dimensions, outcome.contributions]);

  const missingContributions = outcome.contributions.filter(c => c.isMissing);

  return (
    <div
      style={{
        ...styles.panel,
        backgroundColor: outcome.bgColor,
        borderColor: outcome.borderColor,
      }}
    >
      {/* Header with question and description */}
      <div style={styles.header}>
        <h3 style={styles.question}>{outcome.question}</h3>
        <p style={styles.description}>{outcome.description}</p>
      </div>

      {/* PriorityBeacon - filtered to this outcome's dimensions */}
      <div style={styles.prioritySection}>
        <PriorityBeacon
          dimensions={outcomeDimensions}
          onDimensionClick={onDimensionClick}
        />
      </div>

      {/* OutcomeDimensionTable - table view of contributing dimensions */}
      <div style={styles.tableSection}>
        <h4 style={styles.sectionTitle}>Contributing Dimensions</h4>
        <OutcomeDimensionTable
          dimensions={dimensions}
          contributions={outcome.contributions}
          onDimensionClick={onDimensionClick}
        />

        {/* Missing dimensions notice */}
        {missingContributions.length > 0 && (
          <div style={styles.missingNotice}>
            <span style={styles.missingLabel}>Not in this assessment:</span>
            <span style={styles.missingList}>
              {missingContributions.map(c => c.dimensionName).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div style={styles.scoreBreakdown}>
        <div style={styles.breakdownItem}>
          <span style={styles.breakdownLabel}>Weighted Score</span>
          <span style={styles.breakdownValue}>{outcome.rawScore}</span>
        </div>
        {outcome.criticalGaps.length > 0 && (
          <>
            <span style={styles.breakdownArrow}>→</span>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>After Gap Cap</span>
              <span style={{ ...styles.breakdownValue, color: outcome.color }}>
                {outcome.finalScore}
              </span>
            </div>
          </>
        )}
        <div style={styles.breakdownItem}>
          <span style={styles.breakdownLabel}>Confidence</span>
          <span style={{ ...styles.breakdownValue, color: outcome.color }}>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid',
    marginTop: '16px',
  },

  header: {
    marginBottom: '20px',
  },

  question: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },

  description: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.5,
  },

  prioritySection: {
    marginBottom: '24px',
  },

  tableSection: {
    marginBottom: '20px',
  },

  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },

  missingNotice: {
    marginTop: '12px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#6B778C',
  },

  missingLabel: {
    fontWeight: 600,
    marginRight: '8px',
  },

  missingList: {
    fontStyle: 'italic',
  },

  scoreBreakdown: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    flexWrap: 'wrap',
  },

  breakdownItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },

  breakdownLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },

  breakdownValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
  },

  breakdownArrow: {
    fontSize: '16px',
    color: '#6B778C',
  },
};

export default ExpandedOutcomePanel;
