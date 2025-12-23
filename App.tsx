import React, { useState } from 'react';
import { generateBlueprint } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { BlueprintDisplay } from './components/BlueprintDisplay';
import { ProjectBlueprint, AppState } from './types';
import { Github, Twitter, Languages } from 'lucide-react';
import { Logo } from './components/Logo';
import { useLanguage } from './contexts/LanguageContext';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, language, setLanguage } = useLanguage();

  const handleGenerate = async (prompt: string) => {
    setAppState(AppState.GENERATING);
    setError(null);
    try {
      // Pass the current language to the generator to ensure output matches
      const data = await generateBlueprint(prompt, language);
      setBlueprint(data);
      setAppState(AppState.COMPLETE);
    } catch (err) {
      setAppState(AppState.ERROR);
      setError(t('generationFailed'));
    }
  };

  const handleReset = () => {
    setBlueprint(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-primary-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleReset}>
            <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Logo className="w-9 h-9" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
              {t('appName')}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium text-gray-300"
            >
              <Languages size={16} />
              <span className="uppercase">{language}</span>
            </button>
            <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
              <Github size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {appState === AppState.IDLE && (
          <InputSection onGenerate={handleGenerate} isGenerating={false} />
        )}

        {appState === AppState.GENERATING && (
          <InputSection onGenerate={handleGenerate} isGenerating={true} />
        )}

        {appState === AppState.COMPLETE && blueprint && (
          <div className="py-12">
            <BlueprintDisplay blueprint={blueprint} onReset={handleReset} />
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md">
              <h3 className="text-xl font-bold text-red-400 mb-2">{t('generationFailed')}</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-colors"
              >
                {t('tryAgain')}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm text-gray-500">
          <p>{t('copyright')}</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-300">{t('privacy')}</a>
            <a href="#" className="hover:text-gray-300">{t('terms')}</a>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite linear;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}