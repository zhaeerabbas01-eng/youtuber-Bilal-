import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { Prompt, Category, WebsiteSettings } from './src/types';

// Configurable constants
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure necessary directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helpers for secure hashing and token generation
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Database initial structure & defaults
interface DBStructure {
  prompts: Prompt[];
  categories: Category[];
  settings: WebsiteSettings;
  admin: {
    username: string;
    passwordHash: string;
  };
  activeTokens: Record<string, { username: string; expiresAt: number }>;
}

const defaultCategories: Category[] = [
  { id: 'cat-veo3', name: 'Veo 3', slug: 'veo-3' },
  { id: 'cat-chatgpt', name: 'ChatGPT', slug: 'chatgpt' },
  { id: 'cat-midjourney', name: 'Midjourney', slug: 'midjourney' },
  { id: 'cat-flux', name: 'Flux', slug: 'flux' },
  { id: 'cat-kling', name: 'Kling', slug: 'kling' },
  { id: 'cat-image', name: 'Image Prompt', slug: 'image-prompt' },
  { id: 'cat-video', name: 'Video Prompt', slug: 'video-prompt' },
  { id: 'cat-thumbnail', name: 'Thumbnail Prompt', slug: 'thumbnail-prompt' }
];

const defaultSettings: WebsiteSettings = {
  websiteName: 'Technical Bilal Jahangir',
  logoUrl: 'https://yt3.googleusercontent.com/p_Js-kUEs-gOrrAhKFfTFRZR6ZxD56vErh2e4q5VN0BuLtFzhW9vcd3iMbsufcDDwlKDG9OqQg=s900-c-k-c0x00ffffff-no-rj',
  faviconUrl: 'https://chatgpt.com/backend-api/estuary/content?id=file_00000000d68c720ca0a1bbc493100c1c&ts=495586&p=fs&cid=1&sig=7e78ad40b5bda77304a5f9e4591dab6ee478afaadced3dcc6bc16dbcec338f0b&v=0',
  footerText: '© 2026 Technical Bilal Jahangir. All Rights Reserved. Empowering Creators with AI Prompt Engineering.',
  youtubeUrl: 'https://www.youtube.com/@Technicalbilaljahangir',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  twitterUrl: 'https://twitter.com',
  seoTitle: 'Technical Bilal Jahangir - AI Prompt Marketplace',
  seoDescription: 'Unlock premium, tested AI prompts from Technical Bilal Jahangir. Instant copy for ChatGPT, Midjourney, Flux, Kling, and Veo 3.',
  analyticsCode: '<!-- Google Analytics Placeholder -->'
};

const defaultPrompts: Prompt[] = [
  {
    id: 'prompt-1',
    title: 'Photorealistic Cinematic Portrait Master Prompt',
    promptText: 'Cinematic portrait shot of a rugged explorer, golden hour lighting, shot on 85mm anamorphic lens, highly detailed fabric textures, rich color grading, sharp focus on eyes, subtle atmospheric dust particles, photorealistic, 8k resolution --ar 16:9 --style raw --v 6.0',
    description: 'Use this premium prompt in Midjourney v6 to generate jaw-dropping cinematic portraits with dramatic golden hour illumination and rich texturing.',
    category: 'Midjourney',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    seoKeywords: ['midjourney', 'cinematic', 'portrait', 'realistic', '8k'],
    isFeatured: true,
    isTrending: true,
    status: 'published',
    publishDate: '2026-07-14T12:00:00Z',
    views: 1240,
    copies: 489
  },
  {
    id: 'prompt-2',
    title: 'High-Converting Tech Video Script & Hook Generator',
    promptText: 'Act as an expert YouTube Scriptwriter. Write a high-retention 8-minute script about the latest AI video tools. Start with an ultra-engaging 15-second visual hook targeting aspiring content creators, followed by a story-driven introduction, 3 actionable main value pillars, and a compelling call-to-action to subscribe to Technical Bilal Jahangir. Keep the tone friendly, enthusiastic, and fast-paced.',
    description: 'A powerful ChatGPT prompt that structures any technical video to maximize average percentage viewed (APV) and retention.',
    category: 'ChatGPT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=600',
    seoKeywords: ['chatgpt', 'youtube script', 'hook generator', 'video structure'],
    isFeatured: true,
    isTrending: false,
    status: 'published',
    publishDate: '2026-07-13T15:30:00Z',
    views: 890,
    copies: 342
  },
  {
    id: 'prompt-3',
    title: 'Veo 3 AI Cinematic Slow Motion Tracking Shot',
    promptText: 'A slow motion tracking shot of a futuristic sports car racing through a neon-lit cyberpunk Tokyo street. Rain drops reflecting on the glossy chassis, high-speed camera tracking, dramatic lens flare, 4k ultra-high-definition rendering, cinematic sound design synchronization.',
    description: 'Perfect for creating stunning, highly immersive b-roll assets using Google Veo 3 video model.',
    category: 'Veo 3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600',
    seoKeywords: ['veo 3', 'cinematic video', 'neon street', 'cyberpunk', 'video prompt'],
    isFeatured: false,
    isTrending: true,
    status: 'published',
    publishDate: '2026-07-12T09:15:00Z',
    views: 730,
    copies: 211
  },
  {
    id: 'prompt-4',
    title: 'Flux AI Cybernetic Character Design Sheet',
    promptText: 'Character concept design sheet of a robotic mech engineer, front view, side view, back view, blueprint elements in the background, highly detailed machinery components, Unreal Engine 5 render style, concept art, rich lighting --ar 4:3',
    description: 'This Flux prompt generates highly detailed, consistent, multi-angle design sheets for characters or props.',
    category: 'Flux',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
    seoKeywords: ['flux', 'character design', 'cybernetic', 'concept sheet'],
    isFeatured: false,
    isTrending: false,
    status: 'published',
    publishDate: '2026-07-11T18:45:00Z',
    views: 615,
    copies: 154
  },
  {
    id: 'prompt-5',
    title: 'Kling Text-To-Video Immersive Flight Over Mountains',
    promptText: 'A continuous first-person drone flight winding down a steep snowy mountain canyon during sunrise. Dramatic volumetric fog, highly detailed snowy cliffs, cinematic camera tilt, smooth camera stabilization, hyper-realistic, photorealistic.',
    description: 'Bring landscapes to life with this Kling video model prompt designed for hyper-realistic drone camera work.',
    category: 'Kling',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
    seoKeywords: ['kling', 'video prompt', 'drone shot', 'mountain sunrise'],
    isFeatured: false,
    isTrending: true,
    status: 'published',
    publishDate: '2026-07-10T14:20:00Z',
    views: 540,
    copies: 198
  }
];

