'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatMinuteToHHMM } from '@sylvara/shared';
import {
  createHomeBase,
  createResource,
  deleteHomeBase,
  deleteResource,
  getActivityLog,
  getAdminUsers,
  getHomeBases,
  getResources,
  updateHomeBase,
  updateResource,
  updateUserActive,
  updateUserRole,
  type ActivityLogEntry,
  type AdminUser,
  type HomeBaseRecord,
  type ResourceRecord,
} from '../../lib/api';
import { getErrorMessage } from '../../lib/error-utils';
import ConfirmDialog from '../components/ui/ConfirmDialog';

type AdminTab = 'foremen' | 'home-bases' | 'users' | 'activity-log';

const TAB_LABELS: Array<{ key: AdminTab; label: string }> = [
  { key: 'foremen', label: 'Foremen' },
  { key: 'home-bases', label: 'Home Bases' },
  { key: 'users', label: 'Users' },
  { key: 'activity-log', label: 'Activity Log' },
];

// ─── Helpers ──────────────────────────────────────────────

function hhmmToMinute(value: string): number | undefined {
  if (!value) return undefined;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return undefined;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatMinuteValue(value: number | null): string {
  if (value === null) return '--';
  try {
    return formatMinuteToHHMM(value);
  } catch {
    return '--';
  }
}

function minuteToHHMM(value: number | null): string {
  if (value === null) return '';
  const h = Math.floor(value / 60);
  const m = value % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function truncateUuid(id: string): string {
  return id.slice(0, 8);
}

// ─── Foremen Tab ──────────────────────────────────────────

function ForemenTab() {
  const [foremen, setForemen] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', active: true });
  const [pendingDeleteForeman, setPendingDeleteForeman] = useState<ResourceRecord | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getResources();
      const filtered = response.resources.filter(
        (r) => r.resourceType === 'PERSON' && r.isForeman,
      );
      setForemen(filtered);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const sorted = useMemo(
    () => [...foremen].sort((a, b) => a.name.localeCompare(b.name)),
    [foremen],
  );

  async function handleCreate() {
    setError(null);
    setMessage(null);
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createResource({
        name: form.name.trim(),
        resourceType: 'PERSON',
        isForeman: true,
        active: form.active,
      });
      setForemen((prev) => [...prev, created]);
      setMessage('Foreman created.');
      setForm({ name: '', active: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(foreman: ResourceRecord) {
    setEditingId(foreman.id);
    setEditForm({ name: foreman.name, active: foreman.active });
    setError(null);
    setMessage(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    setMessage(null);
    if (!editForm.name.trim()) {
      setError('Name is required.');
      return;
    }
    try {
      const updated = await updateResource(id, {
        name: editForm.name.trim(),
        active: editForm.active,
      });
      setForemen((prev) => prev.map((f) => (f.id === id ? updated : f)));
      setEditingId(null);
      setMessage('Saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function executeDeleteForeman(foreman: ResourceRecord) {
    setError(null);
    setMessage(null);
    try {
      await deleteResource(foreman.id);
      setForemen((prev) => prev.filter((f) => f.id !== foreman.id));
      setMessage('Foreman removed.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add Foreman</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Name
            <input
              type="text"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            />
            Active
          </label>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleCreate()}
            className="rounded-md bg-brand-green px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Add Foreman'}
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Active</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  Loading foremen...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  No foremen yet. Add one above.
                </td>
              </tr>
            ) : (
              sorted.map((foreman) => (
                <tr key={foreman.id}>
                  {editingId === foreman.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, name: e.target.value }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.active}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, active: e.target.checked }))
                            }
                          />
                          {editForm.active ? 'Active' : 'Inactive'}
                        </label>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void saveEdit(foreman.id)}
                            className="text-sm font-medium text-brand-green hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-sm font-medium text-slate-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-slate-700">{foreman.name}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            foreman.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {foreman.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(foreman)}
                            className="text-sm font-medium text-brand-green hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteForeman(foreman)}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={pendingDeleteForeman !== null}
        title="Remove foreman"
        message="This will remove the foreman from all future scheduling. Continue?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (pendingDeleteForeman) {
            void executeDeleteForeman(pendingDeleteForeman);
          }
          setPendingDeleteForeman(null);
        }}
        onCancel={() => setPendingDeleteForeman(null)}
      />
    </section>
  );
}

// ─── Home Bases Tab ───────────────────────────────────────

function HomeBasesTab() {
  const [homeBases, setHomeBases] = useState<HomeBaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    openingTime: '',
    closingTime: '',
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    openingTime: '',
    closingTime: '',
    active: true,
  });
  const [pendingDeleteHb, setPendingDeleteHb] = useState<HomeBaseRecord | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHomeBases();
      setHomeBases(response.homeBases);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const sorted = useMemo(
    () => [...homeBases].sort((a, b) => a.name.localeCompare(b.name)),
    [homeBases],
  );

  async function handleCreate() {
    setError(null);
    setMessage(null);
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    const openingTime = hhmmToMinute(form.openingTime);
    const closingTime = hhmmToMinute(form.closingTime);
    if (form.openingTime && openingTime === undefined) {
      setError('Opening time must be HH:MM.');
      return;
    }
    if (form.closingTime && closingTime === undefined) {
      setError('Closing time must be HH:MM.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createHomeBase({
        name: form.name.trim(),
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase().slice(0, 2),
        postalCode: form.postalCode.trim(),
        openingTime,
        closingTime,
      });
      setHomeBases((prev) => [...prev, created]);
      setMessage('Home base created.');
      setForm({
        name: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        openingTime: '',
        closingTime: '',
        active: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(hb: HomeBaseRecord) {
    setEditingId(hb.id);
    setEditForm({
      name: hb.name,
      addressLine1: hb.addressLine1,
      city: hb.city,
      state: hb.state,
      postalCode: hb.postalCode,
      openingTime: minuteToHHMM(hb.openingMinute),
      closingTime: minuteToHHMM(hb.closingMinute),
      active: hb.active,
    });
    setError(null);
    setMessage(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    setMessage(null);
    if (!editForm.name.trim()) {
      setError('Name is required.');
      return;
    }
    const openingTime = hhmmToMinute(editForm.openingTime);
    const closingTime = hhmmToMinute(editForm.closingTime);
    if (editForm.openingTime && openingTime === undefined) {
      setError('Opening time must be HH:MM.');
      return;
    }
    if (editForm.closingTime && closingTime === undefined) {
      setError('Closing time must be HH:MM.');
      return;
    }
    try {
      const updated = await updateHomeBase(id, {
        name: editForm.name.trim(),
        addressLine1: editForm.addressLine1.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim().toUpperCase().slice(0, 2),
        postalCode: editForm.postalCode.trim(),
        openingTime,
        closingTime,
        active: editForm.active,
      });
      setHomeBases((prev) => prev.map((h) => (h.id === id ? updated : h)));
      setEditingId(null);
      setMessage('Saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function executeDeleteHb(hb: HomeBaseRecord) {
    setError(null);
    setMessage(null);
    try {
      await deleteHomeBase(hb.id);
      setHomeBases((prev) => prev.filter((h) => h.id !== hb.id));
      setMessage('Home base removed.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add Home Base</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(
            [
              ['Name', 'name', 'text'],
              ['Address', 'addressLine1', 'text'],
              ['City', 'city', 'text'],
              ['State', 'state', 'text'],
              ['Postal Code', 'postalCode', 'text'],
              ['Opening Time', 'openingTime', 'time'],
              ['Closing Time', 'closingTime', 'time'],
            ] as const
          ).map(([label, key, inputType]) => (
            <label key={key} className="flex flex-col gap-1 text-sm text-slate-700">
              {label}
              <input
                type={inputType}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            />
            Active
          </label>
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleCreate()}
          className="mt-4 rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Add Home Base'}
        </button>
      </div>

      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Address</th>
              <th className="px-3 py-2 font-medium">City</th>
              <th className="px-3 py-2 font-medium">State</th>
              <th className="px-3 py-2 font-medium">Zip</th>
              <th className="px-3 py-2 font-medium">Hours</th>
              <th className="px-3 py-2 font-medium">Active</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={8}>
                  Loading home bases...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={8}>
                  No home bases yet. Add one above.
                </td>
              </tr>
            ) : (
              sorted.map((hb) => (
                <tr key={hb.id}>
                  {editingId === hb.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, name: e.target.value }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-40 rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.addressLine1}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, addressLine1: e.target.value }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, city: e.target.value }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-12 rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, state: e.target.value }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={editForm.postalCode}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, postalCode: e.target.value }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <input
                            type="time"
                            className="rounded-md border border-slate-300 px-1 py-1 text-sm"
                            value={editForm.openingTime}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, openingTime: e.target.value }))
                            }
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="time"
                            className="rounded-md border border-slate-300 px-1 py-1 text-sm"
                            value={editForm.closingTime}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, closingTime: e.target.value }))
                            }
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.active}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, active: e.target.checked }))
                            }
                          />
                          {editForm.active ? 'Active' : 'Inactive'}
                        </label>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void saveEdit(hb.id)}
                            className="text-sm font-medium text-brand-green hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-sm font-medium text-slate-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-slate-700">{hb.name}</td>
                      <td className="px-3 py-2 text-slate-700">{hb.addressLine1}</td>
                      <td className="px-3 py-2 text-slate-700">{hb.city}</td>
                      <td className="px-3 py-2 text-slate-700">{hb.state}</td>
                      <td className="px-3 py-2 text-slate-700">{hb.postalCode}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {formatMinuteValue(hb.openingMinute)} - {formatMinuteValue(hb.closingMinute)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            hb.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {hb.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(hb)}
                            className="text-sm font-medium text-brand-green hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteHb(hb)}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={pendingDeleteHb !== null}
        title="Remove home base"
        message="This home base will no longer be available for roster assignment. Continue?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (pendingDeleteHb) {
            void executeDeleteHb(pendingDeleteHb);
          }
          setPendingDeleteHb(null);
        }}
        onCancel={() => setPendingDeleteHb(null)}
      />
    </section>
  );
}

