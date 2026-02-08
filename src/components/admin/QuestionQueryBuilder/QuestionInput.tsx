import React, { useRef, useEffect } from 'react';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  showSuggestions?: boolean;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  value,
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = 'Ask a question about your teams...',
  isLoading = false,
  showSuggestions = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
    // Escape to clear input
    if (e.key === 'Escape') {
      onChange('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.inputWrapper,
        ...(showSuggestions ? styles.inputWrapperActive : {}),
      }}>
        {/* Search Icon */}
        <div style={styles.searchIcon}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
              stroke="#6B778C"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          style={styles.input}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            style={styles.clearButton}
            type="button"
            tabIndex={-1}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="#6B778C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Run Button */}
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          style={{
            ...styles.runButton,
            ...(value.trim() && !isLoading ? styles.runButtonEnabled : {}),
          }}
          type="button"
        >
          {isLoading ? (
            <span style={styles.loadingSpinner}>...</span>
          ) : (
            'Run'
          )}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px 8px 16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  inputWrapperActive: {
    borderColor: '#0052CC',
    boxShadow: '0 0 0 2px rgba(0, 82, 204, 0.1)',
  },
  searchIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    fontWeight: 500,
    color: '#172B4D',
    backgroundColor: 'transparent',
    padding: '8px 0',
    minWidth: 0,
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.15s ease',
  },
  runButton: {
    padding: '10px 20px',
    backgroundColor: '#DFE1E6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#97A0AF',
    cursor: 'not-allowed',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
  runButtonEnabled: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '20px',
    textAlign: 'center' as const,
  },
};

export default QuestionInput;
