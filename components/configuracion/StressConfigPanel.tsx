'use client';

import { Zap, Clock, AlertTriangle } from 'lucide-react';

interface StressConfigPanelProps {
  peticiones: number;
  duracion: number;
  onPeticionesChange: (val: number) => void;
  onDuracionChange: (val: number) => void;
}

export function StressConfigPanel({
  peticiones,
  duracion,
  onPeticionesChange,
  onDuracionChange,
}: StressConfigPanelProps) {
  return (
    <div className="forge-card p-5 border-neon-amber/30 bg-neon-amber/5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-neon-amber/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-neon-amber" />
        </div>
        <h3 className="text-neon-amber font-semibold text-sm">Configuración de Estrés — k6</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">
            <Zap className="w-3 h-3 inline mr-1" />
            Usuarios Virtuales (VUs)
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={peticiones}
            onChange={(e) => onPeticionesChange(Number(e.target.value))}
            className="forge-input text-neon-amber"
            placeholder="50"
          />
          <p className="text-xs text-gray-600 mt-1">Peticiones concurrentes</p>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">
            <Clock className="w-3 h-3 inline mr-1" />
            Duración (segundos)
          </label>
          <input
            type="number"
            min={10}
            max={3600}
            value={duracion}
            onChange={(e) => onDuracionChange(Number(e.target.value))}
            className="forge-input text-neon-amber"
            placeholder="30"
          />
          <p className="text-xs text-gray-600 mt-1">Tiempo de ejecución</p>
        </div>
      </div>

      <div className="mt-3 p-3 bg-neon-amber/5 rounded-lg border border-neon-amber/20 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-neon-amber flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500">
          El script k6 se generará dinámicamente. VUs {'>'} 100 puede generar alta carga en el servidor objetivo.
        </p>
      </div>
    </div>
  );
}
