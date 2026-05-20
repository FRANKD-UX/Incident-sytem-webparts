import * as React from 'react';
import { SideNav } from '../SideNav/SideNav';
import { TopNav } from '../TopNav/TopNav';
import styles from './AppShell.module.scss';

export interface AppShellProps {
  activeNavKey?: string;
  children?: React.ReactNode;
  userName: string;
}

export const AppShell: React.FC<AppShellProps> = ({ activeNavKey, children, userName }) => (
  <section className={styles.shell}>
    <TopNav title="Incident Operations" userName={userName} />
    <div className={styles.body}>
      <SideNav activeKey={activeNavKey} />
      <main className={styles.workspace}>{children}</main>
    </div>
  </section>
);
