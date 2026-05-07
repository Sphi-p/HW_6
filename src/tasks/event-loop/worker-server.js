const fastify = require("fastify")({ logger: true });
const { Worker } = require('worker_threads');

fastify.get("/fast", async () => {
    return { message: "I am fast" };
});

/**
 * worker_threads создаёт настоящий отдельный поток,
 * setImmediate просто разбивает исполнение на куски.
 * 
 * Чанкирование (blocking-server.js):
 *   ✅ Не требует дополнительных потоков
 *   ✅ Проще для небольших задач
 *   ❌ разбивать на чанки надо вручную
 *   ❌ задержки между чанками на выполнение колбэков Event Loop
 *   ❌ в зависимости от размера чанков, всё ещё частично блокирует Event Loop
 *   ❌ не подходит для действительно тяжёлых вычислений
 * 
 * worker_threads (этот файл):
 *   ✅ полностью освобождает Event Loop — настоящий параллелизм потоков.
 *   ✅ можно использовать все ядра CPU через пул воркеров.
 *   ❌ создание Worker'а — дорогостоящая операция (~30-50ms).
 *   ❌ нужно настраивать коммуникацию (parentPort / workerData).
 *   ❌ для коротких задач overhead создания воркера перевешивает пользу.
 */

fastify.get('/slow', async (request, reply) => {

    const result = await new Promise((resolve, reject) => {
        const worker = new Worker('./src/tasks/event-loop/slow-worker.js', {
            workerData: { limit: 5_000_000_000 }
        })

        worker.on('message', (result) => resolve({ result }));
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
        });
    });

    return result;
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('✅[WORKER SERVER] http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
  await fastify.close()
  process.exit(0)
});

start();