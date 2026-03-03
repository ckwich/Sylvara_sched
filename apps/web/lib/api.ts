const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type ForemanScheduleResponse = {
  roster: {
    id: number;
    date: string;
    homeBaseId: number | null;
    preferredStartMinute: number | null;
    preferredEndMinute: number | null;
  } | null;
  scheduleSegments: Array<{
    id: number;
    jobId: number;
    segmentType: string;
    startDatetime: string;
    endDatetime: string;
  }>;
  travelSegments?: Array<{
    id: number;
    startDatetime: string;
    endDatetime: string;
    travelType: string;
  }>;
};

export type CreateScheduleSegmentPayload = {
  jobId: number;
  rosterId: number;
  startDatetime: string;
  endDatetime: string;
};

export type OrgSettingsResponse = {
  companyTimezone: string;
  operatingStartMinute: number | null;
  operatingEndMinute: number | null;
};

function buildApiError(status: number, body: ApiErrorBody): Error {
  const code = body.error?.code ?? `HTTP_${status}`;
  const message = body.error?.message ?? 'Request failed.';
  return new Error(`${code}: ${message}`);
}

export async function getForemanSchedule(
  foremanPersonId: number,
  date: string,
): Promise<ForemanScheduleResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/foremen/${foremanPersonId}/schedule?date=${encodeURIComponent(date)}`,
    { method: 'GET', cache: 'no-store' },
  );
  const body = (await response.json()) as ForemanScheduleResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, body as ApiErrorBody);
  }
  return body as ForemanScheduleResponse;
}

export async function createScheduleSegment(
  payload: CreateScheduleSegmentPayload,
  actorUserId: string | undefined,
): Promise<void> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }

  const response = await fetch(`${API_BASE_URL}/api/schedule-segments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, body);
  }
}

export async function getOrgSettings(): Promise<OrgSettingsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/org-settings`, {
    method: 'GET',
    cache: 'no-store',
  });
  const body = (await response.json()) as OrgSettingsResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, body as ApiErrorBody);
  }
  return body as OrgSettingsResponse;
}

export async function patchOrgSettingsTimezone(
  companyTimezone: string,
  actorUserId: string | undefined,
): Promise<OrgSettingsResponse> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }

  const response = await fetch(`${API_BASE_URL}/api/org-settings`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ companyTimezone }),
  });
  const body = (await response.json()) as OrgSettingsResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, body as ApiErrorBody);
  }
  return body as OrgSettingsResponse;
}
