import React, { useState } from 'react';
import Button from '@atlaskit/button/standard-button';
import CrossIcon from '@atlaskit/icon/glyph/cross';

interface Step0Props {
  onGetStarted: () => void;
}

interface ImpactDetail {
  id: string;
  title: string;
  icon: React.ReactNode;
  summary: string;
  scenarios: string[];
  research: {
    stat: string;
    source: string;
    url?: string;
  }[];
  bottomLine: string;
}

const impactDetails: ImpactDetail[] = [
  {
    id: 'planning',
    title: 'Inaccurate Planning',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#DE350B" strokeWidth="2"/>
        <path d="M3 9h18M9 9v12" stroke="#DE350B" strokeWidth="2"/>
        <path d="M13 13h4M13 17h4" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    summary: 'When work happens outside Jira, sprint planning becomes guesswork. Teams consistently overcommit because they can\'t see the full picture of what\'s actually consuming their time.',
    scenarios: [
      'A team plans for 40 story points but only delivers 25 because "urgent production issues" consumed 40% of their sprint—none of which was tracked',
      'Developers spend hours daily in meetings, code reviews, and mentoring that never appears in capacity calculations',
    ],
    research: [
      {
        stat: 'Unplanned work and rework consume 28-35% of total development capacity on average',
        source: 'Accelerate: State of DevOps Report',
        url: 'https://dora.dev/research/'
      },
      {
        stat: '62% of work time is spent on "work about work" rather than skilled tasks',
        source: 'Asana Anatomy of Work Index 2021',
        url: 'https://asana.com/resources/anatomy-of-work'
      },
    ],
    bottomLine: 'Without visibility into all work, every sprint plan is built on incomplete data—leading to chronic overcommitment and missed deadlines.',
  },
  {
    id: 'surprises',
    title: 'Delivery Surprises',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#DE350B" strokeWidth="2"/>
        <path d="M12 7v5l3 3" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    summary: 'Hidden work creates a gap between what leadership sees and what\'s actually happening. Projects appear on track until suddenly they\'re not—blindsiding stakeholders.',
    scenarios: [
      'A "90% complete" feature stays at 90% for weeks because integration work, testing, and bug fixes weren\'t visible in the original estimate',
      'A release gets delayed because the team spent weeks on technical debt that was never communicated upward',
      'Stakeholders lose trust when deadlines slip repeatedly for reasons that seem to "come out of nowhere"',
      'Status reports show green across the board while the team knows reality is very different',
    ],
    research: [
      {
        stat: 'Only 43% of organizations report completing projects within budget, and 29% on time',
        source: 'PMI Pulse of the Profession 2020',
        url: 'https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2020'
      },
    ],
    bottomLine: 'Invisible work doesn\'t just slow you down—it erodes stakeholder confidence and makes accurate forecasting impossible.',
  },
  {
    id: 'burnout',
    title: 'Team Burnout',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#DE350B" strokeWidth="2"/>
        <circle cx="9" cy="7" r="4" stroke="#DE350B" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    summary: 'When invisible work isn\'t acknowledged, team members feel like they\'re constantly failing despite working harder than ever. This invisible load leads to frustration, disengagement, and eventually attrition.',
    scenarios: [
      'A senior developer spends half their time mentoring juniors and reviewing PRs—work that\'s essential but never shows up in their "output"',
      'Performance reviews focus on Jira velocity while ignoring the critical glue work that keeps the team functioning',
    ],
    research: [
      {
        stat: '83% of developers suffer from burnout, with workload cited as the top cause',
        source: 'Haystack Analytics Developer Burnout Index',
        url: 'https://www.usehaystack.io/blog/83-of-developers-suffer-from-burnout-haystack-analytics-study-finds'
      },
      {
        stat: '"Non-promotable tasks" fall disproportionately on certain team members and are rarely tracked',
        source: 'Harvard Business Review: The No Club',
        url: 'https://hbr.org/2022/03/research-women-are-asked-to-do-more-office-housework-heres-how-to-push-back'
      },
      {
        stat: 'Teams with high trust and psychological safety report 50% higher productivity',
        source: 'Google Project Aristotle',
        url: 'https://rework.withgoogle.com/guides/understanding-team-effectiveness/'
      },
    ],
    bottomLine: 'Invisible work isn\'t free—it\'s paid for in exhaustion, resentment, and eventually, your best people leaving.',
  },
];

