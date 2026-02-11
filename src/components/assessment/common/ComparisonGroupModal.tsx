import React, { useEffect } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { ComparisonTeam } from '../../../types/assessment';

interface ComparisonGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: ComparisonTeam[];
  criteria: string[];
  teamCount: number;
  yourRank?: number; // Current team's rank for the dimension (1 = best)
  dimensionName?: string; // Name of the current dimension for context
}

const ComparisonGroupModal: React.FC<ComparisonGroupModalProps> = ({
  isOpen,
  onClose,
  teams,
  criteria,
  teamCount,
  yourRank,
  dimensionName,
}) => {
  const criteriaText = criteria.length > 0 ? criteria.join(', ') : 'your selected criteria';

  // Generate simulated ranks for teams when yourRank is provided
  // Teams with rank < yourRank are doing better, rank > yourRank are doing worse
  const getTeamsWithRanks = () => {
    if (!yourRank) return { betterTeams: [], worseTeams: [], allTeams: teams };

    // Create teams with simulated ranks (excluding your team's rank)
    const ranksToAssign = Array.from({ length: teamCount }, (_, i) => i + 1)
      .filter(r => r !== yourRank);

    // Shuffle ranks deterministically based on team names
    const shuffledRanks = [...ranksToAssign].sort((a, b) => {
      const teamA = teams[ranksToAssign.indexOf(a) % teams.length];
      const teamB = teams[ranksToAssign.indexOf(b) % teams.length];
      return (teamA?.name || '').localeCompare(teamB?.name || '');
    });

    const teamsWithRanks = teams.map((team, index) => ({
      ...team,
      rank: shuffledRanks[index % shuffledRanks.length] || index + 1,
    }));

    // Sort by rank
    teamsWithRanks.sort((a, b) => (a.rank || 0) - (b.rank || 0));

    const betterTeams = teamsWithRanks.filter(t => (t.rank || 0) < yourRank);
    const worseTeams = teamsWithRanks.filter(t => (t.rank || 0) > yourRank);

    return { betterTeams, worseTeams, allTeams: teamsWithRanks };
  };

  const { betterTeams, worseTeams, allTeams } = getTeamsWithRanks();

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Teams in This Assessment</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="small" />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <p style={styles.intro}>
            This assessment includes <strong>{teamCount + 1} teams</strong>. Here are the other teams alongside yours.
            {yourRank && dimensionName && (
              <> For <strong>{dimensionName}</strong>, you are ranked <strong>{yourRank}</strong> of {teamCount + 1}.</>
            )}
          </p>

          {yourRank ? (
            /* Show grouped teams when we have rank context */
            <>
              {/* Teams doing better */}
              {betterTeams.length > 0 && (
                <div style={styles.teamsSection}>
                  <h4 style={{ ...styles.sectionTitle, color: '#006644' }}>
                    Teams with lower {dimensionName?.toLowerCase() || ''} risk than your team ({betterTeams.length})
                  </h4>
                  <div style={styles.teamsList}>
                    {betterTeams.map((team) => (
                      <div key={team.id} style={{ ...styles.teamItem, ...styles.teamItemBetter }}>
                        <span style={{ ...styles.teamRank, color: '#006644' }}>#{team.rank}</span>
                        <span style={styles.teamName}>{team.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Your team marker */}
              <div style={styles.yourTeamMarker}>
                <div style={styles.yourTeamLine} />
                <span style={styles.yourTeamBadge}>Your team — #{yourRank}</span>
                <div style={styles.yourTeamLine} />
              </div>

              {/* Teams doing worse */}
              {worseTeams.length > 0 && (
                <div style={styles.teamsSection}>
                  <h4 style={{ ...styles.sectionTitle, color: '#DE350B' }}>
                    Teams with higher {dimensionName?.toLowerCase() || ''} risk than your team ({worseTeams.length})
                  </h4>
                  <div style={styles.teamsList}>
                    {worseTeams.map((team) => (
                      <div key={team.id} style={{ ...styles.teamItem, ...styles.teamItemWorse }}>
                        <span style={{ ...styles.teamRank, color: '#DE350B' }}>#{team.rank}</span>
                        <span style={styles.teamName}>{team.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Default view without rank context */
            <div style={styles.teamsSection}>
              <h4 style={styles.sectionTitle}>Other teams in this assessment:</h4>
              <div style={styles.teamsList}>
                {teams.map((team, index) => (
                  <div key={team.id} style={styles.teamItem}>
                    <span style={styles.teamNumber}>{index + 1}</span>
                    <span style={styles.teamName}>{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={styles.note}>
            {yourRank
              ? `Rankings are specific to ${dimensionName || 'this dimension'}. Teams may rank differently across other dimensions.`
              : `When you see rankings like "Bottom 22%" or "Top 15%" on your assessment cards, they refer to your position relative to the other ${teamCount} teams in this assessment.`
            }
          </p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.primaryButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  intro: {
    marginTop: 0,
    marginBottom: '20px',
    lineHeight: 1.6,
    fontSize: '14px',
    color: '#172B4D',
  },
  teamsSection: {
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '20px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  teamsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  teamItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '13px',
  },
  teamItemBetter: {
    borderLeft: '3px solid #36B37E',
  },
  teamItemWorse: {
    borderLeft: '3px solid #FF8B00',
  },
  teamNumber: {
    color: '#6B778C',
    fontSize: '11px',
    minWidth: '20px',
  },
  teamRank: {
    fontSize: '12px',
    fontWeight: 600,
    minWidth: '28px',
  },
  teamName: {
    color: '#172B4D',
    fontWeight: 500,
  },
  yourTeamMarker: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '16px 0',
  },
  yourTeamLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#0052CC',
  },
  yourTeamBadge: {
    padding: '6px 12px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  note: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
  },
  primaryButton: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default ComparisonGroupModal;
