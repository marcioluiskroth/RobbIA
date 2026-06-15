import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina classes (clsx) resolvendo conflitos do Tailwind (twMerge) — base shadcn/ui. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
