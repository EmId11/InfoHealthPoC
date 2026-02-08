import React, { useState } from 'react';
import { OutcomePlayGroup, SuggestedPlay } from '../../../../types/improvementPlan';
import { getCategoryIcon, getEffortLabel, getImpactLabel } from '../../../../utils/improvementPlanUtils';

interface Step2_ReviewPlaysProps {
  outcomeGroups: OutcomePlayGroup[];
  allPlays: SuggestedPlay[];
  onPlayToggle: (playId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const Step2_ReviewPlays: React.FC<Step2_ReviewPlaysProps> = ({
  outcomeGroups,
  allPlays,
  onPlayToggle,
  onSelectAll,
  onClearAll,
}) => {
  const [expandedOutcomes, setExpandedOutcomes] = useState<Set<string>>(
    new Set(outcomeGroups.map(og => og.outcomeId))
  );
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());

  const selectedCount = allPlays.filter(p => p.isSelected).length;
  const totalPlays = allPlays.length;

  // Toggle outcome expansion
  const toggleOutcome = (outcomeId: string) => {
    setExpandedOutcomes(prev => {
      const next = new Set(prev);
      if (next.has(outcomeId)) {
        next.delete(outcomeId);
      } else {
        next.add(outcomeId);
      }
      return next;
    });
  };

  // Toggle dimension expansion
  const toggleDimension = (key: string) => {
    setExpandedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Get category color
  const getCategoryColor = (category: string): { bg: string; text: string } => {
    switch (category) {
      case 'quick-win': return { bg: '#E3FCEF', text: '#006644' };
      case 'process': return { bg: '#DEEBFF', text: '#0052CC' };
      case 'culture': return { bg: '#EAE6FF', text: '#5243AA' };
      case 'tooling': return { bg: '#FFF0B3', text: '#B65C02' };
      default: return { bg: '#F4F5F7', text: '#6B778C' };
    }
  };

  // Get score color (CHS thresholds: 30/45/55/70)
  const getScoreColor = (score: number): { bg: string; text: string } => {
    if (score < 30) return { bg: '#FFEBE6', text: '#DE350B' };     // Needs Attention
    if (score < 45) return { bg: '#FFF7ED', text: '#FF8B00' };     // Below Average
    if (score < 55) return { bg: '#F4F5F7', text: '#6B778C' };     // Average
    if (score < 70) return { bg: '#E3FCEF', text: '#00875A' };     // Good
    return { bg: '#E3FCEF', text: '#006644' };                      // Excellent
  };

  // Check if a play is selected (from allPlays)
  const isPlaySelected = (playId: string) => {
    return allPlays.find(p => p.playId === playId)?.isSelected ?? false;
  };

  // Count selected plays for an outcome
  const getOutcomeSelectedCount = (outcomeGroup: OutcomePlayGroup) => {
    let count = 0;
    for (const dim of outcomeGroup.dimensions) {
      for (const play of dim.plays) {
        if (isPlaySelected(play.playId)) count++;
      }
    }
    return count;
  };

  // Count total plays for an outcome
  const getOutcomeTotalPlays = (outcomeGroup: OutcomePlayGroup) => {
    let count = 0;
    for (const dim of outcomeGroup.dimensions) {
      count += dim.plays.length;
    }
    return count;
  };

  return (
    <div style={styles.container}>
      <p style={styles.description}>
        Based on your selected outcomes, here's your improvement plan. Toggle individual plays on or off.
      </p>

      {/* Actions bar */}
      <div style={styles.actionsBar}>
        <div style={styles.selectionInfo}>
          <strong>{selectedCount}</strong> of <strong>{totalPlays}</strong> plays selected
        </div>
        <div style={styles.bulkActions}>
          <button style={styles.bulkButton} onClick={onSelectAll}>
            Select All
          </button>
          <button style={styles.bulkButton} onClick={onClearAll}>
            Clear All
          </button>
        </div>
      </div>

      {/* Outcome groups */}
      <div style={styles.outcomesList}>
        {outcomeGroups.map((outcomeGroup) => {
          const isExpanded = expandedOutcomes.has(outcomeGroup.outcomeId);
          const selectedInOutcome = getOutcomeSelectedCount(outcomeGroup);
          const totalInOutcome = getOutcomeTotalPlays(outcomeGroup);

          return (
            <div key={outcomeGroup.outcomeId} style={styles.outcomeGroup}>
              {/* Outcome header */}
              <button
                style={styles.outcomeHeader}
                onClick={() => toggleOutcome(outcomeGroup.outcomeId)}
              >
                <div style={styles.priorityBadge}>
                  <span style={styles.priorityNumber}>{outcomeGroup.priority}</span>
                </div>
                <div style={styles.outcomeInfo}>
                  <span style={styles.outcomeName}>{outcomeGroup.outcomeName}</span>
                  <span style={styles.outcomeSubtitle}>
                    To improve this outcome, focus on:
                  </span>
                </div>
                <div style={styles.outcomeStats}>
                  <span style={styles.playCount}>
                    {selectedInOutcome}/{totalInOutcome} plays
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path d="M4 6L8 10L12 6" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {/* Dimensions within outcome */}
              {isExpanded && (
                <div style={styles.dimensionsList}>
                  {outcomeGroup.dimensions.map((dimensionGroup) => {
                    const dimKey = `${outcomeGroup.outcomeId}-${dimensionGroup.dimensionKey}`;
                    const isDimExpanded = expandedDimensions.has(dimKey) || true; // Default expanded
                    const scoreColor = getScoreColor(dimensionGroup.currentScore);
                    const selectedInDim = dimensionGroup.plays.filter(p => isPlaySelected(p.playId)).length;

                    return (
                      <div key={dimKey} style={styles.dimensionGroup}>
                        {/* Dimension header */}
                        <div style={styles.dimensionHeader}>
                          <div style={styles.dimensionConnector}>
                            <div style={styles.connectorLine} />
                            <div style={styles.connectorDot} />
                          </div>
                          <div style={styles.dimensionInfo}>
                            <div style={styles.dimensionTitleRow}>
                              <span style={styles.dimensionName}>{dimensionGroup.dimensionName}</span>
                              <span style={styles.dimensionWeight}>
                                ({Math.round(dimensionGroup.weight * 100)}% contribution)
                              </span>
                            </div>
                            <div style={styles.dimensionMeta}>
                              <span
                                style={{
                                  ...styles.dimensionScore,
                                  backgroundColor: scoreColor.bg,
                                  color: scoreColor.text,
                                }}
                              >
                                Current: {Math.round(dimensionGroup.currentScore)}/100
                              </span>
                              <span style={styles.dimPlayCount}>
                                {selectedInDim}/{dimensionGroup.plays.length} plays selected
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Plays within dimension */}
                        <div style={styles.playsList}>
                          {dimensionGroup.plays.map((play) => {
                            const isSelected = isPlaySelected(play.playId);
                            const categoryColor = getCategoryColor(play.category);

                            return (
                              <button
                                key={play.playId}
                                style={{
                                  ...styles.playCard,
                                  borderColor: isSelected ? '#5243AA' : '#E4E6EB',
                                  backgroundColor: isSelected ? '#FAFBFF' : '#FFFFFF',
                                }}
                                onClick={() => onPlayToggle(play.playId)}
                              >
                                <div style={styles.checkbox}>
                                  {isSelected ? (
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                      <rect x="1" y="1" width="16" height="16" rx="3" fill="#5243AA" />
                                      <path d="M5 9L8 12L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#C1C7D0" strokeWidth="2" />
                                    </svg>
                                  )}
                                </div>

                                <div style={styles.playInfo}>
                                  <span style={styles.playTitle}>{play.title}</span>
                                  <div style={styles.playMeta}>
                                    <span
                                      style={{
                                        ...styles.categoryBadge,
                                        backgroundColor: categoryColor.bg,
                                        color: categoryColor.text,
                                      }}
                                    >
                                      {getCategoryIcon(play.category)} {play.category === 'quick-win' ? 'Quick Win' : play.category}
                                    </span>
                                    <span style={styles.metaDot}>·</span>
                                    <span style={styles.impactLabel}>
                                      {play.impact === 'high' && '↑ '}
                                      {play.impact === 'medium' && '→ '}
                                      {play.impact === 'low' && '↓ '}
                                      {getImpactLabel(play.impact)}
                                    </span>
                                    <span style={styles.metaDot}>·</span>
                                    <span style={styles.effortLabel}>{getEffortLabel(play.effort)}</span>
                                  </div>
                                  {play.alsoImproves && play.alsoImproves.length > 0 && (
                                    <div style={styles.alsoImproves}>
                                      Also improves: {play.alsoImproves.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip */}
      {selectedCount > 8 && (
        <div style={styles.tip}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#FF8B00" strokeWidth="1.5" />
            <path d="M8 5v4M8 11v1" stroke="#FF8B00" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>You've selected {selectedCount} plays. Consider starting with 5-8 for better focus and follow-through.</span>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.6,
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  selectionInfo: {
    fontSize: '13px',
    color: '#172B4D',
  },
  bulkActions: {
    display: 'flex',
    gap: '8px',
  },
  bulkButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  outcomesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  outcomeGroup: {
    border: '1px solid #EBECF0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  outcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#F7F8FA',
    border: 'none',
    borderBottom: '1px solid #EBECF0',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  priorityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: '#5243AA',
    borderRadius: '6px',
    flexShrink: 0,
  },
  priorityNumber: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  outcomeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  },
  outcomeName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  outcomeSubtitle: {
    fontSize: '12px',
    color: '#6B778C',
  },
  outcomeStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  playCount: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
  },
  dimensionsList: {
    padding: '0',
  },
  dimensionGroup: {
    borderBottom: '1px solid #EBECF0',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
  },
  dimensionConnector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '20px',
    paddingTop: '4px',
    flexShrink: 0,
  },
  connectorLine: {
    width: '2px',
    height: '8px',
    backgroundColor: '#DFE1E6',
  },
  connectorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#5243AA',
  },
  dimensionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    paddingLeft: '8px',
  },
  dimensionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  dimensionName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionWeight: {
    fontSize: '12px',
    color: '#6B778C',
  },
  dimensionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  dimensionScore: {
    display: 'inline-flex',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  dimPlayCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  playsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px 16px 12px 44px',
  },
  playCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 12px',
    border: '1px solid',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    width: '100%',
  },
  checkbox: {
    flexShrink: 0,
    marginTop: '2px',
  },
  playInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: 0,
  },
  playTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  playMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  metaDot: {
    color: '#C1C7D0',
    fontSize: '10px',
  },
  impactLabel: {
    fontSize: '11px',
    color: '#5E6C84',
  },
  effortLabel: {
    fontSize: '11px',
    color: '#6B778C',
  },
  alsoImproves: {
    fontSize: '11px',
    color: '#5243AA',
    fontStyle: 'italic',
    marginTop: '2px',
  },
  tip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#FFFAE6',
    borderRadius: '8px',
    border: '1px solid #FFE380',
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default Step2_ReviewPlays;
