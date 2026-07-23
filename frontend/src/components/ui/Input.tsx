import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx('w-full rounded-md border border-neutral/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary', className)}
      {...props}
    />
  );
}
