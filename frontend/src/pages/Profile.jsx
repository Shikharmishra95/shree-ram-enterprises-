import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, MapPin, Plus, Trash2, Edit3, X, Check, Save, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Tabs: 'personal' | 'addresses'
  const [activeTab, setActiveTab] = useState('personal');

  // Profile Form States
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Address book states
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(null); // address object being edited
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Load User Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await API.get('/api/users/profile');
        const data = response.data;
        setProfileData({
          username: data.username,
          email: data.email,
          phoneNumber: data.phoneNumber || '',
        });
        setAddresses(data.addresses || []);
      } catch (err) {
        console.error('Failed to load profile details:', err);
        setProfileError('Failed to load profile details. Please try again.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch Addresses
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await API.get('/api/users/addresses');
      setAddresses(response.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const response = await API.put('/api/users/profile', {
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
      });
      // Synchronize context if user changes localStorage, though username remains read-only
      const updatedUser = response.data;
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.email = updatedUser.email;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Add / Edit Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressError('');
    try {
      if (isEditingAddress) {
        // Edit flow
        const response = await API.put(`/api/users/addresses/${isEditingAddress.id}`, addressFormData);
        setAddresses(prev => prev.map(a => a.id === isEditingAddress.id ? response.data : a));
      } else {
        // Add flow
        const response = await API.post('/api/users/addresses', addressFormData);
        setAddresses(prev => [...prev, response.data]);
      }
      // Reset
      setShowAddressForm(false);
      setIsEditingAddress(null);
      setAddressFormData({
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

  // Handle Delete Address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await API.delete(`/api/users/addresses/${addressId}`);
      setAddresses(prev => prev.filter(a => a.id !== addressId));
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address.');
    }
  };

  const startEditAddress = (address) => {
    setIsEditingAddress(address);
    setAddressFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
    setShowAddressForm(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans flex flex-col">
      {/* ── Navigation Bar ─────────────────────── */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-slate-700">Shree Ram Enterprises</span>
            </Link>

            <div className="flex items-center gap-2.5">
              {user?.role === 'ROLE_ADMIN' && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-lg transition-all"
                >
                  Admin Console
                </Link>
              )}
              <div className="w-8.5 h-8.5 bg-primary/15 rounded-full flex items-center justify-center border border-primary/20 shadow-xs">
                <span className="text-xs font-bold text-primary">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              
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

      {/* ── Profile Header & Tabs ── */}
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
        </div>

        {/* Tab Selector Pills */}
        <div className="bg-slate-100/60 border border-slate-200/50 p-1 rounded-2xl flex w-full mb-8 shadow-xs">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
              activeTab === 'personal'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
              activeTab === 'addresses'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Addresses
          </button>
        </div>

        {profileLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 1: PERSONAL INFO */}
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl"
              >
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
                  <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-black">
                    {profileData.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Credentials Console</h3>
                    <p className="text-slate-400 text-[10px] font-medium uppercase mt-0.5">View and update active session parameters</p>
                  </div>
                </div>

                {profileSuccess && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
                    <Check className="w-4 h-4 shrink-0" />
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <X className="w-4 h-4 shrink-0" />
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Username name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        disabled
                        value={profileData.username}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 font-semibold cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Email address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-slate-800 placeholder-slate-400 font-semibold focus:border-slate-800 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Phone number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. +91 9999988888"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-slate-800 placeholder-slate-400 font-semibold focus:border-slate-800 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-4.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-[0.99] uppercase tracking-wider text-[10px]"
                  >
                    {profileSaving ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Profile Changes
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 2: MY ADDRESSES */}
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Address Manager Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Saved Addresses Book</h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        setIsEditingAddress(null);
                        setAddressFormData({
                          street: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          country: 'India',
                        });
                        setShowAddressForm(true);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-slate-900/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Address
                    </button>
                  )}
                </div>

                {/* Add/Edit Address Form Box */}
                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        {isEditingAddress ? 'Edit Address Parameters' : 'Add New Shipping Destination'}
                      </h4>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {addressError && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
                        {addressError}
                      </div>
                    )}

                    <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Street Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1/307g, Kanpur Road"
                          value={addressFormData.street}
                          onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none font-semibold text-slate-800"
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none font-semibold text-slate-800"
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none font-semibold text-slate-800"
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none font-semibold text-slate-800"
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl focus:border-slate-800 focus:bg-white transition-all outline-none font-semibold text-slate-800"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={addressSaving}
                        className="w-full py-4.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-[10px]"
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
                )}

                {/* Addresses List Grid */}
                {addressesLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white border border-slate-200/60 text-center p-12 rounded-3xl shadow-xs">
                    <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold text-sm">No shipping destinations saved yet.</p>
                    <p className="text-slate-400 text-xs mt-1">Add an address above to expedite checkout settlement.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-slate-400 mb-3">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 leading-normal">{addr.street}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-1">
                            {addr.city}, {addr.state} - {addr.zipCode}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{addr.country}</p>
                        </div>

                        {/* Address Action Controls */}
                        <div className="flex items-center gap-2 border-t border-slate-50 pt-4 mt-5">
                          <button
                            onClick={() => startEditAddress(addr)}
                            className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Brand Footer */}
      <footer className="py-6 text-center text-slate-400/80 text-[10px] font-semibold uppercase tracking-widest border-t border-slate-100 bg-white">
        shree ram enterprises — elevating your everyday beauty lifestyle
      </footer>
    </div>
  );
}
