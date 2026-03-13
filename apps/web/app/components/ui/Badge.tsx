import { type HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-300/40',
  warning: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300/40',
  error: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-300/40',
  info: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-300/40',
  default: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300/40',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'default', className = '', children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
});

export default Badge;
