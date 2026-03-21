import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, Product, Post, Order } from './types';

interface AppState {
  config: SiteConfig;
  products: Product[];
  posts: Post[];
  orders: Order[];
  user: any | null;
  setConfig: (config: SiteConfig) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, status: Order['status']) => void;
  login: (userData: any) => void;
  logout: () => void;
}

const defaultConfig: SiteConfig = {
  name: 'Animation',
  banners: [
    {
      id: '1',
      title: '현대적인 디자인의 새로운 기준',
      subtitle: '쇼핑몰과 커뮤니티가 결합된 하이브리드 플랫폼, Animation에서 당신의 감각을 깨우세요.',
      imageUrl: 'https://picsum.photos/seed/banner1/1920/1080',
    },
    {
      id: '2',
      title: '프리미엄 로고 제작 패키지',
      subtitle: '브랜드의 가치를 높여주는 고품격 로고 디자인 서비스를 만나보세요.',
      imageUrl: 'https://picsum.photos/seed/banner2/1920/1080',
    },
    {
      id: '3',
      title: '크리에이티브 커뮤니티',
      subtitle: '다양한 창작자들과 소통하며 새로운 영감을 얻으세요.',
      imageUrl: 'https://picsum.photos/seed/banner3/1920/1080',
    }
  ],
  primaryColor: '#FFFFFF',
  accentColor: '#BFFF00',
  backgroundColor: '#FFFFFF',
  fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  logoUrl: 'https://picsum.photos/seed/animation-logo/200/50',
};

const defaultProducts: Product[] = [
  {
    id: '1',
    name: '프리미엄 로고 디자인 패키지',
    price: 250000,
    description: '브랜드의 가치를 높여주는 고품격 로고 디자인 서비스입니다.',
    imageUrl: 'https://picsum.photos/seed/design1/800/600',
    category: '디자인',
  },
  {
    id: '2',
    name: '스타트업 브랜딩 가이드북',
    price: 45000,
    description: '성공적인 브랜딩을 위한 핵심 전략이 담긴 가이드북입니다.',
    imageUrl: 'https://picsum.photos/seed/design2/800/600',
    category: '도서',
  },
  {
    id: '3',
    name: '커스텀 일러스트레이션 세트',
    price: 120000,
    description: '웹사이트와 앱에 활력을 불어넣는 독창적인 일러스트레이션입니다.',
    imageUrl: 'https://picsum.photos/seed/design3/800/600',
    category: '디자인',
  },
];

const defaultPosts: Post[] = [
  {
    id: '1',
    author: 'DesignMaster',
    content: '2026년 디자인 트렌드는 미니멀리즘과 강렬한 포인트 컬러의 조화입니다.',
    imageUrl: 'https://picsum.photos/seed/post1/800/600',
    likes: 124,
    type: 'photo',
    createdAt: '2026-03-20',
  },
  {
    id: '2',
    author: 'CreativeMind',
    content: '새로운 프로젝트 시작! 라임 컬러가 정말 마음에 드네요.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40142-large.mp4',
    likes: 89,
    type: 'reel',
    createdAt: '2026-03-21',
  },
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<SiteConfig>(defaultConfig);
  const [products, setProductsState] = useState<Product[]>(defaultProducts);
  const [posts, setPostsState] = useState<Post[]>(defaultPosts);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch initial data from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        if (data.config) setConfigState(data.config);
        if (data.products) setProductsState(data.products);
        if (data.posts) setPostsState(data.posts);
        if (data.orders) setOrdersState(data.orders);
        
        // Local storage for user session only
        const savedUser = localStorage.getItem('animation_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to fetch data from server:', error);
        setIsLoaded(true);
      }
    };
    fetchData();
  }, []);

  // Sync functions
  const setConfig = async (c: SiteConfig) => {
    setConfigState(c);
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
  };

  const addProduct = async (p: Product) => {
    const newProducts = [...products, p];
    setProductsState(newProducts);
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProducts),
    });
  };

  const updateProduct = async (p: Product) => {
    const newProducts = products.map(item => item.id === p.id ? p : item);
    setProductsState(newProducts);
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProducts),
    });
  };

  const deleteProduct = async (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProductsState(newProducts);
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProducts),
    });
  };
  
  const addPost = async (p: Post) => {
    const newPosts = [p, ...posts];
    setPostsState(newPosts);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosts),
    });
  };

  const updatePost = async (p: Post) => {
    const newPosts = posts.map(item => item.id === p.id ? p : item);
    setPostsState(newPosts);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosts),
    });
  };

  const deletePost = async (id: string) => {
    const newPosts = posts.filter(p => p.id !== id);
    setPostsState(newPosts);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosts),
    });
  };

  const addOrder = async (o: Order) => {
    const newOrders = [o, ...orders];
    setOrdersState(newOrders);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders),
    });
  };

  const updateOrder = async (id: string, status: Order['status']) => {
    const newOrders = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrdersState(newOrders);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders),
    });
  };

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('animation_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('animation_user');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      config, products, posts, orders, user,
      setConfig, addProduct, updateProduct, deleteProduct, 
      addPost, updatePost, deletePost, addOrder, updateOrder,
      login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
