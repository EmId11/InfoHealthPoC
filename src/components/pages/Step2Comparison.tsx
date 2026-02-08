import React, { useMemo, useEffect } from 'react';
import { Step2Data, CategorySelection, OrgStructureSelection } from '../../types/wizard';
import { mockTeams, TeamSystemAttributes } from '../../constants/presets';
import {
  TeamCategorizationConfig,
  getMatchingTeams,
  OrgStructureSettings,
  OrganizationDefaults,
} from '../../types/admin';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';
import InfoButton from '../common/InfoButton';
import { WizardStep2Help } from '../../constants/helpContent';

interface Step2Props {
  data: Step2Data;
  onUpdate: (data: Partial<Step2Data>) => void;
  teamCategorization?: TeamCategorizationConfig;
  currentTeamId?: string | null;
  orgStructureSettings?: OrgStructureSettings;
  organizationDefaults?: OrganizationDefaults;
}

// System attribute IDs for lookup
const SYSTEM_ATTRIBUTE_IDS = {
  TEAM_SIZE: 'sys-team-size',
  TENURE: 'sys-tenure',
  VOLUME: 'sys-volume',
  PROCESS: 'sys-process',
};

// Format threshold for display (e.g., "1-5", "16+", "<6")
const formatThreshold = (threshold?: { min?: number; max?: number }): string => {
  if (!threshold) return '';
  if (threshold.min !== undefined && threshold.max !== undefined) {
    return ` ${threshold.min}-${threshold.max}`;
  } else if (threshold.min !== undefined) {
    return ` ${threshold.min}+`;
  } else if (threshold.max !== undefined) {
    return ` <${threshold.max}`;
  }
  return '';
};

