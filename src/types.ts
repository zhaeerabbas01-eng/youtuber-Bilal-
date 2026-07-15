export interface Prompt {
  id: string;
  title: string;
  promptText: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  seoKeywords: string[];
  isFeatured: boolean;
  isTrending: boolean;
  status: 'published' | 'draft';
  publishDate: string;
  views: number;
  copies: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface WebsiteSettings {
  websiteName: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  youtubeUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  seoTitle: string;
  seoDescription: string;
  analyticsCode: string;
}

export interface DashboardStats {
  totalPrompts: number;
  publishedPrompts: number;
  draftPrompts: number;
  totalViews: number;
  totalCopies: number;
  featuredPrompts: number;
  trendingPrompts: number;
  categoryCounts: Record<string, number>;
}
