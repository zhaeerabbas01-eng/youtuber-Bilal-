import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, PlusCircle, ListTodo, FolderGit, Settings as SettingsIcon, 
  LogOut, LogIn, Sparkles, Flame, Eye, Copy, ArrowLeft, Trash2, Edit, CopyPlus, 
  Upload, EyeOff, Search, ChevronLeft, ChevronRight, CheckSquare, Square, Save, 
  ShieldAlert, Lock, User, RefreshCw, X
} from 'lucide-react';
import { Prompt, Category, WebsiteSettings, DashboardStats } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  onCopySuccess: (text: string) => void;
  addToast: (text: string, type: 'success' | 'error') => void;
  settings: WebsiteSettings;
  onSettingsUpdate: () => void;
}

type AdminTab = 'overview' | 'add' | 'manage' | 'categories' | 'settings';

export default function AdminPanel({ onClose, onCopySuccess, addToast, settings, onSettingsUpdate }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [token, setToken] = useState<string>('');
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Panel States
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Create / Edit Prompt Form States
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPromptText, setFormPromptText] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [isUploading, setIsUploading] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage Prompts Tab States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const itemsPerPage = 8;

  // Categories Tab States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Settings Tab States
  const [settingsWebsiteName, setSettingsWebsiteName] = useState('');
  const [settingsLogoUrl, setSettingsLogoUrl] = useState('');
  const [settingsFaviconUrl, setSettingsFaviconUrl] = useState('');
  const [settingsFooterText, setSettingsFooterText] = useState('');
  const [settingsYoutubeUrl, setSettingsYoutubeUrl] = useState('');
  const [settingsFacebookUrl, setSettingsFacebookUrl] = useState('');
  const [settingsInstagramUrl, setSettingsInstagramUrl] = useState('');
  const [settingsTwitterUrl, setSettingsTwitterUrl] = useState('');
  const [settingsSeoTitle, setSettingsSeoTitle] = useState('');
  const [settingsSeoDescription, setSettingsSeoDescription] = useState('');
  const [settingsAnalytics, setSettingsAnalytics] = useState('');

  // Password Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credLoading, setCredLoading] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    } else {
      setAuthenticated(false);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        loadAdminData(authToken);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  const loadAdminData = async (authToken = token) => {
    const headers = { Authorization: `Bearer ${authToken}` };
    try {
      // Fetch statistics
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch all prompts
      const promptsRes = await fetch('/api/admin/prompts', { headers });
      if (promptsRes.ok) {
        const promptsData = await promptsRes.json();
        setPrompts(promptsData);
      }

      // Fetch categories
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setAuthenticated(true);
        addToast('Admin Login Successful', 'success');
        loadAdminData(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials');
        addToast(data.error || 'Login Failed', 'error');
      }
    } catch {
      setLoginError('Server error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('admin_token');
    setToken('');
    setAuthenticated(false);
    setStats(null);
    setPrompts([]);
  };

  // Website Settings Fields Prep
  useEffect(() => {
    if (authenticated && settings) {
      setSettingsWebsiteName(settings.websiteName || '');
      setSettingsLogoUrl(settings.logoUrl || '');
      setSettingsFaviconUrl(settings.faviconUrl || '');
      setSettingsFooterText(settings.footerText || '');
      setSettingsYoutubeUrl(settings.youtubeUrl || '');
      setSettingsFacebookUrl(settings.facebookUrl || '');
      setSettingsInstagramUrl(settings.instagramUrl || '');
      setSettingsTwitterUrl(settings.twitterUrl || '');
      setSettingsSeoTitle(settings.seoTitle || '');
      setSettingsSeoDescription(settings.seoDescription || '');
      setSettingsAnalytics(settings.analyticsCode || '');
    }
  }, [authenticated, settings]);

  // Form Submissions (Create or Update Prompt)
  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPromptText || !formCategory) {
      addToast('Please fill in all mandatory fields', 'error');
      return;
    }

    const payload = {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      promptText: formPromptText,
      thumbnailUrl: formThumbnailUrl,
      seoKeywords: formKeywords.split(',').map(k => k.trim()).filter(Boolean),
      isFeatured: formIsFeatured,
      isTrending: formIsTrending,
      status: formStatus
    };

    const url = editingPromptId ? `/api/admin/prompts/${editingPromptId}` : '/api/admin/prompts';
    const method = editingPromptId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast(
          editingPromptId ? 'Prompt Updated Successfully' : 'New Prompt Created Successfully',
          'success'
        );
        resetPromptForm();
        loadAdminData();
        setActiveTab('manage');
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to save prompt', 'error');
      }
    } catch {
      addToast('An error occurred. Please try again.', 'error');
    }
  };

  const handleEditPrompt = (p: Prompt) => {
    setEditingPromptId(p.id);
    setFormTitle(p.title);
    setFormDescription(p.description);
    setFormCategory(p.category);
    setFormPromptText(p.promptText);
    setFormThumbnailUrl(p.thumbnailUrl);
    setFormKeywords(p.seoKeywords ? p.seoKeywords.join(', ') : '');
    setFormIsFeatured(p.isFeatured);
    setFormIsTrending(p.isTrending);
    setFormStatus(p.status);
    setActiveTab('add');
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this prompt?')) return;
    try {
      const res = await fetch(`/api/admin/prompts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Prompt Deleted Successfully', 'success');
        loadAdminData();
      } else {
        addToast('Failed to delete prompt', 'error');
      }
    } catch {
      addToast('Error occurred.', 'error');
    }
  };

  const handleDuplicatePrompt = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/prompts/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Prompt Duplicated to Drafts', 'success');
        loadAdminData();
        setActiveTab('manage');
      } else {
        addToast('Duplication failed', 'error');
      }
    } catch {
      addToast('Error duplicating.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPromptIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedPromptIds.length} prompts?`)) return;

    try {
      const res = await fetch('/api/admin/prompts/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedPromptIds })
      });

      if (res.ok) {
        addToast(`${selectedPromptIds.length} Prompts Deleted`, 'success');
        setSelectedPromptIds([]);
        loadAdminData();
      } else {
        addToast('Bulk deletion failed', 'error');
      }
    } catch {
      addToast('Error during bulk deletion', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCategoryLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName })
      });

      const data = await res.json();
      if (res.ok) {
        addToast('Category Added successfully', 'success');
        setNewCategoryName('');
        loadAdminData();
      } else {
        addToast(data.error || 'Failed to add category', 'error');
      }
    } catch {
      addToast('An error occurred', 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Category Deleted', 'success');
        loadAdminData();
      } else {
        addToast(data.error || 'Failed to delete category', 'error');
      }
    } catch {
      addToast('Error occurred', 'error');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: {
            websiteName: settingsWebsiteName,
            logoUrl: settingsLogoUrl,
            faviconUrl: settingsFaviconUrl,
            footerText: settingsFooterText,
            youtubeUrl: settingsYoutubeUrl,
            facebookUrl: settingsFacebookUrl,
            instagramUrl: settingsInstagramUrl,
            twitterUrl: settingsTwitterUrl,
            seoTitle: settingsSeoTitle,
            seoDescription: settingsSeoDescription,
            analyticsCode: settingsAnalytics
          }
        })
      });

      if (res.ok) {
        addToast('Website Settings Saved Successfully', 'success');
        onSettingsUpdate();
        loadAdminData();
      } else {
        addToast('Failed to save settings', 'error');
      }
    } catch {
      addToast('Error updating settings', 'error');
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Current password is required to save changes', 'error');
      return;
    }

    setCredLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminCredentials: {
            currentPassword,
            newUsername: newUsername || undefined,
            newPassword: newPassword || undefined
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToast('Credentials updated successfully. Please log in again.', 'success');
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        handleLogout();
      } else {
        addToast(data.error || 'Failed to update credentials', 'error');
      }
    } catch {
      addToast('Error saving credentials', 'error');
    } finally {
      setCredLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      addToast('File size must be under 8MB', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: reader.result as string
          })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setFormThumbnailUrl(data.url);
          addToast('Image uploaded successfully', 'success');
        } else {
          addToast(data.error || 'Upload failed', 'error');
        }
      } catch {
        addToast('Upload failed due to connection error', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetPromptForm = () => {
    setEditingPromptId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('');
    setFormPromptText('');
    setFormThumbnailUrl('');
    setFormKeywords('');
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setFormStatus('published');
  };

  const handleSelectAllPrompts = () => {
    const displayed = paginatedPrompts.map(p => p.id);
    const allSelected = displayed.every(id => selectedPromptIds.includes(id));

    if (allSelected) {
      setSelectedPromptIds(prev => prev.filter(id => !displayed.includes(id)));
    } else {
      setSelectedPromptIds(prev => [...new Set([...prev, ...displayed])]);
    }
  };

  const handleSelectPrompt = (id: string) => {
    if (selectedPromptIds.includes(id)) {
      setSelectedPromptIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedPromptIds(prev => [...prev, id]);
    }
  };

  // Filter and paginated lists
  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.promptText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);

  if (authenticated === null) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-center items-center px-4 overflow-y-auto">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md p-8 bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl relative">
          <div className="absolute top-4 left-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800/80 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center space-y-3 mb-8">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Admin Console Portal</h2>
            <p className="text-xs text-zinc-400">Authorized Access Only. Log in to manage AI prompts, categories, and settings.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-zinc-950 border border-white/5 focus:border-blue-500 pl-10 pr-4 py-3 rounded-xl text-zinc-100 text-sm placeholder-zinc-700 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-white/5 focus:border-blue-500 pl-10 pr-4 py-3 rounded-xl text-zinc-100 text-sm placeholder-zinc-700 outline-none transition-colors"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log in secure</span>
                </>
              )}
            </button>
          </form>

          {/* Secure Credential Help Badge */}
          <div className="mt-6 text-center text-[10px] text-zinc-500 bg-zinc-950/60 p-2.5 border border-white/5 rounded-lg">
            Default credentials: <strong className="text-blue-400">admin</strong> / <strong className="text-blue-400">admin123</strong>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN CONSOLE SCREEN
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto flex flex-col">
      {/* Admin header */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 border-b border-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all mr-2"
            title="Return to Site"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-zinc-100 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white tracking-widest">
                Admin Console
              </span>
              {settingsWebsiteName || 'Creator Marketplace'}
            </h1>
            <p className="text-[10px] text-zinc-400">Secure prompt publishing and asset workspace</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900/80 hover:bg-rose-950/20 border border-white/5 hover:border-rose-900/30 text-zinc-400 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Left Side: Desktop Sidebar Navigation */}
        <aside className="md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col overflow-x-auto gap-1 p-1 bg-zinc-900/40 border border-white/5 rounded-2xl md:p-2 sticky top-24">
            <button
              onClick={() => { setActiveTab('overview'); resetPromptForm(); }}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => { setActiveTab('add'); }}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'add' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{editingPromptId ? 'Edit Prompt' : 'Add Prompt'}</span>
            </button>
            <button
              onClick={() => { setActiveTab('manage'); resetPromptForm(); }}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'manage' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Manage Prompts ({prompts.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('categories'); resetPromptForm(); }}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <FolderGit className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('settings'); resetPromptForm(); }}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Branding & Security</span>
            </button>
          </nav>
        </aside>

        {/* Right Side: Tab Workspaces */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Prompts</span>
                    <p className="text-3xl font-black text-zinc-100 mt-1">{stats.totalPrompts}</p>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      {stats.publishedPrompts} Published · {stats.draftPrompts} Drafts
                    </span>
                  </div>

                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Visual Views</span>
                    <p className="text-3xl font-black text-blue-400 mt-1">{stats.totalViews}</p>
                    <span className="text-[10px] text-zinc-400 mt-1 block">Passively tracked views</span>
                  </div>

                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Copies Saved</span>
                    <p className="text-3xl font-black text-emerald-400 mt-1">{stats.totalCopies}</p>
                    <span className="text-[10px] text-zinc-400 mt-1 block">Total instant copies</span>
                  </div>

                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Featured & Trending</span>
                    <p className="text-3xl font-black text-amber-400 mt-1">{stats.featuredPrompts + stats.trendingPrompts}</p>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      {stats.featuredPrompts} Featured · {stats.trendingPrompts} Trending
                    </span>
                  </div>
                </div>

                {/* Categories Breakdown & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Category counts list */}
                  <div className="lg:col-span-6 bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-zinc-300">Prompts Per Category</h3>
                    <div className="divide-y divide-zinc-900/60 max-h-64 overflow-y-auto pr-2">
                      {Object.entries(stats.categoryCounts).map(([catName, count]) => (
                        <div key={catName} className="flex justify-between items-center py-2.5">
                          <span className="text-xs text-zinc-300 font-medium">{catName}</span>
                          <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creator Channel Stats / Quick Tips */}
                  <div className="lg:col-span-6 bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-400" /> Setup & Workflow Instructions
                      </h3>
                      <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                        To add a new daily video prompt, navigate to the <strong className="text-blue-400">Add Prompt</strong> page. Drag and drop the thumbnail image file or paste an external URL. Enter the full prompt text and click <strong className="text-blue-400">Publish</strong>.
                      </p>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        All published prompts instantly appear on the public website layout with complete search and one-click copy compatibility for visitors.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-900/80 flex gap-2">
                      <button 
                        onClick={() => setActiveTab('add')}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white text-center transition-colors"
                      >
                        Add New Prompt
                      </button>
                      <button 
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl text-xs font-semibold text-zinc-300 text-center transition-colors"
                      >
                        Preview Live Site
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Uploads Table */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-300">Recently Uploaded Prompts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 font-bold">
                          <th className="py-2.5">Thumbnail</th>
                          <th className="py-2.5">Video Title</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/40">
                        {prompts.slice(0, 4).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/20">
                            <td className="py-2.5">
                              <img src={p.thumbnailUrl} alt="" className="w-10 h-7 rounded object-cover" />
                            </td>
                            <td className="py-2.5 font-bold text-slate-200 pr-4">{p.title}</td>
                            <td className="py-2.5 text-slate-400">{p.category}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button 
                                onClick={() => handleEditPrompt(p)}
                                className="text-slate-400 hover:text-violet-400 p-1 font-semibold transition-colors"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ADD / EDIT PROMPT FORM TAB */}
            {activeTab === 'add' && (
              <motion.div
                key="add-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">
                      {editingPromptId ? 'Edit AI Prompt Payload' : 'Publish New AI Prompt'}
                    </h3>
                    <p className="text-xs text-slate-400">Fill in details for the daily video prompt</p>
                  </div>
                  {editingPromptId && (
                    <button 
                      onClick={resetPromptForm}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitPrompt} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left half: Inputs */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 block">Video Title *</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Master Midjourney Prompt: Photorealistic Realism"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-2.5 rounded-xl text-slate-100 text-sm outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 block">Short Video / Prompt Description</label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Short description summarizing what this prompt generates and how creators can customize it."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-2.5 rounded-xl text-slate-100 text-sm outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 block">Category *</label>
                        <select
                          required
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-2.5 rounded-xl text-slate-300 text-sm outline-none transition-colors"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 block">Status *</label>
                        <select
                          required
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-2.5 rounded-xl text-slate-300 text-sm outline-none transition-colors"
                        >
                          <option value="published">Publish Instantly</option>
                          <option value="draft">Save As Draft</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 block">SEO Keywords (Comma Separated)</label>
                      <input
                        type="text"
                        value={formKeywords}
                        onChange={(e) => setFormKeywords(e.target.value)}
                        placeholder="e.g. midjourney, 3d, cinematic, design"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-2.5 rounded-xl text-slate-100 text-sm outline-none transition-colors"
                      />
                    </div>

                    {/* Featured / Trending toggles */}
                    <div className="flex gap-6 pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={formIsFeatured}
                          onChange={(e) => setFormIsFeatured(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-950 text-violet-500 focus:ring-violet-500 w-4.5 h-4.5"
                        />
                        <span>Feature on Homepage</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={formIsTrending}
                          onChange={(e) => setFormIsTrending(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-950 text-rose-500 focus:ring-rose-500 w-4.5 h-4.5"
                        />
                        <span>Mark as Trending</span>
                      </label>
                    </div>
                  </div>

                  {/* Right half: Thumbnail & Prompt payload */}
                  <div className="space-y-4">
                    {/* Thumbnail File upload */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 block">Thumbnail Image Selection</label>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {/* Drag and Drop Zone */}
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-800 hover:border-violet-500/50 bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[110px]"
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                            accept="image/*" 
                            className="hidden" 
                          />
                          {isUploading ? (
                            <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-slate-400 mb-1" />
                              <span className="text-xs text-slate-300 font-semibold">Upload Image File</span>
                              <span className="text-[10px] text-slate-500 mt-1">PNG, JPG or WEBP (Max 8MB)</span>
                            </>
                          )}
                        </div>

                        {/* Text input as fallback */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest block text-center">or paste external URL</span>
                          <input
                            type="text"
                            value={formThumbnailUrl}
                            onChange={(e) => setFormThumbnailUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-2.5 rounded-xl text-slate-100 text-xs outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Upload thumbnail preview */}
                      {formThumbnailUrl && (
                        <div className="relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden border border-slate-850 mt-2 mx-auto">
                          <img src={formThumbnailUrl} referrerPolicy="no-referrer" alt="thumbnail preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setFormThumbnailUrl('')}
                            className="absolute top-1 right-1 p-1 bg-slate-950/80 rounded text-slate-400 hover:text-slate-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 block">AI Prompt Payload *</label>
                      <textarea
                        required
                        value={formPromptText}
                        onChange={(e) => setFormPromptText(e.target.value)}
                        placeholder="Paste the full, raw AI prompt payload exactly as you designed it."
                        rows={7}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-3 rounded-xl text-slate-200 font-mono text-xs outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submission row */}
                  <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-900 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetPromptForm}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Reset Fields
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg transition-all"
                    >
                      {editingPromptId ? 'Save Changes' : 'Publish Prompt'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* MANAGE PROMPTS WORKSPACE TAB */}
            {activeTab === 'manage' && (
              <motion.div
                key="manage-prompts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Catalog of AI Prompts</h3>
                    <p className="text-xs text-slate-400">Search, edit, duplicate, or delete database items</p>
                  </div>

                  {/* Search and actions bar */}
                  <div className="flex items-center gap-2 max-w-sm w-full">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search items..."
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 pl-10 pr-4 py-2 rounded-xl text-slate-200 text-xs outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Bulk delete panel */}
                {selectedPromptIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between"
                  >
                    <span className="text-xs text-rose-400 font-semibold">
                      {selectedPromptIds.length} items selected for bulk deletion
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
                    </button>
                  </motion.div>
                )}

                {/* Prompt List table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 font-bold">
                        <th className="py-3 pl-2 w-10">
                          <button 
                            onClick={handleSelectAllPrompts}
                            className="p-1 hover:bg-slate-850 rounded text-slate-400"
                          >
                            {paginatedPrompts.every(p => selectedPromptIds.includes(p.id)) ? (
                              <CheckSquare className="w-4 h-4 text-violet-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="py-3">Thumbnail</th>
                        <th className="py-3 pr-4">Video Title</th>
                        <th className="py-3">Category</th>
                        <th className="py-3">Badges</th>
                        <th className="py-3">Stats</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      {paginatedPrompts.map((p) => {
                        const isSelected = selectedPromptIds.includes(p.id);
                        return (
                          <tr key={p.id} className={`hover:bg-slate-900/25 ${isSelected ? 'bg-violet-950/10' : ''}`}>
                            <td className="py-3 pl-2">
                              <button 
                                onClick={() => handleSelectPrompt(p.id)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-violet-500" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="py-3">
                              <img src={p.thumbnailUrl} alt="" className="w-12 h-8 rounded object-cover border border-slate-800" />
                            </td>
                            <td className="py-3 font-bold text-slate-100 max-w-xs pr-4">
                              <span className="line-clamp-2 leading-relaxed">{p.title}</span>
                            </td>
                            <td className="py-3 text-slate-400 font-medium">{p.category}</td>
                            <td className="py-3 space-y-1">
                              {p.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded mr-1">
                                  <Sparkles className="w-2.5 h-2.5" /> Featured
                                </span>
                              )}
                              {p.isTrending && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase bg-rose-500/10 border border-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded">
                                  <Flame className="w-2.5 h-2.5" /> Trending
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-500 space-y-0.5">
                              <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views || 0}</div>
                              <div className="flex items-center gap-1 text-emerald-500/80"><Copy className="w-3 h-3" /> {p.copies || 0}</div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleEditPrompt(p)}
                                title="Edit"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-violet-400 rounded-lg transition-colors inline-block"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicatePrompt(p.id)}
                                title="Duplicate (Save as Draft)"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition-colors inline-block"
                              >
                                <CopyPlus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePrompt(p.id)}
                                title="Delete"
                                className="p-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 rounded-lg transition-colors inline-block"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredPrompts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                            No prompts found. Try a different search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-900 text-xs">
                    <span className="text-slate-500">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPrompts.length)} of {filteredPrompts.length} prompts
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 disabled:opacity-30 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 font-semibold text-slate-300 bg-slate-900 rounded-lg">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 disabled:opacity-30 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* CATEGORIES MANAGEMENT TAB */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Add Category Form */}
                <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Create New Category</h3>
                    <p className="text-[10px] text-slate-400">Slugs are automatically system-generated</p>
                  </div>

                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Category Name</label>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Photoshop Prompt"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-4 py-2.5 rounded-xl text-slate-100 text-xs outline-none transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={categoryLoading || !newCategoryName.trim()}
                      className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      {categoryLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Create Category'}
                    </button>
                  </form>
                </div>

                {/* Categories List */}
                <div className="md:col-span-7 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200">Active Categories ({categories.length})</h3>
                  
                  <div className="divide-y divide-slate-900/60 max-h-[350px] overflow-y-auto pr-2">
                    {categories.map((c) => (
                      <div key={c.id} className="flex justify-between items-center py-3">
                        <div>
                          <p className="text-xs font-bold text-slate-100">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">slug: {c.slug}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-2 bg-slate-900/80 border border-slate-850 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* BRANDING & SECURITY SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Branding Form */}
                <div className="md:col-span-7 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-slate-200">Branding & SEO Customizations</h3>

                  <form onSubmit={handleUpdateSettings} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Website Name</label>
                        <input
                          type="text"
                          value={settingsWebsiteName}
                          onChange={(e) => setSettingsWebsiteName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Footer Text</label>
                        <input
                          type="text"
                          value={settingsFooterText}
                          onChange={(e) => setSettingsFooterText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Creator Logo URL</label>
                        <input
                          type="text"
                          value={settingsLogoUrl}
                          onChange={(e) => setSettingsLogoUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Favicon Logo URL</label>
                        <input
                          type="text"
                          value={settingsFaviconUrl}
                          onChange={(e) => setSettingsFaviconUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">YouTube Channel Link</label>
                        <input
                          type="text"
                          value={settingsYoutubeUrl}
                          onChange={(e) => setSettingsYoutubeUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Facebook Link</label>
                        <input
                          type="text"
                          value={settingsFacebookUrl}
                          onChange={(e) => setSettingsFacebookUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Instagram Link</label>
                        <input
                          type="text"
                          value={settingsInstagramUrl}
                          onChange={(e) => setSettingsInstagramUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Twitter Link</label>
                        <input
                          type="text"
                          value={settingsTwitterUrl}
                          onChange={(e) => setSettingsTwitterUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">SEO Meta Title</label>
                        <input
                          type="text"
                          value={settingsSeoTitle}
                          onChange={(e) => setSettingsSeoTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">SEO Meta Description</label>
                        <input
                          type="text"
                          value={settingsSeoDescription}
                          onChange={(e) => setSettingsSeoDescription(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Analytics Script Injection Code</label>
                      <textarea
                        value={settingsAnalytics}
                        onChange={(e) => setSettingsAnalytics(e.target.value)}
                        rows={2}
                        placeholder="<!-- Custom JS Analytics integration -->"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2 rounded-xl text-slate-200 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/10"
                    >
                      <Save className="w-4 h-4" /> Save General Customizations
                    </button>
                  </form>
                </div>

                {/* Security Credentials Form */}
                <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200">Security Credentials</h3>
                  <p className="text-[10px] text-slate-400">Modify login parameters. Passwords are saved with SHA-256 hashes.</p>

                  <form onSubmit={handleUpdateCredentials} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">New Username</label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2.5 rounded-xl text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 px-3.5 py-2.5 rounded-xl text-slate-200"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-900 space-y-1">
                      <label className="text-rose-400 font-semibold flex items-center gap-1">
                        Current Password * <span className="text-[9px] font-normal text-slate-400">(Required to verify changes)</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Type current password"
                        className="w-full bg-slate-950 border border-rose-500/20 focus:border-rose-500 px-3.5 py-2.5 rounded-xl text-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={credLoading}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      {credLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Apply Security Settings'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
