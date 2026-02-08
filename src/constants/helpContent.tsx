import React from 'react';

/**
 * Centralized help content for all info buttons throughout the application.
 *
 * CONTENT GUIDELINES:
 * - Minimum 150-300 words per help item
 * - Use headers (h4) for scannable sections
 * - Include examples and real-world scenarios
 * - Explain "why" not just "what"
 * - Use simple language, define jargon
 * - Format for readability with bullets and bold terms
 *
 * Target persona: Someone uncomfortable with Jira who needs everything explained clearly.
 */

// ============================================================================
// ADMIN SECTION: DEFAULTS
// ============================================================================

export const AdminDefaultsHelp = {
  staleThresholdsSection: (
    <>
      <h4>What Are Stale Thresholds?</h4>
      <p>
        Stale thresholds determine how many days can pass before a Jira issue is flagged as
        potentially "stuck" or forgotten. Think of it like an expiration date for activity –
        if nobody has touched an issue in X days, it might need attention.
      </p>

      <h4>How Staleness is Calculated</h4>
      <p>
        The system looks at the "Last Updated" timestamp on each Jira issue. This timestamp
        changes whenever anyone:
      </p>
      <ul>
        <li><strong>Adds a comment</strong> – questions, updates, or discussions</li>
        <li><strong>Changes the status</strong> – moving from "To Do" to "In Progress", etc.</li>
        <li><strong>Updates any field</strong> – assignee, description, labels, story points</li>
        <li><strong>Logs work or time</strong> – recording hours spent</li>
        <li><strong>Links to another issue</strong> – creating relationships between items</li>
      </ul>

      <h4>Why This Matters</h4>
      <p>
        Stale issues are often symptoms of deeper problems:
      </p>
      <ul>
        <li><strong>Blocked work:</strong> Someone is stuck but hasn't escalated</li>
        <li><strong>Forgotten tasks:</strong> Work that slipped through the cracks</li>
        <li><strong>Unclear requirements:</strong> Issues that can't move forward without answers</li>
        <li><strong>Priority drift:</strong> Work that seemed important but isn't</li>
        <li><strong>Capacity issues:</strong> Too much work assigned to too few people</li>
      </ul>

      <h4>Organization-Wide Standards</h4>
      <p>
        As an admin, you can set thresholds that apply across all teams. This ensures
        consistent visibility into work health across the organization. When you set
        an org-wide standard, teams will see these values as defaults they cannot change.
      </p>

      <h4>Recommended Thresholds by Issue Type</h4>
      <ul>
        <li><strong>Bugs:</strong> 5-7 days – bugs typically indicate production issues and should be addressed quickly</li>
        <li><strong>Stories/Tasks:</strong> 7-14 days – regular work items should show progress at least weekly</li>
        <li><strong>Epics:</strong> 14-30 days – larger initiatives naturally move slower but still need regular updates</li>
        <li><strong>Sub-tasks:</strong> 5-10 days – smaller pieces should be completed quickly</li>
      </ul>
    </>
  ),

  orgWideStandard: (
    <>
      <h4>What Does "Set Org-Wide Standard" Mean?</h4>
      <p>
        Choosing this option means <strong>all teams in your organization must use the value
        you set here</strong>. Teams cannot override or customize this setting – it becomes
        a fixed standard.
      </p>

      <h4>When to Use This</h4>
      <p>Use org-wide standards when:</p>
      <ul>
        <li>You need <strong>consistent metrics</strong> across all teams for comparison and reporting</li>
        <li>Leadership requires <strong>standardized definitions</strong> of terms like "stale"</li>
        <li>You want to prevent teams from setting <strong>overly lenient thresholds</strong> that hide problems</li>
        <li>Compliance or governance requires <strong>uniform tracking</strong></li>
      </ul>

      <h4>What Teams Will See</h4>
      <p>
        When you set an org-wide standard, teams running the assessment wizard will see
        this value displayed as read-only. They'll see a message like "Set by organization
        admin" next to the field, so they understand why they can't change it.
      </p>

      <h4>Can You Change It Later?</h4>
      <p>
        Yes! You can always come back to this admin panel and:
      </p>
      <ul>
        <li>Modify the org-wide value – all future assessments will use the new value</li>
        <li>Switch to "Let teams decide" – gives teams control going forward</li>
      </ul>
      <p>
        <strong>Note:</strong> Changing this setting affects new assessments. Previously
        completed assessments keep their original values.
      </p>
    </>
  ),

  letTeamsDecide: (
    <>
      <h4>What Does "Let Teams Decide" Mean?</h4>
      <p>
        Choosing this option gives <strong>each team the freedom to set their own value</strong>
        when they run an assessment. Teams can customize settings based on their specific
        workflow, project type, or team dynamics.
      </p>

      <h4>When to Use This</h4>
      <p>Let teams decide when:</p>
      <ul>
        <li><strong>Teams have different workflows</strong> – a support team vs. a product team may need different thresholds</li>
        <li><strong>Autonomy is valued</strong> – you trust teams to make appropriate choices</li>
        <li><strong>Experimentation is encouraged</strong> – teams are finding what works best</li>
        <li><strong>Requirements vary by project</strong> – some projects are time-sensitive, others aren't</li>
      </ul>

      <h4>What Teams Will See</h4>
      <p>
        Teams running the wizard will see an editable field where they can input their
        own value. If you've previously set a value here, it becomes the suggested default,
        but teams can change it.
      </p>

      <h4>Potential Considerations</h4>
      <ul>
        <li><strong>Less comparability:</strong> If teams use different thresholds, comparing "staleness" across teams becomes less meaningful</li>
        <li><strong>Inconsistent reporting:</strong> Organization-wide dashboards may show varied definitions</li>
        <li><strong>Team education needed:</strong> Teams need to understand what reasonable values look like</li>
      </ul>

      <h4>Best Practice</h4>
      <p>
        Even when letting teams decide, provide guidance. You might add documentation or
        training about recommended ranges so teams make informed choices.
      </p>
    </>
  ),

  storyThreshold: (
    <>
      <h4>What is a Story in Jira?</h4>
      <p>
        A <strong>Story</strong> (also called a "User Story") is a piece of work described
        from the user's perspective. It typically follows the format: "As a [user type],
        I want [feature] so that [benefit]."
      </p>
      <p>
        <strong>Example:</strong> "As a customer, I want to reset my password via email
        so that I can regain access to my account."
      </p>

      <h4>Why Stories Need Stale Thresholds</h4>
      <p>
        Stories represent the core work a team delivers. When a story sits untouched for
        too long, it often indicates:
      </p>
      <ul>
        <li>The work is blocked by dependencies or missing information</li>
        <li>The story is too large and needs to be broken down</li>
        <li>Priorities have shifted and no one communicated it</li>
        <li>The assignee is overloaded with other work</li>
      </ul>

      <h4>Recommended Threshold: 7-14 Days</h4>
      <p>
        Most teams work in 1-2 week sprints. A story that hasn't been updated in more than
        two weeks is likely stuck. However, the right number depends on your sprint length:
      </p>
      <ul>
        <li><strong>1-week sprints:</strong> Consider 5-7 days</li>
        <li><strong>2-week sprints:</strong> Consider 7-10 days</li>
        <li><strong>Longer sprints:</strong> Consider 10-14 days</li>
      </ul>

      <h4>Stories vs. Other Issue Types</h4>
      <p>
        Stories typically have shorter thresholds than Epics (which are larger and slower-moving)
        but similar thresholds to Tasks. Bugs often have even shorter thresholds because
        they represent problems that need quick resolution.
      </p>
    </>
  ),

  bugThreshold: (
    <>
      <h4>What is a Bug in Jira?</h4>
      <p>
        A <strong>Bug</strong> is an issue that describes something that's broken or not
        working as expected. Unlike Stories (which add new functionality), Bugs fix existing
        problems.
      </p>
      <p>
        <strong>Examples:</strong>
      </p>
      <ul>
        <li>"Login button doesn't work on mobile browsers"</li>
        <li>"Checkout total shows wrong currency symbol"</li>
        <li>"App crashes when uploading files over 10MB"</li>
      </ul>

      <h4>Why Bugs Need Shorter Thresholds</h4>
      <p>
        Bugs often indicate production issues affecting real users. A stale bug means:
      </p>
      <ul>
        <li>Users may be experiencing ongoing problems</li>
        <li>Customer support might be handling repeated complaints</li>
        <li>Technical debt is accumulating</li>
        <li>Trust in the product may be eroding</li>
      </ul>

      <h4>Recommended Threshold: 5-7 Days</h4>
      <p>
        Bugs should move faster than feature work. Even if a bug isn't critical, it should
        at least receive an update (triage, prioritization, or progress) within a week.
        Consider your severity levels:
      </p>
      <ul>
        <li><strong>Critical/Blocker bugs:</strong> Should be tracked daily, not relevant for stale thresholds</li>
        <li><strong>Major bugs:</strong> 3-5 days threshold</li>
        <li><strong>Minor bugs:</strong> 5-7 days threshold</li>
        <li><strong>Trivial bugs:</strong> 7-10 days threshold</li>
      </ul>

      <h4>When Longer Thresholds Make Sense</h4>
      <p>
        If your team has a large backlog of known issues that are intentionally deprioritized,
        you might use a longer threshold (10-14 days) to avoid flagging items you've consciously
        decided to defer.
      </p>
    </>
  ),

  taskThreshold: (
    <>
      <h4>What is a Task in Jira?</h4>
      <p>
        A <strong>Task</strong> is a piece of work that doesn't fit the user story format.
        Tasks are often technical or operational work that needs to happen but isn't directly
        tied to a user-facing feature.
      </p>
      <p>
        <strong>Examples:</strong>
      </p>
      <ul>
        <li>"Set up staging environment for testing"</li>
        <li>"Update documentation for API changes"</li>
        <li>"Research authentication libraries"</li>
        <li>"Configure monitoring alerts"</li>
      </ul>

      <h4>Tasks vs. Stories</h4>
      <p>
        The key differences:
      </p>
      <ul>
        <li><strong>Stories</strong> deliver user value directly ("As a user, I can...")</li>
        <li><strong>Tasks</strong> enable work but may not be user-visible</li>
        <li>Some teams use Tasks for anything non-feature-related</li>
        <li>Other teams use Tasks as sub-work within Stories</li>
      </ul>

      <h4>Recommended Threshold: 7-14 Days</h4>
      <p>
        Tasks usually follow similar timelines as Stories. However, if your team uses Tasks
        for long-running research or infrastructure work, you might want slightly longer
        thresholds (10-14 days).
      </p>

      <h4>Consider Your Task Usage</h4>
      <p>
        Ask yourself: "How does our team use Tasks?"
      </p>
      <ul>
        <li>If Tasks are small, concrete pieces of work: 5-7 days</li>
        <li>If Tasks are similar to Stories in size: 7-10 days</li>
        <li>If Tasks include research or exploration: 10-14 days</li>
      </ul>
    </>
  ),

  epicThreshold: (
    <>
      <h4>What is an Epic in Jira?</h4>
      <p>
        An <strong>Epic</strong> is a large body of work that can be broken down into
        smaller Stories or Tasks. Think of it as a container or theme that groups related
        work items together.
      </p>
      <p>
        <strong>Examples:</strong>
      </p>
      <ul>
        <li>"User Authentication System" (contains multiple login, password, and session stories)</li>
        <li>"Mobile App Redesign" (contains all UI update stories)</li>
        <li>"Q3 Performance Improvements" (contains optimization tasks)</li>
      </ul>

      <h4>Why Epics Have Longer Thresholds</h4>
      <p>
        Epics are not meant to be completed quickly. They represent weeks or months of work.
        Updates to the Epic itself happen less frequently because:
      </p>
      <ul>
        <li>The real progress happens in the child Stories/Tasks</li>
        <li>Epic descriptions and scope change infrequently</li>
        <li>Epic status changes only at major milestones</li>
      </ul>

      <h4>Recommended Threshold: 14-30 Days</h4>
      <p>
        Even though Epics move slowly, they should still receive periodic attention:
      </p>
      <ul>
        <li><strong>14 days:</strong> For fast-moving projects with active Epics</li>
        <li><strong>21 days:</strong> A balanced default for most teams</li>
        <li><strong>30 days:</strong> For long-term initiatives that span quarters</li>
      </ul>

      <h4>What "Stale Epic" Really Means</h4>
      <p>
        A stale Epic often indicates:
      </p>
      <ul>
        <li>The initiative has stalled or been deprioritized</li>
        <li>Child items are done but the Epic wasn't closed</li>
        <li>The Epic needs to be re-evaluated for current relevance</li>
        <li>Scope changed but the Epic wasn't updated to reflect it</li>
      </ul>
    </>
  ),

  subtaskThreshold: (
    <>
      <h4>What is a Sub-task in Jira?</h4>
      <p>
        A <strong>Sub-task</strong> is a small piece of work that exists within a parent
        issue (usually a Story or Task). Sub-tasks break down larger items into manageable,
        trackable pieces.
      </p>
      <p>
        <strong>Examples:</strong>
      </p>
      <ul>
        <li>Story: "Implement user login" → Sub-tasks: "Create login form", "Add validation", "Write tests"</li>
        <li>Task: "Set up database" → Sub-tasks: "Install PostgreSQL", "Create tables", "Set up backups"</li>
      </ul>

      <h4>Why Sub-tasks Should Move Quickly</h4>
      <p>
        By definition, sub-tasks are small. They represent hours or days of work, not weeks.
        A sub-task that hasn't moved in a while suggests:
      </p>
      <ul>
        <li>The work is blocked but the parent item doesn't show it</li>
        <li>The sub-task was created but never actually needed</li>
        <li>Someone forgot about it amid other work</li>
        <li>The breakdown was too granular</li>
      </ul>

      <h4>Recommended Threshold: 5-10 Days</h4>
      <p>
        Sub-tasks should have thresholds equal to or shorter than their parent type:
      </p>
      <ul>
        <li><strong>5-7 days:</strong> For teams that use sub-tasks for daily work breakdown</li>
        <li><strong>7-10 days:</strong> For teams using sub-tasks for sprint-level breakdown</li>
      </ul>

      <h4>Special Consideration</h4>
      <p>
        Some teams create sub-tasks at the start of a sprint but don't work on them until
        later. If this is your workflow, you might need a slightly longer threshold (10-14 days)
        or consider not tracking sub-tasks for staleness at all.
      </p>
    </>
  ),

  sprintCadenceSection: (
    <>
      <h4>What is a Sprint?</h4>
      <p>
        A <strong>Sprint</strong> (also called an "iteration") is a fixed time period during
        which a team commits to completing a specific set of work. Sprints are a core concept
        in Scrum, one of the most popular agile frameworks.
      </p>
      <p>
        At the start of each sprint, the team selects work items from the backlog. At the end,
        they demonstrate what was completed and reflect on how to improve.
      </p>

      <h4>Common Sprint Lengths</h4>
      <ul>
        <li><strong>1 week:</strong> Fast feedback, good for rapidly changing priorities</li>
        <li><strong>2 weeks:</strong> Most common, balances planning overhead with delivery</li>
        <li><strong>3 weeks:</strong> Less common, used when 2 weeks feels rushed</li>
        <li><strong>4 weeks:</strong> Longer cycle, more like traditional project phases</li>
      </ul>

      <h4>What if We Don't Use Sprints?</h4>
      <p>
        Not all teams use sprints! Kanban teams, for example, focus on continuous flow rather
        than fixed time boxes. If your team uses Kanban:
      </p>
      <ul>
        <li>Select the cadence that best matches your typical delivery rhythm</li>
        <li>Think about how often you review and release work</li>
        <li>Consider your meeting cycles (weekly planning? bi-weekly reviews?)</li>
      </ul>

      <h4>Why Sprint Cadence Matters for Analysis</h4>
      <p>
        The health assessment uses your sprint cadence to:
      </p>
      <ul>
        <li>Calculate velocity and completion rates</li>
        <li>Measure sprint-over-sprint trends</li>
        <li>Identify patterns in carry-over (incomplete work)</li>
        <li>Calibrate stale thresholds appropriately</li>
      </ul>

      <h4>Organization-Wide Standards</h4>
      <p>
        Many organizations standardize sprint length to enable cross-team coordination.
        If your organization has a standard cadence, set it here so all teams use the same
        foundation for analysis.
      </p>
    </>
  ),

  sprintLengthOptions: (
    <>
      <h4>Choosing the Right Sprint Length</h4>
      <p>
        Each sprint length has trade-offs. Here's a detailed breakdown to help you decide:
      </p>

      <h4>1 Week Sprints</h4>
      <p><strong>Best for:</strong></p>
      <ul>
        <li>Teams with rapidly changing priorities</li>
        <li>Support or operations teams with unpredictable work</li>
        <li>Early-stage products needing fast iteration</li>
        <li>Teams learning agile for the first time (shorter feedback loops)</li>
      </ul>
      <p><strong>Challenges:</strong></p>
      <ul>
        <li>High ceremony overhead (planning, review, retro every week)</li>
        <li>Little time for complex features</li>
        <li>Can feel rushed and stressful</li>
      </ul>

      <h4>2 Week Sprints</h4>
      <p><strong>Best for:</strong></p>
      <ul>
        <li>Most product development teams</li>
        <li>Teams with somewhat predictable work</li>
        <li>Balanced approach to planning and delivery</li>
      </ul>
      <p><strong>Challenges:</strong></p>
      <ul>
        <li>Still requires discipline to avoid mid-sprint scope changes</li>
        <li>May be too short for very complex features</li>
      </ul>

      <h4>3 Week Sprints</h4>
      <p><strong>Best for:</strong></p>
      <ul>
        <li>Teams finding 2 weeks too short</li>
        <li>Work that requires more research or exploration</li>
        <li>Teams with external dependencies that need coordination time</li>
      </ul>

      <h4>4 Week Sprints</h4>
      <p><strong>Best for:</strong></p>
      <ul>
        <li>Teams working on large, complex systems</li>
        <li>Organizations transitioning from waterfall</li>
        <li>Heavily regulated industries requiring more documentation</li>
      </ul>
      <p><strong>Challenges:</strong></p>
      <ul>
        <li>Delayed feedback – problems aren't caught for weeks</li>
        <li>Harder to estimate accurately</li>
        <li>Higher risk of scope creep</li>
      </ul>
    </>
  ),

  customSprintDays: (
    <>
      <h4>When to Use Custom Sprint Length</h4>
      <p>
        Most teams fit into 1, 2, 3, or 4 week cycles. But sometimes you need something different:
      </p>
      <ul>
        <li>Your team uses a 10-day sprint (2 weeks minus weekends calculated differently)</li>
        <li>You have 6-week cycles for specialized work</li>
        <li>Your release schedule doesn't align with standard sprint lengths</li>
      </ul>

      <h4>How to Enter Custom Days</h4>
      <p>
        Enter the total number of <strong>calendar days</strong> in your sprint, including
        weekends. For example:
      </p>
      <ul>
        <li>10 days = 2 calendar weeks (including Saturday/Sunday)</li>
        <li>5 days = 1 working week (if you exclude weekends mentally)</li>
      </ul>

      <h4>Important Notes</h4>
      <ul>
        <li>The system uses calendar days for calculations</li>
        <li>Consistency matters more than the exact number – pick something and stick with it</li>
        <li>If your sprint length varies frequently, use an average</li>
      </ul>

      <h4>Valid Range</h4>
      <p>
        Typically, custom sprints range from 5 days (1 week) to 42 days (6 weeks).
        Anything shorter than a week isn't really a "sprint," and anything longer than
        6 weeks loses the benefits of iterative development.
      </p>
    </>
  ),

  dimensionPresetsSection: (
    <>
      <h4>What Are "Dimensions" in Health Assessment?</h4>
      <p>
        <strong>Dimensions</strong> are the different aspects of team health that the
        assessment measures. Think of them as different lenses for examining how your
        team works. Each dimension looks at a specific type of pattern in your Jira data.
      </p>

      <h4>The 12 Available Dimensions</h4>
      <ol>
        <li><strong>Velocity Stability:</strong> How consistent is your team's output?</li>
        <li><strong>Sprint Completion:</strong> Do you finish what you commit to?</li>
        <li><strong>Carry-Over Rate:</strong> How much work spills into the next sprint?</li>
        <li><strong>Scope Change:</strong> How often does sprint scope change mid-flight?</li>
        <li><strong>Bug Ratio:</strong> What portion of your work is fixing bugs vs. building features?</li>
        <li><strong>Blocked Work:</strong> How often are items stuck waiting for something?</li>
        <li><strong>Stale Items:</strong> How many issues haven't been touched recently?</li>
        <li><strong>Estimation Accuracy:</strong> Do items take as long as estimated?</li>
        <li><strong>Cycle Time:</strong> How long does work take from start to finish?</li>
        <li><strong>Lead Time:</strong> How long from request to delivery?</li>
        <li><strong>Work Distribution:</strong> Is work spread evenly across the team?</li>
        <li><strong>Unplanned Work:</strong> How much work wasn't in the original plan?</li>
      </ol>

      <h4>What Are Presets?</h4>
      <p>
        Presets are pre-selected combinations of dimensions. Instead of choosing dimensions
        one by one, teams can select a preset that matches their needs.
      </p>

      <h4>Why Use Presets?</h4>
      <ul>
        <li><strong>Simplicity:</strong> Teams don't need to understand all 12 dimensions</li>
        <li><strong>Consistency:</strong> All teams using the same preset get comparable reports</li>
        <li><strong>Best practices:</strong> Presets are designed for common use cases</li>
      </ul>
    </>
  ),

  quickStartPreset: (
    <>
      <h4>Quick Start Preset: 6 Essential Dimensions</h4>
      <p>
        The Quick Start preset includes the most impactful dimensions for understanding
        team health. It's designed for teams new to health assessments or those who want
        a focused view.
      </p>

      <h4>Included Dimensions</h4>
      <ol>
        <li><strong>Velocity Stability</strong> – Are we delivering consistently?</li>
        <li><strong>Sprint Completion</strong> – Are we finishing what we commit to?</li>
        <li><strong>Carry-Over Rate</strong> – How much incomplete work rolls over?</li>
        <li><strong>Stale Items</strong> – What work has been forgotten?</li>
        <li><strong>Cycle Time</strong> – How fast do we complete items?</li>
        <li><strong>Bug Ratio</strong> – Are we building or fixing?</li>
      </ol>

      <h4>When to Use Quick Start</h4>
      <ul>
        <li><strong>First-time assessments:</strong> Get value quickly without overwhelm</li>
        <li><strong>Time-constrained reviews:</strong> Focus on what matters most</li>
        <li><strong>Executive summaries:</strong> Key metrics for leadership</li>
        <li><strong>Teams new to agile:</strong> Build understanding incrementally</li>
      </ul>

      <h4>What You'll Miss</h4>
      <p>
        Quick Start excludes deeper metrics like Estimation Accuracy, Work Distribution,
        and Scope Change. If your team has specific pain points in these areas, consider
        Comprehensive instead.
      </p>
    </>
  ),

  comprehensivePreset: (
    <>
      <h4>Comprehensive Preset: All 12 Dimensions</h4>
      <p>
        The Comprehensive preset includes every available dimension, giving you the complete
        picture of team health. Nothing is left out.
      </p>

      <h4>All 12 Dimensions Included</h4>
      <ol>
        <li>Velocity Stability</li>
        <li>Sprint Completion</li>
        <li>Carry-Over Rate</li>
        <li>Scope Change</li>
        <li>Bug Ratio</li>
        <li>Blocked Work</li>
        <li>Stale Items</li>
        <li>Estimation Accuracy</li>
        <li>Cycle Time</li>
        <li>Lead Time</li>
        <li>Work Distribution</li>
        <li>Unplanned Work</li>
      </ol>

      <h4>When to Use Comprehensive</h4>
      <ul>
        <li><strong>Deep-dive analysis:</strong> When you want to leave no stone unturned</li>
        <li><strong>Quarterly reviews:</strong> Thorough assessment for planning</li>
        <li><strong>Team retrospectives:</strong> Comprehensive data for discussion</li>
        <li><strong>Performance improvement:</strong> Identifying all improvement opportunities</li>
      </ul>

      <h4>Considerations</h4>
      <ul>
        <li>Longer report with more data to digest</li>
        <li>May be overwhelming for teams new to this</li>
        <li>Requires more context to interpret some dimensions</li>
      </ul>
    </>
  ),

  planningFocusPreset: (
    <>
      <h4>Planning Focus Preset: 7 Planning Dimensions</h4>
      <p>
        The Planning Focus preset emphasizes dimensions related to how well teams plan,
        estimate, and commit to work. Use this when planning and predictability are your
        primary concerns.
      </p>

      <h4>Included Dimensions</h4>
      <ol>
        <li><strong>Velocity Stability</strong> – Consistent output for planning</li>
        <li><strong>Sprint Completion</strong> – Following through on commitments</li>
        <li><strong>Carry-Over Rate</strong> – Planning accuracy indicator</li>
        <li><strong>Scope Change</strong> – Mid-sprint disruptions</li>
        <li><strong>Estimation Accuracy</strong> – Are estimates reliable?</li>
        <li><strong>Lead Time</strong> – Total time from request to delivery</li>
        <li><strong>Unplanned Work</strong> – Disruptions to planned work</li>
      </ol>

      <h4>When to Use Planning Focus</h4>
      <ul>
        <li><strong>Predictability is critical:</strong> Stakeholders need reliable timelines</li>
        <li><strong>Improving estimates:</strong> Teams working on estimation skills</li>
        <li><strong>Reducing scope creep:</strong> Addressing mid-sprint changes</li>
        <li><strong>Release planning:</strong> Need confidence in delivery dates</li>
      </ul>

      <h4>Difference from Execution Focus</h4>
      <p>
        Planning Focus is about <em>what we commit to and how accurately we predict</em>.
        Execution Focus is about <em>how efficiently we do the actual work</em>.
      </p>
    </>
  ),

  executionFocusPreset: (
    <>
      <h4>Execution Focus Preset: 7 Execution Dimensions</h4>
      <p>
        The Execution Focus preset emphasizes dimensions related to how efficiently teams
        do the actual work. Use this when speed, quality, and team dynamics are your
        primary concerns.
      </p>

      <h4>Included Dimensions</h4>
      <ol>
        <li><strong>Cycle Time</strong> – How fast work moves through the process</li>
        <li><strong>Bug Ratio</strong> – Quality indicator</li>
        <li><strong>Blocked Work</strong> – Efficiency blockers</li>
        <li><strong>Stale Items</strong> – Work falling through cracks</li>
        <li><strong>Work Distribution</strong> – Team balance and collaboration</li>
        <li><strong>Sprint Completion</strong> – Following through</li>
        <li><strong>Velocity Stability</strong> – Consistent output</li>
      </ol>

      <h4>When to Use Execution Focus</h4>
      <ul>
        <li><strong>Speed matters:</strong> Need to deliver faster</li>
        <li><strong>Quality concerns:</strong> Too many bugs or rework</li>
        <li><strong>Team health:</strong> Worried about burnout or imbalance</li>
        <li><strong>Process improvement:</strong> Identifying bottlenecks</li>
      </ul>

      <h4>Difference from Planning Focus</h4>
      <p>
        Execution Focus is about <em>how well we do the work once it's started</em>.
        Planning Focus is about <em>how well we predict and commit to work upfront</em>.
      </p>
    </>
  ),
};

