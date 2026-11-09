import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
];

export default function DashboardPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Edit details form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    bio: '',
    preferred_style: 'Contemporary Minimalist',
    profile_image: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Change password form state (matches reference card design)
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || 'India',
        bio: user.bio || '',
        preferred_style: user.preferred_style || 'Contemporary Minimalist',
        profile_image: user.profile_image || '',
      });
      setImagePreview(user.profile_image || '');
    }
  }, [user]);

  // Fetch orders
  const fetchOrders = () => {
    setLoadingOrders(true);
    api.get('/orders/my-orders')
      .then((res) => {
        setOrders(res.data.data || []);
        setLoadingOrders(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingOrders(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Floating toast auto-dismiss (1.5s)
  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(''), 1500);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  useEffect(() => {
    if (errorToast) {
      const t = setTimeout(() => setErrorToast(''), 1500);
      return () => clearTimeout(t);
    }
  }, [errorToast]);

  // Handle image upload from computer (Base64 encoding)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorToast('Image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      setImagePreview(base64Data);
      setFormData((prev) => ({ ...prev, profile_image: base64Data }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, profile_image: url }));
  };

  const handleRemovePhoto = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, profile_image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetForm = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postal_code: user?.postal_code || '',
      country: user?.country || 'India',
      bio: user?.bio || '',
      preferred_style: user?.preferred_style || 'Contemporary Minimalist',
      profile_image: user?.profile_image || '',
    });
    setImagePreview(user?.profile_image || '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccessToast('Form reset to saved profile details.');
  };

  const handleToggleEditor = () => {
    const nextState = !isEditingProfile;
    if (nextState) {
      setIsChangingPassword(false);
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        postal_code: user?.postal_code || '',
        country: user?.country || 'India',
        bio: user?.bio || '',
        preferred_style: user?.preferred_style || 'Contemporary Minimalist',
        profile_image: user?.profile_image || '',
      });
      setImagePreview(user?.profile_image || '');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsEditingProfile(true);
      setTimeout(() => {
        document.getElementById('edit-profile-div')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setIsEditingProfile(false);
    }
  };

  const handleTogglePasswordBox = () => {
    const nextState = !isChangingPassword;
    setIsChangingPassword(nextState);
    if (nextState) {
      setIsEditingProfile(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => {
        document.getElementById('change-password-div')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.current_password) {
      setErrorToast('Current password is required.');
      return;
    }
    if (!passwordForm.new_password) {
      setErrorToast('New password is required.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setErrorToast('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorToast('New password and confirm password do not match.');
      return;
    }
    if (passwordForm.current_password.trim() === passwordForm.new_password.trim()) {
      setErrorToast('New password cannot be the same as your current password.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      // Clear password form and dismiss password card
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setIsChangingPassword(false);

      // Show floating notification below navbar
      setSuccessToast('Password updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorToast(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorToast('Full name is required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: (formData.state || '').trim(),
        postal_code: formData.postal_code.trim(),
        country: (formData.country || 'India').trim(),
        bio: (formData.bio || user?.bio || '').trim(),
        preferred_style: (formData.preferred_style || 'Contemporary Minimalist').trim(),
        profile_image: formData.profile_image,
      });

      // Immediately close and dismiss the edit profile card
      setIsEditingProfile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setSuccessToast('Profile details updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorToast(err.response?.data?.message || err.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelling(true);
    try {
      const orderId = orderToCancel._id || orderToCancel.id || orderToCancel.order_number;
      const res = await api.patch(`/orders/${orderId}/cancel`);
      setSuccessToast(res.data.message || 'Order has been cancelled successfully.');
      setOrders((prev) =>
        prev.map((ord) => {
          const match =
            (ord._id && ord._id === orderToCancel._id) ||
            (ord.id && ord.id === orderToCancel.id) ||
            (ord.order_number && ord.order_number === orderToCancel.order_number);
          return match
            ? { ...ord, status: 'cancelled', cancelled_by: 'user', cancelled_at: new Date().toISOString() }
            : ord;
        })
      );
      setOrderToCancel(null);
    } catch (err) {
      console.error('Cancel order error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to cancel order.';
      setErrorToast(msg);
    } finally {
      setCancelling(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'K';

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
      {/* Floating notifications (positioned below navbar, supports dark/light mode) */}
      {successToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-md pointer-events-auto transition-all animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl border transition-colors duration-300 bg-white/95 dark:bg-stone-900/95 border-emerald-600/30 dark:border-white/20 text-stone-900 dark:text-white shadow-[0_10px_35px_rgba(16,185,129,0.18)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 dark:text-white font-bold text-[22px]">check_circle</span>
              <span className="text-sm font-semibold tracking-wide">{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-stone-400 hover:text-stone-700 dark:text-stone-300 dark:hover:text-white transition-colors p-1" aria-label="Dismiss">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {errorToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-md pointer-events-auto transition-all animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl border transition-colors duration-300 bg-white/95 dark:bg-rose-950/95 border-rose-500/30 dark:border-rose-500/30 text-stone-900 dark:text-rose-100 shadow-[0_10px_35px_rgba(244,63,94,0.18)] dark:shadow-[0_10px_35px_rgba(159,18,57,0.45)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 font-bold text-[22px]">error</span>
              <span className="text-sm font-semibold tracking-wide">{errorToast}</span>
            </div>
            <button onClick={() => setErrorToast('')} className="text-stone-400 hover:text-stone-700 dark:text-stone-300 dark:hover:text-white transition-colors p-1" aria-label="Dismiss">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 animate-fade-in">
        <div>
          <h1 className="font-display-xl text-3xl md:text-4xl text-emerald-950 dark:text-white leading-tight font-extrabold tracking-tight">
            Profile
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            Showroom
          </Link>
          <Link
            to="/ai-designer"
            className="px-5 py-2.5 rounded-full bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-semibold text-xs hover:opacity-90 dark:hover:bg-stone-200 shadow-md flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            AI Harmonizer
          </Link>
        </div>
      </div>

      {/* Unified Profile & Orders Section */}
      <div className="space-y-8 animate-fade-in">
        {/* Top: Profile View Card */}
        <div className="bg-white dark:bg-stone-950 rounded-2xl p-6 md:p-7 border border-stone-200/90 dark:border-stone-800 shadow-xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Profile Photo (DP) Display */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-md flex items-center justify-center">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name || 'Client Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 flex items-center justify-center text-white text-3xl font-extrabold tracking-widest font-serif">
                    {userInitial}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-1 shadow-md flex items-center justify-center border-2 border-white dark:border-stone-950" title="Active Client">
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </span>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 text-center md:text-left space-y-3.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                      {user?.name || 'Valued Clientele'}
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 font-mono mt-0.5 flex items-center justify-center md:justify-start gap-1">
                    <span className="material-symbols-outlined text-[13px] text-stone-400">mail</span>
                    {user?.email}
                    <span className="ml-1 text-[9px] bg-stone-100 dark:bg-stone-850 text-stone-500 px-1.5 py-0.5 rounded uppercase font-sans font-bold">
                      Primary ID
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 self-center md:self-auto">
                  {/* Change Password Button (strictly on the LEFT side of Edit Profile) */}
                  <button
                    type="button"
                    onClick={handleTogglePasswordBox}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm border ${
                      isChangingPassword
                        ? 'bg-stone-200 dark:bg-stone-850 text-stone-900 dark:text-white border-stone-300 dark:border-stone-700'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-stone-700 dark:text-white">
                      {isChangingPassword ? 'close' : 'key'}
                    </span>
                    {isChangingPassword ? 'Close Password' : 'Change Password'}
                  </button>

                  {/* Edit Profile Button */}
                  <button
                    type="button"
                    onClick={handleToggleEditor}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm border ${
                      isEditingProfile
                        ? 'bg-stone-200 dark:bg-stone-850 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
                        : 'bg-emerald-950 hover:bg-emerald-900 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-950 border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isEditingProfile ? 'close' : 'edit'}
                    </span>
                    {isEditingProfile ? 'Close Editor' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {/* Details Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="bg-stone-50/90 dark:bg-stone-900/80 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">Phone Contact</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                    {user?.phone || 'Not configured'}
                  </span>
                </div>

                <div className="bg-stone-50/90 dark:bg-stone-900/80 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">Spatial Delivery Location</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block text-xs" title={user?.address || 'None'}>
                    {user?.city ? `${user.city}${user?.postal_code ? `, ${user.postal_code}` : ''}` : (user?.address || 'Not specified')}
                  </span>
                </div>

                <div className="bg-stone-50/90 dark:bg-stone-900/80 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">Member Since</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }) : '2026 Patron'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* CHANGE PASSWORD DIV BOX (EXACT REFERENCE DESIGN WITH RED PILL ACCENT) */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {isChangingPassword && (
            <div
              id="change-password-div"
              className="bg-white dark:bg-[#0c0e12] rounded-2xl p-6 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xl dark:shadow-[0_12px_45px_rgba(0,0,0,0.75)] space-y-5 animate-fade-in scroll-mt-24 ring-1 ring-black/5 dark:ring-white/5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-stone-900 dark:bg-white rounded-full inline-block shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.4)]"></span>
                  <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white font-sans">
                    Change Password
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {/* CURRENT PASSWORD */}
                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase mb-1.5">
                    CURRENT PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      required
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="Enter your current password"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800/80 bg-stone-50 dark:bg-[#121519] text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600 pr-10 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                      aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {showCurrentPw ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2-Column: NEW PASSWORD & CONFIRM PASSWORD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase mb-1.5">
                      NEW PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800/80 bg-stone-50 dark:bg-[#121519] text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600 pr-10 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                        aria-label={showNewPw ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {showNewPw ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase mb-1.5">
                      CONFIRM PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800/80 bg-stone-50 dark:bg-[#121519] text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600 pr-10 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                        aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {showConfirmPw ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button (Right Aligned matching reference image) */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#1f2329] dark:hover:bg-[#282d34] border border-transparent dark:border-stone-700/60 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {updatingPassword && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
                    {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* SEPARATE DEDICATED EDIT DETAILS DIV (OPENED VIA EDIT BUTTON ONLY) */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {isEditingProfile && (
            <div id="edit-profile-div" className="bg-white dark:bg-stone-950 rounded-2xl p-6 md:p-7 border border-stone-200 dark:border-stone-800 shadow-2xl dark:shadow-[0_12px_45px_rgba(0,0,0,0.75)] space-y-6 scroll-mt-24 animate-fade-in ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 dark:border-stone-900 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800 dark:text-white text-xl">tune</span>
                    Edit Profile
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customize your profile photo and delivery contact details.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
                    title="Close Editor"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

            <form onSubmit={handleSubmitDetails} onReset={handleResetForm} className="space-y-4">
              {/* Profile Photo (DP) Editing Subsection */}
              <div className="bg-stone-50 dark:bg-stone-900/70 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Profile Photo (DP)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live preview */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 border-2 border-emerald-600/40 dark:border-white/30 shrink-0 flex items-center justify-center shadow-sm">
                    {imagePreview ? (
                      <img src={imagePreview} alt="DP Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-extrabold text-stone-600 dark:text-stone-300 font-serif">
                        {formData.name?.charAt(0).toUpperCase() || 'K'}
                      </span>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="avatar-file-input"
                      />
                      <label
                        htmlFor="avatar-file-input"
                        className="cursor-pointer px-3 py-1.5 bg-emerald-950 dark:bg-white hover:opacity-90 dark:hover:bg-stone-200 text-white dark:text-stone-950 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">upload</span>
                        Upload Photo
                      </label>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-lg text-[11px] font-bold transition-colors border border-rose-500/20 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Quick Luxury Preset Avatars */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mr-1">
                        Presets:
                      </span>
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(url)}
                          className={`w-6 h-6 rounded-lg overflow-hidden border transition-transform hover:scale-110 ${
                            imagePreview === url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name (Editable) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Full Name <span className="text-emerald-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                  />
                </div>

                {/* Email (IMMUTABLE / DISABLED) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Email Address <span className="text-stone-400 font-normal">(Non-editable)</span>
                    </label>
                    <span className="text-[9px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">lock</span>
                      Locked
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      readOnly
                      value={user?.email || ''}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 text-xs font-mono cursor-not-allowed select-none opacity-80"
                      title="Email address cannot be modified"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                    </span>
                  </div>
                </div>

                {/* Phone Number (Editable) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                {/* City & Postal Code (Editable) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="e.g. 400001"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                {/* Delivery Street Address (Editable) */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Spatial Delivery Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Flat 402, Lotus Bay Towers, Worli Sea Face"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-900 flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                  Reset Form
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-950 dark:bg-white text-white dark:text-stone-950 text-xs font-bold hover:opacity-90 dark:hover:bg-stone-200 transition-opacity shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {saving ? 'sync' : 'save'}
                  </span>
                  {saving ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* ORDERS TRACKING & HISTORY SECTION (DIRECTLY BELOW PROFILE)         */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <div className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 dark:border-stone-850 pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-800 dark:text-white text-2xl">
                    receipt_long
                  </span>
                  <span>Orders ({orders.length})</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Track your bespoke spatial curation orders, commissions, and delivery statuses.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    fetchOrders();
                    setSuccessToast('Orders refreshed!');
                  }}
                  disabled={loadingOrders}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-white/20 bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  title="Refresh orders and live tracking status"
                >
                  <span className={`material-symbols-outlined text-[16px] text-stone-700 dark:text-white ${loadingOrders ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh Orders
                </button>
              </div>
            </div>
          {loadingOrders ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-stone-50/90 dark:bg-stone-900/60 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 shadow-xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center ring-1 ring-black/5 dark:ring-white/5">
              <div className="w-24 h-24 bg-white dark:bg-stone-950 rounded-full flex items-center justify-center mb-6 shadow-md border border-stone-200 dark:border-stone-800">
                <span className="material-symbols-outlined text-stone-400 text-4xl">receipt_long</span>
              </div>
              <h3 className="font-headline-md text-xl text-primary font-bold mb-2">Order History is Empty</h3>
              <p className="text-stone-500 text-sm max-w-sm mb-6">
                You haven't initiated any curation orders yet. Begin by analyzing your space or exploring the showroom.
              </p>
              <Link
                to="/products"
                className="px-8 py-3.5 bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-bold rounded-xl hover:opacity-90 dark:hover:bg-stone-200 transition-all shadow-md"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order List */}
              <div className="lg:col-span-2 space-y-6">
                {orders.map((order) => {
                  const firstItemImage = order.cart_items?.[0]?.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80';
                  const imgUrl = order.custom_design?.room_image_path
                    ? (order.custom_design.room_image_path.startsWith('http')
                        ? order.custom_design.room_image_path
                        : (order.custom_design.room_image_path.startsWith('/')
                            ? order.custom_design.room_image_path
                            : (order.custom_design.room_image_path.startsWith('uploads/')
                                ? `/${order.custom_design.room_image_path}`
                                : `/uploads/rooms/${order.custom_design.room_image_path}`)))
                    : firstItemImage;

                  const title = order.custom_design?.product?.name ||
                    (order.cart_items?.map((i) => i.name).join(', ') || 'Premium Curation Selection');

                  const statusColors = {
                    placed: 'bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white border-stone-200 dark:border-white/20',
                    processing: 'bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white border-stone-200 dark:border-white/20',
                    shipping: 'bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white border-stone-200 dark:border-white/20',
                    delivered: 'bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white border-stone-200 dark:border-white/20',
                    cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                  };

                  return (
                    <div
                      key={order._id || order.id}
                      className="bg-white dark:bg-stone-950 rounded-[2rem] p-6 border border-stone-200 dark:border-stone-800 shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row gap-6 transition-all hover:-translate-y-1 hover:shadow-2xl ring-1 ring-black/5 dark:ring-white/5"
                    >
                      <div className="w-full sm:w-40 h-40 rounded-2xl bg-stone-100 dark:bg-stone-900 overflow-hidden shrink-0 relative flex items-center justify-center border border-stone-200 dark:border-stone-800 shadow-inner">
                        <img
                          src={imgUrl}
                          alt="Order thumbnail"
                          onError={(e) => { e.target.src = '/images/masterpiece/product_canvas.png'; }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">
                                Order {order.order_number}
                              </span>
                              <h3 className="font-headline-sm text-lg text-primary font-bold truncate max-w-[280px]" title={title}>
                                {title}
                              </h3>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColors[order.status] || statusColors.placed}`}>
                                {order.status}
                              </span>
                              {order.status === 'cancelled' && (
                                <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400">
                                  {order.cancelled_by === 'user' ? 'Cancelled by you' : 'Cancelled by admin'}
                                </span>
                              )}
                            </div>
                          </div>

                          {order.cart_items && order.cart_items.length > 0 && (
                            <div className="text-stone-500 text-xs mt-2">
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-white bg-emerald-500/10 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
                                <span className="material-symbols-outlined text-[12px]">shopping_cart</span>
                                {order.cart_items.length} item(s)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-stone-100 dark:border-stone-900 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-stone-400 block">Total Amount</span>
                            <span className="text-base font-bold text-emerald-950 dark:text-white">
                              INR {Number(order.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Cancellation permitted only if status is placed, processing, or shipping */}
                            {['placed', 'processing', 'shipping'].includes(order.status) && (
                              <button
                                type="button"
                                onClick={() => setOrderToCancel(order)}
                                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-white/20 bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-white font-bold hover:bg-stone-200 dark:hover:bg-white/20 hover:border-stone-300 dark:hover:border-white/40 transition-colors flex items-center gap-1.5 text-xs shadow-xs"
                              >
                                <span className="material-symbols-outlined text-[15px] text-stone-600 dark:text-white">cancel</span>
                                Cancel Order
                              </button>
                            )}
                            <Link
                              to={`/orders/confirmation?order_id=${order._id || order.id}`}
                              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-200 transition-colors flex items-center gap-1"
                            >
                              Receipt
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Metrics */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-950 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] space-y-6 ring-1 ring-black/5 dark:ring-white/5">
                  <h3 className="font-headline-md text-xl text-primary font-bold border-b border-stone-200 dark:border-stone-800 pb-4">
                    Ledger Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 text-sm">Total Curations</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-base">{orders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 text-sm">Active Crafting</span>
                      <span className="font-bold text-emerald-700 dark:text-white text-base">{activeOrders}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-900">
                      <span className="text-stone-500 text-sm">Total Investment</span>
                      <span className="font-extrabold text-emerald-950 dark:text-white text-lg">
                        INR {totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950 text-white rounded-3xl p-8 shadow-xl space-y-4">
                  <span className="text-emerald-300 text-[10px] uppercase font-bold tracking-widest block">Concierge Support</span>
                  <h4 className="text-xl font-bold font-serif">Have questions regarding your order delivery?</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Our bespoke art curation team is available round the clock for custom revisions, framing consultations, and delivery tracking.
                  </p>
                  <div className="pt-2">
                    <a
                      href="mailto:Nandinigottipati2004@gmail.com?subject=KaYa%20Bespoke%20Order%20Inquiry"
                      className="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                    >
                      Contact Curator
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CANCEL ORDER CONFIRMATION MODAL ─────────────────────────────── */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white flex items-center justify-center mx-auto border border-stone-200 dark:border-white/20">
              <span className="material-symbols-outlined text-[32px]">cancel</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100">Cancel Order?</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Are you sure you want to cancel order <strong className="font-mono text-stone-800 dark:text-stone-200">{orderToCancel.order_number}</strong>? This action cannot be reversed and crafting will be halted.
              </p>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl text-xs text-stone-600 dark:text-stone-400 font-medium">
              Current Status: <span className="uppercase font-bold text-stone-900 dark:text-white">{orderToCancel.status}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
