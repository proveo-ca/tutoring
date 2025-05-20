import React from 'react';
import ReactMarkdown from 'react-markdown';
import Spoiler from "./common/Spoiler.tsx";

interface ContextCardProps {
  context?: string;
}

const ContextCard: React.FC<ContextCardProps> = ({context}) => {
  if (!context) {
    return null;
  }

  return <Spoiler title="Context">
    <ReactMarkdown>{context}</ReactMarkdown>
  </Spoiler>
};

export default ContextCard;
