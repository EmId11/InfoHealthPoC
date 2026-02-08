# Unified Scoring Methodology - Statistical Review Request

**Date:** 2026-01-26
**Version:** CHS v1.1 + CPS v3.1
**Purpose:** Final validation before complete UI migration from percentile-based to composite score-based system

---

## Executive Summary

We are migrating the entire Jira Health app from percentile-based scoring to a two-part composite scoring system:

1. **CHS (Composite Health Score)** - For point-in-time health assessment
2. **CPS (Composite Progress Score)** - For measuring progress between assessments

This document combines both methodologies for unified review.

---

## Part 1: Composite Health Score (CHS) v1.1

### Purpose
Measure a team's Jira health at a single point in time, producing a score from 0-100 where 50 represents the baseline average.

### Formula
```
CHS = (w_css × CSS) + (w_trs × TRS) + (w_pgs × PGS)

Default weights: w_css = 0.50, w_trs = 0.35, w_pgs = 0.15
```

### Component 1: Current State Score (CSS) - 50% weight

**Purpose:** Where the team is RIGHT NOW relative to fixed baseline population norms.

**Calculation:**

1. **Direction Adjustment:** `X̃_i = d_i × X_i` where d_i = +1 if higher is better, -1 otherwise

2. **Winsorization:** Clip at 2nd and 98th percentiles: `X̃_i ← clip(X̃_i, P_2, P_98)`

3. **Standardization:** `z_i = (X̃_i - μ_baseline[i]) / σ_baseline[i]`
   - Uses FIXED baseline norms (established at calibration, refreshed annually)
   - Not affected by current peer distribution

4. **Aggregation with variance adjustment:**
   ```
   CSS_raw = Σ(w_i × z_i)

   Variance: Var(CSS_raw) = Σ(w_i²) × (1 - ρ̄) + ρ̄

   (When weights sum to 1.0. This is the correct formula for
   variance of a weighted sum of correlated standardized variables.)

   Scaling: k_css = 15 / √(Var(CSS_raw))

   CSS = 50 + k_css × CSS_raw
   ```

   **Example with default weights:**
   - Σ(w_i²) ≈ 0.0082 (sum of squared weights)
   - ρ̄ = 0.3 (average inter-indicator correlation)
   - Var(CSS_raw) = 0.0082 × 0.7 + 0.3 = 0.306
   - k_css = 15 / √0.306 ≈ 27.1

5. **Bounding:** `CSS = clip(CSS, 5, 95)`

**Standard Error:**
```
SE(CSS_raw) = √(Σ(w_i² × 2/(n-1))) × √(1 + ρ̄(m-1))
SE(CSS) = k_css × SE(CSS_raw)
```

### Component 2: Trajectory Score (TRS) - 35% weight

**Purpose:** How the team is TRENDING within the assessment period.

**Calculation:**

1. **Segment:** Split 6-month assessment into early (first 4-6 periods) vs recent (last 4-6 periods)

2. **Effect Size per indicator:**
   ```
   trajectory_i = (mean_recent - mean_early) / σ_pooled
   ```

3. **Winsorization:**
   - Indicator level: `clip(trajectory_i, -3, +3)`
   - Aggregate level: `clip(TRS_raw, -4.5, +4.5)`

4. **Scale:**
   ```
   TRS = 50 + 10 × TRS_raw
   TRS = clip(TRS, 5, 95)
   ```

**Interpretation:**
- TRS = 50: Stable
- TRS = 70: Strong positive trajectory (+2 SD improvement)
- TRS = 30: Concerning decline (-2 SD)

**Standard Error:**
```
SE(TRS_raw) = √(Σ(w_i² × 2/(n_periods-1))) × √(1 + ρ̄(m-1))
SE(TRS) = 10 × SE(TRS_raw)
```

### Component 3: Peer Growth Score (PGS) - 15% weight

**Purpose:** Compare trajectory to peers who started at a similar level.

**Calculation:**

1. **Establish Baseline Groups** (based on CSS at start of assessment):
   - n ≥ 50: Deciles (10 groups)
   - 30 ≤ n < 50: Quintiles (5 groups)
   - 20 ≤ n < 30: Quartiles (4 groups)
   - n < 20: Skip PGS

2. **Merge Small Groups** (minimum 5 teams per group)

