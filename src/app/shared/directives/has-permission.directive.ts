// src/app/shared/directives/has-role.directive.ts

import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  inject,
} from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { PermissionsApiService } from "../../api/permissions-api.service";
import { UserPermissions } from "../../shared/models/user.model";

@Directive({
  selector: "[hasRole]",
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private readonly permissionsApi = inject(PermissionsApiService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();

  private hasView = false;

  @Input("hasRole") allowedRoles: string[] = [];
  @Input("hasRoleDepartment") allowedDepartments: string[] = [];

  ngOnInit(): void {
    this.permissionsApi
      .getUserPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          const hasRole = this.checkRole(permissions);

          if (hasRole && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
          } else if (!hasRole && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkRole(permissions: UserPermissions): boolean {
    if (!this.allowedRoles.length) return true;

    const hasRole = this.allowedRoles.includes(permissions.role);

    if (!hasRole || !this.allowedDepartments.length) return hasRole;

    return this.allowedDepartments.includes(permissions.departmentId);
  }
}
