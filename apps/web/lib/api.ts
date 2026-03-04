import { localDateMinuteToUtc } from '@sylvara/shared';

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

export type JobDerivedState = 'TBS' | 'PARTIALLY_SCHEDULED' | 'FULLY_SCHEDULED' | 'COMPLETED';

export type JobSummary = {
  id: string;
  customerId: string;
  customerName: string;
  equipmentType: 'CRANE' | 'BUCKET';
  salesRepCode: string;
  jobSiteAddress: string;
  town: string;
  amountDollars: string | null;
  estimateHoursCurrent: string | null;
  scheduledEffectiveHours: string;
  remainingHours: string | null;
  derivedState: JobDerivedState;
  completedDate: string | null;
  pushUpIfPossible: boolean;
  activeBlockerCount: number;
  unmetRequirementCount: number;
};

export type JobsResponse = {
  jobs: JobSummary[];
  total: number;
};

export type ResourceRecord = {
  id: string;
  resourceType: 'PERSON' | 'EQUIPMENT';
  name: string;
  inventoryQuantity: number;
  isForeman: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type HomeBaseRecord = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  openingMinute: number | null;
  closingMinute: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type GetResourcesResponse = {
  resources: ResourceRecord[];
};

export type GetHomeBasesResponse = {
  homeBases: HomeBaseRecord[];
};

export type GetForemenResponse = {
  foremen: ResourceRecord[];
};

export type CreateResourcePayload = {
  name: string;
  resourceType: 'PERSON' | 'EQUIPMENT';
  isForeman?: boolean;
  active?: boolean;
};

export type UpdateResourcePayload = {
  name?: string;
  active?: boolean;
  inventoryQuantity?: number;
};

export type CreateHomeBasePayload = {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  openingTime?: number;
  closingTime?: number;
};

export type UpdateHomeBasePayload = Partial<CreateHomeBasePayload> & { active?: boolean };

export function buildOrgSettingsUrl(): string {
  return `${API_BASE_URL}/api/org-settings`;
}

export function buildForemanScheduleUrl(foremanPersonId: string | number, date: string): string {
  return `${API_BASE_URL}/api/foremen/${foremanPersonId}/schedule?date=${encodeURIComponent(date)}`;
}

export function buildForemanActivityUrl(foremanPersonId: string | number, date: string): string {
  return `${API_BASE_URL}/api/foremen/${foremanPersonId}/activity?date=${encodeURIComponent(date)}`;
}

export function buildJobsUrl(state?: JobDerivedState): string {
  const base = `${API_BASE_URL}/api/jobs`;
  if (!state) {
    return base;
  }
  return `${base}?state=${encodeURIComponent(state)}`;
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

function buildActorHeaders(actorUserId: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }
  return headers;
}

export async function getForemanSchedule(
  foremanPersonId: string | number,
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
  foremanPersonId: string | number,
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

export async function deleteScheduleSegment(
  segmentId: number,
  actorUserId: string | undefined,
  lanUser: string | undefined,
): Promise<void> {
  const headers: Record<string, string> = {};
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }
  if (lanUser) {
    headers['x-lan-user'] = lanUser;
  }

  const url = `${API_BASE_URL}/api/schedule-segments/${segmentId}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'DELETE',
      headers,
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

export async function restoreScheduleSegment(
  segmentId: number,
  actorUserId: string | undefined,
  lanUser: string | undefined,
): Promise<void> {
  const headers: Record<string, string> = {};
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }
  if (lanUser) {
    headers['x-lan-user'] = lanUser;
  }

  const url = `${API_BASE_URL}/api/schedule-segments/${segmentId}/restore`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers,
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

export async function getJobs(state?: JobDerivedState): Promise<JobsResponse> {
  const url = buildJobsUrl(state);
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

  const body = (await parseJsonSafe(response)) as JobsResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as JobsResponse;
}

export async function getResources(): Promise<GetResourcesResponse> {
  const url = `${API_BASE_URL}/api/resources`;
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
  const body = (await parseJsonSafe(response)) as GetResourcesResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as GetResourcesResponse;
}

export async function createResource(
  payload: CreateResourcePayload,
  actorUserId: string | undefined,
): Promise<ResourceRecord> {
  const url = `${API_BASE_URL}/api/resources`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: buildActorHeaders(actorUserId),
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
  const body = (await parseJsonSafe(response)) as { resource?: ResourceRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { resource: ResourceRecord }).resource;
}

export async function updateResource(
  id: string,
  payload: UpdateResourcePayload,
  actorUserId: string | undefined,
): Promise<ResourceRecord> {
  const url = `${API_BASE_URL}/api/resources/${id}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: buildActorHeaders(actorUserId),
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
  const body = (await parseJsonSafe(response)) as { resource?: ResourceRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { resource: ResourceRecord }).resource;
}

export async function getHomeBases(): Promise<GetHomeBasesResponse> {
  const url = `${API_BASE_URL}/api/home-bases`;
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
  const body = (await parseJsonSafe(response)) as GetHomeBasesResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as GetHomeBasesResponse;
}

export async function createHomeBase(
  payload: CreateHomeBasePayload,
  actorUserId: string | undefined,
): Promise<HomeBaseRecord> {
  const url = `${API_BASE_URL}/api/home-bases`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: buildActorHeaders(actorUserId),
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
  const body = (await parseJsonSafe(response)) as { homeBase?: HomeBaseRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { homeBase: HomeBaseRecord }).homeBase;
}

export async function updateHomeBase(
  id: string,
  payload: UpdateHomeBasePayload,
  actorUserId: string | undefined,
): Promise<HomeBaseRecord> {
  const url = `${API_BASE_URL}/api/home-bases/${id}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: buildActorHeaders(actorUserId),
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
  const body = (await parseJsonSafe(response)) as { homeBase?: HomeBaseRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { homeBase: HomeBaseRecord }).homeBase;
}

export async function getForemen(): Promise<GetForemenResponse> {
  const url = `${API_BASE_URL}/api/foremen`;
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
  const body = (await parseJsonSafe(response)) as GetForemenResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as GetForemenResponse;
}

export type ForemanDayRoster = {
  id: string;
  foremanPersonId: string;
  date: string;
  homeBaseId: string | null;
  preferredStartMinute: number | null;
  preferredEndMinute: number | null;
  notes: string | null;
};

export type ForemanRosterMembersResponse = {
  members: Array<{
    id: string;
    personResourceId: string;
    role: 'CLIMBER' | 'GROUND' | 'OPERATOR' | 'OTHER';
    resourceName: string;
  }>;
};

export type DispatchTravelSegment = {
  id: string;
  foremanPersonId: string;
  relatedJobId: string | null;
  serviceDate: string;
  startDatetime: string;
  endDatetime: string;
  travelType: 'START_OF_DAY' | 'END_OF_DAY' | 'BETWEEN_JOBS';
  source: string;
  locked: boolean;
  notes: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type DispatchScheduleSegment = {
  id: string;
  jobId: string;
  segmentType: string;
  startDatetime: string;
  endDatetime: string;
  scheduledHoursOverride: string | null;
  notes: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type DispatchForemanScheduleResponse = {
  roster: {
    id: string;
    date: string;
    homeBaseId: string | null;
    preferredStartMinute: number | null;
    preferredEndMinute: number | null;
    foremanPersonId: string;
  } | null;
  scheduleSegments: DispatchScheduleSegment[];
  travelSegments?: DispatchTravelSegment[];
};

export type CreateForemanRosterPayload = {
  date: string;
  homeBaseId: string;
  notes?: string;
  preferredStartMinute?: number;
  preferredEndMinute?: number;
};

export type AddRosterMemberPayload = {
  personResourceId: string;
  role: 'CLIMBER' | 'GROUND' | 'OPERATOR' | 'OTHER';
};

export type CreateTravelPayload = {
  foremanPersonId: string;
  travelType: 'START_OF_DAY' | 'END_OF_DAY' | 'BETWEEN_JOBS';
  startDatetime: string;
  endDatetime: string;
  relatedJobId?: string;
  notes?: string;
};

export type CreateScheduleAttemptPayload = {
  jobId: string;
  foremanPersonId: string;
  date: string;
  requestedStartMinute: number;
  durationMinutes: number;
  companyTimezone?: string;
  homeBaseId?: string;
  rosterId?: string;
  actorUserId?: string;
};

export type CreateScheduleAttemptResponse = {
  result: 'ACCEPT' | 'REJECT';
  segment?: DispatchScheduleSegment;
  warnings?: Array<{ code: string; message: string }>;
  error?: { code: string; message: string };
};

function buildWriteHeaders(actorUserId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (actorUserId) {
    headers['x-actor-user-id'] = actorUserId;
  }
  return headers;
}

export async function getForemanDaySchedule(
  foremanPersonId: string,
  date: string,
): Promise<DispatchForemanScheduleResponse> {
  const url = `${API_BASE_URL}/api/foremen/${foremanPersonId}/schedule?date=${encodeURIComponent(date)}&includeTravel=true`;
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
  const body = (await parseJsonSafe(response)) as DispatchForemanScheduleResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as DispatchForemanScheduleResponse;
}

export async function getForemanRoster(
  foremanId: string,
  date: string,
): Promise<ForemanDayRoster | null> {
  const url = `${API_BASE_URL}/api/foremen/${foremanId}/rosters/${encodeURIComponent(date)}`;
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

  if (response.status === 404) {
    return null;
  }

  const body = (await parseJsonSafe(response)) as { roster?: ForemanDayRoster } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { roster: ForemanDayRoster }).roster;
}

export async function getForemanRosterMembers(
  foremanId: string,
  date: string,
): Promise<ForemanRosterMembersResponse> {
  const url = `${API_BASE_URL}/api/foremen/${foremanId}/rosters/${encodeURIComponent(date)}/members`;
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
  const body = (await parseJsonSafe(response)) as ForemanRosterMembersResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as ForemanRosterMembersResponse;
}

export async function createForemanRoster(
  foremanId: string,
  payload: CreateForemanRosterPayload,
  actorUserId?: string,
): Promise<ForemanDayRoster> {
  const url = `${API_BASE_URL}/api/foremen/${foremanId}/rosters`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: buildWriteHeaders(actorUserId),
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
  const body = (await parseJsonSafe(response)) as { roster?: ForemanDayRoster } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { roster: ForemanDayRoster }).roster;
}

export async function addForemanRosterMember(
  foremanId: string,
  date: string,
  payload: AddRosterMemberPayload,
  actorUserId?: string,
): Promise<void> {
  const url = `${API_BASE_URL}/api/foremen/${foremanId}/rosters/${encodeURIComponent(date)}/members`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: buildWriteHeaders(actorUserId),
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

export async function createTravelSegment(
  payload: CreateTravelPayload,
  actorUserId?: string,
): Promise<DispatchTravelSegment> {
  const url = `${API_BASE_URL}/api/travel/create`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: buildWriteHeaders(actorUserId),
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
  const body = (await parseJsonSafe(response)) as { travelSegment?: DispatchTravelSegment } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { travelSegment: DispatchTravelSegment }).travelSegment;
}

export async function createScheduleAttempt(
  payload: CreateScheduleAttemptPayload,
): Promise<CreateScheduleAttemptResponse> {
  if (payload.rosterId) {
    const timezone = payload.companyTimezone ?? 'America/New_York';
    const startAt = localDateMinuteToUtc(payload.date, payload.requestedStartMinute, timezone).toISOString();
    const endAt = localDateMinuteToUtc(
      payload.date,
      payload.requestedStartMinute + payload.durationMinutes,
      timezone,
    ).toISOString();
    const url = `${API_BASE_URL}/api/schedule-segments`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: buildWriteHeaders(payload.actorUserId),
        body: JSON.stringify({
          jobId: payload.jobId,
          rosterId: payload.rosterId,
          startDatetime: startAt,
          endDatetime: endAt,
        }),
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
    const body = (await parseJsonSafe(response)) as { segment?: DispatchScheduleSegment } | ApiErrorBody;
    if (!response.ok) {
      if (response.status === 409 || response.status === 400) {
        const apiError = (body as ApiErrorBody)?.error;
        return {
          result: 'REJECT',
          error: {
            code: apiError?.code ?? `HTTP_${response.status}`,
            message: apiError?.message ?? 'Request rejected.',
          },
        };
      }
      throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
    }

    return {
      result: 'ACCEPT',
      segment: (body as { segment: DispatchScheduleSegment }).segment,
      warnings: [],
    };
  }

  const oneClickUrl = `${API_BASE_URL}/api/schedule/one-click-attempt`;
  let response: Response;
  try {
    response = await fetch(oneClickUrl, {
      method: 'POST',
      headers: buildWriteHeaders(payload.actorUserId),
      body: JSON.stringify({
        jobId: payload.jobId,
        foremanPersonId: payload.foremanPersonId,
        date: payload.date,
        homeBaseId: payload.homeBaseId,
        requestedStartMinute: payload.requestedStartMinute,
      }),
    });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url: oneClickUrl,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }

  const body = (await parseJsonSafe(response)) as CreateScheduleAttemptResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, oneClickUrl, (body ?? {}) as ApiErrorBody);
  }
  return body as CreateScheduleAttemptResponse;
}

export async function removeScheduleSegment(segmentId: string, actorUserId?: string): Promise<void> {
  const url = `${API_BASE_URL}/api/schedule-segments/${segmentId}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'DELETE',
      headers: actorUserId ? { 'x-actor-user-id': actorUserId } : undefined,
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
