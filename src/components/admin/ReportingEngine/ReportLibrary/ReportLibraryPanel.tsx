import React, { useState, useMemo } from 'react';
import {
  ReportTemplate,
  SavedReport,
  TemplateCategory,
} from '../../../../types/reports';
import {
  REPORT_TEMPLATES,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_DESCRIPTIONS,
  getTemplatesByCategory,
} from '../../../../constants/reportTemplates';

interface ReportLibraryPanelProps {
  savedReports: SavedReport[];
  selectedReportId: string | null;
  onTemplateSelect: (template: ReportTemplate) => void;
  onSavedReportSelect: (report: SavedReport) => void;
}

type TabType = 'my-reports' | 'templates';

const CATEGORY_ORDER: TemplateCategory[] = [
  'team-health',
  'indicator-analysis',
  'outcome-confidence',
  'user-activity',
  'data-quality',
  'trend-analysis',
];

const ReportLibraryPanel: React.FC<ReportLibraryPanelProps> = ({
  savedReports,
  selectedReportId,
  onTemplateSelect,
  onSavedReportSelect,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [expandedCategories, setExpandedCategories] = useState<Set<TemplateCategory>>(
    new Set<TemplateCategory>(['team-health', 'data-quality'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Filter saved reports by search
  const filteredSavedReports = useMemo(() => {
    if (!searchQuery) return savedReports;
    const query = searchQuery.toLowerCase();
    return savedReports.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)
    );
  }, [savedReports, searchQuery]);

  // Filter templates by search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return REPORT_TEMPLATES;
    const query = searchQuery.toLowerCase();
    return REPORT_TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const toggleCategory = (category: TemplateCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const renderSavedReports = () => {
    if (filteredSavedReports.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            {searchQuery ? 'No reports match your search' : 'No saved reports yet'}
          </p>
          <p style={styles.emptyHint}>
            Build a query and click "Save" to create a report
          </p>
        </div>
      );
    }

    // Group by recent (last 7 days) and older
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recent = filteredSavedReports.filter(r => new Date(r.updatedAt).getTime() > sevenDaysAgo);
    const older = filteredSavedReports.filter(r => new Date(r.updatedAt).getTime() <= sevenDaysAgo);

    return (
      <div style={styles.reportsList}>
        {recent.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionHeader}>Recent</h4>
            {recent.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={report.id === selectedReportId}
                onClick={() => onSavedReportSelect(report)}
              />
            ))}
          </div>
        )}
        {older.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionHeader}>Older</h4>
            {older.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={report.id === selectedReportId}
                onClick={() => onSavedReportSelect(report)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTemplates = () => {
    return (
      <div style={styles.templatesList}>
        {CATEGORY_ORDER.map(category => {
          const templates = searchQuery
            ? filteredTemplates.filter(t => t.category === category)
            : getTemplatesByCategory(category);

          if (templates.length === 0) return null;

          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} style={styles.categorySection}>
              <button
                style={styles.categoryHeader}
                onClick={() => toggleCategory(category)}
              >
                <span style={styles.categoryIcon}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <div style={styles.categoryInfo}>
                  <span style={styles.categoryName}>
                    {TEMPLATE_CATEGORY_LABELS[category]}
                  </span>
                  <span style={styles.templateCount}>
                    {templates.length} templates
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div style={styles.templateCards}>
                  {templates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => onTemplateSelect(template)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Report Library</h3>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button
            style={styles.clearButton}
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'my-reports' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('my-reports')}
        >
          My Reports ({savedReports.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'templates' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'my-reports' ? renderSavedReports() : renderTemplates()}
      </div>
    </div>
  );
};

// Report Card Component
interface ReportCardProps {
  report: SavedReport;
  isSelected: boolean;
  onClick: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, isSelected, onClick }) => (
  <button
    style={{
      ...styles.reportCard,
      ...(isSelected ? styles.selectedCard : {}),
    }}
    onClick={onClick}
  >
    <div style={styles.reportIcon}>📊</div>
    <div style={styles.reportInfo}>
      <span style={styles.reportName}>{report.name}</span>
      {report.description && (
        <span style={styles.reportDesc}>{report.description}</span>
      )}
    </div>
    {report.isPublicLink && (
      <span style={styles.sharedBadge}>Shared</span>
    )}
  </button>
);

// Template Card Component
interface TemplateCardProps {
  template: ReportTemplate;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => (
  <button style={styles.templateCard} onClick={onClick}>
    <div style={styles.templateIcon}>
      {template.suggestedVisualization === 'bar' ? '📊' :
       template.suggestedVisualization === 'line' ? '📈' :
       template.suggestedVisualization === 'pie' ? '🥧' : '📋'}
    </div>
    <div style={styles.templateInfo}>
      <span style={styles.templateName}>{template.name}</span>
      <span style={styles.templateDesc}>{template.description}</span>
    </div>
  </button>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '16px 16px 8px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  searchContainer: {
    position: 'relative',
    padding: '8px 16px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 32px 8px 12px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearButton: {
    position: 'absolute',
    right: '24px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#6B778C',
    cursor: 'pointer',
    padding: '0 4px',
  },
  tabs: {
    display: 'flex',
    padding: '0 16px',
    gap: '4px',
    borderBottom: '1px solid #EBECF0',
  },
  tab: {
    flex: 1,
    padding: '10px 8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  activeTab: {
    color: '#0052CC',
    borderBottomColor: '#0052CC',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
  },
  reportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionHeader: {
    margin: 0,
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  reportCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  selectedCard: {
    backgroundColor: '#DEEBFF',
    borderColor: '#4C9AFF',
  },
  reportIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  reportInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  reportName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  reportDesc: {
    fontSize: '11px',
    color: '#6B778C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sharedBadge: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '2px 6px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  templatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  categoryIcon: {
    fontSize: '10px',
    color: '#6B778C',
    width: '12px',
  },
  categoryInfo: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  templateCount: {
    fontSize: '11px',
    color: '#6B778C',
  },
  templateCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingLeft: '20px',
    marginBottom: '8px',
  },
  templateCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  templateIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  templateInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  templateName: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#172B4D',
  },
  templateDesc: {
    fontSize: '11px',
    color: '#6B778C',
    lineHeight: 1.3,
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
  },
  emptyText: {
    margin: '0 0 8px',
    fontSize: '14px',
    color: '#172B4D',
  },
  emptyHint: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
};

export default ReportLibraryPanel;
