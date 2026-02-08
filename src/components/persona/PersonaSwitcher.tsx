import React, { useState, useRef, useEffect } from 'react';
import { usePersona } from './PersonaContext';
import { PersonaType, PERSONA_INFO } from '../../types/persona';

const PersonaSwitcher: React.FC = () => {
  const { currentPersona, switchPersona } = usePersona();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (persona: PersonaType) => {
    switchPersona(persona);
    setIsOpen(false);
  };

  const personas: PersonaType[] = ['creator', 'viewer', 'admin'];

  const getIcon = (persona: PersonaType) => {
    switch (persona) {
      case 'creator':
        return (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'viewer':
        return (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'admin':
        return (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 1V3M8 13V15M1 8H3M13 8H15M3.05 3.05L4.46 4.46M11.54 11.54L12.95 12.95M3.05 12.95L4.46 11.54M11.54 4.46L12.95 3.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button
        style={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span style={styles.iconWrapper}>{getIcon(currentPersona)}</span>
        <span style={styles.label}>{PERSONA_INFO[currentPersona].displayName}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div style={styles.dropdown} role="listbox">
          <div style={styles.dropdownHeader}>Switch Profile</div>
          {personas.map((persona) => {
            const isActive = persona === currentPersona;
            return (
              <button
                key={persona}
                style={{
                  ...styles.option,
                  ...(isActive ? styles.optionActive : {}),
                }}
                onClick={() => handleSelect(persona)}
                role="option"
                aria-selected={isActive}
              >
                <span style={styles.optionIcon}>{getIcon(persona)}</span>
                <div style={styles.optionContent}>
                  <span style={styles.optionLabel}>{PERSONA_INFO[persona].displayName}</span>
                  <span style={styles.optionDesc}>{PERSONA_INFO[persona].description}</span>
                </div>
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.checkIcon}>
                    <path d="M3 8L6.5 11.5L13 4.5" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    minWidth: '50px',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '240px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.25)',
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: '10px 14px 8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #EBECF0',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  optionActive: {
    backgroundColor: '#F4F5F7',
  },
  optionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    color: '#42526E',
    flexShrink: 0,
  },
  optionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  optionLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  optionDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  checkIcon: {
    flexShrink: 0,
  },
};

export default PersonaSwitcher;
