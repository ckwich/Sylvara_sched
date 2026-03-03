'use client';

import { useEffect, useState } from 'react';
import { getOrgSettings, patchOrgSettingsTimezone } from '../../lib/api';

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'UTC',
];

type CompanyClientProps = {
  lanModeEnabled: boolean;
};

const LAN_USER_STORAGE_KEY = 'sylvara.lanUser';

export default function CompanyClient({ lanModeEnabled }: CompanyClientProps) {
  const [companyTimezone, setCompanyTimezone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [lanUser, setLanUser] = useState('');
  const actorUserId = process.env.NEXT_PUBLIC_DEV_ACTOR_USER_ID;

  useEffect(() => {
    if (!lanModeEnabled || typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(LAN_USER_STORAGE_KEY);
    if (stored) {
      setLanUser(stored);
    }
  }, [lanModeEnabled]);

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
    setSaved(null);
    try {
      const normalizedLanUser = lanModeEnabled ? lanUser.trim() : '';
      if (lanModeEnabled && !normalizedLanUser) {
        setError('UNAUTHENTICATED: LAN User is required in LAN mode.');
        return;
      }
      const response = await patchOrgSettingsTimezone(
        companyTimezone,
        actorUserId,
        normalizedLanUser || undefined,
      );
      setCompanyTimezone(response.companyTimezone);
      if (lanModeEnabled) {
        window.localStorage.setItem(LAN_USER_STORAGE_KEY, normalizedLanUser);
      }
      setSaved('Saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ORG_SETTINGS_ERROR: Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h1>Company Profile</h1>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {saved ? <p style={{ color: 'green' }}>{saved}</p> : null}
      <form onSubmit={onSave} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        {lanModeEnabled ? (
          <label>
            LAN User
            <input
              type="text"
              value={lanUser}
              onChange={(event) => setLanUser(event.target.value)}
              placeholder="Your name"
            />
          </label>
        ) : null}
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
        <button type="submit" disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  );
}
