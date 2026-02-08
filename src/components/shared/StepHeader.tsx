import React from 'react';
import InfoButton from '../common/InfoButton';
import TourButton from '../common/TourButton';

interface StepHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  infoContent?: React.ReactNode;
  /** When provided, shows a "Take a Tour" button that triggers the tour for this page */
  tourId?: number | string;
}

const StepHeader: React.FC<StepHeaderProps> = ({ icon, title, description, infoContent, tourId }) => {
  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>{icon}</div>
      <div style={styles.textContainer}>
        <div style={styles.headerRow}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>{title}</h2>
            {infoContent && (
              <InfoButton title={title}>
                {infoContent}
              </InfoButton>
            )}
          </div>
          {tourId !== undefined && (
            <TourButton pageId={tourId} variant="compact" />
          )}
        </div>
        <p style={styles.description}>{description}</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '1px solid #E6E8EB',
  },
  iconContainer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingTop: '4px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
};

export default StepHeader;
