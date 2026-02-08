import React, { useState } from 'react';
import type { TeamDimensionMatrix } from '../../../types/multiTeamAssessment';
import type { MaturityLevel } from '../../../types/maturity';
import { getMaturityLevelConfig } from '../../../types/maturity';

interface TeamComparisonMatrixProps {
  matrix: TeamDimensionMatrix;
  onTeamClick: (teamId: string) => void;
  onDimensionClick: (dimensionKey: string) => void;
}

const TeamComparisonMatrix: React.FC<TeamComparisonMatrixProps> = ({
  matrix,
  onTeamClick,
  onDimensionClick,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ teamIndex: number; dimIndex: number } | null>(null);

  // Get color for a maturity level
  const getCellColor = (level: MaturityLevel): string => {
    const config = getMaturityLevelConfig((level - 1) * 25 + 10); // Convert level to approximate percentile
    return config.backgroundColor;
  };

  const getCellTextColor = (level: MaturityLevel): string => {
    const config = getMaturityLevelConfig((level - 1) * 25 + 10);
    return config.color;
  };

  if (matrix.teamIds.length === 0 || matrix.dimensionKeys.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span>No comparison data available</span>
      </div>
    );
  }

  // Truncate team names for display
  const truncateName = (name: string, maxLength: number = 16): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + '...';
  };

  // Get dimension short name (first 2 words)
  const getShortDimensionName = (name: string): string => {
    const words = name.split(' ');
    if (words.length <= 2) return name;
    return words.slice(0, 2).join(' ');
  };

  return (
    <div style={styles.container}>
      {/* Legend */}
      <div style={styles.legend}>
        <span style={styles.legendLabel}>Performance Level:</span>
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} style={styles.legendItem}>
            <span
              style={{
                ...styles.legendCell,
                backgroundColor: getCellColor(level as MaturityLevel),
                color: getCellTextColor(level as MaturityLevel),
              }}
            >
              {level}
            </span>
            <span style={styles.legendText}>
              {level === 1 && 'Attention'}
              {level === 2 && 'Below Avg'}
              {level === 3 && 'Average'}
              {level === 4 && 'Good'}
              {level === 5 && 'Excellent'}
            </span>
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div style={styles.matrixWrapper}>
        <div style={styles.matrixContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.cornerCell}>Team / Dimension</th>
                {matrix.dimensionNames.map((name, index) => (
                  <th
                    key={matrix.dimensionKeys[index]}
                    style={styles.dimensionHeader}
                    onClick={() => onDimensionClick(matrix.dimensionKeys[index])}
                    title={name}
                  >
                    <span style={styles.dimensionName}>
                      {getShortDimensionName(name)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.teamNames.map((teamName, teamIndex) => (
                <tr key={matrix.teamIds[teamIndex]}>
                  <td
                    style={styles.teamCell}
                    onClick={() => onTeamClick(matrix.teamIds[teamIndex])}
                    title={teamName}
                  >
                    {truncateName(teamName)}
                  </td>
                  {matrix.dimensionKeys.map((dimKey, dimIndex) => {
                    const value = matrix.values[teamIndex][dimIndex];
                    const level = matrix.maturityLevels[teamIndex][dimIndex];
                    const isHovered =
                      hoveredCell?.teamIndex === teamIndex &&
                      hoveredCell?.dimIndex === dimIndex;

                    return (
                      <td
                        key={dimKey}
                        style={{
                          ...styles.cell,
                          backgroundColor: getCellColor(level),
                          ...(isHovered ? styles.cellHovered : {}),
                        }}
                        onMouseEnter={() =>
                          setHoveredCell({ teamIndex, dimIndex })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => onTeamClick(matrix.teamIds[teamIndex])}
                        title={`${teamName}: ${matrix.dimensionNames[dimIndex]} - ${value}%`}
                      >
                        <span
                          style={{
                            ...styles.cellValue,
                            color: getCellTextColor(level),
                          }}
                        >
                          {Math.round(value)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div style={styles.tooltipInfo}>
          <strong>{matrix.teamNames[hoveredCell.teamIndex]}</strong>
          <span> - </span>
          <span>{matrix.dimensionNames[hoveredCell.dimIndex]}</span>
          <span>: </span>
          <strong>{matrix.values[hoveredCell.teamIndex][hoveredCell.dimIndex]}%</strong>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  legendLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendCell: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  legendText: {
    fontSize: '11px',
    color: '#6B778C',
  },
  matrixWrapper: {
    overflow: 'auto',
    maxHeight: '500px',
  },
  matrixContainer: {
    minWidth: 'max-content',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
  },
  cornerCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5E6C84',
    backgroundColor: '#F4F5F7',
    position: 'sticky',
    left: 0,
    top: 0,
    zIndex: 3,
    borderBottom: '1px solid #DFE1E6',
    borderRight: '1px solid #DFE1E6',
    minWidth: '140px',
  },
  dimensionHeader: {
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: '10px',
    fontWeight: 600,
    color: '#5E6C84',
    backgroundColor: '#F4F5F7',
    borderBottom: '1px solid #DFE1E6',
    borderRight: '1px solid #F4F5F7',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    cursor: 'pointer',
    minWidth: '70px',
    maxWidth: '100px',
    verticalAlign: 'bottom',
    transition: 'background-color 0.15s ease',
  },
  dimensionName: {
    display: 'block',
    writingMode: 'horizontal-tb',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  },
  teamCell: {
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    backgroundColor: '#FAFBFC',
    position: 'sticky',
    left: 0,
    zIndex: 1,
    borderBottom: '1px solid #F4F5F7',
    borderRight: '1px solid #DFE1E6',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s ease',
  },
  cell: {
    padding: '8px',
    textAlign: 'center',
    borderBottom: '1px solid #F4F5F7',
    borderRight: '1px solid #F4F5F7',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    minWidth: '48px',
  },
  cellHovered: {
    transform: 'scale(1.1)',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.2)',
    zIndex: 1,
    position: 'relative',
  },
  cellValue: {
    fontSize: '12px',
    fontWeight: 600,
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
    color: '#6B778C',
    fontSize: '14px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  tooltipInfo: {
    marginTop: '12px',
    padding: '8px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    textAlign: 'center',
  },
};

export default TeamComparisonMatrix;
