import * as React from 'react';
import { navigationItems } from '../../constants/navigation';
import styles from './SideNav.module.scss';

export interface SideNavProps {
  activeKey?: string;
}

export const SideNav: React.FC<SideNavProps> = ({ activeKey = 'dashboard' }) => (
  <nav className={styles.sideNav} aria-label="Operational modules">
    {navigationItems.map((item) => {
      const Icon = item.icon;
      return (
        <div className={`${styles.item} ${activeKey === item.key ? styles.active : ''}`} key={item.key}>
          <Icon />
          {item.label}
        </div>
      );
    })}
  </nav>
);
