'use client';

import { useState } from 'react';
import { ResultadoTest, TipoPrueba, MODULOS } from '@/lib/types';
import { ErrorCard } from './ErrorCard';
import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';

interface ResultTabPanelProps {
  resultados: ResultadoTest[];
  modulosActivos: TipoPrueba[];
}

export function ResultTabPanel({ resultados, modulosActivos }: ResultTabPanelProps) {
  const [tabActiva, setTabActiva] = useState<TipoPrueba | 'todos'>('todos');

  const modulosConResultados = MODULOS.filter((m) => modulosActivos.includes(m.id));
  const tabs = [{ id: 'todos', nombre: 'Todos', icono: '🔍' }, ...modulosConResultados];

  const resultadosFiltrados =
    tabActiva === 'todos'
      ? resultados
      : resultados.filter((r) => r.tipo_prueba === tabActiva);

  const conteoTab = (tipo: string) =>
    tipo === 'todos'
      ? resultados.filter((r) => r.nivel_severidad !== 'exito').length
      : resultados.filter((r) => r.tipo_prueba === tipo && r.nivel_severidad !== 'exito').length;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0.5 overflow-x-auto pb-px border-b border-forge-border mb-4">
        {tabs.map((tab) => {
          const count = conteoTab(tab.id);
          const isActive = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id as TipoPrueba | 'todos')}
              className={clsx('tab-item flex items-center gap-1.5', isActive && 'active')}
            >
              <span>{tab.icono}</span>
              <span className="hidden sm:inline">{tab.nombre}</span>
              {count > 0 && (
                <span
                  className={clsx(
                    'text-xs rounded-full px-1.5 min-w-[18px] text-center font-bold',
                    isActive ? 'bg-neon-red/20 text-neon-red' : 'bg-forge-border text-gray-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {resultadosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-neon-green mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Sin errores detectados</p>
          <p className="text-sm text-gray-600 mt-1">Este módulo pasó todas las verificaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resultadosFiltrados.map((resultado, i) => (
            <ErrorCard key={resultado.id} resultado={resultado} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
