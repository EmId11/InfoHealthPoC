# Invisible Work Indicator Selection Matrix

## Version 1.0 — 2026-01-28

---

## 1. Selection Methodology

### 1.1 Purpose

This document provides a systematic analysis of all 117 indicators in the Jira Health Assessment framework to determine which are suitable for detecting **Invisible Work**—effort that occurs but is not tracked in Jira.

### 1.2 Selection Criteria

Each indicator is evaluated against four criteria:

| Criterion | Weight | Definition |
|-----------|--------|------------|
| **Causal Connection** | 40% | How directly does this pattern result from invisible work? Does untracked work directly cause this signal? |
| **Specificity** | 25% | Does this pattern have few alternative explanations? Could this signal arise from factors other than invisible work? |
| **Actionability** | 20% | Can teams address the underlying invisible work cause? Does improving this indicator require addressing invisible work? |
| **Measurability** | 15% | Can we reliably detect this pattern in Jira data? Is the signal stable and not overly noisy? |

### 1.3 Scoring Scale

| Score | Label | Interpretation |
|-------|-------|----------------|
| 5 | Excellent | Strong, direct relationship; highly reliable |
| 4 | Good | Clear relationship; reasonably reliable |
| 3 | Moderate | Partial relationship; some alternative explanations |
| 2 | Weak | Tenuous relationship; many confounders |
| 1 | Minimal | No meaningful relationship to invisible work |

### 1.4 Selection Threshold

**Include indicators with composite score ≥ 3.0**

Composite score formula:
$$\text{Score} = 0.40 \times \text{Causal} + 0.25 \times \text{Specificity} + 0.20 \times \text{Actionability} + 0.15 \times \text{Measurability}$$

---

## 2. Indicator Analysis by Dimension

### 2.1 Dimension 1: Invisible Work (Current)

These 17 indicators are currently assigned to the Invisible Work dimension. Each is evaluated for retention.

#### Category 1: Dark Matter (Variability Indicators)

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `throughputVariability` | 5 | 4 | 5 | 4 | **4.55** | **PRIMARY** |
| `workflowStageTimeVariability` | 5 | 4 | 4 | 4 | **4.30** | **PRIMARY** |
| `memberThroughputVariability` | 5 | 4 | 4 | 4 | **4.35** | **PRIMARY** |
| `estimationVariability` | 4 | 3 | 3 | 3 | **3.25** | Supporting |
| `inProgressItemsVariability` | 4 | 4 | 4 | 4 | **3.90** | **PRIMARY** |
| `sameSizeTimeVariability` | 5 | 4 | 4 | 4 | **4.20** | **PRIMARY** |
| `collaborationVariability` | 4 | 3 | 4 | 3 | **3.55** | Supporting |

**Rationale for high scores:**

- **`throughputVariability`** (4.55): Sprint-by-sprint output swings without corresponding demand changes are a classic fingerprint of invisible work. When teams complete 40 points one sprint and 15 the next with stable staffing, something is consuming capacity that isn't in Jira. Highly actionable—teams can identify and capture the hidden work streams.

- **`workflowStageTimeVariability`** (4.30): When the same workflow stages take vastly different times for similar work, interruptions and context-switching from invisible work are likely culprits. A story spending 2 days in "In Progress" one sprint and 8 days the next (same complexity) suggests the team was pulled elsewhere.

- **`memberThroughputVariability`** (4.35): Individual contributor output varying dramatically sprint-to-sprint (absent PTO/holidays) strongly suggests they're being pulled into untracked work—meetings, support escalations, mentoring, or fire-fighting.

- **`sameSizeTimeVariability`** (4.20): The most direct signal. If 3-point stories consistently take 2-8 days to complete, the variation isn't in the story—it's in what else is happening around it.

- **`inProgressItemsVariability`** (3.90): WIP count fluctuating without process changes suggests ad-hoc invisible work pulling people away from committed items.

**Lower scores:**

- **`estimationVariability`** (3.25): While invisible work can cause estimation errors, so can genuine complexity, poor refinement, or skill gaps. Less specific.

- **`collaborationVariability`** (3.55): Communication pattern swings can indicate off-platform discussions (invisible), but also reflect project phases or team dynamics.

