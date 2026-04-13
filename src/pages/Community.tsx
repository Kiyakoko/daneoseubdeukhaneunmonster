import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../store';
import { Plus, Flame, Trophy, Users, LayoutGrid, Heart, MessageCircle, Crown, ChevronRight, X, Trash2, Play, Share2, Edit2, Reply, Search } from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { ReelRegistrationModal } from '../components/RegistrationModals';
import { LoginModal } from '../components/LoginModal';
import { Post, Comment } from '../types';

const ANIMATION_CATEGORIES = [
  { id: '1', name: '귀멸의 칼날', description: '혈귀와 맞서 싸우는 귀살대의 이야기', members: 12500, posts: 3400, imageUrl: 'https://picsum.photos/seed/kny/400/600' },
  { id: '2', name: '주술회전', description: '저주를 퇴치하는 주술사들의 사투', members: 10200, posts: 2800, imageUrl: 'https://picsum.photos/seed/jjk/400/600' },
  { id: '3', name: '체인소 맨', description: '악마와 계약한 소년의 파격적인 액션', members: 8900, posts: 1500, imageUrl: 'https://picsum.photos/seed/csm/400/600' },
  { id: '4', name: '스파이 패밀리', description: '스파이, 암살자, 초능력자의 위장 가족', members: 15600, posts: 4200, imageUrl: 'https://picsum.photos/seed/spy/400/600' },
];

