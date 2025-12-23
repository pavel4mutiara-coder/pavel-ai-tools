import React, { useState, useEffect } from 'react';
import { generateBlueprint } from '../services/geminiService';
import { InputSection } from './InputSection';
import { BlueprintDisplay } from './BlueprintDisplay';
import { ProjectBlueprint, AppState, ProjectTemplate } from '../types/index';
import { Github, Languages, LogOut, Settings2, Key, Moon, Sun } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const { t, language, setLanguage } = useLanguage();
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

  const handleGenerate = async (prompt: string, template: ProjectTemplate | null) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    // gemini-3-pro-preview requires a user-selected API key
    const aistudio = (window as any).aistudio;
    if (!hasApiKey && aistudio) {
      const isKeySelected = await aistudio.hasSelectedApiKey();
      if (!isKeySelected) {
        await handleSelectKey();
        // The above call opens a dialog, we proceed assuming user will pick a key
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
        setError("API Key Error: Please ensure you have selected a valid API key from a paid GCP project.");
        setHasApiKey(false); // Force re-selection
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

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/30 selection:text-primary-100 flex flex-col font-sans">
      <ErrorBoundary name="Auth Layer">
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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
              onClick={toggleTheme}
              className="p-2 rounded-full bg-surface hover:bg-surface/80 text-gray-500 hover:text-primary border border-border transition-all"
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated && (
              <button 
                onClick={handleSelectKey}
                className={`p-2 rounded-full transition-all duration-300 ${hasApiKey ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'} border`}
                title="Select API Key"
              >
                <Key size={18} />
              </button>
            )}

            {isAuthenticated && (
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-2 rounded-full transition-all duration-300 ${showAdvanced ? 'bg-primary/20 text-primary border-primary/50 ring-1 ring-primary' : 'bg-surface text-gray-500 hover:text-foreground border-border'} border`}
                title="Advanced Settings"
              >
                <Settings2 size={18} />
              </button>
            )}

            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-surface hover:bg-surface/80 border border-border transition-all text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
            >
              <Languages size={14} className="text-primary" />
              <span>{language}</span>
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
               <div className="bg-surface p-12 rounded-3xl border border-border shadow-2xl max-w-lg">
                  <Key size={48} className="text-primary mb-6 mx-auto animate-bounce" />
                  <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                    To use the high-fidelity <strong>Gemini 3 Pro</strong> model for code generation, 
                    you must select an API key from a paid Google Cloud project.
                  </p>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/30"
                  >
                    Select API Key
                  </button>
                  <p className="mt-6 text-[10px] text-gray-500">
                    Visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Billing Documentation</a> for more information.
                  </p>
               </div>
             </div>
          ) : (
            <>
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