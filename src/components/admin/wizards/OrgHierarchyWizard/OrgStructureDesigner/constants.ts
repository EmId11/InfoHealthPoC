// Constants for the Org Structure Designer
// Templates, colors, and level name suggestions

import { OrgHierarchyLevel, StructureTemplateId } from '../../../../../types/admin';

// Color palette (Atlaskit-aligned)
export const LEVEL_COLORS = {
  purple: '#6554C0',  // Level 1 (top)
  blue: '#0065FF',    // Level 2
  teal: '#00B8D9',    // Level 3
  orange: '#FF8B00',  // Level 4
  green: '#36B37E',   // Teams (always at bottom)
};

export const LEVEL_COLOR_OPTIONS = [
  { value: LEVEL_COLORS.purple, label: 'Purple' },
  { value: LEVEL_COLORS.blue, label: 'Blue' },
  { value: LEVEL_COLORS.teal, label: 'Teal' },
  { value: LEVEL_COLORS.orange, label: 'Orange' },
];

// Template definitions
export interface StructureTemplate {
  id: StructureTemplateId;
  name: string;
  description: string;
  levelsAboveTeams: number;
  defaultLevels: OrgHierarchyLevel[];
}

export const STRUCTURE_TEMPLATES: StructureTemplate[] = [
  {
    id: 'flat',
    name: 'Flat',
    description: 'Teams only, no hierarchy',
    levelsAboveTeams: 0,
    defaultLevels: [],
  },
  {
    id: 'simple',
    name: 'Simple',
    description: 'One level above teams',
    levelsAboveTeams: 1,
    defaultLevels: [
      {
        id: 'level-division',
        name: 'Division',
        pluralName: 'Divisions',
        aliases: ['Business Unit', 'Department'],
        color: LEVEL_COLORS.purple,
        isMandatory: false,
        order: 0,
      },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Portfolio > Team of Teams > Teams',
    levelsAboveTeams: 2,
    defaultLevels: [
      {
        id: 'level-portfolio',
        name: 'Portfolio',
        pluralName: 'Portfolios',
        aliases: ['Value Stream', 'Product Line'],
        color: LEVEL_COLORS.purple,
        isMandatory: false,
        order: 0,
      },
      {
        id: 'level-tot',
        name: 'Team of Teams',
        pluralName: 'Teams of Teams',
        aliases: ['Tribe', 'Squad of Squads', 'Program'],
        color: LEVEL_COLORS.blue,
        isMandatory: false,
        order: 1,
      },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Business Unit > Portfolio > Area > Teams',
    levelsAboveTeams: 3,
    defaultLevels: [
      {
        id: 'level-bu',
        name: 'Business Unit',
        pluralName: 'Business Units',
        aliases: ['Division', 'Department'],
        color: LEVEL_COLORS.purple,
        isMandatory: false,
        order: 0,
      },
      {
        id: 'level-portfolio',
        name: 'Portfolio',
        pluralName: 'Portfolios',
        aliases: ['Value Stream', 'Product Line'],
        color: LEVEL_COLORS.blue,
        isMandatory: false,
        order: 1,
      },
      {
        id: 'level-area',
        name: 'Area',
        pluralName: 'Areas',
        aliases: ['Tribe', 'Domain', 'Release Train'],
        color: LEVEL_COLORS.teal,
        isMandatory: false,
        order: 2,
      },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Build your own structure',
    levelsAboveTeams: 0,
    defaultLevels: [],
  },
];

// Suggested level names for quick selection
export const LEVEL_NAME_SUGGESTIONS = [
  { name: 'Portfolio', pluralName: 'Portfolios' },
  { name: 'Division', pluralName: 'Divisions' },
  { name: 'Business Unit', pluralName: 'Business Units' },
  { name: 'Value Stream', pluralName: 'Value Streams' },
  { name: 'Team of Teams', pluralName: 'Teams of Teams' },
  { name: 'Tribe', pluralName: 'Tribes' },
  { name: 'Area', pluralName: 'Areas' },
  { name: 'Domain', pluralName: 'Domains' },
  { name: 'Program', pluralName: 'Programs' },
  { name: 'Release Train', pluralName: 'Release Trains' },
];

// Maximum number of levels above Teams
export const MAX_CUSTOM_LEVELS = 4;

// Generate a unique ID for new levels
export const generateLevelId = (): string => {
  return `level-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get the next available color for a new level
export const getNextAvailableColor = (existingLevels: OrgHierarchyLevel[]): string => {
  const usedColors = new Set(existingLevels.map(l => l.color));
  const colorOrder = [LEVEL_COLORS.purple, LEVEL_COLORS.blue, LEVEL_COLORS.teal, LEVEL_COLORS.orange];

  for (const color of colorOrder) {
    if (!usedColors.has(color)) {
      return color;
    }
  }

  return LEVEL_COLORS.purple; // Default to purple if all colors are used
};

// Get sample data for preview
export const getSampleDataForLevel = (levelIndex: number): string[] => {
  const sampleData: string[][] = [
    ['Consumer Tech', 'Enterprise', 'Platform'], // Level 0
    ['Mobile', 'Web', 'Core Services'], // Level 1
    ['iOS', 'Android', 'Frontend'], // Level 2
    ['Core API', 'Auth', 'Data'], // Level 3
  ];

  return sampleData[levelIndex] || ['Group A', 'Group B', 'Group C'];
};
