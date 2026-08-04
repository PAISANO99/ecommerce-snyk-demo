import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError, type ZodType } from "zod";
import { createError } from "./errorHandler";

type RequestSchema = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

const ORDER_STATUS = {
  PENDIENTE: "pendiente",
  PAGADO: "pagado",
  ENVIADO: "enviado",
  ENTREGADO: "entregado",
  CANCELADO: "cancelado",
} as const;

const PAYMENT_METHOD = {
  TARJETA: "tarjeta",
  PAYPAL: "paypal",
} as const;

const orderStatusValues = [
  ORDER_STATUS.PENDIENTE,
  ORDER_STATUS.PAGADO,
  ORDER_STATUS.ENVIADO,
  ORDER_STATUS.ENTREGADO,
  ORDER_STATUS.CANCELADO,
] as const;

const paymentMethodValues = [PAYMENT_METHOD.TARJETA, PAYMENT_METHOD.PAYPAL] as const;

const integerIdSchema = z.coerce.number().int().positive();
const trimmedStringSchema = z.string().trim();
const optionalTrimmedStringSchema = z.string().trim().min(1).optional();
const nullableTrimmedStringSchema = z.string().trim().min(1).nullable().optional();

const normalizedEmailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8).max(200);
const normalizedOrderStatusSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(orderStatusValues)
);
const normalizedPaymentMethodSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(paymentMethodValues)
);

const loginSchema = z
  .object({
    email: normalizedEmailSchema,
    password: passwordSchema,
  })
  .strict();

const registerSchema = z
  .object({
    name: trimmedStringSchema.min(2).max(100),
    email: normalizedEmailSchema,
    password: passwordSchema,
  })
  .strict();

const cartItemBodySchema = z
  .object({
    productId: integerIdSchema,
    quantity: z.coerce.number().int().positive().max(100),
    variantId: integerIdSchema.nullable().optional(),
    color: nullableTrimmedStringSchema,
    size: nullableTrimmedStringSchema,
  })
  .strict();

const cartItemQuantityBodySchema = z
  .object({
    quantity: z.coerce.number().int().positive().max(100),
  })
  .strict();

const orderItemSchema = z
  .object({
    productId: integerIdSchema,
    variantId: integerIdSchema.nullable().optional(),
    quantity: z.coerce.number().int().positive().max(100),
    price: z.coerce.number().nonnegative().optional(),
  })
  .strict();

const orderBodySchema = z
  .object({
    userId: integerIdSchema.optional(),
    name: trimmedStringSchema.min(2).max(100),
    email: normalizedEmailSchema,
    address: trimmedStringSchema.min(5).max(200),
    city: trimmedStringSchema.min(2).max(100),
    country: trimmedStringSchema.min(2).max(100),
    postalCode: trimmedStringSchema.min(3).max(20),
    phone: trimmedStringSchema.min(7).max(25),
    paymentMethod: normalizedPaymentMethodSchema,
    items: z.array(orderItemSchema).min(1).max(100),
  })
  .strict();

const productIdParamsSchema = z
  .object({
    id: integerIdSchema,
  })
  .strict();

const categorySlugParamsSchema = z
  .object({
    slug: trimmedStringSchema.min(1).max(100),
  })
  .strict();

const productQuerySchema = z
  .object({
    categoryId: integerIdSchema.optional(),
    search: optionalTrimmedStringSchema,
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    page: z.coerce.number().int().positive().max(1000).default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
  })
  .strict()
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    {
      message: "minPrice no puede ser mayor que maxPrice",
      path: ["minPrice"],
    }
  );

const productCreateBodySchema = z
  .object({
    name: trimmedStringSchema.min(2).max(120),
    description: nullableTrimmedStringSchema,
    price: z.coerce.number().nonnegative(),
    comparePrice: z.coerce.number().nonnegative().nullable().optional(),
    imageUrl: trimmedStringSchema.url().max(500),
    stock: z.coerce.number().int().nonnegative().default(0),
    featured: z.coerce.boolean().default(false),
    badge: nullableTrimmedStringSchema,
    categoryId: integerIdSchema,
  })
  .strict()
  .refine(
    (value) => value.comparePrice === undefined || value.comparePrice === null || value.comparePrice >= value.price,
    {
      message: "comparePrice debe ser mayor o igual a price",
      path: ["comparePrice"],
    }
  );

