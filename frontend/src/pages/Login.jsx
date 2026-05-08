import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gray-900 border-r border-gray-800 px-12 py-10">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-blue-500 rounded-md" style={{ transform: 'rotate(12deg)' }} />
          <span className="text-white font-bold text-[15px] tracking-tight">Taskflow</span>
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight tracking-tight">
            Clarity for<br />every team.
          </h2>
          <p className="text-gray-500 mt-4 text-[15px] leading-relaxed max-w-xs">
            Manage projects, assign tasks, and track progress — all in one place.
          </p>
        </div>

        <div className="w-12 h-0.5 bg-blue-500 rounded-full" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-6 h-6 bg-blue-500 rounded-md" style={{ transform: 'rotate(12deg)' }} />
            <span className="text-white font-bold text-[15px] tracking-tight">Taskflow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-white text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="text-gray-500 text-sm mt-1.5">Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-gray-400 text-[13px] font-medium">Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-gray-400 text-[13px] font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}