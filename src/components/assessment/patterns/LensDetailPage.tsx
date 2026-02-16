import React, { useState } from 'react';
import { AssessmentResult, IndicatorDrillDownState } from '../../../types/assessment';
import { LensType } from '../../../types/patterns';
import { WizardState } from '../../../types/wizard';
import { getIndicatorTier, INDICATOR_TIERS } from '../../../types/indicatorTiers';
import { getDimensionDescription } from '../../../constants/clusterDescriptions';
import { mockIntegrityDimensionResult, mockDimension6Result } from '../../../constants/mockAssessmentData';
import { DIMENSION_EXPLANATION } from '../../../constants/pageExplanations';
import NavigationBar from '../common/NavigationBar';
import TrendChart from '../common/TrendChart';
import Sparkline from '../common/Sparkline';
import HeroInfoButton from '../../common/HeroInfoButton';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';
import Dimension2Results from '../dimension2/Dimension2Results';
import IndicatorsTab from '../common/IndicatorsTab';
import PatternLensDetailView from './PatternLensDetailView';
import ComparisonGroupModal from '../common/ComparisonGroupModal';

const LENS_LABELS: Record<LensType, string> = {
  coverage: 'Field Completeness',
  integrity: 'Integrity',
  timing: 'Timing',
  behavioral: 'Behavioral',
};

interface LensDetailPageProps {
  lens: LensType;
  assessmentResult: AssessmentResult;
  wizardState: WizardState;
  onBack: () => void;
  onIndicatorDrillDown?: (state: IndicatorDrillDownState) => void;
  onCategoryDetail?: (categoryIndex: number) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
}

