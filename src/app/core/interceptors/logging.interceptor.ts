import { HttpInterceptorFn } from "@angular/common/http";

export const loggingInterceptor: HttpInterceptorFn = (req, next) => next(req);
