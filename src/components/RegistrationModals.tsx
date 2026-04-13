import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Link as LinkIcon, Plus } from 'lucide-react';
import { useApp } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Post, TrendItem } from '../types';
import { getSafeImageUrl } from '../utils/imageUtils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: any;
}

export const ProductRegistrationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, user } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '의상',
    image: '',
    description: '',
    details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      price: parseInt(formData.price) || 0,
      category: formData.category,
      imageUrl: formData.image,
      description: formData.description,
      detailInfo: formData.details,
      order: 0,
      authorId: user?.id
    };
    addProduct(newProduct);
    onClose();
    setFormData({ name: '', price: '', category: '의상', image: '', description: '', details: '' });
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">상품 등록</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">상품명</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                      placeholder="상품명을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">가격</label>
                    <input 
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                      placeholder="가격을 입력하세요"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">카테고리</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold appearance-none"
                  >
                    <option value="의상">의상</option>
                    <option value="가발">가발</option>
                    <option value="소품">소품</option>
                    <option value="신발">신발</option>
                    <option value="피규어">피규어</option>
                    <option value="문구/팬시">문구/팬시</option>
                    <option value="인형">인형</option>
                    <option value="코스프레">코스프레</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">이미지 URL</label>
                  <div className="flex space-x-4">
                    <div className="flex-grow">
                      <input 
                        required
                        type="url"
                        value={formData.image}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {formData.image && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <img 
                          src={getSafeImageUrl(formData.image)} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/seed/error/100/100';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">설명</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold min-h-[100px]"
                    placeholder="상품에 대한 간단한 설명을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">상세정보</label>
                  <textarea 
                    value={formData.details}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold min-h-[100px]"
                    placeholder="상품의 상세 정보를 입력하세요"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-4 bg-accent text-black rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const CommunityRegistrationModal: React.FC<ModalProps> = ({ isOpen, onClose, editingItem }) => {
  const { addPost, updatePost, user } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    category: '코스프레',
    image: '',
    content: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        category: editingItem.category || '코스프레',
        image: editingItem.imageUrl || '',
        content: editingItem.content || ''
      });
    } else {
      setFormData({ title: '', category: '코스프레', image: '', content: '' });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updatePost({
        ...editingItem,
        title: formData.title,
        category: formData.category,
        imageUrl: formData.image,
        content: formData.content
      });
    } else {
      const newPost: Post = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        category: formData.category,
        imageUrl: formData.image,
        content: formData.content,
        author: user?.name || 'Anonymous',
        authorId: user?.id,
        authorAvatar: user?.avatar,
        createdAt: new Date().toISOString().split('T')[0],
        likes: 0,
        type: 'community',
        order: 0
      };
      addPost(newPost);
    }
    onClose();
    setFormData({ title: '', category: '코스프레', image: '', content: '' });
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">커뮤니티 글 등록</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">제목</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                    placeholder="제목을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">카테고리</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold appearance-none"
                  >
                    <option value="코스프레">코스프레</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">이미지 URL</label>
                  <div className="flex space-x-4">
                    <div className="flex-grow">
                      <input 
                        required
                        type="url"
                        value={formData.image}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {formData.image && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <img 
                          src={getSafeImageUrl(formData.image)} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/seed/error/100/100';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">내용</label>
                  <textarea 
                    required
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold min-h-[150px]"
                    placeholder="내용을 입력하세요"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-4 bg-accent text-black rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ReelRegistrationModal: React.FC<ModalProps> = ({ isOpen, onClose, editingItem }) => {
  const { addTrendItem, updateTrendItem, user } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    thumbnail: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        videoUrl: editingItem.videoUrl || '',
        thumbnail: editingItem.thumbnail || ''
      });
    } else {
      setFormData({ title: '', videoUrl: '', thumbnail: '' });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateTrendItem({
        ...editingItem,
        title: formData.title,
        videoUrl: formData.videoUrl,
        thumbnail: formData.thumbnail
      });
    } else {
      const newItem: TrendItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        videoUrl: formData.videoUrl,
        thumbnail: formData.thumbnail,
        author: user?.name || 'Anonymous',
        authorId: user?.id,
        authorAvatar: user?.avatar,
        likes: 0,
        order: 0
      };
      addTrendItem(newItem);
    }
    onClose();
    setFormData({ title: '', videoUrl: '', thumbnail: '' });
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">릴스 등록</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">제목</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                    placeholder="제목을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">릴스 링크 (비디오 URL)</label>
                  <input 
                    required
                    type="url"
                    value={formData.videoUrl}
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">썸네일 URL</label>
                  <div className="flex space-x-4">
                    <div className="flex-grow">
                      <input 
                        required
                        type="url"
                        value={formData.thumbnail}
                        onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all font-bold"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                    {formData.thumbnail && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <img 
                          src={getSafeImageUrl(formData.thumbnail)} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/seed/error/100/100';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-4 bg-accent text-black rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
