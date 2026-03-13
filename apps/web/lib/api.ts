import { DEFAULT_TIMEZONE, localDateMinuteToUtc } from '@sylvara/shared';

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

type OrgSettingsResponse = {
  companyTimezone: string;
  operatingStartMinute: number | null;
  operatingEndMinute: number | null;
  sales_per_day: number | null;
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
  notesLastParsedAt: string | null;
  legacyParseItemCount: number;
};

type JobsResponse = {
  data: JobSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type GetJobsQuery = {
  page?: number;
  pageSize?: number;
  equipmentType?: 'CRANE' | 'BUCKET';
  town?: string;
  salesRepCode?: string;
  search?: string;
  includeCompleted?: boolean;
};

type JobDetail = {
  id: string;
  customerName: string;
  town: string;
  equipmentType: 'CRANE' | 'BUCKET';
  estimateHoursCurrent: string | null;
  amountDollars: string | null;
  salesRepCode: string;
  notesRaw: string;
};

export type NotesReviewEvent = {
  id: string;
  eventType: 'RESCHEDULE_TO' | 'TBS_FROM' | 'DATE_SWAP';
  fromAt: string | null;
  toAt: string | null;
  rawSnippet: string | null;
  actorCode: string | null;
  source: string | null;
};

export type NotesReviewRequirement = {
  id: string;
  requirementType: string;
  requirementTypeLabel: string;
  status: string;
  rawSnippet: string | null;
  source: string | null;
};

export type NotesReviewData = {
  job: {
    id: string;
    notesRaw: string;
    notesLastParsedAt: string | null;
    winterFlag: boolean;
    frozenGroundFlag: boolean;
    requiresSpiderLift: boolean;
    hasClimb: boolean;
    pushUpIfPossible: boolean;
  };
  scheduleEvents: NotesReviewEvent[];
  requirements: NotesReviewRequirement[];
};

type CreateJobPayload = {
  customerName: string;
  town: string;
  equipmentType: 'CRANE' | 'BUCKET';
  estimateHoursCurrent: number;
  amountDollars: number;
  salesRepCode: string;
  notesRaw?: string;
};

type UpdateJobPayload = {
  customerName?: string;
  town?: string;
  equipmentType?: 'CRANE' | 'BUCKET';
  estimateHoursCurrent?: number;
  amountDollars?: number;
  salesRepCode?: string;
  notesRaw?: string;
  winterFlag?: boolean;
  frozenGroundFlag?: boolean;
  requiresSpiderLift?: boolean;
  hasClimb?: boolean;
  pushUpIfPossible?: boolean;
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

type GetResourcesResponse = {
  resources: ResourceRecord[];
};

type GetHomeBasesResponse = {
  homeBases: HomeBaseRecord[];
};

type GetForemenResponse = {
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

export type AdminListRecord = {
  id: string;
  code: string;
  label: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type SeasonalFreezeWindowRecord = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  active: boolean;
  createdByUserId: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export type CreateAdminListPayload = {
  code: string;
  label: string;
  active?: boolean;
};

export type UpdateAdminListPayload = {
  label?: string;
  active?: boolean;
};

export type CreateSeasonalFreezeWindowPayload = {
  label: string;
  startDate: string;
  endDate: string;
  notes?: string;
  active?: boolean;
};

export type UpdateSeasonalFreezeWindowPayload = {
  label?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  active?: boolean;
};


export function buildOrgSettingsUrl(): string {
  return `/api/org-settings`;
}

export function buildJobsUrl(query?: GetJobsQuery | JobDerivedState): string {
  const base = `/api/jobs`;
  if (!query) {
    return base;
  }
  if (typeof query === 'string') {
    if (query === 'COMPLETED') {
      return `${base}?includeCompleted=true`;
    }
    return base;
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize));
  }
  if (query.equipmentType !== undefined) {
    params.set('equipmentType', query.equipmentType);
  }
  if (query.town !== undefined && query.town.trim()) {
    params.set('town', query.town.trim());
  }
  if (query.salesRepCode !== undefined && query.salesRepCode.trim()) {
    params.set('salesRepCode', query.salesRepCode.trim());
  }
  if (query.search !== undefined && query.search.trim()) {
    params.set('search', query.search.trim());
  }
  if (query.includeCompleted !== undefined) {
    params.set('includeCompleted', query.includeCompleted ? 'true' : 'false');
  }
  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
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

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {};
  }
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options?.body !== undefined) {
    headers['content-type'] = 'application/json';
  }
  const proxyPath = `/api/proxy?path=${encodeURIComponent(path)}`;

  return fetch(proxyPath, {
    ...options,
    headers: {
      ...headers,
      ...normalizeHeaders(options?.headers),
    },
  });
}

