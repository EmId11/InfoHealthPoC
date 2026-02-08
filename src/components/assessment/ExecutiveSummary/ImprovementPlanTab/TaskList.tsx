import React, { useState } from 'react';
import { PlanTask, TaskStatus } from '../../../../types/improvementPlan';

interface TaskListProps {
  tasks: PlanTask[];
  onAddTask: (title: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onTaskStatusChange,
  onDeleteTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  // Get status icon based on task status
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="#36B37E" />
            <path d="M4.5 8L7 10.5L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#0052CC" strokeWidth="2" />
            <circle cx="8" cy="8" r="3" fill="#0052CC" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#DFE1E6" strokeWidth="2" />
          </svg>
        );
    }
  };

  // Cycle through statuses on click
  const cycleStatus = (currentStatus: TaskStatus): TaskStatus => {
    switch (currentStatus) {
      case 'pending': return 'in-progress';
      case 'in-progress': return 'completed';
      case 'completed': return 'pending';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Tasks</span>
        {tasks.length > 0 && (
          <span style={styles.headerCount}>
            {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
          </span>
        )}
      </div>

      {/* Task list */}
      {tasks.length > 0 && (
        <div style={styles.tasksList}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                ...styles.taskItem,
                opacity: task.status === 'completed' ? 0.7 : 1,
              }}
            >
              <button
                style={styles.statusButton}
                onClick={() => onTaskStatusChange(task.id, cycleStatus(task.status))}
                title="Click to change status"
              >
                {getStatusIcon(task.status)}
              </button>
              <span
                style={{
                  ...styles.taskTitle,
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </span>
              <button
                style={styles.deleteButton}
                onClick={() => onDeleteTask(task.id)}
                title="Remove task"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 4L10 10M10 4L4 10" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add task form */}
      {isAdding ? (
        <form onSubmit={handleSubmit} style={styles.addForm}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task description..."
            style={styles.addInput}
            autoFocus
          />
          <div style={styles.addFormButtons}>
            <button type="submit" style={styles.saveButton} disabled={!newTaskTitle.trim()}>
              Add
            </button>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => {
                setNewTaskTitle('');
                setIsAdding(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button style={styles.addButton} onClick={() => setIsAdding(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add task
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  headerCount: {
    fontSize: '11px',
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
    transition: 'opacity 0.15s ease',
  },
  statusButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
  taskTitle: {
    flex: 1,
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.4,
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 0.5,
    transition: 'opacity 0.15s ease',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px dashed #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  addForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
    border: '1px solid #DFE1E6',
  },
  addInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  addFormButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  saveButton: {
    padding: '6px 12px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
};

export default TaskList;
