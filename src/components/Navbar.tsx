import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LayoutDashboard, Share2, LogOut } from 'lucide-react';
import { useApp } from '../store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LoginModal } from './LoginModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar: React.FC = () => {
  const { config, user, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'SHOP', path: '/shop' },
    { name: '커뮤니티', path: '/community' },
    { name: '릴스', path: '/reels' },
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
            </div>

            {/* Icons & Sell */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/sell" 
                className="text-sm font-bold border border-gray-200 px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
              >
                판매
              </Link>
              <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <ShoppingCart size={24} className="text-black" />
              </button>
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
                className="block px-3 py-3 rounded-md text-lg font-bold text-accent"
              >
                판매
              </Link>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex space-x-4">
                <button className="p-3 bg-gray-50 rounded-full">
                  <ShoppingCart size={24} />
                </button>
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
