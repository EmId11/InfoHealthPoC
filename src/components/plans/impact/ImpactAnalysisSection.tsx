// ImpactAnalysisSection Component
// Combined view with toggle between Summary (Dimension/Outcome breakdown) and Flow diagram

import React, { useState } from 'react';
import { DimensionImpact, PortfolioOutcomeImpact, ImpactFlow } from '../../../types/impactMeasurement';
import { ImpactByDimensionSection } from './ImpactByDimensionSection';
import { ImpactByOutcomeSection } from './ImpactByOutcomeSection';
import { ImpactFlowDiagram } from './ImpactFlowDiagram';

type ViewMode = 'summary' | 'flow';

interface ImpactAnalysisSectionProps {
  dimensions: DimensionImpact[];
  outcomes: PortfolioOutcomeImpact[];
  flow: ImpactFlow;
  onNavigate?: (type: 'indicator' | 'dimension' | 'outcome', id: string) => void;
}

export const ImpactAnalysisSection: React.FC<ImpactAnalysisSectionProps> = ({
  dimensions,
  outcomes,
  flow,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');

  return (
    <div style={styles.container}>
      {/* Header with toggle */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>IMPACT ANALYSIS</h3>
          <p style={styles.subtitle}>
            {viewMode === 'summary'
              ? 'See what changed across dimensions and outcomes'
              : 'Trace how indicators influenced the changes'}
          </p>
        </div>

        {/* Toggle buttons */}
        <div style={styles.toggleGroup}>
          <button
            style={{
              ...styles.toggleButton,
              ...(viewMode === 'summary' ? styles.toggleButtonActive : {}),
            }}
            onClick={() => setViewMode('summary')}
          >
            <span style={styles.toggleIcon}>📊</span>
            What Changed
          </button>
          <button
            style={{
              ...styles.toggleButton,
              ...(viewMode === 'flow' ? styles.toggleButtonActive : {}),
            }}
            onClick={() => setViewMode('flow')}
          >
            <span style={styles.toggleIcon}>🔀</span>
            How It Changed
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      <div style={styles.content}>
        {viewMode === 'summary' ? (
          <div style={styles.summaryView}>
            <ImpactByDimensionSection dimensions={dimensions} embedded />
            <ImpactByOutcomeSection outcomes={outcomes} embedded />
          </div>
        ) : (
          <ImpactFlowDiagram flow={flow} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px',
    borderBottom: '1px solid #F4F5F7',
    backgroundColor: '#FAFBFC',
    gap: 16,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
    minWidth: 200,
  },
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
  toggleGroup: {
    display: 'flex',
    backgroundColor: '#EBECF0',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    color: '#5E6C84',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.12)',
  },
  toggleIcon: {
    fontSize: 14,
  },
  content: {
    padding: 0,
  },
  summaryView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: 0,
  },
};

export default ImpactAnalysisSection;
