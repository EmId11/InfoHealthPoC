import React from 'react';
import { DimensionResult, IndicatorDrillDownState } from '../../../types/assessment';
import { Step6Data } from '../../../types/wizard';
import IndicatorsTab from '../common/IndicatorsTab';

interface Dimension4ResultsProps {
  dimension: DimensionResult;
  reportOptions: Step6Data;
  teamId: string;
  dateRange: { startDate: string; endDate: string };
  similarTeamsCount: number;
  onViewSimilarTeams: () => void;
  dimensionIndex?: number;
  onIndicatorDrillDown?: (state: IndicatorDrillDownState) => void;
}

const Dimension4Results: React.FC<Dimension4ResultsProps> = ({
  dimension,
  dimensionIndex = 3,
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

export default Dimension4Results;
