import React from 'react';
import { OrgStructureSettings, OrgHierarchyLevel, StructureTemplateId } from '../../../../../types/admin';
import LevelBuilder from './LevelBuilder';
import LivePreview from './LivePreview';
import { STRUCTURE_TEMPLATES } from './constants';

interface OrgStructureDesignerProps {
  settings: OrgStructureSettings;
  onUpdate: (updates: Partial<OrgStructureSettings>) => void;
}

const OrgStructureDesigner: React.FC<OrgStructureDesignerProps> = ({
  settings,
  onUpdate,
}) => {
  // Get the selected template info for display
  const selectedTemplate = STRUCTURE_TEMPLATES.find((t) => t.id === settings.structureTemplate);

  const handleLevelsChange = (newLevels: OrgHierarchyLevel[]) => {
    // When levels change, switch to custom template if needed
    const isCustomized = !matchesTemplate(newLevels, settings.structureTemplate);

    onUpdate({
      customLevels: newLevels,
      structureTemplate: isCustomized ? 'custom' : settings.structureTemplate,
      // Update useHierarchy based on whether there are any levels
      useHierarchy: newLevels.length > 0,
    });
  };

  const isFlat = settings.structureTemplate === 'flat' || !settings.useHierarchy;

  return (
    <div style={styles.container}>
      {/* Selected Template Indicator */}
      <div style={styles.templateIndicator}>
        <div style={styles.templateBadge}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3 3 6-6" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Template: <strong>{selectedTemplate?.name || 'Custom'}</strong></span>
        </div>
        <p style={styles.introText}>
          Customize your levels below. Rename them, reorder them, or add new ones
          to match your organization's structure.
        </p>
      </div>

      {/* Two-column layout for Level Builder and Preview */}
      <div style={styles.mainContent}>
        {/* Level Builder (left column) */}
        <div style={styles.builderColumn}>
          {!isFlat ? (
            <LevelBuilder
              levels={settings.customLevels}
              onLevelsChange={handleLevelsChange}
            />
          ) : (
            <div style={styles.flatExplanation}>
              <div style={styles.flatIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="19" width="12" height="10" rx="2" stroke="#6B778C" strokeWidth="2" />
                  <rect x="18" y="19" width="12" height="10" rx="2" stroke="#6B778C" strokeWidth="2" />
                  <rect x="32" y="19" width="12" height="10" rx="2" stroke="#6B778C" strokeWidth="2" />
                </svg>
              </div>
              <h3 style={styles.flatTitle}>Flat Structure Selected</h3>
              <p style={styles.flatText}>
                All teams will exist at the same level without grouping. This is the simplest
                configuration, ideal for smaller organizations.
              </p>
              <div style={styles.flatBenefits}>
                <div style={styles.benefitItem}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 6-6" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Quick setup with no configuration needed</span>
                </div>
                <div style={styles.benefitItem}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 6-6" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Individual team-level assessments and reports</span>
                </div>
                <div style={styles.benefitItem}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 6-6" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Can enable hierarchy later as you grow</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview (right column) */}
        <div style={styles.previewColumn}>
          <LivePreview levels={settings.customLevels} isFlat={isFlat} />
        </div>
      </div>

      {/* Info box */}
      <div style={styles.infoBox}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#6554C0" strokeWidth="2"/>
          <path d="M10 9v4M10 7h.01" stroke="#6554C0" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p style={styles.infoText}>
          {isFlat
            ? 'You can enable hierarchy later if your organization grows. The remaining steps will guide you through team setup.'
            : `After completing this wizard, you'll be able to create ${settings.customLevels.map(l => l.pluralName.toLowerCase()).join(', ')} and assign teams to them.`}
        </p>
      </div>
    </div>
  );
};

// Helper function to check if current levels match a template
const matchesTemplate = (levels: OrgHierarchyLevel[], templateId: StructureTemplateId): boolean => {
  if (templateId === 'custom') return false;

  const template = STRUCTURE_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return false;

  if (levels.length !== template.defaultLevels.length) return false;

  // Check if all level names match (order-based comparison)
  return levels.every((level, index) => {
    const templateLevel = template.defaultLevels[index];
    return templateLevel && level.name === templateLevel.name;
  });
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  templateIndicator: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '8px',
  },
  templateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#E3FCEF',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#006644',
    width: 'fit-content',
  },
  introText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '24px',
    alignItems: 'start',
  },
  builderColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  previewColumn: {
    position: 'sticky',
    top: '16px',
  },
  flatExplanation: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '32px',
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    border: '1px solid #EBECF0',
  },
  flatIcon: {
    marginBottom: '16px',
  },
  flatTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  flatText: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.6,
    maxWidth: '400px',
  },
  flatBenefits: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#172B4D',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#EAE6FF',
    borderRadius: '8px',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#403294',
    lineHeight: 1.5,
  },
};

export default OrgStructureDesigner;
