import Joi from 'joi';

// Validation schemas
const schemas = {
  // Authentication schemas
  walletAuth: Joi.object({
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    signature: Joi.string().required(),
    message: Joi.string().required()
  }),

  // Vault schemas
  createVault: Joi.object({
    checkInPeriod: Joi.number().integer().min(86400).max(31536000).required(), // 1 day to 1 year in seconds
    gracePeriod: Joi.number().integer().min(3600).max(2592000).required() // 1 hour to 30 days in seconds
  }),

  addBeneficiary: Joi.object({
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    sharePercentage: Joi.number().integer().min(100).max(10000).required(), // 1% to 100% in basis points
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    name: Joi.string().min(1).max(255).optional()
  }),

  updateBeneficiary: Joi.object({
    sharePercentage: Joi.number().integer().min(100).max(10000).required()
  }),

  // Claim schemas
  sendOTP: Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
  }),

  verifyOTP: Joi.object({
    otpCode: Joi.string().length(6).pattern(/^\d{6}$/).required()
  }),

  bankDetails: Joi.object({
    upiId: Joi.string().min(1).max(255).required(),
    bankAccountNumber: Joi.string().min(9).max(18).optional(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(),
    accountHolderName: Joi.string().min(1).max(255).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  }),

  // Check-in schema
  checkIn: Joi.object({
    // No body required for check-in
  })
};

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Specific validation middlewares
export const validateWalletAuth = validate(schemas.walletAuth);
export const validateCreateVault = validate(schemas.createVault);
export const validateAddBeneficiary = validate(schemas.addBeneficiary);
export const validateUpdateBeneficiary = validate(schemas.updateBeneficiary);
export const validateSendOTP = validate(schemas.sendOTP);
export const validateVerifyOTP = validate(schemas.verifyOTP);
export const validateBankDetails = validate(schemas.bankDetails);
export const validateCheckIn = validate(schemas.checkIn);

// UUID validation middleware
export const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuid || !uuidRegex.test(uuid)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// Claim token validation middleware
export const validateClaimToken = (req, res, next) => {
  const { token } = req.params;
  
  if (!token || token.length !== 32) {
    return res.status(400).json({
      success: false,
      message: 'Invalid claim token format'
    });
  }
  
  next();
};

// Pagination validation middleware
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pagination parameters'
    });
  }
  
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };
  
  next();
};

// Sanitize input middleware
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

export default {
  validateWalletAuth,
  validateCreateVault,
  validateAddBeneficiary,
  validateUpdateBeneficiary,
  validateSendOTP,
  validateVerifyOTP,
  validateBankDetails,
  validateCheckIn,
  validateUUID,
  validateClaimToken,
  validatePagination,
  sanitizeInput
};

