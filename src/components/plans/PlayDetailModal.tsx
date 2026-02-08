// PlayDetailModal - Atlassian Team Playbook style
// Completely redesigned to match actual Atlassian playbook pages

import React, { useState } from 'react';
import {
  PlanPlay,
  PlayStatus,
  TaskStatus,
  getPlayStatusColor,
  getTaskProgress,
  getPriorityColor,
  getPriorityShortLabel,
  getInterventionTypeLabel,
  getInterventionTypeColor,
} from '../../types/improvementPlan';
import { normalizePlanPlay } from '../../utils/improvementPlanUtils';

type ContentTab = 'about' | 'instructions';

interface PlayDetailModalProps {
  isOpen: boolean;
  play: PlanPlay;
  onClose: () => void;
  onStatusChange: (status: PlayStatus) => void;
  onAddTask: (title: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onNotesChange?: (notes: string) => void;
  onNavigateToDimension?: (dimensionKey: string) => void;
}

// ============================================================================
// PLAY CONTENT - Real, detailed play definitions
// ============================================================================

interface PlayStep {
  title: string;
  duration: string;
  content: string; // Full rich content, not just a description
}

interface PlayTemplate {
  name: string;
  type: 'confluence' | 'trello' | 'jira' | 'miro' | 'spreadsheet';
  description: string;
}

interface ImpactChain {
  dimensionExplanation: string; // How this play specifically improves the dimension
  outcomeConnections: {
    outcomeName: string;
    icon: string;
    explanation: string; // How improving this dimension helps this outcome
  }[];
}

interface PlayContent {
  title: string;
  tagline: string;
  heroColor: string;

  prepTime: string;
  runTime: string;
  teamSize: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';

  fiveSecondSummary: string[];

  // Impact explanation
  impactChain: ImpactChain;

  whatIsIt: string;
  whyDoIt: string;
  whenToUse: string;

  remoteSetup: string[];
  inPersonSetup: string[];

  steps: PlayStep[];

  templates: PlayTemplate[];

  variations: { name: string; description: string }[];

  followUp: string;

  watchOutFor: string[];

