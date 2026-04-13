import React from 'react';
import { ShoppingCart, Heart, Eye, Share2, Plus } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { useApp } from '../store';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart, wishlist, toggleWishlist, setIsLoginModalOpen, user } = useApp();
  const isBookmarked = wishlist.includes(product.id);
  const safeImageUrl = getSafeImageUrl(product.imageUrl);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group bg-white transition-all cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50 mb-4 rounded-xl">
        {/* Main Image */}
        <img
          src={safeImageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = 'https://picsum.photos/seed/error/800/1000';
          }}
        />
        
        {/* Bookmark Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              setIsLoginModalOpen(true);
              return;
            }
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-20"
        >
          <Heart 
            size={20} 
            className={isBookmarked ? "fill-red-500 text-red-500" : "text-gray-400"} 
            fill={isBookmarked ? "currentColor" : "none"}
          />
        </button>

        {/* Add to Cart Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              alert('로그인이 필요합니다.');
              setIsLoginModalOpen(true);
              return;
            }
            addToCart(product.id);
          }}
          className="absolute bottom-3 right-3 p-3 bg-black text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20 hover:bg-accent hover:text-black"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
        <div className="flex items-center space-x-2 pt-1">
          {product.discountRate && (
            <span className="text-red-500 font-black text-sm">{product.discountRate}%</span>
          )}
          <span className="text-sm font-black">₩{product.price.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

interface ReviewCardProps {
  review: {
    id: string;
    imageUrl: string;
    rating: number;
    title: string;
    content: string;
    author: string;
  };
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const safeImageUrl = getSafeImageUrl(review.imageUrl);
  
  return (
    <div className="flex-shrink-0 w-48 group">
      <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100">
        <img 
          src={safeImageUrl} 
          alt={review.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = 'https://picsum.photos/seed/error/400/400';
          }}
        />
      </div>
      <div className="flex mb-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-[10px] ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </div>
      <h4 className="text-xs font-bold truncate mb-1">{review.title}</h4>
      <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{review.content}</p>
    </div>
  );
};

interface ReelItemProps {
  post: {
    id: string;
    author?: string;
    content?: string;
    title?: string;
    videoUrl?: string;
    thumbnail?: string;
    likes?: number;
  };
}

export const ReelItem: React.FC<ReelItemProps> = ({ post }) => {
  const { toggleTrendItemLike, user, setIsLoginModalOpen } = useApp();
  const isLiked = user ? (post.likedBy || []).includes(user.id) : false;
  const videoUrl = post.videoUrl;
  const thumbnail = post.thumbnail;
  const isVideo = videoUrl?.match(/\.(mp4|webm|ogg|mov)$/i);
  const safeImageUrl = getSafeImageUrl(thumbnail || videoUrl);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    toggleTrendItemLike(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다.');
  };

  return (
    <div 
      onClick={() => post.videoUrl && window.open(post.videoUrl, '_blank')}
      className="relative aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
    >
      {isVideo ? (
        <video
          src={videoUrl}
          poster={getSafeImageUrl(thumbnail)}
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
          onError={(e) => {
            e.currentTarget.src = 'https://picsum.photos/seed/error/400/600';
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-accent rounded-full border-2 border-white flex items-center justify-center font-bold text-black">
            {(post.author || post.title || 'U')[0]}
          </div>
          <div>
            <p className="font-bold text-sm">@{post.author || 'Admin'}</p>
          </div>
        </div>
        <p className="text-sm mb-4 line-clamp-2">{post.content || post.title}</p>
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-2 group/btn"
          >
            <Heart 
              size={20} 
              className={isLiked ? "fill-pink-500 text-pink-500" : "group-hover/btn:text-accent transition-colors"} 
            />
            <span className={`text-xs font-bold ${isLiked ? "text-pink-500" : ""}`}>{post.likes || 0}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 group/btn"
          >
            <Share2 size={20} className="group-hover/btn:text-accent transition-colors" />
            <span className="text-xs font-bold">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
