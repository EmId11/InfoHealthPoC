import React from 'react';
import { useTour } from '../onboarding/TourContext';

interface TourButtonProps {
  /** The page/section ID to start the tour for */
  pageId: number | string;
  /** Optional custom label */
  label?: string;
  /** Variant styling */
  variant?: 'default' | 'compact';
}

/**
 * A visible button that triggers a guided tour of the current page/feature.
 * Designed to be clearly visible and understandable.
 */
const TourButton: React.FC<TourButtonProps> = ({
  pageId,
  label = 'Take a Tour',
  variant = 'default',
}) => {
  const { startTour } = useTour();

  const handleClick = () => {
    startTour(pageId);
  };

  const isCompact = variant === 'compact';

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        ...styles.button,
        ...(isCompact ? styles.buttonCompact : {}),
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#B3D4FF';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#DEEBFF';
      }}
    >
      <svg
        width={isCompact ? '14' : '16'}
        height={isCompact ? '14' : '16'}
        viewBox="0 0 16 16"
        fill="none"
        style={styles.icon}
      >
        {/* Play/guide icon */}
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6.5 5.5L11 8L6.5 10.5V5.5Z"
          fill="currentColor"
        />
      </svg>
      <span style={isCompact ? styles.labelCompact : styles.label}>
        {label}
      </span>
    </button>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    whiteSpace: 'nowrap',
  },
  buttonCompact: {
    padding: '6px 10px',
    fontSize: '13px',
    gap: '6px',
  },
  icon: {
    flexShrink: 0,
  },
  label: {
    lineHeight: 1,
  },
  labelCompact: {
    lineHeight: 1,
  },
};

export default TourButton;
