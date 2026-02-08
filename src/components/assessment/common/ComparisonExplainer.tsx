import React, { useState } from 'react';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronUpIcon from '@atlaskit/icon/glyph/chevron-up';
import { ComparisonTeam } from '../../../types/assessment';

interface ComparisonExplainerProps {
  teamCount: number;
  teams: ComparisonTeam[];
  criteria: string[];
  onViewTeams: () => void;
}

const ComparisonExplainer: React.FC<ComparisonExplainerProps> = ({
  teamCount,
  criteria,
  onViewTeams,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse criteria into structured format for display
  const parseCriteria = () => {
    return criteria.map(criterion => {
      // Try to split by colon (e.g., "Team Size: Medium (6-15 members)")
      const colonIndex = criterion.indexOf(':');
      if (colonIndex > -1) {
        return {
          label: criterion.substring(0, colonIndex).trim(),
          value: criterion.substring(colonIndex + 1).trim(),
        };
      }
      return { label: criterion, value: '' };
    });
  };

  const parsedCriteria = parseCriteria();

  return (
    <div style={styles.container}>
      {/* Header - always visible */}
      <div
        style={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
      >
        <div style={styles.headerContent}>
          <span style={styles.headerText}>
            Results compared against{' '}
            <button
              style={styles.teamsLink}
              onClick={(e) => { e.stopPropagation(); onViewTeams(); }}
            >
              {teamCount} similar teams
            </button>
          </span>
        </div>
        <button style={styles.toggleButton}>
          {isExpanded ? (
            <ChevronUpIcon label="Collapse" size="small" primaryColor="#6B778C" />
          ) : (
            <ChevronDownIcon label="Expand" size="small" primaryColor="#6B778C" />
          )}
        </button>
      </div>

      {/* Expanded content - criteria as tags */}
      {isExpanded && (
        <div style={styles.expandedContent}>
          <div style={styles.sectionTitle}>Matching criteria</div>
          <div style={styles.criteriaGrid}>
            {parsedCriteria.map((criterion, index) => (
              <div key={index} style={styles.criterionTag}>
                <span style={styles.criterionLabel}>{criterion.label}</span>
                {criterion.value && (
                  <span style={styles.criterionValue}>{criterion.value}</span>
                )}
              </div>
            ))}
          </div>
          <p style={styles.helperText}>
            Teams are matched based on these characteristics to ensure fair comparison.
          </p>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#E6F0FF',
    border: '1px solid #B3D4FF',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    flexWrap: 'wrap',
  },
  headerText: {
    fontSize: '13px',
    color: '#172B4D',
  },
  teamsLink: {
    background: 'none',
    border: 'none',
    color: '#0052CC',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    marginLeft: '8px',
  },
  expandedContent: {
    padding: '0 16px 16px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  criteriaGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  criterionTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
  },
  criterionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
  },
  criterionValue: {
    fontSize: '12px',
    color: '#172B4D',
  },
  helperText: {
    fontSize: '12px',
    color: '#6B778C',
    margin: 0,
    lineHeight: 1.5,
  },
};

export default ComparisonExplainer;
