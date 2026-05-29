// src/app/core/services/http-client.service.ts

import { Injectable, inject } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, timer } from "rxjs";
import { retryWhen, mergeMap, catchError, timeout } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { ApiResponse, ApiError } from "../../shared/models/common.model";

@Injectable({ providedIn: "root" })
export class HttpClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly defaultTimeout = 30000;
  private readonly maxRetries = 2;

  get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse<T>> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
        params: httpParams,
        headers: this.getHeaders(),
      })
      .pipe(
        timeout(this.defaultTimeout),
        retryWhen(this.retryStrategy()),
        catchError(this.handleError),
      );
  }

  getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse<T>> {
    return this.get<T>(endpoint, params);
  }

  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(timeout(this.defaultTimeout), catchError(this.handleError));
  }

  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(timeout(this.defaultTimeout), catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(timeout(this.defaultTimeout), catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(timeout(this.defaultTimeout), catchError(this.handleError));
  }

  upload<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData, {
        headers,
      })
      .pipe(timeout(60000), catchError(this.handleError));
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Correlation-Id": this.generateCorrelationId(),
    });

    const token = this.getToken();
    if (token) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return httpParams;
  }

  private retryStrategy() {
    return (errors: Observable<any>) =>
      errors.pipe(
        mergeMap((error: HttpErrorResponse, index: number) => {
          if (
            index < this.maxRetries &&
            error.status !== 400 &&
            error.status !== 401 &&
            error.status !== 403
          ) {
            return timer((index + 1) * 1000);
          }
          return throwError(() => error);
        }),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError: ApiError = {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
      correlationId: "",
    };

    if (error.error && error.error.code) {
      apiError.code = error.error.code;
      apiError.message = error.error.message;
      apiError.details = error.error.details;
      apiError.correlationId = error.error.correlationId;
    } else if (error.status === 0) {
      apiError.code = "NETWORK_ERROR";
      apiError.message = "Network connectivity issue";
    } else if (error.status === 401) {
      apiError.code = "AUTHENTICATION_ERROR";
      apiError.message = "Authentication required";
    } else if (error.status === 403) {
      apiError.code = "AUTHORIZATION_ERROR";
      apiError.message = "Insufficient permissions";
    }

    return throwError(() => apiError);
  }

  private getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
