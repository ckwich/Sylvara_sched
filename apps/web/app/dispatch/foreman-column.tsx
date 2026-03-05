'use client';

import type { MouseEvent, RefObject } from 'react';
import { useRef } from 'react';
import CrewAddPanel from './crew-add-panel';
import { DAY_START_MINUTE, PX_PER_MINUTE } from './dispatch-utils';
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
  onJobSaved: () => Promise<void>;
  salesRepCodes: string[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const TOTAL_SLOTS = 24 * 6;
const TOTAL_HEIGHT_PX = TOTAL_SLOTS * 10 * PX_PER_MINUTE;

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
  const columnRef = useRef<HTMLDivElement | null>(null);

  function handleGridClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('[data-schedule-block="true"]')) {
      return;
    }

    const rect = columnRef.current?.getBoundingClientRect();
    const scrollContainer = props.scrollContainerRef.current;
    if (!rect || !scrollContainer) {
      return;
    }

    const relativeY = event.clientY - rect.top + scrollContainer.scrollTop;
    const rawMinute = DAY_START_MINUTE + Math.floor(relativeY / PX_PER_MINUTE);
    const snappedMinute = Math.floor(rawMinute / 10) * 10;
    const normalizedMinute = ((snappedMinute % 1440) + 1440) % 1440;
    props.onSelectMinute({ foremanId: props.foremanId, minute: normalizedMinute });
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

      <div ref={columnRef} className="relative cursor-pointer" onClick={handleGridClick}>
        <div className="relative" style={{ height: `${TOTAL_HEIGHT_PX}px` }}>
          {Array.from({ length: TOTAL_SLOTS }).map((_, slot) => (
            <div
              key={`slot-${slot}`}
              className={`h-[15px] w-full hover:bg-blue-50 ${slotLineClass(slot)}`}
            />
          ))}
          {props.blocks.map((block) => (
            <div
              key={`block-${block.id}`}
              className="absolute left-0 right-0 p-1"
              style={{ top: `${block.topPx}px`, height: `${block.heightPx}px` }}
            >
              <ScheduleBlock
                block={block}
                onRemove={props.onRemoveSegment}
                onJobSaved={props.onJobSaved}
                salesRepCodes={props.salesRepCodes}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
