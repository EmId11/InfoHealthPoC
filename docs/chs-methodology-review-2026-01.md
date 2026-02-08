# Composite Health Score (CHS) Methodology - Review Request

**Date:** 2026-01-26
**Purpose:** Final review before UI implementation migration

---

## Context

We are migrating the entire UI from percentile-based scoring to CHS-based scoring. Before implementing, we need confirmation that the CHS methodology (v1.1) is statistically sound.

---

## The CHS Formula

```
CHS = (w_css × CSS) + (w_trs × TRS) + (w_pgs × PGS)

Default weights: w_css = 0.50, w_trs = 0.35, w_pgs = 0.15
```

---

## Component 1: Current State Score (CSS) - 50% weight

**Purpose:** Measure where the team is RIGHT NOW relative to fixed baseline population norms.

**Calculation:**

1. **Direction Adjustment:** `X̃_i = d_i × X_i` where d_i = +1 if higher is better, -1 otherwise

2. **Winsorization:** Clip at 2nd and 98th percentiles: `X̃_i ← clip(X̃_i, P_2, P_98)`

3. **Standardization:** `z_i = (X̃_i - μ_baseline[i]) / σ_baseline[i]`
   - Uses FIXED baseline norms (established at calibration, refreshed annually)
   - Not affected by current peer distribution

4. **Aggregation with variance adjustment:**
   ```
   CSS_raw = Σ(w_i × z_i)

   Variance: Var(CSS_raw) ≈ Σ(w_i²) × (1 + ρ̄(m-1))

   Scaling: k_css = 15 / √(Var(CSS_raw))

   CSS = 50 + k_css × CSS_raw
   ```

5. **Bounding:** `CSS = clip(CSS, 5, 95)`

**Standard Error:**
```
SE(CSS_raw) = √(Σ(w_i² × 2/(n-1))) × √(1 + ρ̄(m-1))
SE(CSS) = k_css × SE(CSS_raw)
```

---

## Component 2: Trajectory Score (TRS) - 35% weight

**Purpose:** Measure how the team is TRENDING within the assessment period.

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

---

## Component 3: Peer Growth Score (PGS) - 15% weight

**Purpose:** Compare your trajectory to peers who started at a similar level.

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

---

## Composite CHS Aggregation

```
CHS = w_css × CSS + w_trs × TRS + w_pgs × PGS_shrunk
```

**Standard Error (with correlation adjustment):**
```
SE(CHS)_raw = √(w_css² × SE(CSS)² + w_trs² × SE(TRS)² + w_pgs² × SE(PGS)²)
SE(CHS) = 1.2 × SE(CHS)_raw  // 20% inflation for component correlation
```

**90% Confidence Interval:**
```
CHS ± 1.645 × SE(CHS)
```

---

## Interpretation Categories

| CHS Range | Category | Color |
|-----------|----------|-------|
| ≥ 70 | Excellent Health | #006644 |
| [55, 70) | Good Health | #00875A |
| [45, 55) | Average | #6B778C |
| [30, 45) | Below Average | #FF8B00 |
| < 30 | Needs Attention | #DE350B |

---

## Missing Data Handling

1. **Minimum Coverage:** Team must have valid data for ≥70% of weighted indicators
2. **Partial Data:** Reweight available indicators proportionally
3. **Provisional Scores:** Teams with <8 weeks historical data get reduced TRS weight

---

## Indicator and Dimension Structure

The CHS methodology uses a **hierarchical indicator structure** organized into 14 dimensions containing approximately 117 indicators.

### Dimension Overview

| # | Dimension | Example Indicators |
|---|-----------|-------------------|
| 1 | Invisible Work | Throughput variability, stale items, siloed work |
| 2 | Jira as Source of Truth | Acceptance criteria, estimates, links |
| 3 | Estimation Practices | Story estimation rate, estimate consistency |
| 4 | Issue Type Usage | Issue type distribution |
| 5 | Data Freshness | Stale items, update frequency |
| 6 | Blocker Management | Blocker resolution time |
| 7 | Work Hierarchy | Epic linkage coverage |
| 8 | Sprint Hygiene | Work carried over, last-day completions |
| 9 | Team Collaboration | Comment density, single contributor rate |
| 10 | Repetitive Work | Recreated tickets |
| 11 | Automatic Status | Stale in-progress work |
| 12 | Collaboration Features | @mention usage, issue links |
| 13 | Configuration Efficiency | Unused statuses, field load |
| 14 | Backlog Discipline | Zombie items, refinement lag |

### Hierarchical Equal Weighting

All dimensions contribute equally (1/14 ≈ 7.1% each), regardless of indicator count. Indicators within each dimension share that dimension's weight equally.

---

## Review Questions for Statisticians

1. Is the CSS fixed-baseline approach statistically valid for longitudinal comparisons?
2. Is the variance-adjusted scaling for CSS aggregation correctly formulated?
3. Is the Empirical Bayes shrinkage for PGS appropriate for small peer groups?
4. Are the standard error formulas correctly propagated through the composite?
5. Is the 20% SE inflation factor for component correlation reasonable?
6. Are the interpretation thresholds (70/55/45/30) sensible for this distribution?
7. Any concerns about the missing data handling approach?

---

## Previous Review History

- **v1.0:** Initial proposal
- **v1.1:** Incorporated feedback from jira-health-statistician, practitioner-statistician, and forge-stats-dev agents
  - Added fixed baseline norms for CSS
  - Fixed aggregate variance scaling
  - Added Empirical Bayes shrinkage to PGS
  - Aligned SE formulas with CPS v3.1
  - Added missing data handling
  - Added admin-configurable weights
