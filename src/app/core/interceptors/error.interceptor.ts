import { HttpInterceptorFn } from "@angular/common/http";
import { HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          auth.logout();
          router.navigate(["/login"]);
        } else if (error.status === 403) {
          router.navigate(["/unauthorized"]);
        }
      }

      return throwError(() => error);
    }),
  );
};
