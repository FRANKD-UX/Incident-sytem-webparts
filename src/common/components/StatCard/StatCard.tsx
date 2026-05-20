import * as React from 'react';
import styles from './StatCard.module.scss';

export type StatTone = 'default' | 'open' | 'pending' | 'escalated' | 'closed';

export interface StatCardProps {
  label: string;
  value: number;
  tone?: StatTone;
}

const toneClass: Record<StatTone, string> = {
  default: '',
  open: styles.open,
  pending: styles.pending,
  escalated: styles.escalated,
  closed: styles.closed
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, tone = 'default' }) => (
  <section className={`${styles.card} ${styles.accent} ${toneClass[tone]}`}>
    <div className={styles.label}>{label}</div>
    <div className={styles.value}>{value.toLocaleString('en-ZA')}</div>
  </section>
);
