'use client';

import type { MouseEvent, RefObject } from 'react';
import { useRef } from 'react';
import { DAY_START_MINUTE, PX_PER_MINUTE } from './dispatch-utils';
import ScheduleBlock, { type ScheduleBlockData } from './schedule-block';

type ForemanColumnProps = {
  foremanId: string;
  blocks: ScheduleBlockData[];
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
    <section className="flex-1 min-w-[160px] border-l border-slate-200 first:border-l-0">
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