// Read DB from disk or write defaults
function loadDB(): DBStructure {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: DBStructure = {
      prompts: defaultPrompts,
      categories: defaultCategories,
      settings: defaultSettings,
      admin: {
        username: 'admin',
        passwordHash: hashPassword('admin123') // Default password: admin123
      },
      activeTokens: {}
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Backward compatibility & integrity check
    if (!parsed.prompts) parsed.prompts = [];
    if (!parsed.categories) parsed.categories = defaultCategories;
    if (!parsed.settings) parsed.settings = defaultSettings;
    if (!parsed.admin) {
      parsed.admin = {
        username: 'admin',
        passwordHash: hashPassword('admin123')
      };
    }
    if (!parsed.activeTokens) parsed.activeTokens = {};
    return parsed;
  } catch (err) {
    console.error('Error reading DB, using defaults', err);
    return {
      prompts: defaultPrompts,
      categories: defaultCategories,
      settings: defaultSettings,
      admin: { username: 'admin', passwordHash: hashPassword('admin123') },
      activeTokens: {}
    };
  }
}

function saveDB(db: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error writing DB to disk', err);
  }
}

// Token cleanup (expired sessions)
function cleanExpiredTokens(db: DBStructure) {
  const now = Date.now();
  let modified = false;
  for (const [token, session] of Object.entries(db.activeTokens)) {
    if (session.expiresAt < now) {
      delete db.activeTokens[token];
      modified = true;
    }
  }
  if (modified) {
    saveDB(db);
  }
}

