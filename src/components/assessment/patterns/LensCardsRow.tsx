import React from 'react';
import { AssessmentLensResults, LensType } from '../../../types/patterns';
import LensCard from './LensCard';

interface LensCardsRowProps {
  lensResults: AssessmentLensResults;
  activeLens?: LensType;
  onLensClick?: (lens: LensType) => void;
}

const LensCardsRow: React.FC<LensCardsRowProps> = ({ lensResults, activeLens, onLensClick }) => {
  return (
    <div style={styles.container}>
      <LensCard
        lens="coverage"
        coverageData={lensResults.coverage}
        isActive={activeLens === 'coverage'}
        onClick={() => onLensClick?.('coverage')}
      />
      <LensCard
        lens="integrity"
        lensResult={lensResults.integrity}
        isActive={activeLens === 'integrity'}
        onClick={() => onLensClick?.('integrity')}
      />
      <LensCard
        lens="timing"
        lensResult={lensResults.timing}
        isActive={activeLens === 'timing'}
        onClick={() => onLensClick?.('timing')}
      />
      <LensCard
        lens="behavioral"
        lensResult={lensResults.behavioral}
        isActive={activeLens === 'behavioral'}
        onClick={() => onLensClick?.('behavioral')}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    marginBottom: '20px',
  },
};

export default LensCardsRow;
