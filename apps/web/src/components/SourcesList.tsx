import React from 'react'
import { Heading } from 'react-aria-components'
import { useSources } from '../hooks/useSourcesApi'
import styles from './SourcesList.module.css'
import { SourceFile } from "../types.ts";

const SourcesList: React.FC = () => {
  const { data, isLoading, isError, error } = useSources()
  const sources = data?.files

  // No need for a download handler when using anchor tags with proper attributes

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
          <li key={source.filename} className={styles.item}>
            <a 
              href={source.downloadUrl}
              download={source.filename}
              className={styles.sourceLink}
            >
              <div className={styles.title}>{source.filename}</div>
              <div className={styles.content}>{source.lastModified}</div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SourcesList
