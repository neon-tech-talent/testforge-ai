import { NivelSeveridad } from '@/lib/types';
import { clsx } from 'clsx';

interface BadgeProps {
  severidad: NivelSeveridad | 'default';
  children: React.ReactNode;
  className?: string;
}

const severidadConfig = {
  critico: { label: '⚠ CRÍTICO', class: 'badge-critico' },
  advertencia: { label: '⚡ ADVERTENCIA', class: 'badge-advertencia' },
  info: { label: 'ℹ INFO', class: 'badge-info' },
  exito: { label: '✓ ÉXITO', class: 'badge-exito' },
  default: { label: '', class: 'bg-gray-800 text-gray-400 border border-gray-700' },
};

export function Badge({ severidad, children, className }: BadgeProps) {
  const config = severidadConfig[severidad] || severidadConfig.default;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
        config.class,
        className
      )}
    >
      {children}
    </span>
  );
}

export function SeveridadBadge({ severidad }: { severidad: NivelSeveridad }) {
  const config = severidadConfig[severidad];
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
        config.class
      )}
    >
      {config.label}
    </span>
  );
}
