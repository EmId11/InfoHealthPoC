// CPSSensitivityChart Component
// Bar chart showing CPS under different weight configurations with category highlighting

import React from 'react';
import {
  SensitivityConfiguration,
  CPSCategory,
  getCPSCategoryLabel,
  getCPSCategoryColor,
} from '../../../types/progressScore';
import { CPS_CATEGORIES, getCategoryConfig } from '../../../constants/progressScoreConfig';

interface CPSSensitivityChartProps {
  configurations: SensitivityConfiguration[];
  defaultCPS: number;
  defaultCategory: CPSCategory;
  showLegend?: boolean;
  compact?: boolean;
}

export const CPSSensitivityChart: React.FC<CPSSensitivityChartProps> = ({
  configurations,
  defaultCPS,
  defaultCategory,
  showLegend = true,
  compact = false,
}) => {
  // Find min and max CPS for scaling
  const cpsValues = configurations.map(c => c.cps);
  const minCPS = Math.max(0, Math.min(...cpsValues) - 5);
  const maxCPS = Math.min(100, Math.max(...cpsValues) + 5);
  const range = maxCPS - minCPS;

  // Count category changes
  const categoryChanges = configurations.filter(c => c.categoryChanged).length;
  const sensitivityMessage = categoryChanges > 0
    ? `${categoryChanges} configuration${categoryChanges > 1 ? 's' : ''} result${categoryChanges === 1 ? 's' : ''} in different category`
    : 'Results stable across weight configurations';

  return (
    <div style={compact ? styles.containerCompact : styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Sensitivity Analysis</h3>
        <p style={styles.subtitle}>
          CPS score under alternative weight configurations
        </p>
      </div>

      {/* Chart */}
      <div style={styles.chart}>
        {/* Category threshold lines */}
        <div style={styles.thresholdContainer}>
          {CPS_CATEGORIES.filter(cat => cat.min > minCPS && cat.min < maxCPS).map(cat => {
            const position = ((cat.min - minCPS) / range) * 100;
            return (
              <div
                key={cat.category}
                style={{
                  ...styles.thresholdLine,
                  left: `${position}%`,
                }}
                title={`${getCPSCategoryLabel(cat.category)} threshold (${cat.min})`}
              >
                <span style={styles.thresholdLabel}>{cat.min}</span>
              </div>
            );
          })}
        </div>

        {/* Bars */}
        <div style={styles.barsContainer}>
          {configurations.map((config, idx) => {
            const categoryColors = getCPSCategoryColor(config.category);
            const barWidth = ((config.cps - minCPS) / range) * 100;
            const isDefault = config.configuration.name === 'Default';

            return (
              <div
                key={config.configuration.name}
                style={{
                  ...styles.barRow,
                  backgroundColor: isDefault ? '#FAFBFC' : 'transparent',
                }}
              >
                <div style={styles.barLabel}>
                  <span style={styles.configName}>
                    {config.configuration.name}
                    {isDefault && <span style={styles.defaultBadge}>Current</span>}
                  </span>
                  <span style={styles.configWeights}>
                    {formatWeights(config.configuration)}
                  </span>
                </div>

                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.bar,
                      width: `${barWidth}%`,
                      backgroundColor: categoryColors.text,
                      opacity: isDefault ? 1 : 0.7,
                    }}
                  />
                  {/* Score marker */}
                  <div
                    style={{
                      ...styles.scoreMarker,
                      left: `${barWidth}%`,
                    }}
                  >
                    <span
                      style={{
                        ...styles.scoreValue,
                        color: categoryColors.text,
                      }}
                    >
                      {config.cps.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div style={styles.categoryIndicator}>
                  <span
                    style={{
                      ...styles.categoryBadge,
                      backgroundColor: categoryColors.bg,
                      color: categoryColors.text,
                      borderColor: categoryColors.border,
                    }}
                  >
                    {config.categoryChanged && (
                      <span style={styles.changedIcon}>*</span>
                    )}
                    {getCPSCategoryLabel(config.category).split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis */}
        <div style={styles.xAxis}>
          <span>{minCPS}</span>
          <span>{Math.round((minCPS + maxCPS) / 2)}</span>
          <span>{maxCPS}</span>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <div
          style={{
            ...styles.summaryBadge,
            backgroundColor: categoryChanges > 0 ? '#FFF0B3' : '#E3FCEF',
            color: categoryChanges > 0 ? '#FF8B00' : '#006644',
          }}
        >
          {categoryChanges > 0 ? (
            <WarningIcon size={14} color="#FF8B00" />
          ) : (
            <CheckIcon size={14} color="#006644" />
          )}
          {sensitivityMessage}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={styles.legend}>
          <span style={styles.legendTitle}>Categories:</span>
          {CPS_CATEGORIES.map(cat => (
            <div key={cat.category} style={styles.legendItem}>
              <div
                style={{
                  ...styles.legendColor,
                  backgroundColor: cat.color,
                }}
              />
              <span style={styles.legendLabel}>
                {cat.shortLabel} ({cat.min}-{cat.max === 100 ? '100' : Math.floor(cat.max)})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to format weights
function formatWeights(config: { api: number; cgp: number; tnv?: number }): string {
  const parts = [
    `API: ${Math.round(config.api * 100)}%`,
    `CGP: ${Math.round(config.cgp * 100)}%`,
  ];
  if (config.tnv !== undefined) {
    parts.push(`TNV: ${Math.round(config.tnv * 100)}%`);
  }
  return parts.join(' | ');
}

// Icon components
const WarningIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = '#FF8B00',
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1L15 14H1L8 1Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
    />
    <text x="8" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>
      !
    </text>
  </svg>
);

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = '#006644',
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" fill="none" />
    <path
      d="M5 8L7 10L11 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
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
  containerCompact: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    border: '1px solid #DFE1E6',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B778C',
    margin: 0,
  },
  chart: {
    position: 'relative',
    marginBottom: 16,
  },
  thresholdContainer: {
    position: 'absolute',
    top: 0,
    left: 140,
    right: 80,
    bottom: 24,
    pointerEvents: 'none',
  },
  thresholdLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#DFE1E6',
    zIndex: 0,
  },
  thresholdLabel: {
    position: 'absolute',
    bottom: -18,
    left: -8,
    fontSize: 9,
    color: '#6B778C',
  },
  barsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0',
    borderRadius: 6,
  },
  barLabel: {
    width: 130,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  configName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  defaultBadge: {
    fontSize: 9,
    fontWeight: 600,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '1px 6px',
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  configWeights: {
    fontSize: 10,
    color: '#6B778C',
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: '#F4F5F7',
    borderRadius: 4,
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  scoreMarker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: '#FFFFFF',
    padding: '2px 6px',
    borderRadius: 4,
    boxShadow: '0 1px 2px rgba(9, 30, 66, 0.1)',
  },
  categoryIndicator: {
    width: 70,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  changedIcon: {
    color: '#FF8B00',
    fontWeight: 700,
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 8,
    marginLeft: 140,
    marginRight: 80,
    fontSize: 10,
    color: '#6B778C',
  },
  summary: {
    marginBottom: 16,
  },
  summaryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    paddingTop: 12,
    borderTop: '1px solid #EBECF0',
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#5E6C84',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 10,
    color: '#6B778C',
  },
};

export default CPSSensitivityChart;
