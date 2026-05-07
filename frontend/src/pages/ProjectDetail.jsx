import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const columns = [
  { key: 'todo', label: 'To Do', color: 'text-gray-400' },
  { key: 'in_progress', label: 'In Progress', color: 'text-blue-400' },
  { key: 'done', label: 'Done', color: 'text-green-400' }
]

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    status: 'todo', due_date: '', assignee_id: ''
  })
  const [error, setError] = useState('')

  const fetchProject = async () => {
    try {
      const [projectRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users')
      ])
      setProject(projectRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProject() }, [id])

  const openCreate = () => {
    setEditTask(null)
    setForm({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assignee_id: '' })
    setShowModal(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assignee_id: task.assignee_id || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, form)
      } else {
        await api.post('/tasks', { ...form, project_id: id })
      }
      setShowModal(false)
      fetchProject()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status })
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Project not found</p>
      </div>
    )
  }

  const tasks = project.Tasks || []

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <p className="text-gray-400 mt-1">{project.description || 'No description'}</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Task
          </button>
        </div>

        {/* kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-semibold ${col.color}`}>{col.label}</h2>
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-6">No tasks</p>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-white text-sm font-medium">{task.title}</h3>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => openEdit(task)}
                              className="text-gray-500 hover:text-blue-400 text-xs transition"
                            >
                              ✏️
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="text-gray-500 hover:text-red-400 text-xs transition"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
                            {task.priority}
                          </span>

                          {task.assignee && (
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                              {task.assignee.name}
                            </span>
                          )}

                          {task.due_date && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              new Date(task.due_date) < new Date() && task.status !== 'done'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* quick status change */}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="mt-3 w-full bg-gray-700 border border-gray-600 text-gray-300 text-xs rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* task modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-semibold text-lg mb-5">
              {editTask ? 'Edit Task' : 'Create Task'}
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Task description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Assignee</label>
                <select
                  value={form.assignee_id}
                  onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition"
                >
                  {editTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}