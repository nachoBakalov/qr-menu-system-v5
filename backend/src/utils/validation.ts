/**
 * Validation Schemas
 * Валидационни схеми за всички endpoints използвайки Joi
 */

import Joi from 'joi';

// Базови валидационни правила
const idSchema = Joi.number().integer().positive().required();
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

// Auth валидации
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Невалиден email формат',
      'any.required': 'Email е задължителен'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Паролата трябва да бъде поне 6 символа',
      'any.required': 'Паролата е задължителна'
    })
});

// Client валидации
export const createClientSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Името трябва да бъде поне 2 символа',
      'string.max': 'Името не може да бъде повече от 100 символа',
      'any.required': 'Името е задължително'
    }),
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.min': 'Slug-ът трябва да бъде поне 2 символа',
      'string.max': 'Slug-ът не може да бъде повече от 50 символа',
      'string.pattern.base': 'Slug-ът може да съдържа само малки букви, цифри и тирета',
      'any.required': 'Slug-ът е задължителен'
    }),
  description: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Описанието не може да бъде повече от 500 символа'
    }),
  address: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Адресът не може да бъде повече от 200 символа'
    }),
  phone: Joi.string()
    .pattern(/^\+?[0-9\s\-\(\)]{8,20}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'Невалиден телефонен номер'
    }),
  logo: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Невалиден URL за лого'
    }),
  slogan: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Слоганът не може да бъде повече от 100 символа'
    }),
  socialMedia: Joi.object({
    facebook: Joi.string().uri().allow(''),
    instagram: Joi.string().uri().allow(''),
    website: Joi.string().uri().allow('')
  }).messages({
    'string.uri': 'Невалиден URL'
  })
});

export const updateClientSchema = createClientSchema.fork(
  ['name', 'slug'], 
  (schema) => schema.optional()
).keys({
  active: Joi.boolean()
});

export const clientParamsSchema = Joi.object({
  id: idSchema
});

export const clientSlugParamsSchema = Joi.object({
  slug: Joi.string().min(2).max(50).required()
});

// Menu валидации
export const createMenuSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Името на менюто трябва да бъде поне 2 символа',
      'string.max': 'Името на менюто не може да бъде повече от 100 символа',
      'any.required': 'Името на менюто е задължително'
    }),
  clientId: idSchema,
  templateId: idSchema
});

export const updateMenuSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  templateId: idSchema,
  active: Joi.boolean(),
  published: Joi.boolean()
});

// Category валидации
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Името на категорията трябва да бъде поне 2 символа',
      'string.max': 'Името на категорията не може да бъде повече от 50 символа',
      'any.required': 'Името на категорията е задължително'
    }),
  description: Joi.string().max(200).allow(''),
  image: Joi.string().uri().allow(''),
  order: Joi.number().integer().min(0).default(0),
  menuId: idSchema
});

export const updateCategorySchema = createCategorySchema.fork(
  ['name', 'menuId'],
  (schema) => schema.optional()
).keys({
  active: Joi.boolean()
});

// MenuItem валидации
export const createMenuItemSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Името на продукта трябва да бъде поне 2 символа',
      'string.max': 'Navnet на продукта не може да бъде повече от 100 символа',
      'any.required': 'Името на продукта е задължително'
    }),
  description: Joi.string().max(300).allow(''),
  categoryId: idSchema,
  menuId: idSchema,
  priceBGN: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Цената в лева трябва да бъде положително число',
      'any.required': 'Цената в лева е задължителна'
    }),
  priceEUR: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Цената в евро трябва да бъде положително число',
      'any.required': 'Цената в евро е задължителна'
    }),
  weight: Joi.number().positive().allow(null),
  weightUnit: Joi.string().valid('g', 'ml').when('weight', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  image: Joi.string().uri().allow(''),
  tags: Joi.array().items(Joi.string().max(20)).default([]),
  allergens: Joi.array().items(Joi.string().max(20)).default([]),
  addons: Joi.array().items(
    Joi.object({
      name: Joi.string().min(2).max(50).required(),
      price: Joi.number().positive().precision(2).required()
    })
  ).default([]),
  order: Joi.number().integer().min(0).default(0)
});

export const updateMenuItemSchema = createMenuItemSchema.fork(
  ['name', 'categoryId', 'menuId', 'priceBGN', 'priceEUR'],
  (schema) => schema.optional()
).keys({
  available: Joi.boolean()
});

// Общи схеми
export const paramsSchema = Joi.object({
  id: idSchema
});

export const menuParamsSchema = Joi.object({
  id: idSchema
});

export const categoryReorderSchema = Joi.object({
  newOrder: Joi.number().integer().min(1).required().messages({
    'number.base': 'Новата позиция трябва да бъде число',
    'number.integer': 'Новата позиция трябва да бъде цяло число',
    'number.min': 'Новата позиция трябва да бъде поне 1',
    'any.required': 'Новата позиция е задължителна'
  })
});

export const menuIdParamsSchema = Joi.object({
  menuId: idSchema
});

export const menuItemAvailabilitySchema = Joi.object({
  available: Joi.boolean().required().messages({
    'boolean.base': 'Наличността трябва да бъде true или false',
    'any.required': 'Наличността е задължителна'
  })
});

export const menuItemReorderSchema = Joi.object({
  newOrder: Joi.number().integer().min(1).required().messages({
    'number.base': 'Новата позиция трябва да бъде число',
    'number.integer': 'Новата позиция трябва да бъде цяло число',
    'number.min': 'Новата позиция трябва да бъде поне 1',
    'any.required': 'Новата позиция е задължителна'
  })
});

export const categoryIdParamsSchema = Joi.object({
  categoryId: idSchema
});

export const slugParamsSchema = Joi.object({
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.min': 'Slug трябва да бъде поне 2 символа',
      'string.max': 'Slug не може да бъде повече от 50 символа',
      'string.pattern.base': 'Slug може да съдържа само малки букви, цифри и тирета',
      'any.required': 'Slug е задължителен'
    }),
  clientSlug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
      'string.min': 'Client slug трябва да бъде поне 2 символа',
      'string.max': 'Client slug не може да бъде повече от 50 символа',
      'string.pattern.base': 'Client slug може да съдържа само малки букви, цифри и тирета'
    }),
  categoryId: Joi.string().optional()
});

export const queryPaginationSchema = paginationSchema;