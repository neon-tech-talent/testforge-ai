'use client';

import { useState } from 'react';
import { ResultadoTest } from '@/lib/types';
import { SeveridadBadge } from '@/components/ui/Badge';
import { AISolutionBlock } from './AISolutionBlock';
import { ChevronDown, ChevronUp, Code2, Globe, Monitor } from 'lucide-react';
import { clsx } from 'clsx';

interface ErrorCardProps {
  resultado: ResultadoTest;
  index: number;
}

const severidadBorder: Record<string, string> = {
  critico: 'border-l-neon-red',
  advertencia: 'border-l-neon-amber',
  info: 'border-l-neon-cyan',
  exito: 'border-l-neon-green',
};

export function ErrorCard({ resultado, index }: ErrorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const hasSolution = !!resultado.codigo_solucion_sugerido;
  const hasScreenshot = !!resultado.captura_pantalla_url;

  return (
    <div
      className={clsx(
        'forge-card border-l-4 overflow-hidden animate-fade-in',
        severidadBorder[resultado.nivel_severidad] || 'border-l-gray-600'
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header siempre visible */}
      <div
        className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <SeveridadBadge severidad={resultado.nivel_severidad} />
              <span className="text-xs text-gray-500 capitalize font-mono">{resultado.tipo_prueba}</span>
            </div>
            <p className="text-sm text-gray-200 font-medium leading-snug">
              {resultado.descripcion_error}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasSolution && (
              <span className="text-xs text-neon-cyan flex items-center gap-1">
                <Code2 className="w-3 h-3" />
                Fix IA
              </span>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>

        {/* Preview del elemento HTML afectado */}
        {resultado.componente_afectado_html && (
          <div className="mt-2 font-mono text-xs text-gray-500 bg-forge-surface rounded-lg px-3 py-2 truncate border border-forge-border">
            {resultado.componente_afectado_html}
          </div>
        )}
      </div>

      {/* Contenido expandido */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-forge-border">
          {resultado.url_afectada && (
            <div className="flex items-center gap-2 pt-3">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <a
                href={resultado.url_afectada}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neon-cyan hover:underline truncate"
              >
                {resultado.url_afectada}
              </a>
            </div>
          )}

          {hasScreenshot && (
            <div className="rounded-lg overflow-hidden border border-forge-border">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-forge-surface border-b border-forge-border">
                <Monitor className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500">Captura de pantalla</span>
              </div>
              <img
                src={resultado.captura_pantalla_url!}
                alt="Captura de pantalla del error"
                className="w-full object-cover max-h-48"
              />
            </div>
          )}

          {resultado.metadatos_adicionales && Object.keys(resultado.metadatos_adicionales).length > 0 && (
            <div className="bg-forge-surface rounded-lg p-3 border border-forge-border">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Métricas</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(resultado.metadatos_adicionales).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-mono font-semibold text-gray-200">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSolution && (
            <>
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 text-xs text-neon-cyan font-semibold hover:text-white transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                {showCode ? 'Ocultar solución' : 'Ver solución de la IA'}
                {showCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showCode && (
                <AISolutionBlock
                  codigo={resultado.codigo_solucion_sugerido!}
                  lenguaje={resultado.lenguaje_codigo || 'typescript'}
                  descripcionError={resultado.descripcion_error}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