  relatedPlays: { title: string; tagline: string }[];
}

// ============================================================================
// PLAY LIBRARY
// ============================================================================

const PLAY_CONTENT: Record<string, PlayContent> = {

  'sprint-planning': {
    title: 'Fix Your Sprint Planning',
    tagline: 'Stop the chaos. Start sprints with clarity and confidence.',
    heroColor: 'linear-gradient(135deg, #00875A 0%, #36B37E 100%)',

    prepTime: '30 min',
    runTime: '2 hours',
    teamSize: 'Whole team',
    difficulty: 'Medium',

    fiveSecondSummary: [
      'Figure out why your planning meetings suck',
      'Create a "definition of ready" that actually gets enforced',
      'Run a planning session that ends on time with a realistic commitment',
    ],

    impactChain: {
      dimensionExplanation: 'When planning is chaotic, teams commit to work they don\'t understand. This play forces you to only accept estimated, refined stories into the sprint—so every commitment is grounded in reality, not hope.',
      outcomeConnections: [
        {
          outcomeName: 'Planning Accuracy',
          icon: '🎯',
          explanation: 'Realistic commitments = predictable sprints. Stakeholders learn to trust your estimates.'
        },
        {
          outcomeName: 'Delivery Commitments',
          icon: '📦',
          explanation: 'When you only commit to ready work, you actually finish what you start. No more "80% done" rollovers.'
        },
        {
          outcomeName: 'Team Sustainability',
          icon: '💚',
          explanation: 'No more death marches to hit impossible targets. Teams that plan well don\'t burn out.'
        },
      ]
    },

    whatIsIt: `Sprint planning is supposed to be the moment where your team aligns on what they'll deliver. Instead, for most teams, it's become a bloated, frustrating ritual where people zone out while the product owner reads story descriptions aloud, developers realize nothing is actually ready to work on, and everyone commits to way more than they can deliver.

This play is an intervention. It's not about tweaking your agenda or adding a new template. It's about fundamentally examining why your planning is broken and fixing the root causes. You'll walk out with a concrete plan to run planning sessions that actually work.`,

    whyDoIt: `Bad planning has a compounding cost. When you over-commit, you either burn out the team trying to hit an unrealistic target, or you miss the commitment and erode trust with stakeholders. When stories aren't ready, you waste sprint capacity on "discovery" that should have happened in refinement. When the wrong people are in the room, decisions get made without input and then reversed mid-sprint.

The teams that get planning right don't just have better sprints—they have less stress, more predictable delivery, and stakeholders who actually trust their commitments. That trust is worth everything.`,

    whenToUse: `Run this play if any of these sound familiar:

• Your planning meetings regularly exceed 2 hours
• You've had to "rollover" incomplete work for the last 3+ sprints
• Developers frequently say "I don't understand this story" after planning
• Your Product Owner is preparing stories the night before planning
• People openly check out (laptops open, cameras off) during planning
• You've lost credibility with stakeholders on your delivery commitments`,

    remoteSetup: [
      'Video conferencing with everyone\'s camera on (this matters)',
      'Jira or your backlog tool visible to everyone',
      'A shared doc for capturing the "parking lot" and action items',
      'Planning poker tool if you estimate during planning',
    ],
    inPersonSetup: [
      'Room with a large display showing the backlog',
      'Physical planning poker cards',
      'Sticky notes for the parking lot',
      'A visible timer (phone timer on the TV works)',
    ],

    steps: [
      {
        title: 'Pre-work: Audit your last 5 sprints',
        duration: '30 min before the session',
        content: `Before you can fix planning, you need to understand what's actually broken. Pull up your last 5 sprints and answer these questions:

**Commitment accuracy**: What percentage of planned stories were completed? If it's below 70%, you're over-committing. If it's above 95%, you might be sandbagging.

**Rollover patterns**: Which stories rolled over? Look for patterns—are they always the same type of work (e.g., bugs, integrations, stories from a particular epic)?

**Scope changes**: How many stories were added mid-sprint? How many were removed? Some change is normal, but if more than 20% of your sprint was unplanned, that's a planning problem.

**Planning duration**: How long did each planning session take? Track this against your commitment accuracy—longer doesn't mean better.

Write these numbers down. You'll share them with the team.`
      },
      {
        title: 'Name your planning dysfunction',
        duration: '20 min',
        content: `Share the data you gathered with the team. Don't editorialize—just present the numbers. Then ask: "What do you think is causing this?"

Give everyone 3 minutes of silent writing time to jot down their hypotheses. This prevents the loudest person from anchoring the discussion.

Go around the room and have each person share their top hypothesis. You'll likely hear things like:
- "Stories aren't ready when they hit planning"
- "We always commit to what the PO wants, not what we can do"
- "Half the team doesn't pay attention"
- "We don't account for support tickets and meetings"

Cluster similar items. Vote on the top 2-3 issues to address. You can't fix everything at once—pick the biggest levers.`
      },
      {
        title: 'Create your Definition of Ready',
        duration: '25 min',
        content: `A Definition of Ready (DoR) is a checklist that stories must pass before they can enter sprint planning. This is your first line of defense against "stories aren't ready."

Start with these basics and customize:

**Must have:**
- Clear acceptance criteria (not just "make the button work")
- Estimated by the team (or at least discussed in refinement)
- No unresolved questions or dependencies
- Small enough to complete in one sprint

**Consider adding:**
- UX designs attached (if applicable)
- API contracts defined (for integration work)
- Test scenarios outlined

Here's the critical part: **Decide what happens when a story doesn't meet the DoR.** The default should be "it doesn't enter the sprint." Period. If you make exceptions, the DoR becomes meaningless within a month.

Create a Jira filter or label for "Ready for Sprint" and commit to using it as your planning input, not the whole backlog.`
      },
      {
        title: 'Redesign your planning ceremony',
        duration: '25 min',
        content: `Now design how planning will actually run. Here's a structure that works for a 2-hour timebox:

**0:00-0:15 — Sprint goal and context** (PO leads)
What's the most important thing we need to achieve? What's the business context? This should be a conversation, not a monologue. If developers don't understand *why* something matters, they can't make good tradeoff decisions.

**0:15-0:30 — Capacity check** (Scrum Master leads)
Who's out? Who's on-call? What percentage of time is *actually* available for sprint work? Be honest—if your team only has 60% of their time for sprint work due to support, meetings, and other obligations, plan for 60%. Track your actual capacity over time so this becomes data-driven, not a guess.

**0:30-1:30 — Story review** (whole team)
Go through each candidate story. For each one:
- PO gives a 2-minute max context
- Team asks clarifying questions (5 min max)
- Quick gut check: "Can we commit to this?"
- If yes, it goes in the sprint. If not, discuss or defer.

Stop when you hit capacity. Don't negotiate on capacity—negotiate on scope.

**1:30-1:50 — Dependency and risk check**
Look at the whole sprint: What depends on what? What could go wrong? Identify your riskiest story and discuss how you'll know early if it's in trouble.

**1:50-2:00 — Commitment and close**
Read back the sprint goal and the stories. Get explicit verbal commitment: "Can everyone commit to this plan?" If anyone says no, address it now, not on day 3.`
      },
      {
        title: 'Run your first improved planning',
        duration: 'Next sprint planning',
        content: `Now run planning using your new structure. Some tips for the first time:

**Assign a timekeeper.** Someone's only job is to watch the clock and interrupt when time's up. This feels awkward but prevents the meeting from ballooning.

**Enforce the DoR.** When a story comes up that's not ready, don't say "well, let's plan it anyway." Say "this doesn't meet our DoR, it can't enter the sprint." This will feel harsh. Do it anyway. One sprint of pain will motivate everyone to do refinement properly.

**Undershoot your commitment.** For your first sprint with the new process, deliberately commit to less than you think you can do. It's easier to pull in extra work than to scramble when you're behind.

**End on time.** Even if you're not "done," end on time. If you consistently can't finish planning in your timebox, that's a signal that your stories aren't ready or your backlog is too big.

After the sprint, measure: Did you finish on time? Did you hit your commitment? Share this data in the retrospective.`
      },
    ],

    templates: [
      { name: 'Definition of Ready template', type: 'confluence', description: 'Starting point for your DoR with common criteria' },
      { name: 'Sprint Planning agenda', type: 'confluence', description: 'Time-boxed agenda you can customize' },
      { name: 'Capacity calculator', type: 'spreadsheet', description: 'Simple spreadsheet to calculate real capacity' },
    ],

    variations: [
      {
        name: 'Async-first planning',
        description: 'For distributed teams across time zones: Do story review async (PO records Loom videos for each story, team adds questions in comments). Use sync time only for capacity planning, dependency check, and commitment.'
      },
      {
        name: 'Two-part planning',
        description: 'Split planning into two sessions: Part 1 (1 hour) covers goal, capacity, and high-level story selection. Part 2 (1 hour, next day) covers detailed task breakdown and risk identification. Gives people time to think.'
      },
    ],

    followUp: `After your improved planning session, track these metrics:

**Planning efficiency**: Time spent in planning ÷ number of stories planned. Should decrease over time as stories get better prepared.

**Commitment accuracy**: % of stories completed vs. committed. Target 80-90%. Below 70% means you're still over-committing. Above 95% might mean you're sandbagging.

**Mid-sprint churn**: Stories added or removed mid-sprint. Should be less than 15% of your sprint.

Review these metrics in your retrospective every sprint. Planning improvement is iterative—expect to tune your approach for 3-4 sprints before it feels natural.`,

    watchOutFor: [
      'Making the DoR so strict that nothing ever qualifies. Start with 3-4 basic criteria and add more only when you have evidence you need them.',
      'Letting the PO override the DoR "just this once." Once you make an exception, the DoR is dead. Hold the line.',
      'Using planning to do refinement. If you\'re explaining stories from scratch in planning, your refinement process is broken.',
      'Committing to what stakeholders want instead of what you can deliver. Over-promising destroys trust faster than under-promising.',
      'Skipping the commitment question. Don\'t assume silence is agreement. Ask explicitly and wait for verbal confirmation.',
    ],

    relatedPlays: [
      { title: 'Backlog Refinement Reset', tagline: 'Fix the input to planning' },
      { title: 'Estimation Calibration', tagline: 'Make your estimates reliable' },
      { title: 'Team Working Agreements', tagline: 'Formalize how you work together' },
    ],
  },

  'backlog-refinement': {
    title: 'Backlog Refinement That Actually Works',
    tagline: 'Stop refinement from being a waste of everyone\'s time.',
    heroColor: 'linear-gradient(135deg, #0052CC 0%, #4C9AFF 100%)',

    prepTime: '20 min',
    runTime: '1 hour per session',
    teamSize: '3-5 people',
    difficulty: 'Easy',

    fiveSecondSummary: [
      'Audit your backlog and purge the garbage',
      'Set up a sustainable refinement cadence',
      'Create a "refined" standard that makes planning easy',
    ],

    impactChain: {
      dimensionExplanation: 'Poor refinement = unestimated stories entering sprints. This play ensures every story has been discussed, broken down, and sized before it ever hits planning—making estimates meaningful instead of made-up.',
      outcomeConnections: [
        {
          outcomeName: 'Planning Accuracy',
          icon: '🎯',
          explanation: 'Estimates made during proper refinement are 3x more accurate than planning-day guesses.'
        },
        {
          outcomeName: 'Delivery Commitments',
          icon: '📦',
          explanation: 'When developers understand work before starting, they finish it. No mid-sprint "this is bigger than we thought."'
        },
      ]
    },

    whatIsIt: `Backlog refinement is where stories go from vague ideas to actionable work. When it works, sprint planning takes 30 minutes because everything is ready. When it doesn't work, you have a 500-item backlog of half-baked ideas, planning takes 3 hours, and developers start work on stories they don't understand.

This play is about building a refinement practice that actually produces ready stories without consuming everyone's time. The goal is to spend less time total on preparation by doing it more systematically.`,

    whyDoIt: `Every minute you spend in refinement saves multiple minutes in planning and execution. A well-refined story takes 10 minutes to discuss in planning. A poorly-refined story takes 45 minutes of discovery mid-sprint, interruptions to ask the PO questions, and often gets rolled over because it turned out to be bigger than expected.

Beyond efficiency, good refinement reduces developer frustration. Nothing burns out a team faster than starting work and immediately hitting a wall of "wait, what is this actually supposed to do?"`,

    whenToUse: `You need this play if:

• Sprint planning regularly exceeds 2 hours
• Developers frequently say "this story isn't ready" in planning
• Your backlog has more than 100 items
• You have items in your backlog that haven't been touched in 6+ months
• Estimates are often wildly off because stories weren't properly understood
• Your PO is doing refinement alone and then presenting stories to the team`,

    remoteSetup: [
      'Video call with screen sharing',
      'Backlog visible to everyone',
      'Shared doc for capturing questions and decisions',
    ],
    inPersonSetup: [
      'Room with a display showing the backlog',
      'Whiteboard for sketching',
      'Sticky notes for tracking blockers',
    ],

    steps: [
      {
        title: 'Audit your backlog',
        duration: '45 min',
        content: `Before you can refine your backlog, you need to see how bad it is. Run these queries:

**Total items**: How many items are in your backlog? If it's over 100, you have too many. You cannot meaningfully prioritize 100+ things.

**Stale items**: How many items haven't been updated in 6 months? These are probably garbage. Nobody is going to work on them. They're just cluttering your view and making prioritization harder.

**In-progress ghosts**: How many items are "In Progress" but haven't been updated in 30+ days? These are lies. They're not in progress. Someone started them, got pulled away, and forgot.

**Unestimated items**: How many items in your top 30 have no estimate? These aren't ready.

**Results should scare you.** Most teams find they have 200+ items, 40% are stale, and less than half of their "ready" backlog is actually ready. Write these numbers down—they're your baseline.`
      },
      {
        title: 'Purge ruthlessly',
        duration: '30 min',
        content: `Now clean house. This is emotionally hard—it feels like throwing away work. Do it anyway.

**Stale items (no updates in 6+ months)**: Close them all. Use a resolution like "Won't Do - Stale" so you can find them later if needed. If they were important, someone would have touched them in 6 months. They weren't.

**In-progress ghosts**: Move them back to the backlog or close them. An item that's been "in progress" for 3 months isn't in progress.

**Duplicates and near-duplicates**: Search for similar items and consolidate. Most backlogs have 5 variations of "improve the search feature."

**Vague wishes**: Items like "make the app faster" or "improve UX" with no further detail should be closed or converted to epics. They're not actionable.

Your backlog should be under 100 items when you're done. If it's not, you're not being ruthless enough.`
      },
      {
        title: 'Define "refined"',
        duration: '20 min',
        content: `Create a checklist for what makes a story "refined" and ready for sprint planning. This becomes your contract between the PO and the development team.

**Suggested criteria:**

1. **Clear "done" state**: Anyone can read this story and know exactly when it's complete. Not "improve performance" but "page load time under 2 seconds on 3G."

2. **Acceptance criteria**: Specific, testable conditions. Written in Given/When/Then format if that helps your team.

3. **Estimated**: The team has discussed this story and put a number on it. The estimate doesn't have to be perfect, but the discussion exposes unknowns.

4. **Dependencies identified**: If this story needs anything from another team, API, or system, that's called out explicitly.

5. **Small enough**: Can be completed in one sprint by one developer. If not, break it down.

6. **Questions answered**: Any open questions from previous discussions have been resolved.

Create a "Refined" label or status in Jira. Only stories with this label can enter sprint planning.`
      },
      {
        title: 'Set your cadence',
        duration: '15 min',
        content: `Refinement should be regular and predictable. Here's what works:

**Frequency**: 1-2 sessions per week, totaling about 10% of sprint capacity. For a 2-week sprint, that's 4-8 hours total, split across 2-4 sessions.

**Timing**: Mid-week works best. Monday is too early (PO hasn't thought about the week yet), Friday is too late (no time to follow up on blockers).

**Duration**: 1 hour max per session. After an hour, quality drops. Better to do two 1-hour sessions than one 2-hour session.

**Who attends**: Product Owner (required), 2-3 developers (rotating is fine), anyone with domain expertise for the stories being discussed. Not the whole team—that's expensive and unnecessary.

**What gets discussed**: Stories in priority order that don't yet meet your "refined" criteria. Usually the next 2 sprints worth of work.

Schedule your refinement sessions as recurring meetings. Treat them as sacred—don't skip them when things get busy (that's when you need them most).`
      },
      {
        title: 'Run effective refinement sessions',
        duration: 'Ongoing',
        content: `Here's how to run a refinement session that doesn't suck:

**Before the session (PO does this):**
- Select 5-8 stories to discuss, in priority order
- Write initial acceptance criteria for each
- Identify any questions you already know about
- Send the list to attendees 24 hours ahead

**During the session:**
For each story:
1. PO gives 2-minute context: What and why
2. Team asks questions: What's unclear? What's missing?
3. Discussion: Technical approach, edge cases, risks
4. Decision: Is this refined? If not, what's needed?
5. Estimate (optional—some teams do this in planning instead)

Time-box each story to 10 minutes. If you can't refine it in 10 minutes, it's too big or too unclear. Capture the blocker and move on.

**After the session:**
- PO updates stories based on discussion
- Blockers get assigned to owners
- Updated stories get the "Refined" label

**The goal**: Maintain a buffer of 2 sprints worth of refined stories. If your buffer drops, add more refinement sessions. If it's overflowing, refine less.`
      },
    ],

    templates: [
      { name: 'Story refinement checklist', type: 'jira', description: 'Custom field checklist for "refined" criteria' },
      { name: 'Backlog cleanup JQL queries', type: 'jira', description: 'Saved filters to find stale and garbage items' },
      { name: 'Refinement session agenda', type: 'confluence', description: 'Template for running efficient sessions' },
    ],

    variations: [
      {
        name: 'Async refinement',
        description: 'PO writes up stories and posts them in Slack/Teams. Team members add questions async over 48 hours. Sync meeting is only for unresolved questions. Works well for distributed teams.'
      },
      {
        name: 'Developer-led refinement',
        description: 'Assign each story to a developer to "own" through refinement. They work with the PO 1:1 to flesh out details, then present to the group for validation.'
      },
    ],

    followUp: `Track your refinement health with these metrics:

**Refined buffer**: How many sprints worth of refined stories do you have? Target is 2.

**Planning time**: How long does sprint planning take? Should decrease as refinement improves.

**Mid-sprint questions**: How often do developers have to stop and ask the PO for clarification? Should decrease over time.

**Rollover rate**: What percentage of stories roll to the next sprint? Stories that are properly refined get completed more reliably.`,

    watchOutFor: [
      'Refining too far ahead. Priorities change. Work refined 3+ months ago is probably stale. Only refine 2-3 sprints ahead.',
      'The "one more question" trap. Some stories will never feel perfectly refined. If you\'ve discussed it twice and still have questions, the story might be too big or too vague.',
      'PO doing refinement alone. Developers need to be in the room. They catch technical issues the PO will miss.',
      'Skipping refinement when "too busy." This creates a death spiral: no refinement → bad planning → chaotic sprint → "too busy" for refinement.',
    ],

    relatedPlays: [
      { title: 'Fix Your Sprint Planning', tagline: 'Put good refinement to use' },
      { title: 'Write Better User Stories', tagline: 'Improve your story quality' },
      { title: 'Jira Cleanup', tagline: 'Get your backlog under control' },
    ],
  },

  'retrospective': {
    title: 'Run a Retrospective That Leads to Real Change',
    tagline: 'Stop generating action items that nobody does.',
    heroColor: 'linear-gradient(135deg, #6554C0 0%, #8777D9 100%)',

    prepTime: '10 min',
    runTime: '60-90 min',
    teamSize: '3-10 people',
    difficulty: 'Easy',

    fiveSecondSummary: [
      'Create safety so people say what they actually think',
      'Focus on understanding root causes, not just symptoms',
      'Leave with 1-2 actions that will actually get done',
    ],

    impactChain: {
      dimensionExplanation: 'Teams that skip or phone-in retros keep making the same mistakes. This play creates a feedback loop where problems get surfaced, understood, and actually fixed—not just complained about.',
      outcomeConnections: [
        {
          outcomeName: 'Continuous Improvement',
          icon: '📈',
          explanation: 'One meaningful improvement per sprint compounds. After 6 months, you\'re a completely different team.'
        },
        {
          outcomeName: 'Team Health',
          icon: '💚',
          explanation: 'When frustrations have an outlet and get addressed, people don\'t burn out or leave.'
        },
        {
          outcomeName: 'Delivery Commitments',
          icon: '📦',
          explanation: 'Most delivery problems are process problems. Fix the process, fix the delivery.'
        },
      ]
    },

    whatIsIt: `A retrospective is a meeting where the team reflects on how they worked together and identifies improvements. In theory. In practice, most retros devolve into people listing complaints, generating 15 action items that never happen, and then repeating the same conversation next sprint.

This play is about running retros that actually change things. The goal isn't to generate a long list of improvements—it's to understand one or two things deeply enough to actually fix them.`,

    whyDoIt: `Teams that skip retros or run them poorly plateau quickly. They repeat the same mistakes because they never stop to examine them. They burn out because frustrations build up with no outlet. They lose trust because problems are swept under the rug.

Teams that run good retros compound improvements over time. Each sprint gets a little better. People feel heard. Problems get addressed before they become crises. The retro becomes a moment people actually look forward to, not dread.`,

    whenToUse: `Run a retro:

• At the end of every sprint (non-negotiable)
• After a major release or milestone
• When something goes particularly wrong or particularly right
• When a new team member joins (their fresh perspective is valuable)
• When the team feels stuck or frustrated

The most important time to run a retro is when you "don't have time." That's usually when you need it most.`,

    remoteSetup: [
      'Video conferencing with cameras on (yes, it matters)',
      'Miro, FigJam, or Confluence whiteboard for collaborative brainstorming',
      'Anonymous input option (Slido, Google Form) for sensitive topics',
      'Timer visible to everyone',
    ],
    inPersonSetup: [
      'Room with whiteboard or flip chart',
      'Sticky notes and markers (multiple colors help)',
      'Snacks (seriously, they lower cortisol and people are more open)',
      'Timer',
    ],

    steps: [
      {
        title: 'Set the stage',
        duration: '5-10 min',
        content: `The first few minutes set the tone for the entire retro. If people don't feel safe, they'll share surface-level complaints instead of real issues.

**Read the Prime Directive** (or your version of it): "Regardless of what we discover, we understand and believe that everyone did the best job they could, given what they knew, their skills, the resources available, and the situation at hand."

This isn't just ritual—it's permission to discuss failures without blame.

**Review last retro's actions.** What did we say we'd do? Did we do it? If not, why not? This accountability moment matters. If you never follow up, people learn that retro actions don't matter.

**Optional icebreaker.** If energy is low or the team is stressed, a 2-minute icebreaker can shift the mood. Something simple: "One word to describe this sprint" or "What's a small win from the last two weeks?"

**Set the timebox.** "We have 60 minutes. We'll spend 20 minutes gathering input, 25 minutes discussing, and 15 minutes deciding on actions. I'll keep us on track."

Energy check: Look at the room. Are people engaged? If half the team looks checked out, call it out: "I notice some of us seem tired. Let's make sure this is worth everyone's time today."`
      },
      {
        title: 'Gather data',
        duration: '15-20 min',
        content: `This is where people share their observations about the sprint. The format matters less than giving everyone a voice.

**Classic format: What went well? What didn't? What should we change?**

**4Ls format: Loved, Longed for, Loathed, Learned**

**Start/Stop/Continue: What should we start doing? Stop doing? Keep doing?**

**How to gather input:**

1. Give everyone 5 minutes of **silent writing time**. This is crucial—it prevents the loudest person from anchoring everyone else. Everyone writes their own stickies.

2. **One by one, people share their stickies** and post them on the board. No discussion yet—just sharing and grouping similar items.

3. **Facilitator groups** similar items as they're posted. "This sounds similar to what Sam said—are these the same thing?"

**What if someone is dominating?** "Thanks, let's make sure we hear from everyone. Who haven't we heard from yet?"

**What if it's all positive?** Dig deeper: "It sounds like we had a good sprint. What's one thing that would have made it even better?"

**What if it's all negative?** Acknowledge it: "There's a lot of frustration here. Let's make sure we understand the biggest issues so we can actually address them."

By the end, you should have a board full of items, loosely grouped into themes.`
      },
      {
        title: 'Generate insights',
        duration: '20-25 min',
        content: `Now you dig into the "why." This is where retros usually fail—teams list symptoms without understanding causes, so the same problems keep recurring.

**Vote on what to discuss.** Give everyone 3 dots (or votes in your tool). Vote on which items/themes to discuss. You probably have time for 2-3 topics max.

**For each selected topic, go deeper:**

Don't just ask "why did this happen?" Ask it multiple times:

*"We had a lot of bugs this sprint."*
Why? "We were rushing to hit the deadline."
Why were we rushing? "We committed to too much."
Why did we commit to too much? "The stakeholder said it was urgent and we didn't push back."
Why didn't we push back? "We didn't have data to support a different timeline."

Now you've found something actionable: get better at estimating and using estimates to push back.

**Other useful questions:**
- "What would have to change for this problem to not exist?"
- "Has this happened before? What did we try?"
- "Who else is affected by this?"
- "What's the cost of not fixing this?"

**Take notes.** Capture the key insights as you discuss. You'll need them for the action items.

**Watch the clock.** It's easy to spend 40 minutes on one topic. Set a 10-minute timebox per topic and stick to it.`
      },
      {
        title: 'Decide what to do',
        duration: '15 min',
        content: `Here's the hard truth: most retro actions never happen. The team generates 8 action items, nobody owns them, and they're forgotten by Monday.

**The rule: Maximum 2 actions per retro.** If you can't do 2 things, you won't do 8.

**For each action:**

1. **Make it specific.** Not "communicate better" but "Dev lead posts daily async update in Slack by 10am."

2. **Assign a single owner.** Not "the team will do X" but "Jamie will do X."

3. **Set a deadline.** Usually "by end of next sprint."

4. **Decide how you'll know it worked.** What does success look like?

**Write them down.** Put them in Jira, your sprint board, or wherever your team tracks work. If they're not tracked like real work, they won't get done.

**Address the "we've tried this before" objection.** If someone says "we've tried that," ask: "What went wrong? What would we do differently this time?"

**The "one brave action" option:** Sometimes the right action is uncomfortable—having a difficult conversation, pushing back on leadership, changing a process that someone loves. If that's what the retro surfaced, don't shy away from it.`
      },
      {
        title: 'Close the retro',
        duration: '5 min',
        content: `End intentionally, not by running out of time.

**Summarize.** Read back the action items: "So we're doing X by [date], owned by [person], and Y by [date], owned by [person]. Any concerns?"

**Thank people.** Especially if hard things were shared. "Thanks for being honest about the deadline pressure. That took courage."

**Retro the retro.** Quick fist-of-five: "How useful was this retro? 1 = waste of time, 5 = extremely valuable." If you're consistently getting 3s or below, change your format.

**Optional: positive close.** End with something good. "What's one thing you're looking forward to next sprint?" or "Shoutouts—anyone want to recognize a teammate?"

**After the meeting:**
- Send a summary within 24 hours
- Make sure actions are in your tracking system
- Put "review retro actions" on the agenda for next retro`
      },
    ],

    templates: [
      { name: '4Ls Retrospective board', type: 'miro', description: 'Loved, Longed for, Loathed, Learned format' },
      { name: 'Sailboat retrospective', type: 'miro', description: 'Visual metaphor: wind (what pushes us), anchors (what slows us), rocks (risks ahead)' },
      { name: 'Retro action tracker', type: 'jira', description: 'Track actions as first-class tickets' },
    ],

    variations: [
      {
        name: 'Silent retro',
        description: 'Everything is written. People post stickies, group them silently, vote silently, and only discuss the top 1-2 items verbally. Good for teams with dominant voices or sensitive topics.'
      },
      {
        name: 'Appreciations retro',
        description: 'Start with 10 minutes of peer appreciations before any "what to improve" discussion. Builds trust and surfaces positives that might otherwise be forgotten.'
      },
      {
        name: 'Futurespective',
        description: 'Instead of looking back, look forward: "Imagine it\'s 3 months from now and our team is working amazingly. What happened? What changed?"'
      },
    ],

    followUp: `After the retro:

**Track action completion.** What percentage of retro actions get done? If it's below 70%, you're creating too many actions or not making them specific enough.

**Look for patterns.** If the same topic keeps coming up sprint after sprint, you're not addressing the root cause.

**Vary the format.** If retros feel stale, try a new format. There are dozens. Keep it fresh.

**Celebrate wins.** When an action from a previous retro actually made things better, call it out. "Remember two sprints ago we said we'd do X? We did it, and look—our velocity is up 15%."`,

    watchOutFor: [
      'Skipping retros when "too busy." That\'s when you need them most.',
      'The same person dominating every retro. Actively facilitate to hear other voices.',
      'Generating 8 actions and completing 0. Fewer actions, actually done, beats a long list ignored.',
      'Blaming individuals. Retros are about systems and processes, not blame. Redirect: "What about our process allowed that to happen?"',
      'Treating retros as venting sessions. Venting without action just creates cynicism.',
      'Not following up. If you never check on previous actions, people learn that retro actions don\'t matter.',
    ],

    relatedPlays: [
      { title: 'Team Working Agreements', tagline: 'Turn insights into team norms' },
      { title: 'Blameless Postmortem', tagline: 'Deep-dive on specific incidents' },
      { title: 'Team Health Check', tagline: 'Structured assessment beyond retros' },
    ],
  },

  'jira-hygiene': {
    title: 'Clean Up Your Jira Mess',
    tagline: 'Because a 500-item backlog isn\'t a backlog, it\'s a graveyard.',
    heroColor: 'linear-gradient(135deg, #FF5630 0%, #FF8F73 100%)',

    prepTime: '15 min',
    runTime: '1-2 hours',
    teamSize: '2-3 people',
    difficulty: 'Easy',

    fiveSecondSummary: [
      'Face the reality of how bad your Jira actually is',
      'Mass-archive the garbage that\'s been sitting there for months',
      'Set up simple habits to keep it clean',
    ],

    impactChain: {
      dimensionExplanation: 'A messy Jira means unreliable data. You can\'t measure velocity, cycle time, or throughput when half your tickets are ghosts. Clean data = accurate insights into how your team actually performs.',
      outcomeConnections: [
        {
          outcomeName: 'Data Quality',
          icon: '📊',
          explanation: 'Every metric in this tool depends on your Jira data. Garbage in = garbage out.'
        },
        {
          outcomeName: 'Planning Accuracy',
          icon: '🎯',
          explanation: 'You can\'t plan against a backlog you can\'t see clearly. Clean backlogs enable real prioritization.'
        },
        {
          outcomeName: 'Stakeholder Trust',
          icon: '🤝',
          explanation: 'When leadership can\'t understand your board, they don\'t trust your estimates. Clean boards build credibility.'
        },
      ]
    },

    whatIsIt: `Your Jira is probably a mess. You have hundreds of tickets that will never be worked on, "in progress" items that haven't been touched in months, and so much noise that finding anything useful requires archaeological skills.

This play is a cleanup blitz. In 1-2 hours, you'll cut your backlog in half (at least), fix the lies in your workflow, and set up practices to prevent the mess from returning.`,

    whyDoIt: `Messy Jira isn't just annoying—it actively hurts your team:

• **Planning takes longer** because you're sifting through garbage to find real work
• **Metrics are meaningless** because half your "in progress" items are ghosts
• **Stakeholders lose trust** because they see work sitting around forever
• **New team members are confused** because they can't tell what's real
• **Prioritization is impossible** when everything is "high priority" and nothing is closed

A clean Jira is a team that can focus. You can actually see what matters.`,

    whenToUse: `Run this play if:

• Your backlog has more than 100 items
• You have items in "In Progress" that haven't been updated in 30+ days
• Searching for a ticket feels like archaeology
• You're embarrassed to show your board to stakeholders
• New team members ask "what does this ticket mean?" and nobody knows
• Your burndown chart is a joke because old items skew everything`,

    remoteSetup: [
      'Screen share with Jira admin access',
      'Shared spreadsheet to track cleanup progress (optional)',
      'A bold attitude about deleting things',
    ],
    inPersonSetup: [
      'Room with Jira on the big screen',
      'Someone with admin access',
      'Whiteboard for noting new rules',
    ],

    steps: [
      {
        title: 'Face the damage',
        duration: '15 min',
        content: `Before you can fix it, you need to see how bad it is. Run these queries and write down the numbers:

**Total backlog items**
\`project = YOURPROJECT AND status in (Backlog, "To Do", Open)\`
If this is over 100, you have too much. If it's over 200, you have way too much.

**Stale items (no updates in 180+ days)**
\`project = YOURPROJECT AND updated < -180d AND status != Closed\`
These are dead. Nobody is going to work on them.

**In-progress zombies (no updates in 30+ days)**
\`project = YOURPROJECT AND status = "In Progress" AND updated < -30d\`
These are lies. They're not in progress.

**Unassigned in progress**
\`project = YOURPROJECT AND status = "In Progress" AND assignee is EMPTY\`
Who's working on these? Nobody, probably.

**Ancient epics**
\`project = YOURPROJECT AND type = Epic AND created < -365d AND status != Done\`
Epics that are over a year old and not done are probably not going to get done.

Write these numbers on a whiteboard or shared doc. This is your baseline. You'll compare against it when you're done.`
      },
      {
        title: 'Archive the graveyard',
        duration: '30-45 min',
        content: `Now the cathartic part: mass cleanup. You're going to close a lot of tickets. This feels scary but almost never causes problems. If something was important, it wouldn't have been sitting untouched for 6 months.

**Stale items (180+ days without update):**
Bulk transition them to "Won't Do" or "Closed - Stale." In Jira, you can select multiple issues and transition them at once.

Don't agonize over individual items. If it hasn't been touched in 6 months, close it. If it was important, someone will recreate it (and this time it might actually get done).

**In-progress zombies:**
Review each one. Usually one of three things is true:
1. It's actually done but nobody closed it → Close it
2. Someone started it and got pulled away → Move to backlog
3. It's blocked on something → Add the blocker, move to appropriate status

**Duplicates:**
Search for common terms in your domain. You probably have 5 tickets that are variations of "improve search." Link them and close the duplicates.

**Vague wishes:**
Items like "make the app better" or "technical debt" with no specific scope: close them or convert to epics. They're not actionable in their current form.

Run your baseline queries again. You should see dramatic improvement—often 50%+ reduction in backlog size.`
      },
      {
        title: 'Fix your "in progress" column',
        duration: '20 min',
        content: `Your "In Progress" column should only contain work that someone is actively working on right now. For most teams, that means 1-2 items per developer, max.

**Set a WIP limit.** Decide on a maximum number of items that can be in progress at once. A good starting point: (number of developers) × 1.5. So a team of 4 developers might have a WIP limit of 6.

Configure Jira to show a warning when the limit is exceeded (Board settings → Columns → set column max).

**Define what "in progress" means.** Write it down:
- Item has an assignee
- Someone worked on it in the last 3 business days
- No unresolved blockers

If an item doesn't meet these criteria, it shouldn't be in progress.

**Create a "Blocked" column or status.** Items that are waiting on something shouldn't sit in "In Progress" making it look like work is happening. Move them to a blocked status where the blocker is visible.

**Daily discipline.** At the end of each day, ask: "Is everything in 'In Progress' actually being worked on?" If not, move it.`
      },
      {
        title: 'Set up ongoing hygiene habits',
        duration: '15 min',
        content: `The cleanup is the easy part. Keeping it clean requires ongoing discipline.

**Weekly backlog grooming (15 min):**
Once a week, someone (rotate this) spends 15 minutes on:
- Closing items that have been in backlog 90+ days without activity
- Checking for duplicates
- Making sure top 20 items are properly described and prioritized

Put it on the calendar. Don't skip it.

**Monthly metrics check:**
Run your baseline queries monthly and track the trends:
- Total backlog size
- Items added vs. closed
- "In Progress" violations

Share with the team. Make the trend visible.

**Definition of Done for Jira:**
Before an item can be created, it needs:
- Clear description (what does "done" look like?)
- Priority set
- Epic or initiative linked (if applicable)

Items that don't meet this standard don't get created—they get discussed first.`
      },
    ],

    templates: [
      { name: 'Jira Cleanup JQL queries', type: 'jira', description: 'Saved filters for all the queries mentioned' },
      { name: 'Story template', type: 'jira', description: 'Template ensuring required fields are filled' },
      { name: 'Jira hygiene dashboard', type: 'jira', description: 'Dashboard showing key cleanliness metrics' },
    ],

    variations: [
      {
        name: 'Backlog bankruptcy',
        description: 'If your backlog is truly out of control (500+ items), declare bankruptcy: close everything older than 90 days. If it was important, someone will bring it back. Most things won\'t come back—and that\'s the point.'
      },
      {
        name: 'Automated cleanup',
        description: 'Use Jira automation to auto-close items that haven\'t been updated in 180 days, or to send reminders about in-progress items that are getting stale.'
      },
    ],

    followUp: `After your cleanup blitz:

**Track your baseline metrics weekly.** Are they staying down or creeping back up?

**Celebrate.** Seriously—show the team the before/after numbers. "We went from 340 backlog items to 78." That's a real accomplishment.

**Watch for backsliding.** It's easy to slip back. If your numbers start climbing, schedule another cleanup before it gets bad.`,

    watchOutFor: [
      'Being too precious about closing things. That ticket from 2019? Close it. If it was important, it would have been done.',
      'Cleaning other teams\' projects. Stay in your lane. Your mess is enough.',
      'Not addressing root cause. Why did Jira get messy? Too many features requested? No one responsible for hygiene? Fix the system, not just the symptoms.',
      'Perfectionism. 80% clean is a huge improvement over 20% clean. Don\'t let perfect be the enemy of good.',
    ],

    relatedPlays: [
      { title: 'Backlog Refinement', tagline: 'Keep your backlog healthy going forward' },
      { title: 'Workflow Simplification', tagline: 'Reduce workflow complexity' },
      { title: 'Dashboard Setup', tagline: 'Visualize your hygiene metrics' },
    ],
  },

  'default': {
    title: 'Process Improvement Workshop',
    tagline: 'A structured approach to fixing what\'s broken.',
    heroColor: 'linear-gradient(135deg, #403294 0%, #5243AA 100%)',

    prepTime: '15 min',
    runTime: '1 hour',
    teamSize: '3-8 people',
    difficulty: 'Medium',

    fiveSecondSummary: [
      'Name the specific process that\'s causing pain',
      'Understand the root cause, not just the symptoms',
      'Design a time-boxed experiment to test a fix',
    ],

    impactChain: {
      dimensionExplanation: 'This play targets the specific dimension where your team is struggling. By systematically diagnosing the root cause and running a focused experiment, you address the actual problem instead of applying band-aids.',
      outcomeConnections: [
        {
          outcomeName: 'Targeted Improvement',
          icon: '🎯',
          explanation: 'Generic best practices often miss the mark. This workshop identifies YOUR specific bottleneck.'
        },
        {
          outcomeName: 'Team Ownership',
          icon: '👥',
          explanation: 'Solutions the team designs themselves get adopted. Imposed changes get resisted.'
        },
      ]
    },

    whatIsIt: `Something in your process is broken. Maybe handoffs are slow, maybe information gets lost, maybe meetings are eating all your time. This play is a generic framework for diagnosing process problems and designing experiments to fix them.

It's not about finding a "best practice" and copying it. It's about understanding your specific situation, forming a hypothesis about what's wrong, and testing a change.`,

    whyDoIt: `Process debt accumulates just like technical debt. Small inefficiencies compound. What starts as "a minor annoyance" becomes "the way things are" becomes "why is everything so slow?"

The teams that stay healthy address process problems continuously through small experiments, not through periodic "transformation initiatives" that disrupt everything.`,

    whenToUse: `Use this when:

• Multiple people have complained about the same process
• Something that used to work no longer does
• You're about to implement a process change and want to do it thoughtfully
• A recent failure exposed a process gap
• You're onboarding new team members and they keep asking "why do we do it this way?"`,

    remoteSetup: [
      'Video call with whiteboard tool (Miro, FigJam)',
      'Shared doc for capturing decisions',
      'Everyone who touches the broken process',
    ],
    inPersonSetup: [
      'Room with whiteboard',
      'Sticky notes',
      'The right people in the room',
    ],

    steps: [
      {
        title: 'Define the problem',
        duration: '15 min',
        content: `Start by naming the problem precisely. "Communication is bad" is not a problem statement. "Developers don't find out about requirement changes until after they've already built the wrong thing" is a problem statement.

Ask: **What specifically is happening that shouldn't be happening?**

Get concrete. When did this last occur? What was the impact? Who was affected?

Write a problem statement that everyone agrees with. If people disagree about what the problem is, you're not ready to solve it.

Example:
"When requirements change after a story enters the sprint, developers often don't hear about the change until they've already completed the original version. This has caused 3 rework incidents in the last 2 sprints, wasting an estimated 8 story points of effort."`
      },
      {
        title: 'Map the current state',
        duration: '15 min',
        content: `Before you can fix a process, you have to understand how it actually works—not how it's supposed to work, but how it actually works.

Walk through the last concrete example of the problem occurring. Map each step:
- What happened?
- Who was involved?
- What information was available?
- Where did things go wrong?

Look for:
- **Handoff points** where information gets lost
- **Assumptions** that turned out to be wrong
- **Gaps** where no one was responsible
- **Bottlenecks** where things got stuck

Don't assign blame. You're mapping a system, not prosecuting individuals.`
      },
      {
        title: 'Identify root causes',
        duration: '15 min',
        content: `Ask "why?" repeatedly until you get past symptoms to causes.

"Developers built the wrong thing."
Why? "They didn't know the requirements changed."
Why didn't they know? "No one told them."
Why didn't anyone tell them? "The PO assumed the email was enough."
Why was email assumed to be enough? "We don't have a defined process for communicating changes."

Now you've found something actionable.

**Useful questions:**
- What would have to be different for this problem to not occur?
- If we could only change one thing, what would have the biggest impact?
- Has this problem happened before? What did we try?

You'll probably identify multiple root causes. Pick the top 1-2 to address.`
      },
      {
        title: 'Design an experiment',
        duration: '15 min',
        content: `Don't implement a permanent process change. Design a time-boxed experiment.

**What will we try?** Be specific. "Better communication" is not an experiment. "PO will post all requirement changes in the team Slack channel and tag affected developers within 30 minutes of the change" is an experiment.

**For how long?** 2 weeks is often right. Long enough to see results, short enough that it's not a big commitment.

**How will we know if it worked?** Define success criteria. "Zero rework incidents due to requirement changes" or "All developers rate themselves as 4+ out of 5 on 'I know about requirement changes promptly.'"

**Who owns it?** One person is responsible for making sure the experiment actually runs.

**When will we evaluate?** Put a date on the calendar to review results.`
      },
    ],

    templates: [
      { name: 'Process improvement canvas', type: 'miro', description: 'Template for running this workshop' },
      { name: 'Experiment tracker', type: 'confluence', description: 'Document and track your process experiments' },
    ],

    variations: [
      {
        name: 'Async pre-work',
        description: 'Have everyone document their experience with the broken process before the meeting. Use meeting time for synthesis and solution design.'
      },
      {
        name: 'Customer interview',
        description: 'If the process involves people outside your team, interview them first to understand their perspective.'
      },
    ],

    followUp: `After designing your experiment:

**Run it faithfully.** Don't abandon the experiment after 3 days because it's inconvenient.

**Collect data.** Track your success metrics throughout the experiment.

**Evaluate honestly.** Did it work? If not, what did you learn? If yes, should you formalize the change?

**Document outcomes.** Even failed experiments are valuable if you learn from them.`,

    watchOutFor: [
      'Trying to change too much at once. One small experiment is more likely to succeed than a grand process overhaul.',
      'Skipping the current state mapping. If you don\'t understand how things actually work, your fix will probably miss the mark.',
      'Not getting buy-in. A process change only works if the people involved actually do it.',
      'Abandoning experiments too early. Give it the full time box before evaluating.',
    ],

    relatedPlays: [
      { title: 'Team Retrospective', tagline: 'Regular forum for surfacing process issues' },
      { title: 'Working Agreements', tagline: 'Formalize your process decisions' },
    ],
  },
};

// ============================================================================
// CONTENT MATCHING
// ============================================================================

const getPlayContent = (playId: string, playTitle: string): PlayContent => {
  // Try exact match
  if (PLAY_CONTENT[playId]) {
    return PLAY_CONTENT[playId];
  }

  // Try matching by play title keywords
  const title = (playTitle || '').toLowerCase();
  const id = (playId || '').toLowerCase();
  const combined = `${title} ${id}`;

  if (combined.includes('sprint') && combined.includes('plan')) {
    return PLAY_CONTENT['sprint-planning'];
  }
  if (combined.includes('backlog') || combined.includes('refine') || combined.includes('groom')) {
    return PLAY_CONTENT['backlog-refinement'];
  }
  if (combined.includes('retro')) {
    return PLAY_CONTENT['retrospective'];
  }
  if (combined.includes('jira') || combined.includes('hygiene') || combined.includes('cleanup') || combined.includes('clean')) {
    return PLAY_CONTENT['jira-hygiene'];
  }
  if (combined.includes('estim')) {
    return PLAY_CONTENT['default']; // TODO: Add estimation play
  }

  return PLAY_CONTENT.default;
};

// ============================================================================
// COMPONENT
// ============================================================================

const PlayDetailModal: React.FC<PlayDetailModalProps> = ({
  isOpen,
  play: rawPlay,
  onClose,
  onStatusChange,
  onAddTask,
  onTaskStatusChange,
  onDeleteTask,
  onNotesChange,
}) => {
  const [activeTab, setActiveTab] = useState<ContentTab>('about');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [showProgress, setShowProgress] = useState(false);

  const play = normalizePlanPlay(rawPlay);
  const content = getPlayContent(play.playId, play.title);

  if (!isOpen) return null;

  const statusColors = getPlayStatusColor(play.status);
  const taskProgress = getTaskProgress(play.tasks);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const handleSaveNotes = () => {
    if (onNotesChange) {
      onNotesChange(notesValue);
    }
    setEditingNotes(false);
  };

  const priorityColors = getPriorityColor(play.priorityLevel);
  const interventionColors = getInterventionTypeColor(play.interventionType);

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header Bar - App-consistent */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onClose}>
            ← Back to Plan
          </button>
          <div style={styles.headerRight}>
            <select
              value={play.status}
              onChange={(e) => onStatusChange(e.target.value as PlayStatus)}
              style={{ ...styles.statusSelect, backgroundColor: statusColors.bg, color: statusColors.text, borderColor: statusColors.border }}
            >
              <option value="backlog">Backlog</option>
              <option value="do-next">Do Next</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </div>

