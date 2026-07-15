import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, Facebook, Instagram, Twitter, ShieldCheck, Star, 
  ChevronLeft, ChevronRight, Flame, Clock, Copy, Check, Share2, Eye 
} from 'lucide-react';
import { WebsiteSettings, Prompt } from '../types';

interface HeroProps {
  settings: WebsiteSettings;
  prompts: Prompt[];
  onViewPrompt: (prompt: Prompt) => void;
  onCopySuccess: (title: string) => void;
  onShare: (prompt: Prompt) => void;
  onOpenAdmin: () => void;
}

export type HeroSlide = 
  | { type: 'image'; url: string; title: string; subtitle?: string }
  | { type: 'trending'; prompt: Prompt }
  | { type: 'recent'; prompt: Prompt };

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
    opacity: 0,
    scale: 1.02
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : dir > 0 ? '-100%' : 0,
    opacity: 0,
    scale: 0.98,
    zIndex: 0
  })
};

export default function Hero({ settings, prompts = [], onViewPrompt, onCopySuccess, onShare, onOpenAdmin }: HeroProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Construct our slides array combining branding image banners, trending prompts, and recent prompts
  const slides: HeroSlide[] = [
    {
      type: 'image',
      url: 'https://scontent.flyp14-1.fna.fbcdn.net/v/t39.30808-6/747799852_122138599791128597_1544083009850726003_n.jpg?stp=dst-jpg_tt6&cstp=mx1672x941&ctp=s590x590&_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_ohc=9VjhoROQbnAQ7kNvwFbDA7Q&_nc_oc=AdrQRdCjIa64nyMKFeEVdwBgjrUz7SYjt5HZVCAqz6JLIgGlJ8AxtTaYclkoFWK0o2k&_nc_zt=23&_nc_ht=scontent.flyp14-1.fna&_nc_gid=RvQ_hFlA0WN8DVnPgFEBzw&_nc_ss=7b2a8&oh=00_AQBq4KepgZNgAgg92bur40YBosZliXGSAyfiIWg4srqucw&oe=6A5D3AF4',
      title: 'Technical Bilal Jahangir',
      subtitle: 'Official AI Prompt Hub'
    },
    {
      type: 'image',
      url: 'https://scontent.flyp14-1.fna.fbcdn.net/v/t39.30808-6/746073872_122138599755128597_372765255934746540_n.jpg?stp=dst-jpg_tt6&cstp=mx1672x941&ctp=s1672x941&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=edja3AtcEmIQ7kNvwEhH58W&_nc_oc=Ado1QXut6VlZTfxtVuwI9SIfk5iYFgZC48ZD7F9ouTr8pLplm-9VHjIioY9ZuN3h5eI&_nc_zt=23&_nc_ht=scontent.flyp14-1.fna&_nc_gid=PkQQ9s3N_soV7jgamiT9ew&_nc_ss=7b2a8&oh=00_AQBQlECKRnipGR5eDQaeP3oR9cmWo8y-nLIGV7Y14tpUKA&oe=6A5D218D',
      title: 'YouTube Mastery & AI Prompts',
      subtitle: 'Grow Your Content with AI'
    }
  ];

  const publishedPrompts = prompts.filter(p => p.status === 'published');

  // Daily trending prompts
  const trending = publishedPrompts.filter(p => p.isTrending);
  trending.slice(0, 2).forEach(p => {
    slides.push({ type: 'trending', prompt: p });
  });

  // Recently posted prompts
  const recent = [...publishedPrompts].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
  recent.slice(0, 2).forEach(p => {
    // Avoid duplicate slide if it's already in trending
    if (!trending.slice(0, 2).some(tp => tp.id === p.id)) {
      slides.push({ type: 'recent', prompt: p });
    }
  });

  // Add the fallback standard channel banners at the end
  slides.push({
    type: 'image',
    url: 'https://chatgpt.com/backend-api/estuary/content?id=file_000000006dbc722fa581adaf6e726075&ts=495586&p=fs&cid=1&sig=8fb7b4aa508349c11cad8391f7787653e2a7421f58f3d50a921c27a52a705b92&v=0',
    title: 'Midjourney & ChatGPT Payloads'
  });

  const [ [activeSlide, direction], setActiveSlideState ] = useState([0, 0]);

  const slideTo = (newIndex: number, newDirection: number) => {
    setActiveSlideState([newIndex, newDirection]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeSlide + 1) % slides.length;
      slideTo(nextIndex, 1);
    }, 5500); // 5.5 seconds interval for richer text readability
    return () => clearInterval(timer);
  }, [activeSlide, slides.length]);

  const handlePrev = (e: MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (activeSlide - 1 + slides.length) % slides.length;
    slideTo(prevIndex, -1);
  };

  const handleNext = (e: MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (activeSlide + 1) % slides.length;
    slideTo(nextIndex, 1);
  };

  const handleCopyPrompt = async (e: MouseEvent, prompt: Prompt) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopiedId(prompt.id);
      onCopySuccess(prompt.title);
      fetch(`/api/prompts/${prompt.id}/copy`, { method: 'POST' }).catch(() => {});
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const currentSlide = slides[activeSlide];

  const handleSlideClick = () => {
    if (currentSlide.type === 'image') {
      window.open(settings.youtubeUrl || 'https://www.youtube.com/@Technicalbilaljahangir', '_blank');
    } else {
      onViewPrompt(currentSlide.prompt);
    }
  };

  return (
    <section className="relative w-full py-12 md:py-16 px-4 md:px-8 overflow-hidden flex flex-col items-center">
      {/* Background radial gradients for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
        
        {/* Left half: Channel Details & Description */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/5 text-blue-400 text-xs font-semibold shadow-lg"
          >
            <Star className="w-3.5 h-3.5 fill-blue-400 animate-pulse" />
            <span>Daily AI Prompt Releases</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-3xl md:text-5xl font-black text-zinc-100 tracking-tight leading-none"
            >
              Copy Premium AI Prompts From{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                {settings.websiteName || 'Technical Bilal Jahangir'}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-zinc-400 text-sm md:text-base leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0"
            >
              Get instant, free access to the exact AI prompt payloads featured in my daily YouTube videos. 
              Meticulously tested for ChatGPT, Midjourney, Flux, Kling, and Google Veo 3. Copy with one click.
            </motion.p>
          </div>

          {/* Social media connections */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
          >
            {/* Subscribe button */}
            <motion.a
              href={settings.youtubeUrl || 'https://www.youtube.com/@Technicalbilaljahangir'}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold rounded-full text-sm shadow-lg shadow-red-500/20 transition-all"
            >
              <Youtube className="w-5 h-5 fill-white" />
              Subscribe Channel
            </motion.a>

            {/* Social Icons group */}
            <div className="flex items-center gap-2">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white rounded-xl transition-all"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white rounded-xl transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white rounded-xl transition-all"
                  title="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Admin console entry gateway */}
            <button
              onClick={onOpenAdmin}
              className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 rounded-full transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Admin Console</span>
            </button>
          </motion.div>
        </div>

        {/* Right half: Dynamic Slideshow Overlay */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lg:col-span-5 relative w-full aspect-video md:aspect-[21/9] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5 hover:border-blue-500/30 bg-zinc-900 cursor-pointer group"
          onClick={handleSlideClick}
        >
          {/* Animated Background Slideshow */}
          <div className="absolute inset-0 w-full h-full select-none overflow-hidden rounded-3xl bg-zinc-950">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 220, damping: 28 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 }
                }}
                className="absolute inset-0 w-full h-full select-none overflow-hidden rounded-3xl"
              >
                {/* Background full image */}
                <img
                  src={currentSlide.type === 'image' ? currentSlide.url : currentSlide.prompt.thumbnailUrl}
                  alt={currentSlide.type === 'image' ? currentSlide.title : currentSlide.prompt.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                />

                {/* Black gradient overlay for premium legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {currentSlide.type === 'image' ? (
                  /* Standard Image branding overlay */
                  <div className="absolute inset-0 flex items-end p-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-blue-500/50 p-0.5 bg-zinc-950 shadow-md">
                        <img
                          src={settings.logoUrl || 'https://yt3.googleusercontent.com/p_Js-kUEs-gOrrAhKFfTFRZR6ZxD56vErh2e4q5VN0BuLtFzhW9vcd3iMbsufcDDwlKDG9OqQg=s900-c-k-c0x00ffffff-no-rj'}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1">
                          {settings.websiteName || 'Technical Bilal Jahangir'}
                          <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] font-black text-white">✓</span>
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-medium">@Technicalbilaljahangir · Official Marketplace</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Prompt Slide overlay - fully integrated background slide matching style */
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    {/* Top row indicators */}
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/10 ${
                        currentSlide.type === 'trending' 
                          ? 'bg-gradient-to-r from-orange-500/90 to-amber-600/90 text-white' 
                          : 'bg-gradient-to-r from-blue-500/90 to-indigo-600/90 text-white'
                      }`}>
                        {currentSlide.type === 'trending' ? (
                          <>
                            <Flame className="w-3.5 h-3.5" />
                            Daily Trending
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            Recently Released
                          </>
                        )}
                      </span>
                      
                      <span className="text-xs font-semibold bg-zinc-950/70 backdrop-blur-md text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                        {currentSlide.prompt.category}
                      </span>
                    </div>

                    {/* Bottom half overlay info & quick-copy triggers */}
                    <div className="bg-zinc-950/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3 shadow-2xl">
                      <div className="space-y-1">
                        <h3 className="text-base md:text-lg font-bold text-white line-clamp-1 leading-snug">
                          {currentSlide.prompt.title}
                        </h3>
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {currentSlide.prompt.description}
                        </p>
                      </div>

                      {/* Unified Actions Row */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={(e) => handleCopyPrompt(e, currentSlide.prompt)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs transition-all duration-300 ${
                            copiedId === currentSlide.prompt.id
                              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-white text-black hover:bg-zinc-200'
                          }`}
                        >
                          {copiedId === currentSlide.prompt.id ? (
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
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewPrompt(currentSlide.prompt);
                          }}
                          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-blue-400 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShare(currentSlide.prompt);
                          }}
                          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-blue-400 rounded-xl transition-all"
                          title="Share Prompt"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Manual controls (Prev / Next Arrows) on hover */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-zinc-950/80 text-white/80 hover:text-white hover:bg-zinc-900 border border-white/10 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-zinc-950/80 text-white/80 hover:text-white hover:bg-zinc-900 border border-white/10 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg"
            title="Next Slide"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>

          {/* Bullet indicators */}
          <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/5">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (index !== activeSlide) {
                    slideTo(index, index > activeSlide ? 1 : -1);
                  }
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === activeSlide ? 'bg-blue-400 w-3' : 'bg-white/40 hover:bg-white/70'
                }`}
                title={
                  slide.type === 'image' 
                    ? `Banner: ${slide.title}` 
                    : slide.type === 'trending' 
                      ? `Trending: ${slide.prompt.title}` 
                      : `Recent: ${slide.prompt.title}`
                }
              />
            ))}
          </div>   </motion.div>

      </div>
    </section>
  );
}
