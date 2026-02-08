# Composite Health Score (CHS) Methodology

## Version 1.3 — Revised Based on Indicator Structure Review (2026-01-27)

---

## Executive Summary

This document specifies a methodology for calculating a team's **Health Score** at a single point in time. Unlike percentile-only approaches that hide improvement when all teams improve together, the Composite Health Score (CHS) incorporates both **current state** and **trajectory** into a single score.

**Relationship to CPS**: This methodology complements the Composite Progress Score (CPS) framework (v3.1). While CPS measures *change between two assessment points*, CHS measures *health at a single assessment point*. The Impact Tracker uses:
- **CHS** for the "Before" and "After" scores in the hero section
- **CPS** for tracking progress between assessments

---

## 1. The Problem with Pure Percentile Scoring

### Current Approach
```
Health Score = Percentile rank among peer teams
```

### Why It Fails

| Scenario | Your Indicators | Peer Indicators | Your Percentile | Reality |
|----------|-----------------|-----------------|-----------------|---------|
| You improve, peers don't | +20% | 0% | 50th → 80th | Correct |
| You improve, peers improve equally | +20% | +20% | 50th → 50th | Looks like no progress |
| You improve, peers improve more | +20% | +40% | 50th → 30th | Looks like you declined |

**Percentile scoring is zero-sum.** One team's gain is another's loss. This works for competitive ranking but fails for measuring actual health improvement.

---

## 2. The Composite Health Score Solution

### Core Insight

A team's "health" has two dimensions:
1. **Where they are now** (Current State)
2. **Where they're heading** (Trajectory)

A team scoring 60 but trending upward is healthier than a team scoring 65 but trending downward.

### The Formula

```
CHS = (w_css × CSS) + (w_trs × TRS) + (w_pgs × PGS)
```

Where:
- **CSS** = Current State Score (0-100)
- **TRS** = Trajectory Score (0-100, where 50 = stable)
- **PGS** = Peer Growth Score (0-100, where 50 = average growth)
- **w_css, w_trs, w_pgs** = Weights (sum to 1.0)

**Default weights:** w_css = 0.50, w_trs = 0.35, w_pgs = 0.15

---

## 3. Component Calculations

### 3.1 Current State Score (CSS)

**Purpose:** Measure where the team is RIGHT NOW relative to baseline population norms.

**Input:** Most recent 4 weeks of indicator data.

**Key Design Decision: Fixed Baseline Norms**

To ensure scores are comparable over time and not affected by shifting peer distributions, CSS uses **fixed baseline norms** established during initial calibration:

```
μ_baseline[i] = Population mean for indicator i at calibration
σ_baseline[i] = Population standard deviation at calibration
```

These norms should be re-calibrated annually or when the comparison population changes significantly (e.g., new organization onboarded).

**Calculation:**

#### Step 1: Direction Adjustment

For each indicator i, apply directionality (same as CPS v3.1):

```
X̃_i = d_i × X_i
```

Where d_i = +1 if higher is better, -1 if lower is better.

#### Step 2: Indicator-Level Winsorization

Before computing z-scores, winsorize at the 2nd and 98th percentiles (consistent with CPS v3.1):

```
X̃_i ← clip(X̃_i, P_2, P_98)
```

#### Step 3: Standardization

For each indicator i:
```
z_i = (X̃_i - μ_baseline[i]) / σ_baseline[i]
```

#### Step 4: Aggregation with Variance Adjustment

**Issue**: When aggregating multiple z-scores, the variance of the sum depends on the number of indicators and their correlations.

For the weighted sum:
```
CSS_raw = Σ(w_i × z_i)
```

The variance of this aggregate is:
```
Var(CSS_raw) = Σ(w_i² × Var(z_i)) + 2 × Σ_{i<j}(w_i × w_j × Cov(z_i, z_j))
```

With standardized z-scores (Var = 1) and average correlation ρ̄, when weights sum to 1.0:
```
Var(CSS_raw) = Σ(w_i²) × (1 - ρ̄) + ρ̄
```

**Note:** This is the correct formula for variance of a weighted sum of correlated standardized variables. The previous approximation `Σ(w_i²) × (1 + ρ̄(m-1))` was incorrect and has been replaced.

**Scaling**: To achieve a proper 0-100 scale with SD ≈ 15:

