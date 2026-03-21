/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Community } from './pages/Community';
import { Admin } from './pages/Admin';
import { motion, AnimatePresence } from 'motion/react';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useApp();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', config.accentColor);
    root.style.setProperty('--bg-color', config.backgroundColor);
    root.style.setProperty('--font-family', config.fontFamily);
  }, [config.accentColor, config.backgroundColor, config.fontFamily]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent selection:text-black">
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAdmin && (
        <footer className="bg-black text-white py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-black">A</div>
                  <span className="text-2xl font-black tracking-tighter uppercase">{config.name}</span>
                </div>
                <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                  현대적인 디자인과 커뮤니티가 만나는 곳. <br />
                  {config.name}은 당신의 창의성을 현실로 바꿉니다.
                </p>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:text-black transition-all cursor-pointer">IG</div>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:text-black transition-all cursor-pointer">FB</div>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:text-black transition-all cursor-pointer">TW</div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-8">Navigation</h4>
                <ul className="space-y-4 text-sm font-medium text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">홈</li>
                  <li className="hover:text-white transition-colors cursor-pointer">쇼핑몰</li>
                  <li className="hover:text-white transition-colors cursor-pointer">커뮤니티</li>
                  <li className="hover:text-white transition-colors cursor-pointer">릴스</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-8">Support</h4>
                <ul className="space-y-4 text-sm font-medium text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">고객센터</li>
                  <li className="hover:text-white transition-colors cursor-pointer">개인정보처리방침</li>
                  <li className="hover:text-white transition-colors cursor-pointer">이용약관</li>
                  <li>
                    <Link to="/admin" className="hover:text-white transition-colors">관리자 페이지</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
                <p className="text-xs text-gray-500">© 2026 {config.name}. All rights reserved.</p>
                <Link to="/admin" className="text-[10px] text-gray-600 hover:text-accent transition-colors uppercase tracking-widest font-bold">Admin Access</Link>
              </div>
              <p className="text-xs text-gray-500">Designed with Passion by {config.name} Team</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/community" element={<Community />} />
            <Route path="/reels" element={<Community />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </PageWrapper>
      </Router>
    </AppProvider>
  );
}
