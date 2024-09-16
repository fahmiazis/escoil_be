'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      fullname: {
        type: Sequelize.STRING
      },
      nik: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      telp: {
        type: Sequelize.STRING
      },
      img: {
        type: Sequelize.STRING
      },
      kd_user: {
        type: Sequelize.STRING
      },
      kd_role: {
        type: Sequelize.TEXT
      },
      password: {
        type: Sequelize.STRING
      },
      history: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('users')
  }
}
