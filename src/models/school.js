'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class school extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      school.hasMany(models.classes, {
        foreignKey: 'kd_school',
        as: 'class',
        sourceKey: 'kd_school'
      })
    }
  }
  school.init({
    nm_school: DataTypes.STRING,
    kd_school: DataTypes.STRING,
    address: DataTypes.STRING,
    kd_akreditas: DataTypes.STRING,
    status: DataTypes.INTEGER,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'school'
  })
  return school
}
