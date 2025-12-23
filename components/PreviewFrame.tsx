import React, { useEffect, useRef, useState } from 'react';
import { FileNode } from '../types/index';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface PreviewFrameProps {
  files: FileNode[];
}

const flattenFiles = (nodes: FileNode[], path = ''): Record<string, string> => {
  let acc: Record<string, string> = {};
  if (!nodes) return acc;
  for (const node of nodes) {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    if (node.type === 'file' && node.content) {
      acc[currentPath] = node.content;
    } else if (node.children) {
      acc = { ...acc, ...flattenFiles(node.children, currentPath) };
    }
  }
  return acc;
};

declare global {
  interface Window {
    Babel: any;
  }
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ files }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    buildPreview();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [files]);

  const buildPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const fileMap = flattenFiles(files);
      const indexHtmlPath = Object.keys(fileMap).find(f => f.endsWith('index.html'));

      if (!indexHtmlPath) {
        throw new Error("No index.html found in the project. Project must have an entry index.html.");
      }

      let indexHtml = fileMap[indexHtmlPath];
      
      const importMap = {
        imports: {
          "react": "https://esm.sh/react@^19.2.3",
          "react-dom/client": "https://esm.sh/react-dom@^19.2.3/client",
          "lucide-react": "https://esm.sh/lucide-react@^0.561.0",
        } as Record<string, string>
      };

      const blobUrls: Record<string, string> = {};
      
      for (const [path, content] of Object.entries(fileMap)) {
        if (path === indexHtmlPath) continue;

        let processedContent = content;
        let mimeType = 'application/javascript';

        if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.jsx')) {
          try {
            if (window.Babel) {
                const result = window.Babel.transform(content, {
                    presets: ['react', 'typescript'],
                    filename: path,
                });
                processedContent = result.code;
            }
          } catch (e: any) {
            console.error(`Compilation error in ${path}:`, e);
            throw new Error(`Failed to compile ${path}: ${e.message}`);
          }
        } else if (path.endsWith('.css')) {
            mimeType = 'text/css';
        }

        const blob = new Blob([processedContent], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        blobUrls[path] = blobUrl;

        const fileName = path.split('/').pop()!;
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        
        importMap.imports[`./${path}`] = blobUrl;
        importMap.imports[`./${nameWithoutExt}`] = blobUrl;
        importMap.imports[`./${fileName}`] = blobUrl;
        // Support deep nesting imports
        if (path.includes('/')) {
           importMap.imports[path] = blobUrl;
        }
      }

      const importMapScript = `<script type="importmap">${JSON.stringify(importMap)}</script>`;
      
      const tailwindScript = indexHtml.includes('cdn.tailwindcss.com') 
        ? '' 
        : '<script src="https://cdn.tailwindcss.com"></script>';

      const errorHandlerScript = `
        <script>
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'preview-error', message: message }, '*');
            return true;
          };
          window.onunhandledrejection = function(event) {
            window.parent.postMessage({ type: 'preview-error', message: event.reason?.message || 'Unhandled Rejection' }, '*');
          };
        </script>
      `;

      let finalHtml = indexHtml.replace(
        /<script\s+[^>]*src="\.?\/?([^"]+)"[^>]*><\/script>/g, 
        (match, srcPath) => {
           const cleanPath = srcPath.startsWith('./') ? srcPath.slice(2) : (srcPath.startsWith('/') ? srcPath.slice(1) : srcPath);
           const blob = blobUrls[cleanPath] || blobUrls[srcPath];
           if (blob) {
               return `<script type="module" src="${blob}"></script>`;
           }
           return match;
        }
      );

      finalHtml = finalHtml.replace('</head>', `${tailwindScript}\n${importMapScript}\n${errorHandlerScript}\n</head>`);

      const finalBlob = new Blob([finalHtml], { type: 'text/html' });
      const finalUrl = URL.createObjectURL(finalBlob);
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(finalUrl);
      setLoading(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to build preview');
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-error') {
        setError(event.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-3 space-x-2 shrink-0">
         <div className="flex space-x-1.5 mr-2">
           <div className="w-3 h-3 rounded-full bg-red-400"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
           <div className="w-3 h-3 rounded-full bg-green-400"></div>
         </div>
         <button onClick={buildPreview} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Reload">
           <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
         </button>
         <div className="flex-1 bg-white h-7 border border-gray-300 rounded px-3 flex items-center text-[11px] text-gray-400 font-mono truncate">
           {loading ? 'Compiling sources...' : 'http://localhost:3000/preview'}
         </div>
         <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors">
            <ExternalLink size={14} />
         </a>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 transition-opacity duration-300">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-xs font-medium tracking-wide">Building Project...</p>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/50 p-8 animate-fade-in">
            <div className="max-w-md w-full text-center">
               <div className="bg-red-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-500" size={24} />
               </div>
               <h3 className="font-bold text-gray-900 mb-2">Runtime Error</h3>
               <div className="text-xs font-mono bg-white border border-red-100 p-4 rounded-xl text-red-600 text-left overflow-auto max-h-60 shadow-sm leading-relaxed">
                 {error}
               </div>
               <button 
                 onClick={buildPreview}
                 className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
               >
                 Restart Preview
               </button>
            </div>
          </div>
        ) : (
          <iframe 
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-none"
            title="App Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}
      </div>
    </div>
  );
};