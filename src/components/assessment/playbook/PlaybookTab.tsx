import React, { useState, useMemo } from 'react';
import { DimensionResult } from '../../../types/assessment';
import { Action, SuccessCriterion, ComputedMaturity, computeMaturityLevel } from '../../../types/playbook';
import { getPlaybookForDimension, hasPlaybookContent } from '../../../constants/playbookContent';
import MaturitySnapshot from './MaturitySnapshot';
import SuccessCriteria from './SuccessCriteria';
import ImprovementPlays from './ImprovementPlays';
import PlayDetailModal from './PlayDetailModal';

interface PlaybookTabProps {
  dimension: DimensionResult;
  tryingActionIds: Set<string>;
  onToggleTrying: (action: Action) => void;
}

const PlaybookTab: React.FC<PlaybookTabProps> = ({
  dimension,
  tryingActionIds,
  onToggleTrying,
}) => {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Get playbook content for this dimension
  const playbook = getPlaybookForDimension(dimension.dimensionKey);

  // Compute maturity level from dimension data
  const maturity = useMemo((): ComputedMaturity => {
    const healthScore = dimension.healthScore;
    const levelInfo = computeMaturityLevel(healthScore);

    // Count healthy indicators (benchmarkPercentile >= 50 is considered healthy)
    let healthyCount = 0;
    let totalCount = 0;
    dimension.categories.forEach(cat => {
      cat.indicators.forEach(ind => {
        totalCount++;
        if (ind.benchmarkPercentile >= 50) healthyCount++;
      });
    });

    return {
      level: levelInfo.level,
      levelInfo,
      healthScore,
      healthyIndicatorCount: healthyCount,
      totalIndicatorCount: totalCount,
      healthyIndicatorRatio: totalCount > 0 ? healthyCount / totalCount : 0,
    };
  }, [dimension]);

  // Compute success criteria values from dimension indicators
  const successCriteria = useMemo((): SuccessCriterion[] => {
    if (!playbook) return [];

    return playbook.successCriteria.map(template => {
      // Try to find matching indicator for dynamic values
      let currentValue: number | string = 'N/A';
      let isMet = false;

      // Look through dimension categories for matching indicator
      dimension.categories.forEach(cat => {
        cat.indicators.forEach(ind => {
          if (ind.id === template.indicatorId || ind.name.toLowerCase().includes(template.label.toLowerCase())) {
            currentValue = ind.value;
            // Compare with target (simplified logic)
            const targetNum = typeof template.targetValue === 'number' ? template.targetValue : parseFloat(String(template.targetValue));
            const currentNum = typeof currentValue === 'number' ? currentValue : parseFloat(String(currentValue));

            if (!isNaN(targetNum) && !isNaN(currentNum)) {
              // For 'days' unit, lower is better
              if (template.unit === 'days') {
                isMet = currentNum <= targetNum;
              } else {
                isMet = currentNum >= targetNum;
              }
            }
          }
        });
      });

      // If no indicator found, use simulated value based on risk level
      if (currentValue === 'N/A') {
        const targetNum = typeof template.targetValue === 'number' ? template.targetValue : 85;
        const baseValue = dimension.riskLevel === 'low' ? targetNum + 5 :
                          dimension.riskLevel === 'moderate' ? targetNum - 15 :
                          targetNum - 30;
        currentValue = Math.max(0, Math.min(100, baseValue + Math.floor(Math.random() * 10)));
        isMet = currentValue >= targetNum;
      }

      return {
        ...template,
        currentValue,
        isMet,
      };
    });
  }, [dimension, playbook]);

  // No playbook content available
  if (!playbook || !hasPlaybookContent(dimension.dimensionKey)) {
    return (
      <div style={styles.container}>
        <div style={styles.comingSoon}>
          <div style={styles.comingSoonIcon}>📚</div>
          <h3 style={styles.comingSoonTitle}>Playbook Coming Soon</h3>
          <p style={styles.comingSoonText}>
            We're developing detailed coaching content for <strong>{dimension.dimensionName}</strong>.
            In the meantime, check out the recommendations below.
          </p>

          {/* Show existing recommendations */}
          <div style={styles.fallbackRecommendations}>
            <h4 style={styles.fallbackTitle}>Current Recommendations</h4>
            <div style={styles.recommendationsList}>
              {dimension.recommendations.map((rec) => (
                <div key={rec.id} style={styles.recommendationCard}>
                  <h5 style={styles.recTitle}>{rec.title}</h5>
                  <p style={styles.recDescription}>{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get actions - handle both old (plays) and new (actions) structure
  const actions = playbook.actions || [];

  return (
    <div style={styles.container}>
      {/* Overview */}
      <div style={styles.overview}>
        <p style={styles.overviewText}>{playbook.overview}</p>
      </div>

      {/* Two-column layout for top sections */}
      <div style={styles.topRow}>
        <MaturitySnapshot maturity={maturity} playbook={playbook} />
        <SuccessCriteria criteria={successCriteria} />
      </div>

      {/* Improvement Actions - full width */}
      <ImprovementPlays
        actions={actions}
        tryingActionIds={tryingActionIds}
        onToggleTrying={(actionId: string) => {
          const action = actions.find(a => a.id === actionId);
          if (action) onToggleTrying(action);
        }}
        onViewDetails={setSelectedAction}
      />

      {/* Action Detail Modal */}
      {selectedAction && (
        <PlayDetailModal
          action={selectedAction}
          isTrying={tryingActionIds.has(selectedAction.id)}
          onClose={() => setSelectedAction(null)}
          onToggleTrying={() => onToggleTrying(selectedAction)}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  overview: {
    padding: '16px 20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '10px',
    borderLeft: '4px solid #0052CC',
  },
  overviewText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px',
  },

  // Coming soon / fallback styles
  comingSoon: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  comingSoonIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  comingSoonTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  comingSoonText: {
    margin: '0 0 32px 0',
    fontSize: '15px',
    color: '#5E6C84',
    lineHeight: 1.5,
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  fallbackRecommendations: {
    textAlign: 'left',
    marginTop: '24px',
  },
  fallbackTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  recommendationsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  recommendationCard: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
  },
  recTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  recDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
};

export default PlaybookTab;