export async function getOrgSettings(): Promise<OrgSettingsResponse> {
  const url = buildOrgSettingsUrl();
  let response: Response;
  try {
    response = await apiFetch(url, {
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
): Promise<OrgSettingsResponse> {
  const url = buildOrgSettingsUrl();
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'PATCH',
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

export async function patchOrgSettingsSalesPerDay(
  salesPerDay: number | null,
): Promise<OrgSettingsResponse> {
  const url = buildOrgSettingsUrl();
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'PATCH',
      body: JSON.stringify({ sales_per_day: salesPerDay }),
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

export async function getJobs(query?: GetJobsQuery | JobDerivedState): Promise<JobsResponse> {
  const url = buildJobsUrl(query);
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
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

export async function getJobRepCodes(): Promise<string[]> {
  const url = '/api/jobs/rep-codes';
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { repCodes: string[] } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { repCodes: string[] }).repCodes;
}

export async function getJob(jobId: string): Promise<JobDetail> {
  const url = `/api/jobs/${jobId}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  type RawJob = {
    id: string;
    customerName?: string;
    customer?: { name?: string };
    town?: string;
    equipmentType?: 'CRANE' | 'BUCKET';
    estimateHoursCurrent?: string | null;
    amountDollars?: string | null;
    salesRepCode?: string;
    notesRaw?: string;
  };
  const body = (await parseJsonSafe(response)) as { job?: RawJob } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  const job = (body as { job: RawJob }).job;
  return {
    id: job.id,
    customerName: job.customerName ?? job.customer?.name ?? '',
    town: job.town ?? '',
    equipmentType: job.equipmentType ?? 'CRANE',
    estimateHoursCurrent: job.estimateHoursCurrent ?? null,
    amountDollars: job.amountDollars ?? null,
    salesRepCode: job.salesRepCode ?? '',
    notesRaw: job.notesRaw ?? '',
  };
}

export async function createJob(payload: CreateJobPayload): Promise<{ id: string }> {
  const url = `/api/jobs`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify({
        customerName: payload.customerName,
        equipmentType: payload.equipmentType,
        salesRepCode: payload.salesRepCode,
        jobSiteAddress: payload.town,
        town: payload.town,
        amountDollars: payload.amountDollars,
        estimateHoursCurrent: payload.estimateHoursCurrent,
        notesRaw: payload.notesRaw ?? '',
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

  const body = (await parseJsonSafe(response)) as { job?: { id: string } } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return { id: (body as { job: { id: string } }).job.id };
}

export async function updateJob(jobId: string, payload: UpdateJobPayload): Promise<void> {
  const url = `/api/jobs/${jobId}`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'PATCH',
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

export async function getJobNotesReview(jobId: string): Promise<NotesReviewData> {
  const url = `/api/jobs/${jobId}/notes-review`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as NotesReviewData | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as NotesReviewData;
}

export async function markJobNotesReviewed(jobId: string): Promise<void> {
  const url = `/api/jobs/${jobId}/notes-reviewed`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'PATCH', body: JSON.stringify({}) });
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

export async function updateJobRequirementStatus(
  jobId: string,
  requirementId: string,
  status: string,
): Promise<NotesReviewRequirement> {
  const url = `/api/jobs/${jobId}/requirements/${requirementId}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'PATCH', body: JSON.stringify({ status }) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { requirement?: NotesReviewRequirement } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { requirement: NotesReviewRequirement }).requirement;
}

export async function deleteJobRequirement(jobId: string, requirementId: string): Promise<void> {
  const url = `/api/jobs/${jobId}/requirements/${requirementId}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'DELETE' });
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

export async function deleteJobScheduleEvent(jobId: string, eventId: string): Promise<void> {
  const url = `/api/jobs/${jobId}/schedule-events/${eventId}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'DELETE' });
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

export async function getResources(): Promise<GetResourcesResponse> {
  const url = `/api/resources`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
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
): Promise<ResourceRecord> {
  const url = `/api/resources`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
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
): Promise<ResourceRecord> {
  const url = `/api/resources/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'PATCH',
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
  const url = `/api/home-bases`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
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
): Promise<HomeBaseRecord> {
  const url = `/api/home-bases`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
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
): Promise<HomeBaseRecord> {
  const url = `/api/home-bases/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'PATCH',
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
  const url = `/api/foremen`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
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

export async function getRequirementTypes(): Promise<{ requirementTypes: AdminListRecord[] }> {
  const url = `/api/admin/requirement-types`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { requirementTypes?: AdminListRecord[] } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { requirementTypes: AdminListRecord[] };
}

export async function createRequirementType(payload: CreateAdminListPayload): Promise<AdminListRecord> {
  const url = `/api/admin/requirement-types`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { requirementType?: AdminListRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { requirementType: AdminListRecord }).requirementType;
}

export async function updateRequirementType(id: string, payload: UpdateAdminListPayload): Promise<AdminListRecord> {
  const url = `/api/admin/requirement-types/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { requirementType?: AdminListRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { requirementType: AdminListRecord }).requirementType;
}

export async function getBlockerReasons(): Promise<{ blockerReasons: AdminListRecord[] }> {
  const url = `/api/admin/blocker-reasons`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { blockerReasons?: AdminListRecord[] } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { blockerReasons: AdminListRecord[] };
}

export async function createBlockerReason(payload: CreateAdminListPayload): Promise<AdminListRecord> {
  const url = `/api/admin/blocker-reasons`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { blockerReason?: AdminListRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { blockerReason: AdminListRecord }).blockerReason;
}

export async function updateBlockerReason(id: string, payload: UpdateAdminListPayload): Promise<AdminListRecord> {
  const url = `/api/admin/blocker-reasons/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { blockerReason?: AdminListRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { blockerReason: AdminListRecord }).blockerReason;
}

export async function getAccessConstraints(): Promise<{ accessConstraints: AdminListRecord[] }> {
  const url = `/api/admin/access-constraints`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { accessConstraints?: AdminListRecord[] } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { accessConstraints: AdminListRecord[] };
}

export async function createAccessConstraint(payload: CreateAdminListPayload): Promise<AdminListRecord> {
  const url = `/api/admin/access-constraints`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { accessConstraint?: AdminListRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { accessConstraint: AdminListRecord }).accessConstraint;
}

export async function updateAccessConstraint(id: string, payload: UpdateAdminListPayload): Promise<AdminListRecord> {
  const url = `/api/admin/access-constraints/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { accessConstraint?: AdminListRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { accessConstraint: AdminListRecord }).accessConstraint;
}

export async function getSeasonalFreezeWindows(): Promise<{ seasonalFreezeWindows: SeasonalFreezeWindowRecord[] }> {
  const url = `/api/admin/seasonal-freeze-windows`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { seasonalFreezeWindows?: SeasonalFreezeWindowRecord[] } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { seasonalFreezeWindows: SeasonalFreezeWindowRecord[] };
}

export async function createSeasonalFreezeWindow(
  payload: CreateSeasonalFreezeWindowPayload,
): Promise<SeasonalFreezeWindowRecord> {
  const url = `/api/admin/seasonal-freeze-windows`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { seasonalFreezeWindow?: SeasonalFreezeWindowRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { seasonalFreezeWindow: SeasonalFreezeWindowRecord }).seasonalFreezeWindow;
}

export async function updateSeasonalFreezeWindow(
  id: string,
  payload: UpdateSeasonalFreezeWindowPayload,
): Promise<SeasonalFreezeWindowRecord> {
  const url = `/api/admin/seasonal-freeze-windows/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { seasonalFreezeWindow?: SeasonalFreezeWindowRecord } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return (body as { seasonalFreezeWindow: SeasonalFreezeWindowRecord }).seasonalFreezeWindow;
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

export type DispatchForemenSchedulesResponse = {
  schedules: Record<string, DispatchForemanScheduleResponse>;
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
};

export type CreateScheduleAttemptResponse = {
  result: 'ACCEPT' | 'REJECT';
  segment?: DispatchScheduleSegment;
  warnings?: Array<{ code: string; message: string }>;
  error?: { code: string; message: string };
};

export type PushupVacatedSlotSummary = {
  id: string;
  startDatetime: string;
  endDatetime: string;
  slotHours: number;
  equipmentType: 'CRANE' | 'BUCKET';
  status: 'OPEN' | 'USED' | 'DISMISSED';
};

export type PushupCandidate = {
  jobId: string;
  customerId: string;
  customerName: string;
  jobSiteAddress: string;
  town: string;
  equipmentType: 'CRANE' | 'BUCKET';
  craneModelSuitability: 'MODEL_1090' | 'MODEL_1060' | 'EITHER' | null;
  estimateHoursCurrent: number;
  remainingHours: number;
  allocatedHours: number;
  approvalDate: string | null;
  salesRepCode: string;
  winterFlag: boolean;
  frozenGroundFlag: boolean;
  activeBlockers: Array<{ id: string; reason: string; notes: string | null }>;
  requirements: Array<{ id: string; requirementType: string; status: string }>;
  frictionScore: number;
  tier: 1 | 2;
};

export type PushupCandidatesResponse = {
  vacatedSlot: PushupVacatedSlotSummary;
  candidates: PushupCandidate[];
};

export type SummReportRow = {
  sales_rep_code: string;
  bucket_scheduled_dollars: number;
  bucket_tbs_dollars: number;
  bucket_total_dollars: number;
  crane_scheduled_dollars: number;
  crane_tbs_dollars: number;
  crane_total_dollars: number;
  combined_scheduled_dollars: number;
  combined_tbs_dollars: number;
  combined_total_dollars: number;
  pct_of_total: number;
  prior_week_dollars: number | null;
};

export type SummReportResponse = {
  report_date: string;
  sales_per_day: number | null;
  rows: SummReportRow[];
  totals: {
    bucket_scheduled_dollars: number;
    bucket_tbs_dollars: number;
    bucket_total_dollars: number;
    crane_scheduled_dollars: number;
    crane_tbs_dollars: number;
    crane_total_dollars: number;
    combined_scheduled_dollars: number;
    combined_tbs_dollars: number;
    combined_total_dollars: number;
    prior_week_dollars: number | null;
  };
  days_sales_in_backlog: number | null;
  prior_week_days_sales: number | null;
  days_sales_change: number | null;
};

export type ComparableWeekPoint = {
  scheduled_hours: number;
  tbs_hours: number;
  total_hours: number;
  crew_count: number;
  crew_days: number;
  snapshot_date: string;
};

export type ComparableReportResponse = {
  available_years: number[];
  crane: Record<number, Record<number, ComparableWeekPoint | null>>;
  bucket: Record<number, Record<number, ComparableWeekPoint | null>>;
};

export type ComparableReportQuery = {
  years?: number[];
  equipment?: 'CRANE' | 'BUCKET' | 'ALL';
};

export type DispatchConflict = {
  type: 'EQUIPMENT_DOUBLE_BOOKING' | 'PERSON_CONFLICT' | 'CAPACITY_WARNING' | 'JOB_OVERLAP';
  severity: 'ERROR' | 'WARNING';
  message: string;
  affected_entities: Array<{ id: string; name: string; type: string }>;
  foreman_ids: string[];
};

export type DispatchConflictsResponse = {
  date: string;
  conflicts: DispatchConflict[];
};

export type ConflictDismissal = {
  id: string;
  dismissedByUserId: string;
  conflictDate: string;
  conflictType: string;
  conflictKey: string;
  dismissedAt: string;
  deletedAt: string | null;
};

export async function getForemanDaySchedule(
  foremanPersonId: string,
  date: string,
): Promise<DispatchForemanScheduleResponse> {
  const url = `/api/foremen/${foremanPersonId}/schedule?date=${encodeURIComponent(date)}&includeTravel=true`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
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

export async function getForemenSchedules(
  date: string,
  foremanIds?: string[],
): Promise<DispatchForemenSchedulesResponse> {
  const params = new URLSearchParams();
  params.set('date', date);
  if (foremanIds && foremanIds.length > 0) {
    params.set('foremanIds', foremanIds.join(','));
  }
  const url = `/api/foremen/schedules?${params.toString()}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as DispatchForemenSchedulesResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as DispatchForemenSchedulesResponse;
}

export async function getForemanRoster(
  foremanId: string,
  date: string,
): Promise<ForemanDayRoster | null> {
  const url = `/api/foremen/${foremanId}/rosters/${encodeURIComponent(date)}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
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
  const url = `/api/foremen/${foremanId}/rosters/${encodeURIComponent(date)}/members`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
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
): Promise<ForemanDayRoster> {
  const url = `/api/foremen/${foremanId}/rosters`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
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
): Promise<void> {
  const url = `/api/foremen/${foremanId}/rosters/${encodeURIComponent(date)}/members`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
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
): Promise<DispatchTravelSegment> {
  const url = `/api/travel/create`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
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
    const timezone = payload.companyTimezone ?? DEFAULT_TIMEZONE;
    const startAt = localDateMinuteToUtc(payload.date, payload.requestedStartMinute, timezone).toISOString();
    const endAt = localDateMinuteToUtc(
      payload.date,
      payload.requestedStartMinute + payload.durationMinutes,
      timezone,
    ).toISOString();
    const url = `/api/schedule-segments`;
    let response: Response;
    try {
      response = await apiFetch(url, {
        method: 'POST',
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

  const oneClickUrl = `/api/schedule/one-click-attempt`;
  let response: Response;
  try {
    response = await apiFetch(oneClickUrl, {
      method: 'POST',
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

export async function removeScheduleSegment(segmentId: string): Promise<{ vacatedSlotId: string | null }> {
  const url = `/api/schedule-segments/${segmentId}`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'DELETE',
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
  const body = (await parseJsonSafe(response)) as { vacatedSlotId?: string | null } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return { vacatedSlotId: (body as { vacatedSlotId?: string | null })?.vacatedSlotId ?? null };
}

export async function getPushupCandidates(vacatedSlotId: string): Promise<PushupCandidatesResponse> {
  const url = `/api/pushup/candidates?vacatedSlotId=${encodeURIComponent(vacatedSlotId)}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as PushupCandidatesResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as PushupCandidatesResponse;
}

export async function getOpenPushupSlots(): Promise<PushupVacatedSlotSummary[]> {
  const url = '/api/pushup/open';
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as PushupVacatedSlotSummary[] | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as PushupVacatedSlotSummary[];
}

export async function applyPushupSuggestion(payload: {
  vacatedSlotId: string;
  jobId: string;
  allocatedHours: number;
  startDatetime: string;
}): Promise<CreateScheduleAttemptResponse & { vacatedSlotId?: string | null }> {
  const url = '/api/pushup/apply';
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
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
  const body = (await parseJsonSafe(response)) as (CreateScheduleAttemptResponse & {
    vacatedSlotId?: string | null;
  }) | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as CreateScheduleAttemptResponse & { vacatedSlotId?: string | null };
}

export async function dismissPushupSuggestion(vacatedSlotId: string): Promise<void> {
  const url = '/api/pushup/dismiss';
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify({ vacatedSlotId }),
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

function buildComparableReportUrl(query?: ComparableReportQuery): string {
  const base = '/api/reports/comparable';
  if (!query) {
    return base;
  }

  const params = new URLSearchParams();
  if (query.years && query.years.length > 0) {
    params.set('years', query.years.join(','));
  }
  if (query.equipment && query.equipment !== 'ALL') {
    params.set('equipment', query.equipment);
  }

  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}

export async function getSummReport(): Promise<SummReportResponse> {
  const url = '/api/reports/summ';
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as SummReportResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as SummReportResponse;
}

export async function getComparableReport(
  query?: ComparableReportQuery,
): Promise<ComparableReportResponse> {
  const url = buildComparableReportUrl(query);
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as ComparableReportResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as ComparableReportResponse;
}

export async function getConflicts(date: string): Promise<DispatchConflictsResponse> {
  const url = `/api/conflicts?date=${encodeURIComponent(date)}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as DispatchConflictsResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as DispatchConflictsResponse;
}

export async function dismissConflict(input: {
  date: string;
  conflictType: string;
  conflictKey: string;
}): Promise<{ dismissal: ConflictDismissal }> {
  const url = '/api/conflicts/dismiss';
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(input),
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
  const body = (await parseJsonSafe(response)) as { dismissal?: ConflictDismissal } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { dismissal: ConflictDismissal };
}

export async function deleteResource(id: string): Promise<void> {
  const url = `/api/resources/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'DELETE' });
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

export async function deleteHomeBase(id: string): Promise<void> {
  const url = `/api/home-bases/${id}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'DELETE' });
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

export type ActivityLogEntry = {
  id: string;
  entityType: string;
  entityId: string;
  actionType: string;
  diff: Record<string, unknown> | null;
  actorUserId: string | null;
  actorDisplay: string | null;
  actorName: string | null;
  createdAt: string;
};

type ActivityLogResponse = {
  entries: ActivityLogEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export async function getActivityLog(page: number = 1, pageSize: number = 20): Promise<ActivityLogResponse> {
  const url = `/api/admin/activity-log?page=${page}&pageSize=${pageSize}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as ActivityLogResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as ActivityLogResponse;
}

// ─── User Management ────────────────────────────────────────

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  hasClerkId: boolean;
  createdAt: string;
};

type AdminUsersResponse = {
  users: AdminUser[];
};

export async function getAdminUsers(): Promise<AdminUsersResponse> {
  const url = '/api/admin/users';
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as AdminUsersResponse | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as AdminUsersResponse;
}

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<{ message: string; role: string }> {
  const url = `/api/admin/users/${userId}/role`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
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
  const body = (await parseJsonSafe(response)) as { message: string; role: string } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { message: string; role: string };
}

export async function updateUserActive(
  userId: string,
  active: boolean,
): Promise<{ message: string; active: boolean }> {
  const url = `/api/admin/users/${userId}/active`;
  let response: Response;
  try {
    response = await apiFetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
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
  const body = (await parseJsonSafe(response)) as { message: string; active: boolean } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { message: string; active: boolean };
}

export async function getConflictDismissals(date: string): Promise<{ dismissals: ConflictDismissal[] }> {
  const url = `/api/conflicts/dismissals?date=${encodeURIComponent(date)}`;
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'GET', cache: 'no-store' });
  } catch (error) {
    throw new ApiRequestError({
      status: null,
      url,
      body: null,
      message: 'NETWORK_ERROR: Request failed.',
      networkErrorMessage: error instanceof Error ? error.message : String(error),
    });
  }
  const body = (await parseJsonSafe(response)) as { dismissals?: ConflictDismissal[] } | ApiErrorBody;
  if (!response.ok) {
    throw buildApiError(response.status, url, (body ?? {}) as ApiErrorBody);
  }
  return body as { dismissals: ConflictDismissal[] };
}


