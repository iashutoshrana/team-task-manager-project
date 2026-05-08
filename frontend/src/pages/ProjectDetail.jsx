import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const columns = [
  { key: 'todo', label: 'To Do', labelClass: 'text-gray-400', dotClass: 'bg-gray-600' },
  { key: 'in_progress', label: 'In Progress', labelClass: 'text-blue-400', dotClass: 'bg-blue-500' },
  { key: 'done', label: 'Done', labelClass: 'text-emerald-400', dotClass: 'bg-emerald-500' },
]

const priorityClass = (p) => {
  if (p === 'high') return 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
  if (p === 'medium') return 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20'
  return 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20'
}

const inputClass = 'w-full bg-black/20 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 transition-colors'
const disabledInputClass = 'w-full bg-black/20 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none opacity-40 cursor-not-allowed'

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
    setError('')
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
      assignee_id: task.assignee_id ? String(task.assignee_id) : ''
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, {
          ...form,
          assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
          due_date: form.due_date || null
        })
      } else {
        await api.post('/tasks', { ...form, project_id: id })
      }
      setShowModal(false)
      setEditTask(null)
      await fetchProject()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
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
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3">
          <div className="w-5 h-5 border-2 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <p className="text-gray-600 text-sm">Project not found.</p>
        </div>
      </div>
    )
  }

  const tasks = project.Tasks || []
  const doneCount = tasks.filter(t => t.status === 'done').length
  const percent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0" />
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-gray-600 text-sm mt-1">{project.description || 'No description provided.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 ml-6">
            <div className="flex items-center gap-2.5">
              <div className="w-24 bg-white/5 rounded-full h-0.5">
                <div
                  className="h-0.5 rounded-full transition-all duration-700 bg-blue-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-gray-600 text-xs">{percent}%</span>
            </div>
            <button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${col.dotClass}`} />
                    <span className={`text-sm font-semibold ${col.labelClass}`}>{col.label}</span>
                  </div>
                  <span className="text-gray-700 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="border border-dashed border-white/5 rounded-lg py-7 text-center">
                      <p className="text-gray-700 text-xs">No tasks</p>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3.5 hover:bg-white/5 transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-gray-100 text-sm font-medium leading-snug">{task.title}</h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEdit(task)}
                              className="text-gray-600 hover:text-blue-400 text-[11px] font-medium px-1.5 py-0.5 rounded transition"
                            >
                              Edit
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="text-gray-600 hover:text-red-400 text-[11px] font-medium px-1.5 py-0.5 rounded transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-gray-600 text-xs leading-relaxed mb-2.5 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${priorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.assignee && (
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                              {task.assignee.name}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                              new Date(task.due_date) < new Date() && task.status !== 'done'
                                ? 'bg-red-500/10 text-red-400'
                                : 'text-gray-600 bg-white/5'
                            }`}>
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="w-full bg-black/20 border border-white/5 text-gray-500 text-[11px] rounded-md px-2.5 py-1.5 outline-none cursor-pointer"
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

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f0f17] border border-white/10 rounded-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-white text-2xl leading-none transition">&times;</button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-sm font-medium">Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={isAdmin ? inputClass : disabledInputClass}
                  disabled={!isAdmin}
                  required
                />
                {!isAdmin && <span className="text-gray-600 text-xs">Admin only</span>}
              </div>

              {/* description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-sm font-medium">Description <span className="text-gray-600">(optional)</span></label>
                <textarea
                  placeholder="Add more context..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={isAdmin ? `${inputClass} resize-none min-h-[80px]` : `${disabledInputClass} resize-none min-h-[80px]`}
                  disabled={!isAdmin}
                  rows={3}
                />
                {!isAdmin && <span className="text-gray-600 text-xs">Admin only</span>}
              </div>

              {/* priority + status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-sm font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className={isAdmin ? inputClass : disabledInputClass}
                    disabled={!isAdmin}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {!isAdmin && <span className="text-gray-600 text-xs">Admin only</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={inputClass}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* assignee + due date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-sm font-medium">Assignee</label>
                  <select
                    value={form.assignee_id}
                    onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                    className={isAdmin ? inputClass : disabledInputClass}
                    disabled={!isAdmin}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  {!isAdmin && <span className="text-gray-600 text-xs">Admin only</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-sm font-medium">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className={isAdmin ? inputClass : disabledInputClass}
                    disabled={!isAdmin}
                  />
                  {!isAdmin && <span className="text-gray-600 text-xs">Admin only</span>}
                </div>
              </div>

              {/* buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 py-2.5 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
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