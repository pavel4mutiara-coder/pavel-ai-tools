
import React, { useState } from 'react';
import { 
  X, Key, Shield, CheckCircle2, AlertCircle, 
  ExternalLink, Globe, Moon, Sun, Monitor, 
  Zap, Info, RefreshCcw, Loader2 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { testApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
  onSelectKey: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, hasApiKey, onSelectKey }) => {
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
      setTestError(err.message || "Connection failed. Please check your billing status or project access.");
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
              <Key size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Workspace Settings</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Configure your AI Environment</p>
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
              <Shield size={16} />
              <span>API Safety</span>
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
                {/* Status Card */}
                <div className={`p-6 rounded-3xl border ${hasApiKey ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'} transition-colors`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {hasApiKey ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : (
                        <AlertCircle size={24} className="text-yellow-500" />
                      )}
                      <div>
                        <h3 className="font-bold text-foreground">API Status</h3>
                        <p className="text-xs text-gray-500">{hasApiKey ? 'Key Selected & Active' : 'No Key Detected'}</p>
                      </div>
                    </div>
                    {hasApiKey && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[9px] font-black uppercase rounded-md animate-pulse">Live</span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 leading-relaxed mb-6">
                    A paid Google Cloud project API key is required to utilize <strong>Gemini 3 Pro</strong>. 
                    Your key is stored securely in the browser session.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={onSelectKey}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-foreground dark:bg-white dark:text-black text-white rounded-2xl text-xs font-bold hover:opacity-90 transition-all shadow-xl"
                    >
                      <Key size={14} />
                      <span>{hasApiKey ? 'Change Key' : 'Select Key'}</span>
                    </button>
                    <button 
                      onClick={handleTestKey}
                      disabled={!hasApiKey || testStatus === 'testing'}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-surface border border-border rounded-2xl text-xs font-bold hover:bg-background transition-all disabled:opacity-50"
                    >
                      {testStatus === 'testing' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                      <span>Test Connection</span>
                    </button>
                  </div>
                </div>

                {/* Test Results */}
                {testStatus !== 'idle' && (
                  <div className={`p-4 rounded-2xl border flex items-start space-x-3 animate-fade-in ${testStatus === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {testStatus === 'success' ? <Zap size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-xs font-bold">{testStatus === 'success' ? 'Connection Verified' : 'Connection Failed'}</p>
                      <p className="text-[10px] opacity-80 mt-1">{testStatus === 'success' ? 'Gemini 3 Pro is ready for generation.' : testError}</p>
                    </div>
                  </div>
                )}

                {/* Helpful Links */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Documentation</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-primary/5 border border-border hover:border-primary/20 transition-all group"
                    >
                      <span className="text-xs font-medium text-gray-500 group-hover:text-primary">Billing & Quotas</span>
                      <ExternalLink size={12} className="text-gray-400 group-hover:text-primary" />
                    </a>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-primary/5 border border-border hover:border-primary/20 transition-all group"
                    >
                      <span className="text-xs font-medium text-gray-500 group-hover:text-primary">Get New API Key</span>
                      <ExternalLink size={12} className="text-gray-400 group-hover:text-primary" />
                    </a>
                  </div>
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

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start space-x-3">
                   <Info size={16} className="text-primary shrink-0 mt-0.5" />
                   <p className="text-[10px] text-primary font-medium leading-relaxed">
                     Changes to language will affect future code generations. Existing workspace contents will remain in their original language.
                   </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
