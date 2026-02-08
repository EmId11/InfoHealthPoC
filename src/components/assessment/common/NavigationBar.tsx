import React from 'react';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';

interface NavigationBarProps {
  backLabel: string;
  onBack: () => void;
  breadcrumbItems: string[];
}

/**
 * Shared navigation bar component for detail pages.
 * Displays a white bar with:
 * - Left: Back button with label
 * - Right: Breadcrumb path
 *
 * This pattern is used on dimension detail, outcome detail, and indicator drill-down pages.
 */
const NavigationBar: React.FC<NavigationBarProps> = ({
  backLabel,
  onBack,
  breadcrumbItems,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button
          style={styles.backButton}
          onClick={onBack}
          aria-label={backLabel}
        >
          <ArrowLeftIcon label="" size="medium" primaryColor="#42526E" />
          <span style={styles.backText}>{backLabel}</span>
        </button>

        <div style={styles.breadcrumb}>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span style={styles.breadcrumbSeparator}>/</span>}
              <span
                style={
                  index === breadcrumbItems.length - 1
                    ? styles.breadcrumbCurrent
                    : styles.breadcrumbItem
                }
              >
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #DFE1E6',
    zIndex: 100,
    padding: '16px 32px',
    marginLeft: '-24px',
    marginRight: '-24px',
    marginTop: '-32px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  backText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526E',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breadcrumbItem: {
    fontSize: '14px',
    color: '#6B778C',
  },
  breadcrumbSeparator: {
    fontSize: '14px',
    color: '#C1C7D0',
  },
  breadcrumbCurrent: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
};

export default NavigationBar;
