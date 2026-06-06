const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    timestamp: new Date().toISOString(),
    message,
    data,
  });
};

const sendError = (res, message, statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    timestamp: new Date().toISOString(),
    message,
    data,
  });
};

const sendPaginatedResponse = (res, items, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    timestamp: new Date().toISOString(),
    message,
    data: items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
};
