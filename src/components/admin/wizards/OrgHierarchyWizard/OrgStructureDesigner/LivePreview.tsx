import React from 'react';
import { OrgHierarchyLevel } from '../../../../../types/admin';
import { LEVEL_COLORS, getSampleDataForLevel } from './constants';

interface LivePreviewProps {
  levels: OrgHierarchyLevel[];
  isFlat: boolean;
}

const LivePreview: React.FC<LivePreviewProps> = ({ levels, isFlat }) => {
  // Sort levels by order
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);

  // Build sample breadcrumb path
  const getBreadcrumbPath = (): string[] => {
    if (isFlat) return ['Alpha Team'];

    const path: string[] = [];
    sortedLevels.forEach((level, index) => {
      const sampleData = getSampleDataForLevel(index);
      path.push(sampleData[0] || level.name);
    });
    path.push('Alpha Team');
    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();

  if (isFlat) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h4 style={styles.title}>Preview</h4>
          <span style={styles.badge}>Flat Structure</span>
        </div>
        <div style={styles.previewArea}>
          <div style={styles.flatPreview}>
            <div style={styles.flatRow}>
              {['Alpha Team', 'Beta Team', 'Gamma Team', 'Delta Team'].map((team) => (
                <div key={team} style={styles.teamNode}>
                  <div style={{ ...styles.nodeBox, backgroundColor: '#E3FCEF', borderColor: LEVEL_COLORS.green }}>
                    <span style={styles.nodeText}>{team}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLabel}>Path:</span>
            <span style={styles.breadcrumbPath}>Alpha Team</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Preview</h4>
        <span style={styles.badge}>
          {sortedLevels.length} level{sortedLevels.length !== 1 ? 's' : ''} + Teams
        </span>
      </div>
      <div style={styles.previewArea}>
        <div style={styles.treePreview}>
          {/* Render each level */}
          {sortedLevels.map((level, levelIndex) => {
            const sampleData = getSampleDataForLevel(levelIndex);
            // Show fewer nodes at lower levels for visual hierarchy
            const nodesToShow = Math.max(1, 3 - levelIndex);
            const displayNodes = sampleData.slice(0, nodesToShow);

            return (
              <React.Fragment key={level.id}>
                <div style={styles.levelRow}>
                  <div style={styles.levelLabel}>
                    <div
                      style={{
                        ...styles.levelDot,
                        backgroundColor: level.color,
                      }}
                    />
                    <span style={styles.levelName}>{level.name}</span>
                  </div>
                  <div style={styles.nodesRow}>
                    {displayNodes.map((nodeName, nodeIndex) => (
                      <div
                        key={nodeIndex}
                        style={{
                          ...styles.nodeBox,
                          backgroundColor: hexToRgba(level.color, 0.1),
                          borderColor: level.color,
                        }}
                      >
                        <span style={{ ...styles.nodeText, color: level.color }}>
                          {nodeName}
                        </span>
                      </div>
                    ))}
                    {nodesToShow < sampleData.length && (
                      <span style={styles.moreIndicator}>+{sampleData.length - nodesToShow} more</span>
                    )}
                  </div>
                </div>
                {/* Connector to next level */}
                <div style={styles.connector}>
                  <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                    <path
                      d="M12 0v20M6 14l6 6 6-6"
                      stroke={levelIndex < sortedLevels.length - 1 ? sortedLevels[levelIndex + 1].color : LEVEL_COLORS.green}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </React.Fragment>
            );
          })}

          {/* Teams level (always at bottom) */}
          <div style={styles.levelRow}>
            <div style={styles.levelLabel}>
              <div
                style={{
                  ...styles.levelDot,
                  backgroundColor: LEVEL_COLORS.green,
                }}
              />
              <span style={styles.levelName}>Teams</span>
            </div>
            <div style={styles.nodesRow}>
              {['Alpha Team', 'Beta Team'].map((team, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.nodeBox,
                    backgroundColor: '#E3FCEF',
                    borderColor: LEVEL_COLORS.green,
                  }}
                >
                  <span style={{ ...styles.nodeText, color: '#006644' }}>{team}</span>
                </div>
              ))}
              <span style={styles.moreIndicator}>+2 more</span>
            </div>
          </div>
        </div>

        {/* Breadcrumb path */}
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLabel}>Sample path:</span>
          <div style={styles.breadcrumbPath}>
            {breadcrumbPath.map((segment, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span style={styles.breadcrumbSeparator}>&gt;</span>}
                <span
                  style={{
                    ...styles.breadcrumbSegment,
                    color: index === breadcrumbPath.length - 1 ? '#006644' : sortedLevels[index]?.color || '#6B778C',
                  }}
                >
                  {segment}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#5243AA',
    backgroundColor: '#EAE6FF',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  previewArea: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  treePreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  flatPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  flatRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  levelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  levelLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '100px',
    flexShrink: 0,
  },
  levelDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  levelName: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  nodesRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  teamNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  nodeBox: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1.5px solid',
    transition: 'all 0.15s ease',
  },
  nodeText: {
    fontSize: '12px',
    fontWeight: 500,
  },
  moreIndicator: {
    fontSize: '11px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  connector: {
    display: 'flex',
    justifyContent: 'center',
    padding: '4px 0',
    marginLeft: '112px', // Align with nodes
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  breadcrumbLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  breadcrumbPath: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  breadcrumbSeparator: {
    fontSize: '11px',
    color: '#97A0AF',
  },
  breadcrumbSegment: {
    fontSize: '12px',
    fontWeight: 500,
  },
};

export default LivePreview;