        {/* Title Section - Compact */}
        <div style={styles.titleSection}>
          <div style={styles.badges}>
            <span style={{ ...styles.badge, backgroundColor: interventionColors.bg, color: interventionColors.text }}>
              {interventionColors.icon} {getInterventionTypeLabel(play.interventionType)}
            </span>
            <span style={{ ...styles.badge, backgroundColor: priorityColors.bg, color: priorityColors.text }}>
              {getPriorityShortLabel(play.priorityLevel)} Priority
            </span>
          </div>
          <h1 style={styles.title}>{content.title}</h1>
          <p style={styles.tagline}>{content.tagline}</p>

          {/* Compact Metadata Row */}
          <div style={styles.metaRow}>
            <span style={styles.metaChip}>🕐 {content.prepTime} prep</span>
            <span style={styles.metaChip}>⏱️ {content.runTime}</span>
            <span style={styles.metaChip}>👥 {content.teamSize}</span>
            <span style={styles.metaChip}>{content.difficulty === 'Easy' ? '🟢' : content.difficulty === 'Medium' ? '🟡' : '🔴'} {content.difficulty}</span>
          </div>
        </div>

        {/* Impact Chain - Visual Flow */}
        <div style={styles.impactSection}>
          {/* Dimension Impact */}
          <div style={styles.dimensionImpact}>
            <div style={styles.dimensionHeader}>
              <div style={styles.dimensionIcon}>📊</div>
              <div>
                <div style={styles.dimensionLabel}>IMPROVES</div>
                <div style={styles.dimensionName}>{play.sourceDimensionName}</div>
              </div>
            </div>
            <p style={styles.dimensionExplanation}>{content.impactChain.dimensionExplanation}</p>
          </div>

