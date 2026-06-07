import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { 
  Home, ShoppingBag, Heart, ClipboardList, User, 
  LayoutDashboard, Package, ArrowLeft
} from 'lucide-react';

export default function BottomNavbar() {
  const { user, isAuthenticated } = useAuth();
  const { totalCartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide bottom navbar on login / register screens
  const isAuthScreen = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthScreen) return null;

  const isAdmin = user?.role === 'ROLE_ADMIN';

  // Navigation handlers
  const handleNav = (path, search = '') => {
    navigate({ pathname: path, search: search });
  };

  // Check if a tab is active
  const isActiveTab = (path, tabParam = null) => {
    const searchParams = new URLSearchParams(location.search);
    
    if (tabParam) {
      return location.pathname === path && searchParams.get('tab') === tabParam;
    }
    
    if (path === '/admin') {
      return location.pathname === path && !searchParams.get('tab');
    }
    
    if (path === '/') {
      return location.pathname === '/' && searchParams.get('wishlist') !== 'true';
    }
    
    return location.pathname === path;
  };

  // Render Admin Navigation Dock (3 buttons: Store, Admin Console, Order Fulfillment)
  if (isAdmin) {
    return (
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-slate-950/95 backdrop-blur-xl rounded-full shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-around px-4 z-[9999]">
        {/* Back to Store */}
        <button 
          onClick={() => handleNav('/')}
          className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
        >
          {isActiveTab('/') && (
            <motion.div 
              layoutId="activeAdminTab" 
              className="absolute inset-0 bg-white rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <ArrowLeft className={`w-5 h-5 z-10 transition-colors duration-200 ${
            isActiveTab('/') ? 'text-slate-950' : 'text-slate-400 hover:text-white'
          }`} />
        </button>

        {/* Admin Console */}
        <button 
          onClick={() => handleNav('/admin')}
          className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
        >
          {isActiveTab('/admin') && (
            <motion.div 
              layoutId="activeAdminTab" 
              className="absolute inset-0 bg-white rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <LayoutDashboard className={`w-5 h-5 z-10 transition-colors duration-200 ${
            isActiveTab('/admin') ? 'text-slate-950' : 'text-slate-400 hover:text-white'
          }`} />
        </button>

        {/* Order Fulfillment */}
        <button 
          onClick={() => handleNav('/admin', '?tab=orders')}
          className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
        >
          {isActiveTab('/admin', 'orders') && (
            <motion.div 
              layoutId="activeAdminTab" 
              className="absolute inset-0 bg-white rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Package className={`w-5 h-5 z-10 transition-colors duration-200 ${
            isActiveTab('/admin', 'orders') ? 'text-slate-950' : 'text-slate-400 hover:text-white'
          }`} />
        </button>
      </div>
    );
  }

  // Render Shopper / Guest Navigation Dock (5 buttons: Home, Cart, Wishlist, Order History, Profile)
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-16 bg-slate-950/95 backdrop-blur-xl rounded-full shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-around px-2 z-[9999]">
      {/* Home */}
      <button 
        onClick={() => handleNav('/')}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
      >
        {isActiveTab('/') && (
          <motion.div 
            layoutId="activeShopperTab" 
            className="absolute inset-0 bg-white rounded-full shadow-md"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <Home className={`w-5 h-5 z-10 transition-colors duration-200 ${
          isActiveTab('/') ? 'text-slate-950' : 'text-slate-400 hover:text-white'
        }`} />
      </button>

      {/* Cart */}
      <button 
        onClick={() => handleNav('/cart')}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
      >
        {isActiveTab('/cart') && (
          <motion.div 
            layoutId="activeShopperTab" 
            className="absolute inset-0 bg-white rounded-full shadow-md"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <div className="relative z-10 flex items-center justify-center">
          <ShoppingBag className={`w-5 h-5 transition-colors duration-200 ${
            isActiveTab('/cart') ? 'text-slate-950' : 'text-slate-400 hover:text-white'
          }`} />
          {totalCartItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white ring-2 ring-slate-950">
              {totalCartItems}
            </span>
          )}
        </div>
      </button>

      {/* Wishlist */}
      <button 
        onClick={() => handleNav('/', '?wishlist=true')}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
      >
        {isActiveTab('/', 'wishlist') || new URLSearchParams(location.search).get('wishlist') === 'true' ? (
          <>
            <motion.div 
              layoutId="activeShopperTab" 
              className="absolute inset-0 bg-white rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
            <Heart className="w-5 h-5 text-rose-600 z-10" />
          </>
        ) : (
          <Heart className="w-5 h-5 text-slate-400 hover:text-white z-10 transition-colors duration-200" />
        )}
      </button>

      {/* Order History */}
      <button 
        onClick={() => {
          if (!isAuthenticated) {
            navigate('/login');
          } else {
            handleNav('/orders');
          }
        }}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
      >
        {isActiveTab('/orders') && (
          <motion.div 
            layoutId="activeShopperTab" 
            className="absolute inset-0 bg-white rounded-full shadow-md"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <ClipboardList className={`w-5 h-5 z-10 transition-colors duration-200 ${
          isActiveTab('/orders') ? 'text-slate-950' : 'text-slate-400 hover:text-white'
        }`} />
      </button>

      {/* Profile */}
      <button 
        onClick={() => {
          if (!isAuthenticated) {
            navigate('/login');
          } else {
            handleNav('/profile');
          }
        }}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
      >
        {isActiveTab('/profile') && (
          <motion.div 
            layoutId="activeShopperTab" 
            className="absolute inset-0 bg-white rounded-full shadow-md"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <User className={`w-5 h-5 z-10 transition-colors duration-200 ${
          isActiveTab('/profile') ? 'text-slate-950' : 'text-slate-400 hover:text-white'
        }`} />
      </button>
    </div>
  );
}

