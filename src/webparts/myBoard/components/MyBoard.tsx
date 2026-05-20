import * as React from 'react';
import { EmptyState } from '../../../common/components/EmptyState/EmptyState';
import { ErrorState } from '../../../common/components/ErrorState/ErrorState';
import { LoadingState } from '../../../common/components/LoadingState/LoadingState';
import { PageHeader } from '../../../common/components/PageHeader/PageHeader';
import { StatusBadge } from '../../../common/components/StatusBadge/StatusBadge';
import { UserAvatar } from '../../../common/components/UserAvatar/UserAvatar';
import { useBoard } from '../../../common/hooks/useBoard';
import styles from './MyBoard.module.scss';

export const MyBoard: React.FC = () => {
  const { data, isLoading, isError } = useBoard();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return <ErrorState title="My Board is unavailable." />;
  }

  return (
    <section className={styles.board}>
      <PageHeader title="My Board" description="Assigned operational work grouped by lifecycle state." />
      <div className={styles.columns}>
        {data.map((column) => (
          <section className={styles.column} key={column.id}>
            <header className={styles.columnHeader}>
              <StatusBadge status={column.id} />
              <span className={styles.count}>{column.tickets.length}</span>
            </header>
            {column.tickets.length === 0 ? (
              <EmptyState message="No assigned work." />
            ) : (
              column.tickets.map((ticket) => (
                <article className={styles.card} key={ticket.id}>
                  <div className={styles.ticket}>{ticket.ticketNumber}</div>
                  <div className={styles.subject}>{ticket.subject}</div>
                  <div className={styles.footer}>
                    <UserAvatar user={ticket.assignedTo} showName={false} />
                    <span className={styles.priority}>{ticket.priority}</span>
                  </div>
                </article>
              ))
            )}
          </section>
        ))}
      </div>
    </section>
  );
};
