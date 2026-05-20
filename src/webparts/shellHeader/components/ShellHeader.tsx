import * as React from 'react';
import { AppShell } from '../../../common/components/AppShell/AppShell';
import { PageHeader } from '../../../common/components/PageHeader/PageHeader';

export interface ShellHeaderProps {
  userName: string;
}

export const ShellHeader: React.FC<ShellHeaderProps> = ({ userName }) => (
  <AppShell activeNavKey="dashboard" userName={userName}>
    <PageHeader title="Operations workspace" description="Unified service management shell for incidents, queues, reports, and administration." />
  </AppShell>
);
