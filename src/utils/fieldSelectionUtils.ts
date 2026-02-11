import { IssueTypeKey, IssueTypeFieldConfig, FieldSelection, FieldSelectionData } from '../types/wizard';
import { MOCK_JIRA_FIELDS_BY_ISSUE_TYPE, MOCK_FIELD_AVAILABILITY_BY_TEAM } from '../constants/presets';

/**
 * Generate default field config for given issue types and teams.
 * All applicable fields are enabled by default with 'all' team applicability.
 */
export function generateDefaultFieldConfig(
  selectedIssueTypes: IssueTypeKey[],
  _selectedTeamIds: string[]
): IssueTypeFieldConfig[] {
  return selectedIssueTypes.map((issueTypeKey) => {
    const applicableFields = MOCK_JIRA_FIELDS_BY_ISSUE_TYPE.filter((field) =>
      field.applicableIssueTypes.includes(issueTypeKey)
    );

    const fields: FieldSelection[] = applicableFields.map((field) => ({
      fieldId: field.id,
      fieldName: field.name,
      fieldType: field.type,
      isCustom: field.isCustom,
      enabled: true,
      teamApplicability: 'all',
    }));

    return {
      issueTypeKey,
      fields,
    };
  });
}

/**
 * Generate per-team field configs. Each team gets its own config filtered
 * by MOCK_FIELD_AVAILABILITY_BY_TEAM. Falls back to all fields if a team
 * isn't in the availability map.
 */
export function generatePerTeamFieldConfigs(
  selectedIssueTypes: IssueTypeKey[],
  selectedTeamIds: string[]
): Record<string, IssueTypeFieldConfig[]> {
  const result: Record<string, IssueTypeFieldConfig[]> = {};

  for (const teamId of selectedTeamIds) {
    const availableFieldIds = MOCK_FIELD_AVAILABILITY_BY_TEAM[teamId];

    result[teamId] = selectedIssueTypes.map((issueTypeKey) => {
      const applicableFields = MOCK_JIRA_FIELDS_BY_ISSUE_TYPE.filter((field) => {
        if (!field.applicableIssueTypes.includes(issueTypeKey)) return false;
        // If the team has an availability list, filter by it; otherwise include all
        if (availableFieldIds) return availableFieldIds.includes(field.id);
        return true;
      });

      const fields: FieldSelection[] = applicableFields.map((field) => ({
        fieldId: field.id,
        fieldName: field.name,
        fieldType: field.type,
        isCustom: field.isCustom,
        enabled: true,
        teamApplicability: [teamId],
      }));

      return {
        issueTypeKey,
        fields,
      };
    });
  }

  return result;
}

/**
 * Count total enabled fields across all issue type configs.
 * Supports both shared and per-team modes.
 */
export function countEnabledFields(configs: IssueTypeFieldConfig[]): number {
  return configs.reduce(
    (total, config) => total + config.fields.filter((f) => f.enabled).length,
    0
  );
}

/**
 * Count enabled fields across the entire FieldSelectionData, handling per-team mode.
 * In per-team mode, sums enabled fields across all teams.
 */
export function countEnabledFieldsFromData(data: FieldSelectionData): number {
  if (!data.isPerTeamCustomisation) {
    return countEnabledFields(data.configs);
  }
  let total = 0;
  for (const teamConfigs of Object.values(data.perTeamConfigs)) {
    total += countEnabledFields(teamConfigs);
  }
  return total;
}

/**
 * Count total fields across all issue type configs.
 */
export function countTotalFields(configs: IssueTypeFieldConfig[]): number {
  return configs.reduce((total, config) => total + config.fields.length, 0);
}