export const Community: React.FC = () => {
  const { 
    posts, 
    config, 
    rankings: storeRankings, 
    communityCategories, 
    trendItems, 
    addPost, 
    updatePost, 
    deletePost, 
    updateTrendItem, 
    deleteTrendItem,
    user,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    togglePostLike,
    toggleTrendItemLike,
    setIsLoginModalOpen
  } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab || 'HOT');
  const [visiblePosts, setVisiblePosts] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingReel, setEditingReel] = useState<any>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '' });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserProfile = useMemo(() => {
    if (!selectedUser) return null;
    // Find the latest ranking data for this user to ensure real-time bio/name/avatar
    const latestRanking = storeRankings.find(r => r.id === selectedUser.id || r.name === selectedUser.name);
    return latestRanking || selectedUser;
  }, [storeRankings, selectedUser]);

  const currentPost = useMemo(() => {
    if (!selectedPost) return null;
    return posts.find(p => p.id === selectedPost.id) || selectedPost;
  }, [posts, selectedPost]);

  // Comment states
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const categories = useMemo(() => {
    if (communityCategories && communityCategories.length > 0) return communityCategories;
    return ANIMATION_CATEGORIES;
  }, [communityCategories]);

  const hotPosts = useMemo(() => {
    let result = posts.filter(p => p.category === 'HOT');
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.title?.toLowerCase().includes(query)) || 
        (p.content?.toLowerCase().includes(query))
      );
    }
    return result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [posts, searchQuery]);

  const rankings = useMemo(() => {
    if (storeRankings && storeRankings.length > 0) return storeRankings;
    
    // Fallback to calculated rankings if store is empty
    const userStats: Record<string, { posts: number; likes: number }> = {};
    posts.forEach(post => {
      if (!userStats[post.author]) {
        userStats[post.author] = { posts: 0, likes: 0 };
      }
      userStats[post.author].posts += 1;
      userStats[post.author].likes += (post.likes || 0);
    });

    return Object.entries(userStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.likes - a.likes || b.posts - a.posts)
      .slice(0, 10);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeTab === 'HOT' || activeTab === '랭킹') return [];
    let result = posts.filter(p => p.category === activeTab);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.title?.toLowerCase().includes(query)) || 
        (p.content?.toLowerCase().includes(query))
      );
    }
    return result;
  }, [posts, activeTab, searchQuery]);

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) {
      alert('로그인이 필요합니다.');
      setIsLoginModalOpen(true);
      return;
    }
    togglePostLike(postId);
  };

  const handleTrendLike = (e: React.MouseEvent, trendId: string) => {
    e.stopPropagation();
    if (!user) {
      alert('로그인이 필요합니다.');
      setIsLoginModalOpen(true);
      return;
    }
    toggleTrendItemLike(trendId);
  };

  const handleWriteClick = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      setIsLoginModalOpen(true);
      return;
    }
    setIsWriting(true);
  };

  const handleReelClick = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      setIsLoginModalOpen(true);
      return;
    }
    setEditingReel(null);
    setIsReelModalOpen(true);
  };

  const handleSavePost = () => {
    if (!newPost.content) return;
    
    if (editingPost) {
      updatePost({
        ...editingPost,
        title: newPost.title,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
      });
      setEditingPost(null);
    } else {
      const post: any = {
        id: Date.now().toString(),
        author: user?.name || 'User',
        authorId: user?.id,
        authorAvatar: user?.avatar,
        title: newPost.title,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
        likes: 0,
        type: 'community',
        category: activeTab === '코스프레' ? '코스프레' : selectedCategory?.name,
        createdAt: new Date().toISOString().split('T')[0],
        date: new Date().toISOString().split('T')[0]
      };
      addPost(post);
    }
    
    setIsWriting(false);
    setNewPost({ title: '', content: '', imageUrl: '' });
  };

  useEffect(() => {
    if (editingPost) {
      setNewPost({
        title: editingPost.title || '',
        content: editingPost.content || '',
        imageUrl: editingPost.imageUrl || '',
      });
    }
  }, [editingPost]);

  const tabs = useMemo(() => {
    const defaultTabs = [
      { id: 'HOT', icon: <Flame size={16} />, label: 'HOT' },
      { id: '랭킹', icon: <Trophy size={16} />, label: '랭킹' },
      { id: '코스프레', icon: <Users size={16} />, label: '코스프레' },
      { id: '트렌드', icon: <Play size={16} />, label: '트렌드' },
      { id: '카테고리', icon: <LayoutGrid size={16} />, label: '카테고리' },
    ];

    if (config.communityTabs && config.communityTabs.length > 0) {
      return config.communityTabs.map(id => defaultTabs.find(t => t.id === id)).filter(Boolean) as typeof defaultTabs;
    }
    return defaultTabs;
  }, [config.communityTabs]);

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <h1 className="text-6xl font-black tracking-tighter uppercase">COMMUNITY</h1>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목 또는 내용으로 검색..."
                className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent outline-none font-bold text-sm transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="flex space-x-8 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 text-sm font-bold transition-all border-b-4 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-black'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* HOT Tab */}
        {activeTab === 'HOT' && (
          <>
            {hotPosts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {hotPosts.slice(0, visiblePosts).map((post) => (
                  <div key={post.id} className="group cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                        <img
                          src={getSafeImageUrl(post.imageUrl || 'https://picsum.photos/seed/post/800/800')}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                        />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-accent overflow-hidden flex items-center justify-center font-bold text-[10px]">
                          {post.authorAvatar || (post.authorId && posts.find(p => p.authorId === post.authorId)?.authorAvatar) ? (
                            <img 
                              src={getSafeImageUrl(post.authorAvatar || posts.find(p => p.authorId === post.authorId)?.authorAvatar)} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                            />
                          ) : (
                            (post.author || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-xs">@{post.author}</span>
                      </div>
                      <button 
                        onClick={(e) => handleLike(e, post.id)}
                        className={`${post.likedBy?.includes(user?.id || '') ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
                      >
                        <Heart size={14} fill={post.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold line-clamp-2 mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Heart size={10} fill={post.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} className={post.likedBy?.includes(user?.id || '') ? 'text-red-500' : ''} />
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={10} />
                        <span>{(post.comments?.length || 0) + (post.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
                <p className="text-gray-400 font-bold uppercase tracking-widest">
                  {searchQuery ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                </p>
              </div>
            )}
            {hotPosts.length > visiblePosts && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={() => setVisiblePosts(prev => prev + 20)}
                  className="px-8 py-3 border border-gray-200 rounded-full text-sm font-bold hover:bg-black hover:text-white transition-all"
                >
                  더보기
                </button>
              </div>
            )}
          </>
        )}

        {/* Ranking Tab */}
        {activeTab === '랭킹' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-black text-white rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-12 text-center uppercase tracking-tight text-accent">명예의 전당</h2>
              <div className="grid gap-4">
                {rankings.map((rankUser, index) => (
                  <div 
                    key={rankUser.name} 
                    className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-accent transition-all group cursor-pointer"
                    onClick={() => setSelectedUser(rankUser)}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        {index < 3 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                            <Crown 
                              size={24} 
                              className={
                                index === 0 ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" :
                                index === 1 ? "text-gray-300" :
                                "text-amber-600"
                              } 
                            />
                          </div>
                        )}
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl border-2 border-transparent group-hover:border-accent transition-all overflow-hidden">
                          {rankUser.avatar ? (
                            <img 
                              src={getSafeImageUrl(rankUser.avatar)} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                            />
                          ) : (
                            (rankUser.name || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-accent text-black flex items-center justify-center text-[10px] font-black">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">@{rankUser.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Top Contributor</p>
                      </div>
                    </div>
                    <div className="flex space-x-8 text-right">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Posts</p>
                        <p className="font-black text-lg text-white">{rankUser.posts}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Likes</p>
                        <p className="font-black text-lg text-accent">{rankUser.likes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs (코스프레, 분야별) */}
                {activeTab === '코스프레' && (
                  <>
                    {isWriting ? (
                      <div className="max-w-2xl mx-auto bg-gray-50 p-12 rounded-[3rem] border border-gray-100">
                        <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">새 게시글 작성</h2>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">제목</label>
                            <input 
                              type="text"
                              value={newPost.title}
                              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                              placeholder="제목을 입력하세요"
                              className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">내용</label>
                            <textarea 
                              rows={6}
                              value={newPost.content}
                              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                              placeholder="내용을 입력하세요"
                              className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">사진 URL</label>
                            <input 
                              type="text"
                              value={newPost.imageUrl}
                              onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-mono text-xs"
                            />
                          </div>
                          <div className="flex space-x-4 pt-4">
                            <button 
                              onClick={handleSavePost}
                              className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-accent hover:text-black transition-all"
                            >
                              저장하기
                            </button>
                            <button 
                              onClick={() => setIsWriting(false)}
                              className="flex-1 bg-white text-black py-4 rounded-full font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-end mb-8">
                          <button 
                            onClick={handleWriteClick}
                            className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-accent hover:text-black transition-all flex items-center space-x-2"
                          >
                            <Plus size={18} />
                            <span>글쓰기</span>
                          </button>
                        </div>
                        {filteredPosts.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {filteredPosts.map((post) => (
                              <div key={post.id} className="group cursor-pointer" onClick={() => setSelectedPost(post)}>
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                                  <img
                                    src={getSafeImageUrl(post.imageUrl || 'https://picsum.photos/seed/post/800/800')}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                                  />
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-accent overflow-hidden flex items-center justify-center font-bold text-[10px]">
                                      {post.authorAvatar || (post.authorId && posts.find(p => p.authorId === post.authorId)?.authorAvatar) ? (
                                        <img 
                                          src={getSafeImageUrl(post.authorAvatar || posts.find(p => p.authorId === post.authorId)?.authorAvatar)} 
                                          alt="" 
                                          className="w-full h-full object-cover" 
                                          referrerPolicy="no-referrer"
                                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                                        />
                                      ) : (
                                        (post.author || 'U')[0].toUpperCase()
                                      )}
                                    </div>
                                    <span className="font-bold text-xs">@{post.author}</span>
                                  </div>
                                  <button 
                                    onClick={(e) => handleLike(e, post.id)}
                                    className={`${post.likedBy?.includes(user?.id || '') ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
                                  >
                                    <Heart size={14} fill={post.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} />
                                  </button>
                                </div>
                                <p className="text-[11px] font-bold text-black line-clamp-1 mb-1">{post.title || post.content}</p>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                                  <div className="flex items-center gap-1">
                                    <Heart size={10} fill={post.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} className={post.likedBy?.includes(user?.id || '') ? 'text-red-500' : ''} />
                                    <span>{post.likes || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle size={10} />
                                    <span>{(post.comments?.length || 0) + (post.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
                            <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">
                              {searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다. 첫 번째 주인공이 되어보세요!'}
                            </p>
                            {!searchQuery && (
                              <button 
                                onClick={handleWriteClick}
                                className="bg-black text-white px-12 py-4 rounded-full font-bold hover:bg-gray-800 transition-all flex items-center space-x-2 mx-auto"
                              >
                                <Plus size={20} />
                                <span>글쓰기</span>
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

        {activeTab === '트렌드' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 font-medium">최신 트렌드 릴스를 확인하고 직접 참여해보세요.</p>
              <button 
                onClick={handleReelClick}
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-accent hover:text-black transition-all flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>새 릴스 올리기</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {trendItems
                .filter(item => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (item.title?.toLowerCase().includes(query)) || (item.content?.toLowerCase().includes(query));
                })
                .map((item) => (
                  <div 
                    key={item.id} 
                    className="relative aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
                    onClick={() => item.videoUrl && window.open(item.videoUrl, '_blank')}
                  >
                    {item.videoUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <video
                        src={item.videoUrl}
                        poster={getSafeImageUrl(item.thumbnail)}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 relative">
                        <img
                          src={getSafeImageUrl(item.thumbnail || item.videoUrl)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                        />
                        <img
                          src={getSafeImageUrl(item.thumbnail || item.videoUrl)}
                          alt={item.title}
                          className="relative max-w-full max-h-full object-contain z-10 opacity-80 group-hover:opacity-100 transition-opacity"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                        />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play size={32} fill="white" className="ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
                    <div className="absolute bottom-6 left-6 right-6 text-white z-30">
                      <div className="flex items-center justify-between mb-4">
                        <div />
                        {(user?.isAdmin || (user?.id && (user.id === item.authorId || user.name === item.author))) && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingReel(item);
                                setIsReelModalOpen(true);
                              }}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTrendItem(item.id);
                              }}
                              className="p-1.5 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-500 rounded-full transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-black line-clamp-2 leading-tight drop-shadow-lg">
                          {item.title}
                        </h3>
                        {item.author && (
                          <p className="text-[10px] text-white/60 font-bold mt-1">
                            @{item.author}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-6">
                        <button 
                          onClick={(e) => handleTrendLike(e, item.id)}
                          className={`flex items-center space-x-2 group/btn ${item.likedBy?.includes(user?.id || '') ? 'text-red-500' : 'text-white'}`}
                        >
                          <Heart size={20} fill={item.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} className="group-hover/btn:text-accent transition-colors" />
                          <span className="text-xs font-bold">{item.likes || 0}</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.href);
                          }}
                          className="flex items-center space-x-2 group/btn"
                        >
                          <Share2 size={20} className="group-hover/btn:text-accent transition-colors" />
                          <span className="text-xs font-bold">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {trendItems.filter(item => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (item.title?.toLowerCase().includes(query)) || (item.content?.toLowerCase().includes(query));
              }).length === 0 && (
                <div className="col-span-full text-center py-32 bg-gray-50 rounded-[3rem]">
                  <p className="text-gray-400 font-bold uppercase tracking-widest">
                    {searchQuery ? '검색 결과가 없습니다.' : '트렌드가 없습니다.'}
                  </p>
                </div>
              )}
            </div>
            </div>
        )}

        {activeTab === '카테고리' && (
          <>
            {selectedCategory ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-black transition-colors font-bold text-sm"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    <span>목록으로</span>
                  </button>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedCategory.name}</h2>
                  <button 
                    onClick={handleWriteClick}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-accent hover:text-black transition-all flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>글쓰기</span>
                  </button>
                </div>

                {isWriting ? (
                  <div className="max-w-2xl mx-auto bg-gray-50 p-12 rounded-[3rem] border border-gray-100">
                    <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">새 게시글 작성</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">제목</label>
                        <input 
                          type="text"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          placeholder="제목을 입력하세요"
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">내용</label>
                        <textarea 
                          rows={6}
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          placeholder="내용을 입력하세요"
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">사진 URL</label>
                        <input 
                          type="text"
                          value={newPost.imageUrl}
                          onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-mono text-xs"
                        />
                      </div>
                      <div className="flex space-x-4 pt-4">
                        <button 
                          onClick={handleSavePost}
                          className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-accent hover:text-black transition-all"
                        >
                          저장하기
                        </button>
                        <button 
                          onClick={() => setIsWriting(false)}
                          className="flex-1 bg-white text-black py-4 rounded-full font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {posts
                      .filter(p => p.category === selectedCategory.name)
                      .filter(p => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (p.title?.toLowerCase().includes(query)) || (p.content?.toLowerCase().includes(query));
                      })
                      .map((post) => (
                      <div key={post.id} className="group cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                          <img
                            src={getSafeImageUrl(post.imageUrl || 'https://picsum.photos/seed/post/800/800')}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-accent overflow-hidden flex items-center justify-center font-bold text-[10px]">
                              {post.authorAvatar || (post.authorId && posts.find(p => p.authorId === post.authorId)?.authorAvatar) ? (
                                <img 
                                  src={getSafeImageUrl(post.authorAvatar || posts.find(p => p.authorId === post.authorId)?.authorAvatar)} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                  onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                                />
                              ) : (
                                (post.author || 'U')[0].toUpperCase()
                              )}
                            </div>
                            <span className="font-bold text-xs">@{post.author}</span>
                          </div>
                          <button 
                            onClick={(e) => handleLike(e, post.id)}
                            className={`${post.likedBy?.includes(user?.id || '') ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
                          >
                            <Heart size={14} fill={post.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <p className="text-[11px] font-bold text-black line-clamp-1 mb-1">{post.title || post.content}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                          <div className="flex items-center gap-1">
                            <Heart size={10} fill={post.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} className={post.likedBy?.includes(user?.id || '') ? 'text-red-500' : ''} />
                            <span>{post.likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={10} />
                            <span>{(post.comments?.length || 0) + (post.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {posts
                      .filter(p => p.category === selectedCategory.name)
                      .filter(p => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (p.title?.toLowerCase().includes(query)) || (p.content?.toLowerCase().includes(query));
                      }).length === 0 && (
                      <div className="col-span-full text-center py-32 bg-gray-50 rounded-[3rem]">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">
                          {searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] hover:bg-gray-100 transition-all group">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-32 rounded-2xl overflow-hidden bg-gray-200">
                        <img 
                          src={getSafeImageUrl(cat.imageUrl || cat.avatar || 'https://picsum.photos/seed/cat/400/600')} 
                          alt={cat.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-black mb-1">{cat.name}</h3>
                        <p className="text-[11px] text-gray-500 mb-3">{cat.description}</p>
                        <div className="flex space-x-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <span>회원 {(cat.members || 0).toLocaleString()}</span>
                          <span>게시글 {(cat.posts || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsWriting(false);
                      }}
                      className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all"
                    >
                      <span>입장</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEntryModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="relative h-48 bg-gray-100">
              <img 
                src={getSafeImageUrl(selectedCategory?.imageUrl)} 
                alt="" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/800/400')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button 
                onClick={() => setShowEntryModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-8">
                <h2 className="text-2xl font-black text-white mb-1">{selectedCategory?.name}</h2>
                <p className="text-white/60 text-xs font-medium">{selectedCategory?.description}</p>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <button 
                onClick={() => setShowEntryModal(false)}
                className="w-full py-4 bg-gray-100 text-black rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                게스트로 입장 (둘러보기만 가능)
              </button>
              <button 
                onClick={() => setShowEntryModal(false)}
                className="w-full py-4 bg-accent text-black rounded-2xl font-black hover:opacity-90 transition-all"
              >
                가입하여 입장
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Post Detail Modal */}
      {currentPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-3 md:gap-4 z-50">
              <button 
                onClick={(e) => handleLike(e, currentPost.id)}
                className={`p-3 md:p-4 rounded-full transition-all flex items-center gap-2 shadow-xl ${currentPost.likedBy?.includes(user?.id || '') ? 'bg-red-500 text-white scale-110' : 'bg-white text-gray-400 hover:text-red-500 hover:scale-105'}`}
                title="좋아요"
              >
                <Heart size={20} className="md:w-6 md:h-6" fill={currentPost.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} />
                <span className="text-xs md:text-sm font-black">{currentPost.likes || 0}</span>
              </button>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-3 md:p-4 bg-black text-white hover:bg-gray-800 rounded-full transition-all shadow-xl hover:scale-105"
                title="닫기"
              >
                <X size={24} className="md:w-7 md:h-7" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent rounded-b-[3rem]">
              <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent overflow-hidden flex items-center justify-center font-bold text-sm">
                    {currentPost.authorAvatar ? (
                      <img 
                        src={getSafeImageUrl(currentPost.authorAvatar)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                      />
                    ) : (
                      (currentPost.author || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold">@{currentPost.author}</p>
                    <p className="text-xs text-gray-400">{new Date(currentPost.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase mb-4">
                {currentPost.title || 'Community Post'}
              </h2>
              <div className="h-px bg-gray-100 w-full" />
            </div>

            {currentPost.imageUrl && (
              <div className="mb-8 rounded-3xl overflow-hidden border border-gray-100">
                <img 
                  src={getSafeImageUrl(currentPost.imageUrl)} 
                  alt="" 
                  className="w-full h-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/800/600')}
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                {currentPost.content}
              </p>
            </div>

            {/* Comments Section */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                <MessageCircle size={24} />
                댓글 <span className="text-accent">{(currentPost.comments?.length || 0) + (currentPost.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0)}</span>
              </h3>

              {/* Comment Input */}
              {user ? (
                <div className="mb-10">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent overflow-hidden flex-shrink-0">
                      <img 
                        src={getSafeImageUrl(user.avatar)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                      />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            if (!commentText.trim()) return;
                            const comment: Comment = {
                              id: Date.now().toString(),
                              author: user.name,
                              authorId: user.id,
                              authorAvatar: user.avatar,
                              content: commentText,
                              createdAt: new Date().toISOString()
                            };
                            addComment(currentPost.id, comment);
                            setCommentText('');
                          }}
                          className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-accent hover:text-black transition-all"
                        >
                          등록
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-10 p-6 bg-gray-50 rounded-2xl text-center">
                  <p className="text-gray-500 text-sm font-bold">로그인 후 댓글을 작성할 수 있습니다.</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-8">
                {currentPost.comments?.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent overflow-hidden flex-shrink-0">
                        <img 
                          src={getSafeImageUrl(comment.authorAvatar)} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">@{comment.author}</span>
                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          {user?.id === comment.authorId && (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                                className="text-gray-400 hover:text-black p-1"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => deleteComment(currentPost.id, comment.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {editingComment === comment.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button 
                                onClick={() => setEditingComment(null)}
                                className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full font-bold text-xs"
                              >
                                취소
                              </button>
                              <button 
                                onClick={() => {
                                  updateComment(currentPost.id, { ...comment, content: editCommentText });
                                  setEditingComment(null);
                                }}
                                className="px-4 py-1.5 bg-black text-white rounded-full font-bold text-xs"
                              >
                                수정
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 leading-relaxed font-medium">{comment.content}</p>
                        )}

                        <div className="mt-2 flex items-center gap-4">
                          <button 
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-[11px] font-bold text-gray-400 hover:text-accent flex items-center gap-1"
                          >
                            <Reply size={12} />
                            답글 달기
                          </button>
                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment.id && user && (
                          <div className="mt-4 pl-4 border-l-2 border-accent">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="답글을 입력하세요..."
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full font-bold text-xs"
                              >
                                취소
                              </button>
                              <button 
                                onClick={() => {
                                  if (!replyText.trim()) return;
                                  const reply: Comment = {
                                    id: Date.now().toString(),
                                    author: user.name,
                                    authorId: user.id,
                                    authorAvatar: user.avatar,
                                    content: replyText,
                                    createdAt: new Date().toISOString()
                                  };
                                  addReply(currentPost.id, comment.id, reply);
                                  setReplyText('');
                                  setReplyingTo(null);
                                }}
                                className="px-4 py-1.5 bg-black text-white rounded-full font-bold text-xs"
                              >
                                등록
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies List */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-accent overflow-hidden flex-shrink-0">
                                  <img 
                                    src={getSafeImageUrl(reply.authorAvatar)} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/100/100')}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs">@{reply.author}</span>
                                      <span className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {user?.id === reply.authorId && (
                                      <button 
                                        onClick={() => {
                                          const updatedReplies = comment.replies?.filter(r => r.id !== reply.id);
                                          updateComment(currentPost.id, { ...comment, replies: updatedReplies });
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <button 
                  onClick={(e) => handleLike(e, currentPost.id)}
                  className={`flex items-center gap-2 transition-colors ${currentPost.likedBy?.includes(user?.id || '') ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart size={20} fill={currentPost.likedBy?.includes(user?.id || '') ? 'currentColor' : 'none'} />
                  <span className="font-bold">{currentPost.likes || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors">
                  <MessageCircle size={20} />
                  <span className="font-bold">{(currentPost.comments?.length || 0) + (currentPost.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0)}</span>
                </button>
                {(user?.isAdmin || (user?.id && (user.id === currentPost.authorId || user.name === currentPost.author))) && (
                  <>
                    <button 
                      onClick={() => {
                        setEditingPost(currentPost);
                        setIsWriting(true);
                        setSelectedPost(null);
                      }}
                      className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
                    >
                      <Edit2 size={20} />
                      <span className="font-bold">수정</span>
                    </button>
                    <button 
                      onClick={() => {
                        deletePost(currentPost.id);
                        setSelectedPost(null);
                      }}
                      className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                      <span className="font-bold">삭제</span>
                    </button>
                  </>
                )}
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-accent hover:text-black transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
      <ReelRegistrationModal 
        isOpen={isReelModalOpen} 
        onClose={() => {
          setIsReelModalOpen(false);
          setEditingReel(null);
        }} 
        editingItem={editingReel}
      />
      {/* LoginModal is handled by Navbar */}
      {/* User Profile Modal */}
      {currentUserProfile && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-8 right-8 p-4 bg-black text-white hover:bg-gray-800 rounded-full transition-all shadow-xl z-50"
            >
              <X size={24} />
            </button>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 border-b border-gray-100 pb-12">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent shadow-xl">
                  {currentUserProfile.avatar ? (
                    <img 
                      src={getSafeImageUrl(currentUserProfile.avatar)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/200/200')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl font-black">
                      {(currentUserProfile.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">@{currentUserProfile.name}</h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">Premium Member</p>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                    <p className="text-gray-600 font-medium leading-relaxed">
                      {currentUserProfile.bio || '안녕하세요! 오타모노 프리미엄 커뮤니티 멤버입니다. 다양한 굿즈와 코스프레 소식을 공유합니다.'}
                    </p>
                  </div>
                  <div className="flex justify-center md:justify-start space-x-12">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Posts</p>
                      <p className="text-2xl font-black">{posts.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Reels</p>
                      <p className="text-2xl font-black">{trendItems.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Likes</p>
                      <p className="text-2xl font-black text-accent">{currentUserProfile.likes || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Content */}
              <div className="space-y-12">
                {/* Posts */}
                {posts.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).length > 0 && (
                  <div>
                    <h3 className="text-xl font-black tracking-tighter uppercase mb-6 flex items-center gap-2">
                      <LayoutGrid size={20} />
                      <span>게시물</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {posts.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).map(post => (
                        <div key={post.id} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group" onClick={() => { setSelectedPost(post); setSelectedUser(null); }}>
                          {post.imageUrl ? (
                            <img 
                              src={getSafeImageUrl(post.imageUrl)} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                              onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/400')}
                            />
                          ) : (
                            <div className="w-full h-full p-4 flex items-center justify-center text-center bg-gray-50 text-gray-400 text-xs font-bold overflow-hidden">
                              {post.content.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reels */}
                {trendItems.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).length > 0 && (
                  <div>
                    <h3 className="text-xl font-black tracking-tighter uppercase mb-6 flex items-center gap-2">
                      <Play size={20} />
                      <span>릴스</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {trendItems.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).map(reel => (
                        <div key={reel.id} className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group relative" onClick={() => { reel.videoUrl && window.open(reel.videoUrl, '_blank'); }}>
                          {(reel.thumbnail || (reel.videoUrl && !reel.videoUrl.endsWith('.mp4'))) ? (
                            <img 
                              src={getSafeImageUrl(reel.thumbnail || reel.videoUrl)} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                              onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                            />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <Play size={48} className="text-white opacity-50" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={32} fill="white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {posts.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).length === 0 && 
                 trendItems.filter(p => (p.authorId && p.authorId === currentUserProfile.id) || p.author === currentUserProfile.name).length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl">
                    <p className="text-gray-400 font-bold uppercase tracking-widest">아직 활동 내역이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
