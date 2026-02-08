import React from 'react';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import { IndicatorResult, DimensionResult } from '../../../types/assessment';

interface DrillDownHeaderProps {
  indicator: IndicatorResult;
  dimension: DimensionResult;
  onBack: () => void;
}

const DrillDownHeader: React.FC<DrillDownHeaderProps> = ({
  indicator,
  dimension,
  onBack,
}) => {
  return (
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <button
          style={styles.backButton}
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeftIcon label="" size="medium" primaryColor="#42526E" />
          <span style={styles.backText}>Back to {dimension.dimensionName}</span>
        </button>

        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbItem}>{dimension.dimensionName}</span>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>{indicator.name}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #DFE1E6',
    zIndex: 100,
    padding: '16px 32px',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  backText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526E',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breadcrumbItem: {
    fontSize: '14px',
    color: '#6B778C',
  },
  breadcrumbSeparator: {
    fontSize: '14px',
    color: '#C1C7D0',
  },
  breadcrumbCurrent: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
};

export default DrillDownHeader;
