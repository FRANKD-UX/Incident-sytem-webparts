import { inject } from "@angular/core";
import { CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../auth/auth.service";

export const authGuard: CanActivateFn = (_route, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  localStorage.setItem("redirectUrl", state.url);
  router.navigate(["/login"]);
  return false;
};
