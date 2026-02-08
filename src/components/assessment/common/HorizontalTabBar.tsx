import React, { useState } from 'react';
import { DimensionResult } from '../../../types/assessment';
import { ThemeGroup } from '../../../constants/themeGroups';
import OverviewIcon from '@atlaskit/icon/glyph/overview';
import EditorTaskIcon from '@atlaskit/icon/glyph/editor/task';

interface HorizontalTabBarProps {
  themes: ThemeGroup[];
  dimensions: DimensionResult[];
  selectedIndex: number;  // -2 = Improvement Plan, -1 = Executive Summary
  onSelectTheme: (index: number) => void;
  actionPlanCount?: number;
  completedCount?: number;
}

const HorizontalTabBar: React.FC<HorizontalTabBarProps> = ({
  selectedIndex,
  onSelectTheme,
  actionPlanCount = 0,
  completedCount = 0,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={styles.container}>
      <div style={styles.tabBar}>
        {/* Executive Summary tab */}
        <button
          style={{
            ...styles.tab,
            ...(selectedIndex === -1 ? styles.tabSelected : {}),
            ...(hoveredIndex === -1 && selectedIndex !== -1 ? styles.tabHovered : {}),
          }}
          onClick={() => onSelectTheme(-1)}
          onMouseEnter={() => setHoveredIndex(-1)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <OverviewIcon
            label=""
            size="medium"
            primaryColor={selectedIndex === -1 ? '#0052CC' : hoveredIndex === -1 ? '#0747A6' : '#6B778C'}
          />
          <span style={{
            ...styles.tabLabel,
            color: selectedIndex === -1 ? '#0052CC' : hoveredIndex === -1 ? '#0747A6' : '#42526E',
            fontWeight: selectedIndex === -1 ? 600 : 500,
          }}>
            Summary
          </span>
          {selectedIndex === -1 && <div style={styles.selectedIndicator} />}
        </button>

        {/* Improvement Plan tab */}
        <button
          style={{
            ...styles.tab,
            ...(selectedIndex === -2 ? styles.tabSelected : {}),
            ...(hoveredIndex === -2 && selectedIndex !== -2 ? styles.tabHovered : {}),
          }}
          onClick={() => onSelectTheme(-2)}
          onMouseEnter={() => setHoveredIndex(-2)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <EditorTaskIcon
            label=""
            size="medium"
            primaryColor={selectedIndex === -2 ? '#0052CC' : hoveredIndex === -2 ? '#0747A6' : '#6B778C'}
          />
          <span style={{
            ...styles.tabLabel,
            color: selectedIndex === -2 ? '#0052CC' : hoveredIndex === -2 ? '#0747A6' : '#42526E',
            fontWeight: selectedIndex === -2 ? 600 : 500,
          }}>
            Improvement Plan
          </span>
          {actionPlanCount > 0 && (
            <span style={{
              ...styles.actionBadge,
              backgroundColor: selectedIndex === -2 ? '#0052CC' : '#6B778C',
            }}>
              {completedCount}/{actionPlanCount}
            </span>
          )}
          {selectedIndex === -2 && <div style={styles.selectedIndicator} />}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #E4E6EB',
    marginBottom: '24px',
  },
  tabBar: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: '0 16px',
    gap: '8px',
  },
  tab: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '0',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabSelected: {
    backgroundColor: 'transparent',
  },
  tabHovered: {
    backgroundColor: 'rgba(9, 30, 66, 0.04)',
  },
  tabLabel: {
    fontSize: '14px',
    transition: 'color 0.15s ease',
    whiteSpace: 'nowrap',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '3px',
    backgroundColor: '#0052CC',
  },
  actionBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '18px',
    padding: '0 6px',
    borderRadius: '9px',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
    transition: 'background-color 0.15s ease',
  },
};

export default HorizontalTabBar;
