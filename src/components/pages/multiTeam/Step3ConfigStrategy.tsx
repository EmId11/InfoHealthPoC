import React from 'react';
import StepHeader from '../../shared/StepHeader';
import type { ConfigurationStrategy } from '../../../types/multiTeamAssessment';
import { getConfigurationStrategyDescription } from '../../../types/multiTeamAssessment';

interface Step3ConfigStrategyProps {
  strategy: ConfigurationStrategy;
  onUpdate: (strategy: ConfigurationStrategy) => void;
  teamCount: number;
}

interface StrategyOption {
  value: ConfigurationStrategy;
  icon: React.ReactNode;
  recommended?: boolean;
}

const strategyOptions: StrategyOption[] = [
  {
    value: 'uniform',
    recommended: true,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <line x1="4" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="2" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    value: 'inherit-defaults',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="18" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="14" x2="9" y2="18" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="14" x2="23" y2="18" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    value: 'per-team',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="20" y="4" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="4" y="20" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="20" y="20" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

const Step3ConfigStrategy: React.FC<Step3ConfigStrategyProps> = ({
  strategy,
  onUpdate,
  teamCount,
}) => {
  return (
    <div style={styles.container}>
      <StepHeader
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Configuration Strategy"
        description="Choose how settings will be applied across your teams."
        tourId={3}
        infoContent={
          <>
            <p>Choose your configuration approach:</p>
            <p><strong>Uniform:</strong> Same settings for all {teamCount} teams. Best for consistent teams.</p>
            <p><strong>Inherit Defaults:</strong> Use organization defaults with per-team overrides.</p>
            <p><strong>Per-Team:</strong> Configure each team individually. Most flexible but time-consuming.</p>
          </>
        }
      />

      <div style={styles.content}>
        <div style={styles.strategyCards}>
          {strategyOptions.map((option) => {
            const config = getConfigurationStrategyDescription(option.value);
            const isSelected = strategy === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate(option.value)}
                style={{
                  ...styles.strategyCard,
                  ...(isSelected ? styles.strategyCardSelected : {}),
                }}
              >
                {option.recommended && (
                  <div style={styles.recommendedBadge}>Recommended</div>
                )}
                <div
                  style={{
                    ...styles.strategyIcon,
                    ...(isSelected ? styles.strategyIconSelected : {}),
                  }}
                >
                  {option.icon}
                </div>
                <div style={styles.strategyContent}>
                  <h3 style={styles.strategyTitle}>{config.title}</h3>
                  <p style={styles.strategyDescription}>{config.description}</p>
                  <div style={styles.strategyMeta}>
                    <span style={styles.timeEstimate}>{config.timeEstimate}</span>
                  </div>
                </div>
                <div
                  style={{
                    ...styles.radioIndicator,
                    ...(isSelected ? styles.radioIndicatorSelected : {}),
                  }}
                >
                  {isSelected && <div style={styles.radioIndicatorDot} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Strategy Details */}
        <div style={styles.detailsBox}>
          {strategy === 'uniform' && (
            <>
              <h4 style={styles.detailsTitle}>Uniform Settings</h4>
              <p style={styles.detailsText}>
                You'll configure one set of settings that will be applied to all {teamCount} teams.
                This is ideal when teams have similar practices and cadences.
              </p>
              <ul style={styles.detailsList}>
                <li>Same issue types for all teams</li>
                <li>Same sprint cadence settings</li>
                <li>Same stale thresholds</li>
                <li>Consistent comparison criteria</li>
              </ul>
            </>
          )}

          {strategy === 'inherit-defaults' && (
            <>
              <h4 style={styles.detailsTitle}>Inherit Defaults with Overrides</h4>
              <p style={styles.detailsText}>
                All teams start with organization-wide defaults. You can then customize settings
                for specific teams that have different needs.
              </p>
              <ul style={styles.detailsList}>
                <li>Start with org-defined standards</li>
                <li>Override sprint cadence per team</li>
                <li>Override stale thresholds per team</li>
                <li>Best balance of consistency and flexibility</li>
              </ul>
            </>
          )}

          {strategy === 'per-team' && (
            <>
              <h4 style={styles.detailsTitle}>Individual Team Configuration</h4>
              <p style={styles.detailsText}>
                Configure each of the {teamCount} teams independently. This provides maximum
                flexibility but requires more time to set up.
              </p>
              <ul style={styles.detailsList}>
                <li>Unique settings for each team</li>
                <li>Different cadences supported</li>
                <li>Custom thresholds per team</li>
                <li>Best for diverse team practices</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '700px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  strategyCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  strategyCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    border: '2px solid #DFE1E6',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  strategyCardSelected: {
    border: '2px solid #0052CC',
    backgroundColor: '#FAFBFC',
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-10px',
    right: '16px',
    padding: '4px 10px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '10px',
    textTransform: 'uppercase',
  },
  strategyIcon: {
    flexShrink: 0,
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    color: '#5E6C84',
  },
  strategyIconSelected: {
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
  },
  strategyContent: {
    flex: 1,
    minWidth: 0,
  },
  strategyTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  strategyDescription: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  strategyMeta: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timeEstimate: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
  },
  radioIndicator: {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    border: '2px solid #DFE1E6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  radioIndicatorSelected: {
    border: '2px solid #0052CC',
  },
  radioIndicatorDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#0052CC',
    borderRadius: '50%',
  },
  detailsBox: {
    padding: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  detailsTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  detailsText: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  detailsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.7,
  },
};

export default Step3ConfigStrategy;
