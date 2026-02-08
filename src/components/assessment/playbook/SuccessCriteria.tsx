import React from 'react';
import { SuccessCriterion } from '../../../types/playbook';

interface SuccessCriteriaProps {
  criteria: SuccessCriterion[];
}

const SuccessCriteria: React.FC<SuccessCriteriaProps> = ({ criteria }) => {
  const metCount = criteria.filter(c => c.isMet).length;
  const totalCount = criteria.length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>What Good Looks Like</h3>
        <span style={styles.badge}>
          {metCount} of {totalCount} criteria met
        </span>
      </div>

      <div style={styles.content}>
        <div style={styles.criteriaList}>
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              style={{
                ...styles.criterionRow,
                backgroundColor: criterion.isMet ? '#F6FFF8' : '#FFFFFF',
                borderColor: criterion.isMet ? '#B7EB8F' : '#E4E6EB',
              }}
            >
              <div style={styles.criterionIcon}>
                {criterion.isMet ? (
                  <span style={{ color: '#36B37E' }}>✓</span>
                ) : (
                  <span style={{ color: '#DE350B' }}>✗</span>
                )}
              </div>
              <div style={styles.criterionContent}>
                <div style={styles.criterionHeader}>
                  <span style={styles.criterionLabel}>{criterion.label}</span>
                  <span style={styles.criterionDescription}>{criterion.description}</span>
                </div>
                <div style={styles.criterionValues}>
                  <div style={styles.valueBox}>
                    <span style={styles.valueLabel}>Current</span>
                    <span style={{
                      ...styles.valueNumber,
                      color: criterion.isMet ? '#36B37E' : '#DE350B',
                    }}>
                      {typeof criterion.currentValue === 'number'
                        ? criterion.currentValue.toFixed(0)
                        : criterion.currentValue}
                      {criterion.unit}
                    </span>
                  </div>
                  <div style={styles.valueArrow}>→</div>
                  <div style={styles.valueBox}>
                    <span style={styles.valueLabel}>Target</span>
                    <span style={styles.valueNumber}>
                      {typeof criterion.targetValue === 'number'
                        ? (criterion.unit === 'days' ? '< ' : '') + criterion.targetValue
                        : criterion.targetValue}
                      {criterion.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div style={styles.progressBar}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(metCount / totalCount) * 100}%`,
              }}
            />
          </div>
          <span style={styles.progressLabel}>
            {metCount === totalCount
              ? 'All criteria met! Excellent work.'
              : metCount === 0
              ? 'Focus on achieving your first criterion.'
              : `${totalCount - metCount} more to reach target state.`}
          </span>
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
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  badge: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  content: {
    padding: '20px',
  },
  criteriaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  criterionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
    transition: 'all 0.2s ease',
  },
  criterionIcon: {
    fontSize: '18px',
    fontWeight: 700,
    flexShrink: 0,
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  criterionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  criterionLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  criterionDescription: {
    fontSize: '12px',
    color: '#6B778C',
  },
  criterionValues: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  valueBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  valueLabel: {
    fontSize: '10px',
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  valueNumber: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  valueArrow: {
    fontSize: '14px',
    color: '#6B778C',
  },
  progressBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  progressTrack: {
    height: '6px',
    backgroundColor: '#DFE1E6',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#5E6C84',
    textAlign: 'center',
  },
};

export default SuccessCriteria;
