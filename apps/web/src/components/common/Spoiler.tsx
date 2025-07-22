import React, { ReactNode } from 'react';
import styles from './Spoiler.module.css';

interface SpoilerProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Spoiler: React.FC<SpoilerProps> = ({ 
  title, 
  children, 
  defaultOpen = false 
}) => {
  return (
    <div className={styles.spoiler}>
      <input 
        type="checkbox" 
        className={styles.spoilerButton} 
        defaultChecked={defaultOpen}
        id={`spoiler-${title.replace(/\s+/g, '-').toLowerCase()}`}
      />
      <label 
        htmlFor={`spoiler-${title.replace(/\s+/g, '-').toLowerCase()}`} 
        className={styles.spoilerHead}
      >
        {title}
      </label>
      <div className={styles.spoilerBody}>
        {children}
      </div>
    </div>
  );
};

export default Spoiler;
