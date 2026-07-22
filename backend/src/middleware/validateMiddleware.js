import Joi from "joi";
import { AppError } from "../utils/appError.js";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return next(new AppError(errorMessage, 400));
  }
  next();
};

export const registerSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().required(),
});

export const assetSchema = Joi.object({
  symbol: Joi.string().trim().uppercase().required(),
  name: Joi.string().trim().required(),
  qty: Joi.number().min(0).required(),
  avgBuy: Joi.number().min(0).required(),
  price: Joi.number().min(0).required(),
  trend: Joi.array().items(Joi.number()).optional(),
  img: Joi.string().allow("").optional(),
  category: Joi.string().valid("stock", "crypto", "commodity", "property").optional(),
  isWatchlist: Joi.boolean().optional(),
});

export const assetUpdateSchema = Joi.object({
  symbol: Joi.string().trim().uppercase().optional(),
  name: Joi.string().trim().optional(),
  qty: Joi.number().min(0).optional(),
  avgBuy: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  trend: Joi.array().items(Joi.number()).optional(),
  img: Joi.string().allow("").optional(),
  category: Joi.string().valid("stock", "crypto", "commodity", "property").optional(),
  isWatchlist: Joi.boolean().optional(),
});
