'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileText, Link } from 'lucide-react';

interface DocumentDropzoneProps {
  onDocumentAdded: (content: string, tipo: string, nombre?: string) => void;
  documentos: Array<{ tipo: string; nombre?: string; preview: string }>;
  onDocumentRemoved: (index: number) => void;
}

export function DocumentDropzone({ onDocumentAdded, documentos, onDocumentRemoved }: DocumentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState('');

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          const tipo = file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.md') ? 'MD' : 'Texto';
          onDocumentAdded(content, tipo, file.name);
        };
        if (file.name.endsWith('.pdf')) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });
    },
    [onDocumentAdded]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const tipo = file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.md') ? 'MD' : 'HU';
        onDocumentAdded(content, tipo, file.name);
      };
      if (file.name.endsWith('.pdf')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const addFigmaUrl = () => {
    if (figmaUrl.trim()) {
      onDocumentAdded(figmaUrl, 'Figma', 'Enlace Figma');
      setFigmaUrl('');
    }
  };

  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-3">Documentación (Opcional)</h3>
      <div
        className={`dropzone-area ${isDragging ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.md,.txt"
          className="hidden"
          onChange={handleFileInput}
        />
        <Upload className="w-8 h-8 text-neon-cyan/40 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Arrastra Historias de Usuario, Markdown o PDFs aquí</p>
        <p className="text-xs text-gray-600 mt-1">o haz clic para seleccionar archivos</p>
        <div className="flex items-center gap-2 justify-center mt-3">
          <span className="text-xs px-2 py-0.5 bg-forge-border rounded text-gray-500">PDF</span>
          <span className="text-xs px-2 py-0.5 bg-forge-border rounded text-gray-500">MD</span>
          <span className="text-xs px-2 py-0.5 bg-forge-border rounded text-gray-500">TXT</span>
        </div>
      </div>

      {/* Figma URL */}
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="url"
            placeholder="URL de Figma (https://figma.com/...)"
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            className="forge-input pl-9"
          />
        </div>
        <button
          onClick={addFigmaUrl}
          className="px-4 py-2 btn-forge-secondary text-sm rounded-lg"
        >
          Añadir
        </button>
      </div>

      {/* Files list */}
      {documentos.length > 0 && (
        <div className="mt-3 space-y-2">
          {documentos.map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-forge-surface rounded-lg border border-forge-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm text-gray-300">{doc.nombre || 'Documento'}</span>
                <span className="text-xs px-1.5 py-0.5 bg-forge-border rounded text-gray-500">{doc.tipo}</span>
              </div>
              <button onClick={() => onDocumentRemoved(i)} className="text-gray-600 hover:text-neon-red transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
