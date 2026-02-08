# Invisible Work Risk: Quick Reference

## Version 1.0 — 2026-01-28

---

## What This Measures

**Invisible Work Risk (IWR)** detects effort not tracked in Jira through statistical fingerprints—anomalous patterns suggesting hidden work.

| IWR Score | Risk Level | Action |
|-----------|------------|--------|
| ≤ 30 | Low | Work well-captured |
| 31-45 | Moderate | Monitor |
| 46-55 | Typical | Room for improvement |
| 56-70 | Elevated | Investigate |
| > 70 | High | Action needed |

---

## Core Formula

$$\text{IWR} = 0.75 \times \text{CSS}_{\text{inv}} + 0.25 \times \text{TRS}_{\text{inv}}$$

| Component | Weight | Measures |
|-----------|--------|----------|
| CSS (Current State) | 75% | Current indicator levels vs. baseline |
| TRS (Trajectory) | 25% | Trend over assessment period |
| PGS (Peer Growth) | 0% | Excluded (circular reasoning risk) |

---

## Indicator Weights

### Primary Signals (55% total)

| Indicator | Weight | Signal |
|-----------|--------|--------|
| `throughputVariability` | 7.86% | Output swings = hidden work |
| `memberThroughputVariability` | 7.86% | Individual output varies |
| `workflowStageTimeVariability` | 7.86% | Stage time varies |
| `sameSizeTimeVariability` | 7.86% | Same-size work varies |
| `avgDailyUpdates` | 7.86% | Low updates = work elsewhere |
| `staleWorkItems` | 7.86% | Stale items = attention elsewhere |
| `inProgressItemsVariability` | 7.86% | WIP fluctuates |

### Supporting Signals (35% total)

| Indicator | Weight |
|-----------|--------|
| `closedWithoutComments` | 5.00% |
| `midSprintCreations` | 5.00% |
| `frequentUseVariability` | 5.00% |
| `collaborationVariability` | 5.00% |
| `staleEpics` | 5.00% |
| `bulkChanges` | 5.00% |
| `lastDayCompletions` | 5.00% |

### Contextual Signals (10% total)

| Indicator | Weight |
|-----------|--------|
| `zombieItemCount` | 3.33% |
| `estimationVariability` | 3.33% |
| `capacitySplitAcrossProjects` | 3.33% |

---

## Key Formulas

### CSS Calculation

$$z_i = \frac{\tilde{X}_i - \mu_{\text{baseline},i}}{\sigma_{\text{baseline},i}}$$

$$\text{CSS}_{\text{raw}} = \sum_{i} w_i \cdot z_i$$

$$\text{CSS}_{\text{inv}} = \text{clip}(50 + 21.5 \times \text{CSS}_{\text{raw}}, 5, 95)$$

### TRS Calculation

$$\text{trajectory}_i = \frac{\bar{X}_{\text{recent}} - \bar{X}_{\text{early}}}{\sigma_{\text{pooled}}}$$

$$\text{TRS}_{\text{inv}} = \text{clip}(50 + 10 \times \text{TRS}_{\text{raw}}, 20, 80)$$

### Confidence Interval

$$\text{IWR} \pm 1.645 \times \text{SE}(\text{IWR})$$

---

## Transformations

**Variability indicators** (log-transform):
$$\tilde{X}_i = -\log(\max(X_i, 0.01))$$

**Rate indicators** (direction-adjust):
$$\tilde{X}_i = d_i \times X_i$$

Where $d_i = -1$ for `avgDailyUpdates`, $d_i = +1$ for all others.

---

## Key Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Correlation $\bar{\rho}$ | 0.45 | Higher than general CHS (0.30) |
| CSS scaling factor $k$ | 21.5 | Produces SD ≈ 15 |
| Z-score cap (CSS) | ±3 | Standard |
| Trajectory cap (TRS) | ±2 | Tighter than CHS |
| SE inflation | 1.30 | For component correlation |

---

## Data Requirements

| Requirement | Threshold |
|-------------|-----------|
| Minimum history | 4 weeks |
| Full TRS calculation | 8 weeks |
| Indicator coverage | ≥ 60% |
| Team size | ≥ 3 (else shrinkage) |

---

## Precision Thresholds

| SE(IWR) | Coverage | Precision |
|---------|----------|-----------|
| ≤ 5 | ≥ 90% | High |
| 5-10 | 70-89% | Medium |
| > 10 | < 70% | Low |

---

## Health Score Conversion

For UI consistency with other dimensions:

$$\text{Invisible Work Health} = 100 - \text{IWR}$$

---

## Common Flags

| Flag | Meaning |
|------|---------|
| "Insufficient Data" | < 4 weeks or < 60% coverage |
| "Provisional" | 4-7 weeks (CSS-only) |
| "Limited Data" | 60-79% coverage |
| "New Team" | < 8 weeks, shrinkage applied |
| "Methodology Change" | Recent process transition |

---

*Quick Reference v1.0 — See full specification for details*
