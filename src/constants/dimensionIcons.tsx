import React from 'react';

// Dimension Icons
import WatchIcon from '@atlaskit/icon/glyph/watch';
import DocumentIcon from '@atlaskit/icon/glyph/document';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import LabelIcon from '@atlaskit/icon/glyph/label';
import LinkIcon from '@atlaskit/icon/glyph/link';
import GraphBarIcon from '@atlaskit/icon/glyph/graph-bar';
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import FlagFilledIcon from '@atlaskit/icon/glyph/flag-filled';
import ShareIcon from '@atlaskit/icon/glyph/share';
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import SprintIcon from '@atlaskit/icon/glyph/sprint';
import BacklogIcon from '@atlaskit/icon/glyph/backlog';

// Outcome Icons
import ShipIcon from '@atlaskit/icon/glyph/ship';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import ActivityIcon from '@atlaskit/icon/glyph/activity';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import OverviewIcon from '@atlaskit/icon/glyph/overview';
import WarningIcon from '@atlaskit/icon/glyph/warning';

// Dimension icon mapping by dimensionKey
const dimensionIconMap: Record<string, React.ComponentType<{ label: string; size?: 'small' | 'medium' | 'large' | 'xlarge'; primaryColor?: string }>> = {
  workCaptured: WatchIcon,
  informationHealth: DocumentIcon,
  dataFreshness: RefreshIcon,
  issueTypeConsistency: LabelIcon,
  workHierarchy: LinkIcon,
  estimationCoverage: GraphBarIcon,
  sizingConsistency: EditorPanelIcon,
  teamCollaboration: PeopleIcon,
  blockerManagement: FlagFilledIcon,
  collaborationFeatureUsage: ShareIcon,
  automationOpportunities: LightbulbIcon,
  configurationEfficiency: SettingsIcon,
  sprintHygiene: SprintIcon,
  backlogDiscipline: BacklogIcon,
};

// Outcome icon mapping by outcome ID
const outcomeIconMap: Record<string, React.ComponentType<{ label: string; size?: 'small' | 'medium' | 'large' | 'xlarge'; primaryColor?: string }>> = {
  commitments: ShipIcon,
  delivery: ShipIcon,        // Alias for commitments
  Delivery: ShipIcon,        // Alias for commitments (capitalized)
  progress: GraphLineIcon,
  productivity: ActivityIcon,
  improvement: CheckCircleIcon,
  collaboration: PeopleIcon,
  portfolio: OverviewIcon,
  awareness: WarningIcon,
};

// Default blue color for dimension icons
const DIMENSION_ICON_COLOR = '#0052CC';

/**
 * Get an icon element for a dimension by its key
 * @param dimensionKey - The unique key for the dimension (e.g., 'workCaptured', 'informationHealth')
 * @param size - Icon size: 'small', 'medium', 'large', or 'xlarge'
 * @param color - Optional color override (defaults to Atlassian blue #0052CC)
 * @returns JSX element of the icon, or null if not found
 */
export const getDimensionIcon = (
  dimensionKey: string,
  size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium',
  color: string = DIMENSION_ICON_COLOR
): JSX.Element | null => {
  const IconComponent = dimensionIconMap[dimensionKey];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent label="" size={size} primaryColor={color} />;
};

/**
 * Get an icon element for an outcome by its ID
 * @param outcomeId - The unique ID for the outcome (e.g., 'commitments', 'progress')
 * @param size - Icon size: 'small', 'medium', 'large', or 'xlarge'
 * @param color - Optional color override (defaults to Atlassian blue #0052CC)
 * @returns JSX element of the icon, or null if not found
 */
export const getOutcomeIcon = (
  outcomeId: string,
  size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium',
  color: string = DIMENSION_ICON_COLOR
): JSX.Element | null => {
  const IconComponent = outcomeIconMap[outcomeId];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent label="" size={size} primaryColor={color} />;
};

/**
 * Check if a dimension key has an associated icon
 */
export const hasDimensionIcon = (dimensionKey: string): boolean => {
  return dimensionKey in dimensionIconMap;
};

/**
 * Check if an outcome ID has an associated icon
 */
export const hasOutcomeIcon = (outcomeId: string): boolean => {
  return outcomeId in outcomeIconMap;
};
