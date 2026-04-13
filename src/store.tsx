import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, Product, Post, Order, CommunityCategory, Ranking, TrendItem, CartItem, User, Comment, SaleApplication } from './types';
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
  writeBatch,
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocFromServer,
  increment,
  arrayUnion,
  arrayRemove
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
  users: User[];
  saleApplications: SaleApplication[];
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  isLoaded: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
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
  updateOrder: (o: Order) => void;
  setCommunityCategories: (categories: CommunityCategory[]) => void;
  setRankings: (rankings: Ranking[]) => void;
  syncRankings: () => Promise<void>;
  setTrendItems: (items: TrendItem[]) => void;
  addTrendItem: (item: TrendItem) => void;
  deleteTrendItem: (id: string) => void;
  setReviews: (reviews: any[]) => void;
  updateTrendItem: (item: TrendItem) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number, selected: boolean) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  updateUserProfile: (data: Partial<User>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updateSaleApplicationStatus: (id: string, status: 'approved' | 'rejected') => void;
  deleteSaleApplication: (id: string) => void;
  addComment: (postId: string, comment: Comment) => void;
  updateComment: (postId: string, comment: Comment) => void;
  deleteComment: (postId: string, commentId: string) => void;
  addReply: (postId: string, commentId: string, reply: Comment) => void;
  togglePostLike: (postId: string) => void;
  toggleTrendItemLike: (itemId: string) => void;
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
  const [users, setUsersState] = useState<User[]>([]);
  const [saleApplications, setSaleApplicationsState] = useState<SaleApplication[]>([]);
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [wishlist, setWishlistState] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Auth listener and User profile listener
  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const loginMethod = firebaseUser.providerData.some(p => p.providerId === 'google.com') ? 'google' : 'email';
        const lastLogin = new Date().toISOString();

        // Listen to user document in Firestore for real-time profile updates
        unsubUserDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data() as User;
            setUser({ ...userData, id: firebaseUser.uid });
            if (userData.wishlist) {
              setWishlistState(userData.wishlist);
            }
            
            // Update lastLogin if it's been more than 5 minutes since the last recorded login
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            if (!userData.lastLogin || userData.lastLogin < fiveMinutesAgo || userData.loginMethod !== loginMethod) {
              updateDoc(doc(db, 'users', firebaseUser.uid), { lastLogin, loginMethod });
            }
          } else {
            // Create user document if it doesn't exist
            const isAdmin = firebaseUser.email === 'moonnight0613@gmail.com' || firebaseUser.email === 'lunelaluz79@gmail.com';
            const initialUserData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
              isAdmin: isAdmin,
              roleLabel: 'Premium Member',
              wishlist: [],
              loginMethod,
              lastLogin,
              createdAt: lastLogin
            };
            setDoc(doc(db, 'users', firebaseUser.uid), initialUserData);
            setUser(initialUserData);
          }
        });
      } else {
        if (unsubUserDoc) unsubUserDoc();
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => {
      unsubscribe();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  // Fetch initial data and setup listeners
  useEffect(() => {
    if (!isAuthReady) return;

    // Admin-only listeners
    let unsubUsers: (() => void) | null = null;
    let unsubSaleApplications: (() => void) | null = null;
    if (user?.isAdmin) {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
        setUsersState(items);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));

      unsubSaleApplications = onSnapshot(query(collection(db, 'saleApplications'), orderBy('createdAt', 'desc')), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SaleApplication));
        setSaleApplicationsState(items);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'saleApplications'));
    }

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
    let snapshotsReceived = {
      config: false,
      products: false,
      posts: false,
      categories: false,
      rankings: false,
      trendItems: false,
      reviews: false
    };

    // Consolidate server data fetch to avoid redundant requests
    let serverDataCache: any = null;
    const getServerData = async () => {
      if (serverDataCache) return serverDataCache;
      try {
        const res = await fetch('/api/data');
        serverDataCache = await res.json();
        return serverDataCache;
      } catch (err) {
        console.error("Failed to fetch initial data from server:", err);
        return {};
      }
    };

    const checkAllLoaded = () => {
      if (Object.values(snapshotsReceived).every(v => v)) {
        setIsLoaded(true);
      }
    };

    const unsubConfig = onSnapshot(doc(db, 'site', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        setConfigState(snapshot.data() as SiteConfig);
        snapshotsReceived.config = true;
        checkAllLoaded();
      } else {
        // Migration or default
        getServerData().then(data => {
          if (data.config) {
            setConfig(data.config);
          }
          snapshotsReceived.config = true;
          checkAllLoaded();
        }).catch(() => {
          snapshotsReceived.config = true;
          checkAllLoaded();
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'site/config');
      snapshotsReceived.config = true;
      checkAllLoaded();
    });

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('order', 'asc')), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        setProductsState(items);
        snapshotsReceived.products = true;
        checkAllLoaded();
      } else {
        // If Firestore is empty, try to fetch from server
        getServerData().then(data => {
          if (data.products && data.products.length > 0) {
            // Populate Firestore from server data if Firestore is empty
            setProducts(data.products);
          } else {
            setProductsState([]);
          }
          snapshotsReceived.products = true;
          checkAllLoaded();
        }).catch(() => {
          setProductsState([]);
          snapshotsReceived.products = true;
          checkAllLoaded();
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'products');
      snapshotsReceived.products = true;
      checkAllLoaded();
    });

    const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('order', 'asc')), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => {
          const data = doc.data() as Post;
          // Fix for posts with null likes
          if (data.likes === null || data.likes === undefined) {
            data.likes = data.likedBy?.length || 0;
          }
          return { ...data, id: doc.id };
        });
        setPostsState(items);
        snapshotsReceived.posts = true;
        checkAllLoaded();
      } else {
        // If Firestore is empty, try to fetch from server
        getServerData().then(data => {
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts);
          } else {
            setPostsState([]);
          }
          snapshotsReceived.posts = true;
          checkAllLoaded();
        }).catch(() => {
          setPostsState([]);
          snapshotsReceived.posts = true;
          checkAllLoaded();
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'posts');
      snapshotsReceived.posts = true;
      checkAllLoaded();
    });

    let unsubOrders: (() => void) | null = null;
    if (user) {
      const ordersQuery = user.isAdmin ? collection(db, 'orders') : query(collection(db, 'orders'), where('customerId', '==', user.id));
      unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        setOrdersState(items);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'orders'));
    }

    const unsubCategories = onSnapshot(query(collection(db, 'communityCategories'), orderBy('order', 'asc')), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CommunityCategory));
        setCommunityCategoriesState(items);
        snapshotsReceived.categories = true;
        checkAllLoaded();
      } else {
        getServerData().then(data => {
          if (data.communityCategories && data.communityCategories.length > 0) {
            setCommunityCategories(data.communityCategories);
          } else {
            setCommunityCategoriesState([]);
          }
          snapshotsReceived.categories = true;
          checkAllLoaded();
        }).catch(() => {
          setCommunityCategoriesState([]);
          snapshotsReceived.categories = true;
          checkAllLoaded();
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'communityCategories');
      snapshotsReceived.categories = true;
      checkAllLoaded();
    });

    const unsubRankings = onSnapshot(query(collection(db, 'rankings'), orderBy('order', 'asc')), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ranking));
        setRankingsState(items);
        snapshotsReceived.rankings = true;
        checkAllLoaded();
      } else {
        getServerData().then(data => {
          if (data.rankings && data.rankings.length > 0) {
            setRankings(data.rankings);
          } else {
            setRankingsState([]);
          }
          snapshotsReceived.rankings = true;
          checkAllLoaded();
        }).catch(() => {
          setRankingsState([]);
          snapshotsReceived.rankings = true;
          checkAllLoaded();
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'rankings');
      snapshotsReceived.rankings = true;
      checkAllLoaded();
    });

    const unsubTrendItems = onSnapshot(query(collection(db, 'trendItems'), orderBy('order', 'asc')), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TrendItem));
        setTrendItemsState(items);
        snapshotsReceived.trendItems = true;
        checkAllLoaded();
      } else {
        getServerData().then(data => {
          if (data.trendItems && data.trendItems.length > 0) {
            setTrendItems(data.trendItems);
          } else {
            setTrendItemsState([]);
          }
          snapshotsReceived.trendItems = true;
          checkAllLoaded();
        }).catch(() => {
          setTrendItemsState([]);
          snapshotsReceived.trendItems = true;
          checkAllLoaded();
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'trendItems');
      snapshotsReceived.trendItems = true;
      checkAllLoaded();
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
        setReviewsState(items);
        snapshotsReceived.reviews = true;
        checkAllLoaded();
      } else {
        getServerData().then(data => {
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          } else {
            setReviewsState([]);
          }
          snapshotsReceived.reviews = true;
          checkAllLoaded();
        }).catch(() => {
          setReviewsState([]);
          snapshotsReceived.reviews = true;
          checkAllLoaded();
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'reviews');
      snapshotsReceived.reviews = true;
      checkAllLoaded();
    });

    // Timeout to force load if snapshots take too long
    const forceLoadTimeout = setTimeout(() => {
      if (!isLoaded) {
        const pending = Object.entries(snapshotsReceived)
          .filter(([_, v]) => !v)
          .map(([k, _]) => k);
        console.warn(`Snapshots taking too long, forcing load. Pending: ${pending.join(', ')}`);
        setIsLoaded(true);
      }
    }, 10000);

    return () => {
      clearTimeout(forceLoadTimeout);
      unsubConfig();
      unsubProducts();
      unsubPosts();
      if (unsubOrders) unsubOrders();
      unsubCategories();
      unsubRankings();
      unsubTrendItems();
      unsubReviews();
      if (unsubUsers) unsubUsers();
      if (unsubSaleApplications) unsubSaleApplications();
    };
  }, [isAuthReady, user?.isAdmin]);

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
    try {
      const batch = writeBatch(db);
      
      // Delete existing products to ensure order is correct and no orphans
      const existingSnapshot = await getDocs(collection(db, 'products'));
      existingSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add new products
      newProducts.forEach((p, index) => {
        const { id, ...data } = p;
        const docRef = doc(collection(db, 'products'), id || Date.now().toString() + index);
        batch.set(docRef, { ...data, order: index });
      });
      
      await batch.commit();
      
      // Sync to server
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProducts.map((p, i) => ({ ...p, order: i })))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
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
    try {
      const batch = writeBatch(db);
      
      // Delete existing posts
      const existingSnapshot = await getDocs(collection(db, 'posts'));
      existingSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add new posts
      newPosts.forEach((p, index) => {
        const { id, ...data } = p;
        const docRef = doc(collection(db, 'posts'), id || Date.now().toString() + index);
        batch.set(docRef, { ...data, order: index });
      });
      
      await batch.commit();
      
      // Sync to server
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosts.map((p, i) => ({ ...p, order: i })))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'posts');
    }
  };

  const addOrder = async (o: Order) => {
    try {
      const { id, ...data } = o;
      await setDoc(doc(db, 'orders', id), data);
      
      const updatedOrders = [...orders.filter(item => item.id !== id), { ...data, id }];
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrders)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${o.id}`);
    }
  };

  const updateOrder = async (o: Order) => {
    try {
      const { id, ...data } = o;
      await setDoc(doc(db, 'orders', id), data);
      
      const updatedOrders = orders.map(item => item.id === id ? { ...data, id } : item);
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrders)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${o.id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
      
      const updatedOrders = orders.filter(item => item.id !== id);
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrders)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  const setOrders = async (newOrders: Order[]) => {
    for (const o of newOrders) {
      const { id, ...data } = o;
      await setDoc(doc(db, 'orders', id), data);
    }
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders)
    });
  };

  const setCommunityCategories = async (categories: CommunityCategory[]) => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'communityCategories'));
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      categories.forEach((c, index) => {
        const docRef = doc(collection(db, 'communityCategories'), c.id);
        batch.set(docRef, { ...c, order: index });
      });
      
      await batch.commit();
      
      // Sync to server
      await fetch('/api/community-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories.map((c, i) => ({ ...c, order: i })))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'communityCategories');
    }
  };

  const setRankings = async (rankings: Ranking[]) => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'rankings'));
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      rankings.forEach((r, index) => {
        const docRef = doc(collection(db, 'rankings'), r.id);
        batch.set(docRef, { ...r, order: index });
      });
      
      await batch.commit();
      
      // Sync to server
      await fetch('/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankings.map((r, i) => ({ ...r, order: i })))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'rankings');
    }
  };

  const syncRankings = async () => {
    try {
      const userStats: Record<string, { id: string; name: string; avatar: string; bio: string; posts: number; likes: number }> = {};
      
      posts.forEach(post => {
        if (post.authorId) {
          if (!userStats[post.authorId]) {
            userStats[post.authorId] = { 
              id: post.authorId, 
              name: post.author, 
              avatar: post.authorAvatar || '', 
              bio: post.authorBio || '',
              posts: 0, 
              likes: 0 
            };
          }
          userStats[post.authorId].posts += 1;
          userStats[post.authorId].likes += (post.likes || 0);
          // Always use the latest bio if available
          if (post.authorBio) userStats[post.authorId].bio = post.authorBio;
        }
      });

      const calculatedRankings = Object.values(userStats)
        .sort((a, b) => b.likes - a.likes || b.posts - a.posts)
        .slice(0, 10)
        .map((r, i) => ({ ...r, score: r.likes * 10 + r.posts * 5, order: i }));

      await setRankings(calculatedRankings);
    } catch (error) {
      console.error('Error syncing rankings:', error);
    }
  };

  useEffect(() => {
    if (posts.length > 0) {
      const timer = setTimeout(() => {
        syncRankings();
      }, 1000); // Debounce to avoid excessive writes
      return () => clearTimeout(timer);
    }
  }, [posts]);

  const setTrendItems = async (items: TrendItem[]) => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'trendItems'));
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      items.forEach((t, index) => {
        const { id, ...data } = t;
        const docRef = doc(collection(db, 'trendItems'), id);
        batch.set(docRef, { ...data, order: index });
      });
      
      await batch.commit();
      
      // Sync to server
      await fetch('/api/trend-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items.map((t, i) => ({ ...t, order: i })))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trendItems');
    }
  };

  const addTrendItem = async (item: TrendItem) => {
    try {
      const { id, ...data } = item;
      if (data.order === undefined) {
        data.order = trendItems.length;
      }
      await setDoc(doc(db, 'trendItems', id), data);
      
      const updatedItems = [...trendItems.filter(i => i.id !== id), { ...data, id }];
      await fetch('/api/trend-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `trendItems/${item.id}`);
    }
  };

  const deleteTrendItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'trendItems', id));
      
      const updatedItems = trendItems.filter(i => i.id !== id);
      await fetch('/api/trend-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trendItems/${id}`);
    }
  };

  const setReviews = async (reviews: any[]) => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'reviews'));
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      reviews.forEach((r) => {
        const docRef = doc(collection(db, 'reviews'), r.id);
        batch.set(docRef, r);
      });
      
      await batch.commit();
      
      // Sync to server
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviews)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
    }
  };

  const updateTrendItem = async (item: TrendItem) => {
    try {
      const { id, ...data } = item;
      await setDoc(doc(db, 'trendItems', id), data);
      
      const updatedItems = trendItems.map(i => i.id === id ? item : i);
      await fetch('/api/trend-items', {
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
        // Limit to maximum 1
        return prev;
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

  const toggleWishlist = async (productId: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    
    setWishlistState(newWishlist);
    
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.id), { wishlist: newWishlist });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      }
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id), data);
      setUser({ ...user, ...data });
      
      // Sync to posts, comments, and trend items
      if (data.name || data.avatar || data.bio) {
        // Update ALL posts to find comments/replies by the user
        for (const post of posts) {
          let needsUpdate = false;
          const updatedPost = { ...post };

          // If user is the author of the post
          if (post.authorId === user.id) {
            if (data.name) updatedPost.author = data.name;
            if (data.avatar) updatedPost.authorAvatar = data.avatar;
            if (data.bio !== undefined) updatedPost.authorBio = data.bio;
            needsUpdate = true;
          }
          
          // Check comments and replies in EVERY post
          if (updatedPost.comments) {
            const originalCommentsJson = JSON.stringify(updatedPost.comments);
            updatedPost.comments = updatedPost.comments.map(c => {
              let commentUpdated = false;
              const updatedComment = { ...c };

              if (c.authorId === user.id) {
                if (data.name) updatedComment.author = data.name;
                if (data.avatar) updatedComment.authorAvatar = data.avatar;
                commentUpdated = true;
              }

              if (updatedComment.replies) {
                updatedComment.replies = updatedComment.replies.map(r => {
                  if (r.authorId === user.id) {
                    return { 
                      ...r, 
                      author: data.name || r.author, 
                      authorAvatar: data.avatar || r.authorAvatar 
                    };
                  }
                  return r;
                });
              }
              
              if (commentUpdated || JSON.stringify(updatedComment.replies) !== JSON.stringify(c.replies)) {
                needsUpdate = true;
                return updatedComment;
              }
              return c;
            });

            if (JSON.stringify(updatedPost.comments) !== originalCommentsJson) {
              needsUpdate = true;
            }
          }

          if (needsUpdate) {
            await updatePost(updatedPost);
          }
        }

        // Update trend items
        const batchTrends = trendItems.filter(t => t.authorId === user.id);
        for (const trend of batchTrends) {
          const updatedTrend = { ...trend };
          if (data.name) updatedTrend.author = data.name;
          if (data.avatar) updatedTrend.authorAvatar = data.avatar;
          if (data.bio !== undefined) updatedTrend.authorBio = data.bio;
          await updateTrendItem(updatedTrend);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      if (user?.id === userId) {
        setUser({ ...user, ...data });
      }

      // Sync to posts, comments, and trend items
      if (data.name || data.avatar) {
        // Update ALL posts to find comments/replies by the user
        for (const post of posts) {
          let needsUpdate = false;
          const updatedPost = { ...post };

          // If user is the author of the post
          if (post.authorId === userId) {
            if (data.name) updatedPost.author = data.name;
            if (data.avatar) updatedPost.authorAvatar = data.avatar;
            needsUpdate = true;
          }
          
          // Check comments and replies in EVERY post
          if (updatedPost.comments) {
            const originalCommentsJson = JSON.stringify(updatedPost.comments);
            updatedPost.comments = updatedPost.comments.map(c => {
              let commentUpdated = false;
              const updatedComment = { ...c };

              if (c.authorId === userId) {
                if (data.name) updatedComment.author = data.name;
                if (data.avatar) updatedComment.authorAvatar = data.avatar;
                commentUpdated = true;
              }

              if (updatedComment.replies) {
                updatedComment.replies = updatedComment.replies.map(r => {
                  if (r.authorId === userId) {
                    return { 
                      ...r, 
                      author: data.name || r.author, 
                      authorAvatar: data.avatar || r.authorAvatar 
                    };
                  }
                  return r;
                });
              }
              
              if (commentUpdated || JSON.stringify(updatedComment.replies) !== JSON.stringify(c.replies)) {
                needsUpdate = true;
                return updatedComment;
              }
              return c;
            });

            if (JSON.stringify(updatedPost.comments) !== originalCommentsJson) {
              needsUpdate = true;
            }
          }

          if (needsUpdate) {
            await updatePost(updatedPost);
          }
        }

        // Update trend items
        const batchTrends = trendItems.filter(t => t.authorId === userId);
        for (const trend of batchTrends) {
          const updatedTrend = { ...trend };
          if (data.name) updatedTrend.author = data.name;
          if (data.avatar) updatedTrend.authorAvatar = data.avatar;
          await updateTrendItem(updatedTrend);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const updateSaleApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'saleApplications', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `saleApplications/${id}`);
    }
  };

  const deleteSaleApplication = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'saleApplications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `saleApplications/${id}`);
    }
  };

  const addComment = async (postId: string, comment: Comment) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedComments = [...(post.comments || []), comment];
    await updatePost({ ...post, comments: updatedComments });
  };

  const updateComment = async (postId: string, comment: Comment) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedComments = (post.comments || []).map(c => c.id === comment.id ? comment : c);
    await updatePost({ ...post, comments: updatedComments });
  };

  const deleteComment = async (postId: string, commentId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedComments = (post.comments || []).filter(c => c.id !== commentId);
    await updatePost({ ...post, comments: updatedComments });
  };

  const addReply = async (postId: string, commentId: string, reply: Comment) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const updatedComments = (post.comments || []).map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      return c;
    });
    await updatePost({ ...post, comments: updatedComments });
  };

  const togglePostLike = async (postId: string) => {
    if (!user) return;
    try {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;
      
      const post = posts[postIndex];
      const likedBy = post.likedBy || [];
      const isLiked = likedBy.includes(user.id);
      
      // Optimistic update
      const newLikedBy = isLiked 
        ? likedBy.filter(id => id !== user.id)
        : [...likedBy, user.id];
      const currentLikes = typeof post.likes === 'number' ? post.likes : (post.likedBy?.length || 0);
      const newLikes = currentLikes + (isLiked ? -1 : 1);
      
      const newPosts = [...posts];
      newPosts[postIndex] = { ...post, likes: newLikes, likedBy: newLikedBy };
      setPostsState(newPosts);

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.id) : arrayUnion(user.id)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const toggleTrendItemLike = async (itemId: string) => {
    if (!user) return;
    try {
      const itemIndex = trendItems.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return;

      const item = trendItems[itemIndex];
      const likedBy = item.likedBy || [];
      const isLiked = likedBy.includes(user.id);
      
      // Optimistic update
      const newLikedBy = isLiked 
        ? likedBy.filter(id => id !== user.id)
        : [...likedBy, user.id];
      const currentLikes = typeof item.likes === 'number' ? item.likes : (item.likedBy?.length || 0);
      const newLikes = currentLikes + (isLiked ? -1 : 1);
      
      const newTrendItems = [...trendItems];
      newTrendItems[itemIndex] = { ...item, likes: newLikes, likedBy: newLikedBy };
      setTrendItemsState(newTrendItems);

      const itemRef = doc(db, 'trendItems', itemId);
      await updateDoc(itemRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.id) : arrayUnion(user.id)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `trendItems/${itemId}`);
    }
  };

  // Cleanup/Fix effect for specific posts
  useEffect(() => {
    if (isLoaded && posts.length > 0) {
      const fixSpecificPosts = async () => {
        const postsToFix = posts.filter(p => p.likes === null || p.likes === undefined);
        if (postsToFix.length === 0) return;

        for (const post of postsToFix) {
          try {
            await updateDoc(doc(db, 'posts', post.id), { 
              likes: post.likedBy?.length || 0,
              likedBy: post.likedBy || []
            });
          } catch (e) {
            console.error("Failed to fix post likes:", post.id, e);
          }
        }
      };
      fixSpecificPosts();
    }
  }, [isLoaded, posts.length]);

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
      config, products, posts, orders, communityCategories, rankings, syncRankings, trendItems, reviews, users, saleApplications, cart, wishlist, user, isLoaded,
      isLoginModalOpen, setIsLoginModalOpen,
      setConfig, addProduct, updateProduct, deleteProduct, setProducts,
      addPost, updatePost, deletePost, setPosts, addOrder, updateOrder,
      setCommunityCategories, setRankings, setTrendItems, addTrendItem, deleteTrendItem, setReviews, updateTrendItem,
      addToCart, removeFromCart, updateCartItem, clearCart, toggleWishlist,
      updateUserProfile, updateUser, deleteUser, 
      updateSaleApplicationStatus, deleteSaleApplication,
      addComment, updateComment, deleteComment, addReply,
      togglePostLike, toggleTrendItemLike,
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
