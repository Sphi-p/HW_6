const fastify = require("fastify")({ logger: true });

fastify.get("/", async () => {
    return {
        message: "Server is running"
    }
});

fastify.get("/health", async () => {
    return {
        status: "ok",
        uptime: process.uptime()
    }
});

fastify.get("/time", async () => {
    const now = new Date();
    return {
        iso: now.toISOString(),
        unix: now.getTime()
    }
});

const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}, shutting down...`);
  await fastify.close();
  console.log('Server closed');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('[SERVER RUNNING] http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();