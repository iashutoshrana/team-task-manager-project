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

  return (
    <nav className="bg-[#0a0a0f]/95 border-b border-white/[0.06] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-13 flex items-center justify-between" style={{height:'52px'}}>

        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-6 h-6 rounded-lg shrink-0" style={{background:'linear-gradient(135deg,#3b82f6,#6366f1)',transform:'rotate(12deg)'}} />
            <span className="text-white font-bold text-[15px] tracking-tight">Taskflow</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`text-sm px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'text-white bg-white/[0.08]'
                  : 'text-gray-600 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/projects"
              className={`text-sm px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                location.pathname.startsWith('/projects')
                  ? 'text-white bg-white/[0.08]'
                  : 'text-gray-600 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Projects
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
              <span className="text-blue-400 text-xs font-bold leading-none">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:flex flex-col gap-0.5">
              <span className="text-white text-sm font-medium leading-none">{user?.name}</span>
              <span className="text-gray-600 text-[11px] capitalize leading-none">{user?.role}</span>
            </div>
          </div>

          <div className="w-px h-5 bg-white/[0.07] mx-1" />

          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-white text-xs font-medium px-3 py-1.5 rounded-md border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200"
          >
            Sign out
          </button>
        </div>

      </div>
    </nav>
  )
}