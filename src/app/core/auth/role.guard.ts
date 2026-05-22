import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = (route.data["roles"] as string[] | undefined) ?? [];

  if (!requiredRoles.length || authService.isAuthenticated()) {
    return true;
  }

  router.navigate(["/dashboard"]);
  return false;
};
