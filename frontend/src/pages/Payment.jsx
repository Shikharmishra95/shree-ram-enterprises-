import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import { CreditCard, Landmark, Wallet, QrCode, Lock, CheckCircle2, ArrowLeft, Terminal, AlertTriangle } from 'lucide-react';

export default function Payment() {
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const orderData = location.state?.orderData;
  const selectedOrderTotal = orderData ? orderData.totalAmount : 0;

  // Tabs: 'card' | 'netbanking' | 'wallet' | 'upi'
  const [activeTab, setActiveTab] = useState('card');

  // Input states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [upiId, setUpiId] = useState('');

  // Transaction States
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Protect route if no orderData is found
  useEffect(() => {
    if (!orderData) {
      navigate('/cart');
    }
  }, [orderData, navigate]);

  // Format Card Number (adds space after every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formattedValue);
  };

  // Format Expiry (MM / YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)} / ${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  // Format CVV (3 digits)
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const handlePay = (e) => {
    e.preventDefault();

    // Validations based on active tab
    if (activeTab === 'card') {
      if (cardNumber.length < 19) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (expiry.length < 7) {
        setErrorMessage('Please enter card expiry (MM / YY).');
        return;
      }
      if (cvv.length < 3) {
        setErrorMessage('Please enter a valid 3-digit CVV.');
        return;
      }
      if (!cardName.trim()) {
        setErrorMessage("Please enter the cardholder's name.");
        return;
      }
    } else if (activeTab === 'netbanking' && !selectedBank) {
      setErrorMessage('Please select a banking partner to proceed.');
      return;
    } else if (activeTab === 'wallet' && !selectedWallet) {
      setErrorMessage('Please select an active e-wallet.');
      return;
    } else if (activeTab === 'upi' && (!upiId.trim() || !upiId.includes('@'))) {
      setErrorMessage('Please enter a valid UPI ID (e.g. user@okaxis).');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);
    setTerminalLogs(['Connecting securely to payment gateway...']);

    // Log streaming simulation
    const logs = [
      'Establishing secure SSL/TLS v1.3 handshake...',
      'Encrypting payment tokens & attributes...',
      'Authorizing transaction with Bank gateway...',
      'Awaiting banking settlement confirmation...',
      'Transaction approved. Writing ledger records...'
    ];

    logs.forEach((logText, index) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, logText]);
      }, (index + 1) * 350);
    });

    const payload = {
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId: 'pay_mock_' + Date.now(),
      razorpaySignature: 'sig_mock_' + Math.random().toString(36).substring(2, 12)
    };

    const executeVerification = async () => {
      try {
        // Wait for logs to finish simulating
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        await API.post('/api/orders/verify', payload);

        setIsProcessing(false);
        setIsSuccess(true);
        fetchCart();

        // Redirect to orders directory after brief success showcase
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 2500);

      } catch (err) {
        console.error('Payment verification failed:', err);
        setIsProcessing(false);
        setErrorMessage(err.response?.data?.message || 'Verification Failed. Please verify your payment parameters.');
      }
    };

    executeVerification();
  };

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-surface text-text-primary flex flex-col font-sans">
      {/* Mini Razorpay Navbar */}
      <nav className="bg-surface-light border-b border-border py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#25D366] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm">S</div>
            <span className="font-bold text-text-primary tracking-tight">Shree Ram Pay <span className="text-primary font-bold text-[10px] border border-primary/20 px-1.5 py-0.5 rounded ml-1 bg-primary/5">Hosted</span></span>
          </div>
          <Link to="/cart" className="text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancel & Return
          </Link>
        </div>
      </nav>

      {/* Main Payment UI Container */}
      <main className="flex-grow flex items-center justify-center p-4 py-8 sm:py-16">
        <div className="w-full max-w-4xl bg-surface-light rounded-3xl shadow-xl border border-border overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT OPTION PANEL */}
          <div className="w-full md:w-2/5 bg-surface-input/40 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/15 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shadow-xs">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-none">
                  <h3 className="font-bold text-text-primary text-sm">Shree Ram Enterprises</h3>
                  <p className="text-text-muted text-[10px] font-bold mt-1 uppercase tracking-wider">{user?.username}</p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">ALL PAYMENT OPTIONS</span>
              <div className="mt-4 space-y-2.5">
                {/* Credit/Debit Card Option */}
                <button
                  onClick={() => { setActiveTab('card'); setErrorMessage(''); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                    activeTab === 'card'
                      ? 'bg-surface-light border-primary shadow-sm ring-2 ring-primary/10'
                      : 'bg-transparent border-border hover:border-border-focus'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'card' ? 'bg-primary/10 text-primary' : 'bg-surface-input text-text-muted'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs md:text-sm">Credit/Debit Card</h4>
                    <p className="text-[9px] text-text-muted mt-0.5 font-bold leading-none uppercase tracking-wider">Visa, Mastercard, RuPay</p>
                  </div>
                </button>

                {/* Netbanking Option */}
                <button
                  onClick={() => { setActiveTab('netbanking'); setErrorMessage(''); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                    activeTab === 'netbanking'
                      ? 'bg-surface-light border-primary shadow-sm ring-2 ring-primary/10'
                      : 'bg-transparent border-border hover:border-border-focus'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'netbanking' ? 'bg-primary/10 text-primary' : 'bg-surface-input text-text-muted'}`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs md:text-sm">Netbanking</h4>
                    <p className="text-[9px] text-text-muted mt-0.5 font-bold leading-none uppercase tracking-wider">Direct Internet Banking</p>
                  </div>
                </button>

                {/* Wallet Option */}
                <button
                  onClick={() => { setActiveTab('wallet'); setErrorMessage(''); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                    activeTab === 'wallet'
                      ? 'bg-surface-light border-primary shadow-sm ring-2 ring-primary/10'
                      : 'bg-transparent border-border hover:border-border-focus'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'wallet' ? 'bg-primary/10 text-primary' : 'bg-surface-input text-text-muted'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs md:text-sm">E-Wallet</h4>
                    <p className="text-[9px] text-text-muted mt-0.5 font-bold leading-none uppercase tracking-wider">Paytm, PhonePe, Mobikwik</p>
                  </div>
                </button>

                {/* UPI Option */}
                <button
                  onClick={() => { setActiveTab('upi'); setErrorMessage(''); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                    activeTab === 'upi'
                      ? 'bg-surface-light border-primary shadow-sm ring-2 ring-primary/10'
                      : 'bg-transparent border-border hover:border-border-focus'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'upi' ? 'bg-primary/10 text-primary' : 'bg-surface-input text-text-muted'}`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs md:text-sm">UPI QR / Address</h4>
                    <p className="text-[9px] text-text-muted mt-0.5 font-bold leading-none uppercase tracking-wider">BHIM, Google Pay, PhonePe</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border hidden md:block">
              <span className="text-[10px] text-text-muted font-bold flex items-center gap-1.5 justify-center uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-primary" />
                100% PCI-DSS Secure Compliance
              </span>
            </div>
          </div>

          {/* RIGHT CONTEXT PANEL */}
          <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
            {/* Amount Payable Title */}
            <div className="pb-6 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-text-muted font-bold text-xs tracking-wider uppercase">Amount payable</p>
                <h2 className="text-2xl md:text-3xl font-black text-text-primary mt-1">₹{Number(selectedOrderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Secure Test Mode
              </div>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="mt-4 p-3.5 bg-danger-bg border border-danger/25 rounded-2xl text-danger text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Forms mapped to selection */}
            <form onSubmit={handlePay} className="flex-1 mt-6">
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-3 rounded-2xl border border-border text-text-primary bg-surface-input placeholder-text-muted font-mono focus:border-primary focus:bg-surface-light focus:ring-1 focus:ring-primary outline-none transition-all"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 font-bold text-[9px]">
                        <span className="bg-surface px-1.5 py-0.5 rounded border border-border">VISA</span>
                        <span className="bg-surface px-1.5 py-0.5 rounded border border-border">MC</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full px-4 py-3 rounded-2xl border border-border text-text-primary bg-surface-input placeholder-text-muted focus:border-primary focus:bg-surface-light focus:ring-1 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">CVV Code</label>
                      <input
                        type="password"
                        placeholder="***"
                        value={cvv}
                        onChange={handleCvvChange}
                        className="w-full px-4 py-3 rounded-2xl border border-border text-text-primary bg-surface-input placeholder-text-muted font-mono tracking-widest focus:border-primary focus:bg-surface-light focus:ring-1 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Cardholder's Name</label>
                    <input
                      type="text"
                      placeholder="Ujjwal Mishra"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-border text-text-primary bg-surface-input placeholder-text-muted focus:border-primary focus:bg-surface-light focus:ring-1 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {activeTab === 'netbanking' && (
                <div className="space-y-4">
                  <span className="block text-text-muted text-xs font-bold uppercase tracking-wider">Popular Banks</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'sbi', name: 'SBI' },
                      { id: 'hdfc', name: 'HDFC' },
                      { id: 'icici', name: 'ICICI' },
                      { id: 'axis', name: 'AXIS' },
                      { id: 'kotak', name: 'KOTAK' },
                      { id: 'pnb', name: 'PNB' }
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 border rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          selectedBank === bank.id
                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                            : 'bg-surface-input/50 border-border text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        <div className="w-7 h-7 bg-surface-light rounded-full flex items-center justify-center font-black text-[10px] shadow-xs border border-border">
                          {bank.name}
                        </div>
                        <span className="text-[10px] font-bold text-center mt-2 leading-none">{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Or Choose Another Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-border text-text-primary bg-surface-input focus:border-primary focus:bg-surface-light focus:ring-1 focus:ring-primary outline-none transition-all text-xs font-bold cursor-pointer"
                    >
                      <option value="">Select Bank Account</option>
                      <option value="yes">Yes Bank</option>
                      <option value="indusind">IndusInd Bank</option>
                      <option value="boi">Bank of India</option>
                      <option value="canara">Canara Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-4">
                  <span className="block text-text-muted text-xs font-bold uppercase tracking-wider">Popular E-Wallets</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'phonepe', name: 'PhonePe', details: 'Direct Linked Wallet' },
                      { id: 'paytm', name: 'Paytm Wallet', details: 'Pay using Paytm balance' },
                      { id: 'amazon', name: 'Amazon Pay', details: 'Requires Amazon Sign-in' },
                      { id: 'mobikwik', name: 'MobiKwik', details: 'SuperCash & wallet funds' }
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`p-4 border rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                          selectedWallet === w.id
                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                            : 'bg-surface-input/50 border-border text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center font-bold text-[10px] border border-border">W</div>
                        <div>
                          <h5 className="text-[11px] font-bold text-text-primary">{w.name}</h5>
                          <p className="text-[9px] text-text-muted font-bold mt-0.5 leading-none">{w.details}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'upi' && (
                <div className="space-y-5 text-center">
                  <div className="flex justify-center mb-1">
                    <div className="w-24 h-24 bg-surface border border-border rounded-3xl flex items-center justify-center relative p-3 shadow-inner">
                      <div className="grid grid-cols-4 gap-1 w-full h-full opacity-60">
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-transparent"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-transparent"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-transparent"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-transparent"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                        <div className="bg-transparent"></div>
                        <div className="bg-slate-800 rounded-xs"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">SCAN ME</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-text-secondary text-xs leading-normal max-w-xs mx-auto font-medium">Scan QR code using any UPI app or enter your virtual UPI address below.</p>

                  <div className="text-left">
                    <label className="block text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">UPI Address (VPA)</label>
                    <input
                      type="text"
                      placeholder="e.g. user@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-border text-text-primary bg-surface-input placeholder-text-muted focus:border-primary focus:bg-surface-light focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* PAY NOW CTA */}
              <button
                type="submit"
                className="w-full py-4.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer border border-primary-dark/20"
              >
                <Lock className="w-4 h-4 text-white/90" />
                PAY NOW ₹{Number(selectedOrderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* TRANSACTION PROCESSING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
          <div className="w-80 p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center">
            {/* Custom Spinner */}
            <div className="relative w-14 h-14 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-l-primary animate-spin"></div>
            </div>
            
            <h3 className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-primary" />
              Processing Order
            </h3>
            <p className="text-slate-400 text-[10px] font-semibold text-center mt-1 uppercase tracking-wider">Do not close this tab or refresh...</p>

            {/* Terminal logs streaming block */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-5 font-mono text-[9px] text-primary/80 leading-normal h-24 overflow-y-auto shadow-inner select-none">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5 items-start mt-0.5 first:mt-0">
                  <span className="text-slate-600 font-bold shrink-0">&gt;</span>
                  <span className="animate-fade-in">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION SUCCESS OVERLAY */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-sm p-8 text-center flex flex-col items-center">
            
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-xs relative animate-bounce">
              <div className="w-14 h-14 bg-primary/25 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-text-primary tracking-tight">Payment Successful!</h2>
            <p className="text-text-secondary text-xs mt-2 leading-relaxed max-w-xs font-semibold">
              Thank you for your purchase! Synchronizing database registry...
            </p>

            {/* Mini invoice block */}
            <div className="w-full bg-surface-input border border-border rounded-2xl p-4.5 mt-8 text-left space-y-2 select-none shadow-2xs">
              <div className="flex justify-between text-[9px] text-text-muted font-bold uppercase tracking-wider">
                <span>Receipt Key</span>
                <span className="text-text-primary font-mono">pay_mock_{orderData.razorpayOrderId.split('_')[1]}</span>
              </div>
              <div className="flex justify-between text-[9px] text-text-muted font-bold uppercase tracking-wider">
                <span>Verification Order ID</span>
                <span className="text-text-primary font-mono">{orderData.razorpayOrderId}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-xs text-text-secondary font-bold uppercase tracking-wider">
                <span>Settled Amount</span>
                <span className="text-primary font-black">₹{Number(selectedOrderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
