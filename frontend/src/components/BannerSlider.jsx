import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * BannerSlider — Dynamic Banner Component
 * Fetches active banners from /api/banners/active
 * Uses admin-defined slideSpeedMs for auto-play timing.
 * Clicking a banner navigates to its redirectUrl.
 */
export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    API.get('/api/banners/active')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBanners(res.data);
        }
      })
      .catch(() => {
        // Silently fail — banners are optional
        setBanners([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-play using the slideSpeedMs from the first banner (they all share the same global setting)
  useEffect(() => {
    if (banners.length <= 1) return;
    const speed = banners[0]?.slideSpeedMs || 4000;
    timerRef.current = setInterval(() => {
      goNext();
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [banners, current]);

  const goTo = (idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setIsTransitioning(false), 400);
    clearInterval(timerRef.current);
  };

  const goPrev = () => goTo(current === 0 ? banners.length - 1 : current - 1);
  const goNext = () => goTo(current === banners.length - 1 ? 0 : current + 1);

  const handleBannerClick = (banner) => {
    if (!banner.redirectUrl) return;
    if (banner.redirectUrl.startsWith('http')) {
      window.open(banner.redirectUrl, '_blank', 'noopener');
    } else {
      navigate(banner.redirectUrl);
    }
  };

  // Don't render if no banners
  if (isLoading || banners.length === 0) return null;

  return (
    <div className="w-full mb-6 relative group">
      {/* Slider Container */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-lg"
        style={{ aspectRatio: '3 / 1', minHeight: '120px', maxHeight: '260px' }}
      >
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner)}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              idx === current ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-[1.02]'
            } ${banner.redirectUrl ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || `Banner ${idx + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
            {/* Title overlay if provided */}
            {banner.title && (
              <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                <p className="text-white text-sm font-black drop-shadow-lg line-clamp-1">{banner.title}</p>
              </div>
            )}
          </div>
        ))}

        {/* Navigation arrows (show only when multiple banners) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                idx === current
                  ? 'w-5 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
