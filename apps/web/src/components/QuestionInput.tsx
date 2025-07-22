import React from 'react'
import { TextField, Label, Input } from 'react-aria-components'
import styles from './QuestionInput.module.css'

interface QuestionInputProps {
  question?: string;
  onChange: (value: string) => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  onChange
}) => {
  return (
    <div className={styles.inputContainer}>
      <TextField className={styles.inputContainer}>
        <Label>Ask a question</Label>
        <Input
          value={question}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your question here..."
          className={styles.input}
        />
      </TextField>
    </div>
  )
}

export default QuestionInput
