import React from 'react';
import { OrgHierarchyLevel } from '../../../../../types/admin';
import LevelCard from './LevelCard';
import { MAX_CUSTOM_LEVELS, generateLevelId, getNextAvailableColor } from './constants';

interface LevelBuilderProps {
  levels: OrgHierarchyLevel[];
  onLevelsChange: (levels: OrgHierarchyLevel[]) => void;
}

const LevelBuilder: React.FC<LevelBuilderProps> = ({ levels, onLevelsChange }) => {
  const canAddLevel = levels.length < MAX_CUSTOM_LEVELS;

  const handleUpdateLevel = (levelId: string, updates: Partial<OrgHierarchyLevel>) => {
    onLevelsChange(
      levels.map((level) =>
        level.id === levelId ? { ...level, ...updates } : level
      )
    );
  };

  const handleDeleteLevel = (levelId: string) => {
    const newLevels = levels.filter((level) => level.id !== levelId);
    // Recompute order for remaining levels
    const reorderedLevels = newLevels.map((level, index) => ({
      ...level,
      order: index,
    }));
    onLevelsChange(reorderedLevels);
  };

  const handleMoveLevel = (levelId: string, direction: 'up' | 'down') => {
    const currentIndex = levels.findIndex((l) => l.id === levelId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= levels.length) return;

    const newLevels = [...levels];
    [newLevels[currentIndex], newLevels[newIndex]] = [newLevels[newIndex], newLevels[currentIndex]];

    // Update order for all levels
    const reorderedLevels = newLevels.map((level, index) => ({
      ...level,
      order: index,
    }));
    onLevelsChange(reorderedLevels);
  };

  const handleAddLevel = () => {
    if (!canAddLevel) return;

    const newLevel: OrgHierarchyLevel = {
      id: generateLevelId(),
      name: 'New Level',
      pluralName: 'New Levels',
      color: getNextAvailableColor(levels),
      isMandatory: false,
      order: levels.length,
    };

    onLevelsChange([...levels, newLevel]);
  };

  if (levels.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Customize Your Levels</h3>
          <p style={styles.subtitle}>
            Add levels above teams to create your organization structure
          </p>
        </div>
        <div style={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="20" width="32" height="16" rx="4" fill="#F4F5F7" stroke="#DFE1E6" strokeWidth="2" strokeDasharray="4 2" />
            <path d="M24 24v8M20 28h8" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p style={styles.emptyText}>No levels added yet</p>
          <button style={styles.addButton} onClick={handleAddLevel}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add your first level
          </button>
        </div>
        {/* Teams level is always at the bottom */}
        <div style={styles.teamsSection}>
          <LevelCard
            level={{
              id: 'teams',
              name: 'Teams',
              pluralName: 'Teams',
              color: '#36B37E',
              isMandatory: true,
              order: 999,
            }}
            isTeamsLevel
            canDelete={false}
            canMoveUp={false}
            canMoveDown={false}
            onUpdate={() => {}}
            onDelete={() => {}}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Customize Your Levels</h3>
        <p style={styles.subtitle}>
          Edit level names, colors, and mandatory settings. Drag to reorder.
        </p>
      </div>

      <div style={styles.levelsList}>
        {levels.map((level, index) => (
          <React.Fragment key={level.id}>
            <LevelCard
              level={level}
              canDelete={true}
              canMoveUp={index > 0}
              canMoveDown={index < levels.length - 1}
              onUpdate={(updates) => handleUpdateLevel(level.id, updates)}
              onDelete={() => handleDeleteLevel(level.id)}
              onMoveUp={() => handleMoveLevel(level.id, 'up')}
              onMoveDown={() => handleMoveLevel(level.id, 'down')}
            />
            {/* Connector between levels */}
            <div style={styles.connector}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16M7 15l5 5 5-5" stroke="#DFE1E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </React.Fragment>
        ))}

        {/* Add Level Button (between custom levels and Teams) */}
        {canAddLevel && (
          <button style={styles.addLevelButton} onClick={handleAddLevel}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add level above Teams
          </button>
        )}
        {!canAddLevel && (
          <div style={styles.maxLevelsNote}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#6B778C" strokeWidth="1.5"/>
              <path d="M8 5v3M8 10h.01" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Maximum {MAX_CUSTOM_LEVELS} levels allowed
          </div>
        )}

        {/* Teams level is always at the bottom */}
        <div style={styles.teamsSection}>
          <LevelCard
            level={{
              id: 'teams',
              name: 'Teams',
              pluralName: 'Teams',
              color: '#36B37E',
              isMandatory: true,
              order: 999,
            }}
            isTeamsLevel
            canDelete={false}
            canMoveUp={false}
            canMoveDown={false}
            onUpdate={() => {}}
            onDelete={() => {}}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
          />
        </div>
      </div>

      {/* Validation Messages */}
      {levels.some(l => !l.name.trim()) && (
        <div style={styles.validationError}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#DE350B" strokeWidth="1.5"/>
            <path d="M8 5v3M8 10h.01" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Level names cannot be empty
        </div>
      )}
      {hasDuplicateNames(levels) && (
        <div style={styles.validationError}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#DE350B" strokeWidth="1.5"/>
            <path d="M8 5v3M8 10h.01" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Level names must be unique
        </div>
      )}
    </div>
  );
};

// Helper function to check for duplicate level names
const hasDuplicateNames = (levels: OrgHierarchyLevel[]): boolean => {
  const names = levels.map(l => l.name.toLowerCase().trim());
  return names.length !== new Set(names).size;
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  levelsList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  connector: {
    display: 'flex',
    justifyContent: 'center',
    padding: '4px 0',
  },
  teamsSection: {
    marginTop: '8px',
  },
  addLevelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#F3F0FF',
    border: '2px dashed #6554C0',
    borderRadius: '8px',
    color: '#5243AA',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    marginBottom: '8px',
  },
  maxLevelsNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    color: '#6B778C',
    fontSize: '12px',
    marginBottom: '8px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    gap: '12px',
    marginBottom: '16px',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  validationError: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFEBE6',
    borderRadius: '4px',
    color: '#DE350B',
    fontSize: '13px',
  },
};

export default LevelBuilder;
