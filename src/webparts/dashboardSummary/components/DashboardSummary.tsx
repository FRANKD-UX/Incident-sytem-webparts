import * as React from 'react';
import { ErrorState } from '../../../common/components/ErrorState/ErrorState';
import { LoadingState } from '../../../common/components/LoadingState/LoadingState';
import { PageHeader } from '../../../common/components/PageHeader/PageHeader';
import { StatCard } from '../../../common/components/StatCard/StatCard';
import { useDashboardSummary } from '../../../common/hooks/useDashboardSummary';
import styles from './DashboardSummary.module.scss';

export const DashboardSummary: React.FC = () => {
  const { data, isLoading, isError } = useDashboardSummary();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return <ErrorState title="Dashboard summary is unavailable." />;
  }

  return (
    <section className={styles.dashboard}>
      <PageHeader title="Service health" description="Operational workload by current ticket state." />
      <div className={styles.grid}>
        <StatCard label="Open" value={data.open} tone="open" />
        <StatCard label="Pending" value={data.pending} tone="pending" />
        <StatCard label="Escalated" value={data.escalated} tone="escalated" />
        <StatCard label="Closed" value={data.closed} tone="closed" />
        <StatCard label="Total" value={data.total} />
      </div>
    </section>
  );
};
