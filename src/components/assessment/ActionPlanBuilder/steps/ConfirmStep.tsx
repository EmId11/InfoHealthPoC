import React from 'react';
import { useBuilderContext } from '../BuilderContext';
import { DIMENSION_EXPLANATIONS } from '../../../../types/actionPlanBuilder';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';

const ConfirmStep: React.FC = () => {
  const { computed, state } = useBuilderContext();

  // Count quick wins in selection
  const quickWinsSelected = computed.selectedItems.filter(
    s => s.recommendation.effort === 'low' && s.recommendation.impact === 'high'
  ).length;

  // Count high impact actions
  const highImpactCount = computed.selectedItems.filter(
    s => s.recommendation.impact === 'high'
  ).length;

  // Get selected dimensions for coverage display
  const selectedDimensions = state.dimensions.filter(d => d.isSelected);

  return (
    <div style={styles.container}>
      {/* Success card */}
      <div style={styles.successCard}>
        <CheckCircleIcon label="" size="xlarge" primaryColor="#36B37E" />
        <h2 style={styles.successTitle}>Your plan is ready!</h2>
        <p style={styles.successSubtitle}>
          Review your action plan below, then click "Launch Plan" to get started.
        </p>
      </div>

      {/* Summary grid */}
      <div style={styles.summaryGrid}>
        {/* Total actions */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{computed.selectedActionCount}</div>
          <div style={styles.summaryLabel}>Total Actions</div>
        </div>

        {/* Areas covered */}
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryValue, color: '#0052CC' }}>
            {computed.selectedDimensionCount}
          </div>
          <div style={styles.summaryLabel}>Areas</div>
        </div>

        {/* Quick wins */}
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryValue, color: '#36B37E' }}>
            {quickWinsSelected}
          </div>
          <div style={styles.summaryLabel}>Quick Wins</div>
        </div>

        {/* High impact */}
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryValue, color: '#0052CC' }}>
            {highImpactCount}
          </div>
          <div style={styles.summaryLabel}>High Impact</div>
        </div>
      </div>

      {/* Dimensions Coverage */}
      <div style={styles.breakdownSection}>
        <h3 style={styles.sectionTitle}>Areas You're Improving</h3>
        <div style={styles.dimensionCoverage}>
          {selectedDimensions.map(dimension => {
            const dimensionActions = computed.actionsByDimension.get(dimension.dimensionKey) || [];
            const selectedInDimension = dimensionActions.filter(a => a.selected).length;
            const explanation = DIMENSION_EXPLANATIONS[dimension.dimensionKey] || {
              title: dimension.dimensionName,
            };

            return (
              <div key={dimension.dimensionKey} style={styles.dimensionItem}>
                <div style={styles.dimensionInfo}>
                  <span style={styles.dimensionName}>{explanation.title}</span>
                  <span style={styles.dimensionStats}>
                    {selectedInDimension} action{selectedInDimension !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div style={{
                  ...styles.dimensionHealthBadge,
                  backgroundColor: dimension.healthStatus === 'at-risk' ? '#FFEBE6' :
                                   dimension.healthStatus === 'needs-attention' ? '#FFFAE6' : '#E3FCEF',
                  color: dimension.healthStatus === 'at-risk' ? '#DE350B' :
                         dimension.healthStatus === 'needs-attention' ? '#FF8B00' : '#006644',
                }}>
                  {dimension.healthScore}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Effort/Impact summary */}
      <div style={styles.effortImpact}>
        <div style={styles.effortImpactItem}>
          <span style={styles.eiLabel}>Overall Effort:</span>
          <span style={{
            ...styles.eiValue,
            color: computed.effortSummary === 'low' ? '#36B37E' :
                   computed.effortSummary === 'medium' ? '#FFAB00' : '#DE350B'
          }}>
            {computed.effortSummary}
          </span>
        </div>
        <div style={styles.effortImpactItem}>
          <span style={styles.eiLabel}>Expected Impact:</span>
          <span style={{
            ...styles.eiValue,
            color: computed.impactSummary === 'high' ? '#36B37E' :
                   computed.impactSummary === 'medium' ? '#FFAB00' : '#DE350B'
          }}>
            {computed.impactSummary}
          </span>
        </div>
      </div>

      {/* What to expect */}
      <div style={styles.expectation}>
        <h3 style={styles.sectionTitle}>What happens next?</h3>
        <ul style={styles.expectationList}>
          <li>Your actions will appear in the <strong>Action Plan</strong> tab</li>
          <li>Mark actions as "In Progress" or "Done" as you work through them</li>
          <li>Re-run assessments periodically to see your health score improve</li>
          <li>You can add more actions or adjust priorities anytime</li>
        </ul>
      </div>

      {/* Commitment statement */}
      <div style={styles.commitment}>
        <p style={styles.commitmentText}>
          Click <strong>"Launch Plan"</strong> to commit to{' '}
          <strong>{computed.selectedActionCount} action{computed.selectedActionCount !== 1 ? 's' : ''}</strong>{' '}
          and start improving your Jira health.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  successCard: {
    textAlign: 'center',
    padding: '32px',
    backgroundColor: '#E3FCEF',
    borderRadius: '12px',
    border: '1px solid #ABF5D1',
  },
  successTitle: {
    margin: '16px 0 8px',
    fontSize: '24px',
    fontWeight: 600,
    color: '#006644',
  },
  successSubtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#00875A',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  summaryCard: {
    padding: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  summaryLabel: {
    marginTop: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  breakdownSection: {
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionCoverage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dimensionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
  },
  dimensionInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dimensionName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionStats: {
    fontSize: '12px',
    color: '#6B778C',
  },
  dimensionHealthBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
  },
  effortImpact: {
    display: 'flex',
    gap: '32px',
    padding: '16px 20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  effortImpactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  eiLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  eiValue: {
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'capitalize',
  },
  expectation: {
    padding: '16px 20px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
  },
  expectationList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#0747A6',
    lineHeight: 1.8,
  },
  commitment: {
    padding: '16px 20px',
    backgroundColor: '#FFFAE6',
    borderRadius: '8px',
    textAlign: 'center',
  },
  commitmentText: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
};

export default ConfirmStep;
