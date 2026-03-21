import React from 'react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/Cards';
import { ReelItem } from '../components/Cards';
import { useApp } from '../store';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShoppingBag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const { products, posts, config } = useApp();
  const featuredProducts = products.slice(0, 3);
  const reels = posts.filter(p => p.type === 'reel').slice(0, 3);

  return (
    <div className="bg-white">
      <Hero />

      {/* Featured Products Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">프리미엄 서비스</h2>
          </div>
          <Link to="/shop" className="group flex items-center space-x-2 text-sm font-bold hover:text-accent transition-colors">
            <span>전체보기</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Community / Reels Section */}
      <section className="py-24 bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">최신 트렌드 릴스</h2>
            </div>
            <Link to="/reels" className="group flex items-center space-x-2 text-sm font-bold hover:text-accent transition-colors">
              <span>더 많은 릴스 보기</span>
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

      {/* Newsletter / CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-accent rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <Sparkles size={48} className="mx-auto mb-8 text-black" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8 uppercase">
              디자인의 미래를 <br /> 함께 그리다
            </h2>
            <p className="text-lg font-medium mb-10 text-black/70">
              {config.name}의 뉴스레터를 구독하고 최신 디자인 트렌드와 독점 혜택을 가장 먼저 확인하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="이메일 주소를 입력하세요" 
                className="flex-1 px-6 py-4 rounded-full bg-white border-none focus:ring-2 focus:ring-black outline-none font-medium"
              />
              <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all">
                구독하기
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