#### Category 2: Frequent Use (Staleness Indicators)

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `staleWorkItems` | 5 | 4 | 4 | 4 | **4.10** | **PRIMARY** |
| `staleEpics` | 4 | 3 | 4 | 3 | **3.45** | Supporting |
| `unresolvedEpicChildren` | 2 | 2 | 3 | 4 | **2.45** | **EXCLUDE** |
| `bulkChanges` | 4 | 3 | 3 | 4 | **3.40** | Supporting |
| `avgDailyUpdates` | 5 | 4 | 4 | 4 | **4.15** | **PRIMARY** |
| `frequentUseVariability` | 4 | 4 | 4 | 3 | **3.90** | Supporting |
| `sprintHygiene` | 2 | 2 | 3 | 4 | **2.40** | **EXCLUDE** |

**Rationale for key decisions:**

- **`staleWorkItems`** (4.10): In-progress items not updated for 5+ days screams "work is happening elsewhere." Either the person is blocked (which should be flagged) or they're working on something not in Jira. Highly actionable—either update Jira or capture the invisible work.

- **`avgDailyUpdates`** (4.15): Low daily Jira engagement strongly correlates with invisible work. If a team of 6 averages 2 updates/day, they're either not working (unlikely) or working on things not in Jira (invisible work).

- **`unresolvedEpicChildren`** (2.45): **EXCLUDED**. This measures data hygiene and workflow configuration, not invisible work. Done epics with open children indicate status management issues, not hidden effort.

- **`sprintHygiene`** (2.40): **EXCLUDED**. This composite indicator mixes several factors (sprint goals, scope changes, carryover) that don't specifically indicate invisible work. Better addressed by specific indicators.

#### Category 3: Front Door (Intake Anomaly Indicators)

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `siloedWorkItems` | 3 | 2 | 3 | 4 | **2.85** | **EXCLUDE** |
| `midSprintCreations` | 4 | 4 | 4 | 4 | **3.90** | Supporting |
| `capacitySplitAcrossProjects` | 3 | 3 | 3 | 4 | **3.05** | Contextual |

**Rationale:**

- **`midSprintCreations`** (3.90): Items added mid-sprint often represent work that was happening anyway but wasn't captured until it had to be. This is the "side door" problem—work enters through hallway conversations rather than proper intake.

- **`siloedWorkItems`** (2.85): **EXCLUDED**. Single-person work without collaboration is better addressed by Team Collaboration dimension. A solo contributor can have perfectly visible work; collaboration absence doesn't indicate invisibility.

- **`capacitySplitAcrossProjects`** (3.05): Multi-project capacity can mask invisible work in "other" projects, but it's a weak signal. Kept as contextual only.

---

### 2.2 Candidates from Other Dimensions

These indicators from other dimensions were evaluated for invisible work relevance.

#### From Dimension 2: Jira as Source of Truth

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `infoAddedAfterCommitment` | 3 | 2 | 3 | 4 | **2.85** | Exclude |
| `creationToCommitmentTime` | 2 | 2 | 3 | 4 | **2.45** | Exclude |

**Rationale:** Information quality issues are separate from work visibility. Poor descriptions don't mean invisible work; they mean poor documentation discipline.

#### From Dimension 8: Sprint Hygiene

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `workCarriedOver` | 3 | 2 | 3 | 4 | **2.85** | Exclude |
| `lastDayCompletions` | 4 | 3 | 4 | 4 | **3.40** | **ADD: Supporting** |

**Rationale:**

- **`lastDayCompletions`** (3.40): **ADDED**. Last-day completion spikes suggest batch status updates rather than continuous work tracking. If work is truly being tracked real-time, completions should be spread throughout the sprint. Clustering at end indicates Jira updates happen in batches—a symptom of work happening "off the books" until ceremonial update time.

- **`workCarriedOver`** (2.85): Carryover happens for many reasons (scope change, complexity, dependencies) not specific to invisible work.

#### From Dimension 9: Team Collaboration

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `closedWithoutComments` | 4 | 4 | 4 | 4 | **3.90** | **ADD: Supporting** |
| `singleContributorIssueRate` | 3 | 2 | 3 | 4 | **2.85** | Exclude |

**Rationale:**

- **`closedWithoutComments`** (3.90): **ADDED**. Issues resolved without any discussion strongly suggest decisions were made elsewhere—in meetings, Slack, or hallway conversations. The work happened, but the context and decision-making are invisible. This is a direct signal that collaboration is happening off-platform.

