import React from 'react';
import { DimensionResult } from '../../../types/assessment';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import { getCHSCategoryConfig } from '../../../constants/chsCategories';
import WatchIcon from '@atlaskit/icon/glyph/watch';
import DocumentIcon from '@atlaskit/icon/glyph/document';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import GraphBarIcon from '@atlaskit/icon/glyph/graph-bar';
import EditorLayoutThreeEqualIcon from '@atlaskit/icon/glyph/editor/layout-three-equal';
import LabelIcon from '@atlaskit/icon/glyph/label';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import LinkIcon from '@atlaskit/icon/glyph/link';
import SprintIcon from '@atlaskit/icon/glyph/sprint';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import InfoButton from '../../common/InfoButton';

// Icon component mapping for each dimension
const getDimensionIcon = (dimensionKey: string, color: string) => {
  const iconProps = { label: '', size: 'medium' as const, primaryColor: color };

  switch (dimensionKey) {
    case 'workCaptured':
      return <WatchIcon {...iconProps} />;
    case 'informationHealth':
      return <DocumentIcon {...iconProps} />;
    case 'dataFreshness':
      return <RefreshIcon {...iconProps} />;
    case 'estimationCoverage':
      return <GraphBarIcon {...iconProps} />;
    case 'sizingConsistency':
      return <EditorLayoutThreeEqualIcon {...iconProps} />;
    case 'issueTypeConsistency':
      return <LabelIcon {...iconProps} />;
    case 'blockerManagement':
      return <CrossCircleIcon {...iconProps} />;
    case 'workHierarchy':
      return <LinkIcon {...iconProps} />;
    case 'sprintHygiene':
      return <SprintIcon {...iconProps} />;
    case 'teamCollaboration':
      return <PeopleIcon {...iconProps} />;
    case 'automationOpportunities':
      return <SettingsIcon {...iconProps} />;
    default:
      return <QuestionCircleIcon {...iconProps} />;
  }
};

interface DimensionSummaryCardProps {
  dimension: DimensionResult;
  onViewDetails: () => void;
}

