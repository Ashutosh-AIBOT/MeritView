import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({ variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'rounded-md px-4 py-2 font-medium transition',
        variant === 'primary' && 'bg-primary text-white hover:opacity-90',
        variant === 'secondary' && 'bg-secondary text-white hover:opacity-90',
        variant === 'ghost' && 'bg-transparent text-primary hover:bg-primary/10',
        className,
      )}
      {...props}
    />
  );
}
