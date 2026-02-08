// ProgressBreakdownCard - Reusable component for showing grouped progress
// Used in PlanHeader for priority and outcome breakdowns

import React from 'react';

interface ProgressItem {
  label: string;
  completed: number;
  total: number;
  percentage: number;
  color?: string;
}

interface ProgressBreakdownCardProps {
  title: string;
  items: ProgressItem[];
  compact?: boolean;
}

const ProgressBreakdownCard: React.FC<ProgressBreakdownCardProps> = ({
  title,
  items,
  compact = false,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div style={compact ? styles.containerCompact : styles.container}>
      <h4 style={styles.title}>{title}</h4>
      <div style={styles.itemsList}>
        {items.map((item, index) => (
          <div key={index} style={styles.item}>
            <div style={styles.itemHeader}>
              <span style={styles.itemLabel}>{item.label}</span>
              <span style={styles.itemStats}>
                {item.completed}/{item.total}
              </span>
            </div>
            <div style={styles.progressRow}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${item.percentage}%`,
                    backgroundColor: item.color || '#36B37E',
                  }}
                />
              </div>
              <span style={styles.percentage}>{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    minWidth: '200px',
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  containerCompact: {
    flex: 1,
    minWidth: '160px',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  itemStats: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: '#DFE1E6',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  percentage: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    minWidth: '32px',
    textAlign: 'right',
  },
};

export default ProgressBreakdownCard;
