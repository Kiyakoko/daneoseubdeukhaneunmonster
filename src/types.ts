export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link?: string;
}

export interface SiteConfig {
  name: string;
  banners: Banner[];
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  logoUrl: string;
  productCategories?: string[];
  communityTabs?: { id: string; name: string }[];
  footerDescription?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  discountRate?: number;
  detailInfo?: string;
  reviewContent?: string;
  shippingInfo?: string;
  premiumFeatures?: string[];
  detailImages?: string[];
  rating?: number;
  reviewCount?: number;
  premiumLabel?: string;
  order?: number;
}

export interface Post {
  id: string;
  author: string;
  title?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string; // For Reels
  likes: number;
  type: 'photo' | 'reel' | 'notice' | 'community';
  category?: string; // For Community tabs like '코스프레', '카테고리'
  createdAt: string;
  isPinned?: boolean;
  order?: number;
}

export interface CommunityCategory {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: number;
  imageUrl: string;
}

export interface Ranking {
  id: string;
  name: string;
  posts: number;
  likes: number;
  avatar?: string;
}

export interface TrendItem {
  id: string;
  videoUrl: string;
  title: string;
  thumbnail: string;
  author?: string;
  content?: string;
  likes?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selected: boolean;
}

export interface Order {
  id: string;
  items: { productId: string; quantity: number; price: number }[];
  totalPrice: number;
  customerName: string;
  status: 'pending' | 'completed' | 'shipped';
  date: string;
}
