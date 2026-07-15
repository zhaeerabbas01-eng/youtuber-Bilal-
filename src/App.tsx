import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Sparkles, Flame, Clock, Youtube, Send, 
  ArrowUp, Compass, Grid, Laptop2, Share2, Info, Moon, Sun, MonitorCheck
} from 'lucide-react';

import Hero from './components/Hero';
import PromptCard from './components/PromptCard';
import PromptDetails from './components/PromptDetails';
import AdminPanel from './components/AdminPanel';
import Toast, { ToastMessage } from './components/Toast';
import { Prompt, Category, WebsiteSettings } from './types';
import { PromptCardSkeleton, CategorySkeleton } from './components/SkeletonLoader';

export default function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  // Loading and Filtering
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Navigation & Modals
  const [activePromptDetails, setActivePromptDetails] = useState<Prompt | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Custom Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Newsletter Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Public Data
  const fetchPublicData = async () => {
    try {
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      const promptsRes = await fetch('/api/prompts');
      if (promptsRes.ok) {
        const promptsData = await promptsRes.json();
        setPrompts(promptsData);
      }
    } catch (err) {
      console.error('Failed to load marketplace content', err);
      addToast('Failed to sync content with server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();

    // Scroll listener for "Back to Top" button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update document SEO Title & Favicon dynamically when settings load
  useEffect(() => {
    if (settings) {
      document.title = settings.seoTitle || `${settings.websiteName} - AI Prompt Marketplace`;
      
      // Sync or create Favicon
      let faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.faviconUrl || 'https://chatgpt.com/backend-api/estuary/content?id=file_00000000d68c720ca0a1bbc493100c1c&ts=495586&p=fs&cid=1&sig=7e78ad40b5bda77304a5f9e4591dab6ee478afaadced3dcc6bc16dbcec338f0b&v=0';
    }
  }, [settings]);

  const handleCopySuccess = (title: string) => {
    addToast(`Prompt Copied: "${title.slice(0, 30)}..."`, 'success');
  };

  const handleSharePrompt = (prompt: Prompt) => {
    // Generate static sharing link
    const shareUrl = `${window.location.origin}/?promptId=${prompt.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      addToast('Shareable Link Copied to Clipboard!', 'success');
    }).catch(() => {
      addToast('Failed to copy share link', 'error');
    });
  };

  // Deep linking to prompt from URL query parameters (e.g. on share click)
  useEffect(() => {
    if (prompts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const promptId = params.get('promptId');
      if (promptId) {
        const found = prompts.find(p => p.id === promptId);
        if (found) {
          setActivePromptDetails(found);
          // Passive view counter increment
          fetch(`/api/prompts/${found.id}`, { method: 'GET' }).catch(() => {});
        }
      }
    }
  }, [prompts]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
    addToast('Successfully subscribed to weekly prompt newsletter!', 'success');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubmitted(false), 5000);
  };

  // Filter Published Prompts based on search and category
  const filteredPrompts = prompts.filter((p) => {
    const matchesCategory = 
      selectedCategory === 'All' || 
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.seoKeywords && p.seoKeywords.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  const featuredPrompts = filteredPrompts.filter(p => p.isFeatured);
  const trendingPrompts = filteredPrompts.filter(p => p.isTrending);

  const scrollBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white overflow-hidden relative">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-30 bg-black/20 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-zinc-950 p-0.5">
              <img 
                src={settings?.logoUrl || 'https://yt3.googleusercontent.com/p_Js-kUEs-gOrrAhKFfTFRZR6ZxD56vErh2e4q5VN0BuLtFzhW9vcd3iMbsufcDDwlKDG9OqQg=s900-c-k-c0x00ffffff-no-rj'} 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-zinc-100 uppercase flex items-center gap-1">
                {settings?.websiteName || 'Technical Bilal Jahangir'}
              </h1>
              <p className="text-[9px] text-zinc-500 tracking-wider">AI PROMPT HUB</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={settings?.youtubeUrl || 'https://www.youtube.com/@Technicalbilaljahangir'} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/10 transition-all"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>Subscribe</span>
            </a>
            
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      {settings && (
        <Hero 
          settings={settings} 
          prompts={prompts}
          onViewPrompt={setActivePromptDetails}
          onCopySuccess={handleCopySuccess}
          onShare={handleSharePrompt}
          onOpenAdmin={() => setIsAdminOpen(true)} 
        />
      )}

      {/* MAIN EXPLORATION HUB */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-12">
        
        {/* Dynamic Navigation/Search Bento Grid */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-6 relative backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-extrabold text-zinc-100 flex items-center justify-center md:justify-start gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                Prompt Explorer
              </h3>
              <p className="text-xs text-zinc-400">Search and filter published payloads instantly</p>
            </div>

            {/* Real-time search bar */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI prompts..."
                className="w-full bg-zinc-900/80 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 pl-11 pr-4 py-3 rounded-2xl text-zinc-100 text-sm placeholder-zinc-600 outline-none transition-colors shadow-inner backdrop-blur-xl"
              />
            </div>
          </div>

          {/* Dynamic Categories Scroll Pills */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Grid className="w-3.5 h-3.5" /> Categories
            </span>
            
            {isLoading ? (
              <CategorySkeleton />
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedCategory === 'All'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  All Prompts
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      selectedCategory.toLowerCase() === cat.name.toLowerCase()
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PROMPTS GRID */}
        {isLoading ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PromptCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* If filtering search has no results */}
            {filteredPrompts.length === 0 && (
              <div className="text-center py-16 bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl space-y-4">
                <Info className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-300">No Prompts Found</h4>
                  <p className="text-xs text-slate-500">We couldn't find any prompts matching your query or filters. Try adjusting your search keyword.</p>
                </div>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Trending Prompts Horizon Slider (Shown when category is "All" and trending exists) */}
            {selectedCategory === 'All' && !searchQuery && trendingPrompts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500 fill-rose-500/10" />
                  Trending Prompt payloads
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingPrompts.map((p) => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      onViewDetails={setActivePromptDetails}
                      onCopySuccess={handleCopySuccess}
                      onShare={handleSharePrompt}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Prompts Grid (Shown when category is "All" and featured exists) */}
            {selectedCategory === 'All' && !searchQuery && featuredPrompts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                  Featured Prompts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPrompts.map((p) => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      onViewDetails={setActivePromptDetails}
                      onCopySuccess={handleCopySuccess}
                      onShare={handleSharePrompt}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Prompt List / Filtered Results */}
            {filteredPrompts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-violet-400" />
                  {searchQuery || selectedCategory !== 'All' ? 'Filtered Prompts' : 'Latest Uploads'}
                </h3>
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredPrompts.map((p) => (
                      <PromptCard
                        key={p.id}
                        prompt={p}
                        onViewDetails={setActivePromptDetails}
                        onCopySuccess={handleCopySuccess}
                        onShare={handleSharePrompt}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

          </div>
        )}

        {/* WEEKLY NEWSLETTER SECTION */}
        <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="lg:col-span-7 space-y-2">
            <h3 className="text-lg md:text-xl font-bold text-zinc-100">Never Miss a Single Prompt Payload</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
              Get the latest prompt payloads directly in your inbox as soon as my daily video goes live. No spam, just pure actionable value weekly.
            </p>
          </div>

          <div className="lg:col-span-5">
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2.5">
              <input
                type="email"
                required
                disabled={newsletterSubmitted}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-zinc-900/80 border border-white/10 focus:border-blue-500 px-4 py-3 rounded-2xl text-zinc-200 text-xs outline-none transition-colors backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={newsletterSubmitted}
                className="px-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-md shadow-blue-500/10"
              >
                <Send className="w-4 h-4" />
                <span>Join</span>
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-black/40 border-t border-white/5 py-8 px-4 text-center text-xs text-zinc-500 space-y-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-zinc-400">
            {settings?.footerText || '© 2026 Technical Bilal Jahangir. All Rights Reserved.'}
          </p>
          <div className="flex items-center gap-2">
            <Laptop2 className="w-4 h-4 text-zinc-600" />
            <span className="font-bold text-[10px] text-zinc-500 tracking-widest uppercase">Premium AI Marketplace</span>
          </div>
        </div>
      </footer>

      {/* DETAILED MODAL SLIDE OVERLAY */}
      <AnimatePresence>
        {activePromptDetails && (
          <PromptDetails
            prompt={activePromptDetails}
            allPrompts={prompts}
            onClose={() => setActivePromptDetails(null)}
            onNavigateToPrompt={setActivePromptDetails}
            onCopySuccess={handleCopySuccess}
            onShare={handleSharePrompt}
          />
        )}
      </AnimatePresence>

      {/* ADMIN PORTAL GATEWAY SLIDE OVERLAY */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel
            onClose={() => { setIsAdminOpen(false); fetchPublicData(); }}
            onCopySuccess={handleCopySuccess}
            addToast={addToast}
            settings={settings || {
              websiteName: '', logoUrl: '', faviconUrl: '', footerText: '',
              youtubeUrl: '', facebookUrl: '', instagramUrl: '', twitterUrl: '',
              seoTitle: '', seoDescription: '', analyticsCode: ''
            }}
            onSettingsUpdate={fetchPublicData}
          />
        )}
      </AnimatePresence>

      {/* BACK TO TOP FLOATING BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollBackToTop}
            className="fixed bottom-6 left-6 z-30 p-3 bg-violet-600/90 hover:bg-violet-500 text-white rounded-full shadow-2xl transition-all border border-violet-500/20"
            title="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM INSTANCE */}
      <Toast toasts={toasts} removeToast={removeToast} />

    </div>
  );
}
