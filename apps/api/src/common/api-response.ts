import type { ApiSuccess, PaginationMeta } from "@prs/shared";

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return meta ? { status: "success", data, meta } : { status: "success", data };
}

export function pagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}
