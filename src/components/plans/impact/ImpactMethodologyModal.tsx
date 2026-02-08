// ImpactMethodologyModal Component
// Modal explaining how impact is calculated, attribution model, confidence levels, etc.

import React, { useState, useEffect } from 'react';
import { TIMELINE_CONFIGS } from '../../../constants/impactTimelines';
import { ImpactTimelineClass } from '../../../types/impactMeasurement';

interface ImpactMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: 'percentile' | 'rank' | 'confidence' | 'fromDate' | 'toDate' | 'general';
  confidenceScore?: number; // Actual confidence score to display
  confidenceBreakdown?: {
    dataCoverage: number;      // 0-100
    sampleSize: number;        // 0-100
    effectMagnitude: number;   // 0-100
    attributionClarity: number; // 0-100
  };
}

type TabId = 'calculation' | 'attribution' | 'confidence' | 'exclusions' | 'caveats' | 'percentile' | 'fromDate' | 'toDate';

// Map topic to initial tab
const topicToTab: Record<string, TabId> = {
  percentile: 'percentile',
  fromDate: 'fromDate',
  toDate: 'toDate',
  confidence: 'confidence',
  general: 'calculation',
};

export const ImpactMethodologyModal: React.FC<ImpactMethodologyModalProps> = ({
  isOpen,
  onClose,
  topic = 'general',
  confidenceScore,
  confidenceBreakdown,
}) => {
  const initialTab = topicToTab[topic] || 'calculation';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Reset tab when topic changes
  useEffect(() => {
    setActiveTab(topicToTab[topic] || 'calculation');
  }, [topic]);

  if (!isOpen) return null;

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'calculation', label: 'How It Works', icon: '⚙️' },
    { id: 'percentile', label: 'Health Score', icon: '📊' },
    { id: 'confidence', label: 'Confidence', icon: '🎯' },
    { id: 'fromDate', label: 'From Date', icon: '📅' },
    { id: 'toDate', label: 'To Date', icon: '📆' },
    { id: 'attribution', label: 'Attribution', icon: '🔗' },
    { id: 'exclusions', label: 'Exclusions', icon: '⛔' },
    { id: 'caveats', label: 'Limitations', icon: '⚠️' },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}>📖</div>
            <div>
              <h2 style={styles.title}>Impact Measurement Methodology</h2>
              <p style={styles.subtitle}>Learn how we measure and calculate your portfolio's improvement</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>

        {/* Two-column layout: sidebar + content */}
        <div style={styles.body}>
          {/* Sidebar navigation */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarLabel}>TOPICS</div>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.sidebarTab,
                  ...(activeTab === tab.id ? styles.sidebarTabActive : {}),
                }}
              >
                <span style={styles.sidebarTabIcon}>{tab.icon}</span>
                <span style={styles.sidebarTabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div style={styles.content}>
            {activeTab === 'fromDate' && <FromDateTab />}
            {activeTab === 'toDate' && <ToDateTab />}
            {activeTab === 'percentile' && <PercentileTab />}
            {activeTab === 'calculation' && <CalculationTab />}
            {activeTab === 'attribution' && <AttributionTab />}
            {activeTab === 'confidence' && <ConfidenceTab score={confidenceScore} breakdown={confidenceBreakdown} />}
            {activeTab === 'exclusions' && <ExclusionsTab />}
            {activeTab === 'caveats' && <CaveatsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

const FromDateTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h3 style={styles.sectionTitle}>Understanding the "From" Date (Baseline)</h3>
    <p style={styles.paragraph}>
      The "From" date determines the starting point for measuring your portfolio's improvement. This baseline
      is critical for understanding how much progress has been made over time.
    </p>

    <h4 style={styles.subSectionTitle}>Default Value</h4>
    <div style={styles.infoBox}>
      <strong>By default, the "From" date is set to when your first assessment was created.</strong>
      <p style={{ margin: '8px 0 0 0' }}>
        This represents the earliest point at which we have reliable Jira health data for your portfolio.
        It's the moment you first started tracking your team's performance, making it a natural baseline.
      </p>
    </div>

    <h4 style={styles.subSectionTitle}>Why This Matters</h4>
    <p style={styles.paragraph}>
      The baseline date is important because it establishes the "before" snapshot against which all
      improvement is measured. The health score and rank shown on the left gauge reflect your portfolio's
      health position at this point in time.
    </p>

    <h4 style={styles.subSectionTitle}>When to Change It</h4>
    <div style={styles.factorList}>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F4C5}'}</div>
        <div style={styles.factorContent}>
          <strong>Quarterly Reviews</strong>
          <p>Set the "From" date to the start of a quarter to see Q-over-Q improvement.</p>
        </div>
      </div>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F3AF}'}</div>
        <div style={styles.factorContent}>
          <strong>Initiative Tracking</strong>
          <p>Set it to when a specific improvement initiative started to measure its impact.</p>
        </div>
      </div>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F465}'}</div>
        <div style={styles.factorContent}>
          <strong>Team Changes</strong>
          <p>After significant team changes, you might want a fresh baseline.</p>
        </div>
      </div>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F4CA}'}</div>
        <div style={styles.factorContent}>
          <strong>Trend Analysis</strong>
          <p>Compare different time periods by adjusting both dates to see improvement trends.</p>
        </div>
      </div>
    </div>

    <h4 style={styles.subSectionTitle}>Important Notes</h4>
    <ul style={styles.bulletList}>
      <li>The "From" date cannot be set to a date before your first assessment</li>
      <li>Earlier dates provide more context but may include data from before any improvement efforts</li>
      <li>For most accurate improvement tracking, use the date when you started actively working on Jira health</li>
      <li>Changing the "From" date will recalculate all health scores, ranks, and comparisons</li>
    </ul>
  </div>
);

const ToDateTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h3 style={styles.sectionTitle}>Understanding the "To" Date (Current)</h3>
    <p style={styles.paragraph}>
      The "To" date determines the end point for measuring your portfolio's improvement. This is the
      "after" snapshot that shows where your team stands now (or at any point you choose).
    </p>

    <h4 style={styles.subSectionTitle}>Default Value</h4>
    <div style={styles.infoBox}>
      <strong>By default, the "To" date is set to today's date.</strong>
      <p style={{ margin: '8px 0 0 0' }}>
        This gives you a real-time view of your current health position, showing how much you've improved
        from the baseline to right now. The health score and rank shown on the right gauge reflect your
        portfolio's health position as of this date.
      </p>
    </div>

    <h4 style={styles.subSectionTitle}>What Gets Measured</h4>
    <p style={styles.paragraph}>
      The "To" date determines which assessment data is used for the "after" comparison. We use the
      most recent assessment data available on or before the selected date. This includes:
    </p>
    <ul style={styles.bulletList}>
      <li>Your portfolio's overall health score at that point</li>
      <li>Your rank among similar teams at that point</li>
      <li>Individual dimension scores and their changes</li>
      <li>All comparison team positions at that same date</li>
    </ul>

    <h4 style={styles.subSectionTitle}>When to Change It</h4>
    <div style={styles.factorList}>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F4C6}'}</div>
        <div style={styles.factorContent}>
          <strong>Historical Analysis</strong>
          <p>Set to a past date to see what your position was at that specific moment.</p>
        </div>
      </div>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F4CA}'}</div>
        <div style={styles.factorContent}>
          <strong>Period Comparisons</strong>
          <p>Compare specific time periods (e.g., end of Q1 vs end of Q2) by adjusting both dates.</p>
        </div>
      </div>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F4DD}'}</div>
        <div style={styles.factorContent}>
          <strong>Reporting</strong>
          <p>Generate reports for specific dates (month-end, milestone dates, etc.).</p>
        </div>
      </div>
    </div>

    <h4 style={styles.subSectionTitle}>Important Notes</h4>
    <ul style={styles.bulletList}>
      <li>The "To" date cannot be set to a future date</li>
      <li>The "To" date must be after the "From" date</li>
      <li>If no assessment data exists for the selected date, we use the most recent available data</li>
      <li>Changing the "To" date will recalculate all health scores, ranks, and comparisons</li>
    </ul>
  </div>
);

const PercentileTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h3 style={styles.sectionTitle}>What is Health Score Improvement?</h3>
    <p style={styles.paragraph}>
      Your health score (0-100) measures your team's Jira health using the Composite Health Score methodology.
      A score of 50 is the baseline, with scores above 70 indicating excellent health and below 30 needing attention.
      Health score improvement measures how much your score has changed between your selected "From" and "To" dates.
    </p>

    <h4 style={styles.subSectionTitle}>How Health Score is Calculated</h4>
    <div style={styles.diagram}>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>1</div>
        <div style={styles.diagramText}>
          <strong>Indicator Collection</strong>
          <span>We collect metrics across all health dimensions (data quality, process adherence,
          estimation accuracy, etc.) from your Jira data.</span>
        </div>
      </div>
      <div style={styles.diagramArrow}>{'\u2193'}</div>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>2</div>
        <div style={styles.diagramText}>
          <strong>Z-Score Transformation</strong>
          <span>Each indicator is standardized using z-scores against baseline norms established from
          similar teams in the benchmark database.</span>
        </div>
      </div>
      <div style={styles.diagramArrow}>{'\u2193'}</div>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>3</div>
        <div style={styles.diagramText}>
          <strong>Weighted Aggregation</strong>
          <span>Indicators are combined using weights based on their validity and importance,
          producing a composite score centered on 50 with typical range 30-70.</span>
        </div>
      </div>
      <div style={styles.diagramArrow}>{'\u2193'}</div>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>4</div>
        <div style={styles.diagramText}>
          <strong>Change Calculation</strong>
          <span>The difference between your health score at the "From" date and the "To" date gives you the
          health score improvement value.</span>
        </div>
      </div>
    </div>

    <h4 style={styles.subSectionTitle}>Interpreting Health Score Changes</h4>
    <div style={styles.confidenceTable}>
      <div style={{ ...styles.confidenceRow, backgroundColor: '#E3FCEF' }}>
        <div style={styles.confidenceLevel}>+10 or more</div>
        <div style={styles.confidenceCriteria}>
          <strong>Significant improvement.</strong> Your team has moved notably ahead of peers. This typically
          indicates sustained, focused improvement efforts across multiple dimensions.
        </div>
      </div>
      <div style={{ ...styles.confidenceRow, backgroundColor: '#DEEBFF' }}>
        <div style={styles.confidenceLevel}>+3 to +9</div>
        <div style={styles.confidenceCriteria}>
          <strong>Moderate improvement.</strong> Meaningful progress is being made. Your improvement efforts
          are showing results, though there may be room for more.
        </div>
      </div>
      <div style={{ ...styles.confidenceRow, backgroundColor: '#F4F5F7' }}>
        <div style={styles.confidenceLevel}>-2 to +2</div>
        <div style={styles.confidenceCriteria}>
          <strong>Stable position.</strong> You're maintaining your current position relative to peers. Note that
          if other teams are improving, staying stable still requires ongoing effort.
        </div>
      </div>
      <div style={{ ...styles.confidenceRow, backgroundColor: '#FFEBE6' }}>
        <div style={styles.confidenceLevel}>-3 or lower</div>
        <div style={styles.confidenceCriteria}>
          <strong>Declining position.</strong> Either your absolute scores have dropped, or peers are improving
          faster than you. This warrants investigation into which dimensions are affected.
        </div>
      </div>
    </div>

    <h4 style={styles.subSectionTitle}>Key Insights About Health Scores</h4>
    <ul style={styles.bulletList}>
      <li><strong>Baseline-Relative:</strong> Health scores are relative to baseline practices (50 = baseline).
      Higher scores indicate stronger practices compared to typical teams.</li>
      <li><strong>Benchmark Updates:</strong> The benchmark database is updated regularly as more teams join.
      This means your relative position can shift even without changes to your own scores.</li>
      <li><strong>Dimension Weighting:</strong> All dimensions contribute to your overall health score, but
      critical dimensions (like data completeness) may have more impact on the benchmark comparison.</li>
      <li><strong>Time Lag:</strong> Some improvements take time to show in score changes. Process
      changes may need 2-4 sprints before their impact is fully visible.</li>
    </ul>

    <div style={styles.infoBox}>
      <strong>Pro Tip:</strong> Focus on improving your weakest dimensions first. Moving a dimension from
      a score of 30 to 50 often has more impact than moving from 70 to 80.
    </div>
  </div>
);

const CalculationTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h3 style={styles.sectionTitle}>Before/After Measurement</h3>
    <p style={styles.paragraph}>
      Impact is measured by comparing scores <strong>before</strong> a play starts to scores
      <strong> after</strong> the play has had time to take effect.
    </p>

    <div style={styles.diagram}>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>1</div>
        <div style={styles.diagramText}>
          <strong>Baseline Capture</strong>
          <span>When you start a play, we capture the current dimension and outcome scores.</span>
        </div>
      </div>
      <div style={styles.diagramArrow}>{'\u2193'}</div>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>2</div>
        <div style={styles.diagramText}>
          <strong>Play Completion</strong>
          <span>You complete the play. We note the completion date.</span>
        </div>
      </div>
      <div style={styles.diagramArrow}>{'\u2193'}</div>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>3</div>
        <div style={styles.diagramText}>
          <strong>Impact Window</strong>
          <span>We wait for the appropriate time (varies by play type) for changes to manifest.</span>
        </div>
      </div>
      <div style={styles.diagramArrow}>{'\u2193'}</div>
      <div style={styles.diagramStep}>
        <div style={styles.diagramCircle}>4</div>
        <div style={styles.diagramText}>
          <strong>Assessment</strong>
          <span>We capture current scores and compare to baseline.</span>
        </div>
      </div>
    </div>

    <h3 style={styles.sectionTitle}>Impact Timelines</h3>
    <p style={styles.paragraph}>
      Different types of plays take different amounts of time to show measurable impact:
    </p>

    <div style={styles.timelineTable}>
      {Object.entries(TIMELINE_CONFIGS).map(([key, config]) => (
        <div key={key} style={styles.timelineRow}>
          <div style={styles.timelineLabel}>{config.displayLabel}</div>
          <div style={styles.timelineInfo}>
            <span style={styles.timelineDays}>
              {config.minDaysAfterCompletion}-{config.maxDaysAfterCompletion} days
            </span>
            <span style={styles.timelineRationale}>{config.rationale}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AttributionTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h3 style={styles.sectionTitle}>How We Attribute Changes</h3>
    <p style={styles.paragraph}>
      When multiple plays affect the same metrics, we use several factors to determine
      how much of the change can be attributed to each play.
    </p>

    <div style={styles.factorList}>
      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F3AF}'}</div>
        <div style={styles.factorContent}>
          <strong>Timing</strong>
          <p>Plays completed closer to the observed change get higher attribution scores.</p>
        </div>
      </div>

      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F4CA}'}</div>
        <div style={styles.factorContent}>
          <strong>Indicator Overlap</strong>
          <p>We check which specific indicators each play affects. Less overlap means clearer attribution.</p>
        </div>
      </div>

      <div style={styles.factor}>
        <div style={styles.factorIcon}>{'\u{1F50D}'}</div>
        <div style={styles.factorContent}>
          <strong>Direct Connection</strong>
          <p>Plays with direct connections to changed indicators receive priority attribution.</p>
        </div>
      </div>
    </div>

    <div style={styles.infoBox}>
      <strong>Single vs. Multiple Plays</strong>
      <p>
        When only one play affects a dimension, attribution is straightforward and confidence is high.
        When multiple plays overlap, we distribute attribution proportionally and lower our confidence
        in individual play assessments.
      </p>
    </div>
  </div>
);

interface ConfidenceTabProps {
  score?: number;
  breakdown?: {
    dataCoverage: number;
    sampleSize: number;
    effectMagnitude: number;
    attributionClarity: number;
  };
}

