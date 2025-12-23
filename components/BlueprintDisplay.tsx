import React, { useState, useEffect } from 'react';
import { ProjectBlueprint, FileNode } from '../types/index';
import { FileCode, ChevronRight, ChevronDown, Play, Monitor, Code, Terminal, Menu, X, Info, Box, AlertCircle, FileWarning } from 'lucide-react';
import { PreviewFrame } from './PreviewFrame';
import { useLanguage } from '../contexts/LanguageContext';
import { ErrorBoundary } from './ErrorBoundary';

interface BlueprintDisplayProps {
  blueprint: ProjectBlueprint;
  onReset: () => void;
}

export const BlueprintDisplay: React.FC<BlueprintDisplayProps> = ({ blueprint, onReset }) => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const { t } = useLanguage();

  // Auto-select first file
  useEffect(() => {
    const findFirstFile = (nodes: FileNode[]): FileNode | null => {
      if (!nodes || !Array.isArray(nodes)) return null;
      for (const node of nodes) {
        if (node.type === 'file') return node;
        if (node.children) {
          const found = findFirstFile(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    if (!selectedFile && blueprint.fileStructure.length > 0) {
      const first = findFirstFile(blueprint.fileStructure);
      if (first) setSelectedFile(first);
    }
  }, [blueprint, selectedFile]);

  const renderEditorContent = () => {
    if (!selectedFile) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 animate-fade-in">
          <Code size={48} className="mb-4 opacity-20" />
          <p className="font-mono text-sm tracking-widest uppercase">Select a file to view code</p>
        </div>
      );
    }

    // AI generated content check
    if (selectedFile.type === 'file' && typeof selectedFile.content !== 'string') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
            <FileWarning size={32} className="text-yellow-500" />
          </div>
          <h4 className="text-white font-bold mb-2">Empty or Malformed Content</h4>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            The AI successfully created the file <strong>{selectedFile.name}</strong>, but failed to populate its source code.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in">
        <div className="flex items-center bg-[#1e293b] border-b border-white/5 px-4 h-10">
          <div className="flex items-center space-x-2 text-xs text-white">
            <FileCode size={14} className="text-primary" />
            <span className="font-mono">{selectedFile.name}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#0d1117]">
          <textarea 
            className="w-full h-full bg-transparent p-6 font-mono text-[13px] text-gray-300 outline-none resize-none leading-relaxed selection:bg-primary/20"
            value={selectedFile.content || "// No content generated."}
            readOnly
            spellCheck="false"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[85vh] flex flex-col bg-[#0f172a] text-gray-300 animate-fade-in overflow-hidden border border-white/10 rounded-xl shadow-2xl relative">
      <ErrorBoundary name="Project Overlay">
        {showProjectInfo && (
          <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md p-8 flex items-center justify-center animate-fade-in">
            <div className="bg-surface w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90%]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/10">
                <div className="flex items-center space-x-3 text-white">
                  <Info size={24} className="text-primary" />
                  <h2 className="text-xl font-bold">{t('techStack')} & Project Scope</h2>
                </div>
                <button 
                  onClick={() => setShowProjectInfo(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Architecture</h3>
                  <p className="text-lg text-white leading-relaxed">{blueprint.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Features</h3>
                    <div className="space-y-3">
                      {blueprint.features.map((feature, i) => (
                        <div key={i} className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-white font-semibold text-sm">{feature.name}</span>
                          <span className="text-xs text-gray-500 mt-1">{feature.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Tech Stack</h3>
                    <div className="space-y-3">
                      {blueprint.techStack.map((tech, i) => (
                        <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/5">
                          <Box size={14} className="text-primary mt-1" />
                          <div>
                            <p className="text-white font-bold text-sm">{tech.name}</p>
                            <p className="text-[10px] text-gray-500">{tech.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ErrorBoundary>

      {/* Header */}
      <header className="h-14 bg-[#1e293b] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-white truncate max-w-[150px]">{blueprint.projectName}</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('appName')}</span>
          </div>
          <button 
            onClick={() => setShowProjectInfo(true)}
            className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-primary rounded-full transition-colors ml-2"
          >
            <Info size={16} />
          </button>
        </div>
        
        <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Code size={14} />
            <span>{t('code')}</span>
          </button>
          <button 
             onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Monitor size={14} />
            <span>{t('preview')}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={onReset} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">
            {t('newProject')}
          </button>
          <button className="flex items-center space-x-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-green-600/20 transition-all">
            <Play size={12} fill="currentColor" />
            <span>{t('run')}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#1e293b]/50 border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="p-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('explorer')}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            <ErrorBoundary name="File Tree">
              <FileTreeRecursive 
                nodes={blueprint.fileStructure} 
                level={0} 
                onSelect={(node) => {
                  setSelectedFile(node);
                  setActiveTab('code'); 
                }} 
                selectedFile={selectedFile}
              />
            </ErrorBoundary>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-[#0f172a] relative overflow-hidden">
          <ErrorBoundary name="Editor/Preview Section">
            {activeTab === 'code' ? renderEditorContent() : (
              <div className="flex-1 bg-white h-full relative">
                 <PreviewFrame files={blueprint.fileStructure} />
              </div>
            )}
          </ErrorBoundary>
        </main>
      </div>
      
      <footer className="h-7 bg-[#1e293b] border-t border-white/5 flex items-center justify-between px-4 text-[10px] text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-green-400 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse" />
            {t('appRunning')}
          </span>
          <span className="opacity-50">Local: 3000</span>
        </div>
        <div className="flex items-center space-x-4 uppercase tracking-tighter">
          <span>{blueprint.estimatedDuration} {t('devTime')}</span>
          <span className="text-primary font-bold">TSX / Tailwind</span>
        </div>
      </footer>
    </div>
  );
};

const FileTreeRecursive: React.FC<{ 
  nodes: FileNode[]; 
  level: number; 
  onSelect: (node: FileNode) => void;
  selectedFile: FileNode | null;
}> = ({ nodes, level, onSelect, selectedFile }) => {
  if (!nodes || !Array.isArray(nodes)) return null;
  return (
    <div className="space-y-0.5">
      {nodes.map((node, idx) => (
        <FileTreeNode 
          key={`${node.name}-${idx}`} 
          node={node} 
          level={level} 
          onSelect={onSelect} 
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
};

const FileTreeNode: React.FC<{ 
  node: FileNode; 
  level: number; 
  onSelect: (node: FileNode) => void;
  selectedFile: FileNode | null;
}> = ({ node, level, onSelect, selectedFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';
  const isSelected = selectedFile === node;
  
  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center py-1.5 px-3 cursor-pointer rounded-lg transition-all ${
          isSelected ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent'
        }`}
        style={{ marginLeft: `${level * 12}px` }}
        onClick={handleClick}
      >
        <span className="mr-2 opacity-60">
          {isFolder ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
             <FileCode size={14} className={isSelected ? 'text-primary' : 'text-gray-600'} />
          )}
        </span>
        <span className={`text-[13px] truncate font-mono ${isSelected ? 'font-bold' : ''}`}>
          {node.name}
        </span>
      </div>
      {isFolder && isOpen && node.children && (
        <FileTreeRecursive 
          nodes={node.children} 
          level={level + 1} 
          onSelect={onSelect} 
          selectedFile={selectedFile}
        />
      )}
    </div>
  );
};