```
k_css = 15 / √(Var(CSS_raw))
CSS = 50 + k_css × CSS_raw
```

**Example with hierarchical equal weighting** (14 dimensions, ~117 indicators):

With dimension weight w_d = 1/14 ≈ 0.0714:
- Σ(w_d²) = 14 × (1/14)² = 1/14 ≈ 0.0714
- With ρ̄ = 0.3 (correlation within dimensions): Var(CSS_raw) ≈ 0.35
- k_css = 15 / √0.35 ≈ 25.4

#### Step 5: Bounding

Bound to [5, 95] to avoid extreme scores:

```
CSS = clip(CSS, 5, 95)
```

**Interpretation:**
- CSS = 50: Average current state relative to baseline norms
- CSS = 65: Current state is 1 SD above baseline average
- CSS = 35: Current state is 1 SD below baseline average

**Standard Error of CSS:**

Using the correlation-adjusted formula (consistent with CPS v3.1 API SE):

```
SE(CSS_raw) = √(Σ(w_i² × 2/(n-1))) × √(1 + ρ̄(m-1))
SE(CSS) = k_css × SE(CSS_raw)
```

Where n is the number of observations (sprints/weeks) used to calculate each indicator.

---

### 3.2 Trajectory Score (TRS)

**Purpose:** Measure how the team is TRENDING within the assessment period.

**Input:** 6 months of historical data, segmented into time periods (weekly or per-sprint).

**Calculation:**

This follows the API calculation from CPS v3.1, applied to early vs. recent periods within a single assessment.

#### Step 1: Segment the Assessment Period

- **Early period**: First 4-6 time periods (sprints/weeks)
- **Recent period**: Last 4-6 time periods

#### Step 2: Calculate Trajectory per Indicator

**Method: Effect Size Approach** (consistent with CPS v3.1 API)

For each indicator i:
```
mean_recent = mean(X̃_i for recent period)
mean_early = mean(X̃_i for early period)
σ_pooled = pooled SD across all periods

trajectory_i = (mean_recent - mean_early) / σ_pooled
```

#### Step 3: Winsorization

At indicator level:
```
trajectory_i ← clip(trajectory_i, -3, +3)
```

At aggregate level (after weighting):
```
TRS_raw ← clip(TRS_raw, -4.5, +4.5)
```

#### Step 4: Aggregate

```
TRS_raw = Σ(w_i × trajectory_i)
```

#### Step 5: Scale (consistent with CPS v3.1)

```
TRS = 50 + 10 × TRS_raw
TRS = clip(TRS, 5, 95)
```

**Interpretation:**
- TRS = 50: Stable, no significant change during assessment period
- TRS = 70: Strong positive trajectory (+2 SD improvement rate)
- TRS = 30: Concerning negative trajectory (-2 SD decline rate)

**Standard Error of TRS:**

Same formula as CPS v3.1 API SE:

```
SE(TRS_raw) = √(Σ(w_i² × 2/(n_periods-1))) × √(1 + ρ̄(m-1))
SE(TRS) = 10 × SE(TRS_raw)
```

---

### 3.3 Peer Growth Score (PGS)

**Purpose:** Compare your trajectory to peers who started at a similar level.

**Why this matters:** A team starting at 30 improving to 50 is more impressive than a team starting at 80 improving to 85. PGS accounts for this—it's the CHS equivalent of CGP from CPS v3.1.

**Calculation:**

This follows the CGP calculation from CPS v3.1.

#### Step 1: Establish Baseline Groups

Based on CSS at the START of the assessment period (same grouping logic as CPS v3.1):

| Sample Size (n) | Grouping |
|-----------------|----------|
| n ≥ 50 | Deciles (10 groups) |
| 30 ≤ n < 50 | Quintiles (5 groups) |
| 20 ≤ n < 30 | Quartiles (4 groups) |
| n < 20 | Do not compute PGS |

#### Step 2: Merge Small Groups

Minimum group size: 5 teams. Use the merge procedure from CPS v3.1 Section 4.3.2:

```
WHILE any group has < 5 teams:
  smallest = group with minimum team count

  IF smallest is lowest group: merge with next higher
  ELSE IF smallest is highest group: merge with next lower
  ELSE: merge toward distribution center

  Log all merges for audit
```

#### Step 3: Calculate Raw Percentile

