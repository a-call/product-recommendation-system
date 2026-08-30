"use client";

import type { TrackEventInput } from "@prs/shared";
import { API_URL } from "./api";

function getOrCreate(key: string, prefix: string) {
  const current = localStorage.getItem(key);
  if (current) {
    return current;
  }
  const value = `${prefix}-${crypto.randomUUID()}`;
  localStorage.setItem(key, value);
  return value;
}

export function getVisitorId() {
  return getOrCreate("prs_visitor_id", "visitor");
}

export function getSessionId() {
  return getOrCreate("prs_session_id", "session");
}

export function getToken() {
  return localStorage.getItem("prs_access_token");
}

export function setToken(token: string) {
  localStorage.setItem("prs_access_token", token);
}

export function clearToken() {
  localStorage.removeItem("prs_access_token");
}

export async function trackEvent(input: TrackEventInput) {
  try {
    await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
      },
      body: JSON.stringify({
        ...input,
        sessionId: getSessionId(),
        visitorId: getVisitorId()
      })
    });
  } catch {
    // Tracking must not break shopping flows.
  }
}
