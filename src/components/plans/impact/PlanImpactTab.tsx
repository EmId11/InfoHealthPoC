// PlanImpactTab Component
// Main tab component showing impact measurement for a plan

import React, { useState, useMemo } from 'react';
import { ImprovementPlan } from '../../../types/improvementPlan';
import {
  PlanImpactSummary,
  createEmptyPlanImpactSummary,
} from '../../../types/impactMeasurement';
import { ImpactSummaryHero } from './ImpactSummaryHero';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { PlayAttribution } from './PlayAttribution';
import { AwaitingAssessment } from './AwaitingAssessment';
import { ExcludedPlays } from './ExcludedPlays';
import { ImpactMethodologyModal } from './ImpactMethodologyModal';

interface PlanImpactTabProps {
  plan: ImprovementPlan;
  onPlayClick?: (playId: string) => void;
}

export const PlanImpactTab: React.FC<PlanImpactTabProps> = ({
  plan,
  onPlayClick,
}) => {
  const [showMethodology, setShowMethodology] = useState(false);

  // Get impact summary from plan or create empty
  const impactSummary: PlanImpactSummary = plan.impactSummary || createEmptyPlanImpactSummary(plan.id);

  // Create play title map for display
  const playTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const play of plan.plays) {
      map[play.playId] = play.title;
    }
    return map;
  }, [plan.plays]);

  // Check if we have any impact data
  const hasImpactData = impactSummary.playsWithImpact.length > 0 ||
    impactSummary.playsAwaitingAssessment.length > 0 ||
    impactSummary.excludedPlays.length > 0;

  const completedPlaysCount = plan.plays.filter(p => p.status === 'completed').length;

  return (
    <div style={styles.container}>
      {!hasImpactData && completedPlaysCount === 0 ? (
        <EmptyState />
      ) : !hasImpactData ? (
        <NoDataYetState completedCount={completedPlaysCount} />
      ) : (
        <>
          {/* Impact Summary Hero */}
          <ImpactSummaryHero
            summary={impactSummary}
            onMethodologyClick={() => setShowMethodology(true)}
          />

          {/* Before/After Comparison */}
          {impactSummary.outcomeImpacts.length > 0 && (
            <BeforeAfterComparison outcomeImpacts={impactSummary.outcomeImpacts} />
          )}

          {/* Play Attribution */}
          {impactSummary.playsWithImpact.length > 0 && (
            <PlayAttribution
              playsWithImpact={impactSummary.playsWithImpact}
              playTitleMap={playTitleMap}
              onPlayClick={onPlayClick}
            />
          )}

          {/* Awaiting Assessment */}
          <AwaitingAssessment
            plays={impactSummary.playsAwaitingAssessment}
            playTitleMap={playTitleMap}
          />

          {/* Excluded Plays */}
          <ExcludedPlays
            exclusions={impactSummary.excludedPlays}
            playTitleMap={playTitleMap}
          />
        </>
      )}

      {/* Methodology Modal */}
      <ImpactMethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  );
};

// Empty state when no plays have been completed
const EmptyState: React.FC = () => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>{'\u{1F4CA}'}</div>
    <h3 style={styles.emptyTitle}>No Impact Data Yet</h3>
    <p style={styles.emptyDescription}>
      Complete some plays to start measuring their impact on your team's health metrics.
    </p>
    <div style={styles.emptySteps}>
      <div style={styles.emptyStep}>
        <span style={styles.emptyStepNumber}>1</span>
        <span>Start a play (we'll capture baseline scores)</span>
      </div>
      <div style={styles.emptyStep}>
        <span style={styles.emptyStepNumber}>2</span>
        <span>Complete the play</span>
      </div>
      <div style={styles.emptyStep}>
        <span style={styles.emptyStepNumber}>3</span>
        <span>Wait for the assessment window to open</span>
      </div>
      <div style={styles.emptyStep}>
        <span style={styles.emptyStepNumber}>4</span>
        <span>See the measured impact</span>
      </div>
    </div>
  </div>
);

// State when plays are completed but no impact data yet
interface NoDataYetStateProps {
  completedCount: number;
}

const NoDataYetState: React.FC<NoDataYetStateProps> = ({ completedCount }) => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>{'\u23F3'}</div>
    <h3 style={styles.emptyTitle}>Impact Assessment Coming Soon</h3>
    <p style={styles.emptyDescription}>
      You've completed {completedCount} play{completedCount !== 1 ? 's' : ''}, but impact data hasn't been calculated yet.
    </p>
    <p style={styles.emptyNote}>
      Impact measurement requires baseline snapshots to be captured when plays start.
      Future plays will have full impact tracking.
    </p>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: '0 0 40px 0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    backgroundColor: 'white',
    borderRadius: 12,
    border: '1px solid #DFE1E6',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B778C',
    margin: '0 0 24px 0',
    maxWidth: 400,
  },
  emptyNote: {
    fontSize: 13,
    color: '#5E6C84',
    margin: 0,
    maxWidth: 400,
    backgroundColor: '#F4F5F7',
    padding: 16,
    borderRadius: 8,
  },
  emptySteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#F4F5F7',
    padding: 20,
    borderRadius: 8,
  },
  emptyStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
    color: '#172B4D',
  },
  emptyStepNumber: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  },
};

export default PlanImpactTab;
