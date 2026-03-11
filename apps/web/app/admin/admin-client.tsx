'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createHomeBase,
  createResource,
  getForemen,
  getHomeBases,
  getResources,
  updateHomeBase,
  updateResource,
  type HomeBaseRecord,
  type ResourceRecord,
} from '../../lib/api';
import { getErrorMessage } from '../../lib/error-utils';
import { ForemenPanel, HomeBasesPanel, ResourcesPanel, type AdminTab } from './admin-panels';

function hhmmToMinute(value: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return undefined;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

const TAB_LABELS: Array<{ key: AdminTab; label: string }> = [
  { key: 'resources', label: 'Resources' },
  { key: 'home-bases', label: 'Home Bases' },
  { key: 'foremen', label: 'Foremen' },
];

export default function AdminClient() {
  const [activeTab, setActiveTab] = useState<AdminTab>('resources');

  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [homeBases, setHomeBases] = useState<HomeBaseRecord[]>([]);
  const [foremen, setForemen] = useState<ResourceRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [homeBasesError, setHomeBasesError] = useState<string | null>(null);
  const [resourcesMessage, setResourcesMessage] = useState<string | null>(null);
  const [homeBasesMessage, setHomeBasesMessage] = useState<string | null>(null);

  const [resourceSubmitting, setResourceSubmitting] = useState(false);
  const [homeBaseSubmitting, setHomeBaseSubmitting] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    resourceType: 'PERSON' as 'PERSON' | 'EQUIPMENT',
    isForeman: false,
    quantity: '1',
  });
  const [homeBaseForm, setHomeBaseForm] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    openingTime: '',
    closingTime: '',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void Promise.all([getResources(), getHomeBases(), getForemen()])
      .then(([resourcesResponse, homeBasesResponse, foremenResponse]) => {
        if (cancelled) {
          return;
        }
        setResources(resourcesResponse.resources);
        setHomeBases(homeBasesResponse.homeBases);
        setForemen(foremenResponse.foremen);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const message = getErrorMessage(error);
        setResourcesError(message);
        setHomeBasesError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resourcesSorted = useMemo(
    () => [...resources].sort((a, b) => `${a.resourceType}:${a.name}`.localeCompare(`${b.resourceType}:${b.name}`)),
    [resources],
  );
  const homeBasesSorted = useMemo(() => [...homeBases].sort((a, b) => a.name.localeCompare(b.name)), [homeBases]);
  const foremenSorted = useMemo(() => [...foremen].sort((a, b) => a.name.localeCompare(b.name)), [foremen]);

  async function handleCreateResource() {
    setResourcesError(null);
    if (!resourceForm.name.trim()) {
      setResourcesError('Name is required.');
      return;
    }

    setResourceSubmitting(true);
    try {
      const created = await createResource(
        {
          name: resourceForm.name.trim(),
          resourceType: resourceForm.resourceType,
          isForeman: resourceForm.resourceType === 'PERSON' ? resourceForm.isForeman : undefined,
        },
      );

      setResources((current) => [created, ...current]);
      setResourcesMessage('Saved ✓');
      setResourceForm({
        name: '',
        resourceType: 'PERSON',
        isForeman: false,
        quantity: '1',
      });
    } catch (error) {
      setResourcesError(getErrorMessage(error));
    } finally {
      setResourceSubmitting(false);
    }
  }

  async function handleResourceActiveToggle(resource: ResourceRecord) {
    setResourcesError(null);
    const nextActive = !resource.active;
    const previous = resources;
    setResources((current) =>
      current.map((candidate) => (candidate.id === resource.id ? { ...candidate, active: nextActive } : candidate)),
    );
    try {
      const updated = await updateResource(resource.id, { active: nextActive });
      setResources((current) => current.map((candidate) => (candidate.id === resource.id ? updated : candidate)));
      setResourcesMessage('Saved ✓');
    } catch (error) {
      setResources(previous);
      setResourcesError(getErrorMessage(error));
    }
  }

  async function handleCreateHomeBase() {
    setHomeBasesError(null);
    if (
      !homeBaseForm.name.trim() ||
      !homeBaseForm.addressLine1.trim() ||
      !homeBaseForm.city.trim() ||
      !homeBaseForm.state.trim() ||
      !homeBaseForm.postalCode.trim()
    ) {
      setHomeBasesError('Name, address, city, state, and postal code are required.');
      return;
    }

    const openingTime = hhmmToMinute(homeBaseForm.openingTime);
    const closingTime = hhmmToMinute(homeBaseForm.closingTime);
    if (homeBaseForm.openingTime && openingTime === undefined) {
      setHomeBasesError('Opening time must be HH:MM.');
      return;
    }
    if (homeBaseForm.closingTime && closingTime === undefined) {
      setHomeBasesError('Closing time must be HH:MM.');
      return;
    }

    setHomeBaseSubmitting(true);
    try {
      const created = await createHomeBase(
        {
          name: homeBaseForm.name.trim(),
          addressLine1: homeBaseForm.addressLine1.trim(),
          addressLine2: homeBaseForm.addressLine2.trim() || undefined,
          city: homeBaseForm.city.trim(),
          state: homeBaseForm.state.trim().toUpperCase().slice(0, 2),
          postalCode: homeBaseForm.postalCode.trim(),
          openingTime,
          closingTime,
        },
      );

      setHomeBases((current) => [created, ...current]);
      setHomeBasesMessage('Saved ✓');
      setHomeBaseForm({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        openingTime: '',
        closingTime: '',
      });
    } catch (error) {
      setHomeBasesError(getErrorMessage(error));
    } finally {
      setHomeBaseSubmitting(false);
    }
  }

  async function handleHomeBaseActiveToggle(homeBase: HomeBaseRecord) {
    setHomeBasesError(null);
    const nextActive = !homeBase.active;
    const previous = homeBases;
    setHomeBases((current) =>
      current.map((candidate) => (candidate.id === homeBase.id ? { ...candidate, active: nextActive } : candidate)),
    );
    try {
      const updated = await updateHomeBase(homeBase.id, { active: nextActive });
      setHomeBases((current) => current.map((candidate) => (candidate.id === homeBase.id ? updated : candidate)));
      setHomeBasesMessage('Saved ✓');
    } catch (error) {
      setHomeBases(previous);
      setHomeBasesError(getErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
      <p className="mt-1 text-sm text-slate-500">Manage resources, home bases, and foreman roster anchors.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              activeTab === tab.key ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          <div className="h-11 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : null}

      {!loading && activeTab === 'resources' ? (
        <div className="mt-6">
          <ResourcesPanel
            resources={resourcesSorted}
            loading={false}
            message={resourcesMessage}
            error={resourcesError}
            onToggleActive={handleResourceActiveToggle}
            resourceForm={resourceForm}
            onResourceFormChange={(next) => setResourceForm((current) => ({ ...current, ...next }))}
            onSubmitResource={() => void handleCreateResource()}
            resourceSubmitting={resourceSubmitting}
          />
        </div>
      ) : null}

      {!loading && activeTab === 'home-bases' ? (
        <div className="mt-6">
          <HomeBasesPanel
            homeBases={homeBasesSorted}
            loading={false}
            message={homeBasesMessage}
            error={homeBasesError}
            onToggleActive={handleHomeBaseActiveToggle}
            homeBaseForm={homeBaseForm}
            onHomeBaseFormChange={(next) => setHomeBaseForm((current) => ({ ...current, ...next }))}
            onSubmitHomeBase={() => void handleCreateHomeBase()}
            homeBaseSubmitting={homeBaseSubmitting}
          />
        </div>
      ) : null}

      {!loading && activeTab === 'foremen' ? (
        <div className="mt-6">
          <ForemenPanel foremen={foremenSorted} loading={false} />
        </div>
      ) : null}
    </main>
  );
}
