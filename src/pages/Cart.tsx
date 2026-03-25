import React from 'react';
import { useApp } from '../store';
import { getSafeImageUrl } from '../utils/imageUtils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { cart, products, updateCartItem, removeFromCart, clearCart } = useApp();

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const selectedItems = cartItems.filter(item => item.selected);
  const totalPrice = selectedItems.reduce((sum, item) => {
    const price = item.product!.price;
    const discount = item.product!.discountRate ? (price * item.product!.discountRate / 100) : 0;
    return sum + (price - discount) * item.quantity;
  }, 0);

  const handleToggleSelect = (id: string, selected: boolean) => {
    const item = cart.find(i => i.id === id);
    if (item) updateCartItem(id, item.quantity, !selected);
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity < 1) {
        if (window.confirm('상품을 장바구니에서 삭제하시겠습니까?')) {
          removeFromCart(id);
        }
      } else {
        updateCartItem(id, newQuantity, item.selected);
      }
    }
  };

  const handleToggleAll = (selected: boolean) => {
    cart.forEach(item => updateCartItem(item.id, item.quantity, selected));
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(item => removeFromCart(item.id));
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h2>
        <p className="text-gray-500 mb-8">원하는 상품을 담아보세요!</p>
        <Link
          to="/shop"
          className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black mb-10">SHOPPING CART</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={cart.every(item => item.selected)}
                onChange={(e) => handleToggleAll(e.target.checked)}
                className="w-5 h-5 accent-black rounded cursor-pointer"
              />
              <span className="font-bold">전체 선택 ({cartItems.length})</span>
            </div>
            <button
              onClick={handleDeleteSelected}
              className="text-gray-500 hover:text-red-500 flex items-center space-x-1 text-sm font-medium"
            >
              <Trash2 size={16} />
              <span>선택 삭제</span>
            </button>
          </div>

          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 pb-6 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => handleToggleSelect(item.id, item.selected)}
                  className="mt-1 w-5 h-5 accent-black rounded cursor-pointer"
                />
                <Link to={`/shop/${item.productId}`} className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getSafeImageUrl(item.product!.imageUrl)}
                    alt={item.product!.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{item.product!.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">{item.product!.category}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-black"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-2 hover:bg-gray-50 text-gray-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-2 hover:bg-gray-50 text-gray-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="text-right">
                      {item.product!.discountRate ? (
                        <div className="flex flex-col items-end">
                          <span className="text-gray-400 line-through text-sm">
                            {(item.product!.price * item.quantity).toLocaleString()}원
                          </span>
                          <span className="font-black text-xl">
                            {((item.product!.price * (1 - item.product!.discountRate / 100)) * item.quantity).toLocaleString()}원
                          </span>
                        </div>
                      ) : (
                        <span className="font-black text-xl">
                          {(item.product!.price * item.quantity).toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-8 sticky top-32">
            <h2 className="text-xl font-bold mb-6">결제 정보</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>총 상품 금액</span>
                <span>{selectedItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>총 할인 금액</span>
                <span>-{selectedItems.reduce((sum, item) => {
                  const discount = item.product!.discountRate ? (item.product!.price * item.product!.discountRate / 100) : 0;
                  return sum + (discount * item.quantity);
                }, 0).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span>0원</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-lg">총 결제 금액</span>
                <span className="font-black text-2xl text-black">{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
            <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 group">
              <span>구매하기 ({selectedItems.length})</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-gray-400 text-xs mt-4">
              무료 배송 및 30일 이내 무료 반품 서비스가 제공됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
