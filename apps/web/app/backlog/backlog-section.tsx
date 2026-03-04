import type { EquipmentFilter, EquipmentType, SectionData } from './backlog-types';
import { EQUIPMENT_LABELS, STATE_LABELS } from './backlog-types';
import { formatDollars, formatHours, parseDecimal } from './backlog-helpers';

const STATE_BADGE_CLASS = {
  TBS: 'bg-slate-100 text-slate-700 ring-slate-300',
  PARTIALLY_SCHEDULED: 'bg-amber-100 text-amber-800 ring-amber-300',
  FULLY_SCHEDULED: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  COMPLETED: 'bg-blue-100 text-blue-800 ring-blue-300',
} as const;

function rowCellClassName(isTotals: boolean): string {
  return isTotals ? 'px-3 py-2 font-semibold text-slate-700' : 'px-3 py-2 text-slate-700';
}

type BacklogSectionProps = {
  section: SectionData;
  equipmentFilter: EquipmentFilter;
  isOpen: boolean;
  onToggle: (equipmentType: EquipmentType) => void;
};

export default function BacklogSection({ section, equipmentFilter, isOpen, onToggle }: BacklogSectionProps) {
  if (equipmentFilter !== 'ALL' && section.equipmentType !== equipmentFilter) {
    return null;
  }
  if (section.groups.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-t-xl px-4 py-3 text-left"
        onClick={() => onToggle(section.equipmentType)}
      >
        <h2 className="text-xl font-semibold text-slate-900">{EQUIPMENT_LABELS[section.equipmentType]}</h2>
        <span className="text-sm text-slate-500">{isOpen ? 'Collapse' : 'Expand'}</span>
      </button>

      {isOpen ? (
        <div className="overflow-x-auto border-t border-slate-200 px-2 pb-3">
          {section.groups.map((group) => (
            <div key={group.repCode} className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              <div className="bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">Rep: {group.repCode}</div>
              <table className="min-w-full text-sm">
                <thead className="bg-white text-left text-slate-500">
                  <tr>
                    {['Customer', 'Town', 'State', 'Est. Hours', 'Sched. Hours', 'Remaining', 'Amount', 'Blockers', 'Requirements', 'Push-up'].map((label) => (
                      <th key={label} className="px-3 py-2 font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.jobs.map((job) => (
                    <tr key={job.id} className="bg-white">
                      <td className={rowCellClassName(false)}>{job.customerName}</td>
                      <td className={rowCellClassName(false)}>{job.town}</td>
                      <td className={rowCellClassName(false)}>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATE_BADGE_CLASS[job.derivedState]}`}
                        >
                          {STATE_LABELS[job.derivedState]}
                        </span>
                      </td>
                      <td className={rowCellClassName(false)}>{formatHours(parseDecimal(job.estimateHoursCurrent))}</td>
                      <td className={rowCellClassName(false)}>{formatHours(parseDecimal(job.scheduledEffectiveHours))}</td>
                      <td className={rowCellClassName(false)}>{formatHours(parseDecimal(job.remainingHours))}</td>
                      <td className={rowCellClassName(false)}>{formatDollars(parseDecimal(job.amountDollars))}</td>
                      <td className={rowCellClassName(false)}>
                        <span
                          className={`inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${job.activeBlockerCount > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {job.activeBlockerCount}
                        </span>
                      </td>
                      <td className={rowCellClassName(false)}>
                        <span
                          className={`inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${job.unmetRequirementCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {job.unmetRequirementCount}
                        </span>
                      </td>
                      <td className={rowCellClassName(false)}>{job.pushUpIfPossible ? '↑' : ''}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td className={rowCellClassName(true)} colSpan={3}>
                      Rep Total
                    </td>
                    <td className={rowCellClassName(true)}>{formatHours(group.totals.estimateHours)}</td>
                    <td className={rowCellClassName(true)}>{formatHours(group.totals.scheduledHours)}</td>
                    <td className={rowCellClassName(true)}>{formatHours(group.totals.remainingHours)}</td>
                    <td className={rowCellClassName(true)}>{formatDollars(group.totals.amountDollars)}</td>
                    <td className={rowCellClassName(true)} colSpan={3}>
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          <div className="mt-3 rounded-lg border-2 border-slate-800 bg-slate-900/5 px-3 py-2">
            <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-900">
              <span className="col-span-3">Grand Total</span>
              <span>{formatHours(section.totals.estimateHours)}</span>
              <span>{formatHours(section.totals.scheduledHours)}</span>
              <span>{formatHours(section.totals.remainingHours)}</span>
              <span>{formatDollars(section.totals.amountDollars)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
