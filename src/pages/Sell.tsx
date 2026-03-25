import React, { useState } from 'react';
import { useApp } from '../store';
import { Package, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Sell: React.FC = () => {
  const { config, user } = useApp();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '피규어',
    description: '',
    price: '',
    imageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white py-32 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle size={48} className="text-black" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter">신청 완료!</h1>
            <p className="text-gray-500 font-medium">
              판매 신청이 성공적으로 접수되었습니다.<br />
              관리자 검토 후 개별 연락드리겠습니다.
            </p>
          </div>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
          >
            추가 신청하기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
            <Package size={16} className="text-black" />
            <span className="text-xs font-bold tracking-widest uppercase">Sell with Us</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-6">판매 신청</h1>
          <p className="text-gray-400 font-medium max-w-lg mx-auto">
            당신의 소중한 굿즈와 창작물을 {config.name}에서 판매해보세요.<br />
            전문적인 검수와 배송 대행 서비스를 제공합니다.
          </p>
        </header>

        {!user && (
          <div className="mb-12 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start space-x-4">
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="text-red-800 font-bold mb-1">로그인이 필요합니다</p>
              <p className="text-red-600 text-sm">판매 신청을 하시려면 먼저 로그인을 해주세요.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-50 p-8 md:p-12 rounded-[3rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">상품명</label>
              <input 
                required
                type="text" 
                placeholder="상품 이름을 입력하세요"
                className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">카테고리</label>
              <select 
                className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>피규어</option>
                <option>문구/팬시</option>
                <option>인형</option>
                <option>코스프레</option>
                <option>기타</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">상품 설명</label>
            <textarea 
              required
              rows={4}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
              className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">희망 판매가 (₩)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">상품 이미지 URL</label>
              <input 
                required
                type="url" 
                placeholder="https://..."
                className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-accent outline-none font-bold"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={!user}
            type="submit"
            className="w-full py-6 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
            <span>신청서 제출하기</span>
          </button>
        </form>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-gray-50 rounded-3xl text-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="font-black text-accent">01</span>
            </div>
            <h4 className="font-bold mb-2">신청서 접수</h4>
            <p className="text-xs text-gray-500">상품 정보와 사진을 포함한 신청서를 작성합니다.</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-3xl text-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="font-black text-accent">02</span>
            </div>
            <h4 className="font-bold mb-2">검수 및 승인</h4>
            <p className="text-xs text-gray-500">관리자가 상품의 상태와 적합성을 검토합니다.</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-3xl text-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="font-black text-accent">03</span>
            </div>
            <h4 className="font-bold mb-2">판매 시작</h4>
            <p className="text-xs text-gray-500">승인 완료 후 스토어에 상품이 진열됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
