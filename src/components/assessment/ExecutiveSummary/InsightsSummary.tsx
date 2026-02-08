import React, { useState } from 'react';
import { ExecutiveSummaryData, ThemeSummary, RiskLevel, TrendDirection } from '../../../types/assessment';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import ArrowDownIcon from '@atlaskit/icon/glyph/arrow-down';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';

interface InsightsSummaryProps {
  data: ExecutiveSummaryData;
  onThemeClick: (themeId: string) => void;
  onDimensionClick?: (dimensionKey: string) => void;
  showInsights?: boolean;
  showThemes?: boolean;
}

const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'high': return '#DE350B';
    case 'moderate': return '#FF8B00';
    case 'low': return '#36B37E';
  }
};

const getRiskBg = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'high': return '#FFEBE6';
    case 'moderate': return '#FFF7E6';
    case 'low': return '#E3FCEF';
  }
};

const getTrendIcon = (trend: TrendDirection, size: 'small' | 'medium' = 'small') => {
  switch (trend) {
    case 'improving':
      return <ArrowUpIcon label="" size={size} primaryColor="#36B37E" />;
    case 'declining':
      return <ArrowDownIcon label="" size={size} primaryColor="#DE350B" />;
    default:
      return <MediaServicesActualSizeIcon label="" size={size} primaryColor="#6B778C" />;
  }
};

const getClusterRisk = (theme: ThemeSummary): RiskLevel => {
  const hasHigh = theme.dimensions.some(d => d.riskLevel === 'high');
  const hasModerate = theme.dimensions.some(d => d.riskLevel === 'moderate');
  if (hasHigh) return 'high';
  if (hasModerate) return 'moderate';
  return 'low';
};

const InsightsSummary: React.FC<InsightsSummaryProps> = ({
  data,
  onThemeClick,
  onDimensionClick,
  showInsights = true,
  showThemes = true,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Get max dimensions across all themes for column count
  const maxDimensions = Math.max(...data.themeSummaries.map(t => t.dimensions.length));

  return (
    <div style={styles.container}>
      {/* Table */}
      {showThemes && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thTheme}>Assessment Area</th>
                <th style={{ ...styles.th, textAlign: 'center' }} colSpan={maxDimensions}>
                  Dimensions
                </th>
                <th style={styles.thAction}></th>
              </tr>
            </thead>
            <tbody>
              {data.themeSummaries.map((theme) => {
                const isHovered = hoveredRow === theme.themeId;
                const clusterRisk = getClusterRisk(theme);

                return (
                  <tr
                    key={theme.themeId}
                    style={{
                      ...styles.row,
                      ...(isHovered ? styles.rowHovered : {}),
                    }}
                    onMouseEnter={() => setHoveredRow(theme.themeId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onThemeClick(theme.themeId)}
                  >
                    {/* Theme Name Cell */}
                    <td style={styles.tdTheme}>
                      <div style={styles.themeCell}>
                        <div style={{ ...styles.riskBar, backgroundColor: getRiskColor(clusterRisk) }} />
                        <div style={styles.themeInfo}>
                          <span style={styles.themeName}>{theme.themeName}</span>
                          <span style={styles.themeQuestion}>{theme.themeQuestion}</span>
                        </div>
                      </div>
                    </td>

                    {/* Dimension Cells */}
                    {theme.dimensions.map((dim) => (
                      <td
                        key={dim.dimensionKey}
                        style={styles.tdDim}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDimensionClick?.(dim.dimensionKey);
                        }}
                      >
                        <div style={{
                          ...styles.dimCell,
                          backgroundColor: getRiskBg(dim.riskLevel),
                        }}>
                          <span style={styles.dimName}>{dim.dimensionName}</span>
                          <div style={styles.dimIndicators}>
                            <span style={{
                              ...styles.dimRisk,
                              color: getRiskColor(dim.riskLevel),
                            }}>
                              {dim.riskLevel === 'high' ? 'High' : dim.riskLevel === 'moderate' ? 'Med' : 'Low'}
                            </span>
                            {getTrendIcon(dim.trend)}
                          </div>
                        </div>
                      </td>
                    ))}

                    {/* Empty cells if fewer dimensions */}
                    {Array.from({ length: maxDimensions - theme.dimensions.length }).map((_, i) => (
                      <td key={`empty-${i}`} style={styles.tdDim}></td>
                    ))}

                    {/* Action Cell */}
                    <td style={styles.tdAction}>
                      <div style={{
                        ...styles.actionIcon,
                        opacity: isHovered ? 1 : 0.4,
                      }}>
                        <ChevronRightIcon label="" primaryColor={isHovered ? '#0052CC' : '#6B778C'} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Table
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },

  // Header
  th: {
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
    borderBottom: '1px solid #E4E6EB',
  },
  thTheme: {
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
    borderBottom: '1px solid #E4E6EB',
    width: '220px',
    minWidth: '220px',
  },
  thAction: {
    width: '40px',
    borderBottom: '1px solid #E4E6EB',
  },

  // Row
  row: {
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  rowHovered: {
    backgroundColor: '#FAFBFC',
  },

  // Theme Cell
  tdTheme: {
    padding: '0 8px 0 0',
    verticalAlign: 'middle',
  },
  themeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    height: '70px',
  },
  riskBar: {
    width: '4px',
    height: '100%',
    borderRadius: '2px',
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  themeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1,
  },
  themeName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.2,
  },
  themeQuestion: {
    fontSize: '11px',
    color: '#6B778C',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  // Dimension Cell
  tdDim: {
    padding: '0 4px',
    verticalAlign: 'middle',
  },
  dimCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px',
    borderRadius: '8px',
    minWidth: '90px',
    height: '70px',
  },
  dimName: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#172B4D',
    textAlign: 'center',
    lineHeight: 1.2,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    maxHeight: '26px',
  },
  dimIndicators: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dimRisk: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },

  // Action Cell
  tdAction: {
    padding: '0',
    verticalAlign: 'middle',
  },
  actionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.15s ease',
  },
};

export default InsightsSummary;
