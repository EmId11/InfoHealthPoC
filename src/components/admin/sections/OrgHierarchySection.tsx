import React, { useState, useMemo } from 'react';
import {
  TeamCategorizationConfig,
  TeamCategory,
  CategoryValue,
  FilterRule,
  FilterCondition,
  FilterField,
  FilterOperator,
  OrgStructureSettings,
  getMatchingTeams,
} from '../../../types/admin';
import { mockTeams, TeamOption } from '../../../constants/presets';
import InfoButton from '../../common/InfoButton';
import { AdminOrgHierarchyHelp } from '../../../constants/helpContent';

interface OrgHierarchySectionProps {
  categorization: TeamCategorizationConfig;
  onUpdate: (config: TeamCategorizationConfig) => void;
  orgStructureSettings?: OrgStructureSettings;
  onUpdateSettings?: (settings: OrgStructureSettings) => void;
}

const OrgHierarchySection: React.FC<OrgHierarchySectionProps> = ({
  categorization,
  onUpdate,
  orgStructureSettings,
  onUpdateSettings,
}) => {
  const [editingValue, setEditingValue] = useState<CategoryValue | null>(null);
  const [addingValueToAttributeId, setAddingValueToAttributeId] = useState<string | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<TeamCategory | null>(null);
  const [viewingValue, setViewingValue] = useState<{ value: CategoryValue; isPortfolio: boolean } | null>(null);
  const [showUnmappedTeams, setShowUnmappedTeams] = useState<'portfolio' | 'teamOfTeams' | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const { categories, categoryValues } = categorization;

  // Default settings if not provided
  const settings: OrgStructureSettings = orgStructureSettings || {
    useHierarchy: true,
    structureTemplate: 'standard',
    customLevels: [
      {
        id: 'level-portfolio',
        name: 'Portfolio',
        pluralName: 'Portfolios',
        color: '#6554C0',
        isMandatory: false,
        order: 0,
      },
      {
        id: 'level-tot',
        name: 'Team of Teams',
        pluralName: 'Teams of Teams',
        color: '#0065FF',
        isMandatory: false,
        order: 1,
      },
    ],
    teamOfTeamsMandatory: false,
    portfolioMandatory: false,
  };

  const handleToggleHierarchy = (useHierarchy: boolean) => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        useHierarchy,
      });
    }
  };

  const handleToggleMandatory = (field: 'teamOfTeamsMandatory' | 'portfolioMandatory', value: boolean) => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        [field]: value,
      });
    }
  };

  // Handler for updating attribute (renaming hierarchy layers)
  const handleUpdateAttribute = (attributeId: string, updates: Partial<TeamCategory>) => {
    onUpdate({
      ...categorization,
      categories: categories.map((c) => (c.id === attributeId ? { ...c, ...updates } : c)),
    });
    setEditingAttribute(null);
  };

  // Get org-structure attributes (Portfolio and Team of Teams)
  const orgStructureAttributes = useMemo(() =>
    categories.filter((c) => c.type === 'org-structure'), [categories]);

  // Portfolio is the top-level, Team of Teams is the child
  const portfolioAttribute = orgStructureAttributes.find((a) => a.id === 'cat-portfolio');
  const teamOfTeamsAttribute = orgStructureAttributes.find((a) => a.id === 'cat-tribe');

  const getValuesForAttribute = (attributeId: string) =>
    categoryValues.filter((v) => v.categoryId === attributeId || v.attributeId === attributeId);

  const portfolioValues = portfolioAttribute ? getValuesForAttribute(portfolioAttribute.id) : [];
  const teamOfTeamsValues = teamOfTeamsAttribute ? getValuesForAttribute(teamOfTeamsAttribute.id) : [];

  const handleAddValue = (newValue: CategoryValue) => {
    onUpdate({
      ...categorization,
      categoryValues: [...categoryValues, newValue],
    });
    setAddingValueToAttributeId(null);
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

  // Count Teams of Teams for a Portfolio value (filter + manual)
  const getTeamOfTeamsCount = (portfolioValueId: string) => {
    const portfolioValue = portfolioValues.find((v) => v.id === portfolioValueId);
    if (!portfolioValue) return { filter: 0, manual: 0 };

    // Teams of Teams manually assigned
    const manualCount = (portfolioValue.manualTeamOfTeamsIds || []).length;

    // Teams of Teams via filter (would match against Team of Teams values)
    let filterCount = 0;
    if (portfolioValue.teamOfTeamsFilterRule?.conditions?.length) {
      // Evaluate filter against Team of Teams values
      teamOfTeamsValues.forEach((totValue) => {
        const matches = evaluateTeamOfTeamsFilter(portfolioValue.teamOfTeamsFilterRule!, totValue);
        if (matches && !portfolioValue.manualTeamOfTeamsIds?.includes(totValue.id)) {
          filterCount++;
        }
      });
    }

    return { filter: filterCount, manual: manualCount };
  };

  // Simple filter evaluation for Team of Teams values
  const evaluateTeamOfTeamsFilter = (rule: FilterRule, totValue: CategoryValue): boolean => {
    if (!rule.conditions.length) return false;
    return rule.conditions.every((condition) => {
      const fieldValue = condition.field === 'teamName' ? totValue.name : totValue.id;
      switch (condition.operator) {
        case 'contains':
          return typeof condition.value === 'string' &&
            fieldValue.toLowerCase().includes(condition.value.toLowerCase());
        case 'equals':
          return typeof condition.value === 'string' &&
            fieldValue.toLowerCase() === condition.value.toLowerCase();
        case 'startsWith':
          return typeof condition.value === 'string' &&
            fieldValue.toLowerCase().startsWith(condition.value.toLowerCase());
        default:
          return false;
      }
    });
  };

  // Get direct team count for a value
  const getDirectTeamCount = (value: CategoryValue) => {
    const teamsForFilter = mockTeams.map((t) => ({
      label: t.label,
      value: t.value,
      isOnboarded: t.isOnboarded,
    }));
    return getMatchingTeams(value, teamsForFilter).length;
  };

  // Get parent Portfolio value for a Team of Teams value
  const getParentPortfolio = (totValue: CategoryValue) => {
    if (totValue.parentValueId) {
      return portfolioValues.find((pv) => pv.id === totValue.parentValueId);
    }
    return null;
  };

  // Get teams not mapped to any Team of Teams
  const getUnmappedTeamsForTeamOfTeams = useMemo(() => {
    const mappedTeamIds = new Set<string>();

    // Collect all teams mapped to any Team of Teams value
    teamOfTeamsValues.forEach((totValue) => {
      const teamsForFilter = mockTeams.map((t) => ({
        label: t.label,
        value: t.value,
        isOnboarded: t.isOnboarded,
      }));
      const matches = getMatchingTeams(totValue, teamsForFilter);
      matches.forEach((m) => mappedTeamIds.add(m.teamId));
    });

    // Return teams not in any Team of Teams
    return mockTeams.filter((t) => !mappedTeamIds.has(t.value));
  }, [teamOfTeamsValues]);

  // Get teams not mapped to any Portfolio
  const getUnmappedTeamsForPortfolio = useMemo(() => {
    const mappedTeamIds = new Set<string>();

    // Collect all teams directly mapped to any Portfolio value
    portfolioValues.forEach((pValue) => {
      const teamsForFilter = mockTeams.map((t) => ({
        label: t.label,
        value: t.value,
        isOnboarded: t.isOnboarded,
      }));
      const matches = getMatchingTeams(pValue, teamsForFilter);
      matches.forEach((m) => mappedTeamIds.add(m.teamId));
    });

    // Also include teams mapped via Team of Teams that belong to a Portfolio
    teamOfTeamsValues.forEach((totValue) => {
      if (totValue.parentValueId || portfolioValues.some((p) => p.manualTeamOfTeamsIds?.includes(totValue.id))) {
        const teamsForFilter = mockTeams.map((t) => ({
          label: t.label,
          value: t.value,
          isOnboarded: t.isOnboarded,
        }));
        const matches = getMatchingTeams(totValue, teamsForFilter);
        matches.forEach((m) => mappedTeamIds.add(m.teamId));
      }
    });

    // Return teams not in any Portfolio
    return mockTeams.filter((t) => !mappedTeamIds.has(t.value));
  }, [portfolioValues, teamOfTeamsValues]);

  // Get Team of Teams that a team belongs to (for showing current mapping)
  const getTeamOfTeamsForTeam = (teamId: string): CategoryValue | null => {
    for (const totValue of teamOfTeamsValues) {
      const teamsForFilter = mockTeams.map((t) => ({
        label: t.label,
        value: t.value,
        isOnboarded: t.isOnboarded,
      }));
      const matches = getMatchingTeams(totValue, teamsForFilter);
      if (matches.some((m) => m.teamId === teamId)) {
        return totValue;
      }
    }
    return null;
  };

  // Handle assigning a team to a Portfolio or Team of Teams
  const handleAssignTeam = (teamId: string, targetValueId: string) => {
    // Find the target value and add the team to its manualTeamIds
    const updatedValues = categoryValues.map((v) => {
      if (v.id === targetValueId) {
        const existingManualTeamIds = v.manualTeamIds || [];
        if (!existingManualTeamIds.includes(teamId)) {
          return {
            ...v,
            manualTeamIds: [...existingManualTeamIds, teamId],
          };
        }
      }
      return v;
    });

    onUpdate({
      ...categorization,
      categoryValues: updatedValues,
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} data-tour="org-hierarchy-section">
        <div style={styles.titleRow}>
          <h2 style={styles.title}>Organizational Structure</h2>
          <InfoButton title="Organizational Structure">
            {AdminOrgHierarchyHelp.orgStructureSection}
          </InfoButton>
        </div>
        <p style={styles.subtitle}>
          Define your organizational hierarchy. Teams inherit their position in the structure for grouping and comparison.
        </p>
      </div>

      {/* Team Grouping Structure Toggle */}
      <div style={toggleStyles.container} data-tour="team-grouping-structure">
        <div style={toggleStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={toggleStyles.label}>Team Grouping Structure</span>
            <InfoButton title="Team Grouping Structure" size="inline">
              {AdminOrgHierarchyHelp.teamGroupingStructure}
            </InfoButton>
          </div>
          <p style={toggleStyles.subtitle}>
            How are your teams organized? This determines how teams will be grouped for comparison and reporting.
          </p>
        </div>
        <div style={toggleStyles.options}>
          <label style={{
            ...toggleStyles.option,
            border: settings.useHierarchy ? '2px solid #0052CC' : '2px solid transparent',
            backgroundColor: settings.useHierarchy ? '#F4F5F7' : '#F7F8FA',
          }}>
            <input
              type="radio"
              name="useHierarchy"
              checked={settings.useHierarchy}
              onChange={() => handleToggleHierarchy(true)}
              style={toggleStyles.radio}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={toggleStyles.optionLabel}>Hierarchical Structure</span>
                <InfoButton title="Hierarchical Structure" size="inline">
                  {AdminOrgHierarchyHelp.hierarchicalStructure}
                </InfoButton>
              </div>
              <span style={toggleStyles.optionDesc}>
                Teams are organized into {portfolioAttribute?.name?.toLowerCase() || 'portfolios'} and {teamOfTeamsAttribute?.name?.toLowerCase() || 'teams of teams'}
              </span>
              <span style={toggleStyles.optionExample}>
                e.g., "Consumer Portfolio" → "Mobile Tribe" → Teams
              </span>
            </div>
          </label>
          <label style={{
            ...toggleStyles.option,
            border: !settings.useHierarchy ? '2px solid #0052CC' : '2px solid transparent',
            backgroundColor: !settings.useHierarchy ? '#F4F5F7' : '#F7F8FA',
          }}>
            <input
              type="radio"
              name="useHierarchy"
              checked={!settings.useHierarchy}
              onChange={() => handleToggleHierarchy(false)}
              style={toggleStyles.radio}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={toggleStyles.optionLabel}>Flat Structure</span>
                <InfoButton title="Flat Structure" size="inline">
                  {AdminOrgHierarchyHelp.flatStructure}
                </InfoButton>
              </div>
              <span style={toggleStyles.optionDesc}>
                All teams are at the same level, no grouping hierarchy
              </span>
              <span style={toggleStyles.optionExample}>
                Teams will be compared against the whole organization
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Only show hierarchy sections if useHierarchy is true */}
      {!settings.useHierarchy && (
        <div style={toggleStyles.noHierarchyMessage}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#0052CC" strokeWidth="1.5" fill="none" />
            <path d="M10 6v5M10 13v1" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Flat structure mode</strong>
            <span style={{ color: '#6B778C' }}>
              All teams will be treated as part of a single organization without hierarchy groupings.
              You can still use Team Attributes to categorize teams for comparison.
            </span>
          </div>
        </div>
      )}

      {/* Required Assignments Panel */}
      {settings.useHierarchy && (
        <div style={mandatoryStyles.container}>
          <div style={mandatoryStyles.header}>
            <span style={mandatoryStyles.title}>Required Assignments</span>
          </div>
          <p style={mandatoryStyles.description}>
            When creating an assessment, should users be required to specify which group their team belongs to?
          </p>
          <div style={mandatoryStyles.options}>
            <label style={mandatoryStyles.option}>
              <input
                type="checkbox"
                checked={settings.teamOfTeamsMandatory}
                onChange={(e) => handleToggleMandatory('teamOfTeamsMandatory', e.target.checked)}
                style={mandatoryStyles.checkbox}
              />
              <div>
                <span style={mandatoryStyles.optionLabel}>
                  Require {teamOfTeamsAttribute?.name || 'Team of Teams'} selection
                </span>
                <span style={mandatoryStyles.optionDesc}>
                  Users must select which {teamOfTeamsAttribute?.name?.toLowerCase() || 'tribe/team of teams'} their team belongs to when setting up an assessment
                </span>
              </div>
            </label>
            <label style={mandatoryStyles.option}>
              <input
                type="checkbox"
                checked={settings.portfolioMandatory}
                onChange={(e) => handleToggleMandatory('portfolioMandatory', e.target.checked)}
                style={mandatoryStyles.checkbox}
              />
              <div>
                <span style={mandatoryStyles.optionLabel}>
                  Require {portfolioAttribute?.name || 'Portfolio'} selection
                </span>
                <span style={mandatoryStyles.optionDesc}>
                  Users must select which {portfolioAttribute?.name?.toLowerCase() || 'portfolio'} their team belongs to when setting up an assessment
                </span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Unmapped Teams Warning Section */}
      {settings.useHierarchy && (getUnmappedTeamsForTeamOfTeams.length > 0 || getUnmappedTeamsForPortfolio.length > 0) && (
        <div style={unmappedStyles.container}>
          <div style={unmappedStyles.header}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M8 1.5l6.5 13H1.5L8 1.5z"
                stroke="#DE5F1F"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M8 6v3M8 11.5v.5" stroke="#DE5F1F" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={unmappedStyles.headerText}>Unmapped Teams</span>
          </div>
          <div style={unmappedStyles.warnings}>
            {getUnmappedTeamsForTeamOfTeams.length > 0 && (
              <div style={unmappedStyles.warningRow}>
                <span style={unmappedStyles.warningText}>
                  <strong>{getUnmappedTeamsForTeamOfTeams.length}</strong> team{getUnmappedTeamsForTeamOfTeams.length !== 1 ? 's' : ''} not in any {teamOfTeamsAttribute?.name || 'Team of Teams'}
                </span>
                <button
                  style={unmappedStyles.viewButton}
                  onClick={() => setShowUnmappedTeams('teamOfTeams')}
                >
                  View
                </button>
              </div>
            )}
            {getUnmappedTeamsForPortfolio.length > 0 && (
              <div style={unmappedStyles.warningRow}>
                <span style={unmappedStyles.warningText}>
                  <strong>{getUnmappedTeamsForPortfolio.length}</strong> team{getUnmappedTeamsForPortfolio.length !== 1 ? 's' : ''} not in any {portfolioAttribute?.name || 'Portfolio'}
                </span>
                <button
                  style={unmappedStyles.viewButton}
                  onClick={() => setShowUnmappedTeams('portfolio')}
                >
                  View
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Section */}
      {settings.useHierarchy && portfolioAttribute && (
        <div style={styles.sectionGroup} data-tour="portfolio-section">
          <div style={styles.sectionGroupHeader}>
            <div style={{ ...styles.sectionGroupIcon, backgroundColor: portfolioAttribute.color || '#403294' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="2" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M2 6h12" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 style={styles.sectionGroupTitle}>{portfolioAttribute.name}</h3>
            <button
              style={styles.renameButton}
              onClick={() => setEditingAttribute(portfolioAttribute)}
              title="Rename"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8.5 1.5l2 2M1 11l.8-3.2L9 .5l2 2L3.7 10.2 1 11z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p style={styles.sectionGroupDescription}>
            {portfolioAttribute.description}
          </p>

          <div style={styles.valuesGrid}>
            {portfolioValues.map((value) => {
              const totCounts = getTeamOfTeamsCount(value.id);
              const directTeamCount = getDirectTeamCount(value);
              const isHovered = hoveredCardId === value.id;
              return (
                <div
                  key={value.id}
                  style={{
                    ...styles.valueCard,
                    ...(isHovered ? styles.valueCardHover : {}),
                  }}
                  onClick={() => setViewingValue({ value, isPortfolio: true })}
                  onMouseEnter={() => setHoveredCardId(value.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Arrow indicator */}
                  <div style={{
                    ...styles.valueCardArrow,
                    opacity: isHovered ? 1 : 0.4,
                    transform: isHovered ? 'translateX(2px)' : 'none',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={styles.valueCardHeader}>
                    <span style={styles.valueName}>{value.name}</span>
                  </div>
                  {value.description && (
                    <p style={styles.valueDescription}>{value.description}</p>
                  )}
                  <div style={styles.valueStats}>
                    <span style={styles.statItem}>
                      <span style={styles.statNumber}>{totCounts.filter + totCounts.manual}</span>
                      <span style={styles.statLabel}>Teams of Teams</span>
                    </span>
                    <span style={styles.statItem}>
                      <span style={styles.statNumber}>{directTeamCount}</span>
                      <span style={styles.statLabel}>Direct Teams</span>
                    </span>
                  </div>
                </div>
              );
            })}

            <button
              style={styles.addValueCard}
              onClick={() => setAddingValueToAttributeId(portfolioAttribute.id)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Add Portfolio</span>
            </button>
          </div>
        </div>
      )}

      {/* Team of Teams Section */}
      {settings.useHierarchy && teamOfTeamsAttribute && (
        <div style={styles.sectionGroup} data-tour="team-of-teams-section">
          <div style={styles.sectionGroupHeader}>
            <div style={{ ...styles.sectionGroupIcon, backgroundColor: teamOfTeamsAttribute.color || '#00875A' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 style={styles.sectionGroupTitle}>{teamOfTeamsAttribute.name}</h3>
            <button
              style={styles.renameButton}
              onClick={() => setEditingAttribute(teamOfTeamsAttribute)}
              title="Rename"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8.5 1.5l2 2M1 11l.8-3.2L9 .5l2 2L3.7 10.2 1 11z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p style={styles.sectionGroupDescription}>
            {teamOfTeamsAttribute.description}
          </p>

          <div style={styles.valuesGrid}>
            {teamOfTeamsValues.map((value) => {
              const parentPortfolio = getParentPortfolio(value);
              const teamCount = getDirectTeamCount(value);
              const isHovered = hoveredCardId === value.id;
              return (
                <div
                  key={value.id}
                  style={{
                    ...styles.valueCard,
                    ...(isHovered ? styles.valueCardHover : {}),
                  }}
                  onClick={() => setViewingValue({ value, isPortfolio: false })}
                  onMouseEnter={() => setHoveredCardId(value.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Arrow indicator */}
                  <div style={{
                    ...styles.valueCardArrow,
                    opacity: isHovered ? 1 : 0.4,
                    transform: isHovered ? 'translateX(2px)' : 'none',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={styles.valueCardHeader}>
                    <span style={styles.valueName}>{value.name}</span>
                  </div>
                  {value.description && (
                    <p style={styles.valueDescription}>{value.description}</p>
                  )}
                  {parentPortfolio && (
                    <div style={styles.parentInfo}>
                      <span style={styles.parentLabel}>Part of:</span>
                      <span style={styles.parentBadge}>{parentPortfolio.name}</span>
                    </div>
                  )}
                  <div style={styles.valueStats}>
                    <span style={styles.statItem}>
                      <span style={styles.statNumber}>{teamCount}</span>
                      <span style={styles.statLabel}>Teams</span>
                    </span>
                  </div>
                </div>
              );
            })}

            <button
              style={styles.addValueCard}
              onClick={() => setAddingValueToAttributeId(teamOfTeamsAttribute.id)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Add Team of Teams</span>
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Value Modal */}
      {(addingValueToAttributeId || editingValue) && (
        <OrgValueEditor
          value={editingValue}
          attributeId={addingValueToAttributeId || editingValue?.attributeId || editingValue?.categoryId || ''}
          allTeams={mockTeams}
          allValues={categoryValues}
          portfolioValues={portfolioValues}
          teamOfTeamsValues={teamOfTeamsValues}
          isPortfolio={(addingValueToAttributeId || editingValue?.attributeId || editingValue?.categoryId) === 'cat-portfolio'}
          onSave={(data) => {
            if (editingValue) {
              handleUpdateValue(editingValue.id, data);
            } else {
              handleAddValue({
                ...data,
                id: `val-${Date.now()}`,
                attributeId: addingValueToAttributeId!,
                categoryId: addingValueToAttributeId!, // Legacy alias
                createdAt: new Date().toISOString(),
                createdBy: 'Current Admin',
              } as CategoryValue);
            }
          }}
          onDelete={editingValue ? () => handleDeleteValue(editingValue.id) : undefined}
          onClose={() => {
            setAddingValueToAttributeId(null);
            setEditingValue(null);
          }}
        />
      )}

      {/* Attribute Rename Modal */}
      {editingAttribute && (
        <AttributeRenameModal
          attribute={editingAttribute}
          onSave={(updates) => handleUpdateAttribute(editingAttribute.id, updates)}
          onClose={() => setEditingAttribute(null)}
        />
      )}

      {/* Detail View Modal */}
      {viewingValue && (
        <DetailViewModal
          value={viewingValue.value}
          isPortfolio={viewingValue.isPortfolio}
          portfolioValues={portfolioValues}
          teamOfTeamsValues={teamOfTeamsValues}
          allTeams={mockTeams}
          portfolioAttribute={portfolioAttribute}
          teamOfTeamsAttribute={teamOfTeamsAttribute}
          onEdit={() => {
            setEditingValue(viewingValue.value);
            setViewingValue(null);
          }}
          onClose={() => setViewingValue(null)}
        />
      )}

      {/* Unmapped Teams Modal */}
      {showUnmappedTeams && (
        <UnmappedTeamsModal
          type={showUnmappedTeams}
          teams={showUnmappedTeams === 'portfolio' ? getUnmappedTeamsForPortfolio : getUnmappedTeamsForTeamOfTeams}
          typeName={showUnmappedTeams === 'portfolio'
            ? portfolioAttribute?.name || 'Portfolio'
            : teamOfTeamsAttribute?.name || 'Team of Teams'
          }
          portfolioValues={portfolioValues}
          teamOfTeamsValues={teamOfTeamsValues}
          onAssign={handleAssignTeam}
          getTeamOfTeamsForTeam={getTeamOfTeamsForTeam}
          onClose={() => setShowUnmappedTeams(null)}
        />
      )}
    </div>
  );
};

// ============================================
// Attribute Rename Modal
// ============================================
interface AttributeRenameModalProps {
  attribute: TeamCategory;
  onSave: (updates: Partial<TeamCategory>) => void;
  onClose: () => void;
}

const AttributeRenameModal: React.FC<AttributeRenameModalProps> = ({ attribute, onSave, onClose }) => {
  const [name, setName] = useState(attribute.name);
  const [description, setDescription] = useState(attribute.description);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Rename Hierarchy Level</h3>
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
              placeholder="e.g., Portfolio, Business Unit, Value Stream"
              style={modalStyles.input}
              autoFocus
            />
            <p style={modalStyles.fieldHint}>
              Choose a name that fits your organization's terminology.
            </p>
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this hierarchy level represents"
              style={{ ...modalStyles.input, minHeight: '80px', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={modalStyles.submitButton} onClick={handleSubmit} disabled={!name.trim()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Detail View Modal
// ============================================
interface DetailViewModalProps {
  value: CategoryValue;
  isPortfolio: boolean;
  portfolioValues: CategoryValue[];
  teamOfTeamsValues: CategoryValue[];
  allTeams: TeamOption[];
  portfolioAttribute?: TeamCategory;
  teamOfTeamsAttribute?: TeamCategory;
  onEdit: () => void;
  onClose: () => void;
}

const DetailViewModal: React.FC<DetailViewModalProps> = ({
  value,
  isPortfolio,
  portfolioValues,
  teamOfTeamsValues,
  allTeams,
  portfolioAttribute,
  teamOfTeamsAttribute,
  onEdit,
  onClose,
}) => {
  // Get Teams of Teams that belong to this Portfolio
  const getTeamsOfTeamsForPortfolio = () => {
    if (!isPortfolio) return [];
    return teamOfTeamsValues.filter((tot) =>
      tot.parentValueId === value.id ||
      value.manualTeamOfTeamsIds?.includes(tot.id)
    );
  };

  // Get parent Portfolio for Team of Teams
  const getParentPortfolio = () => {
    if (isPortfolio) return null;
    if (value.parentValueId) {
      return portfolioValues.find((pv) => pv.id === value.parentValueId);
    }
    return null;
  };

  // Get teams that belong to this value
  const getDirectTeams = () => {
    const teamsForFilter = allTeams.map((t) => ({
      label: t.label,
      value: t.value,
      isOnboarded: t.isOnboarded,
    }));
    return getMatchingTeams(value, teamsForFilter);
  };

  // Get team count for a Team of Teams value
  const getTeamCountForToT = (totValue: CategoryValue) => {
    const teamsForFilter = allTeams.map((t) => ({
      label: t.label,
      value: t.value,
      isOnboarded: t.isOnboarded,
    }));
    return getMatchingTeams(totValue, teamsForFilter).length;
  };

  // Format filter rule for display
  const formatFilterRule = (rule: FilterRule | null | undefined) => {
    if (!rule || !rule.conditions || rule.conditions.length === 0) return null;
    return rule.conditions.map((c, i) => {
      const fieldLabel = c.field === 'teamName' ? 'Team Name' : c.field === 'teamKey' ? 'Team Key' : c.field;
      const operatorLabel = c.operator === 'contains' ? 'contains' :
        c.operator === 'equals' ? 'equals' :
        c.operator === 'startsWith' ? 'starts with' :
        c.operator === 'endsWith' ? 'ends with' : c.operator;
      return { fieldLabel, operatorLabel, value: c.value, index: i };
    });
  };

  const teamsOfTeams = isPortfolio ? getTeamsOfTeamsForPortfolio() : [];
  const parentPortfolio = getParentPortfolio();
  const directTeams = getDirectTeams();
  const filterConditions = formatFilterRule(value.filterRule);
  const manualTeamCount = value.manualTeamIds?.length || 0;
  const filterTeamCount = directTeams.filter(t => t.matchedBy === 'filter' || t.matchedBy === 'both').length;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: isPortfolio ? '#403294' : '#00875A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isPortfolio ? (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="10" rx="2" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M2 6h12" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <div>
              <span style={detailStyles.typeLabel}>
                {isPortfolio ? (portfolioAttribute?.name || 'Portfolio') : (teamOfTeamsAttribute?.name || 'Team of Teams')}
              </span>
              <h3 style={{ ...modalStyles.title, margin: 0 }}>{value.name}</h3>
            </div>
          </div>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          {/* Overview Section */}
          <div style={detailStyles.overviewSection}>
            <div style={detailStyles.overviewRow}>
              <span style={detailStyles.overviewLabel}>Description</span>
              <span style={detailStyles.overviewValue}>
                {value.description || <span style={{ color: '#97A0AF', fontStyle: 'italic' }}>No description</span>}
              </span>
            </div>

            {/* Parent Portfolio (for Team of Teams) */}
            {!isPortfolio && (
              <div style={detailStyles.overviewRow}>
                <span style={detailStyles.overviewLabel}>Parent {portfolioAttribute?.name || 'Portfolio'}</span>
                <span style={detailStyles.overviewValue}>
                  {parentPortfolio ? (
                    <span style={detailStyles.infoBadge}>{parentPortfolio.name}</span>
                  ) : (
                    <span style={{ color: '#97A0AF', fontStyle: 'italic' }}>None assigned</span>
                  )}
                </span>
              </div>
            )}

            {/* Created info */}
            {value.createdAt && (
              <div style={detailStyles.overviewRow}>
                <span style={detailStyles.overviewLabel}>Created</span>
                <span style={detailStyles.overviewValue}>
                  {new Date(value.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {value.createdBy && ` by ${value.createdBy}`}
                </span>
              </div>
            )}
          </div>

          {/* Team Assignment Rules Section */}
          <div style={detailStyles.section}>
            <div style={detailStyles.sectionHeader}>
              <span style={detailStyles.sectionTitle}>Team Assignment Rules</span>
            </div>
            <div style={detailStyles.rulesContainer}>
              {filterConditions && filterConditions.length > 0 ? (
                <div style={detailStyles.ruleBlock}>
                  <span style={detailStyles.ruleLabel}>Auto-assign filter:</span>
                  <div style={detailStyles.filterDisplay}>
                    {filterConditions.map((cond) => (
                      <span key={cond.index} style={detailStyles.filterCondition}>
                        {cond.fieldLabel} <strong>{cond.operatorLabel}</strong> "{cond.value}"
                      </span>
                    ))}
                  </div>
                  <span style={detailStyles.ruleCount}>{filterTeamCount} teams matched</span>
                </div>
              ) : (
                <div style={detailStyles.ruleBlock}>
                  <span style={detailStyles.ruleLabel}>Auto-assign filter:</span>
                  <span style={{ color: '#97A0AF', fontStyle: 'italic', fontSize: '13px' }}>No filter rules defined</span>
                </div>
              )}
              <div style={detailStyles.ruleBlock}>
                <span style={detailStyles.ruleLabel}>Manually assigned:</span>
                <span style={detailStyles.ruleCount}>{manualTeamCount} teams</span>
              </div>
            </div>
          </div>

          {/* Teams of Teams (for Portfolio) */}
          {isPortfolio && (
            <div style={detailStyles.section}>
              <div style={detailStyles.sectionHeader}>
                <span style={detailStyles.sectionTitle}>
                  {teamOfTeamsAttribute?.name || 'Teams of Teams'} ({teamsOfTeams.length})
                </span>
              </div>
              {teamsOfTeams.length > 0 ? (
                <div style={detailStyles.list}>
                  {teamsOfTeams.map((tot) => (
                    <div key={tot.id} style={detailStyles.listItem}>
                      <span style={detailStyles.listItemName}>{tot.name}</span>
                      <span style={detailStyles.listItemCount}>
                        {getTeamCountForToT(tot)} teams
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={detailStyles.emptyText}>
                  No {teamOfTeamsAttribute?.name?.toLowerCase() || 'teams of teams'} assigned yet.
                </p>
              )}
            </div>
          )}

          {/* Direct Teams */}
          <div style={detailStyles.section}>
            <div style={detailStyles.sectionHeader}>
              <span style={detailStyles.sectionTitle}>
                Direct Teams ({directTeams.length})
              </span>
            </div>
            {directTeams.length > 0 ? (
              <div style={detailStyles.list}>
                {directTeams.map((match) => {
                  const team = allTeams.find((t) => t.value === match.teamId);
                  return (
                    <div key={match.teamId} style={detailStyles.listItem}>
                      <span style={detailStyles.listItemName}>{team?.label || match.teamId}</span>
                      {match.matchedBy === 'filter' && (
                        <span style={detailStyles.matchBadge}>via filter</span>
                      )}
                      {match.matchedBy === 'manual' && (
                        <span style={detailStyles.matchBadge}>manual</span>
                      )}
                      {match.matchedBy === 'both' && (
                        <span style={detailStyles.matchBadge}>filter + manual</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={detailStyles.emptyText}>No teams assigned yet.</p>
            )}
          </div>
        </div>

        <div style={modalStyles.footer}>
          <div style={{ flex: 1 }} />
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Close
          </button>
          <button style={modalStyles.submitButton} onClick={onEdit}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px' }}>
              <path d="M10 1.5l2.5 2.5M1 13l1-4L10.5 0.5l2.5 2.5L4.5 12 1 13z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Unmapped Teams Modal
// ============================================
interface UnmappedTeamsModalProps {
  type: 'portfolio' | 'teamOfTeams';
  teams: TeamOption[];
  typeName: string;
  portfolioValues: CategoryValue[];
  teamOfTeamsValues: CategoryValue[];
  onAssign: (teamId: string, targetValueId: string) => void;
  getTeamOfTeamsForTeam: (teamId: string) => CategoryValue | null;
  onClose: () => void;
}

const UnmappedTeamsModal: React.FC<UnmappedTeamsModalProps> = ({
  type,
  teams,
  typeName,
  portfolioValues,
  teamOfTeamsValues,
  onAssign,
  getTeamOfTeamsForTeam,
  onClose,
}) => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const targetValues = type === 'portfolio' ? portfolioValues : teamOfTeamsValues;

  const handleAssign = (teamId: string, targetValueId: string) => {
    onAssign(teamId, targetValueId);
    setExpandedTeamId(null);
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>
            Teams Not in Any {typeName}
          </h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          <p style={unmappedStyles.description}>
            These teams need to be assigned to a {typeName}.
            {type === 'portfolio' && ' You can assign them directly or they may inherit from their Team of Teams.'}
          </p>

          {teams.length > 0 ? (
            <div style={unmappedStyles.teamList}>
              {teams.map((team) => {
                const currentToT = type === 'portfolio' ? getTeamOfTeamsForTeam(team.value) : null;
                const isExpanded = expandedTeamId === team.value;

                return (
                  <div key={team.value} style={unmappedStyles.teamItemEnhanced}>
                    <div style={unmappedStyles.teamItemRow}>
                      <div style={unmappedStyles.teamInfo}>
                        <span style={unmappedStyles.teamName}>{team.label}</span>
                        {type === 'portfolio' && (
                          <span style={unmappedStyles.teamToTInfo}>
                            {currentToT
                              ? `Currently in: ${currentToT.name}`
                              : '(not in any Team of Teams)'}
                          </span>
                        )}
                      </div>
                      <button
                        style={unmappedStyles.assignButton}
                        onClick={() => setExpandedTeamId(isExpanded ? null : team.value)}
                      >
                        {isExpanded ? 'Cancel' : 'Assign'}
                      </button>
                    </div>
                    {isExpanded && (
                      <div style={unmappedStyles.assignDropdown}>
                        <label style={unmappedStyles.assignLabel}>
                          Assign to {typeName}:
                        </label>
                        <select
                          style={unmappedStyles.assignSelect}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssign(team.value, e.target.value);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select {typeName}...</option>
                          {targetValues.map((val) => (
                            <option key={val.id} value={val.id}>{val.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={detailStyles.emptyText}>All teams are mapped!</p>
          )}
        </div>

        <div style={modalStyles.footer}>
          <div style={{ flex: 1 }} />
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Org Value Editor Modal (for Portfolio and Team of Teams)
// ============================================
interface OrgValueEditorProps {
  value: CategoryValue | null;
  attributeId: string;
  allTeams: TeamOption[];
  allValues: CategoryValue[];
  portfolioValues: CategoryValue[];
  teamOfTeamsValues: CategoryValue[];
  isPortfolio: boolean;
  onSave: (data: Partial<CategoryValue>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const OrgValueEditor: React.FC<OrgValueEditorProps> = ({
  value,
  attributeId,
  allTeams,
  allValues,
  portfolioValues,
  teamOfTeamsValues,
  isPortfolio,
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(value?.name || '');
  const [description, setDescription] = useState(value?.description || '');

  // For Portfolio: Teams of Teams assignment (direct selection)
  const [manualTotIds, setManualTotIds] = useState<string[]>(
    value?.manualTeamOfTeamsIds || []
  );

  // For Team of Teams: Parent Portfolio
  const [parentValueId, setParentValueId] = useState<string | undefined>(value?.parentValueId);

  // For both: Team filter rules and manual team assignment
  const [filterRule, setFilterRule] = useState<FilterRule>(
    value?.filterRule || { conditions: [] }
  );
  const [manualTeamIds, setManualTeamIds] = useState<string[]>(value?.manualTeamIds || []);

  // Calculate matching teams for preview
  const matchingTeams = useMemo(() => {
    const tempValue: CategoryValue = {
      id: 'preview',
      attributeId,
      categoryId: attributeId,
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
  }, [filterRule, manualTeamIds, allTeams, attributeId]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const data: Partial<CategoryValue> = {
      name: name.trim(),
      description: description.trim(),
      filterRule: filterRule.conditions.length > 0 ? filterRule : null,
      manualTeamIds,
    };

    if (isPortfolio) {
      data.manualTeamOfTeamsIds = manualTotIds.length > 0 ? manualTotIds : undefined;
    } else {
      data.parentValueId = parentValueId || undefined;
    }

    onSave(data);
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>
            {value ? 'Edit' : 'Add'} {isPortfolio ? 'Portfolio' : 'Team of Teams'}
          </h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          {/* Basic Info */}
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isPortfolio ? 'e.g., Consumer Products' : 'e.g., Mobile Experience'}
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
              placeholder="Brief description"
              style={modalStyles.input}
            />
          </div>

          {/* Portfolio: Teams of Teams assignment */}
          {isPortfolio && (
            <>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Teams of Teams</label>
                <p style={modalStyles.fieldHint}>
                  Select which Teams of Teams belong to this portfolio.
                </p>
                {teamOfTeamsValues.length > 0 ? (
                  <TeamsOfTeamsPicker
                    allTeamsOfTeams={teamOfTeamsValues}
                    selectedIds={manualTotIds}
                    onChange={setManualTotIds}
                  />
                ) : (
                  <p style={modalStyles.emptyText}>No Teams of Teams defined yet. Create them first.</p>
                )}
              </div>
            </>
          )}

          {/* Team of Teams: Parent Portfolio */}
          {!isPortfolio && portfolioValues.length > 0 && (
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Parent Portfolio</label>
              <p style={modalStyles.fieldHint}>
                Select which portfolio this Team of Teams belongs to.
              </p>
              <select
                value={parentValueId || ''}
                onChange={(e) => setParentValueId(e.target.value || undefined)}
                style={modalStyles.select}
              >
                <option value="">None (no parent)</option>
                {portfolioValues.map((pv) => (
                  <option key={pv.id} value={pv.id}>
                    {pv.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Direct Team Assignment (for both) */}
          <div style={modalStyles.section}>
            <div style={modalStyles.sectionHeader}>
              <span style={modalStyles.sectionTitle}>Direct Teams</span>
              <span style={modalStyles.sectionBadge}>
                {matchingTeams.length} teams
              </span>
            </div>

            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Auto-assign teams matching:</label>
              <FilterRuleBuilder rule={filterRule} onChange={setFilterRule} />
            </div>

            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Manually include teams:</label>
              <TeamPicker
                allTeams={allTeams}
                selectedTeamIds={manualTeamIds}
                filterMatchedTeamIds={matchingTeams
                  .filter((m) => m.matchedBy === 'filter' || m.matchedBy === 'both')
                  .map((m) => m.teamId)}
                onChange={setManualTeamIds}
              />
            </div>
          </div>

          {/* Preview */}
          <div style={modalStyles.preview}>
            <div style={modalStyles.previewHeader}>
              <span style={modalStyles.previewLabel}>Preview</span>
            </div>
            <div style={modalStyles.previewStats}>
              {isPortfolio && (
                <span style={modalStyles.previewStat}>
                  <strong>{manualTotIds.length}</strong> Teams of Teams
                </span>
              )}
              <span style={modalStyles.previewStat}>
                <strong>{matchingTeams.length}</strong> Direct Teams
              </span>
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          {onDelete && value && (
            <button style={modalStyles.deleteButton} onClick={onDelete}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={modalStyles.submitButton} onClick={handleSubmit} disabled={!name.trim()}>
            {value ? 'Save Changes' : 'Create'}
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
  fieldLabel?: string;
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
  { value: 'isTrue', label: 'is true', forFields: ['isOnboarded'] },
  { value: 'isFalse', label: 'is false', forFields: ['isOnboarded'] },
];

const FilterRuleBuilder: React.FC<FilterRuleBuilderProps> = ({ rule, onChange, fieldLabel }) => {
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

    if (updates.operator === 'isTrue' || updates.operator === 'isFalse') {
      newConditions[index].value = true;
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
        <p style={filterStyles.hint}>All conditions must match (AND logic)</p>
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
                {fieldLabel && opt.value === 'teamName' ? fieldLabel : opt.label}
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
            <input
              type="text"
              value={typeof condition.value === 'string' ? condition.value : ''}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              placeholder="Value"
              style={filterStyles.input}
            />
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
// Teams of Teams Picker Component (checkbox list like TeamPicker)
// ============================================
interface TeamsOfTeamsPickerProps {
  allTeamsOfTeams: CategoryValue[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const TeamsOfTeamsPicker: React.FC<TeamsOfTeamsPickerProps> = ({
  allTeamsOfTeams,
  selectedIds,
  onChange,
}) => {
  const [search, setSearch] = useState('');

  const filteredItems = allTeamsOfTeams.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, id]);
    } else {
      onChange(selectedIds.filter((i) => i !== id));
    }
  };

  return (
    <div style={totPickerStyles.container}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search teams of teams..."
        style={totPickerStyles.search}
      />
      <div style={totPickerStyles.list}>
        {filteredItems.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <label
              key={item.id}
              style={{
                ...totPickerStyles.item,
                backgroundColor: isSelected ? '#DEEBFF' : 'transparent',
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleToggle(item.id, e.target.checked)}
              />
              <span>{item.name}</span>
            </label>
          );
        })}
        {filteredItems.length === 0 && (
          <p style={totPickerStyles.emptyText}>No matches found</p>
        )}
      </div>
    </div>
  );
};

// ============================================
// Styles
// ============================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
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
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionGroupTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  renameButton: {
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
  sectionGroupDescription: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
    marginLeft: '42px',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
    marginLeft: '42px',
  },
  valueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #EBECF0',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  valueCardHover: {
    border: '1px solid #0052CC',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.13)',
  },
  valueCardArrow: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
    opacity: 0.6,
    transition: 'opacity 0.15s ease, transform 0.15s ease',
  },
  valueCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valueName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  editButton: {
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
  valueDescription: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  parentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
  valueStats: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #EBECF0',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statNumber: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  statLabel: {
    fontSize: '11px',
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  addValueCard: {
    backgroundColor: 'transparent',
    borderRadius: '10px',
    border: '2px dashed #DFE1E6',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#6B778C',
    fontSize: '14px',
    fontWeight: 500,
    minHeight: '120px',
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
    maxWidth: '550px',
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
  section: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  sectionBadge: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5243AA',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
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
  multiSelect: {
    padding: '8px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    width: '100%',
    cursor: 'pointer',
    minHeight: '80px',
  },
  selectedTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  selectedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  removeTagButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#0052CC',
    lineHeight: 1,
    padding: 0,
  },
  checkboxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '150px',
    overflowY: 'auto',
    padding: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  preview: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px',
  },
  previewHeader: {
    marginBottom: '8px',
  },
  previewLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  previewStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  previewStat: {
    fontSize: '13px',
    color: '#172B4D',
  },
  previewDetail: {
    fontSize: '12px',
    color: '#6B778C',
    marginLeft: '4px',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    position: 'sticky',
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    padding: '10px 16px',
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
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
};

const filterStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    padding: '10px',
    border: '1px solid #EBECF0',
  },
  hint: {
    margin: '0 0 4px 0',
    fontSize: '11px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  condition: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#F7F8FA',
    padding: '6px',
    borderRadius: '4px',
  },
  select: {
    padding: '6px 8px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    minWidth: '80px',
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
    borderRadius: '4px',
    fontSize: '12px',
    color: '#6B778C',
    cursor: 'pointer',
  },
};

const pickerStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    padding: '8px',
    border: '1px solid #EBECF0',
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
    maxHeight: '120px',
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

const totPickerStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    padding: '8px',
    border: '1px solid #EBECF0',
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
    padding: '8px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
  },
  emptyText: {
    margin: '8px 0',
    fontSize: '13px',
    color: '#97A0AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
};

const detailStyles: Record<string, React.CSSProperties> = {
  typeLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  overviewSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  overviewRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  overviewLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  overviewValue: {
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.4,
  },
  rulesContainer: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  ruleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  ruleLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  ruleCount: {
    fontSize: '13px',
    color: '#172B4D',
    fontWeight: 500,
  },
  filterDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px',
  },
  filterCondition: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #EBECF0',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  infoBadge: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#403294',
    backgroundColor: '#EAE6FF',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  section: {
    marginBottom: '16px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  list: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    overflow: 'hidden',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid #EBECF0',
  },
  listItemName: {
    fontSize: '14px',
    color: '#172B4D',
  },
  listItemCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  matchBadge: {
    fontSize: '11px',
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '2px 6px',
    borderRadius: '3px',
    fontWeight: 500,
  },
  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: '#97A0AF',
    fontStyle: 'italic',
    padding: '12px 0',
  },
};

const mandatoryStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    padding: '20px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: '2px',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  optionLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#172B4D',
    marginBottom: '2px',
  },
  optionDesc: {
    display: 'block',
    fontSize: '12px',
    color: '#6B778C',
  },
};

const toggleStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    padding: '20px',
  },
  header: {
    marginBottom: '16px',
  },
  label: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    display: 'block',
    marginBottom: '4px',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '14px 16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.15s ease',
  },
  radio: {
    marginTop: '2px',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  optionLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '2px',
  },
  optionDesc: {
    display: 'block',
    fontSize: '13px',
    color: '#6B778C',
    marginBottom: '4px',
  },
  optionExample: {
    display: 'block',
    fontSize: '12px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  noHierarchyMessage: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

const unmappedStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '8px',
    padding: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  headerText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  warnings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  warningRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  warningText: {
    fontSize: '13px',
    color: '#5E4D00',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
  },
  description: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  teamList: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    overflow: 'hidden',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  teamItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid #EBECF0',
  },
  teamName: {
    fontSize: '14px',
    color: '#172B4D',
    fontWeight: 500,
  },
  teamKey: {
    fontSize: '12px',
    color: '#6B778C',
    fontFamily: 'monospace',
  },
  // Enhanced styles for actionable modal
  teamItemEnhanced: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #EBECF0',
    padding: '12px 14px',
  },
  teamItemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  teamInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  teamToTInfo: {
    fontSize: '12px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  assignButton: {
    padding: '6px 14px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    flexShrink: 0,
  },
  assignDropdown: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed #DFE1E6',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  assignLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  assignSelect: {
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    width: '100%',
  },
};

export default OrgHierarchySection;
