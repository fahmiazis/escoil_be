'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class score extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  score.init({
    score: DataTypes.INTEGER,
    kd_student: DataTypes.STRING,
    kd_teacher: DataTypes.STRING,
    kd_class: DataTypes.STRING,
    nm_exam: DataTypes.STRING,
    subject: DataTypes.STRING,
    status: DataTypes.INTEGER,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'score'
  })
  return score
}
