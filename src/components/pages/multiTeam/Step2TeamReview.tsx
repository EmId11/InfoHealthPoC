import React, { useState, useMemo } from 'react';
import Textfield from '@atlaskit/textfield';
import { Checkbox } from '@atlaskit/checkbox';
import Button from '@atlaskit/button/standard-button';
import StepHeader from '../../shared/StepHeader';
import type { ScopeSelection, TeamExclusion } from '../../../types/multiTeamAssessment';
import type { TeamAttributeConfig, AttributeValue } from '../../../types/admin';
import { mockTeams, TeamOption } from '../../../constants/presets';

interface Step2TeamReviewProps {
  scope: ScopeSelection;
  excludedTeams: TeamExclusion[];
  onUpdateExclusions: (exclusions: TeamExclusion[]) => void;
  teamAttributes: TeamAttributeConfig;
}

interface TeamRowData {
  teamId: string;
  teamName: string;
  isOnboarded: boolean;
  workType?: string;
  teamOfTeams?: string;
  portfolio?: string;
  isExcluded: boolean;
}

const Step2TeamReview: React.FC<Step2TeamReviewProps> = ({
  scope,
  excludedTeams,
  onUpdateExclusions,
  teamAttributes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showExcludedOnly, setShowExcludedOnly] = useState(false);

  // Get attribute values for display
  const getAttributeValue = (attributeId: string, teamId: string): string | undefined => {
    const values = teamAttributes.attributeValues.filter(
      (v) => v.attributeId === attributeId && v.manualTeamIds.includes(teamId)
    );
    return values[0]?.name;
  };

  // Build team row data
  const teamRows: TeamRowData[] = useMemo(() => {
    const rows: TeamRowData[] = [];

    scope.resolvedTeamIds.forEach((teamId) => {
      const team = mockTeams.find((t) => t.value === teamId);
      if (!team) return;

      // Find attributes
      const workType = teamAttributes.attributeValues.find(
        (v) => v.attributeId === 'cat-work-type' && v.manualTeamIds.includes(teamId)
      )?.name;

      const tot = teamAttributes.attributeValues.find(
        (v) => v.attributeId === 'cat-tribe' && v.manualTeamIds.includes(teamId)
      )?.name;

      const portfolio = teamAttributes.attributeValues.find(
        (v) => v.attributeId === 'cat-portfolio' && v.manualTeamIds.includes(teamId)
      )?.name;

      rows.push({
        teamId,
        teamName: team.label,
        isOnboarded: team.isOnboarded,
        workType,
        teamOfTeams: tot,
        portfolio,
        isExcluded: excludedTeams.some((e) => e.teamId === teamId),
      });
    });

    return rows;
  }, [scope.resolvedTeamIds, excludedTeams, teamAttributes.attributeValues]);

  // Filter teams based on search and exclusion filter
  const filteredTeams = useMemo(() => {
    let filtered = teamRows;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (team) =>
          team.teamName.toLowerCase().includes(query) ||
          team.workType?.toLowerCase().includes(query) ||
          team.teamOfTeams?.toLowerCase().includes(query)
      );
    }

    if (showExcludedOnly) {
      filtered = filtered.filter((team) => team.isExcluded);
    }

    return filtered;
  }, [teamRows, searchQuery, showExcludedOnly]);

  // Count stats
  const includedCount = teamRows.filter((t) => !t.isExcluded).length;
  const excludedCount = teamRows.filter((t) => t.isExcluded).length;
  const configuredCount = teamRows.filter((t) => t.isOnboarded).length;
  const newCount = teamRows.filter((t) => !t.isOnboarded).length;

  // Toggle team exclusion
  const handleToggleExclusion = (teamId: string, teamName: string) => {
    const isCurrentlyExcluded = excludedTeams.some((e) => e.teamId === teamId);

    if (isCurrentlyExcluded) {
      onUpdateExclusions(excludedTeams.filter((e) => e.teamId !== teamId));
    } else {
      onUpdateExclusions([...excludedTeams, { teamId, teamName }]);
    }
  };

  // Exclude all new teams
  const handleExcludeAllNew = () => {
    const newTeams = teamRows
      .filter((t) => !t.isOnboarded && !t.isExcluded)
      .map((t) => ({ teamId: t.teamId, teamName: t.teamName }));

    onUpdateExclusions([...excludedTeams, ...newTeams]);
  };

  // Include all teams
  const handleIncludeAll = () => {
    onUpdateExclusions([]);
  };

  return (
    <div style={styles.container}>
      <StepHeader
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 11L12 14L22 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Review Teams"
        description="Review the teams that will be included in this assessment. You can exclude teams if needed."
        tourId={2}
        infoContent={
          <>
            <p>Review the teams resolved from your scope selection.</p>
            <p><strong>Configured teams:</strong> Have been assessed before and have saved settings.</p>
            <p><strong>New teams:</strong> First-time assessments that will use default settings.</p>
            <p>You can exclude teams that shouldn't be part of this assessment.</p>
          </>
        }
      />

      <div style={styles.content}>
        {/* Summary Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{includedCount}</span>
            <span style={styles.statLabel}>Teams Included</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statValue, color: '#6B778C' }}>{excludedCount}</span>
            <span style={styles.statLabel}>Excluded</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statValue, color: '#006644' }}>{configuredCount}</span>
            <span style={styles.statLabel}>Configured</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statValue, color: '#0747A6' }}>{newCount}</span>
            <span style={styles.statLabel}>New Teams</span>
          </div>
        </div>

        {/* Filters and Actions */}
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Textfield
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              elemAfterInput={
                <span style={styles.searchIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                      stroke="#6B778C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              }
            />
          </div>
          <div style={styles.filterActions}>
            <label style={styles.checkboxLabel}>
              <Checkbox
                isChecked={showExcludedOnly}
                onChange={(e) => setShowExcludedOnly(e.target.checked)}
              />
              <span>Show excluded only</span>
            </label>
            <div style={styles.buttonGroup}>
              <Button appearance="subtle" onClick={handleExcludeAllNew}>
                Exclude New Teams
              </Button>
              <Button appearance="subtle" onClick={handleIncludeAll}>
                Include All
              </Button>
            </div>
          </div>
        </div>

        {/* Teams Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.th, width: '48px' }}>Include</th>
                <th style={styles.th}>Team Name</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Work Type</th>
                <th style={styles.th}>Team of Teams</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr
                  key={team.teamId}
                  style={{
                    ...styles.tableRow,
                    ...(team.isExcluded ? styles.tableRowExcluded : {}),
                  }}
                >
                  <td style={styles.td}>
                    <Checkbox
                      isChecked={!team.isExcluded}
                      onChange={() => handleToggleExclusion(team.teamId, team.teamName)}
                    />
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.teamName,
                        ...(team.isExcluded ? styles.teamNameExcluded : {}),
                      }}
                    >
                      {team.teamName}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {team.isOnboarded ? (
                      <span style={styles.configuredBadge}>Configured</span>
                    ) : (
                      <span style={styles.newBadge}>New</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.attributeValue}>{team.workType || '-'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.attributeValue}>{team.teamOfTeams || '-'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTeams.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔍</span>
              <span style={styles.emptyText}>No teams match your search</span>
            </div>
          )}
        </div>

        {/* Warning for excluded teams */}
        {excludedCount > 0 && (
          <div style={styles.warningBox}>
            <span style={styles.warningIcon}>⚠️</span>
            <span>
              {excludedCount} team{excludedCount !== 1 ? 's' : ''} excluded from this assessment.
              Results will only include the {includedCount} remaining teams.
            </span>
          </div>
        )}

        {/* Warning for new teams */}
        {newCount > 0 && excludedCount < newCount && (
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ️</span>
            <span>
              {newCount} new team{newCount !== 1 ? 's are' : ' is'} included. They will use default
              settings for this assessment.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '4px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: '1 1 200px',
    maxWidth: '300px',
  },
  searchIcon: {
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  filterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6B778C',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  tableContainer: {
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#F4F5F7',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    borderBottom: '1px solid #DFE1E6',
  },
  tableRow: {
    borderBottom: '1px solid #F4F5F7',
    transition: 'background-color 0.15s ease',
  },
  tableRowExcluded: {
    backgroundColor: '#FAFBFC',
    opacity: 0.7,
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#172B4D',
  },
  teamName: {
    fontWeight: 500,
  },
  teamNameExcluded: {
    textDecoration: 'line-through',
    color: '#6B778C',
  },
  configuredBadge: {
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
  },
  newBadge: {
    padding: '2px 8px',
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
  },
  attributeValue: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    color: '#6B778C',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '14px',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#172B4D',
  },
  warningIcon: {
    fontSize: '16px',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#DEEBFF',
    border: '1px solid #B3D4FF',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#172B4D',
  },
  infoIcon: {
    fontSize: '16px',
  },
};

export default Step2TeamReview;
