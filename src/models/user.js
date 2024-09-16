'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  user.init({
    username: DataTypes.STRING,
    fullname: DataTypes.STRING,
    nik: DataTypes.STRING,
    email: DataTypes.STRING,
    telp: DataTypes.STRING,
    img: DataTypes.STRING,
    kd_user: DataTypes.STRING,
    kd_role: DataTypes.TEXT,
    password: DataTypes.STRING,
    history: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user'
  })
  return user
}
