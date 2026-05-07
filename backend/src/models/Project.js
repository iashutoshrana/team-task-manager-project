const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
})

module.exports = Project