export type MinuteWindow = {
  startMinute: number;
  endMinute: number;
};

export type Rejection = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type Warning = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type AttemptReject = {
  result: 'REJECT';
  rejections: Rejection[];
  warnings: Warning[];
};

export type AttemptAccept<T extends Record<string, unknown>> = {
  result: 'ACCEPT';
  warnings: Warning[];
} & T;

export type AttemptResult<T extends Record<string, unknown>> = AttemptAccept<T> | AttemptReject;
