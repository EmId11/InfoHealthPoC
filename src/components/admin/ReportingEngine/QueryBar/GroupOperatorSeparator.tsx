import React from 'react';
import { LogicalOperator } from '../../../../types/reports';

interface GroupOperatorSeparatorProps {
  operator: LogicalOperator;
  onToggle: () => void;
}

const GroupOperatorSeparator: React.FC<GroupOperatorSeparatorProps> = ({
  operator,
  onToggle,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.line} />
      <button
        style={styles.badge}
        onClick={onToggle}
        title={`Click to switch to ${operator === 'OR' ? 'AND' : 'OR'}`}
      >
        {operator}
      </button>
      <div style={styles.line} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 0',
  },
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: '#DFE1E6',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    backgroundColor: '#EAE6FF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#6554C0',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '0.5px',
  },
};

export default GroupOperatorSeparator;
