import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLink = (to, label, exact = false) => {
    const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
    return (
      <Link
        to={to}
        className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 tracking-[0.01em] ${
          isActive
            ? 'text-neutral-100 bg-white/[0.07]'
            : 'text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04]'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-[#09090f]/90 border-b border-neutral-800/60 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between" style={{ height: 56 }}>

        {/* Left */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-6 h-6 rounded-[7px] shrink-0 transition-transform duration-300 group-hover:rotate-[24deg]"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', transform: 'rotate(12deg)' }}
            />
            <span className="text-neutral-100 font-bold text-[15px] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Taskflow
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {navLink('/', 'Overview', true)}
            {navLink('/projects', 'Projects')}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-[30px] h-[30px] rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <span className="text-indigo-400 text-[11px] font-bold leading-none">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:flex flex-col gap-0.5">
              <span className="text-neutral-200 text-[13px] font-medium leading-none">{user?.name}</span>
              <span className="text-neutral-600 text-[10px] capitalize leading-none tracking-wide">{user?.role}</span>
            </div>
          </div>

          <div className="w-px h-4 bg-neutral-800 mx-0.5" />

          <button
            onClick={handleLogout}
            className="text-neutral-500 hover:text-neutral-300 text-[12px] font-medium px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-all duration-200"
          >
            Sign out
          </button>
        </div>

      </div>
    </nav>
  )
}