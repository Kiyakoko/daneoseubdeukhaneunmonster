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
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string; // For Reels
  likes: number;
  type: 'photo' | 'reel' | 'notice';
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  customerName: string;
  status: 'pending' | 'completed' | 'shipped';
  date: string;
}