const Step0Welcome: React.FC<Step0Props> = ({ onGetStarted }) => {
  const [selectedImpact, setSelectedImpact] = useState<ImpactDetail | null>(null);
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.heroSection} data-tour="welcome-hero">
          <div style={styles.iconContainer}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#0052CC" strokeWidth="2" strokeDasharray="6 3" />
              <circle cx="24" cy="24" r="12" fill="#DEEBFF" />
              <text x="24" y="29" textAnchor="middle" fill="#0052CC" fontSize="16" fontWeight="600">?</text>
            </svg>
          </div>
          <h1 style={styles.title}>How Much Work Is Invisible?</h1>
          <p style={styles.subtitle}>
            Discover what percentage of your team's effort isn't being captured in Jira
          </p>
        </div>

        {/* Why It Matters - Impact Cards */}
        <div style={styles.impactSection}>
          <h2 style={styles.sectionTitle}>Why This Matters</h2>
          <p style={styles.sectionIntro}>
            When work happens outside Jira, it creates blind spots that affect your team:
          </p>

          <div style={styles.impactGrid} data-tour="impact-cards">
            {impactDetails.map((impact) => (
              <div
                key={impact.id}
                style={styles.impactCard}
                onClick={() => setSelectedImpact(impact)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedImpact(impact)}
              >
                <div style={styles.impactIcon}>
                  {impact.id === 'planning' && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#DE350B" strokeWidth="2"/>
                      <path d="M3 9h18M9 9v12" stroke="#DE350B" strokeWidth="2"/>
                      <path d="M13 13h4M13 17h4" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {impact.id === 'surprises' && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#DE350B" strokeWidth="2"/>
                      <path d="M12 7v5l3 3" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {impact.id === 'burnout' && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#DE350B" strokeWidth="2"/>
                      <circle cx="9" cy="7" r="4" stroke="#DE350B" strokeWidth="2"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div style={styles.impactContent}>
                  <strong style={styles.impactTitle}>{impact.title}</strong>
                  <span style={styles.impactText}>
                    {impact.id === 'planning' && 'Capacity estimates miss 20-60% of actual work'}
                    {impact.id === 'surprises' && 'Hidden work causes unexpected delays'}
                    {impact.id === 'burnout' && 'Untracked work leads to invisible overload'}
                  </span>
                </div>
                <div style={styles.learnMore}>
                  <span style={styles.learnMoreText}>Learn more</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12l4-4-4-4" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We'll Do */}
        <div style={styles.processSection} data-tour="process-steps">
          <h2 style={styles.sectionTitle}>What This Assessment Does</h2>
          <div style={styles.processSteps}>
            <div style={styles.processStep}>
              <div style={styles.processNumber}>1</div>
              <div style={styles.processContent}>
                <strong>Analyse Jira patterns</strong>
                <span style={styles.processDesc}>We look for signals that indicate work is happening outside Jira</span>
              </div>
            </div>
            <div style={styles.processArrow}>→</div>
            <div style={styles.processStep}>
              <div style={styles.processNumber}>2</div>
              <div style={styles.processContent}>
                <strong>Estimate volume</strong>
                <span style={styles.processDesc}>Calculate what percentage of work may be invisible</span>
              </div>
            </div>
            <div style={styles.processArrow}>→</div>
            <div style={styles.processStep}>
              <div style={styles.processNumber}>3</div>
              <div style={styles.processContent}>
                <strong>Provide insights</strong>
                <span style={styles.processDesc}>Show where invisible work is likely occurring and why</span>
              </div>
            </div>
          </div>
          <p style={styles.modelNote}>
            Our prediction model was trained on survey responses from teams across multiple organizations.
            It learns which Jira patterns correlate with invisible work, then uses your Jira data to generate your score.
          </p>
        </div>

        {/* Time Estimate & CTA */}
        <div style={styles.ctaSection}>
          <div style={styles.timeBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="#0052CC" strokeWidth="1.5"/>
              <path d="M8 4v4l2.5 2.5" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={styles.timeText}>Setup takes about 3-5 minutes</span>
          </div>

          <div data-tour="get-started">
            <Button
              appearance="primary"
              onClick={onGetStarted}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Impact Detail Modal */}
      {selectedImpact && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImpact(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.modalClose}
              onClick={() => setSelectedImpact(null)}
              aria-label="Close"
            >
              <CrossIcon label="Close" size="small" />
            </button>

            <div style={styles.modalHeader}>
              <div style={styles.modalIcon}>{selectedImpact.icon}</div>
              <h2 style={styles.modalTitle}>{selectedImpact.title}</h2>
            </div>

            <p style={styles.modalSummary}>{selectedImpact.summary}</p>

            <div style={styles.modalSection}>
              <h3 style={styles.modalSectionTitle}>Common Scenarios</h3>
              <ul style={styles.scenarioList}>
                {selectedImpact.scenarios.map((scenario, idx) => (
                  <li key={idx} style={styles.scenarioItem}>{scenario}</li>
                ))}
              </ul>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.modalSectionTitle}>Research & Evidence</h3>
              <div style={styles.researchGrid}>
                {selectedImpact.research.map((item, idx) => (
                  <div key={idx} style={styles.researchCard}>
                    <span style={styles.researchStat}>{item.stat}</span>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.researchLink}
                      >
                        {item.source} ↗
                      </a>
                    ) : (
                      <span style={styles.researchSource}>{item.source}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.bottomLine}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="10" cy="10" r="9" stroke="#DE350B" strokeWidth="1.5"/>
                <path d="M10 6v5M10 13.5v.5" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={styles.bottomLineText}>{selectedImpact.bottomLine}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100%',
    padding: '32px 20px',
  },
  content: {
    maxWidth: '640px',
    textAlign: 'center',
  },

  // Hero
  heroSection: {
    marginBottom: '32px',
  },
  iconContainer: {
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#172B4D',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },

  // Impact Section
  impactSection: {
    marginBottom: '32px',
    textAlign: 'left',
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sectionIntro: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  impactGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  impactCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#FFEBE6',
    borderRadius: '8px',
    borderLeft: '3px solid #DE350B',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  impactIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  impactContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  impactTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  impactText: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  learnMore: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  learnMoreText: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: 500,
  },

  // Process Section
  processSection: {
    marginBottom: '24px',
    textAlign: 'left',
  },
  processSteps: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  processStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  processNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  processDesc: {
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  modelNote: {
    margin: '16px 0 0 0',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    textAlign: 'center',
  },
  processArrow: {
    color: '#B3BAC5',
    fontSize: '18px',
    marginTop: '4px',
    flexShrink: 0,
  },

  // CTA Section
  ctaSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '8px',
  },
  timeBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '20px',
  },
  timeText: {
    fontSize: '13px',
    color: '#0747A6',
    fontWeight: 500,
  },

  // Modal Styles
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
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '32px',
    position: 'relative',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  modalClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  modalIcon: {
    flexShrink: 0,
    width: '48px',
    height: '48px',
    backgroundColor: '#FFEBE6',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modalSummary: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#5E6C84',
    lineHeight: 1.6,
  },
  modalSection: {
    marginBottom: '24px',
  },
  modalSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  scenarioList: {
    margin: 0,
    paddingLeft: '20px',
  },
  scenarioItem: {
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  researchGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  researchCard: {
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  researchStat: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  researchSource: {
    fontSize: '12px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  researchLink: {
    fontSize: '12px',
    color: '#0052CC',
    fontStyle: 'italic',
    textDecoration: 'none',
  },
  bottomLine: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FFEBE6',
    borderRadius: '8px',
    borderLeft: '3px solid #DE350B',
    marginTop: '8px',
  },
  bottomLineText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default Step0Welcome;
