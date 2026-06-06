const { sendSuccess, sendError } = require('../../shared/utils/response')
const invoiceService = require('../services/invoice.service')

const createInvoice = async (req, res, next) => {
  try {
    const { poId } = req.params
    const { invoiceNumber, amount, dueDate } = req.body
    const vendorId = req.user.id

    const invoice = await invoiceService.createInvoice(
      poId,
      vendorId,
      invoiceNumber,
      amount,
      dueDate
    )

    sendSuccess(res, invoice, 'Invoice created successfully', 201)
  } catch (error) {
    next(error)
  }
}

const listInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = null } = req.query

    const result = await invoiceService.listInvoices(
      parseInt(page),
      parseInt(limit),
      status
    )

    sendSuccess(res, result, 'Invoices retrieved successfully', 200)
  } catch (error) {
    next(error)
  }
}

const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params

    const invoice = await invoiceService.getInvoiceById(id)

    sendSuccess(res, invoice, 'Invoice retrieved successfully', 200)
  } catch (error) {
    next(error)
  }
}

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user.id

    const invoice = await invoiceService.updateInvoiceStatus(id, status, userId)

    sendSuccess(res, invoice, 'Invoice status updated successfully', 200)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoiceStatus,
}
