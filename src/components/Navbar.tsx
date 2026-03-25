import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LayoutDashboard, Share2, LogOut, ShoppingBag, Heart } from 'lucide-react';
import { useApp } from '../store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LoginModal } from './LoginModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar: React.FC = () => {
  const { config, user, logout, cart, products, wishlist } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/shop' },
    { name: '커뮤니티', path: '/community' },
    { name: '트렌드', path: '/trend' },
    { name: '공지사항', path: '/notice' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        {/* Top Utility Bar (KREAM Style) */}
        <div className="hidden md:block border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-10 items-center space-x-6 text-[11px] text-gray-400 font-medium">
              <Link to="/support" className="hover:text-black">고객센터</Link>
              <Link to="/mypage" className="hover:text-black">마이페이지</Link>
              <Link to="/wishlist" className="hover:text-black">관심상품</Link>
              <Link to="/notifications" className="hover:text-black">알림</Link>
              {user ? (
                <button onClick={logout} className="hover:text-black">로그아웃</button>
              ) : (
                <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-black">로그인</button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-black">
                {config.name}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-[15px] font-bold transition-colors hover:underline underline-offset-8 decoration-2",
                    location.pathname === link.path ? "text-black" : "text-gray-800"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/sell"
                className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-black hover:opacity-80 transition-all"
                title="판매 신청"
              >
                <ShoppingBag size={18} />
              </Link>
            </div>

            {/* Icons & My Page */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/wishlist" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                <Heart size={24} className="text-black" />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                <ShoppingCart size={24} className="text-black" />
                {cart.filter(item => products.some(p => p.id === item.productId)).length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.filter(item => products.some(p => p.id === item.productId)).length}
                  </span>
                )}
              </Link>
              <Link 
                to="/mypage" 
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <User size={24} className="text-black" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-md text-lg font-bold",
                    location.pathname === link.path ? "text-black" : "text-gray-500"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/sell"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-lg font-bold text-black"
              >
                <span className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <ShoppingBag size={24} />
                </span>
                <span>판매 신청</span>
              </Link>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex space-x-4">
                <Link to="/wishlist" onClick={() => setIsOpen(false)} className="p-3 bg-gray-50 rounded-full relative">
                  <Heart size={24} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" onClick={() => setIsOpen(false)} className="p-3 bg-gray-50 rounded-full relative">
                  <ShoppingCart size={24} />
                  {cart.filter(item => products.some(p => p.id === item.productId)).length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cart.filter(item => products.some(p => p.id === item.productId)).length}
                    </span>
                  )}
                </Link>
                {user ? (
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-accent" />
                    <span className="text-sm font-bold">{user.name}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="p-3 bg-gray-50 rounded-full"
                  >
                    <User size={24} />
                  </button>
                )}
              </div>
              {user && (
                <button 
                  onClick={logout}
                  className="p-3 text-gray-400 hover:text-red-500"
                >
                  <LogOut size={24} />
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
