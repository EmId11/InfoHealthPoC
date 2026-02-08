// CompletionRing - SVG progress ring component for the Portfolio Overview
// Shows a circular progress indicator with percentage in the center

import React from 'react';

interface CompletionRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
}

const CompletionRing: React.FC<CompletionRingProps> = ({
  percentage,
  size = 100,
  strokeWidth = 10,
  showLabel = true,
  label = 'complete',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on progress
  const getProgressColor = () => {
    if (percentage >= 100) return '#36B37E'; // Green when complete
    if (percentage >= 50) return '#00875A'; // Dark green for good progress
    if (percentage >= 25) return '#0052CC'; // Blue for some progress
    return '#5243AA'; // Purple for starting
  };

  return (
    <div style={{ ...styles.container, width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={styles.svg}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EBECF0"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={styles.progressCircle}
        />
      </svg>
      {showLabel && (
        <div style={styles.textContainer}>
          <span style={styles.percentage}>{percentage}%</span>
          {label && <span style={styles.label}>{label}</span>}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressCircle: {
    transition: 'stroke-dashoffset 0.5s ease',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  percentage: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  label: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '2px',
  },
};

export default CompletionRing;
