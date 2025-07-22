import React, { useRef, useCallback } from 'react';
import { Button } from 'react-aria-components';
import styles from './ActionBar.module.css';

/**
 * ActionBar component with upload and clear functionality
 * Features: File upload with multipart/form-data POST, clear sources action
 * Accessibility: Proper ARIA labels and keyboard navigation
 */

interface ActionBarProps {
  onUploadFiles?: (files: FileList) => void;
  onClearSources?: () => void;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = React.memo(({
  onUploadFiles,
  onClearSources,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUploadFiles?.(files);
      // Reset the input to allow selecting the same files again
      event.target.value = '';
    }
  }, [onUploadFiles]);

  const handleClearClick = useCallback(() => {
    onClearSources?.();
  }, [onClearSources]);

  return (
    <div className={`${styles.actionBar} ${className}`} role="toolbar" aria-label="File actions">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={handleFileChange}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
      />
      
      <Button
        onPress={handleUploadClick}
        className={styles.actionButton}
        aria-label="Upload files"
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,5 17,10" />
          <line x1="12" y1="5" x2="12" y2="15" />
        </svg>
        Upload Files
      </Button>

      <Button
        onPress={handleClearClick}
        className={styles.actionButton}
        aria-label="Clear all sources"
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3,6 5,6 21,6" />
          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
        Clear All Sources
      </Button>
    </div>
  );
});

ActionBar.displayName = 'ActionBar';

export default ActionBar;
