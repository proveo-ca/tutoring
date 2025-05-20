import React, { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  direction = 'vertical',
  className = ''
}) => {
  const layoutClass = direction === 'vertical' 
    ? styles.vertical 
    : styles.horizontal;

  return (
    <div className={`${styles.layout} ${layoutClass} ${className}`}>
      {children}
    </div>
  );
};

export default Layout;
