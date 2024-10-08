const joi = require('joi')
const response = require('../helpers/response')
const { user, role } = require('../models')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const uploadHelper = require('../helpers/upload')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const moment = require('moment')
const { APP_URL } = process.env
const borderStyles = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

module.exports = {
  addUser: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        username: joi.string().min(3).max(100).required(),
        fullname: joi.string().min(3).max(100).required(),
        nik: joi.string().min(15).max(15).required(),
        telp: joi.number().allow(''),
        email: joi.string().email(),
        kd_role: joi.number().required(),
        password: joi.string().min(8).required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level.split(',').find((item) => parseInt(item) === 1 || parseInt(item) === 100)) {
          const findUser = await user.findOne({
            where: {
              [Op.or]: [
                { username: results.username },
                { nik: results.nik }
              ]
            }
          })
          if (findUser) {
            return response(res, `${findUser.username === results.username ? 'username' : 'nik'} already use`, {}, 404, false)
          } else {
            const kdUser = await bcrypt.hash(results.nik, await bcrypt.genSalt())
            results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
            const data = {
              ...results,
              history: `create user at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
              kd_user: kdUser
            }
            const result = await user.create(data)
            if (result) {
              return response(res, 'Add User succesfully', { data })
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
  updateUser: async (req, res) => {
    try {
      const schema = joi.object({
        username: joi.string().min(3).max(100).required(),
        fullname: joi.string().min(3).max(100).required(),
        nik: joi.string().min(15).max(15).required(),
        telp: joi.number().allow(''),
        email: joi.string().email(),
        kd_role: joi.number().required(),
        kd_user: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const findData = await user.findOne({
          where: {
            kd_user: results.kd_user
          }
        })
        if (findData) {
          const findUser = await user.findOne({
            where: {
              [Op.or]: [
                { username: results.username },
                { nik: results.nik }
              ],
              [Op.not]: { kd_user: results.kd_user }
            }
          })
          if (findUser) {
            return response(res, `${findUser.username === results.username ? 'username' : 'nik'} already use`, {}, 404, false)
          } else {
            const data = {
              ...results,
              history: `; update user at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const result = await findData.update(data)
            if (result) {
              return response(res, 'update user succesfully', { result })
            } else {
              return response(res, 'Fail to update user', {}, 400, false)
            }
          }
        } else {
          return response(res, 'user not found', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadImage: async (req, res) => {
    const id = req.body.kd_user
    uploadHelper(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            // console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `uploads/${req.file.filename}`
        const send = {
          img: dokumen
        }
        const make = await user.findOne({
          where: {
            kd_user: id
          }
        })
        if (make) {
          await make.update(send)
          return response(res, 'success upload image')
        } else {
          return response(res, 'success upload image')
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  deleteUser: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.body.kd_user
      if (level.split(',').find((item) => parseInt(item) === 1 || parseInt(item) === 100)) {
        const result = await user.findOne({
          where: {
            kd_user: id,
            [Op.not]: { status: 0 }
          }
        })
        if (result) {
          const data = {
            status: 0,
            history: `delete user at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
          }
          await result.update(data)
          return response(res, 'delete user success', { result })
        } else {
          return response(res, 'user not found', {}, 404, false)
        }
      } else {
        return response(res, "You're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getUser: async (req, res) => {
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
        const findLimit = await user.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await user.findAndCountAll({
        where: {
          [Op.or]: [
            { fullname: { [Op.like]: `%${searchValue}%` } },
            { email: { [Op.like]: `%${searchValue}%` } },
            { telp: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/user/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list user', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailUser: async (req, res) => {
    try {
      const id = req.body.kd_user
      const result = await user.findOne({
        where: {
          kd_user: id
        }
      })
      if (result) {
        return response(res, `Profile of user with id ${id}`, { result })
      } else {
        return response(res, 'fail to get user', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterUser: async (req, res) => {
    const level = req.user.level
    if (level.split(',').find((item) => parseInt(item) === 1 || parseInt(item) === 100)) {
      uploadMaster(req, res, async function (err) {
        try {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
              console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
              return response(res, 'fieldname doesnt match', {}, 500, false)
            }
            return response(res, err.message, {}, 500, false)
          } else if (err) {
            return response(res, err.message, {}, 401, false)
          }
          const dokumen = `assets/masters/${req.files[0].filename}`
          const rows = await readXlsxFile(dokumen)
          const count = []
          const cek = ['NAME', 'NIK', 'EMAIL', 'NO.TELP', 'ROLE', 'PASSWORD']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            const plant = []
            const userName = []
            const cek = []
            const cekNik = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              userName.push(`NIK ${a[1]} `)
              cek.push(`${a[1]}`)
              if (a[1].toString().length < 15 && parseInt(a[4].split('-')[0]) !== 1) {
                cekNik.push(`NIK '${a[1]}' pada baris ${i} tidak valid`)
              }
            }
            const object = {}
            const result = []
            const obj = {}

            userName.forEach(item => {
              if (!obj[item]) { obj[item] = 0 }
              obj[item] += 1
            })

            for (const prop in obj) {
              if (obj[prop] >= 2) {
                result.push(prop)
              }
            }

            plant.forEach(item => {
              if (!object[item]) { object[item] = 0 }
              object[item] += 1
            })

            for (const prop in object) {
              if (object[prop] >= 2) {
                result.push(prop)
              }
            }
            if (result.length > 0) {
              fs.unlink(dokumen, function (err) {
                return response(res, 'there is duplication in your file master', { result }, 404, false)
              })
            } else if (cekNik.length > 0) {
              fs.unlink(dokumen, function (err) {
                return response(res, 'Terdapat kesalahan pengisian', { result: cekNik }, 404, false)
              })
            } else {
              rows.shift()
              const create = []
              for (let i = 0; i < rows.length; i++) {
                const noun = []
                const process = rows[i]
                for (let j = 0; j < process.length + 1; j++) {
                  if (j === 5) {
                    let str = process[j]
                    str = await bcrypt.hash(str, await bcrypt.genSalt())
                    noun.push(str)
                  } else if (j === 6) {
                    let str = process[1].toString()
                    str = await bcrypt.hash(str, await bcrypt.genSalt())
                    noun.push(str)
                  } else {
                    noun.push(process[j])
                  }
                }
                create.push(noun)
              }
              if (create.length > 0) {
                const arr = []
                for (let i = 0; i < create.length; i++) {
                  const dataUser = create[i]
                  const data = {
                    username: dataUser[1],
                    fullname: dataUser[0],
                    nik: dataUser[1],
                    email: dataUser[2],
                    telp: dataUser[3],
                    kd_role: dataUser[4].split('-')[0],
                    kd_user: dataUser[6],
                    password: dataUser[5],
                    history: `create user at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  const findUser = await user.findOne({
                    where: {
                      [Op.or]: [
                        { username: dataUser[1] },
                        { nik: dataUser[1] }
                      ]
                    }
                  })
                  if (findUser) {
                    arr.push(findUser)
                  } else {
                    const createUser = await user.create(data)
                    if (createUser) {
                      arr.push(createUser)
                    }
                  }
                }
                if (arr.length) {
                  fs.unlink(dokumen, function (err) {
                    if (err) {
                      return response(res, 'successfully upload file master user', { err })
                    } else {
                      return response(res, 'successfully upload file master user', { result: arr })
                    }
                  })
                } else {
                  fs.unlink(dokumen, function (err) {
                    if (err) {
                      return response(res, 'failed to upload file', { err }, 404, false)
                    } else {
                      return response(res, 'failed to upload file', {}, 404, false)
                    }
                  })
                }
              } else {
                return response(res, 'failed to upload file', {}, 404, false)
              }
            }
          } else {
            fs.unlink(dokumen, function (err) {
              if (err) {
                return response(res, 'Failed to upload master file, please use the template provided', { err }, 400, false)
              } else {
                return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
              }
            })
          }
        } catch (error) {
          return response(res, error.message, {}, 500, false)
        }
      })
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  exportSqlUser: async (req, res) => {
    try {
      const result = await user.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['NAME', 'NIK', 'EMAIL', 'NO.TELP', 'ROLE', 'PASSWORD']
        const key = ['fullname', 'nik', 'email', 'telp', 'kd_role', '']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        worksheet.addRows(result)
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
          row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
            cell.border = borderStyles
          })
        })

        worksheet.columns.forEach(column => {
          const lengths = column.values.map(v => v.toString().length)
          const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'))
          column.width = maxLength + 5
        })
        const cek = [1]
        if (cek.length > 0) {
          const name = new Date().getTime().toString().concat('-user').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            }
            console.log('success delete file')
          })
          return response(res, 'success', { link: `${APP_URL}/download/${name}` })
        } else {
          return response(res, 'failed create file', {}, 404, false)
        }
      } else {
        return response(res, 'failed', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  changePassword: async (req, res) => {
    try {
      const id = req.user.id
      const schema = joi.object({
        current: joi.string().required(),
        new: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const send = await bcrypt.hash(results.new, await bcrypt.genSalt())
        const findUser = await user.findOne({
          where: {
            kd_user: id
          }
        })
        if (findUser) {
          bcrypt.compare(results.current, findUser.password, function (_err, result) {
            if (result) {
              const data = {
                password: send
              }
              const updatePass = findUser.update(data)
              if (updatePass) {
                return response(res, 'success change password')
              } else {
                return response(res, 'success change password2')
              }
            } else {
              return response(res, 'failed change password', {}, 400, false)
            }
          })
        } else {
          return response(res, 'failed change password', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  resetPassword: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        new: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const send = await bcrypt.hash(results.new, await bcrypt.genSalt())
        const findUser = await user.findByPk(id)
        if (findUser) {
          const data = {
            password: send
          }
          const updatePass = findUser.update(data)
          if (updatePass) {
            return response(res, 'success reset password')
          } else {
            return response(res, 'success reset password2')
          }
        } else {
          return response(res, 'failed reset password', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  createRole: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        kd_role: joi.string().required(),
        nm_role: joi.string().required(),
        type: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level.split(',').find((item) => parseInt(item) === 1 || parseInt(item) === 100)) {
          const result = await role.findAll({
            where: {
              [Op.or]: [
                { nm_role: results.nm_role },
                { kd_role: results.kd_role }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'role or kd_role already exist', {}, 404, false)
          } else {
            const result = await role.create(results)
            if (result) {
              return response(res, 'Add Role succesfully', { result })
            } else {
              return response(res, 'Fail to create role', {}, 400, false)
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getRole: async (req, res) => {
    try {
      const result = await role.findAll()
      if (result) {
        return response(res, 'succes get role', { result })
      } else {
        return response(res, 'failed get role', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailRole: async (req, res) => {
    try {
      const id = req.params.id
      const result = await role.findByPk(id)
      if (result) {
        return response(res, `Role of with id ${id}`, { result })
      } else {
        return response(res, 'fail to get role', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateRole: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        kd_role: joi.string().required(),
        nm_role: joi.string().required(),
        type: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level.split(',').find((item) => parseInt(item) === 1 || parseInt(item) === 100)) {
          const result = await role.findAll({
            where: {
              [Op.or]: [
                { nm_role: results.nm_role },
                { kd_role: results.kd_role }
              ],
              [Op.not]: { id: id }
            }
          })
          if (result.length > 0) {
            return response(res, 'role or level already exist', {}, 404, false)
          } else {
            const findRole = await role.findByPk(id)
            const findRoleUp = await role.findByPk(id)
            if (findRole) {
              const result = await findRoleUp.update(results)
              if (result) {
                return response(res, 'update role succesfully', { result })
              } else {
                return response(res, 'Fail to update role', {}, 400, false)
              }
            } else {
              return response(res, 'Fail to update role', {}, 400, false)
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
