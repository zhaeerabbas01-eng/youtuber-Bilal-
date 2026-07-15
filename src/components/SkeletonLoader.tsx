import { motion } from 'motion/react';

export function PromptCardSkeleton() {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden p-4 space-y-4">
      {/* Thumbnail Aspect Ratio Skeleton */}
      <div className="relative aspect-video w-full rounded-xl bg-slate-800/50 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"
        />
      </div>
      
      {/* Category & Badge */}
      <div className="flex justify-between items-center">
        <div className="w-16 h-5 rounded bg-slate-800/60 relative overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"
          />
        </div>
        <div className="w-24 h-5 rounded bg-slate-800/60 relative overflow-hidden" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="w-full h-6 rounded bg-slate-800/60 relative overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"
          />
        </div>
        <div className="w-3/4 h-6 rounded bg-slate-800/60 relative overflow-hidden" />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="w-full h-4 rounded bg-slate-800/40" />
        <div className="w-5/6 h-4 rounded bg-slate-800/40" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-10 rounded-xl bg-slate-800/60" />
        <div className="w-10 h-10 rounded-xl bg-slate-800/60" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="w-24 h-10 rounded-full bg-slate-800/40 animate-pulse border border-slate-800/40"
        />
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl space-y-3">
          <div className="w-12 h-4 rounded bg-slate-800/60" />
          <div className="w-20 h-8 rounded bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