// ============================================================================
// ADMIN SECTION: USERS
// ============================================================================

export const AdminUsersHelp = {
  adminRole: (
    <>
      <h4>What Can Admins Do?</h4>
      <p>
        <strong>Admins</strong> have full access to all features in the Jira Health Assessment
        tool. They are responsible for configuring the system and managing other users.
      </p>

      <h4>Admin Capabilities</h4>
      <ul>
        <li><strong>User Management:</strong> Invite, edit, deactivate, and reactivate users</li>
        <li><strong>System Configuration:</strong> Set organization-wide defaults and standards</li>
        <li><strong>Team Attributes:</strong> Create and manage custom team classifications</li>
        <li><strong>Organizational Hierarchy:</strong> Define portfolios and teams of teams</li>
        <li><strong>Analytics Access:</strong> View all usage metrics and reports</li>
        <li><strong>All Assessments:</strong> View and manage any team's assessments</li>
      </ul>

      <h4>Who Should Be an Admin?</h4>
      <p>
        Admins are typically:
      </p>
      <ul>
        <li>Engineering or Delivery Managers responsible for process improvement</li>
        <li>Agile Coaches supporting multiple teams</li>
        <li>Program Managers overseeing portfolio health</li>
        <li>IT administrators managing the tool itself</li>
      </ul>

      <h4>How Many Admins?</h4>
      <p>
        Most organizations have 2-5 admins. Having too few creates bottlenecks; having too
        many can lead to inconsistent configuration. Consider having at least 2 admins for
        coverage when one is unavailable.
      </p>
    </>
  ),

  creatorRole: (
    <>
      <h4>What Can Creators Do?</h4>
      <p>
        <strong>Creators</strong> can run health assessments for their teams and view their
        own results. They're the primary users of the assessment wizard.
      </p>

      <h4>Creator Capabilities</h4>
      <ul>
        <li><strong>Create Assessments:</strong> Run the wizard to assess their team</li>
        <li><strong>View Own Results:</strong> See reports for assessments they created</li>
        <li><strong>Save Drafts:</strong> Pause and resume assessment configuration</li>
        <li><strong>Share Reports:</strong> Give others access to their completed reports</li>
      </ul>

      <h4>What Creators Cannot Do</h4>
      <ul>
        <li><strong>Cannot</strong> access admin settings or user management</li>
        <li><strong>Cannot</strong> change organization-wide defaults</li>
        <li><strong>Cannot</strong> view other teams' assessments (unless shared)</li>
        <li><strong>Cannot</strong> modify team attributes or hierarchy</li>
      </ul>

      <h4>Who Should Be a Creator?</h4>
      <p>
        Creators are typically:
      </p>
      <ul>
        <li>Scrum Masters or Team Leads responsible for their team's process</li>
        <li>Engineering Managers who want to assess their teams</li>
        <li>Anyone authorized to represent a team's health</li>
      </ul>
    </>
  ),

  viewerRole: (
    <>
      <h4>What Can Viewers Do?</h4>
      <p>
        <strong>Viewers</strong> have the most limited access. They can only view reports
        that have been explicitly shared with them.
      </p>

      <h4>Viewer Capabilities</h4>
      <ul>
        <li><strong>View Shared Reports:</strong> See assessment results shared by others</li>
        <li><strong>Export Reports:</strong> Download reports they have access to</li>
      </ul>

      <h4>What Viewers Cannot Do</h4>
      <ul>
        <li><strong>Cannot</strong> create new assessments</li>
        <li><strong>Cannot</strong> access admin settings</li>
        <li><strong>Cannot</strong> see reports unless explicitly shared</li>
        <li><strong>Cannot</strong> modify any settings or data</li>
      </ul>

      <h4>Who Should Be a Viewer?</h4>
      <p>
        Viewers are typically:
      </p>
      <ul>
        <li>Executives who want to see aggregate health reports</li>
        <li>Stakeholders interested in specific team metrics</li>
        <li>Team members who want visibility into their own team's results</li>
        <li>Anyone who needs to see results but not create assessments</li>
      </ul>

      <h4>Sharing with Viewers</h4>
      <p>
        Creators must explicitly share reports with Viewers. Reports are not automatically
        visible to anyone – privacy is the default.
      </p>
    </>
  ),

  userGroups: (
    <>
      <h4>What Are User Groups?</h4>
      <p>
        <strong>User Groups</strong> are a way to organize users into logical collections.
        Groups make it easier to manage permissions and share reports with multiple people
        at once.
      </p>

      <h4>How Groups Differ from Roles</h4>
      <ul>
        <li><strong>Roles</strong> (Admin, Creator, Viewer) define what a user can do</li>
        <li><strong>Groups</strong> define how users are organized and addressed</li>
      </ul>
      <p>
        A user has one role but can belong to multiple groups.
      </p>

      <h4>Example Groups</h4>
      <ul>
        <li>"Platform Engineering" – all platform team members</li>
        <li>"Product Leadership" – PMs and directors who review health reports</li>
        <li>"Sprint Review Attendees" – people who attend cross-team reviews</li>
        <li>"New Hires" – users who need onboarding</li>
      </ul>

      <h4>Using Groups</h4>
      <p>
        When sharing reports or sending notifications, you can select a group instead of
        listing individuals. This saves time and ensures no one is forgotten.
      </p>

      <h4>Multiple Group Membership</h4>
      <p>
        Users can belong to as many groups as needed. For example, a Platform team lead
        might be in both "Platform Engineering" and "Engineering Leadership" groups.
      </p>
    </>
  ),

  pendingStatus: (
    <>
      <h4>What Does "Pending" Mean?</h4>
      <p>
        A user shows as <strong>Pending</strong> when they've been invited but haven't yet
        completed their account setup.
      </p>

      <h4>What Happens During Pending Status</h4>
      <ul>
        <li>An invitation email was sent to the user</li>
        <li>The user has not yet clicked the link and set up their account</li>
        <li>The user cannot access the application</li>
        <li>They appear in the user list with their assigned role</li>
      </ul>

      <h4>How Long Do Invitations Last?</h4>
      <p>
        Invitation links typically expire after 7 days. If the user doesn't complete
        setup within that time, you may need to resend the invitation.
      </p>

      <h4>Troubleshooting Pending Users</h4>
      <p>If a user remains pending:</p>
      <ul>
        <li>Check if the email address is correct</li>
        <li>Ask if they received the email (check spam folder)</li>
        <li>Resend the invitation if needed</li>
        <li>Verify there are no email delivery issues for your domain</li>
      </ul>
    </>
  ),

  deactivatedStatus: (
    <>
      <h4>What Does "Deactivated" Mean?</h4>
      <p>
        A <strong>Deactivated</strong> user can no longer access the application. Their
        account exists but is disabled.
      </p>

      <h4>What Happens When You Deactivate</h4>
      <ul>
        <li>User immediately loses access to the application</li>
        <li>Their assessments and reports are preserved</li>
        <li>Their name still appears on historical data</li>
        <li>They cannot log in or perform any actions</li>
      </ul>

      <h4>When to Deactivate Users</h4>
      <ul>
        <li><strong>Employee departure:</strong> When someone leaves the organization</li>
        <li><strong>Role change:</strong> When someone no longer needs access</li>
        <li><strong>Security concern:</strong> When access needs to be revoked immediately</li>
        <li><strong>Temporary suspension:</strong> When access should be paused</li>
      </ul>

      <h4>Deactivation vs. Deletion</h4>
      <p>
        Deactivation is reversible – you can reactivate the user later. Their data is
        preserved for historical integrity. True deletion (permanently removing data)
        is a separate, more drastic action.
      </p>

      <h4>Can They Be Reactivated?</h4>
      <p>
        Yes! Admins can reactivate deactivated users at any time. The user regains access
        with the same role and data they had before.
      </p>
    </>
  ),

  lastActive: (
    <>
      <h4>How is "Last Active" Calculated?</h4>
      <p>
        The <strong>Last Active</strong> timestamp shows when the user last interacted
        with the application. This helps identify inactive accounts.
      </p>

      <h4>What Triggers an Activity Update</h4>
      <ul>
        <li>Logging into the application</li>
        <li>Creating or editing an assessment</li>
        <li>Viewing a report</li>
        <li>Changing settings or profile information</li>
        <li>Any meaningful interaction with the system</li>
      </ul>

      <h4>What Doesn't Count as Activity</h4>
      <ul>
        <li>Passive session maintenance (staying logged in)</li>
        <li>Receiving email notifications</li>
        <li>Being mentioned in reports by others</li>
      </ul>

      <h4>Using Last Active Information</h4>
      <p>
        This field helps you:
      </p>
      <ul>
        <li>Identify users who may have abandoned the tool</li>
        <li>Find accounts that might need deactivation</li>
        <li>Understand adoption patterns</li>
        <li>Follow up with inactive users who should be using the tool</li>
      </ul>
    </>
  ),
};

