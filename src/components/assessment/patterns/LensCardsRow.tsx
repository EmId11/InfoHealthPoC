import React from 'react';
import { AssessmentLensResults, LensType } from '../../../types/patterns';
import LensCard from './LensCard';
import { mockIntegrityDimensionResult } from '../../../constants/mockAssessmentData';

interface LensCardsRowProps {
  lensResults: AssessmentLensResults;
  activeLens?: LensType;
  onLensClick?: (lens: LensType) => void;
  embedded?: boolean;
}

const LENSES: LensType[] = ['coverage', 'integrity', 'timing', 'behavioral'];

const LensCardsRow: React.FC<LensCardsRowProps> = ({ lensResults, activeLens, onLensClick, embedded }) => {
  return (
    <div style={{
      ...styles.container,
      ...(embedded ? { gap: 0, marginBottom: 0 } : {}),
    }}>
      {LENSES.map((lens, index) => (
        <React.Fragment key={lens}>
          {embedded && index > 0 && (
            <div style={{ width: '1px', backgroundColor: '#E4E6EB', alignSelf: 'stretch' }} />
          )}
          <LensCard
            lens={lens}
            coverageData={lens === 'coverage' ? lensResults.coverage : undefined}
            lensResult={lens !== 'coverage' ? lensResults[lens] : undefined}
            integrityScore={lens === 'integrity' ? mockIntegrityDimensionResult.healthScore : undefined}
            isActive={activeLens === lens}
            onClick={() => onLensClick?.(lens)}
            embedded={embedded}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    marginBottom: '12px',
  },
};

export default LensCardsRow;
