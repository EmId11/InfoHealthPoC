import React from 'react';
import {
  ReportResultRow,
  DrilldownPath,
  QueryEntityType,
  getEntityLabel,
} from '../../../../types/reports';

interface DrilldownModalProps {
  row: ReportResultRow;
  paths: DrilldownPath[];
  entityType: QueryEntityType;
  onSelect: (targetEntity: QueryEntityType, relationField: string) => void;
  onClose: () => void;
}

// Icons for entity types
const ENTITY_ICONS: Record<QueryEntityType, string> = {
  teams: '👥',
  assessments: '📋',
  dimensions: '📐',
  indicators: '📊',
  users: '👤',
  issues: '🎫',
  sprints: '🏃',
  teamMetrics: '📈',
  sprintMetrics: '📉',
  userActivity: '👁️',
  outcomeConfidence: '🎯',
};

const DrilldownModal: React.FC<DrilldownModalProps> = ({
  row,
  paths,
  entityType,
  onSelect,
  onClose,
}) => {
  // Get display name for the row
  const getRowDisplayName = (): string => {
    return String(
      row.teamName ||
      row.displayName ||
      row.sprintName ||
      row.dimensionName ||
      row.indicatorName ||
      row.assessmentName ||
      row.issueKey ||
      row.id
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <span style={styles.entityIcon}>{ENTITY_ICONS[entityType]}</span>
            <div>
              <h3 style={styles.title}>{getRowDisplayName()}</h3>
              <span style={styles.subtitle}>{getEntityLabel(entityType)}</span>
            </div>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Row Summary */}
        <div style={styles.summary}>
          {Object.entries(row)
            .filter(([key]) => key !== 'id' && !key.startsWith('_'))
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key} style={styles.summaryItem}>
                <span style={styles.summaryLabel}>{formatLabel(key)}</span>
                <span style={styles.summaryValue}>{formatValue(value)}</span>
              </div>
            ))}
        </div>

        {/* Drilldown Options */}
        <div style={styles.drilldownSection}>
          <h4 style={styles.sectionTitle}>Drill Down To</h4>
          <div style={styles.pathList}>
            {paths.map((path) => (
              <button
                key={`${path.from}-${path.to}`}
                style={styles.pathButton}
                onClick={() => onSelect(path.to, path.relationField)}
              >
                <span style={styles.pathIcon}>{ENTITY_ICONS[path.to]}</span>
                <div style={styles.pathInfo}>
                  <span style={styles.pathName}>{getEntityLabel(path.to)}</span>
                  <span style={styles.pathDesc}>{path.description}</span>
                </div>
                <span style={styles.pathArrow}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Open in Query Option */}
        <div style={styles.footer}>
          <button style={styles.openQueryButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Format field label
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Format value for display
function formatValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toFixed(1);
  }
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

const styles: Record<string, React.CSSProperties> = {
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
    width: '440px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 20px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  entityIcon: {
    fontSize: '32px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  closeButton: {
    padding: '4px 8px',
    fontSize: '24px',
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#FAFBFC',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryValue: {
    fontSize: '14px',
    color: '#172B4D',
  },
  drilldownSection: {
    padding: '16px 20px',
    flex: 1,
    overflowY: 'auto',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  pathList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pathButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  pathIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  pathInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  pathName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  pathDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  pathArrow: {
    fontSize: '16px',
    color: '#0052CC',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px 20px',
    borderTop: '1px solid #EBECF0',
  },
  openQueryButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526E',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default DrilldownModal;
