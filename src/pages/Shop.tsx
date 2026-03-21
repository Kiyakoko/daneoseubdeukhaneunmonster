import React from 'react';
import { useApp } from '../store';
import { ProductCard } from '../components/Cards';
import { Search, ShoppingBag } from 'lucide-react';

export const Shop: React.FC = () => {
  const { products, config } = useApp();
  const categories = ['전체', '디자인', '도서', '패키지'];
  const [activeCategory, setActiveCategory] = React.useState('전체');

  const filteredProducts = activeCategory === '전체' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
            <ShoppingBag size={16} className="text-black" />
            <span className="text-xs font-bold tracking-widest uppercase">Premium Shop</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-6">{config.name} 스토어</h1>
          <p className="text-gray-400 max-w-xl mx-auto font-medium">
            당신의 브랜드를 완성할 프리미엄 디자인 서비스와 엄선된 리소스를 만나보세요.
          </p>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-black text-white shadow-xl' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="상품 검색..." 
              className="w-full pl-12 pr-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-[3rem]">
            <p className="text-gray-400 font-bold uppercase tracking-widest">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
