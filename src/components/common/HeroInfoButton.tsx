import React, { useState } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';

interface HeroInfoButtonProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Info button styled for blue hero backgrounds.
 * Semi-transparent white button that opens a modal with explanatory content.
 */
const HeroInfoButton: React.FC<HeroInfoButtonProps> = ({ title, children }) => {
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

  return (
    <>
      <button
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...styles.infoButton,
          backgroundColor: isHovered
            ? 'rgba(9, 30, 66, 0.12)'
            : 'rgba(9, 30, 66, 0.06)',
        }}
        title={`Learn more about ${title}`}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="#6B778C" strokeWidth="1.5" />
          <path
            d="M7 7a2 2 0 1 1 2.5 1.94V10.5"
            stroke="#6B778C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="9" cy="13" r="0.75" fill="#6B778C" />
        </svg>
      </button>

      {isOpen && (
        <div style={styles.modalOverlay} onClick={handleOverlayClick}>
          <div style={styles.modal}>
            {/* Decorative header with gradient */}
            <div style={styles.modalHeaderBanner}>
              <div style={styles.headerIconContainer}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="2" />
                  <path
                    d="M10 10.5a4 4 0 1 1 5 3.88V17"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="21" r="1.5" fill="white" />
                </svg>
              </div>
              <h3 style={styles.modalTitle}>{title}</h3>
              <button
                onClick={handleClose}
                style={styles.closeButton}
                type="button"
              >
                <CrossIcon label="Close" size="small" primaryColor="white" />
              </button>
            </div>
            <div style={styles.modalContent}>{children}</div>
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
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.06)',
    border: '1px solid rgba(9, 30, 66, 0.15)',
    borderRadius: '50%',
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    flexShrink: 0,
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
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
    maxWidth: '560px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeaderBanner: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
    padding: '24px 24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
  },
  headerIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: 'white',
    flex: 1,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  modalContent: {
    padding: '24px',
    overflow: 'auto',
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#172B4D',
  },
};

export default HeroInfoButton;
