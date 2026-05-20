import * as React from 'react';
import styles from './ErrorState.module.scss';

export interface ErrorStateProps {
  title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = 'Unable to load data.' }) => (
  <div className={styles.state}>{title}</div>
);