3. **Raw Percentile within group:**
   ```
   PGS_raw = (rank(TRS_raw within group) - 0.5) / n_g × 100
   ```

4. **Empirical Bayes Shrinkage:**
   ```
   PGS_shrunk = α_g × PGS_raw + (1 - α_g) × 50

   α_g = (n_g - 1) / (n_g - 1 + κ)
   ```
   Default κ = 10

**Standard Error:**
```
SE(PGS_raw) = 50 / √(n_g)
SE(PGS_shrunk) = α_g × SE(PGS_raw)
```

### CHS Aggregation

```
CHS = w_css × CSS + w_trs × TRS + w_pgs × PGS_shrunk
```

**Standard Error (with correlation adjustment):**
```
SE(CHS)_raw = √(w_css² × SE(CSS)² + w_trs² × SE(TRS)² + w_pgs² × SE(PGS)²)
SE(CHS) = 1.2 × SE(CHS)_raw  // 20% inflation for component correlation
```

**Note:** The 1.2 inflation factor is a provisional conservative estimate. It should be empirically validated after 6+ months of production data by computing actual component covariances.

**90% Confidence Interval:**
```
CHS ± 1.645 × SE(CHS)
```

### CHS Interpretation Categories

| CHS Range | Category | Color |
|-----------|----------|-------|
| ≥ 70 | Excellent Health | #006644 |
| [55, 70) | Good Health | #00875A |
| [45, 55) | Average | #6B778C |
| [30, 45) | Below Average | #FF8B00 |
| < 30 | Needs Attention | #DE350B |

---

## Part 2: Composite Progress Score (CPS) v3.1

### Purpose
Measure how much a team has improved between two assessment points (e.g., "Before" and "After" in Impact Tracker).

### Formula
```
CPS = (w_api × API) + (w_cgp × CGP) + (w_tnv × TNV)

Default weights: w_api = 0.50, w_cgp = 0.30, w_tnv = 0.20
```

### Component 1: Absolute Progress Index (API) - 50% weight

**Purpose:** Standardized measure of improvement magnitude.

**Calculation:**

1. **Health Score Change:**
   ```
   Δ_HS = CHS_after - CHS_before
   ```

2. **Standardization:**
   ```
   API_raw = Δ_HS / σ_change
   ```
   Where σ_change is the population standard deviation of health score changes

3. **Scale to 0-100:**
   ```
   API = 50 + (API_raw × 15)
   API = clip(API, 5, 95)
   ```

**Interpretation:**
- API = 50: No change
- API = 65: +1 SD improvement
- API = 80: +2 SD improvement (exceptional)
- API = 35: -1 SD decline

**Standard Error:**
```
SE(API) = 15 × √(2) / √(n_indicators)
```

### Component 2: Conditional Growth Percentile (CGP) - 30% weight

**Purpose:** Compare your growth to teams that started at similar baseline levels.

**Calculation:**

1. **Group Formation:** Same baseline groups as PGS in CHS

2. **Within-Group Ranking:**
   ```
   CGP_raw = (rank(Δ_HS within group) - 0.5) / n_g × 100
   ```

3. **Empirical Bayes Shrinkage:**
   ```
   CGP_shrunk = α_g × CGP_raw + (1 - α_g) × 50
   α_g = (n_g - 1) / (n_g - 1 + κ)
   ```
   Default κ = 10

**Interpretation:**
- CGP = 50: Average growth for your starting level
- CGP = 75: Top quartile growth for similar teams
- CGP = 25: Bottom quartile growth

**Standard Error:**
```
SE(CGP) = α_g × 50 / √(n_g)
```

### Component 3: Time-Normalized Velocity (TNV) - 20% weight

**Purpose:** Rate of improvement per unit time, allowing comparison across different assessment periods.

**Calculation:**

1. **Velocity Calculation:**
   ```
   velocity = Δ_HS / Δ_time_weeks
   ```

2. **Standardization:**
   ```
   TNV_raw = velocity / σ_velocity
   ```

3. **Scale to 0-100:**
   ```
   TNV = 50 + (TNV_raw × 12)
   TNV = clip(TNV, 5, 95)
   ```

**Interpretation:**
- TNV = 50: Average rate of change
- TNV > 60: Fast improvement
- TNV < 40: Slow improvement or decline

