'use client';

import { MODULOS, ModuloConfig, TipoPrueba } from '@/lib/types';
import { Toggle } from '@/components/ui/Toggle';
import { clsx } from 'clsx';

interface ModuleTogglePanelProps {
  modulosActivos: TipoPrueba[];
  onChange: (modulos: TipoPrueba[]) => void;
}

const colorAccent: Record<string, string> = {
  cyan: 'border-neon-cyan/40 bg-neon-cyan/5',
  green: 'border-neon-green/40 bg-neon-green/5',
  amber: 'border-neon-amber/40 bg-neon-amber/5',
  red: 'border-neon-red/40 bg-neon-red/5',
  purple: 'border-[#bf5af2]/40 bg-[#bf5af2]/5',
};

const colorText: Record<string, string> = {
  cyan: 'text-neon-cyan',
  green: 'text-neon-green',
  amber: 'text-neon-amber',
  red: 'text-neon-red',
  purple: 'text-[#bf5af2]',
};

function ModuleCard({ modulo, activo, onToggle }: { modulo: ModuloConfig; activo: boolean; onToggle: (id: TipoPrueba) => void }) {
  return (
    <div
      className={clsx(
        'forge-card p-4 transition-all duration-300 cursor-pointer group',
        activo && colorAccent[modulo.color]
      )}
      onClick={() => onToggle(modulo.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{modulo.icono}</span>
          <div>
            <h3
              className={clsx(
                'text-sm font-semibold transition-colors',
                activo ? colorText[modulo.color] : 'text-gray-300'
              )}
            >
              {modulo.nombre}
            </h3>
            {activo && (
              <span className={clsx('text-xs font-bold', colorText[modulo.color])}>ACTIVO</span>
            )}
          </div>
        </div>
        {/* stopPropagation evita que el click del Toggle dispare tambien el onClick del div padre */}
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle
            checked={activo}
            onChange={() => onToggle(modulo.id)}
            id={`toggle-${modulo.id}`}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{modulo.descripcion}</p>
    </div>
  );
}

export function ModuleTogglePanel({ modulosActivos, onChange }: ModuleTogglePanelProps) {
  const handleToggle = (id: TipoPrueba) => {
    const nuevos = modulosActivos.includes(id)
      ? modulosActivos.filter((m) => m !== id)
      : [...modulosActivos, id];
    onChange(nuevos);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-bold text-lg">Módulos de Testing</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {modulosActivos.length} de {MODULOS.length} módulos activos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onChange(MODULOS.map((m) => m.id))}
            className="text-xs text-neon-cyan hover:text-white transition-colors px-3 py-1.5 border border-neon-cyan/30 rounded-lg hover:bg-neon-cyan/10"
          >
            Todos
          </button>
          <button
            onClick={() => onChange([])}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 border border-forge-border rounded-lg hover:bg-white/5"
          >
            Ninguno
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {MODULOS.map((modulo) => (
          <ModuleCard
            key={modulo.id}
            modulo={modulo}
            activo={modulosActivos.includes(modulo.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
