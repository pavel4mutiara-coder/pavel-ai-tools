import React, { useState, useEffect } from 'react';
import { X, Github, ExternalLink, Loader2, Lock, Globe, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { githubService } from '../services/githubService';
import { FileNode, GitHubRepo } from '../types/index';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileStructure: FileNode[];
  projectName: string;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose, fileStructure, projectName }) => {
  const { user, updateGithubToken } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<'connect' | 'select' | 'pushing' | 'success'>('connect');
  const [token, setToken] = useState(user?.githubToken || '');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  
  // New Repo Form
  const [newRepoName, setNewRepoName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [newRepoDesc, setNewRepoDesc] = useState('Scaffolded with Pavel AI Workspace');
  const [isPrivate, setIsPrivate] = useState(true);
  
  // Existing Repo Select
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalRepoUrl, setFinalRepoUrl] = useState('');

  useEffect(() => {
    if (user?.githubToken) {
      setStep('select');
      loadRepos(user.githubToken);
    } else {
      setStep('connect');
    }
  }, [isOpen, user?.githubToken]);

  const loadRepos = async (tk: string) => {
    setIsLoading(true);
    try {
      const data = await githubService.fetchUserRepos(tk);
      setRepos(data);
    } catch (err: any) {
      setError(err.message);
      setStep('connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate token by fetching repos
      await githubService.fetchUserRepos(token);
      updateGithubToken(token);
      setStep('select');
    } catch (err: any) {
      setError('Invalid token or connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    if (!user?.githubToken) return;
    setIsLoading(true);
    setStep('pushing');
    setError(null);
    
    try {
      let targetRepo: GitHubRepo;
      if (mode === 'new') {
        targetRepo = await githubService.createRepo(user.githubToken, newRepoName, isPrivate, newRepoDesc);
      } else {
        if (!selectedRepo) throw new Error('Please select a repository');
        targetRepo = selectedRepo;
      }

      await githubService.pushFiles(user.githubToken, targetRepo.full_name.split('/')[0], targetRepo.name, fileStructure);
      setFinalRepoUrl(targetRepo.html_url);
      setStep('success');
    } catch (err: any) {
      setError(err.message);
      setStep('select');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
          <div className="flex items-center space-x-3 text-foreground">
            <Github size={24} />
            <h2 className="text-xl font-bold">{t('github_push')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'connect' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('github_token_label')}</label>
                <input 
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t('github_token_placeholder')}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t('github_help')}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline inline-flex items-center">
                   GitHub Settings <ExternalLink size={10} className="ml-1" />
                </a>
              </p>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <button 
                onClick={handleConnect}
                disabled={!token || isLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>{t('github_connect')}</span>}
              </button>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex p-1 bg-background/50 border border-border rounded-2xl">
                <button 
                  onClick={() => setMode('new')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'new' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-foreground'}`}
                >
                  {t('github_repo_new')}
                </button>
                <button 
                  onClick={() => setMode('existing')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'existing' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-foreground'}`}
                >
                  {t('github_repo_select')}
                </button>
              </div>

              {mode === 'new' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('github_repo_name')}</label>
                    <input 
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('github_repo_desc')}</label>
                    <textarea 
                      value={newRepoDesc}
                      onChange={(e) => setNewRepoDesc(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all h-20 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-xl">
                    <div className="flex items-center space-x-3">
                      {isPrivate ? <Lock size={16} className="text-primary" /> : <Globe size={16} className="text-primary" />}
                      <span className="text-xs font-medium text-foreground">{t('github_repo_private')}</span>
                    </div>
                    <button 
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`w-10 h-5 rounded-full p-1 transition-all ${isPrivate ? 'bg-primary' : 'bg-gray-600'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search repositories..."
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground outline-none"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                    {filteredRepos.map(repo => (
                      <button 
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selectedRepo?.id === repo.id ? 'bg-primary/10 border-primary text-primary' : 'bg-background/30 border-border text-gray-500 hover:border-border/50 hover:bg-background'}`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <Github size={14} />
                          <span className="text-xs font-bold truncate">{repo.name}</span>
                        </div>
                        {repo.private && <Lock size={10} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <div className="flex space-x-3">
                 <button 
                  onClick={() => setStep('connect')}
                  className="flex-1 px-4 py-3 border border-border rounded-xl text-xs font-bold text-gray-500 hover:bg-background transition-all"
                >
                  Change Account
                </button>
                <button 
                  onClick={handlePush}
                  disabled={isLoading || (mode === 'existing' && !selectedRepo)}
                  className="flex-[2] bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-primary/20"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>{t('github_push')}</span>}
                </button>
              </div>
            </div>
          )}

          {step === 'pushing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                <Loader2 size={64} className="text-primary animate-spin relative" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">{t('github_pushing')}</h3>
                <p className="text-xs text-gray-500">Committing file structures and source code...</p>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-background rounded-full overflow-hidden border border-border">
                <div className="h-full bg-primary animate-progress-indeterminate"></div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in text-center">
              <div className="bg-green-500/10 p-6 rounded-full border border-green-500/20">
                <CheckCircle2 size={64} className="text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">{t('github_success')}</h3>
                <p className="text-sm text-gray-500">Your project is now live on GitHub.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <a 
                  href={finalRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                  <span>View Repository</span>
                  <ExternalLink size={16} />
                </a>
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-border rounded-xl text-xs font-bold text-gray-500 hover:bg-background transition-all"
                >
                  Back to Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};