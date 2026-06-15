'use client';

import { useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface AISolutionBlockProps {
  codigo: string;
  lenguaje?: string;
  descripcionError: string;
}

export function AISolutionBlock({ codigo, lenguaje = 'typescript', descripcionError }: AISolutionBlockProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = codigo;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-neon-cyan/20 bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#1f2937]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs font-bold text-neon-cyan uppercase tracking-wider">
            Solución de la IA
          </span>
          <span className="text-xs text-gray-600 font-mono">.{lenguaje}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            copiado
              ? 'bg-neon-green/10 border-neon-green/40 text-neon-green'
              : 'bg-white/5 border-forge-border text-gray-400 hover:text-gray-200 hover:border-gray-500'
          }`}
        >
          {copiado ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar código
            </>
          )}
        </button>
      </div>

      {/* Error context */}
      <div className="px-4 py-2 bg-neon-red/5 border-b border-neon-red/10">
        <p className="text-xs text-gray-500">
          <span className="text-neon-red font-semibold">Error: </span>
          {descripcionError}
        </p>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={lenguaje === 'typescript' ? 'typescript' : lenguaje === 'css' ? 'css' : lenguaje === 'sql' ? 'sql' : 'javascript'}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '20px 16px',
          background: '#0d1117',
          fontSize: '0.78rem',
          lineHeight: '1.6',
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
        }}
        showLineNumbers
        lineNumberStyle={{ color: '#374151', minWidth: '2.5em' }}
        wrapLongLines
      >
        {codigo}
      </SyntaxHighlighter>
    </div>
  );
}
