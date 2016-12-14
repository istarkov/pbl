#!/usr/bin/env node
/*
  Examples:
  node ./ --base64 -- {any command}
  node utils/run.js --base64 -- {any command}
*/

const chalk = require('chalk');
const pty = require('pty.js');
const { Base64 } = require('js-base64');

const cmdIdx = process.argv.indexOf('--') + 1;
const useBase64 = process.argv.indexOf('--base64') > -1;

if (process.argv.indexOf('--') === -1 || cmdIdx >= process.argv.length) {
  console.error(chalk.red('Error, no command after --')); // eslint-disable-line
  process.exit(1);
}

const term = pty.spawn(process.argv[cmdIdx], process.argv.slice(cmdIdx + 1), {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: `${__dirname}/..`,
  env: process.env,
});

term.on('data', (data) => {
  if (useBase64) {
    process.stdout.write(`${Base64.encode(data)}\n`); // add space to chunk so we can split it
  } else {
    process.stdout.write(data);
  }
});

term.on('exit', (code) => {
  process.exit(code);
});
