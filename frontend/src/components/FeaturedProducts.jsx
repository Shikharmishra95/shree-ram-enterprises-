import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * FeaturedProducts — Best Sellers / Featured Collection
 * Fetches from /api/products/featured
 * Sorted by priorityIndex ascending (1 = top placement).
 */
export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    API.get('/api/products/featured')
      .then(res => {
        if (Array.isArray(res.data)) {
          setProducts(res.data.slice(0, 8)); // Max 8 featured products shown
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <div className="h-5 w-40 bg-slate-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
            <div className="aspect-square bg-slate-100" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-slate-200 rounded" />
              <div className="h-3 w-2/3 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (products.length === 0) return null;

  return (
    <div className="w-full mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <div>
            <h2 className="text-base font-black text-slate-800 leading-none">Best Sellers</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Featured Collection</p>
          </div>
          <span className="ml-1 text-xl">⭐</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-[10px] font-bold text-primary/70 hover:text-primary transition-colors cursor-pointer"
        >
          View All →
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, idx) => {
          const disc = product.mrp && Number(product.mrp) > Number(product.price)
            ? Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)
            : 0;
          const isOut = product.stockQuantity === 0;

          return (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
                  alt={product.name}
                  className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {disc > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none shadow-sm">
                      {disc}% OFF
                    </span>
                  )}
                  {product.priorityIndex <= 5 && (
                    <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none shadow-sm">
                      🔥 TOP
                    </span>
                  )}
                </div>
                {isOut && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-none">
                    <span className="bg-white/90 text-slate-700 text-[10px] font-black px-2 py-1 rounded-lg">Out of Stock</span>
                  </div>
                )}
                {/* Quick add on hover */}
                {!isOut && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart && addToCart(product.id, 1);
                    }}
                    className="absolute bottom-2 left-2 right-2 bg-primary text-white text-[10px] font-black py-1.5 rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-primary/25"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Add to Cart
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="p-3 pt-2.5">
                <p className="text-slate-700 font-bold text-[11px] leading-snug line-clamp-2 mb-1.5">
                  {product.name}
                </p>
                <div className="flex items-center gap-1 mb-1.5">
                  {product.rating ? (
                    <>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-500">{product.rating.toFixed(1)}</span>
                    </>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-primary font-black text-sm">₹{Number(product.price).toLocaleString('en-IN')}</span>
                  {disc > 0 && (
                    <span className="text-slate-400 text-[10px] line-through font-medium">
                      ₹{Number(product.mrp).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
