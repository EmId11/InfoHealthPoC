import React from 'react';
import { StructureTemplateId, OrgStructureSettings } from '../../../../types/admin';
import TemplateSelector from './OrgStructureDesigner/TemplateSelector';

interface OrgHierarchyStep0TemplateProps {
  settings: OrgStructureSettings;
  onSelectTemplate: (templateId: StructureTemplateId) => void;
  onGetStarted: () => void;
}

const OrgHierarchyStep0Template: React.FC<OrgHierarchyStep0TemplateProps> = ({
  settings,
  onSelectTemplate,
  onGetStarted,
}) => {
  const isFlat = settings.structureTemplate === 'flat';

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Neutral "building blocks" icon */}
        <div style={styles.iconContainer}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#EAE6FF" />
            {/* Building blocks icon - neutral, not implying hierarchy */}
            <rect x="12" y="36" width="12" height="12" rx="2" fill="#6554C0" />
            <rect x="26" y="36" width="12" height="12" rx="2" fill="#0065FF" />
            <rect x="40" y="36" width="12" height="12" rx="2" fill="#00B8D9" />
            <rect x="19" y="20" width="12" height="12" rx="2" fill="#6554C0" opacity="0.7" />
            <rect x="33" y="20" width="12" height="12" rx="2" fill="#0065FF" opacity="0.7" />
          </svg>
        </div>

        <h1 style={styles.title}>Choose Your Organization Structure</h1>
        <p style={styles.description}>
          Select how you want to organize your teams. You can use a simple flat structure
          or group teams into hierarchical levels like portfolios and tribes.
        </p>

        {/* Template Selection */}
        <div style={styles.templateSection}>
          <TemplateSelector
            selectedTemplate={settings.structureTemplate}
            onSelectTemplate={onSelectTemplate}
          />
        </div>

        {/* Info about next steps */}
        <div style={styles.infoBox}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#6554C0" strokeWidth="2"/>
            <path d="M10 9v4M10 7h.01" stroke="#6554C0" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p style={styles.infoText}>
            {isFlat
              ? "With a flat structure, all teams exist at the same level. You can always add hierarchy later."
              : `Next, you'll be able to customize the level names and configure how teams are grouped.`}
          </p>
        </div>

        <button style={styles.button} onClick={onGetStarted}>
          {isFlat ? 'Finish Setup' : 'Customize Structure'}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '500px',
  },
  content: {
    maxWidth: '700px',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: '0 0 32px 0',
    fontSize: '16px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  templateSection: {
    marginBottom: '24px',
    textAlign: 'left',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#EAE6FF',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#403294',
    lineHeight: 1.5,
  },
  button: {
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '3px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default OrgHierarchyStep0Template;
