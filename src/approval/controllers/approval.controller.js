const { sendSuccess, sendError } = require('../../shared/utils/response')
const service = require('../services/approval.service')

const getPendingApprovals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const result = await service.listPendingApprovals(parseInt(page), parseInt(limit))

    sendSuccess(res, result.data, 'Pending approvals retrieved', 200)
  } catch (err) {
    next(err)
  }
}

const getApprovalDetails = async (req, res, next) => {
  try {
    const { approvalId } = req.params

    const approval = await service.getApprovalById(approvalId)

    sendSuccess(res, approval, 'Approval details retrieved')
  } catch (err) {
    next(err)
  }
}

const approveQuotation = async (req, res, next) => {
  try {
    const { approvalId } = req.params
    const { remarks } = req.body
    const approverId = req.user.id

    const approved = await service.approveQuotation(approvalId, approverId, remarks)

    sendSuccess(res, approved, 'Quotation approved successfully')
  } catch (err) {
    next(err)
  }
}

const rejectQuotation = async (req, res, next) => {
  try {
    const { approvalId } = req.params
    const { remarks } = req.body
    const approverId = req.user.id

    const rejected = await service.rejectQuotation(approvalId, approverId, remarks)

    sendSuccess(res, rejected, 'Quotation rejected successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getPendingApprovals,
  getApprovalDetails,
  approveQuotation,
  rejectQuotation,
}
