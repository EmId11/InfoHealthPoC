import React, { useState } from 'react';
import { SavedJQLReport } from '../../../../types/reports';

interface SaveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Omit<SavedJQLReport, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'>) => void;
  currentQuery: string;
  existingReport?: SavedJQLReport; // For editing existing reports
}

const SaveReportModal: React.FC<SaveReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentQuery,
  existingReport,
}) => {
  const [name, setName] = useState(existingReport?.name || '');
  const [description, setDescription] = useState(existingReport?.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Report name is required');
      return;
    }

    if (name.trim().length < 3) {
      setError('Report name must be at least 3 characters');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      jqlQuery: currentQuery,
      createdByUserName: 'Current User', // Would come from auth context
    });

    // Reset form
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {existingReport ? 'Update Report' : 'Save Report'}
          </h2>
          <button onClick={handleClose} style={styles.closeButton}>
            x
          </button>
        </div>

        <div style={styles.content}>
          {/* Query preview */}
          <div style={styles.queryPreview}>
            <label style={styles.previewLabel}>Query to save:</label>
            <code style={styles.queryCode}>{currentQuery}</code>
          </div>

          {/* Name input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Report Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g., High Risk Teams Weekly"
              style={styles.input}
              autoFocus
            />
          </div>

          {/* Description input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this report..."
              style={styles.textarea}
              rows={3}
            />
          </div>

          {/* Error message */}
          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.footer}>
          <button onClick={handleClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            {existingReport ? 'Update Report' : 'Save Report'}
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
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#6B778C',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
  },
  queryPreview: {
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
  },
  previewLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  queryCode: {
    display: 'block',
    fontFamily: 'SFMono-Regular, Consolas, monospace',
    fontSize: '13px',
    color: '#172B4D',
    wordBreak: 'break-word',
    lineHeight: '1.4',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '6px',
  },
  required: {
    color: '#DE350B',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  error: {
    padding: '10px 12px',
    backgroundColor: '#FFEBE6',
    borderRadius: '4px',
    color: '#DE350B',
    fontSize: '13px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};

export default SaveReportModal;
