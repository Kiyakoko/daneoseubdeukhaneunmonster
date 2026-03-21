import React from 'react';
import { ShoppingCart, Heart, Eye, Share2 } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { getSafeImageUrl } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const safeImageUrl = getSafeImageUrl(product.imageUrl);

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
        {/* Background Blur for non-matching ratios */}
        <img
          src={safeImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Main Image - Smart Fit */}
        <img
          src={safeImageUrl}
          alt={product.name}
          className="relative max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110 z-10"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 flex flex-col space-y-2 transform translate-x-12 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-accent transition-colors">
            <Heart size={18} />
          </button>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-accent transition-colors">
            <Eye size={18} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">{product.name}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-black">₩{product.price.toLocaleString()}</span>
          <button className="bg-black text-white p-3 rounded-2xl hover:bg-accent hover:text-black transition-all">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface ReelItemProps {
  post: {
    id: string;
    author: string;
    content: string;
    videoUrl?: string;
    likes: number;
  };
}

export const ReelItem: React.FC<ReelItemProps> = ({ post }) => {
  const isVideo = post.videoUrl?.match(/\.(mp4|webm|ogg|mov)$|vimeo|youtube/i) || !post.videoUrl?.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i);
  const safeImageUrl = getSafeImageUrl(post.videoUrl);

  return (
    <div className="relative aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl group">
      {isVideo ? (
        <video
          src={post.videoUrl}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={safeImageUrl}
          alt=""
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-accent rounded-full border-2 border-white flex items-center justify-center font-bold text-black">
            {post.author[0]}
          </div>
          <div>
            <p className="font-bold text-sm">@{post.author}</p>
            <p className="text-[10px] text-gray-300">Following</p>
          </div>
        </div>
        <p className="text-sm mb-4 line-clamp-2">{post.content}</p>
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-2 group/btn">
            <Heart size={20} className="group-hover/btn:text-accent transition-colors" />
            <span className="text-xs font-bold">{post.likes}</span>
          </button>
          <button className="flex items-center space-x-2 group/btn">
            <Share2 size={20} className="group-hover/btn:text-accent transition-colors" />
            <span className="text-xs font-bold">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
