export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  correlationId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMetadata;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  correlationId: string;
}

export interface UserAction {
  userId: string;
  departmentId: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type QueryParamPrimitive = string | number | boolean | Date;
export type QueryParamValue =
  | QueryParamPrimitive
  | readonly QueryParamPrimitive[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryParamValue>;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RetryPolicy {
  count?: number;
  delayMs?: number;
  excludedStatusCodes?: number[];
  includedMethods?: HttpMethod[];
}

export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retry?: boolean | RetryPolicy;
  withCredentials?: boolean;
}

export interface CommandResponse {
  acknowledged: boolean;
  message?: string;
}

export type IncidentStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING_CHECKLIST"
  | "PENDING_TRANSITION"
  | "ESCALATED"
  | "RESOLVED"
  | "CLOSED";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type SlaStatus = "WITHIN_SLA" | "APPROACHING_BREACH" | "BREACHED";
