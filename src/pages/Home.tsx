import React from 'react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/Cards';
import { ReelItem } from '../components/Cards';
import { useApp } from '../store';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShoppingBag, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { getSafeImageUrl } from '../utils/imageUtils';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { products, posts, config, trendItems } = useApp();
  const featuredProducts = products.slice(0, 3);
  const reels = trendItems.slice(0, 3);
  
  const hotPosts = posts
    .filter(post => post.category === 'HOT')
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 4);

  const cosplayPosts = posts
    .filter(post => post.category === '코스프레')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 4);

  const latestNotices = posts
    .filter(post => ['Notice', 'News', 'Event'].includes(post.category))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);

  return (
    <div className="bg-white">
      <Hero />

      {/* Featured Products Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">Premium Shop</h2>
          </div>
          <Link to="/shop" className="group flex items-center space-x-2 text-sm font-bold hover:text-accent transition-colors">
            <span>전체보기</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => navigate(`/shop/${product.id}`, { state: { fromPremium: true } })}
            />
          ))}
        </div>
      </section>

      {/* HOT Section */}
      {hotPosts.length > 0 && (
        <section className="py-24 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase">HOT</h2>
              </div>
              <Link to="/community" state={{ activeTab: 'HOT' }} className="group flex items-center space-x-2 text-sm font-bold hover:text-accent transition-colors">
                <span>전체보기</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {hotPosts.map((post) => (
                <div key={post.id} className="group cursor-pointer" onClick={() => navigate('/community', { state: { activeTab: 'HOT' } })}>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 mb-3">
                    <img 
                      src={getSafeImageUrl(post.imageUrl)} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                    />
                  </div>
                  <h3 className="font-bold text-sm line-clamp-1">{post.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cosplay Section */}
      {cosplayPosts.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase">코스프레</h2>
              </div>
              <Link to="/community" state={{ activeTab: '코스프레' }} className="group flex items-center space-x-2 text-sm font-bold hover:text-accent transition-colors">
                <span>전체보기</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {cosplayPosts.map((post) => (
                <div key={post.id} className="group cursor-pointer" onClick={() => navigate('/community', { state: { activeTab: '코스프레' } })}>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 mb-3">
                    <img 
                      src={getSafeImageUrl(post.imageUrl)} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/600')}
                    />
                  </div>
                  <h3 className="font-bold text-sm line-clamp-1">{post.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community / Trend Section */}
      <section className="py-24 bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">최신 트렌드</h2>
            </div>
            <Link 
              to="/community" 
              state={{ activeTab: '트렌드' }}
              className="group flex items-center space-x-2 text-sm font-bold hover:text-accent transition-colors"
            >
              <span>더 많은 트렌드 보기</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reels.map((reel) => (
              <ReelItem key={reel.id} post={reel} />
            ))}
          </div>
        </div>
      </section>

      {/* Notice Section */}
      {latestNotices.length > 0 && (
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Sparkles className="text-accent" size={24} />
                <h2 className="text-2xl font-black tracking-tighter uppercase">NOTICE & News</h2>
              </div>
              <Link to="/notice" className="text-sm font-bold hover:text-accent transition-colors flex items-center space-x-1">
                <span>전체보기</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNotices.map((post) => (
                <Link 
                  to="/notice" 
                  state={{ selectedPostId: post.id }}
                  key={post.id} 
                  className="bg-white rounded-3xl border border-gray-100 hover:border-accent/30 transition-all group overflow-hidden flex flex-col"
                >
                  {post.imageUrl && (
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img 
                        src={getSafeImageUrl(post.imageUrl)} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/225')}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                        post.category === 'Notice' ? "bg-black text-white" : 
                        post.category === 'Event' ? "bg-accent text-black" : "bg-blue-500 text-white"
                      )}>
                        {post.category === 'Notice' ? 'NOTICE' : post.category === 'Event' ? '이벤트' : '뉴스'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-accent transition-colors line-clamp-1 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 font-medium">
                      {post.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
