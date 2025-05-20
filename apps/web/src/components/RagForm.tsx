import React, { useState } from 'react'
import { Button } from 'react-aria-components'
import { useAskQuestion } from '../hooks/useSourcesApi'
import QuestionInput from './QuestionInput'
import AnswerCard from './AnswerCard'
import ContextCard from './ContextCard'
import Layout from './common/Layout'
import styles from './QuestionInput.module.css'

const RagForm: React.FC = () => {
  const [question, setQuestion] = useState<string>('')
  const { mutate: askQuestion, data, isPending, isError, error } = useAskQuestion()

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault()
    }

    if (question.trim()) {
      askQuestion({ question })
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <QuestionInput
          question={question}
          onChange={setQuestion}
        />
        <Button
          type="submit"
          isDisabled={isPending || !question?.trim()}
          className={styles.button}
          onPress={() => handleSubmit()}
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </form>

      {isError && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          {(error as Error)?.message || 'An error occurred'}
        </div>
      )}

      <Layout direction="vertical">
        <AnswerCard answer={data?.answer} isLoading={isPending} />
        <ContextCard context={data?.context} />
      </Layout>
    </>
  )
}

export default RagForm