const ConfidenceTab: React.FC<ConfidenceTabProps> = ({ score, breakdown }) => {
  // Get confidence level label and styling
  const getConfidenceLevel = (s: number) => {
    if (s >= 80) return { label: 'Very High', color: '#006644', bgColor: '#E3FCEF', bars: 5 };
    if (s >= 60) return { label: 'High', color: '#0052CC', bgColor: '#DEEBFF', bars: 4 };
    if (s >= 40) return { label: 'Moderate', color: '#FF8B00', bgColor: '#FFF7E6', bars: 3 };
    if (s >= 20) return { label: 'Low', color: '#DE350B', bgColor: '#FFEBE6', bars: 2 };
    return { label: 'Very Low', color: '#BF2600', bgColor: '#FFEBE6', bars: 1 };
  };

  const confidence = score !== undefined ? getConfidenceLevel(score) : null;
  const actualBreakdown = breakdown || {
    dataCoverage: 75,
    sampleSize: 68,
    effectMagnitude: 82,
    attributionClarity: 62,
  };

  return (
    <div style={styles.tabContent}>
      <h3 style={styles.sectionTitle}>Understanding Confidence Scores</h3>
      <p style={styles.paragraph}>
        The confidence score indicates how reliable our measurement of your portfolio's improvement is.
        A higher score means we have more certainty that the improvement shown accurately reflects
        real changes in your team's performance.
      </p>

      {/* Prominent Score Display */}
      {score !== undefined && confidence && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: 24,
          backgroundColor: confidence.bgColor,
          borderRadius: 12,
          marginTop: 16,
          marginBottom: 24,
          border: `1px solid ${confidence.color}20`,
        }}>
          {/* Visual Meter */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
              height: 40,
            }}>
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  style={{
                    width: 8,
                    height: 10 + bar * 6,
                    borderRadius: 2,
                    backgroundColor: bar <= confidence.bars ? confidence.color : '#DFE1E6',
                    transition: 'background-color 0.3s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Score and Label */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontSize: 42,
                fontWeight: 700,
                color: confidence.color,
              }}>
                {score}%
              </span>
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: confidence.color,
              }}>
                {confidence.label} Confidence
              </span>
            </div>
            <span style={{ fontSize: 13, color: '#5E6C84' }}>
              {confidence.bars >= 4
                ? 'Strong data supports this measurement'
                : confidence.bars >= 3
                  ? 'Reasonable confidence in this measurement'
                  : 'Limited data affects certainty'}
            </span>
          </div>
        </div>
      )}

      {/* Factor Breakdown */}
      <h4 style={styles.subSectionTitle}>Score Breakdown</h4>
      <p style={{ ...styles.paragraph, marginBottom: 16 }}>
        The confidence score is calculated from four weighted factors, each assessing a different
        aspect of measurement reliability:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Data Coverage Factor */}
        <ConfidenceFactor
          name="Data Coverage"
          score={actualBreakdown.dataCoverage}
          weight={30}
          icon={'\u{1F4CA}'}
          description="Measures how complete the data capture was at both the baseline and current measurement points."
          details={[
            'Full coverage means all expected data points were captured',
            'Missing assessments or gaps in data lower this score',
            'Regular, consistent assessments improve coverage',
          ]}
        />

        {/* Sample Size Factor */}
        <ConfidenceFactor
          name="Sample Size"
          score={actualBreakdown.sampleSize}
          weight={25}
          icon={'\u{1F4C8}'}
          description="Reflects the number of data points available for comparison across the measurement period."
          details={[
            'More data points provide statistically stronger measurements',
            'Longer time periods with regular assessments increase sample size',
            'Small sample sizes reduce certainty in trends',
          ]}
        />

        {/* Effect Magnitude Factor */}
        <ConfidenceFactor
          name="Effect Magnitude"
          score={actualBreakdown.effectMagnitude}
          weight={25}
          icon={'\u{1F3AF}'}
          description="Assesses how large and clear the measured changes are relative to normal variation."
          details={[
            'Large, clear changes are easier to measure confidently',
            'Small changes near the margin of normal variation reduce confidence',
            'Consistent direction of change (all improving or all declining) increases this score',
          ]}
        />

        {/* Attribution Clarity Factor */}
        <ConfidenceFactor
          name="Attribution Clarity"
          score={actualBreakdown.attributionClarity}
          weight={20}
          icon={'\u{1F50D}'}
          description="Measures how clearly changes can be attributed to specific actions or time periods."
          details={[
            'Fewer concurrent changes make attribution clearer',
            'External factors (team changes, project shifts) reduce clarity',
            'Sequential rather than overlapping improvements increase this score',
          ]}
        />
      </div>

      {/* Confidence Level Guide */}
      <h4 style={{ ...styles.subSectionTitle, marginTop: 24 }}>Confidence Level Guide</h4>
      <div style={styles.confidenceTable}>
        <div style={{ ...styles.confidenceRow, backgroundColor: '#E3FCEF' }}>
          <div style={styles.confidenceLevel}>
            <strong>Very High (80-100%)</strong>
          </div>
          <div style={styles.confidenceCriteria}>
            Excellent data coverage with large sample sizes. The measured changes are substantial
            and clearly distinguishable from normal variation. You can be highly confident that
            the improvement shown reflects real progress.
          </div>
        </div>
        <div style={{ ...styles.confidenceRow, backgroundColor: '#DEEBFF' }}>
          <div style={styles.confidenceLevel}>
            <strong>High (60-79%)</strong>
          </div>
          <div style={styles.confidenceCriteria}>
            Good data quality with adequate sample sizes. Changes are clear enough to measure
            reliably. Minor gaps in data or some variation don't significantly impact the
            overall measurement reliability.
          </div>
        </div>
        <div style={{ ...styles.confidenceRow, backgroundColor: '#FFF7E6' }}>
          <div style={styles.confidenceLevel}>
            <strong>Moderate (40-59%)</strong>
          </div>
          <div style={styles.confidenceCriteria}>
            Reasonable data available but with some limitations. The measurement provides a
            useful directional indication, but exact values should be interpreted with some
            caution. Consider the trend rather than specific numbers.
          </div>
        </div>
        <div style={{ ...styles.confidenceRow, backgroundColor: '#FFEBE6' }}>
          <div style={styles.confidenceLevel}>
            <strong>Low (20-39%)</strong>
          </div>
          <div style={styles.confidenceCriteria}>
            Limited data or significant gaps affect reliability. The measurement provides
            some insight but should be viewed as a rough estimate. Focus on general direction
            rather than specific improvement values.
          </div>
        </div>
        <div style={{ ...styles.confidenceRow, backgroundColor: '#FFEBE6' }}>
          <div style={styles.confidenceLevel}>
            <strong>Very Low (0-19%)</strong>
          </div>
          <div style={styles.confidenceCriteria}>
            Insufficient data for reliable measurement. External factors or data gaps make
            it difficult to assess true improvement. Consider waiting for more data before
            drawing conclusions.
          </div>
        </div>
      </div>

      {/* Tips for Improving Confidence */}
      <div style={{ ...styles.infoBox, marginTop: 24 }}>
        <strong style={{ display: 'block', marginBottom: 12 }}>
          Tips for Improving Confidence Scores
        </strong>
        <ul style={{ ...styles.bulletList, margin: 0 }}>
          <li><strong>Run assessments regularly</strong> - Monthly assessments provide better data coverage</li>
          <li><strong>Allow time for changes to manifest</strong> - Wait for the recommended impact window before measuring</li>
          <li><strong>Implement improvements sequentially</strong> - Spacing out changes improves attribution clarity</li>
          <li><strong>Document external factors</strong> - Tracking team changes or project shifts helps interpretation</li>
          <li><strong>Extend measurement periods</strong> - Longer timeframes provide more data points</li>
        </ul>
      </div>
    </div>
  );
};

