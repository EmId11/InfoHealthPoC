import React, { useState } from 'react';
import { Action, getPlayCategoryConfig } from '../../../types/playbook';

interface PlayDetailModalProps {
  action: Action;
  isTrying: boolean;
  onClose: () => void;
  onToggleTrying: () => void;
}

type TabId = 'overview' | 'implementation' | 'validation' | 'pitfalls' | 'faq';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: '📖' },
  { id: 'implementation', label: 'How to Implement', icon: '🔧' },
  { id: 'validation', label: 'Measuring Success', icon: '📊' },
  { id: 'pitfalls', label: 'Watch Out For', icon: '⚠️' },
  { id: 'faq', label: 'FAQ', icon: '❓' },
];

const PlayDetailModal: React.FC<PlayDetailModalProps> = ({
  action,
  isTrying,
  onClose,
  onToggleTrying,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const categoryConfig = getPlayCategoryConfig(action.category);

  const getEffortColor = (effort: Action['implementation']['effort']): string => {
    switch (effort) {
      case 'low': return '#36B37E';
      case 'medium': return '#FF8B00';
      case 'high': return '#DE350B';
    }
  };

  const getImpactColor = (impact: Action['impact']): string => {
    switch (impact) {
      case 'high': return '#36B37E';
      case 'medium': return '#0065FF';
      case 'low': return '#6B778C';
    }
  };

  const renderOverviewTab = () => (
    <div style={styles.tabContent}>
      {/* Problem Solved */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Problem This Solves</h4>
        <p style={styles.text}>{action.knowledge.problemSolved}</p>
      </section>

      {/* Why It Works */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Why This Works</h4>
        <p style={styles.text}>{action.knowledge.whyItWorks}</p>
      </section>

      {/* Background */}
      {action.knowledge.background && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Background</h4>
          <p style={styles.textMuted}>{action.knowledge.background}</p>
        </section>
      )}

      {/* Resources */}
      {action.knowledge.resources.length > 0 && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Resources</h4>
          <div style={styles.resourceList}>
            {action.knowledge.resources.map((resource, index) => (
              <div key={index} style={styles.resourceCard}>
                <span style={styles.resourceType}>{resource.type.toUpperCase()}</span>
                <span style={styles.resourceTitle}>{resource.title}</span>
                <p style={styles.resourceDescription}>{resource.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderImplementationTab = () => (
    <div style={styles.tabContent}>
      {/* Overview */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Overview</h4>
        <p style={styles.text}>{action.implementation.overview}</p>
      </section>

      {/* Quick Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Time</span>
          <span style={styles.statValue}>{action.implementation.timeToImplement}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Effort</span>
          <span style={{ ...styles.statValue, color: getEffortColor(action.implementation.effort) }}>
            {action.implementation.effort.charAt(0).toUpperCase() + action.implementation.effort.slice(1)}
          </span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Team</span>
          <span style={styles.statValue}>
            {action.implementation.teamInvolvement === 'full-team' ? 'Full Team' :
             action.implementation.teamInvolvement === 'partial' ? 'Partial' : 'Individual'}
          </span>
        </div>
      </div>

      {/* Steps */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Steps</h4>
        <div style={styles.stepsList}>
          {action.implementation.steps.map((step, index) => (
            <div key={index} style={styles.stepCard}>
              <div style={styles.stepNumber}>{index + 1}</div>
              <div style={styles.stepContent}>
                <span style={styles.stepTitle}>{step.title}</span>
                <p style={styles.stepDescription}>{step.description}</p>
                {step.duration && (
                  <span style={styles.stepDuration}>{step.duration}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prerequisites */}
      {action.implementation.prerequisites && action.implementation.prerequisites.length > 0 && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Prerequisites</h4>
          <ul style={styles.list}>
            {action.implementation.prerequisites.map((prereq, index) => (
              <li key={index} style={styles.listItem}>{prereq}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Tools Required */}
      {action.implementation.toolsRequired && action.implementation.toolsRequired.length > 0 && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Tools Required</h4>
          <div style={styles.tags}>
            {action.implementation.toolsRequired.map((tool, index) => (
              <span key={index} style={styles.toolTag}>{tool}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderValidationTab = () => (
    <div style={styles.tabContent}>
      {/* Experiments */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Experiments to Run</h4>
        <div style={styles.experimentList}>
          {action.validation.experiments.map((experiment, index) => (
            <div key={index} style={styles.experimentCard}>
              <div style={styles.experimentHeader}>
                <span style={styles.experimentName}>{experiment.name}</span>
                <span style={styles.experimentDuration}>{experiment.duration}</span>
              </div>
              <p style={styles.experimentDescription}>{experiment.description}</p>
              <div style={styles.experimentMeasure}>
                <strong>How to measure:</strong> {experiment.howToMeasure}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Metrics */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Success Metrics</h4>
        <div style={styles.metricList}>
          {action.validation.successMetrics.map((metric, index) => (
            <div key={index} style={styles.metricCard}>
              <span style={styles.metricName}>{metric.metric}</span>
              <span style={styles.metricTarget}>Target: {metric.target}</span>
              <span style={styles.metricMeasure}>Measure: {metric.howToMeasure}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Leading Indicators */}
      {action.validation.leadingIndicators.length > 0 && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Leading Indicators (Early Signs)</h4>
          <ul style={styles.list}>
            {action.validation.leadingIndicators.map((indicator, index) => (
              <li key={index} style={styles.listItem}>{indicator}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Lagging Indicators */}
      {action.validation.laggingIndicators.length > 0 && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Lagging Indicators (Long-term Results)</h4>
          <ul style={styles.list}>
            {action.validation.laggingIndicators.map((indicator, index) => (
              <li key={index} style={styles.listItem}>{indicator}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );

  const renderPitfallsTab = () => (
    <div style={styles.tabContent}>
      {/* Common Mistakes */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Common Mistakes</h4>
        <ul style={styles.warningList}>
          {action.pitfalls.commonMistakes.map((mistake, index) => (
            <li key={index} style={styles.warningItem}>{mistake}</li>
          ))}
        </ul>
      </section>

      {/* Anti-Patterns */}
      {action.pitfalls.antiPatterns.length > 0 && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Anti-Patterns to Avoid</h4>
          <ul style={styles.dangerList}>
            {action.pitfalls.antiPatterns.map((pattern, index) => (
              <li key={index} style={styles.dangerItem}>{pattern}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Warning Signals */}
      {action.pitfalls.warningSignals.length > 0 && (
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Warning Signals</h4>
          <ul style={styles.warningList}>
            {action.pitfalls.warningSignals.map((signal, index) => (
              <li key={index} style={styles.warningItem}>{signal}</li>
            ))}
          </ul>
        </section>
      )}

      {/* When to Pivot */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>When to Pivot</h4>
        <div style={styles.pivotBox}>
          <p style={styles.pivotText}>{action.pitfalls.whenToPivot}</p>
        </div>
      </section>
    </div>
  );

  const renderFaqTab = () => (
    <div style={styles.tabContent}>
      {action.faq.length > 0 ? (
        <div style={styles.faqList}>
          {action.faq.map((item, index) => (
            <div key={index} style={styles.faqCard}>
              <h4 style={styles.faqQuestion}>{item.question}</h4>
              <p style={styles.faqAnswer}>{item.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.emptyState}>No FAQs available for this action yet.</p>
      )}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'implementation': return renderImplementationTab();
      case 'validation': return renderValidationTab();
      case 'pitfalls': return renderPitfallsTab();
      case 'faq': return renderFaqTab();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerMeta}>
              <span style={{
                ...styles.categoryBadge,
                backgroundColor: categoryConfig.color + '15',
                color: categoryConfig.color,
              }}>
                <span style={styles.categoryIcon}>{categoryConfig.icon}</span>
                {categoryConfig.label}
              </span>
              <span style={{
                ...styles.impactBadge,
                backgroundColor: getImpactColor(action.impact) + '15',
                color: getImpactColor(action.impact),
              }}>
                {action.impact.toUpperCase()} IMPACT
              </span>
            </div>
            <h2 style={styles.title}>{action.title}</h2>
          </div>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id ? styles.tabButtonActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span style={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={styles.body}>
          {renderActiveTab()}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerIndicators}>
            {action.relatedIndicators.length > 0 && (
              <>
                <span style={styles.footerLabel}>Affects:</span>
                {action.relatedIndicators.slice(0, 3).map((indicator, index) => (
                  <span key={index} style={styles.indicatorTag}>{indicator}</span>
                ))}
                {action.relatedIndicators.length > 3 && (
                  <span style={styles.moreTag}>+{action.relatedIndicators.length - 3}</span>
                )}
              </>
            )}
          </div>
          <div style={styles.footerButtons}>
            <button
              style={isTrying ? styles.tryingButtonActive : styles.tryingButton}
              onClick={onToggleTrying}
            >
              {isTrying ? "Added ✓" : "Try this Play"}
            </button>
            <button style={styles.cancelButton} onClick={onClose}>
              Close
            </button>
          </div>
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
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '800px',
    width: '100%',
    height: '85vh',
    maxHeight: '750px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 24px 16px',
    borderBottom: '1px solid #E4E6EB',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  headerMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  categoryIcon: {
    fontSize: '12px',
  },
  impactBadge: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#6B778C',
    cursor: 'pointer',
    padding: '0 8px',
    marginTop: '-4px',
    lineHeight: 1,
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #E4E6EB',
    backgroundColor: '#FAFBFC',
    padding: '0 16px',
    overflowX: 'auto',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#5E6C84',
    fontSize: '13px',
    fontWeight: 500,
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    whiteSpace: 'nowrap',
  },
  tabButtonActive: {
    color: '#0052CC',
    borderBottomColor: '#0052CC',
    backgroundColor: '#FFFFFF',
  },
  tabIcon: {
    fontSize: '14px',
  },
  tabLabel: {},
  body: {
    flex: 1,
    overflow: 'auto',
    minHeight: 0, // Ensures flex child can shrink and scroll properly
  },
  tabContent: {
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
  },
  textMuted: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  resourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resourceCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  resourceType: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.5px',
  },
  resourceTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  resourceDescription: {
    margin: 0,
    fontSize: '12px',
    color: '#5E6C84',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stepCard: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    flexShrink: 0,
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  stepTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  stepDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  stepDuration: {
    fontSize: '11px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  list: {
    margin: 0,
    paddingLeft: '20px',
  },
  listItem: {
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.6,
    marginBottom: '6px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  toolTag: {
    padding: '6px 12px',
    backgroundColor: '#E4E6EB',
    color: '#42526E',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  experimentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  experimentCard: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    borderLeft: '4px solid #6554C0',
  },
  experimentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  experimentName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  experimentDuration: {
    fontSize: '12px',
    color: '#6554C0',
    fontWeight: 500,
    padding: '2px 8px',
    backgroundColor: '#EAE6FF',
    borderRadius: '4px',
  },
  experimentDescription: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  experimentMeasure: {
    fontSize: '12px',
    color: '#5E6C84',
    fontStyle: 'italic',
  },
  metricList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    border: '1px solid #ABF5D1',
  },
  metricName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#006644',
  },
  metricTarget: {
    fontSize: '13px',
    color: '#006644',
  },
  metricMeasure: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  warningList: {
    margin: 0,
    paddingLeft: '20px',
  },
  warningItem: {
    fontSize: '14px',
    color: '#FF8B00',
    lineHeight: 1.6,
    marginBottom: '8px',
  },
  dangerList: {
    margin: 0,
    paddingLeft: '20px',
  },
  dangerItem: {
    fontSize: '14px',
    color: '#DE350B',
    lineHeight: 1.6,
    marginBottom: '8px',
  },
  pivotBox: {
    padding: '16px',
    backgroundColor: '#FFF7E6',
    borderRadius: '8px',
    border: '1px solid #FFE380',
  },
  pivotText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  faqCard: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  faqQuestion: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  faqAnswer: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.6,
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6B778C',
    fontSize: '14px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid #E4E6EB',
    backgroundColor: '#FAFBFC',
  },
  footerIndicators: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  footerLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  indicatorTag: {
    padding: '4px 8px',
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  moreTag: {
    padding: '4px 8px',
    backgroundColor: '#E4E6EB',
    color: '#6B778C',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  footerButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  tryingButton: {
    padding: '10px 20px',
    backgroundColor: '#F4F5F7',
    color: '#42526E',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tryingButtonActive: {
    padding: '10px 20px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    border: '1px solid #ABF5D1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#5E6C84',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default PlayDetailModal;
