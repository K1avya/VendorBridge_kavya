const prisma = require('../../config/prisma')
const { NotFoundError } = require('../../shared/utils/errors')

const logActivity = async (userId, action, entity, entityId, changes = null, description = null, ipAddress = null) => {
  const log = await prisma.activityLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      changes: changes ? JSON.stringify(changes) : null,
      description,
      ipAddress,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  })

  return log
}

const getUserActivity = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activityLog.count({ where: { userId } }),
  ])

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getEntityActivity = async (entity, entityId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { entity, entityId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activityLog.count({ where: { entity, entityId } }),
  ])

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getAllActivity = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activityLog.count(),
  ])

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

module.exports = {
  logActivity,
  getUserActivity,
  getEntityActivity,
  getAllActivity,
}
