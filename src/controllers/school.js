const joi = require('joi')
const response = require('../helpers/response')
const { classes, school } = require('../models')
const { pagination } = require('../helpers/pagination')
const moment = require('moment')
const { Op } = require('sequelize')

module.exports = {
  addSchool: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        nm_school: joi.string().min(5).max(100).required(),
        kd_school: joi.string().required(),
        address: joi.string().required(),
        kd_akreditas: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1 || level === 100) {
          const findSchool = await school.findOne({
            where: {
              [Op.and]: [
                { nm_school: results.nm_school },
                { kd_school: results.kd_school }
              ]
            }
          })
          if (findSchool) {
            return response(res, 'school telah terdaftar', {}, 404, false)
          } else {
            const data = {
              ...results,
              history: `create school at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
              status: 1
            }
            const result = await school.create(data)
            if (result) {
              return response(res, 'Add school succesfully', { data })
            } else {
              return response(res, 'Fail to create user', {}, 400, false)
            }
          }
        } else {
          return response(res, 'You do not have access to create users', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getSchool: async (req, res) => {
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
        sortValue = sort || 'kd_class'
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'all') {
        const findLimit = await school.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await school.findAndCountAll({
        where: {
          [Op.or]: [
            { nm_school: { [Op.like]: `%${searchValue}%` } },
            { kd_school: { [Op.like]: `%${searchValue}%` } },
            { status: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [
          [sortValue, 'ASC']
        ],
        include: [
          {
            model: classes,
            as: 'class'
          }
        ],
        limit: limit,
        offset: (page - 1) * limit,
        group: ['class.kd_class'],
        distinct: true
      })
      const pageInfo = pagination('/school/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list school', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailSchool: async (req, res) => {
    try {
      const id = req.params.id
      const result = await school.findAll({
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
