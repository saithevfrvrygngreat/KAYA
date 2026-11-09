import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CartPage() {
  const { user, isAdmin, getDetails } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Razorpay Modal States
  const [rzpOpen, setRzpOpen] = useState(false);
  const [rzpState, setRzpState] = useState('select'); // select, card, upi, netbanking, bankRedirect, otp, processing, success
  const [rzpCardName, setRzpCardName] = useState('');
  const [rzpCardNo, setRzpCardNo] = useState('');
  const [rzpCardExpiry, setRzpCardExpiry] = useState('');
  const [rzpCardCvv, setRzpCardCvv] = useState('');
  const [rzpOtp, setRzpOtp] = useState('');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [upiSeconds, setUpiSeconds] = useState(119);
  const [selectedBank, setSelectedBank] = useState('');
  const [successMethod, setSuccessMethod] = useState('');

  const timerRef = useRef(null);

  const formatUserShippingAddress = (u) => {
    if (!u) return '';
    const parts = [];
    if (u.address) parts.push(u.address.trim());
    if (u.city && (!u.address || !u.address.toLowerCase().includes(u.city.toLowerCase()))) {
      parts.push(u.city.trim());
    }
    if (u.state && (!u.address || !u.address.toLowerCase().includes(u.state.toLowerCase()))) {
      parts.push(u.state.trim());
    }
    if (u.postal_code && (!u.address || !u.address.includes(u.postal_code))) {
      parts.push(u.postal_code.trim());
    }
    return parts.filter(Boolean).join(', ');
  };

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    shipping_address: formatUserShippingAddress(user) || '',
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kaya_cart') || '[]');
      setCart(saved);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.name || prev.customer_name,
        customer_email: user.email || prev.customer_email,
        customer_phone: prev.customer_phone || user.phone || '',
        shipping_address: prev.shipping_address || formatUserShippingAddress(user) || '',
      }));
    }
  }, [user]);

  // UPI timer
  useEffect(() => {
    if (rzpState === 'upi') {
      timerRef.current = setInterval(() => {
        setUpiSeconds((prev) => (prev > 0 ? prev - 1 : 120));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rzpState]);

  const handleProceedToCheckout = async () => {
    let currentUser = user;
    if (getDetails) {
      try {
        const fresh = await getDetails();
        if (fresh?.user) currentUser = fresh.user;
      } catch (err) {
        console.warn('Could not refresh profile details:', err);
      }
    }

    if (currentUser) {
      setFormData(prev => ({
        customer_name: currentUser.name || prev.customer_name || '',
        customer_email: currentUser.email || prev.customer_email || '',
        customer_phone: currentUser.phone || prev.customer_phone || '',
        shipping_address: formatUserShippingAddress(currentUser) || prev.shipping_address || '',
      }));
    }
    setError('');
    setShowCheckout(true);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    const updated = cart.map(item => item.id === id ? { ...item, qty: newQty } : item);
    setCart(updated);
    localStorage.setItem('kaya_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('kaya_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * (item.qty || 1)), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  // Validate delivery form and open Razorpay Sandbox gateway modal
  const handleStartRazorpayCheckout = (e) => {
    e.preventDefault();
    if (!formData.customer_name?.trim() || !formData.customer_phone?.trim() || !formData.shipping_address?.trim()) {
      setError('Please fill in all delivery details before paying.');
      return;
    }
    const emailToUse = (formData.customer_email || user?.email || '').trim();
    if (!emailToUse || !/^\S+@\S+\.\S+$/.test(emailToUse)) {
      setError('A valid customer email address is required for receipt & tracking.');
      return;
    }
    if (!cart || cart.length === 0) {
      setError('Your shopping cart is currently empty.');
      return;
    }

    setError('');
    setRzpCardName(formData.customer_name.trim());
    setRzpState('select');
    setRzpOpen(true);
  };

  // Complete Payment and save order into MongoDB
  const completePaymentAndPlaceOrder = async (payMethod = 'Razorpay Sandbox') => {
    setRzpState('processing');
    setSubmitting(true);
    setError('');

    try {
      const simulatedPaymentId = 'pay_' + Math.random().toString(36).substring(2, 14);

      const payload = {
        cart_items: cart,
        total_price: Number(total.toFixed(2)),
        customer_name: formData.customer_name.trim(),
        customer_email: (formData.customer_email || user?.email || '').trim(),
        customer_phone: formData.customer_phone.trim(),
        shipping_address: formData.shipping_address.trim(),
        payment_id: simulatedPaymentId,
      };

      const res = await api.post('/orders/cart-checkout', payload);
      const createdOrderId = res.data.order_id || res.data.data?._id;

      setSuccessMethod(payMethod);
      setRzpState('success');

      // Clear cart
      localStorage.removeItem('kaya_cart');
      window.dispatchEvent(new Event('cartUpdated'));

      setTimeout(() => {
        setRzpOpen(false);
        setShowCheckout(false);
        if (createdOrderId) {
          navigate(`/orders/${createdOrderId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      console.error('Cart checkout error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.total_price ||
        err.message ||
        'Payment processing failed. Please try again.';
      setError(msg);
      setRzpOpen(false);
      setSubmitting(false);
    }
  };

  // Cart and booking are completely disabled for administrators
  if (isAdmin || user?.is_admin) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-6 border border-amber-500/20 shadow-sm">
          <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
          Admin Account
        </span>
        <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-4 mb-3">
          Cart &amp; Booking Disabled
        </h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          The shopping cart and checkout booking options are disabled for administrator sessions. To view and manage client orders, products, and clientele, please use the Admin Dashboard.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-bold text-sm shadow-md hover:opacity-90 dark:hover:bg-stone-200 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Go to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white text-[11px] font-bold uppercase tracking-widest">
          Your Selection
        </span>
        <h1 className="font-display-xl text-4xl md:text-5xl text-primary leading-tight">Your Cart</h1>
        <p className="text-stone-500 mt-2 text-sm">Review your items and complete your bespoke order.</p>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="w-24 h-24 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center border border-stone-100 dark:border-stone-800">
            <span className="material-symbols-outlined text-stone-300 text-4xl">shopping_bag</span>
          </div>
          <h3 className="text-xl font-bold text-primary">Your cart is empty</h3>
          <p className="text-stone-500 text-sm max-w-xs">Browse our collection and add pieces to your cart to start your curation.</p>
          <Link
            to="/products"
            className="bg-emerald-950 dark:bg-white text-white dark:text-stone-950 px-8 py-4 rounded-xl font-semibold hover:opacity-90 dark:hover:bg-stone-200 transition-all flex items-center gap-2"
          >
            Browse Collection
            <span className="material-symbols-outlined text-[18px]">explore</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 flex items-center gap-5 shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => { e.target.src = '/images/masterpiece/product_canvas.png'; }}
                  className="w-24 h-24 object-cover rounded-xl border border-stone-100 dark:border-stone-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold tracking-widest text-emerald-700 dark:text-white uppercase">
                    {item.style || 'Signature'}
                  </span>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base truncate">{item.name}</h4>
                  <p className="text-stone-500 text-xs mt-0.5">INR {Number(item.price).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, (item.qty || 1) - 1)}
                      className="px-2.5 py-1 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-800 dark:text-stone-200">{item.qty || 1}</span>
                    <button
                      onClick={() => updateQuantity(item.id, (item.qty || 1) + 1)}
                      className="px-2.5 py-1 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Remove item"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 whisper-shadow space-y-4">
              <h2 className="font-headline-md text-xl text-primary border-b border-stone-100 dark:border-stone-800 pb-4">Order Summary</h2>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>INR {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>GST (18%)</span>
                  <span>INR {gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Delivery</span>
                  <span className="text-emerald-700 dark:text-white font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-emerald-900 dark:text-white pt-4 border-t border-stone-100 dark:border-stone-800">
                  <span>Total</span>
                  <span>INR {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {user ? (
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-emerald-950 dark:bg-white text-white dark:text-stone-950 py-4 rounded-xl font-bold hover:opacity-90 dark:hover:bg-stone-200 transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(6,78,59,0.25)]"
                >
                  Proceed to Checkout
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <Link
                  to="/login?redirect=/cart"
                  className="w-full bg-emerald-950 dark:bg-white text-white dark:text-stone-950 py-4 rounded-xl font-bold hover:opacity-90 dark:hover:bg-stone-200 transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(6,78,59,0.25)] text-center"
                >
                  Login to Checkout
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </Link>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-stone-50 dark:bg-stone-900/50 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">verified_user</span>
                <span>256-bit SSL encrypted secure checkout</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">local_shipping</span>
                <span>Free delivery — 3-5 business days</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">replay</span>
                <span>30-day hassle-free returns</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-100 dark:border-stone-900 shadow-2xl overflow-hidden">
            <div className="bg-emerald-950 px-8 py-6 flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-[10px] uppercase tracking-widest font-bold">Secure Checkout</p>
                <h3 className="text-white font-bold text-xl">Delivery Details</h3>
              </div>
              <button onClick={() => setShowCheckout(false)} className="text-white/60 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {(formData.customer_phone || formData.shipping_address) && (user?.phone || user?.address) && (
              <div className="mx-8 mt-5 -mb-2 p-3 bg-emerald-50 dark:bg-stone-900 border border-emerald-200/60 dark:border-stone-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-white font-medium">
                <span className="material-symbols-outlined text-[16px] text-emerald-700 dark:text-white">check_circle</span>
                <span>Auto-filled phone and address from your profile.</span>
              </div>
            )}

            <form onSubmit={handleStartRazorpayCheckout} className="p-8 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customer_email}
                    onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.customer_phone}
                    onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                  Shipping Address
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Apartment, suite, street address, city, pin code"
                  value={formData.shipping_address}
                  onChange={e => setFormData({ ...formData, shipping_address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-white font-medium"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-stone-500">Amount Due</p>
                  <p className="text-xl font-extrabold text-emerald-950 dark:text-white">
                    INR {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-bold rounded-xl hover:opacity-90 dark:hover:bg-stone-200 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Processing Payment...' : 'Pay with Razorpay'}
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Sandbox Modal */}
      {rzpOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col font-sans select-none">
            {/* Header */}
            <div className="bg-[#121c2c] px-6 py-5 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2d72d9] flex items-center justify-center text-white font-black shadow-sm">
                  R
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm tracking-wide">Razorpay Checkout</h3>
                  <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">KaYa Curation Payment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRzpOpen(false)}
                className="text-stone-400 hover:text-white transition-colors"
                title="Close Razorpay"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Test Mode Warning Banner */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[14px] font-bold">terminal</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
                  Test Sandbox
                </span>
              </div>
              <button
                type="button"
                onClick={() => completePaymentAndPlaceOrder('Instant Test Approval')}
                disabled={submitting}
                className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                title="Approve immediately without entering card details"
              >
                <span>Quick Pay</span>
                <span className="material-symbols-outlined text-[12px]">bolt</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex flex-col">
              {rzpState === 'select' && (
                <div className="space-y-4">
                  <div className="text-center py-1">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Total Amount Due</p>
                    <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-0.5">
                      INR {Number(total).toFixed(2)}
                    </p>
                  </div>

                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-2">
                    Select Payment Method
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setRzpState('card')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#2d72d9]">credit_card</span>
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Credit / Debit Card</p>
                          <p className="text-[10px] text-stone-400 font-medium">Visa, Mastercard, RuPay</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRzpState('upi')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">qr_code_2</span>
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">UPI / QR Code</p>
                          <p className="text-[10px] text-stone-400 font-medium">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRzpState('netbanking')}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-600">account_balance</span>
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Netbanking</p>
                          <p className="text-[10px] text-stone-400 font-medium">SBI, HDFC, ICICI, Axis Bank</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}

              {rzpState === 'card' && (
                <div className="space-y-3.5">
                  <button
                    type="button"
                    onClick={() => setRzpState('select')}
                    className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_back</span> Back
                  </button>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Cardholder Name</label>
                    <input
                      type="text"
                      value={rzpCardName}
                      onChange={(e) => setRzpCardName(e.target.value)}
                      placeholder="NAME ON CARD"
                      className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Card Number</label>
                    <input
                      type="text"
                      maxLength="19"
                      value={rzpCardNo}
                      onChange={(e) => setRzpCardNo(e.target.value)}
                      placeholder="4111 1111 1111 1111"
                      className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9] font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400">Expiry Date</label>
                      <input
                        type="text"
                        value={rzpCardExpiry}
                        onChange={(e) => setRzpCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400">CVV</label>
                      <input
                        type="password"
                        maxLength="3"
                        value={rzpCardCvv}
                        onChange={(e) => setRzpCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9] font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRzpState('otp')}
                    className="w-full mt-2 bg-[#2d72d9] text-white py-2.5 rounded-xl font-bold hover:bg-[#2561c0] transition-colors flex items-center justify-center gap-2 text-xs shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    Pay INR {Number(total).toFixed(2)} &amp; Authenticate
                  </button>
                </div>
              )}

              {rzpState === 'otp' && (
                <div className="space-y-3.5 text-center">
                  <div className="flex justify-center mb-1">
                    <span className="material-symbols-outlined text-[#2d72d9] text-[32px] animate-pulse">lock_person</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-white">3D Secure Card Verification</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Enter sandbox test OTP: <strong className="text-stone-900 dark:text-white">123456</strong>
                    </p>
                  </div>
                  <div className="max-w-[170px] mx-auto">
                    <input
                      type="text"
                      maxLength="6"
                      value={rzpOtp}
                      onChange={(e) => setRzpOtp(e.target.value)}
                      placeholder="••••••"
                      className="w-full tracking-[1.2em] text-center font-bold bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9] font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => completePaymentAndPlaceOrder('Credit Card (OTP Verified)')}
                    className="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 text-xs shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Verify OTP &amp; Complete Checkout
                  </button>
                </div>
              )}

              {rzpState === 'upi' && (
                <div className="space-y-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => setRzpState('select')}
                    className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-1 self-start"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_back</span> Back
                  </button>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Enter UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-white font-semibold focus:outline-none focus:border-[#2d72d9]"
                    />
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2 text-[10px] font-mono font-bold text-stone-500">
                    Timer:{' '}
                    <span>
                      {Math.floor(upiSeconds / 60)
                        .toString()
                        .padStart(2, '0')}
                      :{(upiSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => completePaymentAndPlaceOrder('UPI Gateway')}
                    className="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition-colors text-xs shadow-md"
                  >
                    Approve Sandbox Transaction
                  </button>
                </div>
              )}

              {rzpState === 'netbanking' && (
                <div className="space-y-3.5">
                  <button
                    type="button"
                    onClick={() => setRzpState('select')}
                    className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_back</span> Back
                  </button>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Choose Bank</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['SBI', 'HDFC', 'ICICI', 'Axis'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setSelectedBank(b);
                          setRzpState('bankRedirect');
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-left hover:border-[#2d72d9] transition-all"
                      >
                        <span className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0"></span>
                        <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {rzpState === 'bankRedirect' && (
                <div className="flex flex-col items-center justify-center py-5 text-center space-y-4">
                  <span className="material-symbols-outlined text-[40px] text-amber-500 animate-bounce">security</span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-white">{selectedBank} Sandbox</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">Simulated bank authorization gateway.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => completePaymentAndPlaceOrder(`Netbanking (${selectedBank})`)}
                    className="bg-[#2d72d9] text-white py-2 px-6 rounded-xl font-bold text-xs shadow-md"
                  >
                    Authorize &amp; Pay
                  </button>
                </div>
              )}

              {rzpState === 'processing' && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-white">Processing Razorpay Transaction</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">Recording curation order with atelier...</p>
                  </div>
                </div>
              )}

              {rzpState === 'success' && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[36px] font-black">check</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">Payment Verified &amp; Placed!</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">{successMethod} Confirmed.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

