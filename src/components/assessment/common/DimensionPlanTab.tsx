import React, { useState } from 'react';
import { ActionPlanItem, ActionStatus, STATUS_CONFIG } from '../../../types/actionPlan';
import { EditActionInput } from '../../../hooks/useActionPlan';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import EditIcon from '@atlaskit/icon/glyph/edit';

interface DimensionPlanTabProps {
  dimensionKey: string;
  dimensionName: string;
  actionPlanItems: ActionPlanItem[];
  onViewFullPlan?: () => void;
  onStatusChange?: (itemId: string, newStatus: ActionStatus) => void;
  onRemoveItem?: (itemId: string) => void;
  onEditItem?: (input: EditActionInput) => void;
}

// Helper functions for effort/impact styling
const getEffortStyle = (effort: 'low' | 'medium' | 'high'): { filled: number; color: string } => {
  switch (effort) {
    case 'low': return { filled: 1, color: '#36B37E' };
    case 'medium': return { filled: 2, color: '#FFAB00' };
    case 'high': return { filled: 3, color: '#DE350B' };
  }
};

const getImpactStyle = (impact: 'low' | 'medium' | 'high'): { filled: number; color: string } => {
  switch (impact) {
    case 'high': return { filled: 3, color: '#36B37E' };
    case 'medium': return { filled: 2, color: '#FFAB00' };
    case 'low': return { filled: 1, color: '#6B778C' };
  }
};

// Dot rating component
const DotRating: React.FC<{ filled: number; color: string }> = ({ filled, color }) => (
  <span style={styles.dotRating}>
    {[1, 2, 3].map((dot) => (
      <span
        key={dot}
        style={{
          ...styles.dot,
          backgroundColor: dot <= filled ? color : '#DFE1E6',
        }}
      />
    ))}
  </span>
);

