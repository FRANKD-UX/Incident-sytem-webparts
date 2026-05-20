import * as React from 'react';
import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <header className={styles.header}>
    <div>
      <h2 className={styles.title}>{title}</h2>
      {description && <div className={styles.description}>{description}</div>}
    </div>
    {actions}
  </header>
);
