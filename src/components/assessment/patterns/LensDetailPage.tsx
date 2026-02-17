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
import { HERO_GRADIENTS } from './DataTrustBanner';
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
        <div style={{...styles.dimensionBlueBanner, background: HERO_GRADIENTS[tier.name] || HERO_GRADIENTS['At Risk'], borderColor: '#E4E6EB', borderTop: `5px solid ${tier.color}`}}>
          {/* Decorative background circles */}
          <div style={styles.lensDecor1} />
          <div style={styles.lensDecor2} />
          <div style={styles.heroColumnsLayout}>
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
              const healthScore = Math.round(dimension.healthScore ?? dimension.overallPercentile);
              const trendColor = overallTrend === 'up' ? '#00875A' : overallTrend === 'down' ? '#DE350B' : '#44546F';
              const hasTrendData = dimension.trendData && dimension.trendData.length >= 2;
              const tierIndex = tier.level - 1; // 0-based index into INDICATOR_TIERS

              // Donut math
              const donutR = 84;
              const donutCirc = 2 * Math.PI * donutR;
              const donutFilled = (healthScore / 100) * donutCirc;

              return (
                <>
                  {/* Left — question text */}
                  <div style={styles.lensQuestionContent}>
                    <span style={styles.lensQuestionEyebrow}>TIMELINESS</span>
                    <h2 style={styles.lensQuestionText}>
                      Are your tickets <span style={styles.lensHighlight1}>ready</span> before work <span style={styles.lensHighlight2}>begins</span>?
                    </h2>
                    <p style={styles.lensQuestionSubtext}>
                      Measures whether required fields, descriptions, and acceptance criteria are filled in before a ticket enters a sprint. <strong style={{ color: tier.color }}>Your data shows {tier.description.toLowerCase()}.</strong>
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={styles.lensDivider}>
                    <div style={styles.lensDividerLine} />
                    <div style={styles.lensDividerDot} />
                    <div style={styles.lensDividerLine} />
                  </div>

                  {/* Right — score visualization */}
                  <div style={styles.lensScoreFloat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
                      {/* Title row */}
                      <div style={styles.heroTitleRow}>
                        <span style={styles.heroSubtitle}>Timeliness Score</span>
                        <span style={styles.heroInfoInline}>
                          <HeroInfoButton title={`About ${dimension.dimensionName}`}>
                            <div style={styles.infoModalBody}>
                              <div style={{ padding: '10px 12px', backgroundColor: '#DEEBFF', borderRadius: '6px', border: '1px solid #B3D4FF', marginBottom: '16px' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#0052CC', lineHeight: 1.5 }}>
                                  {dimDesc?.summary || `Analysis of ${dimension.dimensionName} across your team's Jira data.`}
                                </p>
                              </div>
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

                      {/* Donut ring */}
                      <div style={styles.heroDonutDisc}>
                        <div style={styles.heroDonutBg} />
                        <svg width={186} height={186} viewBox="0 0 186 186" style={{ display: 'block', position: 'relative' as const, zIndex: 1, transform: 'rotate(-90deg)' }}>
                          <defs>
                            <filter id="lens-hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <circle cx={93} cy={93} r={donutR} fill="none" stroke={`${tier.color}14`} strokeWidth={9} />
                          <circle cx={93} cy={93} r={donutR} fill="none" stroke={tier.color} strokeWidth={9}
                            strokeDasharray={`${donutFilled.toFixed(1)} ${donutCirc.toFixed(1)}`} strokeLinecap="round" filter="url(#lens-hero-glow)" />
                        </svg>
                        <div style={styles.heroDonutContent}>
                          <span style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px', color: tier.color, position: 'relative' as const }}>
                            {healthScore}
                              <button
                                className="trend-spark-btn"
                                onClick={hasTrendData ? () => setShowScoreHistory(true) : undefined}
                                type="button"
                                title={hasTrendData ? 'View score history' : 'Trend'}
                                style={{
                                  position: 'absolute' as const,
                                  top: '-4px',
                                  right: '-32px',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '50%',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: hasTrendData ? 'pointer' : 'default',
                                  padding: 0,
                                  transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
                                }}>
                                {hasTrendData && <style>{`.trend-spark-btn:hover { background: ${trendColor}18 !important; transform: scale(1.15); box-shadow: 0 0 0 3px ${trendColor}22; } .trend-spark-btn:active { transform: scale(1.05); }`}</style>}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                  style={{
                                    transform: overallTrend === 'down' ? 'scaleY(-1)' : 'none',
                                    opacity: overallTrend === 'stable' ? 0.7 : 0.9,
                                  }}>
                                  <polyline points="3,18 8,13 12,16 21,6" />
                                  <polyline points="16,6 21,6 21,11" />
                                </svg>
                              </button>
                          </span>
                        </div>
                      </div>

                      {/* "vs N teams" button */}
                      {assessmentResult.comparisonTeamCount > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            style={styles.heroCompareBtn}
                            onClick={() => openComparisonModal(TICKET_READINESS_INDEX)}
                            type="button"
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6c0-2.76 2.24-5 5-5s5 2.24 5 5H3zm10-8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm1.5 2h-.52a3.98 3.98 0 0 1 1.52 3.13V14H16v-2c0-1.1-.9-2-2-2h-.5zM3 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM.5 8H0c-1.1 0-2 .9-2 2v2h2v-2.13c0-1.2.47-2.3 1.25-3.12L.5 8z" />
                            </svg>
                            vs {assessmentResult.comparisonTeamCount} teams
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Vertical trust level spectrum */}
                    <svg width={90} height={126} viewBox="0 0 90 126">
                      {(() => {
                        const levels = [...INDICATOR_TIERS].reverse(); // Optimal at top
                        const nodeX = 8;
                        const labelX = 22;
                        const spacing = 26;
                        const startY = 12;
                        return (
                          <>
                            {levels.map((_, j) => {
                              if (j === levels.length - 1) return null;
                              const y1 = startY + j * spacing;
                              const y2 = startY + (j + 1) * spacing;
                              const origIdx = INDICATOR_TIERS.length - 1 - j;
                              const reached = origIdx <= tierIndex;
                              return (
                                <line key={`line-${j}`} x1={nodeX} y1={y1} x2={nodeX} y2={y2}
                                  stroke={reached ? levels[j + 1].color : '#DFE1E6'} strokeWidth={2} />
                              );
                            })}
                            {levels.map((level, j) => {
                              const y = startY + j * spacing;
                              const origIdx = INDICATOR_TIERS.length - 1 - j;
                              const isCurr = origIdx === tierIndex;
                              const isReached = origIdx <= tierIndex;
                              return (
                                <g key={level.name}>
                                  {isCurr && (
                                    <circle cx={nodeX} cy={y} r={10} fill={level.color} opacity={0.12} />
                                  )}
                                  <circle cx={nodeX} cy={y} r={isCurr ? 5 : 3}
                                    fill={isReached ? level.color : '#FFFFFF'}
                                    stroke={isReached ? level.color : '#DFE1E6'}
                                    strokeWidth={isReached ? 0 : 1.5} />
                                  <text x={labelX} y={y} dominantBaseline="central"
                                    fontSize={isCurr ? '11.5' : '10'} fontWeight={isCurr ? '700' : '400'}
                                    fill={isCurr ? level.color : '#A5ADBA'}>
                                    {level.name}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  </div>

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
        <div style={{...styles.dimensionBlueBanner, background: HERO_GRADIENTS[integrityTier.name] || HERO_GRADIENTS['At Risk'], borderColor: '#E4E6EB', borderTop: `5px solid ${integrityTier.color}`}}>
          {/* Decorative background circles */}
          <div style={styles.lensDecor1} />
          <div style={styles.lensDecor2} />
          <div style={styles.heroColumnsLayout}>
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
              const healthScore = Math.round(dimension.healthScore);
              const trendColor = intOverallTrend === 'up' ? '#00875A' : intOverallTrend === 'down' ? '#DE350B' : '#44546F';
              const hasTrendData = dimension.trendData && dimension.trendData.length >= 2;
              const tierIndex = integrityTier.level - 1;

              const donutR = 84;
              const donutCirc = 2 * Math.PI * donutR;
              const donutFilled = (healthScore / 100) * donutCirc;

              return (
                <>
                  {/* Left — question text */}
                  <div style={styles.lensQuestionContent}>
                    <span style={styles.lensQuestionEyebrow}>TRUSTWORTHINESS</span>
                    <h2 style={styles.lensQuestionText}>
                      Is your Jira data <span style={styles.lensHighlight1}>meaningful</span> or just <span style={styles.lensHighlight2}>placeholder</span>?
                    </h2>
                    <p style={styles.lensQuestionSubtext}>
                      Checks whether field values are real and consistent — not defaults, duplicates, or copy-paste artifacts that create a false sense of completeness. <strong style={{ color: integrityTier.color }}>Your data shows {integrityTier.description.toLowerCase()}.</strong>
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={styles.lensDivider}>
                    <div style={styles.lensDividerLine} />
                    <div style={styles.lensDividerDot} />
                    <div style={styles.lensDividerLine} />
                  </div>

                  {/* Right — score visualization */}
                  <div style={styles.lensScoreFloat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
                      <div style={styles.heroTitleRow}>
                        <span style={styles.heroSubtitle}>Trustworthiness Score</span>
                        <span style={styles.heroInfoInline}>
                          <HeroInfoButton title={`About ${dimension.dimensionName}`}>
                            <div style={styles.infoModalBody}>
                              <div style={{ padding: '10px 12px', backgroundColor: '#DEEBFF', borderRadius: '6px', border: '1px solid #B3D4FF', marginBottom: '16px' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#0052CC', lineHeight: 1.5 }}>
                                  {dimension.verdictDescription}
                                </p>
                              </div>
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
                                <h4 style={styles.infoSectionTitle}>Health Categories</h4>
                                <p style={styles.infoText}>Your score maps to one of five health categories.</p>
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

                      <div style={styles.heroDonutDisc}>
                        <div style={styles.heroDonutBg} />
                        <svg width={186} height={186} viewBox="0 0 186 186" style={{ display: 'block', position: 'relative' as const, zIndex: 1, transform: 'rotate(-90deg)' }}>
                          <defs>
                            <filter id="integrity-hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                          </defs>
                          <circle cx={93} cy={93} r={donutR} fill="none" stroke={`${integrityTier.color}14`} strokeWidth={9} />
                          <circle cx={93} cy={93} r={donutR} fill="none" stroke={integrityTier.color} strokeWidth={9}
                            strokeDasharray={`${donutFilled.toFixed(1)} ${donutCirc.toFixed(1)}`} strokeLinecap="round" filter="url(#integrity-hero-glow)" />
                        </svg>
                        <div style={styles.heroDonutContent}>
                          <span style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px', color: integrityTier.color, position: 'relative' as const }}>
                            {healthScore}
                            <button
                              className="trend-spark-btn"
                              onClick={hasTrendData ? () => setShowIntegrityScoreHistory(true) : undefined}
                              type="button"
                              title={hasTrendData ? 'View score history' : 'Trend'}
                              style={{
                                position: 'absolute' as const, top: '-4px', right: '-32px',
                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '50%', border: 'none', background: 'transparent',
                                cursor: hasTrendData ? 'pointer' : 'default', padding: 0,
                                transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
                              }}>
                              {hasTrendData && <style>{`.trend-spark-btn:hover { background: ${trendColor}18 !important; transform: scale(1.15); box-shadow: 0 0 0 3px ${trendColor}22; } .trend-spark-btn:active { transform: scale(1.05); }`}</style>}
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: intOverallTrend === 'down' ? 'scaleY(-1)' : 'none', opacity: intOverallTrend === 'stable' ? 0.7 : 0.9 }}>
                                <polyline points="3,18 8,13 12,16 21,6" />
                                <polyline points="16,6 21,6 21,11" />
                              </svg>
                            </button>
                          </span>
                        </div>
                      </div>

                      {assessmentResult.comparisonTeamCount > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <button style={styles.heroCompareBtn} onClick={() => {
                            setComparisonModalContext({
                              yourRank: Math.round((1 - dimension.healthScore / 100) * assessmentResult.comparisonTeamCount) + 1,
                              dimensionName: dimension.dimensionName,
                            });
                            setIsComparisonModalOpen(true);
                          }} type="button">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6c0-2.76 2.24-5 5-5s5 2.24 5 5H3zm10-8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm1.5 2h-.52a3.98 3.98 0 0 1 1.52 3.13V14H16v-2c0-1.1-.9-2-2-2h-.5zM3 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM.5 8H0c-1.1 0-2 .9-2 2v2h2v-2.13c0-1.2.47-2.3 1.25-3.12L.5 8z" />
                            </svg>
                            vs {assessmentResult.comparisonTeamCount} teams
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Vertical trust level spectrum */}
                    <svg width={90} height={126} viewBox="0 0 90 126">
                      {(() => {
                        const levels = [...INDICATOR_TIERS].reverse();
                        const nodeX = 8; const labelX = 22; const spacing = 26; const startY = 12;
                        return (
                          <>
                            {levels.map((_, j) => {
                              if (j === levels.length - 1) return null;
                              const y1 = startY + j * spacing; const y2 = startY + (j + 1) * spacing;
                              const origIdx = INDICATOR_TIERS.length - 1 - j;
                              return <line key={`line-${j}`} x1={nodeX} y1={y1} x2={nodeX} y2={y2}
                                stroke={origIdx <= tierIndex ? levels[j + 1].color : '#DFE1E6'} strokeWidth={2} />;
                            })}
                            {levels.map((level, j) => {
                              const y = startY + j * spacing;
                              const origIdx = INDICATOR_TIERS.length - 1 - j;
                              const isCurr = origIdx === tierIndex;
                              const isReached = origIdx <= tierIndex;
                              return (
                                <g key={level.name}>
                                  {isCurr && <circle cx={nodeX} cy={y} r={10} fill={level.color} opacity={0.12} />}
                                  <circle cx={nodeX} cy={y} r={isCurr ? 5 : 3}
                                    fill={isReached ? level.color : '#FFFFFF'}
                                    stroke={isReached ? level.color : '#DFE1E6'}
                                    strokeWidth={isReached ? 0 : 1.5} />
                                  <text x={labelX} y={y} dominantBaseline="central"
                                    fontSize={isCurr ? '11.5' : '10'} fontWeight={isCurr ? '700' : '400'}
                                    fill={isCurr ? level.color : '#A5ADBA'}>
                                    {level.name}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  </div>

                  {showIntegrityScoreHistory && dimension.trendData && dimension.trendData.length >= 2 && (
                    <div style={styles.scoreHistoryOverlay} onClick={() => setShowIntegrityScoreHistory(false)}>
                      <div style={styles.scoreHistoryModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.scoreHistoryHeader}>
                          <h3 style={styles.scoreHistoryTitle}>Score History</h3>
                          <button onClick={() => setShowIntegrityScoreHistory(false)} style={styles.scoreHistoryClose}>{'\u2715'}</button>
                        </div>
                        <div style={styles.scoreHistoryBody}>
                          <TrendChart data={dimension.trendData} height={280} dimensionName="Data Integrity" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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
        <div style={{...styles.dimensionBlueBanner, background: HERO_GRADIENTS[freshnessTier.name] || HERO_GRADIENTS['At Risk'], borderColor: '#E4E6EB', borderTop: `5px solid ${freshnessTier.color}`}}>
          {/* Decorative background circles */}
          <div style={styles.lensDecor1} />
          <div style={styles.lensDecor2} />
          <div style={styles.heroColumnsLayout}>
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
              const healthScore = Math.round(dimension.healthScore ?? dimension.overallPercentile);
              const trendColor = freshOverallTrend === 'up' ? '#00875A' : freshOverallTrend === 'down' ? '#DE350B' : '#44546F';
              const hasTrendData = dimension.trendData && dimension.trendData.length >= 2;
              const tierIndex = freshnessTier.level - 1;

              const donutR = 84;
              const donutCirc = 2 * Math.PI * donutR;
              const donutFilled = (healthScore / 100) * donutCirc;

              return (
                <>
                  {/* Left — question text */}
                  <div style={styles.lensQuestionContent}>
                    <span style={styles.lensQuestionEyebrow}>FRESHNESS</span>
                    <h2 style={styles.lensQuestionText}>
                      Does your Jira <span style={styles.lensHighlight1}>reflect</span> what's actually <span style={styles.lensHighlight2}>happening</span>?
                    </h2>
                    <p style={styles.lensQuestionSubtext}>
                      Identifies stale items, bulk catch-up updates, and parent-child sync gaps that signal Jira isn't being maintained in real time. <strong style={{ color: freshnessTier.color }}>Your data shows {freshnessTier.description.toLowerCase()}.</strong>
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={styles.lensDivider}>
                    <div style={styles.lensDividerLine} />
                    <div style={styles.lensDividerDot} />
                    <div style={styles.lensDividerLine} />
                  </div>

                  {/* Right — score visualization */}
                  <div style={styles.lensScoreFloat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
                      <div style={styles.heroTitleRow}>
                        <span style={styles.heroSubtitle}>Freshness Score</span>
                        <span style={styles.heroInfoInline}>
                          <HeroInfoButton title={`About ${dimension.dimensionName}`}>
                            <div style={styles.infoModalBody}>
                              <div style={{ padding: '10px 12px', backgroundColor: '#DEEBFF', borderRadius: '6px', border: '1px solid #B3D4FF', marginBottom: '16px' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#0052CC', lineHeight: 1.5 }}>
                                  {dimension.verdictDescription}
                                </p>
                              </div>
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
                                <h4 style={styles.infoSectionTitle}>Health Categories</h4>
                                <p style={styles.infoText}>Your score maps to one of five health categories.</p>
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

                      <div style={styles.heroDonutDisc}>
                        <div style={styles.heroDonutBg} />
                        <svg width={186} height={186} viewBox="0 0 186 186" style={{ display: 'block', position: 'relative' as const, zIndex: 1, transform: 'rotate(-90deg)' }}>
                          <defs>
                            <filter id="freshness-hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                          </defs>
                          <circle cx={93} cy={93} r={donutR} fill="none" stroke={`${freshnessTier.color}14`} strokeWidth={9} />
                          <circle cx={93} cy={93} r={donutR} fill="none" stroke={freshnessTier.color} strokeWidth={9}
                            strokeDasharray={`${donutFilled.toFixed(1)} ${donutCirc.toFixed(1)}`} strokeLinecap="round" filter="url(#freshness-hero-glow)" />
                        </svg>
                        <div style={styles.heroDonutContent}>
                          <span style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px', color: freshnessTier.color, position: 'relative' as const }}>
                            {healthScore}
                            <button
                              className="trend-spark-btn"
                              onClick={hasTrendData ? () => setShowFreshnessScoreHistory(true) : undefined}
                              type="button"
                              title={hasTrendData ? 'View score history' : 'Trend'}
                              style={{
                                position: 'absolute' as const, top: '-4px', right: '-32px',
                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '50%', border: 'none', background: 'transparent',
                                cursor: hasTrendData ? 'pointer' : 'default', padding: 0,
                                transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
                              }}>
                              {hasTrendData && <style>{`.trend-spark-btn:hover { background: ${trendColor}18 !important; transform: scale(1.15); box-shadow: 0 0 0 3px ${trendColor}22; } .trend-spark-btn:active { transform: scale(1.05); }`}</style>}
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: freshOverallTrend === 'down' ? 'scaleY(-1)' : 'none', opacity: freshOverallTrend === 'stable' ? 0.7 : 0.9 }}>
                                <polyline points="3,18 8,13 12,16 21,6" />
                                <polyline points="16,6 21,6 21,11" />
                              </svg>
                            </button>
                          </span>
                        </div>
                      </div>

                      {assessmentResult.comparisonTeamCount > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <button style={styles.heroCompareBtn} onClick={() => {
                            setComparisonModalContext({
                              yourRank: Math.round((1 - (dimension.healthScore ?? dimension.overallPercentile) / 100) * assessmentResult.comparisonTeamCount) + 1,
                              dimensionName: dimension.dimensionName,
                            });
                            setIsComparisonModalOpen(true);
                          }} type="button">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6c0-2.76 2.24-5 5-5s5 2.24 5 5H3zm10-8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm1.5 2h-.52a3.98 3.98 0 0 1 1.52 3.13V14H16v-2c0-1.1-.9-2-2-2h-.5zM3 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM.5 8H0c-1.1 0-2 .9-2 2v2h2v-2.13c0-1.2.47-2.3 1.25-3.12L.5 8z" />
                            </svg>
                            vs {assessmentResult.comparisonTeamCount} teams
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Vertical trust level spectrum */}
                    <svg width={90} height={126} viewBox="0 0 90 126">
                      {(() => {
                        const levels = [...INDICATOR_TIERS].reverse();
                        const nodeX = 8; const labelX = 22; const spacing = 26; const startY = 12;
                        return (
                          <>
                            {levels.map((_, j) => {
                              if (j === levels.length - 1) return null;
                              const y1 = startY + j * spacing; const y2 = startY + (j + 1) * spacing;
                              const origIdx = INDICATOR_TIERS.length - 1 - j;
                              return <line key={`line-${j}`} x1={nodeX} y1={y1} x2={nodeX} y2={y2}
                                stroke={origIdx <= tierIndex ? levels[j + 1].color : '#DFE1E6'} strokeWidth={2} />;
                            })}
                            {levels.map((level, j) => {
                              const y = startY + j * spacing;
                              const origIdx = INDICATOR_TIERS.length - 1 - j;
                              const isCurr = origIdx === tierIndex;
                              const isReached = origIdx <= tierIndex;
                              return (
                                <g key={level.name}>
                                  {isCurr && <circle cx={nodeX} cy={y} r={10} fill={level.color} opacity={0.12} />}
                                  <circle cx={nodeX} cy={y} r={isCurr ? 5 : 3}
                                    fill={isReached ? level.color : '#FFFFFF'}
                                    stroke={isReached ? level.color : '#DFE1E6'}
                                    strokeWidth={isReached ? 0 : 1.5} />
                                  <text x={labelX} y={y} dominantBaseline="central"
                                    fontSize={isCurr ? '11.5' : '10'} fontWeight={isCurr ? '700' : '400'}
                                    fill={isCurr ? level.color : '#A5ADBA'}>
                                    {level.name}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  </div>

                  {showFreshnessScoreHistory && dimension.trendData && dimension.trendData.length >= 2 && (
                    <div style={styles.scoreHistoryOverlay} onClick={() => setShowFreshnessScoreHistory(false)}>
                      <div style={styles.scoreHistoryModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.scoreHistoryHeader}>
                          <h3 style={styles.scoreHistoryTitle}>Score History</h3>
                          <button onClick={() => setShowFreshnessScoreHistory(false)} style={styles.scoreHistoryClose}>{'\u2715'}</button>
                        </div>
                        <div style={styles.scoreHistoryBody}>
                          <TrendChart data={dimension.trendData} height={280} dimensionName="Data Freshness" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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
    padding: '36px 48px 40px 68px',
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
  heroColumnsLayout: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  lensQuestionContent: {
    position: 'relative' as const,
    zIndex: 1,
    flex: '1 1 0%',
    maxWidth: '560px',
  },
  lensQuestionEyebrow: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '2px',
    color: '#BF6A02',
    marginBottom: '12px',
    textTransform: 'uppercase' as const,
  },
  lensQuestionText: {
    margin: '0 0 16px',
    fontSize: '26px',
    fontWeight: 800,
    lineHeight: 1.25,
    color: '#172B4D',
    letterSpacing: '-0.5px',
  },
  lensHighlight1: {
    color: '#FF8B00',
  },
  lensHighlight2: {
    color: '#0052CC',
  },
  lensQuestionSubtext: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#44546F',
    fontWeight: 400,
  },
  lensScoreFloat: {
    position: 'relative' as const,
    zIndex: 1,
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '0',
    marginLeft: '16px',
  },
  lensDivider: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: '0',
    padding: '16px 0',
  },
  lensDividerLine: {
    flex: 1,
    width: '1px',
    background: 'linear-gradient(to bottom, transparent, rgba(255, 139, 0, 0.25), rgba(255, 139, 0, 0.35))',
  },
  lensDividerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    transform: 'rotate(45deg)',
    background: 'rgba(255, 139, 0, 0.3)',
    border: '1px solid rgba(255, 139, 0, 0.15)',
    margin: '8px 0',
    flexShrink: 0,
  },
  lensDecor1: {
    position: 'absolute' as const,
    top: '-40px',
    right: '-30px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'rgba(255, 139, 0, 0.06)',
    border: '1px solid rgba(255, 139, 0, 0.08)',
  },
  lensDecor2: {
    position: 'absolute' as const,
    bottom: '-20px',
    left: '-40px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(0, 82, 204, 0.04)',
    border: '1px solid rgba(0, 82, 204, 0.06)',
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
  heroDonutDisc: {
    position: 'relative' as const,
    width: '186px',
    height: '186px',
  },
  heroDonutBg: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 6px 40px rgba(9, 30, 66, 0.10), 0 0 0 1px rgba(9, 30, 66, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  heroDonutContent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  heroCompareBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1.5px solid rgba(9, 30, 66, 0.1)',
    color: '#44546F',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
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
