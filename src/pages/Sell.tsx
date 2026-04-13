import React, { useState } from 'react';
import { useApp } from '../store';
import { Package, Send, AlertCircle, CheckCircle, Loader2, Tag, Info, DollarSign, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const Sell: React.FC = () => {
  const { config, user } = useApp();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '의상',
    description: '',
    price: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'saleApplications'), {
        ...formData,
        price: Number(formData.price),
        authorId: user.id,
        authorEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting sale application:', error);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                productName: '',
                category: '의상',
                description: '',
                price: '',
                imageUrl: '',
              });
            }}
            className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
          >
            뒤로 가기
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
            <span className="text-xs font-bold tracking-widest uppercase">Sell with Us</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-6">SELL</h1>
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

        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-gray-100 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                <Tag size={14} />
                <span>상품명</span>
              </label>
              <div className="relative group">
                <input 
                  required
                  type="text" 
                  placeholder="상품 이름을 입력하세요"
                  className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold transition-all"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                <LayoutGrid size={14} />
                <span>카테고리</span>
              </label>
              <div className="relative group">
                <select 
                  className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold appearance-none cursor-pointer transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>의상</option>
                  <option>가발</option>
                  <option>소품</option>
                  <option>신발</option>
                  <option>피규어</option>
                  <option>문구</option>
                  <option>인형</option>
                  <option>코스프레</option>
                  <option>기타</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Package size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
              <Info size={14} />
              <span>상품 설명</span>
            </label>
            <textarea 
              required
              rows={5}
              placeholder="상품에 대한 자세한 설명을 입력하세요 (상태, 구성품 등)"
              className="w-full px-8 py-6 rounded-[2.5rem] bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold resize-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                <DollarSign size={14} />
                <span>희망 판매가 (₩)</span>
              </label>
              <div className="relative">
                <input 
                  required
                  type="number" 
                  placeholder="0"
                  className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                <ImageIcon size={14} />
                <span>상품 이미지 URL</span>
              </label>
              <div className="relative">
                <input 
                  required
                  type="url" 
                  placeholder="https://..."
                  className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold transition-all"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              disabled={!user || isSubmitting}
              type="submit"
              className="w-full py-8 bg-black text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-lg hover:bg-accent hover:text-black transition-all flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-black/10 hover:shadow-accent/20 group"
            >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              <span>{isSubmitting ? '제출 중...' : '신청서 제출하기'}</span>
            </button>
          </div>
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