const productUpdateBodySchema = z
  .object({
    name: trimmedStringSchema.min(2).max(120).optional(),
    description: z.string().trim().optional(),
    price: z.coerce.number().nonnegative().optional(),
    comparePrice: z.coerce.number().nonnegative().nullable().optional(),
    imageUrl: trimmedStringSchema.url().max(500).optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    featured: z.coerce.boolean().optional(),
    badge: z.string().trim().nullable().optional(),
    categoryId: integerIdSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  })
  .refine(
    (value) =>
      value.comparePrice === undefined ||
      value.comparePrice === null ||
      value.price === undefined ||
      value.comparePrice >= value.price,
    {
      message: "comparePrice debe ser mayor o igual a price",
      path: ["comparePrice"],
    }
  );

const categoryCreateBodySchema = z
  .object({
    name: trimmedStringSchema.min(2).max(100),
    slug: trimmedStringSchema
      .min(2)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .transform((slug) => slug.toLowerCase()),
    imageUrl: z.string().trim().url().nullable().optional(),
    description: nullableTrimmedStringSchema,
  })
  .strict();

const categoryUpdateBodySchema = z
  .object({
    name: trimmedStringSchema.min(2).max(100).optional(),
    slug: trimmedStringSchema
      .min(2)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .transform((slug) => slug.toLowerCase())
      .optional(),
    imageUrl: z.string().trim().url().optional(),
    description: z.string().trim().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

const adminPaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().max(1000).default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();

const adminOrdersQuerySchema = adminPaginationQuerySchema.extend({
  status: normalizedOrderStatusSchema.optional(),
});

const adminOrderStatusBodySchema = z
  .object({
    status: normalizedOrderStatusSchema,
  })
  .strict();

function flattenZodIssues(error: ZodError) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const path = issue.path.join(".") || "root";
    if (!acc[path]) {
      acc[path] = issue.message;
    }
    return acc;
  }, {});
}

export const validateRequest = (schema: RequestSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params) as Request["params"];
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query) as Request["query"];
      }

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        next(
          createError("Datos inválidos", 400, {
            code: "VALIDATION_ERROR",
            errors: flattenZodIssues(error),
            issues: error.issues,
          })
        );
        return;
      }

      next(error);
    }
  };
};

export const validateRequired = (fields: string[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const errors = fields.reduce<Record<string, string>>((acc, field) => {
        if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
          acc[field] = `${field} es requerido`;
        }

        return acc;
      }, {});

      if (Object.keys(errors).length > 0) {
        next(
          createError("Campos requeridos faltantes", 400, {
            code: "MISSING_REQUIRED_FIELDS",
            errors,
          })
        );
        return;
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};

export const validationSchemas = {
  login: { body: loginSchema },
  register: { body: registerSchema },
  cart: {
    addItem: { body: cartItemBodySchema },
    updateItem: { params: productIdParamsSchema, body: cartItemQuantityBodySchema },
    deleteItem: { params: productIdParamsSchema },
  },
  orders: {
    create: { body: orderBodySchema },
  },
  products: {
    list: { query: productQuerySchema },
    byId: { params: productIdParamsSchema },
    create: { body: productCreateBodySchema },
    update: { params: productIdParamsSchema, body: productUpdateBodySchema },
    remove: { params: productIdParamsSchema },
  },
  categories: {
    bySlug: { params: categorySlugParamsSchema },
    create: { body: categoryCreateBodySchema },
    update: { params: productIdParamsSchema, body: categoryUpdateBodySchema },
    remove: { params: productIdParamsSchema },
  },
  admin: {
    listUsers: { query: adminPaginationQuerySchema },
    listOrders: { query: adminOrdersQuerySchema },
    updateOrderStatus: { params: productIdParamsSchema, body: adminOrderStatusBodySchema },
  },
};

export type ValidationSchemas = typeof validationSchemas;
