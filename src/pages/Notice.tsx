import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { Megaphone, Calendar, ChevronRight, Pin } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { getSafeImageUrl } from '../utils/imageUtils';
import { useLocation } from 'react-router-dom';

export const Notice: React.FC = () => {
  const { posts } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'Notice' | 'News' | 'Event'>('Notice');
  const [selectedPost, setSelectedPost] = useState<any>(null);

  useEffect(() => {
    if (location.state?.selectedPostId) {
      const post = posts.find(p => p.id === location.state.selectedPostId);
      if (post) {
        setSelectedPost(post);
        setActiveTab(post.category as any);
      }
    }
  }, [location.state, posts]);

  const filteredPosts = posts
    .filter(post => post.category === activeTab)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });

  const tabs = [
    { id: 'Notice', name: 'NOTICE' },
    { id: 'News', name: '뉴스' },
    { id: 'Event', name: '이벤트' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">NOTICE</h1>
          <p className="text-gray-400 font-medium">새로운 소식과 이벤트를 확인하세요</p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "px-8 py-3 rounded-full font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-black text-white shadow-xl shadow-black/10" 
                  : "bg-white text-gray-400 hover:text-black"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedPost(post)}
                className={clsx(
                  "group p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden",
                  post.isPinned 
                    ? "bg-accent/5 border-accent/20" 
                    : "bg-white border-gray-100 hover:border-accent/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    {post.imageUrl ? (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img 
                          src={getSafeImageUrl(post.imageUrl)} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/200/200')}
                        />
                      </div>
                    ) : (
                      <div className="text-center min-w-[60px] flex-shrink-0">
                        <div className="text-xs font-black text-accent uppercase tracking-widest">
                          {new Date(post.date).toLocaleString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-black">
                          {new Date(post.date).getDate()}
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx(
                          "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                          post.category === 'Notice' ? "bg-black text-white" : 
                          post.category === 'Event' ? "bg-accent text-black" : "bg-blue-500 text-white"
                        )}>
                          {post.category === 'Notice' ? 'NOTICE' : post.category === 'Event' ? '이벤트' : '뉴스'}
                        </span>
                        {post.isPinned && (
                          <span className="px-2 py-0.5 rounded-md bg-accent text-white text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                            <Pin size={10} className="fill-white" />
                            PINNED
                          </span>
                        )}
                        <h3 className="font-bold text-lg group-hover:text-accent transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {post.content || '내용이 없습니다.'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-accent transition-all" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">게시글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl max-h-[90vh] overflow-y-auto relative"
          >
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <ChevronRight className="rotate-90" size={24} />
            </button>
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={clsx(
                  "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest",
                  selectedPost.category === 'Notice' ? "bg-black text-white" : 
                  selectedPost.category === 'Event' ? "bg-accent text-black" : "bg-blue-500 text-white"
                )}>
                  {selectedPost.category === 'Notice' ? 'NOTICE' : selectedPost.category === 'News' ? '뉴스' : '이벤트'}
                </span>
                <span className="text-sm text-gray-400 font-bold">
                  {new Date(selectedPost.date).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-6">
                {selectedPost.title}
              </h2>
              <div className="h-px bg-gray-100 w-full" />
            </div>

            {selectedPost.imageUrl && (
              <div className="mb-8 rounded-3xl overflow-hidden border border-gray-100">
                <img 
                  src={getSafeImageUrl(selectedPost.imageUrl)} 
                  alt={selectedPost.title} 
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

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
              <button 
                onClick={() => setSelectedPost(null)}
                className="bg-black text-white px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all shadow-xl shadow-black/10"
              >
                목록으로 돌아가기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
