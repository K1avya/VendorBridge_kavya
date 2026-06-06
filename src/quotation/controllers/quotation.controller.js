const { sendSuccess, sendError } = require('../../shared/utils/response')
const service = require('../services/quotation.service')

const createQuotation = async (req, res, next) => {
  try {
    const { rfqId, basePrice, tax, discount, finalAmount, deliveryDays, remarks } = req.body
    const vendorId = req.user.id

    const quotation = await service.createQuotation(
      rfqId,
      vendorId,
      basePrice,
      tax,
      discount,
      finalAmount,
      deliveryDays,
      remarks
    )

    sendSuccess(res, quotation, 'Quotation submitted successfully', 201)
  } catch (err) {
    next(err)
  }
}

const updateQuotation = async (req, res, next) => {
  try {
    const { quotationId } = req.params
    const vendorId = req.user.id

    const updated = await service.updateQuotation(quotationId, vendorId, req.body)

    sendSuccess(res, updated, 'Quotation updated successfully')
  } catch (err) {
    next(err)
  }
}

const listVendorQuotations = async (req, res, next) => {
  try {
    const vendorId = req.user.id
    const { page = 1, limit = 10 } = req.query

    const result = await service.listVendorQuotations(
      vendorId,
      parseInt(page),
      parseInt(limit)
    )

    sendSuccess(res, result.data, 'Quotations retrieved', 200, result.pagination)
  } catch (err) {
    next(err)
  }
}

const listAllQuotations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const result = await service.listAllQuotations(
      parseInt(page),
      parseInt(limit)
    )

    sendSuccess(res, result.data, 'All quotations retrieved', 200, result.pagination)
  } catch (err) {
    next(err)
  }
}

const listRFQQuotations = async (req, res, next) => {
  try {
    const { rfqId } = req.params
    const { page = 1, limit = 10 } = req.query

    const result = await service.listRFQQuotations(
      rfqId,
      parseInt(page),
      parseInt(limit)
    )

    sendSuccess(res, result.data, 'Quotations retrieved', 200, result.pagination)
  } catch (err) {
    next(err)
  }
}

const selectQuotation = async (req, res, next) => {
  try {
    const { quotationId } = req.params
    const officerId = req.user.id

    const selected = await service.selectQuotation(quotationId, officerId)

    sendSuccess(res, selected, 'Quotation selected successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createQuotation,
  updateQuotation,
  listVendorQuotations,
  listAllQuotations,
  listRFQQuotations,
  selectQuotation,
}