Within each baseline group g, compute the percentile rank of each team's trajectory:

```
PGS_raw = (rank(TRS_raw within group) - 0.5) / n_g × 100
```

The -0.5 is the continuity correction for discrete ranks.

**Tie Handling:** Assign average rank to tied teams (same as CPS v3.1).

#### Step 4: Empirical Bayes Shrinkage

Raw PGS from small groups is noisy. Apply shrinkage toward the grand mean (same as CPS v3.1 CGP):

```
PGS_shrunk = α_g × PGS_raw + (1 - α_g) × 50
```

Where:
```
α_g = (n_g - 1) / (n_g - 1 + κ)
```

**Estimating κ:** Use method of moments (see CPS v3.1 Section 4.3.3).

**Default:** κ = 10 if estimation is unstable.

**Interpretation:**
- PGS = 50: Your trajectory is median for teams that started where you started
- PGS = 80: You're improving faster than 80% of teams at your starting level
- PGS = 20: Most teams at your starting level are improving faster than you

**Standard Error of PGS:**

Using the order-statistic approximation (consistent with CPS v3.1 CGP SE):

```
SE(PGS_raw) = 50 / √(n_g)
SE(PGS_shrunk) = α_g × SE(PGS_raw)
```

---

## 4. Composite Score Aggregation

### 4.1 CHS Calculation

```
CHS = w_css × CSS + w_trs × TRS + w_pgs × PGS_shrunk
```

**Default weights:**
- w_css = 0.50 (current state)
- w_trs = 0.35 (trajectory)
- w_pgs = 0.15 (peer comparison)

### 4.2 Standard Error of CHS

By propagation of uncertainty (assuming component independence):

```
SE(CHS)_raw = √(w_css² × SE(CSS)² + w_trs² × SE(TRS)² + w_pgs² × SE(PGS_shrunk)²)
```

**Important:** This is a lower bound. CSS, TRS, and PGS are positively correlated. Apply 20% inflation (consistent with CPS v3.1):

```
SE(CHS) = 1.2 × SE(CHS)_raw
```

**Note:** The 1.2 inflation factor is a provisional conservative estimate. It should be empirically validated after 6+ months of production data by computing actual component covariances.

### 4.3 Confidence Interval

Approximate 90% CI:

```
CHS ± 1.645 × SE(CHS)
```

### 4.4 Interpretation Categories

| CHS Range | Category | Color |
|-----------|----------|-------|
| ≥ 70 | Excellent Health | #006644 |
| [55, 70) | Good Health | #00875A |
| [45, 55) | Average Health | #6B778C |
| [30, 45) | Below Average | #FF8B00 |
| < 30 | Needs Attention | #DE350B |

---

## 5. Missing Data Handling

*Aligned with CPS v3.1 Section 4.7*

### 5.1 Minimum Coverage Requirements

A team must have valid data for at least **70%** of weighted indicators:

```
coverage = Σ(w_i for indicators with valid data)
IF coverage < 0.70: exclude team from analysis
```

### 5.2 Handling Partial Data

When a team has partial coverage (≥70% but <100%):

**Reweight available indicators proportionally:**

```
w_i' = w_i / Σ(w_j for valid indicators)
```

### 5.3 Documentation

For transparency, report:
1. Total teams excluded due to insufficient data
2. Per-team coverage percentage
3. Which indicators were missing

### 5.4 Provisional Scores

Teams with < 8 weeks of historical data:
- TRS weight reduces proportionally: `w_trs' = w_trs × (weeks / 8)`
- CSS weight increases to compensate
- PGS may be excluded entirely
- Flag score as "Provisional"

---

## 6. Admin-Configurable Weights

### 6.1 User-Friendly Framing

Instead of exposing raw weight parameters, present as preference settings:

**"How should we balance your health score?"**

| Setting | Description | w_css | w_trs | w_pgs |
|---------|-------------|-------|-------|-------|
| **Balanced (Recommended)** | Equal emphasis on current practices and improvement trajectory | 0.50 | 0.35 | 0.15 |
| **Snapshot Focus** | Emphasize where teams are today over where they're heading | 0.65 | 0.25 | 0.10 |
| **Growth Focus** | Emphasize improvement trajectory over current position | 0.40 | 0.45 | 0.15 |
| **Peer Comparison** | Stronger emphasis on how teams compare to similar peers | 0.45 | 0.30 | 0.25 |

