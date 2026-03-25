import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, Product, Post, Order, CommunityCategory, Ranking, TrendItem, CartItem } from './types';
import { defaultConfig, defaultProducts, defaultPosts, defaultTrendItems, defaultReviews } from './constants';
import { db, auth } from './firebase';
import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  limit,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppState {
  config: SiteConfig;
  products: Product[];
  posts: Post[];
  orders: Order[];
  communityCategories: CommunityCategory[];
  rankings: Ranking[];
  trendItems: TrendItem[];
  reviews: any[];
  cart: CartItem[];
  wishlist: string[];
  user: any | null;
  setConfig: (config: SiteConfig) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  setProducts: (products: Product[]) => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  setPosts: (posts: Post[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, status: Order['status']) => void;
  setCommunityCategories: (categories: CommunityCategory[]) => void;
  setRankings: (rankings: Ranking[]) => void;
  setTrendItems: (items: TrendItem[]) => void;
  setReviews: (reviews: any[]) => void;
  updateTrendItem: (item: TrendItem) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number, selected: boolean) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  login: (userData: any) => void;
  logout: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<SiteConfig>(defaultConfig);
  const [products, setProductsState] = useState<Product[]>(defaultProducts);
  const [posts, setPostsState] = useState<Post[]>(defaultPosts);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [communityCategories, setCommunityCategoriesState] = useState<CommunityCategory[]>([]);
  const [rankings, setRankingsState] = useState<Ranking[]>([]);
  const [trendItems, setTrendItemsState] = useState<TrendItem[]>(defaultTrendItems);
  const [reviews, setReviewsState] = useState<any[]>(defaultReviews);
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [wishlist, setWishlistState] = useState<string[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
        };
        setUser(userData);
        localStorage.setItem('animation_user', JSON.stringify(userData));
      } else {
        // If no firebase user, check if we have a saved mock user
        const savedUser = localStorage.getItem('animation_user');
        if (!savedUser) {
          setUser(null);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial data and setup listeners
  useEffect(() => {
    if (!isAuthReady) return;

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'site', 'config'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Listeners
    const unsubConfig = onSnapshot(doc(db, 'site', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        setConfigState(snapshot.data() as SiteConfig);
      } else {
        // Migration or default
        fetch('/api/data').then(res => res.json()).then(data => {
          if (data.config) setConfig(data.config);
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'site/config'));

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('order', 'asc')), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      if (items.length > 0) {
        setProductsState(items);
      } else {
        fetch('/api/data').then(res => res.json()).then(data => {
          if (data.products) {
            data.products.forEach((p: Product, index: number) => {
              const productWithOrder = { ...p, order: p.order ?? index };
              addProduct(productWithOrder);
            });
          }
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'products'));

    const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('order', 'asc')), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post));
      if (items.length > 0) {
        setPostsState(items);
      } else {
        fetch('/api/data').then(res => res.json()).then(data => {
          if (data.posts) {
            data.posts.forEach((p: Post, index: number) => {
              const postWithOrder = { ...p, order: p.order ?? index };
              addPost(postWithOrder);
            });
          }
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'posts'));

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      setOrdersState(items);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'orders'));

    const unsubCategories = onSnapshot(collection(db, 'communityCategories'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CommunityCategory));
      if (items.length > 0) {
        setCommunityCategoriesState(items);
      } else {
        fetch('/api/data').then(res => res.json()).then(data => {
          if (data.communityCategories) data.communityCategories.forEach((c: CommunityCategory) => {
            setDoc(doc(db, 'communityCategories', c.id), c);
          });
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'communityCategories'));

    const unsubRankings = onSnapshot(collection(db, 'rankings'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ranking));
      if (items.length > 0) {
        setRankingsState(items);
      } else {
        fetch('/api/data').then(res => res.json()).then(data => {
          if (data.rankings) data.rankings.forEach((r: Ranking) => {
            setDoc(doc(db, 'rankings', r.id), r);
          });
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'rankings'));

    const unsubTrendItems = onSnapshot(collection(db, 'trendItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TrendItem));
      if (items.length > 0) {
        setTrendItemsState(items);
      } else {
        fetch('/api/data').then(res => res.json()).then(data => {
          if (data.trendItems) data.trendItems.forEach((t: TrendItem) => {
            setDoc(doc(db, 'trendItems', t.id), t);
          });
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'trendItems'));

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      if (items.length > 0) {
        setReviewsState(items);
      } else {
        fetch('/api/data').then(res => res.json()).then(data => {
          if (data.reviews) data.reviews.forEach((r: any) => {
            setDoc(doc(db, 'reviews', r.id), r);
          });
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'reviews'));

    setIsLoaded(true);

    return () => {
      unsubConfig();
      unsubProducts();
      unsubPosts();
      unsubOrders();
      unsubCategories();
      unsubRankings();
      unsubTrendItems();
      unsubReviews();
    };
  }, [isAuthReady]);

  // Local storage for user session and cart
  useEffect(() => {
    const savedCart = localStorage.getItem('animation_cart');
    if (savedCart) setCartState(JSON.parse(savedCart));

    const savedWishlist = localStorage.getItem('animation_wishlist');
    if (savedWishlist) setWishlistState(JSON.parse(savedWishlist));

    const savedUser = localStorage.getItem('animation_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('animation_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Sync wishlist to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('animation_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  // Sync functions
  const setConfig = async (c: SiteConfig) => {
    try {
      await setDoc(doc(db, 'site', 'config'), c);
      // Also sync to server
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site/config');
    }
  };

  const addProduct = async (p: Product) => {
    try {
      const { id, ...data } = p;
      // If order is missing, put it at the top (min order - 1)
      if (data.order === undefined) {
        const minOrder = products.length > 0 ? Math.min(...products.map(prod => prod.order ?? 0)) : 0;
        data.order = minOrder - 1;
      }
      await setDoc(doc(db, 'products', id), data);
      
      // Sync all products to server to keep site-data.json updated
      const updatedProducts = [...products.filter(item => item.id !== id), { ...data, id }];
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProducts)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${p.id}`);
    }
  };

  const updateProduct = async (p: Product) => {
    try {
      const { id, ...data } = p;
      await setDoc(doc(db, 'products', id), data);
      
      const updatedProducts = products.map(item => item.id === id ? { ...data, id } : item);
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProducts)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${p.id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      
      const updatedProducts = products.filter(item => item.id !== id);
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProducts)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const setProducts = async (newProducts: Product[]) => {
    for (let i = 0; i < newProducts.length; i++) {
      const p = newProducts[i];
      const { id, ...data } = p;
      await setDoc(doc(db, 'products', id), { ...data, order: i });
    }
    // Sync to server
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProducts.map((p, i) => ({ ...p, order: i })))
    });
  };
  
  const addPost = async (p: Post) => {
    try {
      const { id, ...data } = p;
      // If order is missing, put it at the top (min order - 1)
      if (data.order === undefined) {
        const minOrder = posts.length > 0 ? Math.min(...posts.map(post => post.order ?? 0)) : 0;
        data.order = minOrder - 1;
      }
      await setDoc(doc(db, 'posts', id), data);
      
      const updatedPosts = [...posts.filter(item => item.id !== id), { ...data, id }];
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPosts)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${p.id}`);
    }
  };

  const updatePost = async (p: Post) => {
    try {
      const { id, ...data } = p;
      await setDoc(doc(db, 'posts', id), data);
      
      const updatedPosts = posts.map(item => item.id === id ? { ...data, id } : item);
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPosts)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${p.id}`);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'posts', id));
      
      const updatedPosts = posts.filter(item => item.id !== id);
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPosts)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${id}`);
    }
  };

  const setPosts = async (newPosts: Post[]) => {
    for (let i = 0; i < newPosts.length; i++) {
      const p = newPosts[i];
      const { id, ...data } = p;
      await setDoc(doc(db, 'posts', id), { ...data, order: i });
    }
    // Sync to server
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosts.map((p, i) => ({ ...p, order: i })))
    });
  };

  const addOrder = async (o: Order) => {
    try {
      const { id, ...data } = o;
      await setDoc(doc(db, 'orders', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${o.id}`);
    }
  };

  const updateOrder = async (o: Order) => {
    try {
      const { id, ...data } = o;
      await setDoc(doc(db, 'orders', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${o.id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  const setOrders = async (newOrders: Order[]) => {
    for (const o of newOrders) {
      await addOrder(o);
    }
  };

  const setCommunityCategories = async (categories: CommunityCategory[]) => {
    for (const c of categories) {
      await setDoc(doc(db, 'communityCategories', c.id), c);
    }
    // Sync to server
    await fetch('/api/communityCategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories)
    });
  };

  const setRankings = async (rankings: Ranking[]) => {
    for (const r of rankings) {
      await setDoc(doc(db, 'rankings', r.id), r);
    }
    // Sync to server
    await fetch('/api/rankings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rankings)
    });
  };

  const setTrendItems = async (items: TrendItem[]) => {
    for (const t of items) {
      await setDoc(doc(db, 'trendItems', t.id), t);
    }
    // Sync to server
    await fetch('/api/trendItems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    });
  };

  const setReviews = async (reviews: any[]) => {
    for (const r of reviews) {
      await setDoc(doc(db, 'reviews', r.id), r);
    }
    // Sync to server
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviews)
    });
  };

  const updateTrendItem = async (item: TrendItem) => {
    try {
      const { id, ...data } = item;
      await setDoc(doc(db, 'trendItems', id), data);
      
      const updatedItems = trendItems.map(i => i.id === id ? item : i);
      await fetch('/api/trendItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `trendItems/${item.id}`);
    }
  };

  const addToCart = (productId: string) => {
    setCartState(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), productId, quantity: 1, selected: true }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartState(prev => prev.filter(item => item.id !== id));
  };

  const updateCartItem = (id: string, quantity: number, selected: boolean) => {
    setCartState(prev => prev.map(item => item.id === id ? { ...item, quantity, selected } : item));
  };

  const clearCart = () => {
    setCartState([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistState(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
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
      config, products, posts, orders, communityCategories, rankings, trendItems, reviews, cart, wishlist, user,
      setConfig, addProduct, updateProduct, deleteProduct, setProducts,
      addPost, updatePost, deletePost, setPosts, addOrder, updateOrder,
      setCommunityCategories, setRankings, setTrendItems, setReviews, updateTrendItem,
      addToCart, removeFromCart, updateCartItem, clearCart, toggleWishlist,
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
