import * as React from 'react';
import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => <div className={styles.state}>{message}</div>;
