'use client';

import { useMemo, useState } from 'react';

type RosterRole = 'CLIMBER' | 'GROUND' | 'OPERATOR' | 'OTHER';

const ROLE_OPTIONS: RosterRole[] = ['CLIMBER', 'GROUND', 'OPERATOR', 'OTHER'];

type CrewAddPanelProps = {
  people: Array<{ id: string; name: string }>;
  busy: boolean;
  error: string | null;
  onSubmit: (input: { personResourceId: string; role: RosterRole; homeBaseId?: string }) => Promise<void>;
  onCancel: () => void;
  homeBaseOptions: Array<{ id: string; name: string }>;
  requireHomeBaseChoice: boolean;
};

export default function CrewAddPanel(props: CrewAddPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [role, setRole] = useState<RosterRole>('GROUND');
  const [homeBaseId, setHomeBaseId] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const filteredPeople = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return props.people;
    }
    return props.people.filter((person) => person.name.toLowerCase().includes(normalized));
  }, [props.people, search]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!selectedPersonId) {
      setLocalError('Select a crew member.');
      return;
    }
    if (props.requireHomeBaseChoice && !homeBaseId) {
      setLocalError('Choose a home base before creating the roster.');
      return;
    }
    await props.onSubmit({
      personResourceId: selectedPersonId,
      role,
      homeBaseId: props.requireHomeBaseChoice ? homeBaseId : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-md border border-slate-200 bg-white p-3">
      <label className="block text-xs font-medium text-slate-600">
        Search people
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Type a name"
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>

      <label className="block text-xs font-medium text-slate-600">
        Crew member
        <select
          value={selectedPersonId}
          onChange={(event) => setSelectedPersonId(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Select a person</option>
          {filteredPeople.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-medium text-slate-600">
        Role
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as RosterRole)}
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {props.requireHomeBaseChoice ? (
        <label className="block text-xs font-medium text-slate-600">
          Home base
          <select
            value={homeBaseId}
            onChange={(event) => setHomeBaseId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Select a home base</option>
            {props.homeBaseOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {localError ? <p className="text-xs text-red-700">{localError}</p> : null}
      {props.error ? <p className="text-xs text-red-700">{props.error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={props.busy}
          className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {props.busy ? 'Adding...' : 'Add'}
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
