import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserPermissions } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated() { return true; }
  getToken() { return 'mock-token'; }
  getUser() { return { id: '1', displayName: 'Test User', email: 'test@test.com', department: { id: '1', name: 'Support', code: 'SUP', isActive: true }, role: { id: '1', name: 'Agent', departmentId: '1', permissions: [] }, permissions: [] }; }
  getPermissions(): UserPermissions {
    return {
      userId: '1',
      departmentId: '1',
      departmentName: 'Support',
      role: 'Agent',
      permissions: [],
      allowedIncidentTypes: ['1'],
      allowedActions: ['VIEW_INCIDENTS', 'CREATE_INCIDENT', 'VIEW_BOARD']
    };
  }
  refreshToken() { return new Promise(resolve => resolve('mock-token')); }
  logout() {}
}
