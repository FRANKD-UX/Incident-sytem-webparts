import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import {
  MonoTypeOperatorFunction,
  Observable,
  TimeoutError,
  catchError,
  identity,
  map,
  retry,
  throwError,
  timeout,
  timer,
} from "rxjs";
import { environment } from "../../../environments/environment";
import {
  ApiError,
  ApiResponse,
  HttpMethod,
  QueryParamPrimitive,
  QueryParams,
  RequestOptions,
  RetryPolicy,
} from "../../shared/models/common.model";

@Injectable({ providedIn: "root" })
export class HttpClientService {
  private static correlationSequence = 0;

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly defaultTimeout = 30000;
  private readonly defaultRetryPolicy: Required<RetryPolicy> = {
    count: 2,
    delayMs: 1000,
    excludedStatusCodes: [400, 401, 403, 404, 409, 422],
    includedMethods: ["GET", "PUT", "DELETE"],
  };

  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  getResponse<T>(
    endpoint: string,
    options?: RequestOptions,
  ): Observable<ApiResponse<T>> {
    return this.requestResponse<T>("GET", endpoint, undefined, options);
  }

  post<T>(
    endpoint: string,
    body: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    return this.request<T>("POST", endpoint, body, options);
  }

  postResponse<T>(
    endpoint: string,
    body: unknown,
    options?: RequestOptions,
  ): Observable<ApiResponse<T>> {
    return this.requestResponse<T>("POST", endpoint, body, options);
  }

  put<T>(
    endpoint: string,
    body: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    return this.request<T>("PUT", endpoint, body, options);
  }

  patch<T>(
    endpoint: string,
    body: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    return this.request<T>("PATCH", endpoint, body, options);
  }

  delete<T>(
    endpoint: string,
    options?: RequestOptions,
    body?: unknown,
  ): Observable<T> {
    return this.request<T>("DELETE", endpoint, body, options);
  }

  private request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    return this.requestResponse<T>(method, endpoint, body, options).pipe(
      map((response) => response.data),
    );
  }

  private requestResponse<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Observable<ApiResponse<T>> {
    const hasJsonBody = this.shouldSendJsonContentType(body);

    return this.http
      .request<ApiResponse<T>>(method, this.resolveUrl(endpoint), {
        body,
        headers: this.getHeaders(options.headers, hasJsonBody),
        params: this.buildParams(options.params),
        withCredentials: options.withCredentials ?? false,
      })
      .pipe(
        timeout(options.timeoutMs ?? this.defaultTimeout),
        this.getRetryOperator<ApiResponse<T>>(method, options.retry),
        catchError((error) => this.handleError(error)),
      );
  }

  private getHeaders(
    customHeaders?: Record<string, string>,
    hasJsonBody = false,
  ): HttpHeaders {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Correlation-Id": this.generateCorrelationId(),
      ...customHeaders,
    };

    if (hasJsonBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    return new HttpHeaders(headers);
  }

  private buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          httpParams = httpParams.append(
            key,
            this.serializeParamValue(item as QueryParamPrimitive),
          );
        });
        return;
      }

      httpParams = httpParams.set(
        key,
        this.serializeParamValue(value as QueryParamPrimitive),
      );
    });

    return httpParams;
  }

  private serializeParamValue(value: QueryParamPrimitive): string {
    return value instanceof Date ? value.toISOString() : String(value);
  }

  private getRetryOperator<T>(
    method: HttpMethod,
    retryOption?: boolean | RetryPolicy,
  ): MonoTypeOperatorFunction<T> {
    if (retryOption === false) {
      return identity;
    }

    const policy = {
      ...this.defaultRetryPolicy,
      ...(retryOption === true || retryOption === undefined ? {} : retryOption),
    };

    if (!policy.includedMethods.includes(method)) {
      return identity;
    }

    return retry({
      count: policy.count,
      delay: (error, retryCount) => {
        const status = this.extractStatusCode(error);
        if (
          policy.excludedStatusCodes.includes(status) ||
          !this.isRetriableStatus(status)
        ) {
          return throwError(() => error);
        }

        return timer(retryCount * policy.delayMs);
      },
      resetOnSuccess: true,
    });
  }

  private isRetriableStatus(status: number): boolean {
    return status === 0 || status === 408 || status === 429 || status >= 500;
  }

  private extractStatusCode(error: unknown): number {
    if (error instanceof HttpErrorResponse) {
      return error.status;
    }

    return 0;
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof TimeoutError) {
      return throwError(() => ({
        code: "REQUEST_TIMEOUT",
        message: "The request timed out before the backend responded.",
        timestamp: new Date().toISOString(),
        correlationId: this.generateCorrelationId(),
      } satisfies ApiError));
    }

    if (error instanceof HttpErrorResponse) {
      const errorPayload = this.extractApiError(error);
      return throwError(() => errorPayload);
    }

    return throwError(() => ({
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred.",
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
      details: error,
    } satisfies ApiError));
  }

  private extractApiError(httpError: HttpErrorResponse): ApiError {
    const errorBody =
      typeof httpError.error === "object" && httpError.error !== null
        ? (httpError.error as Partial<ApiError>)
        : undefined;

    return {
      code: errorBody?.code ?? this.mapErrorCode(httpError.status),
      message:
        errorBody?.message ??
        this.mapErrorMessage(httpError.status) ??
        httpError.message,
      details: errorBody?.details,
      timestamp: errorBody?.timestamp ?? new Date().toISOString(),
      correlationId:
        errorBody?.correlationId ??
        httpError.headers.get("X-Correlation-Id") ??
        this.generateCorrelationId(),
    };
  }

  private mapErrorCode(status: number): string {
    switch (status) {
      case 0:
        return "NETWORK_ERROR";
      case 400:
        return "BAD_REQUEST";
      case 401:
        return "AUTHENTICATION_ERROR";
      case 403:
        return "AUTHORIZATION_ERROR";
      case 404:
        return "RESOURCE_NOT_FOUND";
      case 409:
        return "CONFLICT";
      default:
        return "UNKNOWN_ERROR";
    }
  }

  private mapErrorMessage(status: number): string {
    switch (status) {
      case 0:
        return "Unable to reach the incident platform backend.";
      case 400:
        return "The request payload was rejected by the backend.";
      case 401:
        return "Authentication is required to complete this request.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource could not be found.";
      case 409:
        return "The backend rejected the change because the resource changed.";
      default:
        return "An unexpected backend error occurred.";
    }
  }

  private shouldSendJsonContentType(body: unknown): boolean {
    if (body === null || body === undefined || typeof body !== "object") {
      return false;
    }

    return !(
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      ArrayBuffer.isView(body) ||
      body instanceof URLSearchParams
    );
  }

  private resolveUrl(endpoint: string): string {
    if (/^https?:\/\//.test(endpoint)) {
      return endpoint;
    }

    const normalizedBase = this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    return `${normalizedBase}${normalizedEndpoint}`;
  }

  private generateCorrelationId(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    HttpClientService.correlationSequence += 1;
    return `${Date.now()}-${HttpClientService.correlationSequence}`;
  }
}
