import React, { useState, KeyboardEvent } from 'react';
import { ArrowRight, Terminal, Cpu, Loader2, Zap, BrainCircuit, Sliders } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TemplateSelector } from './TemplateSelector';
import { ProjectTemplate } from '../types/index';

interface InputSectionProps {
  onGenerate: (prompt: string, template: ProjectTemplate | null) => void;
  isGenerating: boolean;
  showAdvanced?: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isGenerating, showAdvanced }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  const { t } = useLanguage();

  const handleSubmit = () => {
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt, selectedTemplate);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const suggestions = [
    t('suggestion1'),
    t('suggestion2'),
    t('suggestion3'),
    t('suggestion4')
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-6xl mx-auto px-4 py-16 text-center relative">
      <div className="mb-8 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-[#1e293b] rounded-full p-6 border border-white/10 shadow-2xl">
          <Cpu className={`w-16 h-16 text-primary ${isGenerating ? 'animate-spin' : 'animate-pulse-slow'}`} />
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-6 tracking-tight">
        {t('heroTitle')}
      </h1>
      
      <p className="text-lg text-gray-400 mb-12 max-w-2xl leading-relaxed mx-auto">
        {t('heroSubtitle')}
      </p>

      {/* Advanced Settings Drawer (Conditionally Rendered) */}
      {showAdvanced && !isGenerating && (
        <div className="w-full max-w-4xl mb-12 p-6 bg-surface/50 border border-white/10 rounded-2xl animate-fade-in flex flex-col items-start text-left shadow-xl backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Sliders size={16} className="text-primary" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Advanced Scaffolding Config</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-300">Target AI Model</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setSelectedModel('gemini-3-pro-preview')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedModel === 'gemini-3-pro-preview' ? 'bg-primary/20 border-primary text-white ring-1 ring-primary/30' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}
                >
                  <div className="flex items-center space-x-3">
                    <BrainCircuit size={18} className={selectedModel === 'gemini-3-pro-preview' ? 'text-primary' : ''} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Gemini 3 Pro</p>
                      <p className="text-[10px] opacity-60">High-fidelity, complex logic</p>
                    </div>
                  </div>
                  {selectedModel === 'gemini-3-pro-preview' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </button>

                <button 
                  onClick={() => setSelectedModel('gemini-3-flash-preview')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedModel === 'gemini-3-flash-preview' ? 'bg-accent/20 border-accent text-white ring-1 ring-accent/30' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Zap size={18} className={selectedModel === 'gemini-3-flash-preview' ? 'text-accent' : ''} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Gemini 3 Flash</p>
                      <p className="text-[10px] opacity-60">Fast iteration, simple apps</p>
                    </div>
                  </div>
                  {selectedModel === 'gemini-3-flash-preview' && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-sm font-semibold text-gray-300">Environment Setup</label>
               <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Strict TypeScript</span>
                    <div className="w-10 h-5 bg-primary/20 rounded-full flex items-center justify-end px-1 border border-primary/30 cursor-not-allowed">
                      <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tailwind JIT Pre-load</span>
                    <div className="w-10 h-5 bg-primary/20 rounded-full flex items-center justify-end px-1 border border-primary/30 cursor-not-allowed">
                      <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between opacity-40">
                    <span className="text-xs text-gray-400">Unit Test Scaffold</span>
                    <div className="w-10 h-5 bg-white/10 rounded-full flex items-center px-1 border border-white/10 cursor-not-allowed">
                      <div className="w-3 h-3 bg-gray-500 rounded-full" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection */}
      <div className="w-full mb-16">
        <TemplateSelector 
          selectedId={selectedTemplate?.id || null} 
          onSelect={setSelectedTemplate}
          disabled={isGenerating}
        />
      </div>

      <div className="w-full max-w-2xl relative group z-20 mx-auto">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative flex items-center bg-[#0f172a] rounded-xl p-2 border border-white/10 shadow-2xl">
          <Terminal className="w-6 h-6 text-gray-500 ml-3 mr-3" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg py-3 font-mono"
            disabled={isGenerating}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
              prompt.trim() && !isGenerating
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>{t('generateBtn')}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {!isGenerating && (
        <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(suggestion)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-full text-[10px] md:text-xs text-gray-400 transition-all font-mono"
            >
              &gt; {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};