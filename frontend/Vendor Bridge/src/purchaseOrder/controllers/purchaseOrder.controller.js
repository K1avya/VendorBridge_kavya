const { sendSuccess, sendError } = require('../../shared/utils/response')
const service = require('../services/purchaseOrder.service')

const createPurchaseOrder = async (req, res, next) => {
  try {
    const { quotationId } = req.body
    const createdBy = req.user.id

    const po = await service.createPurchaseOrder(quotationId, createdBy)

    sendSuccess(res, po, 'Purchase Order created successfully', 201)
  } catch (err) {
    next(err)
  }
}

const getPurchaseOrderDetails = async (req, res, next) => {
  try {
    const { poId } = req.params

    const po = await service.getPurchaseOrderById(poId)

    sendSuccess(res, po, 'Purchase Order details retrieved')
  } catch (err) {
    next(err)
  }
}

const listPurchaseOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const result = await service.listPurchaseOrders(parseInt(page), parseInt(limit))

    sendSuccess(res, result.data, 'Purchase Orders retrieved', 200)
  } catch (err) {
    next(err)
  }
}

const updatePOStatus = async (req, res, next) => {
  try {
    const { poId } = req.params
    const { status } = req.body

    const updated = await service.updatePOStatus(poId, status)

    sendSuccess(res, updated, 'Purchase Order status updated')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createPurchaseOrder,
  getPurchaseOrderDetails,
  listPurchaseOrders,
  updatePOStatus,
}
