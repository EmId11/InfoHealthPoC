import React, { useMemo } from 'react';
import { ActionPlanSection, ActionPlanItem, BaselineSnapshot } from '../../../types/actionPlan';
import { DimensionResult } from '../../../types/assessment';

interface OverallImpactModalProps {
  sections: ActionPlanSection[];
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
  dimensions: DimensionResult[];
  onClose: () => void;
}

interface IndicatorChange {
  indicatorId: string;
  indicatorName: string;
  unit: string;
  baselineValue: number;
  currentValue: number;
  change: number;
  changePercent: number;
}

interface DimensionMeasuredImpact {
  dimension: DimensionResult;
  completedActions: ActionPlanItem[];
  baselineHealthScore: number;
  currentHealthScore: number;
  healthScoreChange: number;
  indicatorChanges: IndicatorChange[];
  daysSinceStart: number;
  hasBaseline: boolean;
}

// Mock current value generation for demo
const generateCurrentValue = (
  baselineValue: number,
  daysSinceStart: number,
  actionImpact: 'low' | 'medium' | 'high',
  indicatorId: string
): number => {
  const seed = indicatorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (seed % 100) / 100;
  const effectiveDays = Math.max(daysSinceStart, 7 + (seed % 7));
  const impactMultiplier = { high: 1.5, medium: 1.0, low: 0.5 }[actionImpact];
  const timeMultiplier = Math.min(effectiveDays / 14, 1);
  const direction = pseudoRandom > 0.15 ? 1 : -0.3;
  const baseChange = (3 + pseudoRandom * 7) * impactMultiplier * timeMultiplier * direction;
  const newValue = baselineValue + baseChange;
  return Math.min(100, Math.max(0, Math.round(newValue * 10) / 10));
};

