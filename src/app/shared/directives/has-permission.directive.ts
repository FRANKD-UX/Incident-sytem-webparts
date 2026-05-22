import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { Subscription } from "rxjs";
import { PermissionsApiService } from "../../api/permissions-api.service";
import { Permission, UserPermissions } from "../models/user.model";

export type PermissionScope = "OWN" | "DEPARTMENT" | "ALL";

@Directive({
  selector: "[hasPermission]",
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private readonly permissionsApi = inject(PermissionsApiService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  @Input("hasPermission") requiredPermission!: string;
  @Input("hasPermissionScope") scope: PermissionScope = "DEPARTMENT";

  private subscription = new Subscription();

  ngOnInit(): void {
    this.subscription = this.permissionsApi.getUserPermissions().subscribe({
      next: (permissions) => this.renderByPermission(permissions),
      error: () => this.viewContainer.clear(),
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private renderByPermission(userPermissions: UserPermissions): void {
    const allowed = this.hasPermission(userPermissions);
    this.viewContainer.clear();

    if (allowed) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private hasPermission(userPermissions: UserPermissions): boolean {
    if (!this.requiredPermission) {
      return false;
    }

    if (userPermissions.allowedActions.includes(this.requiredPermission)) {
      return true;
    }

    const matchingPermission = userPermissions.permissions.find(
      (permission) => permission.resource === this.requiredPermission,
    );

    if (!matchingPermission) {
      return false;
    }

    return this.hasValidScope(matchingPermission.scope, this.scope);
  }

  private hasValidScope(current: Permission["scope"], required: PermissionScope): boolean {
    const scopeRank: Record<PermissionScope, number> = {
      OWN: 1,
      DEPARTMENT: 2,
      ALL: 3,
    };

    return scopeRank[current] >= scopeRank[required];
  }
}
