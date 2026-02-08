import React, { useState } from 'react';
import { DimensionResult, IndicatorCategory } from '../../../types/assessment';
import { Step6Data } from '../../../types/wizard';
import { getRiskLevelColor, getRiskLevelInfo } from '../../../constants/mockAssessmentData';
import { CHS_CATEGORIES } from '../../../constants/chsCategories';
import { calculatePrecision } from '../../../utils/precisionIndicator';
import TrendIndicator from '../common/TrendIndicator';
import TrendChart from '../common/TrendChart';
import MethodologyExplainer from './MethodologyExplainer';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

interface CalculationModalProps {
  dimension: DimensionResult;
  reportOptions: Step6Data;
  onClose: () => void;
}

const CalculationModal: React.FC<CalculationModalProps> = ({
  dimension,
  reportOptions,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });

  const showTooltip = (e: React.MouseEvent, content: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const totalIndicators = dimension.categories.reduce(
    (sum, cat) => sum + cat.indicators.length, 0
  );
  const flaggedIndicators = dimension.categories.reduce(
    (sum, cat) => sum + cat.indicators.filter(ind => ind.benchmarkPercentile <= 25).length, 0
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* Custom Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#172B4D',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 10001,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {tooltip.content}
        </div>
      )}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {selectedCategory && (
              <button
                style={styles.backButton}
                onClick={() => setSelectedCategory(null)}
              >
                <ArrowLeftIcon label="Back" size="medium" />
              </button>
            )}
            <div>
              <h2 style={styles.title}>
                {selectedCategory ? selectedCategory.shortName : 'How We Assess Invisible Work Risk'}
              </h2>
              <p style={styles.subtitle}>
                {selectedCategory
                  ? `${selectedCategory.issuesCount} of ${selectedCategory.indicators.length} indicators below benchmark`
                  : `Evidence from ${totalIndicators} leading indicators across 3 categories`
                }
              </p>
            </div>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="medium" />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {!selectedCategory ? (
            // Overview View - Combined Category Cards
            <>
              {/* Health Score Summary Banner - CHS Methodology */}
              {(() => {
                const levelInfo = getRiskLevelInfo(dimension.riskLevel);
                const healthScore = dimension.healthScore ?? Math.round(dimension.overallPercentile);
                const cssScore = dimension.cssScore ?? healthScore;
                const trsScore = dimension.trsScore;
                const pgsScore = dimension.pgsScore;
                const standardError = dimension.standardError;
                const confidenceInterval = dimension.confidenceInterval;
                const hasFullCHS = trsScore !== null && trsScore !== undefined && pgsScore !== null && pgsScore !== undefined;

                return (
                  <div style={styles.volumeBanner}>
                    {/* Main assessment */}
                    <div style={styles.volumeBannerMain}>
                      <div style={styles.volumeBannerEstimate}>
                        <span style={{
                          ...styles.volumeBannerPercent,
                          color: levelInfo.color.text,
                        }}>
                          {healthScore}
                        </span>
                        <span style={styles.volumeBannerPercentLabel}>
                          Health Score (50 = baseline)
                          {standardError && ` ±${standardError.toFixed(1)}`}
                        </span>
                      </div>

                      {/* Risk level indicator */}
                      <div style={styles.volumeBannerSeverity}>
                        <span style={styles.volumeBannerSeverityLabel}>Category</span>
                        <div style={{
                          ...styles.volumeBannerSeverityBadge,
                          backgroundColor: levelInfo.color.bg,
                          color: levelInfo.color.text,
                        }}>
                          {levelInfo.label}
                        </div>
                        <span style={styles.volumeBannerSeverityDesc}>{levelInfo.description}</span>
                      </div>
                    </div>

                    {/* CHS Component Breakdown */}
                    <div style={styles.chsBreakdown}>
                      <div style={styles.chsBreakdownHeader}>
                        <span style={styles.chsBreakdownTitle}>How This Score Was Calculated</span>
                        <span style={styles.chsBreakdownSubtitle}>Composite Health Score (CHS) Formula</span>
                      </div>
                      <div style={styles.chsFormulaRow}>
                        <div style={styles.chsComponent}>
                          <span style={styles.chsComponentLabel}>CSS</span>
                          <span style={styles.chsComponentValue}>{cssScore.toFixed(1)}</span>
                          <span style={styles.chsComponentWeight}>× 50%</span>
                        </div>
                        <span style={styles.chsOperator}>+</span>
                        <div style={styles.chsComponent}>
                          <span style={styles.chsComponentLabel}>TRS</span>
                          <span style={styles.chsComponentValue}>
                            {trsScore !== null && trsScore !== undefined ? trsScore.toFixed(1) : '—'}
                          </span>
                          <span style={styles.chsComponentWeight}>× 35%</span>
                        </div>
                        <span style={styles.chsOperator}>+</span>
                        <div style={styles.chsComponent}>
                          <span style={styles.chsComponentLabel}>PGS</span>
                          <span style={styles.chsComponentValue}>
                            {pgsScore !== null && pgsScore !== undefined ? pgsScore.toFixed(1) : '—'}
                          </span>
                          <span style={styles.chsComponentWeight}>× 15%</span>
                        </div>
                        <span style={styles.chsOperator}>=</span>
                        <div style={styles.chsResult}>
                          <span style={styles.chsResultValue}>{healthScore}</span>
                        </div>
                      </div>
                      {!hasFullCHS && (
                        <div style={styles.chsNote}>
                          <span style={styles.chsNoteIcon}>ℹ</span>
                          <span>Trajectory (TRS) and Peer Growth (PGS) scores require historical data. Currently using CSS only.</span>
                        </div>
                      )}
                      {confidenceInterval && (() => {
                        const precision = calculatePrecision(
                          confidenceInterval.lower,
                          confidenceInterval.upper
                        );
                        return (
                          <div style={styles.chsPrecisionSection}>
                            <div style={styles.precisionRow}>
                              <span style={styles.precisionLabel}>Estimate Precision:</span>
                              <span style={{
                                ...styles.precisionBadge,
                                backgroundColor: precision.bgColor,
                                color: precision.color,
                              }}>
                                {precision.label}
                              </span>
                              <span style={styles.precisionMargin}>(±{precision.margin} pts)</span>
                              <button
                                style={styles.precisionInfoButton}
                                title={precision.explanation}
                              >
                                ?
                              </button>
                            </div>
                            <span style={styles.precisionRange}>
                              Score likely between {confidenceInterval.lower} and {confidenceInterval.upper}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Component Explanations */}
                    <div style={styles.volumeBannerConfidence}>
                      <div style={styles.chsLegend}>
                        <div style={styles.chsLegendItem}>
                          <strong>CSS</strong> = Current State Score (z-score aggregation of indicators)
                        </div>
                        <div style={styles.chsLegendItem}>
                          <strong>TRS</strong> = Trajectory Score (early vs recent period comparison)
                        </div>
                        <div style={styles.chsLegendItem}>
                          <strong>PGS</strong> = Peer Growth Score (improvement vs similar teams)
                        </div>
                      </div>
                    </div>

                    {/* Health Score Categories */}
                    <div style={styles.scaleReference}>
                      <h4 style={styles.scaleReferenceTitle}>Health Score Categories</h4>
                      <div style={styles.scaleReferenceBar}>
                        {[...CHS_CATEGORIES].reverse().map(cat => (
                          <div key={cat.category} style={{...styles.scaleRefSegment, backgroundColor: cat.color}}>
                            <span>{cat.min}-{cat.max === 101 ? 100 : cat.max}</span>
                            <span>{cat.shortLabel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Brief Intro */}
              <p style={styles.introText}>
                We assess invisible work risk by analyzing <strong>three categories of leading indicators</strong>.
                Each category reveals a different way that work may be escaping Jira's view. Your team's
                indicators are compared against similar teams to determine your overall risk level.
              </p>

              {/* Category Cards - reframed as evidence */}
              <div style={styles.categoriesGrid}>
                {dimension.categories.map((category, index) => {
                  const flaggedPercent = (category.issuesCount / category.indicators.length) * 100;
                  const statusColors = getRiskLevelColor(category.status);

                  // Calculate contribution narrative
                  const contributionText = category.issuesCount === 0
                    ? 'No concerns detected'
                    : category.issuesCount <= 2
                    ? 'Some warning signs'
                    : 'Multiple warning signs';

                  return (
                    <button
                      key={category.id}
                      style={styles.categoryCard}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {/* Header with number and title */}
                      <div style={styles.categoryHeader}>
                        <div style={styles.categoryNumberCircle}>{index + 1}</div>
                        <div style={styles.categoryTitleSection}>
                          <h4 style={styles.categoryTitle}>{category.shortName}</h4>
                          <p style={styles.categorySubtitle}>{category.description}</p>
                        </div>
                      </div>

                      {/* Stats Row - reframed */}
                      <div style={styles.categoryStats}>
                        <div style={styles.statItem}>
                          <span style={styles.statLabel}>Finding</span>
                          <div style={styles.statusBadge}>
                            <span style={{
                              ...styles.statusDot,
                              backgroundColor: statusColors.text,
                            }} />
                            <span style={{ color: statusColors.text, fontWeight: 600 }}>
                              {contributionText}
                            </span>
                          </div>
                        </div>
                        <div style={styles.statItem}>
                          <span style={styles.statLabel}>Indicators Below Benchmark</span>
                          <div style={styles.flaggedDisplay}>
                            <span style={styles.flaggedCount}>
                              {category.issuesCount} of {category.indicators.length}
                            </span>
                            <div style={styles.miniProgressBar}>
                              <div
                                style={{
                                  ...styles.miniProgressFill,
                                  width: `${flaggedPercent}%`,
                                  backgroundColor: statusColors.text,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* View link */}
                      <div style={styles.viewIndicators}>
                        Explore the evidence →
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Methodology Note - CHS explanation */}
              <div style={styles.scoringNote}>
                <strong>How we calculate the Health Score:</strong> Individual indicators are compared against
                similar teams (below 25th percentile = flagged). The dimension's Health Score uses the
                <strong> CHS formula</strong>: CSS (current state from indicators) × 50% + TRS (trajectory over time) × 35% + PGS (peer growth comparison) × 15%.
                A score of <strong>50 = baseline</strong>; higher is better.
                <button
                  style={styles.methodologyLink}
                  onClick={() => setShowMethodology(true)}
                >
                  <QuestionCircleIcon label="" size="small" />
                  <span>Learn more about our methodology</span>
                </button>
              </div>
            </>
          ) : (
            // Detail View - Indicators for selected category
            <>
              <div style={styles.categoryRationale}>
                <div style={styles.categoryRationaleHeader}>
                  <span style={styles.categoryNumber}>
                    {dimension.categories.findIndex(c => c.id === selectedCategory.id) + 1}
                  </span>
                  <h3 style={styles.categoryRationaleTitle}>{selectedCategory.shortName}</h3>
                </div>
                <p
                  style={styles.categoryRationaleText}
                  dangerouslySetInnerHTML={{ __html: selectedCategory.rationale }}
                />
              </div>

              <div style={styles.indicatorsList}>
                {selectedCategory.indicators.map((indicator, indicatorIndex) => {
                  const categoryIndex = dimension.categories.findIndex(c => c.id === selectedCategory.id) + 1;
                  const isFlagged = indicator.benchmarkPercentile <= 25;
                  const statusColor = isFlagged ? '#BF2600' : '#36B37E';
                  const statusBg = isFlagged ? '#FFEBE6' : '#E3FCEF';
                  const statusText = isFlagged ? 'Needs Attention' : 'Healthy';
                  const percentileText = indicator.benchmarkPercentile <= 10
                    ? `Bottom ${indicator.benchmarkPercentile}%`
                    : indicator.benchmarkPercentile >= 90
                    ? `Top ${100 - indicator.benchmarkPercentile}%`
                    : indicator.benchmarkPercentile < 50
                    ? `Bottom ${indicator.benchmarkPercentile}%`
                    : `Top ${100 - indicator.benchmarkPercentile}%`;

                  // Generate comparison team positions using seeded random
                  const seededRandom = (seed: number) => {
                    const x = Math.sin(seed) * 10000;
                    return x - Math.floor(x);
                  };
                  const comparisonDots = Array.from({ length: 8 }, (_, i) => {
                    const random = seededRandom(i + indicator.benchmarkPercentile + indicatorIndex * 10);
                    return Math.max(5, Math.min(95, random * 100));
                  });

                  return (
                    <div key={indicator.id} style={styles.indicatorCard}>
                      {/* Header with number and status */}
                      <div style={styles.indicatorHeader}>
                        <div style={styles.indicatorTitleSection}>
                          <div style={styles.indicatorTitleRow}>
                            <span style={styles.indicatorNumber}>{categoryIndex}.{indicatorIndex + 1}</span>
                            <span style={styles.indicatorName}>{indicator.name}</span>
                          </div>
                          {reportOptions.includeDescriptions && (
                            <p style={styles.indicatorDescription}>{indicator.description}</p>
                          )}
                        </div>
                        <div style={{
                          ...styles.indicatorStatusBadge,
                          backgroundColor: statusBg,
                          color: statusColor,
                        }}>
                          <span style={{
                            ...styles.indicatorStatusDot,
                            backgroundColor: statusColor,
                          }} />
                          {statusText}
                        </div>
                      </div>

                      {/* Two column layout: Values + Spectrum */}
                      <div style={styles.indicatorContent}>
                        {/* Left: Key metrics */}
                        <div style={styles.indicatorMetrics}>
                          <div style={styles.metricRow}>
                            <span style={styles.metricLabel}>Your Value</span>
                            <span style={styles.metricValue}>{indicator.displayValue}</span>
                          </div>
                          <div style={styles.metricRow}>
                            <span style={styles.metricLabel}>Benchmark</span>
                            <span style={styles.metricValue}>{indicator.benchmarkDisplayValue}</span>
                          </div>
                          <div style={styles.metricRow}>
                            <span style={styles.metricLabel}>Trend</span>
                            <TrendIndicator direction={indicator.trend} showLabel size="small" />
                          </div>
                        </div>

                        {/* Right: Percentile Spectrum */}
                        <div style={styles.indicatorSpectrumSection}>
                          <span style={styles.spectrumLabel}>Where you stand</span>
                          <div style={styles.miniSpectrum}>
                            <div style={styles.miniSpectrumBar}>
                              <div style={styles.miniSpectrumGood} />
                              <div style={styles.miniSpectrumMid} />
                              <div style={styles.miniSpectrumBad} />
                              {/* Comparison team dots */}
                              {comparisonDots.map((pos, i) => {
                                const teamNames = ['Platform', 'Mobile', 'Core API', 'DevOps', 'Frontend', 'Data Eng', 'Security', 'Growth'];
                                return (
                                  <div
                                    key={i}
                                    style={{
                                      ...styles.comparisonTeamDot,
                                      left: `${pos}%`,
                                    }}
                                    onMouseEnter={(e) => showTooltip(e, `${teamNames[i]}: ${Math.round(pos)}%`)}
                                    onMouseLeave={hideTooltip}
                                  />
                                );
                              })}
                              {/* Your position marker */}
                              <div
                                style={{
                                  ...styles.miniSpectrumMarker,
                                  left: `${100 - indicator.benchmarkPercentile}%`,
                                }}
                                onMouseEnter={(e) => showTooltip(e, `Your team: ${100 - indicator.benchmarkPercentile}%`)}
                                onMouseLeave={hideTooltip}
                              >
                                <div style={styles.miniSpectrumPin} />
                              </div>
                            </div>
                            <div style={styles.miniSpectrumLabels}>
                              <span>Better</span>
                              <span>Avg</span>
                              <span>Worse</span>
                            </div>
                          </div>
                          {/* Legend */}
                          <div style={styles.spectrumLegend}>
                            <span style={styles.legendItem}>
                              <span style={styles.legendYouDot} /> You
                            </span>
                            <span style={styles.legendItem}>
                              <span style={styles.legendOtherDot} /> Other teams
                            </span>
                          </div>
                          <div style={{
                            ...styles.percentileResult,
                            color: isFlagged ? '#BF2600' : '#006644',
                          }}>
                            {percentileText}
                          </div>
                        </div>
                      </div>

                      {/* Trend Chart - Full width */}
                      {reportOptions.includeTrends && (
                        <div style={styles.indicatorChart}>
                          <div style={styles.chartHeader}>
                            <span style={styles.chartTitle}>Trend Over Time</span>
                          </div>
                          <TrendChart
                            data={indicator.trendData}
                            height={220}
                            showBenchmark
                            valueLabel="Your Value"
                            benchmarkLabel="Comparison Avg"
                            fixedYAxis
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Methodology Explainer Modal */}
        {showMethodology && (
          <MethodologyExplainer onClose={() => setShowMethodology(false)} />
        )}
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
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 24px 20px',
    borderBottom: '1px solid #DFE1E6',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: 0,
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#42526E',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#5E6C84',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  // Volume Banner
  volumeBanner: {
    margin: '0 0 24px 0',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  volumeBannerMain: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #EBECF0',
    marginBottom: '16px',
  },
  volumeBannerEstimate: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  volumeBannerPercent: {
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1,
  },
  volumeBannerPercentLabel: {
    fontSize: '14px',
    color: '#5E6C84',
    marginTop: '4px',
  },
  volumeBannerSeverity: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  volumeBannerSeverityLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  volumeBannerSeverityBadge: {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  volumeBannerSeverityDesc: {
    fontSize: '12px',
    color: '#5E6C84',
    textAlign: 'right',
    maxWidth: '200px',
  },
  volumeBannerConfidence: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  confidenceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  confidenceValue: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  confidenceMeter: {
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  confidenceMeterFill: {
    height: '100%',
    backgroundColor: '#0052CC',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  confidenceNote: {
    fontSize: '11px',
    color: '#6B778C',
  },
  // CHS Breakdown Styles
  chsBreakdown: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  chsBreakdownHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '12px',
  },
  chsBreakdownTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  chsBreakdownSubtitle: {
    fontSize: '11px',
    color: '#6B778C',
  },
  chsFormulaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  chsComponent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #DFE1E6',
    minWidth: '70px',
  },
  chsComponentLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chsComponentValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1.2,
  },
  chsComponentWeight: {
    fontSize: '10px',
    color: '#6B778C',
  },
  chsOperator: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#6B778C',
  },
  chsResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    borderRadius: '6px',
    minWidth: '70px',
  },
  chsResultValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  chsNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFFAE6',
    borderRadius: '4px',
    border: '1px solid #FFE380',
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
    marginBottom: '12px',
  },
  chsNoteIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  // Precision Indicator Styles
  chsPrecisionSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
    marginTop: '4px',
  },
  precisionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  precisionLabel: {
    fontSize: '12px',
    color: '#5E6C84',
    fontWeight: 500,
  },
  precisionBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  precisionMargin: {
    fontSize: '12px',
    color: '#5E6C84',
    fontWeight: 500,
  },
  precisionInfoButton: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '1px solid #6B778C',
    backgroundColor: 'transparent',
    color: '#6B778C',
    fontSize: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
  },
  precisionRange: {
    fontSize: '11px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  chsLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '11px',
    color: '#5E6C84',
  },
  chsLegendItem: {
    lineHeight: 1.4,
  },
  // Scale reference for Health Score Categories
  scaleReference: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
    marginTop: '16px',
  },
  scaleReferenceTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center' as const,
  },
  scaleReferenceBar: {
    display: 'flex',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  scaleRefSegment: {
    flex: 1,
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
  },
  intervalNote: {
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '4px',
  },
  dataQualityWarnings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #EBECF0',
  },
  warningFlag: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  warningIcon: {
    fontSize: '12px',
    flexShrink: 0,
  },
  modelProvenance: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #EBECF0',
  },
  modelProvenanceText: {
    fontSize: '11px',
    color: '#6B778C',
  },

  // Intro text
  introText: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.6,
  },

  // Category Cards Grid
  categoriesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    width: '100%',
  },
  categoryHeader: {
    display: 'flex',
    gap: '14px',
    marginBottom: '16px',
  },
  categoryNumberCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 600,
    flexShrink: 0,
  },
  categoryTitleSection: {
    flex: 1,
  },
  categoryTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  categorySubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  categoryStats: {
    display: 'flex',
    gap: '32px',
    marginBottom: '12px',
    paddingLeft: '46px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  flaggedDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  flaggedCount: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  miniProgressBar: {
    width: '60px',
    height: '6px',
    backgroundColor: '#DFE1E6',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: '3px',
  },
  viewIndicators: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    paddingLeft: '46px',
  },
  scoringNote: {
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
    padding: '14px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    borderLeft: '3px solid #0052CC',
  },
  methodologyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    padding: '8px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Old styles kept for compatibility
  indicatorTotal: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#6B778C',
  },
  indicatorCountLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  progressBarContainer: {
    marginBottom: '8px',
  },
  progressBarTrack: {
    height: '6px',
    backgroundColor: '#DFE1E6',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  flaggedExplanation: {
    fontSize: '10px',
    color: '#6B778C',
    lineHeight: 1.3,
  },

  // Detail View
  categoryRationale: {
    margin: '0 0 24px 0',
    padding: '20px 24px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    borderLeft: '4px solid #0052CC',
  },
  categoryRationaleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  categoryNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  categoryRationaleTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  categoryRationaleText: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.7,
  },
  indicatorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  indicatorCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
  },
  indicatorHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px',
  },
  indicatorTitleSection: {
    flex: 1,
  },
  indicatorTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '6px',
  },
  indicatorNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '24px',
    padding: '0 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    flexShrink: 0,
  },
  indicatorName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  indicatorDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  indicatorStatusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: '16px',
    flexShrink: 0,
  },
  indicatorStatusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  // Two column layout
  indicatorContent: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
  },
  indicatorMetrics: {
    flex: '0 0 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  // Spectrum section
  indicatorSpectrumSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  spectrumLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  miniSpectrum: {
    marginBottom: '8px',
  },
  miniSpectrumBar: {
    position: 'relative',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    overflow: 'visible',
  },
  miniSpectrumGood: {
    flex: 1,
    background: 'linear-gradient(90deg, #ABF5D1 0%, #E3FCEF 100%)',
    borderRadius: '8px 0 0 8px',
  },
  miniSpectrumMid: {
    flex: 1,
    background: 'linear-gradient(90deg, #FFE380 0%, #FFF0B3 100%)',
  },
  miniSpectrumBad: {
    flex: 1,
    background: 'linear-gradient(90deg, #FFBDAD 0%, #FF8F73 100%)',
    borderRadius: '0 8px 8px 0',
  },
  miniSpectrumMarker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    cursor: 'pointer',
  },
  miniSpectrumPin: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: '#172B4D',
    border: '2px solid #FFFFFF',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  comparisonTeamDot: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(66, 82, 110, 0.4)',
    border: '1.5px solid rgba(255, 255, 255, 0.9)',
    zIndex: 1,
    cursor: 'pointer',
  },
  miniSpectrumLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '6px',
    fontSize: '10px',
    color: '#6B778C',
  },
  spectrumLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#6B778C',
  },
  legendYouDot: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#172B4D',
    border: '2px solid #FFFFFF',
    boxShadow: '0 0 0 1px #DFE1E6',
  },
  legendOtherDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(66, 82, 110, 0.4)',
    border: '1px solid rgba(107, 119, 140, 0.3)',
  },
  percentileResult: {
    fontSize: '14px',
    fontWeight: 600,
    textAlign: 'center',
  },
  // Chart section
  indicatorChart: {
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  chartHeader: {
    marginBottom: '12px',
  },
  chartTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default CalculationModal;
