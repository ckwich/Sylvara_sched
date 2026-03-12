'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import { ApiRequestError, getOrgSettings, patchOrgSettingsTimezone } from '../../lib/api';

const COMMON_TIMEZONES = [
  DEFAULT_TIMEZONE,
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'UTC',
];

export default function CompanyClient() {
  const [companyTimezone, setCompanyTimezone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const settings = await getOrgSettings();
        if (!cancelled) {
          setCompanyTimezone(settings.companyTimezone);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'ORG_SETTINGS_ERROR: Failed to load settings.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldError(null);
    setSaveBanner(null);
    setSaved(null);
    try {
      if (!companyTimezone.trim()) {
        setFieldError('Timezone is required.');
        setSaveBanner('Could not save: VALIDATION_ERROR Timezone is required.');
        return;
      }
      const response = await patchOrgSettingsTimezone(companyTimezone);
      setCompanyTimezone(response.companyTimezone);
      setSaved('Saved.');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'ORG_SETTINGS_ERROR: Failed to save settings.';
      setError(message);
      if (saveError instanceof ApiRequestError) {
        const body = saveError.body as { error?: { code?: string; message?: string; details?: Record<string, unknown> } } | null;
        const code = body?.error?.code ?? /^([A-Z0-9_]+):/.exec(message)?.[1] ?? 'REQUEST_FAILED';
        if (code === 'VALIDATION_ERROR') {
          setFieldError('Enter a valid IANA timezone (example: America/New_York).');
        }
        setSaveBanner(`Could not save: ${code} ${body?.error?.message ?? message}`);
      } else {
        setSaveBanner(`Could not save: ${message}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Company Profile</h1>

      {loading ? (
        <div className="mt-6 space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : null}

      {error && !loading ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {saveBanner ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {saveBanner}
        </div>
      ) : null}

      {saved ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saved}</p>
      ) : null}

      {!loading ? (
        <form onSubmit={onSave} className="mt-6 max-w-md space-y-4">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Common Timezones
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              value={COMMON_TIMEZONES.includes(companyTimezone) ? companyTimezone : ''}
              onChange={(event) => {
                if (event.target.value) {
                  setCompanyTimezone(event.target.value);
                }
              }}
            >
              <option value="">Custom...</option>
              {COMMON_TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Company Timezone (IANA)
            <input
              type="text"
              className={`rounded-md border px-2 py-1.5 text-sm ${
                fieldError ? 'border-red-400' : 'border-slate-300'
              }`}
              value={companyTimezone}
              onChange={(event) => setCompanyTimezone(event.target.value)}
              placeholder="America/New_York"
            />
          </label>

          {fieldError ? (
            <p className="text-xs text-amber-700" role="alert">{fieldError}</p>
          ) : null}

          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      ) : null}
    </main>
  );
}
