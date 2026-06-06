const prisma = require('../../config/prisma')
const { NotFoundError, BadRequestError } = require('../../shared/utils/errors')
const { logActivity } = require('../../shared/services/activityLog.service')

const getApprovalById = async (approvalId) => {
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: {
      quotation: {
        include: {
          rfq: true,
          vendor: true,
        },
      },
      createdByUser: true,
      approvedByUser: true,
    },
  })

  if (!approval) {
    throw new NotFoundError('Approval not found')
  }

  return approval
}

const listPendingApprovals = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const [approvals, total] = await Promise.all([
    prisma.approval.findMany({
      where: { status: 'PENDING' },
      include: {
        quotation: {
          include: {
            rfq: true,
            vendor: true,
          },
        },
        createdByUser: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.approval.count({ where: { status: 'PENDING' } }),
  ])

  return {
    data: approvals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const approveQuotation = async (approvalId, approverId, remarks = null) => {
  const approval = await getApprovalById(approvalId)

  if (approval.status !== 'PENDING') {
    throw new BadRequestError('Approval is not in pending status')
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: 'APPROVED',
      approvedBy: approverId,
      remarks,
      approvedAt: new Date(),
    },
    include: {
      quotation: {
        include: {
          rfq: true,
          vendor: true,
        },
      },
      createdByUser: true,
      approvedByUser: true,
    },
  })

  // Update quotation status
  await prisma.quotation.update({
    where: { id: approval.quotationId },
    data: { status: 'SELECTED' },
  })

  // Log activity
  await logActivity(approverId, 'APPROVED', 'Approval', approvalId, {
    quotationId: approval.quotationId,
    remarks,
  })

  return updated
}

const rejectQuotation = async (approvalId, approverId, remarks = null) => {
  const approval = await getApprovalById(approvalId)

  if (approval.status !== 'PENDING') {
    throw new BadRequestError('Approval is not in pending status')
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: 'REJECTED',
      approvedBy: approverId,
      remarks,
      approvedAt: new Date(),
    },
    include: {
      quotation: {
        include: {
          rfq: true,
          vendor: true,
        },
      },
      createdByUser: true,
      approvedByUser: true,
    },
  })

  // Update quotation status
  await prisma.quotation.update({
    where: { id: approval.quotationId },
    data: { status: 'REJECTED' },
  })

  // Log activity
  await logActivity(approverId, 'REJECTED', 'Approval', approvalId, {
    quotationId: approval.quotationId,
    remarks,
  })

  return updated
}

module.exports = {
  getApprovalById,
  listPendingApprovals,
  approveQuotation,
  rejectQuotation,
}
