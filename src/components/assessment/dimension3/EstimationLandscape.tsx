import React from 'react';
import { DimensionResult } from '../../../types/assessment';

interface EstimationLandscapeProps {
  dimension: DimensionResult;
}

const EstimationLandscape: React.FC<EstimationLandscapeProps> = ({ dimension }) => {
  // Extract key metrics from indicators
  const coverageCategory = dimension.categories.find(c => c.id === 'estimationCoverage');

  // Get values from indicators
  const policyExclusionIndicator = coverageCategory?.indicators.find(i => i.id === 'policyExclusions');
  const storyEstimationIndicator = coverageCategory?.indicators.find(i => i.id === 'storyEstimationRate');

  // Calculate percentages
  const notExpectedPercent = policyExclusionIndicator?.value || 45; // Work not estimated by policy
  const expectedPercent = 100 - notExpectedPercent; // Work that should be estimated
  const estimatedOfExpected = storyEstimationIndicator?.value || 85; // % of expected that IS estimated

  // Calculate actual segments
  const estimatedPercent = Math.round((expectedPercent * estimatedOfExpected) / 100);
  const missingPercent = expectedPercent - estimatedPercent;

  // For display purposes
  const segments = [
    {
      label: 'Estimated',
      percent: estimatedPercent,
      color: '#36B37E',
      bgColor: '#E3FCEF',
      description: 'Work with estimates that can be used for planning',
    },
    {
      label: 'Missing Estimates',
      percent: missingPercent,
      color: '#DE350B',
      bgColor: '#FFEBE6',
      description: 'Work that should be estimated but isn\'t',
    },
    {
      label: 'Not Expected',
      percent: notExpectedPercent,
      color: '#6B778C',
      bgColor: '#F4F5F7',
      description: 'Tasks, Bugs, etc. excluded from estimation by policy',
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Your Estimation Landscape</h4>
        <p style={styles.subtitle}>
          Understanding how much of your work is usable for planning and forecasting
        </p>
      </div>

      {/* Visual Bar */}
      <div style={styles.barContainer}>
        <div style={styles.bar}>
          {segments.map((segment, index) => (
            <div
              key={segment.label}
              style={{
                ...styles.segment,
                width: `${segment.percent}%`,
                backgroundColor: segment.color,
                borderRadius: index === 0 ? '6px 0 0 6px' : index === segments.length - 1 ? '0 6px 6px 0' : '0',
              }}
            >
              {segment.percent >= 15 && (
                <span style={styles.segmentLabel}>{segment.percent}%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {segments.map((segment) => (
          <div key={segment.label} style={styles.legendItem}>
            <div style={styles.legendTop}>
              <div style={{ ...styles.legendDot, backgroundColor: segment.color }} />
              <span style={styles.legendLabel}>{segment.label}</span>
              <span style={styles.legendPercent}>{segment.percent}%</span>
            </div>
            <p style={styles.legendDescription}>{segment.description}</p>
          </div>
        ))}
      </div>

      {/* Key Insight */}
      <div style={styles.insightBox}>
        <div style={styles.insightIcon}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#0052CC" strokeWidth="2"/>
            <path d="M10 6v5M10 13v1" stroke="#0052CC" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={styles.insightContent}>
          <span style={styles.insightTitle}>Key Insight</span>
          <p style={styles.insightText}>
            Only <strong>{estimatedPercent}%</strong> of your work is estimated and usable for planning.
            {missingPercent > 5 && (
              <> An additional <strong>{missingPercent}%</strong> should be estimated but isn't.</>
            )}
            {notExpectedPercent > 40 && (
              <> A significant portion (<strong>{notExpectedPercent}%</strong>) is excluded from estimation by policy,
              which limits forecasting accuracy.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '12px',
    padding: '24px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
  barContainer: {
    marginBottom: '20px',
  },
  bar: {
    display: 'flex',
    height: '40px',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
  },
  segment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.3s ease',
    minWidth: '2px',
  },
  segmentLabel: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  legend: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  legendItem: {
    padding: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  legendTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    flex: 1,
  },
  legendPercent: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#172B4D',
  },
  legendDescription: {
    margin: 0,
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  insightBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    border: '1px solid #B3D4FF',
  },
  insightIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  insightText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default EstimationLandscape;