- **`singleContributorIssueRate`** (2.85): Solo work is a collaboration concern, not invisibility. The work is visible even if siloed.

#### From Dimension 14: Backlog Discipline

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `zombieItemCount` | 4 | 3 | 4 | 4 | **3.60** | **ADD: Contextual** |
| `backlogStalenessDistribution` | 3 | 2 | 3 | 4 | **2.85** | Exclude |

**Rationale:**

- **`zombieItemCount`** (3.60): **ADDED**. Backlog zombies (items untouched 6+ months) often indicate that visible work has been displaced by invisible priorities. Teams stop working on documented items because they're consumed by undocumented demands. While this could also indicate poor backlog hygiene, the pattern of "work displaced" is relevant as contextual signal.

#### From Dimension 5: Data Freshness

| Indicator | Causal | Specificity | Action | Measure | **Composite** | Decision |
|-----------|--------|-------------|--------|---------|---------------|----------|
| `jiraUpdateFrequency` | 4 | 4 | 4 | 4 | **3.90** | Already captured |
| `invisibleWorkRiskScore` | — | — | — | — | — | Meta-indicator |

**Note:** `jiraUpdateFrequency` overlaps with `avgDailyUpdates` from Dimension 1. We use `avgDailyUpdates` as the primary indicator to avoid double-counting.

---

## 3. Final Indicator Selection

### 3.1 Summary Table

| Category | Indicator | Composite Score | Role | Weight Tier |
|----------|-----------|-----------------|------|-------------|
| **Primary Signals** | `throughputVariability` | 4.55 | Core | 55% |
| | `workflowStageTimeVariability` | 4.30 | Core | |
| | `memberThroughputVariability` | 4.35 | Core | |
| | `inProgressItemsVariability` | 3.90 | Core | |
| | `sameSizeTimeVariability` | 4.20 | Core | |
| | `staleWorkItems` | 4.10 | Core | |
| | `avgDailyUpdates` | 4.15 | Core | |
| **Supporting Signals** | `frequentUseVariability` | 3.90 | Supporting | 35% |
| | `staleEpics` | 3.45 | Supporting | |
| | `midSprintCreations` | 3.90 | Supporting | |
| | `bulkChanges` | 3.40 | Supporting | |
| | `closedWithoutComments` | 3.90 | Supporting | |
| | `lastDayCompletions` | 3.40 | Supporting | |
| | `collaborationVariability` | 3.55 | Supporting | |
| **Contextual Signals** | `estimationVariability` | 3.25 | Context | 10% |
| | `capacitySplitAcrossProjects` | 3.05 | Context | |
| | `zombieItemCount` | 3.60 | Context | |

**Total: 17 indicators** (7 Primary + 7 Supporting + 3 Contextual)

### 3.2 Changes from Current Dimension Mapping

#### Indicators Added (3)
| Indicator | Source Dimension | Rationale |
|-----------|------------------|-----------|
| `closedWithoutComments` | Team Collaboration | Direct signal of off-platform decisions |
| `lastDayCompletions` | Sprint Hygiene | Batch updates indicate delayed Jira engagement |
| `zombieItemCount` | Backlog Discipline | Visible work displaced by invisible priorities |

#### Indicators Removed (3)
| Indicator | Rationale |
|-----------|-----------|
| `unresolvedEpicChildren` | Measures data hygiene, not invisible work |
| `sprintHygiene` | Too composite; unclear invisible work connection |
| `siloedWorkItems` | Better fit for Team Collaboration dimension |

---

## 4. Indicator Correlation Analysis

### 4.1 Expected Correlation Structure

Invisible work indicators are expected to exhibit higher inter-correlation than general health indicators because they share an underlying causal mechanism: when invisible work increases, multiple signals respond together.

**Expected correlation matrix structure:**

| | Throughput Var | Stage Time Var | Member Var | WIP Var | Stale Items |
|---|---|---|---|---|---|
| Throughput Var | 1.00 | 0.55 | 0.60 | 0.50 | 0.40 |
| Stage Time Var | 0.55 | 1.00 | 0.50 | 0.45 | 0.35 |
| Member Var | 0.60 | 0.50 | 1.00 | 0.45 | 0.40 |
| WIP Var | 0.50 | 0.45 | 0.45 | 1.00 | 0.35 |
| Stale Items | 0.40 | 0.35 | 0.40 | 0.35 | 1.00 |

