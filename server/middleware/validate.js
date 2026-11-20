import { validationResult } from 'express-validator';
import { ApiError } from '../utils/helpers.js';

/** Turns express-validator results into a single 400 response. */
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((item) => ({
    field: item.path,
    message: item.msg,
  }));

  return next(new ApiError(400, details[0]?.message || 'Data belum valid.', details));
}

export const objectIdPattern = /^[a-f\d]{24}$/i;
