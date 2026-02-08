// ImpactFlowDiagram Component
// Shows flow: OUTCOMES → DIMENSIONS → INDICATORS (left to right)
// Click to lock highlighting, shows math on connectors, click connector for details

import React, { useState, useMemo } from 'react';
import { ImpactFlow, ImpactFlowNode, ImpactFlowLink } from '../../../types/impactMeasurement';
import EditorOpenIcon from '@atlaskit/icon/glyph/editor/open';

interface ImpactFlowDiagramProps {
  flow: ImpactFlow;
  onNavigate?: (type: 'indicator' | 'dimension' | 'outcome', id: string) => void;
}

interface LinkExplanation {
  sourceName: string;
  targetName: string;
  sourceValue: number;
  targetValue: number;
  weight: number;
  contribution: number;
  formula: string;
}

export const ImpactFlowDiagram: React.FC<ImpactFlowDiagramProps> = ({
  flow,
  onNavigate,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<LinkExplanation | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<Set<string>>(new Set());

  // Group nodes by type - reversed order for display
  const { outcomes, dimensions, indicators } = useMemo(() => ({
    outcomes: flow.nodes.filter(n => n.type === 'outcome'),
    dimensions: flow.nodes.filter(n => n.type === 'dimension'),
    indicators: flow.nodes.filter(n => n.type === 'indicator'),
  }), [flow.nodes]);

  // Calculate edge weights for ALL links in the highlighted path (full chain)
  const edgeLabels = useMemo(() => {
    if (!selectedNode || highlightedPath.size === 0) return new Map<string, { weight: number; contribution: number }>();

    const labels = new Map<string, { weight: number; contribution: number }>();

    // Find all links that are in the highlighted path
    flow.links.forEach(link => {
      const linkKey = `${link.source}-${link.target}`;
      if (highlightedPath.has(`link-${linkKey}`)) {
        const sourceNode = flow.nodes.find(n => n.id === link.source);
        if (sourceNode) {
          // Use the actual weight from the link if available, otherwise estimate
          const weight = link.weight ?? Math.min(0.5, Math.max(0.1, link.value / Math.max(1, Math.abs(sourceNode.impactValue))));
          const contribution = Math.round(sourceNode.impactValue * weight * 10) / 10;
          labels.set(linkKey, { weight, contribution });
        }
      }
    });

    return labels;
  }, [selectedNode, highlightedPath, flow.nodes, flow.links]);

  // Build path when node is clicked
  const handleNodeClick = (nodeId: string) => {
    if (selectedNode === nodeId) {
      setSelectedNode(null);
      setHighlightedPath(new Set());
      return;
    }

    setSelectedNode(nodeId);
    setSelectedLink(null);

    const pathNodes = new Set<string>();
    const pathLinks = new Set<string>();

    const findAncestors = (id: string) => {
      pathNodes.add(id);
      const node = flow.nodes.find(n => n.id === id);
      if (node) {
        node.parentIds.forEach(parentId => {
          pathLinks.add(`${parentId}-${id}`);
          findAncestors(parentId);
        });
      }
    };

    const findDescendants = (id: string) => {
      pathNodes.add(id);
      const node = flow.nodes.find(n => n.id === id);
      if (node) {
        node.childIds.forEach(childId => {
          pathLinks.add(`${id}-${childId}`);
          findDescendants(childId);
        });
      }
    };

    findAncestors(nodeId);
    findDescendants(nodeId);

    const allPaths = Array.from(pathNodes).concat(Array.from(pathLinks).map(l => `link-${l}`));
    setHighlightedPath(new Set(allPaths));
  };

  // Handle click on edge label to show detailed explanation
  const handleEdgeLabelClick = (link: ImpactFlowLink, e: React.MouseEvent) => {
    e.stopPropagation();

    const sourceNode = flow.nodes.find(n => n.id === link.source);
    const targetNode = flow.nodes.find(n => n.id === link.target);

    if (sourceNode && targetNode) {
      // Use actual weight from link data if available
      const weight = link.weight ?? Math.min(0.5, Math.max(0.1, link.value / Math.max(1, Math.abs(sourceNode.impactValue))));
      const contribution = Math.round(sourceNode.impactValue * weight * 10) / 10;

      setSelectedLink({
        sourceName: sourceNode.name,
        targetName: targetNode.name,
        sourceValue: sourceNode.impactValue,
        targetValue: targetNode.impactValue,
        weight,
        contribution,
        formula: `${sourceNode.name} (${sourceNode.impactValue >= 0 ? '+' : ''}${sourceNode.impactValue.toFixed(1)}) × ${(weight * 100).toFixed(0)}% weight = ${contribution >= 0 ? '+' : ''}${contribution.toFixed(1)} contribution to ${targetNode.name}`,
      });
    }
  };

  // Clear selection when clicking background
  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setSelectedLink(null);
    setHighlightedPath(new Set());
  };

  if (flow.nodes.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>IMPACT FLOW</h3>
          <p style={styles.subtitle}>How changes cascade from outcomes through dimensions to indicators</p>
        </div>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No impact flow data available yet.</p>
        </div>
      </div>
    );
  }

  // Layout - bigger cards, full width
  const containerWidth = 1000;
  const columnWidth = 220;
  const nodeHeight = 90;
  const nodeSpacing = 14;
  const padding = 40;
  const columnGap = (containerWidth - 3 * columnWidth - 2 * padding) / 2;

  const getColumnX = (col: number) => padding + col * (columnWidth + columnGap);
  const getNodeY = (index: number, total: number, maxHeight: number) => {
    const totalHeight = total * nodeHeight + (total - 1) * nodeSpacing;
    const startY = Math.max(0, (maxHeight - totalHeight) / 2);
    return startY + index * (nodeHeight + nodeSpacing);
  };

  // Calculate dimensions
  const maxOutcomes = Math.min(outcomes.length, 4);
  const maxDimensions = Math.min(dimensions.length, 5);
  const maxIndicators = Math.min(indicators.length, 6);
  const maxItems = Math.max(maxOutcomes, maxDimensions, maxIndicators);
  const contentHeight = Math.max(400, maxItems * (nodeHeight + nodeSpacing) + padding * 2);

  // Create node positions
  const nodePositions = new Map<string, { x: number; y: number }>();

  outcomes.slice(0, maxOutcomes).forEach((node, i) => {
    nodePositions.set(node.id, {
      x: getColumnX(0),
      y: getNodeY(i, maxOutcomes, contentHeight - padding * 2) + padding
    });
  });
  dimensions.slice(0, maxDimensions).forEach((node, i) => {
    nodePositions.set(node.id, {
      x: getColumnX(1),
      y: getNodeY(i, maxDimensions, contentHeight - padding * 2) + padding
    });
  });
  indicators.slice(0, maxIndicators).forEach((node, i) => {
    nodePositions.set(node.id, {
      x: getColumnX(2),
      y: getNodeY(i, maxIndicators, contentHeight - padding * 2) + padding
    });
  });

  return (
    <div style={styles.container} onClick={handleBackgroundClick}>
      {/* Header with title and explanation */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h3 style={styles.title}>IMPACT FLOW</h3>
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#36B37E' }} />
              <span>Improved</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#FF5630' }} />
              <span>Declined</span>
            </div>
          </div>
        </div>
        {selectedNode ? (
          <div style={styles.focusModeBox}>
            <div style={styles.focusModeMain}>
              <span style={styles.focusModeIcon}>🔍</span>
              <div style={styles.focusModeContent}>
                <span style={styles.focusModeTitle}>Focus Mode Active</span>
                <span style={styles.focusModeDesc}>
                  Arrow labels show <strong>point contributions</strong> — how much each source added to its target. Tap a number for the math breakdown.
                </span>
              </div>
            </div>
            <button
              style={styles.exitFocusButton}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(null);
                setHighlightedPath(new Set());
              }}
            >
              ✕ Exit focus
            </button>
          </div>
        ) : (
          <div style={styles.hintBox}>
            <span style={styles.hintIcon}>👆</span>
            <span style={styles.hintText}>
              <strong>Try it:</strong> Click any card to see its influence chain and point contributions
            </span>
          </div>
        )}
      </div>

      {/* Column Headers */}
      <div style={styles.columnHeadersRow}>
        <div style={styles.columnHeaderItem}>
          <span style={styles.columnLabel}>OUTCOMES</span>
          <span style={styles.columnDesc}>Business questions we answer</span>
        </div>
        <div style={styles.columnHeaderItem}>
          <span style={styles.columnLabel}>DIMENSIONS</span>
          <span style={styles.columnDesc}>Composite health scores</span>
        </div>
        <div style={styles.columnHeaderItem}>
          <span style={styles.columnLabel}>INDICATORS</span>
          <span style={styles.columnDesc}>What we actually measure</span>
        </div>
      </div>

      {/* Diagram Area */}
      <div style={{ ...styles.diagramArea, height: contentHeight, width: containerWidth, margin: '0 auto' }} onClick={e => e.stopPropagation()}>
        {/* SVG for connection lines */}
        <svg width={containerWidth} height={contentHeight} style={{ ...styles.svg, left: 0, transform: 'none' }}>
          <defs>
            {/* Glow filter for highlighted paths */}
            <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Draw connections with arrows - flow: Indicators → Dimensions → Outcomes (right to left) */}
          {flow.links.map((link, idx) => {
            // Source is the upstream node (indicator or dimension), target is downstream
            const sourcePos = nodePositions.get(link.source);
            const targetPos = nodePositions.get(link.target);
            if (!sourcePos || !targetPos) return null;

            const linkKey = `${link.source}-${link.target}`;
            const isInPath = highlightedPath.has(`link-${linkKey}`);
            const edgeLabel = edgeLabels.get(linkKey);

            const sourceNode = flow.nodes.find(n => n.id === link.source);
            const isPositive = sourceNode ? sourceNode.impactValue >= 0 : true;

            // Arrow goes from source (indicator/dimension) to target (dimension/outcome)
            // Flow: Indicators (right) → Dimensions (middle) → Outcomes (left)
            const startX = sourcePos.x; // Left edge of source card
            const startY = sourcePos.y + nodeHeight / 2;
            const endX = targetPos.x + columnWidth; // Right edge of target card
            const endY = targetPos.y + nodeHeight / 2;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            // Arrow head points LEFT (toward target)
            const arrowSize = isInPath ? 10 : 7;
            const arrowColor = isInPath ? (isPositive ? '#36B37E' : '#FF5630') : '#C1C7D0';
            const lineOpacity = selectedNode ? (isInPath ? 1 : 0.15) : 0.6;

            return (
              <g key={`link-${idx}`}>
                {/* Glow for highlighted */}
                {isInPath && (
                  <path
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX + arrowSize} ${endY}`}
                    fill="none"
                    stroke={isPositive ? '#36B37E' : '#FF5630'}
                    strokeWidth={6}
                    opacity={0.2}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Main curved line */}
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX + arrowSize} ${endY}`}
                  fill="none"
                  stroke={arrowColor}
                  strokeWidth={isInPath ? 2.5 : 1.5}
                  opacity={lineOpacity}
                  style={{ transition: 'all 0.25s ease', pointerEvents: 'none' }}
                />
                {/* Arrow head - triangle pointing LEFT */}
                <polygon
                  points={`${endX + arrowSize},${endY - arrowSize/2} ${endX + arrowSize},${endY + arrowSize/2} ${endX},${endY}`}
                  fill={arrowColor}
                  opacity={lineOpacity}
                  style={{ transition: 'all 0.25s ease' }}
                />
                {/* Text label along the line - rotated to follow path direction */}
                {isInPath && edgeLabel && (() => {
                  // Calculate angle from path direction (end - start)
                  const dx = endX - startX;
                  const dy = endY - startY;
                  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                  // Keep text readable (not upside down)
                  if (angle > 90) angle -= 180;
                  if (angle < -90) angle += 180;

                  const labelText = `${edgeLabel.contribution >= 0 ? '+' : ''}${edgeLabel.contribution.toFixed(1)} pts`;

                  return (
                    <g
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => handleEdgeLabelClick(link, e)}
                      transform={`translate(${midX}, ${midY})`}
                    >
                      {/* Background for readability */}
                      <text
                        transform={`rotate(${angle})`}
                        textAnchor="middle"
                        dy={-6}
                        fontSize={10}
                        fontWeight={700}
                        fill="#FFFFFF"
                        stroke="#FFFFFF"
                        strokeWidth={3}
                        style={{ pointerEvents: 'none' }}
                      >
                        {labelText}
                      </text>
                      {/* Foreground text */}
                      <text
                        transform={`rotate(${angle})`}
                        textAnchor="middle"
                        dy={-6}
                        fontSize={10}
                        fontWeight={700}
                        fill={isPositive ? '#006644' : '#BF2600'}
                      >
                        {labelText}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* Render nodes - fade non-connected ones when a node is selected */}
        {outcomes.slice(0, maxOutcomes).map((node) => (
          <FlowNode
            key={node.id}
            node={node}
            pos={nodePositions.get(node.id)!}
            width={columnWidth}
            height={nodeHeight}
            isSelected={selectedNode === node.id}
            isInPath={highlightedPath.has(node.id)}
            isFaded={!!selectedNode && !highlightedPath.has(node.id)}
            onClick={() => handleNodeClick(node.id)}
            onNavigate={onNavigate ? () => onNavigate('outcome', node.id.replace('outcome-', '')) : undefined}
          />
        ))}
        {dimensions.slice(0, maxDimensions).map((node) => (
          <FlowNode
            key={node.id}
            node={node}
            pos={nodePositions.get(node.id)!}
            width={columnWidth}
            height={nodeHeight}
            isSelected={selectedNode === node.id}
            isInPath={highlightedPath.has(node.id)}
            isFaded={!!selectedNode && !highlightedPath.has(node.id)}
            onClick={() => handleNodeClick(node.id)}
            onNavigate={onNavigate ? () => onNavigate('dimension', node.id.replace('dimension-', '')) : undefined}
          />
        ))}
        {indicators.slice(0, maxIndicators).map((node) => (
          <FlowNode
            key={node.id}
            node={node}
            pos={nodePositions.get(node.id)!}
            width={columnWidth}
            height={nodeHeight}
            isSelected={selectedNode === node.id}
            isInPath={highlightedPath.has(node.id)}
            isFaded={!!selectedNode && !highlightedPath.has(node.id)}
            onClick={() => handleNodeClick(node.id)}
            onNavigate={onNavigate ? () => onNavigate('indicator', node.id.replace('indicator-', '')) : undefined}
          />
        ))}

      </div>

      {/* Link Explanation Modal */}
      {selectedLink && (
        <div style={styles.modalOverlay} onClick={() => setSelectedLink(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Contribution Breakdown</span>
              <button style={styles.closeButton} onClick={() => setSelectedLink(null)}>×</button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.flowDescription}>
                <span style={styles.flowFrom}>{selectedLink.sourceName}</span>
                <span style={styles.flowArrow}>→</span>
                <span style={styles.flowTo}>{selectedLink.targetName}</span>
              </div>
              <div style={styles.formulaCard}>
                <div style={styles.formulaSection}>
                  <span style={styles.formulaSectionLabel}>Source Change</span>
                  <span style={styles.formulaSectionValue}>
                    {selectedLink.sourceValue >= 0 ? '+' : ''}{selectedLink.sourceValue.toFixed(1)} pts
                  </span>
                </div>
                <div style={styles.formulaOperator}>×</div>
                <div style={styles.formulaSection}>
                  <span style={styles.formulaSectionLabel}>Weight</span>
                  <span style={styles.formulaSectionValue}>{(selectedLink.weight * 100).toFixed(0)}%</span>
                </div>
                <div style={styles.formulaOperator}>=</div>
                <div style={{
                  ...styles.formulaSection,
                  backgroundColor: selectedLink.contribution >= 0 ? '#E3FCEF' : '#FFEBE6'
                }}>
                  <span style={styles.formulaSectionLabel}>Contribution</span>
                  <span style={{
                    ...styles.formulaSectionValue,
                    color: selectedLink.contribution >= 0 ? '#006644' : '#BF2600',
                    fontSize: 18
                  }}>
                    {selectedLink.contribution >= 0 ? '+' : ''}{selectedLink.contribution.toFixed(1)} pts
                  </span>
                </div>
              </div>
              <p style={styles.formulaExplanation}>
                <strong>{selectedLink.sourceName}</strong> changed by{' '}
                <strong>{selectedLink.sourceValue >= 0 ? '+' : ''}{selectedLink.sourceValue.toFixed(1)} points</strong>.
                Since it has a <strong>{(selectedLink.weight * 100).toFixed(0)}% weight</strong> in determining{' '}
                <strong>{selectedLink.targetName}</strong>, it contributed{' '}
                <strong>{selectedLink.contribution >= 0 ? '+' : ''}{selectedLink.contribution.toFixed(1)} points</strong> to that score.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

interface FlowNodeProps {
  node: ImpactFlowNode;
  pos: { x: number; y: number };
  width: number;
  height: number;
  isSelected: boolean;
  isInPath: boolean;
  isFaded: boolean;  // True when another node is selected and this one is NOT in the path
  onClick: () => void;
  onNavigate?: () => void;
}

const FlowNode: React.FC<FlowNodeProps> = ({
  node,
  pos,
  width,
  height,
  isSelected,
  isInPath,
  isFaded,
  onClick,
  onNavigate,
}) => {
  const isPositive = node.impactValue >= 0;
  const isHighlighted = isSelected || isInPath;

  // Generate mock before/after values for indicators if not present
  const beforeValue = node.beforeValue ?? Math.round(50 - node.impactValue * 0.8);
  const afterValue = node.afterValue ?? Math.round(50 + node.impactValue * 0.2);

  const getNodeStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width,
      height,
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      boxSizing: 'border-box',
      opacity: isFaded ? 0.25 : 1,
    };

    if (isSelected) {
      return {
        ...base,
        opacity: 1,
        backgroundColor: isPositive ? '#E3FCEF' : '#FFEBE6',
        border: `2px solid ${isPositive ? '#00875A' : '#DE350B'}`,
        boxShadow: `0 4px 16px ${isPositive ? 'rgba(0, 135, 90, 0.25)' : 'rgba(222, 53, 11, 0.25)'}`,
        zIndex: 20,
      };
    }

    if (isInPath) {
      return {
        ...base,
        opacity: 1,
        backgroundColor: isPositive ? '#F1FDF7' : '#FFF5F3',
        border: `2px solid ${isPositive ? '#57D9A3' : '#FF8F73'}`,
        boxShadow: `0 2px 8px ${isPositive ? 'rgba(54, 179, 126, 0.15)' : 'rgba(255, 86, 48, 0.15)'}`,
        zIndex: 10,
      };
    }

    return {
      ...base,
      backgroundColor: '#FFFFFF',
      border: '1px solid #DFE1E6',
      boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
      zIndex: 1,
    };
  };

  const formatImpact = (): string => {
    const sign = node.impactValue >= 0 ? '+' : '';
    const decimals = node.type === 'indicator' ? 0 : 1;
    const unit = node.type === 'indicator' ? '%' : ' pts';
    return `${sign}${node.impactValue.toFixed(decimals)}${unit}`;
  };

  const handleNavigateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) onNavigate();
  };

  return (
    <div style={getNodeStyle()} onClick={onClick}>
      {/* Top row: name and navigate button */}
      <div style={nodeStyles.topRow}>
        <span style={{
          ...nodeStyles.name,
          color: isHighlighted ? (isPositive ? '#006644' : '#BF2600') : '#172B4D',
        }}>
          {node.name}
        </span>
        {onNavigate && (
          <button
            style={nodeStyles.navButton}
            onClick={handleNavigateClick}
            title={`View ${node.type} details`}
          >
            <EditorOpenIcon label="Open" size="small" primaryColor="#6B778C" />
          </button>
        )}
      </div>

      {/* Middle row: before → after (for all node types) */}
      <span style={nodeStyles.beforeAfter}>
        {Math.round(beforeValue)} → {Math.round(afterValue)}
      </span>

      {/* Bottom row: impact badge */}
      <span style={{
        ...nodeStyles.impact,
        color: isPositive ? '#006644' : '#BF2600',
        backgroundColor: isPositive ? 'rgba(0, 102, 68, 0.1)' : 'rgba(191, 38, 0, 0.1)',
      }}>
        {formatImpact()}
      </span>
    </div>
  );
};

const nodeStyles: Record<string, React.CSSProperties> = {
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.3,
    flex: 1,
  },
  navButton: {
    background: 'none',
    border: 'none',
    padding: 2,
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    flexShrink: 0,
  },
  beforeAfter: {
    fontSize: 12,
    color: '#6B778C',
  },
  impact: {
    fontSize: 13,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #F4F5F7',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: 0,
  },
  hintBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    backgroundColor: '#DEEBFF',
    borderRadius: 8,
    border: '1px solid #B3D4FF',
  },
  hintIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  hintText: {
    fontSize: 13,
    color: '#0747A6',
    lineHeight: 1.4,
    margin: 0,
  },
  focusModeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '10px 14px',
    backgroundColor: '#E3FCEF',
    borderRadius: 8,
    border: '1px solid #ABF5D1',
  },
  focusModeMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  focusModeIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  focusModeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  focusModeTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#006644',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  focusModeDesc: {
    fontSize: 13,
    color: '#006644',
    lineHeight: 1.4,
  },
  exitFocusButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #ABF5D1',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#006644',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  legend: {
    display: 'flex',
    gap: 16,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#6B778C',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  columnHeadersRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px 40px',
    borderBottom: '1px solid #F4F5F7',
    backgroundColor: '#FAFBFC',
  },
  columnHeaderItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  columnLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  columnDesc: {
    fontSize: 11,
    color: '#8993A4',
  },
  diagramArea: {
    position: 'relative',
    minHeight: 400,
  },
  svg: {
    position: 'absolute',
    top: 0,
    // Allow pointer events on SVG elements that need them (edge labels)
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B778C',
    margin: 0,
  },
  // Modal styles
  modalOverlay: {
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
    borderRadius: 12,
    maxWidth: 500,
    width: '90%',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#6B778C',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  modalContent: {
    padding: 20,
  },
  formulaCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  formulaSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    minWidth: 100,
  },
  formulaSectionLabel: {
    fontSize: 11,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  formulaSectionValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
  },
  formulaOperator: {
    fontSize: 20,
    fontWeight: 600,
    color: '#6B778C',
  },
  formulaExplanation: {
    fontSize: 13,
    color: '#5E6C84',
    lineHeight: 1.6,
    margin: 0,
    padding: '12px 16px',
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
  },
  flowDescription: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
  },
  flowFrom: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
  },
  flowArrow: {
    fontSize: 18,
    color: '#6B778C',
  },
  flowTo: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
  },
};

export default ImpactFlowDiagram;
