import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../store';
import { motion } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2, 
  ShieldCheck, Truck, RotateCcw, Star,
  Plus, Minus, MessageSquare
} from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { ProductCard } from '../components/Cards';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, addToCart, config, wishlist, toggleWishlist, user, setIsLoginModalOpen } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'reviews' | 'shipping'>('detail');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const product = products.find(p => p.id === id);
  const allImages = product ? [product.imageUrl, ...(product.detailImages || [])] : [];

  const handleNextImage = () => {
    if (!activeImage) return;
    const currentIndex = allImages.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!activeImage) return;
    const currentIndex = allImages.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIndex]);
  };

  const isBookmarked = wishlist.includes(id || '');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setActiveImage(product.imageUrl);
    }
  }, [id, product]);

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

        <div className="flex flex-col lg:flex-row gap-16 mb-24">
          {/* Product Info (Left on Desktop, Top on Mobile) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-black uppercase tracking-widest">
                  {product.premiumLabel || 'PREMIUM'}
                </span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-[1.1]">
                {product.name}
              </h1>
              
              <p className="text-xl text-gray-500 font-medium mb-10 leading-relaxed max-w-2xl">
                {product.description || '이 상품에 대한 상세 설명이 아직 준비되지 않았습니다. 프리미엄 퀄리티를 자랑하는 오타모노의 엄선된 굿즈를 만나보세요.'}
              </p>

              <div className="flex flex-col space-y-2 mb-12">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">최근 거래가</span>
                <div className="flex items-baseline space-x-4">
                  <span className="text-5xl font-black">₩{product.price.toLocaleString()}</span>
                  {product.discountRate && (
                    <span className="text-2xl text-red-500 font-bold">
                      -{product.discountRate}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
              <div className="flex flex-col space-y-4 mb-12">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      if (!user) {
                        alert('로그인이 필요합니다.');
                        setIsLoginModalOpen(true);
                        return;
                      }
                      addToCart(product.id);
                      alert('장바구니에 추가되었습니다.');
                    }}
                    className="flex-1 h-24 bg-black text-white rounded-[2rem] font-black text-xl flex items-center justify-center space-x-4 hover:bg-accent hover:text-black transition-all shadow-2xl shadow-black/20 group"
                  >
                    <ShoppingCart size={28} className="group-hover:scale-110 transition-transform" />
                    <span>구매하기</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (!user) {
                        alert('로그인이 필요합니다.');
                        setIsLoginModalOpen(true);
                        return;
                      }
                      toggleWishlist(product.id);
                    }}
                    className={`w-24 h-24 rounded-[2rem] border-2 flex items-center justify-center transition-all ${
                      isBookmarked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'
                    }`}
                  >
                    <Heart size={32} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-6 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:bg-white transition-all">
                <ShieldCheck size={24} className="text-accent mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-tighter">100% 정품</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:bg-white transition-all">
                <Truck size={24} className="text-accent mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-tighter">빠른 배송</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:bg-white transition-all">
                <RotateCcw size={24} className="text-accent mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-tighter">안심 환불</span>
              </div>
            </div>
          </motion.div>

          {/* Product Image (Right on Desktop) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:w-[500px] flex-shrink-0"
          >
            <div className="sticky top-32 space-y-6">
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-xl group/main">
                <img 
                  src={getSafeImageUrl(activeImage || product.imageUrl)} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/800/1000')}
                />
                
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover/main:opacity-100 transition-all hover:bg-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover/main:opacity-100 transition-all hover:bg-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
                      {allImages.map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${
                            allImages.indexOf(activeImage || product.imageUrl) === i ? 'bg-black w-6' : 'bg-black/20'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveImage(product.imageUrl)}
                  className={`aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                    activeImage === product.imageUrl || !activeImage ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={getSafeImageUrl(product.imageUrl)} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/400')}
                  />
                </div>
                {product.detailImages?.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                      activeImage === img ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={getSafeImageUrl(img)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/400/400')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mb-24">
          <div className="flex space-x-12 border-b border-gray-100 mb-12">
            {[
              { id: 'detail', label: '상세정보', icon: <Plus size={16} /> },
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
                className="max-w-4xl mx-auto"
              >
                <div className="mb-24">
                  <h3 className="text-2xl font-black tracking-tighter uppercase mb-8 border-b-2 border-black pb-4 inline-block">
                    {product.premiumLabel || config.premiumLabel || 'Product Details'}
                  </h3>
                  <div className="text-gray-600 font-medium leading-[1.8] text-lg whitespace-pre-wrap mb-8">
                    {product.detailInfo || `
                      오타모노의 모든 상품은 엄격한 품질 검사를 거쳐 선별됩니다. 
                      디테일 하나하나 살아있는 고퀄리티 상품으로 당신의 컬렉션을 완성해보세요.
                    `}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {(product.premiumFeatures || ['고급 소재 사용', '정밀한 디테일 구현', '안전한 패키징', '공식 라이선스 인증']).map((item, i) => (
                      <div key={i} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-black" />
                        <span className="text-base font-bold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-12 mt-12 pt-12 border-t border-gray-100 max-w-lg mx-auto">
                  {(product.detailImages && product.detailImages.length > 0) ? (
                    product.detailImages.map((img, idx) => (
                      <div key={idx} className="rounded-[2rem] overflow-hidden bg-gray-50 shadow-sm">
                        <img 
                          src={getSafeImageUrl(img)} 
                          alt={`Detail ${idx + 1}`} 
                          className="w-full h-auto object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/800/1200')}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[2rem] overflow-hidden bg-gray-50 shadow-sm">
                      <img 
                        src={getSafeImageUrl(product.imageUrl)} 
                        alt="Detail" 
                        className="w-full h-auto object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/800/1200')}
                      />
                    </div>
                  )}
                </div>
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
