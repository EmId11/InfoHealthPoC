import React from 'react';
import { Action, getPlayCategoryConfig } from '../../../types/playbook';

interface PlayCardProps {
  action: Action;
  isTrying: boolean;
  onToggleTrying: () => void;
  onViewDetails: () => void;
}

const PlayCard: React.FC<PlayCardProps> = ({
  action,
  isTrying,
  onToggleTrying,
  onViewDetails,
}) => {
  const categoryConfig = getPlayCategoryConfig(action.category);

  const getEffortLabel = (effort: Action['implementation']['effort']): string => {
    switch (effort) {
      case 'low': return 'Low effort';
      case 'medium': return 'Medium effort';
      case 'high': return 'High effort';
    }
  };

  const getImpactLabel = (impact: Action['impact']): string => {
    switch (impact) {
      case 'low': return 'Low impact';
      case 'medium': return 'Medium impact';
      case 'high': return 'High impact';
    }
  };

  // Truncate problem description for card display
  const shortDescription = action.knowledge.problemSolved.length > 150
    ? action.knowledge.problemSolved.substring(0, 150) + '...'
    : action.knowledge.problemSolved;

  return (
    <div style={{
      ...styles.container,
      borderColor: isTrying ? '#ABF5D1' : '#E4E6EB',
      backgroundColor: isTrying ? '#F0FFF4' : '#FFFFFF',
    }}>
      <div style={styles.header}>
        <span style={{
          ...styles.categoryBadge,
          backgroundColor: categoryConfig.color + '15',
          color: categoryConfig.color,
        }}>
          <span style={styles.categoryIcon}>{categoryConfig.icon}</span>
          {categoryConfig.label}
        </span>
        {isTrying && (
          <span style={styles.tryingBadge}>
            Added
          </span>
        )}
      </div>

      <h4 style={styles.title}>{action.title}</h4>
      <p style={styles.description}>{shortDescription}</p>

      <div style={styles.meta}>
        <span style={styles.metaItem}>
          <span style={styles.metaIcon}>⏱</span>
          {action.implementation.timeToImplement}
        </span>
        <span style={styles.metaItem}>
          <span style={{
            ...styles.metaDot,
            backgroundColor: action.implementation.effort === 'low' ? '#36B37E' : action.implementation.effort === 'medium' ? '#FFAB00' : '#DE350B',
          }} />
          {getEffortLabel(action.implementation.effort)}
        </span>
        <span style={styles.metaItem}>
          <span style={{
            ...styles.metaDot,
            backgroundColor: action.impact === 'high' ? '#36B37E' : action.impact === 'medium' ? '#0065FF' : '#6B778C',
          }} />
          {getImpactLabel(action.impact)}
        </span>
      </div>

      {/* Experiment count hint */}
      {action.validation.experiments.length > 0 && (
        <div style={styles.experimentHint}>
          <span style={styles.experimentIcon}>🧪</span>
          {action.validation.experiments.length} experiment{action.validation.experiments.length > 1 ? 's' : ''} included
        </div>
      )}

      <div style={styles.actions}>
        <button
          style={isTrying ? styles.tryingButtonActive : styles.tryingButton}
          onClick={onToggleTrying}
        >
          {isTrying ? "Added ✓" : "Try this Play"}
        </button>
        <button
          style={styles.textButton}
          onClick={onViewDetails}
        >
          Learn More →
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  categoryIcon: {
    fontSize: '12px',
  },
  tryingBadge: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  description: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E4E6EB',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#6B778C',
  },
  metaIcon: {
    fontSize: '12px',
  },
  metaDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  experimentHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6554C0',
    backgroundColor: '#EAE6FF',
    padding: '6px 10px',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  experimentIcon: {
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  tryingButton: {
    padding: '8px 16px',
    backgroundColor: '#F4F5F7',
    color: '#42526E',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tryingButtonActive: {
    padding: '8px 16px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    border: '1px solid #ABF5D1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  textButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#5E6C84',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  },
};

export default PlayCard;
