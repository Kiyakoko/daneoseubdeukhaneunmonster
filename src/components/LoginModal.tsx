import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useApp } from '../store';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0],
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      };
      
      login(userData);
      onClose();
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For now, we use mock login but it will be persisted in localStorage via store.login
    setTimeout(() => {
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        name: isRegister ? formData.name : formData.email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
      };
      login(userData);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-10">
              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">
                  {isRegister ? '계정 만들기' : '환영합니다'}
                </h2>
                <p className="text-gray-500 font-medium">
                  {isRegister 
                    ? '오늘 우리의 크리에이티브 커뮤니티에 참여하세요.' 
                    : '크리에이티브 여정을 계속하려면 로그인하세요.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="이름"
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    placeholder="이메일 주소"
                    required
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    placeholder="비밀번호"
                    required
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent outline-none font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-accent hover:text-black transition-all group mt-6 disabled:opacity-50"
                >
                  <span>{isLoading ? '처리 중...' : (isRegister ? '가입하기' : '로그인')}</span>
                  {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <span className="relative px-4 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest">또는</span>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-bold disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span>Google로 계속하기</span>
                </button>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm font-bold text-gray-400 hover:text-black transition-colors"
                >
                  {isRegister 
                    ? '이미 계정이 있으신가요? 로그인' 
                    : "계정이 없으신가요? 가입하기"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
