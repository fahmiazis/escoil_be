const joi = require('joi')
const response = require('../helpers/response')
const { classes, user, school } = require('../models')
const { pagination } = require('../helpers/pagination')
const moment = require('moment')
const { Op } = require('sequelize')

module.exports = {
  addClass: async (req, res) => {
    try {
      const level = req.user.level
      const kdUser = req.user.kduser
      const schema = joi.object({
        nm_class: joi.string().min(2).max(100).required(),
        stage: joi.number().required(),
        type: joi.number().required(),
        kd_school: joi.string().required(),
        date_from: joi.date().required(),
        date_to: joi.date().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level.split(',').find((item) => parseInt(item) === 1 || parseInt(item) === 100)) {
          const findClass = await classes.findOne({
            where: {
              [Op.and]: [
                { nm_class: results.nm_class },
                { kd_school: results.kd_school }
              ]
            }
          })
          if (findClass) {
            return response(res, 'user telah terdaftar', {}, 404, false)
          } else {
            const yearOne = moment(results.date_from).format('YYYY')
            const yearTwo = moment(results.date_to).format('YYYY')
            const resYear = yearTwo > yearOne ? `${yearOne}${yearTwo}` : `${yearTwo}${yearOne}`
          if (yearTwo > yearOne) {
            return response(res, 'pastikan input date_from dan date_to dengan benar', {}, 404, false)
          } else {
            const data = {
              ...results,
              history: `create class user at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
              kd_class: `${results.nm_class}-${results.kd_school}-${resYear}`,
              kd_user: kdUser,
              status: 1
            }
            const result = await classes.create(data)
            if (result) {
              return response(res, 'Add class user succesfully', { data })
            } else {
              return response(res, 'Fail to create class user', {}, 400, false)
            }
          }
          }
        } else {
          return response(res, 'You do not have access to create class users', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getClass: async (req, res) => {
    try {
      let { limit, page, search, sort } = req.query
      let searchValue = ''
      let sortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'createdAt'
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'all') {
        const findLimit = await classes.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await classes.findAndCountAll({
        where: {
          [Op.or]: [
            { nm_class: { [Op.like]: `%${searchValue}%` } },
            { kd_class: { [Op.like]: `%${searchValue}%` } },
            { kd_school: { [Op.like]: `%${searchValue}%` } },
            { kd_user: { [Op.like]: `%${searchValue}%` } },
            { stage: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [
          [sortValue, 'ASC']
        ],
        include: [
          {
            model: user,
            as: 'member'
          }
        ],
        limit: limit,
        offset: (page - 1) * limit,
        group: ['class.kd_class'],
        distinct: true
      })
      const pageInfo = pagination('/class/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list class', { result, pageInfo })
      } else {
        return response(res, 'failed to get class', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailClass: async (req, res) => {
    try {
      const id = req.params.id
      const result = await classes.findAll({
        where: {
          kd_class: id
        }
      })
      if (result) {
        return response(res, `success get data class ${id}`, { result })
      } else {
        return response(res, 'fail to get data class', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