// ============================================================================
// ADMIN SECTION: TEAM ATTRIBUTES (ORG STRUCTURE)
// ============================================================================

export const AdminOrgStructureHelp = {
  teamAttributesSection: (
    <>
      <h4>What Are Team Attributes?</h4>
      <p>
        <strong>Team Attributes</strong> are characteristics you use to classify and group
        teams for meaningful comparisons. When a team runs a health assessment, they can
        compare their scores against teams with similar attributes.
      </p>

      <h4>Why Use Team Attributes?</h4>
      <p>
        Comparing your team to all other teams isn't always useful. A small product team
        shouldn't be measured against a large platform team – their contexts are too different.
        Attributes let teams find their peers:
      </p>
      <ul>
        <li><strong>"Compare to similar-sized teams"</strong> – Teams with 5-10 people</li>
        <li><strong>"Compare to other product teams"</strong> – Teams in the same work type</li>
        <li><strong>"Compare within my tribe"</strong> – Teams in the same business unit</li>
      </ul>

      <h4>Two Types of Attributes</h4>
      <ul>
        <li>
          <strong>System Attributes:</strong> Automatically calculated from Jira data.
          Examples: Team Size, Volume, Process (Scrum/Kanban), Tenure.
        </li>
        <li>
          <strong>Custom Attributes:</strong> Defined by you to match your org structure.
          Examples: Work Type, Tribe, Domain, Product Area, Cost Center.
        </li>
      </ul>

      <h4>How Teams Get Assigned</h4>
      <p>
        System attributes are automatic. For custom attributes, you can assign teams using:
      </p>
      <ul>
        <li><strong>Filter Rules:</strong> "If team name contains 'Platform', assign to Platform"</li>
        <li><strong>Manual Selection:</strong> Pick specific teams for each value</li>
      </ul>

      <h4>Best Practices</h4>
      <ul>
        <li>Start with 2-3 custom attributes that matter most</li>
        <li>Use clear, unambiguous names</li>
        <li>Ensure every team can be classified</li>
        <li>Review assignments quarterly as teams evolve</li>
      </ul>
    </>
  ),

  systemAttributesSection: (
    <>
      <h4>What Are System Attributes?</h4>
      <p>
        <strong>System Attributes</strong> are team characteristics that are automatically
        calculated from your Jira data. You don't need to manually assign these – the
        system figures them out based on actual team behavior and data.
      </p>

      <h4>Why "System" Attributes?</h4>
      <p>
        System attributes are special because:
      </p>
      <ul>
        <li><strong>Automatic:</strong> No manual setup or maintenance required</li>
        <li><strong>Accurate:</strong> Based on real data, not subjective classification</li>
        <li><strong>Consistent:</strong> Calculated the same way for all teams</li>
        <li><strong>Current:</strong> Updated as team data changes</li>
      </ul>

      <h4>Available System Attributes</h4>
      <ul>
        <li><strong>Team Size:</strong> Number of active contributors on the team</li>
        <li><strong>Tenure:</strong> How long the team has been active in this configuration</li>
        <li><strong>Volume:</strong> Amount of work the team typically handles</li>
        <li><strong>Process:</strong> The methodology the team follows (Scrum, Kanban, etc.)</li>
      </ul>

      <h4>Customizing System Attributes</h4>
      <p>
        While you can't add new system attributes (they're derived from data), you can
        customize the value ranges. For example, you can define what "Small", "Medium",
        and "Large" mean for Team Size in your organization.
      </p>
    </>
  ),

  autoCalculatedBadge: (
    <>
      <h4>What Does "Auto-Calculated from Jira" Mean?</h4>
      <p>
        This badge indicates that the attribute values are determined automatically by
        analyzing your Jira data. Nobody needs to manually tag teams with these attributes.
      </p>

      <h4>How the Calculation Works</h4>
      <ul>
        <li><strong>Team Size:</strong> Counts unique assignees on issues in the last 30 days</li>
        <li><strong>Tenure:</strong> Measures how long the board/project has existed with activity</li>
        <li><strong>Volume:</strong> Counts issues created or completed in the analysis period</li>
        <li><strong>Process:</strong> Detects sprint usage patterns to identify Scrum vs. Kanban</li>
      </ul>

      <h4>How Often is it Updated?</h4>
      <p>
        System attributes are recalculated each time an assessment is run. The values
        reflect the state of the team at assessment time.
      </p>

      <h4>Can I Override Auto-Calculated Values?</h4>
      <p>
        No – system attributes are always data-driven. If you need different classifications,
        create a Custom Attribute instead. For example, if you want to classify teams by
        your own "size" definition, create a custom "Team Scale" attribute.
      </p>
    </>
  ),

  teamSizeAttribute: (
    <>
      <h4>What is Team Size?</h4>
      <p>
        <strong>Team Size</strong> measures how many people actively contribute to a team's
        Jira work. It's calculated by counting unique assignees on issues within a recent
        time period.
      </p>

      <h4>How It's Calculated</h4>
      <ul>
        <li>Looks at issues updated in the last 30 days</li>
        <li>Counts unique users assigned to those issues</li>
        <li>Includes anyone who was an assignee, not just current assignees</li>
      </ul>

      <h4>Default Size Ranges</h4>
      <ul>
        <li><strong>Small (1-5):</strong> Typical startup or feature team</li>
        <li><strong>Medium (6-10):</strong> Standard agile team size</li>
        <li><strong>Large (11-15):</strong> Larger team, may benefit from splitting</li>
        <li><strong>Extra Large (16+):</strong> Very large, often multiple sub-teams</li>
      </ul>

      <h4>Why Team Size Matters</h4>
      <p>
        Team size affects many aspects of work:
      </p>
      <ul>
        <li>Communication overhead increases with size</li>
        <li>Smaller teams are often more agile</li>
        <li>Comparing metrics between very different sizes can be misleading</li>
        <li>Health benchmarks may vary by size category</li>
      </ul>

      <h4>Customizing Ranges</h4>
      <p>
        You can adjust what "Small", "Medium", etc. mean for your organization. Click
        the edit button to change the thresholds.
      </p>
    </>
  ),

  tenureAttribute: (
    <>
      <h4>What is Team Tenure?</h4>
      <p>
        <strong>Tenure</strong> measures how long a team has been operating in its current
        form. New teams behave differently than established ones, so this helps contextualize
        health metrics.
      </p>

      <h4>How It's Calculated</h4>
      <ul>
        <li>Looks at the earliest activity date for the team's Jira board/project</li>
        <li>Calculates months since that first activity</li>
        <li>Categorizes into tenure ranges</li>
      </ul>

      <h4>Default Tenure Ranges</h4>
      <ul>
        <li><strong>New (0-3 months):</strong> Just getting started, forming patterns</li>
        <li><strong>Developing (4-6 months):</strong> Building rhythm and habits</li>
        <li><strong>Established (7-12 months):</strong> Stable processes</li>
        <li><strong>Mature (12+ months):</strong> Well-established team</li>
      </ul>

      <h4>Why Tenure Matters</h4>
      <p>
        New teams often show different patterns:
      </p>
      <ul>
        <li>Lower velocity stability (still learning)</li>
        <li>Higher scope change (requirements still being defined)</li>
        <li>More blocked work (processes not yet established)</li>
      </ul>
      <p>
        Comparing a 2-month-old team to a 2-year-old team isn't fair. Tenure helps you
        compare apples to apples.
      </p>
    </>
  ),

  volumeAttribute: (
    <>
      <h4>What is Work Volume?</h4>
      <p>
        <strong>Volume</strong> measures how much work a team typically handles. High-volume
        teams process many items; low-volume teams work on fewer, possibly larger items.
      </p>

      <h4>How It's Calculated</h4>
      <ul>
        <li>Counts issues created or completed in the analysis period</li>
        <li>May factor in story points if available</li>
        <li>Normalizes across the time period for comparability</li>
      </ul>

      <h4>Default Volume Ranges</h4>
      <ul>
        <li><strong>Low:</strong> Fewer items, often larger/complex work</li>
        <li><strong>Medium:</strong> Typical throughput</li>
        <li><strong>High:</strong> Many items, often smaller units of work</li>
      </ul>

      <h4>Why Volume Matters</h4>
      <p>
        Volume affects how you interpret metrics:
      </p>
      <ul>
        <li>High-volume teams may have lower cycle times (smaller items)</li>
        <li>Low-volume teams working on large items have different patterns</li>
        <li>Bug ratios may vary significantly by volume</li>
        <li>Comparing teams with very different volumes requires context</li>
      </ul>

      <h4>Volume vs. Velocity</h4>
      <p>
        Volume is about quantity of items. Velocity is about story points or value delivered.
        They're related but not the same – a team can have high volume with low velocity
        if items are small but low-value.
      </p>
    </>
  ),

  processAttribute: (
    <>
      <h4>What is Process Methodology?</h4>
      <p>
        <strong>Process</strong> identifies the agile methodology a team follows, based
        on their Jira usage patterns. The main types are Scrum and Kanban.
      </p>

      <h4>How It's Detected</h4>
      <ul>
        <li><strong>Scrum:</strong> Team uses sprints, has sprint boards, commits to sprint backlogs</li>
        <li><strong>Kanban:</strong> No sprints, uses a continuous flow board, focuses on WIP limits</li>
        <li><strong>Hybrid/Other:</strong> Mixed patterns or unclear methodology</li>
      </ul>

      <h4>Why Process Matters</h4>
      <p>
        Different methodologies have different health indicators:
      </p>
      <ul>
        <li><strong>Scrum teams:</strong> Sprint completion and velocity are key metrics</li>
        <li><strong>Kanban teams:</strong> Cycle time and throughput are more relevant</li>
        <li>Some dimensions only make sense for certain processes</li>
        <li>Benchmarks should compare similar methodologies</li>
      </ul>

      <h4>Scrum vs. Kanban in Brief</h4>
      <p>
        <strong>Scrum:</strong> Work in fixed time boxes (sprints). Plan at start, commit to
        delivering a set of items, review at end. Good for teams with predictable work.
      </p>
      <p>
        <strong>Kanban:</strong> Continuous flow. Pull work as capacity allows, focus on
        limiting work in progress. Good for teams with unpredictable or support-type work.
      </p>
    </>
  ),

  customAttributesSection: (
    <>
      <h4>What Are Custom Attributes?</h4>
      <p>
        <strong>Custom Attributes</strong> are team classifications that you define yourself.
        Unlike system attributes (which are auto-calculated), custom attributes require
        manual setup and team assignment.
      </p>

      <h4>Why Create Custom Attributes?</h4>
      <p>
        Custom attributes let you classify teams in ways that matter to your organization:
      </p>
      <ul>
        <li><strong>Work Type:</strong> Platform vs. Product vs. Support teams</li>
        <li><strong>Domain:</strong> Payments, Authentication, Frontend, etc.</li>
        <li><strong>Location:</strong> US, EU, APAC teams</li>
        <li><strong>Business Unit:</strong> Consumer, Enterprise, Internal tools</li>
        <li><strong>Risk Level:</strong> Teams working on critical vs. experimental systems</li>
      </ul>

      <h4>How Custom Attributes Work</h4>
      <ol>
        <li>You create an attribute (e.g., "Work Type")</li>
        <li>You define possible values (e.g., "Platform", "Product", "Support")</li>
        <li>Teams are assigned to values (manually or via filters)</li>
        <li>Assessments use these attributes for comparison grouping</li>
      </ol>

      <h4>Custom vs. System Attributes</h4>
      <ul>
        <li><strong>System:</strong> Auto-calculated, objective, data-driven</li>
        <li><strong>Custom:</strong> Admin-defined, subjective, organization-specific</li>
      </ul>
      <p>
        Both are valuable! System attributes ensure consistency; custom attributes capture
        organizational knowledge that can't be derived from data.
      </p>
    </>
  ),

  addAttributeButton: (
    <>
      <h4>Creating a New Custom Attribute</h4>
      <p>
        Clicking "Add Attribute" starts the process of defining a new way to classify teams.
        Here's what you'll configure:
      </p>

      <h4>Step 1: Basic Information</h4>
      <ul>
        <li><strong>Name:</strong> What to call this attribute (e.g., "Work Type")</li>
        <li><strong>Description:</strong> Explanation of what this attribute represents</li>
        <li><strong>Color:</strong> Visual identifier for this attribute in charts and reports</li>
      </ul>

      <h4>Step 2: Configuration Options</h4>
      <ul>
        <li><strong>Required:</strong> Must creators select a value when assessing their team?</li>
        <li><strong>Allow Multiple:</strong> Can a team belong to multiple values?</li>
      </ul>

      <h4>Step 3: Define Values</h4>
      <p>
        After creating the attribute, you'll add values. For example, a "Work Type"
        attribute might have values like "Platform", "Product", and "Support".
      </p>

      <h4>Examples of Good Attributes</h4>
      <ul>
        <li><strong>Domain:</strong> Payments, Auth, Search, Notifications</li>
        <li><strong>Work Type:</strong> Platform, Product, Support, Research</li>
        <li><strong>Criticality:</strong> Tier 1 (critical), Tier 2 (important), Tier 3 (nice-to-have)</li>
        <li><strong>Region:</strong> Americas, EMEA, APAC</li>
      </ul>
    </>
  ),

  requiredCheckbox: (
    <>
      <h4>What Does "Required" Mean?</h4>
      <p>
        When an attribute is marked as <strong>Required</strong>, anyone creating an
        assessment must select at least one value for this attribute. They cannot
        proceed without making a selection.
      </p>

      <h4>When to Make an Attribute Required</h4>
      <ul>
        <li><strong>Critical for reporting:</strong> You need this data for all teams</li>
        <li><strong>Essential for comparison:</strong> Teams can't be compared without it</li>
        <li><strong>Governance requirement:</strong> Policy requires this classification</li>
      </ul>

      <h4>When to Keep it Optional</h4>
      <ul>
        <li><strong>Not all teams fit:</strong> Some teams don't belong to any value</li>
        <li><strong>Still defining values:</strong> You're not sure of all possible values yet</li>
        <li><strong>Supplementary info:</strong> Nice to have but not essential</li>
      </ul>

      <h4>What Users See</h4>
      <p>
        Required attributes show a red asterisk (*) in the assessment wizard. Users see
        a validation error if they try to continue without selecting a value.
      </p>
    </>
  ),

  allowMultipleCheckbox: (
    <>
      <h4>What Does "Allow Multiple" Mean?</h4>
      <p>
        When <strong>Allow Multiple</strong> is enabled, a team can belong to more than
        one value for this attribute. When disabled, teams can only select one value.
      </p>

      <h4>Example: Allow Multiple</h4>
      <p>
        Attribute: "Technology Stack"<br />
        Values: React, Python, Java, Go<br />
        <em>A team using React frontend and Python backend would select both.</em>
      </p>

      <h4>Example: Single Select Only</h4>
      <p>
        Attribute: "Work Type"<br />
        Values: Platform, Product, Support<br />
        <em>A team is primarily one type – they pick the best fit.</em>
      </p>

      <h4>Impact on Reporting</h4>
      <ul>
        <li><strong>Allow Multiple:</strong> Team appears in multiple comparison groups</li>
        <li><strong>Single Select:</strong> Team appears in exactly one group</li>
      </ul>

      <h4>Considerations</h4>
      <p>
        Multiple selection provides flexibility but can complicate analysis. If a team
        belongs to 3 values, they're counted in 3 different groups when comparing metrics.
      </p>
    </>
  ),

  filterRulesSection: (
    <>
      <h4>What Are Filter Rules?</h4>
      <p>
        <strong>Filter Rules</strong> automatically assign teams to attribute values based
        on criteria you define. Instead of manually tagging each team, you create rules
        that match teams automatically.
      </p>

      <h4>How Filter Rules Work</h4>
      <p>
        A filter rule is a condition that a team must match. For example:
      </p>
      <ul>
        <li>"Team Name <strong>contains</strong> 'Platform'" → assigns to Platform value</li>
        <li>"Team Key <strong>starts with</strong> 'MOBILE'" → assigns to Mobile value</li>
        <li>"Is Onboarded <strong>equals</strong> true" → assigns to Active Teams value</li>
      </ul>

      <h4>Multiple Conditions (AND Logic)</h4>
      <p>
        When you add multiple conditions, teams must match <strong>ALL</strong> of them
        to be assigned. For example:
      </p>
      <ul>
        <li>Team Name contains "Platform" AND Team Size &gt; 5</li>
        <li>Both conditions must be true for the team to match</li>
      </ul>

      <h4>Available Filter Fields</h4>
      <ul>
        <li><strong>Team Name:</strong> The display name of the team in Jira</li>
        <li><strong>Team Key:</strong> The short identifier (like PROJ-123)</li>
        <li><strong>Is Onboarded:</strong> Whether the team has been configured before</li>
      </ul>

      <h4>Filter Operators</h4>
      <ul>
        <li><strong>equals:</strong> Exact match (case-sensitive)</li>
        <li><strong>contains:</strong> Appears anywhere in the text</li>
        <li><strong>starts with:</strong> Text begins with this value</li>
        <li><strong>ends with:</strong> Text ends with this value</li>
        <li><strong>not equals:</strong> Does not match exactly</li>
      </ul>
    </>
  ),

  manualTeamAssignment: (
    <>
      <h4>What is Manual Team Assignment?</h4>
      <p>
        <strong>Manual Assignment</strong> means selecting specific teams to belong to an
        attribute value, rather than using filter rules to match them automatically.
      </p>

      <h4>When to Use Manual Assignment</h4>
      <ul>
        <li><strong>Exceptions:</strong> Teams that don't fit any naming pattern</li>
        <li><strong>Small lists:</strong> When you only have a few teams per value</li>
        <li><strong>Complex criteria:</strong> When rules can't capture the logic</li>
        <li><strong>Override needed:</strong> When a team should be in a value despite not matching the filter</li>
      </ul>

      <h4>Combining Manual and Filter Assignment</h4>
      <p>
        You can use both methods together! A team can be assigned via:
      </p>
      <ul>
        <li>Filter rule only (matched automatically)</li>
        <li>Manual assignment only (explicitly selected)</li>
        <li>Both (matched by filter AND manually assigned)</li>
      </ul>

      <h4>Preview Indicators</h4>
      <p>
        In the preview, you'll see how each team was assigned:
      </p>
      <ul>
        <li><strong>🔍 Filter:</strong> Matched by filter rule</li>
        <li><strong>✋ Manual:</strong> Explicitly assigned</li>
        <li><strong>⚡ Both:</strong> Matched by filter AND manually assigned</li>
      </ul>
    </>
  ),
};

