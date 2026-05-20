import { Board20Regular, ChartMultiple20Regular, FluentIcon, Home20Regular, Settings20Regular, Table20Regular } from '@fluentui/react-icons';

export interface NavItem {
  key: string;
  label: string;
  icon: FluentIcon;
}

export const navigationItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Home20Regular },
  { key: 'tickets', label: 'Tickets', icon: Table20Regular },
  { key: 'myBoard', label: 'My Board', icon: Board20Regular },
  { key: 'reports', label: 'Reports', icon: ChartMultiple20Regular },
  { key: 'administration', label: 'Administration', icon: Settings20Regular }
];
