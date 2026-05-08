import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/projects', form)
      setForm({ name: '', description: '' })
      setShowModal(false)
      fetchProjects()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}`)
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track all your team projects.</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg,#3b82f6,#6366f1)'}}
            >
              + New Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-5 h-5 border-2 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.05] border-dashed rounded-xl p-16 text-center">
            <p className="text-gray-300 font-semibold text-base mb-2">No projects yet</p>
            <p className="text-gray-600 text-sm mb-6">Projects you create will appear here.</p>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium border border-white/[0.08] hover:border-white/[0.15] px-4 py-2 rounded-lg transition-all"
              >
                Create first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projects.map(project => {
              const tasks = project.Tasks || []
              const done = tasks.filter(t => t.status === 'done').length
              const percent = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

              return (
                <div key={project.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-blue-500/20 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-0.5" />
                      <h3 className="text-white font-semibold text-sm">{project.name}</h3>
                    </div>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-700 hover:text-red-400 text-lg leading-none ml-2 transition-colors"
                        title="Delete"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[10px] text-gray-700">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-0.5">
                      <div
                        className="h-0.5 rounded-full transition-all duration-700"
                        style={{width:`${percent}%`, background:'linear-gradient(90deg,#3b82f6,#6366f1)'}}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    <span className="text-gray-700 text-[11px]">{tasks.length} tasks</span>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                    >
                      Open →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f0f17] border border-white/[0.08] rounded-2xl p-7 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg tracking-tight">New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-white text-2xl leading-none transition-colors">&times;</button>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-gray-500 text-[13px] font-medium">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/[0.07] text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 transition-colors placeholder-gray-700"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-gray-500 text-[13px] font-medium">Description <span className="text-gray-700">(optional)</span></label>
                <textarea
                  placeholder="Brief overview of the project..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-black/30 border border-white/[0.07] text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 transition-colors resize-none placeholder-gray-700"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-gray-400 text-sm font-medium py-3 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 text-white text-sm font-semibold py-3 rounded-lg transition-all hover:-translate-y-0.5" style={{background:'linear-gradient(135deg,#3b82f6,#6366f1)'}}>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}