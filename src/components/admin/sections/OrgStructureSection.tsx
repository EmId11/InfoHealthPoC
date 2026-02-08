import React, { useState, useMemo } from 'react';
import {
  TeamCategorizationConfig,
  TeamCategory,
  CategoryValue,
  FilterRule,
  FilterCondition,
  FilterField,
  FilterOperator,
  getMatchingTeams,
} from '../../../types/admin';
import { mockTeams, TeamOption } from '../../../constants/presets';
import InfoButton from '../../common/InfoButton';
import { AdminOrgStructureHelp } from '../../../constants/helpContent';

interface OrgStructureSectionProps {
  categorization: TeamCategorizationConfig;
  onUpdate: (config: TeamCategorizationConfig) => void;
}

const OrgStructureSection: React.FC<OrgStructureSectionProps> = ({ categorization, onUpdate }) => {
  const [editingCategory, setEditingCategory] = useState<TeamCategory | null>(null);
  const [editingValue, setEditingValue] = useState<CategoryValue | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [addingValueToCategoryId, setAddingValueToCategoryId] = useState<string | null>(null);
  const [editingSystemAttribute, setEditingSystemAttribute] = useState<TeamCategory | null>(null);

  const { categories, categoryValues } = categorization;

  // Separate admin and system attributes (org-structure attributes shown in separate Org Structure tab)
  const adminAttributes = useMemo(() =>
    categories.filter((c) => c.type === 'admin'), [categories]);
  const systemAttributes = useMemo(() =>
    categories.filter((c) => c.type === 'system'), [categories]);

  const getValuesForCategory = (categoryId: string) =>
    categoryValues.filter((v) => v.categoryId === categoryId);

  const handleAddCategory = (newCategory: TeamCategory) => {
    onUpdate({
      ...categorization,
      categories: [...categories, newCategory],
    });
    setShowAddCategory(false);
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<TeamCategory>) => {
    onUpdate({
      ...categorization,
      categories: categories.map((c) => (c.id === categoryId ? { ...c, ...updates } : c)),
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    onUpdate({
      ...categorization,
      categories: categories.filter((c) => c.id !== categoryId),
      categoryValues: categoryValues.filter((v) => v.categoryId !== categoryId),
    });
  };

  const handleAddValue = (newValue: CategoryValue) => {
    onUpdate({
      ...categorization,
      categoryValues: [...categoryValues, newValue],
    });
    setAddingValueToCategoryId(null);
  };

  const handleUpdateValue = (valueId: string, updates: Partial<CategoryValue>) => {
    onUpdate({
      ...categorization,
      categoryValues: categoryValues.map((v) => (v.id === valueId ? { ...v, ...updates } : v)),
    });
    setEditingValue(null);
  };

  const handleDeleteValue = (valueId: string) => {
    onUpdate({
      ...categorization,
      categoryValues: categoryValues.filter((v) => v.id !== valueId),
    });
  };

  // Handler for updating system attribute values (batch update)
  const handleUpdateSystemValues = (attributeId: string, updatedValues: CategoryValue[]) => {
    onUpdate({
      ...categorization,
      categoryValues: [
        ...categoryValues.filter((v) => v.categoryId !== attributeId),
        ...updatedValues,
      ],
    });
    setEditingSystemAttribute(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} data-tour="team-attributes-section">
        <div style={styles.headerContent}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>Team Attributes</h2>
            <InfoButton title="Team Attributes">
              {AdminOrgStructureHelp.teamAttributesSection}
            </InfoButton>
          </div>
          <p style={styles.subtitle}>
            Define ways to classify teams for comparison grouping. Attributes help teams find similar teams to compare
            against.
          </p>
        </div>
        <button style={styles.addCategoryButton} onClick={() => setShowAddCategory(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Attribute
        </button>
      </div>

      {/* System Attributes Section */}
      {systemAttributes.length > 0 && (
        <div style={styles.sectionGroup} data-tour="system-attributes">
          <div style={styles.sectionGroupHeader}>
            <div style={styles.sectionGroupIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.93 4.93l1.41 1.41M9.66 9.66l1.41 1.41M4.93 11.07l1.41-1.41M9.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 style={styles.sectionGroupTitle}>System Attributes</h3>
            <InfoButton title="System Attributes" size="inline">
              {AdminOrgStructureHelp.systemAttributesSection}
            </InfoButton>
            <span style={styles.sectionGroupBadge}>Auto-calculated from Jira</span>
            <InfoButton title="Auto-Calculated" size="inline">
              {AdminOrgStructureHelp.autoCalculatedBadge}
            </InfoButton>
          </div>
          <p style={styles.sectionGroupDescription}>
            These attributes are automatically calculated based on your team's Jira data. Values are assigned dynamically.
          </p>
          <div style={styles.systemAttributesGrid}>
            {systemAttributes.map((attr) => {
              const values = getValuesForCategory(attr.id);
              return (
                <div key={attr.id} style={styles.systemAttributeCard}>
                  <div style={styles.systemAttrHeader}>
                    <div style={{ ...styles.categoryColor, backgroundColor: attr.color || '#6554C0' }} />
                    <span style={styles.systemAttrName}>{attr.name}</span>
                    <button
                      style={styles.systemEditButton}
                      onClick={() => setEditingSystemAttribute(attr)}
                      title="Edit values"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M10 2l2 2M1 13l1-4L10 1l2 2L4 11l-4 1 1 1z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <p style={styles.systemAttrDescription}>{attr.description}</p>
                  <div style={styles.systemValuesRow}>
                    {values.map((v) => (
                      <span key={v.id} style={styles.systemValueTag}>
                        {v.name}
                        {v.threshold && (
                          <span style={styles.thresholdText}>
                            {v.threshold.min !== undefined && v.threshold.max !== undefined
                              ? `${v.threshold.min}-${v.threshold.max}`
                              : v.threshold.min !== undefined
                                ? `${v.threshold.min}+`
                                : `<${v.threshold.max}`}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin-Defined Attributes Section */}
      <div style={styles.sectionGroup} data-tour="custom-attributes">
        <div style={styles.sectionGroupHeader}>
          <div style={styles.sectionGroupIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 2l2 2M1 15l1-4L10 3l2 2L4 13l-4 1 1 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 style={styles.sectionGroupTitle}>Custom Attributes</h3>
          <InfoButton title="Custom Attributes" size="inline">
            {AdminOrgStructureHelp.customAttributesSection}
          </InfoButton>
          <span style={{...styles.sectionGroupBadge, backgroundColor: '#DEEBFF', color: '#0052CC'}}>Admin-defined</span>
        </div>
        <p style={styles.sectionGroupDescription}>
          Create custom attributes to classify teams based on your organization's structure.
        </p>
        <div style={styles.categoriesList}>
          {adminAttributes.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              values={getValuesForCategory(category.id)}
              allTeams={mockTeams}
              allValues={categoryValues}
              allCategories={categories}
              onEdit={() => setEditingCategory(category)}
              onDelete={() => handleDeleteCategory(category.id)}
              onAddValue={() => setAddingValueToCategoryId(category.id)}
              onEditValue={(value) => setEditingValue(value)}
              onDeleteValue={handleDeleteValue}
            />
          ))}

          {adminAttributes.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="8" width="32" height="32" rx="8" stroke="#DFE1E6" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M24 18v12M18 24h12" stroke="#DFE1E6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 style={styles.emptyTitle}>No custom attributes defined</h3>
              <p style={styles.emptyText}>
                Create attributes to define ways teams can be classified (e.g., Work Type, Tribe, Domain).
              </p>
              <button style={styles.emptyButton} onClick={() => setShowAddCategory(true)}>
                Create your first attribute
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {(showAddCategory || editingCategory) && (
        <CategoryEditor
          category={editingCategory}
          onSave={(data) => {
            if (editingCategory) {
              handleUpdateCategory(editingCategory.id, data);
            } else {
              handleAddCategory({
                ...data,
                id: `cat-${Date.now()}`,
                createdAt: new Date().toISOString(),
                createdBy: 'Current Admin',
              } as TeamCategory);
            }
          }}
          onClose={() => {
            setShowAddCategory(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Add/Edit Value Modal */}
      {(addingValueToCategoryId || editingValue) && (
        <ValueEditor
          value={editingValue}
          categoryId={addingValueToCategoryId || editingValue?.categoryId || ''}
          allTeams={mockTeams}
          allCategories={categories}
          allValues={categoryValues}
          onSave={(data) => {
            if (editingValue) {
              handleUpdateValue(editingValue.id, data);
            } else {
              handleAddValue({
                ...data,
                id: `val-${Date.now()}`,
                categoryId: addingValueToCategoryId!,
                createdAt: new Date().toISOString(),
                createdBy: 'Current Admin',
              } as CategoryValue);
            }
          }}
          onClose={() => {
            setAddingValueToCategoryId(null);
            setEditingValue(null);
          }}
        />
      )}

      {/* System Value Editor Modal */}
      {editingSystemAttribute && (
        <SystemValueEditor
          attribute={editingSystemAttribute}
          values={getValuesForCategory(editingSystemAttribute.id)}
          onSave={(updatedValues) => handleUpdateSystemValues(editingSystemAttribute.id, updatedValues)}
          onClose={() => setEditingSystemAttribute(null)}
        />
      )}
    </div>
  );
};

// ============================================
// Category Card Component
// ============================================
interface CategoryCardProps {
  category: TeamCategory;
  values: CategoryValue[];
  allTeams: TeamOption[];
  allValues: CategoryValue[];
  allCategories: TeamCategory[];
  onEdit: () => void;
  onDelete: () => void;
  onAddValue: () => void;
  onEditValue: (value: CategoryValue) => void;
  onDeleteValue: (valueId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  values,
  allTeams,
  allValues,
  allCategories,
  onEdit,
  onDelete,
  onAddValue,
  onEditValue,
  onDeleteValue,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={styles.categoryCard}>
      <div style={styles.categoryHeader} onClick={() => setExpanded(!expanded)}>
        <div style={styles.categoryInfo}>
          <div style={{ ...styles.categoryColor, backgroundColor: category.color || '#5243AA' }} />
          <div>
            <div style={styles.categoryName}>{category.name}</div>
            <div style={styles.categoryDescription}>{category.description}</div>
          </div>
        </div>

        <div style={styles.categoryMeta}>
          <span style={styles.categoryBadge}>
            {category.isRequired ? 'Required' : 'Optional'}
          </span>
          <span style={styles.categoryBadge}>
            {category.allowMultiple ? 'Multiple' : 'Single'}
          </span>
          <span style={styles.valueCount}>{values.length} values</span>
        </div>

        <div style={styles.categoryActions}>
          <button
            style={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit Category"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M10 2l2 2M1 13l1-4L10 1l2 2L4 11l-4 1 1 1z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            style={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Category"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M11 4v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div
            style={{ ...styles.expandIcon, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={styles.categoryContent}>
          {values.map((value) => (
            <ValueCard
              key={value.id}
              value={value}
              allTeams={allTeams}
              allValues={allValues}
              allCategories={allCategories}
              onEdit={() => onEditValue(value)}
              onDelete={() => onDeleteValue(value.id)}
            />
          ))}

          <button style={styles.addValueButton} onClick={onAddValue}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Value
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// Value Card Component
// ============================================
interface ValueCardProps {
  value: CategoryValue;
  allTeams: TeamOption[];
  allValues: CategoryValue[];
  allCategories: TeamCategory[];
  onEdit: () => void;
  onDelete: () => void;
}

const ValueCard: React.FC<ValueCardProps> = ({ value, allTeams, allValues, allCategories, onEdit, onDelete }) => {
  // Find parent value and its attribute for display
  const parentValue = value.parentValueId
    ? allValues.find((v) => v.id === value.parentValueId)
    : null;
  const parentAttribute = parentValue
    ? allCategories.find((c) => c.id === parentValue.attributeId || c.id === parentValue.categoryId)
    : null;
  const matchingTeams = useMemo(() => {
    const teamsForFilter = allTeams.map((t) => ({
      label: t.label,
      value: t.value,
      isOnboarded: t.isOnboarded,
    }));
    return getMatchingTeams(value, teamsForFilter);
  }, [value, allTeams]);

  const filterDescription = useMemo(() => {
    if (!value.filterRule || value.filterRule.conditions.length === 0) {
      return 'No filter rule';
    }
    return value.filterRule.conditions
      .map((c) => `${c.field} ${c.operator} "${Array.isArray(c.value) ? c.value.join(', ') : c.value}"`)
      .join(' AND ');
  }, [value.filterRule]);

  const manualTeamNames = useMemo(() => {
    return value.manualTeamIds
      .map((id) => allTeams.find((t) => t.value === id)?.label)
      .filter(Boolean);
  }, [value.manualTeamIds, allTeams]);

  return (
    <div style={styles.valueCard}>
      <div style={styles.valueHeader}>
        <div style={styles.valueInfo}>
          <span style={styles.valueName}>{value.name}</span>
          <span style={styles.teamCount}>({matchingTeams.length} teams)</span>
        </div>
        <div style={styles.valueActions}>
          <button style={styles.actionButton} onClick={onEdit} title="Edit Value">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M10 2l2 2M1 13l1-4L10 1l2 2L4 11l-4 1 1 1z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button style={styles.actionButton} onClick={onDelete} title="Delete Value">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M11 4v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {value.description && <p style={styles.valueDescription}>{value.description}</p>}

      {/* Show parent hierarchy */}
      {parentValue && parentAttribute && (
        <div style={styles.parentInfo}>
          <span style={styles.parentLabel}>Part of:</span>
          <span style={styles.parentBadge}>
            {parentAttribute.name}: {parentValue.name}
          </span>
        </div>
      )}

      <div style={styles.valueDetails}>
        {value.filterRule && value.filterRule.conditions.length > 0 && (
          <div style={styles.filterInfo}>
            <span style={styles.filterLabel}>Filter:</span>
            <code style={styles.filterCode}>{filterDescription}</code>
          </div>
        )}

        {manualTeamNames.length > 0 && (
          <div style={styles.manualTeamsInfo}>
            <span style={styles.filterLabel}>Manual:</span>
            <div style={styles.teamTags}>
              {manualTeamNames.map((name) => (
                <span key={name} style={styles.teamTag}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Category Editor Modal
// ============================================
interface CategoryEditorProps {
  category: TeamCategory | null;
  onSave: (data: Partial<TeamCategory>) => void;
  onClose: () => void;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({ category, onSave, onClose }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isRequired, setIsRequired] = useState(category?.isRequired ?? false);
  const [allowMultiple, setAllowMultiple] = useState(category?.allowMultiple ?? false);
  const [color, setColor] = useState(category?.color || '#5243AA');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      isRequired,
      allowMultiple,
      color,
    });
  };

  const colorOptions = ['#5243AA', '#0052CC', '#00875A', '#FF8B00', '#DE350B', '#403294'];

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{category ? 'Edit Attribute' : 'New Attribute'}</h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work Type, Tribe, Domain, Team Size"
              style={modalStyles.input}
              autoFocus
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this category represents"
              style={{ ...modalStyles.input, minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Color</label>
            <div style={modalStyles.colorPicker}>
              {colorOptions.map((c) => (
                <button
                  key={c}
                  style={{
                    ...modalStyles.colorOption,
                    backgroundColor: c,
                    border: color === c ? '2px solid #172B4D' : '2px solid transparent',
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
              <span>Required - Creators must select a value for this attribute</span>
            </label>
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
              />
              <span>Allow multiple - Teams can belong to multiple values</span>
            </label>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={modalStyles.submitButton} onClick={handleSubmit} disabled={!name.trim()}>
            {category ? 'Save Changes' : 'Create Attribute'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Value Editor Modal with Filter Rule Builder
// ============================================
interface ValueEditorProps {
  value: CategoryValue | null;
  categoryId: string;
  allTeams: TeamOption[];
  allCategories: TeamCategory[];
  allValues: CategoryValue[];
  onSave: (data: Partial<CategoryValue>) => void;
  onClose: () => void;
}

const ValueEditor: React.FC<ValueEditorProps> = ({
  value,
  categoryId,
  allTeams,
  allCategories,
  allValues,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(value?.name || '');
  const [description, setDescription] = useState(value?.description || '');
  const [filterRule, setFilterRule] = useState<FilterRule>(
    value?.filterRule || { conditions: [] }
  );
  const [manualTeamIds, setManualTeamIds] = useState<string[]>(value?.manualTeamIds || []);
  const [parentValueId, setParentValueId] = useState<string | undefined>(value?.parentValueId);

  // Find the current category and its parent attribute
  const currentCategory = allCategories.find((c) => c.id === categoryId);
  const parentAttribute = currentCategory?.parentAttributeId
    ? allCategories.find((c) => c.id === currentCategory.parentAttributeId)
    : null;
  const parentAttributeValues = parentAttribute
    ? allValues.filter((v) => v.attributeId === parentAttribute.id || v.categoryId === parentAttribute.id)
    : [];

  // Calculate matching teams for preview
  const matchingTeams = useMemo(() => {
    const tempValue: CategoryValue = {
      id: 'preview',
      attributeId: categoryId,
      categoryId, // Legacy alias
      name: 'preview',
      filterRule: filterRule.conditions.length > 0 ? filterRule : null,
      manualTeamIds,
      createdAt: '',
      createdBy: '',
    };
    const teamsForFilter = allTeams.map((t) => ({
      label: t.label,
      value: t.value,
      isOnboarded: t.isOnboarded,
    }));
    return getMatchingTeams(tempValue, teamsForFilter);
  }, [filterRule, manualTeamIds, allTeams, categoryId]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      filterRule: filterRule.conditions.length > 0 ? filterRule : null,
      manualTeamIds,
      parentValueId: parentValueId || undefined,
    });
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{value ? 'Edit Value' : 'New Value'}</h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Development, Alpha Tribe"
              style={modalStyles.input}
              autoFocus
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this value"
              style={modalStyles.input}
            />
          </div>

          {/* Parent Value Selection (for hierarchical attributes) */}
          {parentAttribute && parentAttributeValues.length > 0 && (
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>
                Parent {parentAttribute.name}
              </label>
              <p style={modalStyles.fieldHint}>
                Select which {parentAttribute.name.toLowerCase()} this {currentCategory?.name.toLowerCase()} belongs to.
              </p>
              <select
                value={parentValueId || ''}
                onChange={(e) => setParentValueId(e.target.value || undefined)}
                style={modalStyles.select}
              >
                <option value="">None (no parent)</option>
                {parentAttributeValues.map((pv) => (
                  <option key={pv.id} value={pv.id}>
                    {pv.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Rule Builder */}
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Auto-Assignment Filter</label>
            <p style={modalStyles.fieldHint}>
              Teams matching these conditions will be automatically assigned to this value.
            </p>
            <FilterRuleBuilder rule={filterRule} onChange={setFilterRule} />
          </div>

          {/* Manual Team Selection */}
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Manual Team Assignment</label>
            <p style={modalStyles.fieldHint}>
              Manually add teams (in addition to filter matches).
            </p>
            <TeamPicker
              allTeams={allTeams}
              selectedTeamIds={manualTeamIds}
              filterMatchedTeamIds={matchingTeams
                .filter((m) => m.matchedBy === 'filter' || m.matchedBy === 'both')
                .map((m) => m.teamId)}
              onChange={setManualTeamIds}
            />
          </div>

          {/* Preview */}
          <div style={modalStyles.preview}>
            <div style={modalStyles.previewHeader}>
              <span style={modalStyles.previewLabel}>Preview:</span>
              <span style={modalStyles.previewCount}>{matchingTeams.length} teams match</span>
            </div>
            <div style={modalStyles.previewTeams}>
              {matchingTeams.slice(0, 5).map((match) => {
                const team = allTeams.find((t) => t.value === match.teamId);
                return (
                  <span
                    key={match.teamId}
                    style={{
                      ...modalStyles.previewTag,
                      backgroundColor: match.matchedBy === 'manual' ? '#E3FCEF' : '#DEEBFF',
                    }}
                  >
                    {team?.label}
                    <span style={modalStyles.matchType}>
                      {match.matchedBy === 'both' ? '⚡' : match.matchedBy === 'filter' ? '🔍' : '✋'}
                    </span>
                  </span>
                );
              })}
              {matchingTeams.length > 5 && (
                <span style={modalStyles.previewMore}>+{matchingTeams.length - 5} more</span>
              )}
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={modalStyles.submitButton} onClick={handleSubmit} disabled={!name.trim()}>
            {value ? 'Save Changes' : 'Create Value'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Filter Rule Builder Component
// ============================================
interface FilterRuleBuilderProps {
  rule: FilterRule;
  onChange: (rule: FilterRule) => void;
}

const FIELD_OPTIONS: { value: FilterField; label: string }[] = [
  { value: 'teamName', label: 'Team Name' },
  { value: 'teamKey', label: 'Team Key' },
  { value: 'isOnboarded', label: 'Is Onboarded' },
];

const OPERATOR_OPTIONS: { value: FilterOperator; label: string; forFields: FilterField[] }[] = [
  { value: 'equals', label: 'equals', forFields: ['teamName', 'teamKey'] },
  { value: 'notEquals', label: 'not equals', forFields: ['teamName', 'teamKey'] },
  { value: 'contains', label: 'contains', forFields: ['teamName', 'teamKey'] },
  { value: 'startsWith', label: 'starts with', forFields: ['teamName', 'teamKey'] },
  { value: 'endsWith', label: 'ends with', forFields: ['teamName', 'teamKey'] },
  { value: 'in', label: 'in list', forFields: ['teamName', 'teamKey'] },
  { value: 'notIn', label: 'not in list', forFields: ['teamName', 'teamKey'] },
  { value: 'isTrue', label: 'is true', forFields: ['isOnboarded'] },
  { value: 'isFalse', label: 'is false', forFields: ['isOnboarded'] },
];

const FilterRuleBuilder: React.FC<FilterRuleBuilderProps> = ({ rule, onChange }) => {
  const addCondition = () => {
    onChange({
      conditions: [
        ...rule.conditions,
        { field: 'teamName', operator: 'contains', value: '' },
      ],
    });
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const newConditions = [...rule.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };

    // Reset value if switching to boolean operator
    if (updates.operator === 'isTrue' || updates.operator === 'isFalse') {
      newConditions[index].value = true;
    }
    // Reset to empty string for list operators
    if (updates.operator === 'in' || updates.operator === 'notIn') {
      if (!Array.isArray(newConditions[index].value)) {
        newConditions[index].value = [];
      }
    }

    onChange({ conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    onChange({
      conditions: rule.conditions.filter((_, i) => i !== index),
    });
  };

  const getOperatorsForField = (field: FilterField) => {
    return OPERATOR_OPTIONS.filter((op) => op.forFields.includes(field));
  };

  return (
    <div style={filterStyles.container}>
      {rule.conditions.length > 0 && (
        <p style={filterStyles.hint}>Teams must match ALL conditions (AND logic)</p>
      )}

      {rule.conditions.map((condition, index) => (
        <div key={index} style={filterStyles.condition}>
          <select
            value={condition.field}
            onChange={(e) => {
              const newField = e.target.value as FilterField;
              const validOperators = getOperatorsForField(newField);
              const newOperator = validOperators[0]?.value || 'equals';
              updateCondition(index, { field: newField, operator: newOperator, value: '' });
            }}
            style={filterStyles.select}
          >
            {FIELD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={condition.operator}
            onChange={(e) => updateCondition(index, { operator: e.target.value as FilterOperator })}
            style={filterStyles.select}
          >
            {getOperatorsForField(condition.field).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {condition.operator !== 'isTrue' && condition.operator !== 'isFalse' && (
            condition.operator === 'in' || condition.operator === 'notIn' ? (
              <input
                type="text"
                value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
                onChange={(e) =>
                  updateCondition(index, {
                    value: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="value1, value2, ..."
                style={filterStyles.input}
              />
            ) : (
              <input
                type="text"
                value={typeof condition.value === 'string' ? condition.value : ''}
                onChange={(e) => updateCondition(index, { value: e.target.value })}
                placeholder="Value"
                style={filterStyles.input}
              />
            )
          )}

          <button style={filterStyles.removeButton} onClick={() => removeCondition(index)} title="Remove">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}

      <button style={filterStyles.addButton} onClick={addCondition}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add Condition
      </button>
    </div>
  );
};

// ============================================
// Team Picker Component
// ============================================
interface TeamPickerProps {
  allTeams: TeamOption[];
  selectedTeamIds: string[];
  filterMatchedTeamIds: string[];
  onChange: (teamIds: string[]) => void;
}

const TeamPicker: React.FC<TeamPickerProps> = ({
  allTeams,
  selectedTeamIds,
  filterMatchedTeamIds,
  onChange,
}) => {
  const [search, setSearch] = useState('');

  const filteredTeams = allTeams.filter((team) =>
    team.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={pickerStyles.container}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search teams..."
        style={pickerStyles.search}
      />
      <div style={pickerStyles.list}>
        {filteredTeams.map((team) => {
          const isFilterMatched = filterMatchedTeamIds.includes(team.value);
          const isManuallySelected = selectedTeamIds.includes(team.value);

          return (
            <label
              key={team.value}
              style={{
                ...pickerStyles.item,
                backgroundColor: isFilterMatched ? '#DEEBFF' : 'transparent',
              }}
            >
              <input
                type="checkbox"
                checked={isManuallySelected}
                disabled={isFilterMatched}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedTeamIds, team.value]);
                  } else {
                    onChange(selectedTeamIds.filter((id) => id !== team.value));
                  }
                }}
              />
              <span>{team.label}</span>
              {isFilterMatched && <span style={pickerStyles.filterBadge}>via filter</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// System Value Editor Modal
// ============================================
interface SystemValueEditorProps {
  attribute: TeamCategory;
  values: CategoryValue[];
  onSave: (values: CategoryValue[]) => void;
  onClose: () => void;
}

interface EditableSystemValue {
  id: string;
  name: string;
  description: string;
  threshold?: { min?: number; max?: number };
  isNew?: boolean;
}

const SystemValueEditor: React.FC<SystemValueEditorProps> = ({ attribute, values, onSave, onClose }) => {
  const [editableValues, setEditableValues] = useState<EditableSystemValue[]>(
    values.map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description || '',
      threshold: v.threshold,
    }))
  );

  // Check if this is the Process attribute (no numeric thresholds)
  const isProcessAttribute = attribute.id === 'sys-process';

  const handleValueChange = (index: number, field: 'name' | 'description', value: string) => {
    const newValues = [...editableValues];
    newValues[index] = {
      ...newValues[index],
      [field]: value,
    };
    setEditableValues(newValues);
  };

  const handleThresholdChange = (index: number, field: 'min' | 'max', value: string) => {
    const newValues = [...editableValues];
    const numValue = value === '' ? undefined : parseInt(value, 10);
    newValues[index] = {
      ...newValues[index],
      threshold: {
        ...newValues[index].threshold,
        [field]: isNaN(numValue as number) ? undefined : numValue,
      },
    };
    setEditableValues(newValues);
  };

  const handleAddValue = () => {
    const newValue: EditableSystemValue = {
      id: `val-sys-${Date.now()}`,
      name: '',
      description: '',
      threshold: isProcessAttribute ? undefined : { min: undefined, max: undefined },
      isNew: true,
    };
    setEditableValues([...editableValues, newValue]);
  };

  const handleDeleteValue = (index: number) => {
    if (editableValues.length <= 1) return; // Enforce minimum 1 value
    setEditableValues(editableValues.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate all values have names
    if (editableValues.some((v) => !v.name.trim())) return;

    const updatedValues: CategoryValue[] = editableValues.map((ev) => {
      const originalValue = values.find((v) => v.id === ev.id);
      return {
        id: ev.id,
        attributeId: attribute.id,
        categoryId: attribute.id, // Legacy alias
        name: ev.name.trim(),
        description: ev.description.trim(),
        filterRule: originalValue?.filterRule || null,
        manualTeamIds: originalValue?.manualTeamIds || [],
        threshold: ev.threshold,
        createdAt: originalValue?.createdAt || new Date().toISOString(),
        createdBy: originalValue?.createdBy || 'Current Admin',
      };
    });

    onSave(updatedValues);
  };

  const canDelete = editableValues.length > 1;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Edit {attribute.name} Values</h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          <p style={systemEditorStyles.description}>
            {isProcessAttribute
              ? 'Define the process methodology options for teams.'
              : `Define the ${attribute.name.toLowerCase()} ranges and their thresholds.`}
          </p>

          {/* Table header */}
          <div style={systemEditorStyles.tableHeader}>
            <span style={systemEditorStyles.colName}>Value Name</span>
            {!isProcessAttribute && (
              <>
                <span style={systemEditorStyles.colThreshold}>Min</span>
                <span style={systemEditorStyles.colThreshold}>Max</span>
              </>
            )}
            <span style={systemEditorStyles.colActions}></span>
          </div>

          {/* Value rows */}
          <div style={systemEditorStyles.valuesList}>
            {editableValues.map((val, index) => (
              <div key={val.id} style={systemEditorStyles.valueRow}>
                <input
                  type="text"
                  value={val.name}
                  onChange={(e) => handleValueChange(index, 'name', e.target.value)}
                  placeholder="Value name"
                  style={systemEditorStyles.nameInput}
                />
                {!isProcessAttribute && (
                  <>
                    <input
                      type="number"
                      value={val.threshold?.min ?? ''}
                      onChange={(e) => handleThresholdChange(index, 'min', e.target.value)}
                      placeholder="Min"
                      style={systemEditorStyles.thresholdInput}
                    />
                    <input
                      type="number"
                      value={val.threshold?.max ?? ''}
                      onChange={(e) => handleThresholdChange(index, 'max', e.target.value)}
                      placeholder="Max"
                      style={systemEditorStyles.thresholdInput}
                    />
                  </>
                )}
                <button
                  style={{
                    ...systemEditorStyles.deleteButton,
                    opacity: canDelete ? 1 : 0.4,
                    cursor: canDelete ? 'pointer' : 'not-allowed',
                  }}
                  onClick={() => handleDeleteValue(index)}
                  disabled={!canDelete}
                  title={canDelete ? 'Delete value' : 'At least one value is required'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M11 4v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button style={systemEditorStyles.addButton} onClick={handleAddValue}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Value
          </button>

          {/* Preview */}
          <div style={systemEditorStyles.preview}>
            <span style={systemEditorStyles.previewLabel}>Preview:</span>
            <div style={systemEditorStyles.previewTags}>
              {editableValues
                .filter((v) => v.name.trim())
                .map((v) => (
                  <span key={v.id} style={styles.systemValueTag}>
                    {v.name}
                    {v.threshold && !isProcessAttribute && (
                      <span style={styles.thresholdText}>
                        {v.threshold.min !== undefined && v.threshold.max !== undefined
                          ? `${v.threshold.min}-${v.threshold.max}`
                          : v.threshold.min !== undefined
                            ? `${v.threshold.min}+`
                            : v.threshold.max !== undefined
                              ? `<${v.threshold.max}`
                              : ''}
                      </span>
                    )}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={modalStyles.submitButton}
            onClick={handleSubmit}
            disabled={editableValues.some((v) => !v.name.trim())}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const systemEditorStyles: Record<string, React.CSSProperties> = {
  description: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 0 8px 0',
    borderBottom: '1px solid #EBECF0',
    marginBottom: '8px',
  },
  colName: {
    flex: 1,
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  colThreshold: {
    width: '60px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'center',
  },
  colActions: {
    width: '32px',
  },
  valuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
  },
  nameInput: {
    flex: 1,
    padding: '8px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
  },
  thresholdInput: {
    width: '60px',
    padding: '8px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center',
    outline: 'none',
  },
  deleteButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#DE350B',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '2px dashed #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    marginTop: '8px',
  },
  preview: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  previewLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  previewTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
};

// ============================================
// Styles
// ============================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '4px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    maxWidth: '600px',
  },
  addCategoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  categoriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#F7F8FA',
    cursor: 'pointer',
  },
  categoryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  categoryColor: {
    width: '8px',
    height: '40px',
    borderRadius: '4px',
  },
  categoryName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  categoryDescription: {
    fontSize: '13px',
    color: '#6B778C',
    marginTop: '2px',
  },
  categoryMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  categoryBadge: {
    padding: '4px 8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  valueCount: {
    fontSize: '13px',
    color: '#6B778C',
  },
  categoryActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  expandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
    transition: 'transform 0.15s',
  },
  categoryContent: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  valueCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  valueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  valueName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  teamCount: {
    fontSize: '13px',
    color: '#6B778C',
  },
  valueActions: {
    display: 'flex',
    gap: '4px',
  },
  valueDescription: {
    margin: '8px 0 0 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  parentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
  },
  parentLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  parentBadge: {
    fontSize: '12px',
    padding: '3px 8px',
    backgroundColor: '#EAE6FF',
    color: '#403294',
    borderRadius: '4px',
    fontWeight: 500,
  },
  valueDetails: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  filterCode: {
    fontSize: '12px',
    backgroundColor: '#EBECF0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    color: '#172B4D',
  },
  manualTeamsInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  teamTags: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  teamTag: {
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#006644',
  },
  addValueButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '2px dashed #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    border: '1px solid #EBECF0',
  },
  emptyIcon: {
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#6B778C',
    textAlign: 'center',
    maxWidth: '400px',
  },
  emptyButton: {
    padding: '10px 20px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  // Section group styles
  sectionGroup: {
    marginBottom: '8px',
  },
  sectionGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  sectionGroupIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#F4F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
  },
  sectionGroupTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionGroupBadge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#EAE6FF',
    color: '#5243AA',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  sectionGroupDescription: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
    marginLeft: '38px',
  },
  // System attributes specific styles
  systemAttributesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
    marginLeft: '38px',
  },
  systemAttributeCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    padding: '14px',
  },
  systemAttrHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  systemAttrName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    flex: 1,
  },
  systemEditButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
    opacity: 0.6,
    transition: 'opacity 0.15s',
  },
  systemAttrDescription: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  systemValuesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  systemValueTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#172B4D',
  },
  thresholdText: {
    fontSize: '10px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
};

const modalStyles: Record<string, React.CSSProperties> = {
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
  },
  modal: {
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  content: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fieldHint: {
    margin: 0,
    fontSize: '12px',
    color: '#97A0AF',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    width: '100%',
    cursor: 'pointer',
  },
  colorPicker: {
    display: 'flex',
    gap: '8px',
  },
  colorOption: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    position: 'sticky',
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 16px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  preview: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  previewLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  previewCount: {
    fontSize: '12px',
    color: '#5243AA',
    fontWeight: 600,
  },
  previewTeams: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  previewTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#172B4D',
  },
  matchType: {
    fontSize: '10px',
  },
  previewMore: {
    padding: '4px 8px',
    fontSize: '12px',
    color: '#6B778C',
  },
};

const filterStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px',
  },
  hint: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  condition: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  select: {
    padding: '6px 8px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    minWidth: '100px',
  },
  removeButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#DE350B',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    backgroundColor: 'transparent',
    border: '1px dashed #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#6B778C',
    cursor: 'pointer',
  },
};

const pickerStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px',
  },
  search: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  filterBadge: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#0052CC',
    fontStyle: 'italic',
  },
};

export default OrgStructureSection;
