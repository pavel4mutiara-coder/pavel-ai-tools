import React from 'react';
import { Cpu, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../locales/translations';
import { useLoadingSteps } from '../hooks/useLoadingSteps';

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LOADING_STEPS: TranslationKey[] = [
  'step_analyzing',
  'step_planning',
  'step_coding',
  'step_styling',
  'step_configuring',
  'step_finalizing'
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  const { t } = useLanguage();
  const currentStepIndex = useLoadingSteps(isVisible, LOADING_STEPS.length);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-background/40 backdrop-blur-xl animate-fade-in">
      <div className="relative mb-12">
        <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="relative bg-surface p-8 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center">
          <Cpu className="w-16 h-16 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-accent animate-bounce" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t('generatingBtn')}
          </h2>
          <div className="h-8 flex items-center justify-center">
            <p className="text-primary font-mono text-sm animate-pulse">
              {t(LOADING_STEPS[currentStepIndex])}
            </p>
          </div>
        </div>

        <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-700 ease-out rounded-full"
            style={{ width: `${((currentStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
          />
          <div className="absolute top-0 left-0 w-full h-full bg-primary/20 animate-progress-indeterminate"></div>
        </div>

        <div className="flex justify-between px-1">
          {LOADING_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                idx <= currentStepIndex ? 'bg-primary scale-110 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] pt-4 font-bold">
          {t('initializing')}
        </p>
      </div>
    </div>
  );
};