          {/* Flow Arrow */}
          <div style={styles.flowArrow}>
            <div style={styles.arrowLine} />
            <div style={styles.arrowText}>which impacts</div>
            <div style={styles.arrowLine} />
          </div>

          {/* Outcome Cards */}
          <div style={styles.outcomeCards}>
            {content.impactChain.outcomeConnections.map((outcome, i) => (
              <div key={i} style={styles.outcomeCard}>
                <div style={styles.outcomeHeader}>
                  <span style={styles.outcomeIcon}>{outcome.icon}</span>
                  <span style={styles.outcomeName}>{outcome.outcomeName}</span>
                </div>
                <p style={styles.outcomeExplanation}>{outcome.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Summary */}
          <div style={styles.summary}>
            <div style={styles.summaryHeader}>5-second summary</div>
            {content.fiveSecondSummary.map((item, i) => (
              <div key={i} style={styles.summaryItem}>
                <span style={styles.summaryCheck}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'about' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('about')}
            >
              About this Play
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'instructions' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('instructions')}
            >
              Instructions
            </button>
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {activeTab === 'about' ? (
              <>
                <section style={styles.section}>
                  <h2 style={styles.sectionTitle}>What is it?</h2>
                  <div style={styles.prose} dangerouslySetInnerHTML={{ __html: formatContent(content.whatIsIt) }} />
                </section>

                <section style={styles.section}>
                  <h2 style={styles.sectionTitle}>Why do this?</h2>
                  <div style={styles.prose} dangerouslySetInnerHTML={{ __html: formatContent(content.whyDoIt) }} />
                </section>

                <section style={styles.section}>
                  <h2 style={styles.sectionTitle}>When to use this play</h2>
                  <div style={styles.prose} dangerouslySetInnerHTML={{ __html: formatContent(content.whenToUse) }} />
                </section>

                <section style={styles.section}>
                  <h2 style={styles.sectionTitle}>What you'll need</h2>
                  <div style={styles.needsGrid}>
                    <div style={styles.needsBox}>
                      <h4 style={styles.needsBoxTitle}>🖥 Remote</h4>
                      <ul style={styles.needsList}>
                        {content.remoteSetup.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={styles.needsBox}>
                      <h4 style={styles.needsBoxTitle}>🏢 In-person</h4>
                      <ul style={styles.needsList}>
                        {content.inPersonSetup.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {content.templates.length > 0 && (
                  <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Templates</h2>
                    <div style={styles.templateGrid}>
                      {content.templates.map((t, i) => (
                        <div key={i} style={styles.templateCard}>
                          <div style={styles.templateName}>{t.name}</div>
                          <div style={styles.templateType}>{t.type.toUpperCase()}</div>
                          <div style={styles.templateDesc}>{t.description}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <>
                <section style={styles.section}>
                  <h2 style={styles.sectionTitle}>Running the play</h2>
                  <div style={styles.steps}>
                    {content.steps.map((step, i) => (
                      <div key={i} style={styles.step}>
                        <div style={styles.stepHeader}>
                          <span style={styles.stepNum}>{i + 1}</span>
                          <div>
                            <h3 style={styles.stepTitle}>{step.title}</h3>
                            <span style={styles.stepDuration}>{step.duration}</span>
                          </div>
                        </div>
                        <div style={styles.stepContent} dangerouslySetInnerHTML={{ __html: formatContent(step.content) }} />
                      </div>
                    ))}
                  </div>
                </section>

                {content.variations.length > 0 && (
                  <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Variations</h2>
                    <div style={styles.variations}>
                      {content.variations.map((v, i) => (
                        <div key={i} style={styles.variation}>
                          <h4 style={styles.variationName}>{v.name}</h4>
                          <p style={styles.variationDesc}>{v.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section style={styles.section}>
                  <h2 style={styles.sectionTitle}>Follow-up</h2>
                  <div style={styles.prose} dangerouslySetInnerHTML={{ __html: formatContent(content.followUp) }} />
                </section>

                <section style={styles.watchOut}>
                  <h2 style={styles.watchOutTitle}>⚠️ Watch out for</h2>
                  <ul style={styles.watchOutList}>
                    {content.watchOutFor.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>

          {/* Related Plays */}
          {content.relatedPlays.length > 0 && (
            <section style={styles.related}>
              <h2 style={styles.relatedTitle}>Related plays</h2>
              <div style={styles.relatedGrid}>
                {content.relatedPlays.map((r, i) => (
                  <div key={i} style={styles.relatedCard}>
                    <div style={styles.relatedName}>{r.title}</div>
                    <div style={styles.relatedTagline}>{r.tagline}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Progress Section */}
          <section style={styles.progress}>
            <button style={styles.progressToggle} onClick={() => setShowProgress(!showProgress)}>
              <span>📝 Your Progress</span>
              <span>{showProgress ? '▾' : '▸'}</span>
            </button>
            {showProgress && (
              <div style={styles.progressBody}>
                <div style={styles.progressSection}>
                  <div style={styles.progressLabel}>
                    Tasks
                    {play.tasks.length > 0 && (
                      <span style={styles.taskBadge}>{taskProgress.completed}/{taskProgress.total}</span>
                    )}
                  </div>
                  <div style={styles.addTask}>
                    <input
                      type="text"
                      placeholder="Add a task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      style={styles.taskInput}
                    />
                    <button style={styles.addBtn} onClick={handleAddTask}>Add</button>
                  </div>
                  {play.tasks.map(task => (
                    <div key={task.id} style={styles.task}>
                      <button
                        style={{
                          ...styles.checkbox,
                          background: task.status === 'completed' ? '#36B37E' : '#fff',
                          borderColor: task.status === 'completed' ? '#36B37E' : '#C1C7D0',
                          color: '#fff',
                        }}
                        onClick={() => onTaskStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                      >
                        {task.status === 'completed' && '✓'}
                      </button>
                      <span style={{
                        flex: 1,
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        opacity: task.status === 'completed' ? 0.6 : 1,
                      }}>
                        {task.title}
                      </span>
                      <button style={styles.deleteTask} onClick={() => onDeleteTask(task.id)}>×</button>
                    </div>
                  ))}
                </div>

                <div style={styles.progressSection}>
                  <div style={styles.progressLabel}>Notes</div>
                  {editingNotes ? (
                    <>
                      <textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        style={styles.notesInput}
                        placeholder="Add notes..."
                        autoFocus
                      />
                      <div style={styles.notesActions}>
                        <button style={styles.cancelBtn} onClick={() => { setEditingNotes(false); setNotesValue(play.notes || ''); }}>Cancel</button>
                        <button style={styles.saveBtn} onClick={handleSaveNotes}>Save</button>
                      </div>
                    </>
                  ) : play.notes ? (
                    <>
                      <p style={styles.notes}>{play.notes}</p>
                      {onNotesChange && <button style={styles.editBtn} onClick={() => { setNotesValue(play.notes || ''); setEditingNotes(true); }}>Edit</button>}
                    </>
                  ) : (
                    <p style={styles.noNotes}>
                      No notes.
                      {onNotesChange && <button style={styles.addNoteBtn} onClick={() => { setNotesValue(''); setEditingNotes(true); }}>Add notes</button>}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// Format markdown-like content to HTML
function formatContent(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#f4f5f7;padding:2px 6px;border-radius:3px;font-size:13px;">$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/• /g, '</p><p style="padding-left:20px;">• ');
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    zIndex: 1000,
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  container: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25)',
    overflow: 'hidden',
    height: 'fit-content',
  },

  // Header Bar
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 0',
    color: '#0052CC',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusSelect: {
    padding: '6px 10px',
    border: '1px solid',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Title Section
  titleSection: {
    padding: '24px',
    borderBottom: '1px solid #EBECF0',
  },
  badges: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  tagline: {
    margin: '0 0 16px',
    fontSize: '15px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  metaChip: {
    padding: '4px 10px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#5E6C84',
    fontWeight: 500,
  },

  // Impact Section - Visual Chain
  impactSection: {
    margin: '24px',
    padding: '24px',
    background: 'linear-gradient(135deg, #F8F9FA 0%, #EFF1F3 100%)',
    borderRadius: '12px',
    border: '1px solid #E4E6EA',
  },

  // Dimension Impact
  dimensionImpact: {
    marginBottom: '20px',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  dimensionIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#DEEBFF',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  dimensionLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  dimensionName: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0052CC',
  },
  dimensionExplanation: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#42526E',
    paddingLeft: '52px',
  },

  // Flow Arrow
  flowArrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
    paddingLeft: '52px',
  },
  arrowLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, #DFE1E6 0%, #C1C7D0 50%, #DFE1E6 100%)',
  },
  arrowText: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#8993A4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },

  // Outcome Cards
  outcomeCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    paddingLeft: '52px',
  },
  outcomeCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EA',
    boxShadow: '0 1px 2px rgba(9, 30, 66, 0.04)',
  },
  outcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  outcomeIcon: {
    fontSize: '18px',
  },
  outcomeName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
  },
  outcomeExplanation: {
    margin: 0,
    fontSize: '13px',
    lineHeight: 1.5,
    color: '#5E6C84',
  },

  // Content
  content: {
    padding: '24px',
  },

  // Summary
  summary: {
    background: '#DEEBFF',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '32px',
  },
  summaryHeader: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
  },
  summaryItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
    fontSize: '15px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  summaryCheck: {
    color: '#0052CC',
    fontWeight: 700,
  },

  // Tabs
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #EBECF0',
    marginBottom: '32px',
  },
  tab: {
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#6B778C',
    cursor: 'pointer',
  },
  tabActive: {
    color: '#0052CC',
    borderBottomColor: '#0052CC',
  },

  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },

  // Sections
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
  },
  prose: {
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#42526E',
  },

  // Needs
  needsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  needsBox: {
    background: '#FAFBFC',
    borderRadius: '8px',
    padding: '20px',
  },
  needsBoxTitle: {
    margin: '0 0 12px',
    fontSize: '14px',
    fontWeight: 600,
  },
  needsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#42526E',
  },

  // Templates
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
  },
  templateCard: {
    background: '#FAFBFC',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    padding: '16px',
  },
  templateName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '4px',
  },
  templateType: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    marginBottom: '8px',
  },
  templateDesc: {
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },

  // Steps
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  step: {
    background: '#FAFBFC',
    borderRadius: '8px',
    padding: '24px',
    borderLeft: '4px solid #0052CC',
  },
  stepHeader: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  stepNum: {
    width: '32px',
    height: '32px',
    background: '#0052CC',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0,
  },
  stepTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDuration: {
    fontSize: '13px',
    color: '#6B778C',
  },
  stepContent: {
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#42526E',
  },

  // Variations
  variations: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  variation: {
    background: '#EAE6FF',
    borderRadius: '8px',
    padding: '20px',
  },
  variationName: {
    margin: '0 0 8px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#403294',
  },
  variationDesc: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#5243AA',
  },

  // Watch out
  watchOut: {
    background: '#FFEBE6',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #FFBDAD',
  },
  watchOutTitle: {
    margin: '0 0 16px',
    fontSize: '17px',
    fontWeight: 700,
    color: '#BF2600',
  },
  watchOutList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#AE2A19',
  },

  // Related
  related: {
    marginTop: '48px',
    padding: '24px',
    background: '#FAFBFC',
    borderRadius: '8px',
  },
  relatedTitle: {
    margin: '0 0 20px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  relatedCard: {
    background: '#fff',
    border: '1px solid #EBECF0',
    borderRadius: '6px',
    padding: '16px',
  },
  relatedName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0052CC',
    marginBottom: '4px',
  },
  relatedTagline: {
    fontSize: '13px',
    color: '#6B778C',
  },

  // Progress
  progress: {
    marginTop: '48px',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
  },
  progressToggle: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#FAFBFC',
    border: 'none',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
  },
  progressBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  progressLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  taskBadge: {
    background: '#DEEBFF',
    color: '#0052CC',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
  },
  addTask: {
    display: 'flex',
    gap: '8px',
  },
  taskInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
  },
  addBtn: {
    padding: '8px 16px',
    background: '#0052CC',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  task: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: '#FAFBFC',
    borderRadius: '4px',
    fontSize: '14px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  deleteTask: {
    background: 'none',
    border: 'none',
    color: '#6B778C',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  notesInput: {
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    lineHeight: 1.5,
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  notesActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  cancelBtn: {
    padding: '6px 12px',
    background: 'none',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '6px 12px',
    background: '#0052CC',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  notes: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#172B4D',
    whiteSpace: 'pre-wrap',
  },
  editBtn: {
    marginTop: '8px',
    padding: '4px 10px',
    background: '#FAFBFC',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  noNotes: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  addNoteBtn: {
    marginLeft: '4px',
    padding: 0,
    background: 'none',
    border: 'none',
    color: '#0052CC',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default PlayDetailModal;
