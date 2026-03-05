'use client';

import { useEffect, useRef, useState } from 'react';

type BlockVisualState = 'TBS' | 'PARTIALLY_SCHEDULED' | 'FULLY_SCHEDULED' | 'COMPLETED' | 'TRAVEL';

export type ScheduleBlockData = {
  id: string;
  title: string;
  subtitle: string;
  state: BlockVisualState;
  startLabel: string;
  endLabel: string;
  scheduledHoursLabel: string;
  remainingHoursLabel: string;
  jobStateLabel: string;
  travelLabel?: string;
  topPx: number;
  heightPx: number;
  startMinuteOfDay: number;
  endMinuteOfDay: number;
};

type ScheduleBlockProps = {
  block: ScheduleBlockData;
  onRemove: (blockId: string) => Promise<void>;
};

function colorClassForState(state: BlockVisualState): string {
  if (state === 'FULLY_SCHEDULED') {
    return 'border-green-600 bg-green-500 text-white';
  }
  if (state === 'COMPLETED') {
    return 'border-slate-500 bg-slate-400 text-white';
  }
  if (state === 'TRAVEL') {
    return 'border-amber-500 bg-amber-400 text-amber-950';
  }
  return 'border-blue-600 bg-blue-500 text-white';
}

function formatDuration(startMinuteOfDay: number, endMinuteOfDay: number): string {
  const durationMinutes = Math.max(0, endMinuteOfDay - startMinuteOfDay);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export default function ScheduleBlock(props: ScheduleBlockProps) {
  const isTall = props.block.heightPx >= 75;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      data-schedule-block="true"
      className={`group relative h-full rounded-md border shadow-sm ${colorClassForState(props.block.state)}`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="h-full w-full cursor-pointer px-2 py-1.5 text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold">{props.block.title}</p>
          <span className="text-[10px] font-medium">
            {props.block.startLabel}-{props.block.endLabel}
          </span>
        </div>
        {isTall ? <p className="mt-0.5 truncate text-[11px] opacity-90">{props.block.subtitle}</p> : null}
        {props.block.travelLabel ? <p className="mt-0.5 text-[10px] font-medium">{props.block.travelLabel}</p> : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-1 w-60 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg">
          <p className="font-semibold text-slate-900">{props.block.title}</p>
          <p className="text-slate-600">{props.block.subtitle}</p>
          <p className="mt-2">
            {props.block.startLabel} - {props.block.endLabel}
          </p>
          <p>Duration: {formatDuration(props.block.startMinuteOfDay, props.block.endMinuteOfDay)}</p>
          <button
            type="button"
            onClick={async () => {
              await props.onRemove(props.block.id);
              setOpen(false);
            }}
            className="mt-3 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}
