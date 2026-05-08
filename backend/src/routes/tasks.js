const express = require('express')
const router = express.Router()
const { Task, User, Project } = require('../models/index')
const { auth, isAdmin } = require('../middleware/auth')

// get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, attributes: ['id', 'name'] }
      ]
    })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { project_id: req.params.projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, due_date, project_id, assignee_id } = req.body

    if (!title || !project_id) {
      return res.status(400).json({ message: 'Title and project are required' })
    }

    const task = await Task.create({
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: due_date || null,
      project_id,
      assignee_id: assignee_id || null
    })

    res.status(201).json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const { title, description, status, priority, due_date, assignee_id } = req.body

    const updates = {
      title: title || task.title,
      description: description || null,
      status: status || task.status,
      priority: priority || task.priority,
      due_date: due_date ? due_date : null,
      assignee_id: assignee_id ? Number(assignee_id) : null
    }

    if (req.user.role === 'member') {
      await task.update({ status: status || task.status })
    } else {
      await task.update(updates)
    }

    res.json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// delete task (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    await task.destroy()
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router