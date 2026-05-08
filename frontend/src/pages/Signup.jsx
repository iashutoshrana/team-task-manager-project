import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-[#0f0f1a] border border-neutral-800 hover:border-neutral-700 text-neutral-100 text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-neutral-700'

  return (
    <div className="min-h-screen bg-[#09090f] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 border-r border-neutral-800/60 px-14 py-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-600/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-violet-600/[0.05] blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 relative">
          <div
            className="w-6 h-6 rounded-[7px] shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', transform: 'rotate(12deg)' }}
          />
          <span className="text-neutral-100 font-bold text-[15px] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Taskflow
          </span>
        </div>

        <div className="relative">
          <h2
            className="text-neutral-50 text-[38px] font-bold leading-[1.15]"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-1px' }}
          >
            Built for<br />teams that<br />ship.
          </h2>
          <p className="text-neutral-600 mt-5 text-[15px] leading-relaxed max-w-xs">
            Create an account and start managing your projects with your team today.
          </p>

          <div className="mt-10 space-y-3">
            {['Set up in under 2 minutes', 'Invite your whole team for free', 'Full admin & member controls'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                  <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                    <path d="M1 3.5L3 5.5L7 1.5" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-neutral-500 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-10 h-[2px] bg-indigo-500/50 rounded-full relative" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(99,102,241,0.04),transparent_60%)] pointer-events-none" />

        <div className="w-full max-w-sm relative">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-6 h-6 rounded-[7px] shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', transform: 'rotate(12deg)' }}
            />
            <span className="text-neutral-100 font-bold text-[15px] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Taskflow
            </span>
          </div>

          <div className="mb-9">
            <h1
              className="text-neutral-50 text-2xl font-bold"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}
            >
              Create account
            </h1>
            <p className="text-neutral-600 text-sm mt-1.5">Fill in your details to get started.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-rose-500/[0.07] border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-neutral-500 text-[13px] font-medium">Full Name</label>
              <input
                type="text"
                placeholder="Ankush Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-500 text-[13px] font-medium">Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-500 text-[13px] font-medium">Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-500 text-[13px] font-medium">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 mt-1"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 8px 32px rgba(99,102,241,0.25)' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-neutral-700 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}