const LensDetailPage: React.FC<LensDetailPageProps> = ({
  lens,
  assessmentResult,
  wizardState,
  onBack,
  onIndicatorDrillDown,
  onCategoryDetail,
}) => {
  const TICKET_READINESS_INDEX = 1;

  // Comparison modal state
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonModalContext, setComparisonModalContext] = useState<{
    yourRank?: number;
    dimensionName?: string;
  }>({});

  // Tooltip state for spectrum
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, label: '', value: '',
  });

  // Score history modals
  const [showScoreHistory, setShowScoreHistory] = useState(false);
  const [showIntegrityScoreHistory, setShowIntegrityScoreHistory] = useState(false);
  const [showFreshnessScoreHistory, setShowFreshnessScoreHistory] = useState(false);

  const openComparisonModal = (dimensionIndex?: number) => {
    if (dimensionIndex !== undefined && assessmentResult.dimensions[dimensionIndex]) {
      const dimension = assessmentResult.dimensions[dimensionIndex];
      const score = dimension.healthScore ?? dimension.overallPercentile;
      const teamsAhead = Math.round((1 - score / 100) * assessmentResult.comparisonTeamCount);
      const yourRank = teamsAhead + 1;
      setComparisonModalContext({ yourRank, dimensionName: dimension.dimensionName });
    } else {
      setComparisonModalContext({});
    }
    setIsComparisonModalOpen(true);
  };

  const lensLabel = LENS_LABELS[lens];

  const renderCoverageDetail = () => {
    const dimension = assessmentResult.dimensions[TICKET_READINESS_INDEX];
    if (!dimension) return null;

    const dimDesc = getDimensionDescription(dimension.dimensionKey);
    const tier = getIndicatorTier(dimension.healthScore ?? dimension.overallPercentile);

    // Generate mock comparison team positions for spectrum
    const seed = dimension.dimensionKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const comparisonTeamPositions: number[] = [];
    for (let i = 0; i < assessmentResult.comparisonTeamCount; i++) {
      const pseudoRandom = Math.sin(seed * (i + 1) * 9999) * 10000;
      const normalized = (pseudoRandom - Math.floor(pseudoRandom));
      comparisonTeamPositions.push(Math.max(5, Math.min(95, normalized * 100)));
    }
    const yourPosition = dimension.healthScore ?? dimension.overallPercentile;

    return (
      <>
        <div style={{...styles.dimensionBlueBanner, background: tier.bgColor, borderColor: tier.borderColor}}>
          <div style={styles.heroCenterFlow}>
            {/* Title row with info button */}
            <div style={styles.heroTitleRow}>
              <span style={styles.heroSubtitle}>Health Score</span>
              <span style={styles.heroInfoInline}>
                <HeroInfoButton title={`About ${dimension.dimensionName}`}>
                  <div style={styles.infoModalBody}>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>What This Shows</h4>
                      <p style={styles.infoText}>
                        {dimDesc?.whatWeMeasure || DIMENSION_EXPLANATION.whatThisShows}
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Why It Matters</h4>
                      <p style={styles.infoText}>
                        {dimDesc?.whyItMatters || 'This dimension affects your overall Jira health and the reliability of your data for planning and decision-making.'}
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>What You Can Do</h4>
                      <p style={styles.infoText}>
                        {dimDesc?.whatYouCanDo || 'Review the indicators below to identify specific areas for improvement.'}
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Key Metrics</h4>
                      <ul style={styles.infoList}>
                        <li><strong>Score:</strong> {DIMENSION_EXPLANATION.keyMetrics.score}</li>
                        <li><strong>Rating:</strong> {DIMENSION_EXPLANATION.keyMetrics.rating}</li>
                        <li><strong>Trend:</strong> {DIMENSION_EXPLANATION.keyMetrics.trend}</li>
                      </ul>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Health Categories</h4>
                      <p style={styles.infoText}>
                        Your score maps to one of five health categories.
                      </p>
                      <div style={styles.healthCategoriesList}>
                        {[...INDICATOR_TIERS].reverse().map(t => (
                          <div key={t.level} style={styles.healthCategoryRow}>
                            <div style={styles.healthCategoryHeader}>
                              <span style={{...styles.healthCategoryName, color: t.color}}>{t.name}</span>
                              <span style={styles.healthCategoryRange}>{t.minPercentile}–{t.maxPercentile}</span>
                            </div>
                            <p style={styles.healthCategoryDesc}>{t.detailedDescription}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </HeroInfoButton>
              </span>
            </div>

            {/* Giant score */}
            {(() => {
              let overallTrend: 'up' | 'down' | 'stable' = 'stable';
              if (dimension.trendData && dimension.trendData.length >= 2) {
                const firstHealthScore = dimension.trendData[0].healthScore ?? dimension.trendData[0].value;
                const lastHealthScore = dimension.trendData[dimension.trendData.length - 1].healthScore ?? dimension.healthScore;
                const firstTier = getIndicatorTier(firstHealthScore).level;
                const lastTier = getIndicatorTier(lastHealthScore).level;
                if (lastTier > firstTier) overallTrend = 'up';
                else if (lastTier < firstTier) overallTrend = 'down';
              }
              const healthScore = dimension.healthScore ?? Math.round(dimension.overallPercentile);
              const trendLabel = overallTrend === 'up' ? 'Improving' : overallTrend === 'down' ? 'Declining' : 'Stable';
              const trendColor = overallTrend === 'up' ? '#36B37E' : overallTrend === 'down' ? '#DE350B' : '#6B778C';
              const trendArrowPath = overallTrend === 'up'
                ? 'M3,10 L7,3 L11,10 L9,10 L9,12 L5,12 L5,10 Z'
                : 'M3,5 L7,12 L11,5 L9,5 L9,3 L5,3 L5,5 Z';

              const sparkTrend = overallTrend === 'up' ? 'improving' as const : overallTrend === 'down' ? 'declining' as const : 'stable' as const;
              const hasTrendData = dimension.trendData && dimension.trendData.length >= 2;

              return (
                <>
                  <div style={styles.heroScoreBlock}>
                    <span style={{...styles.heroBigNumber, color: tier.color}}>{healthScore}</span>
                    <span style={styles.heroBigDenom}>/100</span>
                  </div>

                  {/* Category + trend + sparkline as unified chip */}
                  <button
                    style={{
                      ...styles.heroStatusChip,
                      backgroundColor: `${tier.color}18`,
                      border: `1.5px solid ${tier.color}40`,
                      cursor: hasTrendData ? 'pointer' : 'default',
                    }}
                    onClick={hasTrendData ? () => setShowScoreHistory(true) : undefined}
                    title={hasTrendData ? 'View score history' : undefined}
                  >
                    <span style={{...styles.heroStatusDot, backgroundColor: tier.color}} />
                    <span style={{...styles.heroStatusTier, color: tier.color}}>{tier.name}</span>
                    <span style={styles.heroStatusDivider} />
                    {overallTrend === 'stable' ? (
                      <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                        <MediaServicesActualSizeIcon label="" size="small" primaryColor={trendColor} />
                      </span>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                        <path d={trendArrowPath} fill={trendColor} />
                      </svg>
                    )}
                    <span style={{...styles.heroStatusTrend, color: trendColor}}>
                      {trendLabel}
                    </span>
                    {hasTrendData && (
                      <>
                        <span style={styles.heroStatusDivider} />
                        <span style={styles.heroSparklineWrap}>
                          <Sparkline
                            data={dimension.trendData!}
                            trend={sparkTrend}
                            width={56}
                            height={20}
                          />
                        </span>
                      </>
                    )}
                  </button>

                  {/* Score history modal */}
                  {showScoreHistory && dimension.trendData && dimension.trendData.length >= 2 && (
                    <div style={styles.scoreHistoryOverlay} onClick={() => setShowScoreHistory(false)}>
                      <div style={styles.scoreHistoryModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.scoreHistoryHeader}>
                          <h3 style={styles.scoreHistoryTitle}>Score History</h3>
                          <button onClick={() => setShowScoreHistory(false)} style={styles.scoreHistoryClose}>{'\u2715'}</button>
                        </div>
                        <div style={styles.scoreHistoryBody}>
                          <TrendChart
                            data={dimension.trendData}
                            height={280}
                            dimensionName="Ticket Readiness"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Description */}
            <p style={styles.heroDescription}>
              {dimDesc?.summary || `Analysis of ${dimension.dimensionName} across your team's Jira data.`}
            </p>

            {/* Inline peer comparison spectrum */}
            {assessmentResult.comparisonTeamCount > 0 && (
              <div style={styles.inlineSpectrumContainer}>
                <div style={styles.inlineSpectrumHeader}>
                  <span style={styles.inlineSpectrumTitle}>Peer Comparison</span>
                  <button
                    style={styles.inlineSpectrumLink}
                    onClick={() => openComparisonModal(TICKET_READINESS_INDEX)}
                  >
                    vs {assessmentResult.comparisonTeamCount} similar teams &rarr;
                  </button>
                </div>
                {(() => {
                  const sortedPositions = [...comparisonTeamPositions].sort((a, b) => a - b);
                  const peerMin = sortedPositions[0] ?? 0;
                  const peerMax = sortedPositions[sortedPositions.length - 1] ?? 100;
                  const peerMedian = sortedPositions.length > 0
                    ? sortedPositions[Math.floor(sortedPositions.length / 2)]
                    : 50;
                  return (
                    <div style={styles.inlineSpectrumBar}>
                      <div style={styles.inlineSpectrumTrack} />
                      <span style={styles.inlineSpectrumMin}>0</span>
                      <span style={styles.inlineSpectrumMax}>100</span>
                      <div
                        style={{
                          ...styles.inlinePeerRangeBand,
                          left: `${peerMin}%`,
                          width: `${peerMax - peerMin}%`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            visible: true,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: `${assessmentResult.comparisonTeamCount} teams`,
                            value: `Range: ${Math.round(peerMin)}\u2013${Math.round(peerMax)} \u00B7 Median: ${Math.round(peerMedian)}`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                      />
                      <div
                        style={{
                          ...styles.inlinePeerMedianTick,
                          left: `${peerMedian}%`,
                        }}
                      />
                      <div
                        style={{
                          ...styles.inlineYourTeamMarker,
                          left: `${yourPosition}%`,
                          backgroundColor: tier.color,
                          boxShadow: `0 0 0 3px ${tier.color}40`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            visible: true,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: 'Your Team',
                            value: `Score: ${dimension.healthScore ?? Math.round(dimension.overallPercentile)}`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tooltip */}
            {tooltip.visible && (
              <div style={{
                ...styles.tooltip,
                left: tooltip.x,
                top: tooltip.y - 8,
              }}>
                <div style={styles.tooltipLabel}>{tooltip.label}</div>
                <div style={styles.tooltipValue}>{tooltip.value}</div>
                <div style={styles.tooltipArrow} />
              </div>
            )}

          </div>
        </div>

        {/* Ticket Readiness Dimension Detail */}
        <div style={styles.dimensionContentSection}>
          <Dimension2Results
            dimension={assessmentResult.dimensions[TICKET_READINESS_INDEX]}
            reportOptions={wizardState.step6}
            teamId={assessmentResult.teamId}
            dateRange={assessmentResult.dateRange}
            similarTeamsCount={assessmentResult.comparisonTeamCount}
            comparisonTeamNames={assessmentResult.comparisonTeams.map(t => t.name)}
            onViewSimilarTeams={() => openComparisonModal(TICKET_READINESS_INDEX)}
            dimensionIndex={TICKET_READINESS_INDEX}
            onIndicatorDrillDown={onIndicatorDrillDown}
          />
        </div>
      </>
    );
  };

  const renderIntegrityDetail = () => {
    const dimension = mockIntegrityDimensionResult;
    const integrityTier = getIndicatorTier(dimension.healthScore);

    // Generate mock comparison team positions
    const intSeed = dimension.dimensionKey.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const intComparisonPositions: number[] = [];
    for (let i = 0; i < assessmentResult.comparisonTeamCount; i++) {
      const pseudoRandom = Math.sin(intSeed * (i + 1) * 9999) * 10000;
      const normalized = (pseudoRandom - Math.floor(pseudoRandom));
      intComparisonPositions.push(Math.max(5, Math.min(95, normalized * 100)));
    }
    const intYourPosition = dimension.healthScore;

    return (
      <>
        <div style={{...styles.dimensionBlueBanner, background: integrityTier.bgColor, borderColor: integrityTier.borderColor}}>
          <div style={styles.heroCenterFlow}>
            {/* Title row with info button */}
            <div style={styles.heroTitleRow}>
              <span style={styles.heroSubtitle}>Health Score</span>
              <span style={styles.heroInfoInline}>
                <HeroInfoButton title={`About ${dimension.dimensionName}`}>
                  <div style={styles.infoModalBody}>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>What This Shows</h4>
                      <p style={styles.infoText}>
                        We check whether field values are meaningful (not placeholders or defaults), consistent across related fields, and still accurate over time.
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Why It Matters</h4>
                      <p style={styles.infoText}>
                        Populated fields that lack real information create a false sense of data quality. Decisions made on hollow data are no better than guesses.
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>What You Can Do</h4>
                      <p style={styles.infoText}>
                        Audit placeholder content, review default value usage, calibrate estimation practices, and establish regular data hygiene reviews.
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Key Metrics</h4>
                      <ul style={styles.infoList}>
                        <li><strong>Score:</strong> {DIMENSION_EXPLANATION.keyMetrics.score}</li>
                        <li><strong>Rating:</strong> {DIMENSION_EXPLANATION.keyMetrics.rating}</li>
                        <li><strong>Trend:</strong> {DIMENSION_EXPLANATION.keyMetrics.trend}</li>
                      </ul>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Health Categories</h4>
                      <p style={styles.infoText}>
                        Your score maps to one of five health categories.
                      </p>
                      <div style={styles.healthCategoriesList}>
                        {[...INDICATOR_TIERS].reverse().map(t => (
                          <div key={t.level} style={styles.healthCategoryRow}>
                            <div style={styles.healthCategoryHeader}>
                              <span style={{...styles.healthCategoryName, color: t.color}}>{t.name}</span>
                              <span style={styles.healthCategoryRange}>{t.minPercentile}–{t.maxPercentile}</span>
                            </div>
                            <p style={styles.healthCategoryDesc}>{t.detailedDescription}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </HeroInfoButton>
              </span>
            </div>

            {/* Giant score */}
            {(() => {
              let intOverallTrend: 'up' | 'down' | 'stable' = 'stable';
              if (dimension.trendData && dimension.trendData.length >= 2) {
                const firstHS = dimension.trendData[0].healthScore ?? dimension.trendData[0].value;
                const lastHS = dimension.trendData[dimension.trendData.length - 1].healthScore ?? dimension.healthScore;
                const firstT = getIndicatorTier(firstHS).level;
                const lastT = getIndicatorTier(lastHS).level;
                if (lastT > firstT) intOverallTrend = 'up';
                else if (lastT < firstT) intOverallTrend = 'down';
              }
              const healthScore = dimension.healthScore;
              const trendLabel = intOverallTrend === 'up' ? 'Improving' : intOverallTrend === 'down' ? 'Declining' : 'Stable';
              const trendColor = intOverallTrend === 'up' ? '#36B37E' : intOverallTrend === 'down' ? '#DE350B' : '#6B778C';
              const trendArrowPath = intOverallTrend === 'up'
                ? 'M3,10 L7,3 L11,10 L9,10 L9,12 L5,12 L5,10 Z'
                : 'M3,5 L7,12 L11,5 L9,5 L9,3 L5,3 L5,5 Z';
              const sparkTrend = intOverallTrend === 'up' ? 'improving' as const : intOverallTrend === 'down' ? 'declining' as const : 'stable' as const;
              const hasTrendData = dimension.trendData && dimension.trendData.length >= 2;

              return (
                <>
                  <div style={styles.heroScoreBlock}>
                    <span style={{...styles.heroBigNumber, color: integrityTier.color}}>{healthScore}</span>
                    <span style={styles.heroBigDenom}>/100</span>
                  </div>

                  <button
                    style={{
                      ...styles.heroStatusChip,
                      backgroundColor: `${integrityTier.color}18`,
                      border: `1.5px solid ${integrityTier.color}40`,
                      cursor: hasTrendData ? 'pointer' : 'default',
                    }}
                    onClick={hasTrendData ? () => setShowIntegrityScoreHistory(true) : undefined}
                    title={hasTrendData ? 'View score history' : undefined}
                  >
                    <span style={{...styles.heroStatusDot, backgroundColor: integrityTier.color}} />
                    <span style={{...styles.heroStatusTier, color: integrityTier.color}}>{integrityTier.name}</span>
                    <span style={styles.heroStatusDivider} />
                    {intOverallTrend === 'stable' ? (
                      <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                        <MediaServicesActualSizeIcon label="" size="small" primaryColor={trendColor} />
                      </span>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                        <path d={trendArrowPath} fill={trendColor} />
                      </svg>
                    )}
                    <span style={{...styles.heroStatusTrend, color: trendColor}}>
                      {trendLabel}
                    </span>
                    {hasTrendData && (
                      <>
                        <span style={styles.heroStatusDivider} />
                        <span style={styles.heroSparklineWrap}>
                          <Sparkline
                            data={dimension.trendData!}
                            trend={sparkTrend}
                            width={56}
                            height={20}
                          />
                        </span>
                      </>
                    )}
                  </button>

                  {/* Score history modal */}
                  {showIntegrityScoreHistory && dimension.trendData && dimension.trendData.length >= 2 && (
                    <div style={styles.scoreHistoryOverlay} onClick={() => setShowIntegrityScoreHistory(false)}>
                      <div style={styles.scoreHistoryModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.scoreHistoryHeader}>
                          <h3 style={styles.scoreHistoryTitle}>Score History</h3>
                          <button onClick={() => setShowIntegrityScoreHistory(false)} style={styles.scoreHistoryClose}>{'\u2715'}</button>
                        </div>
                        <div style={styles.scoreHistoryBody}>
                          <TrendChart
                            data={dimension.trendData}
                            height={280}
                            dimensionName="Data Integrity"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Description */}
            <p style={styles.heroDescription}>
              {dimension.verdictDescription}
            </p>

            {/* Inline peer comparison spectrum */}
            {assessmentResult.comparisonTeamCount > 0 && (
              <div style={styles.inlineSpectrumContainer}>
                <div style={styles.inlineSpectrumHeader}>
                  <span style={styles.inlineSpectrumTitle}>Peer Comparison</span>
                  <button
                    style={styles.inlineSpectrumLink}
                    onClick={() => {
                      setComparisonModalContext({
                        yourRank: Math.round((1 - dimension.healthScore / 100) * assessmentResult.comparisonTeamCount) + 1,
                        dimensionName: dimension.dimensionName,
                      });
                      setIsComparisonModalOpen(true);
                    }}
                  >
                    vs {assessmentResult.comparisonTeamCount} similar teams &rarr;
                  </button>
                </div>
                {(() => {
                  const sortedPositions = [...intComparisonPositions].sort((a, b) => a - b);
                  const peerMin = sortedPositions[0] ?? 0;
                  const peerMax = sortedPositions[sortedPositions.length - 1] ?? 100;
                  const peerMedian = sortedPositions.length > 0
                    ? sortedPositions[Math.floor(sortedPositions.length / 2)]
                    : 50;
                  return (
                    <div style={styles.inlineSpectrumBar}>
                      <div style={styles.inlineSpectrumTrack} />
                      <span style={styles.inlineSpectrumMin}>0</span>
                      <span style={styles.inlineSpectrumMax}>100</span>
                      <div
                        style={{
                          ...styles.inlinePeerRangeBand,
                          left: `${peerMin}%`,
                          width: `${peerMax - peerMin}%`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            visible: true,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: `${assessmentResult.comparisonTeamCount} teams`,
                            value: `Range: ${Math.round(peerMin)}\u2013${Math.round(peerMax)} \u00B7 Median: ${Math.round(peerMedian)}`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                      />
                      <div
                        style={{
                          ...styles.inlinePeerMedianTick,
                          left: `${peerMedian}%`,
                        }}
                      />
                      <div
                        style={{
                          ...styles.inlineYourTeamMarker,
                          left: `${intYourPosition}%`,
                          backgroundColor: integrityTier.color,
                          boxShadow: `0 0 0 3px ${integrityTier.color}40`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            visible: true,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: 'Your Team',
                            value: `Score: ${dimension.healthScore}`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tooltip */}
            {tooltip.visible && (
              <div style={{
                ...styles.tooltip,
                left: tooltip.x,
                top: tooltip.y - 8,
              }}>
                <div style={styles.tooltipLabel}>{tooltip.label}</div>
                <div style={styles.tooltipValue}>{tooltip.value}</div>
                <div style={styles.tooltipArrow} />
              </div>
            )}

          </div>
        </div>

        {/* Indicators */}
        <div style={styles.dimensionContentSection}>
          <IndicatorsTab
            dimension={mockIntegrityDimensionResult}
            dimensionIndex={0}
            onIndicatorDrillDown={onIndicatorDrillDown}
            comparisonTeamCount={assessmentResult.comparisonTeamCount}
            comparisonTeamNames={assessmentResult.comparisonTeams.map(t => t.name)}
          />
        </div>
      </>
    );
  };

  const renderFreshnessDetail = () => {
    const dimension = mockDimension6Result;
    const freshnessTier = getIndicatorTier(dimension.healthScore ?? dimension.overallPercentile);

    // Generate mock comparison team positions
    const freshSeed = dimension.dimensionKey.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const freshComparisonPositions: number[] = [];
    for (let i = 0; i < assessmentResult.comparisonTeamCount; i++) {
      const pseudoRandom = Math.sin(freshSeed * (i + 1) * 9999) * 10000;
      const normalized = (pseudoRandom - Math.floor(pseudoRandom));
      freshComparisonPositions.push(Math.max(5, Math.min(95, normalized * 100)));
    }
    const freshYourPosition = dimension.healthScore ?? dimension.overallPercentile;

    return (
      <>
        <div style={{...styles.dimensionBlueBanner, background: freshnessTier.bgColor, borderColor: freshnessTier.borderColor}}>
          <div style={styles.heroCenterFlow}>
            {/* Title row with info button */}
            <div style={styles.heroTitleRow}>
              <span style={styles.heroSubtitle}>Health Score</span>
              <span style={styles.heroInfoInline}>
                <HeroInfoButton title={`About ${dimension.dimensionName}`}>
                  <div style={styles.infoModalBody}>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>What This Shows</h4>
                      <p style={styles.infoText}>
                        We identify stale items, look for bulk updates that suggest catch-up sessions, and check whether parent-child relationships stay in sync.
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Why It Matters</h4>
                      <p style={styles.infoText}>
                        Stale data leads to bad decisions. If Jira does not reflect reality, standups become status-gathering sessions, and managers make plans based on outdated information.
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>What You Can Do</h4>
                      <p style={styles.infoText}>
                        Encourage real-time updates as part of the workflow. Consider automation that prompts updates when items have been unchanged too long.
                      </p>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Key Metrics</h4>
                      <ul style={styles.infoList}>
                        <li><strong>Score:</strong> {DIMENSION_EXPLANATION.keyMetrics.score}</li>
                        <li><strong>Rating:</strong> {DIMENSION_EXPLANATION.keyMetrics.rating}</li>
                        <li><strong>Trend:</strong> {DIMENSION_EXPLANATION.keyMetrics.trend}</li>
                      </ul>
                    </div>
                    <div style={styles.infoSection}>
                      <h4 style={styles.infoSectionTitle}>Health Categories</h4>
                      <p style={styles.infoText}>
                        Your score maps to one of five health categories.
                      </p>
                      <div style={styles.healthCategoriesList}>
                        {[...INDICATOR_TIERS].reverse().map(t => (
                          <div key={t.level} style={styles.healthCategoryRow}>
                            <div style={styles.healthCategoryHeader}>
                              <span style={{...styles.healthCategoryName, color: t.color}}>{t.name}</span>
                              <span style={styles.healthCategoryRange}>{t.minPercentile}–{t.maxPercentile}</span>
                            </div>
                            <p style={styles.healthCategoryDesc}>{t.detailedDescription}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </HeroInfoButton>
              </span>
            </div>

            {/* Giant score */}
            {(() => {
              let freshOverallTrend: 'up' | 'down' | 'stable' = 'stable';
              if (dimension.trendData && dimension.trendData.length >= 2) {
                const firstHS = dimension.trendData[0].healthScore ?? dimension.trendData[0].value;
                const lastHS = dimension.trendData[dimension.trendData.length - 1].healthScore ?? (dimension.healthScore ?? dimension.overallPercentile);
                const firstT = getIndicatorTier(firstHS).level;
                const lastT = getIndicatorTier(lastHS).level;
                if (lastT > firstT) freshOverallTrend = 'up';
                else if (lastT < firstT) freshOverallTrend = 'down';
              }
              const healthScore = dimension.healthScore ?? Math.round(dimension.overallPercentile);
              const trendLabel = freshOverallTrend === 'up' ? 'Improving' : freshOverallTrend === 'down' ? 'Declining' : 'Stable';
              const trendColor = freshOverallTrend === 'up' ? '#36B37E' : freshOverallTrend === 'down' ? '#DE350B' : '#6B778C';
              const trendArrowPath = freshOverallTrend === 'up'
                ? 'M3,10 L7,3 L11,10 L9,10 L9,12 L5,12 L5,10 Z'
                : 'M3,5 L7,12 L11,5 L9,5 L9,3 L5,3 L5,5 Z';
              const sparkTrend = freshOverallTrend === 'up' ? 'improving' as const : freshOverallTrend === 'down' ? 'declining' as const : 'stable' as const;
              const hasTrendData = dimension.trendData && dimension.trendData.length >= 2;

              return (
                <>
                  <div style={styles.heroScoreBlock}>
                    <span style={{...styles.heroBigNumber, color: freshnessTier.color}}>{healthScore}</span>
                    <span style={styles.heroBigDenom}>/100</span>
                  </div>

                  <button
                    style={{
                      ...styles.heroStatusChip,
                      backgroundColor: `${freshnessTier.color}18`,
                      border: `1.5px solid ${freshnessTier.color}40`,
                      cursor: hasTrendData ? 'pointer' : 'default',
                    }}
                    onClick={hasTrendData ? () => setShowFreshnessScoreHistory(true) : undefined}
                    title={hasTrendData ? 'View score history' : undefined}
                  >
                    <span style={{...styles.heroStatusDot, backgroundColor: freshnessTier.color}} />
                    <span style={{...styles.heroStatusTier, color: freshnessTier.color}}>{freshnessTier.name}</span>
                    <span style={styles.heroStatusDivider} />
                    {freshOverallTrend === 'stable' ? (
                      <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                        <MediaServicesActualSizeIcon label="" size="small" primaryColor={trendColor} />
                      </span>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                        <path d={trendArrowPath} fill={trendColor} />
                      </svg>
                    )}
                    <span style={{...styles.heroStatusTrend, color: trendColor}}>
                      {trendLabel}
                    </span>
                    {hasTrendData && (
                      <>
                        <span style={styles.heroStatusDivider} />
                        <span style={styles.heroSparklineWrap}>
                          <Sparkline
                            data={dimension.trendData!}
                            trend={sparkTrend}
                            width={56}
                            height={20}
                          />
                        </span>
                      </>
                    )}
                  </button>

                  {/* Score history modal */}
                  {showFreshnessScoreHistory && dimension.trendData && dimension.trendData.length >= 2 && (
                    <div style={styles.scoreHistoryOverlay} onClick={() => setShowFreshnessScoreHistory(false)}>
                      <div style={styles.scoreHistoryModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.scoreHistoryHeader}>
                          <h3 style={styles.scoreHistoryTitle}>Score History</h3>
                          <button onClick={() => setShowFreshnessScoreHistory(false)} style={styles.scoreHistoryClose}>{'\u2715'}</button>
                        </div>
                        <div style={styles.scoreHistoryBody}>
                          <TrendChart
                            data={dimension.trendData}
                            height={280}
                            dimensionName="Data Freshness"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Description */}
            <p style={styles.heroDescription}>
              {dimension.verdictDescription}
            </p>

            {/* Inline peer comparison spectrum */}
            {assessmentResult.comparisonTeamCount > 0 && (
              <div style={styles.inlineSpectrumContainer}>
                <div style={styles.inlineSpectrumHeader}>
                  <span style={styles.inlineSpectrumTitle}>Peer Comparison</span>
                  <button
                    style={styles.inlineSpectrumLink}
                    onClick={() => {
                      setComparisonModalContext({
                        yourRank: Math.round((1 - freshYourPosition / 100) * assessmentResult.comparisonTeamCount) + 1,
                        dimensionName: dimension.dimensionName,
                      });
                      setIsComparisonModalOpen(true);
                    }}
                  >
                    vs {assessmentResult.comparisonTeamCount} similar teams &rarr;
                  </button>
                </div>
                {(() => {
                  const sortedPositions = [...freshComparisonPositions].sort((a, b) => a - b);
                  const peerMin = sortedPositions[0] ?? 0;
                  const peerMax = sortedPositions[sortedPositions.length - 1] ?? 100;
                  const peerMedian = sortedPositions.length > 0
                    ? sortedPositions[Math.floor(sortedPositions.length / 2)]
                    : 50;
                  return (
                    <div style={styles.inlineSpectrumBar}>
                      <div style={styles.inlineSpectrumTrack} />
                      <span style={styles.inlineSpectrumMin}>0</span>
                      <span style={styles.inlineSpectrumMax}>100</span>
                      <div
                        style={{
                          ...styles.inlinePeerRangeBand,
                          left: `${peerMin}%`,
                          width: `${peerMax - peerMin}%`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            visible: true,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: `${assessmentResult.comparisonTeamCount} teams`,
                            value: `Range: ${Math.round(peerMin)}\u2013${Math.round(peerMax)} \u00B7 Median: ${Math.round(peerMedian)}`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                      />
                      <div
                        style={{
                          ...styles.inlinePeerMedianTick,
                          left: `${peerMedian}%`,
                        }}
                      />
                      <div
                        style={{
                          ...styles.inlineYourTeamMarker,
                          left: `${freshYourPosition}%`,
                          backgroundColor: freshnessTier.color,
                          boxShadow: `0 0 0 3px ${freshnessTier.color}40`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            visible: true,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: 'Your Team',
                            value: `Score: ${dimension.healthScore ?? Math.round(dimension.overallPercentile)}`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tooltip */}
            {tooltip.visible && (
              <div style={{
                ...styles.tooltip,
                left: tooltip.x,
                top: tooltip.y - 8,
              }}>
                <div style={styles.tooltipLabel}>{tooltip.label}</div>
                <div style={styles.tooltipValue}>{tooltip.value}</div>
                <div style={styles.tooltipArrow} />
              </div>
            )}

          </div>
        </div>

        {/* Indicators */}
        <div style={styles.dimensionContentSection}>
          <IndicatorsTab
            dimension={mockDimension6Result}
            dimensionIndex={0}
            onIndicatorDrillDown={onIndicatorDrillDown}
            comparisonTeamCount={assessmentResult.comparisonTeamCount}
            comparisonTeamNames={assessmentResult.comparisonTeams.map(t => t.name)}
          />
        </div>
      </>
    );
  };

  const renderLensContent = () => {
    switch (lens) {
      case 'coverage':
        return renderCoverageDetail();
      case 'integrity':
        return renderIntegrityDetail();
      case 'timing':
        return assessmentResult.lensResults ? (
          <PatternLensDetailView lensResult={assessmentResult.lensResults.timing} />
        ) : null;
      case 'behavioral':
        return renderFreshnessDetail();
      default:
        return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageContent}>
        <NavigationBar
          backLabel="Back to Assessment"
          onBack={onBack}
          breadcrumbItems={['Assessment', lensLabel]}
        />
        {renderLensContent()}
      </div>

      {/* Comparison Group Modal */}
      <ComparisonGroupModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        teams={assessmentResult.comparisonTeams}
        criteria={assessmentResult.comparisonCriteria}
        teamCount={assessmentResult.comparisonTeamCount}
        yourRank={comparisonModalContext.yourRank}
        dimensionName={comparisonModalContext.dimensionName}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#F4F5F7',
  },
  pageContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  // Hero Banner
  dimensionBlueBanner: {
    background: '#FFFFFF',
    padding: '36px 48px 40px',
    borderRadius: '16px',
    marginBottom: '24px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    border: '1px solid #E2E8F0',
  },
  heroCenterFlow: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  heroTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  heroSubtitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  heroInfoInline: {
    display: 'inline',
  },
  heroScoreBlock: {
    display: 'flex',
    alignItems: 'baseline',
  },
  heroBigNumber: {
    fontSize: '96px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-4px',
  },
  heroBigDenom: {
    fontSize: '28px',
    fontWeight: 500,
    color: '#97A0AF',
    marginLeft: '4px',
    alignSelf: 'baseline',
  },
  heroStatusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    marginTop: '12px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'filter 0.15s ease',
  } as React.CSSProperties,
  heroStatusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  heroStatusTier: {
    fontSize: '13px',
    fontWeight: 700,
  },
  heroStatusDivider: {
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(9, 30, 66, 0.15)',
  },
  heroStatusTrend: {
    fontSize: '13px',
    fontWeight: 600,
  },
  heroSparklineWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    opacity: 0.8,
  } as React.CSSProperties,
  heroDescription: {
    margin: '16px 0 0',
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.5,
    maxWidth: '440px',
  },
  dimensionContentSection: {
    marginBottom: '32px',
  },
  // Score history modal
  scoreHistoryOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  scoreHistoryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '640px',
    width: '90%',
    overflow: 'hidden',
  },
  scoreHistoryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E4E6EB',
  },
  scoreHistoryTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  scoreHistoryClose: {
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
    fontSize: '16px',
    color: '#6B778C',
    outline: 'none',
  },
  scoreHistoryBody: {
    padding: '24px',
  },
  // Inline spectrum styles
  inlineSpectrumContainer: {
    marginTop: '24px',
    padding: '16px 24px',
    backgroundColor: 'rgba(9, 30, 66, 0.03)',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '480px',
  } as React.CSSProperties,
  inlineSpectrumHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  } as React.CSSProperties,
  inlineSpectrumTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  inlineSpectrumLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  inlineSpectrumBar: {
    position: 'relative' as const,
    height: '24px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  inlineSpectrumTrack: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: '6px',
    borderRadius: '3px',
    background: 'linear-gradient(to right, #DE350B 0%, #DE350B 30%, #FF8B00 30%, #FF8B00 45%, #2684FF 45%, #2684FF 55%, #00875A 55%, #00875A 70%, #006644 70%, #006644 100%)',
    opacity: 0.45,
  } as React.CSSProperties,
  inlineSpectrumMin: {
    position: 'absolute' as const,
    left: '-16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#97A0AF',
  } as React.CSSProperties,
  inlineSpectrumMax: {
    position: 'absolute' as const,
    right: '-22px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#97A0AF',
  } as React.CSSProperties,
  inlinePeerRangeBand: {
    position: 'absolute' as const,
    height: '18px',
    borderRadius: '9px',
    backgroundColor: 'rgba(9, 30, 66, 0.10)',
    transform: 'translateY(0)',
    cursor: 'pointer',
    zIndex: 1,
    transition: 'background-color 0.15s ease',
  } as React.CSSProperties,
  inlinePeerMedianTick: {
    position: 'absolute' as const,
    width: '2px',
    height: '14px',
    backgroundColor: 'rgba(9, 30, 66, 0.25)',
    borderRadius: '1px',
    transform: 'translateX(-50%)',
    zIndex: 2,
    pointerEvents: 'none' as const,
  } as React.CSSProperties,
  inlineYourTeamMarker: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2.5px solid white',
    zIndex: 3,
    cursor: 'pointer',
  } as React.CSSProperties,
  // Tooltip styles
  tooltip: {
    position: 'fixed' as const,
    transform: 'translate(-50%, -100%)',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
    pointerEvents: 'none' as const,
  },
  tooltipLabel: {
    fontWeight: 600,
    marginBottom: '2px',
  },
  tooltipValue: {
    color: '#B3BAC5',
  },
  tooltipArrow: {
    position: 'absolute' as const,
    left: '50%',
    bottom: '-6px',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #172B4D',
  },
  // Info modal styles
  infoModalBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  infoSection: {
    marginBottom: '4px',
  },
  infoSectionTitle: {
    margin: '0 0 6px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  infoList: {
    margin: '4px 0 0 0',
    padding: '0 0 0 20px',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.7,
  },
  healthCategoriesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginTop: '8px',
  },
  healthCategoryRow: {
    padding: '6px 0',
  },
  healthCategoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
  healthCategoryName: {
    fontSize: '13px',
    fontWeight: 700,
  },
  healthCategoryRange: {
    fontSize: '11px',
    color: '#97A0AF',
    fontWeight: 500,
  },
  healthCategoryDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
};

export default LensDetailPage;
