'use client';

import { useEffect, useState } from 'react';
import { TipoPrueba, MODULOS, ModuloConfig } from '@/lib/types';
import { clsx } from 'clsx';
import { CheckCircle2, XCircle, Loader2, Clock, SkipForward } from 'lucide-react';

type EstadoModulo = 'pendiente' | 'en_progreso' | 'completado' | 'fallido';

interface ProgressTrackerProps {
  modulosActivos: TipoPrueba[];
  progreso: number;
  estadoGeneral: string;
  onSkip?: () => void;
  skipping?: boolean;
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

function ModuleRow({
  modulo,
  estado,
  estadoGeneral,
  onSkip,
  skipping,
}: {
  modulo: ModuloConfig;
  estado: EstadoModulo;
  estadoGeneral: string;
  onSkip?: () => void;
  skipping?: boolean;
}) {
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (estado !== 'en_progreso') {
      setLocalProgress(0);
      return;
    }

    setLocalProgress(0);
    
    // Simulate real-time progress update locally every 250ms
    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        // Realistic random increments between 4% and 10%
        const inc = 4 + Math.floor(Math.random() * 7);
        return Math.min(95, prev + inc);
      });
    }, 250);

    return () => clearInterval(interval);
  }, [estado]);

  const porcentaje = estado === 'completado' ? 100 : (estado === 'en_progreso' ? localProgress : 0);

  return (
    <div
      className={clsx(
        'flex items-center justify-between p-3 rounded-lg border transition-all',
        estado === 'completado' ? 'border-neon-green/20 bg-neon-green/5' :
        estado === 'en_progreso' ? 'border-neon-cyan/20 bg-neon-cyan/5' :
        estado === 'fallido' ? 'border-neon-red/20 bg-neon-red/5' :
        'border-forge-border bg-forge-surface/50'
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-lg flex-shrink-0">{modulo.icono}</span>
        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-medium truncate', estado === 'pendiente' ? 'text-gray-400' : 'text-gray-200')}>
            {modulo.nombre}
          </p>
          {estado === 'en_progreso' && (
            <div className="mt-1.5 w-28 bg-gray-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-neon-cyan h-full transition-all duration-300"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {estadoIcon[estado]}
          <span className={clsx('text-xs font-semibold mr-1 whitespace-nowrap', estadoColor[estado])}>
            {estado === 'en_progreso' ? `Ejecutando... ${porcentaje}%` : estadoLabel[estado]}
          </span>
        </div>
        {estado === 'en_progreso' && estadoGeneral === 'en_progreso' && onSkip && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            disabled={skipping}
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-neon-red/40 bg-neon-red/10 text-neon-red hover:bg-neon-red/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            title="Interrumpir este módulo y continuar"
          >
            {skipping ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <SkipForward className="w-3.5 h-3.5" />
            )}
            Interrumpir
          </button>
        )}
      </div>
    </div>
  );
}

export function ProgressTracker({
  modulosActivos,
  progreso,
  estadoGeneral,
  onSkip,
  skipping = false,
}: ProgressTrackerProps) {
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
          <ModuleRow
            key={modulo.id}
            modulo={modulo}
            estado={estado}
            estadoGeneral={estadoGeneral}
            onSkip={onSkip}
            skipping={skipping}
          />
        );
      })}
    </div>
  );
}
