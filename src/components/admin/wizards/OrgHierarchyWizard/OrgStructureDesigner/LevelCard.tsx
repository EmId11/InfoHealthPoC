import React, { useState } from 'react';
import { OrgHierarchyLevel } from '../../../../../types/admin';
import { LEVEL_COLOR_OPTIONS, LEVEL_COLORS } from './constants';

interface LevelCardProps {
  level: OrgHierarchyLevel;
  isTeamsLevel?: boolean;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (updates: Partial<OrgHierarchyLevel>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  isTeamsLevel = false,
  canDelete,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(level.name);
  const [editPluralName, setEditPluralName] = useState(level.pluralName);
  const [editAliases, setEditAliases] = useState(level.aliases?.join(', ') || '');

  const handleSave = () => {
    if (editName.trim() && editPluralName.trim()) {
      const aliasesArray = editAliases
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
      onUpdate({
        name: editName.trim(),
        pluralName: editPluralName.trim(),
        aliases: aliasesArray.length > 0 ? aliasesArray : undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(level.name);
    setEditPluralName(level.pluralName);
    setEditAliases(level.aliases?.join(', ') || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isTeamsLevel) {
    return (
      <div style={{ ...styles.card, ...styles.teamsCard }}>
        <div style={styles.cardHeader}>
          <div style={styles.dragHandle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#DFE1E6">
              <path d="M6 4h4v1H6zm0 3.5h4v1H6zm0 3.5h4v1H6z" />
            </svg>
          </div>
          <div
            style={{
              ...styles.colorDot,
              backgroundColor: LEVEL_COLORS.green,
            }}
          />
          <span style={styles.levelName}>Teams</span>
          <span style={styles.fixedBadge}>Fixed at bottom</span>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div style={{ ...styles.card, ...styles.cardEditing }}>
        <div style={styles.editHeader}>
          <span style={styles.editTitle}>Editing: {level.name}</span>
        </div>
        <div style={styles.editContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name (singular)</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
              placeholder="e.g., Portfolio"
              autoFocus
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Plural name</label>
            <input
              type="text"
              value={editPluralName}
              onChange={(e) => setEditPluralName(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
              placeholder="e.g., Portfolios"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Also called (optional)</label>
            <input
              type="text"
              value={editAliases}
              onChange={(e) => setEditAliases(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
              placeholder="e.g., Program, ART (comma-separated)"
            />
            <span style={styles.hint}>Alternative names some organizations may use</span>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Color</label>
            <div style={styles.colorOptions}>
              {LEVEL_COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  style={{
                    ...styles.colorButton,
                    backgroundColor: option.value,
                    ...(level.color === option.value ? styles.colorButtonSelected : {}),
                  }}
                  onClick={() => onUpdate({ color: option.value })}
                  title={option.label}
                />
              ))}
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mandatory</label>
            <button
              style={{
                ...styles.toggleButton,
                ...(level.isMandatory ? styles.toggleButtonOn : styles.toggleButtonOff),
              }}
              onClick={() => onUpdate({ isMandatory: !level.isMandatory })}
            >
              <span
                style={{
                  ...styles.toggleKnob,
                  ...(level.isMandatory ? styles.toggleKnobOn : styles.toggleKnobOff),
                }}
              />
            </button>
            <span style={styles.toggleLabel}>
              {level.isMandatory
                ? `Every team must belong to a ${level.name}`
                : `${level.name} assignment is optional`}
            </span>
          </div>
          <div style={styles.editActions}>
            <button style={styles.saveButton} onClick={handleSave}>
              Save
            </button>
            <button style={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.dragHandle}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#6B778C">
            <path d="M6 4h4v1H6zm0 3.5h4v1H6zm0 3.5h4v1H6z" />
          </svg>
        </div>
        <div
          style={{
            ...styles.colorDot,
            backgroundColor: level.color,
          }}
        />
        <div style={styles.levelInfo}>
          <span style={styles.levelName}>{level.name}</span>
          {level.aliases && level.aliases.length > 0 && (
            <span style={styles.aliasesText}>Also: {level.aliases.join(', ')}</span>
          )}
        </div>
        <span style={level.isMandatory ? styles.mandatoryBadge : styles.optionalBadge}>
          {level.isMandatory ? 'Mandatory' : 'Optional'}
        </span>
        <div style={styles.actions}>
          {canMoveUp && (
            <button style={styles.iconButton} onClick={onMoveUp} title="Move up">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4l4 4H4l4-4z" fill="currentColor" />
              </svg>
            </button>
          )}
          {canMoveDown && (
            <button style={styles.iconButton} onClick={onMoveDown} title="Move down">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 12l-4-4h8l-4 4z" fill="currentColor" />
              </svg>
            </button>
          )}
          <button style={styles.iconButton} onClick={() => setIsEditing(true)} title="Edit">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {canDelete && (
            <button style={styles.iconButton} onClick={onDelete} title="Delete">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
  },
  cardEditing: {
    border: '2px solid #6554C0',
    boxShadow: '0 4px 8px rgba(101, 84, 192, 0.15)',
  },
  teamsCard: {
    backgroundColor: '#F4F5F7',
    borderStyle: 'dashed',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
  },
  dragHandle: {
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
  },
  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  levelInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  levelName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  aliasesText: {
    fontSize: '11px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  mandatoryBadge: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#DE350B',
    backgroundColor: '#FFEBE6',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  optionalBadge: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  fixedBadge: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
    transition: 'background-color 0.15s',
  },
  editHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#F3F0FF',
    borderRadius: '8px 8px 0 0',
  },
  editTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5243AA',
    textTransform: 'uppercase',
  },
  editContent: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  input: {
    padding: '8px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  hint: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '4px',
  },
  colorOptions: {
    display: 'flex',
    gap: '8px',
  },
  colorButton: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'transform 0.15s, border-color 0.15s',
  },
  colorButtonSelected: {
    border: '2px solid #172B4D',
    transform: 'scale(1.1)',
  },
  toggleButton: {
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    padding: 0,
  },
  toggleButtonOn: {
    backgroundColor: '#6554C0',
  },
  toggleButtonOff: {
    backgroundColor: '#DFE1E6',
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'left 0.2s',
  },
  toggleKnobOn: {
    left: '22px',
  },
  toggleKnobOff: {
    left: '2px',
  },
  toggleLabel: {
    fontSize: '12px',
    color: '#6B778C',
    marginLeft: '12px',
  },
  editActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#F4F5F7',
    color: '#172B4D',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
};

export default LevelCard;
