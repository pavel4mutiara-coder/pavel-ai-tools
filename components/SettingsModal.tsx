
import React, { useState } from 'react';
import { 
  X, Key, Shield, CheckCircle2, AlertCircle, 
  ExternalLink, Globe, Moon, Sun, Monitor, 
  Zap, Info, RefreshCcw, Loader2, Trash2, PlusCircle, ShieldCheck,
  ChevronRight, Circle, HelpCircle, Power
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { testApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
  onSelectKey: () => Promise<void>;
  onResetKey: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, hasApiKey, onSelectKey, onResetKey }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'api' | 'general'>('api');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestKey = async () => {
    setTestStatus('testing');
    setTestError(null);
    try {
      const result = await testApiKey();
      if (result) {
        setTestStatus('success');
      } else {
        throw new Error("API returned an unexpected response.");
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || "Connection failed. Please ensure Gemini API is enabled in your Google AI Studio project.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Power size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Workspace Config</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Manage AI & Preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-background rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Nav */}
          <aside className="w-48 border-r border-border bg-background/30 p-4 space-y-2 shrink-0">
            <button 
              onClick={() => setActiveTab('api')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'api' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-surface hover:text-foreground'}`}
            >
              <Zap size={16} />
              <span>Activation</span>
            </button>
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'general' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-surface hover:text-foreground'}`}
            >
              <Monitor size={16} />
              <span>Preferences</span>
            </button>
          </aside>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'api' ? (
              <div className="space-y-8 animate-fade-in">
                {/* Manager Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">AI Tool Activation</h3>
                    {hasApiKey && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span>{t('apiStatusAuthenticated')}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Action Card */}
                  <div className={`p-8 rounded-[2rem] border ${hasApiKey ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-background/80 border-border'} transition-all text-center space-y-6`}>
                    <div className="flex justify-center">
                       <div className={`p-6 rounded-[1.5rem] ${hasApiKey ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                         {hasApiKey ? <ShieldCheck size={40} /> : <Key size={40} />}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="text-lg font-bold">{hasApiKey ? 'AI Successfully Linked' : 'Activate with Free Key'}</h4>
                       <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                         {hasApiKey 
                           ? 'Your workspace tools are fully operational. You can now build, edit, and preview apps.' 
                           : 'Link your Google account project to enable the software architect tools.'}
                       </p>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <button 
                        onClick={onSelectKey}
                        className="w-full flex items-center justify-center space-x-3 py-4 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 active:scale-95"
                      >
                        <Zap size={16} className="fill-current" />
                        <span>{hasApiKey ? 'Reconnect / Switch' : t('openKeySelector')}</span>
                      </button>

                      {hasApiKey && (
                        <button 
                          onClick={onResetKey}
                          className="w-full py-3 text-red-500 text-xs font-bold hover:bg-red-500/5 rounded-xl transition-colors"
                        >
                          Deactivate Tools
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection verification */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diagnostic Test</h3>
                  <div className="p-5 bg-background/50 border border-border rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <RefreshCcw size={16} className={`text-primary ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                       <span className="text-xs font-medium">Verify AI Architect Status</span>
                    </div>
                    <button 
                      onClick={handleTestKey}
                      disabled={!hasApiKey || testStatus === 'testing'}
                      className="px-4 py-2 bg-surface border border-border text-[10px] font-bold rounded-xl hover:border-primary/50 transition-all disabled:opacity-30"
                    >
                      {testStatus === 'testing' ? t('testing') : t('testConnection')}
                    </button>
                  </div>

                  {testStatus !== 'idle' && (
                    <div className={`p-4 rounded-xl border flex items-start space-x-3 animate-fade-in ${testStatus === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                      {testStatus === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-xs font-bold">{testStatus === 'success' ? 'Success: Tools Ready' : 'Activation Error'}</p>
                        <p className="text-[10px] opacity-80 mt-1">{testStatus === 'success' ? 'AI models are responding. Your project quota is healthy.' : testError}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guide Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Setup Instructions</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { step: 1, text: t('apiStep1') },
                      { step: 2, text: t('apiStep2') },
                      { step: 3, text: t('apiStep3') }
                    ].map((s) => (
                      <div key={s.step} className="flex items-start space-x-3 p-3 bg-surface border border-border rounded-xl">
                        <div className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">
                          {s.step}
                        </div>
                        <span className="text-xs text-gray-500 leading-tight">{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Help */}
                <div className="flex justify-center pt-2">
                   <a 
                     href="https://aistudio.google.com/app/apikey" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center space-x-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                   >
                     <HelpCircle size={12} />
                     <span>{t('billingLink')}</span>
                   </a>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {/* Theme Setup */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sun size={14} className="text-primary" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interface Appearance</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all ${theme === 'light' ? 'bg-primary/10 border-primary ring-2 ring-primary/20' : 'bg-surface border-border text-gray-500 hover:border-primary/30'}`}
                    >
                      <Sun size={24} className="mb-2" />
                      <span className="text-xs font-bold">Light Mode</span>
                    </button>
                    <button 
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-primary/10 border-primary ring-2 ring-primary/20' : 'bg-surface border-border text-gray-500 hover:border-primary/30'}`}
                    >
                      <Moon size={24} className="mb-2" />
                      <span className="text-xs font-bold">Dark Mode</span>
                    </button>
                  </div>
                </div>

                {/* Language Setup */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Globe size={14} className="text-primary" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workspace Language</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setLanguage('en')}
                      className={`px-4 py-4 rounded-2xl border text-xs font-bold transition-all ${language === 'en' ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' : 'bg-surface border-border text-gray-500'}`}
                    >
                      English (US)
                    </button>
                    <button 
                      onClick={() => setLanguage('bn')}
                      className={`px-4 py-4 rounded-2xl border text-xs font-bold transition-all ${language === 'bn' ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' : 'bg-surface border-border text-gray-500'}`}
                    >
                      বাংলা (Bangla)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
