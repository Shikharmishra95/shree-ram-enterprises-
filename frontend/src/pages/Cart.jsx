import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Trash2, Minus, Plus, Lock, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, totalCartItems } = useCart();
  const navigate = useNavigate();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Redirect admin users
  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleProceedToCheckout = () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
    setIsCheckingOut(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Navigation Bar ── */}
      <nav className="border-b border-border bg-surface-light/80 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center group-hover:bg-primary/25 transition-all">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold text-text-primary hidden sm:block">Back to Store</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="hidden sm:flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="w-8.5 h-8.5 bg-primary/15 rounded-full flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-semibold text-primary">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left leading-none">
                      <p className="text-xs font-bold text-text-primary">{user?.username}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user?.role?.replace('ROLE_', '')}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="px-3.5 py-2 text-xs font-bold text-danger hover:bg-danger-bg rounded-xl transition-colors cursor-pointer border border-danger/10"
                  >
                    Logout
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

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Shopping Cart</h1>
          <p className="text-text-secondary mt-1 text-sm">
            You have {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in your cart.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-surface-light border border-border rounded-3xl shadow-xs">
            <div className="w-20 h-20 bg-surface-input rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Your cart is empty</h2>
            <p className="text-text-secondary text-center max-w-md mb-8 text-sm">
              Browse our professional catalog and select products to get started.
            </p>
            <Link to="/" className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-6 bg-surface-light border border-border rounded-3xl shadow-xs hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-surface-input shrink-0 border border-border/50">
                    <img
                      src={item.product.imageUrl || '/product/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-text-primary truncate">{item.product.name}</h3>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2 max-w-xl">{item.product.description}</p>
                      </div>
                      <span className="text-base font-bold text-text-primary shrink-0">
                        ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-1 bg-surface-input rounded-xl p-1 w-fit border border-border/50">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          disabled={item.quantity <= 1} 
                          className="w-8 h-8 flex items-center justify-center text-text-primary hover:bg-surface-light rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          disabled={item.quantity >= item.product.stockQuantity} 
                          className="w-8 h-8 flex items-center justify-center text-text-primary hover:bg-surface-light rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-danger hover:bg-danger-bg rounded-xl transition-all cursor-pointer border border-transparent hover:border-danger/10">
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-surface-light border border-border rounded-3xl p-6 shadow-xs sticky top-24">
                <h2 className="text-lg font-bold text-text-primary mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-semibold text-text-primary">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping estimate</span>
                    <span className="font-semibold text-success">Free</span>
                  </div>
                </div>
                <div className="border-t border-border pt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-text-primary">Order Total</span>
                    <span className="text-2xl font-black text-primary">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                {checkoutError && (
                  <div className="mb-4 p-3 bg-danger-bg border border-danger/20 rounded-xl text-xs text-danger font-semibold text-center">{checkoutError}</div>
                )}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl cursor-pointer active:scale-98 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading Checkout...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
                <p className="text-center text-text-muted text-[10px] mt-4 flex items-center justify-center gap-1 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  Secured by Razorpay Payment Gateway
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
