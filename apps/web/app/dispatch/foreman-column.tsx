'use client';

import type { ReactNode } from 'react';
import CrewAddPanel from './crew-add-panel';
import ScheduleBlock, { type ScheduleBlockData } from './schedule-block';

type CrewMember = {
  id: string;
  name: string;
  role: string;
};

type ForemanColumnProps = {
  foremanId: string;
  foremanName: string;
  crew: CrewMember[];
  blocks: ScheduleBlockData[];
  peopleOptions: Array<{ id: string; name: string }>;
  homeBaseOptions: Array<{ id: string; name: string }>;
  requireHomeBaseChoice: boolean;
  addingCrew: boolean;
  crewError: string | null;
  onAddCrew: (input: { personResourceId: string; role: 'CLIMBER' | 'GROUND' | 'OPERATOR' | 'OTHER'; homeBaseId?: string }) => Promise<void>;
  onSelectMinute: (input: { foremanId: string; minute: number }) => void;
  onRemoveSegment: (segmentId: string) => Promise<void>;
};

const TOTAL_SLOTS = 24 * 6;

function slotLineClass(slot: number): string {
  if (slot % 6 === 0) {
    return 'border-t border-slate-300';
  }
  if (slot % 3 === 0) {
    return 'border-t border-slate-200';
  }
  return 'border-t border-slate-100';
}

export default function ForemanColumn(props: ForemanColumnProps) {
  const blockByStart = new Map<number, ScheduleBlockData>();
  for (const block of props.blocks) {
    blockByStart.set(block.startSlot, block);
  }

  const rows: ReactNode[] = [];
  for (let slot = 0; slot < TOTAL_SLOTS; slot += 1) {
    const block = blockByStart.get(slot);
    if (block) {
      const span = Math.max(1, block.endSlotExclusive - block.startSlot);
      rows.push(
        <div key={`block-${block.id}-${slot}`} className={`${slotLineClass(slot)} relative`}>
          <div aria-hidden className="pointer-events-none">
            {Array.from({ length: span }).map((_, index) => (
              <div key={`${block.id}-h-${index}`} className="h-[15px]" />
            ))}
          </div>
          <div className="absolute inset-0 p-1">
            <ScheduleBlock block={block} onRemove={props.onRemoveSegment} />
          </div>
        </div>,
      );
      slot += span - 1;
      continue;
    }

    rows.push(
      <button
        key={`slot-${slot}`}
        type="button"
        onClick={() => props.onSelectMinute({ foremanId: props.foremanId, minute: slot * 10 })}
        className={`h-[15px] w-full text-left hover:bg-blue-50 ${slotLineClass(slot)}`}
        aria-label={`Add segment at minute ${slot * 10}`}
      />,
    );
  }

  return (
    <section className="flex-none w-48 border-l border-slate-200 first:border-l-0">
      <header
        className="sticky top-0 z-10 border-b border-slate-200 bg-white p-3"
        style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}
      >
        <p className="text-sm font-semibold text-slate-900">{props.foremanName}</p>
        {props.crew.length > 0 ? (
          <ul className="mt-1 space-y-0.5">
            {props.crew.map((member) => (
              <li key={member.id} className="text-xs text-slate-500">
                {member.name} - {member.role}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-slate-500">No crew assigned</p>
        )}
        <details className="mt-2">
          <summary className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">
            + Add Crew
          </summary>
          <CrewAddPanel
            people={props.peopleOptions}
            busy={props.addingCrew}
            error={props.crewError}
            onSubmit={props.onAddCrew}
            onCancel={() => undefined}
            homeBaseOptions={props.homeBaseOptions}
            requireHomeBaseChoice={props.requireHomeBaseChoice}
          />
        </details>
      </header>

      <div className="relative">{rows}</div>
    </section>
  );
}
