const sequelize = require('../config/db')
const User = require('./User')
const Project = require('./Project')
const Task = require('./Task')

// user owns projects
User.hasMany(Project, { foreignKey: 'owner_id' })
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' })

// project has many tasks
Project.hasMany(Task, { foreignKey: 'project_id', onDelete: 'CASCADE' })
Task.belongsTo(Project, { foreignKey: 'project_id' })

// user assigned to tasks
User.hasMany(Task, { foreignKey: 'assignee_id' })
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' })

const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true })
    console.log('Database synced successfully')
  } catch (err) {
    console.error('Database sync failed:', err)
  }
}

syncDB()

module.exports = { sequelize, User, Project, Task }