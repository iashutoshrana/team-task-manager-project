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

  const priorityBadge = (priority) => {
    if (priority === 'high') return 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
    if (priority === 'medium') return 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20'
    return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
  }

  const statusBadge = (status) => {
    if (status === 'done') return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
    if (status === 'in_progress') return 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20'
    return 'bg-white/[0.04] text-neutral-600 ring-1 ring-white/[0.06]'
  }

  if (loading) {
    return (
      
       <div className="min-h-screen bg-[#121826]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4">
          <div className="w-5 h-5 border-2 border-neutral-800 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-neutral-600 text-sm">Loading workspace…</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      valueColor: 'text-neutral-100',
      bar: 'from-neutral-700 to-neutral-600',
      hint: 'All assigned tasks',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      valueColor: 'text-sky-400',
      bar: 'from-sky-600 to-sky-400',
      hint: 'Active right now',
    },
    {
      label: 'Completed',
      value: doneTasks,
      valueColor: 'text-emerald-400',
      bar: 'from-emerald-600 to-emerald-400',
      hint: `${totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}% completion rate`,
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      valueColor: 'text-rose-400',
      bar: 'from-rose-600 to-rose-400',
      hint: overdueTasks === 0 ? 'All on schedule ✓' : 'Needs attention',
    },
  ]

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* Page header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1
              className="text-neutral-50 text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}
            >
              Overview
            </h1>
            <p className="text-neutral-600 text-sm mt-1.5">
              Welcome back,{' '}
              <span className="text-neutral-400 font-medium">{user?.name}</span>
            </p>
          </div>
          <div className="text-neutral-400 text-[12px] bg-white/[0.05] border border-neutral-700 px-3.5 py-1.5 rounded-full tracking-wide font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-[#0f0f1a] border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] cursor-default"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`h-[2px] w-full bg-gradient-to-r ${stat.bar}`} />
              <div className="p-5 pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 mb-3">
                  {stat.label}
                </p>
                <p
                  className={`text-4xl font-bold leading-none tracking-tight ${stat.valueColor}`}
                  style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-2px' }}
                >
                  {stat.value}
                </p>
                <p className="text-[11px] text-neutral-700 mt-2.5">{stat.hint}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">Projects</h2>
            <Link to="/projects" className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white/[0.02] border border-dashed border-neutral-800 rounded-2xl p-14 text-center">
              <p className="text-neutral-600 text-sm">No projects yet.</p>
              {user?.role === 'admin' && (
                <Link to="/projects" className="text-indigo-400 text-sm mt-2 inline-block hover:text-indigo-300 transition-colors">
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
                    className="group bg-[#0f0f1a] border border-neutral-800 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2a2a4a] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(99,102,241,0.08)] block relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      <h3 className="text-neutral-100 font-semibold text-sm group-hover:text-indigo-300 transition-colors leading-snug tracking-[-0.2px]">
                        {project.name}
                      </h3>
                    </div>
                    <p className="text-neutral-600 text-xs mt-1 mb-5 line-clamp-2 leading-relaxed pl-[18px]">
                      {project.description || 'No description provided.'}
                    </p>
                    <div className="space-y-2">
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
                    <p className="text-neutral-700 text-[10px] mt-3">{total} tasks</p>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Recent tasks */}
        <section>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 mb-5">Recent Tasks</h2>

          {tasks.length === 0 ? (
            <div className="bg-white/[0.02] border border-dashed border-neutral-800 rounded-2xl p-14 text-center">
              <p className="text-neutral-600 text-sm">No tasks assigned yet.</p>
            </div>
          ) : (
            <div className="bg-[#0f0f1a] border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] px-6 py-3 bg-black/25 border-b border-neutral-800/70">
                {['Task', 'Project', 'Priority', 'Status'].map(h => (
                  <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-700">{h}</span>
                ))}
              </div>
              {tasks.slice(0, 6).map((task, i) => (
                <div
                  key={task.id}
                  className={`grid grid-cols-[2fr_1.5fr_1fr_1fr] px-6 py-3.5 items-center hover:bg-white/[0.015] transition-colors cursor-default ${
                    i < Math.min(tasks.length, 6) - 1 ? 'border-b border-white/[0.03]' : ''
                  }`}
                >
                  <span className="text-neutral-200 text-sm font-medium truncate pr-4 tracking-[-0.1px]">{task.title}</span>
                  <span className="text-neutral-600 text-xs truncate pr-4">{task.Project?.name || '—'}</span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-[6px] w-fit capitalize ${priorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-[6px] w-fit capitalize ${statusBadge(task.status)}`}>
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