import React from 'react';
import { TrendDataPoint, TrendDirection } from '../../../types/assessment';

interface TrendInsightCalloutProps {
  data: TrendDataPoint[];
  trend: TrendDirection;
  totalTeams?: number;
}

interface ChangeInsight {
  icon: string;
  headline: string;
  detail?: string;
  direction: 'up' | 'down' | 'neutral';
}

const formatPeriod = (period: string): string => {
  if (period.includes('-W')) {
    return `Week ${period.split('-W')[1]}`;
  }
  const [, month] = period.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  return monthNames[monthIndex] || period;
};

const generateChangeInsights = (data: TrendDataPoint[], trend: TrendDirection, totalTeams: number): ChangeInsight[] => {
  if (!data || data.length < 2) return [];

  const insights: ChangeInsight[] = [];
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  // Data values are percentiles (0-100, higher = better)
  // Risk score = 100 - percentile
  const firstRiskScore = Math.round(100 - firstPoint.value);
  const currentRiskScore = Math.round(100 - lastPoint.value);
  const riskChange = currentRiskScore - firstRiskScore;

  // Calculate current rank
  const teamsAhead = Math.round((100 - lastPoint.value) / 100 * totalTeams);
  const currentRank = teamsAhead + 1;

  // Find the period with the biggest change
  let maxChangeIdx = 0;
  let maxChange = 0;
  for (let i = 1; i < data.length; i++) {
    const change = Math.abs(data[i].value - data[i - 1].value);
    if (change > maxChange) {
      maxChange = change;
      maxChangeIdx = i;
    }
  }

  // 1. Main trend insight
  if (Math.abs(riskChange) >= 2) {
    const direction = riskChange > 0 ? 'up' : 'down';
    const headline = riskChange > 0
      ? `Risk increased by ${Math.abs(riskChange)} points since ${formatPeriod(firstPoint.period)}`
      : `Risk decreased by ${Math.abs(riskChange)} points since ${formatPeriod(firstPoint.period)}`;

    insights.push({
      icon: riskChange > 0 ? '↑' : '↓',
      headline,
      detail: riskChange > 0
        ? 'Review the indicators below to identify what changed.'
        : 'Your improvements are reflected in a lower risk score.',
      direction,
    });
  } else {
    insights.push({
      icon: '→',
      headline: `Risk score has remained stable at ${currentRiskScore}`,
      detail: 'No significant changes over this period.',
      direction: 'neutral',
    });
  }

  // 2. Ranking insight
  if (currentRank <= 10) {
    insights.push({
      icon: '🏆',
      headline: `You're ranked ${currentRank}${getOrdinalSuffix(currentRank)} among ${totalTeams} similar teams`,
      detail: "You're in the top performers for this dimension.",
      direction: 'neutral',
    });
  } else if (currentRank > totalTeams * 0.7) {
    insights.push({
      icon: '📊',
      headline: `You're ranked ${currentRank}${getOrdinalSuffix(currentRank)} of ${totalTeams} similar teams`,
      detail: 'Focus on the recommended actions to improve your ranking.',
      direction: 'up',
    });
  }

  return insights.slice(0, 2);
};

const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const TrendInsightCallout: React.FC<TrendInsightCalloutProps> = ({
  data,
  trend,
  totalTeams = 48
}) => {
  const insights = generateChangeInsights(data, trend, totalTeams);

  if (insights.length === 0) return null;

  return (
    <div style={styles.container}>
      <span style={styles.title}>What Changed</span>
      <div style={styles.insightsList}>
        {insights.map((insight, index) => (
          <div key={index} style={styles.insightCard}>
            <div style={{
              ...styles.iconWrapper,
              color: insight.direction === 'up' ? '#DE350B' : insight.direction === 'down' ? '#36B37E' : '#5E6C84',
            }}>
              {insight.icon}
            </div>
            <div style={styles.insightContent}>
              <p style={styles.headline}>{insight.headline}</p>
              {insight.detail && (
                <p style={styles.detail}>{insight.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '20px',
  },
  title: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '12px',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  insightCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '8px',
    backgroundColor: '#F8F9FA',
    border: '1px solid #EBECF0',
  },
  iconWrapper: {
    fontSize: '18px',
    fontWeight: 600,
    flexShrink: 0,
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
    minWidth: 0,
  },
  headline: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  detail: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
};

export default TrendInsightCallout;
