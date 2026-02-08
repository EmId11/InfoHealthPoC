import React from 'react';
import { DimensionResult, IndicatorDrillDownState } from '../../../types/assessment';
import { Step6Data } from '../../../types/wizard';
import IndicatorsTab from '../common/IndicatorsTab';

interface Dimension5ResultsProps {
  dimension: DimensionResult;
  reportOptions: Step6Data;
  teamId: string;
  dateRange: { startDate: string; endDate: string };
  similarTeamsCount: number;
  onViewSimilarTeams: () => void;
  dimensionIndex?: number;
  onIndicatorDrillDown?: (state: IndicatorDrillDownState) => void;
}

const Dimension5Results: React.FC<Dimension5ResultsProps> = ({
  dimension,
  dimensionIndex = 4,
  onIndicatorDrillDown,
}) => {
  return (
    <div style={styles.container}>
      <IndicatorsTab
        dimension={dimension}
        dimensionIndex={dimensionIndex}
        onIndicatorDrillDown={onIndicatorDrillDown}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
};

export default Dimension5Results;
