import React from 'react'
import { Heading } from 'react-aria-components'
import SourcesList from '../components/SourcesList'
import styles from './RagPage.module.css'
import RagForm from "../components/RagForm.tsx";

const RagPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <Heading level={1}>Tutoring</Heading>
      <RagForm />
      <SourcesList />
    </div>
  )
}

export default RagPage
