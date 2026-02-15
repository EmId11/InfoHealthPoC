import React from 'react';
import { IndicatorCategory, IndicatorResult, IndicatorDrillDownState } from '../../../types/assessment';
import { SummaryToolbar, TestResultsDashboard } from '../common/IndicatorsTab';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';

interface DataIntegrityCategoryDetailPageProps {
  category: IndicatorCategory;
  dimensionName: string;
  onBack: () => void;
  onIndicatorDrillDown?: (state: IndicatorDrillDownState) => void;
}

const DataIntegrityCategoryDetailPage: React.FC<DataIntegrityCategoryDetailPageProps> = ({
  category,
  dimensionName,
  onBack,
  onIndicatorDrillDown,
}) => {
  const failedCount = category.indicators.length;
  const passedCount = category.passedChecks?.length ?? 0;
  const totalChecks = category.totalChecks ?? (failedCount + passedCount);

  const handleIndicatorDrillDown = (indicator: IndicatorResult) => {
    if (onIndicatorDrillDown) {
      // Find the category index (we pass 0 since we don't have the full dimension here,
      // but the drill-down page uses indicatorId to find the right data)
      onIndicatorDrillDown({
        indicatorId: indicator.id,
        dimensionIndex: 0, // Data Integrity is dimension 0
        categoryIndex: 0,
        indicatorName: indicator.name,
      });
    }
  };

  return (
    <div style={pageStyles.wrapper}>
      {/* Header */}
      <div style={pageStyles.header}>
        <button
          onClick={onBack}
          style={pageStyles.backButton}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F4F5F7'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <ArrowLeftIcon label="Back" size="medium" primaryColor="#44546F" />
        </button>
        <div style={pageStyles.breadcrumb}>
          <span style={pageStyles.breadcrumbDim}>{dimensionName}</span>
          <span style={pageStyles.breadcrumbSep}>/</span>
          <span style={pageStyles.breadcrumbCat}>{category.shortName}</span>
        </div>
      </div>

      {/* Summary stats */}
      <div style={pageStyles.summaryRow}>
        <span style={pageStyles.summaryTitle}>{category.name}</span>
        <span style={pageStyles.summaryMeta}>
          {totalChecks} checks &middot; {failedCount} failed &middot; {passedCount} passed
        </span>
      </div>

      {/* Reuse SummaryToolbar */}
      <SummaryToolbar
        indicators={category.indicators}
        totalChecks={totalChecks}
        passedCheckCount={passedCount}
      />

      {/* Reuse TestResultsDashboard */}
      <div style={pageStyles.dashboardWrapper}>
        <TestResultsDashboard
          category={category}
          passedChecks={category.passedChecks}
          onIndicatorDrillDown={handleIndicatorDrillDown}
        />
      </div>
    </div>
  );
};

const pageStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#FAFBFC',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E4E6EB',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: 0,
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    flexShrink: 0,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breadcrumbDim: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
  },
  breadcrumbSep: {
    fontSize: '14px',
    color: '#C1C7D0',
  },
  breadcrumbCat: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    padding: '20px 24px 8px',
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  summaryMeta: {
    fontSize: '13px',
    color: '#6B778C',
  },
  dashboardWrapper: {
    padding: '0 4px',
  },
};

export default DataIntegrityCategoryDetailPage;
