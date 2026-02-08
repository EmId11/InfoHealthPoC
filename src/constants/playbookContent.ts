import { DimensionPlaybook } from '../types/playbook';

// Playbook content for Invisible Work dimension
export const invisibleWorkPlaybook: DimensionPlaybook = {
  dimensionKey: 'workCaptured',
  dimensionName: 'Invisible Work',
  overview: 'Invisible work represents tasks and efforts that happen but aren\'t tracked in Jira. This creates blind spots in planning, makes capacity difficult to estimate, and can lead to team burnout. Capturing all meaningful work is the foundation of accurate project management.',

  successCriteria: [
    {
      id: 'work-capture-rate',
      label: 'Work Capture Rate',
      description: 'Percentage of actual work that gets logged in Jira',
      targetValue: 85,
      unit: '%',
      indicatorId: 'workCaptureRate'
    },
    {
      id: 'unplanned-work-ratio',
      label: 'Unplanned Work Visibility',
      description: 'Percentage of unplanned work that gets captured',
      targetValue: 70,
      unit: '%',
      indicatorId: 'unplannedWorkRatio'
    },
    {
      id: 'meeting-overhead',
      label: 'Meeting Overhead Logged',
      description: 'Recurring meetings and ceremonies tracked as capacity blockers',
      targetValue: 90,
      unit: '%',
      indicatorId: 'meetingOverhead'
    }
  ],

  actions: [
    {
      id: 'iw-action-1',
      title: 'Create a "Catchall" Issue Type',
      category: 'quick-win',
      knowledge: {
        problemSolved: 'Team members hesitate to log ad-hoc work because they\'re unsure which issue type to use, leading to significant work going untracked.',
        whyItWorks: 'A dedicated "catchall" issue type removes categorization friction. When capturing work is as easy as a quick note, people actually do it. The psychological barrier of "where does this go?" disappears.',
        background: 'Research on habit formation shows that reducing friction is more effective than increasing motivation. Every extra decision point (like choosing an issue type) reduces the likelihood of action.',
        resources: [
          {
            title: 'Atlassian: Tracking Unplanned Work',
            type: 'article',
            description: 'Best practices for making unplanned work visible in your Jira workflow'
          }
        ]
      },
      implementation: {
        overview: 'Create a lightweight issue type specifically for ad-hoc work that doesn\'t fit existing categories, with minimal required fields.',
        steps: [
          { title: 'Access issue type settings', description: 'Go to Project Settings > Issue Types in your Jira project', duration: '1 minute' },
          { title: 'Create the new issue type', description: 'Create a new type called "Ad-hoc Task" or "Unplanned Work"', duration: '2 minutes' },
          { title: 'Configure workflow', description: 'Use a simple workflow: To Do → In Progress → Done. No complex states needed.', duration: '5 minutes' },
          { title: 'Add to quick-create', description: 'Add this type to your team\'s quick-create options so it\'s one click away', duration: '2 minutes' },
          { title: 'Communicate the threshold', description: 'Tell the team: "Use this for anything that takes >15 minutes and doesn\'t fit elsewhere"', duration: '5 minutes' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '15 minutes',
        effort: 'low',
        prerequisites: ['Jira project admin access'],
        toolsRequired: ['Jira administration access']
      },
      validation: {
        experiments: [
          {
            name: '1-Week Capture Tracking',
            description: 'Track how many ad-hoc issues are created in the first week after implementing the catchall type',
            duration: '1 week',
            howToMeasure: 'JQL query: project = X AND type = "Ad-hoc Task" AND created >= -1w'
          }
        ],
        successMetrics: [
          { metric: 'Ad-hoc issues created per week', target: '5+ issues per team member', howToMeasure: 'JQL filter counting new ad-hoc issues' },
          { metric: 'Uncaptured work mentions in standup', target: 'Decrease by 50%', howToMeasure: 'Track "oh, I also did X" mentions that aren\'t in Jira' }
        ],
        leadingIndicators: ['Number of ad-hoc issues created daily', 'Team members using the issue type'],
        laggingIndicators: ['Work capture rate improvement', 'Sprint predictability improvement']
      },
      pitfalls: {
        commonMistakes: [
          'Making the catchall type require too many fields - keep it minimal',
          'Not communicating clearly when to use it vs. other types',
          'Forgetting to add it to quick-create options, leaving it buried in menus'
        ],
        antiPatterns: [
          'Using it as a dumping ground for everything instead of properly categorizing when appropriate',
          'Management using it to micromanage by requiring justification for ad-hoc work'
        ],
        warningSignals: [
          'Catchall type is never used - friction wasn\'t actually the problem',
          'All work becomes "ad-hoc" - need clearer guidance on categorization'
        ],
        whenToPivot: 'If after 2 weeks the catchall type isn\'t being used, the problem may be cultural rather than structural. Consider the "No Ghost Work" team agreement instead.'
      },
      faq: [
        { question: 'Should ad-hoc tasks be estimated?', answer: 'Optional but recommended. Even rough estimates help with capacity planning. If estimation creates friction, skip it initially and add later.' },
        { question: 'What\'s the threshold for creating an issue?', answer: 'We recommend 15-30 minutes as the minimum. Anything shorter can be grouped or ignored for tracking purposes.' },
        { question: 'How do we prevent abuse of this issue type?', answer: 'Trust your team. If everything becomes ad-hoc, address it in retro as a process discussion, not a compliance issue.' }
      ],
      impact: 'high',
      relatedIndicators: ['workCaptureRate', 'unplannedWorkRatio'],
      recommendationId: 'iw-quick-1'
    },
    {
      id: 'iw-action-2',
      title: 'Daily "Work Log" Reminder',
      category: 'quick-win',
      knowledge: {
        problemSolved: 'Work happens throughout the day but capturing it in Jira requires a conscious decision that often gets forgotten by end of day.',
        whyItWorks: 'External prompts at the right moment trigger action. A well-timed reminder catches people when they still remember what they did, before context is lost overnight.',
        background: 'Behavioral science shows that "implementation intentions" (specific when/where triggers) dramatically increase follow-through. A scheduled reminder serves as this trigger.',
        resources: []
      },
      implementation: {
        overview: 'Set up an automated end-of-day reminder in your team\'s communication channel prompting everyone to log uncaptured work.',
        steps: [
          { title: 'Choose the channel', description: 'Pick your team\'s primary Slack/Teams channel where people will see it', duration: '1 minute' },
          { title: 'Schedule the message', description: 'Create a scheduled/recurring message for 30 minutes before typical end-of-day', duration: '5 minutes' },
          { title: 'Craft the message', description: 'Write: "Quick check: Did any work happen today that\'s not in Jira yet? Take 2 minutes to capture it!"', duration: '2 minutes' },
          { title: 'Include quick action', description: 'Add a direct link to create a new issue in the relevant project', duration: '2 minutes' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '10 minutes',
        effort: 'low',
        toolsRequired: ['Slack or Teams admin access']
      },
      validation: {
        experiments: [
          {
            name: 'Reminder Response Tracking',
            description: 'For 2 weeks, note how many issues are created within 30 minutes of the reminder going out',
            duration: '2 weeks',
            howToMeasure: 'Compare issue creation timestamps to reminder time'
          }
        ],
        successMetrics: [
          { metric: 'Issues created after reminder', target: '2-3 per day from the team', howToMeasure: 'JQL with created time filter' },
          { metric: 'Team engagement', target: '70%+ of team logs at least one issue per week via reminder', howToMeasure: 'Track who creates issues in the reminder window' }
        ],
        leadingIndicators: ['Reaction/acknowledgment of reminder messages', 'Questions about the reminder process'],
        laggingIndicators: ['Overall work capture rate', 'Reduction in "surprise" work discovered in retros']
      },
      pitfalls: {
        commonMistakes: [
          'Setting the reminder too late when people have already left',
          'Using a channel with too much noise where it gets lost',
          'Making the message too long - brevity is key'
        ],
        antiPatterns: [
          'Using the reminder to shame people who don\'t respond',
          'Escalating to managers if team members don\'t log work'
        ],
        warningSignals: [
          'Reminder becomes invisible "noise" that people ignore',
          'Only the same 2-3 people ever respond to it'
        ],
        whenToPivot: 'If the reminder stops working after a month, try changing the time or format. If that doesn\'t help, move to the Standup Capture Ritual which adds social accountability.'
      },
      faq: [
        { question: 'What if we have flexible hours and no common "end of day"?', answer: 'Consider multiple reminders or integrate into existing rituals like async standups instead.' },
        { question: 'Should I respond to the reminder even if I have nothing to log?', answer: 'Not required, but a quick "All captured!" can help establish the habit and show the reminder is being seen.' }
      ],
      impact: 'medium',
      relatedIndicators: ['workCaptureRate']
    },
    {
      id: 'iw-action-3',
      title: 'Standup Capture Ritual',
      category: 'process',
      knowledge: {
        problemSolved: 'Work that happens between planning sessions goes unreported because there\'s no natural moment to surface it.',
        whyItWorks: 'Standups are already a daily ritual. Adding a "what else happened?" segment creates a systematic capture point with social accountability. Real-time capture by the scrum master removes friction for individuals.',
        background: 'Standups traditionally focus on planned work. But agile teams often spend 20-40% of time on unplanned work. Ignoring this in standups perpetuates the invisibility problem.',
        resources: []
      },
      implementation: {
        overview: 'Extend your daily standup with a brief segment specifically for capturing work not yet in Jira.',
        steps: [
          { title: 'Announce the change', description: 'Tell the team you\'re adding a 2-3 minute segment to standup for capturing untracked work', duration: '5 minutes' },
          { title: 'Add the question', description: 'After each person\'s update, ask: "Anything else you worked on that\'s not in Jira?"', duration: 'Ongoing' },
          { title: 'Capture in real-time', description: 'Scrum master creates issues live during standup, or assigns the person to create it immediately after', duration: 'Ongoing' },
          { title: 'Weekly review', description: 'Track how many items are captured this way. Share the number with the team.', duration: '5 minutes weekly' },
          { title: 'Celebrate progress', description: 'When capture improves, acknowledge it. "Great week - we caught 8 items that would have been invisible!"', duration: 'Ongoing' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '1-2 days to establish',
        effort: 'medium',
        prerequisites: ['Regular standup meetings', 'Scrum master or facilitator'],
        toolsRequired: ['Jira access during standup']
      },
      validation: {
        experiments: [
          {
            name: 'Week-over-Week Capture Comparison',
            description: 'Compare issues captured via standup ritual in weeks 1, 2, and 3 to see if the habit is forming',
            duration: '3 weeks',
            howToMeasure: 'Tag issues captured via standup with a label, then count weekly'
          },
          {
            name: 'Zero Dark Work Sprint',
            description: 'Team commits to capturing 100% of work in Jira for one full sprint, using standup as the primary checkpoint',
            duration: '1 sprint',
            howToMeasure: 'Goal: No one mentions significant work in standup that isn\'t already in Jira'
          }
        ],
        successMetrics: [
          { metric: 'Items captured per standup', target: '1-2 items per day on average', howToMeasure: 'Count issues with standup-capture label' },
          { metric: 'Velocity accuracy', target: 'Within 10% of planned', howToMeasure: 'Compare committed vs completed story points when all work is visible' }
        ],
        leadingIndicators: ['Team members proactively mentioning untracked work', 'Decrease in surprised "oh I forgot" moments'],
        laggingIndicators: ['Sprint predictability improvement', 'Reduction in capacity confusion']
      },
      pitfalls: {
        commonMistakes: [
          'Making the segment too long - keep it brief and focused',
          'Creating detailed issues during standup - just capture the title and key details, refine later',
          'Singling out people who always have untracked work - keep it supportive'
        ],
        antiPatterns: [
          'Using this as a "confession booth" where people feel judged for having untracked work',
          'Scrum master refusing to move on until someone admits to invisible work'
        ],
        warningSignals: [
          'People start saying "nothing" to avoid extending standup',
          'Same types of work keep appearing - need process change, not just capture'
        ],
        whenToPivot: 'If after 2 sprints people consistently have nothing to add, either your capture is already good, or the cultural barrier is too high. Try the "No Ghost Work" agreement to address the root cause.'
      },
      faq: [
        { question: 'Won\'t this make standup too long?', answer: '2-3 minutes extra is worth it. If you\'re consistently going over, the issue might be standup format, not this segment.' },
        { question: 'What if someone has 5 things to capture?', answer: 'Capture the titles quickly, don\'t detail each one. That person probably needs the catchall issue type for easier logging throughout the day.' },
        { question: 'Should we capture small tasks?', answer: 'Focus on work >15-30 minutes. Don\'t track every email or quick question.' }
      ],
      impact: 'high',
      minMaturityLevel: 2,
      relatedIndicators: ['workCaptureRate', 'unplannedWorkRatio']
    },
    {
      id: 'iw-action-4',
      title: 'Meeting Time Allocation',
      category: 'process',
      knowledge: {
        problemSolved: 'Teams plan sprints as if they have 100% of their time available for Jira work, ignoring the substantial time spent in meetings and ceremonies.',
        whyItWorks: 'Making meeting overhead explicit in Jira forces realistic capacity planning. Teams stop overcommitting because they see their actual available time.',
        background: 'Studies show developers spend 20-30% of time in meetings on average. When this isn\'t accounted for, every sprint starts with invisible capacity loss.',
        resources: [
          {
            title: 'Capacity Planning Template',
            type: 'template',
            description: 'Spreadsheet for calculating true team capacity including meetings and overhead'
          }
        ]
      },
      implementation: {
        overview: 'Create Jira items representing standing meetings and ceremonies to reflect actual available capacity.',
        steps: [
          { title: 'Inventory meetings', description: 'List all recurring meetings: standups, planning, retros, 1:1s, all-hands, etc.', duration: '15 minutes' },
          { title: 'Calculate overhead', description: 'For each person, calculate weekly hours spent in meetings', duration: '10 minutes' },
          { title: 'Create Jira representation', description: 'Create a "Meeting Overhead" epic or recurring task per sprint', duration: '5 minutes' },
          { title: 'Add estimates', description: 'Use story points or hours that match your team\'s estimation approach', duration: '5 minutes' },
          { title: 'Deduct from capacity', description: 'During sprint planning, subtract meeting overhead from total capacity', duration: 'Ongoing' }
        ],
        teamInvolvement: 'partial',
        timeToImplement: '30 minutes',
        effort: 'low',
        toolsRequired: ['Calendar access to count meetings']
      },
      validation: {
        experiments: [
          {
            name: 'Capacity Accuracy Test',
            description: 'For 2 sprints, explicitly deduct meeting overhead and see if velocity predictions improve',
            duration: '2 sprints',
            howToMeasure: 'Compare predicted vs actual velocity with and without meeting overhead accounted for'
          }
        ],
        successMetrics: [
          { metric: 'Sprint commitment accuracy', target: '85%+ of committed work completed', howToMeasure: 'Committed points vs completed points' },
          { metric: 'Meeting overhead captured', target: '90%+ of recurring meetings represented', howToMeasure: 'Cross-reference calendar with Jira overhead items' }
        ],
        leadingIndicators: ['Team discussing meeting overhead in planning', 'Realistic initial sprint commitments'],
        laggingIndicators: ['Sustained velocity predictability', 'Less end-of-sprint crunch']
      },
      pitfalls: {
        commonMistakes: [
          'Tracking every 15-minute sync - focus on significant recurring meetings',
          'Not updating when meeting schedules change',
          'Double-counting - don\'t track both a meeting and the prep time unless they\'re distinct'
        ],
        antiPatterns: [
          'Using meeting overhead visibility to pressure people into fewer meetings (handle that separately)',
          'Making the tracking so detailed it becomes more overhead than the meetings themselves'
        ],
        warningSignals: [
          'Team starts resenting the tracking as bureaucracy',
          'Meeting overhead keeps growing without bounds'
        ],
        whenToPivot: 'If tracking meeting overhead feels like overkill, a simpler approach is to apply a blanket 20-30% capacity reduction for "overhead" without itemizing it.'
      },
      faq: [
        { question: 'Should every meeting have its own issue?', answer: 'No. Group by type or use a single "Meeting Overhead" epic per sprint with an appropriate estimate.' },
        { question: 'How do I handle meetings that only some people attend?', answer: 'Calculate per-person capacity rather than team-level capacity.' },
        { question: 'What about ad-hoc meetings?', answer: 'Don\'t try to predict these. Focus on recurring meetings. Ad-hoc meetings fall under unplanned work.' }
      ],
      impact: 'medium',
      relatedIndicators: ['meetingOverhead']
    },
    {
      id: 'iw-action-5',
      title: '"No Ghost Work" Team Agreement',
      category: 'culture',
      knowledge: {
        problemSolved: 'Work capture is treated as an individual choice rather than a team norm, leading to inconsistent practices and invisible work.',
        whyItWorks: 'Social agreements are more sustainable than mandates. When the team collectively decides that visibility matters, peer accountability maintains the practice naturally.',
        background: 'Team agreements based on shared values are 3x more likely to be sustained than top-down policies. The discussion itself creates buy-in.',
        resources: []
      },
      implementation: {
        overview: 'Establish a team norm through discussion and consensus that significant work must exist in Jira.',
        steps: [
          { title: 'Start the discussion', description: 'In a retro, ask: "What work happens that we don\'t track? Why?"', duration: '15 minutes' },
          { title: 'Agree on threshold', description: 'Collectively decide the minimum (e.g., anything >30 minutes)', duration: '10 minutes' },
          { title: 'Document the agreement', description: 'Create a simple team agreement: "We track all work over X minutes in Jira"', duration: '5 minutes' },
          { title: 'Make it visible', description: 'Post the agreement in team wiki, Slack channel description, or team board', duration: '5 minutes' },
          { title: 'Reinforce gently', description: 'When someone mentions ghost work, kindly remind: "Let\'s get that in Jira"', duration: 'Ongoing' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '1 sprint to establish',
        effort: 'medium',
        prerequisites: ['Team willing to discuss working agreements']
      },
      validation: {
        experiments: [
          {
            name: 'The Work Diary Week',
            description: 'Every team member keeps a simple log of everything they work on for one week, then compares to what\'s in Jira',
            duration: '1 week',
            howToMeasure: 'Calculate percentage of logged work that was in Jira vs not'
          },
          {
            name: 'Ghost Work Audit',
            description: 'In retro, ask everyone to share one thing they worked on that wasn\'t in Jira',
            duration: '1 retro session',
            howToMeasure: 'Count the items mentioned, identify patterns'
          }
        ],
        successMetrics: [
          { metric: 'Ghost work mentions in standup', target: 'Near zero after 2 sprints', howToMeasure: 'Track "oh I also did X" mentions that aren\'t in Jira' },
          { metric: 'Work diary gap', target: '<15% difference between diary and Jira', howToMeasure: 'Work diary experiment comparison' }
        ],
        leadingIndicators: ['Team members reminding each other supportively', 'Preemptive capturing before standup'],
        laggingIndicators: ['Sustained high work capture rate', 'Improved planning accuracy']
      },
      pitfalls: {
        commonMistakes: [
          'Framing it as surveillance or compliance rather than team benefit',
          'Making the threshold too low (e.g., 5 minutes) which creates excessive overhead',
          'Not revisiting the agreement when it\'s not working'
        ],
        antiPatterns: [
          'Managers enforcing the agreement punitively',
          'Shaming people publicly for ghost work',
          'Treating the agreement as a law rather than a shared value'
        ],
        warningSignals: [
          'Team starts hiding work to avoid the "hassle" of logging',
          'Agreement becomes a joke or eye-roll moment',
          'Only some team members follow it'
        ],
        whenToPivot: 'If the agreement isn\'t sticking after a few sprints, the team may not genuinely believe in its value. Return to the "why" - show how invisible work hurt planning or caused burnout, then revisit the agreement.'
      },
      faq: [
        { question: 'What if someone keeps "forgetting"?', answer: 'Address it privately first. Ask if there\'s friction in the process that makes capturing hard. Don\'t make it about compliance.' },
        { question: 'Should we track this as a metric?', answer: 'Initially, no. Focus on building the habit. Metrics can come later when the culture is established.' },
        { question: 'What if leadership pressure makes people afraid to show all their work?', answer: 'This is a trust issue that needs to be addressed directly. The team agreement only works in a psychologically safe environment.' }
      ],
      impact: 'high',
      minMaturityLevel: 2,
      relatedIndicators: ['workCaptureRate']
    },
    {
      id: 'iw-action-6',
      title: 'Slack-to-Jira Integration',
      category: 'tooling',
      knowledge: {
        problemSolved: 'Work is often discussed and decided in Slack/Teams but capturing it in Jira requires context-switching to a different app.',
        whyItWorks: 'Meeting people where they already work reduces friction to near-zero. When a Slack message can become a Jira issue with one click, capture happens naturally.',
        background: 'Studies on developer productivity show that context-switching between tools is a major source of lost time and dropped intentions.',
        resources: []
      },
      implementation: {
        overview: 'Enable creating Jira issues directly from communication tool messages, eliminating the context switch.',
        steps: [
          { title: 'Install the integration', description: 'Install the Jira Cloud app in Slack (or equivalent for Teams)', duration: '5 minutes' },
          { title: 'Configure projects', description: 'Configure which projects can receive issues from the integration', duration: '5 minutes' },
          { title: 'Demonstrate to team', description: 'Show how to use the shortcut: three-dot menu on any message > Create issue', duration: '5 minutes' },
          { title: 'Explain the behavior', description: 'Message text becomes the issue description automatically, can add context', duration: '2 minutes' },
          { title: 'Practice together', description: 'Have everyone create one test issue during a team meeting', duration: '5 minutes' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '20 minutes',
        effort: 'low',
        prerequisites: ['Slack/Teams workspace admin access', 'Jira Cloud instance'],
        toolsRequired: ['Jira Cloud', 'Slack or Microsoft Teams']
      },
      validation: {
        experiments: [
          {
            name: 'Integration Usage Tracking',
            description: 'Monitor how many issues are created via the Slack integration over 2 weeks',
            duration: '2 weeks',
            howToMeasure: 'Issues created via integration show a specific source - filter for these'
          }
        ],
        successMetrics: [
          { metric: 'Issues created via integration', target: '10+ per week team-wide', howToMeasure: 'Filter issues by creation source' },
          { metric: 'Time from discussion to capture', target: '<5 minutes', howToMeasure: 'Compare Slack message timestamp to issue creation time' }
        ],
        leadingIndicators: ['Team members asking how to use the integration', 'Discussions ending with "I\'ll create an issue from this"'],
        laggingIndicators: ['Higher work capture rate', 'Fewer "we discussed this but forgot to track it" moments']
      },
      pitfalls: {
        commonMistakes: [
          'Not demonstrating the feature - people won\'t discover it on their own',
          'Configuring too many required fields that the integration can\'t populate',
          'Not granting enough users access to create issues'
        ],
        antiPatterns: [
          'Creating issues for every message, even trivial ones',
          'Using the integration as a way to assign work to others without their input'
        ],
        warningSignals: [
          'Integration stops being used after initial excitement',
          'Issues created via integration have poor quality/context'
        ],
        whenToPivot: 'If people aren\'t using the integration, the problem might be that they\'re not recognizing work-worthy items in chat. Address the cultural side with the "No Ghost Work" agreement.'
      },
      faq: [
        { question: 'What if the message doesn\'t have enough context?', answer: 'The integration allows adding additional context. Encourage people to add a sentence explaining why it\'s needed.' },
        { question: 'Can we create issues in multiple projects?', answer: 'Yes, you can choose the project at creation time. Configure all relevant projects in the integration settings.' },
        { question: 'What about private/confidential discussions?', answer: 'Use judgment. Sensitive discussions may need manual issue creation with appropriate access controls.' }
      ],
      impact: 'high',
      relatedIndicators: ['workCaptureRate', 'unplannedWorkRatio']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Start with awareness. Track what goes uncaptured before trying to capture everything.',
      avoid: 'Don\'t mandate logging everything immediately—it will feel like surveillance.',
      nextStep: 'Run the "Work Diary Week" experiment to understand your gaps.'
    },
    2: {
      focus: 'Remove friction. Make capturing work as easy as possible with quick-create options.',
      avoid: 'Don\'t over-categorize. Too many required fields kills adoption.',
      nextStep: 'Establish the "No Ghost Work" team agreement.'
    },
    3: {
      focus: 'Systematize capture through rituals like standup additions and integrations.',
      avoid: 'Don\'t become bureaucratic. Capture should enable, not burden.',
      nextStep: 'Integrate with communication tools so capture happens where work is discussed.'
    },
    4: {
      focus: 'Analyze patterns. Use your complete data to identify systemic improvements.',
      avoid: 'Don\'t get complacent. Invisible work can creep back if vigilance drops.',
      nextStep: 'Coach other teams on your practices.'
    },
    5: {
      focus: 'Innovate on predictability. With full visibility, explore advanced forecasting.',
      avoid: 'Don\'t assume perfection. Continue sampling for uncaptured work.',
      nextStep: 'Share your approach as a case study.'
    }
  }
};

// Playbook content for Information Health dimension
export const informationHealthPlaybook: DimensionPlaybook = {
  dimensionKey: 'informationHealth',
  dimensionName: 'Information Health',
  overview: 'Information health measures how complete, accurate, and useful the data in your Jira issues is. Poor information health leads to context-switching, repeated questions, and decisions made without full context. Well-documented issues accelerate onboarding, handoffs, and async collaboration.',

  successCriteria: [
    {
      id: 'field-completeness',
      label: 'Field Completeness',
      description: 'Percentage of required fields populated on issues',
      targetValue: 90,
      unit: '%',
      indicatorId: 'fieldCompleteness'
    },
    {
      id: 'description-quality',
      label: 'Description Quality',
      description: 'Issues with meaningful descriptions (not just titles)',
      targetValue: 85,
      unit: '%',
      indicatorId: 'descriptionQuality'
    },
    {
      id: 'acceptance-criteria',
      label: 'Acceptance Criteria Coverage',
      description: 'Stories with defined acceptance criteria',
      targetValue: 95,
      unit: '%',
      indicatorId: 'acceptanceCriteria'
    }
  ],

  actions: [
    {
      id: 'ih-action-1',
      title: 'Issue Template Library',
      category: 'quick-win',
      knowledge: {
        problemSolved: 'Authors stare at blank issue descriptions, unsure what to include, resulting in inconsistent and incomplete documentation.',
        whyItWorks: 'Templates provide scaffolding that guides authors through what information is needed. Instead of deciding what to write, they just fill in the blanks.',
        background: 'Research on writing and documentation shows that structured prompts dramatically improve output quality compared to open-ended requests.',
        resources: [
          { title: 'Writing Effective User Stories', type: 'article', description: 'Guide to creating user stories that communicate intent and acceptance criteria clearly' },
          { title: 'Issue Template Examples', type: 'template', description: 'Ready-to-use templates for bugs, stories, spikes, and tasks' }
        ]
      },
      implementation: {
        overview: 'Create templates for common issue types that pre-fill structure and prompts for key information.',
        steps: [
          { title: 'Identify common types', description: 'List your 3-4 most common issue types (bug, story, task, spike)', duration: '5 minutes' },
          { title: 'Design template structure', description: 'For each type, create sections: Context (why?), Details (what?), Acceptance Criteria (how done?)', duration: '15 minutes' },
          { title: 'Create in Jira', description: 'Save as Jira issue templates or team wiki snippets', duration: '10 minutes' },
          { title: 'Share with team', description: 'Announce templates in team channel, show how to use them', duration: '5 minutes' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '30 minutes',
        effort: 'low',
        prerequisites: ['Jira project admin access'],
        toolsRequired: ['Jira project settings access']
      },
      validation: {
        experiments: [
          { name: 'Template Adoption Tracking', description: 'Track what percentage of new issues use templates vs blank descriptions', duration: '2 weeks', howToMeasure: 'Review new issues for template structure patterns' }
        ],
        successMetrics: [
          { metric: 'Template usage rate', target: '70%+ of new issues', howToMeasure: 'Audit new issues for template structure' },
          { metric: 'Description length', target: 'Average >100 words', howToMeasure: 'Check description field lengths' }
        ],
        leadingIndicators: ['Team members asking about templates', 'Issues showing template structure'],
        laggingIndicators: ['Fewer clarification questions', 'Faster onboarding for new team members']
      },
      pitfalls: {
        commonMistakes: [
          'Making templates too long or detailed - people will skip them',
          'Not updating templates when team needs change',
          'Forgetting to share templates with new team members'
        ],
        antiPatterns: [
          'Creating templates but not telling anyone about them',
          'Making templates mandatory and policing usage'
        ],
        warningSignals: [
          'People copy template but leave sections empty',
          'Templates accumulate but nobody uses them'
        ],
        whenToPivot: 'If templates aren\'t being used after 2 weeks, the problem may be findability. Make templates more accessible or integrate into issue creation flow.'
      },
      faq: [
        { question: 'How detailed should templates be?', answer: '5-7 prompts max. Enough to guide without overwhelming. Each prompt should be answerable in 1-2 sentences.' },
        { question: 'Should templates be required?', answer: 'No - that leads to gaming. Make them helpful enough that people want to use them.' }
      ],
      impact: 'high',
      relatedIndicators: ['descriptionQuality', 'acceptanceCriteria']
    },
    {
      id: 'ih-action-2',
      title: 'Required Fields Audit',
      category: 'quick-win',
      knowledge: {
        problemSolved: 'Too many required fields create friction and lead to garbage data as people fill in anything just to move forward. Too few leads to missing essential context.',
        whyItWorks: 'Finding the right balance means capturing essential information without creating overhead that leads to workarounds or shortcuts.',
        resources: []
      },
      implementation: {
        overview: 'Review and simplify required fields to find the balance between capture and friction.',
        steps: [
          { title: 'Audit current fields', description: 'List all required fields per issue type', duration: '5 minutes' },
          { title: 'Evaluate each field', description: 'For each, ask: "Do we actually use this data?"', duration: '10 minutes' },
          { title: 'Remove unused requirements', description: 'Make unused fields optional or remove entirely', duration: '5 minutes' },
          { title: 'Keep essentials', description: 'Recommended required: Summary, Description, Issue Type, Priority', duration: '2 minutes' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '20 minutes',
        effort: 'low',
        prerequisites: ['Jira project admin access']
      },
      validation: {
        experiments: [
          { name: 'Field Usage Analysis', description: 'Analyze what percentage of issues have meaningful data in each field', duration: '1 week', howToMeasure: 'Export issues and analyze field completion rates' }
        ],
        successMetrics: [
          { metric: 'Meaningful completion rate', target: '90%+ for required fields', howToMeasure: 'Audit required field values for actual content vs placeholder' }
        ],
        leadingIndicators: ['Fewer "N/A" or "TBD" values in required fields'],
        laggingIndicators: ['Improved field completeness score']
      },
      pitfalls: {
        commonMistakes: [
          'Removing fields without understanding why they were added',
          'Adding new required fields without removing others'
        ],
        antiPatterns: [
          'Making everything required "just in case"',
          'Changing required fields frequently, confusing users'
        ],
        warningSignals: [
          'High rate of "N/A" or placeholder values',
          'Team complaints about creating issues being cumbersome'
        ],
        whenToPivot: 'If people are still filling in garbage data, the problem might be training, not the field requirements.'
      },
      faq: [
        { question: 'What if stakeholders want more required fields?', answer: 'Ask them to show how they use the data. If they can\'t, it probably shouldn\'t be required.' }
      ],
      impact: 'medium',
      relatedIndicators: ['fieldCompleteness']
    },
    {
      id: 'ih-action-3',
      title: 'Definition of Ready Checklist',
      category: 'process',
      knowledge: {
        problemSolved: 'Issues enter sprints without sufficient information, causing mid-sprint clarification delays and context-switching.',
        whyItWorks: 'A clear "ready" bar creates a quality gate that prevents incomplete work from entering the sprint. It shifts clarification from implementation to refinement.',
        background: 'Definition of Ready is a Scrum concept that ensures work items have enough detail before they can be worked on.',
        resources: []
      },
      implementation: {
        overview: 'Establish what information an issue needs before it can be worked on.',
        steps: [
          { title: 'Draft checklist', description: 'Create 5-7 items: Clear description, Acceptance criteria, Dependencies, Estimate, No blocking questions', duration: '15 minutes' },
          { title: 'Introduce in refinement', description: 'Walk team through checklist: "These are our ready criteria"', duration: '10 minutes' },
          { title: 'Apply consistently', description: 'In refinement, ask "Is this ready?" and don\'t pull items that aren\'t', duration: 'Ongoing' },
          { title: 'Iterate', description: 'Revisit checklist monthly - add/remove based on what you learn', duration: '10 minutes monthly' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '1-2 refinement sessions',
        effort: 'medium'
      },
      validation: {
        experiments: [
          { name: 'The Stranger Test', description: 'Have team members review each other\'s issues before sprint, flagging anything unclear', duration: '1 sprint', howToMeasure: 'Count issues that pass vs fail the stranger test' }
        ],
        successMetrics: [
          { metric: 'Ready rate at refinement', target: '80%+ of issues meet criteria', howToMeasure: 'Track during refinement' },
          { metric: 'Mid-sprint clarification requests', target: 'Reduce by 50%', howToMeasure: 'Track questions during sprint' }
        ],
        leadingIndicators: ['Team using "is it ready?" language', 'Issues getting refined before entering sprint'],
        laggingIndicators: ['Smoother sprints', 'Less context-switching']
      },
      pitfalls: {
        commonMistakes: [
          'Making the checklist too long (stick to 5-7 items)',
          'Being too strict early on - teams need time to adapt',
          'Not revisiting/updating the checklist'
        ],
        antiPatterns: [
          'Using Definition of Ready to block work without helping improve it',
          'SM/PM becoming gatekeepers instead of team owning quality'
        ],
        warningSignals: [
          'Items marked "ready" but still have questions during implementation',
          'Team starts gaming the checklist without improving quality'
        ],
        whenToPivot: 'If Definition of Ready becomes a bureaucratic checkbox rather than genuine quality gate, simplify it radically.'
      },
      faq: [
        { question: 'Who decides if something is ready?', answer: 'The team collectively. If anyone has questions, it\'s not ready.' },
        { question: 'What if urgent work isn\'t ready?', answer: 'Accept the risk explicitly. Track how often this happens and the impact.' }
      ],
      impact: 'high',
      minMaturityLevel: 2,
      relatedIndicators: ['descriptionQuality', 'acceptanceCriteria', 'fieldCompleteness']
    },
    {
      id: 'ih-action-4',
      title: 'Refinement Quality Time',
      category: 'process',
      knowledge: {
        problemSolved: 'Refinement focuses only on estimation, leaving issue quality to improve magically (it doesn\'t).',
        whyItWorks: 'Dedicated time for quality review ensures issues get better during refinement. Real-time updates happen when the whole team is focused together.',
        resources: []
      },
      implementation: {
        overview: 'Split refinement to include dedicated time for improving issue quality.',
        steps: [
          { title: 'Restructure refinement', description: 'First half: Estimate and prioritize. Second half: Quality review.', duration: '1 session' },
          { title: 'Quality review questions', description: 'Ask: "Would a new team member understand this?" "What questions might come up?" "Are criteria testable?"', duration: 'Ongoing' },
          { title: 'Update in real-time', description: 'Fix issues during the session, don\'t just note them', duration: 'Ongoing' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: 'Next refinement session',
        effort: 'low'
      },
      validation: {
        experiments: [
          { name: 'Before/After Comparison', description: 'Track issue quality before and after refinement sessions', duration: '2 sprints', howToMeasure: 'Measure description length and completeness pre/post refinement' }
        ],
        successMetrics: [
          { metric: 'Issues improved during refinement', target: '70%+ refined issues get quality updates', howToMeasure: 'Track edits made during refinement' }
        ],
        leadingIndicators: ['Team asking quality questions naturally', 'Issues being edited during refinement'],
        laggingIndicators: ['Better sprint outcomes', 'Fewer "what does this mean?" questions']
      },
      pitfalls: {
        commonMistakes: [
          'Skipping quality time when refinement runs long',
          'Quality review becoming criticism session'
        ],
        antiPatterns: [
          'Only one person (PM/SM) doing quality review',
          'Saving quality feedback for later instead of fixing now'
        ],
        warningSignals: [
          'Quality portion consistently skipped',
          'People defensive about issue feedback'
        ],
        whenToPivot: 'If quality time becomes contentious, focus on specific questions rather than general review.'
      },
      faq: [
        { question: 'How long should quality time be?', answer: '15-20 minutes for a typical refinement. Enough to review 3-5 issues thoroughly.' }
      ],
      impact: 'medium',
      relatedIndicators: ['descriptionQuality', 'acceptanceCriteria']
    },
    {
      id: 'ih-action-5',
      title: 'The "Future You" Principle',
      category: 'culture',
      knowledge: {
        problemSolved: 'Authors write issues with current context in mind, forgetting that future readers (often themselves) won\'t have that context.',
        whyItWorks: 'Framing documentation as a favor to your future self makes it personal and relatable. It shifts from "documentation for others" to "helping yourself."',
        resources: []
      },
      implementation: {
        overview: 'Train team to write issues as if they\'ll be picked up by someone with no context.',
        steps: [
          { title: 'Introduce the concept', description: 'Share: "Write for future you - the you in 2 weeks who forgot all context"', duration: '5 minutes' },
          { title: 'Use teaching moments', description: 'When someone asks for clarification: "Great question! Let\'s add that to the issue so future us has it too."', duration: 'Ongoing' },
          { title: 'Celebrate examples', description: 'Call out well-written issues in retros: "This issue is future-proof!"', duration: 'Ongoing' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '2-3 weeks to establish',
        effort: 'medium'
      },
      validation: {
        experiments: [
          { name: 'Context Test', description: 'Pick random issues from 2 weeks ago. Can you understand them without additional context?', duration: '1 session', howToMeasure: 'Rate issues on a 1-5 clarity scale' }
        ],
        successMetrics: [
          { metric: 'Clarity score', target: '4+ out of 5 on random sample', howToMeasure: 'Team rates old issues for clarity' }
        ],
        leadingIndicators: ['Team using "future you" language', 'Proactive context-adding'],
        laggingIndicators: ['Easier onboarding', 'Successful handoffs']
      },
      pitfalls: {
        commonMistakes: [
          'Preaching about it but not modeling it',
          'Being prescriptive about exactly what to write'
        ],
        antiPatterns: [
          'Using it to criticize people\'s writing',
          'Making it feel like extra work rather than helpful habit'
        ],
        warningSignals: [
          'Team rolls eyes when principle is mentioned',
          'Documentation becomes verbose without being helpful'
        ],
        whenToPivot: 'If the concept isn\'t landing, try "write for your replacement" instead - same idea, different framing.'
      },
      faq: [
        { question: 'How much detail is enough?', answer: 'Enough that you could pick it up cold in 2 weeks. Usually 3-5 sentences of context plus clear scope.' }
      ],
      impact: 'high',
      minMaturityLevel: 2,
      relatedIndicators: ['descriptionQuality']
    },
    {
      id: 'ih-action-6',
      title: 'Automation for Missing Fields',
      category: 'tooling',
      knowledge: {
        problemSolved: 'Incomplete issues slip into "In Progress" without anyone noticing until they cause problems.',
        whyItWorks: 'Automated checks catch issues at the moment they matter (when work starts), providing just-in-time reminders without adding overhead to issue creation.',
        resources: []
      },
      implementation: {
        overview: 'Set up Jira automation to flag issues missing key information when they transition to active work.',
        steps: [
          { title: 'Access automation', description: 'Go to Project Settings > Automation', duration: '1 minute' },
          { title: 'Create trigger', description: 'Trigger: When issue transitions to "In Progress"', duration: '2 minutes' },
          { title: 'Add condition', description: 'Condition: Description is empty OR Acceptance Criteria is empty', duration: '5 minutes' },
          { title: 'Set action', description: 'Action: Add comment tagging assignee with reminder, or send Slack notification', duration: '5 minutes' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '30 minutes',
        effort: 'low',
        prerequisites: ['Jira automation access'],
        toolsRequired: ['Jira Automation']
      },
      validation: {
        experiments: [
          { name: 'Documentation Sprint', description: 'Team commits that no issue can be started unless it has complete description and acceptance criteria', duration: '1 sprint', howToMeasure: 'Track issues blocked by automation vs manual catches' }
        ],
        successMetrics: [
          { metric: 'Automation triggers per sprint', target: 'Decreasing over time', howToMeasure: 'Count automation rule executions' }
        ],
        leadingIndicators: ['People completing fields before starting work', 'Fewer automation triggers'],
        laggingIndicators: ['Higher overall field completeness']
      },
      pitfalls: {
        commonMistakes: [
          'Making automation too aggressive (blocking instead of reminding)',
          'Not telling team about the automation'
        ],
        antiPatterns: [
          'Using automation to punish rather than remind',
          'Automating without addressing root cause'
        ],
        warningSignals: [
          'People adding placeholder text just to pass automation',
          'Team frustrated by "nagging" automations'
        ],
        whenToPivot: 'If automation creates friction without improvement, the issue is cultural. Focus on the "why" before the "how."'
      },
      faq: [
        { question: 'Should automation block transitions?', answer: 'Start with reminders, not blocks. Blocks create workarounds. Reminders create awareness.' }
      ],
      impact: 'medium',
      relatedIndicators: ['fieldCompleteness', 'descriptionQuality']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Start with templates. Give people structure to fill in rather than blank pages.',
      avoid: 'Don\'t add too many required fields—it just gets bypassed.',
      nextStep: 'Create templates for your top 3 issue types.'
    },
    2: {
      focus: 'Add quality checks to refinement. Make incomplete issues visible.',
      avoid: 'Don\'t shame people for incomplete issues. Focus on improvement, not blame.',
      nextStep: 'Establish a simple Definition of Ready.'
    },
    3: {
      focus: 'Build the "future you" culture. Make good documentation a team value.',
      avoid: 'Don\'t make it bureaucratic. Quality should enable speed, not slow it down.',
      nextStep: 'Run the Stranger Test experiment regularly.'
    },
    4: {
      focus: 'Automate quality checks. Let tooling catch issues before humans need to.',
      avoid: 'Don\'t over-automate. Human judgment still matters for context.',
      nextStep: 'Share your templates and practices with other teams.'
    },
    5: {
      focus: 'Lead by example. Your issues should be case studies in clarity.',
      avoid: 'Don\'t assume everyone knows your standards. Keep documenting what "good" looks like.',
      nextStep: 'Mentor other teams on information health practices.'
    }
  }
};

// Playbook content for Data Freshness dimension
export const dataFreshnessPlaybook: DimensionPlaybook = {
  dimensionKey: 'dataFreshness',
  dimensionName: 'Data Freshness',
  overview: 'Data freshness measures how current and up-to-date your Jira data is. Stale data undermines trust in Jira as a source of truth, leads to sync meetings to get "real" status, and hides problems until they become crises. Fresh data enables async work and confident decision-making.',

  successCriteria: [
    {
      id: 'stale-issues',
      label: 'Stale Issue Rate',
      description: 'Percentage of in-progress issues updated in last 3 days',
      targetValue: 90,
      unit: '%',
      indicatorId: 'staleIssueRate'
    },
    {
      id: 'status-accuracy',
      label: 'Status Accuracy',
      description: 'Issues whose Jira status matches actual state',
      targetValue: 95,
      unit: '%',
      indicatorId: 'statusAccuracy'
    },
    {
      id: 'update-frequency',
      label: 'Update Frequency',
      description: 'Average days between updates on active issues',
      targetValue: 2,
      unit: 'days',
      indicatorId: 'updateFrequency'
    }
  ],

  actions: [
    {
      id: 'df-action-1',
      title: 'Daily Update Reminder',
      category: 'quick-win',
      knowledge: {
        problemSolved: 'Issues go days without updates because there\'s no prompt to remind people. Work gets done but the board doesn\'t reflect it.',
        whyItWorks: 'Automated reminders at the right moment (when an issue becomes stale) create a just-in-time nudge without requiring constant vigilance from the team.',
        resources: [{ title: 'Stale Issue Automation Rules', type: 'template', description: 'Pre-built Jira automation rules for stale issue notifications' }]
      },
      implementation: {
        overview: 'Set up automated reminders for issues that haven\'t been updated in 2+ days.',
        steps: [
          { title: 'Access automation', description: 'Go to Project Settings > Automation', duration: '1 minute' },
          { title: 'Create scheduled rule', description: 'Run daily at 9am', duration: '3 minutes' },
          { title: 'Add condition', description: 'Issue is "In Progress" AND last updated > 2 days ago', duration: '3 minutes' },
          { title: 'Set action', description: 'Send Slack notification to assignee with message: "Your issue [key] hasn\'t been updated in 2 days. Quick status update?"', duration: '5 minutes' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '15 minutes',
        effort: 'low',
        toolsRequired: ['Jira Automation']
      },
      validation: {
        experiments: [
          { name: 'The 48-Hour Challenge', description: 'Team commits that no in-progress issue goes more than 48 hours without an update', duration: '2 weeks', howToMeasure: 'Track issues stale >48 hours daily' }
        ],
        successMetrics: [
          { metric: 'Stale issues per day', target: 'Zero issues >48 hours stale', howToMeasure: 'JQL: status = "In Progress" AND updated < -2d' },
          { metric: 'Reminder response rate', target: '80%+ issues updated within 4 hours of reminder', howToMeasure: 'Track time from reminder to update' }
        ],
        leadingIndicators: ['Fewer stale issues flagged daily', 'Quick responses to reminders'],
        laggingIndicators: ['Higher board accuracy', 'Less need for sync meetings']
      },
      pitfalls: {
        commonMistakes: [
          'Setting reminders too aggressive (every day instead of every 2 days)',
          'Not explaining why freshness matters - reminders feel like nagging'
        ],
        antiPatterns: [
          'Using reminders to shame or escalate',
          'Adding more automation without addressing root causes'
        ],
        warningSignals: [
          'People ignoring reminders',
          'Adding meaningless updates just to satisfy automation'
        ],
        whenToPivot: 'If reminders don\'t lead to meaningful updates, the problem is cultural, not technological. Focus on why people aren\'t updating.'
      },
      faq: [
        { question: 'What counts as an "update"?', answer: 'Any change - status transition, comment, field edit. The point is someone touched it.' },
        { question: 'Should reminders escalate to managers?', answer: 'No. Keep it peer-to-peer. Escalation creates fear, not fresh data.' }
      ],
      impact: 'high',
      relatedIndicators: ['staleIssueRate', 'updateFrequency']
    },
    {
      id: 'df-action-2',
      title: 'Standup Board Walk',
      category: 'quick-win',
      knowledge: {
        problemSolved: 'Verbal standups describe work but don\'t update the board. Status drift happens because updates happen in air, not in Jira.',
        whyItWorks: 'Walking the board creates a visual, shared moment where everyone sees the state. Real-time updates during standup close the gap between reality and board.',
        resources: []
      },
      implementation: {
        overview: 'During standup, literally walk through the Jira board together, updating statuses in real-time.',
        steps: [
          { title: 'Screen-share the board', description: 'Display the Jira board where everyone can see it', duration: '30 seconds' },
          { title: 'Walk column by column', description: 'Go through each column, person by person', duration: 'Ongoing' },
          { title: 'Ask the key question', description: 'For each issue: "Is this still accurate?"', duration: 'Ongoing' },
          { title: 'Update immediately', description: 'Update statuses in real-time if not accurate', duration: 'Ongoing' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: 'Next standup',
        effort: 'low'
      },
      validation: {
        experiments: [
          { name: 'Before/After Comparison', description: 'Compare board accuracy on days with vs without board walks', duration: '2 weeks', howToMeasure: 'Audit issues for status accuracy after standups' }
        ],
        successMetrics: [
          { metric: 'Updates during standup', target: '3-5 status changes per standup', howToMeasure: 'Count transitions during standup' },
          { metric: 'Status accuracy', target: '95%+ by end of standup', howToMeasure: 'Sample issues and verify' }
        ],
        leadingIndicators: ['People pointing out stale issues during walk', 'Natural status updates happening'],
        laggingIndicators: ['Board reflects reality after standup', 'Fewer "that\'s not accurate" moments']
      },
      pitfalls: {
        commonMistakes: [
          'Rushing through the walk to save time',
          'Only one person updating while others watch'
        ],
        antiPatterns: [
          'Turning board walk into status grilling',
          'Skipping board walk when running late'
        ],
        warningSignals: [
          'Team stops looking at board during walk',
          'No updates happening - suspicious silence'
        ],
        whenToPivot: 'If board walks aren\'t catching drift, the issue may be WIP - too many items to walk meaningfully.'
      },
      faq: [
        { question: 'How long should a board walk take?', answer: '~30 seconds per issue. For 20 items, about 10 minutes total.' },
        { question: 'What if the person isn\'t there?', answer: 'Skip their items and remind them to update async.' }
      ],
      impact: 'medium',
      relatedIndicators: ['statusAccuracy', 'staleIssueRate']
    },
    {
      id: 'df-action-3',
      title: 'Work-in-Progress Limits',
      category: 'process',
      knowledge: {
        problemSolved: 'Too many concurrent items means none get full attention, including updates. Things go stale because attention is spread thin.',
        whyItWorks: 'WIP limits force focus. When you can only have N items in progress, you have to finish or update before starting new work.',
        background: 'WIP limits are a core Kanban principle. Research shows limiting concurrent work improves both quality and throughput.',
        resources: [{ title: 'Kanban WIP Limits Guide', type: 'article', description: 'How to set and enforce work-in-progress limits for flow efficiency' }]
      },
      implementation: {
        overview: 'Set WIP limits per person/column to ensure items get attention and stay fresh.',
        steps: [
          { title: 'Analyze current WIP', description: 'Count how many items each person has "In Progress" right now', duration: '10 minutes' },
          { title: 'Set initial limits', description: 'Set limit at current average minus 1 (gradual improvement)', duration: '5 minutes' },
          { title: 'Configure board', description: 'Add column limits to Jira board', duration: '5 minutes' },
          { title: 'Enforce the limit', description: 'When limit hit, must finish/update before starting new', duration: 'Ongoing' },
          { title: 'Review and tighten', description: 'Revisit limits each sprint - tighten as team adapts', duration: '5 minutes per sprint' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '1 sprint to establish',
        effort: 'medium'
      },
      validation: {
        experiments: [
          { name: 'WIP Reduction Sprint', description: 'Reduce WIP limit by 1 for one sprint and measure impact on freshness', duration: '1 sprint', howToMeasure: 'Compare stale issue rate before and after' }
        ],
        successMetrics: [
          { metric: 'Average WIP per person', target: '2-3 items max', howToMeasure: 'Daily snapshot of In Progress per person' },
          { metric: 'Update frequency', target: 'All items updated within 48 hours', howToMeasure: 'JQL filter for stale items' }
        ],
        leadingIndicators: ['Team discussing WIP during planning', 'Items finishing faster'],
        laggingIndicators: ['Cycle time improvement', 'Fresher data overall']
      },
      pitfalls: {
        commonMistakes: [
          'Setting limits too aggressive initially',
          'Not enforcing limits - making them suggestions'
        ],
        antiPatterns: [
          'Starting multiple items to "prepare" then claiming they\'re not WIP',
          'Gaming limits by closing items prematurely'
        ],
        warningSignals: [
          'Constant WIP limit violations',
          'Team resentment about limits'
        ],
        whenToPivot: 'If limits cause more pain than benefit, they\'re too strict. Loosen and gradually tighten.'
      },
      faq: [
        { question: 'What\'s a good starting WIP limit?', answer: 'Current average minus 1. If people average 4 items in progress, start at 3.' },
        { question: 'Do WIP limits include blocked items?', answer: 'Typically yes - blocked items still consume mental bandwidth. Consider a separate "Blocked" column.' }
      ],
      impact: 'high',
      minMaturityLevel: 2,
      relatedIndicators: ['staleIssueRate', 'updateFrequency']
    },
    {
      id: 'df-action-4',
      title: 'End-of-Day Board Check',
      category: 'process',
      knowledge: {
        problemSolved: 'The board drifts from reality throughout the day. By morning, standup is working from stale information.',
        whyItWorks: 'A quick EOD habit creates a consistent sync point. The board is fresh every morning because everyone updated before leaving.',
        resources: []
      },
      implementation: {
        overview: 'Each person spends 2 minutes at day end ensuring their issues reflect current state.',
        steps: [
          { title: 'Set personal reminder', description: 'Calendar reminder for 15 min before typical log-off', duration: '2 minutes' },
          { title: 'Quick checklist', description: 'Are my "In Progress" items still being worked? Should anything move? Any comments needed?', duration: 'Ongoing' },
          { title: 'Update immediately', description: 'Make any needed changes before signing off', duration: '2 minutes daily' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '1 week to habit',
        effort: 'low'
      },
      validation: {
        experiments: [
          { name: 'Morning Freshness Check', description: 'Each morning, audit how accurate the board is compared to reality', duration: '1 week', howToMeasure: 'Ask team "Is your board accurate?" at standup start' }
        ],
        successMetrics: [
          { metric: 'Morning accuracy', target: '95%+ accuracy at standup', howToMeasure: 'Team self-report at standup' },
          { metric: 'EOD update habit', target: '80%+ of team updating consistently', howToMeasure: 'Track last-updated timestamps' }
        ],
        leadingIndicators: ['Updates happening in late afternoon', 'Board accurate at standup'],
        laggingIndicators: ['Smoother standups', 'Less "that changed yesterday" clarifications']
      },
      pitfalls: {
        commonMistakes: [
          'Making EOD check feel like surveillance',
          'Not explaining the why - feels like busywork'
        ],
        antiPatterns: [
          'Management checking who did/didn\'t update',
          'Perfunctory updates without thinking'
        ],
        warningSignals: [
          'Updates bunching at exactly reminder time (going through motions)',
          'No actual changes being made'
        ],
        whenToPivot: 'If EOD check feels bureaucratic, integrate it into something people already do - like closing their laptop.'
      },
      faq: [
        { question: 'What if I forget?', answer: 'No big deal. Update first thing in morning. The goal is habit, not perfection.' }
      ],
      impact: 'high',
      relatedIndicators: ['statusAccuracy', 'staleIssueRate']
    },
    {
      id: 'df-action-5',
      title: '"Board is Truth" Agreement',
      category: 'culture',
      knowledge: {
        problemSolved: 'The board is a parallel reality to what\'s actually happening. People ask each other for status instead of looking at Jira.',
        whyItWorks: 'When the team commits that the board IS reality (not reflects reality), updating becomes part of doing work, not an extra step.',
        resources: []
      },
      implementation: {
        overview: 'Team commits that the board is the source of truth. If it\'s not on the board, it\'s not happening.',
        steps: [
          { title: 'Discuss in retro', description: 'Ask: "Can we trust our board right now?"', duration: '15 minutes' },
          { title: 'Make the agreement', description: 'Agree: verbal updates don\'t count. Board is truth.', duration: '5 minutes' },
          { title: 'Reinforce consistently', description: 'When someone asks "what\'s happening with X?" - point to board', duration: 'Ongoing' },
          { title: 'Use it as a signal', description: 'If board doesn\'t answer, that\'s a signal to update board, not a verbal conversation', duration: 'Ongoing' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '2-3 weeks to establish',
        effort: 'medium'
      },
      validation: {
        experiments: [
          { name: 'No-Standup Week', description: 'Skip verbal standups for a week. All status happens via Jira only.', duration: '1 week', howToMeasure: 'Did team feel informed? Any surprises?' }
        ],
        successMetrics: [
          { metric: 'Status questions answered by board', target: '90%+ without additional asking', howToMeasure: 'Track how often people need to ask beyond board' },
          { metric: 'Sync meeting reduction', target: 'Reduce status meetings by 50%', howToMeasure: 'Count status-focused meetings before/after' }
        ],
        leadingIndicators: ['People checking board before asking', 'Team language shifting to "board says"'],
        laggingIndicators: ['Async work increases', 'Trust in Jira data']
      },
      pitfalls: {
        commonMistakes: [
          'Declaring "board is truth" without making board trustworthy first',
          'Punishing verbal communication instead of improving board'
        ],
        antiPatterns: [
          'Rigid enforcement that kills collaboration',
          'Using "board is truth" to avoid helping people'
        ],
        warningSignals: [
          'Team rolling eyes at the phrase',
          'Board still not accurate despite agreement'
        ],
        whenToPivot: 'If the board isn\'t trustworthy, fix freshness first. "Board is truth" only works when the board is actually true.'
      },
      faq: [
        { question: 'Does this mean no verbal communication?', answer: 'No - it means status lives in Jira. Collaboration, problem-solving, relationship-building still need conversation.' }
      ],
      impact: 'high',
      minMaturityLevel: 2,
      relatedIndicators: ['statusAccuracy']
    },
    {
      id: 'df-action-6',
      title: 'Stale Issue Dashboard',
      category: 'tooling',
      knowledge: {
        problemSolved: 'Staleness is invisible until someone notices. Problems hide because there\'s no central view of freshness.',
        whyItWorks: 'Public visibility creates gentle accountability. When stale issues are visible to everyone, social pressure encourages updates.',
        resources: []
      },
      implementation: {
        overview: 'Create a visible dashboard showing stale issues to drive updates through transparency.',
        steps: [
          { title: 'Create JQL filter', description: 'status = "In Progress" AND updated < -2d', duration: '2 minutes' },
          { title: 'Create dashboard', description: 'Add this filter as a dashboard gadget', duration: '5 minutes' },
          { title: 'Add count gadget', description: 'Show total stale issues prominently', duration: '3 minutes' },
          { title: 'Make visible', description: 'Display on team TV or shared screen if possible', duration: '5 minutes' },
          { title: 'Review in standup', description: 'Quick check: "Any of these ready to update?"', duration: 'Ongoing' }
        ],
        teamInvolvement: 'individual',
        timeToImplement: '30 minutes',
        effort: 'low',
        toolsRequired: ['Jira Dashboards']
      },
      validation: {
        experiments: [
          { name: 'Freshness Trend Tracking', description: 'Track stale issue count daily for 2 weeks', duration: '2 weeks', howToMeasure: 'Record daily count from dashboard' }
        ],
        successMetrics: [
          { metric: 'Stale issue count', target: '<10% of in-progress at any time', howToMeasure: 'Dashboard count' },
          { metric: 'Time to update after going stale', target: '<24 hours', howToMeasure: 'Track how long issues stay on dashboard' }
        ],
        leadingIndicators: ['Team checking dashboard proactively', 'Competition to reduce stale count'],
        laggingIndicators: ['Sustained low stale issue rate']
      },
      pitfalls: {
        commonMistakes: [
          'Dashboard exists but no one looks at it',
          'No follow-up action on stale issues'
        ],
        antiPatterns: [
          'Using dashboard to shame individuals',
          'Dashboard without conversation about why issues go stale'
        ],
        warningSignals: [
          'Stale count stays constant despite dashboard',
          'Team ignores dashboard'
        ],
        whenToPivot: 'If visibility doesn\'t drive change, add accountability - discuss stale issues specifically in standup.'
      },
      faq: [
        { question: 'How public should the dashboard be?', answer: 'Team-visible is enough. Public shaming backfires. The goal is team awareness.' }
      ],
      impact: 'medium',
      relatedIndicators: ['staleIssueRate']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Awareness first. Find out how stale your data actually is.',
      avoid: 'Don\'t blame individuals. This is a system problem.',
      nextStep: 'Create a stale issue dashboard to make the problem visible.'
    },
    2: {
      focus: 'Build habits. Daily board walks and EOD checks create rhythm.',
      avoid: 'Don\'t automate punishment. Reminders, not penalties.',
      nextStep: 'Run the 48-Hour Challenge experiment.'
    },
    3: {
      focus: 'Systematize with WIP limits. Less concurrent work = fresher data.',
      avoid: 'Don\'t set WIP limits too aggressively. Gradual reduction.',
      nextStep: 'Establish "Board is Truth" as a team value.'
    },
    4: {
      focus: 'Test async capability. Can the board replace some meetings?',
      avoid: 'Don\'t eliminate all sync time. Some collaboration needs presence.',
      nextStep: 'Try the No-Standup Week experiment.'
    },
    5: {
      focus: 'Lead by example. Your freshness practices become the standard.',
      avoid: 'Don\'t assume it\'s "solved." Freshness requires ongoing attention.',
      nextStep: 'Help other teams improve their data freshness.'
    }
  }
};

// Playbook content for Estimation Coverage dimension
export const estimationCoveragePlaybook: DimensionPlaybook = {
  dimensionKey: 'estimationCoverage',
  dimensionName: 'Estimation Coverage',
  overview: 'Estimation coverage measures how consistently your team estimates work before starting it. Without estimates, sprint planning becomes guesswork, velocity is unmeasurable, and forecasting is impossible. Good estimation coverage enables predictable delivery and informed tradeoff decisions.',

  successCriteria: [
    {
      id: 'estimation-rate',
      label: 'Estimation Rate',
      description: 'Percentage of issues estimated before sprint start',
      targetValue: 95,
      unit: '%',
      indicatorId: 'estimationRate'
    },
    {
      id: 'pre-sprint-estimates',
      label: 'Pre-Sprint Estimates',
      description: 'Stories estimated during refinement, not mid-sprint',
      targetValue: 90,
      unit: '%',
      indicatorId: 'preSprintEstimates'
    },
    {
      id: 'estimate-confidence',
      label: 'Estimate Confidence',
      description: 'Team confidence in their estimates',
      targetValue: 80,
      unit: '%',
      indicatorId: 'estimateConfidence'
    }
  ],

  actions: [
    {
      id: 'ec-action-1',
      title: 'No Estimate = No Sprint Gate',
      category: 'quick-win',
      recommendationId: 'ec-action-1',

      knowledge: {
        problemSolved: 'Unestimated work entering sprints makes velocity meaningless, sprint planning unreliable, and capacity invisible.',
        whyItWorks: 'Creating a hard gate forces the habit of estimation at the right time—during refinement, not mid-sprint. When estimation is optional, it gets skipped under time pressure. Making it mandatory ensures it happens.',
        background: 'Many teams start sprints with partially estimated backlogs, hoping to "figure it out" during the sprint. This leads to commitments based on gut feel rather than data, and velocity that fluctuates wildly because it\'s calculated from incomplete information.',
        resources: [
          {
            title: 'Story Point Estimation Guide',
            type: 'article',
            description: 'Best practices for relative estimation using story points—understanding what points measure and how to apply them consistently'
          }
        ]
      },

      implementation: {
        overview: 'Establish a simple, unambiguous rule: issues without estimates cannot enter a sprint. Implement this through process and optionally through automation.',
        steps: [
          { title: 'Define the rule clearly', description: 'In a team meeting, establish: "No story points = not sprint-ready." Get explicit agreement.' },
          { title: 'Create a sprint-ready filter', description: 'Build a Jira filter that shows only estimated issues. Use this filter when pulling into sprints.' },
          { title: 'Enforce in sprint planning', description: 'During planning, if someone suggests pulling an unestimated item, pause and estimate it first—or don\'t pull it.' },
          { title: 'Communicate the change', description: 'Let stakeholders know: items need estimates before they can be scheduled. This encourages earlier refinement.' },
          { title: 'Track compliance', description: 'Monitor what percentage of sprint items have estimates at sprint start. Report in retrospectives.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team must agree to the gate; individuals enforce during planning' },
        timeToImplement: '10 minutes to establish rule, 1-2 sprints to form habit',
        effort: 'low',
        prerequisites: ['Team agreement on estimation approach (points, hours, t-shirt sizes)'],
        toolsRequired: ['Jira board filter']
      },

      validation: {
        experiments: [
          { name: '100% Estimation Sprint', description: 'For one sprint, enforce 100% estimation with zero exceptions—even bugs and urgent items.', duration: '1 sprint', howToMeasure: 'Count items at sprint start. All must have estimates. Track any exceptions and why they happened.' }
        ],
        successMetrics: [
          { metric: 'Sprint estimation rate', target: '100%', howToMeasure: 'Items with estimates / total items at sprint start' },
          { metric: 'Pre-sprint estimation', target: '>90%', howToMeasure: 'Items estimated before sprint planning meeting begins' },
          { metric: 'Velocity reliability', target: 'Calculable', howToMeasure: 'Velocity is a meaningful number, not "N/A" or distorted by unestimated work' }
        ],
        leadingIndicators: ['Estimates appearing during refinement sessions', 'Team questioning unestimated items in planning', 'Decrease in mid-sprint estimation'],
        laggingIndicators: ['Consistent sprint velocity over 3+ sprints', 'Improved forecast accuracy', 'Team confidence in commitments']
      },

      pitfalls: {
        commonMistakes: ['Making exceptions "just this once"—exceptions become the norm', 'Rushing estimates to meet the gate instead of refining the story', 'Applying rule inconsistently across different work types'],
        antiPatterns: ['Single person estimates everything to "save time"', 'Using 0 points as a workaround for the gate', 'Estimating at sprint start instead of during refinement'],
        warningSignals: ['Team groaning about "bureaucratic estimation"', 'Estimates clustering at one value (everything is 3 points)', 'Velocity wildly different from sprint to sprint despite the gate'],
        whenToPivot: 'If the gate creates friction without improving predictability, examine whether the real issue is story quality, not estimation coverage. A gate only works if stories are ready to be estimated.'
      },

      faq: [
        { question: 'What about urgent bugs that come in mid-sprint?', answer: 'Estimate them anyway. It takes 30 seconds. The estimate helps you understand the sprint impact. Use a consistent "default uncertainty" approach—e.g., unrefined bugs default to 3 points if you can\'t discuss as a team.' },
        { question: 'What if we genuinely can\'t estimate something?', answer: 'That\'s a signal the story isn\'t refined enough. Either do more discovery (spike), or break it down until pieces are estimable. "Too uncertain to estimate" means too uncertain to commit to a sprint.' },
        { question: 'Does this apply to sub-tasks?', answer: 'Typically no—estimate at the story level. Sub-tasks are work breakdown, not estimation units. Some teams estimate sub-tasks in hours; that\'s fine but separate from story point estimation.' }
      ],

      impact: 'high',
      relatedIndicators: ['estimationRate', 'preSprintEstimates']
    },
    {
      id: 'ec-action-2',
      title: 'Team Planning Poker Sessions',
      category: 'quick-win',
      recommendationId: 'ec-action-2',

      knowledge: {
        problemSolved: 'Individual estimates miss important perspectives, leading to overconfident numbers that don\'t account for testing, integration, or unexpected complexity.',
        whyItWorks: 'Planning poker forces simultaneous, independent estimation followed by discussion. This surfaces disagreements that would otherwise remain hidden—when two people estimate 2 and 8 for the same story, the discussion reveals critical information.',
        background: 'The Wideband Delphi technique, which planning poker builds on, has been used since the 1970s to improve estimation accuracy. The key insight: averaging independent estimates after discussion produces better results than group discussion followed by a single estimate.',
        resources: [
          {
            title: 'Planning Poker Facilitation Guide',
            type: 'template',
            description: 'Step-by-step guide to running effective estimation sessions including how to handle disagreements and time-boxing discussions'
          }
        ]
      },

      implementation: {
        overview: 'Implement structured team estimation sessions where everyone estimates simultaneously, then discusses outliers before converging on a consensus value.',
        steps: [
          { title: 'Choose your tool', description: 'Options: Jira built-in planning poker, Miro, dedicated apps, or physical cards. Physical cards work great for co-located teams.' },
          { title: 'Set up reference stories', description: 'Before first session, identify 2-3 completed stories at different sizes (e.g., a 2, a 5, an 8) as calibration references.' },
          { title: 'Present the story', description: 'Read the title, description, and acceptance criteria. Answer clarifying questions but don\'t debate yet.' },
          { title: 'Simultaneous vote', description: 'Everyone reveals estimates at the same time. No peeking, no anchoring to others\' estimates.' },
          { title: 'Discuss outliers', description: 'Highest and lowest estimators explain their reasoning. Often they know something others don\'t.' },
          { title: 'Converge and record', description: 'After discussion, re-vote if needed. Record the agreed estimate immediately in Jira.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'All team members who might work on the stories should participate in estimation' },
        timeToImplement: '30 minutes initial setup, ongoing in each refinement',
        effort: 'low',
        prerequisites: ['Refinement meeting on the calendar', 'Backlog items with enough detail to estimate']
      },

      validation: {
        experiments: [
          { name: 'Accuracy comparison', description: 'For 10 stories, compare planning poker estimates vs. estimates from the most senior engineer alone.', duration: '2 sprints', howToMeasure: 'Track actual effort for both sets. Calculate which was more accurate.' }
        ],
        successMetrics: [
          { metric: 'Estimate variance', target: 'Reduced', howToMeasure: 'Standard deviation of estimate accuracy should decrease over time' },
          { metric: 'Team participation', target: '100%', howToMeasure: 'Everyone votes on every story during sessions' },
          { metric: 'Discussion quality', target: 'Outliers explained', howToMeasure: 'When estimates differ, the discussion reveals new information' }
        ],
        leadingIndicators: ['Team members catching each other\'s blind spots', 'More questions asked during story presentation', 'Discussions revealing hidden complexity'],
        laggingIndicators: ['Fewer surprise overruns', 'Improved estimate accuracy over time', 'Team confidence in estimates']
      },

      pitfalls: {
        commonMistakes: ['Letting discussion happen before the vote—kills independent thinking', 'One person dominating the discussion—silences valuable input', 'Skipping re-vote after discussion—loses the point of the technique'],
        antiPatterns: ['Anchor voting: someone reveals early and others adjust', 'Argument voting: loudest person wins', 'Speed voting: rushing to consensus without genuine discussion'],
        warningSignals: ['Same person always has the outlier estimate', 'Discussions feel repetitive and unproductive', 'Team going through the motions without real engagement'],
        whenToPivot: 'If planning poker sessions consistently exceed 90 minutes without good velocity, consider breaking stories down more before estimation. Long estimation sessions often signal insufficient refinement, not an estimation technique problem.'
      },

      faq: [
        { question: 'What if we can\'t reach consensus?', answer: 'After two rounds, use the higher estimate. Better to slightly over-estimate than systematically underestimate. Mark it for retrospective discussion.' },
        { question: 'Should we include non-developers?', answer: 'Yes—testers, designers, and product owners often see complexity developers miss. Everyone who contributes to the work should estimate.' },
        { question: 'What if someone doesn\'t know the technology?', answer: 'They still vote. Their "naive" estimate often catches assumptions others are making. If it\'s wildly off, the discussion explains why and everyone learns.' }
      ],

      impact: 'medium',
      relatedIndicators: ['estimationRate', 'estimateConfidence']
    },
    {
      id: 'ec-action-3',
      title: 'Refinement Estimation Block',
      category: 'process',
      recommendationId: 'ec-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Estimates happening at random times lead to inconsistent sizing, forgotten items, and estimation becoming "someone else\'s job."',
        whyItWorks: 'Dedicating a specific block within refinement for estimation creates a predictable rhythm. The team knows: discussion first, then estimation. Nothing leaves refinement without a number.',
        background: 'Teams often separate refinement from estimation, leading to stories that are "discussed but not sized." When estimation is its own separate activity, it gets deprioritized. Bundling estimation into refinement makes it an integral part of getting work ready.',
        resources: []
      },

      implementation: {
        overview: 'Structure refinement sessions with explicit time dedicated to estimation. The pattern: discuss story, clarify requirements, then immediately estimate before moving to the next story.',
        steps: [
          { title: 'Restructure refinement agenda', description: 'Instead of "discuss all stories, then estimate," use "discuss and estimate each story before moving on."' },
          { title: 'Set time boxes', description: 'Each story gets 10-15 minutes max: 5 minutes discussion, 5 minutes estimation. Larger stories need to be split.' },
          { title: 'Use relative comparison', description: 'For each story, ask: "Is this bigger or smaller than story X we estimated last session?"' },
          { title: 'Record immediately', description: 'Update Jira with the estimate before moving to the next story. Don\'t batch updates.' },
          { title: 'Track the gate', description: 'At end of refinement, confirm: "All discussed items now have estimates?"' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Refinement attendance is required for those who estimate' },
        timeToImplement: '1-2 sprints to establish the rhythm',
        effort: 'medium',
        prerequisites: ['Regular refinement meeting on calendar', 'Stories written with enough detail to discuss']
      },

      validation: {
        experiments: [
          { name: 'Zero unestimated stories', description: 'Track for 3 sprints: how many stories leave refinement without estimates?', duration: '3 sprints', howToMeasure: 'Count stories discussed vs. stories with estimates at end of each refinement.' }
        ],
        successMetrics: [
          { metric: 'Refinement estimation rate', target: '100%', howToMeasure: 'All discussed stories have estimates before session ends' },
          { metric: 'Estimation timing', target: 'During refinement', howToMeasure: 'No estimates added after refinement meeting for the batch of stories discussed' },
          { metric: 'Refinement efficiency', target: '<2 hours/week', howToMeasure: 'Time spent in refinement to produce 1 sprint worth of estimated, ready stories' }
        ],
        leadingIndicators: ['Shorter refinement sessions with same output', 'Fewer "parking lot" items that never get estimated', 'Team reminding each other to estimate before moving on'],
        laggingIndicators: ['No estimation scramble at sprint planning', 'Higher confidence in sprint commitments', 'Predictable refinement → sprint flow']
      },

      pitfalls: {
        commonMistakes: ['Skipping estimation for "simple" stories that end up being complex', 'Letting discussion run over, squeezing out estimation time', 'Different people attending refinement vs. sprint planning'],
        antiPatterns: ['Refinement becomes just a box-checking exercise', 'Estimates assigned rather than discussed', 'Only the tech lead estimates while others disengage'],
        warningSignals: ['Refinement constantly running over time', 'Estimates feeling rushed and inaccurate', 'Stories still have questions after being estimated'],
        whenToPivot: 'If refinement sessions become too long or contentious, you may need smaller batches of stories or pre-refinement async review. The goal is sustainable rhythm, not exhaustive meetings.'
      },

      faq: [
        { question: 'What if a story needs more investigation?', answer: 'Create a spike. The spike itself gets estimated (usually time-boxed: "2-point spike to answer X question"). The original story returns to backlog for later refinement.' },
        { question: 'How many stories should we refine per session?', answer: 'Aim for 1.5-2x your sprint capacity in story points. If you average 40 points per sprint, refine ~60-80 points worth.' },
        { question: 'What about stories that are too big to estimate?', answer: 'If a story exceeds your largest point value (e.g., 8 or 13), it needs to be split. The estimation process reveals this.' }
      ],

      impact: 'high',
      relatedIndicators: ['estimationRate', 'preSprintEstimates']
    },
    {
      id: 'ec-action-4',
      title: 'Reference Story Catalog',
      category: 'process',
      recommendationId: 'ec-action-4',

      knowledge: {
        problemSolved: 'Estimates drift over time—what was a "5" six months ago is now an "8." New team members have no calibration baseline. Story points lose meaning.',
        whyItWorks: 'Reference stories provide concrete anchors: "A 3-point story looks like PROJ-123." Instead of abstract debates about effort, teams can compare: "Is this bigger or smaller than our reference 3?"',
        background: 'Story points are relative measures—they only have meaning in relation to other stories. Without reference points, teams recalibrate unconsciously over time. A catalog makes the calibration explicit and persistent.',
        resources: [
          {
            title: 'Story Point Estimation Guide',
            type: 'article',
            description: 'Understanding relative estimation and maintaining consistent calibration across sprints and team changes'
          }
        ]
      },

      implementation: {
        overview: 'Create and maintain a catalog of completed stories at each point value that serves as your team\'s estimation reference guide.',
        steps: [
          { title: 'Identify candidates', description: 'After 2-3 sprints, review completed work. Find stories where the estimate matched reality well—work took about as long as expected.' },
          { title: 'Select reference stories', description: 'Pick 1-2 examples for each point value you use (1, 2, 3, 5, 8). Aim for variety—different types of work if possible.' },
          { title: 'Document briefly', description: 'Create a simple wiki page or Confluence doc: story link, what made it that size, any notable aspects.' },
          { title: 'Use during estimation', description: 'When estimating, explicitly reference: "This feels like our 5-point reference story PROJ-456."' },
          { title: 'Update periodically', description: 'Every quarter, review the catalog. Replace outdated examples with recent, better ones. Especially important after team changes.' }
        ],
        teamInvolvement: { type: 'representatives', description: 'Senior team member curates; whole team uses during estimation' },
        timeToImplement: '1 sprint to build initial catalog',
        effort: 'medium',
        prerequisites: ['Several sprints of estimation history', 'Access to completed story data']
      },

      validation: {
        experiments: [
          { name: 'New member calibration', description: 'Have a new team member estimate 10 stories before and after reviewing the reference catalog.', duration: '1 sprint', howToMeasure: 'Compare their estimates to team consensus. Does the catalog reduce variance?' }
        ],
        successMetrics: [
          { metric: 'Estimation consistency', target: 'Same-size stories take similar time', howToMeasure: 'Standard deviation of actual effort for same-pointed stories' },
          { metric: 'Catalog usage', target: 'Referenced in most sessions', howToMeasure: 'Team mentions reference stories during estimation discussions' },
          { metric: 'New member ramp-up', target: '<3 sprints to calibration', howToMeasure: 'New team members\' estimates align with team within 3 sprints' }
        ],
        leadingIndicators: ['Team referencing catalog during estimation', 'New members asking about reference stories', 'Fewer large estimate disagreements'],
        laggingIndicators: ['Velocity stability over time', 'Estimate accuracy maintained through team changes', 'Reduced estimation discussion time']
      },

      pitfalls: {
        commonMistakes: ['Catalog gets stale—references from 2 years ago are irrelevant', 'Only one type of work represented—all backend stories, no testing', 'Catalog is created but never used'],
        antiPatterns: ['Reference stories that were actually mis-estimated', 'Using stories only the senior dev understands', 'Treating the catalog as rigid rules rather than guidelines'],
        warningSignals: ['Team can\'t remember what the reference stories are', 'Catalog hasn\'t been updated in 6+ months', 'References are from departed team members\' work'],
        whenToPivot: 'If the catalog isn\'t being used despite being available, the issue may be meeting facilitation. Someone needs to actively pull up references during estimation. Consider assigning a "calibration check" role that rotates.'
      },

      faq: [
        { question: 'How many reference stories do we need?', answer: '1-2 per point value is sufficient. More than that becomes overwhelming. Quality over quantity—pick stories the whole team remembers and understands.' },
        { question: 'What if our best reference story is a year old?', answer: 'Replace it. Good reference stories should be recent enough that team members remember working on them. Aim for examples from the last 6 months.' },
        { question: 'Should reference stories all be the same type?', answer: 'Ideally, no. Include a mix: a backend API story, a frontend feature, a testing story. This helps when estimating diverse work.' }
      ],

      impact: 'medium',
      relatedIndicators: ['estimateConfidence']
    },
    {
      id: 'ec-action-5',
      title: 'Team Ownership of Estimates',
      category: 'culture',
      recommendationId: 'ec-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'When one person estimates for the team, their blind spots become the team\'s blind spots. Estimates miss complexity that other team members would catch.',
        whyItWorks: 'Collective estimation surfaces hidden complexity: testers see testing effort, DevOps sees deployment risk, juniors see learning curves. No single person has complete visibility.',
        background: 'There\'s a natural tendency to let the "expert" estimate—whoever has the most experience with the technology or codebase. But this creates a single point of failure and reduces team buy-in to commitments.',
        resources: []
      },

      implementation: {
        overview: 'Establish the cultural norm that estimates belong to the team, not individuals. Even if one person does the work, the team estimates it together.',
        steps: [
          { title: 'Discuss in retrospective', description: 'Raise the question: "Whose estimates are these?" Explore whether individual or team estimation is happening.' },
          { title: 'Get explicit agreement', description: 'Team agrees: all story estimates require team input. No one estimates alone.' },
          { title: 'Establish the invitation', description: 'When someone starts to estimate solo, gentle redirect: "Let\'s get the team\'s view on this."' },
          { title: 'Celebrate catches', description: 'When team estimation catches something individual would miss, celebrate it: "Good thing we all estimated—QA caught that testing complexity."' },
          { title: 'Include everyone', description: 'Actively invite quiet team members to share their view. "What do you think, [name]?"' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Team-wide culture change' },
        timeToImplement: '2-3 sprints to establish as norm',
        effort: 'medium',
        prerequisites: ['Team refinement sessions', 'Psychological safety to disagree']
      },

      validation: {
        experiments: [
          { name: 'Solo vs. team comparison', description: 'For 10 stories, collect both the lead developer\'s estimate and the team consensus. Compare accuracy after the work is done.', duration: '2 sprints', howToMeasure: 'Track actual effort. Did team estimates or individual estimates prove more accurate?' }
        ],
        successMetrics: [
          { metric: 'Participation rate', target: '100%', howToMeasure: 'Everyone votes during planning poker' },
          { metric: 'Estimate diversity', target: 'Varied estimates before consensus', howToMeasure: 'Initial votes show spread (not everyone votes the same number immediately)' },
          { metric: 'Catch rate', target: 'At least 1 per session', howToMeasure: 'Discussion reveals something the lead would have missed' }
        ],
        leadingIndicators: ['Quieter team members volunteering estimates', 'Productive debate about estimate differences', 'Less reliance on "the expert says"'],
        laggingIndicators: ['Fewer surprise overruns', 'Improved estimate accuracy', 'Higher team confidence in commitments']
      },

      pitfalls: {
        commonMistakes: ['Lip service participation—people vote but don\'t engage', 'Reverting to individual estimation under time pressure', 'Not creating safety for disagreement'],
        antiPatterns: ['Performative team estimation where the lead\'s vote always wins', 'Guilt-tripping people for "wrong" estimates', 'Making estimation feel like a test with right and wrong answers'],
        warningSignals: ['Everyone voting the same number with no discussion', 'One person consistently dominating the conversation', 'Team members skipping estimation sessions'],
        whenToPivot: 'If team estimation becomes a time sink without accuracy improvements, examine whether the team has the information they need to estimate. Perhaps stories need more refinement before estimation, not more discussion during estimation.'
      },

      faq: [
        { question: 'What if someone is consistently wrong?', answer: 'There is no "wrong"—estimates are team property. If someone\'s estimates consistently differ from the rest, use it as a learning opportunity. What do they see that others don\'t, or vice versa?' },
        { question: 'Is this slower than one person estimating?', answer: 'Yes, initially. But the improved accuracy and team buy-in are worth it. Speed comes with practice—mature teams do team estimation quickly.' },
        { question: 'What if the expert strongly disagrees with the team?', answer: 'Discuss it. The expert may have information the team lacks. But the final estimate is still the team\'s decision. Record the concern and revisit if the expert was right.' }
      ],

      impact: 'high',
      relatedIndicators: ['estimateConfidence']
    },
    {
      id: 'ec-action-6',
      title: 'Automated Unestimated Issue Alerts',
      category: 'tooling',
      recommendationId: 'ec-action-6',

      knowledge: {
        problemSolved: 'Issues slip into sprints without estimates despite best intentions. Manual processes fail under time pressure.',
        whyItWorks: 'Automation provides a safety net that catches what humans miss. It\'s not about distrust—it\'s about offloading cognitive load to systems that don\'t forget.',
        background: 'Even teams committed to estimation coverage have gaps. Work gets added mid-sprint, someone forgets to check, an issue type is overlooked. Automation catches these systematically.',
        resources: []
      },

      implementation: {
        overview: 'Create Jira automation rules that alert or prevent unestimated issues from entering sprints.',
        steps: [
          { title: 'Create the automation rule', description: 'In Jira: Project Settings → Automation → Create rule.' },
          { title: 'Set trigger', description: 'Trigger: "When issue moves to sprint" or "Issue added to sprint."' },
          { title: 'Add condition', description: 'Condition: Story Points is empty (or your estimation field).' },
          { title: 'Choose action', description: 'Options: Comment on issue ("This issue needs an estimate"), notify assignee/reporter, or block the transition entirely.' },
          { title: 'Test and refine', description: 'Run for a sprint. Adjust false positives—e.g., exclude sub-tasks if you don\'t estimate those.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person sets up automation; whole team benefits' },
        timeToImplement: '15 minutes',
        effort: 'low',
        prerequisites: ['Jira admin access or automation permissions', 'Defined estimation field (Story Points, etc.)']
      },

      validation: {
        experiments: [
          { name: 'Automation catch rate', description: 'Run the alert for one sprint without blocking. Count how many issues it flags.', duration: '1 sprint', howToMeasure: 'Number of alerts triggered divided by total issues added to sprint.' }
        ],
        successMetrics: [
          { metric: 'Alert rate', target: '<5%', howToMeasure: 'Alerts fired divided by total sprint additions' },
          { metric: 'Response time', target: '<4 hours', howToMeasure: 'Time from alert to estimate being added' },
          { metric: 'Alert trend', target: 'Decreasing', howToMeasure: 'Alerts per sprint should decrease as habit forms' }
        ],
        leadingIndicators: ['Fewer alerts each sprint', 'Team estimating proactively to avoid alerts', 'Alerts caught quickly when they fire'],
        laggingIndicators: ['Near-zero alerts after 3+ sprints', 'Automation running but rarely triggering', 'Team no longer needs the safety net']
      },

      pitfalls: {
        commonMistakes: ['Alert fatigue—too many notifications that get ignored', 'Not excluding legitimate cases (e.g., sub-tasks, spikes)', 'Making alerts punitive rather than helpful'],
        antiPatterns: ['Bypassing the automation by gaming the field', 'Blaming individuals for triggering alerts', 'Turning off automation because it\'s "annoying"'],
        warningSignals: ['Alerts consistently ignored', 'Team entering placeholder estimates to pass the gate', 'Resentment toward the automation'],
        whenToPivot: 'If the automation is triggering constantly without improvement, the problem is upstream—stories aren\'t being refined and estimated before sprint planning. Focus on refinement process rather than adding more automation checks.'
      },

      faq: [
        { question: 'Should we block the transition or just alert?', answer: 'Start with alerts to understand the baseline. Once the team has the habit, you can switch to blocking—but only if the team agrees it\'s helpful, not punitive.' },
        { question: 'What about urgent production issues?', answer: 'Add an exclusion for issue types like "Incident" or "Production Bug" if you truly can\'t estimate those. But consider: even urgent items can get a quick estimate (2 points, 30 seconds).' },
        { question: 'Can I run this across multiple projects?', answer: 'Yes, Jira automation can work at the global or project level. Start with one project, then expand once proven.' }
      ],

      impact: 'medium',
      relatedIndicators: ['estimationRate']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Start with coverage. Get something on every issue, even if imperfect.',
      avoid: 'Don\'t obsess over accuracy yet. Coverage first.',
      nextStep: 'Implement "No Estimate = No Sprint" rule.'
    },
    2: {
      focus: 'Improve consistency. Use team estimation and reference stories.',
      avoid: 'Don\'t let one person estimate for the team.',
      nextStep: 'Build a reference story catalog.'
    },
    3: {
      focus: 'Track accuracy. Compare estimates to actuals systematically.',
      avoid: 'Don\'t punish wrong estimates. Use them to learn.',
      nextStep: 'Run the Estimate vs Actual experiment.'
    },
    4: {
      focus: 'Refine technique. Use data to improve estimation calibration.',
      avoid: 'Don\'t over-engineer. Estimates are guesses, not commitments.',
      nextStep: 'Coach other teams on your estimation practices.'
    },
    5: {
      focus: 'Innovate on forecasting. Use excellent estimates for predictive analytics.',
      avoid: 'Don\'t assume estimates are "done." Continuous improvement.',
      nextStep: 'Share estimation insights across organization.'
    }
  }
};

// Playbook content for Sizing Consistency dimension
export const sizingConsistencyPlaybook: DimensionPlaybook = {
  dimensionKey: 'sizingConsistency',
  dimensionName: 'Sizing Consistency',
  overview: 'Sizing consistency measures whether your estimates are calibrated over time. Inconsistent sizing means a "3-point story" today might be equivalent to a "5-point story" next month, making velocity unreliable. Consistent sizing enables accurate forecasting and capacity planning.',

  successCriteria: [
    {
      id: 'size-variance',
      label: 'Size Variance',
      description: 'Standard deviation of actual effort within same point values',
      targetValue: 20,
      unit: '%',
      indicatorId: 'sizeVariance'
    },
    {
      id: 'point-inflation',
      label: 'Point Inflation Rate',
      description: 'Trend in average points per story over time',
      targetValue: 5,
      unit: '%',
      indicatorId: 'pointInflation'
    },
    {
      id: 'calibration-score',
      label: 'Calibration Score',
      description: 'How well estimates predict actual cycle time',
      targetValue: 80,
      unit: '%',
      indicatorId: 'calibrationScore'
    }
  ],

  actions: [
    {
      id: 'sc-action-1',
      title: 'Adopt Fibonacci Sequence Sizing',
      category: 'quick-win',
      recommendationId: 'sc-action-1',

      knowledge: {
        problemSolved: 'Linear point scales (1, 2, 3, 4, 5) suggest false precision for larger items. The difference between a 4 and 5 is not as meaningful as the scale implies.',
        whyItWorks: 'Fibonacci gaps (1, 2, 3, 5, 8, 13) increase with size, reflecting that larger items have inherently higher uncertainty. This forces teams to acknowledge uncertainty rather than pretend precision.',
        background: 'The Fibonacci sequence was adopted by agile teams because it captures a key insight: as work gets larger, our ability to estimate accurately decreases. The gaps force conversations about splitting large items.',
        resources: [
          {
            title: 'Estimation Calibration Workshop Guide',
            type: 'article',
            description: 'How to run a team calibration session for consistent sizing including exercises to understand relative estimation'
          }
        ]
      },

      implementation: {
        overview: 'Switch your estimation scale to Fibonacci numbers and use the increasing gaps to encourage breaking down large items.',
        steps: [
          { title: 'Update Jira configuration', description: 'Change the Story Points field to use Fibonacci values: 1, 2, 3, 5, 8, 13 (optionally 21 for "definitely split this").' },
          { title: 'Explain the reasoning', description: 'In team meeting, discuss why gaps increase. The jump from 5 to 8 acknowledges: "We\'re less certain about bigger items."' },
          { title: 'Establish rules of thumb', description: 'If you\'re debating between two numbers (e.g., "is it a 3 or 5?"), always pick the higher one.' },
          { title: 'Flag large items', description: 'Anything 13+ should immediately trigger: "Can we split this?" Large estimates are signals, not final answers.' },
          { title: 'Re-estimate legacy items', description: 'Don\'t convert old estimates mathematically. Re-estimate using the new scale based on current understanding.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team needs to understand and adopt the new scale' },
        timeToImplement: '15 minutes to configure, 1-2 sprints to internalize',
        effort: 'low',
        prerequisites: ['Jira admin access to modify field configuration']
      },

      validation: {
        experiments: [
          { name: 'Blind re-estimation', description: 'Re-estimate a sample of completed stories without looking at original estimates. Are new estimates similar?', duration: '1 session', howToMeasure: 'New estimates should be within 1 Fibonacci step of original for 80%+ of items.' }
        ],
        successMetrics: [
          { metric: 'Large item splitting', target: 'No 13+ items in sprint', howToMeasure: 'Stories entering sprint should be 8 or fewer points' },
          { metric: 'Estimate consistency', target: '<20% variance', howToMeasure: 'Standard deviation of cycle time within each point value' },
          { metric: 'Team adoption', target: '100%', howToMeasure: 'All team members using Fibonacci values correctly' }
        ],
        leadingIndicators: ['Team naturally saying "that feels like a 5, not a 4"', 'More discussions about splitting large items', 'Fewer estimation debates about adjacent values'],
        laggingIndicators: ['More consistent velocity over time', 'Fewer surprise overruns on large items', 'Improved forecast accuracy']
      },

      pitfalls: {
        commonMistakes: ['Converting old estimates mathematically instead of re-estimating', 'Using 0 for "trivial" work (track it as 1 or don\'t estimate)', 'Treating the scale as linear ("8 is about 2.5x a 3")'],
        antiPatterns: ['Averaging Fibonacci numbers ("it\'s between 5 and 8, so 6.5")', 'Using non-Fibonacci values (4, 6, 7, 9)', 'Ignoring the signal that large items need splitting'],
        warningSignals: ['Many items estimated at 13+', 'Velocity still wildly inconsistent', 'Team treating Fibonacci as the same as linear'],
        whenToPivot: 'If the team struggles with the concept after 3 sprints, consider using T-shirt sizes first (S/M/L/XL), then mapping to Fibonacci.'
      },

      faq: [
        { question: 'Why not just use 1-10?', answer: 'Linear scales encourage false precision. The difference between 6 and 7 is negligible but debates waste time. Fibonacci gaps are meaningful.' },
        { question: 'What about items smaller than 1?', answer: 'Use 1 as your minimum. If something is truly trivial, either don\'t estimate it (sub-task) or batch multiple trivial items.' },
        { question: 'Can we use 21 or 34?', answer: 'Yes, but these should be rare and always trigger splitting. If you frequently have 21+ items, your refinement isn\'t breaking work down enough.' }
      ],

      impact: 'medium',
      relatedIndicators: ['sizeVariance']
    },
    {
      id: 'sc-action-2',
      title: 'T-Shirt Size to Points Mapping',
      category: 'quick-win',
      recommendationId: 'sc-action-2',

      knowledge: {
        problemSolved: 'Teams new to estimation struggle with abstract point values. "Is this a 3 or a 5?" becomes a debate without clear anchors.',
        whyItWorks: 'T-shirt sizes (S/M/L/XL) are intuitive—everyone has an instinct for "small" vs "large." Mapping these to consistent point values combines intuition with precision.',
        background: 'T-shirt sizing emerged as a way to make estimation more accessible. By separating the intuitive categorization from the numeric value, teams can estimate faster and more consistently.',
        resources: []
      },

      implementation: {
        overview: 'Use T-shirt sizes for initial categorization, then convert to points using a consistent mapping for tracking and forecasting.',
        steps: [
          { title: 'Define the mapping', description: 'Establish: S=1, M=3, L=5, XL=8. Document this where everyone can reference it.' },
          { title: 'Train the team', description: 'Practice on completed stories: "Was this a Small, Medium, Large, or XL?" Get calibrated.' },
          { title: 'Use in refinement', description: 'When discussing a story, first ask "What size bucket is this?" Then record the corresponding points.' },
          { title: 'Flag XL for splitting', description: 'Any XL (8+ points) should be discussed: "Can we break this into M and L pieces?"' },
          { title: 'Track conversion accuracy', description: 'After a few sprints, check if S stories really take S effort. Adjust mapping if needed.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'All team members use the same sizing language' },
        timeToImplement: '20 minutes to establish, 1 sprint to practice',
        effort: 'low',
        prerequisites: ['Team agreement on the mapping']
      },

      validation: {
        experiments: [
          { name: 'Dual estimation', description: 'For one sprint, estimate using both T-shirts and direct points. Compare which produces more consistent results.', duration: '1 sprint', howToMeasure: 'Track estimate accuracy for both methods. Which has lower variance?' }
        ],
        successMetrics: [
          { metric: 'Estimation speed', target: '<2 min per item', howToMeasure: 'Time from story presentation to recorded estimate' },
          { metric: 'Size accuracy', target: '>80% correct bucket', howToMeasure: 'Post-sprint, was the size bucket (S/M/L) accurate?' },
          { metric: 'Team alignment', target: 'First vote agreement', howToMeasure: 'How often does the team agree on size in first vote?' }
        ],
        leadingIndicators: ['Faster estimation sessions', 'More confident initial votes', 'Easier onboarding for new team members'],
        laggingIndicators: ['Consistent velocity', 'Accurate sprint commitments', 'Reduced estimation fatigue']
      },

      pitfalls: {
        commonMistakes: ['Creating too many categories (XXS, XS, S, M, L, XL, XXL...)', 'Different team members using different mappings', 'Not flagging XL for splitting'],
        antiPatterns: ['Using T-shirts but never converting to points', 'Arguing about S vs M as much as 2 vs 3', 'Making the mapping too complex'],
        warningSignals: ['Everything is "Medium"', 'Team skips the T-shirt step', 'Mapping doesn\'t reflect actual effort patterns'],
        whenToPivot: 'If T-shirt sizing doesn\'t reduce estimation friction after 2 sprints, go back to direct Fibonacci estimation with reference stories.'
      },

      faq: [
        { question: 'What about XXL?', answer: 'XXL = don\'t estimate, split first. If it\'s that large, we don\'t know enough to put a number on it.' },
        { question: 'Can we use this for roadmap planning?', answer: 'Yes, T-shirt sizes work well for high-level roadmap items where precision isn\'t possible. Just note you\'ll re-estimate when items get closer.' },
        { question: 'What if the mapping doesn\'t fit our team?', answer: 'Adjust it based on data. If your S items average 2 points effort, update S=2. The mapping should reflect your team\'s reality.' }
      ],

      impact: 'medium',
      relatedIndicators: ['sizeVariance', 'calibrationScore']
    },
    {
      id: 'sc-action-3',
      title: 'Quarterly Velocity Calibration Sessions',
      category: 'process',
      recommendationId: 'sc-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Estimation calibration drifts over time. What the team called a "3" six months ago might now be estimated as a "5"—making historical velocity comparisons meaningless.',
        whyItWorks: 'Regular calibration sessions force the team to compare current estimates against historical baselines. This surfaces drift before it compounds and makes velocity unreliable.',
        background: 'Calibration drift is natural as teams, technologies, and codebases evolve. Without explicit recalibration, teams unknowingly inflate estimates over time, making quarter-over-quarter comparisons invalid.',
        resources: [
          {
            title: 'Velocity Trend Analysis Template',
            type: 'template',
            description: 'Spreadsheet for tracking velocity trends and point inflation over multiple quarters'
          }
        ]
      },

      implementation: {
        overview: 'Schedule quarterly sessions to review completed work and verify that your point values remain consistent with historical calibration.',
        steps: [
          { title: 'Schedule recurring session', description: 'Add a 2-hour quarterly meeting: "Estimation Calibration Review." Include the core team.' },
          { title: 'Prepare the data', description: 'Pull completed stories from the last quarter. Group by point value. Select 2-3 random examples per size.' },
          { title: 'Blind re-estimate', description: 'Show stories without original estimates. Have team estimate each. Compare to original.' },
          { title: 'Identify drift', description: 'Look for patterns: "We estimated this 3 last quarter, but now it feels like a 5." Discuss what changed.' },
          { title: 'Update references', description: 'If calibration has drifted, acknowledge it. Update reference stories. Decide whether to recalibrate going forward.' },
          { title: 'Document findings', description: 'Record the calibration decisions. Note any adjustments for future comparison.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Core team attends; estimates come from the full team' },
        timeToImplement: '2 hours quarterly',
        effort: 'medium',
        prerequisites: ['3+ months of estimation history', 'Completed stories with original estimates']
      },

      validation: {
        experiments: [
          { name: 'Cycle time by size analysis', description: 'Plot actual cycle time against estimated points for completed stories. Is the correlation stable?', duration: '3 sprints', howToMeasure: 'Correlation coefficient between points and cycle time. Should be >0.7 and stable quarter-over-quarter.' }
        ],
        successMetrics: [
          { metric: 'Re-estimate accuracy', target: '>80% within 1 step', howToMeasure: 'Blind re-estimates match original estimates within 1 Fibonacci step' },
          { metric: 'Point inflation rate', target: '<10% annual drift', howToMeasure: 'Average points per story shouldn\'t increase more than 10% year-over-year without explanation' },
          { metric: 'Velocity stability', target: '<15% variance', howToMeasure: 'Sprint-to-sprint velocity variance after accounting for team changes' }
        ],
        leadingIndicators: ['Team noticing potential drift during sprint', 'Proactive discussions about sizing changes', 'Reference stories actively used'],
        laggingIndicators: ['Reliable multi-quarter forecasts', 'Consistent capacity planning', 'Meaningful year-over-year velocity comparison']
      },

      pitfalls: {
        commonMistakes: ['Skipping the session when busy', 'Not preparing data in advance', 'Only senior members attending'],
        antiPatterns: ['Forcing recalibration to match desired velocity', 'Ignoring legitimate reasons for drift', 'Making it a blame exercise'],
        warningSignals: ['Each quarter shows significant drift', 'Team can\'t agree on calibration', 'Session becomes contentious'],
        whenToPivot: 'If calibration drift is frequent and severe, the issue may be story quality, not estimation. Focus on refinement and definition of done before adding more calibration sessions.'
      },

      faq: [
        { question: 'What if velocity has legitimately changed?', answer: 'That\'s fine! Document why (new team members, tech debt, platform changes). Calibration isn\'t about forcing stability—it\'s about understanding changes.' },
        { question: 'How do we handle team turnover?', answer: 'New members shift calibration naturally. Use the session to explicitly recalibrate with the current team, then document the new baseline.' },
        { question: 'Is quarterly often enough?', answer: 'For most teams, yes. If you have high turnover or rapidly changing tech, consider bi-monthly. More than monthly becomes overhead.' }
      ],

      impact: 'high',
      relatedIndicators: ['pointInflation', 'calibrationScore']
    },
    {
      id: 'sc-action-4',
      title: 'Maximum Story Size Rule',
      category: 'process',
      recommendationId: 'sc-action-4',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Large items are hard to estimate consistently. An 8-point story might take 2 days or 2 weeks depending on hidden complexity.',
        whyItWorks: 'Smaller items have lower variance. By forcing breakdown of large items, you convert one uncertain estimate into multiple more-certain estimates. The pieces are easier to calibrate.',
        background: 'Research consistently shows that estimate accuracy decreases with size. Smaller items have faster feedback loops—you discover problems earlier. Breaking down large items also reveals hidden work.',
        resources: []
      },

      implementation: {
        overview: 'Establish a firm rule: nothing over 8 points enters a sprint without being split. Use the estimation moment to drive breakdown.',
        steps: [
          { title: 'Set the maximum', description: 'Team agrees: "Nothing over 8 points goes into a sprint." 8 is recommended; some teams use 5.' },
          { title: 'Make it a gate', description: 'In sprint planning, if something is estimated >8, it cannot be pulled until it\'s split.' },
          { title: 'Train splitting skills', description: 'Practice breaking work by feature slice (not by task type). Each piece should deliver incremental value.' },
          { title: 'Re-estimate after splitting', description: 'The pieces may add up to more than the original—that\'s expected. Splitting reveals hidden work.' },
          { title: 'Track large item sources', description: 'Which types of work frequently exceed the limit? Address upstream (better requirements, earlier spikes).' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team enforces the rule; product owner helps prioritize split pieces' },
        timeToImplement: 'Starts next refinement session',
        effort: 'medium',
        prerequisites: ['Fibonacci or limited point scale', 'Team agreement on the limit']
      },

      validation: {
        experiments: [
          { name: 'Large item tracking', description: 'For 3 sprints, track what happens to items estimated >8. How long did splitting take? What was discovered?', duration: '3 sprints', howToMeasure: 'Document each large item: original estimate, time to split, pieces created, hidden work found.' }
        ],
        successMetrics: [
          { metric: 'Sprint item sizes', target: 'All ≤8 points', howToMeasure: 'No stories in sprint backlog exceed the limit' },
          { metric: 'Hidden work discovered', target: 'Visible trend', howToMeasure: 'Track how often splitting reveals previously unknown work' },
          { metric: 'Estimate accuracy for split items', target: '>85%', howToMeasure: 'Split pieces complete within estimate more often than original large items did' }
        ],
        leadingIndicators: ['Product owner bringing smaller stories to refinement', 'Team proactively suggesting splits', 'Fewer late-sprint surprises'],
        laggingIndicators: ['More predictable sprints', 'Higher completion rates', 'Reduced carryover']
      },

      pitfalls: {
        commonMistakes: ['Splitting by task type (frontend/backend/testing) instead of feature slice', 'Not re-estimating after splitting', 'Making exceptions for "urgent" large items'],
        antiPatterns: ['Splitting into pieces that can\'t be delivered independently', 'Creating artificial splits to game the rule', 'Product owner pushing back on all splits'],
        warningSignals: ['Stories split into dependent pieces that bottleneck', 'Split pieces always add up to much more than original', 'Team spending more time splitting than doing'],
        whenToPivot: 'If splitting takes excessive time or creates coordination overhead, work on story quality earlier in the process. The issue may be unclear requirements, not story size.'
      },

      faq: [
        { question: 'What if the work genuinely can\'t be split?', answer: 'It almost always can. The question is whether the split pieces can deliver independent value. If truly unsplittable, consider it a spike to reduce uncertainty, then re-estimate.' },
        { question: 'Do split pieces have to be in the same sprint?', answer: 'No. Each piece should be independently prioritizable. The product owner might choose to deliver piece A now and piece B later.' },
        { question: 'What about tech debt or infrastructure work?', answer: 'Same rule applies. Large infrastructure work should be broken into incremental improvements. "Make the database faster" becomes specific, smaller optimizations.' }
      ],

      impact: 'high',
      relatedIndicators: ['sizeVariance']
    },
    {
      id: 'sc-action-5',
      title: 'Protect Estimate Integrity',
      category: 'culture',
      recommendationId: 'sc-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Estimates get pressured down to fit deadlines, making them meaningless for planning and forecasting. "How long will it take?" becomes "How long do you want it to take?"',
        whyItWorks: 'When estimates reflect reality rather than wishes, they become useful for decision-making. Honest estimates let stakeholders make real tradeoffs: adjust scope, add resources, or change deadlines.',
        background: 'Estimate negotiation is a common dysfunction. When told "that seems too high," teams learn to pad estimates or give numbers that satisfy stakeholders rather than inform them. This undermines the entire purpose of estimation.',
        resources: []
      },

      implementation: {
        overview: 'Establish a cultural norm that estimates are observations about effort, not targets to negotiate. When timelines don\'t fit, change scope—not estimates.',
        steps: [
          { title: 'Discuss with stakeholders', description: 'Have a direct conversation: "Estimates tell us about effort. If they don\'t fit your timeline, let\'s discuss scope, not numbers."' },
          { title: 'Practice the response', description: 'When asked to reduce an estimate, say: "The work is what it is. Would you like to reduce scope, or should we discuss alternatives?"' },
          { title: 'Track pressure patterns', description: 'Note when estimate pressure happens. Who, when, what types of work? Address patterns in retrospectives.' },
          { title: 'Celebrate integrity', description: 'When someone holds an estimate despite pressure and is proven right, acknowledge it publicly.' },
          { title: 'Educate continuously', description: 'Remind stakeholders regularly: accurate estimates help everyone. Inflated or deflated estimates help no one.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone must hold the line; leadership must support' },
        timeToImplement: '2-3 sprints to establish norm',
        effort: 'medium',
        prerequisites: ['Leadership buy-in', 'Psychological safety to push back']
      },

      validation: {
        experiments: [
          { name: 'Pressure tracking', description: 'For one quarter, track every instance of estimate pressure. Who applied it? What was the outcome? Did the original estimate prove accurate?', duration: '1 quarter', howToMeasure: 'Log instances, track outcomes, analyze patterns.' }
        ],
        successMetrics: [
          { metric: 'Pressure incidents', target: 'Decreasing trend', howToMeasure: 'Count of times estimates are questioned/pushed back' },
          { metric: 'Estimate accuracy', target: '>80%', howToMeasure: 'Work completes within estimate (not artificially padded estimates)' },
          { metric: 'Stakeholder trust', target: 'Qualitative improvement', howToMeasure: 'Stakeholders accept estimates without negotiation' }
        ],
        leadingIndicators: ['Stakeholders asking "what scope fits this timeline?" instead of "can you do it faster?"', 'Team comfortable saying "no" to pressure', 'Alternative solutions proposed during estimation'],
        laggingIndicators: ['Reliable forecasts', 'Less end-of-sprint crunch', 'Healthier team dynamics']
      },

      pitfalls: {
        commonMistakes: ['Being rigid without explaining why', 'Not offering alternatives when estimates don\'t fit', 'Letting frustration show during pressure conversations'],
        antiPatterns: ['Secretly padding estimates to handle future pressure', 'Caving to pressure then complaining later', 'Making estimates a battleground rather than a conversation'],
        warningSignals: ['Team becomes defensive about estimates', 'Estimates secretly inflated "just in case"', 'Stakeholders bypass estimation entirely'],
        whenToPivot: 'If stakeholder relationships deteriorate, schedule a dedicated conversation about estimation philosophy. The goal is partnership, not adversarial negotiation.'
      },

      faq: [
        { question: 'What if leadership demands faster delivery?', answer: 'Offer real options: "We can deliver feature A this sprint, or a reduced version of A+B. Which would you prefer?" Estimates inform tradeoffs; they don\'t change reality.' },
        { question: 'Are estimates ever wrong?', answer: 'Of course! But the response should be learning, not pressure. If estimates are consistently off, improve the estimation process—don\'t just reduce numbers.' },
        { question: 'What about estimates for external clients?', answer: 'Same principle. Giving clients unrealistic estimates leads to missed deadlines and lost trust. Accurate estimates build credibility.' }
      ],

      impact: 'high',
      relatedIndicators: ['calibrationScore']
    },
    {
      id: 'sc-action-6',
      title: 'Size Distribution Dashboard',
      category: 'tooling',
      recommendationId: 'sc-action-6',

      knowledge: {
        problemSolved: 'Without visibility into sizing patterns, drift goes unnoticed. By the time velocity becomes unreliable, months of bad data have accumulated.',
        whyItWorks: 'A dashboard showing size distribution over time makes drift immediately visible. If 5-point stories are becoming more common, you see it before it compounds.',
        background: 'Point inflation is subtle. Each quarter, stories get slightly larger estimates. After a year, what was a 5 is now an 8. A dashboard catches this early by showing distribution shifts.',
        resources: [
          {
            title: 'Velocity Trend Analysis',
            type: 'template',
            description: 'Spreadsheet template for tracking velocity trends and identifying point inflation patterns'
          }
        ]
      },

      implementation: {
        overview: 'Build a Jira dashboard that visualizes story size distribution over time, enabling early detection of calibration drift.',
        steps: [
          { title: 'Create the JQL query', description: 'Query for completed stories by sprint: project = X AND sprint in closedSprints() AND type = Story' },
          { title: 'Build the chart', description: 'Create a pie or bar chart showing count of stories per point value for each sprint.' },
          { title: 'Add trend visualization', description: 'Show average points per story over time. Plot sprint-by-sprint to see drift.' },
          { title: 'Set up alerts', description: 'If average points per story increases >10% quarter-over-quarter, trigger a review.' },
          { title: 'Review regularly', description: 'Check the dashboard monthly. Use data in calibration sessions.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person builds; whole team reviews' },
        timeToImplement: '30 minutes initial build',
        effort: 'low',
        prerequisites: ['Jira dashboard access', 'Historical sprint data']
      },

      validation: {
        experiments: [
          { name: 'Drift detection test', description: 'Build the dashboard and review 6 months of data. Did any drift occur that wasn\'t noticed?', duration: '1 session', howToMeasure: 'Compare size distributions quarter-over-quarter. Any unexplained changes?' }
        ],
        successMetrics: [
          { metric: 'Dashboard usage', target: 'Reviewed monthly', howToMeasure: 'Dashboard views logged at least monthly' },
          { metric: 'Early drift detection', target: '<1 quarter lag', howToMeasure: 'Drift noticed within 1 quarter of starting' },
          { metric: 'Data-driven calibration', target: 'Used in sessions', howToMeasure: 'Dashboard data referenced in calibration discussions' }
        ],
        leadingIndicators: ['Team members checking the dashboard', 'Questions raised about distribution changes', 'Data used in retrospectives'],
        laggingIndicators: ['Earlier drift correction', 'More stable velocity over time', 'Better forecasting accuracy']
      },

      pitfalls: {
        commonMistakes: ['Building dashboard but never checking it', 'Making it too complex', 'Focusing on individual stories instead of trends'],
        antiPatterns: ['Using the dashboard punitively', 'Overreacting to normal variance', 'Ignoring the dashboard when it shows inconvenient truth'],
        warningSignals: ['Dashboard hasn\'t been updated in months', 'Team doesn\'t know it exists', 'Data doesn\'t match perceived reality'],
        whenToPivot: 'If the dashboard isn\'t being used after 3 months, integrate size distribution into an existing report that the team already reviews.'
      },

      faq: [
        { question: 'What if we don\'t have historical data?', answer: 'Start now. You\'ll have useful data in 2-3 months. Don\'t wait for perfect history—start building it.' },
        { question: 'How much variance is normal?', answer: 'Sprint-to-sprint variance is normal. Quarter-over-quarter trends should be stable (±10%). Investigate sustained shifts.' },
        { question: 'Should we share this with stakeholders?', answer: 'Yes, selectively. It can help stakeholders understand how estimation calibration works and why velocity comparisons need context.' }
      ],

      impact: 'medium',
      relatedIndicators: ['pointInflation']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Establish baseline. Use a consistent scale across all items.',
      avoid: 'Don\'t compare velocity across teams with different calibrations.',
      nextStep: 'Adopt Fibonacci sequence for natural uncertainty recognition.'
    },
    2: {
      focus: 'Create anchors. Build reference stories for each point value.',
      avoid: 'Don\'t allow pressure to change estimates.',
      nextStep: 'Implement maximum size rule and break down large items.'
    },
    3: {
      focus: 'Monitor drift. Track sizing patterns over time.',
      avoid: 'Don\'t ignore gradual point inflation.',
      nextStep: 'Run quarterly calibration sessions.'
    },
    4: {
      focus: 'Correlate with reality. Compare points to cycle time.',
      avoid: 'Don\'t over-engineer. Some variance is natural.',
      nextStep: 'Run the Cycle Time by Size experiment.'
    },
    5: {
      focus: 'Organizational alignment. Help other teams calibrate.',
      avoid: 'Don\'t force same calibration across teams—relative is fine.',
      nextStep: 'Share calibration practices organization-wide.'
    }
  }
};

// Playbook content for Issue Type Consistency dimension
export const issueTypeConsistencyPlaybook: DimensionPlaybook = {
  dimensionKey: 'issueTypeConsistency',
  dimensionName: 'Issue Type Consistency',
  overview: 'Issue type consistency measures whether your team uses issue types (Story, Bug, Task, etc.) consistently and appropriately. Inconsistent usage makes reporting unreliable, obscures the nature of work, and creates confusion about expectations. Consistent typing enables accurate metrics and clear communication.',

  successCriteria: [
    {
      id: 'type-accuracy',
      label: 'Type Accuracy',
      description: 'Percentage of issues correctly categorized by type',
      targetValue: 90,
      unit: '%',
      indicatorId: 'typeAccuracy'
    },
    {
      id: 'type-distribution',
      label: 'Type Distribution',
      description: 'Healthy balance between stories, bugs, and tasks',
      targetValue: 85,
      unit: '%',
      indicatorId: 'typeDistribution'
    },
    {
      id: 'misuse-rate',
      label: 'Type Misuse Rate',
      description: 'Issues that should be a different type',
      targetValue: 5,
      unit: '%',
      indicatorId: 'misuseRate'
    }
  ],

  actions: [
    {
      id: 'itc-action-1',
      title: 'Create Issue Type Definitions',
      category: 'quick-win',
      recommendationId: 'itc-action-1',

      knowledge: {
        problemSolved: 'Team members guess which issue type to use, leading to inconsistent categorization and unreliable reporting.',
        whyItWorks: 'Clear, simple definitions remove ambiguity. When everyone shares the same understanding, they make consistent choices. Definitions become the reference point for corrections.',
        background: 'Jira ships with many issue types, but teams rarely need them all. The confusion isn\'t in Jira—it\'s in unclear team agreements about what each type means in their context.',
        resources: [
          {
            title: 'Issue Type Best Practices',
            type: 'article',
            description: 'Guide to defining and using issue types effectively in Jira, including examples and common pitfalls'
          }
        ]
      },

      implementation: {
        overview: 'Create simple, memorable definitions for each issue type your team actually uses. Document and socialize them.',
        steps: [
          { title: 'List active issue types', description: 'Which types does your project actually use? Ignore types that exist but aren\'t used.' },
          { title: 'Write 1-2 sentence definitions', description: 'Keep it simple. Story: "User-facing feature with business value." Bug: "Something that used to work but is now broken." Task: "Technical work without direct user impact." Spike: "Timeboxed research to answer a question."' },
          { title: 'Document accessibly', description: 'Put definitions in team wiki, Confluence, or Jira project description. Wherever the team will actually see it.' },
          { title: 'Review with team', description: 'In a team meeting, walk through definitions. Get agreement or refine based on feedback.' },
          { title: 'Add examples', description: 'For each type, provide 2-3 real examples from your backlog. "PROJ-123 is a Story because..."' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Team agrees on definitions; one person documents' },
        timeToImplement: '30 minutes to write, 1 meeting to review',
        effort: 'low',
        prerequisites: ['Access to team documentation location']
      },

      validation: {
        experiments: [
          { name: 'Type prediction game', description: 'Read issue titles/descriptions aloud without showing the type. Team guesses the type. Check actual type.', duration: '1 session', howToMeasure: 'High prediction accuracy means types are consistent. Low accuracy reveals confusion points.' }
        ],
        successMetrics: [
          { metric: 'Definition awareness', target: '100%', howToMeasure: 'All team members can state the difference between Story, Bug, Task' },
          { metric: 'Type accuracy', target: '>90%', howToMeasure: 'Random sample of recent issues are correctly typed' },
          { metric: 'Reference usage', target: 'Definitions cited in discussions', howToMeasure: 'Team refers to definitions when uncertain' }
        ],
        leadingIndicators: ['Team members asking "is this a Story or Task?"', 'Corrections happening in refinement', 'New members finding and using definitions'],
        laggingIndicators: ['Lower mistype rate', 'More accurate reports', 'Less time spent on type debates']
      },

      pitfalls: {
        commonMistakes: ['Making definitions too complex', 'Not reviewing with team—just publishing', 'Forgetting to update when types change'],
        antiPatterns: ['Definitions that require reading 3 paragraphs', 'Using Jira\'s default descriptions verbatim', 'Creating definitions that don\'t match how team actually works'],
        warningSignals: ['No one remembers the definitions', 'Definitions don\'t match reality', 'Type debates persist despite definitions'],
        whenToPivot: 'If debates continue after 2 sprints with definitions, the issue may be too many types. Consider consolidating to fewer types.'
      },

      faq: [
        { question: 'What about Sub-tasks?', answer: 'Sub-tasks are work breakdown, not categorization. They inherit the parent\'s purpose. Don\'t overthink sub-task "types."' },
        { question: 'What if our org mandates certain types?', answer: 'Define how your team interprets them. "The org says Epic, we use it for [specific meaning]." Local clarity within org constraints.' },
        { question: 'How detailed should definitions be?', answer: 'One to two sentences max. If you need more, the type is probably too broad or overlapping with others.' }
      ],

      impact: 'high',
      relatedIndicators: ['typeAccuracy', 'misuseRate']
    },
    {
      id: 'itc-action-2',
      title: 'Issue Type Selection Decision Tree',
      category: 'quick-win',
      recommendationId: 'itc-action-2',

      knowledge: {
        problemSolved: 'Even with definitions, people face uncertainty in the moment of creating an issue. "Is this a Bug or a Story?"',
        whyItWorks: 'A decision tree provides step-by-step guidance that eliminates guesswork. It operationalizes definitions into a quick reference.',
        background: 'Decision trees work because they sequence questions in order of importance. "Is it broken?" comes before "Is it user-facing?" because bugs take priority in classification.',
        resources: [
          {
            title: 'Issue Type Decision Tree Template',
            type: 'template',
            description: 'Visual flowchart for selecting the right issue type with example questions and branches'
          }
        ]
      },

      implementation: {
        overview: 'Create a simple flowchart that guides issue type selection through yes/no questions.',
        steps: [
          { title: 'Identify decision points', description: 'What questions distinguish your types? "Is it broken?" "Does it have user value?" "Is it research?"' },
          { title: 'Order the questions', description: 'Start with the most distinguishing question. Bug/not-bug is often first because bugs are distinct.' },
          { title: 'Create the flowchart', description: 'Use simple boxes and arrows. Keep it to one page. Tools: Miro, Lucidchart, or even a text-based tree.' },
          { title: 'Add to team wiki', description: 'Put it where people create issues. If possible, link from Jira\'s create issue screen.' },
          { title: 'Practice as team', description: 'Run through 10 real issues using the decision tree. Does it produce the right type consistently?' }
        ],
        teamInvolvement: { type: 'representatives', description: 'One person creates; team validates with real examples' },
        timeToImplement: '20 minutes to create, 1 meeting to validate',
        effort: 'low',
        prerequisites: ['Issue type definitions already established']
      },

      validation: {
        experiments: [
          { name: 'Decision tree accuracy test', description: 'Take 20 correctly-typed issues. Run each through the decision tree. Does it produce the correct type?', duration: '30 minutes', howToMeasure: 'Decision tree should match actual type for >95% of issues.' }
        ],
        successMetrics: [
          { metric: 'Tree accuracy', target: '>95%', howToMeasure: 'Tree produces correct type for sample issues' },
          { metric: 'Tree usage', target: 'Referenced weekly', howToMeasure: 'New issues reference the decision tree during creation' },
          { metric: 'Typing speed', target: '<30 seconds', howToMeasure: 'Time from "what type?" to selecting the type' }
        ],
        leadingIndicators: ['Team members bookmarking the tree', 'Questions during issue creation decreasing', 'New team members using tree independently'],
        laggingIndicators: ['More consistent typing across team', 'Fewer type corrections needed', 'Faster issue creation']
      },

      pitfalls: {
        commonMistakes: ['Making the tree too complex with too many branches', 'Not updating tree when types change', 'Tree produces wrong answer for edge cases'],
        antiPatterns: ['Tree with 20+ decision points', 'Different trees for different people', 'Tree that\'s never actually used'],
        warningSignals: ['People bypass the tree', 'Tree gives wrong answers frequently', 'Team can\'t remember where the tree is'],
        whenToPivot: 'If the tree is too complex to follow quickly, you probably have too many issue types. Simplify the types first.'
      },

      faq: [
        { question: 'What if an issue could be multiple types?', answer: 'The tree should force a choice. If "Bug or Story?" is common, add a question that distinguishes them. Usually: "Was it ever working?" Bug = yes, Story = no.' },
        { question: 'Should sub-tasks use the tree?', answer: 'Usually no. Sub-tasks inherit context from parent. The tree is for parent-level issue creation.' },
        { question: 'What about Epics?', answer: 'Epics are usually obvious—they\'re containers for related work. The tree is most useful for Story/Bug/Task/Spike decisions.' }
      ],

      impact: 'medium',
      relatedIndicators: ['typeAccuracy']
    },
    {
      id: 'itc-action-3',
      title: 'Type Check in Refinement',
      category: 'process',
      recommendationId: 'itc-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Issues are created with wrong types and the error propagates through planning and execution, distorting metrics.',
        whyItWorks: 'Refinement is when the team discusses each issue in detail. Adding a quick type check ensures errors are caught before work begins, when correction is cheap.',
        background: 'Most type errors occur at creation time and persist because no one reviews them. Refinement is the natural checkpoint—you\'re already looking at each issue carefully.',
        resources: []
      },

      implementation: {
        overview: 'Add a brief type verification step to your refinement process. For each issue discussed, ask: "Is this the right type?"',
        steps: [
          { title: 'Add to refinement agenda', description: 'After discussing an issue\'s content, add one question: "Is this correctly typed as a [Story/Bug/Task]?"' },
          { title: 'Know common corrections', description: 'Train the team on typical errors: "Bug" that\'s actually a feature request → Story. "Task" with user impact → Story. "Story" without user value → Task.' },
          { title: 'Correct immediately', description: 'If type is wrong, change it in Jira right then. Don\'t "note it for later."' },
          { title: 'Track correction patterns', description: 'Keep informal notes: "We corrected 3 bugs → stories this session." Patterns reveal where guidance is needed.' },
          { title: 'Improve upstream', description: 'If same errors keep happening, address at source. Train the person who creates most issues.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone in refinement participates in type checking' },
        timeToImplement: 'Starts next refinement session',
        effort: 'low',
        prerequisites: ['Issue type definitions exist', 'Regular refinement meetings']
      },

      validation: {
        experiments: [
          { name: 'Type audit sprint', description: 'For one sprint, review every item and verify type is correct. Track how many need correction.', duration: '1 sprint', howToMeasure: 'Correction rate = items needing type change / total items. Target: <10%.' }
        ],
        successMetrics: [
          { metric: 'Correction rate', target: '<5%', howToMeasure: 'Items needing type correction divided by total refined items' },
          { metric: 'Time per check', target: '<15 seconds', howToMeasure: 'Type check should be quick—just one question' },
          { metric: 'Pattern identification', target: 'Top 3 errors known', howToMeasure: 'Team can name the most common type mistakes' }
        ],
        leadingIndicators: ['Type question asked consistently', 'Immediate corrections happening', 'Fewer debates about type'],
        laggingIndicators: ['Cleaner metrics', 'Less type-related confusion', 'Higher data quality for reporting']
      },

      pitfalls: {
        commonMistakes: ['Forgetting to ask the type question', 'Not correcting immediately', 'Making type check a long debate'],
        antiPatterns: ['Type check becomes 5-minute discussion per item', 'Only senior member checks types', 'Corrections noted but not made'],
        warningSignals: ['Type check skipped when time is short', 'Same errors recurring sprint after sprint', 'Team sighs when type question is asked'],
        whenToPivot: 'If type debates are consuming significant time, the issue is probably ambiguous types. Work on clearer definitions or fewer types, not longer discussions.'
      },

      faq: [
        { question: 'What if we don\'t have time in refinement?', answer: 'Type check takes 10 seconds if types are clear. If it takes longer, your types are confusing—fix that first.' },
        { question: 'Who should make the correction?', answer: 'Whoever has the Jira window open. It doesn\'t matter who—just that it happens immediately.' },
        { question: 'Should we correct historical issues too?', answer: 'Focus on upcoming work first. Only correct historical issues if you\'re using them for important reporting.' }
      ],

      impact: 'high',
      relatedIndicators: ['typeAccuracy', 'misuseRate']
    },
    {
      id: 'itc-action-4',
      title: 'Consolidate to Essential Issue Types',
      category: 'process',
      recommendationId: 'itc-action-4',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Too many issue types create confusion and cognitive load. People pick the wrong type because there are too many similar options.',
        whyItWorks: 'Fewer types means fewer decisions, less confusion, and easier consistency. Most teams only need 4-6 types. More than that suggests over-engineering.',
        background: 'Jira projects often accumulate types over time—each new need gets a new type. Eventually, you have 15 types where 5 would suffice. Consolidation is necessary maintenance.',
        resources: []
      },

      implementation: {
        overview: 'Audit your current issue types, identify overlaps and rarely-used types, and consolidate to a focused set.',
        steps: [
          { title: 'Inventory current types', description: 'List all issue types in your project. For each, count issues created in the last 3 months.' },
          { title: 'Identify candidates for removal', description: 'Rarely used (<5% of issues)? Overlaps with another type? Created for a one-time need? These are removal candidates.' },
          { title: 'Plan consolidation', description: 'Map old types to new. "Technical Debt" merges into "Task." "Enhancement" merges into "Story."' },
          { title: 'Migrate existing issues', description: 'Use bulk change to update existing issues to new types. Document the mapping for historical reference.' },
          { title: 'Update workflows', description: 'Ensure remaining types have appropriate workflows. Remove obsolete workflow configurations.' },
          { title: 'Communicate change', description: 'Announce to team: "We now use these 5 types. Here\'s why and how to choose between them."' }
        ],
        teamInvolvement: { type: 'representatives', description: 'Project admin executes; team agrees on consolidation plan' },
        timeToImplement: '1 sprint to review and migrate',
        effort: 'medium',
        prerequisites: ['Jira admin access', 'Team agreement on target types']
      },

      validation: {
        experiments: [
          { name: 'Type usage analysis', description: 'Before consolidation, analyze type distribution. After, verify no essential categorization was lost.', duration: '2 sprints post-change', howToMeasure: 'Can you still report on the categories that mattered? Are issues being created faster?' }
        ],
        successMetrics: [
          { metric: 'Type count', target: '4-6 types', howToMeasure: 'Total active issue types in the project' },
          { metric: 'Type usage spread', target: 'All types used', howToMeasure: 'Each remaining type has >5% of issues' },
          { metric: 'Creation confusion', target: 'Decreased', howToMeasure: 'Fewer questions about which type to use' }
        ],
        leadingIndicators: ['Faster issue creation', 'Fewer type-related questions', 'Cleaner project configuration'],
        laggingIndicators: ['Improved type accuracy', 'Simpler reporting', 'Easier onboarding for new members']
      },

      pitfalls: {
        commonMistakes: ['Removing a type someone still needs', 'Not migrating existing issues', 'Leaving orphaned workflow configurations'],
        antiPatterns: ['Consolidating but then adding new types back', 'Keeping types "just in case"', 'Not communicating changes to stakeholders'],
        warningSignals: ['Complaints about missing type options', 'Workarounds emerging for removed types', 'Reports that used to work are now broken'],
        whenToPivot: 'If stakeholders strongly object to losing a type, understand their use case. Maybe it\'s valid—or maybe there\'s a better way to meet their need with existing types.'
      },

      faq: [
        { question: 'What\'s the minimum viable set of types?', answer: 'Story (user value), Bug (broken thing), Task (technical work), Spike (research). Four types cover most needs. Add more only if you have a clear, distinct need.' },
        { question: 'What about organization-mandated types?', answer: 'You may be stuck with them. Focus on defining how your team uses them, even if you can\'t remove them.' },
        { question: 'How do we preserve historical data?', answer: 'Migrate old issues to new types with a clear mapping. Document the mapping. Historical reports may need adjustment.' }
      ],

      impact: 'high',
      relatedIndicators: ['typeAccuracy', 'typeDistribution']
    },
    {
      id: 'itc-action-5',
      title: 'Build Type Matters Mindset',
      category: 'culture',
      recommendationId: 'itc-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Team doesn\'t care about correct typing because they don\'t see the downstream impact. Typing feels like bureaucracy.',
        whyItWorks: 'When people understand how their data is used, they care about its quality. Showing concrete examples of mistype impact makes typing feel meaningful, not bureaucratic.',
        background: 'Type apathy is often rational—if no one ever uses the data, why bother? The solution is showing that the data IS used and that accuracy matters for outcomes the team cares about.',
        resources: []
      },

      implementation: {
        overview: 'Help the team understand why correct typing matters by showing real examples of how type data is used and misused.',
        steps: [
          { title: 'Show mistype impact', description: 'In a team meeting, show a real example: "This story was typed as Bug. Now our bug count is inflated and the CEO is asking why."' },
          { title: 'Connect to reports', description: 'Show the team reports that use type data. "This chart shows bugs vs. features. Wrong typing = wrong chart."' },
          { title: 'Discuss in retrospective', description: 'Add a retro item: "How does our typing affect our data quality?" Surface specific issues.' },
          { title: 'Celebrate accuracy', description: 'When someone catches a mistype or uses the right type thoughtfully, acknowledge it: "Good call on making that a Spike instead of a Story."' },
          { title: 'Make it visible', description: 'Include type accuracy in team health metrics or dashboards. Make it something the team monitors.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team participates in understanding and maintaining quality' },
        timeToImplement: '2-3 sprints to shift mindset',
        effort: 'medium',
        prerequisites: ['Reports that actually use type data', 'Examples of mistype impact']
      },

      validation: {
        experiments: [
          { name: 'Impact demonstration', description: 'Show the team a report distorted by mistypes. Correct the types. Show the improved report.', duration: '1 session', howToMeasure: 'Team reaction—do they see the difference? Do they care?' }
        ],
        successMetrics: [
          { metric: 'Proactive corrections', target: 'Increasing', howToMeasure: 'Team members catching and fixing type errors without prompting' },
          { metric: 'Type discussions', target: 'Happen naturally', howToMeasure: 'Team discusses type accuracy in refinement without reminder' },
          { metric: 'Quality mindset', target: 'Visible shift', howToMeasure: 'Team talks about data quality as something they own' }
        ],
        leadingIndicators: ['Questions about type implications', 'Peer corrections happening', 'Interest in seeing type-based reports'],
        laggingIndicators: ['Higher type accuracy over time', 'Better data quality', 'Fewer firefights about misleading reports']
      },

      pitfalls: {
        commonMistakes: ['Lecturing instead of showing', 'Not having real examples', 'Making it feel punitive'],
        antiPatterns: ['Blaming individuals for past mistypes', 'Over-emphasizing until it feels burdensome', 'Not connecting to outcomes the team cares about'],
        warningSignals: ['Eye-rolling when type accuracy is mentioned', 'Minimal engagement in discussions', 'Compliance without commitment'],
        whenToPivot: 'If the team genuinely doesn\'t use type-based reports, consider whether type accuracy actually matters for your context. Don\'t create work for work\'s sake.'
      },

      faq: [
        { question: 'What if our reports don\'t use types?', answer: 'Then either start using type data (it\'s valuable) or don\'t stress about type accuracy. Accuracy for unused data is wasted effort.' },
        { question: 'How do we avoid making this feel like nitpicking?', answer: 'Focus on impact, not rules. "This matters because..." not "You should have..."' },
        { question: 'What about people who just don\'t care?', answer: 'Connect to what they DO care about. If they care about accurate velocity, show how type errors distort velocity. Find their hook.' }
      ],

      impact: 'medium',
      relatedIndicators: ['typeAccuracy']
    },
    {
      id: 'itc-action-6',
      title: 'Type Distribution Dashboard',
      category: 'tooling',
      recommendationId: 'itc-action-6',

      knowledge: {
        problemSolved: 'Type errors accumulate invisibly. By the time you notice reports are wrong, significant damage is done.',
        whyItWorks: 'A dashboard that shows type distribution over time makes anomalies visible early. If bugs suddenly double, you can investigate before it distorts quarterly reports.',
        background: 'Type distribution should be relatively stable for a team. Sudden shifts often indicate misclassification rather than actual changes in work type. The dashboard exposes these shifts.',
        resources: []
      },

      implementation: {
        overview: 'Create a Jira dashboard showing issue type distribution over time to enable pattern recognition and anomaly detection.',
        steps: [
          { title: 'Create the dashboard', description: 'In Jira, create a new dashboard for type monitoring. Add it to team\'s regular dashboard view.' },
          { title: 'Add pie chart', description: 'Create a pie chart gadget showing issue type distribution for recent work (last 2-3 sprints).' },
          { title: 'Add trend chart', description: 'Add a line or bar chart showing type distribution over time—week by week or sprint by sprint.' },
          { title: 'Define what\'s normal', description: 'Establish baseline expectations. "We typically have 60% Stories, 20% Bugs, 20% Tasks. Large deviations warrant investigation."' },
          { title: 'Review regularly', description: 'Check the dashboard monthly or after each sprint. Look for unexpected shifts.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person builds; team reviews periodically' },
        timeToImplement: '20 minutes to create',
        effort: 'low',
        prerequisites: ['Jira dashboard access', 'Historical issue data']
      },

      validation: {
        experiments: [
          { name: 'Anomaly detection test', description: 'Intentionally miscategorize 10 issues. Does the dashboard show a visible shift?', duration: '1 sprint', howToMeasure: 'Dashboard should show anomaly. Team should notice and investigate.' }
        ],
        successMetrics: [
          { metric: 'Dashboard reviews', target: 'Monthly minimum', howToMeasure: 'Dashboard is viewed at least monthly by team' },
          { metric: 'Anomalies detected', target: 'Before reports', howToMeasure: 'Type issues caught via dashboard before affecting key reports' },
          { metric: 'Investigation triggered', target: 'When distribution shifts', howToMeasure: 'Team asks "why?" when distribution changes significantly' }
        ],
        leadingIndicators: ['Dashboard bookmarked by team members', 'Questions arising from dashboard observations', 'Proactive investigation of shifts'],
        laggingIndicators: ['Cleaner long-term data', 'Fewer surprise report issues', 'Better understanding of work patterns']
      },

      pitfalls: {
        commonMistakes: ['Building dashboard but never checking it', 'Making it too complex', 'Not establishing baseline expectations'],
        antiPatterns: ['Using dashboard to blame', 'Ignoring shifts because they\'re inconvenient', 'Dashboard buried in unused Jira screens'],
        warningSignals: ['Dashboard hasn\'t been viewed in months', 'No one knows it exists', 'Anomalies visible but ignored'],
        whenToPivot: 'If the dashboard isn\'t being used after 3 months, integrate type distribution into an existing report the team already reviews.'
      },

      faq: [
        { question: 'What distribution is "healthy"?', answer: 'Depends on your work. Product teams might be 70% Stories. Support teams might be 70% Bugs. Establish YOUR team\'s baseline.' },
        { question: 'How often should distribution change?', answer: 'Gradual shifts are normal as work changes. Sudden jumps (30% → 50% bugs in one sprint) warrant investigation.' },
        { question: 'What if we find an anomaly?', answer: 'Investigate. Sample some issues from the changed category. Are they correctly typed? Is there a real change in work type? Either correct the types or understand the shift.' }
      ],

      impact: 'medium',
      relatedIndicators: ['typeDistribution']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Define your types. Create clear, simple definitions everyone understands.',
      avoid: 'Don\'t create too many types. Start minimal.',
      nextStep: 'Document issue type definitions and share with team.'
    },
    2: {
      focus: 'Check types in process. Add type review to refinement.',
      avoid: 'Don\'t make it bureaucratic. Quick check is enough.',
      nextStep: 'Create a type selection decision tree.'
    },
    3: {
      focus: 'Monitor patterns. Use dashboards to spot typing anomalies.',
      avoid: 'Don\'t ignore drift. Consistent typing requires maintenance.',
      nextStep: 'Run a Type Audit Sprint.'
    },
    4: {
      focus: 'Simplify taxonomy. Reduce types to essential set.',
      avoid: 'Don\'t over-engineer types for edge cases.',
      nextStep: 'Consolidate to 4-6 core types.'
    },
    5: {
      focus: 'Organizational consistency. Align typing across teams.',
      avoid: 'Don\'t force identical types—context matters.',
      nextStep: 'Share typing guidelines organization-wide.'
    }
  }
};

// Playbook content for Blocker Management dimension
export const blockerManagementPlaybook: DimensionPlaybook = {
  dimensionKey: 'blockerManagement',
  dimensionName: 'Blocker Management',
  overview: 'Blocker management measures how effectively your team identifies, communicates, and resolves impediments. Poor blocker management leads to silent delays, context-switching, and predictability issues. Excellent blocker management keeps work flowing and surfaces problems early.',

  successCriteria: [
    {
      id: 'blocker-identification',
      label: 'Blocker Identification',
      description: 'Blockers flagged within 24 hours of occurrence',
      targetValue: 90,
      unit: '%',
      indicatorId: 'blockerIdentification'
    },
    {
      id: 'resolution-time',
      label: 'Resolution Time',
      description: 'Average time to resolve blockers',
      targetValue: 2,
      unit: 'days',
      indicatorId: 'resolutionTime'
    },
    {
      id: 'escalation-rate',
      label: 'Proper Escalation',
      description: 'Blockers escalated when team cannot resolve',
      targetValue: 95,
      unit: '%',
      indicatorId: 'escalationRate'
    }
  ],

  actions: [
    {
      id: 'bm-action-1',
      title: 'Implement Blocked Status Flag',
      category: 'quick-win',
      recommendationId: 'bm-action-1',

      knowledge: {
        problemSolved: 'Blocked work is invisible—no one knows something is stuck until someone asks in standup, if at all.',
        whyItWorks: 'A visible flag or status creates shared awareness. The board shows blocked items at a glance. Data becomes available for tracking resolution times.',
        background: 'Many teams talk about blockers in standup but don\'t track them in Jira. This means no historical data, no visibility between standups, and no way to measure improvement.',
        resources: [
          {
            title: 'Blocker Management Best Practices',
            type: 'article',
            description: 'Guide to identifying, tracking, and resolving blockers effectively including workflow configurations'
          }
        ]
      },

      implementation: {
        overview: 'Add a "Blocked" flag or status to your Jira workflow and train the team to use it consistently.',
        steps: [
          { title: 'Choose flag vs. status', description: 'Flag: simpler, works across workflows. Status: more visible on board, enables automation. Most teams start with flag.' },
          { title: 'Add to Jira', description: 'For flag: use the built-in flag feature. For status: add "Blocked" to your workflow. Put it visibly on the board.' },
          { title: 'Define usage criteria', description: 'Blocked = cannot proceed without external input or action. Not blocked = can work on other parts while waiting.' },
          { title: 'Train the team', description: 'When stuck, flag immediately. Don\'t wait for standup. Add comment explaining the blocker and what\'s needed to unblock.' },
          { title: 'Make it visible on board', description: 'If using flag: ensure flags show prominently. If using status: add Blocked column or swimlane.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone uses the flag; one person configures it' },
        timeToImplement: '15 minutes to configure, immediate use',
        effort: 'low',
        prerequisites: ['Jira board access']
      },

      validation: {
        experiments: [
          { name: 'Zero hidden blockers', description: 'For one sprint, compare blockers mentioned in standup vs. blockers flagged in Jira. They should match.', duration: '1 sprint', howToMeasure: 'Every blocker discussed should have a flag. Any unflagged blockers = gap in usage.' }
        ],
        successMetrics: [
          { metric: 'Flag usage rate', target: '100%', howToMeasure: 'All blockers are flagged within 4 hours of identification' },
          { metric: 'Visibility', target: 'Blocked items visible on board', howToMeasure: 'Anyone looking at the board can see what\'s blocked' },
          { metric: 'Data availability', target: 'Blocker count trackable', howToMeasure: 'Can run report showing blocked items and duration' }
        ],
        leadingIndicators: ['Flags appearing on board', 'Team mentioning flags in standup', 'Comments explaining blockers'],
        laggingIndicators: ['Faster blocker identification', 'Historical data for analysis', 'Improved team awareness']
      },

      pitfalls: {
        commonMistakes: ['Flagging but not adding comment explaining the blocker', 'Forgetting to unflag when resolved', 'Using flag for "hard" rather than truly blocked'],
        antiPatterns: ['Everything is blocked all the time', 'Blockers flagged but never discussed', 'Flag becomes a way to avoid work'],
        warningSignals: ['Many items flagged for weeks', 'Flags don\'t match standup discussion', 'No one checks the blocked items'],
        whenToPivot: 'If flag usage is inconsistent after 2 sprints, consider using a more prominent status instead. Or address why team isn\'t flagging—is it safe to raise blockers?'
      },

      faq: [
        { question: 'Flag or status—which is better?', answer: 'Start with flag—it\'s simpler. Move to status if you need board visibility or automation (e.g., auto-notify when blocked).' },
        { question: 'What counts as blocked vs. just waiting?', answer: 'Blocked = cannot make progress on any part of this issue. Waiting but can work on other aspects = not blocked. Use your judgment.' },
        { question: 'Should we track who blocked us?', answer: 'Optional but useful. Add a comment noting who you\'re waiting on. This helps with follow-up and pattern detection.' }
      ],

      impact: 'high',
      relatedIndicators: ['blockerIdentification']
    },
    {
      id: 'bm-action-2',
      title: 'Blocker-First Standup Ritual',
      category: 'quick-win',
      recommendationId: 'bm-action-2',

      knowledge: {
        problemSolved: 'Blockers get mentioned as an afterthought at the end of standup updates, if at all. By then, everyone\'s mentally checked out.',
        whyItWorks: 'Starting with blockers signals their importance. It creates immediate focus on unblocking rather than just reporting. Action plans emerge in the moment.',
        background: 'Traditional standup format (yesterday/today/blockers) buries blockers. By the time someone gets to "blockers," time is short and attention is low.',
        resources: []
      },

      implementation: {
        overview: 'Restructure standup to start with blockers. Make unblocking the primary goal of the meeting.',
        steps: [
          { title: 'Change the format', description: 'Start with: "Anyone blocked?" Address blockers before anything else. Each blocker gets: what is it, who can help, what\'s the action plan.' },
          { title: 'Assign unblock owners', description: 'Every blocker leaves standup with someone responsible for unblocking (not necessarily the blocked person).' },
          { title: 'Time-box blocker discussion', description: 'Spend up to half of standup on blockers. Quick updates can be async; unblocking requires real-time discussion.' },
          { title: 'Follow up next day', description: 'For each blocker from yesterday: resolved? progress? If not, escalate or adjust plan.' },
          { title: 'Track persistent blockers', description: 'If same blocker appears 2+ days, it needs escalation. Don\'t let blockers become wallpaper.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team participates in standup discussion' },
        timeToImplement: 'Starts next standup',
        effort: 'low',
        prerequisites: ['Regular standup meeting']
      },

      validation: {
        experiments: [
          { name: '24-hour action plan', description: 'For one sprint, ensure every blocker has an action plan within 24 hours of being raised.', duration: '1 sprint', howToMeasure: 'Track blocker identification time vs. action plan time. Target: <24 hours for all blockers.' }
        ],
        successMetrics: [
          { metric: 'Blocker discussion time', target: 'Addressed in standup', howToMeasure: 'Blockers discussed with action plans, not just mentioned' },
          { metric: 'Unblock owner assigned', target: '100%', howToMeasure: 'Every blocker leaves standup with someone responsible for resolution' },
          { metric: 'Resolution time', target: 'Improving trend', howToMeasure: 'Average time from blocker identification to resolution' }
        ],
        leadingIndicators: ['Blockers raised at start of standup', 'Action-oriented discussion', 'Team members volunteering to help unblock'],
        laggingIndicators: ['Faster resolution times', 'Fewer surprise delays', 'Higher team flow']
      },

      pitfalls: {
        commonMistakes: ['Blocker discussion takes over entire standup', 'Same person always "unblock owner"', 'Discussion without action plan'],
        antiPatterns: ['Blockers mentioned but nothing changes', 'Deep technical debates instead of action planning', 'Only blocked person responsible for unblocking'],
        warningSignals: ['Standup runs long every day', 'Team groans when blockers are asked', 'Same blockers persist for days'],
        whenToPivot: 'If blocker discussions consistently run long, consider a separate "unblocking session" for complex blockers. Standup stays short; detailed problem-solving happens after.'
      },

      faq: [
        { question: 'What if there are no blockers?', answer: 'Great! Spend 30 seconds confirming, then do quick updates. Don\'t fill time just because you saved it.' },
        { question: 'What if blocker discussion takes too long?', answer: 'Time-box to 5 minutes per blocker in standup. Complex ones get a follow-up meeting with relevant people only.' },
        { question: 'Should we skip regular updates entirely?', answer: 'Optional. Some teams do blockers-only standups and async updates. Experiment and see what works.' }
      ],

      impact: 'high',
      relatedIndicators: ['blockerIdentification', 'resolutionTime']
    },
    {
      id: 'bm-action-3',
      title: 'Define Clear Escalation Paths',
      category: 'process',
      recommendationId: 'bm-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Team doesn\'t know who to contact when they can\'t resolve a blocker themselves. Blockers linger while people wonder who can help.',
        whyItWorks: 'Clear escalation paths remove uncertainty. When you\'re stuck, you know exactly who to contact. This reduces delay between "I can\'t solve this" and "help is on the way."',
        background: 'Escalation isn\'t failure—it\'s appropriate routing. Some blockers require someone with different authority, access, or relationships. Knowing when and how to escalate is a skill.',
        resources: [
          {
            title: 'Escalation Matrix Template',
            type: 'template',
            description: 'Template for defining blocker escalation paths and contacts for different blocker types'
          }
        ]
      },

      implementation: {
        overview: 'Document who to contact for different types of blockers and when escalation is appropriate.',
        steps: [
          { title: 'Categorize blockers', description: 'Common categories: technical (need expert help), cross-team (dependency on another team), external (vendor/client), decision (need authority to decide), resource (need access/permissions).' },
          { title: 'Identify escalation contacts', description: 'For each category, who can help? Technical → Tech Lead. Cross-team → PM/TPM. External → Manager. Document names and contact methods.' },
          { title: 'Set escalation triggers', description: 'When should someone escalate? Common trigger: blocker persists >2 days without progress. Or: blocked person has tried X approaches.' },
          { title: 'Define escalation format', description: 'When escalating, include: what you\'re blocked on, impact if not resolved, what you\'ve already tried, what you need from the escalation contact.' },
          { title: 'Document and share', description: 'Put escalation paths in team wiki. Review in team meeting. Make it easy to find when you need it.' }
        ],
        teamInvolvement: { type: 'representatives', description: 'Lead documents; team validates and uses' },
        timeToImplement: '30 minutes to document',
        effort: 'medium',
        prerequisites: ['Understanding of common blocker types', 'Knowledge of who can help with each']
      },

      validation: {
        experiments: [
          { name: 'Escalation usage tracking', description: 'For one quarter, track every escalation. Was the right contact used? Was the issue resolved faster?', duration: '1 quarter', howToMeasure: 'Log escalations: category, contact used, resolution time. Look for patterns.' }
        ],
        successMetrics: [
          { metric: 'Escalation path awareness', target: '100%', howToMeasure: 'Everyone can name escalation contact for their most common blocker type' },
          { metric: 'Appropriate escalation', target: '>90%', howToMeasure: 'Escalations go to correct contact first time' },
          { metric: 'Escalation effectiveness', target: 'Resolution <2 days', howToMeasure: 'Escalated blockers resolve faster than non-escalated persistent blockers' }
        ],
        leadingIndicators: ['Team referencing escalation paths', 'Faster escalation decisions', 'Less hesitation about when to escalate'],
        laggingIndicators: ['Shorter blocker duration', 'Fewer blockers persisting for days', 'Better stakeholder relationships']
      },

      pitfalls: {
        commonMistakes: ['Escalating too late (after days of struggling)', 'Escalating without context', 'Not following up after escalation'],
        antiPatterns: ['Escalating everything (crying wolf)', 'Skipping team problem-solving and escalating immediately', 'Escalation contacts not responsive'],
        warningSignals: ['Escalation contacts overwhelmed', 'Escalations not resolving issues', 'Team afraid to escalate'],
        whenToPivot: 'If escalation contacts are unresponsive, address with leadership. Escalation paths only work if contacts honor them.'
      },

      faq: [
        { question: 'Isn\'t escalation admitting defeat?', answer: 'No—it\'s appropriate routing. Some blockers require different access, authority, or relationships. Escalation is a skill, not a failure.' },
        { question: 'How do I know when to escalate vs. keep trying?', answer: 'Good trigger: you\'ve tried 2-3 approaches and still blocked, or it\'s been 2 days. When in doubt, escalate early.' },
        { question: 'What if my escalation contact is also stuck?', answer: 'They should escalate further. Your job is to route to the right first contact; their job is to resolve or route higher.' }
      ],

      impact: 'high',
      relatedIndicators: ['escalationRate']
    },
    {
      id: 'bm-action-4',
      title: 'Proactive Dependency Identification',
      category: 'process',
      recommendationId: 'bm-action-4',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Blockers surprise the team mid-sprint because dependencies weren\'t identified upfront.',
        whyItWorks: 'Identifying dependencies during refinement gives time to address them before work starts. Known dependencies can be sequenced, communicated, or resolved proactively.',
        background: 'Most blockers are predictable if you ask the right questions. "What could block this?" is rarely asked during refinement. Adding this question prevents many blockers.',
        resources: []
      },

      implementation: {
        overview: 'Add dependency identification to your refinement checklist. Capture potential blockers before work begins.',
        steps: [
          { title: 'Add to refinement checklist', description: 'For each item, explicitly ask: "What could block this?" Categories: other teams, external vendors, decisions needed, technical prerequisites, access/permissions.' },
          { title: 'Document dependencies', description: 'Record dependencies on the Jira issue. Use linked issues for cross-team dependencies. Note contact person for external dependencies.' },
          { title: 'Pre-resolve where possible', description: 'If you identify a dependency, can you address it before work starts? Send the email, make the request, start the conversation now.' },
          { title: 'Flag high-risk items', description: 'Stories with many or uncertain dependencies are risky. Consider reducing scope or adding spike to reduce uncertainty.' },
          { title: 'Track prediction accuracy', description: 'Post-sprint, compare identified dependencies to actual blockers. Did you catch most of them? What was missed?' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team contributes to dependency identification' },
        timeToImplement: '1-2 sprints to make it habit',
        effort: 'medium',
        prerequisites: ['Regular refinement sessions']
      },

      validation: {
        experiments: [
          { name: 'Dependency prediction accuracy', description: 'Track dependencies identified in refinement vs. actual blockers that occur. What percentage were predicted?', duration: '2 sprints', howToMeasure: 'Blockers that were identified upfront / total blockers. Target: >50% initially, improving over time.' }
        ],
        successMetrics: [
          { metric: 'Dependencies documented', target: '>80%', howToMeasure: 'Stories entering sprint have dependencies identified (if any)' },
          { metric: 'Surprise blocker rate', target: 'Decreasing', howToMeasure: 'Blockers not identified in refinement, per sprint' },
          { metric: 'Proactive resolution', target: 'At least 1 per sprint', howToMeasure: 'Dependencies addressed before they became blockers' }
        ],
        leadingIndicators: ['Dependency question asked in every refinement', 'Cross-team outreach happening earlier', 'Fewer mid-sprint surprises'],
        laggingIndicators: ['Lower blocker count overall', 'Faster blocker resolution (because they were anticipated)', 'More predictable sprints']
      },

      pitfalls: {
        commonMistakes: ['Over-identifying dependencies (everything has 10 dependencies)', 'Identifying but not acting on dependencies', 'Only identifying obvious dependencies'],
        antiPatterns: ['Analysis paralysis—refusing to start until all dependencies resolved', 'Dependency identification as excuse for delay', 'Not updating dependencies as understanding evolves'],
        warningSignals: ['Same dependencies keep surprising the team', 'Dependencies identified but not communicated to relevant parties', 'Dependency discussion adds 30+ minutes to refinement'],
        whenToPivot: 'If dependency identification becomes overhead without reducing blockers, focus on the types of blockers that actually occur. Target your identification effort.'
      },

      faq: [
        { question: 'What if we can\'t predict dependencies?', answer: 'You\'ll get better with practice. Start with obvious ones and improve over time. Even 30% prediction is better than 0%.' },
        { question: 'Should we avoid work with many dependencies?', answer: 'Not necessarily—but sequence it carefully. Address dependencies first, or accept the risk and have contingency plans.' },
        { question: 'What about dependencies we discover mid-sprint?', answer: 'They happen. Document them, address them, and in retro ask: "Could we have identified this earlier?"' }
      ],

      impact: 'high',
      relatedIndicators: ['blockerIdentification']
    },
    {
      id: 'bm-action-5',
      title: 'Build Blocker-Safe Culture',
      category: 'culture',
      recommendationId: 'bm-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Team members hide blockers because raising them feels embarrassing or like admitting failure.',
        whyItWorks: 'When blockers are normalized as part of work (not failures), people raise them early. Early identification enables faster resolution and prevents small blockers from becoming big delays.',
        background: 'In many teams, being blocked feels like weakness. This leads to people struggling silently, spending days on something that could be resolved in hours with help.',
        resources: []
      },

      implementation: {
        overview: 'Create explicit cultural norms that make raising blockers safe and valued.',
        steps: [
          { title: 'State the norm explicitly', description: 'In a team meeting, say clearly: "Blockers are normal. Hiding them is the problem. We want to know early."' },
          { title: 'Model the behavior', description: 'Leaders and seniors should raise their own blockers openly. "I\'m blocked on X, I need help from Y."' },
          { title: 'Thank early raisers', description: 'When someone raises a blocker early, acknowledge it: "Thanks for flagging this early—we can address it before it becomes a big delay."' },
          { title: 'Never blame the blocked', description: 'Blockers come from circumstances, not personal failure. Focus on resolution, not fault.' },
          { title: 'Celebrate prevention', description: 'When early identification prevents a problem, celebrate it: "Because [name] raised this early, we saved 2 days."' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team participates in cultural shift' },
        timeToImplement: '3-4 sprints to shift culture',
        effort: 'medium',
        prerequisites: ['Leadership buy-in', 'Psychological safety basics']
      },

      validation: {
        experiments: [
          { name: 'Early identification tracking', description: 'Track how quickly blockers are raised after they occur. Are we catching them earlier over time?', duration: '3 sprints', howToMeasure: 'Time between blocker occurrence and blocker flagging. Should decrease over time.' }
        ],
        successMetrics: [
          { metric: 'Time to flag', target: '<4 hours', howToMeasure: 'Average time from blocker occurrence to being flagged' },
          { metric: 'Blocker count trend', target: 'Increasing then stabilizing', howToMeasure: 'Blockers reported per sprint (initially increases as more are surfaced, then stabilizes)' },
          { metric: 'Team sentiment', target: 'Safe to raise blockers', howToMeasure: 'Retro discussion or survey: "Do you feel comfortable raising blockers?"' }
        ],
        leadingIndicators: ['More blockers being raised (initially)', 'Blockers raised earlier in the day', 'Junior members raising blockers without hesitation'],
        laggingIndicators: ['Faster resolution times', 'Fewer late-sprint surprises', 'Healthier team dynamics']
      },

      pitfalls: {
        commonMistakes: ['Saying it\'s safe but reacting negatively when blockers are raised', 'Only seniors model the behavior', 'Celebrating resolution but not early identification'],
        antiPatterns: ['Blockers become excuses for non-delivery', 'Everything becomes a blocker', 'Culture talk without behavior change'],
        warningSignals: ['People still hesitate to raise blockers', 'Blockers only emerge late in sprint', 'Same people always blocked (others may be hiding)'],
        whenToPivot: 'If culture doesn\'t shift after 3-4 sprints, look for deeper psychological safety issues. This may require leadership intervention or team composition changes.'
      },

      faq: [
        { question: 'What if some people abuse "blocker" to avoid work?', answer: 'Address individually if it happens. Don\'t create restrictive policies that punish the many for the few. Trust first.' },
        { question: 'How do we know if blockers are "real"?', answer: 'Define criteria: blocked = cannot proceed. If someone can proceed but is uncomfortable, that\'s different (valid, but different intervention).' },
        { question: 'What about performance reviews—do blockers count against people?', answer: 'No. Performance is about outcomes and behaviors, not about whether circumstances blocked you. Make this explicit.' }
      ],

      impact: 'high',
      relatedIndicators: ['blockerIdentification']
    },
    {
      id: 'bm-action-6',
      title: 'Blocker Duration Tracking Dashboard',
      category: 'tooling',
      recommendationId: 'bm-action-6',

      knowledge: {
        problemSolved: 'Without data, you can\'t measure improvement. How long do blockers last? Are we getting better?',
        whyItWorks: 'Tracking duration creates visibility and accountability. You can identify chronic blockers, measure improvement, and celebrate when resolution times decrease.',
        background: 'What gets measured gets managed. Blocker duration is a key health metric. Without tracking, blockers become wallpaper—always there, never addressed.',
        resources: []
      },

      implementation: {
        overview: 'Configure Jira to track time in blocked status and create a dashboard for visibility.',
        steps: [
          { title: 'Configure time tracking', description: 'Use Jira\'s time-in-status reports or a plugin to track how long issues spend in Blocked status.' },
          { title: 'Create the dashboard', description: 'Build a dashboard showing: currently blocked items, average blocked duration, items blocked >2 days, trend over time.' },
          { title: 'Set review cadence', description: 'Check the dashboard weekly. In retro, review: what were our longest blockers? Why?' },
          { title: 'Define escalation triggers', description: 'Use duration data to set escalation rules. "If blocked >2 days, auto-notify manager."' },
          { title: 'Celebrate improvement', description: 'When average duration decreases, acknowledge it. Share the trend with the team.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person builds; team uses for visibility' },
        timeToImplement: '30 minutes initial setup',
        effort: 'low',
        prerequisites: ['Blocked status or flag in use', 'Jira dashboard access']
      },

      validation: {
        experiments: [
          { name: 'Root cause analysis sprint', description: 'For one sprint, document root cause for every blocker. Use duration data to prioritize which causes to address.', duration: '1 sprint', howToMeasure: 'Root cause for each blocker. Focus on longest-duration blockers first.' }
        ],
        successMetrics: [
          { metric: 'Dashboard usage', target: 'Reviewed weekly', howToMeasure: 'Dashboard is checked at least weekly by team lead or PM' },
          { metric: 'Average duration', target: 'Decreasing trend', howToMeasure: 'Average time in blocked status should decrease quarter over quarter' },
          { metric: 'Long blockers', target: 'Zero >5 days', howToMeasure: 'No blocker persists more than 5 days without escalation' }
        ],
        leadingIndicators: ['Dashboard referenced in discussions', 'Duration used to prioritize unblocking', 'Escalation based on duration thresholds'],
        laggingIndicators: ['Measurably faster resolution', 'Data-driven improvement discussions', 'Clear visibility of blocker health']
      },

      pitfalls: {
        commonMistakes: ['Building dashboard but never checking it', 'Using data to blame rather than improve', 'Not acting on what the data shows'],
        antiPatterns: ['Gaming the metrics (unflagging/reflagging)', 'Over-complicating the dashboard', 'Data without action'],
        warningSignals: ['Dashboard ignored after initial excitement', 'Metrics not improving despite attention', 'Team resentment of tracking'],
        whenToPivot: 'If the dashboard isn\'t driving improvement after 3 months, simplify to one metric: "items blocked >2 days." Focus on that single number.'
      },

      faq: [
        { question: 'What blocker duration is acceptable?', answer: 'Depends on context. Start by measuring current state, then set improvement targets. Getting from 4 days average to 2 days is a win.' },
        { question: 'Should we track who caused blockers?', answer: 'Careful—this can create blame culture. Track categories and systemic causes instead of individual "blame."' },
        { question: 'What about weekends?', answer: 'Decide how to count. Some teams count calendar days (blockers don\'t take weekends off). Others count business days. Be consistent.' }
      ],

      impact: 'medium',
      relatedIndicators: ['resolutionTime']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Make blockers visible. Use flags and statuses consistently.',
      avoid: 'Don\'t let blockers stay hidden. Even small ones matter.',
      nextStep: 'Implement Blocked status and add to standup ritual.'
    },
    2: {
      focus: 'Speed up resolution. Clear escalation paths and daily attention.',
      avoid: 'Don\'t let blockers linger without action plans.',
      nextStep: 'Document and share escalation contacts.'
    },
    3: {
      focus: 'Prevent blockers. Identify dependencies before work starts.',
      avoid: 'Don\'t over-plan. Some blockers are unavoidable.',
      nextStep: 'Add dependency identification to refinement.'
    },
    4: {
      focus: 'Analyze patterns. Use data to address systemic causes.',
      avoid: 'Don\'t just resolve—learn from each blocker.',
      nextStep: 'Run Blocker Root Cause Analysis experiment.'
    },
    5: {
      focus: 'Cross-team coordination. Help others improve blocker management.',
      avoid: 'Don\'t assume blockers are "solved." Stay vigilant.',
      nextStep: 'Share blocker management practices organization-wide.'
    }
  }
};

// Playbook content for Work Hierarchy Linkage dimension
export const workHierarchyPlaybook: DimensionPlaybook = {
  dimensionKey: 'workHierarchy',
  dimensionName: 'Work Hierarchy Linkage',
  overview: 'Work hierarchy linkage measures how well your issues connect to larger initiatives (epics, initiatives, goals). Poor linkage makes it hard to understand why work matters, track progress toward goals, and report to stakeholders. Strong hierarchy enables strategic alignment and portfolio visibility.',

  successCriteria: [
    {
      id: 'epic-linkage',
      label: 'Epic Linkage',
      description: 'Percentage of stories linked to an epic',
      targetValue: 95,
      unit: '%',
      indicatorId: 'epicLinkage'
    },
    {
      id: 'hierarchy-depth',
      label: 'Hierarchy Depth',
      description: 'Work connected through initiative → epic → story',
      targetValue: 80,
      unit: '%',
      indicatorId: 'hierarchyDepth'
    },
    {
      id: 'orphan-rate',
      label: 'Orphan Rate',
      description: 'Issues not linked to any parent',
      targetValue: 5,
      unit: '%',
      indicatorId: 'orphanRate'
    }
  ],

  actions: [
    {
      id: 'wh-action-1',
      title: 'Require Epic Link for Stories',
      category: 'quick-win',
      recommendationId: 'wh-action-1',

      knowledge: {
        problemSolved: 'Stories exist without context—no one knows why the work matters or what initiative it supports.',
        whyItWorks: 'Making epic link required forces the question "why?" at creation time. Every piece of work has explicit context.',
        background: 'Orphaned stories indicate work happening without strategic alignment. This leads to wasted effort on low-priority items and difficulty explaining value to stakeholders.',
        resources: [
          {
            title: 'Epic Best Practices',
            type: 'article',
            description: 'How to create and manage epics that drive strategic alignment'
          }
        ]
      },

      implementation: {
        overview: 'Configure Jira to require epic link for stories, ensuring every piece of work has explicit context.',
        steps: [
          { title: 'Configure required field', description: 'In Jira: Project Settings → Issue Types → Story → Make Epic Link required.' },
          { title: 'Create catchall epics', description: 'Before requiring, create "Maintenance," "Tech Debt," and "Ad-hoc" epics for work that doesn\'t fit elsewhere.' },
          { title: 'Handle existing orphans', description: 'Run JQL to find unlinked stories. Link or close them before enabling requirement.' },
          { title: 'Communicate the change', description: 'Tell the team: "Every story needs an epic because we need to know why we\'re doing the work."' },
          { title: 'Monitor compliance', description: 'If people use workarounds (wrong epic, fake epic), address in retro. The goal is meaningful linkage, not just any link.' }
        ],
        teamInvolvement: { type: 'individual', description: 'Admin configures; whole team uses' },
        timeToImplement: '10 minutes to configure',
        effort: 'low',
        prerequisites: ['Jira project admin access', 'Catchall epics created']
      },

      validation: {
        experiments: [
          { name: 'Zero orphans sprint', description: 'For one sprint, ensure 100% linkage. Every story to epic, every epic to initiative if possible.', duration: '1 sprint', howToMeasure: 'Count stories without epics at sprint end. Target: zero.' }
        ],
        successMetrics: [
          { metric: 'Epic linkage rate', target: '100%', howToMeasure: 'Stories with epic link / total stories' },
          { metric: 'Orphan rate', target: '<5%', howToMeasure: 'Stories not linked to meaningful epic (catchalls okay for misc work)' },
          { metric: 'Context clarity', target: 'Improved', howToMeasure: 'Team can explain "why" for any story' }
        ],
        leadingIndicators: ['No orphan errors on story creation', 'Team asking "what epic?" naturally', 'Backlog organized by epic'],
        laggingIndicators: ['Accurate portfolio reporting', 'Clear initiative progress tracking', 'Stakeholder visibility into work']
      },

      pitfalls: {
        commonMistakes: ['Not creating catchall epics first—people get stuck', 'Linking to wrong epic just to satisfy requirement', 'Too many tiny epics that don\'t add context'],
        antiPatterns: ['One giant "Miscellaneous" epic for everything', 'Gaming the requirement without adding value', 'Blaming people for missing links instead of fixing process'],
        warningSignals: ['All stories going to one epic', 'Epic links obviously incorrect', 'Team frustrated by "bureaucracy"'],
        whenToPivot: 'If the requirement creates friction without improving context, focus on epic quality first. Bad epics make linkage meaningless.'
      },

      faq: [
        { question: 'What about bugs?', answer: 'Link bugs to the epic of the feature they affect, or to a "Bug Fixes" catchall. Either works—the point is context.' },
        { question: 'Can we have stories in multiple epics?', answer: 'Jira allows only one epic per story. If work spans epics, either pick the primary one or consider if the story should be split.' },
        { question: 'What if an epic doesn\'t exist yet?', answer: 'Create it. If there\'s work, there should be an epic. If creating an epic feels wrong, question whether the work should happen.' }
      ],

      impact: 'high',
      relatedIndicators: ['epicLinkage', 'orphanRate']
    },
    {
      id: 'wh-action-2',
      title: 'Create Standard Catchall Epics',
      category: 'quick-win',
      recommendationId: 'wh-action-2',

      knowledge: {
        problemSolved: 'Some work legitimately doesn\'t fit product epics—tech debt, bugs, process improvements. Without a home, it becomes orphaned.',
        whyItWorks: 'Standard catchall epics provide homes for necessary work that isn\'t feature-driven. This enables 100% linkage without forcing incorrect categorization.',
        background: 'Not all work is product features. Support, maintenance, and process work still matter and should be tracked. Catchalls acknowledge this reality.',
        resources: []
      },

      implementation: {
        overview: 'Create a standard set of epics for work categories that don\'t fit product/feature epics.',
        steps: [
          { title: 'Identify common categories', description: 'Typical catchalls: Tech Debt, Bug Fixes, Operational Maintenance, Team Process/Health, Support Requests.' },
          { title: 'Create the epics', description: 'Create each as a proper epic with description explaining its purpose and what belongs there.' },
          { title: 'Establish guidelines', description: 'Document when to use each catchall vs. creating a feature epic. "If it touches user-facing functionality, it probably deserves its own epic."' },
          { title: 'Review periodically', description: 'Monthly, review catchall epics. Is work accumulating that deserves its own epic? Move it out.' },
          { title: 'Don\'t abuse catchalls', description: 'Catchalls are for genuinely miscellaneous work, not a way to avoid thinking about where work belongs.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person creates; team uses' },
        timeToImplement: '15 minutes',
        effort: 'low',
        prerequisites: ['Jira project access']
      },

      validation: {
        experiments: [
          { name: 'Catchall audit', description: 'After 1 month, review what\'s in each catchall. Should anything have its own epic?', duration: '1 month', howToMeasure: 'Items in catchalls that could be grouped into meaningful feature epics.' }
        ],
        successMetrics: [
          { metric: 'Orphan rate', target: '<5%', howToMeasure: 'Stories without any epic (catchalls count as valid linkage)' },
          { metric: 'Catchall size', target: '<20% of work', howToMeasure: 'Work in catchalls / total work. If >20%, you need more feature epics.' },
          { metric: 'Graduation rate', target: 'Some items graduate', howToMeasure: 'Work that starts in catchall but moves to feature epic when it grows' }
        ],
        leadingIndicators: ['Team knows which catchall to use', 'Catchalls used appropriately', 'Periodic review happening'],
        laggingIndicators: ['No orphaned stories', 'All work has context', 'Cleaner portfolio view']
      },

      pitfalls: {
        commonMistakes: ['Too many catchalls (becomes confusing)', 'Catchalls become dumping grounds forever', 'Not reviewing catchall contents'],
        antiPatterns: ['Everything goes to catchall to avoid categorization', 'Catchall epics closed with work still inside', 'Catchalls not visible in portfolio view'],
        warningSignals: ['Catchalls growing faster than feature epics', 'Items in catchall for months', 'Team defaulting to catchall for real features'],
        whenToPivot: 'If catchalls dominate your work, you have an epic creation problem, not a catchall problem. Create meaningful epics for recurring work themes.'
      },

      faq: [
        { question: 'How many catchalls do we need?', answer: '3-5 is typical. More than that and you should probably create real epics instead.' },
        { question: 'Should catchalls ever close?', answer: 'Generally no—they\'re evergreen. But review their contents regularly and move work to feature epics when appropriate.' },
        { question: 'What if a bug is for a feature that has an epic?', answer: 'Link to the feature epic, not the Bug Fixes catchall. The catchall is for truly orphaned bugs.' }
      ],

      impact: 'medium',
      relatedIndicators: ['orphanRate']
    },
    {
      id: 'wh-action-3',
      title: 'Weekly Epic Health Checks',
      category: 'process',
      recommendationId: 'wh-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Epics become stale—scope changes but descriptions don\'t, completed epics stay open, progress bars are wrong.',
        whyItWorks: 'Regular review keeps epics accurate. Accurate epics enable reliable portfolio reporting and stakeholder communication.',
        background: 'Epics are living documents. Without maintenance, they drift from reality. This makes portfolio views misleading and erodes trust in the data.',
        resources: [
          {
            title: 'Work Hierarchy Template',
            type: 'template',
            description: 'Standard hierarchy structure: Goal → Initiative → Epic → Story'
          }
        ]
      },

      implementation: {
        overview: 'Establish a weekly review cadence for epic health, ensuring they accurately represent initiative progress.',
        steps: [
          { title: 'Schedule the review', description: 'Add 30 minutes weekly to someone\'s calendar—PM, tech lead, or rotating responsibility.' },
          { title: 'Create a checklist', description: 'Review: all stories linked? Progress % accurate? Scope still valid? Description current? Done epics closed?' },
          { title: 'Review active epics', description: 'For each active epic: is it still active? What\'s blocking progress? Any scope changes to document?' },
          { title: 'Handle stale epics', description: 'Epics with no activity for 2+ sprints: still relevant? If yes, why no progress? If no, close them.' },
          { title: 'Create new epics', description: 'Is work happening without an epic? Is an existing catchall growing into something that deserves its own epic?' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person reviews; surfaces issues to team' },
        timeToImplement: '30 minutes weekly',
        effort: 'medium',
        prerequisites: ['Clear epic ownership', 'Portfolio visibility into epics']
      },

      validation: {
        experiments: [
          { name: 'Epic storytelling session', description: 'Present each active epic as a narrative: problem, approach, progress, what\'s left. Can you tell a coherent story?', duration: '1 session', howToMeasure: 'Epics with clear narrative = healthy. Epics that are confusing = need attention.' }
        ],
        successMetrics: [
          { metric: 'Epic accuracy', target: '>90%', howToMeasure: 'Spot-check epic progress bars against actual completion' },
          { metric: 'Stale epic rate', target: '<10%', howToMeasure: 'Epics with no activity for 2+ sprints' },
          { metric: 'Review completion', target: 'Weekly', howToMeasure: 'Health check happens every week' }
        ],
        leadingIndicators: ['Health checks happening consistently', 'Epics being closed when done', 'New epics created for emerging work'],
        laggingIndicators: ['Accurate portfolio dashboards', 'Stakeholder trust in progress reports', 'Clear initiative status']
      },

      pitfalls: {
        commonMistakes: ['Health check happens but nothing changes', 'Only checking top-level, not drilling into stories', 'Not closing done epics'],
        antiPatterns: ['Health check becomes perfunctory', 'Single person does all epic maintenance', 'Ignoring awkward epics that don\'t fit cleanly'],
        warningSignals: ['Epics with 100+ stories', 'Progress bars stuck at 10% for months', 'No one can explain what an epic is about'],
        whenToPivot: 'If health checks aren\'t improving epic quality, the issue may be epic design. Consider restructuring how you scope epics rather than just maintaining bad ones.'
      },

      faq: [
        { question: 'Who should do the health check?', answer: 'PM or tech lead typically. Could rotate. The point is someone owns it consistently.' },
        { question: 'How do I know if an epic should be closed?', answer: 'If the original goal is achieved or abandoned, close it. "No more active work" isn\'t enough—the epic might just be waiting for something.' },
        { question: 'What if an epic has problems I can\'t fix alone?', answer: 'Flag it for team discussion. Health check surfaces issues; the team resolves them.' }
      ],

      impact: 'high',
      relatedIndicators: ['epicLinkage', 'hierarchyDepth']
    },
    {
      id: 'wh-action-4',
      title: 'Linkage Check in Refinement',
      category: 'process',
      recommendationId: 'wh-action-4',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Stories enter sprints without proper hierarchy links because no one checks during planning.',
        whyItWorks: 'Refinement is the natural checkpoint for story readiness. Adding hierarchy check ensures context is established before work begins.',
        background: 'Linkage is easiest to establish when discussing a story\'s purpose. "What epic is this under?" naturally leads to "Why are we doing this?" Both questions improve work quality.',
        resources: []
      },

      implementation: {
        overview: 'Add hierarchy verification to your refinement checklist so no work enters sprint without context.',
        steps: [
          { title: 'Add to refinement checklist', description: 'For each story: "What epic is this under?" If no epic, ask "Why are we doing this?"' },
          { title: 'Link immediately', description: 'Don\'t wait—add the epic link during refinement while context is fresh.' },
          { title: 'Create epics on demand', description: 'If a story reveals a new initiative, create the epic in the moment.' },
          { title: 'Handle edge cases', description: 'Bugs: link to feature epic or Bug Fixes. Spikes: link to the epic you\'re spiking for. Tech debt: link to Tech Debt epic.' },
          { title: 'Block unlinked items', description: 'Don\'t let unlinked items enter sprint planning. If no epic, the story isn\'t ready.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone in refinement checks linkage' },
        timeToImplement: 'Starts next refinement',
        effort: 'low',
        prerequisites: ['Regular refinement meetings', 'Epic structure in place']
      },

      validation: {
        experiments: [
          { name: 'Sprint linkage audit', description: 'At sprint start, check every item for epic link. Did anything slip through?', duration: '1 sprint', howToMeasure: 'Items in sprint without epic link. Target: zero.' }
        ],
        successMetrics: [
          { metric: 'Refinement linkage rate', target: '100%', howToMeasure: 'Items leaving refinement with epic link' },
          { metric: 'Sprint-ready criteria', target: 'Linkage included', howToMeasure: '"Has epic link" is part of definition of ready' },
          { metric: 'Context questions', target: 'Asked for every item', howToMeasure: 'Team naturally asks "why?" via epic question' }
        ],
        leadingIndicators: ['Epic question asked for every story', 'Links created during refinement', 'No orphans in sprint backlog'],
        laggingIndicators: ['100% linked sprints', 'Better portfolio visibility', 'Team understands work purpose']
      },

      pitfalls: {
        commonMistakes: ['Linkage check becomes rote—no one thinks about it', 'Linking to wrong epic to "check the box"', 'Skipping check for "obvious" items'],
        antiPatterns: ['Linkage check adds 10 minutes per item', 'Debate about which epic instead of just picking one', 'Linking after refinement instead of during'],
        warningSignals: ['Items still entering sprint unlinked', 'Epic links often wrong', 'Team doesn\'t know which epics exist'],
        whenToPivot: 'If linkage creates friction, review your epic structure. Too many or poorly-defined epics make linkage hard. Simplify the structure.'
      },

      faq: [
        { question: 'What if we can\'t agree on which epic?', answer: 'Pick one. It doesn\'t have to be perfect. Having some link is better than none. You can move it later.' },
        { question: 'Should we link before or after estimation?', answer: 'Before. The epic context might affect how you estimate (complexity, risk).' },
        { question: 'What about items from support/ops?', answer: 'They still need context. Link to Support Requests or Maintenance epic. Even reactive work serves a purpose.' }
      ],

      impact: 'high',
      relatedIndicators: ['epicLinkage']
    },
    {
      id: 'wh-action-5',
      title: 'Build Purpose-Connected Culture',
      category: 'culture',
      recommendationId: 'wh-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Team sees hierarchy as bureaucracy, not value. Links are created but not used for understanding or communication.',
        whyItWorks: 'When the team sees how hierarchy connects their work to outcomes, they care about it. Hierarchy becomes a tool for meaning, not just reporting.',
        background: 'Hierarchy exists to answer "why?" If the team never asks "why?"—or gets no answer from hierarchy—the system is broken. Culture change makes hierarchy matter.',
        resources: []
      },

      implementation: {
        overview: 'Help the team see hierarchy as context that gives their work meaning, not administrative overhead.',
        steps: [
          { title: 'Start reviews with context', description: 'In sprint review, don\'t just demo features. Start with: "This advances [Epic], which supports [Initiative]."' },
          { title: 'Ask the "why" question', description: 'When work seems disconnected, ask: "What\'s this helping us achieve?" Use hierarchy to answer.' },
          { title: 'Share portfolio dashboards', description: 'Show the team how their work appears in portfolio view. "See how your stories roll up to this initiative?"' },
          { title: 'Celebrate strategic alignment', description: 'When someone proactively links work or spots a misaligned item, acknowledge it.' },
          { title: 'Connect to goals', description: 'If your org has OKRs or goals, show how epics connect. "This epic drives KR2 of our Q3 objective."' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team participates in culture shift' },
        timeToImplement: '2-3 sprints to shift mindset',
        effort: 'medium',
        prerequisites: ['Meaningful hierarchy in place', 'Portfolio visibility']
      },

      validation: {
        experiments: [
          { name: 'Epic storytelling', description: 'Have each team member explain one epic: what problem it solves, what\'s been done, what\'s left.', duration: '1 session', howToMeasure: 'Can everyone tell a coherent story? Do they understand the purpose?' }
        ],
        successMetrics: [
          { metric: 'Purpose understanding', target: 'High', howToMeasure: 'Team can explain "why" for any story they\'re working on' },
          { metric: 'Hierarchy reference', target: 'Used in discussions', howToMeasure: 'Team naturally refers to epics and initiatives in conversation' },
          { metric: 'Proactive linking', target: 'Increasing', howToMeasure: 'Team members creating/correcting links without prompting' }
        ],
        leadingIndicators: ['Team asking about epic context', 'Hierarchy used in sprint planning', 'Discussions reference larger initiatives'],
        laggingIndicators: ['Higher engagement with work', 'Better stakeholder communication', 'Strategic alignment visible']
      },

      pitfalls: {
        commonMistakes: ['Preaching about hierarchy without showing value', 'Making it feel like surveillance', 'Not connecting to outcomes the team cares about'],
        antiPatterns: ['Hierarchy talk without hierarchy action', 'Using hierarchy for blame', 'Disconnecting hierarchy from actual goals'],
        warningSignals: ['Team eye-rolling at hierarchy talk', 'Compliance without understanding', 'Hierarchy seen as management overhead'],
        whenToPivot: 'If culture doesn\'t shift, examine whether hierarchy actually connects to meaningful outcomes. If epics don\'t lead to goals, hierarchy is bureaucracy.'
      },

      faq: [
        { question: 'What if leadership doesn\'t use hierarchy?', answer: 'Start with your team. Show value at your level. If it works, advocate upward with evidence.' },
        { question: 'How do we avoid hierarchy feeling like surveillance?', answer: 'Focus on meaning, not monitoring. Hierarchy answers "why?", not "are you working?"' },
        { question: 'What if our goals change mid-quarter?', answer: 'Update hierarchy. That\'s the point—hierarchy should reflect current reality and strategy.' }
      ],

      impact: 'high',
      relatedIndicators: ['hierarchyDepth']
    },
    {
      id: 'wh-action-6',
      title: 'Orphan Issue Detection Dashboard',
      category: 'tooling',
      recommendationId: 'wh-action-6',

      knowledge: {
        problemSolved: 'Orphaned issues accumulate invisibly. Without a report, you don\'t know what\'s unlinked.',
        whyItWorks: 'A dashboard showing orphans creates visibility and accountability. You can\'t fix what you can\'t see.',
        background: 'Even with good processes, some issues slip through unlinked. A dashboard catches these and enables ongoing maintenance.',
        resources: []
      },

      implementation: {
        overview: 'Create a Jira dashboard that shows issues not linked to any parent, enabling ongoing hierarchy maintenance.',
        steps: [
          { title: 'Create the JQL query', description: '"Epic Link" is EMPTY AND type = Story AND project = X. Adjust for your project and types.' },
          { title: 'Build the dashboard', description: 'Add a filter results gadget showing orphaned issues. Include count and list.' },
          { title: 'Set review cadence', description: 'Check weekly. Goal: keep orphan count at zero or near-zero.' },
          { title: 'Act on orphans', description: 'For each orphan: link to appropriate epic, or close if obsolete.' },
          { title: 'Track trend', description: 'Chart orphan count over time. Are we improving or getting worse?' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person builds; someone reviews regularly' },
        timeToImplement: '20 minutes',
        effort: 'low',
        prerequisites: ['Jira dashboard access']
      },

      validation: {
        experiments: [
          { name: 'Orphan cleanup sprint', description: 'Spend one refinement session linking or closing all orphaned issues.', duration: '1 session', howToMeasure: 'Orphan count before and after. Target: zero after.' }
        ],
        successMetrics: [
          { metric: 'Orphan count', target: '<5', howToMeasure: 'Total unlinked stories at any time' },
          { metric: 'Dashboard review', target: 'Weekly', howToMeasure: 'Dashboard checked at least weekly' },
          { metric: 'Orphan trend', target: 'Decreasing', howToMeasure: 'Fewer orphans over time as processes improve' }
        ],
        leadingIndicators: ['Dashboard being checked', 'Orphans being addressed promptly', 'Team aware of dashboard'],
        laggingIndicators: ['Near-zero orphan rate sustained', 'Clean hierarchy', 'Accurate portfolio reporting']
      },

      pitfalls: {
        commonMistakes: ['Building dashboard but never checking it', 'Linking orphans to wrong epic just to clear the list', 'Not investigating why orphans occur'],
        antiPatterns: ['Orphan cleanup without fixing root cause', 'Blaming individuals for creating orphans', 'Dashboard becomes a source of shame'],
        warningSignals: ['Orphan count growing despite dashboard', 'Same issues orphaned repeatedly', 'Dashboard ignored'],
        whenToPivot: 'If orphans keep appearing, the problem is upstream. Focus on making epic link required or improving refinement process rather than just cleanup.'
      },

      faq: [
        { question: 'What about bugs and tasks?', answer: 'Include them if they should have epic links. Exclude if they\'re sub-tasks or don\'t need hierarchy.' },
        { question: 'Is zero orphans realistic?', answer: 'Near-zero is realistic with good process. A few orphans at any time is fine as long as they\'re addressed quickly.' },
        { question: 'Should we delete old orphans?', answer: 'Review first. Old orphans might be abandoned work (close them) or forgotten priorities (resurrect them). Don\'t delete without understanding.' }
      ],

      impact: 'medium',
      relatedIndicators: ['orphanRate']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Basic linkage. Get every story connected to an epic.',
      avoid: 'Don\'t create too many epics. Group sensibly.',
      nextStep: 'Make epic link required and create catchall epics.'
    },
    2: {
      focus: 'Meaningful epics. Ensure epics represent coherent initiatives.',
      avoid: 'Don\'t let epics become dumping grounds.',
      nextStep: 'Establish epic health check process.'
    },
    3: {
      focus: 'Full hierarchy. Connect epics to initiatives and goals.',
      avoid: 'Don\'t over-structure. Depth should add value.',
      nextStep: 'Run Zero Orphans Sprint experiment.'
    },
    4: {
      focus: 'Portfolio visibility. Use hierarchy for executive reporting.',
      avoid: 'Don\'t let hierarchy become stale. Active maintenance needed.',
      nextStep: 'Create portfolio dashboards using hierarchy.'
    },
    5: {
      focus: 'Strategic alignment. Hierarchy enables OKR tracking.',
      avoid: 'Don\'t let hierarchy become bureaucracy.',
      nextStep: 'Connect hierarchy to organizational goals and OKRs.'
    }
  }
};

// Playbook content for Sprint Hygiene dimension
export const sprintHygienePlaybook: DimensionPlaybook = {
  dimensionKey: 'sprintHygiene',
  dimensionName: 'Sprint Hygiene',
  overview: 'Sprint hygiene measures the quality of your sprint practices: clean starts, minimal scope changes, completed work. Poor hygiene leads to rolling work across sprints, unreliable velocity, and team frustration. Good hygiene enables predictability and sustainable pace.',

  successCriteria: [
    {
      id: 'sprint-completion',
      label: 'Sprint Completion Rate',
      description: 'Percentage of committed work completed per sprint',
      targetValue: 85,
      unit: '%',
      indicatorId: 'sprintCompletion'
    },
    {
      id: 'scope-change',
      label: 'Scope Change Rate',
      description: 'Work added or removed after sprint start',
      targetValue: 10,
      unit: '%',
      indicatorId: 'scopeChange'
    },
    {
      id: 'carryover-rate',
      label: 'Carryover Rate',
      description: 'Items not completed rolling to next sprint',
      targetValue: 15,
      unit: '%',
      indicatorId: 'carryoverRate'
    }
  ],

  actions: [
    {
      id: 'sh-action-1',
      title: 'Implement Sprint Scope Lock',
      category: 'quick-win',
      recommendationId: 'sh-action-1',

      knowledge: {
        problemSolved: 'Work keeps getting added mid-sprint, destabilizing plans, creating context-switching, and causing carryover.',
        whyItWorks: 'A locked scope creates a protected container. The team can focus on committed work without constant reprioritization. Urgency is questioned rather than automatically accepted.',
        background: 'Mid-sprint scope changes are often habit rather than necessity. Without a lock, "urgent" requests bypass planning. Over time, sprint boundaries become meaningless.',
        resources: [
          {
            title: 'Sprint Planning Best Practices',
            type: 'article',
            description: 'How to plan sprints for predictable delivery including scope protection strategies'
          }
        ]
      },

      implementation: {
        overview: 'Establish a practice where sprint scope is fixed after planning. New requests go to next sprint unless truly exceptional.',
        steps: [
          { title: 'Capture baseline at sprint start', description: 'Screenshot or export the sprint backlog at day 1. This is your baseline for measuring scope change.' },
          { title: 'Define the exception process', description: 'New requests must answer: "Can it wait 2 weeks?" If truly urgent, what leaves the sprint to make room? One in = one out.' },
          { title: 'Communicate to stakeholders', description: 'Tell product owners and stakeholders: sprint scope is locked after planning. New items go to backlog for next sprint.' },
          { title: 'Track every change', description: 'Log additions and removals. Comment on issues noting they were added/removed mid-sprint. Review in retrospective.' },
          { title: 'Review and learn', description: 'At sprint end: what was added? Was it truly urgent? What could have been done differently?' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Team enforces; PM manages stakeholder expectations' },
        timeToImplement: 'Starts next sprint',
        effort: 'low',
        prerequisites: ['Sprint planning in place', 'Stakeholder communication']
      },

      validation: {
        experiments: [
          { name: 'Scope freeze challenge', description: 'For one sprint, allow zero scope changes after planning. Nothing added, nothing removed.', duration: '1 sprint', howToMeasure: 'Count additions/removals. Target: zero. Track what was deferred and whether it was actually urgent.' }
        ],
        successMetrics: [
          { metric: 'Scope change rate', target: '<10%', howToMeasure: '(Items added + removed) / original commitment × 100' },
          { metric: 'Exception quality', target: 'Truly urgent only', howToMeasure: 'Retrospective review: were mid-sprint adds really urgent?' },
          { metric: 'Stakeholder compliance', target: 'Requests go to backlog', howToMeasure: 'New requests default to next sprint, not current' }
        ],
        leadingIndicators: ['Fewer mid-sprint requests', 'Stakeholders planning ahead', '"Can it wait?" becomes normal question'],
        laggingIndicators: ['Higher completion rate', 'More predictable delivery', 'Reduced context switching']
      },

      pitfalls: {
        commonMistakes: ['Making exceptions constantly—lock becomes meaningless', 'Being rigid when genuine emergency occurs', 'Not tracking scope changes'],
        antiPatterns: ['Scope lock in theory but not practice', 'PM still adding work "just this once"', 'Blaming team for not completing unstable scope'],
        warningSignals: ['More than 20% scope change despite "lock"', 'Team frustrated by constant additions', 'Stakeholders ignoring the practice'],
        whenToPivot: 'If genuine emergencies are frequent, examine why. Is planning incomplete? Are production issues too common? The lock reveals underlying issues.'
      },

      faq: [
        { question: 'What about production issues?', answer: 'Genuine production emergencies are exceptions. But "CEO asked for this" isn\'t an emergency. Define what qualifies.' },
        { question: 'What if the sprint runs out of work?', answer: 'Pull from backlog. Scope lock protects against additions, not against finishing early and pulling more.' },
        { question: 'Does this apply to bugs found during sprint?', answer: 'Bugs in sprint work can be fixed as part of that work. New bugs unrelated to sprint work go to backlog unless urgent.' }
      ],

      impact: 'high',
      relatedIndicators: ['scopeChange']
    },
    {
      id: 'sh-action-2',
      title: 'Right-Size Sprint Commitments',
      category: 'quick-win',
      recommendationId: 'sh-action-2',

      knowledge: {
        problemSolved: 'Team commits to more than they can complete, leading to chronic carryover, failed sprints, and eroded morale.',
        whyItWorks: 'Planning to 80% capacity leaves room for unknowns, interruptions, and normal variation. It\'s better to finish early and pull more than to chronically underdeliver.',
        background: 'Teams often commit to 100% of velocity, forgetting that velocity is an average. Some sprints have more interruptions, harder stories, or team absences. Buffer acknowledges reality.',
        resources: []
      },

      implementation: {
        overview: 'Plan sprint capacity at 80% of historical velocity, leaving buffer for reality to unfold.',
        steps: [
          { title: 'Calculate baseline velocity', description: 'Average your completed points over the last 3-5 sprints. This is your baseline, not your target.' },
          { title: 'Apply 80% factor', description: 'Multiply baseline by 0.8. This is your planning capacity. If average is 50 points, plan for 40.' },
          { title: 'Account for known impacts', description: 'Adjust for holidays, team absences, or known disruptions. 80% is for normal sprints; reduce further when abnormal.' },
          { title: 'Fill to capacity, not over', description: 'During planning, stop when you hit capacity. Resist the urge to squeeze one more in.' },
          { title: 'Track and adjust', description: 'If you consistently finish early, capacity might be too low. If carryover persists, it\'s too high. Adjust quarterly.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Team commits to planned capacity' },
        timeToImplement: 'Starts next sprint planning',
        effort: 'low',
        prerequisites: ['3-5 sprints of velocity history']
      },

      validation: {
        experiments: [
          { name: 'Zero carryover sprint', description: 'Commit to less than usual with goal of completing 100% of committed work.', duration: '1 sprint', howToMeasure: 'Did everything complete? How did it feel? What enabled success?' }
        ],
        successMetrics: [
          { metric: 'Completion rate', target: '>85%', howToMeasure: 'Completed points / committed points' },
          { metric: 'Carryover rate', target: '<15%', howToMeasure: 'Items rolled to next sprint / items committed' },
          { metric: 'Team satisfaction', target: 'Improved', howToMeasure: 'Retro feedback on sprint achievability' }
        ],
        leadingIndicators: ['Sprint planning ends with room to spare', 'Team feels confident in commitment', 'Less end-of-sprint crunch'],
        laggingIndicators: ['Consistent completion rates', 'Reliable velocity for forecasting', 'Team morale improvement']
      },

      pitfalls: {
        commonMistakes: ['Treating 80% as minimum rather than maximum', 'Filling buffer with "stretch goals" that become expectations', 'Not adjusting for team changes'],
        antiPatterns: ['Committing to 100% then blaming team for not hitting it', 'Leadership pressure to commit more', 'Velocity gaming'],
        warningSignals: ['Still carrying over despite lower commitment', 'Team resistance to lower targets', 'Stakeholders complaining about reduced output'],
        whenToPivot: 'If 80% still leads to carryover, drop to 70%. If the team consistently finishes at 60% of commitment, there may be estimation or productivity issues to address.'
      },

      faq: [
        { question: 'Won\'t we deliver less?', answer: 'Actually, reliable delivery of 80% beats unreliable promises of 100%. Stakeholders prefer predictability.' },
        { question: 'What if leadership demands higher commitment?', answer: 'Show data. Chronic carryover with high commitment vs. consistent completion with realistic commitment. Which is better for the business?' },
        { question: 'Should we still have stretch goals?', answer: 'Only if the team genuinely wants them and they\'re truly optional. Never make stretch goals carry consequences.' }
      ],

      impact: 'high',
      relatedIndicators: ['sprintCompletion', 'carryoverRate']
    },
    {
      id: 'sh-action-3',
      title: 'Enforce Definition of Done',
      category: 'process',
      recommendationId: 'sh-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Work gets marked "done" when it\'s not truly complete—tests are skipped, docs are missing, code isn\'t deployed. Technical debt accumulates.',
        whyItWorks: 'A clear, enforced Definition of Done creates consistent quality. "Done" means the same thing every time. No surprises, no hidden work.',
        background: 'Teams often compromise on "done" under time pressure. Without enforcement, standards erode over time. Definition of Done is only valuable if it\'s actually used.',
        resources: [
          {
            title: 'Definition of Done Template',
            type: 'template',
            description: 'Checklist template for consistent completion standards including code review, testing, and deployment criteria'
          }
        ]
      },

      implementation: {
        overview: 'Create or revise your Definition of Done and make it a hard gate for completion—no exceptions.',
        steps: [
          { title: 'Create or review DoD', description: 'Common items: code reviewed, tests passing, deployed to staging, documentation updated, accessibility checked. Customize for your context.' },
          { title: 'Make it visible', description: 'Print it. Put it in Confluence. Add it to Jira. Everyone should see it when marking work done.' },
          { title: 'Verify before Done', description: 'Before moving any item to Done, check the checklist. If any item fails, it\'s not done.' },
          { title: 'No partial credit', description: 'Done is binary. If tests are failing, it\'s not done. If not deployed, it\'s not done. No "mostly done."' },
          { title: 'Review in retro', description: 'Regularly ask: "Is our DoD working? Should we add or remove items?"' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Team agrees on DoD; everyone enforces' },
        timeToImplement: '1-2 sprints to establish habit',
        effort: 'medium',
        prerequisites: ['Team agreement on quality standards']
      },

      validation: {
        experiments: [
          { name: 'DoD audit sprint', description: 'For one sprint, have someone verify DoD compliance for every completed item.', duration: '1 sprint', howToMeasure: 'What percentage met all DoD criteria? What was commonly skipped?' }
        ],
        successMetrics: [
          { metric: 'DoD compliance', target: '100%', howToMeasure: 'All completed items meet all DoD criteria' },
          { metric: 'Rework rate', target: '<10%', howToMeasure: 'Items reopened due to missed work' },
          { metric: 'Consistent quality', target: 'No surprises', howToMeasure: 'All "done" items are truly complete' }
        ],
        leadingIndicators: ['Team checking DoD before marking done', 'Quality issues caught before completion', 'DoD referenced in discussions'],
        laggingIndicators: ['Fewer bugs from incomplete work', 'Reduced tech debt accumulation', 'Stakeholder trust in "done"']
      },

      pitfalls: {
        commonMistakes: ['DoD too long—becomes ignored', 'DoD not enforced under time pressure', 'Different standards for different people'],
        antiPatterns: ['DoD as aspirational rather than mandatory', 'Skipping DoD for "quick fixes"', 'DoD created but never reviewed'],
        warningSignals: ['Items marked done that clearly aren\'t', 'DoD checklist never actually used', '"We don\'t have time for DoD"'],
        whenToPivot: 'If DoD is consistently skipped, it might be too aggressive. Reduce to what\'s truly essential and enforceable. Build from there.'
      },

      faq: [
        { question: 'What if we can\'t hit DoD for a story?', answer: 'Then it\'s not done. Either finish the DoD items or don\'t mark it complete. Velocity should reflect real completion.' },
        { question: 'Should DoD be the same for all work types?', answer: 'Can vary slightly—bugs might not need user documentation. But core quality items (review, tests, deploy) should be consistent.' },
        { question: 'Who enforces DoD?', answer: 'Everyone. It\'s a team standard, not one person\'s job to police. Peer accountability works best.' }
      ],

      impact: 'high',
      relatedIndicators: ['sprintCompletion']
    },
    {
      id: 'sh-action-4',
      title: 'Mid-Sprint Health Check',
      category: 'process',
      recommendationId: 'sh-action-4',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Sprint risks are discovered at the end when it\'s too late to adjust. Work rolls over that could have been addressed earlier.',
        whyItWorks: 'Checking progress mid-sprint gives time to react. At-risk items can be descoped, swarmed, or acknowledged early. No surprises at sprint end.',
        background: 'Daily standup catches immediate blockers but often misses trajectory. Mid-sprint is the right moment to ask: "Are we on track to complete?"',
        resources: []
      },

      implementation: {
        overview: 'Schedule a brief mid-sprint review to assess progress and identify at-risk items before it\'s too late.',
        steps: [
          { title: 'Schedule the check', description: 'For a 2-week sprint, day 5 or 6 is ideal. Add 30 minutes to the calendar—whole team or just leads.' },
          { title: 'Review each item', description: 'For in-progress items: "Will this complete by sprint end?" For not-started items: "Is this at risk?"' },
          { title: 'Identify at-risk items', description: 'Flag anything that might not complete. Be honest—hopeful isn\'t the same as realistic.' },
          { title: 'Decide on action', description: 'Options: reduce scope, swarm resources, accept carryover, or escalate blockers. Decide now, not at sprint end.' },
          { title: 'Communicate early', description: 'If carryover is likely, tell stakeholders now. Early warning beats last-minute disappointment.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone contributes status; leads decide actions' },
        timeToImplement: '30 minutes per sprint',
        effort: 'low',
        prerequisites: ['Clear sprint backlog', 'Team availability mid-sprint']
      },

      validation: {
        experiments: [
          { name: 'Prediction accuracy', description: 'At mid-sprint, predict what will complete. At sprint end, compare to actual.', duration: '3 sprints', howToMeasure: 'Prediction accuracy should be >80%. If not, improve your mid-sprint assessment.' }
        ],
        successMetrics: [
          { metric: 'Prediction accuracy', target: '>80%', howToMeasure: 'Mid-sprint predictions match end-of-sprint reality' },
          { metric: 'Surprise carryover', target: 'Zero', howToMeasure: 'Items that carry over without mid-sprint warning' },
          { metric: 'Stakeholder notice', target: '>24 hours', howToMeasure: 'Time between risk identification and stakeholder communication' }
        ],
        leadingIndicators: ['Health check happening consistently', 'Team honest about risks', 'Actions taken based on check'],
        laggingIndicators: ['Fewer end-of-sprint surprises', 'Better stakeholder relationships', 'Improved completion predictability']
      },

      pitfalls: {
        commonMistakes: ['Health check but no action taken', 'Optimistic assessments that ignore reality', 'Skipping check when sprint feels fine'],
        antiPatterns: ['Check becomes blame session', 'Only team lead assesses—no team input', 'Using check to add pressure instead of adjust'],
        warningSignals: ['Health check says green, sprint ends red', 'Same risks identified but not addressed', 'Team afraid to report problems'],
        whenToPivot: 'If mid-sprint checks don\'t improve outcomes, the issue may be earlier—poor planning or estimation. Address upstream first.'
      },

      faq: [
        { question: 'What if everything looks fine mid-sprint?', answer: 'Great! Quick confirmation, move on. The value is catching problems early when they exist.' },
        { question: 'Should we adjust scope based on health check?', answer: 'Yes, that\'s the point. Better to descope mid-sprint than carry over at end.' },
        { question: 'Who runs the health check?', answer: 'Scrum Master or Tech Lead typically. But everyone contributes honest status.' }
      ],

      impact: 'high',
      relatedIndicators: ['sprintCompletion', 'carryoverRate']
    },
    {
      id: 'sh-action-5',
      title: 'Establish Sustainable Pace',
      category: 'culture',
      recommendationId: 'sh-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Team is burning out from unsustainable pace—overtime, weekend work, skipped quality. Short-term gains create long-term damage.',
        whyItWorks: 'A pace you can maintain indefinitely produces more over time than sprinting and crashing. Sustainable pace protects quality, retention, and long-term velocity.',
        background: 'Teams often sacrifice sustainability for deadline pressure. But tired teams make mistakes, skip quality, and eventually leave. Sustainable pace is a feature, not a constraint.',
        resources: []
      },

      implementation: {
        overview: 'Explicitly discuss and commit to a pace the team can maintain indefinitely without burnout.',
        steps: [
          { title: 'Assess current state', description: 'In a retro, ask: "Is our current pace sustainable? Could we maintain this for a year?"' },
          { title: 'Identify unsustainability signs', description: 'Warning signs: regular overtime, weekend work, skipped tests, growing tech debt, team frustration, turnover.' },
          { title: 'Set explicit boundaries', description: 'Team agrees: no weekend work by default. Core hours protected. Overtime is an exception, not a norm.' },
          { title: 'Adjust commitments', description: 'If pace isn\'t sustainable, reduce sprint commitments until it is. Velocity should be what you can maintain, not your maximum burst.' },
          { title: 'Protect the pace', description: 'When pressure comes, protect the pace. "We can do more in the short term, but we\'ll pay for it later."' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Team agrees on sustainable pace; leadership respects it' },
        timeToImplement: '3-4 sprints to establish and prove',
        effort: 'medium',
        prerequisites: ['Team willingness to discuss', 'Some leadership support']
      },

      validation: {
        experiments: [
          { name: 'Sustainable sprint', description: 'For 3 sprints, commit to a pace with no overtime. Track: does velocity suffer? Does quality improve?', duration: '3 sprints', howToMeasure: 'Velocity trend, quality metrics (bugs, rework), team satisfaction.' }
        ],
        successMetrics: [
          { metric: 'Overtime hours', target: 'Near zero', howToMeasure: 'Extra hours worked beyond normal week' },
          { metric: 'Velocity consistency', target: '<15% variance', howToMeasure: 'Sprint-to-sprint velocity variation' },
          { metric: 'Team wellbeing', target: 'Positive feedback', howToMeasure: 'Retro discussions, team surveys' }
        ],
        leadingIndicators: ['Team leaving on time', 'Quality not skipped for speed', 'Honest conversations about pace'],
        laggingIndicators: ['Lower turnover', 'Sustained velocity over quarters', 'Better team morale']
      },

      pitfalls: {
        commonMistakes: ['Agreeing to sustainable pace but accepting every urgent request', 'Only talking about pace, not changing commitments', 'Individual heroics undermining team norm'],
        antiPatterns: ['Sustainable pace for some but not all', 'Pace as excuse for underperformance', 'Ignoring genuine crunch periods'],
        warningSignals: ['Team still working late despite "commitment"', 'Burnout continuing', 'Velocity propped up by overtime'],
        whenToPivot: 'If team can\'t sustain the pace even with reduced commitments, there may be skill gaps, process problems, or external pressure issues to address.'
      },

      faq: [
        { question: 'What about crunch times like releases?', answer: 'Occasional crunch is different from chronic unsustainability. If every sprint is crunch, that\'s the problem.' },
        { question: 'Won\'t we deliver less?', answer: 'In the short term, maybe. In the long term, sustainable pace produces more because teams don\'t burn out or quit.' },
        { question: 'What if leadership demands more?', answer: 'Show the data: overtime hours, quality metrics, turnover. Make the case that sustainable pace is good for the business.' }
      ],

      impact: 'high',
      relatedIndicators: ['sprintCompletion']
    },
    {
      id: 'sh-action-6',
      title: 'Sprint Health Dashboard',
      category: 'tooling',
      recommendationId: 'sh-action-6',

      knowledge: {
        problemSolved: 'Sprint health is invisible between reviews. Problems accumulate without visibility.',
        whyItWorks: 'A dashboard creates continuous visibility into sprint health. Everyone can see completion rate trends, carryover patterns, and scope changes.',
        background: 'What gets measured gets managed. Without visible metrics, sprint hygiene discussions become opinion rather than data-driven.',
        resources: []
      },

      implementation: {
        overview: 'Create a dashboard showing key sprint health metrics to drive visibility and improvement.',
        steps: [
          { title: 'Build the dashboard', description: 'Create in Jira or analytics tool. Key widgets: burndown, completion rate trend (5 sprints), carryover count, scope changes.' },
          { title: 'Add burndown chart', description: 'Standard burndown showing ideal vs. actual progress during current sprint.' },
          { title: 'Add completion rate trend', description: 'Line chart showing completion rate (completed points / committed points) over last 5-10 sprints.' },
          { title: 'Add carryover tracker', description: 'Count of items that rolled from previous sprint. Highlight persistent carryover (items that rolled multiple times).' },
          { title: 'Review cadence', description: 'Check dashboard at sprint start, mid-sprint health check, and sprint end. Reference in retros.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person builds; whole team references' },
        timeToImplement: '30 minutes',
        effort: 'low',
        prerequisites: ['Jira dashboard access', 'Sprint history']
      },

      validation: {
        experiments: [
          { name: 'Dashboard-driven retro', description: 'For 3 sprints, start retro by reviewing sprint health dashboard together.', duration: '3 sprints', howToMeasure: 'Do discussions become more data-driven? Are improvements based on metrics?' }
        ],
        successMetrics: [
          { metric: 'Dashboard usage', target: 'Reviewed each sprint', howToMeasure: 'Dashboard referenced in planning and retros' },
          { metric: 'Metric trends', target: 'Improving or stable', howToMeasure: 'Completion rate, carryover trending in right direction' },
          { metric: 'Data-driven decisions', target: 'Visible in discussions', howToMeasure: 'Team references metrics when discussing sprint health' }
        ],
        leadingIndicators: ['Team members checking dashboard independently', 'Metrics referenced in standup', 'Questions arising from dashboard patterns'],
        laggingIndicators: ['Sustained improvement in hygiene metrics', 'Objective retro discussions', 'Clear visibility for stakeholders']
      },

      pitfalls: {
        commonMistakes: ['Building dashboard but not using it', 'Too many metrics—signal lost in noise', 'Dashboard shows problems but no action taken'],
        antiPatterns: ['Dashboard as surveillance rather than transparency', 'Gaming metrics to look good', 'Dashboard blame tool'],
        warningSignals: ['Dashboard not updated', 'No one knows it exists', 'Metrics not discussed in meetings'],
        whenToPivot: 'If dashboard isn\'t driving improvement after 3-4 sprints, simplify to 2-3 key metrics and embed them in existing rituals rather than creating separate dashboard sessions.'
      },

      faq: [
        { question: 'What\'s the most important metric?', answer: 'Completion rate. If you\'re completing what you commit to, other hygiene metrics usually follow.' },
        { question: 'Should stakeholders see this dashboard?', answer: 'Transparency builds trust. If stakeholders can see your metrics improving, it builds confidence.' },
        { question: 'What if metrics look bad?', answer: 'That\'s the point—visibility enables improvement. You can\'t fix what you can\'t see.' }
      ],

      impact: 'medium',
      relatedIndicators: ['sprintCompletion', 'carryoverRate', 'scopeChange']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Basic completion. Get most committed work done each sprint.',
      avoid: 'Don\'t overcommit. Start conservative.',
      nextStep: 'Plan to 80% capacity and track completion rate.'
    },
    2: {
      focus: 'Scope stability. Minimize mid-sprint changes.',
      avoid: 'Don\'t accept every urgent request.',
      nextStep: 'Implement sprint scope lock practice.'
    },
    3: {
      focus: 'Quality completion. Definition of Done enforcement.',
      avoid: 'Don\'t count incomplete work as done.',
      nextStep: 'Review and enforce Definition of Done.'
    },
    4: {
      focus: 'Predictability. Consistent velocity and completion.',
      avoid: 'Don\'t sacrifice sustainable pace for heroics.',
      nextStep: 'Run Zero Carryover Sprint experiment.'
    },
    5: {
      focus: 'Excellence. Model sprint practices for organization.',
      avoid: 'Don\'t assume it\'s "solved." Hygiene needs maintenance.',
      nextStep: 'Share sprint practices as organizational standard.'
    }
  }
};

// Playbook content for Team Collaboration dimension
export const teamCollaborationPlaybook: DimensionPlaybook = {
  dimensionKey: 'teamCollaboration',
  dimensionName: 'Team Collaboration',
  overview: 'Team collaboration measures how effectively team members work together: code reviews, pair work, knowledge sharing, and communication. Poor collaboration creates silos, single points of failure, and slower knowledge transfer. Strong collaboration builds resilient teams that deliver together.',

  successCriteria: [
    {
      id: 'review-coverage',
      label: 'Review Coverage',
      description: 'Percentage of work reviewed by another team member',
      targetValue: 95,
      unit: '%',
      indicatorId: 'reviewCoverage'
    },
    {
      id: 'collaboration-index',
      label: 'Collaboration Index',
      description: 'Multiple contributors on issues (comments, commits)',
      targetValue: 70,
      unit: '%',
      indicatorId: 'collaborationIndex'
    },
    {
      id: 'knowledge-distribution',
      label: 'Knowledge Distribution',
      description: 'Areas with multiple experts (no single point of failure)',
      targetValue: 80,
      unit: '%',
      indicatorId: 'knowledgeDistribution'
    }
  ],

  actions: [
    {
      id: 'tc-action-1',
      title: 'Require Code Review Gate',
      category: 'quick-win',
      recommendationId: 'tc-action-1',

      knowledge: {
        problemSolved: 'Code merges without review, creating knowledge silos and missing bugs that a second pair of eyes would catch.',
        whyItWorks: 'Mandatory review ensures every change is seen by at least two people. This catches bugs, spreads knowledge, and creates natural collaboration points.',
        background: 'Code review is the most common form of engineering collaboration. When optional, it gets skipped under time pressure. Making it a gate ensures it happens.',
        resources: [
          {
            title: 'Code Review Best Practices',
            type: 'article',
            description: 'How to do code reviews that improve quality and spread knowledge effectively'
          }
        ]
      },

      implementation: {
        overview: 'Configure branch protection to require at least one approval before merging, making review mandatory for all changes.',
        steps: [
          { title: 'Configure branch protection', description: 'In GitHub/GitLab/Bitbucket: set up branch protection for main/master requiring 1+ approval before merge.' },
          { title: 'Communicate the change', description: 'Tell the team: "Every PR needs a review before merging. No exceptions, even for small changes."' },
          { title: 'Set review expectations', description: 'What makes a good review? Code correctness, readability, test coverage, design feedback. Not just "LGTM."' },
          { title: 'Rotate reviewers', description: 'Avoid same pairs always reviewing each other. Rotate to spread knowledge across the team.' },
          { title: 'Track turnaround time', description: 'Monitor how long PRs wait for review. Set expectation: review requests addressed within 24 hours.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone participates in reviewing' },
        timeToImplement: '15 minutes to configure',
        effort: 'low',
        prerequisites: ['Git hosting access with branch protection']
      },

      validation: {
        experiments: [
          { name: 'Review coverage audit', description: 'For one month, verify 100% of merged PRs had at least one reviewer.', duration: '1 month', howToMeasure: 'Reviewed PRs / total PRs. Target: 100%.' }
        ],
        successMetrics: [
          { metric: 'Review coverage', target: '100%', howToMeasure: 'All PRs have at least one reviewer before merge' },
          { metric: 'Review turnaround', target: '<24 hours', howToMeasure: 'Average time from review request to first review' },
          { metric: 'Reviewer distribution', target: 'Spread across team', howToMeasure: 'No one person reviewing more than 40% of PRs' }
        ],
        leadingIndicators: ['PRs waiting for review decreasing', 'Review quality improving', 'Knowledge spreading visible'],
        laggingIndicators: ['Fewer bugs reaching production', 'Better code consistency', 'Team members comfortable in more areas']
      },

      pitfalls: {
        commonMistakes: ['Rubber-stamp reviews ("LGTM" without reading)', 'Always same reviewer', 'PRs too large for meaningful review'],
        antiPatterns: ['Reviews as gatekeeping rather than collaboration', 'Long wait times for review', 'Confrontational review culture'],
        warningSignals: ['Reviews taking days', 'Same person always blocked on reviews', 'Reviews not finding issues'],
        whenToPivot: 'If reviews become bottleneck, address reviewer capacity. Consider smaller PRs, dedicated review time, or async review culture.'
      },

      faq: [
        { question: 'What about tiny changes?', answer: 'Still require review. Small changes can still have bugs. The overhead is minimal; the habit is valuable.' },
        { question: 'What if no one is available to review?', answer: 'Address capacity. Maybe reviews need dedicated time blocks. Or the team is too small and needs cross-team reviewers.' },
        { question: 'How do we avoid review bottlenecks?', answer: 'Keep PRs small (reviewable in 15-30 minutes). Set turnaround expectations. Celebrate fast reviewers.' }
      ],

      impact: 'high',
      relatedIndicators: ['reviewCoverage']
    },
    {
      id: 'tc-action-2',
      title: 'Dedicated Pairing Hours',
      category: 'quick-win',
      recommendationId: 'tc-action-2',

      knowledge: {
        problemSolved: 'Team members work in isolation by default. Collaboration happens only when problems arise, not proactively.',
        whyItWorks: 'Protected time for pairing creates regular collaboration touchpoints. Senior-junior pairing accelerates learning. Pair debugging finds solutions faster.',
        background: 'Pairing is proven to improve code quality and knowledge transfer. But without dedicated time, it competes with "getting work done" and loses.',
        resources: []
      },

      implementation: {
        overview: 'Schedule regular, protected time for pair programming, mobbing, or collaborative design sessions.',
        steps: [
          { title: 'Block time on calendars', description: 'Add 2-4 hours weekly of "pairing time" to team calendars. Make it recurring and protected.' },
          { title: 'Define flexibility', description: 'Pairing time can be: pair programming, mob programming, design sessions, code walkthroughs. Let the team decide each session.' },
          { title: 'Match strategically', description: 'Pair senior with junior for mentoring. Pair people from different specialties for knowledge spread.' },
          { title: 'Rotate partners', description: 'Don\'t always pair the same people. Rotation spreads knowledge and relationships.' },
          { title: 'Capture learnings', description: 'End each session with: "What did we learn?" Share in team channel.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone participates in pairing rotation' },
        timeToImplement: '30 minutes to schedule',
        effort: 'low',
        prerequisites: ['Team calendars accessible', 'Remote pairing tools if distributed']
      },

      validation: {
        experiments: [
          { name: 'Mob programming day', description: 'Entire team works on one feature together for a full day.', duration: '1 day', howToMeasure: 'Did it work? Did everyone learn? Would team do it again?' }
        ],
        successMetrics: [
          { metric: 'Pairing frequency', target: 'Weekly', howToMeasure: 'Pairing sessions per week' },
          { metric: 'Participation', target: '100%', howToMeasure: 'All team members pairing at least once per sprint' },
          { metric: 'Knowledge transfer', target: 'Reported in retros', howToMeasure: 'Team members mention learning from pairing' }
        ],
        leadingIndicators: ['Pairing sessions happening consistently', 'Team requesting more pairing time', 'Junior members becoming more independent'],
        laggingIndicators: ['Reduced knowledge silos', 'Better bus factor', 'Improved team cohesion']
      },

      pitfalls: {
        commonMistakes: ['Forcing pairing when solo work is better', 'Same pairs always', 'Pairing time gets deprioritized'],
        antiPatterns: ['Senior types while junior watches', 'Pairing as surveillance', 'Mandatory pairing creating resentment'],
        warningSignals: ['Team avoiding pairing time', 'One person always driving', 'No learning happening'],
        whenToPivot: 'If pairing isn\'t valued after 3-4 sprints, explore why. Maybe the format needs to change, or team needs smaller doses.'
      },

      faq: [
        { question: 'Is pairing more or less productive?', answer: 'Studies show paired code has fewer bugs and better design. It feels slower but produces better results. Experiment and measure.' },
        { question: 'How do we pair remotely?', answer: 'Use screen sharing, VS Code Live Share, or similar tools. Video on helps. Take breaks—remote pairing is intense.' },
        { question: 'What if someone doesn\'t want to pair?', answer: 'Explore why. Some people need solo time. Find balance—not 100% pairing, but regular collaboration.' }
      ],

      impact: 'high',
      relatedIndicators: ['collaborationIndex', 'knowledgeDistribution']
    },
    {
      id: 'tc-action-3',
      title: 'Bus Factor Review',
      category: 'process',
      recommendationId: 'tc-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Single points of failure: one person knows a critical system, and if they\'re unavailable, the team is stuck.',
        whyItWorks: 'Explicitly mapping knowledge and assigning learning pairs prevents silos from forming. It\'s proactive risk management.',
        background: '"Bus factor" = how many people can be "hit by a bus" before the project is in trouble. Low bus factor is a risk. This addresses it systematically.',
        resources: [
          {
            title: 'Knowledge Mapping Template',
            type: 'template',
            description: 'Template for mapping team expertise and identifying single points of failure'
          }
        ]
      },

      implementation: {
        overview: 'Regularly review knowledge distribution, identify single points of failure, and deliberately spread expertise.',
        steps: [
          { title: 'Map expertise', description: 'List all systems/components. For each, list who has deep knowledge. Use a simple 1-3 scale or "owns/knows/learning/none."' },
          { title: 'Identify bus factor 1 areas', description: 'Where is there only one expert? These are high-risk areas.' },
          { title: 'Assign learning pairs', description: 'For each high-risk area, assign someone to learn from the expert. Make it explicit responsibility.' },
          { title: 'Create learning opportunities', description: 'Assign stories in that area to the learner (with expert support). Add "shadow on feature X" tasks.' },
          { title: 'Review monthly', description: 'Update the knowledge map. Is knowledge spreading? Are new silos forming?' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Team contributes to mapping; individuals take learning assignments' },
        timeToImplement: '2 hours monthly',
        effort: 'medium',
        prerequisites: ['Knowledge of current expertise distribution']
      },

      validation: {
        experiments: [
          { name: 'Expertise rotation sprint', description: 'Each team member takes one task outside their specialty.', duration: '1 sprint', howToMeasure: 'Did everyone work outside specialty? Was support available? Update knowledge map.' }
        ],
        successMetrics: [
          { metric: 'Bus factor 1 areas', target: 'Decreasing', howToMeasure: 'Count of areas with only one expert' },
          { metric: 'Knowledge spread', target: '>2 people per area', howToMeasure: 'Average number of people who can work in each area' },
          { metric: 'Learning assignments', target: 'Progressing', howToMeasure: 'Learning pairs showing growth' }
        ],
        leadingIndicators: ['Learning pairs meeting regularly', 'People volunteering for unfamiliar areas', 'Experts proactively sharing'],
        laggingIndicators: ['Team can handle absences without crisis', 'Less scrambling when expert unavailable', 'Higher team resilience']
      },

      pitfalls: {
        commonMistakes: ['Mapping once and never updating', 'Assigning learning without time for it', 'Expert not actually teaching'],
        antiPatterns: ['Learning in theory, expert still does all work', 'Overwhelming expert with teaching duties', 'Ignoring areas that are "too specialized"'],
        warningSignals: ['Same areas stay bus factor 1', 'Learning pairs not meeting', 'No visible knowledge spread'],
        whenToPivot: 'If knowledge isn\'t spreading despite efforts, examine whether experts have time/incentive to teach. May need dedicated knowledge transfer time.'
      },

      faq: [
        { question: 'What if someone is the only one who can learn it?', answer: 'Unlikely. Most skills can be taught. If truly specialized, consider external hiring or training.' },
        { question: 'How detailed should the map be?', answer: 'Detailed enough to identify risks. Start high-level and drill into problem areas.' },
        { question: 'What if the expert leaves before knowledge transfers?', answer: 'This is the risk you\'re mitigating. Prioritize high-risk areas with experts at flight risk.' }
      ],

      impact: 'high',
      relatedIndicators: ['knowledgeDistribution']
    },
    {
      id: 'tc-action-4',
      title: 'Cross-Functional Assignments',
      category: 'process',
      recommendationId: 'tc-action-4',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Team members only work in their specialty, creating deep silos and dependencies.',
        whyItWorks: 'Occasionally assigning work outside someone\'s specialty (with support) builds T-shaped skills. Team becomes more flexible and resilient.',
        background: 'T-shaped people have depth in one area but breadth across others. This reduces bottlenecks and improves collaboration.',
        resources: []
      },

      implementation: {
        overview: 'Ensure sprints include opportunities for team members to work outside their primary specialty, with support.',
        steps: [
          { title: 'Note specialty during planning', description: 'When discussing stories, ask: "Who can do this? Who could learn?"' },
          { title: 'Assign stretch work', description: 'Occasionally assign stories to someone outside their specialty. Start small—simple tasks in unfamiliar areas.' },
          { title: 'Pair with expert', description: 'When someone works outside specialty, pair them with the expert. They\'re not alone.' },
          { title: 'Expect slower delivery', description: 'Cross-functional work takes longer initially. That\'s the investment. Account for it in planning.' },
          { title: 'Track capability growth', description: 'Update knowledge map: who can do what now that couldn\'t before?' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone participates in cross-functional growth' },
        timeToImplement: '1-2 sprints to establish pattern',
        effort: 'medium',
        prerequisites: ['Bus factor review completed', 'Team willing to stretch']
      },

      validation: {
        experiments: [
          { name: 'Expertise rotation sprint', description: 'Each person takes one task outside their usual area.', duration: '1 sprint', howToMeasure: 'Everyone worked outside specialty. No one was stuck without help. Knowledge map updated.' }
        ],
        successMetrics: [
          { metric: 'Cross-functional assignments', target: '>1 per sprint', howToMeasure: 'Stories assigned outside primary specialty' },
          { metric: 'Capability growth', target: 'Visible progress', howToMeasure: 'More people can do more things over time' },
          { metric: 'Bottleneck reduction', target: 'Fewer single-person dependencies', howToMeasure: 'Stories waiting for specific person' }
        ],
        leadingIndicators: ['Team members volunteering for unfamiliar work', 'Less resistance to stretch assignments', 'Experts proactively offering to support'],
        laggingIndicators: ['More flexible sprint staffing', 'Reduced individual dependencies', 'Better bus factor']
      },

      pitfalls: {
        commonMistakes: ['Throwing people into deep end without support', 'Too much stretch work—delivery suffers', 'Forgetting to update capability records'],
        antiPatterns: ['Expert does work while "learner" watches', 'Penalizing slower delivery during learning', 'Only juniors do stretch, seniors stay comfortable'],
        warningSignals: ['Stretch assignments always fail', 'Team resisting cross-functional work', 'Quality dropping in unfamiliar areas'],
        whenToPivot: 'If cross-functional work consistently fails, start smaller. Maybe pairing/shadowing before independent work.'
      },

      faq: [
        { question: 'Won\'t this slow delivery?', answer: 'Initially, yes. It\'s an investment. Long-term, team becomes more flexible and faster overall.' },
        { question: 'What if someone fails at the stretch work?', answer: 'That\'s expected sometimes. The point is learning, not perfection. Support them and celebrate the attempt.' },
        { question: 'Should seniors also stretch?', answer: 'Absolutely. Seniors learning new areas models growth mindset and builds empathy for learners.' }
      ],

      impact: 'medium',
      relatedIndicators: ['knowledgeDistribution']
    },
    {
      id: 'tc-action-5',
      title: 'Foster Collaboration Over Heroes',
      category: 'culture',
      recommendationId: 'tc-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Individual heroics are celebrated over team collaboration. People compete rather than help each other.',
        whyItWorks: 'When collaboration is valued and recognized, people naturally help each other. Knowledge sharing becomes the norm, not the exception.',
        background: 'Hero culture feels productive but creates fragile teams. When the hero is unavailable, everything stops. Collaboration culture is more resilient.',
        resources: []
      },

      implementation: {
        overview: 'Shift team culture to value collaboration, mutual support, and team success over individual achievement.',
        steps: [
          { title: 'Change recognition patterns', description: 'In sprint review, highlight collaborative efforts: "This feature was possible because X helped Y with Z."' },
          { title: 'Ask "who helped?"', description: 'When celebrating accomplishments, ask: "Who helped you succeed?" Normalize giving credit to helpers.' },
          { title: 'Model help-seeking', description: 'Leaders and seniors should openly ask for help. "I\'m stuck on X, can anyone pair with me?"' },
          { title: 'Set help-seeking expectation', description: 'If stuck for more than 2 hours, you should ask for help. Not doing so is the problem, not asking.' },
          { title: 'Celebrate helping', description: 'Recognize people who unblock others, share knowledge, or mentor. "Thanks for helping three people this sprint."' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Whole team participates in culture shift' },
        timeToImplement: '3-4 sprints to shift culture',
        effort: 'medium',
        prerequisites: ['Leadership buy-in', 'Psychological safety to ask for help']
      },

      validation: {
        experiments: [
          { name: 'Help tracking sprint', description: 'Track every time someone helps another team member. Who helps most? Who helps least?', duration: '1 sprint', howToMeasure: 'Count help instances. Recognize top helpers. Discuss patterns.' }
        ],
        successMetrics: [
          { metric: 'Help-seeking rate', target: 'Increasing', howToMeasure: 'People asking for help more frequently' },
          { metric: 'Solo stuck time', target: '<2 hours', howToMeasure: 'Average time stuck before asking for help' },
          { metric: 'Collaboration mentions', target: 'Present in reviews', howToMeasure: 'Collaborative efforts highlighted in sprint review' }
        ],
        leadingIndicators: ['More help requests in team channel', 'People offering help proactively', 'Collaborative language in standups'],
        laggingIndicators: ['Less individual burnout', 'Better knowledge distribution', 'Higher team satisfaction']
      },

      pitfalls: {
        commonMistakes: ['Preaching collaboration but still rewarding heroes', 'Punishing solo work even when appropriate', 'Not modeling help-seeking from the top'],
        antiPatterns: ['Forced collaboration that feels artificial', 'Collaboration as surveillance', 'Shaming people for working alone'],
        warningSignals: ['Same people always helping, others never', 'Help requests ignored', 'Team going through motions without real collaboration'],
        whenToPivot: 'If collaboration doesn\'t increase, examine whether it\'s safe to ask for help. Psychological safety may be the root issue.'
      },

      faq: [
        { question: 'What about introverts who prefer solo work?', answer: 'Respect it. Collaboration doesn\'t mean constant pairing. Async help (answering questions, reviewing) counts too.' },
        { question: 'How do we balance individual accountability?', answer: 'Individuals still own their work. Collaboration means help is available and encouraged, not that no one is responsible.' },
        { question: 'What if asking for help is seen as weakness?', answer: 'That\'s the culture you\'re changing. Model it from leadership. Celebrate help-seeking explicitly.' }
      ],

      impact: 'high',
      relatedIndicators: ['collaborationIndex']
    },
    {
      id: 'tc-action-6',
      title: 'Collaboration Metrics Dashboard',
      category: 'tooling',
      recommendationId: 'tc-action-6',

      knowledge: {
        problemSolved: 'Collaboration patterns are invisible. You can\'t improve what you can\'t see.',
        whyItWorks: 'A dashboard showing collaboration metrics (review patterns, contributor diversity, knowledge coverage) makes collaboration visible and measurable.',
        background: 'Data drives improvement. When teams can see who reviews whose code, where knowledge silos exist, and how collaboration evolves, they can act.',
        resources: []
      },

      implementation: {
        overview: 'Create a dashboard visualizing collaboration patterns to identify silos and track improvement.',
        steps: [
          { title: 'Analyze PR data', description: 'Pull data on who reviews whose PRs. Look for patterns: same pairs always? Some people never review?' },
          { title: 'Map issue activity', description: 'For Jira issues, who comments? Who contributes? Multi-contributor issues indicate collaboration.' },
          { title: 'Build the dashboard', description: 'Create visualization showing: review coverage %, reviewer distribution, multi-contributor rate, knowledge area coverage.' },
          { title: 'Review monthly', description: 'In team meeting, review the dashboard. "Are we collaborating more? Where are the silos?"' },
          { title: 'Track trends', description: 'Month-over-month, are collaboration metrics improving?' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person builds; team reviews periodically' },
        timeToImplement: '1 hour to build initial version',
        effort: 'low',
        prerequisites: ['Access to PR and Jira data', 'Dashboard tool']
      },

      validation: {
        experiments: [
          { name: 'Dashboard-driven improvement', description: 'Use the dashboard to identify one collaboration gap. Address it. Measure improvement.', duration: '1 month', howToMeasure: 'Identified gap, took action, metric improved.' }
        ],
        successMetrics: [
          { metric: 'Dashboard usage', target: 'Reviewed monthly', howToMeasure: 'Dashboard discussed in team meetings' },
          { metric: 'Metric trends', target: 'Improving', howToMeasure: 'Collaboration metrics trending positively' },
          { metric: 'Action taken', target: 'Based on data', howToMeasure: 'Decisions reference dashboard data' }
        ],
        leadingIndicators: ['Team referencing dashboard', 'Questions arising from data', 'Experiments designed from insights'],
        laggingIndicators: ['Measurable collaboration improvement', 'Data-driven team decisions', 'Visible silo reduction']
      },

      pitfalls: {
        commonMistakes: ['Building dashboard but never using it', 'Too many metrics', 'Using data punitively'],
        antiPatterns: ['Dashboard as surveillance', 'Optimizing for metrics rather than collaboration', 'Ignoring data that\'s inconvenient'],
        warningSignals: ['Dashboard not updated', 'Metrics not discussed', 'Team unaware of dashboard'],
        whenToPivot: 'If dashboard isn\'t driving action after 3 months, simplify to 1-2 key metrics and integrate into existing rituals.'
      },

      faq: [
        { question: 'What\'s the most important metric?', answer: 'Review coverage is a good start—is every change reviewed? Then broaden to reviewer diversity and knowledge spread.' },
        { question: 'How do we avoid surveillance feeling?', answer: 'Focus on team patterns, not individual blame. Use data for improvement, not punishment.' },
        { question: 'What tools can we use?', answer: 'GitHub/GitLab have built-in analytics. Third-party tools like LinearB or Waydev provide deeper insights. Start simple.' }
      ],

      impact: 'medium',
      relatedIndicators: ['reviewCoverage', 'collaborationIndex']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Basic reviews. Get eyes on every change.',
      avoid: 'Don\'t skip reviews for "small" changes.',
      nextStep: 'Require code reviews for all PRs.'
    },
    2: {
      focus: 'Active pairing. Dedicate time for collaborative work.',
      avoid: 'Don\'t force pairing on everything—balance is key.',
      nextStep: 'Schedule regular pairing hours.'
    },
    3: {
      focus: 'Knowledge spreading. Eliminate single points of failure.',
      avoid: 'Don\'t let one person own entire areas.',
      nextStep: 'Run Bus Factor Review and create learning pairs.'
    },
    4: {
      focus: 'Cross-functional growth. Build T-shaped skills.',
      avoid: 'Don\'t lose expertise depth for breadth.',
      nextStep: 'Implement cross-functional sprint assignments.'
    },
    5: {
      focus: 'Collaboration culture. Make helping others the norm.',
      avoid: 'Don\'t celebrate heroes over teams.',
      nextStep: 'Model collaboration practices for organization.'
    }
  }
};

// Playbook content for Automation Opportunities dimension
export const automationOpportunitiesPlaybook: DimensionPlaybook = {
  dimensionKey: 'automationOpportunities',
  dimensionName: 'Automation Opportunities',
  overview: 'Automation opportunities measures potential for automating repetitive Jira tasks: status updates, field population, notifications, and workflow transitions. Manual repetition wastes time and introduces errors. Smart automation frees the team to focus on valuable work.',

  successCriteria: [
    {
      id: 'automation-coverage',
      label: 'Automation Coverage',
      description: 'Repetitive tasks that have been automated',
      targetValue: 70,
      unit: '%',
      indicatorId: 'automationCoverage'
    },
    {
      id: 'manual-task-reduction',
      label: 'Manual Task Reduction',
      description: 'Decrease in manual Jira maintenance time',
      targetValue: 50,
      unit: '%',
      indicatorId: 'manualTaskReduction'
    },
    {
      id: 'automation-reliability',
      label: 'Automation Reliability',
      description: 'Automated rules functioning correctly',
      targetValue: 95,
      unit: '%',
      indicatorId: 'automationReliability'
    }
  ],

  actions: [
    {
      id: 'ao-action-1',
      title: 'Auto-Assign on Transition',
      category: 'quick-win',
      recommendationId: 'ao-action-1',

      knowledge: {
        problemSolved: 'Issues sit unassigned after transitions. No one knows who should pick them up next.',
        whyItWorks: 'Automatic assignment ensures every issue has clear ownership at every stage. No manual assignment needed, no dropped balls.',
        background: 'Workflow transitions are natural handoff points. When an issue moves to "In Review," it needs a reviewer. When it moves to "Testing," it needs a tester. Automation makes this seamless.',
        resources: [
          {
            title: 'Jira Automation Getting Started',
            type: 'article',
            description: 'Introduction to Jira automation rules and triggers'
          }
        ]
      },

      implementation: {
        overview: 'Create automation rules that assign issues to the right person when they transition to specific statuses.',
        steps: [
          { title: 'Go to automation settings', description: 'Project Settings > Automation. Or global automation for cross-project rules.' },
          { title: 'Create a transition rule', description: 'New rule > Trigger: "When issue transitions to In Review" (or whatever status).' },
          { title: 'Add assignment action', description: 'Action: "Assign to specific person" or "Assign to user in custom field" (e.g., reviewer field).' },
          { title: 'Test the rule', description: 'Manually transition a test issue. Verify it gets assigned correctly.' },
          { title: 'Extend for other transitions', description: 'Repeat for other handoff points: To Testing, To Deployment, etc.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person sets up; team benefits' },
        timeToImplement: '15 minutes per rule',
        effort: 'low',
        prerequisites: ['Jira project admin access', 'Clear workflow with defined statuses']
      },

      validation: {
        experiments: [
          { name: 'Transition assignment test', description: 'Track 10 issues through workflow. Verify each gets assigned automatically at each transition.', duration: '1 week', howToMeasure: 'All transitions result in correct assignment. No manual reassignment needed.' }
        ],
        successMetrics: [
          { metric: 'Assignment automation rate', target: '100% at key transitions', howToMeasure: 'Issues assigned automatically at Review, Testing, Deploy statuses' },
          { metric: 'Unassigned time', target: '<5 minutes', howToMeasure: 'Time between transition and assignment' }
        ],
        leadingIndicators: ['No issues sitting unassigned after transitions', 'Less "who should pick this up?" questions'],
        laggingIndicators: ['Faster cycle time through workflow', 'Reduced handoff delays']
      },

      pitfalls: {
        commonMistakes: ['Assigning to wrong person/role', 'Not testing before enabling', 'Forgetting some transitions'],
        antiPatterns: ['Assigning everything to one person', 'Over-complicated assignment logic', 'No fallback when assignee unavailable'],
        warningSignals: ['Assigned person ignoring assignments', 'Wrong assignments regularly', 'Rule failures in audit log'],
        whenToPivot: 'If the auto-assigned person is often wrong, reconsider your assignment logic. Maybe you need a field for "designated reviewer" rather than hardcoding.'
      },

      faq: [
        { question: 'What if the person is unavailable?', answer: 'Consider assigning to a role or team instead. Or have a fallback rule that reassigns after X hours of inactivity.' },
        { question: 'Can we assign based on who created the issue?', answer: 'Yes! Use "Assign to reporter" or "Assign to a user in a custom field" with creator-related fields.' },
        { question: 'Does this work for sub-tasks?', answer: 'Yes. You can scope rules to specific issue types including sub-tasks.' }
      ],

      impact: 'medium',
      relatedIndicators: ['automationCoverage']
    },
    {
      id: 'ao-action-2',
      title: 'Auto-Label by Component',
      category: 'quick-win',
      recommendationId: 'ao-action-2',

      knowledge: {
        problemSolved: 'Labels are inconsistent because people forget to add them or use different names for the same thing.',
        whyItWorks: 'Automatic labeling based on component or other fields ensures consistency. Labels become reliable for filtering and reporting.',
        background: 'Labels are powerful for ad-hoc categorization, but only if used consistently. Manual labeling leads to typos, forgotten labels, and inconsistent naming. Automation solves this.',
        resources: [
          {
            title: 'Automation Templates',
            type: 'template',
            description: 'Pre-built automation rules for common scenarios including labeling'
          }
        ]
      },

      implementation: {
        overview: 'Create automation rules that add labels based on component, epic, or other field values.',
        steps: [
          { title: 'Create automation rule', description: 'Project Settings > Automation > Create rule.' },
          { title: 'Set trigger', description: 'Trigger: "When issue created" or "When field value changes" for component.' },
          { title: 'Add condition', description: 'Condition: "Component equals Frontend" (or whatever mapping you want).' },
          { title: 'Add label action', description: 'Action: "Add label: frontend" (matching label for component).' },
          { title: 'Extend for other mappings', description: 'Repeat for other component-to-label mappings you need.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person configures; whole team benefits from consistent labels' },
        timeToImplement: '10 minutes per rule',
        effort: 'low',
        prerequisites: ['Consistent component usage', 'Label naming convention']
      },

      validation: {
        experiments: [
          { name: 'Label consistency audit', description: 'For 2 weeks, verify new issues get correct labels automatically.', duration: '2 weeks', howToMeasure: 'New issues have correct labels without manual intervention.' }
        ],
        successMetrics: [
          { metric: 'Auto-labeling rate', target: '100% of new issues', howToMeasure: 'Issues with component get corresponding label automatically' },
          { metric: 'Label consistency', target: 'No typo variants', howToMeasure: 'All labels match standard naming convention' }
        ],
        leadingIndicators: ['No more manual labeling needed', 'Fewer "add the label" reminders'],
        laggingIndicators: ['Better filtering and reporting', 'Label-based dashboards work reliably']
      },

      pitfalls: {
        commonMistakes: ['Creating too many labels', 'Inconsistent naming between manual and auto labels', 'Not handling component changes'],
        antiPatterns: ['Labels duplicating information already in components', 'Auto-labeling everything', 'No label cleanup strategy'],
        warningSignals: ['Duplicate labels appearing', 'Auto labels incorrect', 'Label explosion'],
        whenToPivot: 'If labels are duplicating component information without added value, reconsider whether you need labels at all. Components might be sufficient.'
      },

      faq: [
        { question: 'Should I label everything?', answer: 'No. Only label where it adds value beyond existing fields. If component already captures the info, labeling may be redundant.' },
        { question: 'What about existing issues?', answer: 'You can run a bulk update to apply labels to existing issues, or create a scheduled rule to catch old issues.' },
        { question: 'Can I remove labels automatically too?', answer: 'Yes. Use "Remove label" action when component changes or conditions no longer apply.' }
      ],

      impact: 'low',
      relatedIndicators: ['automationCoverage']
    },
    {
      id: 'ao-action-3',
      title: 'Stale Issue Reminders',
      category: 'process',
      recommendationId: 'ao-action-3',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Issues go stale in "In Progress" without anyone noticing. Work silently stalls.',
        whyItWorks: 'Automated daily checks catch stale issues before they become problems. Proactive reminders keep work moving.',
        background: 'Work stalls for many reasons: blockers, context switches, forgotten tasks. Daily automated checks surface these issues early, when they are easier to address.',
        resources: []
      },

      implementation: {
        overview: 'Create scheduled automation to notify assignees when their issues haven\'t been updated in X days.',
        steps: [
          { title: 'Create scheduled rule', description: 'Automation > Create rule > Trigger: "Scheduled" > "Run daily at 9am".' },
          { title: 'Define stale condition', description: 'Condition: "Status = In Progress" AND "Updated < now - 2d".' },
          { title: 'Add notification action', description: 'Action: "Send Slack message to assignee" or "Send email".' },
          { title: 'Craft helpful message', description: 'Message: "[{{issue.key}}] hasn\'t been updated in 2 days. Is it blocked? Need help?"' },
          { title: 'Test and tune threshold', description: 'Start with 2 days. Adjust based on team feedback—too noisy? Increase. Too late? Decrease.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person sets up; assignees receive reminders' },
        timeToImplement: '20 minutes',
        effort: 'low',
        prerequisites: ['Slack/email integration configured', 'Team agreement on stale threshold']
      },

      validation: {
        experiments: [
          { name: 'Stale detection trial', description: 'Run the automation for 2 weeks. Track how many stale issues are surfaced and resolved.', duration: '2 weeks', howToMeasure: 'Count reminders sent and subsequent updates. Did reminders prompt action?' }
        ],
        successMetrics: [
          { metric: 'Stale issues caught', target: '100% within threshold', howToMeasure: 'No issue goes >2 days stale without reminder' },
          { metric: 'Response rate', target: '>80% within 24h', howToMeasure: 'Stale issues updated or commented within day of reminder' }
        ],
        leadingIndicators: ['Fewer long-stale issues', 'Team acknowledging reminders helpfully', 'Blockers surfaced earlier'],
        laggingIndicators: ['Reduced average issue age', 'Better cycle time', 'Fewer surprise stalls']
      },

      pitfalls: {
        commonMistakes: ['Too aggressive threshold (1 day causes noise)', 'Too lenient threshold (5 days too late)', 'Ignoring the reminders'],
        antiPatterns: ['Reminders as nagging', 'Public shaming for stale issues', 'No action taken on reminders'],
        warningSignals: ['Team ignoring reminders', 'Same issues repeatedly flagged', 'Complaints about noise'],
        whenToPivot: 'If reminders are ignored, the problem may be capacity, not awareness. Address root cause (too much WIP, unclear priorities) rather than adding more reminders.'
      },

      faq: [
        { question: 'What threshold should we use?', answer: 'Start with 2 days for active sprint work. Adjust based on team rhythm. Longer sprints may tolerate 3-4 days.' },
        { question: 'Should we exclude certain issues?', answer: 'Yes. Exclude epics, backlog items, or issues in "waiting" statuses. Only flag active work.' },
        { question: 'What if someone is on vacation?', answer: 'Consider integrating with leave calendars or having a "vacation" status that excludes issues from stale checks.' }
      ],

      impact: 'high',
      relatedIndicators: ['automationCoverage', 'manualTaskReduction']
    },
    {
      id: 'ao-action-4',
      title: 'Auto-Close Resolved Issues',
      category: 'process',
      recommendationId: 'ao-action-4',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Resolved issues pile up, cluttering the board and skewing metrics. Manual cleanup is tedious.',
        whyItWorks: 'Automatic closure after a waiting period keeps boards clean. Issues stay in "Resolved" long enough for verification, then close automatically.',
        background: 'Many teams have a "Resolved" status for completed work awaiting verification. After sufficient time, these should close. Automation handles this hygiene task.',
        resources: []
      },

      implementation: {
        overview: 'Create scheduled automation to close issues that have been Resolved for X days without reopening.',
        steps: [
          { title: 'Create scheduled rule', description: 'Automation > Create rule > Trigger: "Scheduled" > "Run daily".' },
          { title: 'Define ready-to-close condition', description: 'Condition: "Status = Resolved" AND "Status changed > 7 days ago".' },
          { title: 'Add transition action', description: 'Action: "Transition issue to Closed".' },
          { title: 'Add optional comment', description: 'Action: "Add comment: Auto-closed after 7 days in Resolved. Reopen if needed."' },
          { title: 'Test with sample issues', description: 'Verify issues close correctly and can be reopened if needed.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person configures; everyone benefits from cleaner boards' },
        timeToImplement: '15 minutes',
        effort: 'low',
        prerequisites: ['Workflow has Resolved and Closed statuses', 'Team agreement on waiting period']
      },

      validation: {
        experiments: [
          { name: 'Auto-close trial', description: 'Enable auto-close for 1 month. Monitor for issues that shouldn\'t have closed.', duration: '1 month', howToMeasure: 'Count auto-closes and reopens. Reopen rate <5% indicates good threshold.' }
        ],
        successMetrics: [
          { metric: 'Auto-close rate', target: '100% of eligible issues', howToMeasure: 'No Resolved issues older than threshold' },
          { metric: 'False positive rate', target: '<5% reopened', howToMeasure: 'Issues reopened after auto-close / total auto-closed' }
        ],
        leadingIndicators: ['Cleaner boards', 'More accurate velocity metrics', 'Less manual cleanup'],
        laggingIndicators: ['Reduced issue count bloat', 'Better report accuracy', 'Time saved on hygiene']
      },

      pitfalls: {
        commonMistakes: ['Too short waiting period (closes before verification)', 'Not notifying in comment', 'Forgetting to exclude certain issue types'],
        antiPatterns: ['Closing issues to hide problems', 'Auto-closing without record', 'Preventing reopening'],
        warningSignals: ['High reopen rate', 'Important issues auto-closed', 'Stakeholders surprised by closures'],
        whenToPivot: 'If reopen rate is high, increase the waiting period. If issues shouldn\'t close automatically (e.g., need sign-off), add approval step or exclude those types.'
      },

      faq: [
        { question: 'What waiting period should we use?', answer: '7 days is common. Use longer for issues that need stakeholder review. Shorter for pure cleanup.' },
        { question: 'Should we exclude any issue types?', answer: 'Consider excluding bugs (may need retest) or issues linked to releases (may need release sign-off).' },
        { question: 'Can stakeholders reopen closed issues?', answer: 'Yes. Make sure workflow allows reopening. Include this in the auto-close comment.' }
      ],

      impact: 'medium',
      relatedIndicators: ['automationCoverage']
    },
    {
      id: 'ao-action-5',
      title: 'Automation First Mindset',
      category: 'culture',
      recommendationId: 'ao-action-5',
      minMaturityLevel: 2,

      knowledge: {
        problemSolved: 'Team repeats manual tasks without questioning. Automation opportunities go unnoticed.',
        whyItWorks: 'When the team asks "Can this be automated?" for every repeated task, they naturally identify and implement automations. Cumulative time savings are substantial.',
        background: 'Automation isn\'t just about tools—it\'s a mindset. Teams that habitually question manual work find more opportunities and save more time over the long run.',
        resources: [
          {
            title: 'Automation ROI Calculator',
            type: 'template',
            description: 'Spreadsheet to estimate time savings from potential automations'
          }
        ]
      },

      implementation: {
        overview: 'Build team habit of identifying, prioritizing, and implementing automations for repeated manual work.',
        steps: [
          { title: 'Add retro question', description: 'Every retro, ask: "What manual work did we repeat this sprint?" List the tasks.' },
          { title: 'Evaluate automation potential', description: 'For each: How often? How long? Can it be automated? Worth the investment?' },
          { title: 'Maintain automation backlog', description: 'Create backlog of automation opportunities. Prioritize by time savings vs effort.' },
          { title: 'Allocate automation time', description: 'Reserve some capacity each sprint for automation improvements. Even 1-2 hours helps.' },
          { title: 'Track and celebrate', description: 'When someone automates something, celebrate it. Track cumulative time saved.' }
        ],
        teamInvolvement: { type: 'full-team', description: 'Everyone identifies opportunities; share implementation' },
        timeToImplement: '2-3 sprints to establish habit',
        effort: 'medium',
        prerequisites: ['Retro practice', 'Some automation capability on team']
      },

      validation: {
        experiments: [
          { name: 'Manual Task Diary', description: 'Track every manual Jira task for 1 week. Look for patterns. Identify top 5 automation opportunities.', duration: '1 week', howToMeasure: 'Complete task log. Identify opportunities. Estimate time savings for each.' },
          { name: 'Automation Sprint', description: 'Dedicate capacity to implementing 3-5 automations from the backlog.', duration: '1 sprint', howToMeasure: 'Automations implemented. Hours/week saved. Team comfort increased.' }
        ],
        successMetrics: [
          { metric: 'Automation ideas per sprint', target: '>2 identified', howToMeasure: 'Ideas added to automation backlog' },
          { metric: 'Automations implemented', target: '>1 per month', howToMeasure: 'New automations created' },
          { metric: 'Time saved tracking', target: 'Measured and visible', howToMeasure: 'Team knows cumulative time saved by automations' }
        ],
        leadingIndicators: ['Team naturally suggesting automations', 'Automation backlog growing', 'Less resistance to automation work'],
        laggingIndicators: ['Measurable time savings', 'Reduced manual Jira work', 'Higher automation coverage']
      },

      pitfalls: {
        commonMistakes: ['Automating everything (some tasks need judgment)', 'Never allocating time for automation', 'Not tracking ROI'],
        antiPatterns: ['Automation as procrastination from "real work"', 'Over-engineering simple automations', 'Individual hoarding automation knowledge'],
        warningSignals: ['Automation backlog never worked on', 'Same manual complaints every retro', 'No one knows existing automations'],
        whenToPivot: 'If automation work never happens, the problem may be prioritization. Make it explicit: "We will spend 2 hours this sprint on automation."'
      },

      faq: [
        { question: 'What\'s worth automating?', answer: 'Rule of thumb: if you\'ll do it >10 times and automation takes <1 hour, automate it. Use ROI calculation for larger investments.' },
        { question: 'Who should do automation work?', answer: 'Anyone interested. Spread the knowledge. Don\'t create an "automation person" bottleneck.' },
        { question: 'How do we avoid over-automating?', answer: 'Some tasks need human judgment. If the logic is complex with many exceptions, maybe don\'t automate. Keep it simple.' }
      ],

      impact: 'high',
      relatedIndicators: ['manualTaskReduction']
    },
    {
      id: 'ao-action-6',
      title: 'Automation Audit',
      category: 'tooling',
      recommendationId: 'ao-action-6',

      knowledge: {
        problemSolved: 'Old automations break, become irrelevant, or conflict with new ones. No one knows what automations exist.',
        whyItWorks: 'Quarterly review keeps automations healthy: remove broken ones, update outdated logic, document purpose. Clean automation suite is more reliable.',
        background: 'Automations accumulate over time. Without maintenance, you get zombie rules (broken but unnoticed), conflicts, and mystery behavior. Regular audits prevent this.',
        resources: [
          {
            title: 'Automation Audit Template',
            type: 'template',
            description: 'Spreadsheet for documenting and reviewing automation rules'
          }
        ]
      },

      implementation: {
        overview: 'Conduct quarterly review of all automation rules to ensure they\'re working, relevant, and documented.',
        steps: [
          { title: 'List all rules', description: 'Export or screenshot all active automation rules. Include project-level and global rules.' },
          { title: 'Review each rule', description: 'For each: What does it do? Does it still make sense? Is it working? Check audit log for failures.' },
          { title: 'Fix or remove broken rules', description: 'Broken rules: fix the logic or remove entirely. Don\'t leave zombie automations.' },
          { title: 'Update documentation', description: 'For each active rule, ensure there\'s a description of what it does and why.' },
          { title: 'Identify gaps', description: 'What should be automated that isn\'t? Add to automation backlog.' },
          { title: 'Schedule next audit', description: 'Put quarterly audit on calendar. Make it a recurring ritual.' }
        ],
        teamInvolvement: { type: 'individual', description: 'One person leads audit; involve team for decision-making' },
        timeToImplement: '1 hour quarterly',
        effort: 'medium',
        prerequisites: ['Access to automation admin', 'Basic understanding of existing rules']
      },

      validation: {
        experiments: [
          { name: 'First audit baseline', description: 'Conduct initial audit. Document current state, issues found, actions taken.', duration: '1 session', howToMeasure: 'Complete inventory. Issues identified and resolved. Documentation updated.' }
        ],
        successMetrics: [
          { metric: 'Audit completion', target: 'Quarterly', howToMeasure: 'Audit conducted every quarter' },
          { metric: 'Automation health', target: '>95% working', howToMeasure: 'No broken or failing rules in audit log' },
          { metric: 'Documentation coverage', target: '100% documented', howToMeasure: 'Every rule has description of purpose' }
        ],
        leadingIndicators: ['Audit on calendar', 'Team aware of existing automations', 'Audit log regularly checked'],
        laggingIndicators: ['Fewer mystery automations', 'Higher reliability', 'Easier onboarding to automation system']
      },

      pitfalls: {
        commonMistakes: ['Audit scheduled but never done', 'Not involving people who created rules', 'Deleting rules without understanding them'],
        antiPatterns: ['One person knows all automations', 'Audit as blame session', 'Ignoring audit findings'],
        warningSignals: ['Audit keeps getting postponed', 'Same issues found every audit', 'No one can explain some rules'],
        whenToPivot: 'If audit keeps finding broken rules, improve testing before deploying new automations. Prevention beats cleanup.'
      },

      faq: [
        { question: 'How long should the audit take?', answer: '1 hour for small-medium rule sets. Larger orgs may need longer or split across sessions.' },
        { question: 'Who should do the audit?', answer: 'Someone familiar with the automations, but involve rule creators for context. Don\'t make it a solo mystery tour.' },
        { question: 'What about global vs project automations?', answer: 'Audit both. Global rules affect multiple projects—their health is critical.' }
      ],

      impact: 'medium',
      relatedIndicators: ['automationReliability']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Quick wins. Automate the most obvious repetitive tasks.',
      avoid: 'Don\'t over-engineer. Start simple.',
      nextStep: 'Implement auto-assign and stale issue reminders.'
    },
    2: {
      focus: 'Systematic automation. Address common patterns.',
      avoid: 'Don\'t automate everything. Some tasks need human judgment.',
      nextStep: 'Run Manual Task Diary to identify opportunities.'
    },
    3: {
      focus: 'Team ownership. Everyone can create basic automations.',
      avoid: 'Don\'t create automation silos (one person owns all rules).',
      nextStep: 'Train team on creating simple automations.'
    },
    4: {
      focus: 'Maintenance. Keep automations working and documented.',
      avoid: 'Don\'t let broken automations accumulate.',
      nextStep: 'Implement quarterly automation audit.'
    },
    5: {
      focus: 'Innovation. Explore advanced automation patterns.',
      avoid: 'Don\'t forget simplicity. Complex automations are hard to maintain.',
      nextStep: 'Share automation best practices organization-wide.'
    }
  }
};

// Playbook content for Collaboration Feature Usage dimension
export const collaborationFeatureUsagePlaybook: DimensionPlaybook = {
  dimensionKey: 'collaborationFeatureUsage',
  dimensionName: 'Collaboration Feature Usage',
  overview: 'Jira has built-in collaboration features—comments, @mentions, watchers, and links—that many teams underuse. When collaboration happens elsewhere (Slack, email, meetings), decisions and context get lost. Using Jira\'s collaboration features creates a searchable record and keeps context where the work lives.',

  successCriteria: [
    {
      id: 'comment-activity',
      label: 'Comment Activity',
      description: 'Issues with substantive discussion in comments',
      targetValue: 60,
      unit: '%',
    },
    {
      id: 'mention-usage',
      label: '@Mention Usage',
      description: 'Comments that tag relevant people',
      targetValue: 40,
      unit: '%',
    },
    {
      id: 'link-coverage',
      label: 'Link Coverage',
      description: 'Issues with relevant links to related work',
      targetValue: 70,
      unit: '%',
    }
  ],

  actions: [
    {
      id: 'cfu-action-1',
      title: 'Start Every Discussion in Jira',
      category: 'culture',
      recommendationId: 'cfu-action-1',

      knowledge: {
        problemSolved: 'Discussions happen in Slack or meetings, leaving no record in Jira. Context is lost and decisions can\'t be traced.',
        whyItWorks: 'When the norm is "discuss in Jira first," context stays with the work. Anyone joining later can catch up by reading the issue.',
        background: 'Slack is great for quick questions, but important discussions should live where the work is tracked.',
        resources: [
          { title: 'Async Communication Best Practices', type: 'article', description: 'How to have effective discussions in comments' }
        ]
      },

      implementation: {
        overview: 'Establish a team norm that any discussion about an issue happens in that issue\'s comments, not in Slack threads.',
        steps: [
          { title: 'Announce the norm', description: 'Tell the team: "If you\'re discussing a Jira issue, discuss it in Jira. Paste the link to the issue, not a screenshot."' },
          { title: 'Lead by example', description: 'When someone asks about an issue in Slack, reply: "Let\'s discuss in the issue—I\'ll comment there."' },
          { title: 'Use @mentions', description: 'When you need input, @mention the person in a Jira comment. They\'ll get notified.' },
          { title: 'Summarize verbal discussions', description: 'After a meeting or call about an issue, post a summary comment: "We decided X because Y."' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '1 week to establish habit',
        effort: 'low'
      },

      validation: {
        experiments: [
          { name: 'Jira-first week', description: 'For one week, redirect all Slack discussions about issues to Jira comments.', duration: '1 week', howToMeasure: 'Count Slack messages about issues vs Jira comments.' }
        ],
        successMetrics: [
          { metric: 'Comment activity', target: 'Increase by 50%', howToMeasure: 'Average comments per issue' }
        ],
        leadingIndicators: ['Fewer "what was decided?" questions', 'Less context-switching to find information'],
        laggingIndicators: ['Faster onboarding', 'Better decision traceability']
      },

      pitfalls: {
        commonMistakes: ['Still using Slack for quick questions (that\'s fine)', 'Forgetting to summarize verbal discussions'],
        antiPatterns: ['Banning Slack entirely', 'Over-documenting trivial discussions'],
        warningSignals: ['Comments not getting responses', 'People ignoring @mentions'],
        whenToPivot: 'If Jira comments feel too slow for urgent matters, establish which discussions can stay in Slack.'
      },

      faq: [
        { question: 'What about quick questions?', answer: 'Quick questions are fine in Slack. This is for substantive discussions that should be recorded.' },
        { question: 'Won\'t this slow us down?', answer: 'It feels slower initially but saves time later when you don\'t have to reconstruct decisions.' }
      ],

      impact: 'medium',
      relatedIndicators: ['commentRate', 'mentionRate']
    },
    {
      id: 'cfu-action-2',
      title: 'Use Links to Connect Related Work',
      category: 'quick-win',
      recommendationId: 'cfu-action-2',

      knowledge: {
        problemSolved: 'Related issues exist in isolation. Dependencies aren\'t visible, and impact analysis fails.',
        whyItWorks: 'Linking issues creates a visible network. You can see what depends on what and what\'s blocked by what.',
        resources: [
          { title: 'Jira Linking Guide', type: 'documentation', description: 'How to use different link types effectively' }
        ]
      },

      implementation: {
        overview: 'Make linking a habit during refinement and whenever you discover a relationship between issues.',
        steps: [
          { title: 'Add linking to Definition of Ready', description: 'Before an issue is ready for sprint, check: are there related issues that should be linked?' },
          { title: 'Use the right link type', description: '"blocks/is blocked by" for dependencies, "relates to" for relevant context, "is caused by/causes" for bugs.' },
          { title: 'Link during discovery', description: 'When you find a related issue while working, link it immediately.' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '30 minutes to establish',
        effort: 'low'
      },

      validation: {
        experiments: [
          { name: 'Link audit', description: 'Review 10 recent issues. How many have links? How many should have links but don\'t?', duration: '1 hour', howToMeasure: 'Linked issues / issues that should have links' }
        ],
        successMetrics: [
          { metric: 'Link coverage', target: '70%+ of issues linked', howToMeasure: 'Issues with at least one link' }
        ],
        leadingIndicators: ['Fewer surprise dependencies', 'Better impact analysis'],
        laggingIndicators: ['More predictable planning', 'Fewer blocked sprints']
      },

      pitfalls: {
        commonMistakes: ['Over-linking everything', 'Wrong link types', 'Forgetting to update links when scope changes'],
        antiPatterns: ['Links as busywork', 'Mandatory linking without value'],
        warningSignals: ['Links pointing to closed/irrelevant issues', 'Teams ignoring link information'],
        whenToPivot: 'If linking feels like busywork, focus only on blocking relationships.'
      },

      faq: [
        { question: 'How many links is too many?', answer: '3-5 links is usually right. If you have 10+, consider if all are truly relevant.' }
      ],

      impact: 'medium',
      relatedIndicators: ['linkRate', 'linkedIssueRatio']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Start with comments. Make it normal to discuss issues in the issue.',
      avoid: 'Don\'t mandate features—encourage them.',
      nextStep: 'Run the Jira-first week experiment.'
    },
    2: {
      focus: 'Add linking. Connect related work systematically.',
      avoid: 'Don\'t over-link. Focus on meaningful relationships.',
      nextStep: 'Add linking to your Definition of Ready.'
    },
    3: {
      focus: 'Use @mentions effectively. Route discussions to the right people.',
      avoid: 'Don\'t spam @mentions. Use them for genuine need.',
      nextStep: 'Track response times to mentions.'
    },
    4: {
      focus: 'Build the habit. Collaboration features should feel natural.',
      avoid: 'Don\'t get complacent. New team members need onboarding.',
      nextStep: 'Document your collaboration norms.'
    },
    5: {
      focus: 'Lead by example. Your issues should be models of collaboration.',
      avoid: 'Don\'t assume everyone knows the norms.',
      nextStep: 'Share your practices with other teams.'
    }
  }
};

// Playbook content for Collaboration Breadth dimension
export const collaborationBreadthPlaybook: DimensionPlaybook = {
  dimensionKey: 'collaborationBreadth',
  dimensionName: 'Collaboration Breadth',
  overview: 'Collaboration breadth measures whether work involves multiple people or flows through siloed individuals. When one person does all the work on an issue from start to finish without involving others, knowledge stays in their head and the team misses opportunities for review, learning, and load-balancing.',

  successCriteria: [
    {
      id: 'multi-contributor-rate',
      label: 'Multi-Contributor Rate',
      description: 'Issues with more than one person involved',
      targetValue: 50,
      unit: '%',
    },
    {
      id: 'handoff-rate',
      label: 'Handoff Rate',
      description: 'Work that transitions between team members',
      targetValue: 30,
      unit: '%',
    }
  ],

  actions: [
    {
      id: 'cb-action-1',
      title: 'Pair on Complex Work',
      category: 'process',
      recommendationId: 'cb-action-1',

      knowledge: {
        problemSolved: 'Complex work done solo creates knowledge silos and single points of failure.',
        whyItWorks: 'Pairing spreads knowledge and catches issues earlier. Two perspectives find better solutions.',
        resources: [
          { title: 'Pairing Guide', type: 'article', description: 'Different pairing styles and when to use them' }
        ]
      },

      implementation: {
        overview: 'Identify complex issues and pair on them—not mandatory everywhere, just where it adds value.',
        steps: [
          { title: 'Flag pairing candidates', description: 'During planning, identify issues that would benefit from pairing: complex, unfamiliar area, or learning opportunity.' },
          { title: 'Assign pairing partner', description: 'Add a second assignee or create a "Pair with" field.' },
          { title: 'Schedule pairing time', description: 'Block time for pairing. Don\'t expect it to happen ad-hoc.' }
        ],
        teamInvolvement: 'partial',
        timeToImplement: '1 sprint to pilot',
        effort: 'medium'
      },

      validation: {
        experiments: [
          { name: 'Pairing pilot', description: 'Pair on 3 complex issues this sprint. Compare to solo work on similar issues.', duration: '1 sprint', howToMeasure: 'Quality, cycle time, knowledge spread' }
        ],
        successMetrics: [
          { metric: 'Multi-contributor rate', target: 'Increase by 20%', howToMeasure: 'Issues with 2+ contributors' }
        ],
        leadingIndicators: ['More knowledge sharing', 'Fewer single points of failure'],
        laggingIndicators: ['Better bus factor', 'Faster onboarding']
      },

      pitfalls: {
        commonMistakes: ['Forcing pairing on everything', 'Pairing without clear purpose', 'Junior-junior pairing on complex work'],
        antiPatterns: ['Pairing as surveillance', 'One person driving while other watches passively'],
        warningSignals: ['Resistance to pairing', 'Pairing sessions going too long'],
        whenToPivot: 'If pairing feels forced, make it optional and focus on high-value opportunities.'
      },

      faq: [
        { question: 'Is pairing slower?', answer: 'Sometimes initially, but quality is higher and knowledge spreads faster.' }
      ],

      impact: 'high',
      relatedIndicators: ['multiContributorRate']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Start noticing. How much work is done solo vs collaboratively?',
      avoid: 'Don\'t force collaboration everywhere.',
      nextStep: 'Identify one issue per sprint for pairing.'
    },
    2: {
      focus: 'Create pairing opportunities. Match people on complex work.',
      avoid: 'Don\'t make solo work feel wrong. It has its place.',
      nextStep: 'Establish pairing for knowledge transfer.'
    },
    3: {
      focus: 'Systematize collaboration. Build it into planning.',
      avoid: 'Don\'t overburden people with collaboration overhead.',
      nextStep: 'Track multi-contributor rate as a team metric.'
    },
    4: {
      focus: 'Optimize collaboration. Match right people to right work.',
      avoid: 'Don\'t collaborate for collaboration\'s sake.',
      nextStep: 'Share effective practices with other teams.'
    },
    5: {
      focus: 'Lead by example. Model effective collaboration.',
      avoid: 'Don\'t assume it\'s automatic for new team members.',
      nextStep: 'Mentor other teams on collaboration practices.'
    }
  }
};

// Playbook content for Configuration Efficiency dimension
export const configurationEfficiencyPlaybook: DimensionPlaybook = {
  dimensionKey: 'configurationEfficiency',
  dimensionName: 'Configuration Efficiency',
  overview: 'Jira configuration should accelerate work, not create busywork. Over-engineered setups with too many statuses, unused fields, and complex workflows slow teams down. Configuration efficiency measures whether your Jira setup is lean and serving the team\'s actual needs.',

  successCriteria: [
    {
      id: 'field-utilization',
      label: 'Field Utilization',
      description: 'Custom fields that are actually used',
      targetValue: 80,
      unit: '%',
    },
    {
      id: 'status-utilization',
      label: 'Status Utilization',
      description: 'Workflow statuses that issues actually use',
      targetValue: 90,
      unit: '%',
    },
    {
      id: 'workflow-simplicity',
      label: 'Workflow Simplicity',
      description: 'Statuses per workflow',
      targetValue: 6,
      unit: 'statuses',
    }
  ],

  actions: [
    {
      id: 'ce-action-1',
      title: 'Audit Unused Fields',
      category: 'quick-win',
      recommendationId: 'ce-action-1',

      knowledge: {
        problemSolved: 'Unused fields clutter screens and confuse users. People waste time wondering if they should fill them.',
        whyItWorks: 'Removing unused fields simplifies the experience. Fewer fields means less cognitive load and faster issue creation.',
        resources: [
          { title: 'Jira Field Cleanup Guide', type: 'documentation', description: 'How to identify and remove unused fields' }
        ]
      },

      implementation: {
        overview: 'Identify fields that are rarely or never filled, then hide or remove them.',
        steps: [
          { title: 'Export field usage data', description: 'Use Jira admin or a plugin to see which fields are populated.' },
          { title: 'Identify candidates for removal', description: 'Fields filled in <10% of issues are candidates. Are they truly needed?' },
          { title: 'Discuss with team', description: 'Ask: "Does anyone use this field? What would we lose without it?"' },
          { title: 'Hide or remove', description: 'Hide from screens first (reversible). If no one misses it, consider removal.' }
        ],
        teamInvolvement: 'partial',
        timeToImplement: '2 hours',
        effort: 'low'
      },

      validation: {
        experiments: [
          { name: 'Field cleanup', description: 'Hide 5 unused fields for one sprint. Does anyone notice?', duration: '1 sprint', howToMeasure: 'Complaints received, workflows affected' }
        ],
        successMetrics: [
          { metric: 'Field utilization', target: '80%+ fields used', howToMeasure: 'Fields with >50% fill rate' }
        ],
        leadingIndicators: ['Simpler issue forms', 'Faster issue creation'],
        laggingIndicators: ['Cleaner data', 'Less confusion']
      },

      pitfalls: {
        commonMistakes: ['Deleting fields with historical data', 'Not communicating changes', 'Removing fields used by reports'],
        antiPatterns: ['Keeping fields "just in case"', 'Adding fields without removing others'],
        warningSignals: ['Field count keeps growing', 'Users confused about what to fill'],
        whenToPivot: 'If a removed field is missed, you can restore it. Start with hiding, not deleting.'
      },

      faq: [
        { question: 'What about historical data?', answer: 'Hide the field from screens but keep it in the database. Data is preserved.' }
      ],

      impact: 'medium',
      relatedIndicators: ['fieldUtilization', 'unusedFieldCount']
    },
    {
      id: 'ce-action-2',
      title: 'Simplify Workflow Statuses',
      category: 'process',
      recommendationId: 'ce-action-2',

      knowledge: {
        problemSolved: 'Too many statuses create confusion and overhead. People skip statuses, making the data unreliable.',
        whyItWorks: 'Simpler workflows are easier to follow. When there are fewer choices, people make them consistently.',
        resources: [
          { title: 'Workflow Design Patterns', type: 'article', description: 'How to design effective Jira workflows' }
        ]
      },

      implementation: {
        overview: 'Review your workflow statuses. Consolidate or remove those that don\'t add value.',
        steps: [
          { title: 'Map current workflow', description: 'Draw out all statuses and transitions. How many are there?' },
          { title: 'Identify skip patterns', description: 'Which statuses do issues routinely skip? Those may not be needed.' },
          { title: 'Design simplified workflow', description: 'Aim for 4-6 statuses: To Do, In Progress, In Review, Done plus maybe one or two more.' },
          { title: 'Migrate gradually', description: 'Map old statuses to new ones. Communicate the change clearly.' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '1-2 weeks',
        effort: 'medium'
      },

      validation: {
        experiments: [
          { name: 'Simplified workflow pilot', description: 'Try a simplified workflow on one project for one sprint.', duration: '1 sprint', howToMeasure: 'Team feedback, status accuracy' }
        ],
        successMetrics: [
          { metric: 'Statuses per workflow', target: '6 or fewer', howToMeasure: 'Count workflow statuses' }
        ],
        leadingIndicators: ['Fewer status changes', 'More consistent status usage'],
        laggingIndicators: ['More accurate reporting', 'Easier onboarding']
      },

      pitfalls: {
        commonMistakes: ['Simplifying without input', 'Losing important states', 'Not training on new workflow'],
        antiPatterns: ['One-size-fits-all workflows', 'Status-per-person patterns'],
        warningSignals: ['Team resisting new workflow', 'Important states missing'],
        whenToPivot: 'If a status is genuinely needed, add it back. Start minimal and grow based on need.'
      },

      faq: [
        { question: 'What if we need tracking granularity?', answer: 'Consider if you need status vs label/component. Not all tracking needs to be workflow-based.' }
      ],

      impact: 'high',
      relatedIndicators: ['statusUtilization', 'skippedStatusRate']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Audit what you have. How many fields, statuses, workflows?',
      avoid: 'Don\'t change everything at once.',
      nextStep: 'Run a field usage audit.'
    },
    2: {
      focus: 'Remove the obvious waste. Unused fields, skipped statuses.',
      avoid: 'Don\'t remove things without checking who uses them.',
      nextStep: 'Simplify your main workflow.'
    },
    3: {
      focus: 'Standardize. Create consistent patterns across projects.',
      avoid: 'Don\'t force identical setups where differences make sense.',
      nextStep: 'Document your configuration standards.'
    },
    4: {
      focus: 'Optimize continuously. Review configuration quarterly.',
      avoid: 'Don\'t let configuration drift back to complexity.',
      nextStep: 'Share efficient patterns organization-wide.'
    },
    5: {
      focus: 'Lead best practices. Your configuration should be a model.',
      avoid: 'Don\'t assume it stays simple automatically.',
      nextStep: 'Help other teams simplify their configurations.'
    }
  }
};

// Playbook content for Backlog Discipline dimension
export const backlogDisciplinePlaybook: DimensionPlaybook = {
  dimensionKey: 'backlogDiscipline',
  dimensionName: 'Backlog Discipline',
  overview: 'A healthy backlog is a prioritized, groomed list of work that enables effective planning. An unhealthy backlog is a dumping ground of stale ideas that creates confusion. Backlog discipline measures whether your backlog is serving its purpose or just growing.',

  successCriteria: [
    {
      id: 'backlog-freshness',
      label: 'Backlog Freshness',
      description: 'Items reviewed within last 90 days',
      targetValue: 80,
      unit: '%',
    },
    {
      id: 'groomed-rate',
      label: 'Groomed Rate',
      description: 'Items ready for sprint with estimates',
      targetValue: 2,
      unit: 'sprints worth',
    },
    {
      id: 'stale-item-rate',
      label: 'Stale Item Rate',
      description: 'Items untouched for 6+ months',
      targetValue: 10,
      unit: '%',
    }
  ],

  actions: [
    {
      id: 'bd-action-1',
      title: 'Regular Backlog Cleanup',
      category: 'process',
      recommendationId: 'bd-action-1',

      knowledge: {
        problemSolved: 'Backlogs grow forever with stale ideas that will never be done, making it hard to find real priorities.',
        whyItWorks: 'Regular cleanup keeps the backlog relevant. If something hasn\'t been touched in 6 months, it\'s probably not important.',
        resources: [
          { title: 'Backlog Grooming Guide', type: 'article', description: 'How to keep your backlog healthy' }
        ]
      },

      implementation: {
        overview: 'Schedule monthly backlog reviews to archive or close stale items.',
        steps: [
          { title: 'Define stale', description: 'Items not updated in 6 months are candidates for closure.' },
          { title: 'Schedule monthly cleanup', description: '30 minutes monthly: filter for old items, decide keep or close.' },
          { title: 'Use "Won\'t Do" resolution', description: 'Close stale items with "Won\'t Do—stale, can reopen if needed."' },
          { title: 'Communicate the policy', description: 'Tell stakeholders: stale items get closed. Reopen if truly needed.' }
        ],
        teamInvolvement: 'partial',
        timeToImplement: '30 minutes monthly',
        effort: 'low'
      },

      validation: {
        experiments: [
          { name: 'Backlog cleanup', description: 'Close all items not touched in 6 months. Track how many get reopened.', duration: '3 months', howToMeasure: 'Items closed vs reopened' }
        ],
        successMetrics: [
          { metric: 'Stale item rate', target: '<10%', howToMeasure: 'Items >6 months old / total backlog' }
        ],
        leadingIndicators: ['Smaller backlog', 'Easier to find priorities'],
        laggingIndicators: ['Better planning efficiency', 'Less time searching']
      },

      pitfalls: {
        commonMistakes: ['Not communicating before closing', 'Closing too aggressively', 'Not having reopen path'],
        antiPatterns: ['Backlog as archive', 'Never closing anything'],
        warningSignals: ['Backlog growing indefinitely', 'Can\'t find relevant items'],
        whenToPivot: 'If important items get closed, extend stale threshold or improve tagging.'
      },

      faq: [
        { question: 'What if we close something needed?', answer: 'It can be reopened. Closing is not deleting.' }
      ],

      impact: 'medium',
      relatedIndicators: ['staleItemRate', 'backlogSize']
    },
    {
      id: 'bd-action-2',
      title: 'Maintain Ready Backlog Buffer',
      category: 'process',
      recommendationId: 'bd-action-2',

      knowledge: {
        problemSolved: 'Sprint planning stalls because items aren\'t refined. Team scrambles to estimate during planning.',
        whyItWorks: 'A groomed buffer (2 sprints worth) ensures planning is smooth. Items are ready when needed.',
        resources: [
          { title: 'Definition of Ready', type: 'article', description: 'What makes a backlog item ready for sprint' }
        ]
      },

      implementation: {
        overview: 'Maintain 2 sprints worth of refined, estimated items ready to pull.',
        steps: [
          { title: 'Define "ready"', description: 'Clear acceptance criteria, estimated, dependencies identified.' },
          { title: 'Hold regular refinement', description: 'Weekly: refine enough items to maintain the buffer.' },
          { title: 'Track buffer health', description: 'How many sprints of ready work do you have? Target 2.' },
          { title: 'Prioritize refinement', description: 'If buffer is low, prioritize refinement over other meetings.' }
        ],
        teamInvolvement: 'full-team',
        timeToImplement: '1-2 sprints to establish',
        effort: 'medium'
      },

      validation: {
        experiments: [
          { name: 'Buffer tracking', description: 'Track how many sprints of refined work you have. Is it stable?', duration: '1 month', howToMeasure: 'Story points ready / sprint capacity' }
        ],
        successMetrics: [
          { metric: 'Ready buffer', target: '2 sprints worth', howToMeasure: 'Refined items / sprint capacity' }
        ],
        leadingIndicators: ['Smooth sprint planning', 'Less scrambling'],
        laggingIndicators: ['Better velocity stability', 'More predictable delivery']
      },

      pitfalls: {
        commonMistakes: ['Over-refining too far ahead', 'Refining without prioritization', 'Skipping refinement under pressure'],
        antiPatterns: ['Just-in-time refinement only', 'Refinement as busywork'],
        warningSignals: ['Planning constantly running over', 'Items not ready when pulled'],
        whenToPivot: 'If priorities change frequently, reduce buffer to 1 sprint to avoid waste.'
      },

      faq: [
        { question: 'What if priorities change?', answer: 'Refine top priorities. Some buffer waste is better than no buffer.' }
      ],

      impact: 'high',
      relatedIndicators: ['refinedItemRate', 'planningEfficiency']
    }
  ],

  maturityGuidance: {
    1: {
      focus: 'Assess your backlog. How big is it? How stale?',
      avoid: 'Don\'t close things without review.',
      nextStep: 'Run a backlog cleanup session.'
    },
    2: {
      focus: 'Establish hygiene practices. Regular grooming, cleanup.',
      avoid: 'Don\'t let the backlog grow unchecked.',
      nextStep: 'Schedule monthly backlog reviews.'
    },
    3: {
      focus: 'Maintain ready buffer. Always have refined work ready.',
      avoid: 'Don\'t over-refine too far ahead.',
      nextStep: 'Track ready buffer as a health metric.'
    },
    4: {
      focus: 'Optimize backlog efficiency. Right size, right freshness.',
      avoid: 'Don\'t be complacent—backlogs drift.',
      nextStep: 'Share practices with other teams.'
    },
    5: {
      focus: 'Model excellence. Your backlog should be exemplary.',
      avoid: 'Don\'t assume it stays healthy automatically.',
      nextStep: 'Help other teams improve their backlog discipline.'
    }
  }
};

// Map of all playbooks by dimension key
export const DIMENSION_PLAYBOOKS: Record<string, DimensionPlaybook> = {
  'workCaptured': invisibleWorkPlaybook,
  'informationHealth': informationHealthPlaybook,
  'dataFreshness': dataFreshnessPlaybook,
  'estimationCoverage': estimationCoveragePlaybook,
  'sizingConsistency': sizingConsistencyPlaybook,
  'issueTypeConsistency': issueTypeConsistencyPlaybook,
  'blockerManagement': blockerManagementPlaybook,
  'workHierarchy': workHierarchyPlaybook,
  'sprintHygiene': sprintHygienePlaybook,
  'teamCollaboration': teamCollaborationPlaybook,
  'automationOpportunities': automationOpportunitiesPlaybook,
  'collaborationFeatureUsage': collaborationFeatureUsagePlaybook,
  // collaborationBreadth was merged into teamCollaboration
  'configurationEfficiency': configurationEfficiencyPlaybook,
  'backlogDiscipline': backlogDisciplinePlaybook,
};

// Get playbook for a dimension, returns undefined if not yet created
export function getPlaybookForDimension(dimensionKey: string): DimensionPlaybook | undefined {
  return DIMENSION_PLAYBOOKS[dimensionKey];
}

// Check if a dimension has playbook content
export function hasPlaybookContent(dimensionKey: string): boolean {
  return dimensionKey in DIMENSION_PLAYBOOKS;
}

// Look up an action by its ID across all playbooks
// Used to retrieve full action content for items in the Action Plan
export function getActionById(actionId: string, dimensionKey?: string): import('../types/playbook').Action | undefined {
  // If dimension key is provided, search only in that playbook
  if (dimensionKey) {
    const playbook = DIMENSION_PLAYBOOKS[dimensionKey];
    if (playbook?.actions) {
      return playbook.actions.find(a => a.id === actionId || a.recommendationId === actionId);
    }
  }

  // Otherwise search all playbooks
  for (const playbook of Object.values(DIMENSION_PLAYBOOKS)) {
    if (playbook?.actions) {
      const action = playbook.actions.find(a => a.id === actionId || a.recommendationId === actionId);
      if (action) return action;
    }
  }

  return undefined;
}
