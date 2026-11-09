import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab state: 'users' | 'orders' | 'products'
  const [activeTab, setActiveTab] = useState('users');

  // Telemetry data from MongoDB
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filters & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Wall Decor',
    base_price: '',
    description: '',
    image_path: '',
  });

  // Delete Product Confirmation Modal
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load admin telemetry from MongoDB.');
      setLoading(false);
    }
  };

  const handleRefresh = async (customMsg = 'Telemetry refreshed!') => {
    setRefreshing(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
      setSuccessMsg(customMsg);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to refresh data from server.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Flash message from navigation state (e.g., admin login)
  useEffect(() => {
    if (location.state?.flash) {
      if (location.state.flash.type === 'error') {
        setErrorMsg(location.state.flash.message);
      } else {
        setSuccessMsg(location.state.flash.message);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-dismiss any success message after exactly 1.5 seconds (1500ms)
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 1500);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // Auto-dismiss any error message after exactly 1.5 seconds (1500ms)
  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 1500);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const handleLogout = () => {
    logout();
    navigate('/', { state: { flash: { type: 'success', message: 'Logged out successfully!' } } });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setSuccessMsg(`Order status updated to '${newStatus.toUpperCase()}' successfully!`);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStock = async (prodId) => {
    try {
      const res = await api.patch(`/admin/products/${prodId}/toggle-stock`);
      setSuccessMsg(res.data?.message || 'Stock status updated.');
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to toggle stock status.');
    }
  };

  const handleToggleActive = async (prodId) => {
    try {
      const res = await api.patch(`/admin/products/${prodId}/toggle-active`);
      setSuccessMsg(res.data?.message || 'Visibility updated.');
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to toggle active status.');
    }
  };

  const handleRequestDelete = (prod) => {
    setProductToDelete(prod);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const prodId = productToDelete._id || productToDelete.id;
      const prodName = productToDelete.name;
      await api.delete(`/admin/products/${prodId}`);
      setSuccessMsg(`Masterpiece "${prodName}" completely removed from catalog.`);
      setProductToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', newProduct);
      setShowAddModal(false);
      setNewProduct({ name: '', category: 'Wall Decor', base_price: '', description: '', image_path: '' });
      setSuccessMsg('New masterpiece curation added to MongoDB catalog!');
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errors?.name || 'Failed to add product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background font-body-md transition-colors duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold tracking-widest uppercase text-stone-500">Loading Telemetry...</span>
        </div>
      </div>
    );
  }

  const { stats = {}, users = [], orders = [], products = [] } = data || {};

  // Filtering Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    const term = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      ord.order_number?.toLowerCase().includes(term) ||
      ord.customer_name?.toLowerCase().includes(term) ||
      ord.customer_email?.toLowerCase().includes(term) ||
      ord.customer_phone?.includes(term);
    return matchesStatus && matchesSearch;
  });

  // Filtering Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const term = productSearch.toLowerCase().trim();
    const matchesSearch = !term || p.name?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  // Filtering Users
  const filteredUsers = users.filter((u) => {
    const matchesRole =
      userRoleFilter === 'all' ||
      (userRoleFilter === 'admin' && u.is_admin) ||
      (userRoleFilter === 'customer' && !u.is_admin);
    const term = userSearch.toLowerCase().trim();
    const matchesSearch = !term || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  // Status Badge Helper: normal black & white for active statuses, red only for cancelled
  const getStatusBadge = (status) => {
    switch (status) {
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      case 'delivered':
      case 'shipping':
      case 'processing':
      case 'placed':
      default:
        return 'bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white border-stone-200 dark:border-white/20';
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background text-on-background font-body-md transition-colors duration-500">
      {/* ─── AMBIENT ATMOSPHERIC LUXURY GLOWS (MATCHING USER SANCTUARY PAGES) ─── */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-stone-500/5 via-white/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-emerald-900/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* ─── MAIN DASHBOARD CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 min-h-screen relative z-10">
        {/* Header Area with micro-animations */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-fade-in">
          <div>
            <h1 className="font-display-xl text-4xl md:text-5xl text-emerald-950 dark:text-white leading-tight font-extrabold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="font-body-md text-stone-500 max-w-xl leading-relaxed mt-2">
              A unified administrative interface to analyze user acquisitions, catalog curation, and premium order conversions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="px-5 py-3 rounded-full bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-semibold text-sm hover:opacity-90 dark:hover:bg-stone-200 transition-all flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              View Live Showroom
            </Link>
          </div>
        </div>

        {/* Floating overlay Success Alert (positioned below navbar, supports dark/light mode) */}
        {successMsg && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-md pointer-events-auto transition-all animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl border transition-colors duration-300 bg-white/95 dark:bg-stone-900/95 border-emerald-600/30 dark:border-white/20 text-stone-900 dark:text-white shadow-[0_10px_35px_rgba(16,185,129,0.18)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 dark:text-white font-bold text-[22px]">check_circle</span>
                <span className="font-semibold text-sm tracking-wide">{successMsg}</span>
              </div>
              <button
                onClick={() => setSuccessMsg('')}
                className="text-stone-400 hover:text-stone-700 dark:text-stone-300 dark:hover:text-white transition-colors p-1"
                aria-label="Dismiss message"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating overlay Error Alert (positioned below navbar, supports dark/light mode) */}
        {errorMsg && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-md pointer-events-auto transition-all animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl border transition-colors duration-300 bg-white/95 dark:bg-rose-950/95 border-rose-500/30 dark:border-rose-500/30 text-stone-900 dark:text-rose-100 shadow-[0_10px_35px_rgba(244,63,94,0.18)] dark:shadow-[0_10px_35px_rgba(159,18,57,0.45)]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 font-bold text-[22px]">error</span>
                <span className="font-semibold text-sm tracking-wide">{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-stone-400 hover:text-stone-700 dark:text-stone-300 dark:hover:text-white transition-colors p-1"
                aria-label="Dismiss error"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── PREMIUM METRICS GRID (3 CARDS) ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Total Clientele */}
          <div
            onClick={() => setActiveTab('users')}
            className="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-stone-100 dark:border-stone-900 transition-all hover:-translate-y-1 hover:shadow-lg group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Clientele</span>
              <span className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform border border-stone-200 dark:border-white/20">
                <span className="material-symbols-outlined text-[20px]">group</span>
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">{stats.total_users || 0}</h3>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-stone-900 dark:bg-white"></span>
              {stats.total_admins || 0} administrators active
            </p>
          </div>

          {/* Card 2: Total Orders */}
          <div
            onClick={() => setActiveTab('orders')}
            className="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-stone-100 dark:border-stone-900 transition-all hover:-translate-y-1 hover:shadow-lg group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Orders</span>
              <span className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform border border-stone-200 dark:border-white/20">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">{stats.total_orders || 0}</h3>
            <p className="text-xs text-stone-500 mt-1">
              {orders.filter((o) => o.status === 'delivered').length} delivered • {orders.filter((o) => o.status === 'placed').length} new
            </p>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-stone-100 dark:border-stone-900 transition-all hover:-translate-y-1 hover:shadow-lg group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Revenue</span>
              <span className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform border border-stone-200 dark:border-white/20">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
              ₹{Number(stats.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Gross: ₹{Number(stats.gross_revenue || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* ─── TAB SELECTION BUTTONS ───────────────────────────────────────── */}
        <div className="flex gap-2 sm:gap-4 border-b border-stone-200 dark:border-stone-800 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-emerald-950 text-emerald-950 dark:border-white dark:text-white'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            Clientele Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-950 text-emerald-950 dark:border-white dark:text-white'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Orders &amp; Transactions ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-emerald-950 text-emerald-950 dark:border-white dark:text-white'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            Products Curation ({products.length})
          </button>
        </div>

        {/* ─── TAB 1: CLIENTELE DIRECTORY ─────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-900 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-stone-400 mr-1">Role:</span>
                {['all', 'admin', 'customer'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      userRoleFilter === r
                        ? 'bg-emerald-950 text-white dark:bg-white dark:text-stone-950 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleRefresh('Clientele directory refreshed!')}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-white/20 bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  title="Refresh clientele directory"
                >
                  <span className={`material-symbols-outlined text-[16px] text-stone-700 dark:text-white ${refreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh Clientele
                </button>

                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search clientele..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-100 dark:border-stone-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-400 text-xs uppercase tracking-wider font-bold border-b border-stone-100 dark:border-stone-800">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Orders Placed</th>
                      <th className="px-6 py-4">Designs Created</th>
                      <th className="px-6 py-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                    {filteredUsers.map((u) => (
                      <tr key={u._id || u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-950/10 dark:bg-white/10 text-emerald-950 dark:text-white font-bold flex items-center justify-center text-xs">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-stone-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-500 text-xs font-mono">
                          {u.email?.toLowerCase() === 'nandinigottipati2004@gmail.com'
                            ? 'Nandinigottipati2004@gmail.com'
                            : u.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                              u.is_admin
                                ? 'bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white border-stone-200 dark:border-white/20'
                                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                            }`}
                          >
                            {u.is_admin ? 'Admin' : 'Customer'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-950 dark:text-white text-xs">
                            {u.orders_count || 0} orders
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-purple-700 dark:text-purple-400 text-xs">
                            {u.custom_designs_count || 0} designs
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-stone-400">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ORDERS & TRANSACTIONS ─────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-900 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold uppercase text-stone-400 mr-1">Status:</span>
                {['all', 'placed', 'processing', 'shipping', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      orderStatusFilter === st
                        ? 'bg-emerald-950 text-white dark:bg-white dark:text-stone-950 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleRefresh('Orders refreshed successfully!')}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-white/20 bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  title="Refresh orders list"
                >
                  <span className={`material-symbols-outlined text-[16px] text-stone-700 dark:text-white ${refreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh Orders
                </button>

                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-white"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-100 dark:border-stone-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-400 text-xs uppercase tracking-wider font-bold border-b border-stone-100 dark:border-stone-800">
                    <tr>
                      <th className="px-6 py-4">Order #</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Items / Custom Spec</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status &amp; Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-stone-400 text-sm">
                          No orders matching the specified filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr
                          key={ord._id || ord.id}
                          className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-xs text-emerald-950 dark:text-white">
                            {ord.order_number}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-stone-900 dark:text-stone-100">
                              {ord.customer_name || 'Guest Client'}
                            </p>
                            <p className="text-stone-400 text-xs">
                              {ord.customer_email?.toLowerCase() === 'nandinigottipati2004@gmail.com'
                                ? 'Nandinigottipati2004@gmail.com'
                                : (ord.customer_email || ord.customer_phone)}
                            </p>
                            {ord.shipping_address && (
                              <p className="text-[11px] text-stone-500 italic mt-0.5 line-clamp-1">
                                📍 {ord.shipping_address}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {ord.cart_items && ord.cart_items.length > 0 ? (
                              <div className="space-y-1">
                                {ord.cart_items.map((i, idx) => (
                                  <div key={idx} className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                                    <span>{i.name}</span>
                                    <span className="text-stone-400 font-mono">×{i.qty || 1}</span>
                                  </div>
                                ))}
                              </div>
                            ) : ord.custom_design?.product ? (
                              <span className="text-xs text-purple-700 dark:text-purple-400 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">palette</span>
                                Bespoke: {ord.custom_design.product.name}
                              </span>
                            ) : (
                              <span className="text-xs text-stone-400">Standard Spec</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-stone-900 dark:text-stone-100">
                            ₹{Number(ord.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 block w-max">
                              {ord.payment_id || 'COD/Sandbox'}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-stone-400 mt-1 block">
                              {ord.payment_status || 'paid'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {ord.status === 'cancelled' && ord.cancelled_by === 'user' ? (
                              <div
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider shadow-xs cursor-not-allowed"
                                title="Order was cancelled by the customer. The status is permanently locked and cannot be changed."
                              >
                                <span className="material-symbols-outlined text-[15px]">lock</span>
                                Cancelled by Customer
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <select
                                  value={ord.status}
                                  disabled={updatingId === (ord._id || ord.id)}
                                  onChange={(e) => handleStatusChange(ord._id || ord.id, e.target.value)}
                                  className={`text-xs font-bold uppercase tracking-wider rounded-xl border px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-white cursor-pointer ${getStatusBadge(
                                    ord.status
                                  )}`}
                                >
                                  {['placed', 'processing', 'shipping', 'delivered'].map((stage) => {
                                    const stageOrder = ['placed', 'processing', 'shipping', 'delivered'];
                                    const isPast =
                                      ord.status !== 'cancelled' &&
                                      stageOrder.indexOf(stage) < stageOrder.indexOf(ord.status);
                                    return (
                                      <option key={stage} value={stage} disabled={isPast}>
                                        {stage.charAt(0).toUpperCase() + stage.slice(1)} {isPast ? '(Locked)' : ''}
                                      </option>
                                    );
                                  })}
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                {ord.status === 'cancelled' && ord.cancelled_by === 'admin' && (
                                  <span className="text-[10px] font-semibold text-stone-700 dark:text-white bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 px-2 py-0.5 rounded-md" title="Cancelled by admin (can be updated anytime)">
                                    Admin Cancelled
                                  </span>
                                )}
                                {updatingId === (ord._id || ord.id) && (
                                  <span className="material-symbols-outlined animate-spin text-[16px] text-emerald-700 dark:text-white">
                                    progress_activity
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: PRODUCTS CURATION ────────────────────────────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-900 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold uppercase text-stone-400 mr-1">Category:</span>
                {['all', 'Wall Decor', 'Lighting', 'Soft Furnishings', 'Decorative Accents', 'Rugs & Mats'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      productCategoryFilter === cat
                        ? 'bg-emerald-950 text-white dark:bg-white dark:text-stone-950 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleRefresh('Products catalog refreshed!')}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-white/20 bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  title="Refresh products catalog"
                >
                  <span className={`material-symbols-outlined text-[16px] text-stone-700 dark:text-white ${refreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh Products
                </button>

                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-white"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-emerald-950 dark:bg-white text-white dark:text-stone-950 rounded-xl text-xs font-bold hover:opacity-90 dark:hover:bg-stone-200 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Product
                </button>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p._id || p.id}
                  className="bg-white dark:bg-stone-950 rounded-2xl p-5 border border-stone-100 dark:border-stone-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 mb-4 relative group">
                      <img src={p.image_path} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                            p.in_stock ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {p.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                            p.is_active ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950' : 'bg-stone-600 text-white'
                          }`}
                        >
                          {p.is_active ? 'Visible' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-white">
                      {p.category}
                    </span>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base mt-0.5">{p.name}</h4>
                    <p className="text-stone-500 text-xs line-clamp-2 mt-1">{p.description}</p>
                    <p className="text-lg font-extrabold text-emerald-950 dark:text-white mt-2">
                      ₹{Number(p.base_price).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStock(p._id || p.id)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border transition-colors ${
                          p.in_stock
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {p.in_stock ? 'In Stock' : 'Out of Stock'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(p._id || p.id)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border transition-colors ${
                          p.is_active
                            ? 'bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white border-stone-200 dark:border-white/20 hover:bg-stone-200 dark:hover:bg-white/20'
                            : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Draft'}
                      </button>
                    </div>
                    <button
                      onClick={() => handleRequestDelete(p)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Product from Catalog"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ADD NEW PRODUCT MODAL ────────────────────────────────────────── */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-stone-950 rounded-3xl p-8 border border-stone-100 dark:border-stone-900 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100">Add New Masterpiece</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Persisted directly into MongoDB products collection</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sculptural Travertine Vase"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="Wall Decor">Wall Decor</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Soft Furnishings">Soft Furnishings</option>
                      <option value="Decorative Accents">Decorative Accents</option>
                      <option value="Rugs & Mats">Rugs & Mats</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      placeholder="e.g. 2999"
                      value={newProduct.base_price}
                      onChange={(e) => setNewProduct({ ...newProduct, base_price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Master Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newProduct.image_path}
                    onChange={(e) => setNewProduct({ ...newProduct, image_path: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Artisan Description</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe material provenance, tactile finish, and dimensions..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-100 dark:border-stone-900">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-950 dark:bg-white text-white dark:text-stone-950 text-xs font-bold hover:opacity-90 dark:hover:bg-stone-200 shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save to Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── DELETE CATALOG ITEM CONFIRMATION MODAL ───────────────────────── */}
        {productToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeleting) setProductToDelete(null);
            }}
          >
            <div className="w-full max-w-md bg-white dark:bg-stone-950 rounded-3xl p-7 border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[26px]">warning</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                    Delete Catalog Item?
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    Are you sure you want to completely remove this masterpiece from your live storefront catalog? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Product preview summary card */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/80 flex items-center gap-3.5 my-5">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 flex items-center justify-center">
                  {productToDelete.image_path ? (
                    <img
                      src={
                        productToDelete.image_path.startsWith('http') || productToDelete.image_path.startsWith('/')
                          ? productToDelete.image_path
                          : `/uploads/${productToDelete.image_path}`
                      }
                      alt={productToDelete.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-stone-400">inventory_2</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
                    {productToDelete.category || 'Catalog Piece'}
                  </span>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                    {productToDelete.name}
                  </h4>
                  <div className="text-xs font-semibold text-emerald-800 dark:text-white mt-0.5">
                    ₹{productToDelete.base_price ? Number(productToDelete.base_price).toLocaleString('en-IN') : '0'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setProductToDelete(null)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                      Yes, Delete Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
