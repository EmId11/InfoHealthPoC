import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  ActionPlanSection,
  ActionPlanItem,
  ActionStatus,
  STATUS_CONFIG,
} from '../../../types/actionPlan';
import { CustomActionInput, EditActionInput } from '../../../hooks/useActionPlan';
import { DimensionResult } from '../../../types/assessment';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import AddIcon from '@atlaskit/icon/glyph/add';
import EditIcon from '@atlaskit/icon/glyph/edit';
import MediaServicesDocumentIcon from '@atlaskit/icon/glyph/media-services/document';
import OverallImpactModal from './OverallImpactModal';
import ActionPlanAnalytics from './ActionPlanAnalytics';
import PlayDetailModal from '../playbook/PlayDetailModal';
import { Action } from '../../../types/playbook';
import { getActionById } from '../../../constants/playbookContent';

interface ActionPlanTabProps {
  sections: ActionPlanSection[];
  onUpdateStatus: (itemId: string, status: ActionStatus) => void;
  onReorderWithinSection: (dimensionKey: string, fromIndex: number, toIndex: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddCustomAction: (input: CustomActionInput) => void;
  onUpdateItem: (input: EditActionInput) => void;
  onDimensionClick: (dimensionKey: string) => void;
  completedCount: number;
  totalCount: number;
  highlightedSection?: string | null;  // Now dimensionKey instead of zone tag
  dimensions: DimensionResult[];
}

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

// Action card component
const ActionCard: React.FC<{
  item: ActionPlanItem;
  index: number;
  onUpdateStatus: (status: ActionStatus) => void;
  onDimensionClick: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onViewDetails?: () => void;
}> = ({ item, index, onUpdateStatus, onDimensionClick, onRemove, onEdit, onViewDetails }) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const effortStyle = getEffortStyle(item.recommendation.effort);
  const impactStyle = getImpactStyle(item.recommendation.impact);
  const isDone = item.status === 'done';
  const isCustom = item.id.startsWith('custom-');

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...styles.card,
            ...(snapshot.isDragging ? styles.cardDragging : {}),
            ...(isDone ? styles.cardDone : {}),
            ...provided.draggableProps.style,
          }}
        >
          <div style={styles.cardHeader}>
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              style={styles.dragHandle}
              title="Drag to reorder"
            >
              <DragHandlerIcon label="Drag" size="small" primaryColor="#97A0AF" />
            </div>

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

              {/* Footer with source, metrics, sub-tasks */}
              <div style={styles.cardFooter}>
                <button
                  style={styles.sourceButton}
                  onClick={onDimensionClick}
                >
                  <span>{item.recommendation.sourceDimension}</span>
                  <ChevronRightIcon label="" size="small" primaryColor="#0052CC" />
                </button>

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
              <StatusSelector
                currentStatus={item.status}
                onStatusChange={onUpdateStatus}
              />
              <div style={styles.actionButtons}>
                {onViewDetails && (
                  <button
                    style={styles.viewDetailsButton}
                    onClick={onViewDetails}
                    title="View full details"
                  >
                    <MediaServicesDocumentIcon label="Details" size="small" primaryColor="#0052CC" />
                  </button>
                )}
                <button
                  style={styles.editButton}
                  onClick={onEdit}
                  title="Edit action"
                >
                  <EditIcon label="Edit" size="small" primaryColor="#6B778C" />
                </button>
                {showRemoveConfirm ? (
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Get color based on health status
const getDimensionColor = (healthStatus?: string): string => {
  switch (healthStatus) {
    case 'at-risk': return '#DE350B';
    case 'needs-attention': return '#FFAB00';
    case 'on-track': return '#36B37E';
    default: return '#6B778C';
  }
};

// Section component - now dimension-based, expanded by default
const ActionSection: React.FC<{
  section: ActionPlanSection;
  priorityNumber: number;  // 1-based for display
  onUpdateStatus: (itemId: string, status: ActionStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: ActionPlanItem) => void;
  onViewDetails: (action: Action) => void;
  onDimensionClick: (dimensionKey: string) => void;
  isHighlighted?: boolean;
}> = ({ section, priorityNumber, onUpdateStatus, onReorder, onRemoveItem, onEditItem, onViewDetails, onDimensionClick, isHighlighted }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);  // Expanded by default
  const completedInSection = section.items.filter(i => i.status === 'done').length;
  const sectionColor = getDimensionColor(section.healthStatus);

  // Auto-expand when highlighted (from navigation via "View in Plan")
  useEffect(() => {
    if (isHighlighted) {
      setIsCollapsed(false);
    }
  }, [isHighlighted]);

  if (section.items.length === 0) {
    return null; // Don't show empty sections
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <div
      id={`action-section-${section.dimensionKey}`}
      style={{
        ...styles.section,
        ...(isHighlighted ? styles.sectionHighlighted : {}),
      }}
    >
      {/* Section header - dimension-based */}
      <button
        style={styles.sectionHeader}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={styles.sectionHeaderLeft}>
          <div style={styles.priorityBadge}>
            <span style={styles.priorityBadgeNumber}>{priorityNumber}</span>
          </div>
          <div style={{
            ...styles.sectionIndicator,
            backgroundColor: sectionColor,
          }} />
          <div style={styles.sectionInfo}>
            <span style={{ ...styles.sectionTitle, color: '#172B4D' }}>
              {section.dimensionName}
            </span>
            <span style={styles.sectionDescription}>
              {section.healthStatus === 'at-risk' ? 'At Risk' :
               section.healthStatus === 'needs-attention' ? 'Needs Attention' : 'On Track'}
              {section.healthScore !== undefined && ` · ${Math.round(section.healthScore)}th percentile`}
            </span>
          </div>
        </div>
        <div style={styles.sectionHeaderRight}>
          <span style={styles.sectionCount}>
            {completedInSection}/{section.items.length} done
          </span>
          {isCollapsed ? (
            <ChevronRightIcon label="" size="medium" primaryColor="#6B778C" />
          ) : (
            <ChevronDownIcon label="" size="medium" primaryColor="#6B778C" />
          )}
        </div>
      </button>

      {/* Section content */}
      {!isCollapsed && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`section-${section.dimensionKey}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  ...styles.sectionContent,
                  backgroundColor: snapshot.isDraggingOver ? '#F4F5F7' : 'transparent',
                }}
              >
                {section.items.map((item, index) => {
                  // Resolve full action from stored data or by looking it up in playbook content
                  const resolvedAction = item.fullAction || getActionById(
                    item.recommendationId,
                    item.recommendation.sourceDimensionKey
                  );
                  return (
                    <ActionCard
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdateStatus={(status) => onUpdateStatus(item.id, status)}
                      onDimensionClick={() => onDimensionClick(item.recommendation.sourceDimensionKey)}
                      onRemove={() => onRemoveItem(item.id)}
                      onEdit={() => onEditItem(item)}
                      onViewDetails={resolvedAction ? () => onViewDetails(resolvedAction) : undefined}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

const ActionPlanTab: React.FC<ActionPlanTabProps> = ({
  sections,
  onUpdateStatus,
  onReorderWithinSection,
  onRemoveItem,
  onAddCustomAction,
  onUpdateItem,
  onDimensionClick,
  completedCount,
  totalCount,
  highlightedSection,
  dimensions,
}) => {
  const [showOverallImpact, setShowOverallImpact] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionPlanItem | null>(null);
  const [viewingAction, setViewingAction] = useState<Action | null>(null);
  const hasCompletedActions = completedCount > 0;

  // Scroll to highlighted section when navigating from Priority Matrix
  useEffect(() => {
    if (highlightedSection) {
      const element = document.getElementById(`action-section-${highlightedSection}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [highlightedSection]);

  const hasActions = sections.some(s => s.items.length > 0);

  // Calculate overall stats for aggregate impact
  const inProgressCount = sections.reduce((acc, s) => acc + s.items.filter(i => i.status === 'in-progress').length, 0);

  if (!hasActions) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>No actions to display</h3>
          <p style={styles.emptyDescription}>
            Actions will appear here based on your assessment findings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Action Plan</h2>
          <span style={styles.progressBadge}>
            {completedCount}/{totalCount} completed
          </span>
        </div>
        <div style={styles.headerRight}>
          <button
            style={styles.addActionButton}
            onClick={() => setShowAddModal(true)}
          >
            <AddIcon label="" size="small" primaryColor="#0052CC" />
            <span>Add Action</span>
          </button>
          <button
            style={{
              ...styles.overallImpactButton,
              ...(hasCompletedActions ? {} : styles.overallImpactButtonDisabled),
            }}
            onClick={hasCompletedActions ? () => setShowOverallImpact(true) : undefined}
            disabled={!hasCompletedActions}
            title={hasCompletedActions
              ? "See the impact of actions taken so far"
              : "Complete at least one action to see impact"
            }
          >
            <GraphLineIcon label="" size="small" primaryColor={hasCompletedActions ? "#0052CC" : "#A5ADBA"} />
            <span>View Progress & Impact</span>
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={styles.twoColumnLayout}>
        {/* Left Column - Action List */}
        <div style={styles.actionListColumn}>
          {/* Priority Guide - dimension-based */}
          <div style={styles.guideBox}>
            <div style={styles.guideHeader}>
              <span style={styles.guideTitle}>Your Priority Areas</span>
              <span style={styles.guideTip}>Drag to reorder within each · Click status to update</span>
            </div>
            <p style={styles.guideDescription}>
              Actions are organized by the areas you prioritized. Complete actions in order to see the most impact.
            </p>
            <div style={styles.healthStatusLegend}>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#DE350B' }} />
                <span style={styles.legendLabel}>At Risk</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#FFAB00' }} />
                <span style={styles.legendLabel}>Needs Attention</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#36B37E' }} />
                <span style={styles.legendLabel}>On Track</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={styles.overallProgress}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
                }}
              />
            </div>
            <span style={styles.progressText}>
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% complete
              {inProgressCount > 0 && ` · ${inProgressCount} in progress`}
            </span>
          </div>

          {/* Sections - grouped by dimension in priority order */}
          <div style={styles.sections}>
            {sections.map((section, index) => (
              <ActionSection
                key={section.dimensionKey}
                section={section}
                priorityNumber={index + 1}
                onUpdateStatus={onUpdateStatus}
                onReorder={(from, to) => onReorderWithinSection(section.dimensionKey, from, to)}
                onRemoveItem={onRemoveItem}
                onEditItem={(item) => setEditingItem(item)}
                onViewDetails={(action) => setViewingAction(action)}
                onDimensionClick={onDimensionClick}
                isHighlighted={highlightedSection === section.dimensionKey}
              />
            ))}
          </div>
        </div>

        {/* Right Column - Analytics */}
        <div style={styles.analyticsColumn}>
          <ActionPlanAnalytics
            sections={sections}
            dimensions={dimensions}
            completedCount={completedCount}
            inProgressCount={inProgressCount}
            totalCount={totalCount}
          />
        </div>
      </div>

      {/* Overall Impact Modal */}
      {showOverallImpact && (
        <OverallImpactModal
          sections={sections}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
          totalCount={totalCount}
          dimensions={dimensions}
          onClose={() => setShowOverallImpact(false)}
        />
      )}

      {/* Add Action Modal */}
      {showAddModal && (
        <AddActionModal
          onAdd={(input) => {
            onAddCustomAction(input);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
          dimensions={dimensions}
        />
      )}

      {/* Edit Action Modal */}
      {editingItem && (
        <EditActionModal
          item={editingItem}
          onSave={(input) => {
            onUpdateItem(input);
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
          dimensions={dimensions}
        />
      )}

      {/* View Action Details Modal - same modal as Playbook */}
      {viewingAction && (
        <PlayDetailModal
          action={viewingAction}
          isTrying={true}
          onClose={() => setViewingAction(null)}
          onToggleTrying={() => {}} // Action is already in plan
        />
      )}
    </div>
  );
};

// Add Action Modal component
const AddActionModal: React.FC<{
  onAdd: (input: CustomActionInput) => void;
  onClose: () => void;
  dimensions: DimensionResult[];
}> = ({ onAdd, onClose, dimensions }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'process' | 'tooling' | 'culture' | 'governance'>('process');
  const [effort, setEffort] = useState<'low' | 'medium' | 'high'>('medium');
  const [impact, setImpact] = useState<'low' | 'medium' | 'high'>('medium');
  const [dimensionKey, setDimensionKey] = useState<string>(dimensions[0]?.dimensionKey || '');

  const handleSubmit = () => {
    if (!title.trim() || !dimensionKey) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      category,
      effort,
      impact,
      dimensionKey,
    });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.addModalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.addModalHeader}>
          <h3 style={styles.addModalTitle}>Add Custom Action</h3>
          <button style={styles.modalCloseBtn} onClick={onClose}>
            <CrossIcon label="Close" size="small" primaryColor="#6B778C" />
          </button>
        </div>
        <div style={styles.addModalBody}>
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
            <label style={styles.formLabel}>Related Dimension *</label>
            <select
              style={styles.formSelect}
              value={dimensionKey}
              onChange={e => setDimensionKey(e.target.value)}
            >
              {dimensions.map(dim => (
                <option key={dim.dimensionKey} value={dim.dimensionKey}>
                  {dim.dimensionName}
                </option>
              ))}
            </select>
            <span style={styles.formHint}>
              Priority will be set based on this dimension's position on the matrix
            </span>
          </div>
          <div style={styles.formRow}>
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
        <div style={styles.addModalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{
              ...styles.addBtn,
              ...(title.trim() ? {} : styles.addBtnDisabled),
            }}
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Add Action
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Action Modal component
const EditActionModal: React.FC<{
  item: ActionPlanItem;
  onSave: (input: EditActionInput) => void;
  onClose: () => void;
  dimensions: DimensionResult[];
}> = ({ item, onSave, onClose, dimensions }) => {
  const [title, setTitle] = useState(item.recommendation.title);
  const [description, setDescription] = useState(item.recommendation.description);
  const [category, setCategory] = useState<'process' | 'tooling' | 'culture' | 'governance'>(item.recommendation.category);
  const [effort, setEffort] = useState<'low' | 'medium' | 'high'>(item.recommendation.effort);
  const [impact, setImpact] = useState<'low' | 'medium' | 'high'>(item.recommendation.impact);
  const [dimensionKey, setDimensionKey] = useState<string>(item.recommendation.sourceDimensionKey);

  const handleSubmit = () => {
    if (!title.trim() || !dimensionKey) return;
    onSave({
      id: item.id,
      title: title.trim(),
      description: description.trim(),
      category,
      effort,
      impact,
      dimensionKey,
    });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.addModalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.addModalHeader}>
          <h3 style={styles.addModalTitle}>Edit Action</h3>
          <button style={styles.modalCloseBtn} onClick={onClose}>
            <CrossIcon label="Close" size="small" primaryColor="#6B778C" />
          </button>
        </div>
        <div style={styles.addModalBody}>
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
            <label style={styles.formLabel}>Related Dimension *</label>
            <select
              style={styles.formSelect}
              value={dimensionKey}
              onChange={e => setDimensionKey(e.target.value)}
            >
              {dimensions.map(dim => (
                <option key={dim.dimensionKey} value={dim.dimensionKey}>
                  {dim.dimensionName}
                </option>
              ))}
            </select>
            <span style={styles.formHint}>
              Priority will be updated based on this dimension's position on the matrix
            </span>
          </div>
          <div style={styles.formRow}>
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
        <div style={styles.addModalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{
              ...styles.addBtn,
              ...(title.trim() ? {} : styles.addBtnDisabled),
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },
  actionListColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  analyticsColumn: {
    position: 'sticky',
    top: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  progressBadge: {
    fontSize: '13px',
    color: '#36B37E',
    backgroundColor: '#E3FCEF',
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: 500,
  },
  subtitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#6B778C',
  },
  overallProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#DFE1E6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#5E6C84',
    minWidth: '80px',
    textAlign: 'right',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#FAFBFC',
    border: 'none',
    borderBottom: '1px solid #E4E6EB',
    cursor: 'pointer',
    textAlign: 'left',
  },
  sectionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionIndicator: {
    width: '4px',
    height: '36px',
    borderRadius: '2px',
  },
  sectionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sectionDescription: {
    fontSize: '12px',
    color: '#6B778C',
  },
  sectionHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  sectionContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'background-color 0.2s ease',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '6px',
    padding: '12px',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  cardDragging: {
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25)',
    transform: 'rotate(1deg)',
  },
  cardDone: {
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
  },
  cardHeader: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    cursor: 'grab',
    flexShrink: 0,
    marginTop: '2px',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    marginBottom: '4px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  cardDescription: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    lineHeight: 1.4,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  sourceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '2px 6px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#0052CC',
    cursor: 'pointer',
  },
  metrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  metricLabel: {
    fontSize: '10px',
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  dotRating: {
    display: 'flex',
    gap: '2px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  },
  statusSelector: {
    position: 'relative',
  },
  statusButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    border: '1px solid',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  statusIcon: {
    fontSize: '10px',
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
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
    zIndex: 100,
    minWidth: '120px',
  },
  statusOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'left',
  },
  subTasks: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  subTasksBar: {
    width: '40px',
    height: '4px',
    backgroundColor: '#DFE1E6',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  subTasksFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '2px',
  },
  subTasksLabel: {
    fontSize: '10px',
    color: '#6B778C',
  },
  subTasksEmpty: {
    display: 'flex',
    alignItems: 'center',
  },
  subTasksEmptyText: {
    fontSize: '10px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.5,
    maxWidth: '400px',
  },
  // New styles for highlighting, description, and overall impact
  sectionHighlighted: {
    boxShadow: '0 0 0 3px #B3D4FF',
    animation: 'pulse 1s ease-in-out 2',
  },
  overallImpactButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #E4E6EB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  overallImpactButtonDisabled: {
    backgroundColor: '#F4F5F7',
    color: '#A5ADBA',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  // Priority Guide
  guideBox: {
    padding: '16px 20px',
    backgroundColor: '#FAFBFC',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
  },
  guideHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  guideTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  guideTip: {
    fontSize: '12px',
    color: '#6B778C',
  },
  priorityTags: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  priorityTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #E4E6EB',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  priorityLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  priorityDesc: {
    fontSize: '11px',
    color: '#6B778C',
  },
  // Guide description for dimension-based organization
  guideDescription: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  healthStatusLegend: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendLabel: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  // Priority badge for dimension sections
  priorityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    flexShrink: 0,
  },
  priorityBadgeNumber: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  // Overall Impact Modal styles
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
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '24px',
    color: '#6B778C',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  impactSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  impactStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  impactStatValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  impactStatLabel: {
    fontSize: '11px',
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  impactStatDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: '#E4E6EB',
  },
  impactChartContainer: {
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  impactChartTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    textAlign: 'center',
  },
  sectionBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  breakdownTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  breakdownLabel: {
    width: '80px',
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
  },
  breakdownBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  breakdownValue: {
    width: '40px',
    fontSize: '12px',
    color: '#6B778C',
    textAlign: 'right',
    flexShrink: 0,
  },
  // Header right section
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  // Add Action button
  addActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#DEEBFF',
    border: '1px solid #B3D4FF',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  // Custom badge
  customBadge: {
    padding: '2px 8px',
    backgroundColor: '#DFE1E6',
    color: '#5E6C84',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    marginLeft: '8px',
  },
  // Action buttons container
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  // View Details button
  viewDetailsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    backgroundColor: '#DEEBFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  // Edit button
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
    opacity: 0.5,
    transition: 'all 0.15s ease',
  },
  // Remove button
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
    opacity: 0.5,
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
  // Add Modal styles
  addModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    width: '500px',
    maxWidth: '90vw',
    overflow: 'hidden',
  },
  addModalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #E4E6EB',
  },
  addModalTitle: {
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
  addModalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  addModalFooter: {
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
  formHint: {
    fontSize: '11px',
    color: '#6B778C',
    fontStyle: 'italic',
    marginTop: '4px',
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
  addBtn: {
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  addBtnDisabled: {
    backgroundColor: '#A5ADBA',
    cursor: 'not-allowed',
  },
};

export default ActionPlanTab;
