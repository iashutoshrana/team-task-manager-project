import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-white font-bold text-xl">TaskManager</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-400 hover:text-white text-sm transition">Dashboard</Link>
            <Link to="/projects" className="text-gray-400 hover:text-white text-sm transition">Projects</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}