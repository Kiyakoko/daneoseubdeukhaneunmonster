import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';

import { getSafeImageUrl } from '../utils/imageUtils';

export const Hero: React.FC = () => {
  const { config } = useApp();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = config.banners || [];

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => clearTimeout(timer);
  }, [currentSlide, banners.length]);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (banners.length > 0) setCurrentSlide((prev) => (prev + 1) % banners.length);
  };
  
  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (banners.length > 0) setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentSlide];
  const safeImageUrl = getSafeImageUrl(currentBanner.imageUrl);

  return (
    <section className="w-full bg-white py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full aspect-[720/900] md:aspect-[16/8] bg-black overflow-hidden rounded-2xl md:rounded-[2.5rem] group shadow-2xl">
          {/* Preload images */}
          <div className="hidden">
            {banners.map((b, i) => (
              <img key={i} src={getSafeImageUrl(b.imageUrl)} alt="" loading="eager" fetchPriority={i === 0 ? "high" : "auto"} />
            ))}
          </div>

          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center bg-black"
            >
              {/* Main Image Layer - Full Cover */}
              <img
                src={safeImageUrl}
                alt={currentBanner.title}
                className="absolute inset-0 w-full h-full object-cover z-10"
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  e.currentTarget.src = 'https://picsum.photos/seed/error/1920/1080';
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 z-20" />
              
              <div className="absolute inset-0 flex items-center z-30">
                <div className="px-8 sm:px-12 lg:px-16 w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="max-w-5xl"
                  >
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4 text-white uppercase [word-spacing:0.1em] whitespace-pre-line [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
                      {banners[currentSlide].title}
                    </h1>
                    <p className="text-sm md:text-base text-white/90 mb-6 leading-relaxed whitespace-pre-line [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
                      {banners[currentSlide].subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => currentBanner.link && navigate(currentBanner.link)}
                        className="bg-accent text-black px-6 py-3 rounded-full font-bold text-sm flex items-center space-x-2 hover:bg-white active:scale-95 transition-all transform hover:scale-105"
                      >
                        <span>자세히 보기</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-accent hover:text-black active:scale-90 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-accent hover:text-black active:scale-90 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-50"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center h-10 px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40 pointer-events-none group-hover:pointer-events-auto cursor-pointer group/indicators"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 2) prevSlide();
              else nextSlide();
            }}
          >
            <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-10 h-1 rounded-full transition-all active:scale-y-150 ${
                    currentSlide === i ? 'bg-accent w-14' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
