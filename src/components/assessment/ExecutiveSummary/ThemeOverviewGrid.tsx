import React from 'react';
import { ThemeSummary, RiskLevel, TrendDirection } from '../../../types/assessment';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface ThemeOverviewGridProps {
  themes: ThemeSummary[];
  onThemeClick: (themeId: string) => void;
}

interface ThemeCardProps {
  theme: ThemeSummary;
  onClick: () => void;
}

const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'high': return '#DE350B';
    case 'moderate': return '#FF8B00';
    case 'low': return '#36B37E';
  }
};

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, onClick }) => {
  const accentColor = theme.concernCount > 0 ? '#DE350B' : '#36B37E';

  const getTrendIcon = (trend: TrendDirection, size: 'small' | 'medium' = 'small') => {
    const color = trend === 'improving' ? '#36B37E' : trend === 'declining' ? '#DE350B' : '#6B778C';
    const px = size === 'small' ? 16 : 20;
    return (
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {trend === 'improving' && (<><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></>)}
        {trend === 'declining' && (<><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></>)}
        {trend === 'stable' && (<><path d="M4,12 C8,8 16,16 20,12" /></>)}
      </svg>
    );
  };

  return (
    <div
      style={{ ...styles.card, borderLeftColor: accentColor }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div style={styles.cardHeader}>
        <h4 style={styles.themeName}>{theme.themeName}</h4>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: theme.isHealthy ? '#E3FCEF' : '#FFEBE6',
          color: theme.isHealthy ? '#006644' : '#BF2600',
        }}>
          {theme.isHealthy ? 'Looking good' : `${theme.concernCount} concern${theme.concernCount > 1 ? 's' : ''}`}
        </span>
      </div>

      <p style={styles.question}>{theme.themeQuestion}</p>

      {/* Dimension dots with risk colors */}
      <div style={styles.dimensionRow}>
        {theme.dimensions.map((dim) => (
          <div key={dim.dimensionKey} style={styles.dimensionDot} title={dim.dimensionName}>
            <span
              style={{
                ...styles.dot,
                backgroundColor: getRiskColor(dim.riskLevel),
              }}
            />
            <span style={styles.dimTrend}>
              {getTrendIcon(dim.trend)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer with overall trend and action */}
      <div style={styles.cardFooter}>
        <div style={styles.overallTrend}>
          {getTrendIcon(theme.overallTrend, 'small')}
          <span style={styles.trendLabel}>
            {theme.overallTrend === 'improving' ? 'Improving' :
             theme.overallTrend === 'declining' ? 'Declining' : 'Stable'}
          </span>
        </div>
        <div style={styles.viewLink}>
          <span>View details</span>
          <ChevronRightIcon label="" size="small" primaryColor="#0052CC" />
        </div>
      </div>
    </div>
  );
};

const ThemeOverviewGrid: React.FC<ThemeOverviewGridProps> = ({ themes, onThemeClick }) => {
  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>Theme Overview</h3>
      <div style={styles.grid}>
        {themes.map((theme) => (
          <ThemeCard
            key={theme.themeId}
            theme={theme}
            onClick={() => onThemeClick(theme.themeId)}
          />
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
    borderLeft: '4px solid',
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, transform 0.1s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  themeName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    flex: 1,
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  question: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  dimensionRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  dimensionDot: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
  },
  dimTrend: {
    display: 'flex',
    alignItems: 'center',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '8px',
    borderTop: '1px solid #F0F1F3',
  },
  overallTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  trendLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  viewLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
  },
};

export default ThemeOverviewGrid;
