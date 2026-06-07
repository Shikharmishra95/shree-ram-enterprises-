import { motion } from 'framer-motion';
import { X, Star, ShoppingBag, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function QuickViewModal({ product, onClose }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const cartItem = cartItems.find(item => item.product.id === product.id);
  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  const productImages = [
    product.imageUrl || fallbackImage,
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
  ];

  const getSpecs = (category) => {
    if (!category) {
      return [
        { name: 'Quality', value: '100% Genuine Certified' },
        { name: 'Use Case', value: 'Professional Salon Grade' },
        { name: 'Shipping', value: 'Express Secure Delivery' },
        { name: 'Supplier', value: 'Shree Ram Enterprises' }
      ];
    }
    
    if (category.includes('Hair Care')) {
      return [
        { name: 'Formula', value: 'Nourishing & Natural Extracts' },
        { name: 'Hair Type', value: 'Suitable for All Hair Types' },
        { name: 'Ammonia Content', value: 'Zero Ammonia / Safe for Scalp' },
        { name: 'Quality', value: 'Professional Salon Approved' }
      ];
    } else if (category.includes('Face Care') || category.includes('Skin Care')) {
      return [
        { name: 'Skin Type', value: 'Dermatologically Tested (All Skins)' },
        { name: 'Ingredients', value: 'Hyaluronic Acid, Vitamin C & Mint' },
        { name: 'Effect', value: 'Deep Cleansing & Glowing Radiance' },
        { name: 'Packaging', value: 'Safe Spill-proof Seal Pack' }
      ];
    } else if (category.includes('Shaving')) {
      return [
        { name: 'Lather Type', value: 'Rich, Creamy Ultra-Glide Foam' },
        { name: 'Fragrance', value: 'Denim Masculine / Lime Freshness' },
        { name: 'Skin Protection', value: 'Enriched with Vitamin E & Aloe' },
        { name: 'Package Size', value: 'Standard Salon Pack / Combo Packs' }
      ];
    } else if (category.includes('Appliances') || category.includes('Trimmers') || category.includes('Dryer')) {
      return [
        { name: 'Power Input', value: '220-240V Professional swivel cord' },
        { name: 'Adjustments', value: 'Multi-speed & Heat controls' },
        { name: 'Safety', value: 'Auto-overheat protection cut-out' },
        { name: 'Warranty', value: '1 Year Brand Warranty' }
      ];
    } else {
      return [
        { name: 'Quality', value: '100% Genuine Professional Grade' },
        { name: 'Use Case', value: 'High Durability Salon Equipment' },
        { name: 'Shipping', value: 'Express Secure Cargo Delivery' },
        { name: 'Distributor', value: 'Shree Ram Enterprises' }
      ];
    }
  };

  const specs = getSpecs(product.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Blur Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-4xl w-full overflow-hidden z-10 flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all z-20 cursor-pointer shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <div className="flex-1 flex items-center justify-center min-h-[280px] max-h-[380px] relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner p-4">
            <motion.img
              key={activeImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={productImages[activeImageIndex]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
            />

            {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <span className="absolute top-3 left-3 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                Only {product.stockQuantity} left
              </span>
            )}
            {product.stockQuantity === 0 && (
              <span className="absolute top-3 left-3 px-3 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                Out of Stock
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all cursor-pointer p-1 flex items-center justify-center ${
                  activeImageIndex === i
                    ? 'border-primary shadow-md scale-105'
                    : 'border-slate-200/60 opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={img === productImages[0] ? img : fallbackImage}
                  alt={`Thumbnail ${i + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Information */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white overflow-y-auto max-h-[550px] md:max-h-[600px]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="px-3 py-1 text-xs font-semibold text-primary bg-primary/5 rounded-full border border-primary/10 uppercase tracking-wider">
                {product.category || 'General'}
              </span>
              
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-tight mb-3">
              {product.name}
            </h2>

            <div className="mb-4 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl font-black text-primary">
                ₹{Number(product.price).toLocaleString('en-IN', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
              {product.mrp && Number(product.mrp) > Number(product.price) && (
                <>
                  <span className="text-sm text-slate-450 line-through">
                    MRP ₹{Number(product.mrp).toLocaleString('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-md shadow-sm">
                    {Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-600 text-xs leading-relaxed mb-6 font-normal">
              {product.description || 'No description provided for this premium item.'}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {specs.map((spec, i) => (
                <div key={i} className="text-xs">
                  <p className="text-slate-400 font-semibold mb-0.5">{spec.name}</p>
                  <p className="text-slate-700 font-bold">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-100 mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Availability</span>
                <span className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                  {product.stockQuantity > 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-700">{product.stockQuantity} Items Available</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-500">Out of Stock</span>
                    </>
                  )}
                </span>
              </div>

              {cartItem ? (
                <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-1.5 shadow-sm border border-slate-200/50">
                  <button
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-white rounded-xl disabled:opacity-40 transition-all font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-slate-800">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= product.stockQuantity}
                    className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-white rounded-xl disabled:opacity-40 transition-all font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product.id, 1)}
                  disabled={product.stockQuantity === 0}
                  className="flex-grow flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-dark active:scale-98 text-white text-sm font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer shadow-lg shadow-primary/20 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-3 border-t border-slate-50">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Express Cargo
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Easy Restock
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
