import React from 'react';
import { useApp } from '../store';
import { User, ShoppingBag, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const MyPage: React.FC = () => {
  const { user, logout, config } = useApp();

  if (!user) {
    return (
      <div className="min-h-screen bg-white py-32 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <User size={40} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">로그인이 필요합니다</h1>
          <p className="text-gray-500">마이페이지를 이용하시려면 먼저 로그인을 해주세요.</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <ShoppingBag size={20} />, label: '주문 내역', description: '최근 주문하신 상품의 배송 상태를 확인하세요.' },
    { icon: <Heart size={20} />, label: '관심 상품', description: '찜한 상품들을 모아볼 수 있습니다.' },
    { icon: <Settings size={20} />, label: '계정 설정', description: '내 프로필과 배송지 정보를 관리하세요.' },
  ];

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col md:flex-row items-center md:items-end justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full border-4 border-accent overflow-hidden shadow-xl">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{user.name}</h1>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Premium Member</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-black text-white rounded-[2.5rem] text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Total Orders</p>
            <p className="text-3xl font-black">12</p>
          </div>
          <div className="p-8 bg-accent text-black rounded-[2.5rem] text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Wishlist</p>
            <p className="text-3xl font-black">48</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-[2.5rem] text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Coupons</p>
            <p className="text-3xl font-black text-black">3</p>
          </div>
        </div>

        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              className="w-full flex items-center justify-between p-8 bg-gray-50 rounded-[2rem] hover:bg-gray-100 transition-all group"
            >
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">{item.label}</h3>
                  <p className="text-xs text-gray-400 font-medium">{item.description}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
            </button>
          ))}
        </div>

        <footer className="mt-16 pt-12 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">
            {config.name}와 함께해주셔서 감사합니다. <br />
            궁금하신 점은 언제든 고객센터로 문의해주세요.
          </p>
        </footer>
      </div>
    </div>
  );
};
