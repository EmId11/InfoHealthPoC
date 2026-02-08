import React, { useState } from 'react';
import { DimensionResult, RiskLevel } from '../../../types/assessment';
import { ThemeGroup, calculateClusterPercentile } from '../../../constants/themeGroups';
import { getClusterDescription, getDimensionDescription } from '../../../constants/clusterDescriptions';
import { getMaturityLevelConfig } from '../../../types/maturity';
import ClusterMaturityBar from './ClusterMaturityBar';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import InfoIcon from '@atlaskit/icon/glyph/info';
import { getDimensionIcon } from '../../../constants/dimensionIcons';

interface ThemeSectionProps {
  theme: ThemeGroup;
  dimensions: DimensionResult[];
  allDimensions: DimensionResult[];
  sectionNumber: number;
  onViewDetails: (dimensionIndex: number) => void;
}

// Helper functions
const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'high': return '#DE350B';
    case 'moderate': return '#FF8B00';
    case 'low': return '#36B37E';
  }
};

const getRiskBadgeText = (level: RiskLevel) => {
  switch (level) {
    case 'high': return 'High';
    case 'moderate': return 'Moderate';
    case 'low': return 'Low';
  }
};

// Risk-focused questions - uses centralized descriptions with fallback
// Exported for use in other components
export const getDimensionQuestion = (dimensionKey: string): string => {
  const description = getDimensionDescription(dimensionKey);
  if (description) {
    return description.headline;
  }
  // Fallback for any unmapped dimensions
  return 'What\'s the risk of process issues?';
};

// Why it matters - uses centralized descriptions with fallback
const getWhyItMatters = (dimensionKey: string): string => {
  const description = getDimensionDescription(dimensionKey);
  if (description) {
    return description.summary;
  }
  // Fallback for any unmapped dimensions
  return 'Process issues impact team effectiveness.';
};

const getTrendInfo = (trend: string) => {
  switch (trend) {
    case 'improving': return { arrow: '↑', color: '#36B37E', bg: '#E3FCEF' };
    case 'declining': return { arrow: '↓', color: '#DE350B', bg: '#FFEBE6' };
    default: return { arrow: '→', color: '#6B778C', bg: '#F4F5F7' };
  }
};

