import React, { useState } from 'react';
import Button from '@atlaskit/button/standard-button';
import { TeamAttributeConfig, TeamAttribute, CategoryValue } from '../../../../types/admin';

interface TeamAttributesStep3CustomAttrsProps {
  categorization: TeamAttributeConfig;
  onUpdate: (config: TeamAttributeConfig) => void;
}

const SUGGESTED_ATTRIBUTES = [
  { name: 'Work Type', description: 'Type of work the team primarily does', values: ['Product', 'BAU', 'Platform', 'Support'] },
  { name: 'Domain', description: 'Business domain or area', values: ['Payments', 'Identity', 'Mobile', 'Web'] },
  { name: 'Region', description: 'Geographic location or timezone', values: ['AMER', 'EMEA', 'APAC'] },
];

const TeamAttributesStep3CustomAttrs: React.FC<TeamAttributesStep3CustomAttrsProps> = ({
  categorization,
  onUpdate,
}) => {
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeDesc, setNewAttributeDesc] = useState('');
  const [expandedAttr, setExpandedAttr] = useState<string | null>(null);
  const [newValueName, setNewValueName] = useState('');

  // Filter to only show admin-defined (custom) attributes
  const customAttributes = categorization.categories.filter((c) => c.type === 'admin');

  const getValuesForAttribute = (attributeId: string) =>
    categorization.categoryValues.filter((v) => v.categoryId === attributeId || v.attributeId === attributeId);

  const handleAddAttribute = (name: string, description: string = '', suggestedValues?: string[]) => {
    const newAttr: TeamAttribute = {
      id: `attr-${Date.now()}`,
      name: name.trim(),
      description: description || `Custom attribute for ${name}`,
      type: 'admin',
      isRequired: false,
      allowMultiple: false,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    const newValues: CategoryValue[] = (suggestedValues || []).map((val, idx) => ({
      id: `attrval-${Date.now()}-${idx}`,
      attributeId: newAttr.id,
      categoryId: newAttr.id,
      name: val,
      filterRule: null,
      manualTeamIds: [],
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    }));

    onUpdate({
      ...categorization,
      categories: [...categorization.categories, newAttr],
      categoryValues: [...categorization.categoryValues, ...newValues],
    });

    setNewAttributeName('');
    setNewAttributeDesc('');
    setExpandedAttr(newAttr.id);
  };

  const handleDeleteAttribute = (attrId: string) => {
    onUpdate({
      ...categorization,
      categories: categorization.categories.filter((c) => c.id !== attrId),
      categoryValues: categorization.categoryValues.filter(
        (v) => v.attributeId !== attrId && v.categoryId !== attrId
      ),
    });
  };

  const handleAddValue = (attrId: string) => {
    if (!newValueName.trim()) return;

    const newValue: CategoryValue = {
      id: `attrval-${Date.now()}`,
      attributeId: attrId,
      categoryId: attrId,
      name: newValueName.trim(),
      filterRule: null,
      manualTeamIds: [],
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    onUpdate({
      ...categorization,
      categoryValues: [...categorization.categoryValues, newValue],
    });
    setNewValueName('');
  };

  const handleDeleteValue = (valueId: string) => {
    onUpdate({
      ...categorization,
      categoryValues: categorization.categoryValues.filter((v) => v.id !== valueId),
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Create custom attributes to categorize teams based on your organization's needs.
          These help with filtering and comparing teams in reports.
        </p>
      </div>

      {/* Existing Custom Attributes */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Your Custom Attributes</h3>

        {customAttributes.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="8" width="32" height="32" rx="4" stroke="#DFE1E6" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M24 18v12M18 24h12" stroke="#A5ADBA" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={styles.emptyText}>No custom attributes yet</p>
            <p style={styles.emptyDesc}>Add your first attribute below or use a suggestion</p>
          </div>
        ) : (
          <div style={styles.attributesList}>
            {customAttributes.map((attr) => {
              const values = getValuesForAttribute(attr.id);
              const isExpanded = expandedAttr === attr.id;

              return (
                <div key={attr.id} style={styles.attributeCard}>
                  <div style={styles.attributeHeader}>
                    <button
                      style={styles.expandButton}
                      onClick={() => setExpandedAttr(isExpanded ? null : attr.id)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div style={styles.attributeInfo}>
                      <span style={styles.attributeName}>{attr.name}</span>
                      <span style={styles.attributeDesc}>{values.length} values</span>
                    </div>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteAttribute(attr.id)}
                      title="Delete attribute"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4h10M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M12 4v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={styles.valuesSection}>
                      <div style={styles.valuesList}>
                        {values.map((value) => (
                          <div key={value.id} style={styles.valueChip}>
                            <span>{value.name}</span>
                            <button
                              style={styles.valueDeleteBtn}
                              onClick={() => handleDeleteValue(value.id)}
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={styles.addValueRow}>
                        <input
                          type="text"
                          placeholder="Add a value..."
                          value={newValueName}
                          onChange={(e) => setNewValueName(e.target.value)}
                          style={styles.addValueInput}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddValue(attr.id);
                            }
                          }}
                        />
                        <Button
                          appearance="subtle"
                          onClick={() => handleAddValue(attr.id)}
                          isDisabled={!newValueName.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Attribute */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Add New Attribute</h3>
        <div style={styles.addAttributeForm}>
          <input
            type="text"
            placeholder="Attribute name (e.g., Work Type)"
            value={newAttributeName}
            onChange={(e) => setNewAttributeName(e.target.value)}
            style={styles.addInput}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newAttributeDesc}
            onChange={(e) => setNewAttributeDesc(e.target.value)}
            style={styles.addInput}
          />
          <Button
            appearance="primary"
            onClick={() => handleAddAttribute(newAttributeName, newAttributeDesc)}
            isDisabled={!newAttributeName.trim()}
          >
            Add Attribute
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Suggested Attributes</h3>
        <p style={styles.sectionDesc}>Click to add with pre-filled values</p>
        <div style={styles.suggestionsGrid}>
          {SUGGESTED_ATTRIBUTES.filter(
            (s) => !customAttributes.some((a) => a.name.toLowerCase() === s.name.toLowerCase())
          ).map((suggestion) => (
            <button
              key={suggestion.name}
              style={styles.suggestionCard}
              onClick={() => handleAddAttribute(suggestion.name, suggestion.description, suggestion.values)}
            >
              <span style={styles.suggestionName}>{suggestion.name}</span>
              <span style={styles.suggestionValues}>{suggestion.values.join(', ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  intro: {
    marginBottom: '8px',
  },
  introText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    textAlign: 'center',
  },
  emptyText: {
    margin: '12px 0 4px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
  },
  emptyDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#A5ADBA',
  },
  attributesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  attributeCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  attributeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
  },
  expandButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6B778C',
  },
  attributeInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  attributeName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  attributeDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  deleteButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6B778C',
    borderRadius: '4px',
  },
  valuesSection: {
    padding: '0 16px 16px 52px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  valuesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  valueChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    border: '1px solid #EBECF0',
    fontSize: '13px',
    color: '#172B4D',
  },
  valueDeleteBtn: {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6B778C',
    padding: 0,
  },
  addValueRow: {
    display: 'flex',
    gap: '8px',
  },
  addValueInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
  },
  addAttributeForm: {
    display: 'flex',
    gap: '12px',
  },
  addInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  suggestionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '2px dashed #EBECF0',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  suggestionName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6554C0',
  },
  suggestionValues: {
    fontSize: '12px',
    color: '#6B778C',
  },
};

export default TeamAttributesStep3CustomAttrs;
