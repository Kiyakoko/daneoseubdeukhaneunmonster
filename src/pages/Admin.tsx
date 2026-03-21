import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { 
  Settings, ShoppingBag, Users, LayoutDashboard, 
  Plus, Trash2, Edit2, Save, X, CheckCircle, 
  Clock, Truck, Package, Search, Globe, Palette, Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getSafeImageUrl } from '../utils/imageUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Admin: React.FC = () => {
  const { 
    config, setConfig, 
    products, addProduct, updateProduct, deleteProduct,
    posts, addPost, updatePost, deletePost,
    orders, updateOrder
  } = useApp();

  const [activeTab, setActiveTab] = useState<'settings' | 'banners' | 'products' | 'posts' | 'orders'>('settings');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [tempConfig, setTempConfig] = useState<any>(config || {});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setTempConfig(config);
    }
  }, [config]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  if (!config || !tempConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#BFFF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const [newProduct, setNewProduct] = useState<any>({ name: '', price: 0, description: '', imageUrl: '', category: '' });
  const banners = config.banners || [];

  const tabs = [
    { id: 'settings', name: '사이트 설정', icon: Settings },
    { id: 'banners', name: '배너 관리', icon: Image },
    { id: 'products', name: '상품 관리', icon: ShoppingBag },
    { id: 'posts', name: '게시글 관리', icon: Users },
    { id: 'orders', name: '주문 현황', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-8 border-b border-gray-100">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#BFFF00] rounded-lg flex items-center justify-center font-bold">A</div>
            <span className="font-black tracking-tighter uppercase">{config.name}</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id ? "bg-[#BFFF00] text-black shadow-lg" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <tab.icon size={18} />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
            <X size={18} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="mb-8">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:text-[#BFFF00] transition-colors flex items-center space-x-2">
            <Globe size={14} />
            <span>홈페이지로 돌아가기</span>
          </Link>
        </div>
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              {tabs.find(t => t.id === activeTab)?.name}
            </h1>
            <p className="text-gray-400 text-sm">Animation 플랫폼의 모든 콘텐츠를 관리하세요.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="검색..." 
                className="pl-12 pr-6 py-3 rounded-full bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-[#BFFF00] outline-none"
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
                  <div className="flex items-center space-x-3 mb-8">
                    <Globe size={24} className="text-[#BFFF00]" />
                    <h3 className="text-xl font-bold">기본 정보 설정</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">사이트 이름</label>
                      <input 
                        type="text" 
                        value={tempConfig.name} 
                        onChange={(e) => setTempConfig({ ...tempConfig, name: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <Palette size={24} className="text-[#BFFF00]" />
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
                            className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-mono"
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
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
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

              <div className="flex justify-end items-center space-x-4">
                <AnimatePresence>
                  {showSuccess && (
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
                  onClick={() => {
                    setConfig(tempConfig);
                    setShowSuccess(true);
                  }}
                  className="bg-black text-white px-12 py-4 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all shadow-xl"
                >
                  <Save size={20} />
                  <span>설정 저장하기</span>
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
                    onClick={() => setEditingBanner({ id: Math.random().toString(36).substr(2, 9), title: '', subtitle: '', imageUrl: '' })}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
                  >
                    <Plus size={18} />
                    <span>새 배너 추가</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((banner) => (
                    <div key={banner.id} className="group relative aspect-[16/9] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                      <img 
                        src={getSafeImageUrl(banner.imageUrl)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                        <button 
                          onClick={() => setEditingBanner(banner)}
                          className="p-4 bg-white rounded-full text-black hover:bg-[#BFFF00] transition-all"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => setConfig({ ...config, banners: banners.filter(b => b.id !== banner.id) })}
                          className="p-4 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
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
                    onClick={() => setEditingProduct({ id: Math.random().toString(36).substr(2, 9), name: '', price: 0, description: '', imageUrl: '', category: '디자인' })}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
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
                    onClick={() => setEditingPost({ id: Math.random().toString(36).substr(2, 9), title: '', content: '', author: 'Admin', category: '공지사항', date: new Date().toISOString() })}
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
                            <span className="font-bold">{post.title}</span>
                          </td>
                          <td className="py-6">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">{post.category}</span>
                          </td>
                          <td className="py-6 text-gray-400 text-sm">{new Date(post.date).toLocaleDateString()}</td>
                          <td className="py-6 text-right">
                            <div className="flex justify-end space-x-2">
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
              className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tighter uppercase">배너 정보 수정</h3>
                <button onClick={() => setEditingBanner(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">제목</label>
                  <textarea 
                    rows={2}
                    value={editingBanner.title} 
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">서브제목</label>
                  <textarea 
                    rows={2}
                    value={editingBanner.subtitle} 
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-medium text-gray-600"
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
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-mono text-xs"
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
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    const exists = banners.find(b => b.id === editingBanner.id);
                    let newBanners;
                    if (exists) {
                      newBanners = banners.map(b => b.id === editingBanner.id ? editingBanner : b);
                    } else {
                      newBanners = [...banners, editingBanner];
                    }
                    setConfig({ ...config, banners: newBanners });
                    setEditingBanner(null);
                    setShowSuccess(true);
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
              className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tighter uppercase">게시글 정보 수정</h3>
                <button onClick={() => setEditingPost(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">제목</label>
                  <input 
                    type="text" 
                    value={editingPost.title} 
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">카테고리</label>
                  <select 
                    value={editingPost.category} 
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
                  >
                    <option>공지사항</option>
                    <option>이벤트</option>
                    <option>뉴스</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">내용</label>
                  <textarea 
                    rows={6}
                    value={editingPost.content} 
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-medium text-gray-600"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    const exists = posts.find(p => p.id === editingPost.id);
                    if (exists) updatePost(editingPost);
                    else addPost(editingPost);
                    setEditingPost(null);
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
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
              className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tighter uppercase">상품 정보 수정</h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">상품명</label>
                  <input 
                    type="text" 
                    value={editingProduct.name} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
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
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">카테고리</label>
                  <select 
                    value={editingProduct.category} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-bold"
                  >
                    <option>디자인</option>
                    <option>도서</option>
                    <option>패키지</option>
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
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-mono text-xs"
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
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">설명</label>
                  <textarea 
                    rows={3}
                    value={editingProduct.description} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#BFFF00] outline-none font-medium text-gray-600"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    const exists = products.find(p => p.id === editingProduct.id);
                    if (exists) updateProduct(editingProduct);
                    else addProduct(editingProduct);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-[#BFFF00] hover:text-black transition-all"
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