const ThemeSection: React.FC<ThemeSectionProps> = ({
  theme,
  dimensions,
  allDimensions,
  sectionNumber,
  onViewDetails,
}) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const clusterDesc = getClusterDescription(theme.id);
  const clusterPercentile = calculateClusterPercentile(theme, dimensions);
  const maturityConfig = getMaturityLevelConfig(clusterPercentile);

  const getDimensionIndex = (dimension: DimensionResult): number => {
    return allDimensions.findIndex(d => d.dimensionKey === dimension.dimensionKey);
  };

  const headerStyle: React.CSSProperties = {
    ...styles.header,
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #E4E6EB',
  };

  const accentStyle = {
    ...styles.headerAccent,
    backgroundColor: maturityConfig.color,
  };

  const themeNameStyle = {
    ...styles.themeName,
    color: '#172B4D',
  };

  return (
    <div style={styles.section}>
      <div style={styles.container}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={accentStyle} />
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div style={styles.sectionNumber}>
                {sectionNumber}
              </div>
              <div style={styles.headerText}>
                <div style={styles.headerTitleRow}>
                  <h3 style={themeNameStyle}>{theme.name}</h3>
                  <div style={styles.infoButtonWrapper}>
                    <button
                      style={styles.infoButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInfoPopover(!showInfoPopover);
                      }}
                      aria-label="Learn more about this cluster"
                    >
                      <InfoIcon label="" size="small" primaryColor="#6B778C" />
                    </button>
                    {showInfoPopover && clusterDesc && (
                      <div style={styles.infoPopover}>
                        <div style={styles.infoPopoverHeader}>
                          <span style={styles.infoPopoverTitle}>{clusterDesc.name}</span>
                          <button
                            style={styles.infoPopoverClose}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInfoPopover(false);
                            }}
                          >
                            ×
                          </button>
                        </div>
                        <div style={styles.infoPopoverContent}>
                          <div style={styles.infoSection}>
                            <strong style={styles.infoSectionLabel}>What we measure:</strong>
                            <p style={styles.infoSectionText}>{clusterDesc.whatWeMeasure}</p>
                          </div>
                          <div style={styles.infoSection}>
                            <strong style={styles.infoSectionLabel}>Why it matters:</strong>
                            <p style={styles.infoSectionText}>{clusterDesc.whyItMatters}</p>
                          </div>
                          <div style={styles.infoSection}>
                            <strong style={styles.infoSectionLabel}>What you can do:</strong>
                            <p style={styles.infoSectionText}>{clusterDesc.whatYouCanDo}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p style={styles.themeQuestion}>{theme.question}</p>
                {clusterDesc && (
                  <p style={styles.themeSummary}>{clusterDesc.summary}</p>
                )}
              </div>
            </div>
            <div style={styles.headerRight}>
              <ClusterMaturityBar
                percentile={clusterPercentile}
                clusterKey={theme.id}
                dimensionNames={dimensions.map(d => d.dimensionName)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, width: '26%' }}>
                  <span style={styles.thLabel}>Dimension</span>
                  <span style={styles.thDesc}> (the risk question)</span>
                </th>
                <th style={{ ...styles.th, width: '13%' }}>
                  <span style={styles.thLabel}>Risk</span>
                  <span style={styles.thDesc}> (High, Moderate, Low)</span>
                </th>
                <th style={{ ...styles.th, width: '24%' }}>
                  <span style={styles.thLabel}>Why it matters</span>
                  <span style={styles.thDesc}> (impact if risk materializes)</span>
                </th>
                <th style={{ ...styles.th, width: '22%' }}>
                  <span style={styles.thLabel}>Ranking</span>
                  <span style={styles.thDesc}> (vs. similar teams)</span>
                </th>
                <th style={{ ...styles.th, width: '10%' }}>
                  <span style={styles.thLabel}>Trend</span>
                  <span style={styles.thDesc}> (↑↓→)</span>
                </th>
                <th style={{ ...styles.th, width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dimension) => {
                const score = dimension.healthScore ?? dimension.overallPercentile;
                const teamsAhead = Math.round((100 - score) / 100 * 47);
                const yourRank = teamsAhead + 1;
                const spectrumPosition = 100 - score;
                const trendInfo = getTrendInfo(dimension.trend);
                const riskColor = getRiskColor(dimension.riskLevel);

                return (
                  <tr
                    key={dimension.dimensionKey}
                    style={styles.tableRow}
                    onClick={() => onViewDetails(getDimensionIndex(dimension))}
                  >
                    {/* Dimension - Name + Risk Question */}
                    <td style={{ ...styles.td, ...styles.tdFirst }}>
                      <div style={styles.dimensionCell}>
                        <div style={styles.dimensionIcon}>
                          {getDimensionIcon(dimension.dimensionKey, 'small', riskColor)}
                        </div>
                        <div style={styles.dimensionInfo}>
                          <span style={styles.dimensionName}>{dimension.dimensionName}</span>
                          <span style={styles.dimensionDesc}>
                            {getDimensionQuestion(dimension.dimensionKey)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Risk Designation */}
                    <td style={styles.td}>
                      <span style={{ ...styles.riskBadge, backgroundColor: riskColor }}>
                        {getRiskBadgeText(dimension.riskLevel)}
                      </span>
                    </td>

                    {/* Why it matters */}
                    <td style={styles.td}>
                      <span style={styles.whyItMatters}>
                        {getWhyItMatters(dimension.dimensionKey)}
                      </span>
                    </td>

                    {/* Ranking & Spectrum */}
                    <td style={styles.td}>
                      <div style={styles.rankingSpectrumCell}>
                        <div style={styles.rankCell}>
                          <span style={{ ...styles.rankValue, color: riskColor }}>
                            {yourRank}<sup style={styles.rankSup}>th</sup>
                          </span>
                          <span style={styles.rankContext}>of 48 teams</span>
                        </div>
                        <div style={styles.spectrumBar}>
                          <div style={styles.spectrumGood} />
                          <div style={styles.spectrumMid} />
                          <div style={styles.spectrumBad} />
                          <div style={{ ...styles.spectrumMarker, left: `${spectrumPosition}%` }}>
                            <div style={styles.spectrumPin} />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Trend */}
                    <td style={styles.td}>
                      <span style={{ ...styles.trendBadge, backgroundColor: trendInfo.bg, color: trendInfo.color }}>
                        {trendInfo.arrow}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ ...styles.td, ...styles.tdLast }}>
                      <div style={styles.actionCell}>
                        <ChevronRightIcon label="" size="medium" primaryColor="#0052CC" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  section: {
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: '1px solid #E4E6EB',
    borderRadius: '12px 12px 0 0',
    position: 'relative',
    zIndex: 10,
  },
  headerAccent: {
    width: '4px',
    backgroundColor: '#0052CC',
    flexShrink: 0,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '16px 20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  themeName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  themeQuestion: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    fontWeight: 400,
  },
  themeSummary: {
    margin: '6px 0 0 0',
    fontSize: '13px',
    color: '#5E6C84',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  infoButtonWrapper: {
    position: 'relative',
  },
  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: '#E4E6EB',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  infoPopover: {
    position: 'absolute',
    top: '100%',
    left: '0',
    marginTop: '8px',
    width: '400px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
    zIndex: 1000,
  },
  infoPopoverHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderBottom: '1px solid #E4E6EB',
  },
  infoPopoverTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  infoPopoverClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6B778C',
    lineHeight: 1,
  },
  infoPopoverContent: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoSectionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoSectionText: {
    margin: 0,
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  concernBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#DE350B',
    color: '#FFFFFF',
  },
  healthyBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#36B37E',
    color: '#FFFFFF',
  },
  // Table styles
  tableWrapper: {
    padding: '16px 20px 20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  tableHeaderRow: {
    backgroundColor: '#F4F5F7',
  },
  th: {
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
    verticalAlign: 'top',
    borderBottom: '2px solid #DFE1E6',
  },
  thLabel: {
    fontWeight: 600,
  },
  thDesc: {
    fontWeight: 400,
    color: '#8993A4',
    textTransform: 'none',
    letterSpacing: '0',
  },
  tableRow: {
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
    borderBottom: '1px solid #E4E6EB',
  },
  tdFirst: {
  },
  tdLast: {
  },
  // Dimension cell
  dimensionCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  dimensionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginTop: '2px',
  },
  dimensionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
    flex: 1,
  },
  dimensionName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionDesc: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.3,
  },
  whyItMatters: {
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  riskBadge: {
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
  },
  // Ranking & Spectrum combined cell
  rankingSpectrumCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  // Spectrum
  spectrumBar: {
    position: 'relative',
    width: '100%',
    maxWidth: '120px',
    height: '6px',
    borderRadius: '3px',
    display: 'flex',
    overflow: 'visible',
  },
  spectrumGood: {
    flex: 1,
    background: 'linear-gradient(90deg, #36B37E 0%, #79F2C0 100%)',
    borderRadius: '3px 0 0 3px',
  },
  spectrumMid: {
    flex: 1,
    background: 'linear-gradient(90deg, #FFE380 0%, #FFAB00 100%)',
  },
  spectrumBad: {
    flex: 1,
    background: 'linear-gradient(90deg, #FF8F73 0%, #DE350B 100%)',
    borderRadius: '0 3px 3px 0',
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
    border: '2px solid #FFFFFF',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  // Rank cell
  rankCell: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  rankValue: {
    fontSize: '16px',
    fontWeight: 700,
  },
  rankSup: {
    fontSize: '10px',
    fontWeight: 600,
  },
  rankContext: {
    fontSize: '11px',
    color: '#6B778C',
  },
  // Trend badge
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontSize: '16px',
    fontWeight: 700,
  },
  // Action cell
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default ThemeSection;
