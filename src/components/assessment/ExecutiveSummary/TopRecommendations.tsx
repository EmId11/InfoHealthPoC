import React from 'react';
import { PrioritizedRecommendation } from '../../../types/assessment';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface TopRecommendationsProps {
  recommendations: PrioritizedRecommendation[];
  onRecommendationClick: (dimensionKey: string) => void;
}

const getCategoryStyle = (category: PrioritizedRecommendation['category']): {
  label: string;
  bgColor: string;
  textColor: string;
} => {
  switch (category) {
    case 'process':
      return { label: 'Process', bgColor: '#DEEBFF', textColor: '#0747A6' };
    case 'tooling':
      return { label: 'Tooling', bgColor: '#E6FCFF', textColor: '#006644' };
    case 'culture':
      return { label: 'Culture', bgColor: '#EAE6FF', textColor: '#403294' };
    case 'governance':
      return { label: 'Governance', bgColor: '#FFEBE6', textColor: '#BF2600' };
  }
};

// Effort: low is good (green), high is bad (red)
const getEffortStyle = (effort: PrioritizedRecommendation['effort']): { filled: number; color: string } => {
  switch (effort) {
    case 'low': return { filled: 1, color: '#36B37E' };
    case 'medium': return { filled: 2, color: '#FFAB00' };
    case 'high': return { filled: 3, color: '#DE350B' };
  }
};

// Impact: high is good (green), low is bad (gray)
const getImpactStyle = (impact: PrioritizedRecommendation['impact']): { filled: number; color: string } => {
  switch (impact) {
    case 'high': return { filled: 3, color: '#36B37E' };
    case 'medium': return { filled: 2, color: '#FFAB00' };
    case 'low': return { filled: 1, color: '#6B778C' };
  }
};

const DotRating: React.FC<{ filled: number; color: string }> = ({ filled, color }) => (
  <span style={styles.dotRating}>
    {[1, 2, 3].map((dot) => (
      <span
        key={dot}
        style={{
          ...styles.dot,
          backgroundColor: dot <= filled ? color : '#DFE1E6',
        }}
      />
    ))}
  </span>
);

interface RecommendationRowProps {
  rec: PrioritizedRecommendation;
  index: number;
  onClick: () => void;
}

const RecommendationRow: React.FC<RecommendationRowProps> = ({ rec, index, onClick }) => {
  const categoryStyle = getCategoryStyle(rec.category);
  const effortStyle = getEffortStyle(rec.effort);
  const impactStyle = getImpactStyle(rec.impact);

  return (
    <div
      style={styles.row}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Priority */}
      <div style={styles.priorityCell}>
        <span style={styles.priorityBadge}>{index + 1}</span>
      </div>

      {/* Title & Source */}
      <div style={styles.titleCell}>
        <span style={styles.recTitle}>{rec.title}</span>
        <span style={styles.sourceDimension}>{rec.sourceDimension}</span>
      </div>

      {/* Category */}
      <div style={styles.categoryCell}>
        <span style={{
          ...styles.categoryBadge,
          backgroundColor: categoryStyle.bgColor,
          color: categoryStyle.textColor,
        }}>
          {categoryStyle.label}
        </span>
      </div>

      {/* Description */}
      <div style={styles.descriptionCell}>
        <span style={styles.description}>{rec.description}</span>
      </div>

      {/* Effort */}
      <div style={styles.metricCell}>
        <DotRating filled={effortStyle.filled} color={effortStyle.color} />
      </div>

      {/* Impact */}
      <div style={styles.metricCell}>
        <DotRating filled={impactStyle.filled} color={impactStyle.color} />
      </div>

      {/* Arrow */}
      <div style={styles.arrowCell}>
        <div style={styles.arrowButton}>
          <ChevronRightIcon label="View" size="medium" primaryColor="#6B778C" />
        </div>
      </div>
    </div>
  );
};

const TopRecommendations: React.FC<TopRecommendationsProps> = ({
  recommendations,
  onRecommendationClick,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.sectionTitle}>Recommended Actions</h3>
        <p style={styles.sectionSubtitle}>
          Prioritized by impact and effort
        </p>
      </div>

      <div style={styles.table}>
        {/* Header row */}
        <div style={styles.headerRow}>
          <div style={styles.headerCell}>#</div>
          <div style={styles.headerCell}>Action</div>
          <div style={styles.headerCell}>Type</div>
          <div style={styles.headerCell}>Description</div>
          <div style={styles.headerCell}>Effort</div>
          <div style={styles.headerCell}>Impact</div>
          <div style={styles.headerCell}></div>
        </div>

        {recommendations.map((rec, index) => (
          <RecommendationRow
            key={rec.id}
            rec={rec}
            index={index}
            onClick={() => onRecommendationClick(rec.sourceDimensionKey)}
          />
        ))}
      </div>

      {recommendations.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No recommendations available</p>
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
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '28px 220px 90px minmax(200px, 320px) 55px 55px 28px',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '2px solid #E4E6EB',
  },
  headerCell: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '28px 220px 90px minmax(200px, 320px) 55px 55px 28px',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 0',
    borderBottom: '1px solid #F0F1F3',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  priorityCell: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingTop: '2px',
  },
  priorityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 700,
  },
  titleCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  recTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  sourceDimension: {
    fontSize: '12px',
    color: '#97A0AF',
  },
  categoryCell: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingTop: '2px',
  },
  categoryBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },
  descriptionCell: {
    minWidth: 0,
    paddingTop: '2px',
  },
  description: {
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
    margin: 0,
  },
  metricCell: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingTop: '5px',
  },
  dotRating: {
    display: 'flex',
    gap: '3px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  arrowCell: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '4px',
  },
  arrowButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#F4F5F7',
  },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
};

export default TopRecommendations;
