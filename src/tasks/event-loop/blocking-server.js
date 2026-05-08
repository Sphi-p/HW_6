const fastify = require("fastify")({ logger: true });

fastify.get("/fast", async () => {
    return { message: "I am fast" };
});

/**
 * Вместо одного гигантского цикла работа делится на части:
 * это всё ещё синхронный CPU-bound код, но уже Event Loop заблокирован
 * на более короткий промежуток времени. 
 * setImmediate делает так, что processChunk будет выполнен на следующем цикле Event Loop,
 * таким образо поток JS временно освобождается,
 * так что до следующего processChunk Event Loop может обработать новый HTTP запрос
 */
fastify.get('/slow', async (request, reply) => {
    const limit = 5_000_000_000
    const chunkSize = 100_000_000
    let sum = 0
    let i = 1

    return new Promise((resolve) => {
        function processChunk() {
            const end = Math.min(i + chunkSize, limit)
            for (; i <= end; i++) {
                sum += i
            }

            if (i < limit) {
                setImmediate(processChunk)
            } else {
                resolve({ result: sum })
            }
        }
        processChunk()
    })
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('[SERVER RUNNING] http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await fastify.close();
  console.log('Server closed');
  process.exit(0);
})

start();