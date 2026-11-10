import { cn } from '../../lib/cn.js'

const TONOS = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-200/70',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200/70',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200/70',
  light: 'bg-white/10 text-white ring-white/20',
}

export function Badge({ tono = 'slate', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1',
        TONOS[tono] ?? TONOS.slate,
        className,
      )}
    >
      {children}
    </span>
  )
}
