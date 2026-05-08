/**
 * 1. Можно ли в .cjs файле использовать import?
 *  Нельзя, .cjs - всегда CommonJS, а import — синтаксис ESM,
 *  будет ошибка "SyntaxError: Cannot use import statement outside a module".
 *  
 * 2. Можно ли в .mjs файле использовать require()?
 *  Нельзя, т.к. require() не опредлен в ESM-контексте.
 * 
 * 3. "type": "module" в package.json?
 *  Определяет систему модулей для .js файлов по умолчанию:
 *  - "type": "module" -> .js интерпретируется как ESM
 *  - "type": "commonjs" / отсутствует -> .js интерпретируется как CommonJS
 *  .cjs и .mjs жёстко задают систему модулей вне зависимости от "type".
 */
const { add } = require("./math.cjs");

console.log(add(2, 3));