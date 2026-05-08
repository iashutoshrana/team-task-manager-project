import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const columns = [
  { key: 'todo', label: 'To Do', labelClass: 'text-neutral-400', dotClass: 'bg-neutral-600', ringClass: 'ring-neutral-700' },
  { key: 'in_progress', label: 'In Progress', labelClass: 'text-sky-400', dotClass: 'bg-sky-500', ringClass: 'ring-sky-500/30' },
  { key: 'done', label: 'Done', labelClass: 'text-emerald-400', dotClass: 'bg-emerald-500', ringClass: 'ring-emerald-500/30' },
]

const priorityBadge = (p) => {
  if (p === 'high') return 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
  if (p === 'medium') return 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20'
  return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
}

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

  const isAdmin = user?.role === 'admin'

  const inputClass = 'w-full bg-black/25 border border-neutral-800 hover:border-neutral-700 text-neutral-100 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10 transition-all'
  const disabledInputClass = 'w-full bg-black/15 border border-neutral-800/50 text-neutral-500 text-sm rounded-xl px-3 py-2.5 outline-none opacity-40 cursor-not-allowed'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090f]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4">
          <div className="w-5 h-5 border-2 border-neutral-800 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-neutral-600 text-sm">Loading project…</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#09090f]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <p className="text-neutral-600 text-sm">Project not found.</p>
        </div>
      </div>
    )
  }

  const tasks = project.Tasks || []
  const doneCount = tasks.filter(t => t.status === 'done').length
  const percent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <div>
              <h1
                className="text-neutral-50 text-xl font-bold tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.4px' }}
              >
                {project.name}
              </h1>
              <p className="text-neutral-600 text-sm mt-1">{project.description || 'No description provided.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 shrink-0 ml-6">
            <div className="flex items-center gap-3">
              <div className="w-28 bg-white/[0.05] rounded-full h-[2px]">
                <div
                  className="h-[2px] rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, background: 'linear-gradient(90deg,#6366f1,#818cf8)' }}
                />
              </div>
              <span className="text-neutral-600 text-xs font-medium">{percent}%</span>
            </div>
            <button
              onClick={openCreate}
              className="text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="bg-[#0d0d18] border border-neutral-800/60 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${col.dotClass}`} />
                    <span className={`text-sm font-semibold ${col.labelClass}`}>{col.label}</span>
                  </div>
                  <span className={`text-neutral-600 text-xs bg-white/[0.04] ring-1 ${col.ringClass} px-2 py-0.5 rounded-full font-medium`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="border border-dashed border-neutral-800 rounded-xl py-8 text-center">
                      <p className="text-neutral-700 text-xs">No tasks</p>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        className="group bg-[#0f0f1a] border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <h4 className="text-neutral-200 text-sm font-medium leading-snug tracking-[-0.1px]">{task.title}</h4>
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(task)}
                              className="text-neutral-600 hover:text-indigo-400 text-[11px] font-medium px-1.5 py-0.5 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="text-neutral-600 hover:text-rose-400 text-[11px] font-medium px-1.5 py-0.5 rounded-md transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-neutral-600 text-xs leading-relaxed mb-3 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[5px] capitalize ${priorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.assignee && (
                            <span className="text-[10px] text-neutral-500 bg-white/[0.04] ring-1 ring-neutral-800 px-2 py-0.5 rounded-[5px]">
                              {task.assignee.name}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-[5px] font-medium ${
                              new Date(task.due_date) < new Date() && task.status !== 'done'
                                ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
                                : 'text-neutral-600 bg-white/[0.04] ring-1 ring-neutral-800'
                            }`}>
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="w-full bg-black/20 border border-neutral-800 hover:border-neutral-700 text-neutral-500 text-[11px] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-colors"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f0f1a] border border-neutral-800 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-7">
              <h2
                className="text-neutral-50 font-bold text-lg"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px' }}
              >
                {editTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-600 hover:text-neutral-300 text-2xl leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05]"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/[0.07] border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-500 text-[13px] font-medium">Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={isAdmin ? inputClass : disabledInputClass}
                  disabled={!isAdmin}
                  required
                />
                {!isAdmin && <span className="text-neutral-700 text-xs">Admin only</span>}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-500 text-[13px] font-medium">
                  Description <span className="text-neutral-700">(optional)</span>
                </label>
                <textarea
                  placeholder="Add more context…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={isAdmin ? `${inputClass} resize-none min-h-[80px]` : `${disabledInputClass} resize-none min-h-[80px]`}
                  disabled={!isAdmin}
                  rows={3}
                />
                {!isAdmin && <span className="text-neutral-700 text-xs">Admin only</span>}
              </div>

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-500 text-[13px] font-medium">Priority</label>
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
                  {!isAdmin && <span className="text-neutral-700 text-xs">Admin only</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-500 text-[13px] font-medium">Status</label>
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

              {/* Assignee + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-500 text-[13px] font-medium">Assignee</label>
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
                  {!isAdmin && <span className="text-neutral-700 text-xs">Admin only</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-500 text-[13px] font-medium">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className={isAdmin ? inputClass : disabledInputClass}
                    disabled={!isAdmin}
                  />
                  {!isAdmin && <span className="text-neutral-700 text-xs">Admin only</span>}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/[0.04] hover:bg-white/[0.07] border border-neutral-800 text-neutral-400 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}
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