import React, { useCallback } from 'react'
import { Heading } from 'react-aria-components'
import SourcesList from '../components/SourcesList'
import ActionBar from '../components/ActionBar'
import styles from './RagPage.module.css'
import RagForm from "../components/RagForm.tsx";

const RagPage: React.FC = () => {
  const handleUploadFiles = useCallback(async (files: FileList) => {
    const formData = new FormData();
    
    // Add all selected files to the form data
    Array.from(files).forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      // TODO: Refresh sources list or show success message
    } catch (error) {
      console.error('Upload error:', error);
      // TODO: Show error message to user
    }
  }, []);

  const handleClearSources = useCallback(() => {
    // No-op as requested
    console.log('Clear sources clicked (no-op)');
  }, []);

  return (
    <div className={styles.container}>
      <Heading level={1}>Tutoring</Heading>
      <RagForm />
      <ActionBar 
        onUploadFiles={handleUploadFiles}
        onClearSources={handleClearSources}
      />
      <SourcesList />
    </div>
  )
}

export default RagPage
