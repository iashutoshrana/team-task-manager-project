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

  const inputClass =
    'w-full bg-black/30 border border-neutral-800 hover:border-neutral-700 text-neutral-100 text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-neutral-700 resize-none'

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1
              className="text-neutral-50 text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}
            >
              Projects
            </h1>
            <p className="text-neutral-600 text-sm mt-1.5">Manage and track all your team projects.</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}
            >
              + New Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-5 h-5 border-2 border-neutral-800 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-neutral-600 text-sm">Loading projects…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-neutral-800 rounded-2xl p-20 text-center">
            <p className="text-neutral-300 font-semibold text-base mb-2">No projects yet</p>
            <p className="text-neutral-600 text-sm mb-7">Projects you create will appear here.</p>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium border border-neutral-800 hover:border-neutral-700 px-5 py-2 rounded-xl transition-all"
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
                <div
                  key={project.id}
                  className="group bg-[#0f0f1a] border border-neutral-800 rounded-2xl p-5 hover:border-[#2a2a4a] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(99,102,241,0.08)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-0.5" />
                      <h3 className="text-neutral-100 font-semibold text-sm tracking-[-0.2px]">{project.name}</h3>
                    </div>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-neutral-700 hover:text-rose-400 text-lg leading-none ml-2 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  <p className="text-neutral-600 text-xs leading-relaxed mb-5 line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-[10px] text-neutral-700">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-[2px]">
                      <div
                        className="h-[2px] rounded-full transition-all duration-700"
                        style={{ width: `${percent}%`, background: 'linear-gradient(90deg,#6366f1,#818cf8)' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    <span className="text-neutral-700 text-[11px]">{tasks.length} tasks</span>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f0f1a] border border-neutral-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-7">
              <h2
                className="text-neutral-50 font-bold text-lg tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px' }}
              >
                New Project
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-600 hover:text-neutral-300 text-2xl leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05]"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-rose-500/[0.07] border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-neutral-500 text-[13px] font-medium">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-neutral-500 text-[13px] font-medium">
                  Description <span className="text-neutral-700">(optional)</span>
                </label>
                <textarea
                  placeholder="Brief overview of the project…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/[0.04] hover:bg-white/[0.07] border border-neutral-800 text-neutral-400 text-sm font-medium py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white text-sm font-semibold py-3 rounded-xl transition-all duration-200 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}
                >
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