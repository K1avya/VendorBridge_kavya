const Joi = require('joi');

const createVendorSchema = Joi.object({
  companyName: Joi.string().min(3).max(200).required(),
  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid GST number format (expected: 15 alphanumeric characters)',
    }),
  panNumber: Joi.string().optional(),
  contactPerson: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Phone number must be 10 digits',
  }),
  address: Joi.string().min(5).max(500).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  country: Joi.string().min(2).max(100).required(),
});

const updateVendorSchema = Joi.object({
  companyName: Joi.string().min(3).max(200).optional(),
  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid GST number format (expected: 15 alphanumeric characters)',
    }),
  panNumber: Joi.string().optional(),
  contactPerson: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Phone number must be 10 digits',
  }),
  address: Joi.string().min(5).max(500).optional(),
  city: Joi.string().min(2).max(100).optional(),
  state: Joi.string().min(2).max(100).optional(),
  country: Joi.string().min(2).max(100).optional(),
}).min(1);

module.exports = {
  createVendorSchema,
  updateVendorSchema,
};
