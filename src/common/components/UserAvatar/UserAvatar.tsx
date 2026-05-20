import * as React from 'react';
import { User } from '../../../models/User';
import styles from './UserAvatar.module.scss';

export interface UserAvatarProps {
  user: User;
  showName?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, showName = true }) => (
  <span className={styles.chip}>
    {user.avatarUrl ? (
      <img className={styles.avatar} src={user.avatarUrl} alt="" />
    ) : (
      <span className={styles.avatar}>{user.displayName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2)}</span>
    )}
    {showName && <span className={styles.name}>{user.displayName}</span>}
  </span>
);
