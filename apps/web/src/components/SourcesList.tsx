import React from 'react'
import { Heading } from 'react-aria-components'
import { useSources } from '../hooks/useSourcesApi'
import styles from './SourcesList.module.css'
import { SourceFile } from "../types.ts";

const SourcesList: React.FC = () => {
  const { data, isLoading, isError, error } = useSources()
  const sources = data?.files

  const handleDownload = (source: SourceFile) => {
    // Create a link to download the file
    const downloadUrl = source.downloadUrl;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', source.filename);
    
    // For direct download without opening in a new tab
    // Alternatively, you could use window.open(downloadUrl, '_blank') to open in a new tab
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading sources...</div>
  }

  if (isError) {
    return <div className={styles.error}>Error: {(error as Error)?.message || 'Failed to load sources'}</div>
  }

  if (!sources || sources.length === 0) {
    return <div className={styles.empty}>No sources available</div>
  }

  return (
    <div className={styles.container}>
      <Heading level={2}>Sources</Heading>
      <ul className={styles.list}>
        {sources.map((source: SourceFile) => (
          <li 
            key={source.filename} 
            className={styles.item}
            onClick={() => handleDownload(source)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.title}>{source.filename}</div>
            <div className={styles.content}>{source.lastModified}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SourcesList