// Status selector dropdown
const StatusSelector: React.FC<{
  currentStatus: ActionStatus;
  onStatusChange: (status: ActionStatus) => void;
}> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = STATUS_CONFIG[currentStatus];

  const statuses: ActionStatus[] = ['pending', 'in-progress', 'done'];

  return (
    <div style={styles.statusSelector}>
      <button
        style={{
          ...styles.statusButton,
          color: config.color,
          backgroundColor: config.bgColor,
          border: `1px solid ${config.color}`,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={styles.statusIcon}>{config.icon}</span>
        <span>{config.label}</span>
        <ChevronDownIcon label="" size="small" primaryColor={config.color} />
      </button>
      {isOpen && (
        <>
          <div style={styles.statusDropdownBackdrop} onClick={() => setIsOpen(false)} />
          <div style={styles.statusDropdown}>
            {statuses.map(status => {
              const statusConfig = STATUS_CONFIG[status];
              const isSelected = status === currentStatus;
              return (
                <button
                  key={status}
                  style={{
                    ...styles.statusOption,
                    backgroundColor: isSelected ? statusConfig.bgColor : 'transparent',
                  }}
                  onClick={() => {
                    onStatusChange(status);
                    setIsOpen(false);
                  }}
                >
                  <span style={{ ...styles.statusIcon, color: statusConfig.color }}>
                    {statusConfig.icon}
                  </span>
                  <span style={{ color: statusConfig.color }}>{statusConfig.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Sub-tasks progress bar
const SubTasksProgress: React.FC<{ total: number; completed: number }> = ({ total, completed }) => {
  if (total === 0) {
    return (
      <div style={styles.subTasksEmpty}>
        <span style={styles.subTasksEmptyText}>No sub-tasks</span>
      </div>
    );
  }

  const percentage = Math.round((completed / total) * 100);

  return (
    <div style={styles.subTasks}>
      <div style={styles.subTasksBar}>
        <div style={{ ...styles.subTasksFill, width: `${percentage}%` }} />
      </div>
      <span style={styles.subTasksLabel}>{completed}/{total}</span>
    </div>
  );
};

// Edit Action Modal component
const EditActionModal: React.FC<{
  item: ActionPlanItem;
  onSave: (input: EditActionInput) => void;
  onClose: () => void;
}> = ({ item, onSave, onClose }) => {
  const [title, setTitle] = useState(item.recommendation.title);
  const [description, setDescription] = useState(item.recommendation.description);
  const [category, setCategory] = useState<'process' | 'tooling' | 'culture' | 'governance'>(item.recommendation.category);
  const [effort, setEffort] = useState<'low' | 'medium' | 'high'>(item.recommendation.effort);
  const [impact, setImpact] = useState<'low' | 'medium' | 'high'>(item.recommendation.impact);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      id: item.id,
      title: title.trim(),
      description: description.trim(),
      category,
      effort,
      impact,
      dimensionKey: item.recommendation.sourceDimensionKey,
    });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Edit Action</h3>
          <button style={styles.modalCloseBtn} onClick={onClose}>
            <CrossIcon label="Close" size="small" primaryColor="#6B778C" />
          </button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Title *</label>
            <input
              type="text"
              style={styles.formInput}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Description</label>
            <textarea
              style={styles.formTextarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Category</label>
            <select
              style={styles.formSelect}
              value={category}
              onChange={e => setCategory(e.target.value as 'process' | 'tooling' | 'culture' | 'governance')}
            >
              <option value="process">Process</option>
              <option value="tooling">Tooling</option>
              <option value="culture">Culture</option>
              <option value="governance">Governance</option>
            </select>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Effort</label>
              <select
                style={styles.formSelect}
                value={effort}
                onChange={e => setEffort(e.target.value as 'low' | 'medium' | 'high')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Impact</label>
              <select
                style={styles.formSelect}
                value={impact}
                onChange={e => setImpact(e.target.value as 'low' | 'medium' | 'high')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{
              ...styles.saveBtn,
              ...(title.trim() ? {} : styles.saveBtnDisabled),
            }}
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Action card component
const ActionCard: React.FC<{
  item: ActionPlanItem;
  onStatusChange?: (status: ActionStatus) => void;
  onRemove?: () => void;
  onEdit?: () => void;
}> = ({ item, onStatusChange, onRemove, onEdit }) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const effortStyle = getEffortStyle(item.recommendation.effort);
  const impactStyle = getImpactStyle(item.recommendation.impact);
  const isDone = item.status === 'done';
  const isCustom = item.id.startsWith('custom-');

  return (
    <div
      style={{
        ...styles.card,
        ...(isDone ? styles.cardDone : {}),
      }}
    >
      <div style={styles.cardHeader}>
        {/* Main content */}
        <div style={styles.cardContent}>
          {/* Title row */}
          <div style={styles.cardTitleRow}>
            <span style={{
              ...styles.cardTitle,
              textDecoration: isDone ? 'line-through' : 'none',
              color: isDone ? '#6B778C' : '#172B4D',
            }}>
              {item.recommendation.title}
            </span>
            {isCustom && <span style={styles.customBadge}>Custom</span>}
          </div>

          {/* Description */}
          <p style={{
            ...styles.cardDescription,
            color: isDone ? '#97A0AF' : '#5E6C84',
          }}>
            {item.recommendation.description}
          </p>

          {/* Footer with metrics, sub-tasks */}
          <div style={styles.cardFooter}>
            <div style={styles.metrics}>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>Effort</span>
                <DotRating filled={effortStyle.filled} color={effortStyle.color} />
              </div>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>Impact</span>
                <DotRating filled={impactStyle.filled} color={impactStyle.color} />
              </div>
            </div>

            <SubTasksProgress
              total={item.subTasks.total}
              completed={item.subTasks.completed}
            />
          </div>
        </div>

        {/* Right side: Status, Edit, and Remove */}
        <div style={styles.cardActions}>
          {onStatusChange && (
            <StatusSelector
              currentStatus={item.status}
              onStatusChange={onStatusChange}
            />
          )}
          <div style={styles.actionButtons}>
            {onEdit && (
              <button
                style={styles.editButton}
                onClick={onEdit}
                title="Edit action"
              >
                <EditIcon label="Edit" size="small" primaryColor="#6B778C" />
              </button>
            )}
            {onRemove && (
              showRemoveConfirm ? (
                <div style={styles.removeConfirm}>
                  <span style={styles.removeConfirmText}>Remove?</span>
                  <button
                    style={styles.removeConfirmYes}
                    onClick={onRemove}
                  >
                    Yes
                  </button>
                  <button
                    style={styles.removeConfirmNo}
                    onClick={() => setShowRemoveConfirm(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  style={styles.removeButton}
                  onClick={() => setShowRemoveConfirm(true)}
                  title="Remove action"
                >
                  <CrossIcon label="Remove" size="small" primaryColor="#6B778C" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DimensionPlanTab: React.FC<DimensionPlanTabProps> = ({
  dimensionKey,
  dimensionName,
  actionPlanItems,
  onViewFullPlan,
  onStatusChange,
  onRemoveItem,
  onEditItem,
}) => {
  // State for edit modal
  const [editingItem, setEditingItem] = useState<ActionPlanItem | null>(null);

  // Filter items for this dimension
  const dimensionItems = actionPlanItems.filter(
    item => item.recommendation.sourceDimensionKey === dimensionKey
  );

  const completedCount = dimensionItems.filter(i => i.status === 'done').length;
  const inProgressCount = dimensionItems.filter(i => i.status === 'in-progress').length;
  const pendingCount = dimensionItems.filter(i => i.status === 'pending').length;
  const totalCount = dimensionItems.length;

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Sort: in-progress first, then pending, then done
  const sortedItems = [...dimensionItems].sort((a, b) => {
    const order = { 'in-progress': 0, 'pending': 1, 'done': 2 };
    return order[a.status] - order[b.status];
  });

  if (totalCount === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>No Actions Planned Yet</h3>
          <p style={styles.emptyText}>
            Go to the <strong>Playbook</strong> tab to add improvement actions for {dimensionName} to your plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with stats */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>Your Plan for {dimensionName}</h3>
          <p style={styles.subtitle}>
            {completedCount} of {totalCount} actions complete
          </p>
        </div>
        {onViewFullPlan && (
          <button style={styles.viewFullButton} onClick={onViewFullPlan}>
            View Full Improvement Plan →
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
            }}
          />
        </div>
        <div style={styles.progressStats}>
          <span style={styles.progressPercent}>{progressPercent}% complete</span>
          <div style={styles.statusCounts}>
            {inProgressCount > 0 && (
              <span style={{ ...styles.statusCount, color: STATUS_CONFIG['in-progress'].color }}>
                {inProgressCount} in progress
              </span>
            )}
            {pendingCount > 0 && (
              <span style={{ ...styles.statusCount, color: STATUS_CONFIG['pending'].color }}>
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action items list */}
      <div style={styles.itemsList}>
        {sortedItems.map((item) => (
          <ActionCard
            key={item.id}
            item={item}
            onStatusChange={onStatusChange ? (status) => onStatusChange(item.id, status) : undefined}
            onRemove={onRemoveItem ? () => onRemoveItem(item.id) : undefined}
            onEdit={onEditItem ? () => setEditingItem(item) : undefined}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && onEditItem && (
        <EditActionModal
          item={editingItem}
          onSave={(input) => {
            onEditItem(input);
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  viewFullButton: {
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    whiteSpace: 'nowrap',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  progressBar: {
    height: '10px',
    backgroundColor: '#DFE1E6',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  progressStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  statusCounts: {
    display: 'flex',
    gap: '16px',
  },
  statusCount: {
    fontSize: '13px',
    fontWeight: 500,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    padding: '16px',
  },
  cardDone: {
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
  },
  cardHeader: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  customBadge: {
    padding: '2px 8px',
    backgroundColor: '#DFE1E6',
    color: '#5E6C84',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
  },
  cardDescription: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  metrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  dotRating: {
    display: 'flex',
    gap: '3px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  // Sub-tasks
  subTasks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  subTasksBar: {
    width: '50px',
    height: '6px',
    backgroundColor: '#DFE1E6',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  subTasksFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '3px',
  },
  subTasksLabel: {
    fontSize: '11px',
    color: '#6B778C',
  },
  subTasksEmpty: {
    display: 'flex',
    alignItems: 'center',
  },
  subTasksEmptyText: {
    fontSize: '11px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  // Actions
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'all 0.15s ease',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'all 0.15s ease',
  },
  removeConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  removeConfirmText: {
    fontSize: '11px',
    color: '#6B778C',
  },
  removeConfirmYes: {
    padding: '4px 8px',
    backgroundColor: '#DE350B',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  removeConfirmNo: {
    padding: '4px 8px',
    backgroundColor: '#DFE1E6',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#5E6C84',
    cursor: 'pointer',
  },
  // Status selector
  statusSelector: {
    position: 'relative',
  },
  statusButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    border: '1px solid',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  statusIcon: {
    fontSize: '11px',
  },
  statusDropdownBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  statusDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
    zIndex: 100,
    minWidth: '130px',
    overflow: 'hidden',
  },
  statusOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
  },
  // Modal styles
  modalOverlay: {
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
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    width: '480px',
    maxWidth: '90vw',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #E4E6EB',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modalCloseBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #E4E6EB',
    backgroundColor: '#FAFBFC',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
  },
  formInput: {
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    outline: 'none',
  },
  formTextarea: {
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  formSelect: {
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#5E6C84',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  saveBtnDisabled: {
    backgroundColor: '#A5ADBA',
    cursor: 'not-allowed',
  },
  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.5,
    maxWidth: '400px',
  },
};

export default DimensionPlanTab;
