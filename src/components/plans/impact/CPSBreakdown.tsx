// CPSBreakdown Component
// Visualizes the three components of the Composite Progress Score (API, CGP, TNV)

import React from 'react';
import {
  CPSResult,
  getCPSCategoryLabel,
  getCPSCategoryColor,
  formatCPS,
  formatConfidenceInterval,
} from '../../../types/progressScore';
import { getCategoryConfig } from '../../../constants/progressScoreConfig';

interface CPSBreakdownProps {
  result: CPSResult;
  showDetails?: boolean;
  onInfoClick?: (component: 'api' | 'cgp' | 'tnv' | 'cps') => void;
}

export const CPSBreakdown: React.FC<CPSBreakdownProps> = ({
  result,
  showDetails = false,
  onInfoClick,
}) => {
  const categoryConfig = getCategoryConfig(result.category);
  const categoryColors = getCPSCategoryColor(result.category);

  return (
    <div style={styles.container}>
      {/* Main CPS Score Display */}
      <div style={styles.mainScore}>
        <div style={styles.scoreCircle}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="#F4F5F7"
              strokeWidth="10"
            />
            {/* Score arc */}
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke={categoryColors.text}
              strokeWidth="10"
              strokeDasharray={`${(result.cps / 100) * 377} 377`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            {/* Score text */}
            <text
              x="70"
              y="65"
              textAnchor="middle"
              style={{ fontSize: 32, fontWeight: 700, fill: categoryColors.text }}
            >
              {formatCPS(result.cps)}
            </text>
            <text
              x="70"
              y="85"
              textAnchor="middle"
              style={{ fontSize: 11, fontWeight: 500, fill: '#6B778C' }}
            >
              CPS
            </text>
          </svg>
        </div>

        {/* Category Badge */}
        <div
          style={{
            ...styles.categoryBadge,
            backgroundColor: categoryColors.bg,
            color: categoryColors.text,
            borderColor: categoryColors.border,
          }}
        >
          {getCPSCategoryLabel(result.category)}
        </div>

        {/* Confidence Interval */}
        <div style={styles.confidenceInterval}>
          <span style={styles.ciLabel}>95% CI:</span>
          <span style={styles.ciValue}>
            {formatConfidenceInterval(result.confidenceInterval)}
          </span>
          {onInfoClick && (
            <button
              onClick={() => onInfoClick('cps')}
              style={styles.infoButton}
              title="Learn more about the CPS calculation"
            >
              <InfoIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Component Breakdown */}
      <div style={styles.components}>
        {/* API Component */}
        <ComponentCard
          name="API"
          fullName="Absolute Progress Index"
          value={result.api.scaled}
          weight={result.componentWeights.api}
          description="Direct measurement of indicator changes"
          color="#0052CC"
          onInfoClick={onInfoClick ? () => onInfoClick('api') : undefined}
          details={showDetails ? {
            effectSize: result.api.raw,
            wasWinsorized: result.api.wasWinsorized,
            se: result.api.standardError,
          } : undefined}
        />

        {/* CGP Component */}
        {result.cgp && (
          <ComponentCard
            name="CGP"
            fullName="Conditional Growth Percentile"
            value={result.cgp.scaled}
            weight={result.componentWeights.cgp}
            description="Progress relative to similar baseline teams"
            color="#5243AA"
            onInfoClick={onInfoClick ? () => onInfoClick('cgp') : undefined}
            details={showDetails ? {
              groupSize: result.cgp.baselineGroup.size,
              rankInGroup: result.cgp.rankWithinGroup,
              shrinkage: result.cgp.shrinkageAlpha,
              se: result.cgp.standardError,
            } : undefined}
          />
        )}

        {/* TNV Component (if applicable) */}
        {result.tnv && (
          <ComponentCard
            name="TNV"
            fullName="Time-Normalized Velocity"
            value={result.tnv.scaled}
            weight={result.componentWeights.tnv || 0}
            description="Progress adjusted for measurement interval"
            color="#FF8B00"
            onInfoClick={onInfoClick ? () => onInfoClick('tnv') : undefined}
            details={showDetails ? {
              rawTNV: result.tnv.raw,
              scalingK: result.tnv.scalingConstant,
              se: result.tnv.standardError,
            } : undefined}
          />
        )}
      </div>

      {/* Model Type Indicator */}
      <div style={styles.modelInfo}>
        <span style={styles.modelLabel}>
          {result.modelType === '3-component' ? '3-Component Model' : '2-Component Model'}
        </span>
        {result.isSensitive && (
          <span style={styles.sensitivityWarning}>
            <WarningIcon size={14} />
            Results sensitive to weight changes
          </span>
        )}
      </div>
    </div>
  );
};

// Component Card Sub-component
interface ComponentCardProps {
  name: string;
  fullName: string;
  value: number;
  weight: number;
  description: string;
  color: string;
  onInfoClick?: () => void;
  details?: Record<string, number | boolean | string>;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  name,
  fullName,
  value,
  weight,
  description,
  color,
  onInfoClick,
  details,
}) => (
  <div style={styles.componentCard}>
    <div style={styles.componentHeader}>
      <div style={styles.componentTitleRow}>
        <span style={{ ...styles.componentName, color }}>{name}</span>
        <span style={styles.componentWeight}>
          {Math.round(weight * 100)}% weight
        </span>
      </div>
      <span style={styles.componentFullName}>{fullName}</span>
    </div>

    <div style={styles.componentBody}>
      <div style={styles.componentScoreRow}>
        <div style={styles.componentGauge}>
          <div
            style={{
              ...styles.componentGaugeFill,
              width: `${value}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span style={{ ...styles.componentValue, color }}>{value.toFixed(1)}</span>
      </div>
      <p style={styles.componentDescription}>{description}</p>
    </div>

    {details && (
      <div style={styles.componentDetails}>
        {Object.entries(details).map(([key, val]) => (
          <div key={key} style={styles.detailRow}>
            <span style={styles.detailLabel}>{formatDetailLabel(key)}:</span>
            <span style={styles.detailValue}>{formatDetailValue(key, val)}</span>
          </div>
        ))}
      </div>
    )}

    {onInfoClick && (
      <button onClick={onInfoClick} style={styles.learnMoreButton}>
        Learn more
      </button>
    )}
  </div>
);

// Helper functions
function formatDetailLabel(key: string): string {
  const labels: Record<string, string> = {
    effectSize: 'Effect Size',
    wasWinsorized: 'Winsorized',
    se: 'Std Error',
    groupSize: 'Group Size',
    rankInGroup: 'Rank in Group',
    shrinkage: 'Shrinkage',
    rawTNV: 'Raw TNV',
    scalingK: 'Scaling (k)',
  };
  return labels[key] || key;
}

function formatDetailValue(key: string, val: number | boolean | string): string {
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') {
    if (key === 'shrinkage' || key === 'scalingK') return val.toFixed(3);
    if (key === 'effectSize' || key === 'rawTNV') return val.toFixed(2);
    if (key === 'se') return `\u00B1${val.toFixed(1)}`;
    return val.toString();
  }
  return String(val);
}

// Icon components
const InfoIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor">
      i
    </text>
  </svg>
);

const WarningIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1L15 14H1L8 1Z"
      stroke="#FF8B00"
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
    />
    <text x="8" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="#FF8B00">
      !
    </text>
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
  mainScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: '1px solid #EBECF0',
  },
  scoreCircle: {
    marginBottom: 12,
  },
  categoryBadge: {
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid',
    marginBottom: 12,
  },
  confidenceInterval: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  ciLabel: {
    fontSize: 12,
    color: '#6B778C',
  },
  ciValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#5E6C84',
  },
  infoButton: {
    background: 'none',
    border: 'none',
    padding: 2,
    cursor: 'pointer',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  components: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  componentCard: {
    padding: 16,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    border: '1px solid #EBECF0',
  },
  componentHeader: {
    marginBottom: 12,
  },
  componentTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  componentName: {
    fontSize: 16,
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
  },
  componentBody: {},
  componentScoreRow: {
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
    transition: 'width 0.3s ease',
  },
  componentValue: {
    fontSize: 18,
    fontWeight: 700,
    minWidth: 45,
    textAlign: 'right',
  },
  componentDescription: {
    fontSize: 12,
    color: '#6B778C',
    margin: 0,
    lineHeight: 1.4,
  },
  componentDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #EBECF0',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px 16px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B778C',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: 600,
    color: '#172B4D',
  },
  learnMoreButton: {
    marginTop: 12,
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: 12,
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  modelInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTop: '1px solid #EBECF0',
  },
  modelLabel: {
    fontSize: 12,
    color: '#6B778C',
    fontWeight: 500,
  },
  sensitivityWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#FF8B00',
    fontWeight: 500,
  },
};

export default CPSBreakdown;
