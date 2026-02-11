import React, { useState } from 'react';
import { PatternDetectionResult, Pattern } from '../../../types/patterns';
import PatternEvidenceList from './PatternEvidenceList';

interface PatternCardProps {
  result: PatternDetectionResult;
  pattern?: Pattern;
}

const SEVERITY_STYLES: Record<string, { color: string; bgColor: string; borderColor: string; label: string }> = {
  critical: { color: '#DE350B', bgColor: '#FFEBE6', borderColor: '#FF8F73', label: 'CRITICAL' },
  warning: { color: '#FF8B00', bgColor: '#FFFAE6', borderColor: '#FFE380', label: 'WARNING' },
  info: { color: '#0052CC', bgColor: '#DEEBFF', borderColor: '#B3D4FF', label: 'INFO' },
};

const PatternCard: React.FC<PatternCardProps> = ({ result, pattern }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const severity = SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.info;
  const name = pattern?.name || result.patternId;

  return (
    <div style={{
      ...styles.card,
      borderLeftColor: severity.color,
    }}>
      {/* Header - always visible */}
      <button
        style={styles.headerButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <span style={styles.severityIcon}>
              {result.severity === 'critical' ? '\u26D4' : result.severity === 'warning' ? '\u26A0' : '\u2139'}
            </span>
            <span style={styles.name}>{name}</span>
          </div>
          <div style={styles.headerRight}>
            <span style={{ ...styles.severityBadge, backgroundColor: severity.bgColor, color: severity.color }}>
              {severity.label}
            </span>
            <span style={{
              ...styles.expandIcon,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              {'\u25BC'}
            </span>
          </div>
        </div>
        <p style={styles.summary}>{result.summary}</p>
        <div style={styles.meta}>
          <span style={styles.metaItem}>{result.affectedIssueCount} issues affected</span>
          <span style={styles.metaDot}>&middot;</span>
          <span style={styles.metaItem}>{result.confidence} confidence</span>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={styles.details}>
          {/* Why It Matters */}
          {pattern?.whyItMatters && (
            <div style={styles.detailSection}>
              <h4 style={styles.detailLabel}>Why This Matters</h4>
              <p style={styles.detailText}>{pattern.whyItMatters}</p>
            </div>
          )}

          {/* Evidence */}
          {result.evidence.length > 0 && (
            <div style={styles.detailSection}>
              <h4 style={styles.detailLabel}>Evidence</h4>
              <PatternEvidenceList evidence={result.evidence} />
            </div>
          )}

          {/* Recommendation */}
          <div style={styles.recommendationBox}>
            <h4 style={styles.recommendationLabel}>Recommendation</h4>
            <p style={styles.recommendationText}>{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    borderLeft: '4px solid',
    overflow: 'hidden',
  },
  headerButton: {
    display: 'block',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  severityIcon: {
    fontSize: '14px',
  },
  name: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  severityBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  expandIcon: {
    fontSize: '10px',
    color: '#6B778C',
    transition: 'transform 0.2s ease',
  },
  summary: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#97A0AF',
  },
  metaItem: {},
  metaDot: {
    color: '#C1C7D0',
  },

  // Expanded details
  details: {
    padding: '0 20px 20px',
    borderTop: '1px solid #F4F5F7',
  },
  detailSection: {
    marginTop: '16px',
  },
  detailLabel: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  detailText: {
    margin: 0,
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.6,
  },
  recommendationBox: {
    marginTop: '16px',
    padding: '14px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    border: '1px solid #B3D4FF',
  },
  recommendationLabel: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#0747A6',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  recommendationText: {
    margin: 0,
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default PatternCard;
