import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Edit3, X, Check, Lock, CheckCircle2, AlertTriangle, Phone, LogOut } from 'lucide-react';

export default function Checkout() {
  const { user, logout } = useAuth();
  const { cartItems, fetchCart, totalCartItems } = useCart();
  const navigate = useNavigate();

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState(null);

  // Cart total computation
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = 30;
  const orderTotal = cartSubtotal + deliveryFee;

  // Protect route if cart is empty, and redirect admins
  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }
    if (cartItems.length === 0 && !isSuccess) {
      navigate('/cart');
    }
  }, [cartItems, navigate, isSuccess, user]);

  // Load addresses on mount
  useEffect(() => {
    const loadProfileData = async () => {
      setAddressesLoading(true);
      try {
        const response = await API.get('/api/users/profile');
        const profile = response.data;
        setAddresses(profile.addresses || []);
        if (profile.addresses && profile.addresses.length > 0) {
          setSelectedAddressId(profile.addresses[0].id);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
        setCheckoutError('Failed to load address book details. Please try again.');
      } finally {
        setAddressesLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle Add/Edit Address Form submission
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressError('');
    try {
      if (isEditingAddress) {
        const response = await API.put(`/api/users/addresses/${isEditingAddress.id}`, addressFormData);
        setAddresses(prev => prev.map(a => a.id === isEditingAddress.id ? response.data : a));
      } else {
        const response = await API.post('/api/users/addresses', addressFormData);
        setAddresses(prev => [...prev, response.data]);
        setSelectedAddressId(response.data.id); // auto-select newly added address
      }
      setShowAddressForm(false);
      setIsEditingAddress(null);
      setAddressFormData({
        name: '',
        phoneNumber: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
      });
    } catch (err) {
      console.error(err);
      setAddressError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const startEditAddress = (address, e) => {
    e.stopPropagation(); // prevent selecting the address card on edit button click
    setIsEditingAddress(address);
    setAddressFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      name: address.name || '',
      phoneNumber: address.phoneNumber || '',
    });
    setShowAddressForm(true);
  };

  // Handles checkout execution
  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      setCheckoutError('Please add a delivery destination address to place your order.');
      return;
    }

    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddr) {
      setCheckoutError('Please select a delivery destination address.');
      return;
    }

    if (!selectedAddr.phoneNumber || !selectedAddr.phoneNumber.trim()) {
      setCheckoutError('Recipient contact phone number is required in the selected address.');
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutError(null);

    const shippingAddress = `${selectedAddr.name}\n${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.zipCode}, ${selectedAddr.country}`;

    try {
      const response = await API.post('/api/orders/create', {
        shippingAddress,
        phoneNumber: selectedAddr.phoneNumber
      });
      const orderData = response.data;

      if (!orderData) {
        setCheckoutError('Failed to establish order. Please try again.');
        setIsPlacingOrder(false);
        return;
      }

      if (paymentMethod === 'online') {
        // Redirect to /payment gateway simulator
        navigate('/payment', { state: { orderData } });
      } else {
        // Cash on Delivery - Simulate payment verification directly on backend
        const verifyResponse = await API.post(`/api/orders/${orderData.id}/simulate-payment`);
        setSuccessOrderData(verifyResponse.data);
        setIsSuccess(true);
        fetchCart();
        
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      setCheckoutError(err.response?.data?.message || 'An error occurred while creating your order.');
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans flex flex-col">
      {/* ── Navigation Bar ─────────────────────── */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/cart" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-slate-700">Back to Store</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="w-8.5 h-8.5 bg-primary/15 rounded-full flex items-center justify-center border border-primary/20 shadow-xs">
                  <span className="text-xs font-bold text-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left leading-none hidden sm:block">
                  <p className="text-xs font-bold text-slate-850">{user?.username}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role?.replace('ROLE_', '')}</p>
                </div>
              </Link>
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

      {/* ── Main Layout ───────────────────────── */}
      <main className="max-w-xl mx-auto w-full px-4 py-8 flex-grow">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
        </div>

        {checkoutError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
            {checkoutError}
          </div>
        )}

        <div className="space-y-6">
          {/* SECTION 1: DELIVER TO */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Deliver To</h3>
              <button
                onClick={() => {
                  setIsEditingAddress(null);
                  setAddressFormData({
                    name: '',
                    phoneNumber: '',
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'India',
                  });
                  setShowAddressForm(true);
                }}
                className="text-[10px] font-black uppercase text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
              >
                Add Address
              </button>
            </div>

            {/* Address cards list */}
            {addressesLoading ? (
              <div className="py-6 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-semibold text-xs">
                No addresses saved yet. Click "Add Address" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      selectedAddressId === addr.id
                        ? 'border-primary ring-2 ring-primary/5 bg-primary/5'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedAddressId === addr.id ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {selectedAddressId === addr.id && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm capitalize">{addr.name || user?.username}</p>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">{addr.street}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{addr.city}, {addr.state} - {addr.zipCode}, {addr.country}</p>
                        {addr.phoneNumber && (
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> Phone: {addr.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => startEditAddress(addr, e)}
                      className="text-[10px] font-bold text-amber-500 hover:text-amber-600 transition-colors shrink-0 cursor-pointer"
                    >
                      EDIT
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: PAYMENT METHOD */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3.5 mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              {/* Option 1: Pay Online */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 ${
                  paymentMethod === 'online'
                    ? 'border-primary ring-2 ring-primary/5 bg-primary/5'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'online' ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'online' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Pay Online (Razorpay Secure)</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Pay securely via Credit Card, Netbanking, Wallet, or UPI</p>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 ${
                  paymentMethod === 'cod'
                    ? 'border-primary ring-2 ring-primary/5 bg-primary/5'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'cod' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Cash on Delivery (COD)</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Pay with physical cash upon package shipment delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: AMOUNT SUMMARY */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3.5 mb-4">Amount</h3>
            
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>Item total</span>
                <span className="text-slate-800 font-bold">₹{Number(cartSubtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 pb-3 border-b border-slate-55">
                <span>Delivery fee</span>
                <span className="text-slate-800 font-bold">₹{Number(deliveryFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-black text-primary text-base">₹{Number(orderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* PLACE ORDER BUTTON */}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="w-full py-4.5 bg-slate-900 hover:bg-black active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
          >
            {isPlacingOrder ? (
              <div className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Place Your Order
          </button>
        </div>
      </main>

      {/* ── Address Add/Edit Form Overlay Modal ── */}
      <AnimatePresence>
        {showAddressForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {isEditingAddress ? 'Edit Address Parameters' : 'Add New Shipping Destination'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {addressError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
                  {addressError}
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-semibold text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shiba"
                      value={addressFormData.name}
                      onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none text-slate-850 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9999988888"
                      value={addressFormData.phoneNumber}
                      onChange={(e) => setAddressFormData({ ...addressFormData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none text-slate-850 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1/307g, Kanpur Road"
                    value={addressFormData.street}
                    onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none text-slate-850 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kanpur"
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none text-slate-850 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Uttar Pradesh"
                      value={addressFormData.state}
                      onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none text-slate-850 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 208001"
                      value={addressFormData.zipCode}
                      onChange={(e) => setAddressFormData({ ...addressFormData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none text-slate-850 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India"
                      value={addressFormData.country}
                      onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none text-slate-850 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addressSaving}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px] cursor-pointer"
                >
                  {addressSaving ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isEditingAddress ? 'Apply Address Changes' : 'Confirm New Address'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Cash on Delivery Success Overlay ── */}
      {isSuccess && successOrderData && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-sm p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-xs relative animate-bounce">
              <div className="w-14 h-14 bg-primary/25 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-text-primary tracking-tight">Order Placed!</h2>
            <p className="text-text-secondary text-xs mt-2 leading-relaxed max-w-xs font-semibold">
              Thank you for your purchase! Your Cash on Delivery order has been successfully recorded. Redirecting to your ledger...
            </p>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4.5 mt-8 text-left space-y-2 select-none shadow-2xs">
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Receipt Key</span>
                <span className="text-slate-800 font-mono">cod_{successOrderData.id}</span>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Verification Order ID</span>
                <span className="text-slate-800 font-mono">{successOrderData.razorpayOrderId}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Payable on Delivery</span>
                <span className="text-primary font-black">₹{Number(orderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
