// ═══════════════════════════════════════════════════════════════════
//  СХЕМЫ ВАЛИДАЦИИ
// ═══════════════════════════════════════════════════════════════════

const idParamSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } }
    }
}

// ─── Категории ───────────────────────────────────────────────────

const categoryBodySchema = {
    type: 'object',
    required: ['name'],
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 },
        description: { type: 'string', maxLength: 300 }
    }
}

const categoryQuerySchema = {
    querystring: {
        type: 'object',
        properties: {}
    }
}

// ─── Товары ──────────────────────────────────────────────────────

const productBodySchema = {
    type: 'object',
    required: ['name', 'price', 'categoryId'],
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 200 },
        price: { type: 'number', minimum: 0.01 },
        categoryId: { type: 'integer', minimum: 1 },
        inStock: { type: 'boolean' }
    }
}

const productQuerySchema = {
    querystring: {
        type: 'object',
        properties: {
            categoryId: { type: 'integer' },
            inStock: { type: 'string', enum: ['true', 'false'] }
        }
    }
}

// ─── Пользователи ────────────────────────────────────────────────

const userBodySchema = {
    type: 'object',
    required: ['name', 'email'],
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', minLength: 1, maxLength: 200 },
        role: { type: 'string', enum: ['customer', 'admin'] }
    }
}

const userQuerySchema = {
    querystring: {
        type: 'object',
        properties: {
            role: { type: 'string', enum: ['customer', 'admin'] }
        }
    }
}

module.exports = {
    idParamSchema,
    categoryBodySchema,
    categoryQuerySchema,
    productBodySchema,
    productQuerySchema,
    userBodySchema,
    userQuerySchema
};