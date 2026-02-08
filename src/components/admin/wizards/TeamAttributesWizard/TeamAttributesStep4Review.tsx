import React from 'react';
import { TeamAttributeConfig, SYSTEM_ATTRIBUTE_IDS } from '../../../../types/admin';

interface TeamAttributesStep4ReviewProps {
  categorization: TeamAttributeConfig;
}

const SYSTEM_ATTRIBUTE_NAMES: Record<string, string> = {
  [SYSTEM_ATTRIBUTE_IDS.TEAM_SIZE]: 'Team Size',
  [SYSTEM_ATTRIBUTE_IDS.TENURE]: 'Team Tenure',
  [SYSTEM_ATTRIBUTE_IDS.VOLUME]: 'Work Volume',
  [SYSTEM_ATTRIBUTE_IDS.PROCESS]: 'Process Maturity',
};

const TeamAttributesStep4Review: React.FC<TeamAttributesStep4ReviewProps> = ({
  categorization,
}) => {
  const systemAttributes = categorization.categories.filter((c) => c.type === 'system');
  const customAttributes = categorization.categories.filter((c) => c.type === 'admin');

  const getValuesForAttribute = (attributeId: string) =>
    categorization.categoryValues.filter((v) => v.categoryId === attributeId || v.attributeId === attributeId);

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Review your team attributes configuration below. You can add more attributes or modify
          these settings anytime from the Team Attributes section of the admin dashboard.
        </p>
      </div>

      {/* System Attributes */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>System Attributes</h3>
            <span style={styles.countBadge}>{systemAttributes.length} auto-calculated</span>
          </div>
        </div>

        <div style={styles.attributeGrid}>
          {Object.values(SYSTEM_ATTRIBUTE_IDS).map((attrId) => (
            <div key={attrId} style={styles.attributeCard}>
              <span style={styles.attributeName}>
                {SYSTEM_ATTRIBUTE_NAMES[attrId] || attrId}
              </span>
              <span style={styles.systemLabel}>Auto-calculated</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Attributes */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Custom Attributes</h3>
            <span style={styles.countBadge}>{customAttributes.length} created</span>
          </div>
        </div>

        {customAttributes.length === 0 ? (
          <p style={styles.emptyText}>
            No custom attributes have been created. You can add them later from the Team Attributes section.
          </p>
        ) : (
          <div style={styles.customAttributesList}>
            {customAttributes.map((attr) => {
              const values = getValuesForAttribute(attr.id);
              return (
                <div key={attr.id} style={styles.customAttributeCard}>
                  <div style={styles.customAttrHeader}>
                    <span style={styles.customAttrName}>{attr.name}</span>
                    <span style={styles.customAttrCount}>{values.length} values</span>
                  </div>
                  <div style={styles.valuesList}>
                    {values.map((value) => (
                      <span key={value.id} style={styles.valueChip}>
                        {value.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{systemAttributes.length + customAttributes.length}</span>
          <span style={styles.statLabel}>Total Attributes</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{systemAttributes.length}</span>
          <span style={styles.statLabel}>System (Auto)</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{customAttributes.length}</span>
          <span style={styles.statLabel}>Custom</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {customAttributes.reduce((sum, attr) => sum + getValuesForAttribute(attr.id).length, 0)}
          </span>
          <span style={styles.statLabel}>Custom Values</span>
        </div>
      </div>

      <div style={styles.successBox}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#E3FCEF" />
          <path d="M8 12l2.5 2.5L16 9" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={styles.successContent}>
          <p style={styles.successTitle}>Ready to complete setup</p>
          <p style={styles.successDesc}>
            Click "Finish Setup" to save your team attributes configuration. Teams can be tagged
            with these attributes for filtering and comparison in reports.
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
  countBadge: {
    fontSize: '12px',
    color: '#6B778C',
  },
  attributeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  attributeCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  attributeName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  systemLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#006644',
    backgroundColor: '#E3FCEF',
    padding: '3px 6px',
    borderRadius: '3px',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  customAttributesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  customAttributeCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  customAttrHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customAttrName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  customAttrCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  valuesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  valueChip: {
    padding: '4px 10px',
    backgroundColor: '#EAE6FF',
    color: '#5243AA',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#6554C0',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '4px',
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

export default TeamAttributesStep4Review;
