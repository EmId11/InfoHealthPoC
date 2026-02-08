import React, { useState } from 'react';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  badge,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div style={styles.container}>
      <button
        type="button"
        style={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span style={styles.icon}>
          {isExpanded ? (
            <ChevronDownIcon label="Collapse" size="medium" />
          ) : (
            <ChevronRightIcon label="Expand" size="medium" />
          )}
        </span>
        <span style={styles.title}>{title}</span>
        {badge && <span style={styles.badge}>{badge}</span>}
      </button>
      {isExpanded && <div style={styles.content}>{children}</div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    backgroundColor: '#FAFBFC',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    color: '#6B778C',
  },
  title: {
    flex: 1,
  },
  badge: {
    padding: '2px 8px',
    backgroundColor: '#DFE1E6',
    color: '#5E6C84',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  content: {
    padding: '16px',
    borderTop: '1px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
  },
};

export default ExpandableSection;
