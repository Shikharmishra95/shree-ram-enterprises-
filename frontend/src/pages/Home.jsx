import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import BannerSlider from '../components/BannerSlider';
import FeaturedProducts from '../components/FeaturedProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Heart, SlidersHorizontal, ShoppingBag, LogOut, ShieldAlert, LayoutGrid, ChevronRight } from 'lucide-react';

// Normalizes category strings into one of the 10 professional categories
function normalizeMainCategory(categoryStr) {
  if (!categoryStr) return 'Makeup & More';
  const cat = categoryStr.toLowerCase().replace(/\s+/g, ' ').trim();
  
  if (cat.includes('hair care') || cat.includes('hare care') || cat.includes('hair color') || cat.includes('hair serum') || cat.includes('hair wax') || cat.includes('straightening') || cat.includes('crme color') || cat.includes('hair spray') || cat.includes('wax heater') || cat.includes('depilatory foam')) {
    return 'Hair Care';
  }
  if (cat.includes('skin care') || cat.includes('face wash') || cat.includes('cleanser') || cat.includes('moisturizer') || cat.includes('scrub') || cat.includes('rose water') || cat.includes('face cream')) {
    return 'Skin Care';
  }
  if (cat.includes('face care') || cat.includes('face pack') || cat.includes('face scrub') || cat.includes('facial kit') || cat.includes('talcum powder') || cat.includes('bleach') || cat.includes('de-tan') || cat.includes('massage cream') || cat.includes('toner') || cat.includes('nose strips')) {
    return 'Face Care';
  }
  if (cat.includes('beard care') || cat.includes('beard')) {
    return 'Beard Care';
  }
  if (cat.includes('shaving') || cat.includes('blades')) {
    return 'Shaving';
  }
  if (cat.includes('appliance') || cat.includes('dryer') || cat.includes('steamer') || cat.includes('trimmer') || cat.includes('clipper') || cat.includes('shaver') || cat.includes('massager') || cat.includes('wellness') || cat.includes('equipment')) {
    return 'Appliances';
  }
  if (cat.includes('hair accessories') || cat.includes('clips') || cat.includes('pins')) {
    return 'Hair Accessories';
  }
  if (cat.includes('salon essentials') || cat.includes('disinfectant') || cat.includes('threading')) {
    return 'Salon Essentials';
  }
  if (cat.includes('salon tools') || cat.includes('salon accessories') || cat.includes('salon disposables') || cat.includes('tools') || cat.includes('razor') || cat.includes('brushes') || cat.includes('combs') || cat.includes('bowls') || cat.includes('wipes') || cat.includes('tissue') || cat.includes('gloves') || cat.includes('multi-styler') || cat.includes('cleansing sponge') || cat.includes('scissors') || cat.includes('applicators') || cat.includes('spray bottle') || cat.includes('capes') || cat.includes('hair removal')) {
    return 'Salon Tools';
  }
  if (cat.includes('eyelashes') || cat.includes('makeup') || cat.includes('cosmetic')) {
    return 'Makeup & More';
  }
  
  return 'Makeup & More';
}

// Static representative images for each main category
const CATEGORY_IMAGES = {
  'Hair Care':        'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&auto=format&fit=crop&q=80',
  'Face Care':        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
  'Shaving':          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80',
  'Appliances':       'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
  'Salon Tools':      'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=300&auto=format&fit=crop&q=80',
  'Skin Care':        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&auto=format&fit=crop&q=80',
  'Beard Care':       'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&auto=format&fit=crop&q=80',
  'Salon Essentials': 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&auto=format&fit=crop&q=80',
  'Hair Accessories': 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=300&auto=format&fit=crop&q=80',
  'Makeup & More':    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&auto=format&fit=crop&q=80',
};

const CATEGORY_DESCRIPTIONS = {
  'Hair Care':        'Color, serums, wax & styling',
  'Face Care':        'Bleach, scrubs, face packs & kits',
  'Shaving':          'Blades, creams & beard care',
  'Appliances':       'Dryers, trimmers, steamers & more',
  'Salon Tools':      'Tools, accessories & salon essentials',
  'Skin Care':        'Creams, lotions & face washes',
  'Beard Care':       'Beard wash, oil & colors',
  'Salon Essentials': 'Disinfectants, towels & threading thread',
  'Hair Accessories': 'Clips, pins & styling accessories',
  'Makeup & More':    'False lashes, makeup & cosmetics',
};

