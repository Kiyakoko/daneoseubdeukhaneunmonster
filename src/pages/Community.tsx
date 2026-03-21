import React from 'react';
import { useApp } from '../store';
import { Plus } from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';

export const Community: React.FC = () => {
  const { posts } = useApp();
  const reels = posts.filter(p => p.type === 'reel');

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-6">커뮤니티</h1>
          <div className="flex space-x-8 border-b border-gray-100">
            <button className="pb-4 text-sm font-bold border-b-4 border-accent">릴스 피드</button>
            <button className="pb-4 text-sm font-bold text-gray-400 hover:text-black transition-colors">포토 게시판</button>
            <button className="pb-4 text-sm font-bold text-gray-400 hover:text-black transition-colors">공지사항</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {reels.map((reel) => (
            <div key={reel.id} className="relative aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
              {reel.videoUrl ? (
                <video
                  src={reel.videoUrl}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black relative">
                  {/* Background Blur Layer */}
                  <img
                    src={getSafeImageUrl(reel.imageUrl)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Main Image Layer */}
                  <img
                    src={getSafeImageUrl(reel.imageUrl)}
                    alt={reel.content}
                    className="relative max-w-full max-h-full object-contain z-10 opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-30">
                <p className="font-bold text-sm mb-2">@{reel.author}</p>
                <p className="text-xs line-clamp-2 text-gray-300">{reel.content}</p>
              </div>
            </div>
          ))}
          
          {/* Add Post Button */}
          <button className="aspect-[9/16] border-4 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:border-accent hover:bg-accent/5 transition-all group">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-accent transition-colors">
              <Plus size={32} className="text-gray-400 group-hover:text-black" />
            </div>
            <span className="text-sm font-bold text-gray-400 group-hover:text-black">새 릴스 올리기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
