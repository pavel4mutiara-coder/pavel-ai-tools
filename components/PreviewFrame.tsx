import React, { useEffect, useRef, useState } from 'react';
import { FileNode } from '../types/index';
import { RotateCw, ExternalLink, RefreshCw } from 'lucide-react';

interface PreviewFrameProps {
  files: FileNode[];
  key?: string; // Force re-render
}

// Helper to flatten file tree
const flattenFiles = (nodes: FileNode[], path = ''): Record<string, string> => {
  let acc: Record<string, string> = {};
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
        throw new Error("No index.html found in the project. Cannot run preview.");
      }

      let indexHtml = fileMap[indexHtmlPath];
      
      // 1. Prepare Import Map
      const importMap = {
        imports: {
          "react": "https://esm.sh/react@18.2.0",
          "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
          "lucide-react": "https://esm.sh/lucide-react@0.263.1",
        } as Record<string, string>
      };

      // 2. Transpile TSX/TS and create Blobs for local files
      const blobUrls: Record<string, string> = {};
      
      for (const [path, content] of Object.entries(fileMap)) {
        if (path === indexHtmlPath) continue;

        let processedContent = content;
        let mimeType = 'application/javascript';

        if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.jsx')) {
          try {
            // @ts-ignore - Babel is loaded via script tag in main index.html
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
            // Inject CSS immediately into the blob? 
            // Better to inject as link or style tag if imported, 
            // but for simplicity we will assume JS imports css or we stick it in head.
        }

        const blob = new Blob([processedContent], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        blobUrls[path] = blobUrl;

        // Add to import map
        // Handle both ./Path and Path resolution attempts
        const fileName = path.split('/').pop()!;
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        
        importMap.imports[`./${path}`] = blobUrl;
        importMap.imports[`./${nameWithoutExt}`] = blobUrl;
        importMap.imports[`./${fileName}`] = blobUrl;
      }

      // 3. Inject Import Map and Scripts into index.html
      const importMapScript = `<script type="importmap">${JSON.stringify(importMap)}</script>`;
      
      // Inject Tailwind if not present
      const tailwindScript = indexHtml.includes('cdn.tailwindcss.com') 
        ? '' 
        : '<script src="https://cdn.tailwindcss.com"></script>';

      // Inject Error Handler for iframe
      const errorHandlerScript = `
        <script>
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'preview-error', message: message }, '*');
          };
          console.error = function() {
            window.parent.postMessage({ type: 'preview-error', message: JSON.stringify(arguments) }, '*');
          };
        </script>
      `;

      // Rewrite src attributes in script tags to point to blobs
      // This regex looks for <script src="./index.tsx"> etc
      let finalHtml = indexHtml
        .replace(
          /<script\s+[^>]*src="\.?\/?([^"]+)"[^>]*><\/script>/g, 
          (match, srcPath) => {
             // Try to find the blob for this path
             // Clean path
             const cleanPath = srcPath.startsWith('./') ? srcPath.slice(2) : (srcPath.startsWith('/') ? srcPath.slice(1) : srcPath);
             const blob = blobUrls[cleanPath];
             if (blob) {
                 return `<script type="module" src="${blob}"></script>`;
             }
             return match;
          }
        );

      // Inject content before </head>
      finalHtml = finalHtml.replace('</head>', `${tailwindScript}\n${importMapScript}\n${errorHandlerScript}\n</head>`);

      const finalBlob = new Blob([finalHtml], { type: 'text/html' });
      const finalUrl = URL.createObjectURL(finalBlob);
      
      setPreviewUrl(finalUrl);
      setLoading(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to build preview');
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Browser Bar */}
      <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-2 space-x-2">
         <button onClick={buildPreview} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Refresh">
           <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
         </button>
         <div className="flex-1 bg-white h-7 border border-gray-300 rounded px-3 flex items-center text-xs text-gray-500 font-mono">
           {loading ? 'Compiling...' : 'localhost:3000'}
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm">Bundling application...</p>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-8">
            <div className="text-red-600 text-center">
               <h3 className="font-bold mb-2">Preview Build Error</h3>
               <p className="text-sm font-mono bg-red-100 p-4 rounded">{error}</p>
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