// ─── Users Tab ───────────────────────────────────────────

const ROLE_OPTIONS = ['MANAGER', 'SCHEDULER', 'VIEWER'] as const;

function UsersTab({ currentUserId }: { currentUserId: string | null }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ user: AdminUser; newRole: string } | null>(null);
  const [pendingActiveToggle, setPendingActiveToggle] = useState<AdminUser | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUsers();
      setUsers(response.users);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  function handleRoleChange(user: AdminUser, newRole: string) {
    if (user.id === currentUserId) return;
    if (user.role === newRole) return;
    setPendingRoleChange({ user, newRole });
  }

  async function executeRoleChange() {
    if (!pendingRoleChange) return;
    const { user, newRole } = pendingRoleChange;
    setPendingRoleChange(null);
    setError(null);
    setMessage(null);
    setPendingAction(user.id);
    try {
      await updateUserRole(user.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
      setMessage(`${user.name} is now ${newRole}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingAction(null);
    }
  }

  function handleActiveToggle(user: AdminUser) {
    if (user.id === currentUserId) return;
    setPendingActiveToggle(user);
  }

  async function executeActiveToggle() {
    if (!pendingActiveToggle) return;
    const user = pendingActiveToggle;
    setPendingActiveToggle(null);
    setError(null);
    setMessage(null);
    setPendingAction(user.id);
    try {
      await updateUserActive(user.id, !user.active);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)),
      );
      setMessage(`${user.name} ${!user.active ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section className="space-y-4">
      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Active</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            ) : (
              sorted.map((user) => {
                const isSelf = user.id === currentUserId;
                const isPending = pendingAction === user.id;
                return (
                  <tr
                    key={user.id}
                    className={isSelf ? 'bg-brand-green/5' : ''}
                  >
                    <td className="px-3 py-2 text-slate-700">
                      {user.name}
                      {isSelf ? (
                        <span className="ml-2 inline-flex rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-medium text-brand-green">
                          You
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{user.email}</td>
                    <td className="px-3 py-2">
                      {isSelf ? (
                        <span className="text-sm text-slate-700">{user.role}</span>
                      ) : (
                        <select
                          className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                          value={user.role}
                          disabled={isPending}
                          onChange={(e) => void handleRoleChange(user, e.target.value)}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {isSelf ? (
                        <span className="text-xs text-slate-400">Cannot modify self</span>
                      ) : (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => void handleActiveToggle(user)}
                          className={`text-sm font-medium hover:underline disabled:opacity-50 ${
                            user.active ? 'text-red-600' : 'text-brand-green'
                          }`}
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={pendingRoleChange !== null}
        title="Change role"
        message={
          pendingRoleChange
            ? `Change ${pendingRoleChange.user.name}'s role from ${pendingRoleChange.user.role} to ${pendingRoleChange.newRole}?`
            : ''
        }
        confirmLabel="Change role"
        onConfirm={() => void executeRoleChange()}
        onCancel={() => setPendingRoleChange(null)}
      />
      <ConfirmDialog
        open={pendingActiveToggle !== null}
        title={pendingActiveToggle?.active ? 'Deactivate user' : 'Activate user'}
        message={
          pendingActiveToggle
            ? `${pendingActiveToggle.active ? 'Deactivate' : 'Activate'} ${pendingActiveToggle.name}?`
            : ''
        }
        confirmLabel={pendingActiveToggle?.active ? 'Deactivate' : 'Activate'}
        variant={pendingActiveToggle?.active ? 'danger' : 'default'}
        onConfirm={() => void executeActiveToggle()}
        onCancel={() => setPendingActiveToggle(null)}
      />
    </section>
  );
}

// ─── Activity Log Tab ─────────────────────────────────────

function DiffDisplay({ diff }: { diff: Record<string, unknown> | null }) {
  if (!diff || typeof diff !== 'object') {
    return <span className="text-sm text-slate-400">No diff data</span>;
  }

  const entries = Object.entries(diff);
  if (entries.length === 0) {
    return <span className="text-sm text-slate-400">Empty diff</span>;
  }

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="font-mono text-xs text-slate-500">{key}</dt>
          <dd className="text-slate-700">
            {value === null
              ? <span className="text-slate-400">null</span>
              : typeof value === 'object'
                ? <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre>
                : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ActivityLogTab() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getActivityLog(targetPage, PAGE_SIZE);
      setEntries(response.entries);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1);
  }, [loadPage]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Activity Log</h2>
          <p className="text-sm text-slate-500">
            {total.toLocaleString()} total entries (read-only)
          </p>
        </div>

        {error ? (
          <p className="px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="w-8 px-3 py-2" />
                <th className="px-3 py-2 font-medium">Timestamp</th>
                <th className="px-3 py-2 font-medium">Actor</th>
                <th className="px-3 py-2 font-medium">Entity</th>
                <th className="px-3 py-2 font-medium">Entity ID</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={6}>
                    Loading activity log...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={6}>
                    No activity log entries.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="group cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <td className="px-3 py-2 text-slate-400">
                      <span
                        className={`inline-block transition-transform ${
                          expandedId === entry.id ? 'rotate-90' : ''
                        }`}
                        aria-hidden="true"
                      >
                        &#9654;
                      </span>
                      <span className="sr-only">
                        {expandedId === entry.id ? 'Collapse' : 'Expand'} details
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                      {formatTimestamp(entry.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {entry.actorName ?? entry.actorDisplay ?? '--'}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{entry.entityType}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500" title={entry.entityId}>
                      {truncateUuid(entry.entityId)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.actionType === 'CREATED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.actionType === 'DELETED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {entry.actionType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Expanded detail rows rendered below the table for simplicity */}
          {entries.map((entry) =>
            expandedId === entry.id ? (
              <div
                key={`detail-${entry.id}`}
                className="border-t border-slate-200 bg-slate-50 px-6 py-4"
              >
                <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Diff Details
                </h4>
                <DiffDisplay diff={entry.diff} />
              </div>
            ) : null,
          )}
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => void loadPage(page - 1)}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => void loadPage(page + 1)}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Main Admin Manage Client ─────────────────────────────

export default function AdminManageClient({
  currentUserId,
}: {
  currentUserId: string | null;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('foremen');

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage foremen, home bases, users, and view activity history.
        </p>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-green text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'foremen' ? <ForemenTab /> : null}
        {activeTab === 'home-bases' ? <HomeBasesTab /> : null}
        {activeTab === 'users' ? <UsersTab currentUserId={currentUserId} /> : null}
        {activeTab === 'activity-log' ? <ActivityLogTab /> : null}
      </div>
    </main>
  );
}
