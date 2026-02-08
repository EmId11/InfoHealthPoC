import React, { useState } from 'react';
import { Action, PlayCategory, PLAY_CATEGORIES } from '../../../types/playbook';
import PlayCard from './PlayCard';

interface ImprovementPlaysProps {
  actions: Action[];
  tryingActionIds: Set<string>;
  onToggleTrying: (actionId: string) => void;
  onViewDetails: (action: Action) => void;
}

const ImprovementPlays: React.FC<ImprovementPlaysProps> = ({
  actions,
  tryingActionIds,
  onToggleTrying,
  onViewDetails,
}) => {
  const [activeCategory, setActiveCategory] = useState<PlayCategory | 'all'>('all');

  const filteredActions = activeCategory === 'all'
    ? actions
    : actions.filter(a => a.category === activeCategory);

  // Sort actions: quick-wins first, then by impact (high first), then by effort (low first)
  const sortedActions = [...filteredActions].sort((a, b) => {
    // Quick wins first
    if (a.category === 'quick-win' && b.category !== 'quick-win') return -1;
    if (b.category === 'quick-win' && a.category !== 'quick-win') return 1;

    // Then by impact (high = 3, medium = 2, low = 1)
    const impactOrder = { high: 3, medium: 2, low: 1 };
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[b.impact] - impactOrder[a.impact];
    }

    // Then by effort (low = 1, medium = 2, high = 3) - lower is better
    const effortOrder = { low: 1, medium: 2, high: 3 };
    return effortOrder[a.implementation.effort] - effortOrder[b.implementation.effort];
  });

  // Count actions by category
  const getCategoryCount = (category: PlayCategory): number => {
    return actions.filter(a => a.category === category).length;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Improvement Plays</h3>
        <span style={styles.subtitle}>{actions.length} plays available</span>
      </div>

      {/* Explanation section */}
      <div style={styles.explanationSection}>
        <div style={styles.explanationContent}>
          <p style={styles.explanationText}>
            <strong>What are these plays?</strong> These are proven strategies to improve this dimension of your Jira health.
            Each play includes step-by-step implementation guidance, success metrics, and common pitfalls to avoid.
          </p>
          <p style={styles.explanationText}>
            <strong>Getting started:</strong> Click "Try this Play" to add it to My Plays.
            This helps you keep track of which improvements you're actively considering.
          </p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={styles.filterBar}>
        <button
          style={{
            ...styles.filterButton,
            ...(activeCategory === 'all' ? styles.filterButtonActive : {}),
          }}
          onClick={() => setActiveCategory('all')}
        >
          All ({actions.length})
        </button>
        {PLAY_CATEGORIES.map((cat) => {
          const count = getCategoryCount(cat.id);
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              style={{
                ...styles.filterButton,
                ...(activeCategory === cat.id ? styles.filterButtonActive : {}),
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span style={{ marginRight: '4px' }}>{cat.icon}</span>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Actions grid */}
      <div style={styles.actionsGrid}>
        {sortedActions.map((action) => (
          <PlayCard
            key={action.id}
            action={action}
            isTrying={tryingActionIds.has(action.id)}
            onToggleTrying={() => onToggleTrying(action.id)}
            onViewDetails={() => onViewDetails(action)}
          />
        ))}
      </div>

      {filteredActions.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No actions in this category.</p>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #E4E6EB',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6B778C',
  },
  explanationSection: {
    padding: '16px 20px',
    backgroundColor: '#F4F5F7',
    borderBottom: '1px solid #E4E6EB',
  },
  explanationContent: {
  },
  explanationText: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
    borderBottom: '1px solid #E4E6EB',
    overflowX: 'auto',
  },
  filterButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#F4F5F7',
    color: '#5E6C84',
    border: 'none',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  filterButtonActive: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
    padding: '20px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
};

export default ImprovementPlays;
