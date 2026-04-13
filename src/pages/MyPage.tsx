import React from 'react';
import { useApp } from '../store';
import { User, ShoppingBag, Heart, Settings, LogOut, ChevronRight, PackagePlus, FilePlus, ListOrdered, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductRegistrationModal, CommunityRegistrationModal } from '../components/RegistrationModals';
import { Link } from 'react-router-dom';
import { getSafeImageUrl } from '../utils/imageUtils';

export const MyPage: React.FC = () => {
  const { user, logout, config, updateConfig, updateUserProfile, addTrendItem, wishlist, posts, trendItems } = useApp();
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = React.useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = React.useState(false);
  const [isTrendModalOpen, setIsTrendModalOpen] = React.useState(false);

  const [nickname, setNickname] = React.useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar || '');
  const [bio, setBio] = React.useState(user?.bio || '');

  const [trendTitle, setTrendTitle] = React.useState('');
  const [trendVideoUrl, setTrendVideoUrl] = React.useState('');
  const [trendThumbnailUrl, setTrendThumbnailUrl] = React.useState('');

  const userPosts = React.useMemo(() => {
    if (!user) return [];
    return posts.filter(p => p.authorId === user.id);
  }, [posts, user]);

  const handleAddTrend = async () => {
    if (!trendTitle || !trendVideoUrl || !trendThumbnailUrl) return;
    
    const newItem = {
      id: `trend-${Date.now()}`,
      title: trendTitle,
      videoUrl: trendVideoUrl,
      thumbnailUrl: trendThumbnailUrl,
      author: user.name,
      authorId: user.id,
      authorAvatar: user.avatar,
      likes: 0,
      order: trendItems.length
    };

    await addTrendItem(newItem);
    setTrendTitle('');
    setTrendVideoUrl('');
    setTrendThumbnailUrl('');
    setIsTrendModalOpen(false);
  };

  React.useEffect(() => {
    if (user) {
      setNickname(user.name || '');
      setAvatarUrl(user.avatar || '');
      setBio(user.bio || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white py-32 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <User size={40} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">로그인이 필요합니다</h1>
          <p className="text-gray-500">마이페이지를 이용하시려면 먼저 로그인을 해주세요.</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <ShoppingBag size={20} />, label: '주문 내역', description: '최근 주문하신 상품의 배송 상태를 확인하세요.' },
    { icon: <Heart size={20} />, label: '관심 상품', description: '찜한 상품들을 모아볼 수 있습니다.', path: '/wishlist' },
    { icon: <Settings size={20} />, label: '계정 설정', description: '내 프로필과 배송지 정보를 관리하세요.', onClick: () => setIsAccountSettingsOpen(true) },
    { icon: <PackagePlus size={20} />, label: '트렌드 추가', description: '새로운 트렌드 영상을 등록하세요.', onClick: () => setIsTrendModalOpen(true) },
    { icon: <FilePlus size={20} />, label: '커뮤니티 등록', description: '새로운 글을 커뮤니티에 등록하세요.', onClick: () => setIsCommunityModalOpen(true) },
  ];

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col md:flex-row items-center md:items-end justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full border-4 border-accent overflow-hidden shadow-xl">
              <img 
                src={getSafeImageUrl(user.avatar)} 
                alt={user.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://picsum.photos/seed/avatar/200/200';
                }}
              />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{user.name}</h1>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-1">{user.email}</p>
              <p className="text-accent font-black text-[10px] uppercase tracking-[0.2em] mb-3">{user.roleLabel || 'Premium Member'}</p>
              {user.bio && (
                <p className="text-gray-500 text-sm font-medium max-w-md leading-relaxed">{user.bio}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => setIsAccountSettingsOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-accent hover:text-black transition-all"
            >
              <Settings size={16} />
              <span>프로필 수정</span>
            </button>
            <button 
              onClick={logout}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
            >
              <LogOut size={16} />
              <span>로그아웃</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-gray-50 rounded-[2.5rem] text-center border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Total Orders</p>
            <p className="text-3xl font-black">12</p>
          </div>
          <Link to="/wishlist" className="p-8 bg-accent text-black rounded-[2.5rem] text-center hover:scale-105 transition-transform shadow-lg shadow-accent/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Wishlist</p>
            <p className="text-3xl font-black">{wishlist.length}</p>
          </Link>
          <div className="p-8 bg-gray-50 rounded-[2.5rem] text-center border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Coupons</p>
            <p className="text-3xl font-black text-black">3</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <ListOrdered size={20} className="text-accent" />
                  최근 활동
                </h2>
              </div>
              <div className="space-y-4">
                {userPosts.length > 0 ? (
                  userPosts.slice(0, 3).map(post => (
                    <div key={post.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{post.category}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
                        <span>조회 {post.views}</span>
                        <span>추천 {post.likes}</span>
                        <span>댓글 {post.comments?.length || 0}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 bg-gray-50 rounded-[2rem] text-center border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">최근 활동 내역이 없습니다.</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <ShoppingBag size={20} className="text-accent" />
                  메뉴 바로가기
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menuItems.map((item, index) => {
                  const content = (
                    <div className="flex items-center space-x-4 p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-lg transition-all group h-full">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-sm">{item.label}</h3>
                        <p className="text-[10px] text-gray-400 font-medium leading-tight">{item.description}</p>
                      </div>
                    </div>
                  );

                  if (item.path) {
                    return (
                      <Link key={index} to={item.path} className="block">
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button 
                      key={index}
                      onClick={item.onClick}
                      className="w-full block"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <h3 className="text-lg font-black uppercase tracking-tight mb-6 relative z-10">계정 정보</h3>
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">가입일</p>
                  <p className="font-bold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '기록 없음'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">최근 접속</p>
                  <p className="font-bold">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '기록 없음'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">로그인 방식</p>
                  <p className="font-bold uppercase">{user.loginMethod === 'google' ? 'Google 계정' : '이메일 가입'}</p>
                </div>
              </div>
            </section>

            <section className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
              <h3 className="text-lg font-black uppercase tracking-tight mb-6">고객 지원</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-white rounded-2xl text-sm font-bold hover:bg-black hover:text-white transition-all flex justify-between items-center">
                  <span>1:1 문의하기</span>
                  <ChevronRight size={16} />
                </button>
                <button className="w-full text-left p-4 bg-white rounded-2xl text-sm font-bold hover:bg-black hover:text-white transition-all flex justify-between items-center">
                  <span>자주 묻는 질문</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-16 pt-12 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">
            {config.name}와 함께해주셔서 감사합니다. <br />
            궁금하신 점은 언제든 고객센터로 문의해주세요.
          </p>
        </footer>

        <ProductRegistrationModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
        <CommunityRegistrationModal isOpen={isCommunityModalOpen} onClose={() => setIsCommunityModalOpen(false)} />
        
        <AnimatePresence>
          {isAccountSettingsOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAccountSettingsOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">계정 설정</h2>
                  <button onClick={() => setIsAccountSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-accent overflow-hidden shadow-lg mb-4 bg-gray-100">
                      {avatarUrl ? (
                        <img 
                          src={getSafeImageUrl(avatarUrl)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/seed/avatar/200/200';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-xs">No Image</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">닉네임</label>
                    <input 
                      type="text" 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                      placeholder="닉네임을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">프로필 사진 URL</label>
                    <input 
                      type="text" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-sm"
                      placeholder="이미지 URL을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">상점 소개</label>
                    <textarea 
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium text-sm"
                      placeholder="상점 소개를 입력하세요"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button 
                      onClick={() => setIsAccountSettingsOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      취소
                    </button>
                    <button 
                      onClick={async () => {
                        // Update Profile
                        await updateUserProfile({
                          name: nickname,
                          avatar: avatarUrl,
                          bio: bio
                        });

                        setIsAccountSettingsOpen(false);
                        alert('설정이 저장되었습니다.');
                      }}
                      className="flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-accent hover:text-black transition-all"
                    >
                      저장하기
                    </button>
                  </div>

                  <div className="pt-8 border-t border-gray-100 mt-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4">위험 구역</h3>
                    <button 
                      onClick={() => {
                        if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                          alert('계정 삭제 요청이 접수되었습니다. 보안을 위해 관리자 승인 후 처리됩니다.');
                        }
                      }}
                      className="w-full py-4 border border-red-200 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all"
                    >
                      계정 삭제하기
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Trend Add Modal */}
        <AnimatePresence>
          {isTrendModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTrendModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden"
              >
                <button 
                  onClick={() => setIsTrendModalOpen(false)}
                  className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">트렌드 추가</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">제목</label>
                    <input 
                      type="text"
                      value={trendTitle}
                      onChange={(e) => setTrendTitle(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all font-bold"
                      placeholder="트렌드 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">영상 URL</label>
                    <input 
                      type="text"
                      value={trendVideoUrl}
                      onChange={(e) => setTrendVideoUrl(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all font-bold"
                      placeholder="YouTube 등 영상 URL을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">썸네일 URL</label>
                    <input 
                      type="text"
                      value={trendThumbnailUrl}
                      onChange={(e) => setTrendThumbnailUrl(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all font-bold"
                      placeholder="썸네일 이미지 URL을 입력하세요"
                    />
                  </div>

                  <button 
                    onClick={handleAddTrend}
                    className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                    저장하기
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ProductRegistrationModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
        <CommunityRegistrationModal isOpen={isCommunityModalOpen} onClose={() => setIsCommunityModalOpen(false)} />
      </div>
    </div>
  );
};
