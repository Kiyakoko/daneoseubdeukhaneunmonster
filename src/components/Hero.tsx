import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../store';

import { getSafeImageUrl } from '../utils/imageUtils';

export const Hero: React.FC = () => {
  const { config } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = config.banners || [];

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => banners.length > 0 && setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => banners.length > 0 && setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentSlide];
  const safeImageUrl = getSafeImageUrl(currentBanner.imageUrl);

  return (
    <section className="relative w-full aspect-[16/9] bg-black overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black"
        >
          {/* Main Image Layer - Full Cover */}
          <img
            src={safeImageUrl}
            alt={currentBanner.title}
            className="absolute inset-0 w-full h-full object-cover z-10"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 z-20" />
          
          <div className="absolute inset-0 flex items-center z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-white uppercase [word-spacing:0.1em] whitespace-pre-line [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
                  {banners[currentSlide].title}
                </h1>
                <p className="text-base md:text-lg text-white/90 mb-8 leading-relaxed whitespace-pre-line [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
                  {banners[currentSlide].subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-accent text-black px-8 py-4 rounded-full font-bold flex items-center space-x-2 hover:bg-white transition-all transform hover:scale-105">
                    <span>자세히 보기</span>
                    <ArrowRight size={20} />
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
        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-accent hover:text-black text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-accent hover:text-black text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-12 h-1 rounded-full transition-all ${
              currentSlide === i ? 'bg-accent' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
