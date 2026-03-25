import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store';
import { motion } from 'motion/react';
import { Heart, ShoppingCart, ChevronLeft, Trash2 } from 'lucide-react';
import { ProductCard } from '../components/Cards';

export const Wishlist: React.FC = () => {
  const { wishlist, products, toggleWishlist, addToCart } = useApp();
  const navigate = useNavigate();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Wishlist</h1>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <Heart size={64} className="mx-auto text-gray-200 mb-6" />
            <h2 className="text-xl font-bold text-gray-400 mb-8 uppercase tracking-widest">위시리스트가 비어있습니다.</h2>
            <Link 
              to="/shop" 
              className="inline-block px-12 py-4 bg-black text-white rounded-full font-black hover:bg-accent hover:text-black transition-all"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {wishlistProducts.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard 
                  product={product} 
                  onClick={() => navigate(`/shop/${product.id}`)}
                />
                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="p-3 bg-white rounded-full shadow-xl text-red-500 hover:bg-red-50 transition-all"
                    title="위시리스트에서 제거"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                      alert('장바구니에 추가되었습니다.');
                    }}
                    className="p-3 bg-black rounded-full shadow-xl text-white hover:bg-accent hover:text-black transition-all"
                    title="장바구니에 추가"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
