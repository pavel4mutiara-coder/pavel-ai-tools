import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Rocket, 
  PenTool, 
  Sparkles, 
  Share2, 
  Activity, 
  CheckSquare,
  Wand2,
  LineChart,
  BookOpen,
  Users,
  Layers,
  Search
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ProjectTemplate } from '../types/index';
import { TranslationKey } from '../locales/translations';

interface TemplateSelectorProps {
  selectedId: string | null;
  onSelect: (template: ProjectTemplate | null) => void;
  disabled?: boolean;
}

type Category = 'All' | 'Productivity' | 'E-Commerce' | 'AI & Data' | 'Content';

export const TEMPLATES: (ProjectTemplate & { category: Category; bestFor: string })[] = [
  {
    id: 'ecommerce',
    category: 'E-Commerce',
    icon: 'ShoppingBag',
    nameKey: 'template_ecommerce_name',
    descriptionKey: 'template_ecommerce_desc',
    bestFor: 'Stores & Retailers',
    promptModifier: 'Implement an E-commerce architecture with a sophisticated product catalog, persistent shopping cart, and a multi-step checkout flow using React state.'
  },
  {
    id: 'dashboard',
    category: 'Productivity',
    icon: 'LayoutDashboard',
    nameKey: 'template_dashboard_name',
    descriptionKey: 'template_dashboard_desc',
    bestFor: 'Internal Tools',
    promptModifier: 'Build an Admin Dashboard with professional layout, summary widgets, and complex data tables with filtering and sorting capabilities.'
  },
  {
    id: 'saas',
    category: 'Productivity',
    icon: 'Rocket',
    nameKey: 'template_saas_name',
    descriptionKey: 'template_saas_desc',
    bestFor: 'Startups',
    promptModifier: 'Create a high-fidelity SaaS Landing Page with sticky navigation, feature showcases, pricing tiers, and strong call-to-action sections.'
  },
  {
    id: 'ai_studio',
    category: 'AI & Data',
    icon: 'Wand2',
    nameKey: 'template_ai_studio_name',
    descriptionKey: 'template_ai_studio_desc',
    bestFor: 'Generative Apps',
    promptModifier: 'Develop an AI Generation interface with prompt inputs, setting sliders, and a high-end masonry gallery for generated results.'
  },
  {
    id: 'analytics',
    category: 'AI & Data',
    icon: 'LineChart',
    nameKey: 'template_analytics_name',
    descriptionKey: 'template_analytics_desc',
    bestFor: 'Monitoring',
    promptModifier: 'Construct a Real-time Analytics platform with live data simulation, multiple chart types (Bar, Line, Pie), and metric card arrays.'
  },
  {
    id: 'blog',
    category: 'Content',
    icon: 'PenTool',
    nameKey: 'template_blog_name',
    descriptionKey: 'template_blog_desc',
    bestFor: 'Publishers',
    promptModifier: 'Design a modern Blog/Portfolio with focus on typography, reading experience, category filtering, and responsive article layouts.'
  },
  {
    id: 'education',
    category: 'Content',
    icon: 'BookOpen',
    nameKey: 'template_education_name',
    descriptionKey: 'template_education_desc',
    bestFor: 'E-Learning',
    promptModifier: 'Build an Educational LMS with course modules, lesson progression tracking, and interactive quiz components.'
  },
  {
    id: 'social',
    category: 'Content',
    icon: 'Share2',
    nameKey: 'template_social_name',
    descriptionKey: 'template_social_desc',
    bestFor: 'Communities',
    promptModifier: 'Develop a Social Feed with profile headers, media-rich posts, and real-time feel interaction components.'
  }
];

const IconMap: Record<string, any> = {
  ShoppingBag,
  LayoutDashboard,
  Rocket,
  PenTool,
  Share2,
  Activity,
  CheckSquare,
  Wand2,
  LineChart,
  BookOpen,
  Users
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedId, onSelect, disabled }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const categories: Category[] = ['All', 'Productivity', 'E-Commerce', 'AI & Data', 'Content'];

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return TEMPLATES;
    return TEMPLATES.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{t('selectTemplate')}</h3>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-black/30 border border-white/5 rounded-full backdrop-blur-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              disabled={disabled}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[400px]">
        {filteredTemplates.map((template) => {
          const Icon = IconMap[template.icon] || Layers;
          const isSelected = selectedId === template.id;
          
          return (
            <button
              key={template.id}
              disabled={disabled}
              onClick={() => onSelect(isSelected ? null : template)}
              className={`relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${
                isSelected 
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/50 shadow-2xl shadow-primary/20 scale-[1.02]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
            >
              {/* Background Glow on Selected */}
              {isSelected && (
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 blur-3xl rounded-full"></div>
              )}

              <div className="flex w-full justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isSelected ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-white/5 text-gray-400 group-hover:text-white'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  isSelected ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-white/5 text-gray-500'
                }`}>
                  {template.bestFor}
                </span>
              </div>
              
              <h4 className={`font-bold text-sm mb-1 transition-colors ${
                isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
              }`}>
                {t(template.nameKey as TranslationKey)}
              </h4>
              
              <p className="text-[11px] text-gray-500 leading-tight group-hover:text-gray-400 transition-colors mb-4">
                {t(template.descriptionKey as TranslationKey)}
              </p>

              {/* Tag for Category */}
              <div className="mt-auto pt-2 flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                <span className="text-[10px] text-gray-600 font-mono">{template.category}</span>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-12 flex justify-center">
         <button 
           onClick={() => onSelect(null)}
           className={`px-8 py-2.5 rounded-full border text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center space-x-3 ${
             !selectedId 
               ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
               : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/30'
           }`}
         >
           <div className={`w-2 h-2 rounded-full ${!selectedId ? 'bg-primary animate-pulse' : 'bg-gray-600'}`} />
           <span>{selectedId ? `${t('custom_project')}` : `${t('custom_project')}`}</span>
         </button>
      </div>
    </div>
  );
};