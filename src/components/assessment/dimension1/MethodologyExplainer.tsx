import React, { useState, useEffect } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import DownloadIcon from '@atlaskit/icon/glyph/download';

interface MethodologyExplainerProps {
  onClose: () => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
}

const MethodologyExplainer: React.FC<MethodologyExplainerProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [animatedPercentile, setAnimatedPercentile] = useState(0);
  const [showComparisonDots, setShowComparisonDots] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
  });

  // Tooltip handlers
  const handleDotMouseEnter = (e: React.MouseEvent, position: number, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const teamNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota'];
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: `${teamNames[idx] || `Team ${idx + 1}`}`,
      value: `Health Score: ${position}`,
    });
  };

  const handleMarkerMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: 'Your Team',
      value: `Health Score: ${animatedPercentile}`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Animate percentile on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentile(73);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show comparison dots after percentile animation
  useEffect(() => {
    if (animatedPercentile > 0) {
      const timer = setTimeout(() => {
        setShowComparisonDots(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [animatedPercentile]);

  const handleDownloadPDF = () => {
    // Create a link to download the methodology PDF from the public folder
    const docUrl = process.env.PUBLIC_URL + '/Proposed Risk Classification Approach.pdf';

    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = docUrl;
    link.download = 'Proposed Risk Classification Approach.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'comparison', label: 'Comparison Groups' },
    { id: 'indicators', label: 'Indicators' },
    { id: 'data-quality', label: 'Data Quality' },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>How We Detect Invisible Work</h2>
            <p style={styles.subtitle}>Our statistical approach to measuring risk</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.closeButton} onClick={onClose}>
              <CrossIcon label="Close" size="medium" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.nav}>
          {sections.map((section, index) => (
            <button
              key={section.id}
              style={{
                ...styles.navButton,
                ...(activeSection === index ? styles.navButtonActive : {}),
              }}
              onClick={() => setActiveSection(index)}
            >
              <span style={{
                ...styles.navNumber,
                ...(activeSection === index ? styles.navNumberActive : {}),
              }}>
                {index + 1}
              </span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeSection === 0 && (
            <div style={styles.section}>
              {/* Hero Concept */}
              <div style={styles.heroCard}>
                <div style={styles.heroIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" fill="#DEEBFF" />
                    <path d="M24 14v10l6 6" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="24" cy="24" r="3" fill="#0052CC" />
                  </svg>
                </div>
                <div style={styles.heroContent}>
                  <h3 style={styles.heroTitle}>How We Assess Risk</h3>
                  <p style={styles.heroText}>
                    We analyze <strong>17 Jira indicators</strong> that correlate with invisible work, then compare your team against
                    similar teams to identify <strong>relative risk levels</strong>. This comparison-based approach highlights where your team may need attention.
                  </p>
                </div>
              </div>

              {/* Assessment Framework - Timeline */}
              <h4 style={styles.sectionTitle}>The Assessment Process</h4>
              <div style={styles.frameworkSteps}>
                <div style={styles.frameworkTimeline} />
                <div style={styles.frameworkStep}>
                  <div style={styles.frameworkStepNum}>1</div>
                  <div style={styles.frameworkStepContent}>
                    <div style={styles.frameworkStepTitle}>Data Extraction</div>
                    <div style={styles.frameworkStepDesc}>17 key indicators extracted from your Jira data</div>
                  </div>
                </div>
                <div style={styles.frameworkStep}>
                  <div style={styles.frameworkStepNum}>2</div>
                  <div style={styles.frameworkStepContent}>
                    <div style={styles.frameworkStepTitle}>Health Score</div>
                    <div style={styles.frameworkStepDesc}>CSS (50%) + TRS (35%) + PGS (15%) = 0-100 score</div>
                  </div>
                </div>
                <div style={styles.frameworkStep}>
                  <div style={styles.frameworkStepNum}>3</div>
                  <div style={styles.frameworkStepContent}>
                    <div style={styles.frameworkStepTitle}>Category</div>
                    <div style={styles.frameworkStepDesc}>Excellent (70+), Good (55-69), Average (45-54), Below (30-44), Attention (&lt;30)</div>
                  </div>
                </div>
              </div>

              {/* Key Principles */}
              <h4 style={styles.sectionTitle}>Key Principles</h4>
              <div style={styles.principlesGrid}>
                <div style={styles.principleCard}>
                  <div style={{...styles.principleIcon, backgroundColor: '#E3FCEF'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#006644">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h5 style={styles.principleTitle}>Jira Data Only</h5>
                  <p style={styles.principleText}>
                    Your risk assessment comes <strong>entirely from Jira patterns</strong>.
                    No surveys or manual input required.
                  </p>
                </div>

                <div style={styles.principleCard}>
                  <div style={{...styles.principleIcon, backgroundColor: '#DEEBFF'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0052CC">
                      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                    </svg>
                  </div>
                  <h5 style={styles.principleTitle}>Relative Comparison</h5>
                  <p style={styles.principleText}>
                    We compare you to <strong>similar teams</strong> based on size, domain, and work style.
                    Context matters.
                  </p>
                </div>

                <div style={styles.principleCard}>
                  <div style={{...styles.principleIcon, backgroundColor: '#EAE6FF'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#403294">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <h5 style={styles.principleTitle}>Multi-Signal</h5>
                  <p style={styles.principleText}>
                    We analyze <strong>17 distinct indicators</strong> across 3 categories.
                    No single metric tells the whole story.
                  </p>
                </div>
              </div>

              {/* Visual: What we measure */}
              <div style={styles.measurementDiagram}>
                <h4 style={styles.diagramTitle}>How Risk Assessment Works</h4>
                <div style={styles.diagramContent}>
                  <div style={styles.diagramLeft}>
                    <div style={styles.diagramLabel}>Your Jira Metrics</div>
                    <div style={styles.patternsList}>
                      {['Stale work items', 'Throughput variability', 'Mid-sprint additions', 'Update frequency'].map((pattern, i) => (
                        <div key={i} style={{
                          ...styles.patternItem,
                          animationDelay: `${i * 0.15}s`,
                        }}>
                          <span style={styles.patternDot} />
                          {pattern}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={styles.diagramArrow}>
                    <svg width="60" height="24" viewBox="0 0 60 24">
                      <defs>
                        <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0052CC" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#0052CC" />
                        </linearGradient>
                      </defs>
                      <path d="M0 12 L50 12 L45 6 M50 12 L45 18" stroke="url(#arrowGrad)" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <div style={styles.diagramRight}>
                    <div style={styles.diagramLabel}>Risk Level</div>
                    <div style={styles.riskIndicator}>
                      <div style={styles.riskGauge}>
                        <div style={styles.riskGaugeFill} />
                        <div style={styles.riskGaugeNeedle} />
                      </div>
                      <span style={styles.riskGaugeLabel}>Invisible Work Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div style={styles.section}>
              <div style={styles.heroCard}>
                <div style={styles.heroIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="16" cy="24" r="8" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2" />
                    <circle cx="32" cy="24" r="8" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2" />
                    <circle cx="24" cy="14" r="8" fill="#DEEBFF" stroke="#0052CC" strokeWidth="2" />
                  </svg>
                </div>
                <div style={styles.heroContent}>
                  <h3 style={styles.heroTitle}>Why Comparison Groups Matter</h3>
                  <p style={styles.heroText}>
                    A 5-person startup team and a 50-person enterprise team have different "normal" patterns.
                    We compare you to teams with <strong>similar characteristics</strong>.
                  </p>
                </div>
              </div>

              {/* Visual: Comparison illustration - moved up as focal point */}
              <div style={styles.comparisonVisual}>
                <h4 style={styles.diagramTitle}>Your Position Among Similar Teams</h4>

                {/* Tooltip */}
                {tooltip.visible && (
                  <div style={{
                    ...styles.tooltip,
                    left: tooltip.x,
                    top: tooltip.y - 8,
                  }}>
                    <div style={styles.tooltipLabel}>{tooltip.label}</div>
                    <div style={styles.tooltipValue}>{tooltip.value}</div>
                    <div style={styles.tooltipArrow} />
                  </div>
                )}

                <div style={styles.comparisonChart}>
                  <div style={styles.spectrumContainer}>
                    <div style={styles.spectrumGradient}>
                      {/* Comparison team dots - animated */}
                      {showComparisonDots && [15, 28, 35, 42, 55, 62, 78, 85, 91].map((pos, i) => (
                        <div
                          key={i}
                          style={{
                            ...styles.comparisonDot,
                            left: `${pos}%`,
                            animationDelay: `${i * 0.1}s`,
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => handleDotMouseEnter(e, pos, i)}
                          onMouseLeave={handleMouseLeave}
                        />
                      ))}
                      {/* Your position */}
                      <div
                        style={{
                          ...styles.yourPosition,
                          left: `${animatedPercentile}%`,
                          opacity: animatedPercentile > 0 ? 1 : 0,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={handleMarkerMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div style={styles.yourPositionPin} />
                        <div style={styles.yourPositionLabel}>You</div>
                      </div>
                    </div>
                    <div style={styles.spectrumLabels}>
                      <span style={styles.spectrumLabelGood}>Better Health</span>
                      <span style={styles.spectrumLabelBad}>Needs Attention</span>
                    </div>
                  </div>
                  <div style={styles.comparisonLegend}>
                    <span style={styles.legendItemComp}>
                      <span style={styles.legendDotYou} /> Your team
                    </span>
                    <span style={styles.legendItemComp}>
                      <span style={styles.legendDotOther} /> Similar teams in comparison group
                    </span>
                  </div>
                </div>
              </div>

              <h4 style={styles.sectionTitle}>What Defines Your Comparison Group</h4>
              <div style={styles.factorsGrid}>
                {[
                  { name: 'Team Size', example: '5-10, 11-20, 21-50, 50+' },
                  { name: 'Domain Type', example: 'Product, Platform, Data, DevOps' },
                  { name: 'Work Cadence', example: 'Sprints, Kanban, Hybrid' },
                  { name: 'Project Phase', example: 'Early, Growth, Mature, Maintenance' },
                  { name: 'Tech Stack Complexity', example: 'Low, Medium, High' },
                  { name: 'External Dependencies', example: 'Isolated, Moderate, Heavy' },
                ].map((factor, i) => (
                  <div key={i} style={styles.factorCard}>
                    <div style={styles.factorContent}>
                      <span style={styles.factorName}>{factor.name}</span>
                      <span style={styles.factorExample}>{factor.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div style={styles.section}>
              {/* Hero with large 17 display */}
              <div style={styles.heroCard}>
                <div style={styles.heroLargeNumber}>17</div>
                <div style={styles.heroContent}>
                  <h3 style={styles.heroTitle}>Leading Indicators</h3>
                  <p style={styles.heroText}>
                    Organized into 3 categories, each targeting a different symptom of invisible work.
                    Together they form a comprehensive detection system.
                  </p>
                </div>
              </div>

              {/* Note moved above categories for context */}
              <div style={styles.indicatorNote}>
                <p style={{ margin: 0, fontSize: '13px', color: '#5E6C84' }}>
                  Each indicator uses <strong>Coefficient of Variation (CoV)</strong> or <strong>percentage metrics</strong> to normalize values across different team sizes and work volumes.
                </p>
              </div>

              <div style={styles.categoriesShowcase}>
                {[
                  {
                    name: 'Unexplained Variability',
                    color: '#BF2600',
                    bg: '#FFEBE6',
                    count: 7,
                    insight: 'High variability without corresponding demand changes suggests work is entering/exiting outside Jira',
                    examples: ['Throughput swings', 'Cycle time spikes'],
                  },
                  {
                    name: 'Infrequent Tool Use',
                    color: '#974F0C',
                    bg: '#FFFAE6',
                    count: 7,
                    insight: 'Stale items and infrequent updates indicate the team isn\'t using Jira as their source of truth',
                    examples: ['Aging items', 'Bulk status changes'],
                  },
                  {
                    name: 'Siloed Contributions',
                    color: '#006644',
                    bg: '#E3FCEF',
                    count: 3,
                    insight: 'Work appearing without proper intake suggests side-channels bypassing the official process',
                    examples: ['Mid-sprint additions', 'Single-contributor items'],
                  },
                ].map((cat, i) => (
                  <div key={i} style={{...styles.categoryShowcard, borderLeftColor: cat.color}}>
                    <div style={styles.categoryShowcardHeader}>
                      <h5 style={styles.categoryShowcardTitle}>{cat.name}</h5>
                      <span style={{...styles.categoryShowcardBadge, backgroundColor: cat.bg, color: cat.color}}>
                        {cat.count} indicators
                      </span>
                    </div>
                    <p style={styles.categoryShowcardInsight}>{cat.insight}</p>
                    <div style={styles.categoryShowcardExamples}>
                      {cat.examples.map((ex, j) => (
                        <span key={j} style={styles.exampleTag}>{ex}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div style={styles.section}>
              <div style={styles.heroCard}>
                <div style={styles.heroIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="18" fill="#DEEBFF" />
                    <path d="M24 14 L24 24 L32 28" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="24" cy="24" r="4" fill="#0052CC" />
                  </svg>
                </div>
                <div style={styles.heroContent}>
                  <h3 style={styles.heroTitle}>Understanding Data Quality</h3>
                  <p style={styles.heroText}>
                    The reliability of your risk assessment depends on <strong>your Jira data quality</strong>
                    and <strong>comparison group size</strong>.
                  </p>
                </div>
              </div>

              {/* Health Categories - Prominent Position */}
              <h4 style={styles.sectionTitle}>Health Score Categories</h4>
              <div style={styles.thresholdsVisual}>
                <div style={styles.thresholdBar}>
                  <div style={styles.thresholdSegmentLow}>
                    <span style={styles.thresholdLabel}>Good+</span>
                    <span style={styles.thresholdRange}>Health score 55+</span>
                  </div>
                  <div style={styles.thresholdSegmentMed}>
                    <span style={styles.thresholdLabel}>Average</span>
                    <span style={styles.thresholdRange}>Health score 45-54</span>
                  </div>
                  <div style={styles.thresholdSegmentHigh}>
                    <span style={styles.thresholdLabel}>Below Avg</span>
                    <span style={styles.thresholdRange}>Health score &lt;45</span>
                  </div>
                </div>
              </div>

              {/* Confidence Factors - Inline */}
              <h4 style={styles.sectionTitle}>What Affects Accuracy</h4>
              <div style={styles.confidenceFactorsInline}>
                <div style={styles.confidenceFactorInline}>
                  <div style={styles.confidenceFactorInlineIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0052CC">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Comparison Group Size</strong>
                    <span style={styles.confidenceFactorInlineText}>Ideal: 10+ similar teams</span>
                  </div>
                </div>
                <div style={styles.confidenceFactorInline}>
                  <div style={styles.confidenceFactorInlineIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#006644">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Data Completeness</strong>
                    <span style={styles.confidenceFactorInlineText}>Ideal: 3+ months of consistent data</span>
                  </div>
                </div>
              </div>

              {/* Data Quality Considerations - Neutral */}
              <div style={styles.guardrailsSection}>
                <h4 style={styles.sectionTitle}>Data Quality Considerations</h4>
                <div style={styles.guardrailsList}>
                  {[
                    { metric: 'Limited history', detail: '< 3 months', impact: 'Patterns may not be stable' },
                    { metric: 'Inconsistent usage', detail: 'Sporadic updates', impact: 'Indicators may be skewed' },
                    { metric: 'Small comparison group', detail: '< 10 teams', impact: 'Benchmarks less reliable' },
                  ].map((guard, i) => (
                    <div key={i} style={styles.guardrailItem}>
                      <span style={styles.guardrailMetric}>{guard.metric}</span>
                      <span style={styles.guardrailDetail}>{guard.detail}</span>
                      <span style={styles.guardrailImpact}>{guard.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download CTA */}
              <div style={styles.downloadCTA}>
                <div style={styles.downloadCTAContent}>
                  <h4 style={styles.downloadCTATitle}>Want the full technical details?</h4>
                  <p style={styles.downloadCTAText}>
                    Download our methodology paper with complete indicator specifications and statistical formulas.
                  </p>
                </div>
                <button style={styles.downloadCTAButton} onClick={handleDownloadPDF}>
                  <DownloadIcon label="Download" size="medium" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '40px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 12px 48px rgba(9, 30, 66, 0.25)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 28px',
    background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
    color: '#FFFFFF',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: '14px',
    opacity: 0.85,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#FFFFFF',
    transition: 'background-color 0.2s ease',
  },
  nav: {
    display: 'flex',
    borderBottom: '1px solid #DFE1E6',
    padding: '0 24px',
    backgroundColor: '#FAFBFC',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '-1px',
  },
  navButtonActive: {
    color: '#0052CC',
    borderBottomColor: '#0052CC',
    backgroundColor: '#FFFFFF',
  },
  navNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#DFE1E6',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  navNumberActive: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
  },
  content: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  section: {
    animation: 'fadeIn 0.3s ease',
  },

  // Hero Cards
  heroCard: {
    display: 'flex',
    gap: '20px',
    padding: '28px 32px',
    backgroundColor: '#F8F9FA',
    borderRadius: '16px',
    marginBottom: '32px',
  },
  heroIcon: {
    flexShrink: 0,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    letterSpacing: '-0.5px',
  },
  heroText: {
    margin: 0,
    fontSize: '15px',
    color: '#42526E',
    lineHeight: 1.7,
  },
  heroLargeNumber: {
    fontSize: '56px',
    fontWeight: 800,
    color: '#0052CC',
    lineHeight: 1,
    flexShrink: 0,
  },

  // Section titles
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionDescription: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.6,
  },

  // Framework Steps - Timeline Design
  frameworkSteps: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
    position: 'relative',
    padding: '0 20px',
  },
  frameworkTimeline: {
    position: 'absolute',
    top: '20px',
    left: '80px',
    right: '80px',
    height: '2px',
    background: 'linear-gradient(90deg, #0052CC 0%, #0052CC 50%, #DFE1E6 50%, #DFE1E6 100%)',
    zIndex: 0,
  },
  frameworkStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '1',
    position: 'relative',
    zIndex: 1,
  },
  frameworkStepNum: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 82, 204, 0.25)',
  },
  frameworkStepContent: {
    textAlign: 'center',
    maxWidth: '180px',
  },
  frameworkStepTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '6px',
  },
  frameworkStepDesc: {
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },

  // Principles Grid
  principlesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  },
  principleCard: {
    padding: '24px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  principleIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    marginBottom: '12px',
  },
  principleTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  principleText: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },

  // Measurement Diagram
  measurementDiagram: {
    padding: '28px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  diagramTitle: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center',
  },
  diagramContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
  },
  diagramLeft: {
    flex: '0 0 200px',
  },
  diagramLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  patternsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  patternItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#172B4D',
    animation: 'slideIn 0.4s ease forwards',
    opacity: 0,
    transform: 'translateX(-10px)',
  },
  patternDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
  },
  diagramArrow: {
    flexShrink: 0,
  },
  diagramRight: {
    flex: '0 0 160px',
    textAlign: 'center',
  },
  riskIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  riskGauge: {
    position: 'relative',
    width: '120px',
    height: '60px',
    background: 'linear-gradient(90deg, #36B37E 0%, #FFAB00 50%, #DE350B 100%)',
    borderRadius: '60px 60px 0 0',
    overflow: 'hidden',
  },
  riskGaugeFill: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: '100px',
    height: '50px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50px 50px 0 0',
    transform: 'translateX(-50%)',
  },
  riskGaugeNeedle: {
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    width: '4px',
    height: '45px',
    backgroundColor: '#172B4D',
    borderRadius: '2px',
    transformOrigin: 'bottom center',
    transform: 'translateX(-50%) rotate(30deg)',
  },
  riskGaugeLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },

  // Factors Grid (Comparison section) - Simplified
  factorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  factorCard: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '16px 18px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(9, 30, 66, 0.06)',
  },
  factorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  factorName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  factorExample: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },

  // Comparison Visual
  comparisonVisual: {
    padding: '28px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  comparisonChart: {
    marginTop: '20px',
  },
  spectrumContainer: {
    marginBottom: '20px',
  },
  spectrumGradient: {
    position: 'relative',
    height: '56px',
    borderRadius: '28px',
    background: 'linear-gradient(90deg, #ABF5D1 0%, #FFE380 50%, #FF8F73 100%)',
  },
  // Tooltip styles
  tooltip: {
    position: 'fixed',
    transform: 'translate(-50%, -100%)',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    zIndex: 10001,
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
    pointerEvents: 'none',
  },
  tooltipLabel: {
    fontWeight: 600,
    marginBottom: '2px',
  },
  tooltipValue: {
    color: '#B3BAC5',
  },
  tooltipArrow: {
    position: 'absolute',
    left: '50%',
    bottom: '-6px',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #172B4D',
  },
  comparisonDot: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: 'rgba(66, 82, 110, 0.5)',
    border: '2px solid rgba(255, 255, 255, 0.95)',
    animation: 'popIn 0.3s ease forwards',
    opacity: 0,
  },
  yourPosition: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'left 1s ease-out, opacity 0.3s ease',
  },
  yourPositionPin: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    border: '4px solid #FFFFFF',
    boxShadow: '0 3px 12px rgba(0, 82, 204, 0.4)',
  },
  yourPositionLabel: {
    marginTop: '6px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#0052CC',
    backgroundColor: '#FFFFFF',
    padding: '4px 12px',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
  },
  spectrumLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  spectrumLabelGood: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#006644',
  },
  spectrumLabelBad: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#BF2600',
  },
  comparisonLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
  },
  legendItemComp: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#5E6C84',
  },
  legendDotYou: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    border: '2px solid #FFFFFF',
    boxShadow: '0 0 0 1px #DFE1E6',
  },
  legendDotOther: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'rgba(66, 82, 110, 0.5)',
    border: '2px solid rgba(255, 255, 255, 0.9)',
  },

  // Categories Showcase (Indicators section) - Simplified
  categoriesShowcase: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  categoryShowcard: {
    padding: '20px 24px',
    backgroundColor: '#FFFFFF',
    borderLeft: '4px solid',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  categoryShowcardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  categoryShowcardTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  categoryShowcardBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '12px',
  },
  categoryShowcardInsight: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.6,
  },
  categoryShowcardExamples: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  exampleTag: {
    fontSize: '12px',
    color: '#5E6C84',
    backgroundColor: '#F4F5F7',
    padding: '5px 12px',
    borderRadius: '14px',
  },
  indicatorNote: {
    padding: '16px 20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '10px',
    marginBottom: '20px',
  },

  // Formula Card (Scoring section)
  formulaCard: {
    padding: '24px',
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    marginBottom: '28px',
  },
  formulaTitle: {
    margin: '0 0 20px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center',
  },
  formulaSteps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  formulaStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    flex: '0 0 200px',
  },
  formulaStepNum: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
  },
  formulaStepContent: {
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.4,
  },
  formulaConnector: {
    fontSize: '20px',
    color: '#6B778C',
    fontWeight: 500,
  },

  // Thresholds Visual - Prominent
  thresholdsVisual: {
    marginBottom: '32px',
  },
  thresholdBar: {
    display: 'flex',
    borderRadius: '12px',
    overflow: 'hidden',
    height: '80px',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },
  thresholdSegmentLow: {
    flex: 3,
    backgroundColor: '#E3FCEF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '2px solid #FFFFFF',
  },
  thresholdSegmentMed: {
    flex: 3,
    backgroundColor: '#FFFAE6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '2px solid #FFFFFF',
  },
  thresholdSegmentHigh: {
    flex: 4,
    backgroundColor: '#FFEBE6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thresholdLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  thresholdRange: {
    fontSize: '12px',
    color: '#5E6C84',
    marginTop: '4px',
  },

  // Confidence Factors - Inline Style
  confidenceFactorsInline: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
  },
  confidenceFactorInline: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1,
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.06)',
  },
  confidenceFactorInlineIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#F4F5F7',
    flexShrink: 0,
  },
  confidenceFactorInlineText: {
    display: 'block',
    fontSize: '13px',
    color: '#5E6C84',
    marginTop: '2px',
  },

  // Guardrails Section - Neutral
  guardrailsSection: {
    marginBottom: '28px',
  },
  guardrailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  guardrailItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 18px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(9, 30, 66, 0.06)',
  },
  guardrailMetric: {
    flex: '0 0 160px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  guardrailDetail: {
    flex: '0 0 120px',
    fontSize: '13px',
    color: '#5E6C84',
  },
  guardrailImpact: {
    flex: 1,
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
  },

  // Download CTA
  downloadCTA: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    padding: '24px',
    backgroundColor: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
    background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
    borderRadius: '12px',
    color: '#FFFFFF',
  },
  downloadCTAContent: {
    flex: 1,
  },
  downloadCTATitle: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    fontWeight: 600,
  },
  downloadCTAText: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.9,
    lineHeight: 1.5,
  },
  downloadCTAButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    color: '#0052CC',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    flexShrink: 0,
  },
};

// Add keyframe animations via style tag
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes popIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default MethodologyExplainer;