// Get category image with fallbacks
function getCategoryImage(cat, firstProductImg = null) {
  try {
    const localShowcase = localStorage.getItem('category_showcase_images');
    if (localShowcase) {
      const parsed = JSON.parse(localShowcase);
      if (parsed[cat]) return parsed[cat];
    }
  } catch (e) {
    console.error('Failed to parse category showcase images:', e);
  }
  if (CATEGORY_IMAGES[cat]) return CATEGORY_IMAGES[cat];
  if (firstProductImg) return firstProductImg;
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden animate-pulse shadow-sm">
      <div className="aspect-square bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 rounded-lg w-full" />
        <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-4">
          <div className="h-6 bg-slate-100 rounded-lg w-16" />
          <div className="h-9 bg-slate-100 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

function ErrorFallback({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
        <ShieldAlert className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Products</h2>
      <p className="text-slate-500 text-center max-w-sm mb-6 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary hover:bg-primary-dark active:scale-95 text-white text-sm font-semibold rounded-2xl cursor-pointer flex items-center gap-2 shadow-lg shadow-primary/10 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-emerald-50/50 rounded-full flex items-center justify-center mb-6 border border-emerald-50">
        <ShoppingBag className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">No Matching Products</h2>
      <p className="text-slate-500 text-center max-w-sm mb-6 text-sm">
        We couldn't find anything matching your filters or query. Try adjusting your search query or selecting a different category.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-primary text-xs font-bold rounded-xl cursor-pointer transition-all"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}

// ── All Categories Browse Page ────────────────────────────────────────────────
function AllCategoriesView({ mainCategories, getSubcategoriesForCat, onSelectCategory, onSelectSubcategory }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">All Categories</h2>
          <p className="text-slate-400 text-sm mt-1">Browse all {mainCategories.length} product categories</p>
        </div>
      </div>

      <div className="space-y-10">
        {mainCategories.map((cat, idx) => {
          const subcats = getSubcategoriesForCat(cat);
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => onSelectCategory(cat)}
                className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 transition-colors cursor-pointer group text-left"
              >
                {/* Category image */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-xs">
                  <img
                    src={getCategoryImage(cat, subcats[0]?.image)}
                    alt={cat}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-slate-800 group-hover:text-primary transition-colors">
                    {cat}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{CATEGORY_DESCRIPTIONS[cat] || 'Essentials & cosmetic supplies'}</p>
                  <p className="text-[10px] text-primary/70 font-bold mt-1 uppercase tracking-wider">
                    {subcats.length} subcategories
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/8 rounded-xl text-primary text-xs font-bold shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                  View All
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Subcategory chips */}
              {subcats.length > 0 && (
                <div className="px-5 pb-5 border-t border-slate-50 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Subcategories</p>
                  <div className="flex flex-wrap gap-2.5">
                    {subcats.map((subcat) => (
                      <button
                        key={subcat.fullName}
                        onClick={() => onSelectSubcategory(cat, subcat.fullName)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-slate-600 text-[11px] font-semibold transition-all cursor-pointer group/chip"
                      >
                        {subcat.image && (
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 shrink-0">
                            <img
                              src={subcat.image}
                              alt={subcat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <span className="capitalize">{subcat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalCartItems } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWishlistOnly = searchParams.get('wishlist') === 'true';

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 'products' = normal product grid, 'categories' = all categories browse page
  const [viewMode, setViewMode] = useState('products');

  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState([]);

  const fetchProducts = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/api/products', {
        params: { page: pageNum, size: 200, sort: 'id,asc' },
      });
      setProducts(response.data.content);
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('The server appears to be offline. Please ensure the backend is running on localhost:8080.');
      } else {
        setError(err.response?.data?.message || 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWishlist = useCallback(() => {
    const saved = localStorage.getItem('wishlist');
    const wishlist = saved ? JSON.parse(saved) : [];
    setWishlistIds(wishlist);
    setWishlistCount(wishlist.length);
  }, []);

  useEffect(() => {
    fetchProducts(0);
    updateWishlist();
    window.addEventListener('wishlist-update', updateWishlist);
    return () => window.removeEventListener('wishlist-update', updateWishlist);
  }, [fetchProducts, updateWishlist]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const parseCategory = useCallback((categoryStr) => {
    if (!categoryStr) return { main: 'Other', sub: 'General' };
    
    let mainRaw = 'Other';
    let sub = categoryStr;

    // Check if it has a dash delimiter (e.g. "Hair Care - Hair Color")
    if (categoryStr.includes(' - ')) {
      const parts = categoryStr.split(' - ');
      mainRaw = parts[0].trim();
      sub = parts[1].trim();
    }
    // Check if it has a greater than delimiter (e.g. "Hair Care > Hair Color")
    else if (categoryStr.includes(' > ')) {
      const parts = categoryStr.split(' > ');
      mainRaw = parts[0].trim();
      sub = parts[1].trim();
    }
    else {
      mainRaw = categoryStr;
    }

    // Normalize main raw category using our standard mapping
    const main = normalizeMainCategory(mainRaw);
    return { main, sub };
  }, []);

  const getGroupedCategory = useCallback((categoryStr) => {
    return parseCategory(categoryStr).main;
  }, [parseCategory]);

  // Build main category list dynamically from products
  const mainCategories = useCallback(() => {
    return [
      'Hair Care', 
      'Face Care', 
      'Shaving', 
      'Appliances', 
      'Salon Tools', 
      'Skin Care', 
      'Beard Care', 
      'Salon Essentials', 
      'Hair Accessories', 
      'Makeup & More'
    ];
  }, []);

  // Get subcategories for a specific parent category
  const getSubcategoriesForCat = useCallback((parentCat) => {
    const catProducts = products.filter(p => getGroupedCategory(p.category) === parentCat);
    const uniqueSubcats = Array.from(new Set(catProducts.map(p => p.category || 'General')));
    return uniqueSubcats.map(subcat => {
      const firstProduct = catProducts.find(p => (p.category || 'General') === subcat);
      const parsed = parseCategory(subcat);
      return { 
        name: parsed.sub, 
        fullName: subcat,
        image: firstProduct?.imageUrl || null 
      };
    });
  }, [products, getGroupedCategory, parseCategory]);

  // Get subcategory chips for the current selected category (for product mode)
  const getSubcategories = useCallback(() => {
    const parentCats = selectedCategory === 'All' ? mainCategories() : [selectedCategory];
    const result = [];
    parentCats.forEach(parentCat => {
      const catProducts = products.filter(p => getGroupedCategory(p.category) === parentCat);
      const uniqueSubcats = Array.from(new Set(catProducts.map(p => p.category || 'General')));
      uniqueSubcats.forEach(subcat => {
        const firstProduct = catProducts.find(p => (p.category || 'General') === subcat);
        const parsed = parseCategory(subcat);
        result.push({ 
          name: parsed.sub, 
          fullName: subcat,
          parentCategory: parentCat, 
          image: firstProduct?.imageUrl || null 
        });
      });
    });
    return result;
  }, [products, selectedCategory, getGroupedCategory, mainCategories, parseCategory]);

  // "All Categories" browse → click a category → go to product grid filtered by that category
  const handleCategoryFromBrowse = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
    setViewMode('products');
  };

  // "All Categories" browse → click a subcategory → go to product grid filtered by that subcategory
  const handleSubcategoryFromBrowse = (parentCat, subcatName) => {
    setSelectedCategory(parentCat);
    setSelectedSubcategory(subcatName);
    setViewMode('products');
  };

  const handleCategoryCircleClick = (cat) => {
    if (cat === 'AllCategories') {
      setViewMode('categories');
      setSelectedCategory('All');
      setSelectedSubcategory('All');
    } else {
      setSelectedCategory(cat);
      setSelectedSubcategory('All');
      setViewMode('products');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSortBy('default');
    setViewMode('products');
  };

  const filteredProducts = products
    .filter((product) => {
      if (isWishlistOnly) {
        return wishlistIds.includes(product.id);
      }
      const groupedCat = getGroupedCategory(product.category);
      const categoryMatch = selectedCategory === 'All' || groupedCat === selectedCategory;
      const subcatMatch =
        selectedSubcategory === 'All' ||
        (product.category || 'General') === selectedSubcategory;
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = product.name?.toLowerCase().includes(query);
      const descMatch = product.description?.toLowerCase().includes(query);
      const catMatch = product.category?.toLowerCase().includes(query);
      return categoryMatch && subcatMatch && (nameMatch || descMatch || catMatch);
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const gridVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const isAllCategoriesMode = viewMode === 'categories';
  const activeCircle = isAllCategoriesMode ? 'AllCategories' : selectedCategory;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Navigation Bar ─────────────────────────────────────────────── */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-lg font-black text-slate-800 tracking-tight">Shree Ram Enterprises</span>
            </div>

            {/* Navigation links */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Wishlist */}
              {!isAdmin && (
                <div className="hidden sm:flex relative p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors shadow-xs bg-slate-50 border border-slate-100/50">
                  <Heart className="w-4 h-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              )}

              {/* Cart */}
              {!isAdmin && (
                <Link
                  to="/cart"
                  className="hidden sm:flex relative p-2.5 text-slate-500 hover:text-primary rounded-xl hover:bg-slate-100 cursor-pointer transition-colors shadow-xs bg-slate-50 border border-slate-100/50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-white">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  {/* Admin Dashboard */}
                  {user?.role === 'ROLE_ADMIN' && (
                    <Link
                      to="/admin"
                      className="hidden md:flex px-3.5 py-2 text-xs font-bold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl cursor-pointer items-center gap-1.5 transition-all shadow-inner"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Admin Console
                    </Link>
                  )}

                  {/* My Orders */}
                  {!isAdmin && (
                    <Link
                      to="/orders"
                      className="hidden sm:flex px-3.5 py-2 text-xs font-bold text-slate-600 border border-slate-200/60 hover:bg-slate-50 bg-white rounded-xl cursor-pointer items-center gap-1.5 transition-all shadow-xs"
                    >
                      My Orders
                    </Link>
                  )}

                  <span className="hidden sm:inline w-px h-5 bg-slate-200/80" />

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

                  {/* Logout */}
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
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl cursor-pointer transition-all shadow-md shadow-primary/10"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {isWishlistOnly ? (
          <div className="text-center mb-10 mt-6 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Your Wishlist</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Your saved professional cosmetics & supplies</p>
          </div>
        ) : (
          <>
            {/* Header Panel */}
            <div className="flex flex-col items-center justify-center text-center mb-12 mt-4">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4"
              >
                Premium <span className="text-primary bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-3xl shadow-inner">Salon &amp; Cosmetic</span> Supplies
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-slate-500 max-w-xl text-sm leading-relaxed mb-8"
              >
                Authorized B2B distributor of professional appliances, hair styling wax, shaving kits, and premium salon tools.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="w-full max-w-2xl relative shadow-lg hover:shadow-xl rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-xl p-2.5 flex items-center gap-2.5 mb-8 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary focus-within:bg-white transition-all duration-300"
              >
                <div className="pl-3.5 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search appliances, face wash, wax, clippers, salon tools..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (isAllCategoriesMode) setViewMode('products'); }}
                  className="flex-grow bg-transparent border-0 outline-none text-slate-800 placeholder-slate-400 text-sm py-1.5"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>

              {/* ── Banner Slider — between Search Bar and Category Circles ── */}
              <BannerSlider />

              {/* ── Category Circle Selectors ─────────────────────────────── */}
              <div className="w-full mb-4 mt-2">
                <h3 className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Shop by Category</h3>
                <div className="flex items-start gap-5 overflow-x-auto py-3 scrollbar-none justify-start sm:justify-center">

                  {/* 1st: All Products */}
                  <button
                    onClick={() => handleCategoryCircleClick('All')}
                    className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none shrink-0 group"
                  >
                    <div className={`w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300 ${
                      activeCircle === 'All'
                        ? 'border-primary ring-4 ring-primary/15 scale-105 shadow-md'
                        : 'border-slate-200 group-hover:border-primary/40 shadow-xs'
                    }`}>
                      <ShoppingBag className={`w-7 h-7 transition-colors ${activeCircle === 'All' ? 'text-primary' : 'text-slate-400 group-hover:text-primary/70'}`} />
                    </div>
                    <span className={`text-[11px] font-bold whitespace-nowrap transition-colors ${activeCircle === 'All' ? 'text-primary font-black' : 'text-slate-500 group-hover:text-slate-800'}`}>
                      All
                    </span>
                  </button>

                  {/* Middle: Dynamic main category circles */}
                  {mainCategories().map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryCircleClick(cat)}
                      className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none shrink-0 group"
                    >
                      <div className={`w-[72px] h-[72px] rounded-full overflow-hidden border-2 transition-all duration-300 ${
                        activeCircle === cat
                          ? 'border-primary ring-4 ring-primary/15 scale-105 shadow-md'
                          : 'border-slate-200 group-hover:border-primary/40 shadow-xs'
                      }`}>
                        <img
                          src={getCategoryImage(cat, getSubcategoriesForCat(cat)[0]?.image)}
                          alt={cat}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <span className={`text-[11px] font-bold whitespace-nowrap transition-colors ${activeCircle === cat ? 'text-primary font-black' : 'text-slate-500 group-hover:text-slate-800'}`}>
                        {cat}
                      </span>
                    </button>
                  ))}

                  {/* Last: All Categories */}
                  <button
                    onClick={() => handleCategoryCircleClick('AllCategories')}
                    className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none shrink-0 group"
                  >
                    <div className={`w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      activeCircle === 'AllCategories'
                        ? 'border-primary ring-4 ring-primary/15 scale-105 shadow-md bg-primary'
                        : 'border-slate-200 group-hover:border-primary/40 shadow-xs bg-gradient-to-br from-slate-100 to-slate-50'
                    }`}>
                      <LayoutGrid className={`w-7 h-7 transition-colors ${activeCircle === 'AllCategories' ? 'text-white' : 'text-slate-400 group-hover:text-primary/70'}`} />
                    </div>
                    <span className={`text-[11px] font-bold whitespace-nowrap transition-colors ${activeCircle === 'AllCategories' ? 'text-primary font-black' : 'text-slate-500 group-hover:text-slate-800'}`}>
                      All Categories
                    </span>
                  </button>

                </div>
              </div>

      {/* Sort / Count Row */}
      {!isAllCategoriesMode && !isWishlistOnly && (
        <div className="w-full flex justify-end pt-4 mb-8">
          <div className="relative flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-slate-600 outline-none cursor-pointer pr-1"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Best Rating</option>
            </select>
          </div>
        </div>
      )}
        </div>
      </>
    )}

        {/* ── Featured Products Showcase (below categories, above product grid) ── */}
        {!isAllCategoriesMode && selectedCategory === 'All' && !searchQuery && !isWishlistOnly && (
          <FeaturedProducts />
        )}

        {/* ── ALL CATEGORIES BROWSE VIEW ─────────────────────────────── */}
        {isAllCategoriesMode && !loading && !error && (
          <AllCategoriesView
            mainCategories={mainCategories()}
            getSubcategoriesForCat={getSubcategoriesForCat}
            onSelectCategory={handleCategoryFromBrowse}
            onSelectSubcategory={handleSubcategoryFromBrowse}
          />
        )}

        {/* ── PRODUCT GRID VIEW ──────────────────────────────────────── */}
        {!isAllCategoriesMode && (
          <>
            {error && !loading && (
              <ErrorFallback message={error} onRetry={() => fetchProducts(0)} />
            )}

            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </motion.div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <EmptyState onClear={handleResetFilters} />
            )}
          </>
        )}
      </main>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
