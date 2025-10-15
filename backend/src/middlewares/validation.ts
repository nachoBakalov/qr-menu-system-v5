/**
 * Validation Middleware
 * Middleware за валидация на данни използвайки Joi схеми
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Създава middleware за валидация
 */
export const validate = (
  schema: Joi.ObjectSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[target];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Показва всички грешки, не само pierwszą
      stripUnknown: true, // Премахва непознати полета
      convert: true // Конвертира типовете (напр. string към number)
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(createError(
        `Валидационна грешка: ${errorMessages.map(e => e.message).join(', ')}`,
        400
      ));
    }

    // Заменяме оригиналните данни с валидираните
    req[target] = value;
    next();
  };
};

/**
 * Комбиниран validator за множество цели
 */
export const validateMultiple = (validators: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Валидираме всяка цел ако има схема за нея
    Object.entries(validators).forEach(([target, schema]) => {
      if (schema) {
        const { error, value } = schema.validate(req[target as ValidationTarget], {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });

        if (error) {
          const targetErrors = error.details.map(detail => 
            `${target}.${detail.path.join('.')}: ${detail.message}`
          );
          errors.push(...targetErrors);
        } else {
          // Заменяме с валидираните данни
          (req as any)[target] = value;
        }
      }
    });

    if (errors.length > 0) {
      return next(createError(
        `Валидационни грешки: ${errors.join(', ')}`,
        400
      ));
    }

    next();
  };
};