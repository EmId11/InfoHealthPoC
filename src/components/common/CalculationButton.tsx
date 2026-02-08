import React, { useState } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';

interface CalculationButtonProps {
  title: string;
  children: React.ReactNode;
  variant?: 'link' | 'button' | 'icon';
  linkText?: string; // Custom link text (defaults to "How is this calculated?")
}

/**
 * Standardized "How is this calculated?" button.
 * Opens a modal explaining the calculation methodology.
 * Uses a graph/chart icon to differentiate from the info button.
 */
const CalculationButton: React.FC<CalculationButtonProps> = ({
  title,
  children,
  variant = 'link',
  linkText = 'How is this calculated?',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    setShowTooltip(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getButtonStyle = () => {
    if (variant === 'icon') {
      return {
        ...styles.iconVariant,
        backgroundColor: isHovered ? '#F4F5F7' : 'white',
        borderColor: isHovered ? '#0052CC' : '#DFE1E6',
      };
    }
    if (variant === 'button') {
      return {
        ...styles.baseButton,
        ...styles.buttonVariant,
        backgroundColor: isHovered ? '#F4F5F7' : 'transparent',
      };
    }
    return {
      ...styles.baseButton,
      ...styles.linkVariant,
      backgroundColor: isHovered ? 'rgba(0, 82, 204, 0.05)' : 'transparent',
    };
  };

  // Custom chart/graph icon SVG
  const ChartIcon = ({ size = 16, color = '#0052CC' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="9" width="3" height="6" rx="0.5" fill={color} />
      <rect x="6" y="5" width="3" height="10" rx="0.5" fill={color} />
      <rect x="11" y="1" width="3" height="14" rx="0.5" fill={color} />
    </svg>
  );

  // Icon-only variant with tooltip
  if (variant === 'icon') {
    return (
      <>
        <div style={styles.iconWrapper}>
          <button
            onClick={handleOpen}
            onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
            onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
            style={getButtonStyle()}
            type="button"
            aria-label="How is this calculated?"
          >
            <ChartIcon size={18} color={isHovered ? '#0052CC' : '#6B778C'} />
          </button>
          {showTooltip && (
            <div style={styles.tooltip}>
              How is this calculated?
              <div style={styles.tooltipArrow} />
            </div>
          )}
        </div>

        {isOpen && (
          <div style={styles.modalOverlay} onClick={handleOverlayClick}>
            <div style={styles.modal}>
              <div style={styles.modalHeaderBanner}>
                <div style={styles.headerIconContainer}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="2" y="18" width="6" height="12" rx="1" fill="white" opacity="0.9" />
                    <rect x="12" y="10" width="6" height="20" rx="1" fill="white" opacity="0.9" />
                    <rect x="22" y="2" width="6" height="28" rx="1" fill="white" opacity="0.9" />
                  </svg>
                </div>
                <h3 style={styles.modalTitle}>{title}</h3>
                <button onClick={handleClose} style={styles.closeButton} type="button">
                  <CrossIcon label="Close" size="small" primaryColor="white" />
                </button>
              </div>
              <div style={styles.modalContent}>{children}</div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={getButtonStyle()}
        type="button"
      >
        <ChartIcon />
        {linkText && <span>{linkText}</span>}
      </button>

      {isOpen && (
        <div style={styles.modalOverlay} onClick={handleOverlayClick}>
          <div style={styles.modal}>
            {/* Decorative header with gradient */}
            <div style={styles.modalHeaderBanner}>
              <div style={styles.headerIconContainer}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="18" width="6" height="12" rx="1" fill="white" opacity="0.9" />
                  <rect x="12" y="10" width="6" height="20" rx="1" fill="white" opacity="0.9" />
                  <rect x="22" y="2" width="6" height="28" rx="1" fill="white" opacity="0.9" />
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
  baseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    color: '#0052CC',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    fontFamily: 'inherit',
  },
  linkVariant: {
    padding: '4px 8px',
    borderRadius: '4px',
    background: 'none',
  },
  buttonVariant: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #DFE1E6',
    backgroundColor: '#F4F5F7',
  },
  iconWrapper: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 10,
  },
  iconVariant: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  tooltip: {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '8px',
    padding: '6px 10px',
    backgroundColor: '#172B4D',
    color: 'white',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
  },
  tooltipArrow: {
    position: 'absolute',
    top: '-6px',
    right: '12px',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: '6px solid #172B4D',
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
    maxWidth: '640px',
    width: '90%',
    maxHeight: '90vh',
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

export default CalculationButton;