### 6.2 Constraints

- All weights must be positive
- Weights must sum to 1.0
- w_css ≥ 0.30 (current state always matters)
- w_trs ≥ 0.15 (trajectory always contributes)
- w_pgs ≤ 0.30 (don't over-weight relative comparison)

### 6.3 Sensitivity Analysis

When weights are changed from defaults, automatically run sensitivity analysis:
- Compute CHS under default and custom weights
- Flag if >20% of teams change category
- Display warning if results are highly sensitive to weight choice

---

## 7. Indicator and Dimension Structure

The CHS methodology uses a **hierarchical indicator structure** organized into 14 dimensions containing approximately 117 indicators.

### 7.1 Dimension Overview

| # | Dimension | Description | Indicators |
|---|-----------|-------------|------------|
| 1 | Invisible Work | Hidden work patterns and visibility gaps | ~17 |
| 2 | Jira as Source of Truth | Information quality and completeness | ~18 |
| 3 | Estimation Practices | Estimation coverage and consistency | ~17 |
| 4 | Issue Type Usage | Consistency in issue type classification | ~4 |
| 5 | Data Freshness | Currency of information | ~8 |
| 6 | Blocker Management | Impediment tracking and resolution | ~4 |
| 7 | Work Hierarchy | Parent-child relationship integrity | ~1 |
| 8 | Sprint Hygiene | Sprint planning and execution discipline | ~7 |
| 9 | Team Collaboration | Communication and cross-functional work | ~15 |
| 10 | Repetitive Work | Duplicate effort detection | ~1 |
| 11 | Automatic Status | Status synchronization accuracy | ~5 |
| 12 | Collaboration Features | Usage of Jira collaboration tools | ~5 |
| 13 | Configuration Efficiency | Workflow and field optimization | ~7 |
| 14 | Backlog Discipline | Backlog health and maintenance | ~8 |

### 7.2 Hierarchical Equal Weighting

The default weighting scheme ensures **all dimensions contribute equally** regardless of indicator count:

```
Dimension weight: w_d = 1/D = 1/14 ≈ 0.071
Indicator weight within dimension: w_{d,i} = 1/m_d
Effective indicator weight: w_d × w_{d,i} = 1/(D × m_d)
```

**Example:**
- Dimension 3 (17 indicators): Each indicator = 1/(14×17) ≈ 0.0042
- Dimension 4 (4 indicators): Each indicator = 1/(14×4) ≈ 0.0179
- Both dimensions contribute 1/14 ≈ 7.1% to total

This ensures dimensions with more indicators don't dominate the composite score.

---

## 8. Impact Tracker: Before and After

With CHS, the Impact Tracker displays meaningful before/after comparisons:

### At Assessment Time T₁ (Baseline)
```
CHS_before = (0.50 × CSS₁) + (0.35 × TRS₁) + (0.15 × PGS₁)
           = (0.50 × 48) + (0.35 × 45) + (0.15 × 40)
           = 24 + 15.75 + 6
           = 45.75 ≈ 46
```

### At Assessment Time T₂ (3 months later)
```
CHS_after = (0.50 × CSS₂) + (0.35 × TRS₂) + (0.15 × PGS₂)
          = (0.50 × 62) + (0.35 × 68) + (0.15 × 75)
          = 31 + 23.8 + 11.25
          = 66.05 ≈ 66
```

### Impact Display
```
Before: 46 [43, 49]  ← 90% CI
After:  66 [62, 70]
Change: +20 points
```

**This +20 is REAL.** It reflects:
- Current state improved (CSS: 48 → 62)
- Trajectory improved (TRS: 45 → 68)
- Improving faster than similar peers (PGS: 40 → 75)

Even if ALL teams improved by similar amounts, their CSS and TRS values would still go up—the improvement is VISIBLE, not hidden by percentile reshuffling.

---

## 9. Statistical Properties

### 9.1 Score Distribution

Expected distribution: Approximately normal, centered around 50.

- Mean: ~50 (by construction, relative to baseline norms)
- Standard Deviation: ~15
- Range: [5, 95] (bounded)

### 9.2 Reliability

Components have different reliability characteristics:
- CSS: High reliability (recent data, direct measurement)
- TRS: Moderate reliability (depends on data consistency)
- PGS: Lower reliability (depends on peer group size)

Weights reflect this: CSS (50%) > TRS (35%) > PGS (15%)

### 9.3 Validity

The score measures what we care about:
- Are your Jira practices healthy? (CSS)
- Are they getting healthier? (TRS)
- Are you improving as fast as you should be? (PGS)

---

## 10. Comparison: CHS vs. Pure Percentile

| Aspect | Percentile Scoring | Composite Health Score |
|--------|-------------------|------------------------|
| Measures | Relative rank | Actual state + trajectory |
| Zero-sum? | Yes | No |
| Everyone improves | Looks flat | Shows real improvement |
| Accounts for trajectory | No | Yes (35% weight) |
| Peer context | Absolute ranking | Growth comparison within baseline group |
| Gaming resistant | Low | Higher |
| Uncertainty quantified | No | Yes (SE and CI) |

---

## 11. Relationship to CPS v3.1

| Aspect | CHS | CPS |
|--------|-----|-----|
| **Purpose** | Single-point health measurement | Progress between two points |
| **Use in UI** | Before/After scores in Impact Tracker | (Could be used for detailed progress analysis) |
| **Components** | CSS, TRS, PGS | API, CGP, TNV |
| **Shared formulas** | TRS ≈ API, PGS ≈ CGP | Same statistical foundations |
| **Assessment window** | 6 months historical for TRS | Between two assessments for API |

The frameworks are complementary:
- CHS answers: "How healthy is this team right now?"
- CPS answers: "How much did this team improve between assessments?"

---

## 12. Implementation Notes for Forge

### 12.1 Computational Feasibility

All CHS calculations are feasible within Forge constraints:
- No iterative optimization required
- No external library dependencies
- Can complete within 25-55 second limits

### 12.2 Caching Strategy

- Cache baseline norms (μ_baseline, σ_baseline) for each indicator
- Cache peer group assignments (update monthly)
- Cache team CHS results (invalidate on new data)

### 12.3 Async Considerations

- Load all team data asynchronously before calculation
- Parallelize indicator-level calculations where possible

---

## 13. Open Questions

1. **Baseline norm refresh frequency:** Annual? On significant population change?

2. **Small portfolio handling:** For n < 20, should we skip PGS entirely or use a simplified version?

3. **Cross-organization comparisons:** Should baseline norms be org-specific or global?

---

## 14. Revision History

| Version | Changes |
|---------|---------|
| 1.0 | Initial proposal |
| 1.1 | Addressed statistical review feedback: (1) Added fixed baseline norms for CSS; (2) Fixed aggregate variance scaling for CSS; (3) Added Empirical Bayes shrinkage to PGS; (4) Aligned all SE formulas with CPS v3.1; (5) Added missing data handling section; (6) Added admin-configurable weights with user-friendly framing; (7) Added relationship to CPS v3.1 section |
| 1.2 | 2026-01-26 statistical review: (1) **CRITICAL FIX**: Corrected CSS variance formula from `Σ(w_i²) × (1 + ρ̄(m-1))` to `Σ(w_i²) × (1 - ρ̄) + ρ̄`; (2) Documented SE inflation factors as provisional; (3) Added ceiling effect guidance |
| 1.3 | 2026-01-27: (1) Corrected indicator structure to reflect actual 14-dimension hierarchy (~117 indicators); (2) Documented hierarchical equal weighting methodology; (3) Updated variance calculation example |

---

*Document version 1.3. Revised to reflect accurate 14-dimension indicator structure with hierarchical equal weighting (2026-01-27).*

---

## Appendix: Ceiling Effect Guidance

Teams with high baseline CHS (≥ 75) have limited room for improvement. When using CHS for before/after comparisons:

| Baseline CHS | Interpretation |
|--------------|----------------|
| ≥ 80 | Focus on CGP (peer comparison) in CPS. Maintaining excellence is itself an achievement. A CPS of 48-55 indicates "Sustained Excellence." |
| 75-80 | Moderate improvement possible. CPS of 50-55 is acceptable. |
| < 75 | Full CPS interpretation applies. |

**UI Recommendation:** When CHS_before ≥ 80 and improvement is minimal, display: "Maintaining Excellence - Your team is operating at a high level and holding steady."
