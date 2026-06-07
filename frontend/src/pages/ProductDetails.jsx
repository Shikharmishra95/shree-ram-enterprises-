import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import { LogOut } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, addToCart, updateQuantity, totalCartItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError(err.response?.data?.message || 'Product not found or offline server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const cartItem = cartItems.find((item) => item.product.id === product?.id);

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await addToCart(product.id, quantity);
    if (success) {
      setQuantity(1); // Reset local selector quantity
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (cartItem) {
      navigate('/cart');
    } else {
      const success = await addToCart(product.id, quantity);
      if (success) {
        navigate('/cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
        <div className="w-16 h-16 bg-danger-bg rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Failed to load product</h2>
        <p className="text-text-secondary mb-6 text-center max-w-md">{error || 'The requested product does not exist.'}</p>
        <Link to="/" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all">
          Go Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Navigation Bar ─────────────────────── */}
      <nav className="border-b border-border bg-surface-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-lg font-bold text-text-primary">Shree Ram Enterprises</span>
            </Link>

            <div className="flex items-center gap-3">
              {!isAdmin && (
                <Link 
                  to="/cart"
                  className="hidden sm:flex relative p-2.5 text-slate-500 hover:text-primary rounded-xl hover:bg-slate-100 cursor-pointer transition-colors shadow-xs bg-slate-50 border border-slate-100/50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-white">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="hidden md:flex px-3.5 py-2 text-xs font-bold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl cursor-pointer items-center gap-1.5 transition-all shadow-inner"
                    >
                      Admin Console
                    </Link>
                  )}

                  {!isAdmin && (
                    <Link
                      to="/orders"
                      className="hidden sm:flex px-3.5 py-2 text-xs font-bold text-slate-600 border border-slate-200/60 hover:bg-slate-50 bg-white rounded-xl cursor-pointer items-center gap-1.5 transition-all shadow-xs"
                    >
                      My Orders
                    </Link>
                  )}

                  <span className="hidden sm:inline w-px h-5 bg-slate-200/80" />

                  <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="w-8.5 h-8.5 bg-primary/15 rounded-full flex items-center justify-center border border-primary/20 shadow-xs">
                      <span className="text-xs font-bold text-primary">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left leading-none">
                      <p className="text-xs font-bold text-slate-800">{user?.username}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{user?.role?.replace('ROLE_', '')}</p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors shadow-xs bg-slate-50 border border-slate-100/50"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl cursor-pointer transition-all shadow-md shadow-primary/10"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Layout ───────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start bg-surface-card border border-border rounded-3xl p-8 lg:p-12 shadow-2xl">
          {/* Left Column: Image */}
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white relative border border-border flex items-center justify-center p-6">
            <img
              src={product.imageUrl || fallbackImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
            />

            {product.stockQuantity === 0 ? (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-danger text-white text-xs font-bold rounded-lg shadow-lg">
                Out of Stock
              </span>
            ) : product.stockQuantity <= 5 ? (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-lg">
                Only {product.stockQuantity} Left
              </span>
            ) : (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-success text-white text-xs font-bold rounded-lg shadow-lg">
                In Stock
              </span>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="space-y-6 flex flex-col justify-between h-full">
            <div>
              <h1 className="text-2xl font-bold text-text-primary leading-tight">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-black text-primary">
                  ₹{Number(product.price).toLocaleString('en-IN', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {product.mrp && Number(product.mrp) > Number(product.price) && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      MRP ₹{Number(product.mrp).toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-black rounded-lg shadow-sm">
                      {Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)}% OFF
                    </span>
                  </>
                )}
                <span className="text-xs text-text-muted">Incl. of all taxes</span>
              </div>

              <div className="mt-8 pt-8 border-t border-border space-y-3">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Product Details</h3>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {product.description || 'No description has been added for this product yet.'}
                </p>
              </div>
            </div>

            {/* Cart Button (hidden for administrators) */}
            {!isAdmin && (
              <div className="mt-8 pt-8 border-t border-border space-y-6">
                {cartItem ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-surface p-4 rounded-2xl border border-border">
                      <div>
                        <p className="text-xs text-text-muted">Already in Cart</p>
                        <p className="text-sm font-bold text-text-primary">{cartItem.quantity} unit{cartItem.quantity > 1 ? 's' : ''}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-surface-input rounded-xl p-1.5">
                        <button
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                          disabled={cartItem.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-surface-card rounded-lg disabled:opacity-40 transition-colors cursor-pointer text-lg font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-base font-bold">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                          disabled={cartItem.quantity >= product.stockQuantity}
                          className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-surface-card rounded-lg disabled:opacity-40 transition-colors cursor-pointer text-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to="/cart"
                        className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        View Cart & Checkout
                      </Link>
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 py-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                    {product.stockQuantity > 0 && (
                      <div className="flex items-center justify-between border border-border rounded-xl p-1 bg-surface-input min-w-32">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-text-primary disabled:opacity-40 cursor-pointer text-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-base font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                          disabled={quantity >= product.stockQuantity}
                          className="w-10 h-10 flex items-center justify-center text-text-primary disabled:opacity-40 cursor-pointer text-lg"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleAddToCart}
                      disabled={product.stockQuantity === 0}
                      className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={product.stockQuantity === 0}
                      className="flex-1 py-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
