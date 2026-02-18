import React, { useState } from 'react';
import { OutcomeConfidenceSummary, OutcomeConfidenceResult, OutcomeAreaId } from '../../../types/outcomeConfidence';
import { getIndicatorTier, INDICATOR_TIERS } from '../../../types/indicatorTiers';
import { getOutcomeIcon } from '../../../constants/dimensionIcons';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  teamName: string;
  score: number;
}

interface OutcomeConfidenceHeroProps {
  confidenceSummary: OutcomeConfidenceSummary;
  onOutcomeClick: (outcomeId: OutcomeAreaId) => void;
  hideHeader?: boolean; // When true, hides the header (used when shared HealthScoreHero is shown)
}

// Get tier color for the active dot
const getTierColor = (tierLevel: number): string => {
  const tier = INDICATOR_TIERS.find(t => t.level === tierLevel);
  return tier?.color || '#6B778C';
};

interface ComparisonTeam {
  name: string;
  score: number;
}

// Generate mock comparison team data for an outcome
// In a real app, this would come from the API
const generateComparisonTeams = (outcomeId: string, teamCount: number = 47): ComparisonTeam[] => {
  // Use outcomeId as seed for consistent random positions per outcome
  const seed = outcomeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const teams: ComparisonTeam[] = [];

  // Mock team name prefixes for variety
  const teamPrefixes = ['Alpha', 'Beta', 'Delta', 'Gamma', 'Omega', 'Sigma', 'Phoenix', 'Atlas', 'Nova', 'Titan'];

  for (let i = 0; i < teamCount; i++) {
    // Generate pseudo-random position (0-100) with some clustering toward middle
    const pseudoRandom = Math.sin(seed * (i + 1) * 9999) * 10000;
    const normalized = (pseudoRandom - Math.floor(pseudoRandom));
    // Bell curve-ish distribution
    const position = Math.max(5, Math.min(95, normalized * 100));

    // Generate a pseudo-random team name
    const prefixIndex = Math.floor((seed + i * 7) % teamPrefixes.length);
    const teamNumber = Math.floor((seed + i * 3) % 100) + 1;

    teams.push({
      name: `${teamPrefixes[prefixIndex]} Team ${teamNumber}`,
      score: position,
    });
  }

  return teams;
};

// Get trend display with badge styling
const getTrendDisplay = (trend: 'up' | 'down' | 'stable'): { icon: string; label: string; color: string; bgColor: string } => {
  switch (trend) {
    case 'up': return { icon: 'up', label: 'Improving', color: '#006644', bgColor: '#E3FCEF' };
    case 'down': return { icon: 'down', label: 'Declining', color: '#DE350B', bgColor: '#FFEBE6' };
    case 'stable': return { icon: 'stable', label: 'Stable', color: '#5E6C84', bgColor: '#F4F5F7' };
  }
};