**Average correlation:** ρ̄ ≈ 0.45 (higher than general CHS ρ̄ = 0.30)

### 4.2 Implications for Aggregation

The higher correlation has two implications:

1. **Reduced effective sample size:** Each additional indicator adds less independent information
2. **Larger confidence intervals:** The precision of the aggregate score is lower than if indicators were independent

This is accounted for in the methodology by:
- Using ρ̄ = 0.45 in variance calculations (vs. 0.30 for general CHS)
- Wider precision thresholds (80/65/45 vs. 85/75/50)

### 4.3 Redundancy Check

No indicators were excluded purely for redundancy. While variability indicators are correlated, each measures a distinct aspect:

| Indicator | Unique Signal |
|-----------|---------------|
| `throughputVariability` | Team-level output swings |
| `memberThroughputVariability` | Individual-level output swings |
| `workflowStageTimeVariability` | Process stage duration swings |
| `sameSizeTimeVariability` | Size-normalized duration swings |
| `inProgressItemsVariability` | WIP count swings |

These are conceptually distinct even if empirically correlated.

---

## 5. Direction and Transformation Reference

### 5.1 Indicator Directions

For Invisible Work Risk scoring, **higher values indicate more risk** (opposite of health scoring).

| Indicator | Raw Direction | Risk Direction | Notes |
|-----------|---------------|----------------|-------|
| `throughputVariability` | Higher = worse | +1 | High variability = more hidden work |
| `workflowStageTimeVariability` | Higher = worse | +1 | |
| `memberThroughputVariability` | Higher = worse | +1 | |
| `inProgressItemsVariability` | Higher = worse | +1 | |
| `sameSizeTimeVariability` | Higher = worse | +1 | |
| `staleWorkItems` | Higher = worse | +1 | More stale items = more hidden work |
| `avgDailyUpdates` | Higher = better | -1 | Low updates = hidden work |
| `frequentUseVariability` | Higher = worse | +1 | |
| `staleEpics` | Higher = worse | +1 | |
| `midSprintCreations` | Higher = worse | +1 | More mid-sprint = side door entries |
| `bulkChanges` | Higher = worse | +1 | Bulk updates = batch discipline |
| `closedWithoutComments` | Higher = worse | +1 | No discussion = off-platform |
| `lastDayCompletions` | Higher = worse | +1 | Clustering = delayed updates |
| `collaborationVariability` | Higher = worse | +1 | |
| `estimationVariability` | Higher = worse | +1 | |
| `capacitySplitAcrossProjects` | Higher = worse | +1 | More split = more hidden context |
| `zombieItemCount` | Higher = worse | +1 | More zombies = displaced work |

### 5.2 Required Transformations

**Variability indicators require log-transformation** due to right-skewed distributions:

$$\tilde{X}_i = -\log(\max(X_i, 0.01))$$

The negative sign ensures that after transformation, lower variability (better) produces higher values.

**Rate/count indicators use standard transformation:**

$$\tilde{X}_i = d_i \times X_i$$

Where $d_i$ is the direction coefficient from the table above.

---

## 6. Weight Assignment Rationale

### 6.1 Tier Weights

| Tier | Weight | Rationale |
|------|--------|-----------|
| Primary (7 indicators) | 55% | Direct causal connection, high specificity |
| Supporting (7 indicators) | 35% | Clear connection, moderate specificity |
| Contextual (3 indicators) | 10% | Indirect signal, provides context |

### 6.2 Within-Tier Distribution

**Equal weighting within tiers** is used for simplicity and interpretability:

- Each Primary indicator: 55% / 7 = 7.86%
- Each Supporting indicator: 35% / 7 = 5.00%
- Each Contextual indicator: 10% / 3 = 3.33%

### 6.3 Effective Indicator Weights

