import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = (id && id !== 'confirmation') ? id : searchParams.get('order_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState('');

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  useEffect(() => {
    if (toastError) {
      const t = setTimeout(() => setToastError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toastError]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/orders/${order._id || order.id}/cancel`);
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
      setToastMsg(res.data?.message || 'Order has been cancelled successfully.');
      setShowCancelModal(false);
    } catch (err) {
      setToastError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then(res => {
          setOrder(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isCancelled = order?.status === 'cancelled';
  const canCancel = order && ['placed', 'processing', 'shipping'].includes(order.status);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
      {toastError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[20px] text-rose-400">error</span>
          <span>{toastError}</span>
        </div>
      )}

      <div className="bg-white dark:bg-stone-950 p-8 md:p-12 rounded-[2.5rem] border border-stone-100 dark:border-stone-900 whisper-shadow text-center space-y-8">
        {/* Animated Check / Cancel Circle */}
        <div className={`relative w-24 h-24 mx-auto flex items-center justify-center rounded-full ${
          isCancelled ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white'
        }`}>
          <span className="material-symbols-outlined text-[52px] animate-pulse">
            {isCancelled ? 'cancel' : 'check_circle'}
          </span>
          <div className={`absolute inset-0 border-[3px] rounded-full scale-110 animate-ping opacity-25 ${
            isCancelled ? 'border-rose-500/30' : 'border-emerald-500/30 dark:border-white/30'
          }`}></div>
        </div>

        <div className="space-y-3">
          <span className={`inline-block px-4 py-1.5 rounded-full font-label-sm uppercase tracking-widest text-[11px] font-bold ${
            isCancelled ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400' : 'bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white'
          }`}>
            {isCancelled ? 'KaYa Order Cancelled' : 'KaYa Order Placed'}
          </span>
          <h1 className="font-display-xl text-3xl md:text-4xl text-primary leading-tight font-extrabold">
            {isCancelled ? 'Order Cancellation Confirmed' : 'Thank You For Your Curation'}
          </h1>
          <p className="font-body-md text-stone-500 max-w-lg mx-auto leading-relaxed">
            {isCancelled
              ? 'This order has been cancelled and production will not proceed. Contact customer concierge for any billing inquiries.'
              : 'Your custom styling selection has been submitted to our design laboratory. Our master craftsmen are preparing your bespoke frame.'}
          </p>
        </div>

        {order && (
          <div className="bg-stone-50 dark:bg-stone-900/40 rounded-3xl p-6 border border-stone-100 dark:border-stone-900/50 max-w-md mx-auto text-left space-y-4 text-sm font-semibold">
            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
              <span className="text-stone-400">Order Number</span>
              <span className="text-primary font-mono text-emerald-950 dark:text-white">{order.order_number}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
              <span className="text-stone-400">Customer Name</span>
              <span className="text-primary">{order.customer_name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
              <span className="text-stone-400">Secure Payment ID</span>
              <span className="text-primary font-mono text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-emerald-700 dark:text-white">lock</span>
                {order.payment_id}
              </span>
            </div>

            {order.custom_design?.product && (
              <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                <span className="text-stone-400">Custom Frame Base</span>
                <span className="text-primary">{order.custom_design.product.name}</span>
              </div>
            )}

            {order.cart_items && order.cart_items.length > 0 && (
              <div className="py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                <span className="text-stone-400 block mb-2">Purchased Selection</span>
                <div className="space-y-2.5">
                  {order.cart_items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80'}
                            className="w-full h-full object-cover"
                            alt={item.name}
                          />
                        </div>
                        <span className="text-stone-700 dark:text-stone-300">
                          {item.name} <small className="text-stone-400">x{item.qty || 1}</small>
                        </span>
                      </div>
                      <span className="text-stone-800 dark:text-stone-200">
                        INR {(Number(item.price) * (item.qty || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
              <span className="text-stone-400">Status</span>
              <div className="flex flex-col items-end gap-0.5">
                <span className={`uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isCancelled ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' : 'text-stone-800 dark:text-white bg-stone-100 dark:bg-white/10 border-stone-200 dark:border-white/20'
                }`}>
                  {order.status}
                </span>
                {isCancelled && (
                  <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400">
                    {order.cancelled_by === 'user' ? 'Cancelled by you' : 'Cancelled by admin'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <span className="text-stone-400">Total Charged</span>
              <span className="text-lg font-bold text-emerald-900 dark:text-white">
                INR {Number(order.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Milestones tracking */}
        {!isCancelled && (
          <div className="max-w-md mx-auto space-y-4 text-left pt-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-400">Next Steps</h3>
            <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-emerald-500/30 dark:before:bg-white/20">
              <div className="relative">
                <span className="absolute left-[-26px] top-0.5 w-4 h-4 bg-emerald-700 dark:bg-white dark:text-stone-950 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                <h4 className="text-sm font-bold text-primary">Curation Secured</h4>
                <p className="text-xs text-stone-400">Specifications logged and colors mixed in laboratory.</p>
              </div>
              <div className="relative">
                <span className="absolute left-[-26px] top-0.5 w-4 h-4 bg-stone-300 dark:bg-stone-800 rounded-full flex items-center justify-center text-[10px] text-stone-500">2</span>
                <h4 className="text-sm font-bold text-primary">Crafting & Mounting</h4>
                <p className="text-xs text-stone-400">Premium wood moulding cut to size and passpartout border matting applied.</p>
              </div>
              <div className="relative">
                <span className="absolute left-[-26px] top-0.5 w-4 h-4 bg-stone-300 dark:bg-stone-800 rounded-full flex items-center justify-center text-[10px] text-stone-500">3</span>
                <h4 className="text-sm font-bold text-primary">Dispatch</h4>
                <p className="text-xs text-stone-400">Inspected by our master curator and shipped with high-security crating.</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-bold rounded-xl hover:opacity-90 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
          >
            Go to Your Dashboard
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
          </Link>

          {canCancel && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 border border-stone-300 dark:border-white/20 bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white hover:bg-stone-200 dark:hover:bg-white/20 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Cancel Order
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}

          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-bold rounded-xl hover:bg-stone-200 dark:hover:bg-stone-850 transition-all flex items-center justify-center gap-2"
          >
            Continue Browsing
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-white flex items-center justify-center mx-auto border border-stone-200 dark:border-white/20">
              <span className="material-symbols-outlined text-[36px]">cancel</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100">Cancel Order?</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Are you sure you want to cancel order <strong className="font-mono text-stone-800 dark:text-stone-200">{order?.order_number}</strong>? This action cannot be reversed and crafting will be halted.
              </p>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl text-xs text-stone-600 dark:text-stone-400 font-medium">
              Current Status: <span className="uppercase font-bold text-stone-900 dark:text-white">{order?.status}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {cancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">cancel</span>
                    Confirm Cancel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

