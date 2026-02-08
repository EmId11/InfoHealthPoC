import React from 'react';
import { OutcomeConfidenceResult } from '../../../types/outcomeConfidence';
import { getIndicatorTier, INDICATOR_TIERS } from '../../../types/indicatorTiers';
import { getOutcomeIcon } from '../../../constants/dimensionIcons';

interface OutcomeCardProps {
  outcome: OutcomeConfidenceResult;
  isSelected: boolean;
  onClick: () => void;
}

// Maps 6-tier levels to yes/no shade answers with RAG colors
const getAnswerTier = (tierLevel: number): { word: string; insight: string; color: string; bgColor: string } => {
  const answers: Record<number, { word: string; insight: string; color: string; bgColor: string }> = {
    6: { word: 'YES', insight: 'Data is complete and accurate', color: '#006644', bgColor: '#DCFFF1' },
    5: { word: 'MOSTLY', insight: 'Minor gaps, overall solid', color: '#22A06B', bgColor: '#E3FCEF' },
    4: { word: 'SOMEWHAT', insight: 'Some data gaps to address', color: '#FFCC00', bgColor: '#FFFCE8' },
    3: { word: 'BARELY', insight: 'Notable gaps affecting accuracy', color: '#F57C00', bgColor: '#FFF8E1' },
    2: { word: 'HARDLY', insight: 'Significant data issues', color: '#DE350B', bgColor: '#FFEBE6' },
    1: { word: 'NO', insight: 'Critical gaps need fixing', color: '#AE2E24', bgColor: '#FFEDEB' },
  };
  return answers[tierLevel] || { word: '?', insight: '', color: '#6B778C', bgColor: '#F4F5F7' };
};

// Get trend icon and label
const getTrendDisplay = (trend: 'up' | 'down' | 'stable'): { icon: string; label: string; color: string } => {
  switch (trend) {
    case 'up':
      return { icon: '↑', label: 'Improving', color: '#216E4E' };
    case 'down':
      return { icon: '↓', label: 'Declining', color: '#CA3521' };
    case 'stable':
      return { icon: '→', label: 'Stable', color: '#6B778C' };
  }
};

const OutcomeCard: React.FC<OutcomeCardProps> = ({
  outcome,
  isSelected,
  onClick,
}) => {
  const tier = getIndicatorTier(outcome.finalScore);
  const answerTier = getAnswerTier(tier.level);
  const trendDisplay = getTrendDisplay(outcome.trend);

  return (
    <button
      style={{
        ...styles.card,
        backgroundColor: isSelected ? answerTier.bgColor : '#FFFFFF',
        borderColor: isSelected ? answerTier.color : '#E4E6EB',
        boxShadow: isSelected
          ? `0 0 0 3px ${answerTier.color}25`
          : '0 2px 8px rgba(9, 30, 66, 0.08)',
      }}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {/* Question with icon */}
      <div style={styles.questionRow}>
        <span style={styles.outcomeIcon}>
          {getOutcomeIcon(outcome.id, 'medium', '#0052CC')}
        </span>
        <span style={styles.question}>{outcome.question}</span>
      </div>

      {/* Answer: "YES" / "MOSTLY" / "SOMEWHAT" / "BARELY" / "HARDLY" / "NO" */}
      <div style={styles.answerContainer}>
        <span style={{ ...styles.answerWord, color: answerTier.color }}>
          {answerTier.word}
        </span>
      </div>

      {/* Visual tier scale - 6 dots showing where they are */}
      <div style={styles.tierScale}>
        {INDICATOR_TIERS.map((t) => {
          const dotTier = getAnswerTier(t.level);
          return (
            <div
              key={t.level}
              style={{
                ...styles.tierDot,
                backgroundColor: t.level === tier.level ? dotTier.color : '#E4E6EB',
                transform: t.level === tier.level ? 'scale(1.3)' : 'scale(1)',
              }}
              title={t.name}
            />
          );
        })}
      </div>
      <div style={styles.scaleLabels}>
        <span style={styles.scaleLabel}>No</span>
        <span style={styles.scaleLabel}>Yes</span>
      </div>

      {/* Insight + Trend row */}
      <div style={styles.bottomRow}>
        <span style={{ ...styles.insight, color: answerTier.color }}>{answerTier.insight}</span>
        <span style={{ ...styles.trend, color: trendDisplay.color }}>
          {trendDisplay.icon} {trendDisplay.label}
        </span>
      </div>

      {/* Critical gap indicator */}
      {outcome.criticalGaps.length > 0 && (
        <div style={styles.criticalGapIndicator}>
          <span style={styles.warningIcon}>!</span>
          <span style={styles.criticalGapText}>
            {outcome.criticalGaps.length} gap{outcome.criticalGaps.length !== 1 ? 's' : ''} need attention
          </span>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div style={styles.selectionIndicator}>
          <div style={{ ...styles.chevron, borderColor: answerTier.color }} />
        </div>
      )}
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    padding: '28px 24px',
    minWidth: '280px',
    maxWidth: '340px',
    flex: '1 1 300px',
    border: '2px solid',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    background: '#FFFFFF',
  },

  questionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    width: '100%',
  },

  outcomeIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },

  question: {
    fontSize: '17px',
    fontWeight: 500,
    color: '#172B4D',
    textAlign: 'center',
    lineHeight: '1.4',
    minHeight: '48px',
  },

  answerContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
  },

  answerWord: {
    fontSize: '36px',
    fontWeight: 700,
  },

  tierScale: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },

  tierDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },

  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '140px',
    marginTop: '-4px',
  },

  scaleLabel: {
    fontSize: '10px',
    color: '#97A0AF',
    fontWeight: 500,
  },

  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #F0F1F4',
  },

  insight: {
    fontSize: '13px',
    fontWeight: 500,
    textAlign: 'left',
  },

  trend: {
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  criticalGapIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
    padding: '6px 14px',
    backgroundColor: '#FFEDEB',
    borderRadius: '20px',
  },

  warningIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#CA3521',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 700,
  },

  criticalGapText: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#CA3521',
  },

  selectionIndicator: {
    position: 'absolute',
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chevron: {
    width: '14px',
    height: '14px',
    border: '2px solid',
    borderTop: 'none',
    borderLeft: 'none',
    transform: 'rotate(45deg)',
    backgroundColor: '#FFFFFF',
  },
};

export default OutcomeCard;
