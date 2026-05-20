import * as React from 'react';
import styles from './LoadingState.module.scss';

export const LoadingState: React.FC = () => (
  <div className={styles.state}>
    <span className={styles.spinner} />
    Loading operational data
  </div>
);
