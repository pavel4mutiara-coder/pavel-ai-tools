import React, { useState } from 'react';
import { generateBlueprint } from '../services/geminiService';
import { InputSection } from './InputSection';
import { BlueprintDisplay } from './BlueprintDisplay';
import { ProjectBlueprint, AppState, ProjectTemplate } from '../types/index';
import { Github, Languages, LogOut, Settings2 } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingOverlay } from './LoadingOverlay';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const handleGenerate = async (prompt: string, template: ProjectTemplate | null) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const data = await generateBlueprint(prompt, language, template);
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
    <div className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-primary-100 flex flex-col font-sans">
      <ErrorBoundary name="Auth Layer">
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </ErrorBoundary>
      
      {/* Global Loading Overlay */}
      <LoadingOverlay isVisible={appState === AppState.GENERATING} />
      
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
            {isAuthenticated && (
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-2 rounded-full transition-all duration-300 ${showAdvanced ? 'bg-primary/20 text-primary border-primary/50 ring-1 ring-primary' : 'bg-white/5 text-gray-500 hover:text-white border-white/5'} border`}
                title="Advanced Settings"
              >
                <Settings2 size={18} />
              </button>
            )}

            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-bold text-gray-300 uppercase tracking-widest"
            >
              <Languages size={14} className="text-primary" />
              <span>{language}</span>
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 pl-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                >
                  <span className="text-xs font-bold text-gray-400 hidden sm:inline">{user?.name}</span>
                  <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-primary/50 shadow-lg shadow-primary/20" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-[100]">
                    <div className="p-4 border-b border-white/5 bg-primary/5">
                      <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">{t('email')}</p>
                      <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        handleReset();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition-colors text-xs font-bold"
                    >
                      <LogOut size={16} />
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95"
              >
                {t('signIn')}
              </button>
            )}
            
            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
            
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:scale-110 hidden sm:block">
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <ErrorBoundary name="App Workspace">
          {(appState === AppState.IDLE || appState === AppState.GENERATING) && (
            <InputSection 
              onGenerate={handleGenerate} 
              isGenerating={appState === AppState.GENERATING} 
              showAdvanced={showAdvanced} 
            />
          )}

          {appState === AppState.COMPLETE && blueprint && (
            <div className="py-12 px-4 max-w-7xl mx-auto w-full h-full flex flex-col">
              <BlueprintDisplay blueprint={blueprint} onReset={handleReset} />
            </div>
          )}

          {appState === AppState.ERROR && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
              <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-3xl max-w-md shadow-2xl">
                <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Logo className="w-10 h-10 grayscale opacity-50" />
                </div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{t('generationFailed')}</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">{error}</p>
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-xl font-bold transition-all active:scale-95"
                >
                  {t('tryAgain')}
                </button>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 mt-auto bg-background/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs text-gray-500 font-medium tracking-wide">
          <p>{t('copyright')}</p>
          <div className="flex space-x-8 uppercase tracking-widest text-[10px]">
            <a href="#" className="hover:text-primary transition-colors">{t('privacy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('terms')}</a>
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
          animation: progress-indeterminate 2s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}