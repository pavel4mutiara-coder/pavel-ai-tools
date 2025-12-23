import React, { useState, KeyboardEvent } from 'react';
import { ArrowRight, Terminal, Cpu, Loader2, Zap, BrainCircuit, Sliders, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();

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
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-6xl mx-auto px-4 py-16 text-center relative transition-colors">
      <div className="mb-8 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-surface rounded-full p-6 border border-border shadow-2xl transition-colors">
          <Cpu className={`w-16 h-16 text-primary ${isGenerating ? 'animate-spin' : 'animate-pulse-slow'}`} />
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-foreground via-gray-600 to-gray-400 dark:from-white dark:via-gray-200 dark:to-gray-500 mb-6 tracking-tight">
        {t('heroTitle')}
      </h1>
      
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl leading-relaxed mx-auto">
        {t('heroSubtitle')}
      </p>

      {/* Advanced Settings Drawer */}
      {showAdvanced && !isGenerating && (
        <div className="w-full max-w-4xl mb-12 p-6 bg-surface border border-border rounded-2xl animate-fade-in flex flex-col items-start text-left shadow-xl backdrop-blur-sm transition-all">
          <div className="flex items-center justify-between w-full mb-6">
            <div className="flex items-center space-x-2">
              <Sliders size={16} className="text-primary" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Advanced Scaffolding Config</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground">Target AI Model</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setSelectedModel('gemini-3-pro-preview')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedModel === 'gemini-3-pro-preview' ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/30' : 'bg-background/30 border-border text-gray-500 hover:border-primary/30'}`}
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
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedModel === 'gemini-3-flash-preview' ? 'bg-accent/10 border-accent text-foreground ring-1 ring-accent/30' : 'bg-background/30 border-border text-gray-500 hover:border-accent/30'}`}
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
               <label className="text-sm font-semibold text-foreground">Environment Setup</label>
               <div className="p-4 bg-background/20 rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Strict TypeScript</span>
                    <div className="w-10 h-5 bg-primary/20 rounded-full flex items-center justify-end px-1 border border-primary/30 cursor-not-allowed">
                      <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Tailwind JIT Pre-load</span>
                    <div className="w-10 h-5 bg-primary/20 rounded-full flex items-center justify-end px-1 border border-primary/30 cursor-not-allowed">
                      <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between opacity-40">
                    <span className="text-xs text-gray-500">Unit Test Scaffold</span>
                    <div className="w-10 h-5 bg-gray-500/10 rounded-full flex items-center px-1 border border-border cursor-not-allowed">
                      <div className="w-3 h-3 bg-gray-500 rounded-full" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-sm font-semibold text-foreground">{t('theme')}</label>
               <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 bg-background/20 rounded-xl border border-border hover:border-primary/30 transition-all group"
               >
                  <div className="flex items-center space-x-3 text-gray-500 group-hover:text-foreground">
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="text-xs font-bold">{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
                  </div>
                  <div className="w-10 h-5 bg-gray-200 dark:bg-primary/20 rounded-full flex items-center relative px-1 border border-border dark:border-primary/30">
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${theme === 'dark' ? 'translate-x-5 bg-primary shadow-lg shadow-primary/50' : 'translate-x-0 bg-gray-500'}`} />
                  </div>
               </button>
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
        <div className="relative flex items-center bg-surface rounded-xl p-2 border border-border shadow-2xl transition-colors">
          <Terminal className="w-6 h-6 text-gray-400 ml-3 mr-3" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-gray-500 text-lg py-3 font-mono"
            disabled={isGenerating}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
              prompt.trim() && !isGenerating
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                : 'bg-background/10 text-gray-500 cursor-not-allowed'
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
              className="px-4 py-2 bg-surface hover:bg-surface/80 border border-border hover:border-primary/20 rounded-full text-[10px] md:text-xs text-gray-500 dark:text-gray-400 transition-all font-mono"
            >
              &gt; {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};