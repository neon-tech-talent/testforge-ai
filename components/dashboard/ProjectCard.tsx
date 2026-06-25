'use client';

import Link from 'next/link';
import { Proyecto } from '@/lib/types';
import { ExternalLink, Calendar, ArrowRight, Activity } from 'lucide-react';

interface ProjectCardProps {
  proyecto: Proyecto;
}

export function ProjectCard({ proyecto }: ProjectCardProps) {
  const fechaCreacion = new Date(proyecto.creado_en).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="forge-card p-5 group cursor-pointer hover:forge-card-active transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate mb-1">
            {proyecto.nombre}
          </h3>
          <a
            href={proyecto.url_sitio}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-neon-cyan/70 hover:text-neon-cyan flex items-center gap-1 transition-colors truncate max-w-[200px]"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            {proyecto.url_sitio.replace('https://', '').replace('http://', '')}
          </a>
        </div>
        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0 ml-3">
          <Activity className="w-4 h-4 text-neon-cyan" />
        </div>
      </div>

      {proyecto.descripcion && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{proyecto.descripcion}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-forge-border">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar className="w-3 h-3" />
          {fechaCreacion}
        </div>
        <Link
          href={`/proyectos/${proyecto.id}`}
          className="flex items-center gap-1 text-xs text-neon-cyan font-semibold group-hover:gap-2 transition-all"
        >
          Ver Proyecto
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
