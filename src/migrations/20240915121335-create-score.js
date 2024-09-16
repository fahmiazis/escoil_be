'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('scores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      score: {
        type: Sequelize.INTEGER
      },
      kd_student: {
        type: Sequelize.STRING
      },
      kd_teacher: {
        type: Sequelize.STRING
      },
      kd_class: {
        type: Sequelize.STRING
      },
      nm_exam: {
        type: Sequelize.STRING
      },
      subject: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('scores')
  }
}
