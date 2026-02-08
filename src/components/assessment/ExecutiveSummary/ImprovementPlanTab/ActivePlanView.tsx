import React, { useCallback } from 'react';
import {
  ImprovementPlan,
  PlayStatus,
  TaskStatus,
} from '../../../../types/improvementPlan';
import {
  updatePlayStatus,
  addTaskToPlay,
  updateTaskStatus,
  deleteTask,
} from '../../../../utils/improvementPlanUtils';
import PlanHeader from './PlanHeader';
import { KanbanBoard } from '../../../plans';

interface ActivePlanViewProps {
  plan: ImprovementPlan;
  onPlanUpdate: (plan: ImprovementPlan) => void;
  onCreateNewPlan: () => void;
  onNavigateToDimension: (dimensionKey: string) => void;
  onOpenPlanDetail?: (plan: ImprovementPlan) => void;
}

const ActivePlanView: React.FC<ActivePlanViewProps> = ({
  plan,
  onPlanUpdate,
  onCreateNewPlan,
  onNavigateToDimension,
  onOpenPlanDetail,
}) => {
  // Task handlers
  const handleAddTask = useCallback((playId: string, title: string) => {
    const updatedPlan = addTaskToPlay(plan, playId, title);
    onPlanUpdate(updatedPlan);
  }, [plan, onPlanUpdate]);

  const handleTaskStatusChange = useCallback((playId: string, taskId: string, status: TaskStatus) => {
    const updatedPlan = updateTaskStatus(plan, playId, taskId, status);
    onPlanUpdate(updatedPlan);
  }, [plan, onPlanUpdate]);

  const handleDeleteTask = useCallback((playId: string, taskId: string) => {
    const updatedPlan = deleteTask(plan, playId, taskId);
    onPlanUpdate(updatedPlan);
  }, [plan, onPlanUpdate]);

  // Archive plan handler
  const handleArchivePlan = useCallback(() => {
    const updatedPlan = {
      ...plan,
      status: 'archived' as const,
      updatedAt: new Date().toISOString(),
    };
    onPlanUpdate(updatedPlan);
  }, [plan, onPlanUpdate]);

  return (
    <div style={styles.container}>
      {/* Plan Header with progress */}
      <PlanHeader
        plan={plan}
        onArchive={handleArchivePlan}
        onCreateNew={onCreateNewPlan}
        onViewFullPlan={onOpenPlanDetail ? () => onOpenPlanDetail(plan) : undefined}
      />

      {/* Kanban view only */}
      <KanbanBoard
        plan={plan}
        onPlanUpdate={onPlanUpdate}
        onAddTask={handleAddTask}
        onTaskStatusChange={handleTaskStatusChange}
        onDeleteTask={handleDeleteTask}
        onNavigateToDimension={onNavigateToDimension}
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

export default ActivePlanView;
