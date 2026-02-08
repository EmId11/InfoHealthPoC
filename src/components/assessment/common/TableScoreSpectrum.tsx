import React, { useState } from 'react';
import { INDICATOR_TIERS, getIndicatorTier } from '../../../types/indicatorTiers';

interface OtherTeamData {
  name: string;
  score: number;
}

interface TableScoreSpectrumProps {
  score: number; // 0-100
  teamName?: string; // Name of the current team
  otherTeamScores?: number[]; // Other teams' scores for the scattered dots (legacy)
  otherTeams?: OtherTeamData[]; // Other teams with names and scores
  leftLabel?: string; // Description for left (low) end
  rightLabel?: string; // Description for right (high) end
  width?: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  teamName: string;
  score: number;
}

/**
 * Score spectrum for table cells showing full 5-tier gradient.
 * Labels appear on the sides of the spectrum bar.
 */
const TableScoreSpectrum: React.FC<TableScoreSpectrumProps> = ({
  score,
  teamName = 'Your Team',
  otherTeamScores = [],
  otherTeams,
  leftLabel,
  rightLabel,
  width = 280,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    teamName: '',
    score: 0,
  });

  const barHeight = 8;
  const markerSize = 14;
  const dotsAreaHeight = 20;
  const labelWidth = 90;
  const spectrumWidth = width - (labelWidth * 2) - 16; // 16px gap
  const clampedScore = Math.max(0, Math.min(100, score));

  // Get marker color based on tier
  const tier = getIndicatorTier(clampedScore);
  const markerColor = tier.color;

  // Build 5-tier gradient: left=bad (red), right=good (green)
  // Tiers: Needs Attention (0-25%), Below Average (26-50%), Average (51-75%), Good (76-90%), Excellent (91-100%)
  const gradient = `linear-gradient(to right,
    ${INDICATOR_TIERS[0].bgColor} 0%,
    ${INDICATOR_TIERS[0].bgColor} 25%,
    ${INDICATOR_TIERS[1].bgColor} 25%,
    ${INDICATOR_TIERS[1].bgColor} 50%,
    ${INDICATOR_TIERS[2].bgColor} 50%,
    ${INDICATOR_TIERS[2].bgColor} 75%,
    ${INDICATOR_TIERS[3].bgColor} 75%,
    ${INDICATOR_TIERS[3].bgColor} 90%,
    ${INDICATOR_TIERS[4].bgColor} 90%,
    ${INDICATOR_TIERS[4].bgColor} 100%
  )`;

  // Generate scattered positions for other team dots
  // Use otherTeams if provided, otherwise fall back to otherTeamScores with generated names
  const getScatteredDots = () => {
    if (otherTeams && otherTeams.length > 0) {
      return otherTeams.map((team, idx) => {
        const x = team.score;
        const seed = (team.score * 7 + idx * 13) % 100;
        const y = 2 + (seed % 16);
        return { x, y, key: idx, name: team.name, score: team.score };
      });
    }

    // Legacy mode: generate team names
    return otherTeamScores.map((teamScore, idx) => {
      const x = teamScore;
      const seed = (teamScore * 7 + idx * 13) % 100;
      const y = 2 + (seed % 16);
      return { x, y, key: idx, name: `Team ${idx + 1}`, score: teamScore };
    });
  };

  const scatteredDots = getScatteredDots();
  // Zone boundaries for 5-tier system
  const zoneBoundaries = [25, 50, 75, 90];

  const handleDotMouseEnter = (
    e: React.MouseEvent,
    dotTeamName: string,
    dotScore: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      teamName: dotTeamName,
      score: dotScore,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div style={{ width, display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#172B4D',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.teamName}</div>
          <div style={{ color: '#B3BAC5' }}>Score: {Math.round(tooltip.score)}</div>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -6,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #172B4D',
            }}
          />
        </div>
      )}

      {/* Left label - shows bad state (rightLabel from data) */}
      <div style={{ width: labelWidth, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 9,
            color: INDICATOR_TIERS[0].color,
            lineHeight: 1.3,
            display: 'block',
            textAlign: 'left',
          }}
        >
          {rightLabel}
        </span>
      </div>

      {/* Spectrum */}
      <div style={{ width: spectrumWidth, flexShrink: 0 }}>
        {/* Scattered dots area */}
        <div style={{ height: dotsAreaHeight, position: 'relative' }}>
          {scatteredDots.map(dot => (
            <div
              key={dot.key}
              style={{
                position: 'absolute',
                left: `${dot.x}%`,
                top: dot.y,
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: 'rgba(107, 119, 140, 0.35)',
                transform: 'translateX(-50%)',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, background-color 0.1s ease',
              }}
              onMouseEnter={(e) => handleDotMouseEnter(e, dot.name, dot.score)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>

        {/* Gradient bar with marker */}
        <div style={{ position: 'relative', height: markerSize }}>
          {/* Background gradient bar */}
          <div
            style={{
              position: 'absolute',
              top: (markerSize - barHeight) / 2,
              left: 0,
              right: 0,
              height: barHeight,
              borderRadius: barHeight / 2,
              background: gradient,
            }}
          />

          {/* Zone boundary dividers */}
          {zoneBoundaries.map(pos => (
            <div
              key={pos}
              style={{
                position: 'absolute',
                top: (markerSize - barHeight) / 2,
                left: `${pos}%`,
                width: 1,
                height: barHeight,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
              }}
            />
          ))}

          {/* Endpoint circles - left=red (bad), right=green (good) */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: (markerSize - 8) / 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: INDICATOR_TIERS[0].bgColor,
              border: `1.5px solid ${INDICATOR_TIERS[0].color}`,
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: (markerSize - 8) / 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: INDICATOR_TIERS[4].bgColor,
              border: `1.5px solid ${INDICATOR_TIERS[4].color}`,
              transform: 'translateX(50%)',
            }}
          />

          {/* Your team marker - high score = right (good), low score = left (bad) */}
          <div
            style={{
              position: 'absolute',
              left: `${clampedScore}%`,
              top: 0,
              width: markerSize,
              height: markerSize,
              borderRadius: '50%',
              backgroundColor: markerColor,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transform: 'translateX(-50%)',
              zIndex: 2,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => handleDotMouseEnter(e, teamName, clampedScore)}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      </div>

      {/* Right label - shows good state (leftLabel from data) */}
      <div style={{ width: labelWidth, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 9,
            color: INDICATOR_TIERS[4].color,
            lineHeight: 1.3,
            display: 'block',
            textAlign: 'right',
          }}
        >
          {leftLabel}
        </span>
      </div>
    </div>
  );
};

export default TableScoreSpectrum;
