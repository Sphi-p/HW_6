const fs = require('fs');

/**
 * Event Loop не перейдет к очереди timers пока не выполнится CPU-задача,
 * т.к. это синхронный цикл, который занимает поток полностью,
 * поэтому setTimeout не будет выполнен вовремя
 */
setTimeout(() => console.log('I should fire in 100ms'), 100);
console.time('CPU-bound');
let sum = 0;
for (let i = 1; i <= 1_000_000_000; i++) {
  sum += i;
}
console.timeEnd('CPU-bound');
console.log(`CPU-bound результат: сумма = ${sum}\n`);

/**
 * fs.readFile не блокирует Event Loop, 
 * т.к. чтение файлов через libuv делигируется ОС и главный поток остается свободным
 */
async function IOBound() {
  console.time('I/O-bound (10 файлов параллельно)');

  const reads = [];
  for (let i = 1; i <= 10; i++) {
    reads.push(fs.promises.readFile(`./test-files/file${i}.json`, 'utf-8'));
  }

  const results = await Promise.all(reads);

  console.timeEnd('I/O-bound (10 файлов параллельно)');
  console.log(`I/O-bound: прочитано ${results.length} файлов`);
  console.log(`Размер первого файла: ${results[0].length} символов`);
}

IOBound();
