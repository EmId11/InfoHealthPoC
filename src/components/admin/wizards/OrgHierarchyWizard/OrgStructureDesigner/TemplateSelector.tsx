import React from 'react';
import { StructureTemplateId } from '../../../../../types/admin';
import { STRUCTURE_TEMPLATES, LEVEL_COLORS } from './constants';

interface TemplateSelectorProps {
  selectedTemplate: StructureTemplateId;
  onSelectTemplate: (templateId: StructureTemplateId) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Choose a Structure Template</h3>
        <p style={styles.subtitle}>
          Select a template that matches your organization, or build a custom structure
        </p>
      </div>
      <div style={styles.grid}>
        {STRUCTURE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            style={{
              ...styles.card,
              ...(selectedTemplate === template.id ? styles.cardSelected : {}),
            }}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div style={styles.preview}>
              <TemplatePreviewSVG
                templateId={template.id}
                isSelected={selectedTemplate === template.id}
              />
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>{template.name}</span>
                {selectedTemplate === template.id && (
                  <span style={styles.selectedBadge}>Selected</span>
                )}
              </div>
              <p style={styles.cardDescription}>{template.description}</p>
              {template.levelsAboveTeams > 0 && (
                <span style={styles.levelCount}>
                  {template.levelsAboveTeams} level{template.levelsAboveTeams > 1 ? 's' : ''} above teams
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// SVG Preview Component for each template
interface TemplatePreviewSVGProps {
  templateId: StructureTemplateId;
  isSelected: boolean;
}

const TemplatePreviewSVG: React.FC<TemplatePreviewSVGProps> = ({ templateId, isSelected }) => {
  const primaryColor = isSelected ? LEVEL_COLORS.purple : '#6B778C';
  const secondaryColor = isSelected ? LEVEL_COLORS.blue : '#97A0AF';
  const tertiaryColor = isSelected ? LEVEL_COLORS.teal : '#B3BAC5';
  const teamColor = isSelected ? LEVEL_COLORS.green : '#C1C7D0';

  switch (templateId) {
    case 'flat':
      // Four boxes in a row (flat)
      return (
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          <rect x="4" y="18" width="14" height="12" rx="2" fill={teamColor} />
          <rect x="22" y="18" width="14" height="12" rx="2" fill={teamColor} />
          <rect x="44" y="18" width="14" height="12" rx="2" fill={teamColor} />
          <rect x="62" y="18" width="14" height="12" rx="2" fill={teamColor} />
        </svg>
      );

    case 'simple':
      // One level above teams (Division -> Teams)
      return (
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          {/* Top level */}
          <rect x="28" y="4" width="24" height="12" rx="2" fill={primaryColor} />
          {/* Connectors */}
          <path d="M40 16v6M40 22L20 32M40 22L60 32" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
          {/* Teams */}
          <rect x="8" y="32" width="14" height="10" rx="2" fill={teamColor} />
          <rect x="33" y="32" width="14" height="10" rx="2" fill={teamColor} />
          <rect x="58" y="32" width="14" height="10" rx="2" fill={teamColor} />
        </svg>
      );

    case 'standard':
      // Two levels (Portfolio -> Team of Teams -> Teams)
      return (
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          {/* Top level - Portfolio */}
          <rect x="30" y="2" width="20" height="10" rx="2" fill={primaryColor} />
          {/* Connectors to second level */}
          <path d="M40 12v4M40 16L24 22M40 16L56 22" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
          {/* Second level - Team of Teams */}
          <rect x="14" y="22" width="16" height="8" rx="2" fill={secondaryColor} />
          <rect x="50" y="22" width="16" height="8" rx="2" fill={secondaryColor} />
          {/* Connectors to teams */}
          <path d="M22 30v4M22 34L12 38M22 34L32 38" stroke={secondaryColor} strokeWidth="1" strokeLinecap="round" />
          <path d="M58 30v4M58 34L48 38M58 34L68 38" stroke={secondaryColor} strokeWidth="1" strokeLinecap="round" />
          {/* Teams */}
          <rect x="4" y="38" width="10" height="8" rx="1.5" fill={teamColor} />
          <rect x="26" y="38" width="10" height="8" rx="1.5" fill={teamColor} />
          <rect x="44" y="38" width="10" height="8" rx="1.5" fill={teamColor} />
          <rect x="66" y="38" width="10" height="8" rx="1.5" fill={teamColor} />
        </svg>
      );

    case 'enterprise':
      // Three levels (Business Unit -> Portfolio -> Area -> Teams)
      return (
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          {/* Top level - Business Unit */}
          <rect x="32" y="0" width="16" height="8" rx="2" fill={primaryColor} />
          {/* Connectors */}
          <path d="M40 8v3M40 11L24 15M40 11L56 15" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" />
          {/* Second level - Portfolio */}
          <rect x="16" y="15" width="12" height="7" rx="1.5" fill={secondaryColor} />
          <rect x="52" y="15" width="12" height="7" rx="1.5" fill={secondaryColor} />
          {/* Connectors */}
          <path d="M22 22v3M22 25L14 28M22 25L30 28" stroke={secondaryColor} strokeWidth="1" strokeLinecap="round" />
          <path d="M58 22v3M58 25L50 28M58 25L66 28" stroke={secondaryColor} strokeWidth="1" strokeLinecap="round" />
          {/* Third level - Area */}
          <rect x="8" y="28" width="10" height="6" rx="1" fill={tertiaryColor} />
          <rect x="24" y="28" width="10" height="6" rx="1" fill={tertiaryColor} />
          <rect x="46" y="28" width="10" height="6" rx="1" fill={tertiaryColor} />
          <rect x="62" y="28" width="10" height="6" rx="1" fill={tertiaryColor} />
          {/* Connectors to teams */}
          <path d="M13 34v2M29 34v2M51 34v2M67 34v2" stroke={tertiaryColor} strokeWidth="1" strokeLinecap="round" />
          {/* Teams */}
          <rect x="5" y="38" width="8" height="6" rx="1" fill={teamColor} />
          <rect x="17" y="38" width="8" height="6" rx="1" fill={teamColor} />
          <rect x="31" y="38" width="8" height="6" rx="1" fill={teamColor} />
          <rect x="43" y="38" width="8" height="6" rx="1" fill={teamColor} />
          <rect x="55" y="38" width="8" height="6" rx="1" fill={teamColor} />
          <rect x="67" y="38" width="8" height="6" rx="1" fill={teamColor} />
        </svg>
      );

    case 'custom':
      // Puzzle-like icon to represent custom
      return (
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          {/* Plus icon in center */}
          <rect x="26" y="14" width="28" height="20" rx="4" fill={isSelected ? '#EAE6FF' : '#F4F5F7'} stroke={primaryColor} strokeWidth="2" strokeDasharray="4 2" />
          <path d="M40 20v8M36 24h8" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
          {/* Small floating elements */}
          <rect x="10" y="8" width="10" height="8" rx="2" fill={isSelected ? '#EAE6FF' : '#F4F5F7'} stroke={secondaryColor} strokeWidth="1" />
          <rect x="60" y="32" width="10" height="8" rx="2" fill={isSelected ? '#E3FCEF' : '#F4F5F7'} stroke={teamColor} strokeWidth="1" />
        </svg>
      );

    default:
      return null;
  }
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    backgroundColor: '#FFFFFF',
    border: '2px solid #EBECF0',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    overflow: 'hidden',
  },
  cardSelected: {
    border: '2px solid #6554C0',
    backgroundColor: '#F3F0FF',
    boxShadow: '0 2px 8px rgba(101, 84, 192, 0.15)',
  },
  preview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: '#F7F8FA',
    borderBottom: '1px solid #EBECF0',
    minHeight: '60px',
  },
  cardContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  selectedBadge: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: '#6554C0',
    padding: '2px 6px',
    borderRadius: '3px',
    textTransform: 'uppercase',
  },
  cardDescription: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  levelCount: {
    fontSize: '11px',
    color: '#5243AA',
    backgroundColor: '#EAE6FF',
    padding: '2px 6px',
    borderRadius: '3px',
    alignSelf: 'flex-start',
    marginTop: '4px',
  },
};

export default TemplateSelector;
