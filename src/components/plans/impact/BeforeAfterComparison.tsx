// BeforeAfterComparison Component
// Section showing before/after comparisons for each outcome

import React from 'react';
import { OutcomeImpact } from '../../../types/impactMeasurement';
import { BeforeAfterSpectrum } from '../../assessment/impact/BeforeAfterSpectrum';

interface BeforeAfterComparisonProps {
  outcomeImpacts: OutcomeImpact[];
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  outcomeImpacts,
}) => {
  if (outcomeImpacts.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Before / After Comparison</h3>
        <div style={styles.emptyState}>
          <p>No outcome data available for comparison.</p>
          <p style={styles.emptyHint}>
            Complete more plays and run assessments to see before/after comparisons.
          </p>
        </div>
      </div>
    );
  }

  // Sort by absolute change (most impactful first)
  const sortedOutcomes = [...outcomeImpacts].sort(
    (a, b) => Math.abs(b.changePoints) - Math.abs(a.changePoints)
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Before / After Comparison</h3>
      <p style={styles.description}>
        How your scores have changed since starting this improvement plan.
      </p>

      <div style={styles.spectrumList}>
        {sortedOutcomes.map((outcome, idx) => (
          <div key={outcome.outcomeId} style={styles.spectrumItem}>
            <div style={styles.outcomeHeader}>
              <span style={styles.outcomeName}>{outcome.outcomeName}</span>
              <span style={styles.playsCount}>
                {outcome.contributingPlays.length} play{outcome.contributingPlays.length !== 1 ? 's' : ''} contributing
              </span>
            </div>
            <BeforeAfterSpectrum
              beforeScore={outcome.baselineScore}
              afterScore={outcome.currentScore}
              showValues
              height={20}
            />
          </div>
        ))}
      </div>

      <div style={styles.legendContainer}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: '#6B778C' }} />
          <span>Baseline (plan start)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: '#0052CC' }} />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 4px 0',
  },
  description: {
    fontSize: 13,
    color: '#6B778C',
    margin: '0 0 20px 0',
  },
  spectrumList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  spectrumItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  outcomeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outcomeName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#172B4D',
  },
  playsCount: {
    fontSize: 12,
    color: '#6B778C',
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px solid #DFE1E6',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#6B778C',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6B778C',
  },
  emptyHint: {
    fontSize: 13,
    marginTop: 8,
  },
};

export default BeforeAfterComparison;
