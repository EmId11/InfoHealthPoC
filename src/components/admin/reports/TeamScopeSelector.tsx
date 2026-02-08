import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MOCK_TEAMS,
  getUniquePortfolios,
  getUniqueTribes,
  getTeamsByPortfolio,
  getTeamsByTribe,
} from '../../../utils/reportQueryEngine';

export type ScopeType = 'all' | 'teams' | 'portfolio' | 'tribe';

export interface TeamScope {
  type: ScopeType;
  selectedTeams: string[]; // team names
  portfolio?: string;
  tribe?: string;
}

interface TeamScopeSelectorProps {
  scope: TeamScope;
  onChange: (scope: TeamScope) => void;
}

const TeamScopeSelector: React.FC<TeamScopeSelectorProps> = ({ scope, onChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const portfolios = useMemo(() => getUniquePortfolios(), []);
  const tribes = useMemo(() => getUniqueTribes(), []);
  const allTeams = useMemo(() => MOCK_TEAMS.map(t => t.teamName).sort(), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display label for current selection
  const getDisplayLabel = (): string => {
    switch (scope.type) {
      case 'all':
        return 'All Teams';
      case 'portfolio':
        return scope.portfolio ? `Portfolio: ${scope.portfolio}` : 'Select Portfolio';
      case 'tribe':
        return scope.tribe ? `Tribe: ${scope.tribe}` : 'Select Tribe';
      case 'teams':
        if (scope.selectedTeams.length === 0) return 'Select Teams';
        if (scope.selectedTeams.length === 1) return scope.selectedTeams[0];
        return `${scope.selectedTeams.length} teams selected`;
      default:
        return 'Select Scope';
    }
  };

  // Get count of teams in scope
  const getTeamCount = (): number => {
    switch (scope.type) {
      case 'all':
        return allTeams.length;
      case 'portfolio':
        return scope.portfolio ? getTeamsByPortfolio(scope.portfolio).length : 0;
      case 'tribe':
        return scope.tribe ? getTeamsByTribe(scope.tribe).length : 0;
      case 'teams':
        return scope.selectedTeams.length;
      default:
        return 0;
    }
  };

  const handleScopeTypeChange = (type: ScopeType) => {
    if (type === 'all') {
      onChange({ type: 'all', selectedTeams: [] });
      setIsDropdownOpen(false);
    } else {
      onChange({ ...scope, type, selectedTeams: [] });
    }
  };

  const handlePortfolioSelect = (portfolio: string) => {
    onChange({ type: 'portfolio', selectedTeams: [], portfolio });
    setIsDropdownOpen(false);
  };

  const handleTribeSelect = (tribe: string) => {
    onChange({ type: 'tribe', selectedTeams: [], tribe });
    setIsDropdownOpen(false);
  };

  const handleTeamToggle = (teamName: string) => {
    const newSelected = scope.selectedTeams.includes(teamName)
      ? scope.selectedTeams.filter(t => t !== teamName)
      : [...scope.selectedTeams, teamName];
    onChange({ type: 'teams', selectedTeams: newSelected });
  };

  const handleSelectAllTeams = () => {
    onChange({ type: 'teams', selectedTeams: [...allTeams] });
  };

  const handleClearTeams = () => {
    onChange({ type: 'teams', selectedTeams: [] });
  };

  const filteredTeams = allTeams.filter(team =>
    team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container} ref={dropdownRef}>
      <div style={styles.label}>Team Scope</div>
      <button
        style={styles.selector}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div style={styles.selectorContent}>
          <span style={styles.selectorLabel}>{getDisplayLabel()}</span>
          <span style={styles.teamCount}>{getTeamCount()} team{getTeamCount() !== 1 ? 's' : ''}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.chevron}>
          <path d={isDropdownOpen ? "M12 10L8 6L4 10" : "M4 6L8 10L12 6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isDropdownOpen && (
        <div style={styles.dropdown}>
          {/* Scope Type Tabs */}
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(scope.type === 'all' ? styles.tabActive : {}),
              }}
              onClick={() => handleScopeTypeChange('all')}
            >
              All
            </button>
            <button
              style={{
                ...styles.tab,
                ...(scope.type === 'portfolio' ? styles.tabActive : {}),
              }}
              onClick={() => handleScopeTypeChange('portfolio')}
            >
              Portfolio
            </button>
            <button
              style={{
                ...styles.tab,
                ...(scope.type === 'tribe' ? styles.tabActive : {}),
              }}
              onClick={() => handleScopeTypeChange('tribe')}
            >
              Tribe
            </button>
            <button
              style={{
                ...styles.tab,
                ...(scope.type === 'teams' ? styles.tabActive : {}),
              }}
              onClick={() => handleScopeTypeChange('teams')}
            >
              Teams
            </button>
          </div>

          {/* Content based on scope type */}
          <div style={styles.dropdownContent}>
            {scope.type === 'all' && (
              <div style={styles.infoMessage}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 7v3M8 5.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Showing results for all {allTeams.length} teams</span>
              </div>
            )}

            {scope.type === 'portfolio' && (
              <div style={styles.optionList}>
                {portfolios.map(portfolio => {
                  const teamCount = getTeamsByPortfolio(portfolio).length;
                  return (
                    <button
                      key={portfolio}
                      style={{
                        ...styles.option,
                        ...(scope.portfolio === portfolio ? styles.optionSelected : {}),
                      }}
                      onClick={() => handlePortfolioSelect(portfolio)}
                    >
                      <span>{portfolio}</span>
                      <span style={styles.optionCount}>{teamCount} team{teamCount !== 1 ? 's' : ''}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {scope.type === 'tribe' && (
              <div style={styles.optionList}>
                {tribes.map(tribe => {
                  const teamCount = getTeamsByTribe(tribe).length;
                  return (
                    <button
                      key={tribe}
                      style={{
                        ...styles.option,
                        ...(scope.tribe === tribe ? styles.optionSelected : {}),
                      }}
                      onClick={() => handleTribeSelect(tribe)}
                    >
                      <span>{tribe}</span>
                      <span style={styles.optionCount}>{teamCount} team{teamCount !== 1 ? 's' : ''}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {scope.type === 'teams' && (
              <>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <div style={styles.bulkActions}>
                  <button style={styles.bulkButton} onClick={handleSelectAllTeams}>
                    Select All
                  </button>
                  <button style={styles.bulkButton} onClick={handleClearTeams}>
                    Clear
                  </button>
                </div>
                <div style={styles.teamList}>
                  {filteredTeams.map(team => (
                    <label key={team} style={styles.teamOption}>
                      <input
                        type="checkbox"
                        checked={scope.selectedTeams.includes(team)}
                        onChange={() => handleTeamToggle(team)}
                        style={styles.checkbox}
                      />
                      <span>{team}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {scope.type === 'teams' && scope.selectedTeams.length > 0 && (
            <div style={styles.dropdownFooter}>
              <button
                style={styles.applyButton}
                onClick={() => setIsDropdownOpen(false)}
              >
                Apply ({scope.selectedTeams.length} selected)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  selector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#172B4D',
    cursor: 'pointer',
    minWidth: '280px',
    transition: 'all 0.15s ease',
  },
  selectorContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  selectorLabel: {
    fontWeight: 500,
  },
  teamCount: {
    fontSize: '12px',
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  chevron: {
    color: '#6B778C',
    flexShrink: 0,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
    zIndex: 100,
    minWidth: '320px',
    overflow: 'hidden',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  tab: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    color: '#6554C0',
    borderBottomColor: '#6554C0',
    backgroundColor: '#FFFFFF',
  },
  dropdownContent: {
    maxHeight: '280px',
    overflowY: 'auto',
  },
  infoMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    color: '#6B778C',
    fontSize: '13px',
  },
  optionList: {
    padding: '8px 0',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    color: '#172B4D',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  optionSelected: {
    backgroundColor: '#EAE6FF',
    color: '#6554C0',
    fontWeight: 500,
  },
  optionCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  searchContainer: {
    padding: '12px 12px 8px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
  },
  bulkActions: {
    display: 'flex',
    gap: '8px',
    padding: '0 12px 8px',
  },
  bulkButton: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#6B778C',
    cursor: 'pointer',
  },
  teamList: {
    padding: '0 8px 8px',
  },
  teamOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 8px',
    fontSize: '14px',
    color: '#172B4D',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  dropdownFooter: {
    padding: '12px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  applyButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#6554C0',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};

export default TeamScopeSelector;
