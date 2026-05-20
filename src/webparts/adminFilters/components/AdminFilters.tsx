import { Add20Regular, Save20Regular } from '@fluentui/react-icons';
import * as React from 'react';
import { ErrorState } from '../../../common/components/ErrorState/ErrorState';
import { LoadingState } from '../../../common/components/LoadingState/LoadingState';
import { PageHeader } from '../../../common/components/PageHeader/PageHeader';
import { useSavedFilters } from '../../../common/hooks/useSavedFilters';
import styles from './AdminFilters.module.scss';

export const AdminFilters: React.FC = () => {
  const { data, isLoading, isError } = useSavedFilters();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return <ErrorState title="Saved filters are unavailable." />;
  }

  return (
    <section className={styles.admin}>
      <PageHeader
        title="Administration"
        description="Saved operational filters and governed admin actions."
        actions={
          <div className={styles.actions}>
            <button className={styles.buttonSecondary} type="button"><Add20Regular />New filter</button>
            <button className={styles.buttonPrimary} type="button"><Save20Regular />Save set</button>
          </div>
        }
      />
      <div className={styles.layout}>
        <aside className={styles.panel}>
          <div className={styles.panelTitle}>Advanced filters</div>
          <div className={styles.fieldGroup}>
            <input className={styles.input} placeholder="Filter name" />
            <select className={styles.input}>
              <option>All departments</option>
              <option>Finance</option>
              <option>People</option>
              <option>Sales</option>
            </select>
            <select className={styles.input}>
              <option>All statuses</option>
              <option>Open</option>
              <option>Pending</option>
              <option>Escalated</option>
              <option>Closed</option>
            </select>
            <label className={styles.checkbox}><input type="checkbox" />Shared with operations leads</label>
            <label className={styles.checkbox}><input type="checkbox" />Require backend governance approval</label>
          </div>
        </aside>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Saved filter sets</div>
          {data.map((filter) => (
            <article className={styles.filter} key={filter.id}>
              <div className={styles.filterTitle}>{filter.name}</div>
              <div className={styles.filterMeta}>
                Owner: {filter.owner} - {filter.isShared ? 'Shared' : 'Private'}
              </div>
              <div className={styles.chips}>
                {filter.statuses.map((status) => <span className={styles.chip} key={status}>{status}</span>)}
                {filter.priorities.map((priority) => <span className={styles.chip} key={priority}>{priority}</span>)}
                {filter.departments.map((department) => <span className={styles.chip} key={department}>{department}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
