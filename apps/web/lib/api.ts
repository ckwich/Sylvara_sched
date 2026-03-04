export const API_BASE_URL = '';

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiRequestError extends Error {
  status: number | null;
  url: string;
  body: unknown;
  networkErrorMessage?: string;

  constructor(params: {
    status: number | null;
    url: string;
    body: unknown;
    message: string;
    networkErrorMessage?: string;
  }) {
    super(params.message);
    this.name = 'ApiRequestError';
    this.status = params.status;
    this.url = params.url;
    this.body = params.body;
    this.networkErrorMessage = params.networkErrorMessage;
  }
}

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

export type ForemanActivityEntry = {
  createdAt: string;
  action: string;
  actorDisplay: string | null;
  actorUserId: number | null;
  segmentId: number | null;
  jobId: number | null;
};

export type ForemanActivityResponse = {
  entries: ForemanActivityEntry[];
};

export function buildOrgSettingsUrl(): string {
  return `${API_BASE_URL}/api/org-settings`;
}

export function buildForemanScheduleUrl(foremanPersonId: number, date: string): string {
  return `${API_BASE_URL}/api/foremen/${foremanPersonId}/schedule?date=${encodeURIComponent(date)}`;
}

export function buildForemanActivityUrl(foremanPersonId: number, date: string): string {
  return `${API_BASE_URL}/api/foremen/${foremanPersonId}/activity?date=${encodeURIComponent(date)}`;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildApiError(status: number, url: string, body: ApiErrorBody): Error {
  const code = body?.error?.code ?? `HTTP_${status}`;
  const message = body?.error?.message ?? 'Request failed.';
  return new ApiRequestError({
    status,
    url,
    body,
    message: `${code}: ${message}`,
  });
}

export async function getForemanSchedule(
  foremanPersonId: number,
  date: string,
): Promise<ForemanScheduleResponse> {
  const url = buildForemanScheduleUrl(foremanPersonId, date);
  let response: Response;
  try {
    response = await fetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as ForemanScheduleResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as ForemanScheduleResponse;
}

export async function getForemanActivity(
  foremanPersonId: number,
  date: string,
): Promise<ForemanActivityResponse> {
  const url = buildForemanActivityUrl(foremanPersonId, date);
  let response: Response;
  try {
    response = await fetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as ForemanActivityResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as ForemanActivityResponse;
}

export async function createScheduleSegment(
  payload: CreateScheduleSegmentPayload,
  actorUserId: string | undefined,
  lanUser: string | undefined,
): Promise<void> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }
  if (lanUser) {
    headers['x-lan-user'] = lanUser;
  }

  const url = `${API_BASE_URL}/api/schedule-segments`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, body ?? {});
  }
}

export async function getOrgSettings(): Promise<OrgSettingsResponse> {
  const url = buildOrgSettingsUrl();
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as OrgSettingsResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as OrgSettingsResponse;
}

export async function patchOrgSettingsTimezone(
  companyTimezone: string,
  actorUserId: string | undefined,
  lanUser: string | undefined,
): Promise<OrgSettingsResponse> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }
  if (lanUser) {
    headers['x-lan-user'] = lanUser;
  }

  const url = buildOrgSettingsUrl();
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ companyTimezone }),
    });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as OrgSettingsResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as OrgSettingsResponse;
}
