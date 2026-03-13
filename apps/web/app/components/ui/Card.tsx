import { type HTMLAttributes, forwardRef } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: 'sm' | 'md' | 'lg';
};

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = 'md', className = '', children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${paddingClasses[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