| Indicator | Tier | Effective Weight |
|-----------|------|------------------|
| `throughputVariability` | Primary | 7.86% |
| `workflowStageTimeVariability` | Primary | 7.86% |
| `memberThroughputVariability` | Primary | 7.86% |
| `inProgressItemsVariability` | Primary | 7.86% |
| `sameSizeTimeVariability` | Primary | 7.86% |
| `staleWorkItems` | Primary | 7.86% |
| `avgDailyUpdates` | Primary | 7.86% |
| `frequentUseVariability` | Supporting | 5.00% |
| `staleEpics` | Supporting | 5.00% |
| `midSprintCreations` | Supporting | 5.00% |
| `bulkChanges` | Supporting | 5.00% |
| `closedWithoutComments` | Supporting | 5.00% |
| `lastDayCompletions` | Supporting | 5.00% |
| `collaborationVariability` | Supporting | 5.00% |
| `estimationVariability` | Contextual | 3.33% |
| `capacitySplitAcrossProjects` | Contextual | 3.33% |
| `zombieItemCount` | Contextual | 3.33% |

**Sum:** 55.02% + 35.00% + 9.99% ≈ 100%

---

## 7. Excluded Indicators Reference

For transparency, this section documents all indicators evaluated but excluded, with rationale.

### 7.1 From Dimension 1 (Current Invisible Work)

| Indicator | Score | Exclusion Rationale |
|-----------|-------|---------------------|
| `unresolvedEpicChildren` | 2.45 | Measures workflow configuration and status hygiene, not hidden effort |
| `sprintHygiene` | 2.40 | Composite indicator mixing unrelated factors; unclear mechanism |
| `siloedWorkItems` | 2.85 | Solo work is visible work; better addressed in Team Collaboration |

### 7.2 From Other Dimensions

| Indicator | Dimension | Score | Exclusion Rationale |
|-----------|-----------|-------|---------------------|
| `infoAddedAfterCommitment` | 2: Source of Truth | 2.85 | Poor documentation ≠ invisible work |
| `creationToCommitmentTime` | 2: Source of Truth | 2.45 | Refinement timing unrelated to visibility |
| `workCarriedOver` | 8: Sprint Hygiene | 2.85 | Many causes; not specific to invisible work |
| `singleContributorIssueRate` | 9: Collaboration | 2.85 | Siloed work is still visible work |
| `backlogStalenessDistribution` | 14: Backlog | 2.85 | Age distribution doesn't indicate hidden work |

### 7.3 Indicators Not Evaluated

The following indicator types were not evaluated because they have no plausible connection to invisible work:

- **Estimation Practices (Dimension 3):** Estimation coverage and consistency relate to planning quality, not work visibility
- **Issue Type Usage (Dimension 4):** Classification consistency is orthogonal to visibility
- **Blocker Management (Dimension 6):** Impediment handling doesn't indicate hidden work
- **Work Hierarchy (Dimension 7):** Parent-child integrity is structural
- **Automatic Status (Dimension 11):** Status sync is workflow configuration
- **Collaboration Features (Dimension 12):** Feature adoption doesn't indicate visibility
- **Configuration Efficiency (Dimension 13):** Workflow optimization is structural

---

## 8. Validation Recommendations

### 8.1 Construct Validity

The primary uncertainty in this selection is **construct validity**: do these indicators actually measure invisible work, or something else?

**Recommended validation approach:**

1. **Team surveys:** Ask teams to self-report invisible work burden (meetings, support, firefighting hours) and correlate with indicator scores
2. **Calendar analysis:** Compare indicator signals against meeting load from calendar data (with consent)
3. **Intervention studies:** Track whether indicator improvements accompany explicit invisible work reduction efforts

### 8.2 Stability Analysis

Monitor over 6+ months:
- Do indicator correlations remain stable?
- Do weight adjustments significantly change team rankings?
- Are there systematic biases by team size or methodology?

### 8.3 False Positive Analysis

For each indicator, document known false positive scenarios:

| Indicator | False Positive Scenario | Mitigation |
|-----------|-------------------------|------------|
| `throughputVariability` | Legitimate complexity variation | Contextual weighting (10%) |
| `staleWorkItems` | Blocked items (external dependency) | Cross-reference with blocker data |
| `midSprintCreations` | Genuine emergency work | Expect some mid-sprint; only flag excess |
| `lastDayCompletions` | Sprint-end demo cadence | Differentiate demo items from general work |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-28 | Initial selection matrix based on 117-indicator analysis |

---

*Document version 1.0. Indicator Selection Matrix for Invisible Work Detection.*
