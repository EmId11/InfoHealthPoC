import React from 'react';
import { SYSTEM_ATTRIBUTE_IDS } from '../../../../types/admin';

interface TeamAttributesStep2SystemAttrsProps {
  // System attributes are read-only, so no update handlers needed
}

const SYSTEM_ATTRIBUTES = [
  {
    id: SYSTEM_ATTRIBUTE_IDS.TEAM_SIZE,
    name: 'Team Size',
    description: 'Automatically categorizes teams based on member count',
    values: [
      { name: 'Small', description: '1-5 members' },
      { name: 'Medium', description: '6-10 members' },
      { name: 'Large', description: '11+ members' },
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" />
        <path d="M17 21v-2a4 4 0 0 0-2-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: SYSTEM_ATTRIBUTE_IDS.TENURE,
    name: 'Team Tenure',
    description: 'Based on average time team members have been together',
    values: [
      { name: 'New', description: '<6 months average' },
      { name: 'Established', description: '6-18 months average' },
      { name: 'Mature', description: '18+ months average' },
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: SYSTEM_ATTRIBUTE_IDS.VOLUME,
    name: 'Work Volume',
    description: 'Calculated from average issues completed per sprint',
    values: [
      { name: 'Low', description: '<15 issues/sprint' },
      { name: 'Medium', description: '15-30 issues/sprint' },
      { name: 'High', description: '30+ issues/sprint' },
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="14" width="4" height="6" stroke="currentColor" strokeWidth="2" />
        <rect x="10" y="10" width="4" height="10" stroke="currentColor" strokeWidth="2" />
        <rect x="17" y="4" width="4" height="16" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: SYSTEM_ATTRIBUTE_IDS.PROCESS,
    name: 'Process Maturity',
    description: 'Derived from Jira configuration and workflow adherence',
    values: [
      { name: 'Basic', description: 'Simple workflows' },
      { name: 'Standard', description: 'Defined processes' },
      { name: 'Advanced', description: 'Optimized practices' },
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3 6 6 1-4.5 4 1 6.5L12 17l-5.5 2.5 1-6.5L3 9l6-1 3-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const TeamAttributesStep2SystemAttrs: React.FC<TeamAttributesStep2SystemAttrsProps> = () => {
  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          System attributes are automatically calculated based on your team data in Jira.
          These cannot be manually edited, but you can see how teams are classified.
        </p>
      </div>

      <div style={styles.attributesList}>
        {SYSTEM_ATTRIBUTES.map((attr) => (
          <div key={attr.id} style={styles.attributeCard}>
            <div style={styles.attributeHeader}>
              <div style={styles.attributeIcon}>{attr.icon}</div>
              <div style={styles.attributeInfo}>
                <h3 style={styles.attributeName}>{attr.name}</h3>
                <p style={styles.attributeDesc}>{attr.description}</p>
              </div>
              <div style={styles.systemBadge}>Auto-calculated</div>
            </div>
            <div style={styles.valuesGrid}>
              {attr.values.map((value) => (
                <div key={value.name} style={styles.valueItem}>
                  <span style={styles.valueName}>{value.name}</span>
                  <span style={styles.valueDesc}>{value.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.infoBox}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#0052CC" strokeWidth="2" />
          <path d="M10 9v4M10 7h.01" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p style={styles.infoText}>
          System attributes are recalculated regularly as your Jira data changes. Teams will
          automatically move between categories as their metrics change.
        </p>
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
  attributesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  attributeCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  attributeHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  attributeIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    color: '#6554C0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid #EBECF0',
  },
  attributeInfo: {
    flex: 1,
  },
  attributeName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  attributeDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  systemBadge: {
    padding: '4px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  valueItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    textAlign: 'center',
  },
  valueName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  valueDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#0747A6',
    lineHeight: 1.5,
  },
};

export default TeamAttributesStep2SystemAttrs;
