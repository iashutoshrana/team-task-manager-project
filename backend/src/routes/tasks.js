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
      description,
      status,
      priority,
      due_date,
      project_id,
      assignee_id
    })
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    // members can only update status
    if (req.user.role === 'member') {
      await task.update({ status: req.body.status })
    } else {
      await task.update(req.body)
    }

    res.json(task)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
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