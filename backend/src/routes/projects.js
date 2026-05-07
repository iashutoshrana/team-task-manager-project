const express = require('express')
const router = express.Router()
const { Project, User, Task } = require('../models/index')
const { auth, isAdmin } = require('../middleware/auth')

// get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: Task }
      ]
    })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        {
          model: Task,
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }]
        }
      ]
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// create project (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ message: 'Project name is required' })

    const project = await Project.create({
      name,
      description,
      owner_id: req.user.id
    })
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// update project (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    await project.update(req.body)
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// delete project (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    await project.destroy()
    res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router