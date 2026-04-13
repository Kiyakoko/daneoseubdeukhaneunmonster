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
  communityTabs?: string[];
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
  authorId?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  author: string;
  authorId?: string;
  authorAvatar?: string;
  authorBio?: string;
  title?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string; // For Reels
  likes: number;
  likedBy?: string[];
  comments?: Comment[];
  type: 'photo' | 'reel' | 'notice' | 'community';
  category?: string; // For Community tabs like '코스프레', '카테고리'
  createdAt: string;
  date?: string;
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
  order?: number;
}

export interface Ranking {
  id: string;
  name: string;
  posts: number;
  likes: number;
  avatar?: string;
  bio?: string;
  order?: number;
  score?: number;
}

export interface TrendItem {
  id: string;
  videoUrl: string;
  title: string;
  thumbnail: string;
  content?: string;
  author?: string;
  authorId?: string;
  authorAvatar?: string;
  authorBio?: string;
  likes?: number;
  likedBy?: string[];
  order?: number;
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
  userEmail?: string;
  customerId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  roleLabel?: string; // e.g., "Premium Member"
  bio?: string; // Shop introduction
  wishlist?: string[];
  cart?: CartItem[];
  loginMethod?: 'email' | 'google';
  lastLogin?: string;
  createdAt?: string;
}

export interface SaleApplication {
  id: string;
  productName: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  authorId: string;
  authorEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}
