import React from 'react';
import { LensResult } from '../../../types/patterns';
import { getPatternById } from '../../../constants/patternLibrary';
import PatternCard from './PatternCard';

interface PatternLensDetailViewProps {
  lensResult: LensResult;
}

const LENS_LABELS: Record<string, string> = {
  integrity: 'Data Integrity',
  timing: 'Timing',
  behavioral: 'Behavioral',
};

const LENS_DESCRIPTIONS: Record<string, string> = {
  integrity: 'Checks whether populated fields contain meaningful data or just placeholders, defaults, and copy-paste content.',
  timing: 'Checks whether information was available when decisions were made, or added retroactively.',
  behavioral: 'Detects patterns in how data is entered that may distort your metrics and reports.',
};

const PatternLensDetailView: React.FC<PatternLensDetailViewProps> = ({ lensResult }) => {
  const lensLabel = LENS_LABELS[lensResult.lens] || lensResult.lens;
  const lensDesc = LENS_DESCRIPTIONS[lensResult.lens] || '';

  const detected = lensResult.results.filter(r => r.detected);
  const notDetected = lensResult.results.filter(r => !r.detected);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>{lensLabel}</h2>
          <span style={styles.count}>
            {lensResult.patternsDetected} of {lensResult.patternsChecked} patterns detected
          </span>
        </div>
        <div style={{
          ...styles.severityBadge,
          backgroundColor: lensResult.overallSeverity === 'critical' ? '#FFEBE6'
            : lensResult.overallSeverity === 'warning' ? '#FFFAE6' : '#E3FCEF',
          color: lensResult.overallSeverity === 'critical' ? '#DE350B'
            : lensResult.overallSeverity === 'warning' ? '#FF8B00' : '#00875A',
        }}>
          {lensResult.overallSeverity === 'critical' ? '\u26D4 Critical'
            : lensResult.overallSeverity === 'warning' ? '\u26A0 Warning' : '\u2713 Clean'}
        </div>
      </div>
      <p style={styles.description}>{lensDesc}</p>

      {/* Detected Patterns */}
      {detected.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionLabel}>DETECTED</span>
            <span style={styles.sectionCount}>{detected.length}</span>
          </div>
          <div style={styles.patternList}>
            {detected.map(result => {
              const pattern = getPatternById(result.patternId);
              return (
                <PatternCard
                  key={result.patternId}
                  result={result}
                  pattern={pattern}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Not Detected Patterns */}
      {notDetected.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionLabelClean}>NOT DETECTED</span>
            <span style={styles.sectionCountClean}>{notDetected.length}</span>
          </div>
          <div style={styles.cleanList}>
            {notDetected.map(result => {
              const pattern = getPatternById(result.patternId);
              return (
                <div key={result.patternId} style={styles.cleanRow}>
                  <span style={styles.cleanIcon}>{'\u2713'}</span>
                  <span style={styles.cleanName}>{pattern?.name || result.patternId}</span>
                  <span style={styles.cleanBadge}>Clean</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
    padding: '24px',
    animation: 'fadeInUp 0.4s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  count: {
    fontSize: '14px',
    color: '#6B778C',
    fontWeight: 500,
  },
  severityBadge: {
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 600,
    flexShrink: 0,
  },
  description: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  section: {
    marginBottom: '20px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #EBECF0',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#FF8B00',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  sectionCount: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#FF8B00',
    backgroundColor: '#FFFAE6',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  sectionLabelClean: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#00875A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  sectionCountClean: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  patternList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cleanList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cleanRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: '#F8FFF9',
    borderRadius: '8px',
    border: '1px solid #ABF5D1',
  },
  cleanIcon: {
    color: '#00875A',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  cleanName: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  cleanBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    padding: '2px 10px',
    borderRadius: '10px',
    flexShrink: 0,
  },
};

export default PatternLensDetailView;
