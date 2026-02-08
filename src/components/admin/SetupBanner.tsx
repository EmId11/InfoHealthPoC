import React from 'react';
import Button from '@atlaskit/button/standard-button';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import { SetupStatus } from '../../types/adminSetup';

interface SetupBannerProps {
  title: string;
  status: SetupStatus;
  currentStep?: number;
  totalSteps?: number;
  onStartSetup: () => void;
}

const SetupBanner: React.FC<SetupBannerProps> = ({
  title,
  status,
  currentStep = 0,
  totalSteps = 0,
  onStartSetup,
}) => {
  if (status === 'completed') {
    return null;
  }

  const isInProgress = status === 'in-progress';

  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        <SettingsIcon label="Setup" primaryColor="#6554C0" />
      </div>
      <div style={styles.content}>
        <h3 style={styles.title}>
          {isInProgress
            ? `Setup In Progress (Step ${currentStep} of ${totalSteps})`
            : 'Setup Required'}
        </h3>
        <p style={styles.description}>
          {isInProgress
            ? `Continue where you left off to complete ${title} setup.`
            : `Complete the setup wizard to configure ${title}.`}
        </p>
      </div>
      <Button
        appearance="primary"
        onClick={onStartSetup}
        style={styles.button}
      >
        {isInProgress ? 'Resume Setup' : 'Start Setup'}
      </Button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#EAE6FF',
    borderRadius: '8px',
    border: '1px solid #C0B6F2',
    marginBottom: '24px',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#403294',
  },
  description: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#5243AA',
  },
  button: {
    flexShrink: 0,
    backgroundColor: '#6554C0',
  },
};

export default SetupBanner;