const Step2Comparison: React.FC<Step2Props> = ({
  data,
  onUpdate,
  teamCategorization,
  currentTeamId,
  orgStructureSettings,
  organizationDefaults,
}) => {
  // Similar Teams section has been removed - teams are now matched via attributes only

  // Org structure settings (default to using hierarchy)
  const settings = orgStructureSettings || {
    useHierarchy: true,
    teamOfTeamsMandatory: false,
    portfolioMandatory: false,
  };

  // Get org-structure attributes (Portfolio and Team of Teams)
  const orgStructureAttributes = useMemo(() =>
    teamCategorization?.categories.filter((c) => c.type === 'org-structure') || [],
    [teamCategorization]);

  const portfolioAttribute = orgStructureAttributes.find((a) => a.id === 'cat-portfolio');
  const teamOfTeamsAttribute = orgStructureAttributes.find((a) => a.id === 'cat-tribe');

  const portfolioValues = useMemo(() =>
    teamCategorization?.categoryValues.filter((v) =>
      v.categoryId === 'cat-portfolio' || v.attributeId === 'cat-portfolio'
    ) || [],
    [teamCategorization]);

  const teamOfTeamsValues = useMemo(() =>
    teamCategorization?.categoryValues.filter((v) =>
      v.categoryId === 'cat-tribe' || v.attributeId === 'cat-tribe'
    ) || [],
    [teamCategorization]);

  // Check if current team is already mapped to a Portfolio or Team of Teams
  const getTeamMapping = useMemo(() => {
    if (!currentTeamId) return { portfolioValueId: null, teamOfTeamsValueId: null };

    const teamForFilter = {
      label: mockTeams.find((t) => t.value === currentTeamId)?.label || '',
      value: currentTeamId,
      isOnboarded: mockTeams.find((t) => t.value === currentTeamId)?.isOnboarded || false,
    };

    // Find Team of Teams the team belongs to
    let teamOfTeamsValueId: string | null = null;
    for (const totValue of teamOfTeamsValues) {
      const matches = getMatchingTeams(totValue, [teamForFilter]);
      if (matches.length > 0) {
        teamOfTeamsValueId = totValue.id;
        break;
      }
    }

    // Find Portfolio the team belongs to (directly or via Team of Teams)
    let portfolioValueId: string | null = null;
    for (const pValue of portfolioValues) {
      // Direct membership
      const directMatches = getMatchingTeams(pValue, [teamForFilter]);
      if (directMatches.length > 0) {
        portfolioValueId = pValue.id;
        break;
      }
      // Via Team of Teams parent
      if (teamOfTeamsValueId) {
        const totValue = teamOfTeamsValues.find((t) => t.id === teamOfTeamsValueId);
        if (totValue?.parentValueId === pValue.id || pValue.manualTeamOfTeamsIds?.includes(teamOfTeamsValueId)) {
          portfolioValueId = pValue.id;
          break;
        }
      }
    }

    return { portfolioValueId, teamOfTeamsValueId };
  }, [currentTeamId, portfolioValues, teamOfTeamsValues]);

  // Initialize org structure selection with pre-selected values
  useEffect(() => {
    if (!settings.useHierarchy) return;
    if (data.orgStructure?.wasPreSelected) return; // Already initialized

    const { portfolioValueId, teamOfTeamsValueId } = getTeamMapping;

    if (portfolioValueId || teamOfTeamsValueId) {
      onUpdate({
        orgStructure: {
          portfolioValueId,
          teamOfTeamsValueId,
          wasPreSelected: true,
        },
      });
    }
  }, [settings.useHierarchy, getTeamMapping, data.orgStructure?.wasPreSelected]);

  // Handle org structure selection change
  const handleOrgStructureChange = (field: 'portfolioValueId' | 'teamOfTeamsValueId', valueId: string | null) => {
    onUpdate({
      orgStructure: {
        ...data.orgStructure,
        [field]: valueId,
        wasPreSelected: false, // User manually changed it
      },
    });
  };

  // Get current team info
  const currentTeam = useMemo(() => {
    if (!currentTeamId) return null;
    return mockTeams.find((t) => t.value === currentTeamId) || null;
  }, [currentTeamId]);

  // Separate system and admin-defined attributes
  const systemAttributes = useMemo(() =>
    teamCategorization?.categories.filter((c) => c.type === 'system') || [],
    [teamCategorization]);
  const adminAttributes = useMemo(() =>
    teamCategorization?.categories.filter((c) => c.type === 'admin') || [],
    [teamCategorization]);

  // Get auto-populated system attribute values from current team's Jira data
  // If team has no systemAttributes, provide sensible defaults
  const autoPopulatedSystemValues = useMemo(() => {
    const map = new Map<string, string>();
    if (currentTeam?.systemAttributes) {
      const attrs = currentTeam.systemAttributes as TeamSystemAttributes;
      map.set(SYSTEM_ATTRIBUTE_IDS.TEAM_SIZE, attrs.teamSize);
      map.set(SYSTEM_ATTRIBUTE_IDS.TENURE, attrs.tenure);
      map.set(SYSTEM_ATTRIBUTE_IDS.VOLUME, attrs.volume);
      map.set(SYSTEM_ATTRIBUTE_IDS.PROCESS, attrs.process);
    } else if (currentTeam) {
      // Default values when systemAttributes is undefined
      map.set(SYSTEM_ATTRIBUTE_IDS.TEAM_SIZE, 'val-size-medium');
      map.set(SYSTEM_ATTRIBUTE_IDS.TENURE, 'val-tenure-good');
      map.set(SYSTEM_ATTRIBUTE_IDS.VOLUME, 'val-volume-medium');
      map.set(SYSTEM_ATTRIBUTE_IDS.PROCESS, 'val-process-hybrid');
    }
    return map;
  }, [currentTeam]);

  // Get admin-mapped values for the current team (pre-assigned by admin via filter rules or manual assignment)
  const adminMappedValues = useMemo(() => {
    if (!currentTeamId || !teamCategorization) return new Map<string, string[]>();

    const teamForFilter = {
      label: currentTeam?.label || '',
      value: currentTeamId,
      isOnboarded: currentTeam?.isOnboarded || false,
    };

    const map = new Map<string, string[]>();

    // Only check admin-type attributes (not system or org-structure)
    const adminAttrs = teamCategorization.categories.filter(c => c.type === 'admin');

    for (const attr of adminAttrs) {
      const attrValues = teamCategorization.categoryValues.filter(
        v => v.categoryId === attr.id || v.attributeId === attr.id
      );

      const mappedIds = attrValues
        .filter(v => getMatchingTeams(v, [teamForFilter]).length > 0)
        .map(v => v.id);

      if (mappedIds.length > 0) {
        map.set(attr.id, mappedIds);
      }
    }

    return map;
  }, [currentTeamId, currentTeam, teamCategorization]);

  // Initialize selections with auto-populated system values on first render
  useEffect(() => {
    if (!teamCategorization || data.comparisonCriteria.categorySelections.length > 0) return;

    const initialSelections: CategorySelection[] = [];

    // System attributes: auto-populate from team's Jira data
    for (const attr of systemAttributes) {
      const autoValue = autoPopulatedSystemValues.get(attr.id);
      initialSelections.push({
        categoryId: attr.id,
        selectedValueIds: autoValue ? [autoValue] : [],
      });
    }

    // Admin attributes: pre-populate from admin mappings (filter rules or manual assignment)
    for (const attr of adminAttributes) {
      const mappedValueIds = adminMappedValues.get(attr.id) || [];
      initialSelections.push({
        categoryId: attr.id,
        selectedValueIds: mappedValueIds,
      });
    }

    if (initialSelections.length > 0) {
      onUpdate({
        comparisonCriteria: {
          ...data.comparisonCriteria,
          categorySelections: initialSelections,
        },
      });
    }
  }, [teamCategorization, autoPopulatedSystemValues, systemAttributes, adminAttributes, adminMappedValues]);

  // Handle toggling a category value selection
  const handleCategoryValueToggle = (categoryId: string, valueId: string, isSystemAttr: boolean) => {
    const currentSelections = data.comparisonCriteria.categorySelections;
    const categorySelection = currentSelections.find((cs) => cs.categoryId === categoryId);

    let newSelections: CategorySelection[];

    if (categorySelection) {
      let newValueIds: string[];

      if (isSystemAttr) {
        // System attributes: single select (radio behavior)
        newValueIds = [valueId];
      } else {
        // Admin attributes: multi-select (checkbox behavior)
        const isSelected = categorySelection.selectedValueIds.includes(valueId);
        newValueIds = isSelected
          ? categorySelection.selectedValueIds.filter((id) => id !== valueId)
          : [...categorySelection.selectedValueIds, valueId];
      }

      newSelections = currentSelections.map((cs) =>
        cs.categoryId === categoryId ? { ...cs, selectedValueIds: newValueIds } : cs
      );
    } else {
      newSelections = [
        ...currentSelections,
        { categoryId, selectedValueIds: [valueId] },
      ];
    }

    onUpdate({
      comparisonCriteria: {
        ...data.comparisonCriteria,
        categorySelections: newSelections,
      },
    });
  };

  // Check if a value is selected
  const isValueSelected = (categoryId: string, valueId: string): boolean => {
    const categorySelection = data.comparisonCriteria.categorySelections.find(
      (cs) => cs.categoryId === categoryId
    );
    return categorySelection?.selectedValueIds.includes(valueId) ?? false;
  };

  // Check if a value is auto-populated (for visual indicator)
  const isValueAutoPopulated = (categoryId: string, valueId: string): boolean => {
    return autoPopulatedSystemValues.get(categoryId) === valueId;
  };

  // Get parent value info for hierarchy display
  const getParentValueInfo = (valueId: string) => {
    const value = teamCategorization?.categoryValues.find((v) => v.id === valueId);
    if (!value?.parentValueId) return null;

    const parentValue = teamCategorization?.categoryValues.find((v) => v.id === value.parentValueId);
    if (!parentValue) return null;

    const parentAttribute = teamCategorization?.categories.find(
      (c) => c.id === parentValue.attributeId || c.id === parentValue.categoryId
    );
    if (!parentAttribute) return null;

    return {
      attributeName: parentAttribute.name,
      valueName: parentValue.name,
    };
  };

  // Validation: check if all required attributes have selections
  const getValidationState = () => {
    const missingSystem: string[] = [];
    const missingAdmin: string[] = [];

    for (const attr of systemAttributes) {
      const selection = data.comparisonCriteria.categorySelections.find(
        (cs) => cs.categoryId === attr.id
      );
      if (!selection || selection.selectedValueIds.length === 0) {
        missingSystem.push(attr.name);
      }
    }

    for (const attr of adminAttributes) {
      const selection = data.comparisonCriteria.categorySelections.find(
        (cs) => cs.categoryId === attr.id
      );
      if (!selection || selection.selectedValueIds.length === 0) {
        missingAdmin.push(attr.name);
      }
    }

    return { missingSystem, missingAdmin, isValid: missingSystem.length === 0 && missingAdmin.length === 0 };
  };

  const validation = getValidationState();

  // Count selected attribute values
  const selectedAttributeCount = data.comparisonCriteria.categorySelections.reduce(
    (sum, cs) => sum + cs.selectedValueIds.length, 0
  );

  // Helper to render attribute section
  const renderAttributeSection = (
    attributes: typeof systemAttributes,
    badge: { text: string; color: string; bgColor: string },
    description: string,
    isSystem: boolean
  ) => {
    if (attributes.length === 0) return null;

    return (
      <div style={styles.attributeGroup}>
        <div style={styles.attributeGroupHeader}>
          <h4 style={styles.attributeGroupTitle}>Team Attributes</h4>
          <span style={{ ...styles.badge, color: badge.color, backgroundColor: badge.bgColor }}>
            {badge.text}
          </span>
        </div>
        <p style={styles.attributeGroupDescription}>{description}</p>

        <div style={styles.categoriesContainer}>
          {attributes.map((category) => {
            const values = teamCategorization?.categoryValues.filter(
              (v) => v.categoryId === category.id
            ) || [];

            if (values.length === 0) return null;

            const selection = data.comparisonCriteria.categorySelections.find(
              (cs) => cs.categoryId === category.id
            );
            const hasSelection = selection && selection.selectedValueIds.length > 0;
            const isInvalid = !hasSelection;

            // Check if this attribute has admin-mapped values (should be locked for non-system attributes)
            const isAdminMapped = !isSystem && adminMappedValues.has(category.id);
            const adminMappedValueIds = adminMappedValues.get(category.id) || [];

            return (
              <div
                key={category.id}
                style={{
                  ...styles.categorySection,
                  border: `1px solid ${isInvalid ? '#FFAB00' : isAdminMapped ? '#36B37E' : '#DFE1E6'}`,
                }}
              >
                <div style={styles.categoryHeader}>
                  <div
                    style={{
                      ...styles.categoryColor,
                      backgroundColor: category.color || '#5243AA',
                    }}
                  />
                  <span style={styles.categoryName}>{category.name}</span>
                  <span style={styles.requiredBadge}>Required</span>
                  {isAdminMapped && (
                    <span style={styles.preAssignedAttrBadge}>Pre-assigned</span>
                  )}
                </div>
                {category.description && (
                  <p style={styles.categoryDescription}>{category.description}</p>
                )}

                <div style={styles.valuesGrid}>
                  {values.map((value) => {
                    const isSelected = isValueSelected(category.id, value.id);
                    const isAutoPopulated = isSystem && isValueAutoPopulated(category.id, value.id);
                    const isThisValueAdminMapped = adminMappedValueIds.includes(value.id);

                    return (
                      <label
                        key={value.id}
                        style={{
                          ...styles.valueChip,
                          backgroundColor: isSelected ? '#DEEBFF' : '#F4F5F7',
                          border: `2px solid ${isSelected ? '#0052CC' : 'transparent'}`,
                          ...(isAdminMapped ? { cursor: 'not-allowed', opacity: 0.8 } : {}),
                        }}
                      >
                        <input
                          type={isSystem ? 'radio' : 'checkbox'}
                          name={isSystem ? category.id : undefined}
                          checked={isSelected}
                          onChange={() => handleCategoryValueToggle(category.id, value.id, isSystem)}
                          disabled={isAdminMapped}
                          style={{ display: 'none' }}
                        />
                        <span style={styles.valueLabel}>
                          {value.name}
                          {isSystem && value.threshold && (
                            <span style={styles.thresholdLabel}>{formatThreshold(value.threshold)}</span>
                          )}
                        </span>
                        {isAutoPopulated && isSelected && (
                          <span style={styles.autoPopulatedBadge} title="Auto-detected from Jira">
                            ⚡
                          </span>
                        )}
                        {isThisValueAdminMapped && isSelected && (
                          <span style={styles.autoPopulatedBadge} title="Pre-assigned by admin">
                            ⚡
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {isAdminMapped && (
                  <p style={styles.adminMappedNote}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                      <circle cx="7" cy="7" r="6" stroke="#0052CC" strokeWidth="1.5" fill="none" />
                      <path d="M7 4v3M7 9v1" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    This team is already mapped to this attribute. Contact an admin if changes are needed.
                  </p>
                )}

                {/* Show inherited parent hierarchy for selected values */}
                {!isSystem && (() => {
                  const selectedValues = selection?.selectedValueIds || [];
                  const parentsInfo = selectedValues
                    .map((vid) => ({ valueId: vid, parent: getParentValueInfo(vid) }))
                    .filter((p) => p.parent !== null);

                  if (parentsInfo.length === 0) return null;

                  return (
                    <div style={styles.inheritedInfo}>
                      {parentsInfo.map(({ valueId, parent }) => {
                        const val = values.find((v) => v.id === valueId);
                        return (
                          <div key={valueId} style={styles.inheritedRow}>
                            <span style={styles.inheritedLabel}>{val?.name} is part of:</span>
                            <span style={styles.inheritedBadge}>
                              {parent!.attributeName}: {parent!.valueName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container} data-tour="comparison-options">
      <StepHeader
        icon={StepIcons.comparison()}
        title="Team Context"
        description="Help us understand your team to provide relevant insights. We'll use this to identify similar teams for meaningful comparisons."
        tourId={2}
        infoContent={
          <>
            <p>Providing context about your team helps generate more meaningful comparisons and insights.</p>
            <p><strong>Organizational Hierarchy:</strong> If your organization uses Portfolios and Teams of Teams, specify where your team fits. This enables roll-up reporting and executive dashboards.</p>
            <p><strong>Team Attributes:</strong> Select attributes that describe your team (size, process, domain, etc.). These help find similar teams for benchmarking.</p>
            <p><strong>Comparison Teams:</strong> Optionally select specific teams to compare against, or let the system find similar teams automatically based on attributes.</p>
          </>
        }
      />

      {/* Org Structure Selection Section */}
      {settings.useHierarchy && (portfolioValues.length > 0 || teamOfTeamsValues.length > 0) && (
        <div style={styles.section} data-tour="org-structure">
          <div style={styles.sectionHeaderRow}>
            <h4 style={styles.sectionTitle}>Organizational Structure</h4>
            <InfoButton title="Organizational Structure" size="inline">
              {WizardStep2Help.orgStructureSection}
            </InfoButton>
            {data.orgStructure?.wasPreSelected && (
              <span style={styles.preSelectedBadge}>Pre-selected</span>
            )}
          </div>
          <p style={styles.sectionDescription}>
            Where does this team sit in your organization? {data.orgStructure?.wasPreSelected && 'Values were pre-selected based on existing team mapping.'}
          </p>

          <div style={styles.orgStructureGrid}>
            {/* Portfolio Selection */}
            {portfolioValues.length > 0 && (
              <div style={styles.orgStructureField}>
                <label style={styles.orgStructureLabel}>
                  {portfolioAttribute?.name || 'Portfolio'}
                  {settings.portfolioMandatory && !data.orgStructure?.wasPreSelected && <span style={styles.requiredMarker}>*</span>}
                </label>
                <select
                  value={data.orgStructure?.portfolioValueId || ''}
                  onChange={(e) => handleOrgStructureChange('portfolioValueId', e.target.value || null)}
                  disabled={data.orgStructure?.wasPreSelected}
                  style={{
                    ...styles.orgStructureSelect,
                    border: `1px solid ${settings.portfolioMandatory && !data.orgStructure?.portfolioValueId && !data.orgStructure?.wasPreSelected ? '#FFAB00' : '#DFE1E6'}`,
                    ...(data.orgStructure?.wasPreSelected ? styles.orgStructureSelectDisabled : {}),
                  }}
                >
                  {!settings.portfolioMandatory && <option value="">None</option>}
                  {settings.portfolioMandatory && !data.orgStructure?.portfolioValueId && <option value="">Select...</option>}
                  {portfolioValues.map((pv) => (
                    <option key={pv.id} value={pv.id}>
                      {pv.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Team of Teams Selection */}
            {teamOfTeamsValues.length > 0 && (
              <div style={styles.orgStructureField}>
                <label style={styles.orgStructureLabel}>
                  {teamOfTeamsAttribute?.name || 'Team of Teams'}
                  {settings.teamOfTeamsMandatory && !data.orgStructure?.wasPreSelected && <span style={styles.requiredMarker}>*</span>}
                </label>
                <select
                  value={data.orgStructure?.teamOfTeamsValueId || ''}
                  onChange={(e) => handleOrgStructureChange('teamOfTeamsValueId', e.target.value || null)}
                  disabled={data.orgStructure?.wasPreSelected}
                  style={{
                    ...styles.orgStructureSelect,
                    border: `1px solid ${settings.teamOfTeamsMandatory && !data.orgStructure?.teamOfTeamsValueId && !data.orgStructure?.wasPreSelected ? '#FFAB00' : '#DFE1E6'}`,
                    ...(data.orgStructure?.wasPreSelected ? styles.orgStructureSelectDisabled : {}),
                  }}
                >
                  {!settings.teamOfTeamsMandatory && <option value="">None</option>}
                  {settings.teamOfTeamsMandatory && !data.orgStructure?.teamOfTeamsValueId && <option value="">Select...</option>}
                  {teamOfTeamsValues.map((tv) => (
                    <option key={tv.id} value={tv.id}>
                      {tv.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {data.orgStructure?.wasPreSelected && (
            <p style={styles.preSelectedNote}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <circle cx="7" cy="7" r="6" stroke="#0052CC" strokeWidth="1.5" fill="none" />
                <path d="M7 4v3M7 9v1" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              This team is already mapped in your organization's hierarchy. Contact an admin if changes are needed.
            </p>
          )}
        </div>
      )}

      {/* Team Attributes Section */}
      <div data-tour="team-attributes">
        {/* System Attributes Section - Pre-populated */}
        {renderAttributeSection(
          systemAttributes,
          { text: 'Pre-populated from Jira', color: '#5243AA', bgColor: '#EAE6FF' },
          'These values were detected from your Jira data. You can adjust them if needed.',
          true
        )}

        {/* Admin-Defined Attributes Section - You specify */}
        {renderAttributeSection(
          adminAttributes,
          { text: 'You specify', color: '#0052CC', bgColor: '#DEEBFF' },
          'Select the attributes that best describe your team.',
          false
        )}
      </div>

      {/* Summary Section */}
      <div style={{
        ...styles.summarySection,
        border: `1px solid ${validation.isValid ? '#36B37E' : '#FFAB00'}`,
        backgroundColor: validation.isValid ? '#E3FCEF' : '#FFFAE6',
      }}>
        {validation.isValid ? (
          <div style={styles.summaryText}>
            <strong>{selectedAttributeCount}</strong> attribute value{selectedAttributeCount !== 1 ? 's' : ''} selected for team matching
          </div>
        ) : (
          <div style={{ ...styles.summaryText, color: '#974F0C' }}>
            Please select values for: {[...validation.missingSystem, ...validation.missingAdmin].join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '640px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 6px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionDescription: {
    margin: '0 0 14px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  // Attribute Group Styles
  attributeGroup: {
    marginBottom: '28px',
  },
  attributeGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  attributeGroupTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  attributeGroupDescription: {
    margin: '0 0 14px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
  },
  // Summary Section
  summarySection: {
    marginTop: '24px',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid',
  },
  summaryText: {
    fontSize: '13px',
    color: '#172B4D',
  },
  categoriesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  categorySection: {
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  categoryColor: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  categoryName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  requiredBadge: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#DE350B',
    backgroundColor: '#FFEBE6',
    padding: '2px 6px',
    borderRadius: '3px',
    marginLeft: '4px',
  },
  preAssignedAttrBadge: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#006644',
    backgroundColor: '#E3FCEF',
    padding: '2px 6px',
    borderRadius: '3px',
    marginLeft: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
  },
  categoryDescription: {
    fontSize: '12px',
    color: '#6B778C',
    margin: '0 0 12px 0',
    lineHeight: 1.4,
  },
  valuesGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  valueChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '16px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '13px',
  },
  valueLabel: {
    color: '#172B4D',
  },
  thresholdLabel: {
    color: '#6B778C',
    fontSize: '11px',
    fontWeight: 400,
  },
  inheritedInfo: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed #DFE1E6',
  },
  inheritedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  inheritedLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  inheritedBadge: {
    fontSize: '12px',
    padding: '3px 8px',
    backgroundColor: '#EAE6FF',
    color: '#403294',
    borderRadius: '4px',
    fontWeight: 500,
  },
  autoPopulatedBadge: {
    fontSize: '10px',
    marginLeft: '2px',
  },
  adminMappedNote: {
    margin: '12px 0 0 0',
    padding: '10px 12px',
    backgroundColor: '#DEEBFF',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  // Org Structure Section
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  preSelectedBadge: {
    padding: '3px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
  },
  orgStructureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '12px',
  },
  orgStructureField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  orgStructureLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  requiredMarker: {
    color: '#DE350B',
    marginLeft: '2px',
  },
  orgStructureSelect: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
  },
  orgStructureSelectDisabled: {
    backgroundColor: '#F4F5F7',
    cursor: 'not-allowed',
    color: '#6B778C',
  },
  preSelectedNote: {
    margin: 0,
    padding: '10px 12px',
    backgroundColor: '#DEEBFF',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default Step2Comparison;
