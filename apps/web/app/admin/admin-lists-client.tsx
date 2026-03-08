'use client';

import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import {
  createAccessConstraint,
  createBlockerReason,
  createRequirementType,
  createSeasonalFreezeWindow,
  getAccessConstraints,
  getBlockerReasons,
  getRequirementTypes,
  getSeasonalFreezeWindows,
  updateAccessConstraint,
  updateBlockerReason,
  updateRequirementType,
  updateSeasonalFreezeWindow,
  type AdminListRecord,
  type SeasonalFreezeWindowRecord,
} from '../../lib/api';
import { getErrorMessage } from '../../lib/error-utils';

type ListKey = 'requirementTypes' | 'blockerReasons' | 'accessConstraints';

type ListState = {
  items: AdminListRecord[];
  loading: boolean;
  error: string | null;
  message: string | null;
  submitting: boolean;
  form: {
    code: string;
    label: string;
  };
};

const INITIAL_LIST_STATE: ListState = {
  items: [],
  loading: true,
  error: null,
  message: null,
  submitting: false,
  form: { code: '', label: '' },
};

function ListSection(props: {
  title: string;
  state: ListState;
  onFormChange: (next: Partial<ListState['form']>) => void;
  onCreate: () => void;
  onToggleActive: (item: AdminListRecord) => void;
  onLabelUpdate: (item: AdminListRecord, label: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{props.title}</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input
          type="text"
          placeholder="Code"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          value={props.state.form.code}
          onChange={(event) => props.onFormChange({ code: event.target.value })}
        />
        <input
          type="text"
          placeholder="Label"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          value={props.state.form.label}
          onChange={(event) => props.onFormChange({ label: event.target.value })}
        />
        <button
          type="button"
          onClick={props.onCreate}
          disabled={props.state.submitting}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {props.state.submitting ? 'Saving...' : 'Add'}
        </button>
      </div>
      {props.state.message ? <p className="mt-2 text-sm text-emerald-700">{props.state.message}</p> : null}
      {props.state.error ? <p className="mt-2 text-sm text-red-700">{props.state.error}</p> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-2 py-2 font-medium">Code</th>
              <th className="px-2 py-2 font-medium">Label</th>
              <th className="px-2 py-2 font-medium">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {props.state.loading ? (
              <tr>
                <td className="px-2 py-3 text-slate-500" colSpan={3}>
                  Loading...
                </td>
              </tr>
            ) : props.state.items.length === 0 ? (
              <tr>
                <td className="px-2 py-3 text-slate-500" colSpan={3}>
                  No items yet.
                </td>
              </tr>
            ) : (
              props.state.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-2 py-2 font-mono text-xs text-slate-700">{item.code}</td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      defaultValue={item.label}
                      onBlur={(event) => {
                        const next = event.target.value.trim();
                        if (next && next !== item.label) {
                          props.onLabelUpdate(item, next);
                        }
                      }}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <label className="inline-flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={item.active} onChange={() => props.onToggleActive(item)} />
                      {item.active ? 'Active' : 'Inactive'}
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function isoDateToInput(value: string): string {
  return value.slice(0, 10);
}

export default function AdminListsClient() {
  const [requirementTypes, setRequirementTypes] = useState<ListState>(INITIAL_LIST_STATE);
  const [blockerReasons, setBlockerReasons] = useState<ListState>(INITIAL_LIST_STATE);
  const [accessConstraints, setAccessConstraints] = useState<ListState>(INITIAL_LIST_STATE);
  const [freezeWindows, setFreezeWindows] = useState<{
    items: SeasonalFreezeWindowRecord[];
    loading: boolean;
    error: string | null;
    message: string | null;
    submitting: boolean;
    form: { label: string; startDate: string; endDate: string; notes: string };
  }>({
    items: [],
    loading: true,
    error: null,
    message: null,
    submitting: false,
    form: { label: '', startDate: '', endDate: '', notes: '' },
  });

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getRequirementTypes(),
      getBlockerReasons(),
      getAccessConstraints(),
      getSeasonalFreezeWindows(),
    ])
      .then(([req, blockers, access, freezes]) => {
        if (cancelled) {
          return;
        }
        setRequirementTypes((prev) => ({ ...prev, loading: false, items: req.requirementTypes }));
        setBlockerReasons((prev) => ({ ...prev, loading: false, items: blockers.blockerReasons }));
        setAccessConstraints((prev) => ({ ...prev, loading: false, items: access.accessConstraints }));
        setFreezeWindows((prev) => ({ ...prev, loading: false, items: freezes.seasonalFreezeWindows }));
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const message = getErrorMessage(error);
        setRequirementTypes((prev) => ({ ...prev, loading: false, error: message }));
        setBlockerReasons((prev) => ({ ...prev, loading: false, error: message }));
        setAccessConstraints((prev) => ({ ...prev, loading: false, error: message }));
        setFreezeWindows((prev) => ({ ...prev, loading: false, error: message }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const listSetters: Record<ListKey, Dispatch<SetStateAction<ListState>>> = useMemo(
    () => ({
      requirementTypes: setRequirementTypes,
      blockerReasons: setBlockerReasons,
      accessConstraints: setAccessConstraints,
    }),
    [],
  );

  async function createListItem(key: ListKey) {
    const setState = listSetters[key];
    setState((prev) => ({ ...prev, error: null, message: null, submitting: true }));
    try {
      let created: AdminListRecord;
      setState((prev) => {
        if (!prev.form.code.trim() || !prev.form.label.trim()) {
          return { ...prev, submitting: false, error: 'Code and label are required.' };
        }
        return prev;
      });
      const current = key === 'requirementTypes' ? requirementTypes : key === 'blockerReasons' ? blockerReasons : accessConstraints;
      if (!current.form.code.trim() || !current.form.label.trim()) {
        return;
      }
      const payload = { code: current.form.code.trim().toUpperCase(), label: current.form.label.trim() };
      if (key === 'requirementTypes') {
        created = await createRequirementType(payload);
      } else if (key === 'blockerReasons') {
        created = await createBlockerReason(payload);
      } else {
        created = await createAccessConstraint(payload);
      }
      setState((prev) => ({
        ...prev,
        submitting: false,
        message: 'Saved ✓',
        items: [...prev.items, created].sort((a, b) => a.code.localeCompare(b.code)),
        form: { code: '', label: '' },
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, submitting: false, error: getErrorMessage(error) }));
    }
  }

  async function updateListItem(key: ListKey, id: string, payload: { label?: string; active?: boolean }) {
    const setState = listSetters[key];
    setState((prev) => ({ ...prev, error: null, message: null }));
    try {
      const updated =
        key === 'requirementTypes'
          ? await updateRequirementType(id, payload)
          : key === 'blockerReasons'
            ? await updateBlockerReason(id, payload)
            : await updateAccessConstraint(id, payload);
      setState((prev) => ({
        ...prev,
        message: 'Saved ✓',
        items: prev.items.map((item) => (item.id === id ? updated : item)),
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: getErrorMessage(error) }));
    }
  }

  async function createFreezeWindow() {
    setFreezeWindows((prev) => ({ ...prev, error: null, message: null, submitting: true }));
    const form = freezeWindows.form;
    if (!form.label.trim() || !form.startDate || !form.endDate) {
      setFreezeWindows((prev) => ({ ...prev, submitting: false, error: 'Label, start date, and end date are required.' }));
      return;
    }
    try {
      const created = await createSeasonalFreezeWindow({
        label: form.label.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes.trim() || undefined,
      });
      setFreezeWindows((prev) => ({
        ...prev,
        submitting: false,
        message: 'Saved ✓',
        items: [...prev.items, created].sort((a, b) => a.startDate.localeCompare(b.startDate)),
        form: { label: '', startDate: '', endDate: '', notes: '' },
      }));
    } catch (error) {
      setFreezeWindows((prev) => ({ ...prev, submitting: false, error: getErrorMessage(error) }));
    }
  }

  async function updateFreezeWindow(id: string, payload: { label?: string; active?: boolean; notes?: string }) {
    setFreezeWindows((prev) => ({ ...prev, error: null, message: null }));
    try {
      const updated = await updateSeasonalFreezeWindow(id, payload);
      setFreezeWindows((prev) => ({
        ...prev,
        message: 'Saved ✓',
        items: prev.items.map((item) => (item.id === id ? updated : item)),
      }));
    } catch (error) {
      setFreezeWindows((prev) => ({ ...prev, error: getErrorMessage(error) }));
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Manager-managed scheduling lists.</p>
      </header>

      <ListSection
        title="Requirement Types"
        state={requirementTypes}
        onFormChange={(next) => setRequirementTypes((prev) => ({ ...prev, form: { ...prev.form, ...next } }))}
        onCreate={() => void createListItem('requirementTypes')}
        onToggleActive={(item) => void updateListItem('requirementTypes', item.id, { active: !item.active })}
        onLabelUpdate={(item, label) => void updateListItem('requirementTypes', item.id, { label })}
      />

      <ListSection
        title="Blocker Reasons"
        state={blockerReasons}
        onFormChange={(next) => setBlockerReasons((prev) => ({ ...prev, form: { ...prev.form, ...next } }))}
        onCreate={() => void createListItem('blockerReasons')}
        onToggleActive={(item) => void updateListItem('blockerReasons', item.id, { active: !item.active })}
        onLabelUpdate={(item, label) => void updateListItem('blockerReasons', item.id, { label })}
      />

      <ListSection
        title="Access Constraints"
        state={accessConstraints}
        onFormChange={(next) => setAccessConstraints((prev) => ({ ...prev, form: { ...prev.form, ...next } }))}
        onCreate={() => void createListItem('accessConstraints')}
        onToggleActive={(item) => void updateListItem('accessConstraints', item.id, { active: !item.active })}
        onLabelUpdate={(item, label) => void updateListItem('accessConstraints', item.id, { label })}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Seasonal Freeze Windows</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          <input
            type="text"
            placeholder="Label"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={freezeWindows.form.label}
            onChange={(event) => setFreezeWindows((prev) => ({ ...prev, form: { ...prev.form, label: event.target.value } }))}
          />
          <input
            type="date"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={freezeWindows.form.startDate}
            onChange={(event) => setFreezeWindows((prev) => ({ ...prev, form: { ...prev.form, startDate: event.target.value } }))}
          />
          <input
            type="date"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={freezeWindows.form.endDate}
            onChange={(event) => setFreezeWindows((prev) => ({ ...prev, form: { ...prev.form, endDate: event.target.value } }))}
          />
          <input
            type="text"
            placeholder="Notes"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            value={freezeWindows.form.notes}
            onChange={(event) => setFreezeWindows((prev) => ({ ...prev, form: { ...prev.form, notes: event.target.value } }))}
          />
          <button
            type="button"
            onClick={() => void createFreezeWindow()}
            disabled={freezeWindows.submitting}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {freezeWindows.submitting ? 'Saving...' : 'Add'}
          </button>
        </div>
        {freezeWindows.message ? <p className="mt-2 text-sm text-emerald-700">{freezeWindows.message}</p> : null}
        {freezeWindows.error ? <p className="mt-2 text-sm text-red-700">{freezeWindows.error}</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">Label</th>
                <th className="px-2 py-2 font-medium">Start</th>
                <th className="px-2 py-2 font-medium">End</th>
                <th className="px-2 py-2 font-medium">Notes</th>
                <th className="px-2 py-2 font-medium">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {freezeWindows.loading ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : freezeWindows.items.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={5}>
                    No seasonal windows yet.
                  </td>
                </tr>
              ) : (
                freezeWindows.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                        defaultValue={item.label}
                        onBlur={(event) => {
                          const next = event.target.value.trim();
                          if (next && next !== item.label) {
                            void updateFreezeWindow(item.id, { label: next });
                          }
                        }}
                      />
                    </td>
                    <td className="px-2 py-2 text-slate-700">{isoDateToInput(item.startDate)}</td>
                    <td className="px-2 py-2 text-slate-700">{isoDateToInput(item.endDate)}</td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                        defaultValue={item.notes ?? ''}
                        onBlur={(event) => {
                          const next = event.target.value.trim();
                          if (next !== (item.notes ?? '')) {
                            void updateFreezeWindow(item.id, { notes: next || '' });
                          }
                        }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <label className="inline-flex items-center gap-2 text-slate-700">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={() => void updateFreezeWindow(item.id, { active: !item.active })}
                        />
                        {item.active ? 'Active' : 'Inactive'}
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
