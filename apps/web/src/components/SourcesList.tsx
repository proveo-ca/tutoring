import React, { useState } from 'react'
import { useSources, useDownloadSource } from '../hooks/useSourcesApi'
import styles from './SourcesList.module.css'
import { SourceFile } from "../types.ts";
import { Loading } from "./common/Loading.tsx";
import Spoiler from "./common/Spoiler.tsx";

const SourcesList: React.FC = () => {
  const { data, isLoading, isError, error } = useSources()
  const { mutate: downloadFile, isPending: isDownloading } = useDownloadSource()
  const sources = data?.files
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null)

  const handleDownload = (source: SourceFile) => {
    setDownloadingFile(source.filename)
    downloadFile(source.filename, {
      onSettled: () => {
        setDownloadingFile(null)
      }
    })
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
    <Spoiler title={"Sources"}>
      <ul className={styles.list}>
        {sources.map((source: SourceFile) => (
          <li
            key={source.filename}
            className={styles.item}
            onClick={() => handleDownload(source)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.title}>{source.filename}</span>
            <span className={styles.content}>Last Modified: {source.lastModified}</span>
            {isDownloading && downloadingFile === source.filename && <Loading />}
          </li>
        ))}
      </ul>
    </Spoiler>
  )
}

export default SourcesList
