import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../store';
import { motion } from 'motion/react';
import { 
  ChevronLeft, ShoppingCart, Heart, Share2, 
  ShieldCheck, Truck, RotateCcw, Star,
  Plus, Minus, MessageSquare
} from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { ProductCard } from '../components/Cards';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, addToCart, config, wishlist, toggleWishlist } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'reviews' | 'shipping'>('detail');

  const product = products.find(p => p.id === id);
  const isBookmarked = wishlist.includes(id || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다.</h2>
        <button 
          onClick={() => navigate('/shop')}
          className="px-8 py-3 bg-black text-white rounded-full font-bold"
        >
          쇼핑몰로 돌아가기
        </button>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const safeImageUrl = getSafeImageUrl(product.imageUrl);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Back */}
        <div className="mb-12 flex items-center justify-between">
          <button 
            onClick={() => {
              if (location.state?.fromPremium) {
                navigate('/');
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center space-x-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
            <span>뒤로가기</span>
          </button>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-black">Shop</Link>
            <span>/</span>
            <span className="text-black">{product.category}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100"
          >
            <img 
              src={safeImageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.discountRate && (
              <div className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-2xl font-black text-lg shadow-xl">
                {product.discountRate}% OFF
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} 
                      className={i < Math.floor(product.rating || 5) ? "" : "text-gray-200"}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-400">({product.rating || 5.0} / {product.reviewCount || 128} Reviews)</span>
              </div>
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-black">₩{product.price.toLocaleString()}</span>
                {product.discountRate && (
                  <span className="text-xl text-gray-300 line-through font-bold">
                    ₩{(product.price / (1 - product.discountRate / 100)).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed mb-12 font-medium">
              {product.description || '이 상품에 대한 상세 설명이 아직 준비되지 않았습니다. 프리미엄 퀄리티를 자랑하는 오타모노의 엄선된 굿즈를 만나보세요.'}
            </p>

            {/* Options & Quantity */}
            <div className="space-y-8 mb-12">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">수량 선택</span>
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-xl font-black w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mb-12">
              <button 
                onClick={() => {
                  for(let i = 0; i < quantity; i++) {
                    addToCart(product.id);
                  }
                  alert('장바구니에 추가되었습니다.');
                }}
                className="flex-1 h-20 bg-black text-white rounded-full font-black text-lg flex items-center justify-center space-x-3 hover:bg-accent hover:text-black transition-all shadow-2xl shadow-black/20"
              >
                <ShoppingCart size={24} />
                <span>장바구니 담기</span>
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                  isBookmarked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                <Heart size={28} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <ShieldCheck size={20} className="text-accent mb-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter">정품 보증</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Truck size={20} className="text-accent mb-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter">무료 배송</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <RotateCcw size={20} className="text-accent mb-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter">7일 환불</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mb-24">
          <div className="flex space-x-12 border-b border-gray-100 mb-12">
            {[
              { id: 'detail', label: '상세정보', icon: <Plus size={16} /> },
              { id: 'reviews', label: '구매후기', icon: <Star size={16} /> },
              { id: 'shipping', label: '배송/교환/반품', icon: <Truck size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-6 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${
                  activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-300 hover:text-black'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'detail' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-lg max-w-none"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase mb-6">{product.premiumLabel || config.premiumLabel || 'Premium Quality'}</h3>
                    <div className="text-gray-500 font-medium leading-relaxed mb-8 whitespace-pre-wrap">
                      {product.detailInfo || `
                        오타모노의 모든 상품은 엄격한 품질 검사를 거쳐 선별됩니다. 
                        디테일 하나하나 살아있는 고퀄리티 상품으로 당신의 컬렉션을 완성해보세요.
                      `}
                    </div>
                    <ul className="space-y-4">
                      {(product.premiumFeatures || ['고급 소재 사용', '정밀한 디테일 구현', '안전한 패키징', '공식 라이선스 인증']).map((item, i) => (
                        <li key={i} className="flex items-center space-x-3 text-sm font-bold">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    {(product.detailImages && product.detailImages.length > 0) ? (
                      product.detailImages.map((img, idx) => (
                        <div key={idx} className="rounded-[2rem] overflow-hidden bg-gray-100 aspect-square">
                          <img 
                            src={getSafeImageUrl(img)} 
                            alt={`Detail ${idx + 1}`} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[2rem] overflow-hidden bg-gray-100 aspect-square">
                        <img 
                          src={getSafeImageUrl(product.imageUrl)} 
                          alt="Detail" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Customer Reviews</h3>
                    <p className="text-gray-400 text-sm font-bold">실제 구매 고객님들의 소중한 후기입니다.</p>
                  </div>
                </div>
                
                {product.reviewContent ? (
                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 whitespace-pre-wrap font-medium text-gray-600">
                    {product.reviewContent}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-gray-50 rounded-[3rem]">
                    <p className="text-gray-400 font-bold uppercase tracking-widest">등록된 구매후기가 없습니다.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100"
              >
                {product.shippingInfo ? (
                  <div className="whitespace-pre-wrap font-medium text-gray-600">
                    {product.shippingInfo}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center space-x-2">
                        <Truck size={20} className="text-accent" />
                        <span>배송 안내</span>
                      </h4>
                      <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li>• 배송 방법: CJ대한통운 (전국 배송)</li>
                        <li>• 배송 비용: 3,000원 (50,000원 이상 구매 시 무료배송)</li>
                        <li>• 배송 기간: 결제 완료 후 2~5일 이내 (영업일 기준)</li>
                        <li>• 도서 산간 지역은 추가 배송비가 발생할 수 있습니다.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center space-x-2">
                        <RotateCcw size={20} className="text-accent" />
                        <span>교환 및 반품 안내</span>
                      </h4>
                      <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li>• 상품 수령 후 7일 이내에 신청 가능합니다.</li>
                        <li>• 단순 변심에 의한 교환/반품은 왕복 배송비가 발생합니다.</li>
                        <li>• 상품 가치가 훼손된 경우 교환/반품이 불가할 수 있습니다.</li>
                        <li>• 오배송 및 불량 상품의 경우 배송비는 오타모노가 부담합니다.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Related Items</h2>
              <Link to="/shop" className="text-sm font-bold hover:text-accent transition-colors">전체보기</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onClick={() => navigate(`/shop/${p.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
