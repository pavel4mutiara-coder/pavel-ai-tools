
import React, { useState, useEffect } from 'react';
import { generateBlueprint } from '../services/geminiService';
import { InputSection } from './InputSection';
import { BlueprintDisplay } from './BlueprintDisplay';
import { ProjectBlueprint, AppState, ProjectTemplate } from '../types/index';
// Added missing Key icon to the lucide-react import list
import { Github, Settings, LogOut, Moon, Sun, Key, ShieldCheck, Zap, Info, ChevronRight, Sparkles, HelpCircle, Power } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AuthModal } from './AuthModal';
import { SettingsModal } from './SettingsModal';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingOverlay } from './LoadingOverlay';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        try {
          const selected = await aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          console.error("API Key check error", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Proceed immediately to improve UX per race condition guidelines
      setHasApiKey(true);
    }
  };

  const handleResetKey = () => {
    setHasApiKey(false);
    // In many environments, resetting the key means the user needs to select one again via openSelectKey
  };

  const handleGenerate = async (prompt: string, template: ProjectTemplate | null) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    const aistudio = (window as any).aistudio;
    if (!hasApiKey && aistudio) {
      const isKeySelected = await aistudio.hasSelectedApiKey();
      if (!isKeySelected) {
        setIsSettingsOpen(true); // Open settings to prompt for key
        return;
      } else {
        setHasApiKey(true);
      }
    }

    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const data = await generateBlueprint(prompt, language, template);
      setBlueprint(data);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      if (err.message?.includes("Requested entity was not found.")) {
        setError("AI Activation Error: Your session needs to be re-authenticated. Please open settings and click Connect Now.");
        setHasApiKey(false);
        setIsSettingsOpen(true);
      } else {
        setError(t('generationFailed'));
      }
    }
  };

  const handleReset = () => {
    setBlueprint(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/30 selection:text-primary-100 flex flex-col font-sans">
      <ErrorBoundary name="Auth Layer">
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </ErrorBoundary>

      <ErrorBoundary name="Settings Layer">
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          hasApiKey={hasApiKey}
          onSelectKey={handleSelectKey}
          onResetKey={handleResetKey}
        />
      </ErrorBoundary>
      
      <LoadingOverlay isVisible={appState === AppState.GENERATING} />
      
      <nav className="w-full border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleReset}>
            <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Logo className="w-9 h-9" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-gray-400 dark:to-gray-500 transition-all">
              {t('appName')}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-full transition-all duration-300 ${!hasApiKey && isAuthenticated ? 'bg-primary/10 text-primary border-primary/30 animate-pulse' : 'bg-surface text-gray-500 hover:text-primary border-border'} border`}
              title="Workspace Settings"
            >
              <Settings size={18} />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 pl-3 rounded-full bg-surface border border-border transition-all"
                >
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 hidden sm:inline">{user?.name}</span>
                  <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-primary/50 shadow-lg shadow-primary/20" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-[100]">
                    <div className="p-4 border-b border-border bg-primary/5">
                      <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">{t('email')}</p>
                      <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
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
            
            <div className="h-6 w-px bg-border hidden sm:block"></div>
            
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-foreground transition-all hover:scale-110 hidden sm:block">
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-20 dark:opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] opacity-20 dark:opacity-30 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <ErrorBoundary name="App Workspace">
          {!hasApiKey && isAuthenticated ? (
             <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-fade-in">
               <div className="bg-surface p-10 md:p-16 rounded-[4rem] border border-border shadow-[0_25px_60px_rgba(0,0,0,0.15)] max-w-xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                    <Power size={300} className="text-primary" />
                  </div>

                  <div className="relative z-10 space-y-10">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                        <div className="p-6 bg-primary/10 rounded-[2.5rem] relative border border-primary/20">
                          <Zap size={56} className="text-primary animate-pulse" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-4xl font-black text-foreground tracking-tight">{t('apiKeyNeeded')}</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-xs mx-auto font-medium">
                        {t('apiKeyDesc')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-left max-w-sm mx-auto">
                       {[
                         { step: 1, text: t('apiStep1') },
                         { step: 2, text: t('apiStep2') },
                         { step: 3, text: t('apiStep3') }
                       ].map(s => (
                        <div key={s.step} className="flex items-center space-x-4 p-4 bg-background/40 border border-border rounded-[1.5rem] group hover:border-primary/30 transition-all">
                          <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-sm font-black shrink-0 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                            {s.step}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-tight">{s.text}</p>
                        </div>
                       ))}
                    </div>

                    <div className="space-y-4 pt-4">
                      <button 
                        onClick={handleSelectKey}
                        className="w-full flex items-center justify-center space-x-3 py-5 bg-primary hover:bg-primary/90 text-white rounded-[2rem] text-lg font-black transition-all shadow-2xl shadow-primary/30 active:scale-[0.97]"
                      >
                        <Power size={20} />
                        <span>{t('openKeySelector')}</span>
                        <ChevronRight size={20} />
                      </button>
                      
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center space-x-2 text-[10px] font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                      >
                        <HelpCircle size={12} />
                        <span>{t('billingLink')}</span>
                      </a>
                    </div>
                  </div>
               </div>
             </div>
          ) : (
            <>
              {(appState === AppState.IDLE || appState === AppState.GENERATING) && (
                <InputSection 
                  onGenerate={handleGenerate} 
                  isGenerating={appState === AppState.GENERATING} 
                  showAdvanced={false} 
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
            </>
          )}
        </ErrorBoundary>
      </main>

      <footer className="w-full border-t border-border py-8 mt-auto bg-background/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs text-gray-500 font-medium tracking-wide">
          <p>{t('copyright')}</p>
          <div className="flex space-x-8 uppercase tracking-widest text-[10px]">
            <a href="#" className="hover:text-primary transition-colors">{t('privacy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
