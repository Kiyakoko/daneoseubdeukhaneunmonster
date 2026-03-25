import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { ProductCard, ReviewCard } from '../components/Cards';
import { Search, ShoppingBag, ChevronRight, ChevronLeft, X, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';
import { getSafeImageUrl } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_REVIEWS = [
  { id: '1', imageUrl: 'https://picsum.photos/seed/rev1/400/400', rating: 5, title: '정말 귀여워요!', content: '생각보다 퀄리티가 너무 좋아서 놀랐습니다. 배송도 빠르고 포장도 꼼꼼해요.', author: '김철수' },
  { id: '2', imageUrl: 'https://picsum.photos/seed/rev2/400/400', rating: 4, title: '만족합니다', content: '색감이 화면이랑 똑같아요. 책상 위에 두니까 분위기가 확 사네요.', author: '이영희' },
  { id: '3', imageUrl: 'https://picsum.photos/seed/rev3/400/400', rating: 5, title: '선물용으로 딱!', content: '친구 생일 선물로 샀는데 너무 좋아하네요. 다음에도 이용할게요.', author: '박지민' },
  { id: '4', imageUrl: 'https://picsum.photos/seed/rev4/400/400', rating: 5, title: '최고의 선택', content: '디테일이 살아있습니다. 수집가라면 꼭 사야 할 아이템이에요.', author: '최민수' },
  { id: '5', imageUrl: 'https://picsum.photos/seed/rev5/400/400', rating: 4, title: '좋아요', content: '배송이 조금 늦었지만 상품은 아주 마음에 듭니다.', author: '정다은' },
  { id: '6', imageUrl: 'https://picsum.photos/seed/rev6/400/400', rating: 5, title: '완전 추천', content: '가성비 최고입니다. 이 가격에 이 정도 퀄리티라니 믿기지 않아요.', author: '강호동' },
  { id: '7', imageUrl: 'https://picsum.photos/seed/rev7/400/400', rating: 5, title: '너무 예뻐요', content: '실물이 훨씬 예쁩니다. 다른 시리즈도 모으고 싶어지네요.', author: '유재석' },
  { id: '8', imageUrl: 'https://picsum.photos/seed/rev8/400/400', rating: 4, title: '깔끔해요', content: '마감이 아주 깔끔하고 디자인이 세련됐습니다.', author: '송은이' },
];

export const Shop: React.FC = () => {
  const navigate = useNavigate();
  const { products, config, reviews, addToCart } = useApp();
  const categories = ['전체', '피규어', '문구/팬시', '인형', '코스프레', '기타'];
  const [activeCategory, setActiveCategory] = useState('전체');
  const [visibleRows, setVisibleRows] = useState(4);
  const itemsPerRow = 4;

  const filteredProducts = useMemo(() => {
    const filtered = activeCategory === '전체' 
      ? products 
      : products.filter(p => p.category === activeCategory);
    
    return filtered;
  }, [products, activeCategory]);

  const displayedProducts = filteredProducts.slice(0, visibleRows * itemsPerRow);

  const handleLoadMore = () => {
    setVisibleRows(prev => prev + 4);
  };

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
            <ShoppingBag size={16} className="text-black" />
            <span className="text-xs font-bold tracking-widest uppercase">Premium Shop</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-6">{config.name} 스토어</h1>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleRows(4);
                }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all border-2 whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-black text-white border-black' 
                    : 'bg-transparent text-black border-black hover:bg-black hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="상품 검색..." 
              className="w-full pl-12 pr-6 py-3 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mb-20">
          {displayedProducts.map((product) => (
            <ProductCard 
              key={product.keyId || product.id} 
              product={product} 
              onClick={() => navigate(`/shop/${product.id}`)}
            />
          ))}
        </div>

        {filteredProducts.length > displayedProducts.length && (
          <div className="flex justify-center mb-24">
            <button 
              onClick={handleLoadMore}
              className="px-12 py-4 border-2 border-black rounded-full font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              더보기
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-[3rem] mb-24">
            <p className="text-gray-400 font-bold uppercase tracking-widest">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Photo Review Section */}
        <section className="border-t border-gray-100 pt-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">상품 포토 후기</h2>
              <p className="text-gray-400 font-medium">실제 구매 고객님들의 생생한 후기를 만나보세요.</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
              {(reviews && reviews.length > 0 ? reviews : MOCK_REVIEWS).map((review) => (
                <div key={review.id} className="snap-start">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button className="text-sm font-bold border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
              후기 더보기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
