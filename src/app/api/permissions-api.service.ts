import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserPermissions } from '../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class PermissionsApiService {
  getUserPermissions(): Observable<UserPermissions> {
    return of({
      userId: '1',
      departmentId: '1',
      departmentName: 'Support',
      role: 'Agent',
      permissions: [],
      allowedIncidentTypes: ['1'],
      allowedActions: ['VIEW_INCIDENTS', 'CREATE_INCIDENT', 'VIEW_BOARD']
    });
  }
}
