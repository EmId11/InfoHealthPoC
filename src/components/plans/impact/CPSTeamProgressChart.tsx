// CPSTeamProgressChart Component
// Slope chart showing all teams' progress from baseline (50) to current CPS
// Includes toggle between CPS View and API View

import React, { useState, useMemo } from 'react';
import {
  CPSResult,
  getCPSCategoryColor,
  formatCPS,
} from '../../../types/progressScore';
import { getCategoryConfig } from '../../../constants/progressScoreConfig';

type ViewMode = 'cps' | 'api';

interface CPSTeamProgressChartProps {
  teams: CPSResult[];
  yourTeamId?: string;
  onTeamClick?: (team: CPSResult) => void;
  showLegend?: boolean;
}

export const CPSTeamProgressChart: React.FC<CPSTeamProgressChartProps> = ({
  teams,
  yourTeamId,
  onTeamClick,
  showLegend = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cps');
  const [hoveredTeam, setHoveredTeam] = useState<CPSResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBaseline, setShowBaseline] = useState(true);

  // Find your team
  const yourTeam = useMemo(() =>
    teams.find(t => t.teamId === yourTeamId) || teams[0],
    [teams, yourTeamId]
  );

  // Get score based on view mode
  const getScore = (team: CPSResult): number => {
    return viewMode === 'cps' ? team.cps : team.api.scaled;
  };

  // Calculate chart dimensions
  const chartHeight = 280;
  const chartPadding = { top: 40, right: 100, bottom: 40, left: 60 };
  const effectiveHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  // Score to Y position (0-100 scale, inverted for SVG)
  const scoreToY = (score: number): number => {
    const clampedScore = Math.max(0, Math.min(100, score));
    return chartPadding.top + effectiveHeight * (1 - clampedScore / 100);
  };

  // Animation handler
  const handleAnimateClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowBaseline(true);

    setTimeout(() => {
      setShowBaseline(false);
      setTimeout(() => {
        setIsAnimating(false);
      }, 1200);
    }, 1500);
  };

  // Sort teams by current score for better visual
  const sortedTeams = useMemo(() =>
    [...teams].sort((a, b) => getScore(b) - getScore(a)),
    [teams, viewMode]
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>TEAM PROGRESS COMPARISON</h3>
          <p style={styles.subtitle}>
            See how all {teams.length} teams progressed from baseline
          </p>
        </div>

        <div style={styles.controls}>
          {/* View Mode Toggle */}
          <div style={styles.toggleGroup}>
            <button
              style={{
                ...styles.toggleButton,
                ...(viewMode === 'cps' ? styles.toggleButtonActive : {}),
              }}
              onClick={() => setViewMode('cps')}
            >
              CPS
            </button>
            <button
              style={{
                ...styles.toggleButton,
                ...(viewMode === 'api' ? styles.toggleButtonActive : {}),
              }}
              onClick={() => setViewMode('api')}
            >
              API
            </button>
          </div>

          {/* Animate Button */}
          <button
            onClick={handleAnimateClick}
            style={{
              ...styles.animateButton,
              opacity: isAnimating ? 0.7 : 1,
            }}
            disabled={isAnimating}
          >
            <span style={styles.playIcon}>{isAnimating ? '●' : '▶'}</span>
            {isAnimating ? 'Animating...' : 'Replay'}
          </button>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTeam && (
        <div style={styles.tooltip}>
          <div style={styles.tooltipTeamName}>{hoveredTeam.teamName}</div>
          <div style={styles.tooltipRow}>
            <span style={styles.tooltipLabel}>Baseline:</span>
            <span style={styles.tooltipValue}>50</span>
          </div>
          <div style={styles.tooltipRow}>
            <span style={styles.tooltipLabel}>{viewMode === 'cps' ? 'CPS' : 'API'}:</span>
            <span style={styles.tooltipValue}>{formatCPS(getScore(hoveredTeam))}</span>
          </div>
          <div style={{
            ...styles.tooltipChange,
            color: getScore(hoveredTeam) >= 50 ? '#006644' : '#DE350B',
          }}>
            {getScore(hoveredTeam) >= 50 ? '+' : ''}{(getScore(hoveredTeam) - 50).toFixed(1)} pts
          </div>
          <div style={styles.tooltipArrow} />
        </div>
      )}

      {/* Chart Area */}
      <div style={styles.chartWrapper}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 600 ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <rect
            x={chartPadding.left}
            y={chartPadding.top}
            width={600 - chartPadding.left - chartPadding.right}
            height={effectiveHeight}
            fill="#FAFBFC"
            rx={4}
          />

          {/* Category bands */}
          <CategoryBands
            chartPadding={chartPadding}
            effectiveHeight={effectiveHeight}
            scoreToY={scoreToY}
          />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(score => (
            <g key={score}>
              <line
                x1={chartPadding.left}
                y1={scoreToY(score)}
                x2={600 - chartPadding.right}
                y2={scoreToY(score)}
                stroke={score === 50 ? '#97A0AF' : '#EBECF0'}
                strokeWidth={score === 50 ? 2 : 1}
                strokeDasharray={score === 50 ? '0' : '4,4'}
              />
              <text
                x={chartPadding.left - 10}
                y={scoreToY(score)}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ fontSize: 11, fill: '#6B778C' }}
              >
                {score}
              </text>
            </g>
          ))}

          {/* Baseline label */}
          <text
            x={chartPadding.left + 8}
            y={scoreToY(50) - 8}
            style={{ fontSize: 10, fill: '#5E6C84', fontWeight: 500 }}
          >
            BASELINE
          </text>

          {/* Column labels */}
          <text
            x={chartPadding.left + 50}
            y={chartPadding.top - 12}
            textAnchor="middle"
            style={{ fontSize: 11, fill: '#5E6C84', fontWeight: 600 }}
          >
            Before
          </text>
          <text
            x={600 - chartPadding.right - 50}
            y={chartPadding.top - 12}
            textAnchor="middle"
            style={{ fontSize: 11, fill: '#5E6C84', fontWeight: 600 }}
          >
            After
          </text>

          {/* Team lines */}
          {sortedTeams.map((team, idx) => {
            const isYourTeam = team.teamId === yourTeamId || (idx === 0 && !yourTeamId);
            const isHovered = hoveredTeam?.teamId === team.teamId;
            const colors = getCPSCategoryColor(team.category);

            const x1 = chartPadding.left + 50;
            const x2 = 600 - chartPadding.right - 50;
            const y1 = scoreToY(50); // Always start at baseline
            const y2 = showBaseline ? scoreToY(50) : scoreToY(getScore(team));

            return (
              <g
                key={team.teamId}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredTeam(team)}
                onMouseLeave={() => setHoveredTeam(null)}
                onClick={() => onTeamClick?.(team)}
              >
                {/* Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isYourTeam ? '#0052CC' : colors.text}
                  strokeWidth={isYourTeam ? 3 : isHovered ? 2.5 : 1.5}
                  strokeOpacity={isYourTeam ? 1 : isHovered ? 0.9 : 0.4}
                  style={{
                    transition: showBaseline ? 'none' : 'all 0.8s ease-out',
                  }}
                />

                {/* Start dot */}
                <circle
                  cx={x1}
                  cy={y1}
                  r={isYourTeam ? 6 : isHovered ? 5 : 4}
                  fill={isYourTeam ? '#0052CC' : colors.text}
                  fillOpacity={isYourTeam ? 1 : isHovered ? 0.9 : 0.5}
                />

                {/* End dot */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={isYourTeam ? 6 : isHovered ? 5 : 4}
                  fill={isYourTeam ? '#0052CC' : colors.text}
                  fillOpacity={isYourTeam ? 1 : isHovered ? 0.9 : 0.5}
                  style={{
                    transition: showBaseline ? 'none' : 'all 0.8s ease-out',
                  }}
                />

                {/* Your team label */}
                {isYourTeam && !showBaseline && (
                  <>
                    <rect
                      x={x2 + 10}
                      y={y2 - 12}
                      width={60}
                      height={24}
                      rx={12}
                      fill="#0052CC"
                    />
                    <text
                      x={x2 + 40}
                      y={y2 + 1}
                      textAnchor="middle"
                      style={{ fontSize: 11, fill: '#FFFFFF', fontWeight: 600 }}
                    >
                      YOU
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={15}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${chartHeight / 2})`}
            style={{ fontSize: 11, fill: '#6B778C' }}
          >
            {viewMode === 'cps' ? 'CPS Score' : 'API Score'}
          </text>
        </svg>
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendLine, backgroundColor: '#0052CC' }} />
            <span style={styles.legendLabel}>Your Team</span>
          </div>
          <div style={styles.legendDivider} />
          <span style={styles.legendTitle}>Other teams by category:</span>
          {['strong-progress', 'moderate-progress', 'stable', 'moderate-decline', 'significant-decline'].map(cat => {
            const colors = getCPSCategoryColor(cat as any);
            const config = getCategoryConfig(cat as any);
            return (
              <div key={cat} style={styles.legendItem}>
                <div style={{ ...styles.legendLine, backgroundColor: colors.text, opacity: 0.6 }} />
                <span style={styles.legendLabel}>{config.shortLabel}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryValue}>
            {teams.filter(t => getScore(t) > 50).length}
          </span>
          <span style={styles.summaryLabel}>Teams improved</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryValue}>
            {teams.filter(t => getScore(t) >= 45 && getScore(t) <= 55).length}
          </span>
          <span style={styles.summaryLabel}>Teams stable</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryValue}>
            {teams.filter(t => getScore(t) < 45).length}
          </span>
          <span style={styles.summaryLabel}>Teams declined</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={{
            ...styles.summaryValue,
            color: (getScore(yourTeam) - 50) >= 0 ? '#006644' : '#DE350B',
          }}>
            {(getScore(yourTeam) - 50) >= 0 ? '+' : ''}{(getScore(yourTeam) - 50).toFixed(1)}
          </span>
          <span style={styles.summaryLabel}>Your change</span>
        </div>
      </div>
    </div>
  );
};

// Category background bands
const CategoryBands: React.FC<{
  chartPadding: { top: number; right: number; bottom: number; left: number };
  effectiveHeight: number;
  scoreToY: (score: number) => number;
}> = ({ chartPadding, effectiveHeight, scoreToY }) => {
  const bands = [
    { min: 70, max: 100, color: '#E3FCEF' },
    { min: 55, max: 70, color: '#E8FCF2' },
    { min: 45, max: 55, color: '#F7F8F9' },
    { min: 30, max: 45, color: '#FFF7E6' },
    { min: 0, max: 30, color: '#FFEBE6' },
  ];

  return (
    <g>
      {bands.map(band => (
        <rect
          key={band.min}
          x={chartPadding.left}
          y={scoreToY(band.max)}
          width={600 - chartPadding.left - chartPadding.right}
          height={scoreToY(band.min) - scoreToY(band.max)}
          fill={band.color}
          opacity={0.5}
        />
      ))}
    </g>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: {},
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B778C',
    margin: 0,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  toggleGroup: {
    display: 'flex',
    backgroundColor: '#F4F5F7',
    borderRadius: 6,
    padding: 3,
  },
  toggleButton: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    color: '#0052CC',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  animateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    backgroundColor: '#DEEBFF',
    border: '1px solid #B3D4FF',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
  },
  playIcon: {
    fontSize: 10,
  },
  tooltip: {
    position: 'absolute',
    top: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 12,
    zIndex: 100,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
    minWidth: 160,
  },
  tooltipTeamName: {
    fontWeight: 600,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
  tooltipRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipLabel: {
    color: '#B3BAC5',
  },
  tooltipValue: {
    fontWeight: 600,
  },
  tooltipChange: {
    fontWeight: 700,
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
  tooltipArrow: {
    position: 'absolute',
    left: '50%',
    bottom: -6,
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #172B4D',
  },
  chartWrapper: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: '12px 16px',
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
  },
  legendLabel: {
    fontSize: 11,
    color: '#5E6C84',
  },
  legendTitle: {
    fontSize: 11,
    color: '#6B778C',
    fontWeight: 500,
  },
  legendDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#DFE1E6',
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  summaryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    border: '1px solid #EBECF0',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#172B4D',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B778C',
    marginTop: 4,
  },
};

export default CPSTeamProgressChart;
