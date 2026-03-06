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
    <main style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h1>Company Profile</h1>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {saveBanner ? (
        <div
          style={{
            marginTop: 12,
            marginBottom: 8,
            padding: 10,
            border: '1px solid #b42318',
            background: '#fef3f2',
            color: '#b42318',
          }}
        >
          {saveBanner}
        </div>
      ) : null}
      {saved ? <p style={{ color: 'green' }}>{saved}</p> : null}
      <form onSubmit={onSave} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <label>
          Common Timezones
          <select
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
        <label>
          Company Timezone (IANA)
          <input
            type="text"
            value={companyTimezone}
            onChange={(event) => setCompanyTimezone(event.target.value)}
            placeholder="America/New_York"
          />
        </label>
        {fieldError ? <p style={{ color: '#8a4b00' }}>{fieldError}</p> : null}
        <button type="submit" disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  );
}
