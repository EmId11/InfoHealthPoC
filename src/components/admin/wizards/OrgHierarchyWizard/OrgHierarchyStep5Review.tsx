import React from 'react';
import { TeamAttributeConfig, OrgStructureSettings } from '../../../../types/admin';

interface OrgHierarchyStep5ReviewProps {
  categorization: TeamAttributeConfig;
  settings: OrgStructureSettings;
}

const OrgHierarchyStep5Review: React.FC<OrgHierarchyStep5ReviewProps> = ({
  categorization,
  settings,
}) => {
  // Sort levels by order
  const sortedLevels = [...settings.customLevels].sort((a, b) => a.order - b.order);

  // Get values for each level from categorization (by matching attribute name)
  const getValuesForLevel = (levelName: string) => {
    const attribute = categorization.attributes.find(
      (attr) =>
        attr.type === 'org-structure' &&
        attr.name.toLowerCase() === levelName.toLowerCase()
    );
    if (!attribute) return [];
    return categorization.attributeValues.filter(
      (val) => val.attributeId === attribute.id
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Review your organization hierarchy configuration below. You can edit these settings
          anytime from the Org Hierarchy section of the admin dashboard.
        </p>
      </div>

      {/* Hierarchy Status */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2v6M10 8L5 12M10 8l5 4M5 12v4M15 12v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Hierarchy Structure</h3>
            <span
              style={{
                ...styles.statusBadge,
                ...(settings.useHierarchy ? styles.statusBadgeEnabled : styles.statusBadgeDisabled),
              }}
            >
              {settings.useHierarchy ? `${sortedLevels.length} Level${sortedLevels.length !== 1 ? 's' : ''} + Teams` : 'Flat Structure'}
            </span>
          </div>
        </div>

        {!settings.useHierarchy || sortedLevels.length === 0 ? (
          <div style={styles.flatContent}>
            <p style={styles.flatStructureText}>
              Teams exist at a single level without hierarchical grouping. You can enable hierarchy
              later if needed.
            </p>
            <div style={styles.flatDiagram}>
              {['Team A', 'Team B', 'Team C', 'Team D'].map((team) => (
                <div key={team} style={styles.flatTeamBox}>
                  {team}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.levelsGrid}>
            {sortedLevels.map((level) => (
              <div key={level.id} style={styles.levelCard}>
                <div style={styles.levelHeader}>
                  <div
                    style={{
                      ...styles.levelColorDot,
                      backgroundColor: level.color,
                    }}
                  />
                  <span style={styles.levelName}>{level.name}</span>
                  <span
                    style={level.isMandatory ? styles.mandatoryBadge : styles.optionalBadge}
                  >
                    {level.isMandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
                <p style={styles.levelDesc}>
                  {level.isMandatory
                    ? `Every team must belong to a ${level.name}`
                    : `${level.name} assignment is optional for teams`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show configured values for each level (if any exist) */}
      {settings.useHierarchy && sortedLevels.length > 0 && (
        <>
          {sortedLevels.map((level) => {
            const values = getValuesForLevel(level.name);
            return (
              <div key={level.id} style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div
                    style={{
                      ...styles.sectionIcon,
                      backgroundColor: level.color,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div style={styles.sectionTitleContainer}>
                    <h3 style={styles.sectionTitle}>{level.pluralName}</h3>
                    <span style={styles.countBadge}>
                      {values.length === 0 ? 'None configured yet' : `${values.length} created`}
                    </span>
                  </div>
                </div>

                {values.length === 0 ? (
                  <p style={styles.emptyText}>
                    No {level.pluralName.toLowerCase()} have been created yet. You can create them after completing this wizard.
                  </p>
                ) : (
                  <div style={styles.itemList}>
                    {values.map((value) => (
                      <div
                        key={value.id}
                        style={{
                          ...styles.itemCard,
                          borderColor: level.color,
                        }}
                      >
                        <div
                          style={{
                            ...styles.itemDot,
                            backgroundColor: level.color,
                          }}
                        />
                        <span style={styles.itemName}>{value.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      <div style={styles.successBox}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#E3FCEF" />
          <path d="M8 12l2.5 2.5L16 9" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={styles.successContent}>
          <p style={styles.successTitle}>Ready to complete setup</p>
          <p style={styles.successDesc}>
            {settings.useHierarchy && sortedLevels.length > 0
              ? `Click "Finish Setup" to save your hierarchy configuration. You'll be able to create ${sortedLevels.map(l => l.pluralName.toLowerCase()).join(' and ')} from the Org Hierarchy section.`
              : 'Click "Finish Setup" to save your flat structure configuration. You can enable hierarchy later if needed.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  intro: {
    marginBottom: '8px',
  },
  introText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  section: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  sectionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    width: 'fit-content',
  },
  statusBadgeEnabled: {
    backgroundColor: '#E3FCEF',
    color: '#006644',
  },
  statusBadgeDisabled: {
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
  },
  countBadge: {
    fontSize: '12px',
    color: '#6B778C',
  },
  flatContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  flatStructureText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  flatDiagram: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  flatTeamBox: {
    padding: '8px 16px',
    backgroundColor: '#E3FCEF',
    border: '1px solid #36B37E',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#006644',
  },
  levelsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  levelCard: {
    padding: '14px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  levelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  levelColorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  levelName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    flex: 1,
  },
  mandatoryBadge: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#DE350B',
    backgroundColor: '#FFEBE6',
    padding: '2px 6px',
    borderRadius: '3px',
    textTransform: 'uppercase',
  },
  optionalBadge: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 6px',
    borderRadius: '3px',
    textTransform: 'uppercase',
  },
  levelDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  itemList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  itemDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  itemName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  successBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    border: '1px solid #ABF5D1',
  },
  successContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  successTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#006644',
  },
  successDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#006644',
    lineHeight: 1.5,
  },
};

export default OrgHierarchyStep5Review;
