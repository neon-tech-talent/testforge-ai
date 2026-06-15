'use client';

import { useEffect, useRef } from 'react';
import { LogConsola } from '@/lib/types';

interface ConsoleLogProps {
  logs: LogConsola[];
}

const levelClass: Record<string, string> = {
  info: 'log-info',
  warn: 'log-warn',
  error: 'log-error',
  success: 'log-success',
  system: 'log-system',
};

const levelPrefix: Record<string, string> = {
  info: '[INFO]',
  warn: '[WARN]',
  error: '[ERROR]',
  success: '[OK]',
  system: '[SYS]',
};

export function ConsoleLog({ logs }: ConsoleLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="console-container">
      {logs.length === 0 ? (
        <p className="text-gray-700 text-xs">
          Esperando inicio de ejecución<span className="animate-blink-cursor">_</span>
        </p>
      ) : (
        logs.map((log, i) => {
          const time = new Date(log.timestamp).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          return (
            <div key={i} className={`flex gap-2 mb-1 ${levelClass[log.nivel] || 'text-gray-400'}`}>
              <span className="text-gray-600 flex-shrink-0">{time}</span>
              <span className="flex-shrink-0 font-semibold">{levelPrefix[log.nivel] || '[LOG]'}</span>
              <span className="break-all">{log.mensaje}</span>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
}
