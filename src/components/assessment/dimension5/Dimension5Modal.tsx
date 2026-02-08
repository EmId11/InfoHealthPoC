import React, { useState } from 'react';
import { DimensionResult } from '../../../types/assessment';
import { Step6Data } from '../../../types/wizard';
import { getRiskLevelInfo } from '../../../constants/mockAssessmentData';
import TrendIndicator from '../common/TrendIndicator';
import TrendChart from '../common/TrendChart';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

interface Dimension5ModalProps {
  dimension: DimensionResult;
  reportOptions: Step6Data;
  onClose: () => void;
}

const Dimension5Modal: React.FC<Dimension5ModalProps> = ({
  dimension,
  reportOptions,
  onClose,
}) => {
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

  // Get all indicators directly from all categories
  const allIndicators = dimension.categories.flatMap(cat => cat.indicators);
  const totalIndicators = allIndicators.length;
  const flaggedIndicators = allIndicators.filter(ind => ind.benchmarkPercentile <= 25).length;

  const levelInfo = getRiskLevelInfo(dimension.riskLevel);

  return (
    <div style={styles.overlay} onClick={onClose}>
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
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div>
              <h2 style={styles.title}>How We Assess Issue Type Consistency</h2>
              <p style={styles.subtitle}>
                {flaggedIndicators} of {totalIndicators} indicators below benchmark
              </p>
            </div>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="medium" />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.volumeBanner}>
            <div style={styles.volumeBannerMain}>
              <div style={styles.volumeBannerEstimate}>
                <span style={{
                  ...styles.volumeBannerPercent,
                  color: levelInfo.color.text,
                }}>
                  {dimension.healthScore ?? Math.round(dimension.overallPercentile)}
                </span>
                <span style={styles.volumeBannerPercentLabel}>Health Score (50 = baseline)</span>
              </div>

              <div style={styles.volumeBannerSeverity}>
                <span style={styles.volumeBannerSeverityLabel}>Issue Type Consistency</span>
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

            <div style={styles.volumeBannerConfidence}>
              <div style={styles.confidenceRow}>
                <span style={styles.confidenceLabel}>Calculation Method</span>
                <span style={styles.confidenceValue}>Percentile Comparison</span>
              </div>
              <span style={styles.confidenceNote}>
                Based on {totalIndicators} indicators compared against similar teams in your organization
              </span>
            </div>
          </div>

          <div style={styles.rationale}>
            <p style={styles.rationaleText}>
              <strong>Issue type consistency</strong> measures how uniformly your team uses different issue types
              compared to established patterns. When teams use issue types inconsistently, it becomes difficult
              to compare metrics, track work accurately, and generate meaningful reports.
            </p>
          </div>

          <div style={styles.indicatorsList}>
            {allIndicators.map((indicator, indicatorIndex) => {
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
                  <div style={styles.indicatorHeader}>
                    <div style={styles.indicatorTitleSection}>
                      <div style={styles.indicatorTitleRow}>
                        <span style={styles.indicatorNumber}>{indicatorIndex + 1}</span>
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

                  <div style={styles.indicatorContent}>
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

                    <div style={styles.indicatorSpectrumSection}>
                      <span style={styles.spectrumLabel}>Where you stand</span>
                      <div style={styles.miniSpectrum}>
                        <div style={styles.miniSpectrumBar}>
                          <div style={styles.miniSpectrumGood} />
                          <div style={styles.miniSpectrumMid} />
                          <div style={styles.miniSpectrumBad} />
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

          <div style={styles.scoringNote}>
            <strong>How we calculate consistency:</strong> We compare your team's issue type usage patterns against
            similar teams. Indicators in the <strong>bottom 25th percentile</strong> are flagged as concerning.
            <button
              style={styles.methodologyLink}
              onClick={() => {}}
            >
              <QuestionCircleIcon label="" size="small" />
              <span>Learn more about our methodology</span>
            </button>
          </div>
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
  confidenceNote: {
    fontSize: '11px',
    color: '#6B778C',
  },
  rationale: {
    margin: '0 0 24px 0',
    padding: '16px 20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    borderLeft: '4px solid #0052CC',
  },
  rationaleText: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.6,
  },
  indicatorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
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
    minWidth: '28px',
    height: '24px',
    padding: '0 8px',
    backgroundColor: '#0052CC',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
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
};

export default Dimension5Modal;
