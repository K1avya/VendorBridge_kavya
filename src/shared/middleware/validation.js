const { BadRequestError } = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      throw new BadRequestError(messages.join(', '));
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = validate;