// Individual confidence factor component
interface ConfidenceFactorProps {
  name: string;
  score: number;
  weight: number;
  icon: string;
  description: string;
  details: string[];
}

const ConfidenceFactor: React.FC<ConfidenceFactorProps> = ({
  name,
  score,
  weight,
  icon,
  description,
  details,
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 70) return '#006644';
    if (s >= 50) return '#0052CC';
    if (s >= 30) return '#FF8B00';
    return '#DE350B';
  };

  const color = getScoreColor(score);

  return (
    <div style={{
      padding: 16,
      backgroundColor: '#FAFBFC',
      borderRadius: 8,
      border: '1px solid #DFE1E6',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#172B4D' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#6B778C' }}>Weight: {weight}%</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color }}>{score}%</div>
          <div style={{ fontSize: 11, color: '#6B778C' }}>
            Contribution: +{Math.round(score * weight / 100)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6,
        backgroundColor: '#DFE1E6',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          backgroundColor: color,
          borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <p style={{ fontSize: 12, color: '#5E6C84', margin: '0 0 8px 0' }}>{description}</p>

      <ul style={{
        margin: 0,
        paddingLeft: 16,
        fontSize: 11,
        color: '#6B778C',
        lineHeight: 1.5,
      }}>
        {details.map((detail, idx) => (
          <li key={idx}>{detail}</li>
        ))}
      </ul>
    </div>
  );
};

const ExclusionsTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h3 style={styles.sectionTitle}>Why Plays Are Excluded</h3>
    <p style={styles.paragraph}>
      Some plays cannot be included in impact calculations. Here's why:
    </p>

    <div style={styles.exclusionList}>
      <div style={styles.exclusionItem}>
        <div style={{ ...styles.exclusionBadge, backgroundColor: '#DEEBFF' }}>
          {'\u23F3'} Awaiting Window
        </div>
        <p>The impact assessment window hasn't opened yet. Each play type needs a specific amount
          of time before we can measure its effect.</p>
        <span style={styles.temporary}>Temporary - will resolve when window opens</span>
      </div>

      <div style={styles.exclusionItem}>
        <div style={{ ...styles.exclusionBadge, backgroundColor: '#F4F5F7' }}>
          {'\u{1F4CA}'} Insufficient Data
        </div>
        <p>Baseline data wasn't captured when the play started. Without a "before" snapshot,
          we can't measure change.</p>
        <span style={styles.permanent}>Permanent - data cannot be recovered</span>
      </div>

      <div style={styles.exclusionItem}>
        <div style={{ ...styles.exclusionBadge, backgroundColor: '#EAE6FF' }}>
          {'\u{1F4C9}'} High Volatility
        </div>
        <p>The baseline metrics showed high volatility, making it unreliable as a comparison point.</p>
        <span style={styles.permanent}>Permanent - affects reliability of comparison</span>
      </div>

      <div style={styles.exclusionItem}>
        <div style={{ ...styles.exclusionBadge, backgroundColor: '#FFF0B3' }}>
          {'\u{1F500}'} Concurrent Overlap
        </div>
        <p>Too many plays are affecting the same metrics simultaneously, making attribution unclear.</p>
        <span style={styles.contextual}>Context-dependent - may improve as plays complete</span>
      </div>
    </div>
  </div>
);

const CaveatsTab: React.FC = () => (
  <div style={styles.tabContent}>
    <h3 style={styles.sectionTitle}>Limitations & Assumptions</h3>

    <div style={styles.caveatSection}>
      <h4 style={styles.subSectionTitle}>{'\u26A0\uFE0F'} Correlation vs. Causation</h4>
      <p style={styles.paragraph}>
        Impact measurements show <em>correlation</em> between plays and score changes, not
        definitive <em>causation</em>. Many factors can influence your team's metrics beyond
        the plays you implement.
      </p>
    </div>

    <div style={styles.caveatSection}>
      <h4 style={styles.subSectionTitle}>{'\u{1F4CA}'} Data Quality Dependency</h4>
      <p style={styles.paragraph}>
        Impact accuracy depends on consistent data capture. If assessments aren't run regularly,
        or if baseline snapshots are missed, measurements will be less reliable.
      </p>
    </div>

    <div style={styles.caveatSection}>
      <h4 style={styles.subSectionTitle}>{'\u23F0'} Timing Assumptions</h4>
      <p style={styles.paragraph}>
        We use research-based estimates for how long plays take to show impact. Your actual
        results may vary based on team size, adoption rate, and other factors.
      </p>
    </div>

    <div style={styles.caveatSection}>
      <h4 style={styles.subSectionTitle}>{'\u{1F465}'} Team Dynamics</h4>
      <p style={styles.paragraph}>
        External factors like team changes, project shifts, or organizational changes can
        affect metrics independently of improvement plays.
      </p>
    </div>

    <div style={styles.infoBox}>
      <strong>Best Practices for Accurate Measurement</strong>
      <ul style={styles.bulletList}>
        <li>Run assessments regularly (at least monthly)</li>
        <li>Start plays one at a time when possible for clearer attribution</li>
        <li>Document external factors that might affect metrics</li>
        <li>Focus on trends over individual data points</li>
      </ul>
    </div>
  </div>
);

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
    zIndex: 1000,
    padding: 24,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxWidth: 1000,
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 12px 40px rgba(9, 30, 66, 0.35)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px',
    borderBottom: '1px solid #DFE1E6',
    backgroundColor: '#FAFBFC',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerIcon: {
    fontSize: 32,
    lineHeight: 1,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: 14,
    color: '#6B778C',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 28,
    color: '#6B778C',
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
    borderRadius: 4,
    transition: 'background-color 0.15s',
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#F4F5F7',
    borderRight: '1px solid #DFE1E6',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    overflowY: 'auto',
    flexShrink: 0,
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '8px 12px 12px',
  },
  sidebarTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    color: '#42526E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    width: '100%',
  },
  sidebarTabActive: {
    backgroundColor: '#FFFFFF',
    color: '#0052CC',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.12)',
  },
  sidebarTabIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  sidebarTabLabel: {
    flex: 1,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 28,
    minHeight: 400,
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
    margin: '12px 0 8px 0',
  },
  paragraph: {
    fontSize: 14,
    color: '#5E6C84',
    lineHeight: 1.5,
    margin: 0,
  },
  diagram: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 16,
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    marginTop: 8,
  },
  diagramStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  diagramCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  diagramText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontSize: 13,
    color: '#172B4D',
  },
  diagramArrow: {
    textAlign: 'center',
    color: '#6B778C',
    fontSize: 16,
    marginLeft: 6,
  },
  timelineTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
  },
  timelineRow: {
    display: 'flex',
    gap: 12,
    padding: 10,
    backgroundColor: '#FAFBFC',
    borderRadius: 4,
    border: '1px solid #DFE1E6',
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: '#172B4D',
    width: 160,
    flexShrink: 0,
  },
  timelineInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  timelineDays: {
    fontSize: 12,
    fontWeight: 500,
    color: '#0052CC',
  },
  timelineRationale: {
    fontSize: 12,
    color: '#6B778C',
  },
  factorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  factor: {
    display: 'flex',
    gap: 12,
    padding: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
  },
  factorIcon: {
    fontSize: 24,
  },
  factorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 13,
    color: '#5E6C84',
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#DEEBFF',
    borderRadius: 8,
    fontSize: 13,
    color: '#172B4D',
    marginTop: 8,
  },
  confidenceTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 8,
  },
  confidenceRow: {
    display: 'flex',
    padding: 12,
    borderRadius: 4,
    gap: 16,
  },
  confidenceLevel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#172B4D',
    width: 140,
    flexShrink: 0,
  },
  confidenceCriteria: {
    fontSize: 13,
    color: '#5E6C84',
  },
  bulletList: {
    margin: '8px 0 0 0',
    paddingLeft: 20,
    fontSize: 13,
    color: '#5E6C84',
    lineHeight: 1.6,
  },
  exclusionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  exclusionItem: {
    padding: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    border: '1px solid #DFE1E6',
  },
  exclusionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 8,
  },
  temporary: {
    fontSize: 11,
    color: '#0052CC',
    fontStyle: 'italic',
  },
  permanent: {
    fontSize: 11,
    color: '#DE350B',
    fontStyle: 'italic',
  },
  contextual: {
    fontSize: 11,
    color: '#B65C02',
    fontStyle: 'italic',
  },
  caveatSection: {
    padding: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
  },
};

export default ImpactMethodologyModal;
