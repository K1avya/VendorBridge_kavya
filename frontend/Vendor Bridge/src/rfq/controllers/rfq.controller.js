const { sendSuccess, sendPaginatedResponse } = require('../../shared/utils/response');
const service = require('../services/rfq.service');

const createRFQ = async (req, res, next) => {
  try {
    const { title, description, category, lineItems, expectedDeliveryDate, deadline, attachments } = req.body;
    const createdBy = req.user.id;

    const rfq = await service.createRFQ(createdBy, title, description, category, lineItems, expectedDeliveryDate, deadline, attachments);

    sendSuccess(res, rfq, 'RFQ created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const listRFQs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, createdBy } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (req.user.role === 'PROCUREMENT_OFFICER' && !createdBy) {
      filters.createdBy = req.user.id;
    }

    const result = await service.listRFQs(parseInt(page), parseInt(limit), filters);

    sendPaginatedResponse(res, result.data, result.total, page, limit, 'RFQs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getRFQDetails = async (req, res, next) => {
  try {
    const { rfqId } = req.params;

    const rfq = await service.getRFQDetails(rfqId);

    sendSuccess(res, rfq, 'RFQ details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateRFQ = async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    const createdBy = req.user.id;

    const updated = await service.updateRFQ(rfqId, createdBy, req.body);

    sendSuccess(res, updated, 'RFQ updated successfully');
  } catch (err) {
    next(err);
  }
};

const publishRFQ = async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    const createdBy = req.user.id;

    const published = await service.publishRFQ(rfqId, createdBy);

    sendSuccess(res, published, 'RFQ published successfully');
  } catch (err) {
    next(err);
  }
};

const assignVendorsToRFQ = async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    const { vendorIds } = req.body;
    const createdBy = req.user.id;

    const updated = await service.assignVendorsToRFQ(rfqId, createdBy, vendorIds);

    sendSuccess(res, updated, 'Vendors assigned successfully');
  } catch (err) {
    next(err);
  }
};

const getVendorAssignedRFQs = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await service.getVendorAssignedRFQs(vendorId, parseInt(page), parseInt(limit));

    sendPaginatedResponse(res, result.data, result.total, page, limit, 'Assigned RFQs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRFQ,
  listRFQs,
  getRFQDetails,
  updateRFQ,
  publishRFQ,
  assignVendorsToRFQ,
  getVendorAssignedRFQs,
};
