import React from 'react';
import { TemplateQuestion, QUESTION_CATEGORY_LABELS } from '../../../types/questionBuilder';
import { getEntityLabel, getFieldById, getOperatorLabel, QueryCondition, QueryConditionGroup } from '../../../types/reports';

interface InterpretedQueryDisplayProps {
  question: TemplateQuestion;
}

const InterpretedQueryDisplay: React.FC<InterpretedQueryDisplayProps> = ({
  question,
}) => {
  const { underlyingQuery } = question;
  const entityLabel = getEntityLabel(underlyingQuery.entityType);

  // Extract conditions for display
  const getConditionPills = (): React.ReactNode[] => {
    const pills: React.ReactNode[] = [];

    underlyingQuery.groups.forEach((group: QueryConditionGroup, groupIndex: number) => {
      group.conditions.forEach((condition: QueryCondition, condIndex: number) => {
        if (!condition.fieldId) return;

        const field = getFieldById(condition.fieldId, underlyingQuery.entityType);
        if (!field) return;

        // Add group separator if not first group
        if (groupIndex > 0 && condIndex === 0) {
          pills.push(
            <span key={`sep-${groupIndex}`} style={styles.operatorText}>
              {underlyingQuery.groupOperator}
            </span>
          );
        }

        // Add condition separator within group
        if (condIndex > 0) {
          pills.push(
            <span key={`sep-${groupIndex}-${condIndex}`} style={styles.operatorText}>
              {group.logicalOperator}
            </span>
          );
        }

        // Add field pill
        pills.push(
          <span key={`field-${groupIndex}-${condIndex}`} style={styles.pill}>
            <span style={styles.pillLabel}>{field.label}</span>
            <span style={styles.pillOperator}>{getOperatorLabel(condition.operator)}</span>
            <span style={styles.pillValue}>{formatConditionValue(condition)}</span>
          </span>
        );
      });
    });

    return pills;
  };

  const formatConditionValue = (condition: QueryCondition): string => {
    const { value } = condition;

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
      if (value.length <= 2) {
        return value.join(', ');
      }
      return `${value.slice(0, 2).join(', ')} +${value.length - 2} more`;
    }

    return String(value);
  };

  const conditionPills = getConditionPills();

  return (
    <div style={styles.container}>
      {/* Question Header */}
      <div style={styles.header}>
        <div style={styles.questionText}>"{question.question}"</div>
        <span style={styles.categoryBadge}>
          {QUESTION_CATEGORY_LABELS[question.category]}
        </span>
      </div>

      {/* Interpreted Query */}
      <div style={styles.interpretedSection}>
        <div style={styles.interpretedLabel}>Interpreted as:</div>
        <div style={styles.pillsContainer}>
          <span style={styles.entityPill}>{entityLabel}</span>
          {conditionPills.length > 0 && (
            <>
              <span style={styles.whereText}>where</span>
              {conditionPills}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px 24px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #EBECF0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  questionText: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
    fontStyle: 'italic',
  },
  categoryBadge: {
    padding: '4px 10px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  interpretedSection: {
    marginBottom: '0',
  },
  interpretedLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  pillsContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  entityPill: {
    padding: '6px 12px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
  },
  whereText: {
    fontSize: '13px',
    color: '#6B778C',
    fontWeight: 500,
  },
  operatorText: {
    fontSize: '13px',
    color: '#6B778C',
    fontWeight: 600,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '13px',
    gap: '6px',
  },
  pillLabel: {
    fontWeight: 600,
    color: '#172B4D',
  },
  pillOperator: {
    color: '#6B778C',
  },
  pillValue: {
    fontWeight: 500,
    color: '#0052CC',
  },
};

export default InterpretedQueryDisplay;
