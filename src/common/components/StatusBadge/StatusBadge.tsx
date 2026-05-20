import * as React from 'react';
import { TicketStatus } from '../../../models/Ticket';
import styles from './StatusBadge.module.scss';

export interface StatusBadgeProps {
  status: TicketStatus;
}

const statusClass: Record<TicketStatus, string> = {
  Open: styles.open,
  Pending: styles.pending,
  Escalated: styles.escalated,
  Closed: styles.closed
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`${styles.badge} ${statusClass[status]}`}>
    <span className={styles.dot} />
    {status}
  </span>
);
