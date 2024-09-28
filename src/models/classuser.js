'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class classuser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      classuser.hasMany(models.user, {
        foreignKey: 'kd_user',
        as: 'member',
        sourceKey: 'kd_user'
      })
    }
  }
  classuser.init({
    kd_class: DataTypes.STRING,
    kd_user: DataTypes.STRING,
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'classuser',
  });
  return classuser;
};