const { sendSuccess, sendError } = require('../../shared/utils/response')
const service = require('../services/activity.service')

const getUserActivity = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    const result = await service.getUserActivity(userId, parseInt(page), parseInt(limit))

    sendSuccess(res, result.data, 'User activity retrieved', 200)
  } catch (err) {
    next(err)
  }
}

const getEntityActivity = async (req, res, next) => {
  try {
    const { entity, entityId } = req.params
    const { page = 1, limit = 20 } = req.query

    const result = await service.getEntityActivity(entity, entityId, parseInt(page), parseInt(limit))

    sendSuccess(res, result.data, 'Entity activity retrieved', 200)
  } catch (err) {
    next(err)
  }
}

const getAllActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const result = await service.getAllActivity(parseInt(page), parseInt(limit))

    sendSuccess(res, result.data, 'All activity retrieved', 200)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getUserActivity,
  getEntityActivity,
  getAllActivity,
}
