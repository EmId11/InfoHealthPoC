import React, { useState } from 'react';
import { IndicatorCategory } from '../../../types/assessment';
import { getRiskLevelColor } from '../../../constants/mockAssessmentData';
import IndicatorCard from './IndicatorCard';
import RiskBadge from '../common/RiskBadge';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface IndicatorCategorySectionProps {
  category: IndicatorCategory;
  defaultExpanded?: boolean;
  showTrendCharts?: boolean;
  showDescriptions?: boolean;
  showComparisons?: boolean;
}

const IndicatorCategorySection: React.FC<IndicatorCategorySectionProps> = ({
  category,
  defaultExpanded = false,
  showTrendCharts = true,
  showDescriptions = true,
  showComparisons = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const statusColors = getRiskLevelColor(category.status);
  const indicatorCount = category.indicators.length;

  // Count indicators by severity
  const concerningCount = category.indicators.filter(
    (ind) => ind.benchmarkPercentile <= 25
  ).length;

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.header,
          borderLeftColor: statusColors.text,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div style={styles.headerLeft}>
          <span style={styles.chevron}>
            {isExpanded ? (
              <ChevronDownIcon label="" size="medium" />
            ) : (
              <ChevronRightIcon label="" size="medium" />
            )}
          </span>
          <div style={styles.headerContent}>
            <div style={styles.headerTitleRow}>
              <h4 style={styles.categoryName}>{category.shortName}</h4>
              <RiskBadge level={category.status} size="small" />
            </div>
            <p style={styles.categoryDescription}>{category.description}</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{concerningCount}</span>
              <span style={styles.statLabel}>issues</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statValueSmall}>{indicatorCount}</span>
              <span style={styles.statLabel}>total</span>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div style={styles.content}>
          <div style={styles.fullDescription}>
            <strong>{category.name}</strong>
          </div>
          <div style={styles.indicatorsList}>
            {category.indicators.map((indicator) => (
              <IndicatorCard
                key={indicator.id}
                indicator={indicator}
                showTrendChart={showTrendCharts}
                showDescription={showDescriptions}
                showComparison={showComparisons}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    backgroundColor: '#FFFFFF',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 20px',
    border: 'none',
    borderLeft: '4px solid',
    cursor: 'pointer',
    textAlign: 'left',
    backgroundColor: '#FAFBFC',
    transition: 'background-color 0.2s ease',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1,
  },
  chevron: {
    color: '#172B4D',
    flexShrink: 0,
    marginTop: '2px',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  categoryName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  categoryDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  headerRight: {
    flexShrink: 0,
    marginLeft: '16px',
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #DFE1E6',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#BF2600',
  },
  statValueSmall: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#6B778C',
  },
  statLabel: {
    fontSize: '10px',
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#DFE1E6',
  },
  content: {
    padding: '20px',
    borderTop: '1px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
  },
  fullDescription: {
    marginBottom: '16px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.4,
  },
  indicatorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

export default IndicatorCategorySection;
