import React, { useState } from 'react';

interface InfoButtonProps {
  title: string;
  children: React.ReactNode;
  size?: 'standard' | 'inline';
}

const InfoButton: React.FC<InfoButtonProps> = ({ title, children, size = 'standard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const buttonStyle = size === 'inline'
    ? { ...styles.infoButton, ...styles.infoButtonInline }
    : styles.infoButton;

  const iconSize = size === 'inline' ? 14 : 16;
  const iconCenter = iconSize / 2;
  const iconRadius = (iconSize / 2) - 1;

  return (
    <>
      <button
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...buttonStyle,
          backgroundColor: isHovered ? '#F4F5F7' : 'transparent',
          color: isHovered ? '#5243AA' : '#5E6C84',
        }}
        title={`Learn more about ${title}`}
        type="button"
      >
        <svg width={iconSize} height={iconSize} viewBox={`0 0 ${iconSize} ${iconSize}`} fill="none">
          <circle cx={iconCenter} cy={iconCenter} r={iconRadius} stroke="currentColor" strokeWidth="1.5"/>
          <path
            d={size === 'inline'
              ? "M5.5 5.5a1.5 1.5 0 1 1 1.875 1.455V8.25"
              : "M6 6a2 2 0 1 1 2.5 1.94V9.5"
            }
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx={iconCenter}
            cy={size === 'inline' ? 10.5 : 12}
            r={size === 'inline' ? 0.6 : 0.75}
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div style={styles.modalOverlay} onClick={handleOverlayClick}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{title}</h3>
              <button
                onClick={handleClose}
                style={styles.closeButton}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div style={styles.modalContent}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  infoButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    color: '#5E6C84',
    cursor: 'pointer',
    transition: 'color 0.15s ease, background-color 0.15s ease',
    flexShrink: 0,
  },
  infoButtonInline: {
    width: '18px',
    height: '18px',
    marginLeft: '4px',
    verticalAlign: 'middle',
  },
  modalOverlay: {
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
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#6B778C',
    cursor: 'pointer',
  },
  modalContent: {
    padding: '24px',
    overflow: 'auto',
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#172B4D',
  },
};

export default InfoButton;
