import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Live password strength checks
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      })
      navigate('/', {
        state: {
          flash: {
            type: 'success',
            message: 'Account created successfully!'
          }
        }
      })
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ general: err.response?.data?.message || 'Registration failed. Please check inputs.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center relative py-12 bg-stone-900"
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
            <h2 className="font-headline-lg text-white text-3xl mb-2">Create Account</h2>
            <p className="text-white/80 font-body-md">Join us to start personalizing your space.</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-white/20 border ${
                  errors.name ? 'border-rose-400' : 'border-white/10'
                } px-5 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50`}
                placeholder="Enter your full name"
                required
                autoFocus
              />
              {errors.name && (
                <span className="text-xs text-rose-300 mt-1 block font-semibold">{errors.name}</span>
              )}
            </div>

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
                } px-5 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50`}
                placeholder="Enter your email"
                required
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
                  } pl-5 pr-12 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50`}
                  placeholder="Create a strong password"
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

              {/* Live password strength checker */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs text-white/60 uppercase tracking-widest mb-2">Password must contain:</p>
                  {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'upper', label: 'One uppercase letter (A–Z)' },
                    { key: 'lower', label: 'One lowercase letter (a–z)' },
                    { key: 'number', label: 'One number (0–9)' },
                    { key: 'symbol', label: 'One special character (!@#$…)' }
                  ].map(({ key, label }) => {
                    const pass = rules[key]
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] transition-colors ${
                            pass ? 'text-emerald-400' : 'text-white/30'
                          }`}
                        >
                          {pass ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-xs transition-colors ${pass ? 'text-emerald-300' : 'text-white/50'}`}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={`w-full bg-white/20 border ${
                    errors.password_confirmation ? 'border-rose-400' : 'border-white/10'
                  } pl-5 pr-12 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password_confirmation && (
                <span className="text-xs text-rose-300 mt-1 block font-semibold">
                  {errors.password_confirmation}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-800 shadow-[0_0_20px_rgba(6,78,59,0.4)] transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </button>
          </form>

          <p className="text-center mt-8 text-white/80 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:text-emerald-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

