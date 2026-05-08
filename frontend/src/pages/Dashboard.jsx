import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects')
        ])
        setTasks(tasksRes.data)
        setProjects(projectsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false
    return new Date(t.due_date) < new Date() && t.status !== 'done'
  }).length

  const priorityClass = (priority) => {
    if (priority === 'high') return 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
    if (priority === 'medium') return 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20'
    return 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20'
  }

  const statusClass = (status) => {
    if (status === 'done') return 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20'
    if (status === 'in_progress') return 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
    return 'bg-gray-700/50 text-gray-500 ring-1 ring-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3">
          <div className="w-5 h-5 border-2 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, <span className="text-gray-300 font-medium">{user?.name}</span>
            </p>
          </div>
          <div className="text-gray-600 text-xs bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-full">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Total Tasks', value: totalTasks, valueClass: 'text-white', bar: 'from-gray-600 to-gray-500', hint: 'All assigned tasks' },
            { label: 'In Progress', value: inProgressTasks, valueClass: 'text-blue-400', bar: 'from-blue-500 to-indigo-500', hint: 'Active right now' },
            { label: 'Completed', value: doneTasks, valueClass: 'text-emerald-400', bar: 'from-emerald-500 to-teal-400', hint: `${totalTasks ? Math.round((doneTasks/totalTasks)*100) : 0}% completion rate` },
            { label: 'Overdue', value: overdueTasks, valueClass: 'text-red-400', bar: 'from-red-500 to-orange-500', hint: overdueTasks === 0 ? 'All on schedule ✓' : 'Needs attention' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5">
              <div className={`h-0.5 w-full bg-gradient-to-r ${stat.bar}`} />
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2.5">{stat.label}</p>
                <p className={`text-3xl font-bold tracking-tight leading-none ${stat.valueClass}`}>{stat.value}</p>
                <p className="text-[11px] text-gray-700 mt-2">{stat.hint}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Projects</h2>
            <Link to="/projects" className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-12 text-center">
              <p className="text-gray-600 text-sm">No projects yet.</p>
              {user?.role === 'admin' && (
                <Link to="/projects" className="text-blue-400 text-sm mt-2 inline-block hover:text-blue-300 transition-colors">
                  Create your first project →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {projects.slice(0, 3).map(project => {
                const projectTasks = project.Tasks || []
                const done = projectTasks.filter(t => t.status === 'done').length
                const total = projectTasks.length
                const percent = total > 0 ? Math.round((done / total) * 100) : 0

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 block group"
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors leading-snug">{project.name}</h3>
                    </div>
                    <p className="text-gray-600 text-xs mt-1 mb-4 line-clamp-2 leading-relaxed pl-4.5">
                      {project.description || 'No description provided.'}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-gray-700">
                        <span>Progress</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-0.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-0.5 rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-gray-700 text-[10px] mt-3">{total} tasks</p>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Recent tasks */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-4">Recent Tasks</h2>

          {tasks.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-12 text-center">
              <p className="text-gray-600 text-sm">No tasks assigned yet.</p>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] px-5 py-3 bg-black/20 border-b border-white/[0.05]">
                {['Task', 'Project', 'Priority', 'Status'].map(h => (
                  <span key={h} className="text-[10px] font-semibold uppercase tracking-widest text-gray-700">{h}</span>
                ))}
              </div>
              {tasks.slice(0, 6).map((task, i) => (
                <div
                  key={task.id}
                  className={`grid grid-cols-[2fr_1.5fr_1fr_1fr] px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors ${
                    i < tasks.slice(0, 6).length - 1 ? 'border-b border-white/[0.03]' : ''
                  }`}
                >
                  <span className="text-gray-300 text-sm font-medium truncate pr-4">{task.title}</span>
                  <span className="text-gray-600 text-xs truncate pr-4">{task.Project?.name || '—'}</span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md w-fit capitalize ${priorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md w-fit capitalize ${statusClass(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}