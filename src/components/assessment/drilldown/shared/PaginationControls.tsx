import React from 'react';
import ChevronLeftIcon from '@atlaskit/icon/glyph/chevron-left';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'items',
}) => {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return (
      <div style={styles.container}>
        <span style={styles.info}>
          Showing {totalItems} {itemLabel}
        </span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <span style={styles.info}>
        Showing {startIndex}-{endIndex} of {totalItems} {itemLabel}
      </span>

      <div style={styles.controls}>
        <button
          style={{
            ...styles.pageButton,
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          }}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon label="" size="small" primaryColor="#42526E" />
        </button>

        {/* Page numbers */}
        <div style={styles.pageNumbers}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              // Show first, last, and pages around current
              if (page === 1 || page === totalPages) return true;
              if (Math.abs(page - currentPage) <= 1) return true;
              return false;
            })
            .reduce<(number | string)[]>((acc, page, idx, arr) => {
              // Add ellipsis between non-consecutive pages
              if (idx > 0) {
                const prevPage = arr[idx - 1];
                if (typeof prevPage === 'number' && page - prevPage > 1) {
                  acc.push('...');
                }
              }
              acc.push(page);
              return acc;
            }, [])
            .map((item, idx) => {
              if (item === '...') {
                return (
                  <span key={`ellipsis-${idx}`} style={styles.ellipsis}>
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={item}
                  style={{
                    ...styles.pageNumber,
                    backgroundColor: item === currentPage ? '#0052CC' : '#FFFFFF',
                    color: item === currentPage ? '#FFFFFF' : '#42526E',
                  }}
                  onClick={() => onPageChange(item as number)}
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? 'page' : undefined}
                >
                  {item}
                </button>
              );
            })}
        </div>

        <button
          style={{
            ...styles.pageButton,
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          }}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon label="" size="small" primaryColor="#42526E" />
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#FAFBFC',
    borderTop: '1px solid #EBECF0',
    borderRadius: '0 0 8px 8px',
  },
  info: {
    fontSize: '13px',
    color: '#6B778C',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  pageButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pageNumbers: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    margin: '0 8px',
  },
  pageNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    padding: '0 8px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  ellipsis: {
    padding: '0 4px',
    color: '#6B778C',
  },
};

export default PaginationControls;
