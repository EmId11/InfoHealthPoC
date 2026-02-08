// ImpactHeroSection Component
// Focused hero section showing the team's improvement with date selection and metric explanations

import React from 'react';
import { PortfolioImpactSummary } from '../../../types/impactMeasurement';
import { getIndicatorTier } from '../../../types/indicatorTiers';

interface ImpactHeroSectionProps {
  summary: PortfolioImpactSummary;
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onSimilarTeamsClick: () => void;
  onPercentileInfoClick: () => void;
  onFromDateInfoClick: () => void;
  onToDateInfoClick: () => void;
  onConfidenceClick: () => void;
}

// Get confidence level info based on score
const getConfidenceInfo = (score: number) => {
  if (score >= 80) return { label: 'Very High', color: '#006644', bars: 5 };
  if (score >= 60) return { label: 'High', color: '#0052CC', bars: 4 };
  if (score >= 40) return { label: 'Moderate', color: '#FF8B00', bars: 3 };
  if (score >= 20) return { label: 'Low', color: '#DE350B', bars: 2 };
  return { label: 'Very Low', color: '#BF2600', bars: 1 };
};

export const ImpactHeroSection: React.FC<ImpactHeroSectionProps> = ({
  summary,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSimilarTeamsClick,
  onPercentileInfoClick,
  onFromDateInfoClick,
  onToDateInfoClick,
  onConfidenceClick,
}) => {
  const change = summary.currentAverageHealthScore - summary.baselineAverageHealthScore;

  // Get tier colors for before and after
  const beforeTier = getIndicatorTier(summary.baselineAverageHealthScore);
  const afterTier = getIndicatorTier(summary.currentAverageHealthScore);

  // Delta color: green if positive, red if negative, grey if stable
  const getDeltaColor = () => {
    if (change > 2) return '#006644';  // Green for positive
    if (change < -2) return '#DE350B'; // Red for negative
    return '#6B778C';                   // Grey for stable
  };
  const deltaColor = getDeltaColor();

  // Get confidence info
  const confidence = getConfidenceInfo(summary.avgConfidenceScore);

  // Format date for input value
  const formatDateInput = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>YOUR JIRA HEALTH OVER TIME</h2>
      </div>

      <div style={styles.mainContent}>
        {/* Before/After Gauges with Date Pickers */}
        <div style={styles.gaugeSection}>
          <div style={styles.gaugeGroup}>
            {/* Before Gauge with Date Picker */}
            <div style={styles.gaugeContainer}>
              <div style={styles.datePickerRow}>
                <input
                  type="date"
                  value={formatDateInput(fromDate)}
                  onChange={(e) => onFromDateChange(e.target.value)}
                  style={styles.datePicker}
                  max={formatDateInput(toDate)}
                />
                <button
                  onClick={onFromDateInfoClick}
                  style={styles.dateInfoButton}
                  title="What is this date?"
                >
                  <InfoIcon size={14} />
                </button>
              </div>
              <div style={styles.gaugeCircle}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="75" fill="none" stroke="#F4F5F7" strokeWidth="12" />
                  <circle
                    cx="90" cy="90" r="75" fill="none"
                    stroke={beforeTier.color}
                    strokeWidth="12"
                    strokeDasharray={`${summary.baselineAverageHealthScore * 4.71} 471`}
                    strokeLinecap="round"
                    transform="rotate(-90 90 90)"
                    opacity={0.5}
                  />
                  <text x="90" y="88" textAnchor="middle" style={{ fontSize: 42, fontWeight: 700, fill: '#5E6C84' }}>
                    {Math.round(summary.baselineAverageHealthScore)}
                    <tspan style={{ fontSize: 18, fontWeight: 500 }} baselineShift="super">/100</tspan>
                  </text>
                  <text x="90" y="115" textAnchor="middle" style={{ fontSize: 14, fontWeight: 600, fill: beforeTier.color }}>
                    {beforeTier.name}
                  </text>
                </svg>
              </div>
            </div>

            {/* Arrow */}
            <div style={styles.arrowContainer}>
              <svg width="80" height="32" viewBox="0 0 80 32">
                <path
                  d="M0 16 L64 16 M56 8 L72 16 L56 24"
                  fill="none" stroke={afterTier.color}
                  strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* After Gauge with Date Picker */}
            <div style={styles.gaugeContainer}>
              <div style={styles.datePickerRow}>
                <input
                  type="date"
                  value={formatDateInput(toDate)}
                  onChange={(e) => onToDateChange(e.target.value)}
                  style={styles.datePicker}
                  min={formatDateInput(fromDate)}
                  max={formatDateInput(new Date().toISOString())}
                />
                <button
                  onClick={onToDateInfoClick}
                  style={styles.dateInfoButton}
                  title="What is this date?"
                >
                  <InfoIcon size={14} />
                </button>
              </div>
              <div style={styles.gaugeCircle}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="75" fill="none" stroke="#F4F5F7" strokeWidth="12" />
                  <circle
                    cx="90" cy="90" r="75" fill="none"
                    stroke={afterTier.color}
                    strokeWidth="12"
                    strokeDasharray={`${summary.currentAverageHealthScore * 4.71} 471`}
                    strokeLinecap="round"
                    transform="rotate(-90 90 90)"
                  />
                  <text x="90" y="88" textAnchor="middle" style={{ fontSize: 42, fontWeight: 700, fill: afterTier.color }}>
                    {Math.round(summary.currentAverageHealthScore)}
                    <tspan style={{ fontSize: 18, fontWeight: 500 }} baselineShift="super">/100</tspan>
                  </text>
                  <text x="90" y="115" textAnchor="middle" style={{ fontSize: 14, fontWeight: 600, fill: afterTier.color }}>
                    {afterTier.name}
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Delta Display with Confidence */}
          <div style={styles.deltaContainer}>
            <div style={styles.deltaRow}>
              <span style={{ ...styles.deltaValue, color: deltaColor }}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}
              </span>
              <button
                onClick={onPercentileInfoClick}
                style={styles.infoButton}
                title="How is health score improvement calculated?"
              >
                <InfoIcon />
              </button>
            </div>
            <button
              onClick={onConfidenceClick}
              style={styles.confidenceButton}
              title="Click to see how confidence is calculated"
            >
              <ConfidenceMeter bars={confidence.bars} color={confidence.color} />
              <span style={{ ...styles.confidenceLabel, color: confidence.color }}>
                {confidence.label} Confidence
              </span>
            </button>
          </div>
        </div>

        {/* Rank Context with Similar Teams Link */}
        <div style={styles.rankContext}>
          <span>
            Rank improved from <strong>{summary.baselineAverageRank}{getOrdinalSuffix(summary.baselineAverageRank)}</strong> to{' '}
            <strong>{summary.currentAverageRank}{getOrdinalSuffix(summary.currentAverageRank)}</strong> of{' '}
            <button onClick={onSimilarTeamsClick} style={styles.similarTeamsLink}>
              {summary.totalTeamsInComparison} similar teams
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

