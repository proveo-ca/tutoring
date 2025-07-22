import React from 'react';
import Card from './common/Card.tsx';

interface AnswerCardProps {
  answer?: string;
  context?: string;
  isLoading: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ answer, isLoading }) => {
  if (isLoading) {
    return <Card title="Answer" isLoading={true}>Processing your question...</Card>;
  }

  if (!answer) {
    return null;
  }

  return (
    <Card title="Answer">{answer}</Card>
  );
};

export default AnswerCard;
