'use client';

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
  startSlot: number;
  endSlotExclusive: number;
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

export default function ScheduleBlock(props: ScheduleBlockProps) {
  const span = Math.max(1, props.block.endSlotExclusive - props.block.startSlot);
  const isTall = span >= 5;

  return (
    <details
      data-schedule-block="true"
      className={`group rounded-md border shadow-sm ${colorClassForState(props.block.state)}`}
    >
      <summary className="cursor-pointer list-none px-2 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold">{props.block.title}</p>
          <span className="text-[10px] font-medium">
            {props.block.startLabel}-{props.block.endLabel}
          </span>
        </div>
        {isTall ? <p className="mt-0.5 truncate text-[11px] opacity-90">{props.block.subtitle}</p> : null}
        {props.block.travelLabel ? <p className="mt-0.5 text-[10px] font-medium">{props.block.travelLabel}</p> : null}
      </summary>

      <div className="space-y-2 border-t border-white/30 bg-white/95 p-2 text-[11px] text-slate-900">
        <p>
          <span className="font-medium">Job state:</span> {props.block.jobStateLabel}
        </p>
        <p>
          <span className="font-medium">Scheduled:</span> {props.block.scheduledHoursLabel}
        </p>
        <p>
          <span className="font-medium">Remaining:</span> {props.block.remainingHoursLabel}
        </p>
        <button
          type="button"
          onClick={() => void props.onRemove(props.block.id)}
          className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
        >
          Remove segment
        </button>
      </div>
    </details>
  );
}
