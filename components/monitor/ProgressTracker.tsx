'use client';

import { TipoPrueba, MODULOS } from '@/lib/types';
import { clsx } from 'clsx';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

type EstadoModulo = 'pendiente' | 'en_progreso' | 'completado' | 'fallido';

interface ProgressTrackerProps {
  modulosActivos: TipoPrueba[];
  progreso: number;
  estadoGeneral: string;
}

function getEstadoModulo(modulo: TipoPrueba, progreso: number, modulosActivos: TipoPrueba[], estadoGeneral: string): EstadoModulo {
  const indice = modulosActivos.indexOf(modulo);
  const total = modulosActivos.length;
  const porModulo = total > 0 ? 100 / total : 0;
  const progresoModulo = indice * porModulo;

  if (estadoGeneral === 'pendiente') return 'pendiente';
  if (estadoGeneral === 'completado') return 'completado';
  if (estadoGeneral === 'fallido') return indice === 0 ? 'fallido' : 'pendiente';

  if (progreso >= (indice + 1) * porModulo) return 'completado';
  if (progreso >= progresoModulo) return 'en_progreso';
  return 'pendiente';
}

const estadoIcon: Record<EstadoModulo, React.ReactNode> = {
  pendiente: <Clock className="w-4 h-4 text-gray-600" />,
  en_progreso: <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />,
  completado: <CheckCircle2 className="w-4 h-4 text-neon-green" />,
  fallido: <XCircle className="w-4 h-4 text-neon-red" />,
};

const estadoLabel: Record<EstadoModulo, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'Ejecutando...',
  completado: 'Completado',
  fallido: 'Fallido',
};

const estadoColor: Record<EstadoModulo, string> = {
  pendiente: 'text-gray-500',
  en_progreso: 'text-neon-cyan',
  completado: 'text-neon-green',
  fallido: 'text-neon-red',
};

export function ProgressTracker({ modulosActivos, progreso, estadoGeneral }: ProgressTrackerProps) {
  const modulosConfig = MODULOS.filter((m) => modulosActivos.includes(m.id));

  return (
    <div className="space-y-2">
      {/* Barra de progreso general */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">Progreso General</span>
          <span className="text-sm font-bold text-neon-cyan">{progreso}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Módulos individuales */}
      {modulosConfig.map((modulo) => {
        const estado = getEstadoModulo(modulo.id, progreso, modulosActivos, estadoGeneral);
        return (
          <div
            key={modulo.id}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-lg border transition-all',
              estado === 'completado' ? 'border-neon-green/20 bg-neon-green/5' :
              estado === 'en_progreso' ? 'border-neon-cyan/20 bg-neon-cyan/5' :
              estado === 'fallido' ? 'border-neon-red/20 bg-neon-red/5' :
              'border-forge-border bg-forge-surface/50'
            )}
          >
            <span className="text-lg">{modulo.icono}</span>
            <div className="flex-1 min-w-0">
              <p className={clsx('text-sm font-medium', estado === 'pendiente' ? 'text-gray-400' : 'text-gray-200')}>
                {modulo.nombre}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {estadoIcon[estado]}
              <span className={clsx('text-xs font-semibold', estadoColor[estado])}>
                {estadoLabel[estado]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
