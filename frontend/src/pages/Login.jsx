import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "file:text-foreground placeholder:text-slate-500 selection:bg-emerald-600 selection:text-white dark:bg-slate-900/30 border-slate-800 flex h-10 w-full min-w-0 rounded-xl border bg-transparent px-4 py-2 text-sm shadow-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary/20 focus-visible:ring-primary/10 focus-visible:ring-4 focus-visible:bg-white/[0.08]",
        "aria-invalid:ring-rose-500/20 dark:aria-invalid:ring-rose-500/40 aria-invalid:border-rose-500",
        className
      )}
      {...props}
    />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await API.post('/api/auth/login', {
        username: formData.username,
        password: formData.password,
      });

      const { token, id, username, email, role } = response.data;
      login({ id, username, email, role }, token);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (data.validationErrors) {
          const messages = Object.values(data.validationErrors).join('. ');
          setError(messages);
        } else {
          setError(data.message || 'Invalid username or password');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3D parallax hover effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center font-sans">
      
      {/* ── Background WhatsApp Green/Gold Gradients ─────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-slate-950/40 to-black" />
      
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Top glowing aura (WhatsApp Green) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-emerald-500/15 blur-[90px] pointer-events-none" />
      <motion.div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-emerald-400/10 blur-[70px] pointer-events-none"
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [0.97, 1.03, 0.97]
        }}
        transition={{ 
          duration: 9, 
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
      
      {/* Bottom gold glowing aura */}
      <motion.div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-amber-500/5 blur-[80px] pointer-events-none"
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity,
          repeatType: "mirror",
          delay: 0.5
        }}
      />

      {/* Parallax Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10 px-4"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 12 }}
        >
          <div className="relative group">
            {/* Card glow effect */}
            <motion.div 
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 12px 2px rgba(37,211,102,0.02)",
                  "0 0 18px 5px rgba(226,167,76,0.04)",
                  "0 0 12px 2px rgba(37,211,102,0.02)"
                ],
                opacity: [0.15, 0.35, 0.15]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut", 
                repeatType: "mirror" 
              }}
            />

            {/* Traveling border light beam effect */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60"
                animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
                transition={{ left: { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }, opacity: { duration: 1.4, repeat: Infinity, repeatType: "mirror" } }}
              />
              <motion.div 
                className="absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-60"
                animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
                transition={{ top: { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, delay: 0.7 }, opacity: { duration: 1.4, repeat: Infinity, repeatType: "mirror", delay: 0.7 } }}
              />
            </div>

            {/* Frosted glass card */}
            <div className="relative bg-slate-950/80 backdrop-blur-2xl rounded-2xl p-7 border border-white/[0.04] shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: '32px 32px'
                }}
              />

              {/* Logo & Header */}
              <div className="text-center space-y-1 mb-6">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.7 }}
                  className="mx-auto w-12 h-12 rounded-full border border-emerald-500/20 flex items-center justify-center relative overflow-hidden bg-emerald-500/5"
                >
                  <span className="text-xl font-black text-primary">S</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg font-bold text-white tracking-wide"
                >
                  Shree Ram Enterprises
                </motion.h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  B2B Salon Distributor
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl"
                >
                  <p className="text-rose-400 text-xs font-semibold leading-normal">{error}</p>
                </motion.div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  
                  {/* Username */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/45" />
                    <Input
                      type="text"
                      name="username"
                      required
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10.5 bg-white/[0.02] border-white/5 focus:border-primary/45 text-white placeholder:text-white/20 h-11"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/45" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10.5 pr-10 bg-white/[0.02] border-white/5 focus:border-primary/45 text-white placeholder:text-white/20 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 rounded border-white/10 bg-white/[0.03] checked:bg-primary focus:outline-none transition-all duration-200 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="text-xs text-white/40 hover:text-white/60 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                </div>

                {/* Submit Action Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button mt-4 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur opacity-0 group-hover/button:opacity-50 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative overflow-hidden bg-primary hover:bg-primary-dark text-white font-bold h-11 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 text-sm">
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </div>
                </motion.button>

                <p className="text-center text-xs text-white/40 mt-5 pt-4 border-t border-white/[0.04]">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="font-semibold text-primary hover:text-primary-light transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