// ============================================================================
// ADMIN SECTION: ORGANIZATIONAL HIERARCHY
// ============================================================================

export const AdminOrgHierarchyHelp = {
  orgStructureSection: (
    <>
      <h4>What is Organizational Structure?</h4>
      <p>
        <strong>Organizational Structure</strong> defines how your teams are grouped into
        larger units. This hierarchy is used for rolled-up reporting, comparison groups,
        and leadership dashboards.
      </p>

      <h4>Why Define a Structure?</h4>
      <p>Without structure, all teams are treated equally. Structure enables:</p>
      <ul>
        <li><strong>Aggregate Reporting:</strong> See health metrics at the Portfolio or Team of Teams level</li>
        <li><strong>Comparison Groups:</strong> Teams can compare against others in their group</li>
        <li><strong>Leadership Views:</strong> Executives see their areas without drilling into every team</li>
        <li><strong>Accountability:</strong> Managers can focus on their teams</li>
      </ul>

      <h4>The Two-Level Hierarchy</h4>
      <ul>
        <li><strong>Portfolios:</strong> The top level – think business units, product areas, or value streams</li>
        <li><strong>Teams of Teams:</strong> The middle level – often called tribes, clusters, or train teams</li>
        <li><strong>Teams:</strong> Individual delivery teams (the ones running assessments)</li>
      </ul>

      <h4>Naming Your Layers</h4>
      <p>
        You can rename "Portfolio" and "Team of Teams" to match your organization's vocabulary.
        For example: "Business Unit" → "Tribe" → "Squad".
      </p>
    </>
  ),

  teamGroupingStructure: (
    <>
      <h4>Choosing a Grouping Structure</h4>
      <p>
        This setting determines whether teams are organized in a formal hierarchy or treated
        as a flat list. The choice affects reporting, comparisons, and how data is rolled up.
      </p>

      <h4>Hierarchical vs Flat</h4>
      <ul>
        <li>
          <strong>Hierarchical:</strong> Teams belong to Teams of Teams, which belong to Portfolios.
          Best for larger organizations with formal reporting structures.
        </li>
        <li>
          <strong>Flat:</strong> All teams are at the same level with no parent groupings.
          Best for smaller organizations or those without formal hierarchies.
        </li>
      </ul>

      <h4>When to Use Hierarchical</h4>
      <ul>
        <li>Your organization has formal business units or product areas</li>
        <li>Leaders need rolled-up views of their teams</li>
        <li>You want teams to compare within their group (not the whole org)</li>
        <li>You have more than 10-15 teams</li>
      </ul>

      <h4>When to Use Flat</h4>
      <ul>
        <li>You have fewer than 10 teams</li>
        <li>Teams frequently move between groups</li>
        <li>Your structure is still evolving</li>
        <li>You prefer simple, org-wide comparisons</li>
      </ul>

      <h4>Can I Change This Later?</h4>
      <p>
        Yes, you can switch between hierarchical and flat structures. However, switching
        may affect existing reports and comparison groups. It's best to decide before
        running many assessments.
      </p>
    </>
  ),

  hierarchicalStructure: (
    <>
      <h4>What is Hierarchical Structure?</h4>
      <p>
        <strong>Hierarchical Structure</strong> organizes your teams into a tree-like
        arrangement with two levels above individual teams:
      </p>
      <ul>
        <li><strong>Portfolio</strong> (top level) – the largest grouping</li>
        <li><strong>Team of Teams</strong> (middle level) – groups of related teams</li>
        <li><strong>Teams</strong> (bottom level) – individual teams doing the work</li>
      </ul>

      <h4>Example Hierarchy</h4>
      <pre style={{ backgroundColor: '#F4F5F7', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
{`Portfolio: Consumer Products
├── Team of Teams: Mobile
│   ├── iOS Team
│   ├── Android Team
│   └── React Native Team
└── Team of Teams: Web
    ├── Frontend Team
    └── Backend Team

Portfolio: Enterprise Products
├── Team of Teams: Platform
│   ├── API Team
│   └── Infrastructure Team
└── Team of Teams: Security
    └── Security Engineering Team`}
      </pre>

      <h4>When to Use Hierarchical Structure</h4>
      <ul>
        <li>Your organization has clear reporting lines</li>
        <li>Leadership wants roll-up reports by Portfolio or Team of Teams</li>
        <li>Teams naturally group by product area or domain</li>
        <li>You need to compare groups of teams, not just individual teams</li>
      </ul>

      <h4>Benefits of Hierarchy</h4>
      <ul>
        <li><strong>Roll-up reporting:</strong> See aggregate health at Portfolio level</li>
        <li><strong>Meaningful comparisons:</strong> Compare teams within the same Team of Teams</li>
        <li><strong>Executive dashboards:</strong> High-level views for leadership</li>
        <li><strong>Drill-down capability:</strong> Start with Portfolio, drill to team details</li>
      </ul>
    </>
  ),

  flatStructure: (
    <>
      <h4>What is Flat Structure?</h4>
      <p>
        <strong>Flat Structure</strong> treats all teams as peers without a hierarchy.
        There are no Portfolios or Teams of Teams – just individual teams that can be
        grouped by attributes for comparison.
      </p>

      <h4>When to Use Flat Structure</h4>
      <ul>
        <li>Your organization is small or has a flat org chart</li>
        <li>Teams don't naturally group into larger units</li>
        <li>You prefer flexibility over formal hierarchy</li>
        <li>Leadership doesn't need roll-up reports</li>
        <li>You're just getting started and want to keep things simple</li>
      </ul>

      <h4>What Changes with Flat Structure</h4>
      <ul>
        <li>Portfolio and Team of Teams options are hidden in the wizard</li>
        <li>Team attributes become the primary way to group teams</li>
        <li>No automatic roll-up reports by organizational unit</li>
        <li>Simpler setup, but less structure for large organizations</li>
      </ul>

      <h4>Can You Switch Later?</h4>
      <p>
        Yes! You can switch from Flat to Hierarchical (or vice versa) at any time.
        Switching to Hierarchical will require you to define Portfolios and Teams of
        Teams and assign teams to them.
      </p>

      <h4>Flat Structure with Attributes</h4>
      <p>
        Even without hierarchy, you can still group teams using custom attributes.
        For example, an attribute for "Domain" can group teams for comparison without
        formal hierarchy.
      </p>
    </>
  ),

  portfolioConcept: (
    <>
      <h4>What is a Portfolio?</h4>
      <p>
        A <strong>Portfolio</strong> is the highest level of organizational grouping.
        It typically represents a major business unit, product line, or strategic initiative.
      </p>

      <h4>Examples of Portfolios</h4>
      <ul>
        <li>"Consumer Products" – all teams building consumer-facing features</li>
        <li>"Enterprise Platform" – B2B product development</li>
        <li>"Infrastructure" – platform, DevOps, and enabling teams</li>
        <li>"Growth" – teams focused on user acquisition and retention</li>
      </ul>

      <h4>What Portfolios Contain</h4>
      <p>
        Each Portfolio contains one or more Teams of Teams, which in turn contain
        individual teams. This creates a three-level hierarchy.
      </p>

      <h4>Portfolio-Level Reporting</h4>
      <p>
        With Portfolios defined, you can:
      </p>
      <ul>
        <li>See aggregate health scores across all teams in a Portfolio</li>
        <li>Compare health between different Portfolios</li>
        <li>Identify which Portfolios are struggling or excelling</li>
        <li>Provide executive-level dashboards</li>
      </ul>

      <h4>Naming Your Portfolios</h4>
      <p>
        The term "Portfolio" is customizable. If your organization calls these "Business
        Units", "Product Lines", or something else, you can rename it to match your
        vocabulary.
      </p>
    </>
  ),

  teamOfTeamsConcept: (
    <>
      <h4>What is a Team of Teams?</h4>
      <p>
        A <strong>Team of Teams</strong> (sometimes called a "Tribe" in the Spotify model)
        is a collection of related individual teams that work toward a common purpose.
      </p>

      <h4>Examples of Teams of Teams</h4>
      <ul>
        <li>"Mobile" – iOS, Android, and React Native teams</li>
        <li>"Payments" – Checkout, Billing, and Fraud teams</li>
        <li>"Search" – Indexing, Ranking, and UI teams</li>
        <li>"Platform" – API, Infrastructure, and DevOps teams</li>
      </ul>

      <h4>Team of Teams vs. Portfolio</h4>
      <ul>
        <li><strong>Portfolio:</strong> Largest grouping, often business-unit level</li>
        <li><strong>Team of Teams:</strong> Mid-level grouping within a Portfolio</li>
        <li><strong>Team:</strong> Individual team doing the actual work</li>
      </ul>

      <h4>Why Group Teams This Way?</h4>
      <p>
        Teams of Teams are valuable because:
      </p>
      <ul>
        <li>Related teams often have similar challenges and can learn from each other</li>
        <li>A manager or leader typically oversees a Team of Teams</li>
        <li>Dependencies often exist within a Team of Teams</li>
        <li>Comparison within a Team of Teams is most meaningful</li>
      </ul>

      <h4>Naming Your Teams of Teams</h4>
      <p>
        Like "Portfolio", this term is customizable. If your organization uses "Tribe",
        "Guild", "Cluster", or another name, you can change it.
      </p>
    </>
  ),

  requiredAssignments: (
    <>
      <h4>What Are Required Assignments?</h4>
      <p>
        <strong>Required Assignments</strong> determine whether creators must specify their
        team's place in the organizational hierarchy when running an assessment.
      </p>

      <h4>Two Levels of Requirements</h4>
      <ul>
        <li><strong>Require Portfolio Selection:</strong> Must identify which Portfolio the team belongs to</li>
        <li><strong>Require Team of Teams Selection:</strong> Must identify which Team of Teams</li>
      </ul>

      <h4>When to Require These Selections</h4>
      <p>Make them required when:</p>
      <ul>
        <li>You need accurate roll-up reports by organizational unit</li>
        <li>Executive dashboards depend on complete data</li>
        <li>Governance requires knowing which business unit a team belongs to</li>
        <li>You want to enforce organizational structure awareness</li>
      </ul>

      <h4>When to Keep Them Optional</h4>
      <p>Keep them optional when:</p>
      <ul>
        <li>Not all teams have been mapped to the hierarchy yet</li>
        <li>Some teams genuinely don't fit into any category</li>
        <li>You're piloting with a subset of teams</li>
        <li>Flexibility is more important than completeness</li>
      </ul>

      <h4>What Users See</h4>
      <p>
        When required, these fields show a red asterisk (*) in the wizard and validation
        errors if left empty.
      </p>
    </>
  ),

  unmappedTeamsWarning: (
    <>
      <h4>What Are Unmapped Teams?</h4>
      <p>
        <strong>Unmapped Teams</strong> are teams that haven't been assigned to any Portfolio
        or Team of Teams in your organizational hierarchy.
      </p>

      <h4>Why This Matters</h4>
      <p>
        Unmapped teams create gaps in your organizational view:
      </p>
      <ul>
        <li>They won't appear in Portfolio-level roll-up reports</li>
        <li>Executive dashboards will be incomplete</li>
        <li>You can't compare them within their organizational context</li>
        <li>It may indicate the hierarchy doesn't fully represent your organization</li>
      </ul>

      <h4>How to Fix Unmapped Teams</h4>
      <ol>
        <li>Click "View" to see which teams are unmapped</li>
        <li>For each team, decide which Portfolio and Team of Teams it belongs to</li>
        <li>Update the hierarchy to include them</li>
        <li>Or, if a team truly doesn't fit, consider if your hierarchy needs adjustment</li>
      </ol>

      <h4>Common Reasons for Unmapped Teams</h4>
      <ul>
        <li>New teams that haven't been added yet</li>
        <li>Temporary or experimental teams</li>
        <li>Teams that span multiple Portfolios</li>
        <li>Hierarchy was set up before all teams existed</li>
      </ul>
    </>
  ),
};

// ============================================================================
// ADMIN SECTION: ANALYTICS
// ============================================================================

export const AdminAnalyticsHelp = {
  timeRangeButtons: (
    <>
      <h4>Understanding Time Ranges</h4>
      <p>
        The time range selector lets you choose how much historical data to view.
        Different ranges tell different stories:
      </p>

      <h4>7 Days (Last Week)</h4>
      <ul>
        <li>Best for: Recent activity, quick pulse check</li>
        <li>Shows: Very recent trends, may be noisy</li>
        <li>Good for: "What happened this week?"</li>
      </ul>

      <h4>30 Days (Last Month)</h4>
      <ul>
        <li>Best for: Standard operational view</li>
        <li>Shows: Monthly patterns, enough data to spot trends</li>
        <li>Good for: Monthly reviews, regular check-ins</li>
      </ul>

      <h4>90 Days (Last Quarter)</h4>
      <ul>
        <li>Best for: Strategic view, identifying patterns</li>
        <li>Shows: Quarterly trends, seasonal patterns</li>
        <li>Good for: Quarterly planning, executive reviews</li>
      </ul>

      <h4>How Range Affects Data</h4>
      <p>
        Changing the range recalculates all metrics for the selected period. The same
        activities look different at different time scales – a spike last week might be
        noise in a 90-day view.
      </p>
    </>
  ),

  totalUsersMetric: (
    <>
      <h4>What is "Total Users"?</h4>
      <p>
        <strong>Total Users</strong> counts everyone who has an account in the Jira Health
        Assessment tool, regardless of their activity level.
      </p>

      <h4>What's Included</h4>
      <ul>
        <li>Active users who regularly use the tool</li>
        <li>Inactive users who haven't logged in recently</li>
        <li>Pending users who haven't completed setup</li>
      </ul>

      <h4>What's Not Included</h4>
      <ul>
        <li>Deactivated users (they don't count toward total)</li>
      </ul>

      <h4>Active vs. Total</h4>
      <p>
        The sub-metric "X active in last 30 days" shows how many users have actually
        used the tool recently. The difference between Total and Active reveals:
      </p>
      <ul>
        <li>Adoption gaps (users with accounts who aren't using the tool)</li>
        <li>Potential cleanup targets (old accounts that could be deactivated)</li>
        <li>Training opportunities (inactive users who might need help)</li>
      </ul>
    </>
  ),

  healthScoreExplanation: (
    <>
      <h4>How is Health Score Calculated?</h4>
      <p>
        The <strong>Health Score</strong> is a 0-100 measure of overall team health,
        calculated by aggregating scores across all enabled dimensions.
      </p>

      <h4>Calculation Method</h4>
      <ol>
        <li>Each dimension (velocity, completion, etc.) gets a score from 0-100</li>
        <li>Dimension scores are weighted (some may count more than others)</li>
        <li>The weighted average becomes the overall Health Score</li>
      </ol>

      <h4>Score Interpretation</h4>
      <ul>
        <li><strong>80-100:</strong> Excellent – team is performing well across metrics</li>
        <li><strong>60-79:</strong> Good – solid performance with room for improvement</li>
        <li><strong>40-59:</strong> Fair – notable areas needing attention</li>
        <li><strong>20-39:</strong> Concerning – significant challenges present</li>
        <li><strong>0-19:</strong> Critical – immediate intervention likely needed</li>
      </ul>

      <h4>Important Context</h4>
      <p>
        Health Score is a starting point, not a final judgment. A "low" score doesn't
        mean a bad team – it might mean:
      </p>
      <ul>
        <li>They're working on unusually complex projects</li>
        <li>They're going through a transition</li>
        <li>Certain dimensions aren't relevant to their work</li>
        <li>External factors are affecting metrics</li>
      </ul>

      <h4>Using Health Score Wisely</h4>
      <p>
        Focus on <em>trends</em> (is the score improving or declining?) rather than
        absolute values. A team improving from 45 to 55 is doing great work, even if
        55 isn't "green."
      </p>
    </>
  ),

  improvingTeams: (
    <>
      <h4>What Does "Improving" Mean?</h4>
      <p>
        <strong>Improving</strong> teams show a positive trend in their Health Score
        compared to their previous assessment.
      </p>

      <h4>How Improvement is Calculated</h4>
      <ul>
        <li>Compares current Health Score to the previous assessment</li>
        <li>Teams with higher scores than before are "Improving"</li>
        <li>Typically requires at least 5% increase to be classified as improving</li>
      </ul>

      <h4>What Improvement Indicates</h4>
      <ul>
        <li>Process changes are having positive effects</li>
        <li>Team is addressing previous pain points</li>
        <li>Investment in team health is paying off</li>
        <li>Positive momentum to maintain</li>
      </ul>

      <h4>Actions to Take</h4>
      <ul>
        <li>Celebrate and recognize the team's progress</li>
        <li>Understand what changed – share learnings with other teams</li>
        <li>Continue supporting what's working</li>
        <li>Document the improvement for future reference</li>
      </ul>
    </>
  ),

  decliningTeams: (
    <>
      <h4>What Does "Declining" Mean?</h4>
      <p>
        <strong>Declining</strong> teams show a negative trend in their Health Score
        compared to their previous assessment.
      </p>

      <h4>How Decline is Calculated</h4>
      <ul>
        <li>Compares current Health Score to the previous assessment</li>
        <li>Teams with lower scores than before are "Declining"</li>
        <li>Typically requires at least 5% decrease to be classified as declining</li>
      </ul>

      <h4>What Decline Might Indicate</h4>
      <ul>
        <li>Increased workload or pressure</li>
        <li>Team changes (new members, departures, re-orgs)</li>
        <li>Technical debt accumulating</li>
        <li>External dependencies causing friction</li>
        <li>Burnout or morale issues</li>
      </ul>

      <h4>Actions to Take</h4>
      <ul>
        <li>Reach out to understand what's happening</li>
        <li>Look at which dimensions declined most</li>
        <li>Identify if external factors are causing issues</li>
        <li>Offer support and resources</li>
        <li>Create action plans to address specific problems</li>
        <li>Follow up to track progress</li>
      </ul>

      <h4>Important Note</h4>
      <p>
        "Declining" isn't an accusation – it's a signal to investigate. Healthy
        organizations notice decline early and respond supportively.
      </p>
    </>
  ),
};

// ============================================================================
// WIZARD STEP 1: BASICS
// ============================================================================

export const WizardStep1Help = {
  teamDropdown: (
    <>
      <h4>What is a "Team" in This Context?</h4>
      <p>
        In the Jira Health Assessment, a <strong>Team</strong> refers to a Jira board or
        project that represents a group of people working together. It's the unit of
        analysis – we'll examine all issues from this board/project.
      </p>

      <h4>What You're Selecting</h4>
      <p>
        The dropdown shows Jira boards or projects that have been connected to this
        assessment tool. Select the one that represents your team's primary work location.
      </p>

      <h4>Team Status Badges</h4>
      <ul>
        <li><strong>Configured:</strong> This team has been assessed before. Previous settings are available.</li>
        <li><strong>New:</strong> First-time assessment. You'll set up everything from scratch.</li>
      </ul>

      <h4>Choosing the Right Team</h4>
      <p>
        Select the board/project where your team does their primary work. If your team
        uses multiple boards, choose the one that best represents their main workflow.
      </p>

      <h4>Don't See Your Team?</h4>
      <p>
        If your team isn't listed, it may not have been connected yet. Contact your
        administrator to add the Jira board or project.
      </p>
    </>
  ),

  configuredBadge: (
    <>
      <h4>What Does "Configured" Mean?</h4>
      <p>
        A team marked as <strong>Configured</strong> has been assessed before. This means:
      </p>
      <ul>
        <li>Previous assessment settings exist</li>
        <li>You can reuse those settings or start fresh</li>
        <li>Historical comparison data may be available</li>
      </ul>

      <h4>What Settings Are Preserved?</h4>
      <ul>
        <li>Sprint cadence selection</li>
        <li>Stale thresholds for each issue type</li>
        <li>Team attribute selections</li>
        <li>Report configuration options</li>
      </ul>

      <h4>Using Previous Settings</h4>
      <p>
        Choosing "Use Previous Settings" pre-fills the wizard with values from the last
        assessment. You can still review and modify any settings before running.
      </p>

      <h4>When to Start Fresh</h4>
      <p>
        Start fresh if:
      </p>
      <ul>
        <li>The team has changed significantly since the last assessment</li>
        <li>Previous settings weren't quite right</li>
        <li>You want to explore different configuration options</li>
      </ul>
    </>
  ),

  dateRangeDropdown: (
    <>
      <h4>Choosing Your Analysis Period</h4>
      <p>
        The <strong>Date Range</strong> determines how far back we analyze your Jira data.
        This is one of the most important choices in the assessment.
      </p>

      <h4>Available Presets</h4>
      <ul>
        <li><strong>Last 30 Days:</strong> Recent snapshot, good for quick checks</li>
        <li><strong>Last 3 Months:</strong> Recommended starting point for most teams</li>
        <li><strong>Last 6 Months:</strong> Fuller picture, captures more patterns</li>
        <li><strong>Year to Date:</strong> Everything since January 1st</li>
        <li><strong>Custom:</strong> Specify exact start and end dates</li>
      </ul>

      <h4>Why 3-6 Months is Recommended</h4>
      <p>
        This range provides enough data to see patterns while still being relevant to
        current team dynamics. Reasons:
      </p>
      <ul>
        <li><strong>Enough data points:</strong> 6-12 sprints to analyze patterns</li>
        <li><strong>Recent enough:</strong> Reflects current team composition and practices</li>
        <li><strong>Seasonal coverage:</strong> Captures various work periods</li>
        <li><strong>Trend visibility:</strong> Can see improvements or declines over time</li>
      </ul>

      <h4>When Longer Periods Help</h4>
      <ul>
        <li>Stable teams with long history</li>
        <li>Looking for long-term trends</li>
        <li>Comparing year-over-year</li>
      </ul>

      <h4>When Shorter Periods Help</h4>
      <ul>
        <li>Team recently reorganized</li>
        <li>Just want to check recent performance</li>
        <li>Testing the tool before a full assessment</li>
      </ul>
    </>
  ),

  dataGroupingSection: (
    <>
      <h4>What is Data Grouping?</h4>
      <p>
        <strong>Data Grouping</strong> determines how we chunk your Jira data for analysis.
        It affects how trends and metrics are displayed in your report.
      </p>

      <h4>Available Options</h4>
      <ul>
        <li><strong>Weekly:</strong> Data shown week by week</li>
        <li><strong>Fortnightly:</strong> Data shown in 2-week chunks</li>
        <li><strong>Monthly:</strong> Data shown month by month</li>
      </ul>

      <h4>How It Affects Your Report</h4>
      <p>
        If you choose "Weekly" grouping:
      </p>
      <ul>
        <li>Charts show a data point for each week</li>
        <li>Velocity is calculated per week</li>
        <li>More granular trend visibility</li>
      </ul>
      <p>
        If you choose "Monthly" grouping:
      </p>
      <ul>
        <li>Charts show a data point for each month</li>
        <li>Smoother trends, less noise</li>
        <li>Easier to see long-term patterns</li>
      </ul>

      <h4>Match Your Sprint Cadence</h4>
      <p>
        As a rule of thumb:
      </p>
      <ul>
        <li><strong>1-week sprints:</strong> Use Weekly grouping</li>
        <li><strong>2-week sprints:</strong> Use Fortnightly grouping</li>
        <li><strong>Longer sprints or Kanban:</strong> Use Monthly grouping</li>
      </ul>

      <h4>Why This Matters</h4>
      <p>
        Mismatched grouping can obscure patterns. If you have 2-week sprints but weekly
        grouping, you'll see two data points per sprint, which might show artificial
        variation.
      </p>
    </>
  ),
};

// ============================================================================
// WIZARD STEP 2: TEAM CONTEXT (COMPARISON)
// ============================================================================

export const WizardStep2Help = {
  orgStructureSection: (
    <>
      <h4>What is Organizational Structure?</h4>
      <p>
        This section connects your team to the broader organizational hierarchy.
        Your organization may use <strong>Portfolios</strong> (top-level business units)
        and <strong>Teams of Teams</strong> (clusters of related teams).
      </p>

      <h4>Why This Matters</h4>
      <ul>
        <li><strong>Roll-up Reporting:</strong> Executives can see aggregate metrics</li>
        <li><strong>Contextual Comparisons:</strong> Compare within your cluster, not the whole org</li>
        <li><strong>Accountability:</strong> Leaders see health of their teams</li>
      </ul>

      <h4>Pre-Selected Values</h4>
      <p>
        If your team has already been mapped to a Portfolio or Team of Teams by an admin,
        those values will be pre-selected. You can change them if needed.
      </p>
    </>
  ),

  systemAttributesSection: (
    <>
      <h4>What Are System Attributes?</h4>
      <p>
        <strong>System attributes</strong> are automatically calculated based on your
        team's Jira data. They include:
      </p>
      <ul>
        <li><strong>Team Size:</strong> Number of people working on issues</li>
        <li><strong>Tenure:</strong> How long the team has been active</li>
        <li><strong>Volume:</strong> Amount of work handled</li>
        <li><strong>Process:</strong> Scrum, Kanban, or other methodology</li>
      </ul>

      <h4>How They're Used</h4>
      <p>
        When you select values for these attributes, we use them to find similar teams
        for comparison. A small Scrum team should compare to other small Scrum teams,
        not to large Kanban teams.
      </p>

      <h4>Current Team Values</h4>
      <p>
        The values shown in parentheses (e.g., "Small (1-5)") indicate what we've
        detected for your team. Select these to compare against teams with similar
        characteristics.
      </p>
    </>
  ),

  customAttributesSection: (
    <>
      <h4>What Are Custom Attributes?</h4>
      <p>
        Custom attributes are created by your organization's admins to classify teams
        in ways specific to your context. Examples include:
      </p>
      <ul>
        <li><strong>Work Type:</strong> Platform, Product, Support, DevOps</li>
        <li><strong>Domain:</strong> Payments, Identity, Onboarding</li>
        <li><strong>Tribe:</strong> Your internal organizational groupings</li>
      </ul>

      <h4>Why Use Them?</h4>
      <p>
        Custom attributes let you find teams that are genuinely similar to yours.
        Comparing a platform team to a product team might not be meaningful, but
        comparing two platform teams gives useful benchmarks.
      </p>
    </>
  ),

  selectTeamsMode: (
    <>
      <h4>Select Specific Teams</h4>
      <p>
        Use this mode when you know exactly which teams you want to compare against.
        Simply select teams from the dropdown.
      </p>

      <h4>When to Use This</h4>
      <ul>
        <li>You have established peer teams you regularly compare with</li>
        <li>You want to benchmark against specific high-performing teams</li>
        <li>You're doing a targeted analysis with known teams</li>
      </ul>
    </>
  ),

  filterTeamsMode: (
    <>
      <h4>Filter Teams by Criteria</h4>
      <p>
        Use this mode to dynamically find teams matching specific criteria. Build
        filter rules to match teams by name, attributes, or other properties.
      </p>

      <h4>When to Use This</h4>
      <ul>
        <li>You want all teams matching certain criteria</li>
        <li>The comparison group might change over time</li>
        <li>You don't know all similar teams by name</li>
      </ul>

      <h4>Example Filters</h4>
      <ul>
        <li>"Team name contains 'Platform'" → All platform teams</li>
        <li>"Work Type equals 'Product'" → All product teams</li>
      </ul>
    </>
  ),
};

// ============================================================================
// WIZARD STEP 4: ISSUE TYPES
// ============================================================================

export const WizardStep4Help = {
  issueTypesSection: (
    <>
      <h4>What Are Issue Types?</h4>
      <p>
        <strong>Issue types</strong> are how Jira categorizes different kinds of work.
        The most common types are Stories, Bugs, Tasks, Epics, and Sub-tasks.
      </p>

      <h4>Why Select Issue Types?</h4>
      <p>
        Different issue types often have different workflow patterns. Including the right
        types ensures the assessment accurately reflects your team's work:
      </p>
      <ul>
        <li><strong>Stories:</strong> Feature development work</li>
        <li><strong>Bugs:</strong> Defects and fixes (often urgent)</li>
        <li><strong>Tasks:</strong> Technical or operational work</li>
        <li><strong>Epics:</strong> Large initiatives spanning multiple issues</li>
        <li><strong>Sub-tasks:</strong> Breakdown of larger issues</li>
      </ul>

      <h4>Recommendations</h4>
      <ul>
        <li>Include <strong>Stories, Bugs, and Tasks</strong> for a complete picture</li>
        <li>Include <strong>Epics</strong> if you track them at the team level</li>
        <li><strong>Sub-tasks</strong> depend on how you use them – some teams use them for breakdown, others for tracking</li>
      </ul>

      <h4>What Gets Analyzed</h4>
      <p>
        The assessment looks for patterns like stale issues, incomplete work, and hidden
        tasks across your selected types. Each type contributes to the overall health picture.
      </p>
    </>
  ),

  storyType: (
    <>
      <h4>What is a Story?</h4>
      <p>
        A <strong>Story</strong> (or "User Story") is a piece of work described from the
        end user's perspective. It follows a standard format that emphasizes who benefits
        and why:
      </p>
      <p style={{ backgroundColor: '#F4F5F7', padding: '12px', borderRadius: '4px', fontStyle: 'italic' }}>
        "As a [type of user], I want [some goal] so that [some benefit]."
      </p>

      <h4>Examples of Stories</h4>
      <ul>
        <li>"As a shopper, I want to filter products by price so that I can find items in my budget."</li>
        <li>"As an admin, I want to export user data so that I can analyze usage patterns."</li>
        <li>"As a mobile user, I want offline mode so that I can use the app without internet."</li>
      </ul>

      <h4>Stories vs. Other Issue Types</h4>
      <ul>
        <li><strong>Stories vs. Bugs:</strong> Stories add new value; Bugs fix existing problems</li>
        <li><strong>Stories vs. Tasks:</strong> Stories describe user value; Tasks are often technical work</li>
        <li><strong>Stories vs. Epics:</strong> Stories are completable in a sprint; Epics span multiple sprints</li>
      </ul>

      <h4>Should You Include Stories?</h4>
      <p>
        Almost always <strong>yes</strong>. Stories represent the core work most teams deliver.
        Excluding them would miss a significant portion of team activity.
      </p>

      <h4>Story Points</h4>
      <p>
        Many teams estimate Stories using "story points" – a relative measure of effort.
        The assessment may use story points (if available) for velocity calculations.
      </p>
    </>
  ),

  bugType: (
    <>
      <h4>What is a Bug?</h4>
      <p>
        A <strong>Bug</strong> is an issue that describes something broken, incorrect, or
        not working as expected. Unlike Stories that add new functionality, Bugs fix
        existing problems.
      </p>

      <h4>Examples of Bugs</h4>
      <ul>
        <li>"Login button unresponsive on iOS 16"</li>
        <li>"Checkout total displays wrong tax amount"</li>
        <li>"Profile picture upload fails for files over 2MB"</li>
        <li>"Error message shown to user contains stack trace"</li>
      </ul>

      <h4>Why Bugs Matter in Assessment</h4>
      <p>
        The assessment tracks your "Bug Ratio" – what percentage of your work is fixing
        bugs vs. building features. A high bug ratio might indicate:
      </p>
      <ul>
        <li>Quality issues in recent releases</li>
        <li>Technical debt catching up with the team</li>
        <li>Insufficient testing before deployment</li>
        <li>Complex legacy systems prone to issues</li>
      </ul>

      <h4>Should You Include Bugs?</h4>
      <p>
        <strong>Yes</strong> in most cases. Understanding your bug work is essential for
        a complete health picture. The only exception might be if you track bugs in a
        completely separate system.
      </p>

      <h4>Bug Severity</h4>
      <p>
        If your team uses severity levels (Critical, Major, Minor, Trivial), the assessment
        treats all bugs equally unless you have custom configuration. Keep this in mind
        when interpreting bug-related metrics.
      </p>
    </>
  ),

  taskType: (
    <>
      <h4>What is a Task?</h4>
      <p>
        A <strong>Task</strong> is a work item that doesn't fit the user story format.
        Tasks are often technical, operational, or support work that needs to happen
        but isn't directly tied to a user-facing feature.
      </p>

      <h4>Examples of Tasks</h4>
      <ul>
        <li>"Set up CI/CD pipeline for new service"</li>
        <li>"Update documentation for API v2"</li>
        <li>"Research authentication libraries for mobile app"</li>
        <li>"Migrate database to new server"</li>
        <li>"Configure monitoring and alerting"</li>
      </ul>

      <h4>Tasks vs. Stories</h4>
      <p>
        The key difference:
      </p>
      <ul>
        <li><strong>Stories:</strong> "As a user, I want..." – focused on end-user value</li>
        <li><strong>Tasks:</strong> Technical work, often invisible to users</li>
      </ul>

      <h4>Should You Include Tasks?</h4>
      <p>
        Usually <strong>yes</strong>. Tasks represent real work your team does. Excluding
        them underestimates total effort and may hide important work patterns.
      </p>

      <h4>Task Usage Varies by Team</h4>
      <p>
        Different teams use Tasks differently:
      </p>
      <ul>
        <li>Some use Tasks for all non-Story work</li>
        <li>Some use Tasks as breakdown items within Stories</li>
        <li>Some rarely use Tasks, preferring Stories or Sub-tasks</li>
      </ul>
      <p>
        Consider your team's conventions when deciding.
      </p>
    </>
  ),

  epicType: (
    <>
      <h4>What is an Epic?</h4>
      <p>
        An <strong>Epic</strong> is a large body of work that can be broken down into
        multiple smaller Stories or Tasks. Think of it as a container or theme that
        groups related work items together.
      </p>

      <h4>Examples of Epics</h4>
      <ul>
        <li>"User Authentication System" (contains login, password reset, 2FA stories)</li>
        <li>"Mobile App Redesign" (contains UI update stories for each screen)</li>
        <li>"Payment Gateway Integration" (contains all payment-related work)</li>
        <li>"Q3 Performance Optimization" (contains various performance tasks)</li>
      </ul>

      <h4>Epic Hierarchy</h4>
      <pre style={{ backgroundColor: '#F4F5F7', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
{`Epic: User Authentication
├── Story: Login page
├── Story: Password reset
├── Story: Two-factor auth
└── Story: Session management`}
      </pre>

      <h4>Should You Include Epics?</h4>
      <p>
        <strong>It depends</strong> on how your team uses them:
      </p>
      <ul>
        <li><strong>Include</strong> if: Epics are actively managed, updated, and represent work your team owns</li>
        <li><strong>Exclude</strong> if: Epics are just organizational containers that aren't actively worked on</li>
      </ul>

      <h4>Epics and Stale Thresholds</h4>
      <p>
        Epics often have longer stale thresholds (14-30 days) because they're meant to
        span multiple sprints. A "stale" Epic might just be one where the child Stories
        are being worked on but the Epic itself wasn't updated.
      </p>
    </>
  ),

  subtaskType: (
    <>
      <h4>What is a Sub-task?</h4>
      <p>
        A <strong>Sub-task</strong> is a small piece of work that exists within a parent
        issue (usually a Story or Task). Sub-tasks break down larger items into specific,
        trackable pieces.
      </p>

      <h4>Examples of Sub-tasks</h4>
      <p>
        Parent Story: "As a user, I can reset my password via email"
      </p>
      <ul>
        <li>Sub-task: "Create password reset email template"</li>
        <li>Sub-task: "Implement token generation and validation"</li>
        <li>Sub-task: "Build password reset form UI"</li>
        <li>Sub-task: "Write unit tests for reset flow"</li>
        <li>Sub-task: "Update user documentation"</li>
      </ul>

      <h4>Sub-tasks vs. Other Types</h4>
      <ul>
        <li><strong>Sub-tasks:</strong> Always have a parent, can't exist independently</li>
        <li><strong>Tasks:</strong> Stand alone, no parent required</li>
        <li><strong>Stories:</strong> Usually larger, may have Sub-tasks as children</li>
      </ul>

      <h4>Should You Include Sub-tasks?</h4>
      <p>
        Consider your team's workflow:
      </p>
      <ul>
        <li><strong>Include</strong> if: Sub-tasks are actively tracked and represent meaningful work chunks</li>
        <li><strong>Exclude</strong> if: Sub-tasks are very granular (checklists) or rarely used</li>
        <li><strong>Exclude</strong> if: You'd be double-counting work (parent + sub-tasks)</li>
      </ul>

      <h4>Common Pattern</h4>
      <p>
        Many teams exclude sub-tasks from the primary analysis because the parent Story
        or Task already captures the work. Including both could inflate issue counts.
      </p>
    </>
  ),

  detectedFromJiraBadge: (
    <>
      <h4>What Does "Detected from Jira" Mean?</h4>
      <p>
        This badge indicates that the system automatically detected these issue types by
        analyzing your Jira project. You don't need to configure anything – we found what's
        already being used.
      </p>

      <h4>How Detection Works</h4>
      <ul>
        <li>We scan your selected team's Jira board or project</li>
        <li>We identify which issue types have been used in the analysis period</li>
        <li>We pre-select those types for inclusion</li>
      </ul>

      <h4>Can I Override the Detection?</h4>
      <p>
        <strong>Yes!</strong> The detected types are suggestions based on your data. You can:
      </p>
      <ul>
        <li>Deselect types you want to exclude</li>
        <li>Keep some types and remove others</li>
        <li>Add types that weren't detected (if they exist in Jira)</li>
      </ul>

      <h4>What if a Type Isn't Detected?</h4>
      <p>
        If an issue type exists in Jira but isn't shown, it means there were no issues of
        that type in your analysis period for this team. If you expect to use that type
        going forward, you may still want to include it.
      </p>
    </>
  ),
};

// ============================================================================
// WIZARD STEP 6: SPRINT CADENCE
// ============================================================================

export const WizardStep6Help = {
  sprintLengthSection: (
    <>
      <h4>What is Sprint Length?</h4>
      <p>
        <strong>Sprint length</strong> is the duration of your sprint or iteration cycle.
        Most teams use 1, 2, 3, or 4 week sprints. The choice affects planning, velocity
        measurement, and delivery cadence.
      </p>

      <h4>Common Sprint Lengths</h4>
      <ul>
        <li>
          <strong>1 week:</strong> Fast feedback, frequent releases. Good for teams with
          urgent work or high change frequency. Can feel rushed.
        </li>
        <li>
          <strong>2 weeks:</strong> Most popular choice. Balances planning overhead with
          delivery frequency. Good for most teams.
        </li>
        <li>
          <strong>3 weeks:</strong> Slightly more breathing room. Good when work items are
          larger or dependencies are complex.
        </li>
        <li>
          <strong>4 weeks:</strong> Longer planning horizon. Suits teams with complex work
          or coordinated releases. Risk of less frequent feedback.
        </li>
      </ul>

      <h4>Non-Sprint Teams</h4>
      <p>
        If you use Kanban or don't have fixed sprints, select the cycle length that
        best represents your typical delivery rhythm (e.g., how often you typically
        release or review work).
      </p>
    </>
  ),

  sprintConcept: (
    <>
      <h4>What is a Sprint?</h4>
      <p>
        A <strong>Sprint</strong> (also called an "iteration") is a fixed time period –
        typically 1-4 weeks – during which a team commits to completing a specific set
        of work. Sprints are central to Scrum, one of the most popular agile methodologies.
      </p>

      <h4>The Sprint Cycle</h4>
      <ol>
        <li><strong>Sprint Planning:</strong> Team selects work items from the backlog</li>
        <li><strong>Sprint Execution:</strong> Team works to complete the committed items</li>
        <li><strong>Daily Standup:</strong> Brief daily sync on progress and blockers</li>
        <li><strong>Sprint Review:</strong> Demo completed work to stakeholders</li>
        <li><strong>Sprint Retrospective:</strong> Reflect on what went well and what to improve</li>
      </ol>

      <h4>What if We Don't Use Sprints?</h4>
      <p>
        Not all teams work in sprints. If you use <strong>Kanban</strong> or another
        continuous flow approach:
      </p>
      <ul>
        <li>You don't have fixed time boxes</li>
        <li>Work is pulled as capacity allows</li>
        <li>Focus is on flow efficiency rather than sprint commitment</li>
      </ul>
      <p>
        For Kanban teams, select the cadence that best matches your typical delivery
        rhythm or review cycle (often "2 weeks" or "Monthly").
      </p>

      <h4>Why Sprint Cadence Matters</h4>
      <p>
        The assessment uses your sprint cadence to:
      </p>
      <ul>
        <li>Calculate velocity (output per sprint)</li>
        <li>Measure sprint completion rates</li>
        <li>Identify carry-over patterns</li>
        <li>Calibrate stale thresholds appropriately</li>
      </ul>
    </>
  ),

  oneWeekOption: (
    <>
      <h4>1-Week Sprints</h4>
      <p>
        <strong>One-week sprints</strong> provide the fastest feedback loop. You plan,
        execute, and review every single week.
      </p>

      <h4>Advantages</h4>
      <ul>
        <li><strong>Rapid feedback:</strong> Learn and adjust every week</li>
        <li><strong>Quick course correction:</strong> Problems are caught early</li>
        <li><strong>Good for uncertainty:</strong> When requirements change frequently</li>
        <li><strong>Lower commitment risk:</strong> Only committing to one week at a time</li>
      </ul>

      <h4>Challenges</h4>
      <ul>
        <li><strong>High ceremony overhead:</strong> Planning, review, retro every week</li>
        <li><strong>Limited story size:</strong> Work must fit within one week</li>
        <li><strong>Can feel rushed:</strong> Less time for deep work</li>
        <li><strong>Context switching:</strong> Frequent transitions between ceremonies and work</li>
      </ul>

      <h4>Best For</h4>
      <ul>
        <li>Teams with rapidly changing priorities</li>
        <li>Support or operations teams</li>
        <li>Early-stage products needing fast iteration</li>
        <li>Teams learning agile (shorter loops for learning)</li>
      </ul>
    </>
  ),

  twoWeekOption: (
    <>
      <h4>2-Week Sprints</h4>
      <p>
        <strong>Two-week sprints</strong> are the most common choice, offering a balance
        between feedback speed and execution depth.
      </p>

      <h4>Advantages</h4>
      <ul>
        <li><strong>Industry standard:</strong> Most agile teams use this cadence</li>
        <li><strong>Balanced overhead:</strong> Ceremonies don't dominate the calendar</li>
        <li><strong>Reasonable story sizing:</strong> Room for medium-complexity work</li>
        <li><strong>Good for planning:</strong> Stakeholders can predict roughly when work ships</li>
      </ul>

      <h4>Challenges</h4>
      <ul>
        <li><strong>Mid-sprint changes:</strong> Two weeks is long enough for priorities to shift</li>
        <li><strong>Estimation pressure:</strong> Must estimate accurately for 2 weeks</li>
        <li><strong>Carry-over risk:</strong> Incomplete work affects next sprint</li>
      </ul>

      <h4>Best For</h4>
      <ul>
        <li>Most product development teams</li>
        <li>Teams with somewhat predictable work</li>
        <li>Organizations wanting standardization</li>
        <li>Teams coordinating with other 2-week teams</li>
      </ul>

      <h4>Recommendation</h4>
      <p>
        If you're unsure which to choose, <strong>start with 2 weeks</strong>. It's the
        most common for good reason, and you can adjust later if needed.
      </p>
    </>
  ),

  cadenceChangeToggle: (
    <>
      <h4>Why Track Cadence Changes?</h4>
      <p>
        If your team recently changed sprint length (e.g., from 1 week to 2 weeks), the
        historical data includes periods with different rhythms. This affects how we
        interpret metrics.
      </p>

      <h4>Impact of Cadence Changes</h4>
      <p>
        When sprint length changes:
      </p>
      <ul>
        <li><strong>Velocity comparisons:</strong> A 2-week velocity can't be compared directly to 1-week velocity</li>
        <li><strong>Trend lines:</strong> There's a discontinuity at the change point</li>
        <li><strong>Historical patterns:</strong> Old patterns may not predict new behavior</li>
      </ul>

      <h4>How We Handle Changes</h4>
      <p>
        When you tell us about a cadence change:
      </p>
      <ul>
        <li>We normalize data across the transition</li>
        <li>We note the transition in the report</li>
        <li>We weight recent data more heavily</li>
        <li>We avoid misleading comparisons across the change</li>
      </ul>

      <h4>When to Enable This</h4>
      <ul>
        <li>You changed sprint length in the last 6 months</li>
        <li>The change happened during your analysis period</li>
        <li>You want the most accurate analysis possible</li>
      </ul>

      <h4>When to Skip This</h4>
      <ul>
        <li>Your cadence has been stable for 6+ months</li>
        <li>You don't remember exactly when a change happened</li>
        <li>You want a simpler setup</li>
      </ul>
    </>
  ),
};

// ============================================================================
// WIZARD STEP 8: STALE THRESHOLDS
// ============================================================================

export const WizardStep8Help = {
  staleThresholdsSection: (
    <>
      <h4>What Are Stale Thresholds?</h4>
      <p>
        A <strong>stale threshold</strong> is the number of days an issue can remain
        unchanged before it's flagged as potentially stuck or forgotten. Different issue
        types often need different thresholds.
      </p>

      <h4>Why Different Thresholds?</h4>
      <ul>
        <li>
          <strong>Bugs (5-7 days):</strong> Defects should be addressed quickly. A week
          without activity usually means the bug is deprioritized or blocked.
        </li>
        <li>
          <strong>Stories/Tasks (7-14 days):</strong> Active development work should
          show progress at least every sprint.
        </li>
        <li>
          <strong>Epics (14-30 days):</strong> Larger initiatives move more slowly,
          but should still show regular updates.
        </li>
      </ul>

      <h4>What Happens to Stale Issues?</h4>
      <p>
        Issues flagged as stale appear in your health assessment report. This is purely
        informational – nothing happens to the issues in Jira. It's a signal to review
        and decide if action is needed.
      </p>
    </>
  ),

  staleConcept: (
    <>
      <h4>Understanding "Stale" Issues</h4>
      <p>
        An issue becomes <strong>"stale"</strong> when it hasn't been updated for a certain
        number of days. Think of it like milk in your refrigerator – after a certain time
        without use, it's worth checking if it's still good.
      </p>

      <h4>How Staleness is Calculated</h4>
      <p>
        The system looks at each issue's "Last Updated" timestamp and compares it to today.
        If the difference exceeds your threshold, the issue is flagged as stale.
      </p>
      <p>
        The timestamp updates when anyone:
      </p>
      <ul>
        <li>Adds or edits a comment</li>
        <li>Changes the status (To Do → In Progress → Done)</li>
        <li>Updates any field (assignee, description, priority, etc.)</li>
        <li>Logs work or time</li>
        <li>Creates or removes a link to another issue</li>
      </ul>

      <h4>Why Track Stale Issues?</h4>
      <p>
        Stale issues often indicate problems that aren't visible otherwise:
      </p>
      <ul>
        <li><strong>Blocked work:</strong> Someone is stuck and hasn't escalated</li>
        <li><strong>Forgotten tasks:</strong> Work that slipped through the cracks</li>
        <li><strong>Unclear requirements:</strong> Issues that can't move forward</li>
        <li><strong>Priority confusion:</strong> Work that's no longer important</li>
        <li><strong>Capacity issues:</strong> Too much work, not enough people</li>
      </ul>

      <h4>What Happens to Stale Issues?</h4>
      <p>
        Issues flagged as stale appear in the "Stale Items" section of your health report.
        They're not automatically fixed – this is about visibility, not automation.
      </p>
      <p>
        When reviewing stale items, you can:
      </p>
      <ul>
        <li>Update them if they're still relevant</li>
        <li>Close them if they're no longer needed</li>
        <li>Investigate why they went stale</li>
        <li>Reassign if the original assignee is unavailable</li>
      </ul>
    </>
  ),

  daysUnit: (
    <>
      <h4>Understanding "Days" in Thresholds</h4>
      <p>
        When you enter a number of days, the system uses <strong>calendar days</strong>,
        not working days. This means weekends and holidays count.
      </p>

      <h4>Calendar Days vs. Working Days</h4>
      <ul>
        <li><strong>Calendar days:</strong> All days, including weekends (7 days = 1 week)</li>
        <li><strong>Working days:</strong> Only Monday-Friday (5 days = 1 week)</li>
      </ul>
      <p>
        Using calendar days is simpler and more universal, since different teams may have
        different weekend/holiday schedules.
      </p>

      <h4>Practical Examples</h4>
      <ul>
        <li>"7 days" = 1 calendar week (including a weekend)</li>
        <li>"14 days" = 2 calendar weeks</li>
        <li>"5 days" = Less than a week (if set Friday, triggers by Wednesday)</li>
      </ul>

      <h4>Accounting for Weekends</h4>
      <p>
        Since weekends count, a threshold of "5 days" might flag issues that went stale
        over a weekend. If this is a concern, consider using 7 days as your minimum –
        this allows for a full week including weekend.
      </p>

      <h4>Time Zones</h4>
      <p>
        Day calculations use the server's timezone. If your team spans multiple time zones,
        there might be minor variations in when exactly an issue becomes "stale."
      </p>
    </>
  ),

  enableDisableToggle: (
    <>
      <h4>Enabling and Disabling Issue Types</h4>
      <p>
        For each issue type, you can toggle whether to track staleness. Disabling an
        issue type means it won't be included in stale item analysis.
      </p>

      <h4>When to Disable an Issue Type</h4>
      <ul>
        <li><strong>Not used:</strong> Your team doesn't use this type</li>
        <li><strong>Different workflow:</strong> This type has a fundamentally different lifecycle</li>
        <li><strong>Already tracking elsewhere:</strong> You have another system for these items</li>
        <li><strong>Intentionally long-lived:</strong> These items are meant to sit for extended periods</li>
      </ul>

      <h4>Common Configurations</h4>
      <ul>
        <li><strong>Most teams:</strong> Enable Story, Bug, Task; sometimes disable Epic</li>
        <li><strong>Support teams:</strong> Enable Bug, Task; may disable Story, Epic</li>
        <li><strong>Platform teams:</strong> Enable Task, Story; may have longer thresholds for Epic</li>
      </ul>

      <h4>Impact of Disabling</h4>
      <p>
        Disabled issue types:
      </p>
      <ul>
        <li>Won't appear in stale item lists</li>
        <li>Won't affect your "Stale Items" health dimension score</li>
        <li>Will still appear in other parts of the analysis (velocity, etc.)</li>
      </ul>
    </>
  ),
};

// ============================================================================
// WIZARD: REPORT OPTIONS
// ============================================================================

export const WizardReportOptionsHelp = {
  reportContentSection: (
    <>
      <h4>What Are Report Options?</h4>
      <p>
        Report options let you customize what information appears in your health assessment
        report. You can include or exclude various sections based on what's most relevant.
      </p>

      <h4>Available Options</h4>
      <ul>
        <li>
          <strong>Trend Analysis:</strong> Show how metrics have changed over the analysis
          period. Helpful for seeing improvement or decline.
        </li>
        <li>
          <strong>Detailed Descriptions:</strong> Include explanations of what each
          dimension measures and how scores are calculated.
        </li>
        <li>
          <strong>"Why It Matters" Sections:</strong> Explain the practical impact of
          each dimension and why improving it benefits your team.
        </li>
        <li>
          <strong>Comparisons on Cards:</strong> Show how your team compares to benchmarks
          directly on each health indicator card.
        </li>
      </ul>

      <h4>Recommendations</h4>
      <p>
        For your first assessment, we recommend enabling all options to get the most
        comprehensive view. For repeat assessments, you might focus on specific areas.
      </p>
    </>
  ),
};

// ============================================================================
// WIZARD: REVIEW STEP
// ============================================================================

export const WizardReviewHelp = {
  runAssessment: (
    <>
      <h4>What Happens When You Run the Assessment?</h4>
      <p>
        Clicking "Run Assessment" starts the analysis of your Jira data. The system will:
      </p>
      <ol>
        <li>Connect to Jira and retrieve data for your selected time range</li>
        <li>Analyze patterns across the issue types you selected</li>
        <li>Calculate health scores across all dimensions</li>
        <li>Generate comparison data if you selected benchmark teams</li>
        <li>Prepare your health report</li>
      </ol>

      <h4>How Long Does It Take?</h4>
      <p>
        Typically 1-3 minutes depending on the amount of data and the analysis period.
        You'll see a progress indicator while the assessment runs.
      </p>

      <h4>Can I Cancel?</h4>
      <p>
        Yes, you can cancel the assessment while it's running. Your configuration will
        be saved so you can run it again later.
      </p>
    </>
  ),
};

export default {
  AdminDefaultsHelp,
  AdminUsersHelp,
  AdminOrgStructureHelp,
  AdminOrgHierarchyHelp,
  AdminAnalyticsHelp,
  WizardStep1Help,
  WizardStep2Help,
  WizardStep4Help,
  WizardStep6Help,
  WizardStep8Help,
  WizardReportOptionsHelp,
  WizardReviewHelp,
};
