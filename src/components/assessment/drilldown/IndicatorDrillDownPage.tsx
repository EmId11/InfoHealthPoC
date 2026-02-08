import React, { useMemo } from 'react';
import {
  IndicatorResult,
  DimensionResult,
  AssessmentResult,
  IndicatorDrillDownState,
  DrillDownReport,
} from '../../../types/assessment';
import { getIndicatorMetadata, IndicatorMetadata } from '../../../constants/indicatorMetadata';
import { generateDrillDownReport } from '../../../constants/mockDrillDownData';
import DrillDownHeader from './DrillDownHeader';
import DrillDownSummary from './DrillDownSummary';
import PercentileComparison from './shared/PercentileComparison';
import IssueListReport from './reports/IssueListReport';
import SprintListReport from './reports/SprintListReport';
import VariabilityReport from './reports/VariabilityReport';
import DistributionReport from './reports/DistributionReport';
import CorrelationReport from './reports/CorrelationReport';
import TimelineReport from './reports/TimelineReport';
import RatioReport from './reports/RatioReport';

interface IndicatorDrillDownPageProps {
  drillDownState: IndicatorDrillDownState;
  assessmentResult: AssessmentResult;
  onBack: () => void;
}

const IndicatorDrillDownPage: React.FC<IndicatorDrillDownPageProps> = ({
  drillDownState,
  assessmentResult,
  onBack,
}) => {
  // Find the dimension and indicator from the assessment result
  const dimension = assessmentResult.dimensions[drillDownState.dimensionIndex];

  const indicator = useMemo(() => {
    if (!dimension) return null;

    // Search through all categories to find the indicator
    for (const category of dimension.categories) {
      const found = category.indicators.find(ind => ind.id === drillDownState.indicatorId);
      if (found) return found;
    }
    return null;
  }, [dimension, drillDownState.indicatorId]);

  // Get metadata for this indicator
  const metadata = useMemo(() => {
    return getIndicatorMetadata(drillDownState.indicatorId) || {
      id: drillDownState.indicatorId,
      reportType: 'issueList' as const,
      description: indicator?.description || 'Detailed breakdown of this indicator.',
      issueListTitle: indicator?.name || 'Issues',
    };
  }, [drillDownState.indicatorId, indicator]);

  // Generate drill-down report data
  const report = useMemo(() => {
    if (!indicator || !dimension) return null;
    return generateDrillDownReport(
      indicator,
      dimension,
      metadata,
      assessmentResult.comparisonTeamCount
    );
  }, [indicator, dimension, metadata, assessmentResult.comparisonTeamCount]);

  // Handle error states
  if (!dimension) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Dimension Not Found</h2>
        <p style={styles.errorText}>
          Unable to find dimension at index {drillDownState.dimensionIndex}.
        </p>
        <button style={styles.backButton} onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Indicator Not Found</h2>
        <p style={styles.errorText}>
          Unable to find indicator "{drillDownState.indicatorId}" in dimension "{dimension.dimensionName}".
        </p>
        <button style={styles.backButton} onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  const renderReport = () => {
    if (!report) return null;

    switch (report.reportType) {
      case 'issueList':
        return <IssueListReport report={report} />;
      case 'sprintList':
        return <SprintListReport report={report} />;
      case 'variability':
        return <VariabilityReport report={report} />;
      case 'distribution':
        return <DistributionReport report={report} />;
      case 'correlation':
        return <CorrelationReport report={report} />;
      case 'timeline':
        return <TimelineReport report={report} />;
      case 'ratio':
        return <RatioReport report={report} />;
      default:
        return <PlaceholderReport reportType="Unknown" metadata={metadata} />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.page}>
      {/* Team Context Header (compact) */}
      <header style={styles.teamHeader}>
        <div style={styles.teamHeaderContent}>
          <h1 style={styles.teamTitle}>
            Jira Health Assessment
            {assessmentResult.teamName && (
              <span style={styles.teamNameInline}> — {assessmentResult.teamName}</span>
            )}
          </h1>

          <div style={styles.metadata}>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Analysis Period</span>
              <span style={styles.metadataValue}>
                {formatDate(assessmentResult.dateRange.startDate)} - {formatDate(assessmentResult.dateRange.endDate)}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Data Grouping</span>
              <span style={styles.metadataValue}>
                {assessmentResult.dataGrouping.charAt(0).toUpperCase() + assessmentResult.dataGrouping.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <DrillDownHeader
        indicator={indicator}
        dimension={dimension}
        onBack={onBack}
      />

      <div style={styles.content}>
        <DrillDownSummary
          indicator={indicator}
          dimension={dimension}
          metadata={metadata}
          similarTeamCount={assessmentResult.comparisonTeamCount}
        />

        <PercentileComparison
          indicator={indicator}
          similarTeamCount={assessmentResult.comparisonTeamCount}
        />

        <div style={styles.reportSection}>
          {renderReport()}
        </div>
      </div>
    </div>
  );
};

// Placeholder component for report types not yet implemented
interface PlaceholderReportProps {
  reportType: string;
  metadata: IndicatorMetadata;
}

const PlaceholderReport: React.FC<PlaceholderReportProps> = ({ reportType, metadata }) => (
  <div style={styles.placeholder}>
    <div style={styles.placeholderIcon}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6B778C" strokeWidth="2" />
        <path d="M8 12H16M12 8V16" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
    <h3 style={styles.placeholderTitle}>{reportType} Report</h3>
    <p style={styles.placeholderText}>
      The {reportType.toLowerCase()} report visualization will be implemented in Phase 2-6.
    </p>
    <div style={styles.placeholderMeta}>
      <span style={styles.metaLabel}>Report Type:</span>
      <span style={styles.metaBadge}>{metadata.reportType}</span>
    </div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F4F5F7',
  },
  // Team Context Header Styles (compact)
  teamHeader: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
    padding: '16px 24px',
    color: 'white',
  },
  teamHeaderContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  teamTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: 'white',
  },
  teamNameInline: {
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  metadata: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  metadataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metadataLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metadataValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  reportSection: {
    marginTop: '8px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '48px',
    textAlign: 'center',
  },
  errorTitle: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#DE350B',
  },
  errorText: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#5E6C84',
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '64px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '2px dashed #DFE1E6',
    textAlign: 'center',
  },
  placeholderIcon: {
    marginBottom: '16px',
    opacity: 0.6,
  },
  placeholderTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  placeholderText: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#6B778C',
    maxWidth: '400px',
  },
  placeholderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metaLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  metaBadge: {
    padding: '4px 10px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#42526E',
    textTransform: 'uppercase',
  },
};

export default IndicatorDrillDownPage;
