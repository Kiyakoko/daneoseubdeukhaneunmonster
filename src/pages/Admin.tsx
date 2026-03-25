import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { 
  Settings, ShoppingBag, Users, LayoutDashboard, 
  Plus, Trash2, Edit2, Save, X, CheckCircle, RefreshCw,
  Clock, Truck, Package, Search, Globe, Palette, Image,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MessageSquare, TrendingUp, Pin, Lock, Heart, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

import { getSafeImageUrl } from '../utils/imageUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Admin: React.FC = () => {
  const { 
    config, setConfig, 
    products, addProduct, updateProduct, deleteProduct, setProducts,
    posts, addPost, updatePost, deletePost, setPosts,
    orders, updateOrder,
    communityCategories, setCommunityCategories,
    rankings, setRankings,
    trendItems, setTrendItems, updateTrendItem,
    reviews, setReviews,
    user
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleFirebaseLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Firebase login failed:', error);
    }
  };

  const handleFirebaseLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase logout failed:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'kuyapang') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  const [activeTab, setActiveTab] = useState<'settings' | 'banners' | 'products' | 'posts' | 'orders' | 'community' | 'trend' | 'reviews'>('settings');
  const [communitySubTab, setCommunitySubTab] = useState<'categories' | 'rankings' | 'hot' | 'cosplay'>('categories');

  // Local states for saving
  const [localCategories, setLocalCategories] = useState(communityCategories);
  const [localRankings, setLocalRankings] = useState(rankings);
  const [localTrendItems, setLocalTrendItems] = useState(trendItems);
  const [localReviews, setLocalReviews] = useState(reviews);

  useEffect(() => {
    setLocalCategories(communityCategories);
  }, [communityCategories]);

  useEffect(() => {
    setLocalRankings(rankings);
  }, [rankings]);

  useEffect(() => {
    setLocalTrendItems(trendItems);
  }, [trendItems]);

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const handleSaveCommunity = async () => {
    await setCommunityCategories(localCategories);
    await setRankings(localRankings);
    alert('커뮤니티 설정이 저장되었습니다.');
  };

  const handleSaveTrend = async () => {
    await setTrendItems(localTrendItems);
    alert('트렌드 설정이 저장되었습니다.');
  };

  const handleSaveReviews = async () => {
    await setReviews(localReviews);
    alert('상품 후기 설정이 저장되었습니다.');
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Save all local states to the global store/server
      // We use Promise.all to save everything in parallel
      await Promise.all([
        setConfig(tempConfig),
        setCommunityCategories(localCategories),
        setRankings(localRankings),
        setTrendItems(localTrendItems),
        setReviews(localReviews)
      ]);
      
      // Force a small delay to ensure server has written the file
      await new Promise(resolve => setTimeout(resolve, 800));
      
      alert('모든 변경사항이 성공적으로 저장되었습니다. 이제 웹사이트와 링크에 즉시 반영됩니다.');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving all:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncWithServer = async () => {
    if (!confirm('서버 파일(site-data.json)의 데이터를 Firestore로 덮어쓰시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch server data');
      
      const serverData = await response.json();
      
      // Update Firestore with server data
      if (serverData.config) await setConfig(serverData.config);
      if (serverData.products) await setProducts(serverData.products);
      if (serverData.posts) await setPosts(serverData.posts);
      if (serverData.communityCategories) await setCommunityCategories(serverData.communityCategories);
      if (serverData.rankings) await setRankings(serverData.rankings);
      if (serverData.trendItems) await setTrendItems(serverData.trendItems);
      if (serverData.reviews) await setReviews(serverData.reviews);
      
      alert('서버 데이터가 Firestore와 성공적으로 동기화되었습니다.');
      window.location.reload(); // Reload to refresh all states
    } catch (error) {
      console.error('Sync error:', error);
      alert('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingCommunityCategory, setEditingCommunityCategory] = useState<any>(null);
  const [editingRanking, setEditingRanking] = useState<any>(null);
  const [editingTrendItem, setEditingTrendItem] = useState<any>(null);
  const [tempConfig, setTempConfig] = useState<any>(config || {});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setTempConfig(config);
    }
  }, [config]);

  // Auto-save effect for site settings
  useEffect(() => {
    const isDifferent = JSON.stringify(tempConfig) !== JSON.stringify(config);
    if (!isDifferent) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      await setConfig(tempConfig);
      setIsSaving(false);
      setShowSuccess(true);
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [tempConfig, config, setConfig]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  if (!config || !tempConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: tempConfig.accentColor }} />
      </div>
    );
  }

  const [newProduct, setNewProduct] = useState<any>({ name: '', price: 0, description: '', imageUrl: '', category: '' });
  const [newBanner, setNewBanner] = useState<any>({ id: '', title: '', subtitle: '', imageUrl: '', link: '' });
  const banners = tempConfig.banners || [];

  const tabs = [
    { id: 'settings', name: '사이트 설정', icon: Settings },
    { id: 'banners', name: '배너 관리', icon: Image },
    { id: 'products', name: '상품 관리', icon: ShoppingBag },
    { id: 'posts', name: '게시글 관리', icon: Users },
    { id: 'community', name: '커뮤니티 관리', icon: MessageSquare },
    { id: 'trend', name: '트렌드 관리', icon: TrendingUp },
    { id: 'reviews', name: '후기 관리', icon: Heart },
    { id: 'orders', name: '주문 현황', icon: LayoutDashboard },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-8"
        >
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">관리자 로그인</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className={`w-full px-6 py-4 bg-gray-100 rounded-2xl border-2 transition-all outline-none font-bold text-center ${passwordError ? 'border-red-500' : 'border-transparent focus:border-black'}`}
            />
            {passwordError && <p className="text-red-500 text-sm font-bold">비밀번호가 틀렸습니다.</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-black text-white rounded-2xl font-black hover:bg-[#BFFF00] hover:text-black transition-all"
            >
              입장하기
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Check if Firebase authenticated with the correct email
  const isAdminEmail = user?.email === 'moonnight0613@gmail.com';

  if (!isAdminEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-8"
        >
          <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Globe className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">데이터 쓰기 권한 필요</h1>
          <p className="text-gray-500 text-sm font-bold">
            Firestore에 데이터를 저장하려면 <br/>
            <span className="text-red-500">moonnight0613@gmail.com</span> 계정으로 <br/>
            구글 로그인이 필요합니다.
          </p>
          
          <button
            onClick={handleFirebaseLogin}
            className="w-full py-4 bg-white border-2 border-black rounded-2xl font-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            GOOGLE로 로그인하여 권한 획득
          </button>
          
          <button
            onClick={handleLogout}
            className="text-gray-400 text-sm font-bold hover:text-gray-600 transition-all underline underline-offset-4"
          >
            관리자 세션 종료
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-8 border-b border-gray-100">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
              style={{ backgroundColor: tempConfig.accentColor }}
            >
              {tempConfig.name?.charAt(0) || 'A'}
            </div>
            <span className="font-black tracking-tighter uppercase">{tempConfig.name}</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id ? "shadow-lg" : "text-gray-500 hover:bg-gray-100"
              )}
              style={activeTab === tab.id ? { backgroundColor: tempConfig.accentColor, color: 'black' } : {}}
            >
              <tab.icon size={18} />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <Lock size={18} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:opacity-80 transition-colors flex items-center space-x-2" style={{ color: tempConfig.accentColor }}>
            <Globe size={14} />
            <span>홈페이지로 돌아가기</span>
          </Link>
          
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={cn(
              "flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95",
              isSaving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-opacity-80"
            )}
            style={!isSaving ? { backgroundColor: tempConfig.accentColor, color: 'black' } : {}}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? '저장 중...' : '전체 설정 저장하기'}</span>
          </button>
        </div>
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              {tabs.find(t => t.id === activeTab)?.name}
            </h1>
            <p className="text-gray-400 text-sm">{tempConfig.name} 플랫폼의 모든 콘텐츠를 관리하세요.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="검색..." 
                className="pl-12 pr-6 py-3 rounded-full bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <Globe size={24} style={{ color: tempConfig.accentColor }} />
                      <h3 className="text-xl font-bold">기본 정보 설정</h3>
                    </div>
                    {JSON.stringify(tempConfig) !== JSON.stringify(config) && (
                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest animate-pulse">저장되지 않은 변경사항 있음</span>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">사이트 이름</label>
                      <input 
                        type="text" 
                        value={tempConfig.name} 
                        onChange={(e) => setTempConfig({ ...tempConfig, name: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">하단 태그라인 (Footer Tagline)</label>
                      <textarea 
                        rows={3}
                        value={tempConfig.footerDescription} 
                        onChange={(e) => setTempConfig({ ...tempConfig, footerDescription: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-gray-600"
                        placeholder="현대적인 디자인과 커뮤니티가 만나는 곳. OTAMONO은 당신의 창의성을 현실로 바꿉니다."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <Palette size={24} style={{ color: tempConfig.accentColor }} />
                    <h3 className="text-xl font-bold">테마 및 디자인</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">포인트 컬러 (Accent)</label>
                        <div className="flex items-center space-x-4">
                          <input 
                            type="color" 
                            value={tempConfig.accentColor} 
                            onChange={(e) => setTempConfig({ ...tempConfig, accentColor: e.target.value })}
                            className="w-16 h-16 rounded-2xl overflow-hidden border-none cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={tempConfig.accentColor} 
                            onChange={(e) => setTempConfig({ ...tempConfig, accentColor: e.target.value })}
                            className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">배경 컬러 (Background)</label>
                        <div className="flex items-center space-x-4">
                          <input 
                            type="color" 
                            value={tempConfig.backgroundColor} 
                            onChange={(e) => setTempConfig({ ...tempConfig, backgroundColor: e.target.value })}
                            className="w-16 h-16 rounded-2xl overflow-hidden border-none cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={tempConfig.backgroundColor} 
                            onChange={(e) => setTempConfig({ ...tempConfig, backgroundColor: e.target.value })}
                            className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">폰트 스타일 (Typography)</label>
                      <select 
                        value={tempConfig.fontFamily} 
                        onChange={(e) => setTempConfig({ ...tempConfig, fontFamily: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                      >
                        <option value='"Inter", ui-sans-serif, system-ui, sans-serif'>Inter (Modern Sans)</option>
                        <option value='"Outfit", sans-serif'>Outfit (Tech Round)</option>
                        <option value='"Playfair Display", serif'>Playfair Display (Elegant Serif)</option>
                        <option value='"JetBrains Mono", monospace'>JetBrains Mono (Technical Mono)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-8">
                  <RefreshCw size={24} className="text-blue-500" />
                  <h3 className="text-xl font-bold">데이터 동기화 및 관리</h3>
                </div>
                <div className="space-y-6">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    웹사이트 링크와 구글 AI 스튜디오 간의 데이터가 일치하지 않을 때 사용하세요. 
                    서버 파일(site-data.json)의 내용을 Firestore 데이터베이스로 강제 동기화합니다.
                  </p>
                  <button 
                    onClick={handleSyncWithServer}
                    disabled={isSaving}
                    className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center space-x-2 border-2 border-blue-100"
                  >
                    <RefreshCw size={20} className={isSaving ? 'animate-spin' : ''} />
                    <span>서버 파일 데이터를 Firestore로 동기화</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end items-center space-x-4">
                <AnimatePresence>
                  {isSaving && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center space-x-2 text-blue-500 font-bold"
                    >
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>저장 중...</span>
                    </motion.div>
                  )}
                  {showSuccess && !isSaving && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center space-x-2 text-green-500 font-bold"
                    >
                      <CheckCircle size={18} />
                      <span>저장되었습니다!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button 
                  onClick={() => setConfig(tempConfig)}
                  disabled={isSaving || JSON.stringify(tempConfig) === JSON.stringify(config)}
                  className={cn(
                    "px-12 py-4 rounded-full font-bold flex items-center space-x-2 transition-all shadow-xl",
                    JSON.stringify(tempConfig) === JSON.stringify(config) 
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                      : "bg-black text-white hover:bg-accent hover:text-black"
                  )}
                >
                  <Save size={20} />
                  <span>{isSaving ? '저장 중...' : '설정 저장하기'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'banners' && (
            <motion.div
              key="banners"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">배너 슬라이드 관리 ({banners.length})</h3>
                  <button 
                    onClick={() => setEditingBanner({ id: Math.random().toString(36).substr(2, 9), title: '', subtitle: '', imageUrl: '', link: '' })}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
                  >
                    <Plus size={18} />
                    <span>새 배너 추가</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((banner, index) => (
                    <div key={banner.id} className="group relative aspect-[16/9] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                      <img 
                        src={getSafeImageUrl(banner.imageUrl)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => {
                            if (index === 0) return;
                            const newBanners = [...banners];
                            [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
                            setTempConfig({ ...tempConfig, banners: newBanners });
                          }}
                          disabled={index === 0}
                          className="p-3 bg-white rounded-full text-black transition-all hover:bg-accent disabled:opacity-30 disabled:hover:bg-white"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button 
                          onClick={() => setEditingBanner(banner)}
                          className="p-3 bg-white rounded-full text-black transition-all hover:bg-accent"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => {
                            const newBanners = banners.filter(b => b.id !== banner.id);
                            setTempConfig({ ...tempConfig, banners: newBanners });
                          }}
                          className="p-3 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button 
                          onClick={() => {
                            if (index === banners.length - 1) return;
                            const newBanners = [...banners];
                            [newBanners[index + 1], newBanners[index]] = [newBanners[index], newBanners[index + 1]];
                            setTempConfig({ ...tempConfig, banners: newBanners });
                          }}
                          disabled={index === banners.length - 1}
                          className="p-3 bg-white rounded-full text-black transition-all hover:bg-accent disabled:opacity-30 disabled:hover:bg-white"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold">
                        #{index + 1}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="font-bold text-sm whitespace-pre-line line-clamp-2">{banner.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">상품 목록 ({products.length})</h3>
                  <button 
                    onClick={() => setEditingProduct({ id: Math.random().toString(36).substr(2, 9), name: '', price: 0, description: '', imageUrl: '', category: '피규어', premiumLabel: '' })}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-accent hover:text-black transition-all"
                  >
                    <Plus size={18} />
                    <span>새 상품 추가</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-100">
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">상품</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">카테고리</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">가격</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => (
                        <tr key={product.id} className="group">
                          <td className="py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                <img 
                                  src={getSafeImageUrl(product.imageUrl)} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                  onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/200/200')}
                                />
                              </div>
                              <span className="font-bold">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-6">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">{product.category}</span>
                          </td>
                          <td className="py-6 font-black">₩{product.price.toLocaleString()}</td>
                          <td className="py-6 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  const idx = products.findIndex(p => p.id === product.id);
                                  if (idx === 0) return;
                                  const newProducts = [...products];
                                  [newProducts[idx - 1], newProducts[idx]] = [newProducts[idx], newProducts[idx - 1]];
                                  setProducts(newProducts);
                                }}
                                disabled={products.findIndex(p => p.id === product.id) === 0}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all disabled:opacity-30"
                              >
                                <ChevronUp size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  const idx = products.findIndex(p => p.id === product.id);
                                  if (idx === products.length - 1) return;
                                  const newProducts = [...products];
                                  [newProducts[idx + 1], newProducts[idx]] = [newProducts[idx], newProducts[idx + 1]];
                                  setProducts(newProducts);
                                }}
                                disabled={products.findIndex(p => p.id === product.id) === products.length - 1}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all disabled:opacity-30"
                              >
                                <ChevronDown size={18} />
                              </button>
                              <button 
                                onClick={() => setEditingProduct(product)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => deleteProduct(product.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">게시글 목록 ({posts.length})</h3>
                  <button 
                    onClick={() => setEditingPost({ id: Math.random().toString(36).substr(2, 9), title: '', content: '', author: 'Admin', category: 'Notice', date: new Date().toISOString(), isPinned: false })}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
                  >
                    <Plus size={18} />
                    <span>새 게시글 추가</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-100">
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">제목</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">카테고리</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">작성일</th>
                        <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {posts.map((post) => (
                        <tr key={post.id} className="group">
                          <td className="py-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{post.title}</span>
                              {post.isPinned && <Pin size={14} className="text-accent fill-accent" />}
                            </div>
                          </td>
                          <td className="py-6">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                              {post.category === 'Notice' ? '공지사항' : post.category === 'News' ? '뉴스' : post.category === 'Event' ? '이벤트' : post.category}
                            </span>
                          </td>
                          <td className="py-6 text-gray-400 text-sm">{new Date(post.date).toLocaleDateString()}</td>
                          <td className="py-6 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  const idx = posts.findIndex(p => p.id === post.id);
                                  if (idx === 0) return;
                                  const newPosts = [...posts];
                                  [newPosts[idx - 1], newPosts[idx]] = [newPosts[idx], newPosts[idx - 1]];
                                  setPosts(newPosts);
                                }}
                                disabled={posts.findIndex(p => p.id === post.id) === 0}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all disabled:opacity-30"
                              >
                                <ChevronUp size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  const idx = posts.findIndex(p => p.id === post.id);
                                  if (idx === posts.length - 1) return;
                                  const newPosts = [...posts];
                                  [newPosts[idx + 1], newPosts[idx]] = [newPosts[idx], newPosts[idx + 1]];
                                  setPosts(newPosts);
                                }}
                                disabled={posts.findIndex(p => p.id === post.id) === posts.length - 1}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all disabled:opacity-30"
                              >
                                <ChevronDown size={18} />
                              </button>
                              <button 
                                onClick={() => updatePost({ ...post, isPinned: !post.isPinned })}
                                className={clsx(
                                  "p-2 rounded-lg transition-all",
                                  post.isPinned ? "bg-accent/10 text-accent" : "hover:bg-gray-100 text-gray-400"
                                )}
                              >
                                <Pin size={18} />
                              </button>
                              <button 
                                onClick={() => setEditingPost(post)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => deletePost(post.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  {(['categories', 'rankings', 'hot', 'cosplay'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCommunitySubTab(tab)}
                      className={`px-6 py-3 rounded-full font-bold transition-all ${
                        communitySubTab === tab 
                          ? 'bg-black text-white' 
                          : 'bg-white text-gray-400 hover:text-black shadow-sm'
                      }`}
                    >
                      {tab === 'categories' ? '카테고리' : tab === 'rankings' ? '랭킹' : tab === 'hot' ? 'HOT' : '코스프레'}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleSaveCommunity}
                  className="bg-accent text-black px-8 py-3 rounded-full font-black flex items-center space-x-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                >
                  <Save size={18} />
                  <span>저장하기</span>
                </button>
              </div>

              {communitySubTab === 'categories' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">카테고리 관리</h3>
                    <button 
                      onClick={() => {
                        const newItem = { id: Date.now().toString(), name: '새 카테고리', icon: 'MessageSquare', description: '설명을 입력하세요.' };
                        const newCats = [...localCategories, newItem];
                        setLocalCategories(newCats);
                        setCommunityCategories(newCats);
                      }}
                      className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
                    >
                      <Plus size={18} />
                      <span>카테고리 추가</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localCategories.map((cat, idx) => (
                      <div key={cat.id} className="p-6 rounded-3xl bg-gray-50 border border-transparent hover:border-accent/30 transition-all space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => {
                                  if (idx === 0) return;
                                  const newCats = [...localCategories];
                                  [newCats[idx - 1], newCats[idx]] = [newCats[idx], newCats[idx - 1]];
                                  setLocalCategories(newCats);
                                  setCommunityCategories(newCats);
                                }}
                                disabled={idx === 0}
                                className="text-gray-400 hover:text-black disabled:opacity-30"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (idx === localCategories.length - 1) return;
                                  const newCats = [...localCategories];
                                  [newCats[idx + 1], newCats[idx]] = [newCats[idx], newCats[idx + 1]];
                                  setLocalCategories(newCats);
                                  setCommunityCategories(newCats);
                                }}
                                disabled={idx === localCategories.length - 1}
                                className="text-gray-400 hover:text-black disabled:opacity-30"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                              <MessageSquare size={20} />
                            </div>
                            <input 
                              value={cat.name}
                              onChange={(e) => {
                                const newCats = [...localCategories];
                                newCats[idx].name = e.target.value;
                                setLocalCategories(newCats);
                                setCommunityCategories(newCats);
                              }}
                              className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 w-full"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newCats = localCategories.filter(c => c.id !== cat.id);
                              setLocalCategories(newCats);
                              setCommunityCategories(newCats);
                            }}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <textarea 
                          value={cat.description}
                          onChange={(e) => {
                            const newCats = [...localCategories];
                            newCats[idx].description = e.target.value;
                            setLocalCategories(newCats);
                          }}
                          className="w-full text-sm text-gray-500 bg-white rounded-xl p-3 border-none focus:ring-1 focus:ring-accent outline-none resize-none"
                          rows={2}
                        />
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">이미지 URL</label>
                          <input 
                            value={cat.imageUrl || ''}
                            onChange={(e) => {
                              const newCats = [...localCategories];
                              newCats[idx].imageUrl = e.target.value;
                              setLocalCategories(newCats);
                            }}
                            className="w-full text-xs bg-white rounded-xl p-3 border-none focus:ring-1 focus:ring-accent outline-none"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {communitySubTab === 'rankings' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">랭킹 관리</h3>
                    <button 
                      onClick={() => {
                        const newItem = { id: Date.now().toString(), name: '사용자', score: 0, rank: localRankings.length + 1, avatar: 'https://picsum.photos/seed/user/100/100' };
                        const newRanks = [...localRankings, newItem];
                        setLocalRankings(newRanks);
                        setRankings(newRanks);
                      }}
                      className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
                    >
                      <Plus size={18} />
                      <span>랭킹 추가</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-100">
                          <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">순위</th>
                          <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">사용자</th>
                          <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">점수</th>
                          <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-400">아바타 URL</th>
                          <th className="pb-4 text-right">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {localRankings.map((rank, idx) => (
                          <tr key={rank.id}>
                            <td className="py-4 font-bold">{idx + 1}</td>
                            <td className="py-4">
                              <input 
                                value={rank.name}
                                onChange={(e) => {
                                  const newRanks = [...localRankings];
                                  newRanks[idx].name = e.target.value;
                                  setLocalRankings(newRanks);
                                  setRankings(newRanks);
                                }}
                                className="bg-transparent border-none focus:ring-0 p-0 font-medium"
                              />
                            </td>
                            <td className="py-4">
                              <input 
                                type="number"
                                value={rank.score}
                                onChange={(e) => {
                                  const newRanks = [...localRankings];
                                  newRanks[idx].score = parseInt(e.target.value);
                                  setLocalRankings(newRanks);
                                  setRankings(newRanks);
                                }}
                                className="bg-transparent border-none focus:ring-0 p-0 font-medium w-20"
                              />
                            </td>
                            <td className="py-4">
                              <input 
                                value={rank.avatar}
                                onChange={(e) => {
                                  const newRanks = [...localRankings];
                                  newRanks[idx].avatar = e.target.value;
                                  setLocalRankings(newRanks);
                                  setRankings(newRanks);
                                }}
                                className="bg-transparent border-none focus:ring-0 p-0 text-xs text-gray-400 w-full"
                              />
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => {
                                const newRanks = localRankings.filter(r => r.id !== rank.id);
                                setLocalRankings(newRanks);
                                setRankings(newRanks);
                              }}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {communitySubTab === 'hot' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">HOT 게시물 관리</h3>
                    <button 
                      onClick={() => {
                        setEditingPost({
                          id: Date.now().toString(),
                          title: '',
                          content: '',
                          author: 'Admin',
                          date: new Date().toISOString().split('T')[0],
                          category: 'HOT',
                          imageUrl: 'https://picsum.photos/seed/hot/800/600',
                          likes: 100,
                          isPinned: false
                        });
                      }}
                      className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-accent hover:text-black transition-all"
                    >
                      <Plus size={18} />
                      <span>HOT 게시물 추가</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.filter(p => p.category === 'HOT').map((post, idx, filteredArr) => (
                      <div key={post.id} className="p-4 rounded-3xl bg-gray-50 border border-gray-100 flex gap-4 group relative">
                        <div className="flex flex-col gap-1 self-center">
                          <button 
                            onClick={() => {
                              if (idx === 0) return;
                              const prevPost = filteredArr[idx - 1];
                              const currentIdx = posts.findIndex(p => p.id === post.id);
                              const prevIdx = posts.findIndex(p => p.id === prevPost.id);
                              const newPosts = [...posts];
                              [newPosts[prevIdx], newPosts[currentIdx]] = [newPosts[currentIdx], newPosts[prevIdx]];
                              setPosts(newPosts);
                            }}
                            disabled={idx === 0}
                            className="text-gray-400 hover:text-black disabled:opacity-30"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              if (idx === filteredArr.length - 1) return;
                              const nextPost = filteredArr[idx + 1];
                              const currentIdx = posts.findIndex(p => p.id === post.id);
                              const nextIdx = posts.findIndex(p => p.id === nextPost.id);
                              const newPosts = [...posts];
                              [newPosts[nextIdx], newPosts[currentIdx]] = [newPosts[currentIdx], newPosts[nextIdx]];
                              setPosts(newPosts);
                            }}
                            disabled={idx === filteredArr.length - 1}
                            className="text-gray-400 hover:text-black disabled:opacity-30"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 shrink-0">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">@{post.author}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{post.category}</span>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Heart size={10} /> {post.likes || 0}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => setEditingPost(post)}
                            className="p-1.5 bg-white rounded-lg text-gray-400 hover:text-black shadow-sm"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => deletePost(post.id)}
                            className="p-1.5 bg-white rounded-lg text-red-400 hover:text-red-500 shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {communitySubTab === 'cosplay' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">코스프레 게시물 관리</h3>
                    <button 
                      onClick={() => {
                        setEditingPost({
                          id: Date.now().toString(),
                          title: '',
                          content: '',
                          author: 'Admin',
                          date: new Date().toISOString().split('T')[0],
                          category: '코스프레',
                          imageUrl: 'https://picsum.photos/seed/cosplay/800/600',
                          likes: 0,
                          isPinned: false
                        });
                      }}
                      className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-accent hover:text-black transition-all"
                    >
                      <Plus size={18} />
                      <span>코스프레 게시물 추가</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.filter(p => p.category === '코스프레').map((post, idx, filteredArr) => (
                      <div key={post.id} className="p-4 rounded-3xl bg-gray-50 border border-gray-100 flex gap-4 group relative">
                        <div className="flex flex-col gap-1 self-center">
                          <button 
                            onClick={() => {
                              if (idx === 0) return;
                              const prevPost = filteredArr[idx - 1];
                              const currentIdx = posts.findIndex(p => p.id === post.id);
                              const prevIdx = posts.findIndex(p => p.id === prevPost.id);
                              const newPosts = [...posts];
                              [newPosts[prevIdx], newPosts[currentIdx]] = [newPosts[currentIdx], newPosts[prevIdx]];
                              setPosts(newPosts);
                            }}
                            disabled={idx === 0}
                            className="text-gray-400 hover:text-black disabled:opacity-30"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              if (idx === filteredArr.length - 1) return;
                              const nextPost = filteredArr[idx + 1];
                              const currentIdx = posts.findIndex(p => p.id === post.id);
                              const nextIdx = posts.findIndex(p => p.id === nextPost.id);
                              const newPosts = [...posts];
                              [newPosts[nextIdx], newPosts[currentIdx]] = [newPosts[currentIdx], newPosts[nextIdx]];
                              setPosts(newPosts);
                            }}
                            disabled={idx === filteredArr.length - 1}
                            className="text-gray-400 hover:text-black disabled:opacity-30"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 shrink-0">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">@{post.author}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{post.category}</span>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Heart size={10} /> {post.likes || 0}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => setEditingPost(post)}
                            className="p-1.5 bg-white rounded-lg text-gray-400 hover:text-black shadow-sm"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => deletePost(post.id)}
                            className="p-1.5 bg-white rounded-lg text-red-400 hover:text-red-500 shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'trend' && (
            <motion.div
              key="trend"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveTrend}
                  className="bg-accent text-black px-8 py-3 rounded-full font-black flex items-center space-x-2 hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                >
                  <Save size={18} />
                  <span>저장하기</span>
                </button>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">트렌드 관리 (릴스)</h3>
                  <button 
                    onClick={() => {
                      const newItem = { id: Date.now().toString(), videoUrl: '', title: '새 트렌드', thumbnail: 'https://picsum.photos/seed/trend/400/600' };
                      const newItems = [...localTrendItems, newItem];
                      setLocalTrendItems(newItems);
                      setTrendItems(newItems);
                    }}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
                  >
                    <Plus size={18} />
                    <span>트렌드 추가</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {localTrendItems.map((item, idx) => (
                    <div key={item.id} className="group p-6 rounded-[2.5rem] bg-gray-50 border border-transparent hover:border-accent/30 transition-all space-y-4">
                      <div className="aspect-[9/16] rounded-[2rem] bg-gray-200 overflow-hidden relative">
                        {item.thumbnail ? (
                          <img 
                            src={getSafeImageUrl(item.thumbnail)} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                          />
                        ) : item.videoUrl ? (
                          <div className="w-full h-full relative">
                            <video 
                              src={item.videoUrl} 
                              className="w-full h-full object-cover" 
                              muted 
                              loop 
                              autoPlay 
                              playsInline 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play size={48} className="text-white opacity-50" />
                            </div>
                          </div>
                        ) : (
                          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-3">
                          <button 
                            onClick={() => {
                              if (idx === 0) return;
                              const newItems = [...localTrendItems];
                              [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
                              setLocalTrendItems(newItems);
                              setTrendItems(newItems);
                            }}
                            disabled={idx === 0}
                            className="p-4 rounded-full bg-white text-black shadow-xl transform scale-90 group-hover:scale-100 transition-all hover:bg-accent disabled:opacity-30 disabled:hover:bg-white"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button 
                            onClick={() => {
                              const newItems = localTrendItems.filter(t => t.id !== item.id);
                              setLocalTrendItems(newItems);
                              setTrendItems(newItems);
                            }}
                            className="p-4 rounded-full bg-red-500 text-white shadow-xl transform scale-90 group-hover:scale-100 transition-all hover:bg-red-600"
                          >
                            <Trash2 size={24} />
                          </button>
                          <button 
                            onClick={() => {
                              if (idx === localTrendItems.length - 1) return;
                              const newItems = [...localTrendItems];
                              [newItems[idx + 1], newItems[idx]] = [newItems[idx], newItems[idx + 1]];
                              setLocalTrendItems(newItems);
                              setTrendItems(newItems);
                            }}
                            disabled={idx === localTrendItems.length - 1}
                            className="p-4 rounded-full bg-white text-black shadow-xl transform scale-90 group-hover:scale-100 transition-all hover:bg-accent disabled:opacity-30 disabled:hover:bg-white"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">제목</label>
                          <input 
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...localTrendItems];
                              const updatedItem = { ...newItems[idx], title: e.target.value };
                              newItems[idx] = updatedItem;
                              setLocalTrendItems(newItems);
                              setTrendItems(newItems);
                            }}
                            className="w-full px-5 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">사용자 이름</label>
                          <input 
                            value={item.author || ''}
                            onChange={(e) => {
                              const newItems = [...localTrendItems];
                              const updatedItem = { ...newItems[idx], author: e.target.value };
                              newItems[idx] = updatedItem;
                              setLocalTrendItems(newItems);
                              setTrendItems(newItems);
                            }}
                            className="w-full px-5 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">릴스 링크</label>
                          <input 
                            value={item.videoUrl}
                            placeholder="https://www.instagram.com/reels/..."
                            onChange={(e) => {
                              const newItems = [...localTrendItems];
                              const updatedItem = { ...newItems[idx], videoUrl: e.target.value };
                              newItems[idx] = updatedItem;
                              setLocalTrendItems(newItems);
                              setTrendItems(newItems);
                            }}
                            className="w-full px-5 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">썸네일 URL</label>
                          <input 
                            value={item.thumbnail}
                            onChange={(e) => {
                              const newItems = [...localTrendItems];
                              const updatedItem = { ...newItems[idx], thumbnail: e.target.value };
                              newItems[idx] = updatedItem;
                              setLocalTrendItems(newItems);
                              setTrendItems(newItems);
                            }}
                            className="w-full px-5 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">상품 포토 후기 관리</h2>
                  <p className="text-gray-400 text-sm">홈페이지 SHOP 섹션에 표시되는 포토 후기를 편집하세요.</p>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      const newReview = {
                        id: Date.now().toString(),
                        imageUrl: 'https://picsum.photos/seed/new/400/400',
                        rating: 5,
                        title: '새로운 후기',
                        content: '후기 내용을 입력하세요.',
                        author: '작성자'
                      };
                      const newReviews = [newReview, ...localReviews];
                      setLocalReviews(newReviews);
                      setReviews(newReviews);
                    }}
                    className="px-8 py-4 bg-black text-white rounded-2xl font-black hover:bg-[#BFFF00] hover:text-black transition-all flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>후기 추가</span>
                  </button>
                  <button 
                    onClick={handleSaveReviews}
                    className="px-8 py-4 bg-[#BFFF00] text-black rounded-2xl font-black hover:bg-black hover:text-white transition-all flex items-center space-x-2"
                  >
                    <Save size={20} />
                    <span>변경사항 저장</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {localReviews.map((review, idx) => (
                  <div key={review.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 group relative">
                    <button 
                      onClick={() => {
                        const newReviews = localReviews.filter((_, i) => i !== idx);
                        setLocalReviews(newReviews);
                        setReviews(newReviews);
                      }}
                      className="absolute top-6 right-6 p-3 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex space-x-8">
                      <div className="w-40 h-40 rounded-3xl overflow-hidden bg-gray-100 flex-shrink-0 border-4 border-gray-50">
                        <img 
                          src={getSafeImageUrl(review.imageUrl)} 
                          alt="Review" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/400/400';
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">작성자</label>
                            <input 
                              value={review.author}
                              onChange={(e) => {
                                const newReviews = [...localReviews];
                                newReviews[idx].author = e.target.value;
                                setLocalReviews(newReviews);
                                setReviews(newReviews);
                              }}
                              className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">별점 (1-5)</label>
                            <input 
                              type="number"
                              min="1"
                              max="5"
                              value={review.rating}
                              onChange={(e) => {
                                const newReviews = [...localReviews];
                                newReviews[idx].rating = parseInt(e.target.value) || 5;
                                setLocalReviews(newReviews);
                                setReviews(newReviews);
                              }}
                              className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">제목</label>
                          <input 
                            value={review.title}
                            onChange={(e) => {
                              const newReviews = [...localReviews];
                              newReviews[idx].title = e.target.value;
                              setLocalReviews(newReviews);
                            }}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">이미지 URL</label>
                          <input 
                            value={review.imageUrl}
                            onChange={(e) => {
                              const newReviews = [...localReviews];
                              newReviews[idx].imageUrl = e.target.value;
                              setLocalReviews(newReviews);
                            }}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-mono text-[10px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">내용</label>
                          <textarea 
                            rows={3}
                            value={review.content}
                            onChange={(e) => {
                              const newReviews = [...localReviews];
                              newReviews[idx].content = e.target.value;
                              setLocalReviews(newReviews);
                            }}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Clock size={32} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">대기 중</p>
                  <p className="text-3xl font-black">12</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-6">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                  <Truck size={32} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">배송 중</p>
                  <p className="text-3xl font-black">5</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-6">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">완료됨</p>
                  <p className="text-3xl font-black">148</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner Edit Modal */}
        {editingBanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <h3 className="text-2xl font-black tracking-tighter uppercase">배너 정보 수정</h3>
                <button onClick={() => setEditingBanner(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6 mb-8 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">제목</label>
                  <textarea 
                    rows={2}
                    value={editingBanner.title} 
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">서브제목</label>
                  <textarea 
                    rows={2}
                    value={editingBanner.subtitle} 
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">이동할 링크 (URL 또는 경로)</label>
                  <input 
                    type="text" 
                    value={editingBanner.link || ''} 
                    onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                    placeholder="/shop 또는 https://example.com"
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">이미지 URL (16:9 권장)</label>
                  <p className="text-[10px] text-gray-400 mb-2">* 핀터레스트 핀 링크나 이미지 주소를 그대로 넣어주세요. 자동으로 이미지를 가져옵니다.</p>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={editingBanner.imageUrl} 
                        onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-mono text-xs"
                      />
                    </div>
                    {editingBanner.imageUrl && (
                      <div className="w-24 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                        <img 
                          src={getSafeImageUrl(editingBanner.imageUrl)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/200/200')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 flex-shrink-0">
                <button 
                  onClick={() => {
                    const exists = banners.find(b => b.id === editingBanner.id);
                    let newBanners;
                    if (exists) {
                      newBanners = banners.map(b => b.id === editingBanner.id ? editingBanner : b);
                    } else {
                      newBanners = [...banners, editingBanner];
                    }
                    setTempConfig({ ...tempConfig, banners: newBanners });
                    setEditingBanner(null);
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
                >
                  <Save size={20} />
                  <span>저장하기</span>
                </button>
                <button 
                  onClick={() => setEditingBanner(null)}
                  className="px-8 py-4 rounded-full font-bold border-2 border-gray-100 hover:bg-gray-50 transition-all"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Post Edit Modal */}
        {editingPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <h3 className="text-2xl font-black tracking-tighter uppercase">게시글 정보 수정</h3>
                <button onClick={() => setEditingPost(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6 mb-8 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">제목</label>
                  <input 
                    type="text" 
                    value={editingPost.title} 
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">작성자</label>
                  <input 
                    type="text" 
                    value={editingPost.author} 
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">카테고리</label>
                  <select 
                    value={editingPost.category} 
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  >
                    <option value="Notice">공지사항</option>
                    <option value="Event">이벤트</option>
                    <option value="News">뉴스</option>
                    <option value="HOT">HOT</option>
                    <option value="코스프레">코스프레</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">이미지 URL</label>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={editingPost.imageUrl} 
                        onChange={(e) => setEditingPost({ ...editingPost, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-mono text-xs"
                      />
                    </div>
                    {editingPost.imageUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                        <img 
                          src={getSafeImageUrl(editingPost.imageUrl)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/200/200')}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50">
                  <input 
                    type="checkbox" 
                    id="isPinned"
                    checked={editingPost.isPinned}
                    onChange={(e) => setEditingPost({ ...editingPost, isPinned: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <label htmlFor="isPinned" className="font-bold text-sm cursor-pointer">상단 고정</label>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">내용</label>
                  <textarea 
                    rows={6}
                    value={editingPost.content} 
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-gray-600"
                  />
                </div>
              </div>
              <div className="flex space-x-4 flex-shrink-0">
                <button 
                  onClick={() => {
                    const exists = posts.find(p => p.id === editingPost.id);
                    if (exists) updatePost(editingPost);
                    else addPost(editingPost);
                    setEditingPost(null);
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-accent hover:text-black transition-all"
                >
                  <Save size={20} />
                  <span>저장하기</span>
                </button>
                <button 
                  onClick={() => setEditingPost(null)}
                  className="px-8 py-4 rounded-full font-bold border-2 border-gray-100 hover:bg-gray-50 transition-all"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Product Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <h3 className="text-2xl font-black tracking-tighter uppercase">상품 정보 수정</h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">상품명</label>
                  <input 
                    type="text" 
                    value={editingProduct.name} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">가격 (₩)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price || ''} 
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setEditingProduct({ ...editingProduct, price: isNaN(val) ? 0 : val });
                    }}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">카테고리</label>
                    <select 
                      value={editingProduct.category} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                    >
                      <option>피규어</option>
                      <option>문구/팬시</option>
                      <option>인형</option>
                      <option>코스프레</option>
                      <option>기타</option>
                    </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">이미지 URL</label>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={editingProduct.imageUrl} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                        placeholder="https://example.com/product.jpg"
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-mono text-xs"
                      />
                    </div>
                    {editingProduct.imageUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                        <img 
                          src={getSafeImageUrl(editingProduct.imageUrl)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/200/200')}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">설명 (간략)</label>
                  <textarea 
                    rows={2}
                    value={editingProduct.description} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-gray-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">상세정보 (Detail Info)</label>
                  <textarea 
                    rows={4}
                    value={editingProduct.detailInfo || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, detailInfo: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-gray-600"
                    placeholder="상품에 대한 자세한 설명을 입력하세요."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">구매후기 (Reviews Content)</label>
                  <textarea 
                    rows={4}
                    value={editingProduct.reviewContent || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, reviewContent: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-gray-600"
                    placeholder="구매 후기 내용을 입력하세요."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">배송/교환/반품 (Shipping Info)</label>
                  <textarea 
                    rows={4}
                    value={editingProduct.shippingInfo || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, shippingInfo: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-gray-600"
                    placeholder="배송 및 교환/반품 안내를 입력하세요."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">프리미엄 상품 라벨 (Premium Label)</label>
                  <input 
                    type="text" 
                    value={editingProduct.premiumLabel || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, premiumLabel: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                    placeholder="Premium Quality"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">별점 (0-5)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingProduct.rating || 0} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">리뷰 수</label>
                  <input 
                    type="number" 
                    value={editingProduct.reviewCount || 0} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, reviewCount: parseInt(e.target.value) })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">상세정보 탭 이미지 (Detail Images)</label>
                  <div className="space-y-2">
                    {(editingProduct.detailImages || []).map((img, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" 
                          value={img} 
                          onChange={(e) => {
                            const newImages = [...(editingProduct.detailImages || [])];
                            newImages[idx] = e.target.value;
                            setEditingProduct({ ...editingProduct, detailImages: newImages });
                          }}
                          className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold text-sm"
                          placeholder="이미지 URL을 입력하세요"
                        />
                        <button 
                          onClick={() => {
                            const newImages = (editingProduct.detailImages || []).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, detailImages: newImages });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newImages = [...(editingProduct.detailImages || []), ''];
                        setEditingProduct({ ...editingProduct, detailImages: newImages });
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-xs hover:border-accent hover:text-accent transition-all"
                    >
                      + 이미지 추가
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">프리미엄 특징 (Premium Features)</label>
                  <div className="space-y-2">
                    {(editingProduct.premiumFeatures || ['고급 소재 사용', '정밀한 디테일 구현', '안전한 패키징', '공식 라이선스 인증']).map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" 
                          value={feature} 
                          onChange={(e) => {
                            const newFeatures = [...(editingProduct.premiumFeatures || ['고급 소재 사용', '정밀한 디테일 구현', '안전한 패키징', '공식 라이선스 인증'])];
                            newFeatures[idx] = e.target.value;
                            setEditingProduct({ ...editingProduct, premiumFeatures: newFeatures });
                          }}
                          className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold text-sm"
                        />
                        <button 
                          onClick={() => {
                            const newFeatures = (editingProduct.premiumFeatures || ['고급 소재 사용', '정밀한 디테일 구현', '안전한 패키징', '공식 라이선스 인증']).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, premiumFeatures: newFeatures });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newFeatures = [...(editingProduct.premiumFeatures || ['고급 소재 사용', '정밀한 디테일 구현', '안전한 패키징', '공식 라이선스 인증']), ''];
                        setEditingProduct({ ...editingProduct, premiumFeatures: newFeatures });
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-xs hover:border-accent hover:text-accent transition-all"
                    >
                      + 특징 추가
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 flex-shrink-0">
                <button 
                  onClick={() => {
                    const exists = products.find(p => p.id === editingProduct.id);
                    if (exists) updateProduct(editingProduct);
                    else addProduct(editingProduct);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-accent hover:text-black transition-all"
                >
                  <Save size={20} />
                  <span>저장하기</span>
                </button>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="px-8 py-4 rounded-full font-bold border-2 border-gray-100 hover:bg-gray-50 transition-all"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
