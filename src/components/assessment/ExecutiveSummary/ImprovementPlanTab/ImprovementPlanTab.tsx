import React, { useState, useEffect } from 'react';
import { AssessmentResult } from '../../../../types/assessment';
import { OutcomeConfidenceSummary } from '../../../../types/outcomeConfidence';
import { ImprovementPlan, PlanStatus } from '../../../../types/improvementPlan';
import PlansDashboard from '../../../plans/PlansDashboard';
import ActivePlanView from './ActivePlanView';

interface ImprovementPlanTabProps {
  assessmentResult: AssessmentResult;
  outcomeConfidence: OutcomeConfidenceSummary | undefined;
  // Multi-plan support
  plans: ImprovementPlan[];
  selectedPlan: ImprovementPlan | null;
  onSelectPlan: (planId: string) => void;
  onPlanUpdate: (plan: ImprovementPlan) => void;
  onArchivePlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onCreatePlan: () => void;
  onNavigateToDimension: (dimensionKey: string) => void;
  onOpenPlanDetail?: (plan: ImprovementPlan) => void;
  // Newly created plan to navigate to
  newlyCreatedPlanId?: string | null;
  onClearNewlyCreatedPlan?: () => void;
}

// View modes for the tab
type ViewMode = 'list' | 'plan-detail';

const ImprovementPlanTab: React.FC<ImprovementPlanTabProps> = ({
  assessmentResult,
  outcomeConfidence,
  plans,
  selectedPlan,
  onSelectPlan,
  onPlanUpdate,
  onArchivePlan,
  onDeletePlan,
  onCreatePlan,
  onNavigateToDimension,
  onOpenPlanDetail,
  newlyCreatedPlanId,
  onClearNewlyCreatedPlan,
}) => {
  // View mode state - start with list view
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);

  // Navigate to newly created plan automatically
  useEffect(() => {
    if (newlyCreatedPlanId) {
      const plan = plans.find(p => p.id === newlyCreatedPlanId);
      if (plan) {
        setViewingPlanId(plan.id);
        setViewMode('plan-detail');
        // Clear the flag
        if (onClearNewlyCreatedPlan) {
          onClearNewlyCreatedPlan();
        }
      }
    }
  }, [newlyCreatedPlanId, plans, onClearNewlyCreatedPlan]);

  // Get the plan being viewed (if in plan-detail mode)
  const viewingPlan = viewingPlanId
    ? plans.find(p => p.id === viewingPlanId) || null
    : null;

  // Handler for viewing a plan (from the list)
  const handleViewPlan = (plan: ImprovementPlan) => {
    setViewingPlanId(plan.id);
    setViewMode('plan-detail');
  };

  // Handler for going back to the list
  const handleBackToList = () => {
    setViewingPlanId(null);
    setViewMode('list');
  };

  // Handler for pausing a plan
  const handlePausePlan = (plan: ImprovementPlan) => {
    const updatedPlan: ImprovementPlan = {
      ...plan,
      status: 'paused' as PlanStatus,
      updatedAt: new Date().toISOString(),
    };
    onPlanUpdate(updatedPlan);
  };

  // Handler for resuming a plan
  const handleResumePlan = (plan: ImprovementPlan) => {
    const updatedPlan: ImprovementPlan = {
      ...plan,
      status: 'active' as PlanStatus,
      updatedAt: new Date().toISOString(),
    };
    onPlanUpdate(updatedPlan);
  };

  // Handler for archiving a plan
  const handleArchivePlan = (plan: ImprovementPlan) => {
    onArchivePlan(plan.id);
    // If we're viewing this plan, go back to the list
    if (viewingPlanId === plan.id) {
      handleBackToList();
    }
  };

  // Handler for deleting a plan
  const handleDeletePlan = (plan: ImprovementPlan) => {
    onDeletePlan(plan.id);
    // If we're viewing this plan, go back to the list
    if (viewingPlanId === plan.id) {
      handleBackToList();
    }
  };

  return (
    <div style={styles.container}>
      {viewMode === 'list' ? (
        /* Plans Dashboard View */
        <PlansDashboard
          plans={plans}
          onViewPlan={handleViewPlan}
          onPausePlan={handlePausePlan}
          onResumePlan={handleResumePlan}
          onArchivePlan={handleArchivePlan}
          onDeletePlan={handleDeletePlan}
          onCreatePlan={onCreatePlan}
        />
      ) : viewingPlan ? (
        /* Plan Detail View with Kanban */
        <div style={styles.planDetailContainer}>
          {/* Back to list button */}
          <button style={styles.backButton} onClick={handleBackToList}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Plans
          </button>

          <ActivePlanView
            plan={viewingPlan}
            onPlanUpdate={onPlanUpdate}
            onCreateNewPlan={onCreatePlan}
            onNavigateToDimension={onNavigateToDimension}
            onOpenPlanDetail={onOpenPlanDetail}
          />
        </div>
      ) : (
        /* Fallback - shouldn't happen */
        <PlansDashboard
          plans={plans}
          onViewPlan={handleViewPlan}
          onPausePlan={handlePausePlan}
          onResumePlan={handleResumePlan}
          onArchivePlan={handleArchivePlan}
          onDeletePlan={handleDeletePlan}
          onCreatePlan={onCreatePlan}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    animation: 'fadeInUp 0.3s ease-out',
  },
  planDetailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    width: 'fit-content',
    transition: 'all 0.15s ease',
  },
};

export default ImprovementPlanTab;