async function startServer() {
  const app = express();
  
  // Custom body parsers to handle large image payload
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve static uploaded files
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Rate limiter state for login
  const loginAttempts: Record<string, { count: number; lockedUntil: number }> = {};

  // Authentication Middleware
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const db = loadDB();
    cleanExpiredTokens(db);

    const session = db.activeTokens[token];
    if (!session) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      return;
    }

    // Extend token expiration (30 minutes sliding window)
    session.expiresAt = Date.now() + 30 * 60 * 1000;
    saveDB(db);

    (req as any).adminUser = session.username;
    next();
  };

  // --- PUBLIC ENDPOINTS ---

  // Get website settings
  app.get('/api/settings', (req, res) => {
    const db = loadDB();
    res.json(db.settings);
  });

  // Get categories
  app.get('/api/categories', (req, res) => {
    const db = loadDB();
    res.json(db.categories);
  });

  // Get all published prompts (with search/filter)
  app.get('/api/prompts', (req, res) => {
    const db = loadDB();
    const search = (req.query.search as string || '').toLowerCase();
    const category = req.query.category as string || '';
    const featured = req.query.featured === 'true';
    const trending = req.query.trending === 'true';

    let filtered = db.prompts.filter(p => p.status === 'published');

    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (featured) {
      filtered = filtered.filter(p => p.isFeatured);
    }

    if (trending) {
      filtered = filtered.filter(p => p.isTrending);
    }

    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.promptText.toLowerCase().includes(search) ||
        (p.seoKeywords && p.seoKeywords.some(kw => kw.toLowerCase().includes(search))) ||
        p.category.toLowerCase().includes(search)
      );
    }

    // Sort by latest publish date
    filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    res.json(filtered);
  });

  // Get single published prompt details
  app.get('/api/prompts/:id', (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const prompt = db.prompts.find(p => p.id === id);

    if (!prompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    // Increment view count passively
    prompt.views = (prompt.views || 0) + 1;
    saveDB(db);

    res.json(prompt);
  });

  // Increment prompt copy count
  app.post('/api/prompts/:id/copy', (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const prompt = db.prompts.find(p => p.id === id);

    if (!prompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    prompt.copies = (prompt.copies || 0) + 1;
    saveDB(db);

    res.json({ success: true, copies: prompt.copies });
  });

  // --- ADMIN AUTHENTICATION ---

  // Admin Login (with built-in basic rate-limiting)
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || 'unknown';

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Check lockout status
    const attempt = loginAttempts[ip];
    if (attempt && attempt.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      res.status(429).json({ error: `Too many failed attempts. Locked out. Please try again in ${minutesLeft} minutes.` });
      return;
    }

    const db = loadDB();
    const isUsernameMatch = db.admin.username === username;
    const isPasswordMatch = db.admin.passwordHash === hashPassword(password);

    if (isUsernameMatch && isPasswordMatch) {
      // Clear rate limiter
      delete loginAttempts[ip];

      const token = generateToken();
      const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes session
      
      db.activeTokens[token] = {
        username,
        expiresAt
      };
      saveDB(db);

      res.json({ token, username });
    } else {
      // Record failed attempt
      if (!loginAttempts[ip]) {
        loginAttempts[ip] = { count: 1, lockedUntil: 0 };
      } else {
        loginAttempts[ip].count += 1;
      }

      if (loginAttempts[ip].count >= 5) {
        loginAttempts[ip].lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
        res.status(429).json({ error: 'Maximum login attempts reached. Locked out for 15 minutes.' });
      } else {
        res.status(401).json({ error: `Invalid credentials. ${5 - loginAttempts[ip].count} attempts remaining.` });
      }
    }
  });

  // Verify Admin Session / Get Me
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const token = authHeader.split(' ')[1];
    const db = loadDB();
    cleanExpiredTokens(db);

    const session = db.activeTokens[token];
    if (!session) {
      res.status(401).json({ authenticated: false });
      return;
    }

    res.json({ authenticated: true, username: session.username });
  });

  // Admin Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const db = loadDB();
      delete db.activeTokens[token];
      saveDB(db);
    }
    res.json({ success: true });
  });

  // --- PROTECTED ADMIN API ENDPOINTS ---

  // Admin Get All Prompts (both published and drafts)
  app.get('/api/admin/prompts', requireAdmin, (req, res) => {
    const db = loadDB();
    // No filtering, return all, sorted by date (latest first)
    const sorted = [...db.prompts].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    res.json(sorted);
  });

  // Admin Create Prompt
  app.post('/api/admin/prompts', requireAdmin, (req, res) => {
    const newPromptData = req.body as Partial<Prompt>;
    if (!newPromptData.title || !newPromptData.promptText || !newPromptData.category) {
      res.status(400).json({ error: 'Title, prompt text, and category are required' });
      return;
    }

    const db = loadDB();
    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      title: newPromptData.title,
      promptText: newPromptData.promptText,
      description: newPromptData.description || '',
      category: newPromptData.category,
      thumbnailUrl: newPromptData.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      seoKeywords: Array.isArray(newPromptData.seoKeywords) ? newPromptData.seoKeywords : [],
      isFeatured: !!newPromptData.isFeatured,
      isTrending: !!newPromptData.isTrending,
      status: newPromptData.status === 'draft' ? 'draft' : 'published',
      publishDate: new Date().toISOString(),
      views: 0,
      copies: 0
    };

    db.prompts.push(newPrompt);
    saveDB(db);
    res.status(201).json(newPrompt);
  });

  // Admin Update Prompt
  app.put('/api/admin/prompts/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const updateData = req.body as Partial<Prompt>;
    const db = loadDB();
    const index = db.prompts.findIndex(p => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    const existing = db.prompts[index];
    const updated: Prompt = {
      ...existing,
      ...updateData,
      id, // ensure ID never changes
      publishDate: existing.publishDate // preserve original date
    };

    db.prompts[index] = updated;
    saveDB(db);
    res.json(updated);
  });

  // Admin Delete Prompt
  app.delete('/api/admin/prompts/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const initialLength = db.prompts.length;
    db.prompts = db.prompts.filter(p => p.id !== id);

    if (db.prompts.length === initialLength) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    saveDB(db);
    res.json({ success: true });
  });

  // Admin Bulk Delete Prompts
  app.post('/api/admin/prompts/bulk-delete', requireAdmin, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      res.status(400).json({ error: 'Invalid payload: ids must be an array' });
      return;
    }

    const db = loadDB();
    db.prompts = db.prompts.filter(p => !ids.includes(p.id));
    saveDB(db);
    res.json({ success: true, count: ids.length });
  });

  // Admin Duplicate Prompt
  app.post('/api/admin/prompts/:id/duplicate', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const existing = db.prompts.find(p => p.id === id);

    if (!existing) {
      res.status(404).json({ error: 'Prompt to duplicate not found' });
      return;
    }

    const duplicated: Prompt = {
      ...existing,
      id: `prompt-dup-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      status: 'draft', // duplicated items start as draft
      publishDate: new Date().toISOString(),
      views: 0,
      copies: 0
    };

    db.prompts.push(duplicated);
    saveDB(db);
    res.status(201).json(duplicated);
  });

  // Admin Create Category
  app.post('/api/admin/categories', requireAdmin, (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const db = loadDB();
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check duplicates
    if (db.categories.some(c => c.slug === slug || c.name.toLowerCase() === cleanName.toLowerCase())) {
      res.status(400).json({ error: 'Category already exists' });
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      slug
    };

    db.categories.push(newCategory);
    saveDB(db);
    res.status(201).json(newCategory);
  });

  // Admin Delete Category
  app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const categoryToDelete = db.categories.find(c => c.id === id);

    if (!categoryToDelete) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if category is currently used by any prompts
    const inUse = db.prompts.some(p => p.category.toLowerCase() === categoryToDelete.name.toLowerCase());
    if (inUse) {
      res.status(400).json({ error: 'Cannot delete category because it is currently assigned to prompts.' });
      return;
    }

    db.categories = db.categories.filter(c => c.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // Admin Get System Dashboard Stats
  app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const db = loadDB();
    const totalPrompts = db.prompts.length;
    const publishedPrompts = db.prompts.filter(p => p.status === 'published').length;
    const draftPrompts = totalPrompts - publishedPrompts;
    const totalViews = db.prompts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalCopies = db.prompts.reduce((sum, p) => sum + (p.copies || 0), 0);
    const featuredPrompts = db.prompts.filter(p => p.isFeatured).length;
    const trendingPrompts = db.prompts.filter(p => p.isTrending).length;

    const categoryCounts: Record<string, number> = {};
    db.categories.forEach(c => {
      categoryCounts[c.name] = db.prompts.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
    });

    res.json({
      totalPrompts,
      publishedPrompts,
      draftPrompts,
      totalViews,
      totalCopies,
      featuredPrompts,
      trendingPrompts,
      categoryCounts
    });
  });

  // Admin Update Website Settings & Credentials
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const { settings, adminCredentials } = req.body;
    const db = loadDB();

    if (settings) {
      db.settings = {
        ...db.settings,
        ...settings
      };
    }

    if (adminCredentials) {
      const { currentPassword, newUsername, newPassword } = adminCredentials;
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to update credentials' });
        return;
      }

      if (db.admin.passwordHash !== hashPassword(currentPassword)) {
        res.status(400).json({ error: 'Incorrect current password' });
        return;
      }

      if (newUsername && newUsername.trim()) {
        db.admin.username = newUsername.trim();
      }

      if (newPassword && newPassword.trim()) {
        db.admin.passwordHash = hashPassword(newPassword.trim());
        // Invalidate active tokens so they are forced to log back in
        db.activeTokens = {};
      }
    }

    saveDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // Admin base64 upload thumbnail
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      res.status(400).json({ error: 'File name and file base64 data are required' });
      return;
    }

    try {
      // Remove dataurl prefix if present
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]+/g, '_');
      const uniqueName = `${Date.now()}_${cleanFileName}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(filePath, buffer);

      res.json({ url: `/uploads/${uniqueName}` });
    } catch (err: any) {
      console.error('File saving failed', err);
      res.status(500).json({ error: 'Failed to write file to storage' });
    }
  });


  // --- FRONTEND INTEGRATION & VITE ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Fallback listen port
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
