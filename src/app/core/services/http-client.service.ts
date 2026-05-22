import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  Observable,
  catchError,
  mergeMap,
  retryWhen,
  throwError,
  timeout,
  timer,
} from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiError, ApiResponse } from "../../shared/models/common.model";

@Injectable({ providedIn: "root" })
export class HttpClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly defaultTimeout = 30000;
  private readonly maxRetries = 2;

  get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Observable<ApiResponse<T>> {
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
        params: this.buildParams(params),
        headers: this.getHeaders(),
      })
      .pipe(
        timeout(this.defaultTimeout),
        retryWhen(this.retryStrategy()),
        catchError((error) => this.handleError(error)),
      );
  }

  getPaginated<T>(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Observable<ApiResponse<T>> {
    return this.get<T>(endpoint, params);
  }

  post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http
      .post<
        ApiResponse<T>
      >(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() })
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => this.handleError(error)),
      );
  }

  put<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http
      .put<
        ApiResponse<T>
      >(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() })
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => this.handleError(error)),
      );
  }

  patch<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http
      .patch<
        ApiResponse<T>
      >(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() })
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => this.handleError(error)),
      );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http
      .delete<
        ApiResponse<T>
      >(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() })
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => this.handleError(error)),
      );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Correlation-Id": this.generateCorrelationId(),
    });
  }

  private buildParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }

  private retryStrategy() {
    return (errors: Observable<unknown>) =>
      errors.pipe(
        mergeMap((error: unknown, index: number) => {
          const httpError = error as HttpErrorResponse;
          if (
            index < this.maxRetries &&
            httpError.status !== 400 &&
            httpError.status !== 401 &&
            httpError.status !== 403
          ) {
            return timer((index + 1) * 1000);
          }
          return throwError(() => error);
        }),
      );
  }

  private handleError(error: unknown): Observable<never> {
    const httpError = error as HttpErrorResponse;
    const apiError: ApiError = {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
      correlationId: "",
    };

    if (httpError?.error?.code) {
      apiError.code = httpError.error.code;
      apiError.message = httpError.error.message;
      apiError.details = httpError.error.details;
      apiError.correlationId = httpError.error.correlationId;
    } else if (httpError?.status === 0) {
      apiError.code = "NETWORK_ERROR";
      apiError.message = "Network connectivity issue";
    } else if (httpError?.status === 401) {
      apiError.code = "AUTHENTICATION_ERROR";
      apiError.message = "Authentication required";
    } else if (httpError?.status === 403) {
      apiError.code = "AUTHORIZATION_ERROR";
      apiError.message = "Insufficient permissions";
    }

    return throwError(() => apiError);
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}
