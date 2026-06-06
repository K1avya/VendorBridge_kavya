const vendorService = require('../services/vendor.service');
const { sendSuccess, sendPaginatedResponse } = require('../../shared/utils/response');

const createVendor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vendorData = req.validatedBody;

    const vendor = await vendorService.createVendor(userId, vendorData);

    sendSuccess(
      res,
      vendor,
      'Vendor profile created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const vendor = await vendorService.getVendorProfile(userId);

    sendSuccess(
      res,
      vendor,
      'Vendor profile retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { vendorId } = req.params;
    const updateData = req.validatedBody;

    const vendor = await vendorService.updateVendor(vendorId, userId, updateData);

    sendSuccess(
      res,
      vendor,
      'Vendor profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

const listApprovedVendors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const result = await vendorService.listVendors(page, limit, status);

    sendPaginatedResponse(
      res,
      result.items,
      result.total,
      page,
      limit,
      'Vendors retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

const updateVendorStatus = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    const vendor = await vendorService.updateVendorStatus(vendorId, status);

    sendSuccess(
      res,
      vendor,
      'Vendor status updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVendor,
  getProfile,
  updateProfile,
  listApprovedVendors,
  updateVendorStatus,
};