// Confidence Meter - signal strength style indicator
const ConfidenceMeter: React.FC<{ bars: number; color: string }> = ({ bars, color }) => (
  <div style={styles.meterContainer}>
    {[1, 2, 3, 4, 5].map((bar) => (
      <div
        key={bar}
        style={{
          ...styles.meterBar,
          height: 6 + bar * 3,
          backgroundColor: bar <= bars ? color : '#DFE1E6',
        }}
      />
    ))}
  </div>
);

// Info icon component
const InfoIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="#6B778C" strokeWidth="1.5" fill="none" />
    <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6B778C">i</text>
  </svg>
);

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 28,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: 0,
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  gaugeSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    flexWrap: 'wrap',
  },
  gaugeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  gaugeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  datePickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  datePicker: {
    padding: '6px 10px',
    fontSize: 12,
    border: '1px solid #DFE1E6',
    borderRadius: 4,
    color: '#5E6C84',
    backgroundColor: '#FAFBFC',
    cursor: 'pointer',
    outline: 'none',
  },
  dateInfoButton: {
    background: 'none',
    border: 'none',
    padding: 2,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  gaugeCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 30,
  },
  deltaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  deltaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  deltaValue: {
    fontSize: 48,
    fontWeight: 700,
  },
  meterContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 3,
    height: 22,
  },
  meterBar: {
    width: 4,
    borderRadius: 1,
  },
  confidenceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: 14,
  },
  confidenceLabel: {
    fontWeight: 500,
  },
  infoButton: {
    background: 'none',
    border: 'none',
    padding: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    transition: 'background-color 0.2s',
  },
  rankContext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#5E6C84',
    padding: '12px 16px',
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
  },
  similarTeamsLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: '#0052CC',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default ImpactHeroSection;
