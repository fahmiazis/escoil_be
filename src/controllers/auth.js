const joi = require('joi')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const response = require('../helpers/response')
const { user } = require('../models') // eslint-disable-line
const { Op } = require('sequelize') // eslint-disable-line

const { APP_KEY } = process.env

module.exports = {
  login: async (req, res) => {
    try {
      const schema = joi.object({
        username: joi.string().required(),
        password: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const result = await user.findOne({
          where: {
            [Op.or]: [
              { username: results.username },
              { nik: results.nik }
            ]
          }
        })
        if (result) {
          const { kd_role, username, fullname, email, nik, telp, kd_user } = result // eslint-disable-line
          bcrypt.compare(results.password, result.password, function (_err, result) {
            if (result) {
              jwt.sign({ level: kd_role, name: username, fullname: fullname, kduser: kd_role }, `${APP_KEY}`, (_err, token) => {
                return response(res, 'login success', { user: { username, fullname, email, nik, telp, role: kd_role, kd_user }, Token: `${token}` })
              })
            } else {
              return response(res, 'Wrong password', {}, 400, false)
            }
          })
        } else {
          return response(res, 'user is not registered', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
