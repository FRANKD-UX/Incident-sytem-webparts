import { Alert20Regular, Search20Regular } from '@fluentui/react-icons';
import * as React from 'react';
import styles from './TopNav.module.scss';

export interface TopNavProps {
  title: string;
  userName: string;
}

export const TopNav: React.FC<TopNavProps> = ({ title, userName }) => (
  <div className={styles.topNav}>
    <div className={styles.brand}>{title}</div>
    <label className={styles.search}>
      <Search20Regular />
      <input aria-label="Global search" placeholder="Search tickets, users, departments" type="search" />
    </label>
    <div className={styles.actions}>
      <button className={styles.iconButton} type="button" aria-label="Notifications">
        <Alert20Regular />
      </button>
      <span className={styles.avatar} aria-hidden="true">
        {userName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2)}
      </span>
      <span>{userName}</span>
    </div>
  </div>
);
