import React from 'react';
import { ActionPlanItem } from '../../../types/actionPlan';

interface ProgressSectionProps {
  dimensionName: string;
  items: ActionPlanItem[];
  onViewActionPlan?: () => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
  dimensionName,
  items,
  onViewActionPlan,
}) => {
  const completedItems = items.filter(i => i.status === 'done');
  const inProgressItems = items.filter(i => i.status === 'in-progress');
  const pendingItems = items.filter(i => i.status === 'pending');
  const totalCount = items.length;

  const completedCount = completedItems.length;
  const inProgressCount = inProgressItems.length;
  const pendingCount = pendingItems.length;

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Don't show section if nothing is in plan
  if (totalCount === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>Your Progress</h3>
          <span style={styles.subtitle}>{dimensionName}</span>
        </div>
        {onViewActionPlan && (
          <button style={styles.viewAllButton} onClick={onViewActionPlan}>
            View Full Action Plan →
          </button>
        )}
      </div>

      <div style={styles.content}>
        {/* Progress visualization */}
        <div style={styles.progressRow}>
          {/* Progress ring */}
          <div style={styles.progressRingContainer}>
            <svg style={styles.progressRing} viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#E4E6EB"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={progressPercent === 100 ? '#36B37E' : '#0052CC'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 2.64} 264`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={styles.progressRingText}>
              <span style={styles.progressRingPercent}>{progressPercent}%</span>
            </div>
          </div>

          {/* Status breakdown */}
          <div style={styles.statusBreakdown}>
            <div style={styles.statusRow}>
              <span style={styles.statusDot} />
              <span style={styles.statusLabel}>Completed</span>
              <span style={styles.statusCount}>{completedCount}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={{ ...styles.statusDot, backgroundColor: '#0052CC' }} />
              <span style={styles.statusLabel}>In Progress</span>
              <span style={styles.statusCount}>{inProgressCount}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={{ ...styles.statusDot, backgroundColor: '#DFE1E6' }} />
              <span style={styles.statusLabel}>Pending</span>
              <span style={styles.statusCount}>{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Compact items as pills */}
        <div style={styles.itemsPills}>
          {/* In Progress items first */}
          {inProgressItems.map((item) => (
            <span key={item.id} style={{ ...styles.pill, ...styles.pillInProgress }}>
              <span style={styles.pillIcon}>◐</span>
              <span style={styles.pillText}>{item.recommendation.title}</span>
            </span>
          ))}

          {/* Pending items */}
          {pendingItems.map((item) => (
            <span key={item.id} style={{ ...styles.pill, ...styles.pillPending }}>
              <span style={styles.pillIcon}>○</span>
              <span style={styles.pillText}>{item.recommendation.title}</span>
            </span>
          ))}

          {/* Completed items */}
          {completedItems.map((item) => (
            <span key={item.id} style={{ ...styles.pill, ...styles.pillDone }}>
              <span style={styles.pillIcon}>✓</span>
              <span style={styles.pillText}>{item.recommendation.title}</span>
            </span>
          ))}
        </div>
      </div>
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
  headerLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
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
  viewAllButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#0052CC',
    border: 'none',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  content: {
    padding: '20px',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '16px',
  },
  progressRingContainer: {
    position: 'relative',
    width: '72px',
    height: '72px',
    flexShrink: 0,
  },
  progressRing: {
    width: '100%',
    height: '100%',
  },
  progressRingText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  progressRingPercent: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#172B4D',
  },
  statusBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#36B37E',
  },
  statusLabel: {
    fontSize: '13px',
    color: '#5E6C84',
    width: '80px',
  },
  statusCount: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },

  // Compact pills layout
  itemsPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 500,
    maxWidth: '250px',
  },
  pillInProgress: {
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
  },
  pillPending: {
    backgroundColor: '#F4F5F7',
    color: '#5E6C84',
  },
  pillDone: {
    backgroundColor: '#E3FCEF',
    color: '#006644',
    textDecoration: 'line-through',
  },
  pillIcon: {
    fontSize: '11px',
    flexShrink: 0,
  },
  pillText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

export default ProgressSection;