**Standard Error:**
```
SE(TNV) = 12 × √(2 / Δ_time_weeks) / √(n_indicators)
```

### CPS Aggregation

```
CPS = w_api × API + w_cgp × CGP_shrunk + w_tnv × TNV
```

**Standard Error:**
```
SE(CPS)_raw = √(w_api² × SE(API)² + w_cgp² × SE(CGP)² + w_tnv² × SE(TNV)²)
SE(CPS) = 1.15 × SE(CPS)_raw  // 15% inflation for component correlation
```

**Note:** The 1.15 inflation factor is a provisional conservative estimate. It should be empirically validated after 6+ months of production data.

### CPS Interpretation

| CPS Range | Interpretation |
|-----------|----------------|
| ≥ 70 | Exceptional Progress |
| [60, 70) | Strong Progress |
| [52, 60) | Moderate Progress |
| [48, 52) | Stable (No Significant Change) |
| [40, 48) | Slight Decline |
| < 40 | Significant Regression |

**Note:** The [48, 52) "Stable" band acknowledges measurement uncertainty around zero change. CPS = 50 means literally no change, so labeling it as "progress" would be misleading.

---

## Part 3: How CHS and CPS Work Together

### Impact Tracker Flow

```
Assessment 1 (Baseline)     Assessment 2 (Current)
        ↓                           ↓
    CHS = 42                    CHS = 58
   (Before)                     (After)
        ↓                           ↓
        └──────────┬───────────────┘
                   ↓
              CPS = 67
        (Measures the Progress)
```

### Data Flow

1. **Initial Assessment:**
   - Raw Jira data → 14 dimensions (~117 indicators) → CHS calculation → Health Score (0-100)

2. **Ongoing Tracking:**
   - Each assessment produces a CHS score
   - Comparing any two CHS scores produces a CPS score
   - CPS measures the quality and significance of the change

3. **Display in Impact Tracker:**
   - "Before" card: CHS from baseline assessment
   - "After" card: CHS from current assessment
   - "Progress" section: CPS showing improvement quality

### Ceiling Effect Guidance

Teams with high baseline CHS (≥ 75) have limited room for improvement. For these teams:

| Baseline CHS | Interpretation Guidance |
|--------------|------------------------|
| ≥ 80 | Focus on CGP (peer comparison). A CPS of 48-55 indicates "Sustained Excellence" - maintaining high performance is itself an achievement. |
| 75-80 | Moderate improvement possible. CPS of 50-55 is acceptable; focus on preventing regression. |
| < 75 | Full CPS interpretation applies. |

**UI Recommendation:** When CHS_before ≥ 80 and CPS is in [48, 55], display: "Maintaining Excellence - Your team is operating at a high level and holding steady."

---

## Part 4: Indicator and Dimension Structure (Common to Both Systems)

The scoring methodology uses a **hierarchical indicator structure** organized into 14 dimensions containing approximately 117 indicators.

### 4.1 Dimension Overview

| # | Dimension | Indicators | Example Metrics |
|---|-----------|------------|-----------------|
| 1 | Invisible Work | ~17 | Throughput variability, stale items, siloed work |
| 2 | Jira as Source of Truth | ~18 | Acceptance criteria, estimates, links |
| 3 | Estimation Practices | ~17 | Story estimation rate, estimate consistency |
| 4 | Issue Type Usage | ~4 | Issue type distribution |
| 5 | Data Freshness | ~8 | Stale items, update frequency |
| 6 | Blocker Management | ~4 | Blocker resolution time |
| 7 | Work Hierarchy | ~1 | Epic linkage coverage |
| 8 | Sprint Hygiene | ~7 | Work carried over, last-day completions |
| 9 | Team Collaboration | ~15 | Comment density, single contributor rate |
| 10 | Repetitive Work | ~1 | Recreated tickets |
| 11 | Automatic Status | ~5 | Stale in-progress work |
| 12 | Collaboration Features | ~5 | @mention usage, issue links |
| 13 | Configuration Efficiency | ~7 | Unused statuses, field load |
| 14 | Backlog Discipline | ~8 | Zombie items, refinement lag |

### 4.2 Hierarchical Equal Weighting

