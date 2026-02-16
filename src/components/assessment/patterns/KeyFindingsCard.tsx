import React from 'react';
import { AssessmentLensResults } from '../../../types/patterns';
import {
  computeLensScores,
  aggregatePatternInsights,
  generateInsights,
  InsightBullet,
} from './DataTrustBanner';

interface KeyFindingsCardProps {
  lensResults: AssessmentLensResults;
  integrityScore: number;
}

const SEVERITY_BG_TINTS: Record<string, string> = {
  Critical: 'rgba(222, 53, 11, 0.05)',
  'At Risk': 'rgba(255, 139, 0, 0.05)',
  Fair:      'rgba(38, 132, 255, 0.05)',
  Healthy:   'rgba(0, 135, 90, 0.05)',
};

const KeyFindingsCard: React.FC<KeyFindingsCardProps> = ({ lensResults, integrityScore }) => {
  const scores = computeLensScores(lensResults, integrityScore);
  const insights = aggregatePatternInsights(lensResults);
  const bullets = generateInsights(scores, insights);

  if (bullets.length === 0) return null;

  return (
    <div style={styles.card}>
      <span style={styles.title}>KEY FINDINGS</span>
      <div style={styles.grid}>
        {bullets.map((bullet, i) => (
          <FindingCard key={i} bullet={bullet} />
        ))}
      </div>
    </div>
  );
};

const FindingCard: React.FC<{ bullet: InsightBullet }> = ({ bullet }) => {
  const bgTint = SEVERITY_BG_TINTS[bullet.label] || 'rgba(222, 53, 11, 0.05)';

  return (
    <div style={{
      ...styles.finding,
      backgroundColor: bgTint,
      borderLeftColor: bullet.labelColor,
    }}>
      <span style={{
        ...styles.pill,
        color: bullet.labelColor,
        backgroundColor: bullet.labelBg,
      }}>
        {bullet.label}
      </span>
      <span style={styles.findingText}>{bullet.text}</span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    padding: '24px 32px 28px',
  },
  title: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  finding: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '16px 18px',
    borderRadius: '10px',
    borderLeft: '4px solid',
  },
  pill: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap' as const,
  },
  findingText: {
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default KeyFindingsCard;
