import React from 'react';
import { useApp } from '../store';
import { getSafeImageUrl } from '../utils/imageUtils';
import { Plus, Play, Heart, Share2 } from 'lucide-react';

export const Trend: React.FC = () => {
  const { trendItems, updateTrendItem } = useApp();

  return (
    <div className="min-h-screen bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-6">트렌드</h1>
          <p className="text-gray-400 font-medium">최신 트렌드 릴스를 확인하고 직접 참여해보세요.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {trendItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => item.videoUrl && window.open(item.videoUrl, '_blank')}
              className="relative aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
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
                  />
                  <img
                    src={getSafeImageUrl(item.thumbnail || item.videoUrl)}
                    alt={item.title}
                    className="relative max-w-full max-h-full object-contain z-10 opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
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
                <p className="font-bold text-sm mb-4">@{item.author || 'Admin'}</p>
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const isLiked = false; // Local state would be better but for now just simple increment
                      updateTrendItem({
                        ...item,
                        likes: (item.likes || 0) + 1
                      });
                    }}
                    className="flex items-center space-x-2 group/btn"
                  >
                    <Heart size={20} className="group-hover/btn:text-accent transition-colors" />
                    <span className="text-xs font-bold">{item.likes || 0}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(window.location.href);
                      alert('링크가 복사되었습니다.');
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
          
          {/* Add Reel Button */}
          <button className="aspect-[9/16] border-4 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:border-accent hover:bg-accent/5 transition-all group">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center group-hover:bg-accent transition-colors">
              <Plus size={32} className="text-zinc-600 group-hover:text-black" />
            </div>
            <span className="text-sm font-bold text-zinc-600 group-hover:text-black">새 릴스 올리기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
