import { cn } from './cn.js'

const VARIANTES = {
  primary:
    'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-[0_10px_25px_-12px_rgba(79,70,229,0.9)] hover:from-indigo-500 hover:to-indigo-600 active:from-indigo-700 active:to-indigo-700',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900',
  ghost: 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700',
  light:
    'bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/20 active:bg-white/25',
}

const TAMANOS = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-[13px]',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-2xl px-5 text-[15px]',
}

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTES[variant],
    TAMANOS[size],
    className,
  )
}
