import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { Plus, Flame, Trophy, Users, LayoutGrid, Heart, MessageCircle, Crown, ChevronRight, X, Trash2 } from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';

const ANIMATION_CATEGORIES = [
  { id: '1', name: '귀멸의 칼날', description: '혈귀와 맞서 싸우는 귀살대의 이야기', members: 12500, posts: 3400, imageUrl: 'https://picsum.photos/seed/kny/400/600' },
  { id: '2', name: '주술회전', description: '저주를 퇴치하는 주술사들의 사투', members: 10200, posts: 2800, imageUrl: 'https://picsum.photos/seed/jjk/400/600' },
  { id: '3', name: '체인소 맨', description: '악마와 계약한 소년의 파격적인 액션', members: 8900, posts: 1500, imageUrl: 'https://picsum.photos/seed/csm/400/600' },
  { id: '4', name: '스파이 패밀리', description: '스파이, 암살자, 초능력자의 위장 가족', members: 15600, posts: 4200, imageUrl: 'https://picsum.photos/seed/spy/400/600' },
];

export const Community: React.FC = () => {
  const { posts, config, rankings: storeRankings, communityCategories, addPost, deletePost } = useApp();
  const [activeTab, setActiveTab] = useState<'HOT' | '랭킹' | '코스프레' | '카테고리'>('HOT');
  const [visiblePosts, setVisiblePosts] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '' });

  const categories = useMemo(() => {
    if (communityCategories && communityCategories.length > 0) return communityCategories;
    return ANIMATION_CATEGORIES;
  }, [communityCategories]);

  const hotPosts = useMemo(() => {
    return posts.filter(p => p.category === 'HOT').sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [posts]);

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
    return posts.filter(p => p.category === activeTab);
  }, [posts, activeTab]);

  const handleSavePost = () => {
    if (!newPost.content) return;
    
    const post: any = {
      id: Date.now().toString(),
      author: 'User', // Default for now
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
    setIsWriting(false);
    setNewPost({ title: '', content: '', imageUrl: '' });
  };

  const tabs = [
    { id: 'HOT', icon: <Flame size={16} />, label: 'HOT' },
    { id: '랭킹', icon: <Trophy size={16} />, label: '랭킹' },
    { id: '코스프레', icon: <Users size={16} />, label: '코스프레' },
    { id: '카테고리', icon: <LayoutGrid size={16} />, label: '카테고리' },
  ] as const;

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-8">커뮤니티</h1>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {hotPosts.slice(0, visiblePosts).map((post) => (
                <div key={post.id} className="group cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={getSafeImageUrl(post.imageUrl || 'https://picsum.photos/seed/post/800/800')}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center font-bold text-[10px]">
                        {post.author[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-xs">@{post.author}</span>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Heart size={14} />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold line-clamp-2 mb-1">{post.title}</h3>
                </div>
              ))}
            </div>
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
                {rankings.map((user, index) => (
                  <div key={user.name} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-accent transition-all group">
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
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl border-2 border-transparent group-hover:border-accent transition-all">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-accent text-black flex items-center justify-center text-[10px] font-black">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">@{user.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Top Contributor</p>
                      </div>
                    </div>
                    <div className="flex space-x-8 text-right">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Posts</p>
                        <p className="font-black text-lg text-white">{user.posts}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Likes</p>
                        <p className="font-black text-lg text-accent">{user.likes}</p>
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
                    onClick={() => setIsWriting(true)}
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
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center font-bold text-[10px]">
                              {post.author[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-xs">@{post.author}</span>
                          </div>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] font-medium text-gray-500 line-clamp-1">{post.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
                    <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">
                      아직 게시글이 없습니다. 첫 번째 주인공이 되어보세요!
                    </p>
                    <button 
                      onClick={() => setIsWriting(true)}
                      className="bg-black text-white px-12 py-4 rounded-full font-bold hover:bg-gray-800 transition-all flex items-center space-x-2 mx-auto"
                    >
                      <Plus size={20} />
                      <span>글쓰기</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </>
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
                    onClick={() => setIsWriting(true)}
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
                    {posts.filter(p => p.category === selectedCategory.name).map((post) => (
                      <div key={post.id} className="group cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                          <img
                            src={getSafeImageUrl(post.imageUrl || 'https://picsum.photos/seed/post/800/800')}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center font-bold text-[10px]">
                              {post.author[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-xs">@{post.author}</span>
                          </div>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] font-medium text-gray-500 line-clamp-1">{post.content}</p>
                      </div>
                    ))}
                    {posts.filter(p => p.category === selectedCategory.name).length === 0 && (
                      <div className="col-span-full text-center py-32 bg-gray-50 rounded-[3rem]">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">아직 게시글이 없습니다.</p>
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
              <img src={selectedCategory?.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold">
                  {selectedPost.author[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">@{selectedPost.author}</p>
                  <p className="text-xs text-gray-400">{new Date(selectedPost.date).toLocaleDateString()}</p>
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase mb-4">
                {selectedPost.title || 'Community Post'}
              </h2>
              <div className="h-px bg-gray-100 w-full" />
            </div>

            {selectedPost.imageUrl && (
              <div className="mb-8 rounded-3xl overflow-hidden border border-gray-100">
                <img 
                  src={getSafeImageUrl(selectedPost.imageUrl)} 
                  alt="" 
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedPost.content}
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                  <span className="font-bold">{selectedPost.likes || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors">
                  <MessageCircle size={20} />
                  <span className="font-bold">0</span>
                </button>
                {selectedPost.author === 'User' && (
                  <button 
                    onClick={() => {
                      deletePost(selectedPost.id);
                      setSelectedPost(null);
                    }}
                    className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                    <span className="font-bold">삭제</span>
                  </button>
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
      )}
    </div>
  );
};
