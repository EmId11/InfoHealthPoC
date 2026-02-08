import React, { useState } from 'react';
import { DimensionResult, IndicatorCategory } from '../../../types/assessment';
import { Step6Data } from '../../../types/wizard';
import { getRiskLevelInfo } from '../../../constants/mockAssessmentData';
import TrendIndicator from '../common/TrendIndicator';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import Tooltip from '@atlaskit/tooltip';

interface Dimension11ModalProps {
  dimension: DimensionResult;
  reportOptions: Step6Data;
  onClose: () => void;
}

const Dimension11Modal: React.FC<Dimension11ModalProps> = ({
  dimension,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | null>(null);
  const levelInfo = getRiskLevelInfo(dimension.riskLevel);

  const getStatusColor = (percentile: number): string => {
    if (percentile <= 25) return '#DE350B';
    if (percentile <= 75) return '#FFAB00';
    return '#36B37E';
  };

  const getStatusBgColor = (percentile: number): string => {
    if (percentile <= 25) return '#FFEBE6';
    if (percentile <= 75) return '#FFFAE6';
    return '#E3FCEF';
  };

  const getCategoryStatusColor = (category: IndicatorCategory): string => {
    const avgPercentile = category.indicators.reduce(
      (sum, ind) => sum + ind.benchmarkPercentile, 0
    ) / category.indicators.length;
    return getStatusColor(avgPercentile);
  };

  const getCategoryLetter = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C...
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            {selectedCategory ? (
              <button
                style={styles.backButton}
                onClick={() => setSelectedCategory(null)}
              >
                <ArrowLeftIcon label="Back" size="small" />
                <span>Back to Categories</span>
              </button>
            ) : null}
            <h2 style={styles.title}>
              {selectedCategory ? selectedCategory.name : 'Automation Opportunities'}
            </h2>
            <p style={styles.subtitle}>
              {selectedCategory
                ? selectedCategory.description
                : 'Identify manual and repetitive work that could be optimised via Jira Automation.'}
            </p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="medium" />
          </button>
        </div>

        <div style={styles.content}>
          {!selectedCategory ? (
            <>
              {/* Summary Section */}
              <div style={styles.summarySection}>
                <div style={{
                  ...styles.summaryBadge,
                  backgroundColor: levelInfo.color.bg,
                  color: levelInfo.color.text,
                }}>
                  {levelInfo.label} Risk
                </div>
                <p style={styles.summaryText}>
                  {dimension.verdictDescription}
                </p>
              </div>

              {/* Why It Matters */}
              <div style={styles.whySection}>
                <h3 style={styles.sectionTitle}>Why This Matters</h3>
                <p style={styles.whyText}>{dimension.whyItMatters}</p>
                <ul style={styles.whyList}>
                  {dimension.whyItMattersPoints.map((point, idx) => (
                    <li key={idx} style={styles.whyListItem}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* Categories Grid */}
              <div style={styles.categoriesSection}>
                <h3 style={styles.sectionTitle}>
                  Automation Categories ({dimension.categories.length})
                </h3>
                <div style={styles.categoriesGrid}>
                  {dimension.categories.map((category, index) => (
                    <div
                      key={category.id}
                      style={styles.categoryCard}
                      onClick={() => setSelectedCategory(category)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(category)}
                    >
                      <div style={styles.categoryHeader}>
                        <div style={{
                          ...styles.categoryLetter,
                          backgroundColor: getCategoryStatusColor(category),
                        }}>
                          {getCategoryLetter(index)}
                        </div>
                        <div style={styles.categoryTitleSection}>
                          <h4 style={styles.categoryTitle}>{category.name}</h4>
                          <p style={styles.categoryDescription}>{category.description}</p>
                        </div>
                      </div>

                      <div style={styles.categoryStats}>
                        <div style={styles.categoryStat}>
                          <span style={styles.categoryStatLabel}>Indicators</span>
                          <span style={styles.categoryStatValue}>{category.indicators.length}</span>
                        </div>
                        <div style={styles.categoryStat}>
                          <span style={styles.categoryStatLabel}>Flagged</span>
                          <span style={{
                            ...styles.categoryStatValue,
                            color: category.issuesCount > 0 ? '#DE350B' : '#36B37E',
                          }}>
                            {category.issuesCount}
                          </span>
                        </div>
                      </div>

                      <div style={styles.categoryFooter}>
                        <span style={styles.viewDetails}>View indicators</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Category Detail View */
            <div style={styles.indicatorsSection}>
              <div style={styles.categoryDetailHeader}>
                <div style={styles.categoryDetailStats}>
                  <span style={styles.categoryDetailStat}>
                    {selectedCategory.indicators.length} indicators
                  </span>
                  <span style={styles.categoryDetailStat}>
                    {selectedCategory.issuesCount} flagged
                  </span>
                </div>
              </div>

              <div style={styles.rationaleBox}>
                <strong>Rationale:</strong> {selectedCategory.rationale}
              </div>

              <div style={styles.indicatorsList}>
                {selectedCategory.indicators.map((indicator, index) => (
                  <div key={indicator.id} style={styles.indicatorCard}>
                    <div style={styles.indicatorHeader}>
                      <div style={styles.indicatorNumberBadge}>{index + 1}</div>
                      <div style={styles.indicatorTitleSection}>
                        <h4 style={styles.indicatorTitle}>{indicator.name}</h4>
                      </div>
                      <div style={{
                        ...styles.indicatorStatusBadge,
                        backgroundColor: getStatusBgColor(indicator.benchmarkPercentile),
                        color: getStatusColor(indicator.benchmarkPercentile),
                      }}>
                        {indicator.benchmarkPercentile <= 25 ? 'Needs Attention' :
                         indicator.benchmarkPercentile <= 75 ? 'Moderate' : 'Good'}
                      </div>
                    </div>

                    <p style={styles.indicatorDescription}>{indicator.description}</p>

                    <div style={styles.indicatorMetrics}>
                      <div style={styles.metricBox}>
                        <span style={styles.metricLabel}>Current</span>
                        <span style={styles.metricValue}>{indicator.displayValue}</span>
                      </div>
                      <div style={styles.metricBox}>
                        <span style={styles.metricLabel}>Benchmark</span>
                        <Tooltip content={indicator.benchmarkComparison}>
                          <span style={styles.metricValue}>{indicator.benchmarkDisplayValue}</span>
                        </Tooltip>
                      </div>
                      <div style={styles.metricBox}>
                        <span style={styles.metricLabel}>Percentile</span>
                        <span style={{
                          ...styles.metricValue,
                          color: getStatusColor(indicator.benchmarkPercentile),
                        }}>
                          {indicator.benchmarkPercentile}%
                        </span>
                      </div>
                      <div style={styles.metricBox}>
                        <span style={styles.metricLabel}>Trend</span>
                        <TrendIndicator direction={indicator.trend} showLabel size="small" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '40px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 24px 20px',
    borderBottom: '1px solid #EBECF0',
  },
  headerContent: {
    flex: 1,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    color: '#172B4D',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: '#6B778C',
    marginLeft: '16px',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  summarySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
  },
  summaryBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  summaryText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  whySection: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  whyText: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  whyList: {
    margin: 0,
    paddingLeft: '20px',
  },
  whyListItem: {
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.6,
    marginBottom: '4px',
  },
  categoriesSection: {
    marginBottom: '24px',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  categoryCard: {
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  },
  categoryHeader: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  categoryLetter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  categoryTitleSection: {
    flex: 1,
  },
  categoryTitle: {
    margin: '0 0 4px 0',
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
  categoryStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #EBECF0',
  },
  categoryStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  categoryStatLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  categoryStatValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
  },
  categoryFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  viewDetails: {
    fontSize: '13px',
    color: '#0052CC',
    fontWeight: 500,
  },
  indicatorsSection: {
    marginBottom: '24px',
  },
  categoryDetailHeader: {
    marginBottom: '16px',
  },
  categoryDetailStats: {
    display: 'flex',
    gap: '16px',
  },
  categoryDetailStat: {
    fontSize: '14px',
    color: '#5E6C84',
  },
  rationaleBox: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
    marginBottom: '20px',
  },
  indicatorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  indicatorCard: {
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
  },
  indicatorHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  indicatorNumberBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    flexShrink: 0,
  },
  indicatorTitleSection: {
    flex: 1,
  },
  indicatorTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  indicatorStatusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  indicatorDescription: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
    paddingLeft: '40px',
  },
  indicatorMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    paddingLeft: '40px',
  },
  metricBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
  },
  metricLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
};

export default Dimension11Modal;
