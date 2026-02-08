import React, { useState } from 'react';

interface SaveReportModalProps {
  onSave: (name: string, description: string, isPublic: boolean) => void;
  onClose: () => void;
}

const SaveReportModal: React.FC<SaveReportModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Report name is required');
      return;
    }
    onSave(name.trim(), description.trim(), isPublic);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Save Report</h3>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Form */}
        <div style={styles.content}>
          <div style={styles.field}>
            <label style={styles.label}>
              Report Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Stale Issues Report"
              autoFocus
            />
            {error && <span style={styles.error}>{error}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description to help others understand this report..."
              rows={3}
            />
          </div>

          <div style={styles.checkboxField}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span style={styles.checkboxText}>
                Make this report public (create shareable link)
              </span>
            </label>
            {isPublic && (
              <p style={styles.publicNote}>
                Anyone with the link will be able to view this report.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(name.trim() ? {} : styles.saveButtonDisabled),
            }}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '480px',
    maxWidth: '90vw',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    padding: '4px 8px',
    fontSize: '24px',
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  required: {
    color: '#DE350B',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  error: {
    fontSize: '12px',
    color: '#DE350B',
  },
  checkboxField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#172B4D',
  },
  publicNote: {
    margin: 0,
    padding: '8px 12px',
    fontSize: '12px',
    color: '#6B778C',
    backgroundColor: '#FFFAE6',
    borderRadius: '4px',
    borderLeft: '3px solid #FFAB00',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px 20px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  cancelButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526E',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveButtonDisabled: {
    backgroundColor: '#B3D4FF',
    cursor: 'not-allowed',
  },
};

export default SaveReportModal;
