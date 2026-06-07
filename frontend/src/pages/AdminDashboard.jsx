import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import HeyBossModal from '../components/HeyBossModal';
import { 
  LayoutDashboard, List, ShoppingBag, PlusCircle, Users, LogOut, 
  RefreshCw, AlertTriangle, TrendingUp, DollarSign, Package, Edit, 
  Trash2, X, ShieldAlert, ArrowLeft, Search, Plus, Minus,
  Image, Star, Layers, Flag, ToggleLeft, ToggleRight, Globe, Zap
} from 'lucide-react';

// Normalizes category strings into one of the 10 professional categories
function normalizeMainCategory(categoryStr) {
  if (!categoryStr) return 'Other';
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
  if (cat.includes('salon tools') || cat.includes('salon accessories') || cat.includes('salon disposables') || cat.includes('tools') || cat.includes('razor') || cat.includes('brushes') || cat.includes('combs') || cat.includes('bowls') || cat.includes('wipes') || cat.includes('tissue') || cat.includes('gloves') || cat.includes('multi-styler') || cat.includes('cleansing sponge') || cat.includes('scissors') || cat.includes('applicators') || cat.includes('spray bottle') || cat.includes('capes') || cat.includes('eyelashes') || cat.includes('hair removal')) {
    return 'Salon Tools';
  }
  
  return 'Other';
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab navigation: 'analytics' | 'catalog' | 'orders' | 'add-product' | 'users' | 'banners' | 'categories' | 'featured'
  const [activeTab, setActiveTab] = useState('analytics');

  // ── Hey Boss Modal State ──
  const [heyBossShow, setHeyBossShow] = useState(false);
  const [heyBossCount, setHeyBossCount] = useState(0);
  const [heyBossShown, setHeyBossShown] = useState(false);

  // ── Banner CMS State ──
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    imageUrl: '', redirectUrl: '', title: '', slideSpeedMs: 4000, displayOrder: 0, isActive: true
  });
  const [bannerSaving, setBannerSaving] = useState(false);

  // ── Category CMS State ──
  const [cmsCategories, setCmsCategories] = useState([]);
  const [cmsCategoriesLoading, setCmsCategoriesLoading] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', showcasePhotoUrl: '', displayOrder: 0, isActive: true });
  const [catSaving, setCatSaving] = useState(false);

  // ── Featured Products CMS State ──
  const [featuredSaving, setFeaturedSaving] = useState(null); // productId being saved

  // Users state (RBAC)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Products state (Catalog)
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Catalog Filtering States
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('All');
  const [selectedCatalogSubcategory, setSelectedCatalogSubcategory] = useState('All');
  const [selectedCatalogStock, setSelectedCatalogStock] = useState('All');

  const handleCatalogCategoryChange = (val) => {
    setSelectedCatalogCategory(val);
    setSelectedCatalogSubcategory('All');
  };

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    lowStockProducts: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeOrderFilter, setActiveOrderFilter] = useState('ALL'); // 'ALL' | 'NEW' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'

  // Add Product Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stockQuantity: '',
    imageUrl: '',
    category: 'Hair Care'
  });
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  // Category type: 'main' = new top-level category, 'sub' = subcategory of an existing main category
  const [newCategoryType, setNewCategoryType] = useState('main');
  const [parentCategoryForNew, setParentCategoryForNew] = useState('Hair Care');
  // Category showcase image for newly created categories
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [categoryImageDragOver, setCategoryImageDragOver] = useState(false);

  // Product image upload state
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productImageDragOver, setProductImageDragOver] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editImageDragOver, setEditImageDragOver] = useState(false);

  const processEditProductImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditingProduct(ep => ({ ...ep, imageUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };
  const handleEditProductImageInput = (e) => { if (e.target.files?.[0]) processEditProductImageFile(e.target.files[0]); };
  const handleEditProductImageDrop = (e) => {
    e.preventDefault(); setEditImageDragOver(false);
    if (e.dataTransfer.files?.[0]) processEditProductImageFile(e.dataTransfer.files[0]);
  };

  // Banner image upload state & helpers
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [bannerImageDragOver, setBannerImageDragOver] = useState(false);

  const processBannerImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBannerImagePreview(ev.target.result);
      setBannerForm(bf => ({ ...bf, imageUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };
  const handleBannerImageInput = (e) => { if (e.target.files?.[0]) processBannerImageFile(e.target.files[0]); };
  const handleBannerImageDrop = (e) => {
    e.preventDefault(); setBannerImageDragOver(false);
    if (e.dataTransfer.files?.[0]) processBannerImageFile(e.dataTransfer.files[0]);
  };

  // Category Edit state & helpers
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryEditImageDragOver, setCategoryEditImageDragOver] = useState(false);

  const processCategoryEditImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditingCategory(ec => ({ ...ec, showcasePhotoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };
  const handleCategoryEditImageInput = (e) => { if (e.target.files?.[0]) processCategoryEditImageFile(e.target.files[0]); };
  const handleCategoryEditImageDrop = (e) => {
    e.preventDefault(); setCategoryEditImageDragOver(false);
    if (e.dataTransfer.files?.[0]) processCategoryEditImageFile(e.dataTransfer.files[0]);
  };

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch functions
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const response = await API.get('/api/admin/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch admin analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await API.get('/api/products', {
        params: { page: 0, size: 250 },
      });
      setProducts(response.data.content || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const response = await API.get('/api/orders/admin/all');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await API.get('/api/admin/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchProducts();
    fetchOrders();
    fetchUsers();
  }, [fetchAnalytics, fetchProducts, fetchOrders, fetchUsers]);

  useEffect(() => {
    if (location.pathname === '/admin/users') {
      setActiveTab('users');
    }
  }, [location.pathname]);

  // ── Hey Boss: Hit pending-count once on mount ──────────────────────
  useEffect(() => {
    if (heyBossShown) return;
    API.get('/api/admin/orders/pending-count')
      .then(res => {
        const count = res.data?.pendingCount || 0;
        setHeyBossCount(count);
        if (count > 0) {
          setHeyBossShow(true);
          setHeyBossShown(true);
        }
      })
      .catch(() => {}); // Silent fail — don't block dashboard
  }, [heyBossShown]);

  // ── Banner CMS ─────────────────────────────────────────────────────
  const fetchBanners = useCallback(async () => {
    setBannersLoading(true);
    try {
      const res = await API.get('/api/admin/banners');
      setBanners(res.data || []);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setBannersLoading(false);
    }
  }, []);

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    setBannerSaving(true);
    try {
      await API.post('/api/admin/banners', bannerForm);
      setBannerForm({ imageUrl: '', redirectUrl: '', title: '', slideSpeedMs: 4000, displayOrder: 0, isActive: true });
      setBannerImagePreview('');
      fetchBanners();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create banner');
    } finally {
      setBannerSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await API.delete(`/api/admin/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const handleToggleBannerActive = async (banner) => {
    try {
      await API.put(`/api/admin/banners/${banner.id}`, { isActive: !banner.isActive });
      fetchBanners();
    } catch (err) {
      alert('Failed to toggle banner');
    }
  };

  // ── Category CMS ───────────────────────────────────────────────────
  const fetchCmsCategories = useCallback(async () => {
    setCmsCategoriesLoading(true);
    try {
      const res = await API.get('/api/categories');
      setCmsCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setCmsCategoriesLoading(false);
    }
  }, []);

  // ── Auto Fetch for Active Tabs ─────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'banners') {
      fetchBanners();
    } else if (activeTab === 'categories') {
      fetchCmsCategories();
    }
  }, [activeTab, fetchBanners, fetchCmsCategories]);

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setCatSaving(true);
    try {
      await API.put(`/api/admin/categories/${editingCategory.id}`, editingCategory);
      setEditingCategory(null);
      fetchCmsCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update category');
    } finally {
      setCatSaving(false);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    try {
      await API.put(`/api/admin/categories/${cat.id}`, { isActive: !cat.isActive });
      fetchCmsCategories();
    } catch (err) {
      alert('Failed to toggle category');
    }
  };

  // ── Featured Products CMS ──────────────────────────────────────────
  const handleToggleFeatured = async (product) => {
    setFeaturedSaving(product.id);
    try {
      const updated = await API.patch(`/api/products/${product.id}/feature`, {
        isFeatured: !product.isFeatured,
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: updated.data.isFeatured } : p));
    } catch (err) {
      alert('Failed to update featured status');
    } finally {
      setFeaturedSaving(null);
    }
  };

  const handleUpdatePriority = async (product, newPriority) => {
    const pIdx = parseInt(newPriority);
    if (isNaN(pIdx) || pIdx < 0) return;
    try {
      const updated = await API.patch(`/api/products/${product.id}/feature`, {
        priorityIndex: pIdx,
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, priorityIndex: updated.data.priorityIndex } : p));
    } catch (err) {
      console.error('Failed to update priority', err);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    setActionLoading(true);
    try {
      await API.put(`/api/admin/users/${userId}/role`, null, {
        params: { role: newRole }
      });
      alert('User role updated successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert(err.response?.data?.error || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Main-category groups (mirrors Home.jsx logic)
  const MAIN_CAT_KEYS = [
    'Hair Care', 'Face Care', 'Shaving', 'Appliances', 'Salon Tools', 
    'Skin Care', 'Beard Care', 'Salon Essentials', 'Hair Accessories'
  ];

  // Handle category showcase image selection (file input or drag-drop)
  const processCategoryImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setCategoryImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCategoryImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleCategoryImageInputChange = (e) => {
    if (e.target.files && e.target.files[0]) processCategoryImageFile(e.target.files[0]);
  };

  const handleCategoryImageDrop = (e) => {
    e.preventDefault();
    setCategoryImageDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processCategoryImageFile(file);
  };

  // Product image upload handlers
  const processProductImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProductImagePreview(ev.target.result);
      setFormData(fd => ({ ...fd, imageUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };
  const handleProductImageInput = (e) => { if (e.target.files?.[0]) processProductImageFile(e.target.files[0]); };
  const handleProductImageDrop = (e) => {
    e.preventDefault(); setProductImageDragOver(false);
    if (e.dataTransfer.files?.[0]) processProductImageFile(e.dataTransfer.files[0]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Build final category string:
    // - existing category → formData.category
    // - new main category → newCategoryName
    // - new subcategory  → "parentCategoryForNew > newCategoryName" style OR just newCategoryName
    //   (subcategory means newCategoryName IS the product.category, which is already the subcategory level)
    let finalCategory;
    if (isCreatingNewCategory) {
      const trimmed = newCategoryName.trim();
      if (!trimmed) {
        setErrorMsg('Category name is required.');
        setActionLoading(false);
        return;
      }
      // If adding as a subcategory, prefix with parent so getGroupedCategory maps it correctly
      // We store just the subcategory name — the parent mapping is in Home.jsx keywords
      finalCategory = trimmed;
    } else {
      finalCategory = formData.category;
    }

    if (!finalCategory) {
      setErrorMsg('Category name is required.');
      setActionLoading(false);
      return;
    }

    // If a category showcase image was chosen and no product imageUrl given, use it as the product image
    const finalImageUrl = formData.imageUrl.trim() ||
      (categoryImagePreview ? categoryImagePreview : '/product/placeholder.jpg');

    try {
      await API.post('/api/products', {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : null,
        stockQuantity: Math.floor(Number(formData.stockQuantity)),
        imageUrl: finalImageUrl,
        category: finalCategory
      });

      setSuccessMsg('Product Added Successfully!');
      alert('Product Added Successfully!');
      setFormData({
        name: '', description: '', price: '', mrp: '',
        stockQuantity: '', imageUrl: '', category: 'Hair Care'
      });
      setNewCategoryName('');
      setIsCreatingNewCategory(false);
      setNewCategoryType('main');
      setParentCategoryForNew('Hair Care');
      setCategoryImageFile(null);
      setCategoryImagePreview('');
      setProductImagePreview('');
      fetchProducts();
      fetchAnalytics();
      setActiveTab('catalog');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to add product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this product?')) return;
    try {
      await API.delete(`/api/products/${productId}`);
      alert('Product Deleted Successfully!');
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const handleUpdateStock = async (productId, quantityChange) => {
    try {
      await API.patch(`/api/products/${productId}/stock`, { quantityChange });
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update stock quantity.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await API.put(`/api/products/${editingProduct.id}`, editingProduct);
      alert('Product updated successfully!');
      setEditingProduct(null);
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update product details.');
    }
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

  // Compile list of unique main categories dynamically
  const uniqueMainCategories = [
    'Hair Care', 'Face Care', 'Shaving', 'Appliances', 'Salon Tools', 'Other',
    ...new Set(products.map(p => getGroupedCategory(p.category)).filter(Boolean))
  ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

  // Compile list of unique subcategories for the selected main category
  const uniqueSubcategories = [
    ...new Set(
      products
        .filter(p => selectedCatalogCategory === 'All' || getGroupedCategory(p.category) === selectedCatalogCategory)
        .map(p => p.category)
        .filter(Boolean)
    )
  ];

  // Compile flat unique categories list for edit product selection dropdown
  const uniqueCategories = [
    'Hair Care - Hair Color', 'Hair Care - Hair Serum', 'Hair Care - Hair Wax', 'Hair Care - Straightening Kit',
    'Face Care - Face Scrub', 'Face Care - Face Pack', 'Face Care - Facial Kit', 'Face Care - Bleach Cream',
    'Shaving - Shaving Cream', 'Shaving - Shaving Gel', 'Shaving - Shaving Foam', 'Shaving - After Shave',
    ...new Set(products.map(p => p.category).filter(Boolean))
  ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

  // Filters for Catalog Management (Tab 2)
  const filteredCatalog = products.filter((p) => {
    const matchesMainCategory = selectedCatalogCategory === 'All' || getGroupedCategory(p.category) === selectedCatalogCategory;
    const matchesSubcategory = selectedCatalogSubcategory === 'All' || p.category === selectedCatalogSubcategory;
    
    let matchesStock = true;
    if (selectedCatalogStock === 'InStock') matchesStock = p.stockQuantity > 0;
    else if (selectedCatalogStock === 'LowStock') matchesStock = p.stockQuantity > 0 && p.stockQuantity <= 5;
    else if (selectedCatalogStock === 'OutOfStock') matchesStock = p.stockQuantity === 0;

    const search = catalogSearchQuery.toLowerCase().trim();
    const matchesSearch = !search || 
      p.name?.toLowerCase().includes(search) || 
      p.category?.toLowerCase().includes(search) ||
      String(p.id).includes(search);
      
    return matchesMainCategory && matchesSubcategory && matchesStock && matchesSearch;
  });

  // Groups Catalog Items by parsed Main Category, then Subcategory
  const groupedCatalog = filteredCatalog.reduce((groups, p) => {
    const main = getGroupedCategory(p.category);
    const parsed = parseCategory(p.category);
    const sub = parsed.sub || 'General';
    if (!groups[main]) groups[main] = {};
    if (!groups[main][sub]) groups[main][sub] = [];
    groups[main][sub].push(p);
    return groups;
  }, {});

  // Filters for Orders Fulfillment (Tab 3)
  const filteredOrders = orders.filter((o) => {
    if (activeOrderFilter === 'ALL') return true;
    if (activeOrderFilter === 'NEW') return o.status === 'PAID' || o.status === 'PENDING';
    return o.status === activeOrderFilter;
  });

  // Count metrics for order fulfillment filters
  const ordersCountNew = orders.filter(o => o.status === 'PAID' || o.status === 'PENDING').length;
  const ordersCountProcessing = orders.filter(o => o.status === 'PROCESSING').length;
  const ordersCountShipped = orders.filter(o => o.status === 'SHIPPED').length;
  const ordersCountDelivered = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-45 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-bold text-slate-700">Back to Store</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8.5 h-8.5 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <span className="text-sm font-semibold text-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left leading-none">
                  <p className="text-xs font-bold text-slate-800">{user?.username}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin Console</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 text-xs font-bold text-danger hover:bg-danger-bg rounded-xl transition-all cursor-pointer border border-danger/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sub Navigation Tabs */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 h-14 overflow-x-auto scrollbar-none">
          {[
            { id: 'analytics', label: 'Dashboard & Analytics', icon: LayoutDashboard },
            { id: 'catalog', label: 'Manage Catalog', icon: List },
            { id: 'orders', label: 'Orders Fulfillment', icon: ShoppingBag },
            { id: 'add-product', label: 'Add New Product', icon: PlusCircle },
            { id: 'users', label: 'User Roles (RBAC)', icon: Users },
            { id: 'banners', label: '🖼 Banner Engine', icon: Image },
            { id: 'categories', label: '🗂 Categories', icon: Layers },
            { id: 'featured', label: '⭐ Featured Products', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-full border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'border-slate-850 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: ANALYTICS & DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-slide-up">
            {/* Summary Widget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sales Card */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-emerald-50 text-primary rounded-2xl flex items-center justify-center border border-primary/10">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Sales (Paid)</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    ₹{Number(analytics.totalRevenue || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
              </div>

              {/* Orders count */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/10">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{analytics.totalOrders}</h3>
                </div>
              </div>

              {/* Low stock indicators */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  analytics.lowStockProducts?.length > 0 ? 'bg-rose-50 text-danger border-rose-100 animate-pulse' : 'bg-emerald-50 text-primary border-emerald-100'
                }`}>
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Low Stock Items</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{analytics.lowStockProducts?.length || 0}</h3>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {analytics.lowStockProducts?.length > 0 && (
              <div className="bg-rose-50/20 border border-rose-100 rounded-3xl p-6">
                <h3 className="text-base font-bold text-rose-600 flex items-center gap-2 mb-4 uppercase tracking-wider">
                  <AlertTriangle className="w-5 h-5" />
                  Live Warehouse Re-Order Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.lowStockProducts.map((p) => (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                      <div className="min-w-0">
                        <p className="text-slate-800 font-bold truncate text-xs">{p.name}</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Stock Level: <span className="text-rose-600 font-black">{p.stockQuantity}</span></p>
                      </div>
                      <button
                        onClick={() => handleUpdateStock(p.id, 10)}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/25 text-primary border border-primary/15 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Restock +10
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-4">Consolidated Operations Overview</h3>
              <p className="text-slate-500 leading-relaxed max-w-3xl text-sm font-medium">
                Welcome to the Shree Ram Enterprises Administration Engine. Use this tabbed dashboard to manage your professional salon supply catalog, fulfill shopper transactions, restock low inventory quantities, and regulate roles across users in the cluster.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE CATALOG — Premium Overhaul */}
        {activeTab === 'catalog' && (() => {
          const totalProducts = products.length;
          const inStock = products.filter(p => p.stockQuantity > 5).length;
          const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
          const outOfStock = products.filter(p => p.stockQuantity === 0).length;
          const discounted = products.filter(p => p.mrp && Number(p.mrp) > Number(p.price)).length;

          return (
            <div className="space-y-6 animate-slide-up">

              {/* ── Header Row ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manage Catalog</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {totalProducts} products across {Object.keys(groupedCatalog).length} categories
                    {filteredCatalog.length !== totalProducts && (
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{filteredCatalog.length} matching</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setCatalogSearchQuery(''); setSelectedCatalogCategory('All'); setSelectedCatalogSubcategory('All'); setSelectedCatalogStock('All'); }}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3 h-3" /> Clear Filters
                  </button>
                  <button
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
              </div>

              {/* ── Quick Stats Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Total Products', value: totalProducts, color: 'from-violet-500 to-violet-600', icon: '📦', onClick: () => { setSelectedCatalogStock('All'); setSelectedCatalogCategory('All'); } },
                  { label: 'In Stock', value: inStock, color: 'from-emerald-500 to-emerald-600', icon: '✅', onClick: () => setSelectedCatalogStock('InStock') },
                  { label: 'Low Stock', value: lowStock, color: 'from-amber-500 to-amber-600', icon: '⚠️', onClick: () => setSelectedCatalogStock('LowStock') },
                  { label: 'Out of Stock', value: outOfStock, color: 'from-rose-500 to-rose-600', icon: '❌', onClick: () => setSelectedCatalogStock('OutOfStock') },
                  { label: 'Discounted', value: discounted, color: 'from-pink-500 to-pink-600', icon: '🏷️', onClick: () => {} },
                ].map(stat => (
                  <button
                    key={stat.label}
                    onClick={stat.onClick}
                    className={`bg-gradient-to-br ${stat.color} text-white rounded-2xl p-4 text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md`}
                  >
                    <p className="text-2xl mb-1">{stat.icon}</p>
                    <p className="text-2xl font-black leading-none">{stat.value}</p>
                    <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-wider">{stat.label}</p>
                  </button>
                ))}
              </div>

              {/* ── Advanced Filters Bar ── */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-col lg:flex-row items-stretch gap-3">
                  {/* Search */}
                  <div className="flex-1 relative min-w-0">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search product name, ID or category..."
                      value={catalogSearchQuery}
                      onChange={(e) => setCatalogSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                    {/* Main Category */}
                    <div className="relative">
                      <select
                        value={selectedCatalogCategory}
                        onChange={(e) => handleCatalogCategoryChange(e.target.value)}
                        className="appearance-none w-full lg:w-44 pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer transition-all"
                      >
                        <option value="All">🗂 All Categories</option>
                        {uniqueMainCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-3 text-slate-400 text-[10px]">▾</span>
                    </div>

                    {/* Subcategory */}
                    <div className="relative">
                      <select
                        value={selectedCatalogSubcategory}
                        onChange={(e) => setSelectedCatalogSubcategory(e.target.value)}
                        disabled={selectedCatalogCategory === 'All'}
                        className="appearance-none w-full lg:w-44 pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="All">📂 All Subcategories</option>
                        {uniqueSubcategories.map(cat => {
                          const parsed = parseCategory(cat);
                          return <option key={cat} value={cat}>{parsed.sub || cat}</option>;
                        })}
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-3 text-slate-400 text-[10px]">▾</span>
                    </div>

                    {/* Stock Status */}
                    <div className="relative">
                      <select
                        value={selectedCatalogStock}
                        onChange={(e) => setSelectedCatalogStock(e.target.value)}
                        className="appearance-none w-full lg:w-36 pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer transition-all"
                      >
                        <option value="All">📊 All Stock</option>
                        <option value="InStock">✅ In Stock</option>
                        <option value="LowStock">⚠️ Low Stock</option>
                        <option value="OutOfStock">❌ Out of Stock</option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-3 text-slate-400 text-[10px]">▾</span>
                    </div>
                  </div>
                </div>

                {/* Active Filter Pills */}
                {(selectedCatalogCategory !== 'All' || selectedCatalogSubcategory !== 'All' || selectedCatalogStock !== 'All' || catalogSearchQuery) && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active:</span>
                    {catalogSearchQuery && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/8 border border-primary/15 text-primary rounded-full text-[10px] font-bold">
                        🔍 "{catalogSearchQuery}"
                        <button onClick={() => setCatalogSearchQuery('')} className="hover:text-rose-500 cursor-pointer ml-0.5">×</button>
                      </span>
                    )}
                    {selectedCatalogCategory !== 'All' && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 border border-violet-200 text-violet-700 rounded-full text-[10px] font-bold">
                        🗂 {selectedCatalogCategory}
                        <button onClick={() => handleCatalogCategoryChange('All')} className="hover:text-rose-500 cursor-pointer ml-0.5">×</button>
                      </span>
                    )}
                    {selectedCatalogSubcategory !== 'All' && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-bold">
                        📂 {selectedCatalogSubcategory}
                        <button onClick={() => setSelectedCatalogSubcategory('All')} className="hover:text-rose-500 cursor-pointer ml-0.5">×</button>
                      </span>
                    )}
                    {selectedCatalogStock !== 'All' && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-bold">
                        📊 {selectedCatalogStock}
                        <button onClick={() => setSelectedCatalogStock('All')} className="hover:text-rose-500 cursor-pointer ml-0.5">×</button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ── Products Table ── */}
              {productsLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm font-semibold">Loading catalog...</p>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="bg-white border border-slate-100 p-16 text-center rounded-3xl">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="text-slate-800 font-black text-lg">No Products Found</p>
                  <p className="text-slate-400 text-sm font-medium mt-2">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  {/* Table Header */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      {filteredCatalog.length} Products Found
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">Grouped by category</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest select-none">
                          <th className="px-6 py-3.5 w-16">ID</th>
                          <th className="px-4 py-3.5">Product</th>
                          <th className="px-4 py-3.5 w-40">Pricing</th>
                          <th className="px-4 py-3.5 w-36 text-center">Stock</th>
                          <th className="px-4 py-3.5 w-28 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-50">
                        {Object.keys(groupedCatalog).sort().map((mainCat) => (
                          <React.Fragment key={mainCat}>
                            {/* ── Main Category Banner ── */}
                            <tr className="bg-gradient-to-r from-slate-100/80 to-slate-50/50 border-y border-slate-200/60">
                              <td colSpan="5" className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0" />
                                  <span className="font-black text-slate-700 uppercase tracking-widest text-[11px]">{mainCat}</span>
                                  <span className="ml-1 px-2 py-0.5 bg-slate-200/70 text-slate-500 rounded-full text-[9px] font-bold">
                                    {Object.values(groupedCatalog[mainCat]).flat().length} items
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {Object.keys(groupedCatalog[mainCat]).sort().map((subCat) => (
                              <React.Fragment key={subCat}>
                                {/* ── Subcategory Row ── */}
                                <tr className="bg-primary/2 border-b border-primary/5">
                                  <td colSpan="5" className="pl-10 pr-6 py-1.5">
                                    <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">
                                      ↳ {subCat}
                                      <span className="ml-1.5 text-primary/40 font-bold normal-case">({groupedCatalog[mainCat][subCat].length})</span>
                                    </span>
                                  </td>
                                </tr>

                                {/* ── Product Rows ── */}
                                {groupedCatalog[mainCat][subCat].map((p) => {
                                  const disc = p.mrp && Number(p.mrp) > Number(p.price)
                                    ? Math.round(((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100)
                                    : 0;
                                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= 5;
                                  const isOut = p.stockQuantity === 0;
                                  return (
                                    <tr key={p.id} className="hover:bg-slate-50/60 border-b border-slate-50 transition-colors group/row">
                                      <td className="px-6 py-3.5 text-slate-400 font-mono text-[10px] font-bold">#{p.id}</td>

                                      {/* Product */}
                                      <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                          <div className="relative shrink-0">
                                            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
                                              <img
                                                src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=80'}
                                                alt=""
                                                className="w-full h-full object-contain transition-transform duration-300 group-hover/row:scale-110"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=80'; }}
                                              />
                                            </div>
                                            {disc > 0 && (
                                              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black px-1 py-0.5 rounded-md leading-none shadow-sm">{disc}%</span>
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-bold text-slate-800 truncate max-w-[260px] text-[12px]">{p.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                              <span className="text-[9px] font-bold text-primary/80 bg-primary/8 border border-primary/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap max-w-[180px] truncate">{p.category}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Pricing */}
                                      <td className="px-4 py-3.5">
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-slate-800 text-sm">₹{Number(p.price).toLocaleString('en-IN')}</span>
                                            {disc > 0 && (
                                              <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 text-[9px] font-extrabold rounded-md shrink-0">{disc}% OFF</span>
                                            )}
                                          </div>
                                          {p.mrp && Number(p.mrp) > Number(p.price) && (
                                            <p className="text-[10px] text-slate-400 line-through">MRP ₹{Number(p.mrp).toLocaleString('en-IN')}</p>
                                          )}
                                        </div>
                                      </td>

                                      {/* Stock */}
                                      <td className="px-4 py-3.5">
                                        <div className="flex flex-col items-center gap-1.5">
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => handleUpdateStock(p.id, -1)}
                                              className="w-6 h-6 flex items-center justify-center bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg cursor-pointer active:scale-90 transition-all"
                                            >
                                              <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <span className={`w-10 text-center font-black text-sm tabular-nums ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                                              {p.stockQuantity}
                                            </span>
                                            <button
                                              onClick={() => handleUpdateStock(p.id, 1)}
                                              className="w-6 h-6 flex items-center justify-center bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg cursor-pointer active:scale-90 transition-all"
                                            >
                                              <Plus className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            isOut ? 'bg-rose-50 text-rose-500 border border-rose-200' :
                                            isLow ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                            'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                          }`}>
                                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Actions */}
                                      <td className="px-4 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => setEditingProduct(p)}
                                            title="Edit product"
                                            className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/15 hover:border-primary rounded-xl transition-all cursor-pointer"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteProduct(p.id)}
                                            title="Delete product"
                                            className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200 hover:border-rose-500 rounded-xl transition-all cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Showing <span className="font-black text-slate-600">{filteredCatalog.length}</span> of <span className="font-black text-slate-600">{totalProducts}</span> products
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {Object.keys(groupedCatalog).length} categories · {Object.values(groupedCatalog).reduce((a, c) => a + Object.keys(c).length, 0)} subcategories
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 3: ORDERS FULFILLMENT (Screenshots 4 & 5 Match) */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-850 uppercase tracking-wider">Fulfillment & Order History</h2>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-primary/50 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Orders
              </button>
            </div>

            {/* Filter Pills tabs (Screenshot 4 Match) */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {[
                { id: 'ALL', label: 'All', count: orders.length },
                { id: 'NEW', label: 'New Orders', count: ordersCountNew, highlight: true },
                { id: 'PROCESSING', label: 'Processing', count: ordersCountProcessing },
                { id: 'SHIPPED', label: 'Shipped', count: ordersCountShipped },
                { id: 'DELIVERED', label: 'Delivered', count: ordersCountDelivered }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setActiveOrderFilter(pill.id)}
                  className={`px-4.5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeOrderFilter === pill.id
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {pill.label}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    activeOrderFilter === pill.id
                      ? 'bg-white/20 text-white'
                      : pill.highlight && pill.count > 0
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>

            {ordersLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-slate-100 p-12 text-center rounded-3xl">
                <p className="text-slate-500 text-sm font-semibold">No orders match the selected filter.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider select-none">
                        <th className="px-6 py-4">Order ID & Date</th>
                        <th className="px-6 py-4">Customer Details</th>
                        <th className="px-6 py-4">Shipping Destination</th>
                        <th className="px-6 py-4">Total Amount</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Fulfillment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="px-6 py-5">
                            <p className="font-extrabold text-slate-800">#{o.id}</p>
                            <p className="text-slate-400 text-[10px] font-semibold mt-1">
                              {new Date(o.orderDate).toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-extrabold text-slate-800 uppercase">{o.user?.username}</p>
                            <p className="text-slate-500 text-[10px] font-semibold mt-1">
                              {o.phoneNumber || 'No phone number provided'}
                            </p>
                          </td>
                          <td className="px-6 py-5 max-w-xs">
                            <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                              {o.shippingAddress || 'Local Pickup'}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-primary font-black text-sm">
                            ₹{Number(o.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              o.status === 'PAID' || o.status === 'SUCCESS' || o.status === 'DELIVERED' || o.status === 'SHIPPED' || o.status === 'PROCESSING'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {o.status === 'FAILED' ? 'FAILED' : 'PAID'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <select
                              value={o.status === 'PAID' ? 'PLACED' : o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value === 'PLACED' ? 'PAID' : e.target.value)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-800 cursor-pointer transition-colors focus:border-slate-800 outline-none ${
                                o.status === 'PAID' || o.status === 'PENDING'
                                  ? 'text-primary border-primary/20 bg-primary/5'
                                  : o.status === 'PROCESSING'
                                  ? 'text-amber-600 border-amber-200 bg-amber-50/20'
                                  : o.status === 'SHIPPED'
                                  ? 'text-cyan-600 border-cyan-200 bg-cyan-50/20'
                                  : o.status === 'DELIVERED'
                                  ? 'text-success border-success/20 bg-success-bg/10'
                                  : 'text-rose-600 border-rose-200 bg-rose-50/20'
                              }`}
                            >
                              <option value="PLACED">PLACED (New)</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="FAILED">FAILED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADD NEW PRODUCT (Screenshot 3 Match) */}
        {activeTab === 'add-product' && (
          <div className="max-w-2xl mx-auto py-6 animate-slide-up">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
              <h3 className="text-base font-black text-slate-900 mb-6 uppercase tracking-wider">Create New Catalog Product</h3>
              
              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-rose-700 text-xs font-semibold">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-primary text-xs font-semibold">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-6 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Premium Beard Wax"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Category *</label>

                    {/* ── Mode Toggle: Choose existing vs Create new ── */}
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewCategory(false)}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          !isCreatingNewCategory
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewCategory(true)}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          isCreatingNewCategory
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        + New Category
                      </button>
                    </div>

                    {!isCreatingNewCategory ? (
                      /* ── Choose from existing categories ── */
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:border-slate-800 transition-all font-bold cursor-pointer outline-none"
                      >
                        {uniqueCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      /* ── Create new category ── */
                      <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">

                        {/* Main vs Sub toggle */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category Type</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setNewCategoryType('main')}
                              className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                newCategoryType === 'main'
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-primary/50'
                              }`}
                            >
                              🗂 Main Category
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewCategoryType('sub')}
                              className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                newCategoryType === 'sub'
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-amber-400'
                              }`}
                            >
                              📁 Sub Category
                            </button>
                          </div>
                        </div>

                        {/* If subcategory, pick parent */}
                        {newCategoryType === 'sub' && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Parent Category</p>
                            <select
                              value={parentCategoryForNew}
                              onChange={(e) => setParentCategoryForNew(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-xs cursor-pointer outline-none focus:border-amber-400"
                            >
                              {MAIN_CAT_KEYS.map(mk => (
                                <option key={mk} value={mk}>{mk}</option>
                              ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1.5">
                              This product will appear under <span className="font-bold text-amber-600">{parentCategoryForNew}</span> → your new subcategory.
                            </p>
                          </div>
                        )}

                        {/* New category name */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            {newCategoryType === 'sub' ? 'Subcategory Name' : 'Category Name'}
                          </p>
                          <input
                            type="text"
                            required={isCreatingNewCategory}
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={newCategoryType === 'sub' ? `e.g. Hair Serum` : 'e.g. Nail Care'}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-slate-800 transition-all font-semibold outline-none text-xs"
                          />
                        </div>

                        {/* Category Showcase Photo */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Category Showcase Photo
                            {newCategoryType === 'main' && <span className="text-rose-500 ml-1">*</span>}
                          </p>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setCategoryImageDragOver(true); }}
                            onDragLeave={() => setCategoryImageDragOver(false)}
                            onDrop={handleCategoryImageDrop}
                            className={`relative rounded-2xl border-2 border-dashed transition-all ${
                              categoryImageDragOver
                                ? 'border-primary bg-primary/5'
                                : categoryImagePreview
                                  ? 'border-emerald-400 bg-emerald-50/30'
                                  : 'border-slate-300 bg-white hover:border-primary/50'
                            }`}
                          >
                            {categoryImagePreview ? (
                              <div className="relative">
                                <img
                                  src={categoryImagePreview}
                                  alt="Category preview"
                                  className="w-full h-36 object-cover rounded-2xl"
                                />
                                <button
                                  type="button"
                                  onClick={() => { setCategoryImagePreview(''); setCategoryImageFile(null); }}
                                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                  ✓ Photo Ready
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center gap-2 py-8 px-4 cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                  </svg>
                                </div>
                                <p className="text-xs font-bold text-slate-500">Drop image here or <span className="text-primary">browse</span></p>
                                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP — shown in category circle</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCategoryImageInputChange}
                                  className="sr-only"
                                />
                              </label>
                            )}
                          </div>
                          {newCategoryType === 'sub' && (
                            <p className="text-[10px] text-slate-400 mt-1.5">Optional — first product image is used if skipped.</p>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Describe professional usage, key ingredients, size/capacity specifications..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all resize-none font-semibold outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Selling Price (INR) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                      <input
                        type="number" step="0.01" name="price" required
                        value={formData.price} onChange={handleFormChange} placeholder="299.99"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">MRP (Max Retail Price)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                      <input
                        type="number" step="0.01" name="mrp"
                        value={formData.mrp} onChange={handleFormChange} placeholder="399.99 (optional)"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all font-semibold outline-none"
                      />
                    </div>
                    {formData.price && formData.mrp && Number(formData.mrp) > Number(formData.price) && (
                      <p className="text-[10px] mt-1.5 font-bold text-emerald-600">
                        ✓ {Math.round(((Number(formData.mrp) - Number(formData.price)) / Number(formData.mrp)) * 100)}% discount badge will appear on product
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      required
                      value={formData.stockQuantity}
                      onChange={handleFormChange}
                      placeholder="50"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-2">Product Image</label>
                  {/* Drag-and-drop / browse image uploader */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setProductImageDragOver(true); }}
                    onDragLeave={() => setProductImageDragOver(false)}
                    onDrop={handleProductImageDrop}
                    className={`relative rounded-2xl border-2 border-dashed transition-all ${
                      productImageDragOver ? 'border-primary bg-primary/5'
                      : productImagePreview ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50 hover:border-primary/50'
                    }`}
                  >
                    {productImagePreview ? (
                      <div className="relative">
                        <img src={productImagePreview} alt="Preview" className="w-full h-44 object-contain rounded-2xl bg-white p-2" />
                        <button type="button" onClick={() => { setProductImagePreview(''); setFormData(fd => ({ ...fd, imageUrl: '' })); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">✓ Image Ready</div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 py-8 px-4 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-500">Drop image here or <span className="text-primary">browse files</span></p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP supported</p>
                        <input type="file" accept="image/*" onChange={handleProductImageInput} className="sr-only" />
                      </label>
                    )}
                  </div>
                  {/* Also allow URL fallback */}
                  <input
                    type="text"
                    name="imageUrl"
                    value={productImagePreview ? '' : formData.imageUrl}
                    onChange={(e) => { setFormData(fd => ({ ...fd, imageUrl: e.target.value })); setProductImagePreview(''); }}
                    placeholder="Or paste image URL here..."
                    className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all font-semibold outline-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl active:scale-98 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-[10px]"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: USER ROLE MANAGEMENT (RBAC) */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-850 uppercase tracking-wider">Enterprise Role-Based Access Control (RBAC)</h2>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-primary/50 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Users
              </button>
            </div>

            {usersLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white border border-slate-100 p-12 text-center rounded-3xl">
                <p className="text-slate-500 text-sm font-semibold">No registered users found inside database.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider select-none">
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4 text-right">Administrative Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="px-6 py-4 text-slate-400 font-mono">#{u.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{u.username}</td>
                          <td className="px-6 py-4 text-slate-500">{u.email}</td>
                          <td className="px-6 py-4 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                              disabled={actionLoading}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-800 cursor-pointer transition-colors focus:border-slate-800 outline-none ${
                                u.role === 'ROLE_ADMIN'
                                  ? 'text-primary border-primary/30 bg-primary/5'
                                  : 'text-slate-500 border-slate-200 bg-slate-50/50'
                              }`}
                            >
                              <option value="ROLE_USER">USER</option>
                              <option value="ROLE_ADMIN">ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* HEY BOSS MODAL */}
      <HeyBossModal
        show={heyBossShow}
        count={heyBossCount}
        onClose={() => setHeyBossShow(false)}
        onViewOrders={() => setActiveTab('orders')}
      />

      {/* TAB: BANNER ENGINE CMS */}
      {activeTab === 'banners' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Banner Engine</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Manage homepage promotional banners</p>
              </div>
              <button onClick={fetchBanners} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* Add Banner Form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2"><Image className="w-4 h-4 text-primary" /> Add New Banner</h3>
              <form onSubmit={handleCreateBanner} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Banner Image *</label>
                  {/* Drag-and-drop / browse image uploader */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setBannerImageDragOver(true); }}
                    onDragLeave={() => setBannerImageDragOver(false)}
                    onDrop={handleBannerImageDrop}
                    className={`relative rounded-2xl border-2 border-dashed transition-all ${
                      bannerImageDragOver ? 'border-primary bg-primary/5'
                      : bannerImagePreview ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50 hover:border-primary/50'
                    }`}
                  >
                    {bannerImagePreview ? (
                      <div className="relative">
                        <img src={bannerImagePreview} alt="Preview" className="w-full h-32 object-contain rounded-2xl bg-white p-2" />
                        <button type="button" onClick={() => { setBannerImagePreview(''); setBannerForm(bf => ({ ...bf, imageUrl: '' })); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">✓ Image Ready</div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 py-6 px-4 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-500">Drop image here or <span className="text-primary">browse files</span></p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP supported</p>
                        <input type="file" accept="image/*" onChange={handleBannerImageInput} className="sr-only" />
                      </label>
                    )}
                  </div>
                  {/* Also allow URL fallback */}
                  <input
                    type="text"
                    value={bannerImagePreview ? '' : bannerForm.imageUrl}
                    onChange={(e) => { setBannerForm(bf => ({ ...bf, imageUrl: e.target.value })); setBannerImagePreview(''); }}
                    placeholder="Or paste banner image URL here..."
                    className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all font-semibold outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Title (optional)</label>
                  <input type="text" placeholder="Summer Sale!"
                    value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Redirect URL</label>
                  <input type="text" placeholder="/category/hair-care or https://..."
                    value={bannerForm.redirectUrl} onChange={e => setBannerForm({...bannerForm, redirectUrl: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Slide Speed (ms)</label>
                  <input type="number" min="1000" max="15000" step="500"
                    value={bannerForm.slideSpeedMs} onChange={e => setBannerForm({...bannerForm, slideSpeedMs: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Display Order</label>
                  <input type="number" min="0"
                    value={bannerForm.displayOrder} onChange={e => setBannerForm({...bannerForm, displayOrder: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm({...bannerForm, isActive: e.target.checked})}
                      className="w-4 h-4 rounded accent-primary cursor-pointer" />
                    <span className="text-xs font-bold text-slate-700">Active (visible on homepage)</span>
                  </label>
                  <button type="submit" disabled={bannerSaving}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black cursor-pointer disabled:opacity-60 hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all">
                    {bannerSaving ? 'Saving...' : '+ Add Banner'}
                  </button>
                </div>
              </form>
            </div>

            {/* Banners Table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">{banners.length} Banners</p>
              </div>
              {bannersLoading ? (
                <div className="py-12 flex justify-center"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : banners.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm font-semibold">No banners yet. Add one above.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Preview</th>
                        <th className="px-4 py-3">Title / URL</th>
                        <th className="px-4 py-3">Speed</th>
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3 text-center">Active</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {banners.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-4 py-3">
                            <img src={b.imageUrl} alt="" className="w-16 h-10 object-cover rounded-lg border border-slate-200" onError={e => e.target.style.display='none'} />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800 truncate max-w-[200px]">{b.title || '(No title)'}</p>
                            <p className="text-slate-400 text-[10px] truncate max-w-[200px]">{b.redirectUrl || '—'}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-600">{b.slideSpeedMs}ms</td>
                          <td className="px-4 py-3 font-semibold text-slate-600">#{b.displayOrder}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleToggleBannerActive(b)} className={`w-9 h-5 rounded-full transition-all cursor-pointer ${b.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${b.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteBanner(b.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-200 cursor-pointer transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* TAB: CATEGORY CUSTOMIZER */}
      {activeTab === 'categories' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Category Customizer</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Manage home-screen category circles with custom images</p>
              </div>
              <button onClick={fetchCmsCategories} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* Edit Category Form (visible only when editing) */}
            {editingCategory && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Edit Category: {editingCategory.name}
                  </h3>
                  <button onClick={() => setEditingCategory(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleUpdateCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Showcase Photo *</label>
                    {/* Drag-and-drop / browse image uploader */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setCategoryEditImageDragOver(true); }}
                      onDragLeave={() => setCategoryEditImageDragOver(false)}
                      onDrop={handleCategoryEditImageDrop}
                      className={`relative rounded-2xl border-2 border-dashed transition-all ${
                        categoryEditImageDragOver ? 'border-primary bg-primary/5'
                        : editingCategory.showcasePhotoUrl ? 'border-emerald-400 bg-emerald-50/20'
                        : 'border-slate-200 bg-slate-50 hover:border-primary/50'
                      }`}
                    >
                      {editingCategory.showcasePhotoUrl ? (
                        <div className="relative">
                          <img src={editingCategory.showcasePhotoUrl} alt="Preview" className="w-full h-32 object-contain rounded-2xl bg-white p-2" />
                          <button type="button" onClick={() => setEditingCategory(ec => ({ ...ec, showcasePhotoUrl: '' }))}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">✓ Image Ready</div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 py-6 px-4 cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                          </div>
                          <p className="text-xs font-bold text-slate-500">Drop image here or <span className="text-primary">browse files</span></p>
                          <p className="text-[10px] text-slate-400">PNG, JPG, WEBP supported</p>
                          <input type="file" accept="image/*" onChange={handleCategoryEditImageInput} className="sr-only" />
                        </label>
                      )}
                    </div>
                    {/* Also allow URL fallback */}
                    <input
                      type="text"
                      value={editingCategory.showcasePhotoUrl || ''}
                      onChange={(e) => setEditingCategory(ec => ({ ...ec, showcasePhotoUrl: e.target.value }))}
                      placeholder="Or paste showcase image URL here..."
                      className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white transition-all font-semibold outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Display Order</label>
                    <input type="number" min="0" value={editingCategory.displayOrder || 0} onChange={e => setEditingCategory({...editingCategory, displayOrder: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingCategory.isActive !== false} onChange={e => setEditingCategory({...editingCategory, isActive: e.target.checked})}
                        className="w-4 h-4 rounded accent-primary cursor-pointer" />
                      <span className="text-xs font-bold text-slate-700">Active on Homepage</span>
                    </label>
                    <button type="submit" disabled={catSaving}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black cursor-pointer disabled:opacity-60 hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all">
                      {catSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
 
            {/* Categories Grid */}
            {cmsCategoriesLoading ? (
              <div className="py-12 flex justify-center"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : cmsCategories.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl py-12 text-center text-slate-400 text-sm font-semibold">
                No categories found. Click Refresh or restart the server to seed them.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cmsCategories.map(cat => (
                  <div key={cat.id} className={`bg-white border rounded-2xl p-4 text-center transition-all ${cat.isActive ? 'border-slate-100 shadow-sm' : 'border-slate-100 opacity-50'}`}>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 mx-auto mb-2 bg-slate-50">
                      {cat.showcasePhotoUrl ? (
                        <img src={cat.showcasePhotoUrl} alt={cat.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Layers className="w-6 h-6" /></div>
                      )}
                    </div>
                    <p className="text-xs font-black text-slate-800 truncate">{cat.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mb-3">Order: {cat.displayOrder}</p>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleToggleCategoryActive(cat)}
                        className={`text-[9px] font-black px-2 py-1 rounded-lg cursor-pointer transition-all ${cat.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'}`}>
                        {cat.isActive ? '✅ Active' : '⭕ Hidden'}
                      </button>
                      <button onClick={() => setEditingCategory(cat)} className="p-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 cursor-pointer">
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* TAB: FEATURED PRODUCTS CMS */}
      {activeTab === 'featured' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Priority Inventory Sorter</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Mark products as featured and set their display priority (1 = top). Featured products show in the 'Best Sellers' section.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">{products.length} Products</p>
                <p className="text-[10px] text-slate-400 font-semibold">{products.filter(p => p.isFeatured).length} featured</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 w-36">Price</th>
                      <th className="px-4 py-3 w-28 text-center">Featured</th>
                      <th className="px-4 py-3 w-32 text-center">Priority (1=Top)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.sort((a, b) => (a.priorityIndex || 100) - (b.priorityIndex || 100)).map(p => (
                      <tr key={p.id} className={`hover:bg-slate-50/40 transition-colors ${p.isFeatured ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=80'} alt="" className="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-slate-50" onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=80'; }} />
                            <div>
                              <p className="font-bold text-slate-800 truncate max-w-[220px]">{p.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[220px]">{p.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-black text-slate-800">₹{Number(p.price).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            disabled={featuredSaving === p.id}
                            className={`w-10 h-6 rounded-full transition-all cursor-pointer disabled:opacity-50 ${p.isFeatured ? 'bg-amber-400 shadow-md shadow-amber-200' : 'bg-slate-200'}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${p.isFeatured ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="1"
                            max="999"
                            defaultValue={p.priorityIndex || 100}
                            onBlur={e => handleUpdatePriority(p, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdatePriority(p, e.target.value); }}
                            className={`w-20 px-2 py-1 text-center border rounded-lg text-xs font-bold outline-none focus:border-primary/50 transition-all ${p.isFeatured ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* EDIT PRODUCT MODAL DIALOG */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-250 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl animate-slide-up text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850">Edit Product Parameters</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Stock Level</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Math.floor(Number(e.target.value)) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 resize-none font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Product Image</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setEditImageDragOver(true); }}
                  onDragLeave={() => setEditImageDragOver(false)}
                  onDrop={handleEditProductImageDrop}
                  className={`relative rounded-2xl border-2 border-dashed transition-all ${
                    editImageDragOver ? 'border-primary bg-primary/5'
                    : editingProduct.imageUrl ? 'border-emerald-400 bg-emerald-50/10'
                    : 'border-slate-200 bg-slate-50 hover:border-primary/50'
                  }`}
                >
                  {editingProduct.imageUrl ? (
                    <div className="relative flex items-center justify-center p-2">
                      <img src={editingProduct.imageUrl} alt="Edit preview" className="w-full h-32 object-contain rounded-xl bg-white p-1" />
                      <button type="button" onClick={() => setEditingProduct(ep => ({ ...ep, imageUrl: '' }))}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">✓ Image Ready</div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 py-6 px-3 cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500">Drop image here or <span className="text-primary">browse files</span></p>
                      <input type="file" accept="image/*" onChange={handleEditProductImageInput} className="sr-only" />
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  placeholder="Or paste image URL here..."
                  className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Selling Price (₹) *</label>
                  <input type="number" step="0.01" required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MRP (₹)</label>
                  <input type="number" step="0.01"
                    value={editingProduct.mrp || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mrp: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold outline-none"
                  />
                  {editingProduct.mrp && Number(editingProduct.mrp) > Number(editingProduct.price) && (
                    <p className="text-[9px] mt-1 font-bold text-emerald-600">
                      ✓ {Math.round(((Number(editingProduct.mrp) - Number(editingProduct.price)) / Number(editingProduct.mrp)) * 100)}% discount
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
