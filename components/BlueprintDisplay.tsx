import React, { useState, useEffect } from 'react';
import { ProjectBlueprint, FileNode } from '../types/index';
import { FileCode, ChevronRight, ChevronDown, Play, Monitor, Code, Terminal, Menu, X, Info, Box, Download, FileWarning, Folder, Github } from 'lucide-react';
import { PreviewFrame } from './PreviewFrame';
import { GitHubModal } from './GitHubModal';
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
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const { t } = useLanguage();

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

  const handleDownload = () => {
    alert("Project export initiated. All generated files are bundled.");
  };

  const renderEditorContent = () => {
    if (!selectedFile) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 animate-fade-in">
          <Code size={48} className="mb-4 opacity-10" />
          <p className="font-mono text-xs tracking-widest uppercase opacity-40">Select a file from the explorer</p>
        </div>
      );
    }

    if (selectedFile.type === 'file' && typeof selectedFile.content !== 'string') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
            <FileWarning size={32} className="text-yellow-500" />
          </div>
          <h4 className="text-foreground font-bold mb-2">Incomplete Content</h4>
          <p className="text-gray-500 text-xs max-w-sm mb-6">
            The AI structured <strong>{selectedFile.name}</strong> but didn't provide source code. This usually happens with very large projects.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in bg-surface">
        <div className="flex items-center bg-background/50 border-b border-border px-4 h-10 shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <FileCode size={14} className="text-primary" />
            <span className="font-mono font-medium text-foreground">{selectedFile.name}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#0d1117] relative">
          <textarea 
            className="w-full h-full bg-transparent p-6 font-mono text-[13px] text-[#e6edf3] outline-none resize-none leading-relaxed selection:bg-primary/30"
            value={selectedFile.content || "// No content generated."}
            readOnly
            spellCheck="false"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[85vh] flex flex-col bg-background text-foreground animate-fade-in overflow-hidden border border-border rounded-2xl shadow-2xl relative transition-colors duration-300">
      
      <GitHubModal 
        isOpen={isGitHubModalOpen} 
        onClose={() => setIsGitHubModalOpen(false)} 
        fileStructure={blueprint.fileStructure}
        projectName={blueprint.projectName}
      />

      <ErrorBoundary name="Project Overlay">
        {showProjectInfo && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md p-8 flex items-center justify-center animate-fade-in">
            <div className="bg-surface w-full max-w-3xl rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90%]">
              <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                <div className="flex items-center space-x-3">
                  <Info size={24} className="text-primary" />
                  <h2 className="text-xl font-bold">{t('techStack')}</h2>
                </div>
                <button 
                  onClick={() => setShowProjectInfo(false)}
                  className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Architecture Brief</h3>
                  <p className="text-base text-gray-500 dark:text-gray-300 leading-relaxed">{blueprint.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Key Features</h3>
                    <div className="space-y-3">
                      {blueprint.features.map((feature, i) => (
                        <div key={i} className="flex flex-col p-4 rounded-xl bg-background/50 border border-border">
                          <span className="font-bold text-sm text-foreground">{feature.name}</span>
                          <span className="text-xs text-gray-500 mt-1 leading-normal">{feature.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Technology Stack</h3>
                    <div className="space-y-3">
                      {blueprint.techStack.map((tech, i) => (
                        <div key={i} className="flex items-start space-x-3 p-4 rounded-xl bg-background/50 border border-border">
                          <Box size={16} className="text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-sm text-foreground">{tech.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{tech.reason}</p>
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

      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 transition-colors">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-background rounded-xl transition-colors text-gray-500">
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-foreground truncate max-w-[200px]">{blueprint.projectName}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('appName')}</span>
              <span className="text-[10px] text-gray-400">•</span>
              <span className="text-[10px] text-gray-400 font-medium">{blueprint.estimatedDuration}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowProjectInfo(true)}
            className="p-1.5 hover:bg-background text-gray-400 hover:text-primary rounded-full transition-colors ml-2"
          >
            <Info size={18} />
          </button>
        </div>
        
        <div className="flex items-center space-x-1 bg-background/50 p-1.5 rounded-2xl border border-border">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-foreground'}`}
          >
            <Monitor size={14} />
            <span>{t('preview')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-foreground'}`}
          >
            <Code size={14} />
            <span>{t('code')}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#24292f] hover:bg-[#24292f]/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 transition-all active:scale-95"
          >
            <Github size={14} />
            <span>{t('github_push')}</span>
          </button>
          <div className="h-6 w-px bg-border"></div>
          <button onClick={handleDownload} className="p-2 text-gray-500 hover:text-primary transition-colors" title="Download Zip">
            <Download size={20} />
          </button>
          <button onClick={onReset} className="px-5 py-2 bg-surface hover:bg-background border border-border rounded-xl text-xs font-bold transition-all">
            {t('newProject')}
          </button>
          <button className="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95">
            <Play size={12} fill="currentColor" />
            <span>{t('run')}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-surface border-r border-border flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0 z-10`}>
          <div className="p-5 flex items-center justify-between border-b border-border/50">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('explorer')}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
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

        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          <ErrorBoundary name="Workspace Content">
            {activeTab === 'code' ? renderEditorContent() : (
              <div className="flex-1 h-full relative">
                 <PreviewFrame files={blueprint.fileStructure} />
              </div>
            )}
          </ErrorBoundary>
        </main>
      </div>
      
      <footer className="h-8 bg-surface border-t border-border flex items-center justify-between px-6 text-[10px] text-gray-500 shrink-0 transition-colors">
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-green-500 font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            {t('appRunning')}
          </span>
          <span className="opacity-40 font-mono tracking-widest">PORT: 3000</span>
        </div>
        <div className="flex items-center space-x-4 uppercase tracking-[0.15em] font-bold">
          <span className="text-primary">{blueprint.techStack[0]?.name || 'React'} Framework</span>
          <span className="opacity-30">|</span>
          <span className="text-gray-400">Environment Ready</span>
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
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  return (
    <div className="space-y-0.5">
      {sortedNodes.map((node, idx) => (
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
  const [isOpen, setIsOpen] = useState(level < 2); // Auto open root levels
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
        className={`flex items-center py-1.5 px-3 cursor-pointer rounded-xl transition-all group ${
          isSelected 
            ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
            : 'hover:bg-background text-gray-500 dark:text-gray-400 hover:text-foreground border border-transparent'
        }`}
        style={{ paddingLeft: `${(level * 16) + 12}px` }}
        onClick={handleClick}
      >
        <span className={`mr-2.5 transition-transform duration-200 ${isOpen && isFolder ? 'rotate-0' : ''}`}>
          {isFolder ? (
            isOpen ? <ChevronDown size={14} className="opacity-60" /> : <ChevronRight size={14} className="opacity-60" />
          ) : (
             <FileCode size={14} className={isSelected ? 'text-primary' : 'text-gray-400 opacity-60 group-hover:opacity-100'} />
          )}
        </span>
        <span className={`text-[13px] truncate font-mono tracking-tight ${isSelected ? 'font-bold' : 'font-medium'}`}>
          {node.name}
        </span>
        {isFolder && !isOpen && node.children && (
           <span className="ml-auto text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
             {node.children.length}
           </span>
        )}
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