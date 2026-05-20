import { MoreHorizontal20Regular, Search20Regular } from '@fluentui/react-icons';
import { ColumnDef, getCoreRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import * as React from 'react';
import { DataTable } from '../../../common/components/DataTable/DataTable';
import { EmptyState } from '../../../common/components/EmptyState/EmptyState';
import { ErrorState } from '../../../common/components/ErrorState/ErrorState';
import { LoadingState } from '../../../common/components/LoadingState/LoadingState';
import { PageHeader } from '../../../common/components/PageHeader/PageHeader';
import { StatusBadge } from '../../../common/components/StatusBadge/StatusBadge';
import { UserAvatar } from '../../../common/components/UserAvatar/UserAvatar';
import { useTickets } from '../../../common/hooks/useTickets';
import { formatDateTime, formatMinutes } from '../../../common/utils/formatters';
import { Ticket, TicketPriority, TicketStatus } from '../../../models/Ticket';
import styles from './TicketsGrid.module.scss';

const statusOptions: Array<TicketStatus | ''> = ['', 'Open', 'Pending', 'Escalated', 'Closed'];
const priorityOptions: Array<TicketPriority | ''> = ['', 'Low', 'Medium', 'High', 'Critical'];

export const TicketsGrid: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<TicketStatus | undefined>();
  const [priority, setPriority] = React.useState<TicketPriority | undefined>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const { data, isLoading, isError } = useTickets({ search, status, priority, ...pagination });

  const columns = React.useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: 'ticketNumber',
        header: 'Ticket',
        cell: ({ row }) => (
          <>
            <div className={styles.ticketNumber}>{row.original.ticketNumber}</div>
            <div className={styles.meta}>{row.original.category}</div>
          </>
        )
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
          <>
            <div className={styles.subject}>{row.original.subject}</div>
            <div className={styles.meta}>{row.original.department}</div>
          </>
        )
      },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <span className={styles.priority}>{row.original.priority}</span> },
      { accessorKey: 'assignedTo.displayName', header: 'Assignee', cell: ({ row }) => <UserAvatar user={row.original.assignedTo} /> },
      { accessorKey: 'updatedAt', header: 'Updated', cell: ({ row }) => formatDateTime(row.original.updatedAt) },
      { accessorKey: 'timeSpent', header: 'Time', cell: ({ row }) => formatMinutes(row.original.timeSpent) },
      {
        id: 'actions',
        enableSorting: false,
        header: '',
        cell: () => (
          <details className={styles.actionsMenu}>
            <summary aria-label="Ticket actions">
              <MoreHorizontal20Regular />
            </summary>
            <div className={styles.actionsList}>
              <button type="button">Open details</button>
              <button type="button">Assign</button>
              <button type="button">Escalate</button>
            </div>
          </details>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting, pagination },
    pageCount: data ? Math.max(1, Math.ceil(data.total / pagination.pageSize)) : 1,
    manualPagination: true,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return <ErrorState title="Ticket grid is unavailable." />;
  }

  return (
    <section className={styles.grid}>
      <PageHeader title="Tickets" description="Search, filter, sort, and action enterprise service tickets." />
      {data.total === 0 ? (
        <EmptyState message="No tickets match the selected filters." />
      ) : (
        <DataTable
          table={table}
          total={data.total}
          toolbar={
            <div className={styles.filters}>
              <label className={styles.search}>
                <Search20Regular />
                <input placeholder="Search tickets" type="search" value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
              </label>
              <select className={styles.select} value={status ?? ''} onChange={(event) => setStatus((event.currentTarget.value as TicketStatus) || undefined)}>
                {statusOptions.map((option) => <option key={option || 'all'} value={option}>{option || 'All statuses'}</option>)}
              </select>
              <select className={styles.select} value={priority ?? ''} onChange={(event) => setPriority((event.currentTarget.value as TicketPriority) || undefined)}>
                {priorityOptions.map((option) => <option key={option || 'all'} value={option}>{option || 'All priorities'}</option>)}
              </select>
            </div>
          }
        />
      )}
    </section>
  );
};
