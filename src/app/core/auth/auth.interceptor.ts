import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "./auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes("/auth/") || req.url.includes("/login")) {
    return next(req);
  }

  const token = authService.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 403) {
        router.navigate(["/unauthorized"]);
        return throwError(() => error);
      }

      if (error.status !== 401 || req.headers.has("X-Auth-Retry")) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((newToken) =>
          next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
                "X-Auth-Retry": "1",
              },
            }),
          ),
        ),
        catchError((refreshError) => {
          authService.logout();
          router.navigate(["/login"]);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
