const { ForbiddenError } = require('../shared/utils/errors');

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

module.exports = authorize;
