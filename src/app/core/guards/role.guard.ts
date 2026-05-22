import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { PermissionsApiService } from "../../api/permissions-api.service";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionsApi = inject(PermissionsApiService);
  const router = inject(Router);

  const requiredPermissions = (route.data["permissions"] as string[] | undefined) ?? [];
  const requiredRoles = (route.data["roles"] as string[] | undefined) ?? [];

  return permissionsApi.getUserPermissions().pipe(
    map((permissionResponse) => {
      const hasPermissions =
        requiredPermissions.length === 0 ||
        requiredPermissions.every(
          (requiredPermission) =>
            permissionResponse.allowedActions.includes(requiredPermission) ||
            permissionResponse.permissions.some(
              (permission) => permission.resource === requiredPermission,
            ),
        );

      const hasRoles =
        requiredRoles.length === 0 || requiredRoles.includes(permissionResponse.role);

      if (hasPermissions && hasRoles) {
        return true;
      }

      router.navigate(["/unauthorized"]);
      return false;
    }),
    catchError(() => {
      router.navigate(["/unauthorized"]);
      return of(false);
    }),
  );
};
