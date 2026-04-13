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
  const categories = ['전체', '의상', '가발', '소품', '신발', '피규어', '문구/팬시', '인형', '코스프레', '기타'];
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleRows, setVisibleRows] = useState(4);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const itemsPerRow = 4;

  const reviewList = reviews && reviews.length > 0 ? reviews : MOCK_REVIEWS;

  const handleNextReview = () => {
    if (reviewIndex < reviewList.length - 1) {
      setReviewIndex(prev => prev + 1);
    }
  };

  const handlePrevReview = () => {
    if (reviewIndex > 0) {
      setReviewIndex(prev => prev - 1);
    }
  };

  const handleNextCategory = () => {
    if (categoryIndex < categories.length - 3) {
      setCategoryIndex(prev => prev + 1);
    }
  };

  const handlePrevCategory = () => {
    if (categoryIndex > 0) {
      setCategoryIndex(prev => prev - 1);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === '전체' 
      ? products 
      : products.filter(p => p.category === activeCategory);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [products, activeCategory, searchTerm]);

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12 items-center">
          <div className="relative flex items-center w-full lg:col-span-3 group">
            <button 
              onClick={handlePrevCategory}
              disabled={categoryIndex === 0}
              className="absolute left-0 z-10 p-2 bg-white/90 backdrop-blur-sm border-2 border-black rounded-full shadow-lg disabled:opacity-0 transition-all hover:bg-black hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="overflow-hidden w-full px-12">
              <motion.div 
                animate={{ x: `-${categoryIndex * 120}px` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex gap-3 flex-nowrap"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setVisibleRows(4);
                    }}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 whitespace-nowrap ${
                      activeCategory === cat 
                        ? 'bg-black text-white border-black shadow-lg scale-105' 
                        : 'bg-transparent text-black border-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            </div>
            <button 
              onClick={handleNextCategory}
              disabled={categoryIndex >= categories.length - 4}
              className="absolute right-0 z-10 p-2 bg-white/90 backdrop-blur-sm border-2 border-black rounded-full shadow-lg disabled:opacity-0 transition-all hover:bg-black hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="relative w-full lg:col-span-1">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-black" />
            <input 
              type="text" 
              placeholder="상품 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-full bg-white border-4 border-black focus:border-accent focus:ring-4 focus:ring-accent/20 outline-none font-bold transition-all shadow-xl placeholder:text-gray-400"
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
              <button 
                onClick={handlePrevReview}
                disabled={reviewIndex === 0}
                className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextReview}
                disabled={reviewIndex >= reviewList.length - 1}
                className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="relative overflow-hidden scrollbar-hide">
            <motion.div 
              animate={{ x: `-${reviewIndex * 320}px` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex space-x-6 pb-4"
            >
              {reviewList.map((review) => (
                <div key={review.id} className="flex-shrink-0 w-[300px]">
                  <ReviewCard review={review} />
                </div>
              ))}
            </motion.div>
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
