import React from 'react';
import { RiskLevel } from '../../../types/assessment';

interface BenchmarkComparisonTrackProps {
  teamPercentile: number;        // 0-100, your team's position (higher = better)
  benchmarkPercentile: number;   // comparison group average
  riskLevel: RiskLevel;          // for color coding
}

// Generate mock similar team data for visualization (47 teams to match comparison group)
interface TeamData {
  percentile: number;
  yOffset: number; // vertical offset for jittered display
}

const generateSimilarTeams = (benchmarkPercentile: number): TeamData[] => {
  const numTeams = 47;
  const teams: TeamData[] = [];

  for (let i = 0; i < numTeams; i++) {
    // Spread teams across a range with natural variation
    const spread = 40;
    const offset = (i / (numTeams - 1)) * spread * 2 - spread;
    const noise = Math.sin(i * 7.3) * 8 + Math.cos(i * 3.7) * 5;
    const percentile = Math.max(5, Math.min(95, benchmarkPercentile + offset + noise));

    // Generate y-offset for jittered scatter (-1 to 1, will be scaled)
    const yOffset = Math.sin(i * 4.1) * 0.8 + Math.cos(i * 2.3) * 0.6;

    teams.push({ percentile, yOffset });
  }

  return teams;
};

const BenchmarkComparisonTrack: React.FC<BenchmarkComparisonTrackProps> = ({
  teamPercentile,
  benchmarkPercentile,
  riskLevel,
}) => {
  // Convert percentile to position on track (0=left/better, 100=right/worse)
  const spectrumPosition = 100 - teamPercentile;

  // Generate similar teams with jitter data
  const similarTeams = generateSimilarTeams(benchmarkPercentile);

  // Calculate risk score (0-100, higher = worse)
  const riskScore = Math.round(100 - teamPercentile);

  // Determine marker color based on risk level
  const getMarkerColor = () => {
    switch (riskLevel) {
      case 'high': return '#DE350B';
      case 'moderate': return '#FFAB00';
      case 'low': return '#36B37E';
    }
  };

  // Get risk level label
  const getRiskLabel = () => {
    switch (riskLevel) {
      case 'high': return 'High Risk';
      case 'moderate': return 'Moderate Risk';
      case 'low': return 'Low Risk';
    }
  };

  // Get plain language comparison text
  const getComparisonText = () => {
    const teamsBetter = similarTeams.filter(t => t.percentile > teamPercentile).length;
    const teamsWorse = similarTeams.filter(t => t.percentile < teamPercentile).length;
    const totalTeams = similarTeams.length;

    if (teamsBetter === 0) {
      return 'Performing better than all similar teams';
    } else if (teamsWorse === 0) {
      return 'Below most similar teams';
    } else if (teamsBetter <= teamsWorse) {
      return `Ahead of ${teamsWorse} of ${totalTeams} similar teams`;
    } else {
      return `Behind ${teamsBetter} of ${totalTeams} similar teams`;
    }
  };

  // Calculate your rank among all teams
  const teamsAhead = similarTeams.filter(t => t.percentile > teamPercentile).length;
  const teamsBehind = similarTeams.filter(t => t.percentile < teamPercentile).length;
  const yourRank = teamsAhead + 1;
  const totalTeams = similarTeams.length + 1;

  // Get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const markerColor = getMarkerColor();

  return (
    <div style={styles.container}>
      {/* VISUAL 1: Risk Spectrum */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>RISK SCORE</span>
          <span style={{ ...styles.riskScore, color: markerColor }}>{riskScore}</span>
          <span style={{ ...styles.riskBadge, backgroundColor: markerColor }}>
            {getRiskLabel()}
          </span>
        </div>

        <div style={styles.spectrumContainer}>
          <div style={styles.spectrumBar}>
            <div style={styles.spectrumGood} />
            <div style={styles.spectrumMid} />
            <div style={styles.spectrumBad} />
            <div
              style={{ ...styles.spectrumMarker, left: `${spectrumPosition}%` }}
              title={`Risk Score: ${riskScore}/100`}
            >
              <div style={styles.spectrumPin} />
            </div>
          </div>
          <div style={styles.spectrumLabels}>
            <span style={styles.spectrumLabelLow}>Low Risk</span>
            <span style={styles.spectrumLabelHigh}>High Risk</span>
          </div>
        </div>
      </div>

      {/* VISUAL 2: Simple Ranking Comparison */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>
            COMPARED TO <span style={styles.teamCountHighlight}>{similarTeams.length}</span> SIMILAR TEAMS
          </span>
        </div>

        <div style={styles.rankingCard}>
          <div style={styles.comparisonColumns}>
            <div style={styles.comparisonColumn}>
              <div style={styles.comparisonNumber}>{teamsAhead}</div>
              <div style={styles.comparisonLabel}>teams<br/>doing better</div>
            </div>

            <div style={styles.rankBadge}>
              <div style={{ ...styles.rankNumber, color: markerColor }}>
                {yourRank}<span style={styles.rankSuffix}>{getOrdinalSuffix(yourRank)}</span>
              </div>
              <div style={styles.rankLabel}>Your rank</div>
            </div>

            <div style={styles.comparisonColumn}>
              <div style={styles.comparisonNumber}>{teamsBehind}</div>
              <div style={styles.comparisonLabel}>teams<br/>doing worse</div>
            </div>
          </div>

          <div style={styles.positionBarContainer}>
            <div style={styles.positionBar}>
              <div
                style={{
                  ...styles.positionFill,
                  width: `${(yourRank / totalTeams) * 100}%`,
                  backgroundColor: markerColor,
                }}
              />
              <div
                style={{
                  ...styles.positionMarker,
                  left: `${(yourRank / totalTeams) * 100}%`,
                  border: `1.5px solid ${markerColor}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sectionLabel: {
    fontSize: '8px',
    fontWeight: 700,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  teamCountHighlight: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#172B4D',
    padding: '1px 4px',
    backgroundColor: '#E4E6EB',
    borderRadius: '2px',
    marginLeft: '1px',
    marginRight: '1px',
  },
  riskScore: {
    fontSize: '14px',
    fontWeight: 700,
  },
  riskBadge: {
    padding: '1px 5px',
    borderRadius: '2px',
    fontSize: '8px',
    fontWeight: 600,
    color: '#FFFFFF',
  },

  // Spectrum styles
  spectrumContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  spectrumBar: {
    position: 'relative',
    height: '5px',
    borderRadius: '2.5px',
    display: 'flex',
    overflow: 'visible',
  },
  spectrumGood: {
    flex: 1,
    background: 'linear-gradient(90deg, #36B37E 0%, #79F2C0 100%)',
    borderRadius: '2.5px 0 0 2.5px',
  },
  spectrumMid: {
    flex: 1,
    background: 'linear-gradient(90deg, #FFE380 0%, #FFAB00 100%)',
  },
  spectrumBad: {
    flex: 1,
    background: 'linear-gradient(90deg, #FF8F73 0%, #DE350B 100%)',
    borderRadius: '0 2.5px 2.5px 0',
  },
  spectrumMarker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
  },
  spectrumPin: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#172B4D',
    border: '1.5px solid #FFFFFF',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  spectrumLabels: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  spectrumLabelLow: {
    fontSize: '8px',
    color: '#36B37E',
    fontWeight: 500,
  },
  spectrumLabelHigh: {
    fontSize: '8px',
    color: '#DE350B',
    fontWeight: 500,
  },

  // Ranking card styles - compact
  rankingCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: '4px',
    padding: '8px',
    border: '1px solid #EBECF0',
  },
  comparisonColumns: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  comparisonColumn: {
    textAlign: 'center',
    flex: 1,
  },
  comparisonNumber: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#5E6C84',
    lineHeight: 1,
  },
  comparisonLabel: {
    fontSize: '8px',
    color: '#6B778C',
    marginTop: '2px',
    lineHeight: 1.2,
  },
  rankBadge: {
    textAlign: 'center',
    padding: '0 10px',
    borderLeft: '1px solid #DFE1E6',
    borderRight: '1px solid #DFE1E6',
  },
  rankNumber: {
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1,
  },
  rankSuffix: {
    fontSize: '10px',
    fontWeight: 600,
  },
  rankLabel: {
    fontSize: '8px',
    color: '#6B778C',
    marginTop: '2px',
  },
  positionBarContainer: {
    marginTop: '2px',
  },
  positionBar: {
    position: 'relative',
    height: '4px',
    backgroundColor: '#DFE1E6',
    borderRadius: '2px',
    overflow: 'visible',
  },
  positionFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '2px',
    opacity: 0.3,
  },
  positionMarker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px',
    height: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    border: '1.5px solid',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
  },
};

export default BenchmarkComparisonTrack;
