import React, { useState } from 'react';
import {
  PlanPlay,
  PlayStatus,
  getPlayStatusColor,
  getTaskProgress,
} from '../../../../types/improvementPlan';
import { Action } from '../../../../types/playbook';
import { getActionById } from '../../../../constants/playbookContent';
import { getCategoryIcon, getEffortLabel } from '../../../../utils/improvementPlanUtils';
import TaskList from './TaskList';

interface PlanPlayCardProps {
  play: PlanPlay;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: PlayStatus) => void;
  onAddTask: (title: string) => void;
  onTaskStatusChange: (taskId: string, status: 'pending' | 'in-progress' | 'completed') => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToDimension: (dimensionKey: string) => void;
}

type ContentTab = 'overview' | 'steps' | 'validation' | 'pitfalls' | 'faq';

const PlanPlayCard: React.FC<PlanPlayCardProps> = ({
  play,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onAddTask,
  onTaskStatusChange,
  onDeleteTask,
  onNavigateToDimension,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentTab>('overview');

  // Get the full action content from the playbook
  const fullAction = getActionById(play.playId, play.sourceDimensionKey);

  const statusColor = getPlayStatusColor(play.status);
  const taskProgress = getTaskProgress(play.tasks);
  const categoryIcon = getCategoryIcon(play.category);

  // Get status button label
  const getStatusAction = () => {
    switch (play.status) {
      case 'backlog':
        return { label: 'Move to Do Next', nextStatus: 'do-next' as PlayStatus };
      case 'do-next':
        return { label: 'Start', nextStatus: 'in-progress' as PlayStatus };
      case 'in-progress':
        return { label: 'Complete', nextStatus: 'completed' as PlayStatus };
      case 'completed':
        return { label: 'Completed', nextStatus: null };
      case 'skipped':
        return { label: 'Skipped', nextStatus: null };
    }
  };

  const statusAction = getStatusAction();

  // Get category color
  const getCategoryColor = () => {
    switch (play.category) {
      case 'quick-win': return { bg: '#E3FCEF', text: '#006644' };
      case 'process': return { bg: '#DEEBFF', text: '#0052CC' };
      case 'culture': return { bg: '#EAE6FF', text: '#5243AA' };
      case 'tooling': return { bg: '#FFF0B3', text: '#B65C02' };
      default: return { bg: '#F4F5F7', text: '#6B778C' };
    }
  };

  const categoryColor = getCategoryColor();

  // Render content tabs
  const renderTabs = () => {
    const tabs: { id: ContentTab; label: string }[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'steps', label: 'Steps' },
      { id: 'validation', label: 'Success Metrics' },
      { id: 'pitfalls', label: 'Pitfalls' },
    ];

    if (fullAction?.faq && fullAction.faq.length > 0) {
      tabs.push({ id: 'faq', label: 'FAQ' });
    }

    return (
      <div style={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#0052CC' : '#6B778C',
              borderBottom: activeTab === tab.id ? '2px solid #0052CC' : '2px solid transparent',
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  // Render Overview tab
  const renderOverview = () => {
    if (!fullAction) return <p style={styles.noContent}>Content not available</p>;

    return (
      <div style={styles.tabContent}>
        {/* Problem & Solution */}
        <div style={styles.contentSection}>
          <h4 style={styles.sectionTitle}>Problem This Solves</h4>
          <p style={styles.paragraph}>{fullAction.knowledge.problemSolved}</p>
        </div>

        <div style={styles.contentSection}>
          <h4 style={styles.sectionTitle}>Why It Works</h4>
          <p style={styles.paragraph}>{fullAction.knowledge.whyItWorks}</p>
        </div>

        {fullAction.knowledge.background && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>Background</h4>
            <p style={styles.paragraph}>{fullAction.knowledge.background}</p>
          </div>
        )}

        {/* Resources */}
        {fullAction.knowledge.resources && fullAction.knowledge.resources.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>Resources</h4>
            <ul style={styles.resourceList}>
              {fullAction.knowledge.resources.map((resource, idx) => (
                <li key={idx} style={styles.resourceItem}>
                  <span style={styles.resourceType}>{resource.type}</span>
                  <span style={styles.resourceTitle}>{resource.title}</span>
                  {resource.description && (
                    <span style={styles.resourceDesc}> — {resource.description}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render Steps tab
  const renderSteps = () => {
    if (!fullAction) return <p style={styles.noContent}>Content not available</p>;

    const impl = fullAction.implementation;

    return (
      <div style={styles.tabContent}>
        <div style={styles.contentSection}>
          <p style={styles.paragraph}>{impl.overview}</p>
        </div>

        {/* Implementation details */}
        <div style={styles.metaRow}>
          <span style={styles.metaBadge}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#6B778C" strokeWidth="1.5" />
              <path d="M6 3V6L8 8" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {impl.timeToImplement}
          </span>
          <span style={styles.metaBadge}>
            {typeof impl.teamInvolvement === 'string'
              ? impl.teamInvolvement.replace('-', ' ')
              : impl.teamInvolvement.type.replace('-', ' ')}
          </span>
          {impl.prerequisites && impl.prerequisites.length > 0 && (
            <span style={styles.metaBadge}>
              {impl.prerequisites.length} prerequisite{impl.prerequisites.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Prerequisites */}
        {impl.prerequisites && impl.prerequisites.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>Prerequisites</h4>
            <ul style={styles.bulletList}>
              {impl.prerequisites.map((prereq, idx) => (
                <li key={idx}>{prereq}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        <div style={styles.contentSection}>
          <h4 style={styles.sectionTitle}>Implementation Steps</h4>
          <ol style={styles.stepsList}>
            {impl.steps.map((step, idx) => (
              <li key={idx} style={styles.stepItem}>
                <div style={styles.stepHeader}>
                  <span style={styles.stepNumber}>{idx + 1}</span>
                  <span style={styles.stepTitle}>{step.title}</span>
                  {step.duration && (
                    <span style={styles.stepDuration}>{step.duration}</span>
                  )}
                </div>
                <p style={styles.stepDescription}>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Tools Required */}
        {impl.toolsRequired && impl.toolsRequired.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>Tools Required</h4>
            <ul style={styles.bulletList}>
              {impl.toolsRequired.map((tool, idx) => (
                <li key={idx}>{tool}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render Validation tab
  const renderValidation = () => {
    if (!fullAction) return <p style={styles.noContent}>Content not available</p>;

    const validation = fullAction.validation;

    return (
      <div style={styles.tabContent}>
        {/* Experiments */}
        {validation.experiments && validation.experiments.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>Experiments to Try</h4>
            {validation.experiments.map((exp, idx) => (
              <div key={idx} style={styles.experimentCard}>
                <div style={styles.experimentHeader}>
                  <span style={styles.experimentName}>{exp.name}</span>
                  <span style={styles.experimentDuration}>{exp.duration}</span>
                </div>
                <p style={styles.paragraph}>{exp.description}</p>
                <p style={styles.measureHow}>
                  <strong>How to measure:</strong> {exp.howToMeasure}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Success Metrics */}
        {validation.successMetrics && validation.successMetrics.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>Success Metrics</h4>
            <div style={styles.metricsGrid}>
              {validation.successMetrics.map((metric, idx) => (
                <div key={idx} style={styles.metricCard}>
                  <div style={styles.metricName}>{metric.metric}</div>
                  <div style={styles.metricTarget}>Target: {metric.target}</div>
                  <div style={styles.metricHow}>{metric.howToMeasure}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indicators */}
        <div style={styles.indicatorsRow}>
          {validation.leadingIndicators && validation.leadingIndicators.length > 0 && (
            <div style={styles.indicatorSection}>
              <h5 style={styles.indicatorTitle}>Leading Indicators</h5>
              <ul style={styles.indicatorList}>
                {validation.leadingIndicators.map((ind, idx) => (
                  <li key={idx}>{ind}</li>
                ))}
              </ul>
            </div>
          )}
          {validation.laggingIndicators && validation.laggingIndicators.length > 0 && (
            <div style={styles.indicatorSection}>
              <h5 style={styles.indicatorTitle}>Lagging Indicators</h5>
              <ul style={styles.indicatorList}>
                {validation.laggingIndicators.map((ind, idx) => (
                  <li key={idx}>{ind}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Pitfalls tab
  const renderPitfalls = () => {
    if (!fullAction) return <p style={styles.noContent}>Content not available</p>;

    const pitfalls = fullAction.pitfalls;

    return (
      <div style={styles.tabContent}>
        {pitfalls.commonMistakes && pitfalls.commonMistakes.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>
              <span style={styles.warningIcon}>⚠️</span> Common Mistakes
            </h4>
            <ul style={styles.bulletList}>
              {pitfalls.commonMistakes.map((mistake, idx) => (
                <li key={idx}>{mistake}</li>
              ))}
            </ul>
          </div>
        )}

        {pitfalls.antiPatterns && pitfalls.antiPatterns.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>
              <span style={styles.warningIcon}>🚫</span> Anti-Patterns
            </h4>
            <ul style={styles.bulletList}>
              {pitfalls.antiPatterns.map((pattern, idx) => (
                <li key={idx}>{pattern}</li>
              ))}
            </ul>
          </div>
        )}

        {pitfalls.warningSignals && pitfalls.warningSignals.length > 0 && (
          <div style={styles.contentSection}>
            <h4 style={styles.sectionTitle}>
              <span style={styles.warningIcon}>🚨</span> Warning Signals
            </h4>
            <ul style={styles.bulletList}>
              {pitfalls.warningSignals.map((signal, idx) => (
                <li key={idx}>{signal}</li>
              ))}
            </ul>
          </div>
        )}

        {pitfalls.whenToPivot && (
          <div style={styles.pivotSection}>
            <h4 style={styles.sectionTitle}>
              <span style={styles.warningIcon}>🔄</span> When to Pivot
            </h4>
            <p style={styles.paragraph}>{pitfalls.whenToPivot}</p>
          </div>
        )}
      </div>
    );
  };

  // Render FAQ tab
  const renderFaq = () => {
    if (!fullAction?.faq || fullAction.faq.length === 0) {
      return <p style={styles.noContent}>No FAQ available</p>;
    }

    return (
      <div style={styles.tabContent}>
        {fullAction.faq.map((item, idx) => (
          <div key={idx} style={styles.faqItem}>
            <h4 style={styles.faqQuestion}>{item.question}</h4>
            <p style={styles.faqAnswer}>{item.answer}</p>
          </div>
        ))}
      </div>
    );
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'steps': return renderSteps();
      case 'validation': return renderValidation();
      case 'pitfalls': return renderPitfalls();
      case 'faq': return renderFaq();
      default: return null;
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        borderColor: isExpanded ? '#0052CC' : '#E4E6EB',
        zIndex: showStatusMenu ? 10 : 'auto',
        position: 'relative',
      }}
    >
      {/* Main row */}
      <div style={styles.mainRow}>
        {/* Status indicator */}
        <div
          style={{
            ...styles.statusIndicator,
            backgroundColor: statusColor.bg,
            borderColor: statusColor.border,
          }}
        >
          {play.status === 'completed' ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke={statusColor.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : play.status === 'in-progress' ? (
            <div style={{ ...styles.inProgressDot, backgroundColor: statusColor.text }} />
          ) : play.status === 'skipped' ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6H10" stroke={statusColor.text} strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <div style={{ ...styles.emptyCircle, borderColor: statusColor.border }} />
          )}
        </div>

        {/* Play info */}
        <div style={styles.playInfo} onClick={onToggleExpand}>
          <div style={styles.playTitle}>{play.title}</div>
          <div style={styles.playMeta}>
            <span
              style={{
                ...styles.categoryBadge,
                backgroundColor: categoryColor.bg,
                color: categoryColor.text,
              }}
            >
              {categoryIcon} {play.category === 'quick-win' ? 'Quick Win' : play.category}
            </span>
            <span style={styles.metaDot}>•</span>
            <span style={styles.dimensionLink} onClick={(e) => { e.stopPropagation(); onNavigateToDimension(play.sourceDimensionKey); }}>
              {play.sourceDimensionName}
            </span>
            {play.tasks.length > 0 && (
              <>
                <span style={styles.metaDot}>•</span>
                <span style={styles.taskCount}>
                  {taskProgress.completed}/{taskProgress.total} tasks
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status dropdown */}
        <div style={styles.statusDropdown}>
          <button
            style={{
              ...styles.statusButton,
              backgroundColor: statusColor.bg,
              color: statusColor.text,
              borderColor: statusColor.border,
            }}
            onClick={() => setShowStatusMenu(!showStatusMenu)}
          >
            {statusAction.label}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showStatusMenu && (
            <>
              <div
                style={styles.menuBackdrop}
                onClick={() => setShowStatusMenu(false)}
              />
              <div style={styles.statusMenu}>
                {['backlog', 'do-next', 'in-progress', 'completed', 'skipped'].map((status) => (
                  <button
                    key={status}
                    style={{
                      ...styles.statusMenuItem,
                      backgroundColor: play.status === status ? '#F4F5F7' : 'transparent',
                    }}
                    onClick={() => {
                      onStatusChange(status as PlayStatus);
                      setShowStatusMenu(false);
                    }}
                  >
                    {status === 'backlog' && 'Backlog'}
                    {status === 'do-next' && 'Do Next'}
                    {status === 'in-progress' && 'In Progress'}
                    {status === 'completed' && 'Completed'}
                    {status === 'skipped' && 'Skip'}
                    {play.status === status && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={styles.expandedContent}>
          {/* Effort/Impact badges */}
          <div style={styles.detailsRow}>
            <span style={styles.detailBadge}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M3 4L6 1L9 4" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {play.impact.charAt(0).toUpperCase() + play.impact.slice(1)} Impact
            </span>
            <span style={styles.detailBadge}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#6B778C" strokeWidth="1.5" />
                <path d="M6 3V6L8 8" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {getEffortLabel(play.effort)}
            </span>
          </div>

          {/* Content tabs */}
          {renderTabs()}
          {renderTabContent()}

          {/* Tasks section */}
          <div style={styles.tasksSection}>
            <h4 style={styles.tasksSectionTitle}>Your Tasks</h4>
            {play.tasks.length === 0 ? (
              <p style={styles.noTasksHint}>
                Start adding tasks to track your progress on this play
              </p>
            ) : null}
            <TaskList
              tasks={play.tasks}
              onAddTask={onAddTask}
              onTaskStatusChange={onTaskStatusChange}
              onDeleteTask={onDeleteTask}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '10px',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid',
    flexShrink: 0,
  },
  inProgressDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  emptyCircle: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid',
  },
  playInfo: {
    flex: 1,
    minWidth: 0,
    cursor: 'pointer',
  },
  playTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '4px',
  },
  playMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  metaDot: {
    color: '#C1C7D0',
    fontSize: '10px',
  },
  dimensionLink: {
    fontSize: '12px',
    color: '#0052CC',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  taskCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  statusDropdown: {
    position: 'relative',
    zIndex: 1,
  },
  statusButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  menuBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  statusMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    padding: '4px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.16)',
    zIndex: 101,
    minWidth: '120px',
  },
  statusMenuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  expandedContent: {
    padding: '0 16px 16px',
    borderTop: '1px solid #EBECF0',
  },
  detailsRow: {
    display: 'flex',
    gap: '12px',
    padding: '12px 0',
  },
  detailBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
  },
  // Tabs
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid #EBECF0',
    marginBottom: '16px',
  },
  tab: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabContent: {
    marginBottom: '20px',
  },
  // Content sections
  contentSection: {
    marginBottom: '16px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '8px',
    marginTop: 0,
  },
  paragraph: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#42526E',
    margin: 0,
  },
  noContent: {
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  // Lists
  bulletList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: '1.6',
  },
  // Resources
  resourceList: {
    margin: 0,
    paddingLeft: '20px',
    listStyle: 'none',
  },
  resourceItem: {
    fontSize: '13px',
    color: '#42526E',
    marginBottom: '4px',
  },
  resourceType: {
    display: 'inline-block',
    padding: '1px 6px',
    backgroundColor: '#F4F5F7',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    marginRight: '8px',
  },
  resourceTitle: {
    fontWeight: 500,
    color: '#0052CC',
  },
  resourceDesc: {
    color: '#6B778C',
  },
  // Steps
  metaRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  stepsList: {
    margin: 0,
    paddingLeft: 0,
    listStyle: 'none',
    counterReset: 'steps',
  },
  stepItem: {
    marginBottom: '12px',
    paddingLeft: '32px',
    position: 'relative',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  stepNumber: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '22px',
    height: '22px',
    backgroundColor: '#0052CC',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDuration: {
    fontSize: '11px',
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  stepDescription: {
    fontSize: '13px',
    color: '#42526E',
    lineHeight: '1.5',
    margin: 0,
  },
  // Experiments & Metrics
  experimentCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
  },
  experimentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  experimentName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  experimentDuration: {
    fontSize: '11px',
    color: '#6B778C',
    backgroundColor: '#FFFFFF',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  measureHow: {
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '8px',
    marginBottom: 0,
    fontStyle: 'italic',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  metricCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px',
  },
  metricName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '4px',
  },
  metricTarget: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: 500,
    marginBottom: '4px',
  },
  metricHow: {
    fontSize: '11px',
    color: '#6B778C',
  },
  indicatorsRow: {
    display: 'flex',
    gap: '24px',
    marginTop: '16px',
  },
  indicatorSection: {
    flex: 1,
  },
  indicatorTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    marginTop: 0,
    marginBottom: '8px',
  },
  indicatorList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '12px',
    color: '#42526E',
    lineHeight: '1.6',
  },
  // Pitfalls
  warningIcon: {
    marginRight: '4px',
  },
  pivotSection: {
    backgroundColor: '#FFFAE6',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #FFE380',
  },
  // FAQ
  faqItem: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #EBECF0',
  },
  faqQuestion: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  faqAnswer: {
    fontSize: '13px',
    color: '#42526E',
    lineHeight: '1.5',
    margin: 0,
  },
  // Tasks section
  tasksSection: {
    borderTop: '1px solid #EBECF0',
    paddingTop: '16px',
    marginTop: '8px',
  },
  tasksSectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    marginTop: 0,
    marginBottom: '12px',
  },
  noTasksHint: {
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
    marginBottom: '12px',
  },
};

export default PlanPlayCard;
