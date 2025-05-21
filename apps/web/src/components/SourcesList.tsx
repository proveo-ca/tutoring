import React from 'react'
import { Heading } from 'react-aria-components'
import { useSources } from '../hooks/useSourcesApi'
import styles from './SourcesList.module.css'
import { SourceFile } from "../types.ts";

const SourcesList: React.FC = () => {
  const { data, isLoading, isError, error } = useSources()
  const sources = data?.files

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
            <div className={styles.title}>{source.filename}</div>
            <div className={styles.content}>{source.lastModified}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SourcesList
