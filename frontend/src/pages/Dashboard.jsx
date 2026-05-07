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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening today</p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-3xl font-bold text-white mt-1">{totalTasks}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{inProgressTasks}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{doneTasks}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Overdue</p>
            <p className="text-3xl font-bold text-red-400 mt-1">{overdueTasks}</p>
          </div>
        </div>

        {/* projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            <Link to="/projects" className="text-blue-400 text-sm hover:underline">View all</Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400">No projects yet</p>
              {user?.role === 'admin' && (
                <Link to="/projects" className="text-blue-400 text-sm mt-2 inline-block hover:underline">
                  Create your first project
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.slice(0, 3).map(project => {
                const projectTasks = project.Tasks || []
                const done = projectTasks.filter(t => t.status === 'done').length
                const total = projectTasks.length
                const percent = total > 0 ? Math.round((done / total) * 100) : 0

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-500 transition"
                  >
                    <h3 className="text-white font-semibold">{project.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">{total} tasks</p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* recent tasks */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Tasks</h2>
          {tasks.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400">No tasks yet</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-white font-medium">{task.title}</p>
                    <p className="text-gray-400 text-sm">{task.Project?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      task.status === 'done' ? 'bg-green-500/10 text-green-400' :
                      task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}