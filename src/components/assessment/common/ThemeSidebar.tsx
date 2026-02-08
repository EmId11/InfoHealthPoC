import React from 'react';
import { DimensionResult } from '../../../types/assessment';
import { ThemeGroup, getDimensionsForTheme } from '../../../constants/themeGroups';
import OverviewIcon from '@atlaskit/icon/glyph/overview';
import EditorTaskIcon from '@atlaskit/icon/glyph/editor/task';

interface ThemeSidebarProps {
  themes: ThemeGroup[];
  dimensions: DimensionResult[];
  selectedIndex: number;  // -2 = Action Plan, -1 = Executive Summary, 0+ = theme index
  onSelectTheme: (index: number) => void;
  actionPlanCount?: number;
}

const ThemeSidebar: React.FC<ThemeSidebarProps> = ({
  themes,
  dimensions,
  selectedIndex,
  onSelectTheme,
  actionPlanCount = 0,
}) => {
  // Calculate overall stats
  const totalConcerns = dimensions.filter(d => d.riskLevel === 'high').length;
  const healthyAreas = themes.filter(theme => {
    const themeDims = getDimensionsForTheme(theme, dimensions);
    return themeDims.every(d => d.riskLevel !== 'high');
  }).length;

  return (
    <div style={styles.sidebar}>
      {/* Header with summary */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={styles.headerIcon}>📋</span>
          <span style={styles.headerTitle}>Assessment Areas</span>
        </div>
        <div style={styles.headerSummary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryNumber}>{totalConcerns}</span>
            <span style={styles.summaryLabel}>total concerns</span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={{ ...styles.summaryNumber, color: '#36B37E' }}>{healthyAreas}</span>
            <span style={styles.summaryLabel}>areas healthy</span>
          </div>
        </div>
      </div>

      {/* Executive Summary tab */}
      <div style={styles.execSummarySection}>
        <button
          style={{
            ...styles.execSummaryTab,
            ...(selectedIndex === -1 ? styles.execSummaryTabSelected : {}),
          }}
          onClick={() => onSelectTheme(-1)}
        >
          <div style={styles.execSummaryIcon}>
            <OverviewIcon label="" size="medium" primaryColor={selectedIndex === -1 ? '#0052CC' : '#6B778C'} />
          </div>
          <div style={styles.execSummaryText}>
            <span style={{
              ...styles.execSummaryName,
              color: selectedIndex === -1 ? '#0052CC' : '#172B4D',
            }}>
              Executive Summary
            </span>
            <span style={styles.execSummaryHint}>Overview & priorities</span>
          </div>
        </button>
      </div>

      {/* Theme list */}
      <div style={styles.tabList}>
        {themes.map((theme, index) => {
          const themeDimensions = getDimensionsForTheme(theme, dimensions);
          const concernCount = themeDimensions.filter(d => d.riskLevel === 'high').length;
          const hasConcerns = concernCount > 0;
          const isSelected = index === selectedIndex;

          return (
            <button
              key={theme.id}
              style={{
                ...styles.tab,
                ...(isSelected ? styles.tabSelected : {}),
                ...(isSelected && hasConcerns ? styles.tabSelectedConcern : {}),
                ...(isSelected && !hasConcerns ? styles.tabSelectedHealthy : {}),
              }}
              onClick={() => onSelectTheme(index)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#F4F5F7';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Left accent bar */}
              <div style={{
                ...styles.accentBar,
                backgroundColor: hasConcerns ? '#DE350B' : '#36B37E',
                opacity: isSelected ? 1 : 0.3,
              }} />

              <div style={styles.tabContent}>
                <div style={styles.tabMain}>
                  <span style={{
                    ...styles.tabNumber,
                    backgroundColor: hasConcerns ? '#DE350B' : '#36B37E',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.15)' : 'none',
                  }}>
                    {index + 1}
                  </span>
                  <div style={styles.tabText}>
                    <span style={{
                      ...styles.tabName,
                      color: isSelected ? '#172B4D' : '#5E6C84',
                    }}>
                      {theme.name}
                    </span>
                    <div style={styles.tabStatus}>
                      {hasConcerns ? (
                        <span style={styles.concernPill}>
                          <span style={styles.concernDot} />
                          {concernCount} {concernCount === 1 ? 'concern' : 'concerns'}
                        </span>
                      ) : (
                        <span style={styles.healthyPill}>
                          <span style={styles.checkMark}>✓</span>
                          Looking good
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow indicator for selected */}
              {isSelected && (
                <div style={styles.arrowIndicator}>
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                    <path d="M1.5 1L6.5 6L1.5 11" stroke={hasConcerns ? '#DE350B' : '#36B37E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Plan tab - at bottom after themes */}
      <div style={styles.actionPlanSection}>
        <button
          style={{
            ...styles.actionPlanTab,
            ...(selectedIndex === -2 ? styles.actionPlanTabSelected : {}),
          }}
          onClick={() => onSelectTheme(-2)}
        >
          <div style={styles.actionPlanIcon}>
            <EditorTaskIcon label="" size="medium" primaryColor={selectedIndex === -2 ? '#0052CC' : '#6B778C'} />
          </div>
          <div style={styles.actionPlanText}>
            <span style={{
              ...styles.actionPlanName,
              color: selectedIndex === -2 ? '#0052CC' : '#172B4D',
            }}>
              Action Plan
            </span>
            <span style={styles.actionPlanHint}>
              {actionPlanCount > 0 ? `${actionPlanCount} action${actionPlanCount !== 1 ? 's' : ''}` : 'Track your actions'}
            </span>
          </div>
          {actionPlanCount > 0 && (
            <span style={{
              ...styles.actionPlanBadge,
              backgroundColor: selectedIndex === -2 ? '#0052CC' : '#6B778C',
            }}>
              {actionPlanCount}
            </span>
          )}
        </button>
      </div>

      {/* Footer hint */}
      <div style={styles.footer}>
        <span style={styles.footerText}>Click an area to view details</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '240px',
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #EBECF0',
    background: 'linear-gradient(180deg, #FAFBFC 0%, #F4F5F7 100%)',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  headerIcon: {
    fontSize: '16px',
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  headerSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
  },
  summaryNumber: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#DE350B',
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#6B778C',
    lineHeight: 1.2,
  },
  summaryDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#EBECF0',
  },
  tabList: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    gap: '4px',
    flex: 1,
  },
  tab: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    overflow: 'hidden',
  },
  tabSelected: {
    backgroundColor: '#F4F5F7',
  },
  tabSelectedConcern: {
    backgroundColor: '#FFF5F3',
    boxShadow: 'inset 0 0 0 1px #FFBDAD',
  },
  tabSelectedHealthy: {
    backgroundColor: '#F1FBF4',
    boxShadow: 'inset 0 0 0 1px #ABF5D1',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: '8px',
    bottom: '8px',
    width: '3px',
    borderRadius: '0 2px 2px 0',
    transition: 'opacity 0.15s ease',
  },
  tabContent: {
    flex: 1,
    marginLeft: '8px',
  },
  tabMain: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  tabNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
    transition: 'box-shadow 0.15s ease',
  },
  tabText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: 0,
    maxWidth: '120px',
  },
  tabName: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.3,
    transition: 'color 0.15s ease',
  },
  tabStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  concernPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#DE350B',
    backgroundColor: '#FFEBE6',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  concernDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#DE350B',
  },
  healthyPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#006644',
    backgroundColor: '#E3FCEF',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  checkMark: {
    fontSize: '10px',
    fontWeight: 700,
  },
  arrowIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8px',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  footerText: {
    fontSize: '11px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  execSummarySection: {
    padding: '12px 12px 0 12px',
  },
  execSummaryTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    backgroundColor: '#FAFBFC',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  execSummaryTabSelected: {
    backgroundColor: '#E6F0FF',
    border: '1px solid #B3D4FF',
    boxShadow: '0 2px 4px rgba(0, 82, 204, 0.1)',
  },
  execSummaryIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  execSummaryText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  execSummaryName: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  execSummaryHint: {
    fontSize: '11px',
    color: '#6B778C',
  },
  actionPlanSection: {
    padding: '0 12px 12px 12px',
    borderTop: '1px solid #EBECF0',
    marginTop: '4px',
    paddingTop: '12px',
  },
  actionPlanTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 14px',
    border: '1px dashed #DFE1E6',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  actionPlanTabSelected: {
    backgroundColor: '#E6F0FF',
    border: '1px solid #B3D4FF',
    boxShadow: '0 2px 4px rgba(0, 82, 204, 0.1)',
  },
  actionPlanIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionPlanText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  actionPlanName: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  actionPlanHint: {
    fontSize: '11px',
    color: '#6B778C',
  },
  actionPlanBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 700,
  },
};

export default ThemeSidebar;
