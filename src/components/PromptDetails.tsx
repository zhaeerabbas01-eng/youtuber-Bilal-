import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Copy, Check, Eye, Share2, Sparkles, Flame, Calendar, 
  ChevronLeft, ChevronRight, Hash, ArrowLeft, TrendingUp
} from 'lucide-react';
import { Prompt } from '../types';

interface PromptDetailsProps {
  prompt: Prompt;
  allPrompts: Prompt[];
  onClose: () => void;
  onNavigateToPrompt: (prompt: Prompt) => void;
  onCopySuccess: (text: string) => void;
  onShare: (prompt: Prompt) => void;
}

export default function PromptDetails({ 
  prompt, 
  allPrompts, 
  onClose, 
  onNavigateToPrompt, 
  onCopySuccess, 
  onShare 
}: PromptDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [activePrompt, setActivePrompt] = useState<Prompt>(prompt);

  useEffect(() => {
    setActivePrompt(prompt);
    // Scroll details container to top when prompt changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [prompt]);

  // Find index and handle prev/next
  const currentCategoryPrompts = allPrompts.filter(p => p.status === 'published');
  const currentIndex = currentCategoryPrompts.findIndex(p => p.id === activePrompt.id);
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigateToPrompt(currentCategoryPrompts[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentCategoryPrompts.length - 1) {
      onNavigateToPrompt(currentCategoryPrompts[currentIndex + 1]);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activePrompt.promptText);
      setCopied(true);
      onCopySuccess(activePrompt.title);
      
      // Send API stats update
      fetch(`/api/prompts/${activePrompt.id}/copy`, { method: 'POST' }).catch(() => {});
      
      // Update copies in active prompt state passively
      setActivePrompt(prev => ({ ...prev, copies: (prev.copies || 0) + 1 }));

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Filter 3 related prompts
  const relatedPrompts = allPrompts
    .filter(p => p.status === 'published' && p.id !== activePrompt.id && p.category === activePrompt.category)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-zinc-950/98 overflow-y-auto"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="min-h-screen flex flex-col">
        {/* Detail Sticky Header */}
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 md:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-sm hidden sm:inline">Back to Prompt Marketplace</span>
              <span className="font-semibold text-sm sm:hidden">Back</span>
            </button>

            {/* Navigation Arrows & Action Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-zinc-900 border border-white/5 rounded-xl overflow-hidden mr-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Previous Prompt"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/5" />
                <button
                  onClick={handleNext}
                  disabled={currentIndex >= currentCategoryPrompts.length - 1 || currentIndex === -1}
                  className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Next Prompt"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => onShare(activePrompt)}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-zinc-300 hover:text-white transition-all"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-12">
          {/* Main Hero Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Thumbnail & Badges (Lg: 5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-zinc-950">
                <img
                  src={activePrompt.thumbnailUrl}
                  alt={activePrompt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  {activePrompt.isFeatured && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/20">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Featured
                    </span>
                  )}
                  {activePrompt.isTrending && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-1 rounded-full shadow-lg">
                      <Flame className="w-3.5 h-3.5" />
                      Trending
                    </span>
                  )}
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Total Views
                  </span>
                  <p className="text-2xl font-black text-zinc-100">{activePrompt.views || 0}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Copies Saved
                  </span>
                  <p className="text-2xl font-black text-blue-400">{activePrompt.copies || 0}</p>
                </div>
              </div>
            </div>

            {/* Right: Title, Category, Keywords & Prompt Box (Lg: 7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                    {activePrompt.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(activePrompt.publishDate)}
                  </span>
                </div>

                <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
                  {activePrompt.title}
                </h1>

                <p className="text-base text-zinc-400 leading-relaxed font-normal">
                  {activePrompt.description}
                </p>
              </div>

              {/* Dynamic Keywords Tag Cloud */}
              {activePrompt.seoKeywords && activePrompt.seoKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <Hash className="w-4 h-4 text-zinc-500 shrink-0" />
                  {activePrompt.seoKeywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-zinc-900 border border-white/5 hover:border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md transition-colors"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Prompt Visual Box */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div className="bg-zinc-900/90 px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    AI Prompt Payload
                  </span>
                  
                  {/* Web Clipboard Copy Action */}
                  <button 
                    onClick={handleCopy}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Clipboard</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6">
                  <pre className="font-mono text-sm md:text-base text-zinc-200 whitespace-pre-wrap break-words leading-relaxed select-all">
                    {activePrompt.promptText}
                  </pre>
                </div>
              </div>

              {/* Sticky bottom mobile action trigger / Large standard button */}
              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-lg transition-all ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>PROMPT COPIED SUCCESSFULLY</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>COPY PROMPT NOW</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Related Prompts Grid Section */}
          {relatedPrompts.length > 0 && (
            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Related Prompts
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPrompts.map((rp) => (
                  <motion.div
                    key={rp.id}
                    whileHover={{ y: -4 }}
                    onClick={() => onNavigateToPrompt(rp)}
                    className="cursor-pointer group flex flex-col justify-between bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/20 transition-all p-3 space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-950">
                        <img
                          src={rp.thumbnailUrl}
                          alt={rp.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{rp.category}</span>
                        <h4 className="font-bold text-zinc-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {rp.title}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {rp.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {rp.views || 0}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {rp.copies || 0} copies
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
