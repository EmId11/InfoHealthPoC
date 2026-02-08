import React, { useMemo, useState } from 'react';
import { CHS_CATEGORIES, getCHSCategoryConfig } from '../../../constants/chsCategories';

interface TeamPosition {
  name: string;
  score: number;
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const mockTeamNames = [
  'Platform Team', 'Mobile Squad', 'Core API', 'DevOps',
  'Frontend Team', 'Data Engineering', 'Security', 'Integrations',
  'Growth Team', 'Infrastructure', 'QA Team', 'Design Systems'
];

interface RiskSpectrumProps {
  currentScore: number;
  benchmarkPercentile: number;
}

const RiskSpectrum: React.FC<RiskSpectrumProps> = ({
  currentScore,
  benchmarkPercentile,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });

  // Generate mock comparison team positions based on percentile (memoized to prevent re-renders)
  const comparisonTeams = useMemo((): TeamPosition[] => {
    const teams: TeamPosition[] = [];
    const numTeams = 12;

    // Use seeded random for consistent dots
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < numTeams; i++) {
      const random = seededRandom(i + benchmarkPercentile);
      let score: number;

      if (random < (100 - benchmarkPercentile) / 100) {
        score = seededRandom(i * 2 + 1) * currentScore * 0.85;
      } else {
        score = currentScore + seededRandom(i * 3 + 2) * (1 - currentScore) * 0.7;
      }

      teams.push({
        name: mockTeamNames[i % mockTeamNames.length],
        score: Math.max(0.02, Math.min(0.98, score)),
      });
    }

    return teams;
  }, [currentScore, benchmarkPercentile]);

  const getScorePosition = (score: number): string => {
    return `${score * 100}%`;
  };

  const showTooltip = (e: React.MouseEvent, content: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div style={styles.container}>
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            ...styles.tooltip,
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Spectrum Bar */}
      <div style={styles.spectrumContainer}>
        <div style={styles.spectrum}>
          {/* CHS 5-zone model: Needs Attention (0-30%), Below Avg (30-45%), Average (45-55%), Good (55-70%), Excellent (70-100%) */}
          <div style={styles.needsAttentionZone} />  {/* 0-30% - Needs Attention */}
          <div style={styles.belowAverageZone} />    {/* 30-45% - Below Average */}
          <div style={styles.averageZone} />         {/* 45-55% - Average */}
          <div style={styles.goodZone} />            {/* 55-70% - Good */}
          <div style={styles.excellentZone} />       {/* 70-100% - Excellent */}

          {/* Comparison Team Dots */}
          {comparisonTeams.map((team, index) => (
            <div
              key={index}
              style={{
                ...styles.comparisonDot,
                left: getScorePosition(team.score),
              }}
              onMouseEnter={(e) => showTooltip(e, `${team.name}: ${Math.round(team.score * 100)}%`)}
              onMouseLeave={hideTooltip}
            />
          ))}

          {/* Current Team Marker */}
          <div
            style={{
              ...styles.currentMarker,
              left: getScorePosition(currentScore),
            }}
            onMouseEnter={(e) => showTooltip(e, `Your team: ${Math.round(currentScore * 100)}%`)}
            onMouseLeave={hideTooltip}
          >
            <div style={styles.currentMarkerPin} />
          </div>
        </div>

        {/* Scale with CHS labels */}
        <div style={styles.scaleRow}>
          <div style={styles.scaleSection}>
            <span style={styles.scaleValue}>0</span>
            <span style={{...styles.scaleLabel, color: '#DE350B'}}>Needs Attention</span>
          </div>
          <div style={styles.scaleSectionCenter}>
            <span style={{...styles.scaleLabel, color: '#6B778C'}}>Average</span>
          </div>
          <div style={styles.scaleSectionRight}>
            <span style={{...styles.scaleLabel, color: '#006644'}}>Excellent</span>
            <span style={styles.scaleValue}>100</span>
          </div>
        </div>
      </div>

      {/* Minimal legend - inline */}
      <div style={styles.inlineLegend}>
        <span style={styles.legendItem}>
          <span style={styles.yourTeamDot} /> You
        </span>
        <span style={styles.legendItem}>
          <span style={styles.otherTeamDot} /> Other teams
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '16px',
    position: 'relative',
  },
  tooltip: {
    position: 'fixed',
    transform: 'translate(-50%, -100%)',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    zIndex: 9999,
    pointerEvents: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  spectrumContainer: {
    position: 'relative',
  },
  spectrum: {
    position: 'relative',
    height: '28px',
    borderRadius: '14px',
    overflow: 'visible',
    display: 'flex',
  },
  // CHS Zone widths: Needs Attention 30%, Below Avg 15%, Average 10%, Good 15%, Excellent 30%
  needsAttentionZone: {
    flex: '0 0 30%',
    backgroundColor: '#FFEBE6',
    borderRadius: '14px 0 0 14px',
  },
  belowAverageZone: {
    flex: '0 0 15%',
    backgroundColor: '#FFF7ED',
  },
  averageZone: {
    flex: '0 0 10%',
    backgroundColor: '#F4F5F7',
  },
  goodZone: {
    flex: '0 0 15%',
    backgroundColor: '#E3FCEF',
  },
  excellentZone: {
    flex: '0 0 30%',
    backgroundColor: '#E3FCEF',
    borderRadius: '0 14px 14px 0',
  },
  comparisonDot: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(66, 82, 110, 0.4)',
    border: '1.5px solid rgba(255, 255, 255, 0.9)',
    zIndex: 1,
    cursor: 'pointer',
  },
  currentMarker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    cursor: 'pointer',
  },
  currentMarkerPin: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#172B4D',
    border: '3px solid #FFFFFF',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  },
  scaleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    padding: '0 2px',
  },
  scaleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scaleSectionCenter: {
    textAlign: 'center',
  },
  scaleSectionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scaleValue: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
  },
  scaleLabel: {
    fontSize: '10px',
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inlineLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#6B778C',
  },
  yourTeamDot: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#172B4D',
    border: '2px solid #FFFFFF',
    boxShadow: '0 0 0 1px #DFE1E6',
  },
  otherTeamDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(66, 82, 110, 0.4)',
    border: '1px solid rgba(107, 119, 140, 0.3)',
  },
};

export default RiskSpectrum;
