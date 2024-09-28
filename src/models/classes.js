'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class classes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      classes.hasMany(models.classuser, {
        foreignKey: 'kd_class',
        as: 'member',
        sourceKey: 'kd_class'
      })
    }
  }
  classes.init({
    nm_class: DataTypes.STRING,
    stage: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    kd_class: DataTypes.STRING,
    kd_school: DataTypes.STRING,
    sch_year: DataTypes.STRING,
    status: DataTypes.INTEGER,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'classes'
  })
  return classes
}
