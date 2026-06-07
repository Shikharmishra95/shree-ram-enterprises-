import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Heart, Eye, Star, Plus, Minus, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

// Calculate discount % between mrp and price
function calcDiscount(mrp, price) {
  const m = Number(mrp);
  const p = Number(price);
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}

export default function ProductCard({ product, onQuickView }) {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const cartItem = cartItems.find(item => item.product.id === product.id);
  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  const [isWishlisted, setIsWishlisted] = useState(false);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const discount = calcDiscount(product.mrp, product.price);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    const wishlist = saved ? JSON.parse(saved) : [];
    setIsWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = localStorage.getItem('wishlist');
    let wishlist = saved ? JSON.parse(saved) : [];
    if (wishlist.includes(product.id)) {
      wishlist = wishlist.filter(id => id !== product.id);
      setIsWishlisted(false);
    } else {
      wishlist.push(product.id);
      setIsWishlisted(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlist-update'));
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!cartItem) {
      const success = await addToCart(product.id, 1);
      if (success) navigate('/cart');
    } else {
      navigate('/cart');
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-200 flex flex-col h-full relative transition-all duration-250"
    >
      {/* ── Image Block ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-50 aspect-square flex items-center justify-center p-3">
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.imageUrl || fallbackImage}
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
          />
        </Link>

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-md shadow-sm tracking-wide">
              {discount}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 bg-slate-700 text-white text-[10px] font-black rounded-md shadow-sm">
              OUT OF STOCK
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-md shadow-sm">
              ONLY {product.stockQuantity} LEFT
            </span>
          )}
        </div>

        {/* Wishlist button (top-right, non-admin only) */}
        {!isAdmin && (
          <button
            onClick={toggleWishlist}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-xs hover:shadow backdrop-blur-sm transition-all cursor-pointer active:scale-90"
          >
            <Heart className={`w-3.5 h-3.5 transition-all ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          </button>
        )}

        {/* Quick View hover overlay */}
        <div className="absolute inset-0 bg-slate-950/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 pointer-events-none">
          <button
            onClick={() => onQuickView(product)}
            className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 bg-white/95 hover:bg-white text-slate-800 text-[10px] font-bold rounded-xl shadow-lg border border-slate-100 backdrop-blur-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-250 active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Category + Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[9px] font-bold text-primary/80 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[70%]">
            {product.category || 'General'}
          </span>
          {product.rating && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-[10px] font-bold text-slate-600">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.id}`} className="block mb-1">
          <h3 className="text-slate-800 font-bold text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 h-8">
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-auto pt-2.5 border-t border-slate-100">
          <span className="text-base font-black text-slate-900 leading-none">
            ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          {product.mrp && Number(product.mrp) > Number(product.price) && (
            <span className="text-[11px] text-slate-400 line-through leading-none">
              ₹{Number(product.mrp).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
          )}
        </div>

        {/* Action buttons (non-admin only) */}
        {!isAdmin && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {cartItem ? (
              /* Qty stepper */
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 flex-1 justify-center">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity - 1); }}
                  disabled={cartItem.quantity <= 1}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded-md disabled:opacity-30 transition-all cursor-pointer"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="w-5 text-center text-[11px] font-black text-slate-800">{cartItem.quantity}</span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity + 1); }}
                  disabled={cartItem.quantity >= product.stockQuantity}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded-md disabled:opacity-30 transition-all cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id, 1); }}
                disabled={isOutOfStock}
                className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-extrabold rounded-lg disabled:opacity-40 cursor-pointer transition-all uppercase tracking-wider border border-primary/15"
              >
                Add
              </button>
            )}

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-primary hover:bg-primary-dark text-white text-[10px] font-extrabold rounded-lg disabled:opacity-40 cursor-pointer shadow-xs transition-all uppercase tracking-wider"
            >
              <Zap className="w-2.5 h-2.5" />
              Buy
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
