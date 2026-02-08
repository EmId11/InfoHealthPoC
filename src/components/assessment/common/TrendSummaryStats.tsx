import React from 'react';
import { TrendDataPoint } from '../../../types/assessment';

interface TrendSummaryStatsProps {
  data: TrendDataPoint[];
  totalTeams?: number; // Number of similar teams for ranking display
}

interface TrendStats {
  currentRiskScore: number;        // 0-100, higher = worse
  periodChange: { value: number; direction: 'up' | 'down' | 'flat' };
  currentRank: number;             // Your rank among similar teams
  bestPeriod: { period: string; riskScore: number };
  worstPeriod: { period: string; riskScore: number };
}

const computeTrendStats = (data: TrendDataPoint[], totalTeams: number): TrendStats | null => {
  if (!data || data.length === 0) return null;

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  // Data values are percentiles (0-100, higher = better)
  // Risk score = 100 - percentile (so higher = worse)
  const currentRiskScore = Math.round(100 - lastPoint.value);
  const firstRiskScore = Math.round(100 - firstPoint.value);

  // Period change in risk score (positive = risk increased)
  const changeValue = currentRiskScore - firstRiskScore;
  const direction: 'up' | 'down' | 'flat' = changeValue > 1 ? 'up' : changeValue < -1 ? 'down' : 'flat';

  // Calculate rank: if you're at Xth percentile, roughly (100-X)% of teams are ahead
  const teamsAhead = Math.round((100 - lastPoint.value) / 100 * totalTeams);
  const currentRank = teamsAhead + 1;

  // Find best and worst periods (lowest risk = best, highest risk = worst)
  let bestPeriod = { period: data[0].period, value: data[0].value };
  let worstPeriod = { period: data[0].period, value: data[0].value };

  data.forEach(point => {
    // Higher percentile value = lower risk = better
    if (point.value > bestPeriod.value) {
      bestPeriod = { period: point.period, value: point.value };
    }
    if (point.value < worstPeriod.value) {
      worstPeriod = { period: point.period, value: point.value };
    }
  });

  return {
    currentRiskScore,
    periodChange: { value: changeValue, direction },
    currentRank,
    bestPeriod: { period: bestPeriod.period, riskScore: Math.round(100 - bestPeriod.value) },
    worstPeriod: { period: worstPeriod.period, riskScore: Math.round(100 - worstPeriod.value) },
  };
};

const formatPeriod = (period: string): string => {
  if (period.includes('-W')) {
    return `W${period.split('-W')[1]}`;
  }
  const [year, month] = period.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  return monthNames[monthIndex] || period;
};

// Get ordinal suffix for rank display
const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// Get risk level and color based on score
const getRiskInfo = (riskScore: number): { color: string; label: string } => {
  if (riskScore >= 66) return { color: '#DE350B', label: 'High Risk' };
  if (riskScore >= 33) return { color: '#FF8B00', label: 'Moderate' };
  return { color: '#36B37E', label: 'Low Risk' };
};

const TrendSummaryStats: React.FC<TrendSummaryStatsProps> = ({ data, totalTeams = 48 }) => {
  const stats = computeTrendStats(data, totalTeams);

  if (!stats) return null;

  // For risk change: up = bad (red), down = good (green)
  const getChangeColor = () => {
    if (stats.periodChange.direction === 'up') return '#DE350B'; // Risk increased = bad
    if (stats.periodChange.direction === 'down') return '#36B37E'; // Risk decreased = good
    return '#6B778C';
  };

  const getChangeArrow = () => {
    if (stats.periodChange.direction === 'up') return '↑';
    if (stats.periodChange.direction === 'down') return '↓';
    return '→';
  };

  const riskInfo = getRiskInfo(stats.currentRiskScore);

  return (
    <div style={styles.container}>
      {/* Current Risk Score */}
      <div style={styles.statCard}>
        <span style={styles.statLabel}>CURRENT RISK</span>
        <div style={styles.scoreWithBadge}>
          <span style={{ ...styles.statValue, color: riskInfo.color }}>{stats.currentRiskScore}</span>
          <span style={{ ...styles.riskBadge, backgroundColor: riskInfo.color }}>{riskInfo.label}</span>
        </div>
      </div>

      {/* Period Change */}
      <div style={styles.statCard}>
        <span style={styles.statLabel}>CHANGE</span>
        <div style={styles.statValueRow}>
          <span style={{ ...styles.statValue, color: getChangeColor() }}>
            {stats.periodChange.value > 0 ? '+' : ''}{stats.periodChange.value}
          </span>
          <span style={{ ...styles.changeArrow, color: getChangeColor() }}>
            {getChangeArrow()}
          </span>
        </div>
        <span style={styles.statUnit}>pts since {formatPeriod(data[0].period)}</span>
      </div>

      {/* Ranking */}
      <div style={styles.statCard}>
        <span style={styles.statLabel}>RANK</span>
        <span style={{ ...styles.statValue, color: riskInfo.color }}>
          {stats.currentRank}<sup style={styles.rankSuffix}>{getOrdinalSuffix(stats.currentRank)}</sup>
        </span>
        <span style={styles.statUnit}>of {totalTeams} similar teams</span>
      </div>

      {/* Best Period (lowest risk) */}
      <div style={styles.statCard}>
        <span style={styles.statLabel}>BEST</span>
        <span style={{ ...styles.statValue, color: '#36B37E' }}>{stats.bestPeriod.riskScore}</span>
        <span style={styles.statUnit}>{formatPeriod(stats.bestPeriod.period)}</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #EBECF0',
  },
  statLabel: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  scoreWithBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  riskBadge: {
    padding: '2px 8px',
    borderRadius: '3px',
    fontSize: '9px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#172B4D',
  },
  changeArrow: {
    fontSize: '16px',
    fontWeight: 600,
  },
  rankSuffix: {
    fontSize: '11px',
    fontWeight: 600,
  },
  statUnit: {
    fontSize: '10px',
    color: '#5E6C84',
    marginTop: '4px',
  },
};

export default TrendSummaryStats;
