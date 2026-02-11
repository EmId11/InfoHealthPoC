import React from 'react';
import { PatternEvidence } from '../../../types/patterns';

interface PatternEvidenceListProps {
  evidence: PatternEvidence[];
}

const PatternEvidenceList: React.FC<PatternEvidenceListProps> = ({ evidence }) => {
  return (
    <div style={styles.container}>
      {evidence.map((item, idx) => (
        <div key={idx} style={styles.row}>
          <div style={styles.bullet} />
          <div style={styles.content}>
            {item.issueKey && (
              <span style={styles.issueKey}>{item.issueKey}</span>
            )}
            <span style={styles.description}>{item.description}</span>
            {item.timestamp && (
              <span style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '8px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
    border: '1px solid #F4F5F7',
  },
  bullet: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#97A0AF',
    flexShrink: 0,
    marginTop: '6px',
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: '6px',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  issueKey: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '1px 6px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  description: {
    color: '#42526E',
  },
  timestamp: {
    fontSize: '11px',
    color: '#97A0AF',
    flexShrink: 0,
  },
};

export default PatternEvidenceList;
