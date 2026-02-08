import React, { useState, useCallback } from 'react';
import { OutcomeConfidenceResult } from '../../../../types/outcomeConfidence';
import { OUTCOME_DEFINITIONS } from '../../../../constants/outcomeDefinitions';

interface Step1_SelectTargetsProps {
  outcomes: OutcomeConfidenceResult[];
  selectedOutcomes: string[]; // Ordered by priority (first = highest)
  onOutcomesChange: (orderedOutcomes: string[]) => void;
}

const Step1_SelectTargets: React.FC<Step1_SelectTargetsProps> = ({
  outcomes,
  selectedOutcomes,
  onOutcomesChange,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get score color based on CHS thresholds (30/45/55/70)
  const getScoreColor = (score: number): { bg: string; text: string; border: string } => {
    if (score < 30) return { bg: '#FFEBE6', text: '#DE350B', border: '#FFBDAD' };     // Needs Attention
    if (score < 45) return { bg: '#FFF7ED', text: '#FF8B00', border: '#FFE380' };     // Below Average
    if (score < 55) return { bg: '#F4F5F7', text: '#6B778C', border: '#DFE1E6' };     // Average
    if (score < 70) return { bg: '#E3FCEF', text: '#00875A', border: '#79F2C0' };     // Good
    return { bg: '#E3FCEF', text: '#006644', border: '#ABF5D1' };                      // Excellent
  };

  // Sort outcomes by score (worst first) for the unselected list
  const sortedOutcomes = [...outcomes].sort((a, b) => a.finalScore - b.finalScore);

  // Get selected outcomes in priority order
  const selectedOutcomeData = selectedOutcomes
    .map(id => outcomes.find(o => o.id === id))
    .filter((o): o is OutcomeConfidenceResult => o !== undefined);

  // Get unselected outcomes
  const unselectedOutcomes = sortedOutcomes.filter(o => !selectedOutcomes.includes(o.id));

  // Get contributing dimensions for an outcome (for preview)
  const getContributingDimensions = (outcomeId: string): string[] => {
    const outcome = OUTCOME_DEFINITIONS.find(o => o.id === outcomeId);
    if (!outcome) return [];
    return outcome.dimensions
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(d => d.dimensionKey);
  };

  // Handle outcome toggle
  const handleOutcomeToggle = useCallback((outcomeId: string) => {
    if (selectedOutcomes.includes(outcomeId)) {
      // Remove from selection
      onOutcomesChange(selectedOutcomes.filter(id => id !== outcomeId));
    } else {
      // Add to end of selection
      onOutcomesChange([...selectedOutcomes, outcomeId]);
    }
  }, [selectedOutcomes, onOutcomesChange]);

  // Drag handlers for reordering selected outcomes
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...selectedOutcomes];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    onOutcomesChange(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, selectedOutcomes, onOutcomesChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Move item up/down (for accessibility)
  const moveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedOutcomes.length) return;

    const newOrder = [...selectedOutcomes];
    const temp = newOrder[index];
    newOrder[index] = newOrder[newIndex];
    newOrder[newIndex] = temp;

    onOutcomesChange(newOrder);
  }, [selectedOutcomes, onOutcomesChange]);

  return (
    <div style={styles.container}>
      <p style={styles.description}>
        Which outcomes do you want to improve? Select and drag to prioritize (most important first).
      </p>

      {/* Tip */}
      <div style={styles.tip}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#5243AA" strokeWidth="1.5" />
          <path d="M8 5v4M8 11v1" stroke="#5243AA" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>Focus on 2-3 outcomes for best results. We'll suggest specific actions for each.</span>
      </div>

      {/* Selected outcomes (prioritized) */}
      {selectedOutcomeData.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Your Priorities
            <span style={styles.sectionSubtitle}>Drag to reorder (most important first)</span>
          </h3>
          <div style={styles.priorityList}>
            {selectedOutcomeData.map((outcome, index) => {
              const colors = getScoreColor(outcome.finalScore);
              const isDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={outcome.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    ...styles.priorityCard,
                    opacity: isDragged ? 0.5 : 1,
                    borderColor: isDragOver ? '#5243AA' : '#5243AA',
                    backgroundColor: isDragOver ? '#F4F0FF' : '#FAFBFF',
                    transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Priority number */}
                  <div style={styles.priorityNumber}>
                    <span style={styles.priorityText}>{index + 1}</span>
                  </div>

                  {/* Drag handle */}
                  <div style={styles.dragHandle}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#6B778C">
                      <path d="M4 4H6V6H4V4ZM10 4H12V6H10V4ZM4 7H6V9H4V7ZM10 7H12V9H10V7ZM4 10H6V12H4V10ZM10 10H12V12H10V10Z" />
                    </svg>
                  </div>

                  {/* Outcome info */}
                  <div style={styles.outcomeInfo}>
                    <span style={styles.outcomeName}>{outcome.name}</span>
                    <span style={styles.outcomeQuestion}>{outcome.question}</span>
                  </div>

                  {/* Score */}
                  <div style={styles.scoreArea}>
                    <span
                      style={{
                        ...styles.scoreBadge,
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                    >
                      {Math.round(outcome.finalScore)}%
                    </span>
                  </div>

                  {/* Move buttons */}
                  <div style={styles.moveButtons}>
                    <button
                      style={{
                        ...styles.moveButton,
                        opacity: index === 0 ? 0.3 : 1,
                      }}
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 3L7 11M7 3L3 7M7 3L11 7" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      style={{
                        ...styles.moveButton,
                        opacity: index === selectedOutcomeData.length - 1 ? 0.3 : 1,
                      }}
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === selectedOutcomeData.length - 1}
                      title="Move down"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 11L7 3M7 11L3 7M7 11L11 7" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    style={styles.removeButton}
                    onClick={() => handleOutcomeToggle(outcome.id)}
                    title="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available outcomes */}
      {unselectedOutcomes.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {selectedOutcomes.length > 0 ? 'Add More Outcomes' : 'Select Outcomes to Improve'}
            <span style={styles.sectionSubtitle}>Click to add to your priorities</span>
          </h3>
          <div style={styles.optionsList}>
            {unselectedOutcomes.map((outcome) => {
              const colors = getScoreColor(outcome.finalScore);
              const needsAttention = outcome.finalScore < 50;
              const contributingDims = getContributingDimensions(outcome.id);

              return (
                <button
                  key={outcome.id}
                  style={styles.optionCard}
                  onClick={() => handleOutcomeToggle(outcome.id)}
                >
                  <div style={styles.optionMain}>
                    <div style={styles.checkbox}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="1" y="1" width="16" height="16" rx="3" stroke="#C1C7D0" strokeWidth="2" />
                      </svg>
                    </div>
                    <div style={styles.optionInfo}>
                      <span style={styles.optionName}>{outcome.name}</span>
                      <span style={styles.optionQuestion}>{outcome.question}</span>
                    </div>
                  </div>
                  <div style={styles.optionScore}>
                    <span
                      style={{
                        ...styles.scoreBadge,
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                    >
                      {Math.round(outcome.finalScore)}%
                    </span>
                    {needsAttention && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="#FF8B00">
                        <path d="M8 1l7 13H1L8 1z" fill="none" stroke="#FF8B00" strokeWidth="1.5" />
                        <path d="M8 6v3M8 11v1" stroke="#FF8B00" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection summary */}
      <div style={styles.selectionSummary}>
        <strong>{selectedOutcomes.length}</strong> outcome{selectedOutcomes.length !== 1 ? 's' : ''} selected
        {selectedOutcomes.length > 0 && selectedOutcomes.length <= 3 && (
          <span style={styles.summaryHint}> — Good focus!</span>
        )}
        {selectedOutcomes.length > 3 && (
          <span style={styles.summaryWarning}> — Consider focusing on fewer for better results</span>
        )}
      </div>
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
  tip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#F4F0FF',
    borderRadius: '8px',
    border: '1px solid #DFD8FD',
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionSubtitle: {
    fontSize: '12px',
    fontWeight: 400,
    color: '#6B778C',
  },
  priorityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  priorityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    border: '2px solid #5243AA',
    borderRadius: '8px',
    backgroundColor: '#FAFBFF',
    cursor: 'grab',
    transition: 'all 0.15s ease',
  },
  priorityNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    backgroundColor: '#5243AA',
    borderRadius: '50%',
    flexShrink: 0,
  },
  priorityText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    padding: '4px',
    flexShrink: 0,
  },
  outcomeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  },
  outcomeName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  outcomeQuestion: {
    fontSize: '12px',
    color: '#6B778C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  scoreArea: {
    flexShrink: 0,
  },
  moveButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexShrink: 0,
  },
  moveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    flexShrink: 0,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  optionMain: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  checkbox: {
    flexShrink: 0,
    marginTop: '2px',
  },
  optionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  },
  optionName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  optionQuestion: {
    fontSize: '12px',
    color: '#6B778C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  optionScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '12px',
  },
  scoreBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid',
  },
  selectionSummary: {
    padding: '12px 16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#172B4D',
    textAlign: 'center',
  },
  summaryHint: {
    color: '#006644',
  },
  summaryWarning: {
    color: '#FF8B00',
  },
};

export default Step1_SelectTargets;