const DimensionSummaryCard: React.FC<DimensionSummaryCardProps> = ({
  dimension,
  onViewDetails,
}) => {
  // Get CHS category for this dimension based on health score
  const chsCategory = getCHSCategoryConfig(dimension.healthScore);

  // Get icon color based on CHS category
  const getIconColor = () => {
    return chsCategory.color;
  };

  // Get risk text prefix for actionable description based on CHS category
  const getRiskText = () => {
    switch (chsCategory.category) {
      case 'needs-attention': return "There's high risk that";
      case 'below-average': return "There's moderate risk that";
      case 'average': return "There's some risk that";
      case 'good': return "There's low risk that";
      case 'excellent': return "There's minimal risk that";
    }
  };

  // Get CHS category color
  const getRiskColor = () => {
    return chsCategory.color;
  };

  // Get card background color based on CHS category
  const getCardBackground = () => {
    return chsCategory.bgColor;
  };

  // Get trend arrow
  const getTrendArrow = () => {
    switch (dimension.trend) {
      case 'improving': return '↑';
      case 'declining': return '↓';
      case 'stable': return '→';
    }
  };

  const getTrendColor = () => {
    switch (dimension.trend) {
      case 'improving': return '#36B37E';
      case 'declining': return '#DE350B';
      case 'stable': return '#6B778C';
    }
  };

  const getTrendLabel = () => {
    switch (dimension.trend) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      case 'stable': return 'Stable';
    }
  };

  const getTrendBackground = () => {
    switch (dimension.trend) {
      case 'improving': return '#E3FCEF';
      case 'declining': return '#FFEBE6';
      case 'stable': return '#F4F5F7';
    }
  };

  // Generate help content for the info modal
  const renderHelpContent = () => {
    return (
      <>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#5E6C84' }}>
          The Question We're Answering
        </h4>
        <p style={{ margin: '0 0 16px 0', fontStyle: 'italic', color: '#172B4D' }}>
          "{dimension.questionForm}"
        </p>

        {dimension.whyItMatters && (
          <>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#5E6C84' }}>
              Why This Matters
            </h4>
            <p style={{ margin: '0 0 16px 0' }}>
              {dimension.whyItMatters}
            </p>
          </>
        )}

        {dimension.whyItMattersPoints && dimension.whyItMattersPoints.length > 0 && (
          <>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#5E6C84' }}>
              Key Impacts
            </h4>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
              {dimension.whyItMattersPoints.map((point, index) => (
                <li key={index} style={{ marginBottom: '6px' }}>{point}</li>
              ))}
            </ul>
          </>
        )}

        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#5E6C84' }}>
          How It's Measured
        </h4>
        <p style={{ margin: 0 }}>
          This score is calculated from {dimension.categories?.length || 'multiple'} indicator
          categories, comparing your team's Jira data against similar teams in your organization.
          The percentile shows where you rank relative to the comparison group.
        </p>
      </>
    );
  };

  // Display health score (not inverted risk score)
  const displayScore = dimension.healthScore ?? dimension.overallPercentile;
  // Rank derived from health score
  const teamsAhead = Math.round((100 - displayScore) / 100 * 47);
  const yourRank = teamsAhead + 1;

  // Get CHS category badge text
  const getRiskBadgeText = () => {
    return chsCategory.shortLabel;
  };

  // Get CHS category badge background
  const getRiskBadgeBackground = () => {
    return chsCategory.color;
  };

  // Spectrum position based on health score (0=left/needs attention, 100=right/excellent)
  // Note: spectrum shows left=bad, right=good, so we use score directly
  const spectrumPosition = 100 - dimension.healthScore;

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: getCardBackground(),
      }}
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
    >
      {/* Header: Title + Description */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.dimensionIcon}>
            {getDimensionIcon(dimension.dimensionKey, getIconColor())}
          </div>
          <h3 style={styles.title}>{dimension.dimensionName}</h3>
          <InfoButton title={dimension.dimensionName} size="inline">
            {renderHelpContent()}
          </InfoButton>
        </div>
        <p style={styles.description}>
          <span style={{ color: getRiskColor(), fontWeight: 600 }}>
            {getRiskText()}
          </span>{' '}
          that {dimension.riskDescription}.
        </p>
      </div>

      {/* Results Bar */}
      <div style={styles.resultsBar}>
        {/* Health Score */}
        <div style={styles.resultSection}>
          <span style={styles.resultLabel}>HEALTH SCORE</span>
          <div style={styles.riskRating}>
            <span style={styles.scoreValue}>{displayScore}</span>
            <span style={{ ...styles.riskBadge, backgroundColor: getRiskBadgeBackground() }}>
              {getRiskBadgeText()}
            </span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Spectrum - CHS 5-zone model */}
        <div style={styles.resultSection}>
          <span style={styles.resultLabel}>SPECTRUM</span>
          <div style={styles.spectrumBar}>
            <div style={styles.spectrumExcellent} />
            <div style={styles.spectrumGood} />
            <div style={styles.spectrumAverage} />
            <div style={styles.spectrumBelowAvg} />
            <div style={styles.spectrumNeedsAtt} />
            <div style={{ ...styles.spectrumMarker, left: `${spectrumPosition}%` }}>
              <div style={styles.spectrumPin} />
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Ranking */}
        <div style={styles.resultSection}>
          <span style={styles.resultLabel}>RANKING</span>
          <div style={styles.rankDisplay}>
            <span style={{ ...styles.rankValue, color: getRiskColor() }}>{yourRank}<sup style={styles.rankSup}>th</sup></span>
            <span style={styles.rankContext}>of 48 similar teams</span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Trend */}
        <div style={styles.resultSection}>
          <span style={styles.resultLabel}>TREND</span>
          <span style={{ ...styles.trendBadge, backgroundColor: getTrendBackground(), color: getTrendColor() }}>
            {getTrendArrow()} {getTrendLabel()}
          </span>
        </div>

        {/* Action */}
        <div style={styles.viewAction}>
          <ChevronRightIcon label="" size="medium" primaryColor="#0052CC" />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
    cursor: 'pointer',
  },
  header: {
    padding: '14px 20px 10px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  dimensionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
    paddingLeft: '32px',
  },
  resultsBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#FAFBFC',
    borderTop: '1px solid #F4F5F7',
    gap: '20px',
  },
  resultSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  resultLabel: {
    fontSize: '9px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  riskRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
  },
  riskBadge: {
    padding: '2px 8px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  divider: {
    width: '1px',
    height: '32px',
    backgroundColor: '#E4E6EB',
  },
  spectrumBar: {
    position: 'relative',
    width: '140px',
    height: '6px',
    borderRadius: '3px',
    display: 'flex',
    overflow: 'visible',
  },
  // CHS 5-zone spectrum (left to right: Excellent → Needs Attention)
  // Width proportions: 30% (70-100), 15% (55-70), 10% (45-55), 15% (30-45), 30% (0-30)
  spectrumExcellent: {
    flex: '0 0 30%',
    backgroundColor: '#E3FCEF',
    borderRadius: '3px 0 0 3px',
  },
  spectrumGood: {
    flex: '0 0 15%',
    backgroundColor: '#E3FCEF',
  },
  spectrumAverage: {
    flex: '0 0 10%',
    backgroundColor: '#F4F5F7',
  },
  spectrumBelowAvg: {
    flex: '0 0 15%',
    backgroundColor: '#FFF7ED',
  },
  spectrumNeedsAtt: {
    flex: '0 0 30%',
    backgroundColor: '#FFEBE6',
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
  rankDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  rankValue: {
    fontSize: '18px',
    fontWeight: 700,
  },
  rankSup: {
    fontSize: '10px',
  },
  rankContext: {
    fontSize: '12px',
    color: '#6B778C',
  },
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  viewAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    marginLeft: 'auto',
  },
};

export default DimensionSummaryCard;
