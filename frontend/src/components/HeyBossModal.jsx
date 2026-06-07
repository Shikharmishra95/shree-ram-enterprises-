import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

/**
 * HeyBossModal — Admin Dashboard Interceptor
 * 
 * On admin login, hits /api/admin/orders/pending-count.
 * If count > 0, shows a beautiful animated popup.
 * Clicking "View Orders" routes admin to the orders tab.
 */
export default function HeyBossModal({ show, count, onClose, onViewOrders }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (show) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show || count <= 0) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full mx-4"
        style={{ animation: 'hey-boss-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Top gradient banner */}
        <div className="bg-gradient-to-br from-violet-600 via-primary to-pink-500 px-6 pt-8 pb-6 text-center relative overflow-hidden">
          {/* Decorative rings */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
          
          {/* Waving hand emoji */}
          <div className="text-5xl mb-3" style={{ animation: 'wave 1s ease-in-out 3' }}>👋</div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Hey Boss!
          </h2>
          <p className="text-white/80 text-sm font-semibold mt-1">
            You have new orders waiting
          </p>
        </div>

        {/* Count badge */}
        <div className="flex justify-center -mt-7 mb-0 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-3 border border-slate-100 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-4xl font-black text-rose-600">{count}</span>
            <span className="text-slate-600 font-bold text-sm leading-tight">
              {count === 1 ? 'new order\ncoming in' : 'new orders\ncoming in'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center space-y-4">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {count === 1
              ? 'A customer is waiting for their order to be processed. Don\'t keep them waiting!'
              : `${count} customers are waiting for their orders to be processed. Let's get to work!`}
          </p>

          <button
            onClick={() => { onViewOrders(); onClose(); }}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-primary text-white font-black text-sm rounded-2xl hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all cursor-pointer"
          >
            🚀 View Orders Now
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold text-sm rounded-2xl hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            I'll check later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes hey-boss-in {
          0% { transform: scale(0.5) translateY(60px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
