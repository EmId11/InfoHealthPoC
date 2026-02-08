import React, { useEffect } from 'react';
import { PriorityQuadrant, PrioritizedRecommendation } from '../../../types/assessment';
import { ACTION_TAG_CONFIG, QUADRANT_TO_TAG } from '../../../types/actionPlan';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface ActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quadrant: PriorityQuadrant;
  recommendations: PrioritizedRecommendation[];
  onDimensionClick: (dimensionKey: string) => void;
}

const getCategoryStyle = (category: PrioritizedRecommendation['category']): {
  label: string;
  bgColor: string;
  textColor: string;
} => {
  switch (category) {
    case 'process':
      return { label: 'Process', bgColor: '#DEEBFF', textColor: '#0747A6' };
    case 'tooling':
      return { label: 'Tooling', bgColor: '#E6FCFF', textColor: '#006644' };
    case 'culture':
      return { label: 'Culture', bgColor: '#EAE6FF', textColor: '#403294' };
    case 'governance':
      return { label: 'Governance', bgColor: '#FFEBE6', textColor: '#BF2600' };
  }
};

const getEffortStyle = (effort: PrioritizedRecommendation['effort']): { filled: number; color: string } => {
  switch (effort) {
    case 'low': return { filled: 1, color: '#36B37E' };
    case 'medium': return { filled: 2, color: '#FFAB00' };
    case 'high': return { filled: 3, color: '#DE350B' };
  }
};

const getImpactStyle = (impact: PrioritizedRecommendation['impact']): { filled: number; color: string } => {
  switch (impact) {
    case 'high': return { filled: 3, color: '#36B37E' };
    case 'medium': return { filled: 2, color: '#FFAB00' };
    case 'low': return { filled: 1, color: '#6B778C' };
  }
};

const DotRating: React.FC<{ filled: number; color: string }> = ({ filled, color }) => (
  <span style={styles.dotRating}>
    {[1, 2, 3].map((dot) => (
      <span
        key={dot}
        style={{
          ...styles.dot,
          backgroundColor: dot <= filled ? color : '#DFE1E6',
        }}
      />
    ))}
  </span>
);

const ActionsModal: React.FC<ActionsModalProps> = ({
  isOpen,
  onClose,
  quadrant,
  recommendations,
  onDimensionClick,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const tagConfig = ACTION_TAG_CONFIG[QUADRANT_TO_TAG[quadrant.quadrant]];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={{
              ...styles.tagBadge,
              color: tagConfig.color,
              backgroundColor: tagConfig.bgColor,
            }}>
              {tagConfig.label}
            </span>
            <h2 style={{ ...styles.title, color: quadrant.color }}>{quadrant.label}</h2>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="medium" primaryColor="#6B778C" />
          </button>
        </div>

        {/* Description */}
        <p style={styles.description}>{quadrant.description}</p>

        {/* Info banner */}
        <div style={styles.infoBanner}>
          <span style={styles.infoIcon}>i</span>
          <span style={styles.infoText}>
            These actions are automatically added to your Action Plan. View and manage them in the Action Plan tab.
          </span>
        </div>

        {/* Actions List */}
        <div style={styles.content}>
          {recommendations.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No actions available for this quadrant</p>
            </div>
          ) : (
            <div style={styles.actionsList}>
              {recommendations.map((rec) => {
                const categoryStyle = getCategoryStyle(rec.category);
                const effortStyle = getEffortStyle(rec.effort);
                const impactStyle = getImpactStyle(rec.impact);

                return (
                  <div key={rec.id} style={styles.actionCard}>
                    <div style={styles.actionHeader}>
                      <span style={styles.actionTitle}>{rec.title}</span>
                      <span style={{
                        ...styles.categoryBadge,
                        backgroundColor: categoryStyle.bgColor,
                        color: categoryStyle.textColor,
                      }}>
                        {categoryStyle.label}
                      </span>
                    </div>
                    <p style={styles.actionDescription}>{rec.description}</p>
                    <div style={styles.actionFooter}>
                      <button
                        style={styles.sourceLink}
                        onClick={() => {
                          onClose();
                          onDimensionClick(rec.sourceDimensionKey);
                        }}
                      >
                        <span>{rec.sourceDimension}</span>
                        <ChevronRightIcon label="" size="small" primaryColor="#0052CC" />
                      </button>
                      <div style={styles.metrics}>
                        <div style={styles.metricItem}>
                          <span style={styles.metricLabel}>Effort</span>
                          <DotRating filled={effortStyle.filled} color={effortStyle.color} />
                        </div>
                        <div style={styles.metricItem}>
                          <span style={styles.metricLabel}>Impact</span>
                          <DotRating filled={impactStyle.filled} color={impactStyle.color} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>
            {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} in this quadrant
          </span>
          <button style={styles.doneButton} onClick={onClose}>
            Close
          </button>
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
    padding: '24px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E4E6EB',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tagBadge: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  description: {
    margin: 0,
    padding: '12px 24px',
    fontSize: '14px',
    color: '#5E6C84',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #E4E6EB',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '16px 24px 0 24px',
    padding: '12px 14px',
    backgroundColor: '#DEEBFF',
    borderRadius: '6px',
    borderLeft: '3px solid #0052CC',
  },
  infoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
  },
  infoText: {
    fontSize: '13px',
    color: '#0747A6',
    lineHeight: 1.4,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 24px',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionCard: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
  },
  actionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px',
  },
  actionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.4,
    flex: 1,
  },
  categoryBadge: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    padding: '4px 8px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  actionDescription: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  actionFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  sourceLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#0052CC',
    cursor: 'pointer',
  },
  metrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  dotRating: {
    display: 'flex',
    gap: '3px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderTop: '1px solid #E4E6EB',
    backgroundColor: '#FAFBFC',
    borderRadius: '0 0 12px 12px',
  },
  footerText: {
    fontSize: '13px',
    color: '#6B778C',
  },
  doneButton: {
    padding: '10px 20px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};

export default ActionsModal;
