
import React, { useState } from 'react';
import { 
  X, Key, Shield, CheckCircle2, AlertCircle, 
  ExternalLink, Globe, Moon, Sun, Monitor, 
  Zap, Info, RefreshCcw, Loader2, Trash2, PlusCircle, ShieldCheck
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
              <ShieldCheck size={16} />
              <span>Key Manager</span>
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
                    <h3 className="text-sm font-bold text-foreground">API Management</h3>
                    {hasApiKey && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span>Authenticated</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Status Indicator Card */}
                  <div className={`p-6 rounded-3xl border ${hasApiKey ? 'bg-primary/5 border-primary/20' : 'bg-yellow-500/5 border-yellow-500/20'} transition-all`}>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-full ${hasApiKey ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {hasApiKey ? <Shield size={32} /> : <AlertCircle size={32} />}
                      </div>
                      
                      <div>
                        <p className="text-sm font-bold">
                          {hasApiKey ? 'Primary Key Active' : 'No Active Key Configured'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {hasApiKey 
                            ? 'Your session is encrypted and authenticated with Google AI Studio.' 
                            : 'Connect your API key to enable high-fidelity code generation with Gemini 3 Pro.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                        {!hasApiKey ? (
                          <button 
                            onClick={onSelectKey}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                          >
                            <PlusCircle size={14} />
                            <span>Add API Key</span>
                          </button>
                        ) : (
                          <button 
                            onClick={onSelectKey}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-surface border border-border rounded-2xl text-xs font-bold hover:bg-background transition-all"
                          >
                            <RefreshCcw size={14} />
                            <span>Change Key</span>
                          </button>
                        )}
                        
                        {hasApiKey && (
                          <button 
                            onClick={() => {
                              onResetKey();
                              setTestStatus('idle');
                            }}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-bold hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 size={14} />
                            <span>Remove Key</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connectivity Diagnostic */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diagnostics</h3>
                  <div className="p-5 bg-background/50 border border-border rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Zap size={16} className="text-primary" />
                        <span className="text-xs font-medium">Ping latency to Gemini-3-Pro</span>
                      </div>
                      <button 
                        onClick={handleTestKey}
                        disabled={!hasApiKey || testStatus === 'testing'}
                        className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50"
                      >
                        {testStatus === 'testing' ? <Loader2 size={12} className="animate-spin" /> : 'Run Test'}
                      </button>
                    </div>

                    {testStatus !== 'idle' && (
                      <div className={`p-4 rounded-xl border flex items-start space-x-3 animate-fade-in ${testStatus === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {testStatus === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-xs font-bold">{testStatus === 'success' ? 'Verification Successful' : 'Verification Failed'}</p>
                          <p className="text-[10px] opacity-80 mt-1">{testStatus === 'success' ? 'Environment is stable. Quota limits and project permissions verified.' : testError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Safety Info */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start space-x-3">
                   <Info size={16} className="text-primary shrink-0 mt-0.5" />
                   <div className="space-y-1">
                     <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Security Notice</p>
                     <p className="text-[10px] text-primary/80 leading-relaxed">
                       Keys are securely managed by your AI Studio environment. Pavel AI never transmits your raw key to its own servers; all requests are routed through Google's official SDK.
                     </p>
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
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
