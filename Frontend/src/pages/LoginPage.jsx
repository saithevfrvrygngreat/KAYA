import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage({ initialForgot = false }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(initialForgot || searchParams.get('mode') === 'forgot')
  const [forgotStep, setForgotStep] = useState('request') // 'request' | 'verify' | 'reset' | 'success'
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [showForgotPw, setShowForgotPw] = useState(false)
  const [showForgotConfirmPw, setShowForgotConfirmPw] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Sync initial email into forgot modal
  useEffect(() => {
    if (email && !forgotEmail) {
      setForgotEmail(email)
    }
  }, [email])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)

    try {
      const data = await login(email, password)
      const target = data.user.is_admin ? '/admin' : redirectUrl
      navigate(target, {
        state: {
          flash: {
            type: 'success',
            message: data.user.is_admin
              ? 'Welcome to the Admin Control Panel! Logged in successfully.'
              : 'Logged in successfully!'
          }
        }
      })
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ email: err.response?.data?.message || 'The provided credentials do not match our records.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Open modal handler
  const handleOpenForgot = (e) => {
    e?.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    setForgotStep('request')
    setForgotOtp('')
    setForgotNewPassword('')
    setForgotConfirmPassword('')
    if (email) setForgotEmail(email)
    setShowForgotModal(true)
  }

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.')
      return
    }

    setForgotLoading(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail.trim() })
      setForgotSuccess(res.data.message || 'Verification code sent to your email.')
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp)
      setResendCooldown(30)
      setForgotStep('verify')
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send verification code. Please verify your email.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the full 6-digit verification code.')
      return
    }

    setForgotLoading(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const res = await api.post('/auth/verify-reset-otp', {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim()
      })
      setForgotSuccess(res.data.message || 'Code verified successfully!')
      setForgotStep('reset')
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired verification code.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!forgotNewPassword) {
      setForgotError('Please enter a new password.')
      return
    }
    if (forgotNewPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.')
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New password and confirm password do not match.')
      return
    }

    setForgotLoading(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        new_password: forgotNewPassword,
        confirm_password: forgotConfirmPassword
      })
      setForgotSuccess(res.data.message || 'Password reset successful!')
      setForgotStep('success')
      // Prefill in main login form
      setEmail(forgotEmail.trim())
      setPassword('')
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center relative py-20 bg-stone-900"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative w-full max-w-md mx-auto px-6">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h2 className="font-headline-lg text-white text-3xl mb-2">Welcome Back</h2>
            <p className="text-white/80 font-body-md">Sign in to continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-white/20 border ${
                  errors.email ? 'border-rose-400' : 'border-white/10'
                } px-5 py-4 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50`}
                placeholder="Enter your email"
                required
                autoFocus
              />
              {errors.email && (
                <span className="text-xs text-rose-300 mt-1 block font-semibold">{errors.email}</span>
              )}
            </div>

            <div>
              <label className="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/20 border ${
                    errors.password ? 'border-rose-400' : 'border-white/10'
                  } pl-5 pr-12 py-4 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-rose-300 mt-1 block font-semibold">{errors.password}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <span className="text-sm text-white/90">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleOpenForgot}
                className="text-sm text-white hover:text-emerald-300 font-semibold transition-colors underline-offset-4 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-800 shadow-[0_0_20px_rgba(6,78,59,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined text-[20px]">login</span>
            </button>
          </form>

          <p className="text-center mt-8 text-white/80 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-semibold hover:text-emerald-300 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* ─── LUXURY FORGOT PASSWORD MODAL ─────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-stone-900/95 text-stone-100 rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Error Message Alert */}
            {forgotError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0">error</span>
                <span>{forgotError}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {forgotSuccess && forgotStep !== 'success' && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[18px] text-emerald-400 shrink-0">check_circle</span>
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* ─── STEP 1: REQUEST OTP ──────────────────────────────────────── */}
            {forgotStep === 'request' && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20 shadow-inner">
                    <span className="material-symbols-outlined text-[28px]">lock_reset</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                    Enter your account email. We will send a 6-digit OTP code to securely reset your password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-300 font-bold mb-2">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-all"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-stone-300 font-semibold text-xs hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 2: VERIFY OTP ───────────────────────────────────────── */}
            {forgotStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20 shadow-inner">
                    <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Enter Verification Code</h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                    We sent a 6-digit OTP code to <strong className="text-white font-mono">{forgotEmail}</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-300 font-bold mb-2 text-center">
                    6-Digit Security OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-center font-mono text-2xl tracking-[0.5em] text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-all font-bold"
                    required
                    autoFocus
                  />
                  {devOtp && (
                    <div className="mt-2 text-center">
                      <span className="inline-block px-2.5 py-1 rounded bg-white/10 border border-white/20 text-[11px] text-stone-300 font-mono">
                        Demo Sandbox Code: <strong className="text-white">{devOtp}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || forgotLoading}
                    onClick={handleRequestOtp}
                    className="text-white hover:text-emerald-300 font-semibold transition-colors disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-stone-300 font-semibold text-xs hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6}
                    className="flex-1 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <span>Verify OTP</span>
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 3: CREATE NEW PASSWORD ──────────────────────────────── */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20 shadow-inner">
                    <span className="material-symbols-outlined text-[28px]">password</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Set New Password</h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                    OTP matched! Choose a new, secure password for your KaYa account.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-300 font-bold mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotPw ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-all"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPw(!showForgotPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showForgotPw ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-300 font-bold mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPw ? 'text' : 'password'}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPw(!showForgotConfirmPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showForgotConfirmPw ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-stone-300 font-semibold text-xs hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span>Save Password</span>
                        <span className="material-symbols-outlined text-[16px]">save</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 4: SUCCESS CONFIRMATION ─────────────────────────────── */}
            {forgotStep === 'success' && (
              <div className="text-center space-y-5 py-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Password Reset Complete!</h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto mt-2">
                    Your password has been successfully updated. You can now sign in using your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
                  <span className="material-symbols-outlined text-[16px]">login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
