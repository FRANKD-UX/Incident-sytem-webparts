import { ChevronLeft20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import { flexRender, Table as TanStackTable } from '@tanstack/react-table';
import * as React from 'react';
import styles from './DataTable.module.scss';

export interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  total: number;
  toolbar?: React.ReactNode;
}

export const DataTable = <TData,>({ table, total, toolbar }: DataTableProps<TData>): JSX.Element => (
  <>
    {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className={`${styles.header} ${styles.headerCell}`} colSpan={header.colSpan} key={header.id}>
                  {header.isPlaceholder ? null : (
                    <button
                      className={styles.sortButton}
                      disabled={!header.column.getCanSort()}
                      onClick={header.column.getToggleSortingHandler()}
                      type="button"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className={styles.row} key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className={styles.cell} key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className={styles.pagination}>
      <button className={styles.pageButton} disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} type="button">
        <ChevronLeft20Regular />
      </button>
      <span>
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} - {total} records
      </span>
      <button className={styles.pageButton} disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} type="button">
        <ChevronRight20Regular />
      </button>
    </div>
  </>
);
