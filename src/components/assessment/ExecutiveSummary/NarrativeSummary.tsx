import React from 'react';
import { ExecutiveSummaryData } from '../../../types/assessment';
import { getOrdinalSuffix } from '../../../utils/executiveSummaryUtils';
import { getMaturityLevel } from '../../../types/maturity';

interface NarrativeSummaryProps {
  data: ExecutiveSummaryData;
  teamName: string;
}

const NarrativeSummary: React.FC<NarrativeSummaryProps> = ({ data, teamName }) => {
  // Get dimensions needing attention (Basic or Emerging maturity - levels 1-2)
  const needsAttentionDimensions = data.themeSummaries
    .flatMap(t => t.dimensions)
    .filter(d => getMaturityLevel(d.percentile) <= 2)
    .map(d => d.dimensionName);

  // Get strong performing dimensions (Advanced or Exemplary maturity - levels 4-5)
  const strongPerformingDimensions = data.themeSummaries
    .flatMap(t => t.dimensions)
    .filter(d => getMaturityLevel(d.percentile) >= 4)
    .map(d => d.dimensionName);

  const formatList = (items: string[], maxItems = 3): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length <= maxItems) {
      return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
    }
    return items.slice(0, maxItems).join(', ') + ` and ${items.length - maxItems} more`;
  };

  // Use maturity name and colors from healthScore
  const maturityName = data.healthScore.maturityName;
  const maturityColor = data.healthScore.color;
  const maturityBgColor = data.healthScore.bgColor;

  return (
    <div style={styles.container}>
      {/* Header row - using maturity name */}
      <div style={styles.header}>
        <span style={styles.teamName}>{teamName}</span>
        <span style={styles.headerText}>'s Jira health is</span>
        <span style={{ ...styles.verdictBadge, backgroundColor: maturityBgColor, color: maturityColor }}>
          {maturityName}
        </span>
        <span style={styles.headerText}>ranking</span>
        <span style={styles.rankBadge}>
          {getOrdinalSuffix(data.teamRank)} of {data.totalTeams}
        </span>
        <span style={styles.headerText}>similar teams</span>
      </div>

      {/* Info cards */}
      <div style={styles.cardsRow}>
        {/* Needs Attention Card - Basic or Emerging maturity */}
        {needsAttentionDimensions.length > 0 && (
          <div style={{ ...styles.card, ...styles.cardRisk }}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.cardIcon, backgroundColor: '#DE350B' }}>!</span>
              <span style={styles.cardTitle}>Needs Attention</span>
            </div>
            <p style={styles.cardText}>
              {formatList(needsAttentionDimensions)} {needsAttentionDimensions.length === 1 ? 'needs' : 'need'} improvement
              and should be prioritized.
            </p>
          </div>
        )}

        {/* Strong Performance Card - Advanced or Exemplary maturity */}
        {strongPerformingDimensions.length > 0 && (
          <div style={{ ...styles.card, ...styles.cardSuccess }}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.cardIcon, backgroundColor: '#36B37E' }}>✓</span>
              <span style={styles.cardTitle}>Strong Performance</span>
            </div>
            <p style={styles.cardText}>
              {formatList(strongPerformingDimensions)} {strongPerformingDimensions.length === 1 ? 'is' : 'are'} at Advanced or Exemplary maturity,
              performing better than most comparison teams.
            </p>
          </div>
        )}

        {/* Trend Card */}
        <div style={{ ...styles.card, ...styles.cardTrend }}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardIcon, backgroundColor: '#0052CC' }}>~</span>
            <span style={styles.cardTitle}>Trend</span>
          </div>
          <p style={styles.cardText}>
            {data.overallTrendChange > 0 ? (
              <>
                Health has <strong style={{ color: '#36B37E' }}>improved by {data.overallTrendChange} points</strong>
                {data.biggestGain && <>, with <strong>{data.biggestGain.dimensionName}</strong> showing the biggest gain (+{data.biggestGain.change} pts)</>}.
              </>
            ) : data.overallTrendChange < 0 ? (
              <>
                Health has <strong style={{ color: '#DE350B' }}>declined by {Math.abs(data.overallTrendChange)} points</strong>
                {data.biggestDecline && <>, with <strong>{data.biggestDecline.dimensionName}</strong> showing the biggest drop ({data.biggestDecline.change} pts)</>}.
              </>
            ) : (
              <>Health has <strong>remained stable</strong> over the analysis period.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    fontSize: '15px',
    color: '#172B4D',
  },
  teamName: {
    fontWeight: 700,
    color: '#172B4D',
  },
  headerText: {
    color: '#5E6C84',
  },
  verdictBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 600,
  },
  rankBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#F4F5F7',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
  },
  card: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
  },
  cardRisk: {
    backgroundColor: '#FFF8F7',
    border: '1px solid #FFCCC7',
  },
  cardSuccess: {
    backgroundColor: '#F6FFF8',
    border: '1px solid #B7EB8F',
  },
  cardTrend: {
    backgroundColor: '#F0F7FF',
    border: '1px solid #BAE7FF',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 700,
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  cardText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: 1.5,
    color: '#172B4D',
  },
};

export default NarrativeSummary;
