import { formatMinuteToHHMM } from '@sylvara/shared';
import type { HomeBaseRecord, ResourceRecord } from '../../lib/api';

export type AdminTab = 'resources' | 'home-bases' | 'foremen';

type ResourcesPanelProps = {
  resources: ResourceRecord[];
  loading: boolean;
  message: string | null;
  error: string | null;
  onToggleActive: (resource: ResourceRecord) => void;
  resourceForm: {
    name: string;
    resourceType: 'PERSON' | 'EQUIPMENT';
    isForeman: boolean;
    quantity: string;
  };
  onResourceFormChange: (next: Partial<ResourcesPanelProps['resourceForm']>) => void;
  onSubmitResource: () => void;
  resourceSubmitting: boolean;
};

export function ResourcesPanel(props: ResourcesPanelProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add Resource</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Name
            <input
              type="text"
              className="rounded-md border border-slate-300 px-2 py-1.5"
              value={props.resourceForm.name}
              onChange={(event) => props.onResourceFormChange({ name: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Type
            <select
              className="rounded-md border border-slate-300 px-2 py-1.5"
              value={props.resourceForm.resourceType}
              onChange={(event) =>
                props.onResourceFormChange({
                  resourceType: event.target.value as 'PERSON' | 'EQUIPMENT',
                })
              }
            >
              <option value="PERSON">PERSON</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
            </select>
          </label>

          {props.resourceForm.resourceType === 'PERSON' ? (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={props.resourceForm.isForeman}
                onChange={(event) => props.onResourceFormChange({ isForeman: event.target.checked })}
              />
              Is Foreman?
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Quantity
              <input
                type="number"
                min={1}
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={props.resourceForm.quantity}
                onChange={(event) => props.onResourceFormChange({ quantity: event.target.value })}
              />
            </label>
          )}
        </div>
        <button
          type="button"
          disabled={props.resourceSubmitting}
          onClick={props.onSubmitResource}
          className="mt-4 rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
        >
          {props.resourceSubmitting ? 'Saving...' : 'Add Resource'}
        </button>
      </div>

      {props.message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{props.message}</p> : null}
      {props.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{props.error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              {['Name', 'Type', 'Foreman?', 'Quantity', 'Active'].map((label) => (
                <th key={label} className="px-3 py-2 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {props.loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  Loading resources...
                </td>
              </tr>
            ) : props.resources.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  No resources yet. Add one above.
                </td>
              </tr>
            ) : (
              props.resources.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-3 py-2 text-slate-700">{resource.name}</td>
                  <td className="px-3 py-2 text-slate-700">{resource.resourceType}</td>
                  <td className="px-3 py-2 text-slate-700">{resource.isForeman ? '✓' : ''}</td>
                  <td className="px-3 py-2 text-slate-700">{resource.inventoryQuantity}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={resource.active}
                        onChange={() => props.onToggleActive(resource)}
                      />
                      {resource.active ? 'Active' : 'Inactive'}
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

type HomeBasesPanelProps = {
  homeBases: HomeBaseRecord[];
  loading: boolean;
  message: string | null;
  error: string | null;
  onToggleActive: (homeBase: HomeBaseRecord) => void;
  homeBaseForm: {
    name: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    openingTime: string;
    closingTime: string;
  };
  onHomeBaseFormChange: (next: Partial<HomeBasesPanelProps['homeBaseForm']>) => void;
  onSubmitHomeBase: () => void;
  homeBaseSubmitting: boolean;
};

function formatMinuteValue(value: number | null): string {
  if (value === null) {
    return '--';
  }
  try {
    return formatMinuteToHHMM(value);
  } catch {
    return '--';
  }
}

export function HomeBasesPanel(props: HomeBasesPanelProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add Home Base</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {[
            ['Name', 'name', 'text'],
            ['Address Line 1', 'addressLine1', 'text'],
            ['Address Line 2', 'addressLine2', 'text'],
            ['City', 'city', 'text'],
            ['State', 'state', 'text'],
            ['Postal Code', 'postalCode', 'text'],
            ['Opening Time', 'openingTime', 'time'],
            ['Closing Time', 'closingTime', 'time'],
          ].map(([label, key, inputType]) => (
            <label key={key} className="flex flex-col gap-1 text-sm text-slate-700">
              {label}
              <input
                type={inputType}
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={props.homeBaseForm[key as keyof HomeBasesPanelProps['homeBaseForm']]}
                onChange={(event) =>
                  props.onHomeBaseFormChange({
                    [key]: event.target.value,
                  } as Partial<HomeBasesPanelProps['homeBaseForm']>)
                }
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={props.homeBaseSubmitting}
          onClick={props.onSubmitHomeBase}
          className="mt-4 rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-60"
        >
          {props.homeBaseSubmitting ? 'Saving...' : 'Add Home Base'}
        </button>
      </div>

      {props.message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{props.message}</p> : null}
      {props.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{props.error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              {['Name', 'Address', 'Opening', 'Closing', 'Active'].map((label) => (
                <th key={label} className="px-3 py-2 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {props.loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  Loading home bases...
                </td>
              </tr>
            ) : props.homeBases.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  No home bases yet. Add one above.
                </td>
              </tr>
            ) : (
              props.homeBases.map((homeBase) => (
                <tr key={homeBase.id}>
                  <td className="px-3 py-2 text-slate-700">{homeBase.name}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {homeBase.addressLine1}, {homeBase.city}, {homeBase.state} {homeBase.postalCode}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{formatMinuteValue(homeBase.openingMinute)}</td>
                  <td className="px-3 py-2 text-slate-700">{formatMinuteValue(homeBase.closingMinute)}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={homeBase.active}
                        onChange={() => props.onToggleActive(homeBase)}
                      />
                      {homeBase.active ? 'Active' : 'Inactive'}
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

type ForemenPanelProps = {
  foremen: ResourceRecord[];
  loading: boolean;
};

export function ForemenPanel(props: ForemenPanelProps) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Foremen</h2>
      {props.loading ? <p className="text-sm text-slate-500">Loading foremen...</p> : null}
      {!props.loading && props.foremen.length === 0 ? (
        <p className="text-sm text-slate-500">No foremen yet.</p>
      ) : null}
      <ul className="space-y-2">
        {props.foremen.map((foreman) => (
          <li key={foreman.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
            <span className="text-sm text-slate-700">{foreman.name}</span>
            <button type="button" className="text-sm font-medium text-slate-700 underline">
              View Roster
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-500">Roster management coming soon.</p>
    </section>
  );
}
