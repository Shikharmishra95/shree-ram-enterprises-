import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingBag, RefreshCw, AlertCircle,
  CheckCircle2, Package, Truck, Star, ChevronDown, ChevronUp,
  Receipt, MapPin, CreditCard, Clock, LogOut
} from 'lucide-react';

// ── Tracking steps definition ─────────────────────────────────────────────────
const TRACKING_STEPS = [
  { key: 'PLACED',      label: 'Order Placed',  icon: Receipt,       color: 'text-primary',   bg: 'bg-primary'   },
  { key: 'PROCESSING',  label: 'Processing',    icon: Package,       color: 'text-amber-500', bg: 'bg-amber-500' },
  { key: 'SHIPPED',     label: 'Shipped',       icon: Truck,         color: 'text-cyan-500',  bg: 'bg-cyan-500'  },
  { key: 'DELIVERED',   label: 'Delivered',     icon: CheckCircle2,  color: 'text-emerald-500', bg: 'bg-emerald-500' },
];

// Map backend status → step index
const STATUS_TO_STEP = {
  PLACED: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3,
  SUCCESS: 0, PAID: 0, FAILED: -1, CANCELLED: -1,
};

function StatusBadge({ status }) {
  const cfg = {
    DELIVERED: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Delivered' },
    SHIPPED:   { cls: 'bg-cyan-50 text-cyan-600 border-cyan-200',           label: 'Shipped' },
    PROCESSING:{ cls: 'bg-amber-50 text-amber-600 border-amber-200',         label: 'Processing' },
    PLACED:    { cls: 'bg-primary/8 text-primary border-primary/20',         label: 'Order Placed' },
    PAID:      { cls: 'bg-primary/8 text-primary border-primary/20',         label: 'Paid' },
    SUCCESS:   { cls: 'bg-primary/8 text-primary border-primary/20',         label: 'Confirmed' },
    CANCELLED: { cls: 'bg-rose-50 text-rose-500 border-rose-200',            label: 'Cancelled' },
    FAILED:    { cls: 'bg-rose-50 text-rose-500 border-rose-200',            label: 'Failed' },
  };
  const c = cfg[status] || { cls: 'bg-slate-100 text-slate-500 border-slate-200', label: status };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${c.cls}`}>
      {c.label}
    </span>
  );
}

function TrackingBar({ status }) {
  const currentStep = STATUS_TO_STEP[status] ?? 0;
  const isCancelled = status === 'CANCELLED' || status === 'FAILED';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-rose-500" />
        </div>
        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
          Order {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100 z-0">
        <div
          className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700"
          style={{ width: currentStep === 0 ? '0%' : `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative z-10 flex items-start justify-between">
        {TRACKING_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isComplete = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isComplete
                  ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/25'
                  : isCurrent
                    ? `${step.bg} border-transparent shadow-md shadow-primary/20`
                    : 'bg-white border-slate-200'
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-slate-300'}`} />
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-bold text-center leading-tight transition-colors ${
                isComplete ? 'text-emerald-500'
                : isCurrent ? step.color
                : 'text-slate-300'
              }`}>
                {step.label}
              </span>

              {/* "Current" pulse dot */}
              {isCurrent && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${step.bg} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${step.bg}`} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const subtotal = order.items?.reduce((acc, i) => acc + i.price * i.quantity, 0) || 0;
  const delivery = Number(order.totalAmount) - subtotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                Order #{order.id}
              </span>
              <StatusBadge status={order.status} />
            </div>
            {order.transactionId && (
              <p className="text-[10px] text-slate-400 font-mono">TXN: {order.transactionId}</p>
            )}
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {new Date(order.orderDate).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-semibold">Total Paid</p>
              <p className="text-xl font-black text-primary">
                ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Thumbnails (collapsed summary) ─────────────── */}
      <div className="px-6 py-4 border-b border-slate-50">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Items Purchased</p>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.product?.imageUrl || '/product/placeholder.jpg'}
                  alt={item.product?.name}
                  className="w-11 h-11 object-cover rounded-xl border border-slate-100 bg-slate-50 shrink-0"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=44&q=80'; }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p className="text-xs font-black text-slate-700 shrink-0">
                ₹{Number(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>

        {/* Subtotal / Delivery fee */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>Subtotal ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          {delivery > 0 && <span>Delivery Fee ₹{delivery.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>}
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* ── Order Tracking Bar ──────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-slate-50">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Order Tracking</p>
        <TrackingBar status={order.status} />
      </div>

      {/* ── Expandable Details ──────────────────────────────────── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span>Order Details</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Shipping To</p>
                  </div>
                  {order.shippingAddress.name && (
                    <p className="text-xs font-bold text-slate-700">{order.shippingAddress.name}</p>
                  )}
                  {order.shippingAddress.phoneNumber && (
                    <p className="text-[10px] text-slate-500">{order.shippingAddress.phoneNumber}</p>
                  )}
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode, order.shippingAddress.country]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Payment Details */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment</p>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-700">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {delivery > 0 && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Delivery</span>
                    <span className="font-bold text-slate-700">₹{delivery.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs border-t border-slate-200 pt-2 mt-1">
                  <span className="font-black text-slate-700">Total Paid</span>
                  <span className="font-black text-primary">₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {order.transactionId && (
                  <p className="text-[9px] text-slate-400 font-mono mt-1 truncate">TXN: {order.transactionId}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MyOrders() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/api/orders/my-orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
      setError('Could not retrieve your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyOrders(); }, []);

  const STATUS_FILTERS = ['ALL', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const visibleOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status === filterStatus || (filterStatus === 'PLACED' && ['PAID', 'SUCCESS', 'PLACED'].includes(o.status)));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all border border-primary/10">
                <ArrowLeft className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-base font-black text-slate-800 tracking-tight">Shree Ram Enterprises</span>
            </Link>
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchMyOrders}
                className="p-2.5 text-slate-400 hover:text-primary rounded-xl hover:bg-slate-100 border border-slate-100 cursor-pointer transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* User Avatar */}
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

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors shadow-xs bg-slate-50 border border-slate-100/50"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
          <p className="text-slate-400 text-sm mt-1">Review and track your previous transactions</p>
        </div>

        {/* Status filter chips */}
        {!loading && orders.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  filterStatus === f
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary'
                }`}
              >
                {f === 'ALL' ? `All (${orders.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Fetching your orders…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-rose-100 p-8 rounded-3xl text-center shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-rose-600 font-semibold mb-4 text-sm">{error}</p>
            <button
              onClick={fetchMyOrders}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white border border-slate-100 p-12 text-center rounded-3xl shadow-xs max-w-lg mx-auto mt-4 space-y-5">
            <div className="w-20 h-20 bg-primary/8 border border-primary/15 rounded-full flex items-center justify-center mx-auto text-primary shadow-inner">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">No orders yet!</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto leading-relaxed">
                Explore our professional salon collection and place your first order.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 cursor-pointer uppercase tracking-wider text-xs"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && visibleOrders.length > 0 && (
          <div className="space-y-5">
            {visibleOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Filtered empty */}
        {!loading && !error && orders.length > 0 && visibleOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm font-semibold">No orders with status <span className="text-slate-600 font-black">{filterStatus}</span></p>
            <button onClick={() => setFilterStatus('ALL')} className="mt-3 text-xs text-primary font-bold hover:underline cursor-pointer">Show all orders</button>
          </div>
        )}

        {/* Star rating prompt for delivered */}
        {!loading && visibleOrders.some(o => o.status === 'DELIVERED') && (
          <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4">
            <Star className="w-7 h-7 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-black text-slate-800">Love what you received?</p>
              <p className="text-xs text-slate-500 mt-0.5">Your feedback helps other buyers and improves our catalog.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