// Format question with bold key phrases
const formatQuestion = (question: string): React.ReactNode => {
  const boldPhrases = [
    'reliable commitments',
    'track progress',
    'measure our productivity',
    'improve our processes',
    'collaborate effectively',
    'portfolio-level planning',
    'identify risks and blockers early',
    'decision-making',
  ];

  let parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const matches: { start: number; end: number; phrase: string }[] = [];
  for (const phrase of boldPhrases) {
    const index = question.toLowerCase().indexOf(phrase.toLowerCase());
    if (index !== -1) {
      matches.push({
        start: index,
        end: index + phrase.length,
        phrase: question.substring(index, index + phrase.length),
      });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  for (const match of matches) {
    if (match.start > lastIndex) {
      parts.push(question.substring(lastIndex, match.start));
    }
    parts.push(<strong key={match.start}>{match.phrase}</strong>);
    lastIndex = match.end;
  }

  if (lastIndex < question.length) {
    parts.push(question.substring(lastIndex));
  }

  return parts.length > 0 ? parts : question;
};

interface OutcomeRowProps {
  outcome: OutcomeConfidenceResult;
  onClick: () => void;
  showDivider: boolean;
  yourTeamName?: string;
}

const OutcomeRow: React.FC<OutcomeRowProps> = ({ outcome, onClick, showDivider, yourTeamName = 'Your Team' }) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    teamName: '',
    score: 0,
  });

  const tier = getIndicatorTier(outcome.finalScore);
  const tierColor = getTierColor(tier.level);
  const trendDisplay = getTrendDisplay(outcome.trend);

  // Get comparison teams (mock data - 47 teams)
  const comparisonTeams = generateComparisonTeams(outcome.id, 47);

  // Calculate "you are here" position as percentage (tier 1 = ~8%, tier 6 = ~92%)
  const yourPosition = ((tier.level - 1) / 5) * 84 + 8;

  const handleDotMouseEnter = (
    e: React.MouseEvent,
    dotTeamName: string,
    dotScore: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      teamName: dotTeamName,
      score: dotScore,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <button
      style={{
        ...styles.row,
        borderBottom: showDivider ? '1px solid #F0F1F4' : 'none',
      }}
      onClick={onClick}
    >
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#172B4D',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.teamName}</div>
          <div style={{ color: '#B3BAC5' }}>Score: {Math.round(tooltip.score)}</div>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -6,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #172B4D',
            }}
          />
        </div>
      )}

      {/* Status indicator bar */}
      <div
        style={{
          ...styles.statusIndicator,
          backgroundColor: tierColor,
        }}
      />

      {/* Main content area */}
      <div style={styles.mainContent}>
        {/* Header row: Icon + Question + trend + chevron */}
        <div style={styles.headerRow}>
          <span style={styles.outcomeIcon}>
            {getOutcomeIcon(outcome.id, 'small', tierColor)}
          </span>
          <span style={styles.questionText}>{formatQuestion(outcome.question)}</span>
          {outcome.criticalGaps.length > 0 && (
            <span style={styles.gapBadge}>
              {outcome.criticalGaps.length} gap{outcome.criticalGaps.length !== 1 ? 's' : ''}
            </span>
          )}
          <span style={{
            ...styles.trendBadge,
            backgroundColor: trendDisplay.bgColor,
            color: trendDisplay.color
          }}>
            {trendDisplay.icon === 'up' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendDisplay.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>}
            {trendDisplay.icon === 'down' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendDisplay.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>}
            {trendDisplay.icon === 'stable' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendDisplay.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>}
            {' '}{trendDisplay.label}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.chevron}>
            <path
              d="M6 4l4 4-4 4"
              stroke="#97A0AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 3-column spectrum layout */}
        <div style={styles.spectrumLayout}>
          {/* Left endpoint */}
          <div style={styles.endpointColumnLeft}>
            <div style={styles.endpointLabelBad}>
              ← {outcome.spectrumEndpoints.min.label}
            </div>
            <p style={styles.endpointNarrative}>{outcome.spectrumEndpoints.min.description}</p>
          </div>

          {/* Center: Spectrum visualization */}
          <div style={styles.spectrumCenter}>
            {/* Comparison teams scattered above the line */}
            <div style={styles.comparisonTeamsContainer}>
              {comparisonTeams.map((team, index) => {
                // Scatter dots vertically with some randomness
                const verticalOffset = ((Math.sin(index * 1234) + 1) / 2) * 20 + 2;
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.comparisonDot,
                      left: `${team.score}%`,
                      bottom: `${verticalOffset}px`,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      handleDotMouseEnter(e, team.name, team.score);
                    }}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </div>

            {/* "You are here" indicator */}
            <div
              style={{ ...styles.youAreHereContainer, left: `${yourPosition}%`, cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                handleDotMouseEnter(e, yourTeamName, outcome.finalScore);
              }}
              onMouseLeave={handleMouseLeave}
            >
              <span style={styles.youAreHereText}>You are here</span>
              <div style={{ ...styles.youAreHereArrow, borderTopColor: tierColor }} />
            </div>

            {/* Spectrum bar with gradient and tier markers */}
            <div style={styles.spectrumBarContainer}>
              <div style={styles.spectrumGradient} />
              <div style={styles.spectrumTierMarkers}>
                {INDICATOR_TIERS.map((t) => {
                  const isYou = t.level === tier.level;
                  const dotColor = getTierColor(t.level);
                  return (
                    <div
                      key={t.level}
                      style={{
                        ...styles.tierMarker,
                        width: isYou ? '18px' : '10px',
                        height: isYou ? '18px' : '10px',
                        backgroundColor: isYou ? dotColor : '#DFE1E6',
                        boxShadow: isYou ? `0 0 0 4px ${dotColor}30` : 'none',
                        border: isYou ? '2px solid white' : '2px solid white',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Team count label */}
            <div style={styles.teamCountLabel}>
              {comparisonTeams.length} similar teams
            </div>
          </div>

          {/* Right endpoint */}
          <div style={styles.endpointColumnRight}>
            <div style={styles.endpointLabelGood}>
              {outcome.spectrumEndpoints.max.label} →
            </div>
            <p style={styles.endpointNarrative}>{outcome.spectrumEndpoints.max.description}</p>
          </div>
        </div>
      </div>
    </button>
  );
};

const OutcomeConfidenceHero: React.FC<OutcomeConfidenceHeroProps> = ({
  confidenceSummary,
  onOutcomeClick,
  hideHeader = false,
}) => {
  // Sort outcomes by score (worst first = priority order)
  const sortedOutcomes = [...confidenceSummary.outcomes].sort(
    (a, b) => a.finalScore - b.finalScore
  );

  // Split into needs attention (tier 1-3) vs on track (tier 4-6)
  const needsAttention = sortedOutcomes.filter(o => getIndicatorTier(o.finalScore).level <= 3);
  const onTrack = sortedOutcomes.filter(o => getIndicatorTier(o.finalScore).level >= 4);

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.heroCard,
        ...(hideHeader ? { paddingTop: '16px' } : {}),
      }}>
        {/* Hero Header - hidden when shared HealthScoreHero is shown */}
        {!hideHeader && (
          <div style={styles.header}>
            <p style={styles.eyebrow}>JIRA HEALTH</p>
            <h2 style={styles.title}>
              How healthy is your Jira data?
            </h2>
            <p style={styles.subtitle}>
              Sorted by priority. Click any row for details.
            </p>
          </div>
        )}

        {/* Priority List */}
        <div style={styles.listContainer}>
          {/* Needs Attention Section */}
          {needsAttention.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIconWarning}>!</span>
                <span style={styles.sectionTitle}>Needs attention</span>
                <span style={styles.sectionCount}>{needsAttention.length}</span>
              </div>
              <div style={styles.rowGroup}>
                {needsAttention.map((outcome, index) => (
                  <OutcomeRow
                    key={outcome.id}
                    outcome={outcome}
                    onClick={() => onOutcomeClick(outcome.id)}
                    showDivider={index < needsAttention.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* On Track Section */}
          {onTrack.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIconGood}>✓</span>
                <span style={styles.sectionTitle}>On track</span>
                <span style={styles.sectionCount}>{onTrack.length}</span>
              </div>
              <div style={styles.rowGroup}>
                {onTrack.map((outcome, index) => (
                  <OutcomeRow
                    key={outcome.id}
                    outcome={outcome}
                    onClick={() => onOutcomeClick(outcome.id)}
                    showDivider={index < onTrack.length - 1}
                  />
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
  container: {
    marginBottom: '32px',
    animation: 'fadeInUp 0.4s ease-out',
  },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 12px rgba(9, 30, 66, 0.08)',
    padding: '32px',
  },

  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },

  eyebrow: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },

  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: '1.3',
  },

  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },

  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '8px',
  },

  sectionIconWarning: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
    fontSize: '12px',
    fontWeight: 700,
  },

  sectionIconGood: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '12px',
    fontWeight: 700,
  },

  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  sectionCount: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#97A0AF',
  },

  rowGroup: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },

  row: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },

  statusIndicator: {
    width: '4px',
    borderRadius: '2px',
    flexShrink: 0,
    alignSelf: 'stretch',
  },

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: 0,
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  outcomeIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  questionText: {
    flex: 1,
    fontSize: '15px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: '1.4',
  },

  gapBadge: {
    flexShrink: 0,
    padding: '2px 8px',
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '10px',
  },

  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    flexShrink: 0,
  },

  chevron: {
    flexShrink: 0,
  },

  spectrumLayout: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '20px',
    padding: '16px 0 8px 0',
    borderTop: '1px solid #F0F1F4',
    marginTop: '8px',
  },

  endpointColumnLeft: {
    width: '180px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  endpointColumnRight: {
    width: '180px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'right',
  },

  endpointLabelBad: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#CA3521',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },

  endpointLabelGood: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#216E4E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },

  endpointNarrative: {
    margin: 0,
    fontSize: '11px',
    fontStyle: 'italic',
    color: '#6B778C',
    lineHeight: '1.4',
  },

  spectrumCenter: {
    flex: 1,
    position: 'relative',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  comparisonTeamsContainer: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '35px',
  },

  comparisonDot: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#C1C7D0',
    opacity: 0.7,
  },

  youAreHereContainer: {
    position: 'absolute',
    top: '32px',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },

  youAreHereText: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    marginBottom: '3px',
  },

  youAreHereArrow: {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '6px solid #5E6C84',
  },

  spectrumBarContainer: {
    position: 'relative',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
  },

  spectrumGradient: {
    position: 'absolute',
    left: '0',
    right: '0',
    height: '6px',
    borderRadius: '3px',
    background: 'linear-gradient(to right, #DE350B 0%, #FF8B00 20%, #FFAB00 40%, #79E2A8 60%, #36B37E 80%, #00875A 100%)',
    opacity: 0.4,
  },

  spectrumTierMarkers: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 1,
  },

  tierMarker: {
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },

  teamCountLabel: {
    marginTop: '6px',
    fontSize: '10px',
    color: '#97A0AF',
    textAlign: 'center',
  },
};

export default OutcomeConfidenceHero;
