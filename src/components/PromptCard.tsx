import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Eye, Share2, Sparkles, Flame, Calendar } from 'lucide-react';
import { Prompt } from '../types';

interface PromptCardProps {
  key?: React.Key;
  prompt: Prompt;
  onViewDetails: (prompt: Prompt) => void;
  onCopySuccess: (text: string) => void;
  onShare: (prompt: Prompt) => void;
}

export default function PromptCard({ prompt, onViewDetails, onCopySuccess, onShare }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      onCopySuccess(prompt.title);
      
      // Send API stats update
      fetch(`/api/prompts/${prompt.id}/copy`, { method: 'POST' }).catch(() => {});
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all duration-300"
    >
      <div>
        {/* Thumbnail Layer with Hover Zoom */}
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 cursor-pointer" onClick={() => onViewDetails(prompt)}>
          <img
            src={prompt.thumbnailUrl}
            alt={prompt.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Subtle image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />
          
          {/* Badge overlays */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {prompt.isFeatured && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Featured
              </span>
            )}
            {prompt.isTrending && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-1 rounded-full shadow-lg">
                <Flame className="w-3.5 h-3.5" />
                Trending
              </span>
            )}
          </div>

          <span className="absolute bottom-3 right-3 text-xs font-semibold bg-zinc-900/90 backdrop-blur-md text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
            {prompt.category}
          </span>
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-3">
          {/* Date & Meta Info */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(prompt.publishDate)}</span>
          </div>

          <h3 
            onClick={() => onViewDetails(prompt)}
            className="text-lg font-bold text-zinc-100 hover:text-blue-400 cursor-pointer line-clamp-2 leading-snug transition-colors"
          >
            {prompt.title}
          </h3>

          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
            {prompt.description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 border-t border-white/5 mt-auto flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
            copied
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Prompt</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewDetails(prompt)}
          title="View Details"
          className="p-2.5 bg-zinc-800/85 hover:bg-zinc-700/80 border border-white/5 hover:border-zinc-700 text-zinc-300 hover:text-blue-400 rounded-xl transition-all"
        >
          <Eye className="w-4.5 h-4.5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onShare(prompt);
          }}
          title="Share Prompt"
          className="p-2.5 bg-zinc-800/85 hover:bg-zinc-700/80 border border-white/5 hover:border-zinc-700 text-zinc-300 hover:text-blue-400 rounded-xl transition-all"
        >
          <Share2 className="w-4.5 h-4.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