The methodology applies **hierarchical equal weighting**:
- Each dimension receives weight = 1/14 ≈ 0.071
- Indicators within each dimension share that dimension's weight equally
- This ensures dimensions with more indicators don't dominate the composite score

**Example:**
- Dimension 3 (17 indicators): Each indicator = 1/(14×17) ≈ 0.0042
- Dimension 4 (4 indicators): Each indicator = 1/(14×4) ≈ 0.0179
- Both dimensions contribute 1/14 ≈ 7.1% to total

---

## Part 5: Missing Data Handling

### For CHS:
1. **Minimum Coverage:** Team must have valid data for ≥70% of weighted indicators
2. **Partial Data:** Reweight available indicators proportionally
3. **Provisional Scores:** Teams with <8 weeks historical data get reduced TRS weight (0.20 instead of 0.35)

### For CPS:
1. **Minimum Period:** At least 4 weeks between assessments
2. **Indicator Matching:** Same indicators must be available in both assessments
3. **Provisional Progress:** Short periods (<8 weeks) get reduced TNV weight

---

## Review Questions for Statisticians

### CHS-Specific Questions:
1. Is the CSS fixed-baseline approach statistically valid for longitudinal comparisons?
2. Is the variance-adjusted scaling for CSS aggregation correctly formulated?
3. Is the Empirical Bayes shrinkage for PGS appropriate for small peer groups?

### CPS-Specific Questions:
4. Is the CGP conditional growth approach valid for controlling regression-to-mean?
5. Is TNV time-normalization appropriate for comparing different assessment periods?
6. Should API use raw health score change or should it also be conditional on baseline?

### Integration Questions:
7. Are the standard error formulas correctly propagated through both composites?
8. Is using CHS as the "before/after" measure and CPS as the "change" measure coherent?
9. Are the correlation adjustments (20% for CHS, 15% for CPS) reasonable?
10. Should CPS weight the API higher when assessing struggling teams (low baseline CHS)?

### Practical Questions:
11. Are the interpretation thresholds sensible for stakeholder communication?
12. How should we handle edge cases (e.g., team with CHS=90 can't improve much)?
13. Is this approach robust to gaming (teams artificially lowering baseline)?

---

## Previous Review History

### CHS:
- **v1.0:** Initial proposal
- **v1.1:** Incorporated feedback from jira-health-statistician, practitioner-statistician, forge-stats-dev
  - Added fixed baseline norms for CSS
  - Fixed aggregate variance scaling
  - Added Empirical Bayes shrinkage to PGS
  - Aligned SE formulas

### CPS:
- **v1.0:** Initial effect-size approach
- **v2.0:** Added conditional growth (CGP) to address baseline effects
- **v3.0:** Added time normalization (TNV) for period comparisons
- **v3.1:** Refined shrinkage parameters, aligned with CHS methodology

### This Document (Unified Review):
- **v1.0:** Combined CHS v1.1 + CPS v3.1 for unified review
- **v1.1:** Incorporated 2026-01-26 statistical review feedback:
  - Fixed CSS variance formula (was using incorrect approximation)
  - Added "Stable" band [48, 52) to CPS thresholds
  - Added ceiling effect guidance for high-baseline teams
  - Documented correlation adjustments (20%/15%) as provisional
  - Added anti-gaming recommendations

---

## Appendix: Key Formulas Summary

### CHS (Point-in-Time Health)
```
CSS_raw = Σ(w_i × z_i)
Var(CSS_raw) = Σ(w_i²) × (1 - ρ̄) + ρ̄     // CORRECTED formula
k_css = 15 / √(Var(CSS_raw))
CSS = 50 + k_css × CSS_raw                 // Current state vs baseline

TRS = 50 + 10 × Σ(w_i × effect_size_i)    // Trajectory within period
PGS = shrink(rank_within_group)            // Peer comparison

CHS = 0.50×CSS + 0.35×TRS + 0.15×PGS
```

### CPS (Progress Between Points)
```
API = 50 + 15 × (Δ_CHS / σ_change)        // Magnitude of change
CGP = shrink(rank_of_change_within_group)  // Growth vs similar teams
TNV = 50 + 12 × (velocity / σ_velocity)    // Rate of change

CPS = 0.50×API + 0.30×CGP + 0.20×TNV
```
