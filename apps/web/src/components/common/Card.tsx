import React, { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  children: ReactNode;
  isLoading?: boolean;
}

const Card: React.FC<CardProps> = ({ title, children, isLoading }) => {
  const cardClassName = isLoading
    ? `${styles.card} ${styles.loading}`
    : styles.card;

  return (
    <div className={cardClassName}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