const OverallImpactModal: React.FC<OverallImpactModalProps> = ({
  sections,
  completedCount,
  inProgressCount,
  totalCount,
  dimensions,
  onClose,
}) => {
  // Calculate measured impact for each dimension
  const dimensionImpacts = useMemo((): DimensionMeasuredImpact[] => {
    const completedActions: ActionPlanItem[] = [];
    for (const section of sections) {
      for (const item of section.items) {
        if (item.status === 'done') {
          completedActions.push(item);
        }
      }
    }

    const actionsByDimension = new Map<string, ActionPlanItem[]>();
    for (const action of completedActions) {
      const key = action.recommendation.sourceDimensionKey;
      const existing = actionsByDimension.get(key) || [];
      existing.push(action);
      actionsByDimension.set(key, existing);
    }

    const impacts: DimensionMeasuredImpact[] = [];

    for (const [dimKey, actions] of Array.from(actionsByDimension)) {
      const dimension = dimensions.find(d => d.dimensionKey === dimKey);
      if (!dimension) continue;

      const actionsWithBaseline = actions.filter(a => a.baselineSnapshot);
      const earliestAction = actionsWithBaseline.reduce<ActionPlanItem | null>((earliest, action) => {
        if (!earliest) return action;
        const earliestTime = new Date(earliest.startedAt || earliest.addedAt).getTime();
        const actionTime = new Date(action.startedAt || action.addedAt).getTime();
        return actionTime < earliestTime ? action : earliest;
      }, null);

      const hasBaseline = !!earliestAction?.baselineSnapshot;
      const baseline: BaselineSnapshot | undefined = earliestAction?.baselineSnapshot;

      const startDate = earliestAction?.startedAt ? new Date(earliestAction.startedAt) : new Date();
      const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      const indicatorChanges: IndicatorChange[] = [];

      if (baseline) {
        const primaryImpact = actions.reduce<'low' | 'medium' | 'high'>((highest, action) => {
          const levels: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return levels[action.recommendation.impact] > levels[highest]
            ? action.recommendation.impact
            : highest;
        }, 'low');

        for (const baseInd of baseline.indicators) {
          const currentValue = generateCurrentValue(baseInd.value, daysSinceStart, primaryImpact, baseInd.indicatorId);
          const change = currentValue - baseInd.value;
          const changePercent = baseInd.value > 0 ? (change / baseInd.value) * 100 : (change > 0 ? 100 : 0);

          if (Math.abs(change) >= 0.5 || indicatorChanges.length < 3) {
            indicatorChanges.push({
              indicatorId: baseInd.indicatorId,
              indicatorName: baseInd.indicatorName,
              unit: baseInd.unit,
              baselineValue: baseInd.value,
              currentValue,
              change,
              changePercent,
            });
          }
        }
      }

      const dimSeed = dimKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const effectiveDays = Math.max(daysSinceStart, 7 + (dimSeed % 7));
      const baselineHealthScore = baseline?.dimensionHealthScore ?? dimension.healthScore;
      const healthScoreChange = hasBaseline ? Math.round(effectiveDays * 0.5 + (dimSeed % 5)) : 0;

      impacts.push({
        dimension,
        completedActions: actions,
        baselineHealthScore,
        currentHealthScore: Math.min(100, baselineHealthScore + healthScoreChange),
        healthScoreChange,
        indicatorChanges: indicatorChanges.slice(0, 4),
        daysSinceStart: effectiveDays,
        hasBaseline,
      });
    }

    return impacts.sort((a, b) => b.healthScoreChange - a.healthScoreChange);
  }, [sections, dimensions]);

  // Calculate totals for hero section
  const totalHealthScoreGain = dimensionImpacts.reduce((sum, d) => sum + d.healthScoreChange, 0);
  const totalIndicatorsImproved = dimensionImpacts.reduce(
    (sum, d) => sum + d.indicatorChanges.filter(ic => ic.change > 0).length, 0
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button style={styles.closeButton} onClick={onClose}>×</button>

        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroGlow} />
          <div style={styles.heroContent}>
            <span style={styles.heroLabel}>YOUR IMPACT</span>
            <div style={styles.heroNumber}>
              <span style={styles.heroPlus}>+</span>
              <span style={styles.heroValue}>{totalHealthScoreGain}</span>
              <span style={styles.heroUnit}>pts</span>
            </div>
            <span style={styles.heroSubtext}>
              {completedCount} actions completed · {totalIndicatorsImproved} indicators improved
            </span>
          </div>
        </div>

        {/* Dimensions */}
        <div style={styles.content}>
          {dimensionImpacts.map(impact => (
            <DimensionCard key={impact.dimension.dimensionKey} impact={impact} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Dimension Card Component
const DimensionCard: React.FC<{ impact: DimensionMeasuredImpact }> = ({ impact }) => {
  const scorePercent = (impact.currentHealthScore / 100) * 100;

  return (
    <div style={styles.card}>
      {/* Card Header with Score Ring */}
      <div style={styles.cardHeader}>
        <div style={styles.scoreRing}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke="#E4E6EB"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke="#36B37E"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${scorePercent * 2.01} 201`}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            {/* Center text */}
            <text x="40" y="36" textAnchor="middle" style={{ fontSize: '18px', fontWeight: 700, fill: '#172B4D' }}>
              {impact.currentHealthScore}
            </text>
            <text x="40" y="50" textAnchor="middle" style={{ fontSize: '10px', fill: '#6B778C' }}>
              percentile
            </text>
          </svg>
          {/* Change badge */}
          <div style={styles.changeBadge}>
            <span style={styles.changeBadgeText}>+{impact.healthScoreChange}</span>
          </div>
        </div>

        <div style={styles.cardInfo}>
          <h3 style={styles.cardTitle}>{impact.dimension.dimensionName}</h3>
          <div style={styles.cardMeta}>
            <span style={styles.metaItem}>
              <span style={styles.metaDot}>●</span> {impact.completedActions.length} actions
            </span>
            <span style={styles.metaItem}>
              <span style={styles.metaDot}>●</span> {impact.daysSinceStart}d ago
            </span>
          </div>
          <div style={styles.scoreChange}>
            <span style={styles.scoreFrom}>{impact.baselineHealthScore}</span>
            <span style={styles.scoreArrow}>→</span>
            <span style={styles.scoreTo}>{impact.currentHealthScore}</span>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {impact.indicatorChanges.length > 0 && (
        <div style={styles.indicators}>
          {impact.indicatorChanges.map(ic => (
            <IndicatorRow key={ic.indicatorId} indicator={ic} />
          ))}
        </div>
      )}
    </div>
  );
};

// Indicator Row Component
const IndicatorRow: React.FC<{ indicator: IndicatorChange }> = ({ indicator }) => {
  const isPositive = indicator.change > 0;
  const changeColor = isPositive ? '#36B37E' : '#DE350B';

  return (
    <div style={styles.indicator}>
      <div style={styles.indicatorMain}>
        <span style={styles.indicatorName}>{indicator.indicatorName}</span>
        <div style={styles.indicatorValues}>
          <span style={styles.indicatorBefore}>{indicator.baselineValue.toFixed(1)}</span>
          <svg width="20" height="12" viewBox="0 0 20 12" style={{ margin: '0 4px' }}>
            <path
              d="M0 6h14M10 1l5 5-5 5"
              fill="none"
              stroke={changeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ ...styles.indicatorAfter, color: changeColor }}>
            {indicator.currentValue.toFixed(1)}
          </span>
          <span style={styles.indicatorUnit}>{indicator.unit}</span>
        </div>
      </div>
      <div style={{
        ...styles.indicatorDelta,
        backgroundColor: isPositive ? '#E3FCEF' : '#FFEBE6',
        color: changeColor,
      }}>
        {isPositive ? '↑' : '↓'} {Math.abs(indicator.change).toFixed(1)}
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
    backgroundColor: 'rgba(9, 30, 66, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 24px 48px rgba(9, 30, 66, 0.3)',
    width: '520px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    fontSize: '24px',
    color: '#6B778C',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },

  // Hero Section
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #36B37E 0%, #00875A 100%)',
    padding: '40px 32px',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: '-50%',
    left: '-20%',
    width: '140%',
    height: '200%',
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroLabel: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '8px',
  },
  heroNumber: {
    display: 'flex',
    alignItems: 'baseline',
    color: '#FFFFFF',
    marginBottom: '12px',
  },
  heroPlus: {
    fontSize: '36px',
    fontWeight: 300,
    marginRight: '4px',
  },
  heroValue: {
    fontSize: '72px',
    fontWeight: 800,
    lineHeight: 1,
  },
  heroUnit: {
    fontSize: '24px',
    fontWeight: 600,
    marginLeft: '8px',
    opacity: 0.9,
  },
  heroSubtext: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Content
  content: {
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #E4E6EB',
  },
  scoreRing: {
    position: 'relative',
    flexShrink: 0,
  },
  changeBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    backgroundColor: '#36B37E',
    borderRadius: '12px',
    padding: '2px 8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },
  changeBadgeText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '6px',
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    marginBottom: '8px',
  },
  metaItem: {
    fontSize: '12px',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  metaDot: {
    fontSize: '6px',
    color: '#36B37E',
  },
  scoreChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreFrom: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#6B778C',
  },
  scoreArrow: {
    fontSize: '16px',
    color: '#36B37E',
  },
  scoreTo: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#36B37E',
  },

  // Indicators
  indicators: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  indicatorMain: {
    flex: 1,
    minWidth: 0,
  },
  indicatorName: {
    display: 'block',
    fontSize: '13px',
    color: '#42526E',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  indicatorValues: {
    display: 'flex',
    alignItems: 'center',
  },
  indicatorBefore: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#97A0AF',
  },
  indicatorAfter: {
    fontSize: '15px',
    fontWeight: 700,
  },
  indicatorUnit: {
    fontSize: '12px',
    color: '#6B778C',
    marginLeft: '4px',
  },
  indicatorDelta: {
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
  },
};

export default OverallImpactModal;
