import React, { useState, useEffect, useRef } from 'react';
import { useTour } from './TourContext';

/**
 * Simple page-level guidance component.
 * Shows ONE tooltip per page explaining what to do.
 * User clicks "Got it" to dismiss, then uses normal wizard navigation.
 */
const PageGuidance: React.FC = () => {
  const {
    currentGuidance,
    isShowingGuidance,
    dismissGuidance,
    dismissGuidancePermanently,
    currentStepIndex,
    totalSteps,
    nextStep,
    previousStep,
  } = useTour();

  const isMultiStep = totalSteps > 1;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate position based on target element
  useEffect(() => {
    if (!isShowingGuidance || !currentGuidance) return;

    const updatePosition = () => {
      const target = document.querySelector(currentGuidance.target);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      const tooltipWidth = 340;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 180;
      const padding = 16;

      let top = 0;
      let left = 0;

      switch (currentGuidance.placement) {
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'top':
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          break;
      }

      // Keep within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isShowingGuidance, currentGuidance]);

  if (!isShowingGuidance || !currentGuidance) {
    return null;
  }

  return (
    <>
      {/* Subtle overlay - allows clicks through */}
      <div style={styles.overlay} onClick={dismissGuidance} />

      {/* Highlight ring around target element */}
      {targetRect && (
        <div
          style={{
            ...styles.highlight,
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div ref={tooltipRef} style={{ ...styles.tooltip, top: position.top, left: position.left }}>
        <div style={styles.header}>
          <h3 style={styles.title}>{currentGuidance.title}</h3>
        </div>

        <p style={styles.content}>{currentGuidance.content}</p>

        {currentGuidance.tip && (
          <div style={styles.tipBox}>
            <span style={styles.tipIcon}>💡</span>
            <span style={styles.tipText}>{currentGuidance.tip}</span>
          </div>
        )}

        <div style={styles.footer}>
          {isMultiStep ? (
            <>
              <span style={styles.stepIndicator}>
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <div style={styles.navButtons}>
                {!isFirstStep && (
                  <button style={styles.previousButton} onClick={previousStep}>
                    Previous
                  </button>
                )}
                <button style={styles.nextButton} onClick={nextStep}>
                  {isLastStep ? 'Finish' : 'Next'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button style={styles.dontShowButton} onClick={dismissGuidancePermanently}>
                Don't show tips
              </button>
              <button style={styles.gotItButton} onClick={dismissGuidance}>
                Got it
              </button>
            </>
          )}
        </div>

        {/* Arrow pointing to target */}
        <div
          style={{
            ...styles.arrow,
            ...(currentGuidance.placement === 'bottom' ? styles.arrowTop : {}),
            ...(currentGuidance.placement === 'top' ? styles.arrowBottom : {}),
            ...(currentGuidance.placement === 'left' ? styles.arrowRight : {}),
            ...(currentGuidance.placement === 'right' ? styles.arrowLeft : {}),
          }}
        />
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.3)',
    zIndex: 9998,
    // Allow clicks to pass through to dismiss
    cursor: 'pointer',
  },
  highlight: {
    position: 'fixed',
    border: '3px solid #0052CC',
    borderRadius: '8px',
    boxShadow: '0 0 0 4px rgba(0, 82, 204, 0.2)',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'all 0.2s ease',
  },
  tooltip: {
    position: 'fixed',
    width: '340px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    zIndex: 10000,
    animation: 'fadeIn 0.2s ease',
  },
  header: {
    padding: '16px 16px 0 16px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  content: {
    margin: 0,
    padding: '12px 16px',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  tipBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    margin: '0 16px 16px 16px',
    padding: '10px 12px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
    border: '1px solid #FFE380',
  },
  tipIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  tipText: {
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.4,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #EBECF0',
  },
  dontShowButton: {
    padding: '6px 12px',
    fontSize: '13px',
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  gotItButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  stepIndicator: {
    fontSize: '13px',
    color: '#6B778C',
    fontWeight: 500,
  },
  navButtons: {
    display: 'flex',
    gap: '8px',
  },
  previousButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526E',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  nextButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  arrow: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: '#FFFFFF',
    transform: 'rotate(45deg)',
  },
  arrowTop: {
    top: '-6px',
    left: '50%',
    marginLeft: '-6px',
    boxShadow: '-2px -2px 4px rgba(9, 30, 66, 0.1)',
  },
  arrowBottom: {
    bottom: '-6px',
    left: '50%',
    marginLeft: '-6px',
    boxShadow: '2px 2px 4px rgba(9, 30, 66, 0.1)',
  },
  arrowLeft: {
    left: '-6px',
    top: '50%',
    marginTop: '-6px',
    boxShadow: '-2px 2px 4px rgba(9, 30, 66, 0.1)',
  },
  arrowRight: {
    right: '-6px',
    top: '50%',
    marginTop: '-6px',
    boxShadow: '2px -2px 4px rgba(9, 30, 66, 0.1)',
  },
};

export default PageGuidance;
