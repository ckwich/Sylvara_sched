'use client';

import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef, useId } from 'react';

// ─── Text / Number Input ─────────────────────────────────

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label?: string;
  error?: string | null;
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField({ label, error, className = '', ...rest }, ref) {
    const autoId = useId();
    const errorId = error ? `${autoId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label htmlFor={autoId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={autoId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`rounded-md border px-2 py-1.5 text-sm ${
            error ? 'border-red-400' : 'border-slate-300'
          } ${className}`}
          {...rest}
        />
        {error ? (
          <p id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

// ─── Select ──────────────────────────────────────────────

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label?: string;
  error?: string | null;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ label, error, className = '', children, ...rest }, ref) {
    const autoId = useId();
    const errorId = error ? `${autoId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label htmlFor={autoId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={autoId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`rounded-md border bg-white px-2 py-1.5 text-sm ${
            error ? 'border-red-400' : 'border-slate-300'
          } ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error ? (
          <p id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

// ─── Textarea ────────────────────────────────────────────

type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label?: string;
  error?: string | null;
};

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ label, error, className = '', ...rest }, ref) {
    const autoId = useId();
    const errorId = error ? `${autoId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label htmlFor={autoId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={autoId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`rounded-md border px-2 py-1.5 text-sm ${
            error ? 'border-red-400' : 'border-slate-300'
          } ${className}`}
          {...rest}
        />
        {error ? (
          <p id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
