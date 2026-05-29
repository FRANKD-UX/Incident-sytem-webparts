import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = (route.data["roles"] as string[] | undefined) ?? [];
  const requiredPermissions =
    (route.data["permissions"] as string[] | undefined) ?? [];

  if (!authService.isAuthenticated()) {
    router.navigate(["/login"]);
    return false;
  }

  const roleAllowed =
    !requiredRoles.length || authService.hasAnyRole(requiredRoles);
  const permissionAllowed =
    !requiredPermissions.length ||
    authService.hasAnyPermission(requiredPermissions);

  if (roleAllowed && permissionAllowed) {
    return true;
  }

  router.navigate(["/unauthorized"]);
  return false;
};
