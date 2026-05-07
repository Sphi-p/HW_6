# Event Loop

1: sync start
12: sync end
6: nextTick
4: promise.then 1
5: promise.then 2
2: setTimeout 0
3: setImmediate
7: readFile callback
11: inner nextTick
10: inner promise
9: inner setImmediate
8: inner setTimeout 0

## Порядок выполнения

1. console.log('1: sync start') -> **macrotask**, просто выполняется
2. setTimeout(() => console.log('2: setTimeout 0'), 0) - Колбэк попадает в очередь **timers**.
3. setImmediate(() => console.log('3: setImmediate')) - Колбэк попадает в очередь **check**.
4. .then(...) попадают в очередь **microtasks**.
5. nextTick попадает в **microtasks** Node.js, но process.nextTick выполняется РАНЬШЕ всех microtasks.
6. fs.readFile('./file.json', ...) -> libuv, когда файл прочитан, колбэк попадет в очередь **i/o**.
7. console.log('12: sync end') -> просто выполняется
8. **nextTick очередь** -> console.log('6: nextTick')
9. **microtask очередь** -> console.log('4: promise.then 1')
10. **microtask очередь** -> console.log('5: promise.then 2')
11. **timers очередь** -> console.log('2: setTimeout 0')
12. **check очередь** -> console.log('3: setImmediate')
13. **poll очередь** -> когда файл прочитан, console.log('7: readFile callback')
14. setImmediate(...) -> **check очередь**
15. Promise.resolve().then(...) -> **microtasks**
16. process.nextTick(...) -> **microtasks**, process.nextTick выполняется РАНЬШЕ всех microtasks.
17. **microtask очередь** -> console.log('11: inner nextTick') -> console.log('10: inner promise')
18. После poll в Event Loop идет check, поэтому console.log('9: inner setImmediate')
19. Затем Event Loop заново, поэтому идем в очередь **timers** -> console.log('8: inner setTimeout 0')

❗**macrotasks** — это задачи, которые выполняются в фазах Event Loop, а не сразу после текущего стека.
В данном примере это setTimeout, setImmediate, fs.readFile()
