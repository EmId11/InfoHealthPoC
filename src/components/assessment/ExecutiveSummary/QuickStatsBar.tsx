import React from 'react';
import { ExecutiveSummaryData } from '../../../types/assessment';

interface QuickStatsBarProps {
  data: ExecutiveSummaryData;
}

// This component has been deprecated - stats are now shown in the unified SummaryHeader
const QuickStatsBar: React.FC<QuickStatsBarProps> = ({ data: _data }) => {
  return null;
};

export default QuickStatsBar;
