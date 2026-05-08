const {
    idParamSchema,
    categoryBodySchema,
    categoryQuerySchema,
    productBodySchema,
    productQuerySchema,
    userBodySchema,
    userQuerySchema
} = require("./schema.js");
const fastify = require("fastify")({ logger: true });

const db = {
    categories: [],
    products: [],
    users: []
};
let nextIds = { category: 1, product: 1, user: 1 };

// ________________________CATEGORIES________________________
// categories - все
fastify.get("/api/categories", { schema: categoryQuerySchema }, async () => {
    return db.categories;
});

// categories - получить по id
fastify.get("/api/categories/:id", { schema: idParamSchema }, async (request, reply) => {
    const item = db.categories.find(i => i.id === request.params.id);
    if (!item) {
        reply.code(404);
        return { error: "Category not found" };
    }
    return item;
});

// categories - создать категорию
fastify.post("/api/categories", { schema: categoryBodySchema }, async (request, reply) => {
    const { name, description } = request.body;
    const category = {
        id: nextIds.category++,
        name,
        description: description ?? ""
    };

    db.categories.push(category);
    reply.code(201);
    return category;
});

// categories - обновить категорию
fastify.put("/api/categories/:id", { schema: { ...idParamSchema, body: categoryBodySchema } }, async (request, reply) => {
    const { id } = request.params;
    const index = db.categories.findIndex(i => i.id === id);
    if (index === -1) {
        reply.code(401);
        return { error: "Category not found" };
    }

    const { name, description } = request.body;
    db.categories[index] = {
        id: db.categories[index].id,
        name,
        description: description ?? db.categories[index].description
    };

    return db.categories[index];
});

// categories - удалить категорию
fastify.delete("/api/categories/:id", { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params;
    const index = db.categories.findIndex(i => i.id === id);
    if (index === -1) {
        reply.code(401);
        return { error: "Category not found" };
    }

    const hasProducts = db.products.some(item => item.categoryId === id);
    if (hasProducts) {
        reply.code(400)
        return { error: "Category has items" };
    }

    const [deleted] = db.categories.splice(index, 1);
    return deleted;
});

// ________________________PRODUCTS________________________

// products - все товары с фильтром
fastify.get("/api/products", { schema: productQuerySchema }, async (request) => {
    let res = db.products;

    let { categoryId, inStock } = request.query;

    if (categoryId !== undefined) {
        res = res.filter(item => item.categoryId === categoryId);
    }
    if (inStock !== undefined) {
        inStock = inStock === "true";
        res = res.filter(item => item.inStock === inStock);
    }

    return res;
});

// products - получить по id
fastify.get("/api/products/:id", { schema: idParamSchema }, async (request, reply) => {
    const item = db.products.find(i => i.id === request.params.id);
    if (!item) {
        reply.code(404);
        return { error: "Product not found" };
    }
    return item;
});

// products - создать товар
fastify.post("/api/products", { schema: productBodySchema }, async (request, reply) => {
    const { name, price, categoryId, inStock } = request.body;
    const index = db.categories.findIndex(i => i.id === categoryId);
    if (index === -1) {
        reply.code(400);
        return { error: "Category not found" };
    }

    const product = {
        id: nextIds.product++,
        name,
        price,
        categoryId,
        inStock: inStock ?? true,
        createdAt: new Date().toISOString()
    };

    db.products.push(product);
    reply.code(201);
    return product;
});

// products - ообновить товар
fastify.put("/api/products/:id", { schema: { ...idParamSchema, body: productBodySchema } }, async (request, reply) => {
    const { id } = request.params;
    const index = db.products.findIndex(i => i.id === id);
    if (index === -1) {
        reply.code(401);
        return { error: "Product not found" };
    }

    const { name, price, categoryId, inStock } = request.body;
    db.products[index] = {
        ...db.products[index],
        name,
        price,
        categoryId,
        inStock: inStock ?? db.products[index].inStock
    };

    return db.products[index];
});

// products - удалить товар
fastify.delete("/api/products/:id", { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params;
    const index = db.products.findIndex(i => i.id === id);
    if (index === -1) {
        reply.code(401);
        return { error: "Product not found" };
    }

    const [deleted] = db.products.splice(index, 1);
    return deleted;
});

// ________________________USERS________________________

// users - получить список с фильтом по ролям
fastify.get("/api/users", { schema: userQuerySchema }, async (request) => {
    const role = request.query.role;
    let res = db.users;

    if (role) {
        res = res.filter(item => item.role === role);
    }

    return res;
});

// users - получить пользователя по id
fastify.get("/api/users/:id", { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params;
    const item = db.users.find(item => item.id === id);

    if (!item) {
        reply.code(404);
        return { error: "User not found" };
    }

    return item;
});

// users - создать пльзователя
fastify.post("/api/users", { schema: userBodySchema }, async (request, reply) => {
    const { name, email, role } = request.body;

    const emailExist = db.users.some(item => item.email === email);
    if (emailExist) {
        reply.code(409);
        return { error: "Email already exists" };
    }

    const user = {
        id: nextIds.user++,
        name,
        email,
        role: role ?? "customer",
        createdAt: new Date().toISOString()
    };

    db.users.push(user);
    reply.code(201);
    return user;
});

// users - обновить пользователя
fastify.put("/api/users/:id", { schema: { ...idParamSchema, body: userBodySchema } }, async (request, reply) => {
    const { id } = request.params;
    const index = db.users.findIndex(u => u.id === id);

    if (index === -1) {
        reply.code(404);
        return { error: 'User not found' };
    }

    const { name, email, role } = request.body;

    const emailExist = db.users.some(item => item.email === email);
    if (emailExist) {
        reply.code(409);
        return { error: "Email already exists" };
    }

    db.users[index] = {
        ...db.users[index],
        name,
        email,
        role: role ?? db.users[index].role
    };

    return db.users[index];
});

// users - удалить пользователя
fastify.delete("/api/users/:id", { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params;
    const index = db.users.findIndex(u => u.id === id);

    if (index === -1) {
        reply.code(404);
        return { error: 'User not found' };
    }

    const [deleted] = db.users.splice(index, 1);
    return deleted;
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
        console.log('Store API running on http://localhost:3000')
        console.log('')
        console.log('Categories:  GET/POST /api/categories,  GET/PUT/DELETE /api/categories/:id')
        console.log('Products:    GET/POST /api/products,    GET/PUT/DELETE /api/products/:id')
        console.log('Users:       GET/POST /api/users,       GET/PUT/DELETE /api/users/:id')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
};

process.on('SIGINT', async () => {
    await fastify.close()
    process.exit(0)
});

start();