'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schools', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nm_school: {
        type: Sequelize.STRING
      },
      kd_school: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      kd_akreditas: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      history: {
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('schools');
  }
};